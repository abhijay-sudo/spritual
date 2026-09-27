import type { SupabaseClient } from "@supabase/supabase-js";
import { KnowledgeServiceError, type KnowledgeEntity, type KnowledgeLanguage, type KnowledgePassage,
  type KnowledgePassageRef, type KnowledgeRepository, type KnowledgeSearchResult, type KnowledgeStory,
  type KnowledgeWork, type KnowledgeSource, type KnowledgeSavedItem, type KnowledgeSaveKind } from "./types";

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new KnowledgeServiceError("INVALID_DATA");
  return value as Record<string, unknown>;
}
function str(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new KnowledgeServiceError("INVALID_DATA");
  return value;
}
function optional(value: unknown): string | null {
  return value === null || value === undefined ? null : str(value);
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new KnowledgeServiceError("INVALID_DATA");
  return value;
}
function source(row: Record<string, unknown>): KnowledgeSource {
  const url = optional(row.source_url);
  if (url && !/^https?:\/\/[^\s]+$/.test(url)) throw new KnowledgeServiceError("INVALID_DATA");
  return { title: str(row.source_title), url, edition: str(row.edition_label),
    reference: str(row.source_reference), reviewer: str(row.reviewer_name) };
}
function entity(value: unknown): KnowledgeEntity {
  const row = object(value);
  return { id: str(row.id), slug: str(row.slug), kind: str(row.entity_kind), title: str(row.display_name),
    description: optional(row.description), tradition: str(row.tradition_context), source: source(row),
    mediaPath: optional(row.media_path), mediaAlt: optional(row.media_alt) };
}
function story(value: unknown): KnowledgeStory {
  const row = object(value);
  const scenes = row.scenes === undefined ? [] : list(row.scenes).map(value => {
    const scene = object(value);
    if (!Number.isInteger(scene.sequence_no) || Number(scene.sequence_no) < 1) throw new KnowledgeServiceError("INVALID_DATA");
    return { sequence: Number(scene.sequence_no), reference: str(scene.source_reference),
      body: str(scene.body), reflection: optional(scene.reflection) };
  });
  return { id: str(row.id), slug: str(row.slug), title: str(row.title), kind: str(row.story_kind), source: source(row), scenes };
}
function work(value: unknown): KnowledgeWork {
  const row = object(value);
  const count = Number(row.available_passage_count);
  if (!Number.isSafeInteger(count) || count < 1) throw new KnowledgeServiceError("INVALID_DATA");
  return { slug: str(row.work_slug), title: str(row.work_title), kind: str(row.work_kind), passageCount: count,
    firstCanonicalId: str(row.first_canonical_id) };
}
function passage(value: unknown): KnowledgePassage {
  const row = object(value);
  const renderings = list(row.renderings).map(value => {
    const r = object(value);
    return { id: str(r.rendering_id), kind: str(r.kind), language: str(r.language_code), body: str(r.body),
      source: { title: str(r.source_title), url: optional(r.source_url), edition: str(r.edition),
        reference: str(row.canonical_reference), reviewer: str(r.reviewer_name) } };
  });
  if (!renderings.length) throw new KnowledgeServiceError("INVALID_DATA");
  return { id: str(row.passage_id), canonicalId: str(row.canonical_id), reference: str(row.canonical_reference),
    workSlug: str(row.work_slug), workTitle: str(row.work_title), kind: str(row.unit_kind), renderings };
}

