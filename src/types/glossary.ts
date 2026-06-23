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
  | "loading-index"
  | "loading-dictionary"
  | "ready"
  | "searching"
  | "error";

export const DEMO_LANG = "zh_cn" as const;

export const INDEX_CDN_URL =
  "https://cdn.packtrans.download/glossary/packtrans-glossary-index-zh_cn-20260601.zip";

export const INDEX_URL = INDEX_CDN_URL;

export const LINDERA_VERSION = "2.3.4";

export const JIEBA_DICTIONARY_URL =
  `https://github.com/lindera/lindera/releases/download/v${LINDERA_VERSION}/lindera-jieba-${LINDERA_VERSION}.zip`;
