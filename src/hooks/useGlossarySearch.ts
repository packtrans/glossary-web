import { useCallback, useEffect, useRef, useState } from "react";

import type { GlossaryIndex } from "@packtrans/glossary";
import {
  DEMO_LANG,
  INDEX_URL,
  JIEBA_DICTIONARY_URL,
  type GlossaryStatus,
  type QueryHit,
} from "@/types/glossary";

type WasmModule = typeof import("@packtrans/glossary");

export function useGlossarySearch() {
  const indexBytesRef = useRef<Uint8Array | null>(null);
  const forwardIndexRef = useRef<GlossaryIndex | null>(null);
  const inverseIndexRef = useRef<GlossaryIndex | null>(null);
  const inverseLoadingRef = useRef<Promise<void> | null>(null);
  const wasmRef = useRef<WasmModule | null>(null);
  const [status, setStatus] = useState<GlossaryStatus>("loading-index");
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<QueryHit[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [lastInverse, setLastInverse] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadIndex() {
      try {
        const wasm = await import("@packtrans/glossary");
        if (cancelled) {
          return;
        }

        wasmRef.current = wasm;
        const response = await fetch(INDEX_URL);
        if (!response.ok) {
          throw new Error(`Failed to load index (${response.status})`);
        }

        const bytes = new Uint8Array(await response.arrayBuffer());
        const index = new wasm.GlossaryIndex(bytes, DEMO_LANG);
        if (cancelled) {
          index.free();
          return;
        }

        indexBytesRef.current = bytes;
        forwardIndexRef.current = index;
        setStatus("ready");
        setError(null);
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void loadIndex();

    return () => {
      cancelled = true;
      forwardIndexRef.current?.free();
      forwardIndexRef.current = null;
      inverseIndexRef.current?.free();
      inverseIndexRef.current = null;
      inverseLoadingRef.current = null;
      indexBytesRef.current = null;
      wasmRef.current = null;
    };
  }, []);

  const ensureInverseIndex = useCallback(async () => {
    if (inverseIndexRef.current) {
      return;
    }

    if (inverseLoadingRef.current) {
      await inverseLoadingRef.current;
      return;
    }

    const wasm = wasmRef.current;
    const indexBytes = indexBytesRef.current;
    if (!wasm || !indexBytes) {
      throw new Error("Glossary index is not ready yet.");
    }

    const loadPromise = (async () => {
      setStatus("loading-dictionary");
      setError(null);

      const response = await fetch(JIEBA_DICTIONARY_URL);
      if (!response.ok) {
        throw new Error(`Failed to load dictionary (${response.status})`);
      }

      const dictBytes = new Uint8Array(await response.arrayBuffer());
      inverseIndexRef.current = new wasm.GlossaryIndex(indexBytes, DEMO_LANG, dictBytes);
      setStatus("ready");
    })();

    inverseLoadingRef.current = loadPromise;

    try {
      await loadPromise;
    } finally {
      inverseLoadingRef.current = null;
    }
  }, []);

  const prefetchInverse = useCallback(() => {
    if (inverseIndexRef.current || inverseLoadingRef.current) {
      return;
    }

    void ensureInverseIndex().catch((loadError) => {
      setStatus("ready");
      setError(loadError instanceof Error ? loadError.message : String(loadError));
    });
  }, [ensureInverseIndex]);

  const search = useCallback(
    async (query: string, limit: number, inverse: boolean) => {
      const trimmed = query.trim();
      if (!trimmed) {
        setError("Enter a search term.");
        setHits([]);
        setLastQuery("");
        setLastInverse(false);
        return;
      }

      if (!forwardIndexRef.current) {
        setError("Glossary index is not ready yet.");
        return;
      }

      setStatus("searching");
      setError(null);
      setLastQuery(trimmed);
      setLastInverse(inverse);

      try {
        const index = inverse ? await (async () => {
          await ensureInverseIndex();
          return inverseIndexRef.current;
        })() : forwardIndexRef.current;

        if (!index) {
          throw new Error("Glossary index is not ready yet.");
        }

        const result = index.query(trimmed, limit, inverse) as QueryHit[];
        setHits(result);
        setStatus("ready");
      } catch (searchError) {
        setHits([]);
        setStatus("ready");
        setError(searchError instanceof Error ? searchError.message : String(searchError));
      }
    },
    [ensureInverseIndex],
  );

  return {
    status,
    error,
    hits,
    lastQuery,
    lastInverse,
    search,
    prefetchInverse,
  };
}
