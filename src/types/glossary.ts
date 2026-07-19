export interface QueryHit {
  confidence: number;
  mod_id: string;
  key: string;
  source: string;
  source_lang: string;
  target_lang: string;
  target: string;
}

export type GlossaryStatus =
  | "loading-metadata"
  | "loading-index"
  | "loading-dictionary"
  | "ready"
  | "searching"
  | "error";

export type GlossaryLanguage = "ja_jp" | "zh_cn" | "zh_hk" | "zh_tw";

export interface GlossaryIndexEntry {
  version: string;
  indexesLanguages: GlossaryLanguage[];
  indexesFiles: Partial<Record<GlossaryLanguage, string>>;
}

export interface GlossaryMetadata {
  lastUpdatedAt: string;
  latestIndexesVersion: string;
  indexes: GlossaryIndexEntry[];
}

export const DEFAULT_LANG: GlossaryLanguage = "zh_cn";

export const GLOSSARY_CDN_BASE = "https://cdn.packtrans.download/glossary";

export const METADATA_URL = `${GLOSSARY_CDN_BASE}/metadata.json`;

export const LANGUAGE_LABELS: Record<GlossaryLanguage, string> = {
  ja_jp: "Japanese",
  zh_cn: "Simplified Chinese",
  zh_hk: "Traditional Chinese (Hong Kong)",
  zh_tw: "Traditional Chinese (Taiwan)",
};
