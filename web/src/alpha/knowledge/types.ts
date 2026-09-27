export type KnowledgeLanguage = "en" | "hi";
export type KnowledgeKind = "entity" | "story" | "passage" | "work";

export type KnowledgeSource = {
  title: string;
  url: string | null;
  edition: string;
  reference: string;
  reviewer: string;
};

export type KnowledgeEntity = {
  id: string;
  slug: string;
  kind: string;
  title: string;
  description: string | null;
  tradition: string;
  source: KnowledgeSource;
  mediaPath: string | null;
  mediaAlt: string | null;
};

export type KnowledgeScene = { sequence: number; reference: string; body: string; reflection: string | null };
export type KnowledgeStory = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  source: KnowledgeSource;
  scenes: KnowledgeScene[];
};
export type KnowledgeWork = { slug: string; title: string; kind: string; passageCount: number; firstCanonicalId: string };
export type KnowledgePassageRef = { canonicalId: string; reference: string; kind: string; sequence: number };
export type KnowledgeRendering = { id: string; kind: string; language: string; body: string; source: KnowledgeSource };
export type KnowledgePassage = {
  id: string;
  canonicalId: string;
  reference: string;
  workSlug: string;
  workTitle: string;
  kind: string;
  renderings: KnowledgeRendering[];
};
export type KnowledgeSearchResult = {
  kind: KnowledgeKind;
  id: string;
  slug: string;
  title: string;
  reference: string | null;
  rank: number;
};
export type KnowledgeSaveKind = "entity" | "story" | "passage";
export type KnowledgeSavedItem = { kind: KnowledgeSaveKind; id: string; slug: string | null;
  title: string | null; available: boolean; savedAt: string };

export class KnowledgeServiceError extends Error {
  constructor(public readonly code: "SERVICE_UNAVAILABLE" | "INVALID_DATA" | "SEARCH_INVALID" | "AUTH_REQUIRED", public readonly source?: string) {
    super(code);
    this.name = "KnowledgeServiceError";
  }
}

export interface KnowledgeRepository {
  readonly mode: "demo" | "real";
  listEntities(language: KnowledgeLanguage): Promise<KnowledgeEntity[]>;
  getEntity(slug: string, language: KnowledgeLanguage): Promise<KnowledgeEntity | null>;
  listStories(language: KnowledgeLanguage): Promise<KnowledgeStory[]>;
  getStory(slug: string, language: KnowledgeLanguage): Promise<KnowledgeStory | null>;
  listWorks(language: KnowledgeLanguage): Promise<KnowledgeWork[]>;
  listWorkPassages(slug: string, language: KnowledgeLanguage): Promise<KnowledgePassageRef[]>;
  getPassage(canonicalId: string, language: KnowledgeLanguage): Promise<KnowledgePassage | null>;
  search(query: string, language: KnowledgeLanguage): Promise<KnowledgeSearchResult[]>;
  retrieveForLifeQuestion(question: string, language: KnowledgeLanguage): Promise<KnowledgeSearchResult | null>;
  listSaves(language: KnowledgeLanguage): Promise<KnowledgeSavedItem[]>;
  setSave(kind: KnowledgeSaveKind, id: string, enabled: boolean): Promise<boolean>;
}
