import { useCallback, useEffect, useRef, useState } from "react";

import type { GlossaryIndex } from "@packtrans/glossary";
import {
  dictCdnUrl,
  fetchGlossaryMetadata,
  getAvailableLanguages,
  getIndexUrl,
  targetDictName,
} from "@/lib/glossaryMetadata";
import {
  DEFAULT_LANG,
  type GlossaryLanguage,
  type GlossaryMetadata,
  type GlossaryStatus,
  type QueryHit,
} from "@/types/glossary";

type WasmModule = typeof import("@packtrans/glossary");

export function useGlossarySearch() {
  const metadataRef = useRef<GlossaryMetadata | null>(null);
  const indexBytesRef = useRef<Uint8Array | null>(null);
  const forwardIndexRef = useRef<GlossaryIndex | null>(null);
  const inverseIndexRef = useRef<GlossaryIndex | null>(null);
  const inverseLoadingRef = useRef<Promise<void> | null>(null);
  const wasmRef = useRef<WasmModule | null>(null);
  const langRef = useRef<GlossaryLanguage>(DEFAULT_LANG);

  const [status, setStatus] = useState<GlossaryStatus>("loading-metadata");
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<QueryHit[]>([]);
  const [lastQuery, setLastQuery] = useState("");
  const [lastInverse, setLastInverse] = useState(false);
  const [lang, setLangState] = useState<GlossaryLanguage>(DEFAULT_LANG);
  const [availableLanguages, setAvailableLanguages] = useState<GlossaryLanguage[]>([]);

  const resetIndexes = useCallback(() => {
    forwardIndexRef.current?.free();
    forwardIndexRef.current = null;
    inverseIndexRef.current?.free();
    inverseIndexRef.current = null;
    inverseLoadingRef.current = null;
    indexBytesRef.current = null;
  }, []);

  const loadIndexForLang = useCallback(
    async (targetLang: GlossaryLanguage, metadata: GlossaryMetadata) => {
      const wasm = wasmRef.current;
      if (!wasm) {
        throw new Error("WASM module is not ready yet.");
      }

      setStatus("loading-index");
      setError(null);
      resetIndexes();

      const indexUrl = getIndexUrl(metadata, targetLang);
      const response = await fetch(indexUrl);
      if (!response.ok) {
        throw new Error(`Failed to load index (${response.status})`);
      }

      const bytes = new Uint8Array(await response.arrayBuffer());
      const index = new wasm.GlossaryIndex(bytes, targetLang);

      indexBytesRef.current = bytes;
      forwardIndexRef.current = index;
      langRef.current = targetLang;
      setLangState(targetLang);
      setStatus("ready");
    },
    [resetIndexes],
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [wasm, metadata] = await Promise.all([
          import("@packtrans/glossary"),
          fetchGlossaryMetadata(),
        ]);
        if (cancelled) {
          return;
        }

        wasmRef.current = wasm;
        metadataRef.current = metadata;
        setAvailableLanguages(getAvailableLanguages(metadata));

        const initialLang = getAvailableLanguages(metadata).includes(DEFAULT_LANG)
          ? DEFAULT_LANG
          : getAvailableLanguages(metadata)[0];
        if (!initialLang) {
          throw new Error("Metadata does not list any glossary languages.");
        }

        await loadIndexForLang(initialLang, metadata);
      } catch (loadError) {
        if (!cancelled) {
          setStatus("error");
          setError(loadError instanceof Error ? loadError.message : String(loadError));
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      resetIndexes();
      wasmRef.current = null;
      metadataRef.current = null;
    };
  }, [loadIndexForLang, resetIndexes]);

  const setLang = useCallback(
    (nextLang: GlossaryLanguage) => {
      const metadata = metadataRef.current;
      if (!metadata || nextLang === langRef.current) {
        return;
      }

      void loadIndexForLang(nextLang, metadata).catch((loadError) => {
        setStatus("error");
        setError(loadError instanceof Error ? loadError.message : String(loadError));
      });
    },
    [loadIndexForLang],
  );

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
    const currentLang = langRef.current;
    if (!wasm || !indexBytes) {
      throw new Error("Glossary index is not ready yet.");
    }

    const dictName = targetDictName(currentLang);
    if (!dictName) {
      throw new Error(`Inverse query is not supported for language ${currentLang}.`);
    }

    const loadPromise = (async () => {
      setStatus("loading-dictionary");
      setError(null);

      const version = wasm.lindera_version();
      const response = await fetch(dictCdnUrl(dictName, version));
      if (!response.ok) {
        throw new Error(`Failed to load dictionary (${response.status})`);
      }

      const dictBytes = new Uint8Array(await response.arrayBuffer());
      inverseIndexRef.current = new wasm.GlossaryIndex(indexBytes, currentLang, dictBytes);
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

    if (!targetDictName(langRef.current)) {
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

      if (inverse && !targetDictName(langRef.current)) {
        setError(`Inverse query is not supported for language ${langRef.current}.`);
        return;
      }

      setStatus("searching");
      setError(null);
      setLastQuery(trimmed);
      setLastInverse(inverse);

      try {
        const index = inverse
          ? await (async () => {
              await ensureInverseIndex();
              return inverseIndexRef.current;
            })()
          : forwardIndexRef.current;

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
    lang,
    availableLanguages,
    setLang,
    search,
    prefetchInverse,
  };
}
