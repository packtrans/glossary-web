import type {
  GlossaryIndexEntry,
  GlossaryLanguage,
  GlossaryMetadata,
} from "@/types/glossary";
import { METADATA_URL } from "@/types/glossary";

export function resolveLatestIndexes(metadata: GlossaryMetadata): GlossaryIndexEntry {
  const entry = metadata.indexes.find(
    (candidate) => candidate.version === metadata.latestIndexesVersion,
  );
  if (!entry) {
    throw new Error(
      `Metadata does not contain index version ${metadata.latestIndexesVersion}`,
    );
  }
  return entry;
}

export function getAvailableLanguages(metadata: GlossaryMetadata): GlossaryLanguage[] {
  const entry = resolveLatestIndexes(metadata);
  return entry.indexesLanguages;
}

export function getIndexUrl(metadata: GlossaryMetadata, lang: GlossaryLanguage): string {
  const entry = resolveLatestIndexes(metadata);
  const url = entry.indexesFiles[lang];
  if (!url) {
    throw new Error(`No index URL for language ${lang} in metadata`);
  }
  return url;
}

export function targetDictName(lang: string): string | null {
  if (lang === "lzh" || lang.startsWith("zh")) {
    return "lindera-jieba";
  }
  if (lang.startsWith("ja")) {
    return "lindera-ipadic";
  }
  if (lang.startsWith("ko")) {
    return "lindera-ko-dic";
  }
  return null;
}

export function dictCdnUrl(dictName: string, version: string): string {
  return `https://cdn.packtrans.download/glossary/dicts/${version}/${dictName}-${version}.zip`;
}

export async function fetchGlossaryMetadata(): Promise<GlossaryMetadata> {
  const response = await fetch(METADATA_URL);
  if (!response.ok) {
    throw new Error(`Failed to load glossary metadata (${response.status})`);
  }
  return (await response.json()) as GlossaryMetadata;
}
