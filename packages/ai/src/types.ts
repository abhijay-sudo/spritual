/** Browser-safe contracts. Provider credentials and network adapters live in ../server. */
export type WisdomLanguage = "en" | "hi";

export interface WisdomPassage {
  /** Stable citation key, for example bg.2.47. Never synthesized from a model answer. */
  id: string;
  work: string;
  reference: string;
  original: string;
  transliteration?: string;
  /** Only a rights-cleared translation may occupy this field. */
  translation?: string;
  /** Editorial prose, never represented as canonical text. */
  interpretation?: string;
  sourceUrl: string;
  localPath: string;
  language: WisdomLanguage;
  tags?: readonly string[];
  aliases?: readonly string[];
  status: "demo" | "reviewed";
  /** Must be backed by an explicit current grant, not inferred from public display. */
  aiUseAllowed: boolean;
}

export interface WisdomHit {
  passage: WisdomPassage;
  score: number;
  matchedBy: readonly ("reference" | "theme" | "text")[];
}

export interface WisdomAnswer {
  kind: "matched" | "unverified" | "safety";
  language: WisdomLanguage;
  message: string;
  /** The only source of canonical strings and clickable citation routes. */
  sources: readonly WisdomPassage[];
  interpretation?: string;
  application?: string;
  providerUsed: boolean;
  disclosure: string;
}