/** Real mode has no import of preview graph records and no API-failure fallback. */
export class SupabaseKnowledgeRepository implements KnowledgeRepository {
  readonly mode = "real" as const;
  constructor(private readonly client: SupabaseClient) {}
  private async rpc(name: string, args: Record<string, unknown>): Promise<unknown> {
    const { data, error } = await this.client.schema("app").rpc(name, args);
    if (error) throw new KnowledgeServiceError(error.code === "42501" ? "AUTH_REQUIRED" : "SERVICE_UNAVAILABLE", name);
    return data;
  }
  async listEntities(language: KnowledgeLanguage) {
    return list(await this.rpc("fn_public_spiritual_entities", { p_language: language, p_limit: 50 })).map(entity);
  }
  async getEntity(slug: string, language: KnowledgeLanguage) {
    const value = await this.rpc("fn_public_spiritual_entity", { p_slug: slug, p_language: language });
    return value === null ? null : entity(value);
  }
  async listStories(language: KnowledgeLanguage) {
    return list(await this.rpc("fn_public_spiritual_stories", { p_language: language, p_limit: 50 })).map(story);
  }
  async getStory(slug: string, language: KnowledgeLanguage) {
    const value = await this.rpc("fn_public_spiritual_story", { p_slug: slug, p_language: language });
    return value === null ? null : story(value);
  }
  async listWorks(language: KnowledgeLanguage) {
    return list(await this.rpc("fn_knowledge_catalogue", { p_language: language })).map(work);
  }
  async listWorkPassages(slug: string, language: KnowledgeLanguage) {
    return list(await this.rpc("fn_knowledge_work_passages", { p_work_slug: slug, p_language: language,
      p_after_sequence_no: 0, p_limit: 50 })).map(value => {
      const row = object(value);
      if (!Number.isInteger(row.sequence_no)) throw new KnowledgeServiceError("INVALID_DATA");
      return { canonicalId: str(row.canonical_id), reference: str(row.canonical_reference),
        kind: str(row.unit_kind), sequence: Number(row.sequence_no) } satisfies KnowledgePassageRef;
    });
  }
  async getPassage(canonicalId: string, language: KnowledgeLanguage) {
    const value = await this.rpc("fn_knowledge_passage", { p_canonical_id: canonicalId, p_language: language });
    return value === null ? null : passage(value);
  }
  async search(query: string, language: KnowledgeLanguage): Promise<KnowledgeSearchResult[]> {
    const q = query.trim();
    if (q.length < 2 || q.length > 120 || /[%_]/.test(q)) throw new KnowledgeServiceError("SEARCH_INVALID");
    const graph = list(await this.rpc("fn_public_spiritual_search", { p_query: q, p_language: language, p_limit: 20 }))
      .map(value => {
        const row = object(value);
        const kind = str(row.kind);
        if (kind !== "entity" && kind !== "story") throw new KnowledgeServiceError("INVALID_DATA");
        return { kind, id: str(row.id), slug: str(row.slug), title: str(row.title),
          reference: optional(row.source_reference), rank: Number(row.rank) } satisfies KnowledgeSearchResult;
      });
    if (q.length < 3) return graph;
    const texts = list(await this.rpc("fn_knowledge_search", { p_query: q, p_language: language, p_limit: 20 }))
      .map(value => { const row = object(value); return { kind: "passage" as const,
        id: str(row.passage_id), slug: str(row.canonical_id), title: `${str(row.work_title)} ${str(row.canonical_reference)}`,
        reference: str(row.canonical_reference), rank: 110 } satisfies KnowledgeSearchResult; });
    return [...texts, ...graph].sort((a,b)=>b.rank-a.rank || a.title.localeCompare(b.title)).slice(0,20);
  }
  async retrieveForLifeQuestion(question: string, language: KnowledgeLanguage) {
    // Deterministic, rights-checked retrieval only. No raw question is logged or stored.
    const q = question.trim();
    if (q.length < 2) return null;
    const results = await this.search(q.slice(0,120), language);
    return results[0] ?? null;
  }
  async listSaves(language: KnowledgeLanguage): Promise<KnowledgeSavedItem[]> {
    return list(await this.rpc("fn_my_spiritual_saves",{p_language:language})).map(value=>{
      const row=object(value);
      const kind=str(row.object_kind);
      if(kind!=="entity"&&kind!=="story"&&kind!=="passage")throw new KnowledgeServiceError("INVALID_DATA");
      if(typeof row.available!=="boolean"||Number.isNaN(Date.parse(str(row.saved_at))))throw new KnowledgeServiceError("INVALID_DATA");
      return {kind,id:str(row.object_id),slug:optional(row.slug),title:optional(row.title),
        available:row.available,savedAt:str(row.saved_at)};
    });
  }
  async setSave(kind: KnowledgeSaveKind,id: string,enabled: boolean) {
    const result=await this.rpc("fn_set_spiritual_save",{p_kind:kind,p_id:id,p_enabled:enabled});
    if(typeof result!=="boolean")throw new KnowledgeServiceError("INVALID_DATA");
    return result;
  }
}
