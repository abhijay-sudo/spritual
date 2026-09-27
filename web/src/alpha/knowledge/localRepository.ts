import { getDemoCorpusPassage, listDemoCorpus } from "../../../../packages/content/src/index";
import { graphEntities, graphSources, graphStories, graphWorks, searchKnowledgeGraph } from "../../../../packages/content/src/knowledgeGraph";
import { graphSaveKey, parseGraphSaves, toggleGraphSave } from "../graphSaveStore";
import type { KnowledgeEntity, KnowledgeLanguage, KnowledgePassage, KnowledgeRepository,
  KnowledgeSavedItem, KnowledgeSaveKind, KnowledgeSearchResult, KnowledgeSource, KnowledgeStory } from "./types";

const fallbackSource: KnowledgeSource = { title: "Local editorial preview", url: null,
  edition: "Not established", reference: "Preview pointer", reviewer: "Human review pending" };
function source(id: string | undefined): KnowledgeSource {
  const item = id ? graphSources.get(id) : undefined;
  return item ? { title: item.work, url: item.url, edition: item.edition ?? "Not established",
    reference: item.reference, reviewer: item.review === "reviewed" ? "Reviewed preview" : "Human review pending" } : fallbackSource;
}
function entity(item: typeof graphEntities[number], language: KnowledgeLanguage): KnowledgeEntity {
  return { id: item.id, slug: item.slug, kind: item.kind, title: item.name[language],
    description: item.editorialNote[language], tradition: "Editorial navigation · unreviewed",
    source: source(item.sourceIds[0]), mediaPath: null, mediaAlt: null };
}
function story(item: typeof graphStories[number], language: KnowledgeLanguage): KnowledgeStory {
  return { id: item.id, slug: item.slug, title: item.title[language], kind: "original_retelling",
    source: source(item.sourceIds[0]), scenes: item.scenes.map((scene,index)=>({ sequence:index+1,
      reference: source(scene.sourceIds[0]).reference, body:scene.narrative[language], reflection:scene.reflection[language] })) };
}
/** Explicit offline/demo adapter. It is never imported by the connected adapter. */
export class LocalPreviewKnowledgeRepository implements KnowledgeRepository {
  readonly mode = "demo" as const;
  constructor(private readonly actorId = "preview") {}
  async listEntities(language: KnowledgeLanguage) { return graphEntities.map(item=>entity(item,language)); }
  async getEntity(slug: string, language: KnowledgeLanguage) { const item=graphEntities.find(x=>x.slug===slug); return item ? entity(item,language) : null; }
  async listStories(language: KnowledgeLanguage) { return graphStories.map(item=>story(item,language)); }
  async getStory(slug: string, language: KnowledgeLanguage) { const item=graphStories.find(x=>x.slug===slug); return item ? story(item,language) : null; }
  async listWorks(language: KnowledgeLanguage) { return graphWorks.map(item=>({ slug:item.slug,title:item.title[language],kind:"preview",
    passageCount:item.sourceIds.filter(id=>!!getDemoCorpusPassage(id)).length,firstCanonicalId:item.sourceIds.find(id=>!!getDemoCorpusPassage(id)) ?? "" })); }
  async listWorkPassages(slug: string) { const item=graphWorks.find(x=>x.slug===slug); return item ? item.sourceIds.flatMap((id,index)=>{
    const p=getDemoCorpusPassage(id); return p ? [{canonicalId:p.id,reference:p.source.canonicalReference,kind:"verse",sequence:index+1}] : [];
  }) : []; }
  async getPassage(canonicalId: string, language: KnowledgeLanguage): Promise<KnowledgePassage | null> {
    const item=getDemoCorpusPassage(canonicalId);
    if (!item) return null;
    return { id:item.id,canonicalId:item.id,reference:item.source.canonicalReference,workSlug:item.source.workSlug,
      workTitle:item.source.workTitle,kind:"verse",renderings:item.renderings.filter(r=>r.language===language||r.language==='sa').map((r,index)=>({
        id:`${item.id}:${index}`,kind:r.kind.toLowerCase(),language:r.language,body:r.text,source:source(item.id) })) };
  }
  async search(query: string, language: KnowledgeLanguage): Promise<KnowledgeSearchResult[]> {
    return searchKnowledgeGraph(query,language).filter(x=>x.kind!=="theme").map(x=>({ kind:x.kind as KnowledgeSearchResult["kind"],
      id:x.id,slug:x.kind==="passage"?x.id:x.href.split("/").at(-1) ?? x.id,title:x.title[language],
      reference:x.kind==="passage"?getDemoCorpusPassage(x.id)?.source.canonicalReference??null:null,rank:x.score }));
  }
  async retrieveForLifeQuestion(question: string, language: KnowledgeLanguage) {
    return (await this.search(question,language))[0] ?? null;
  }
  async listSaves(language: KnowledgeLanguage): Promise<KnowledgeSavedItem[]> {
    const ids=parseGraphSaves(localStorage.getItem(graphSaveKey(this.actorId)));
    return ids.map(id=>{
      const entity=graphEntities.find(x=>x.id===id);
      const story=graphStories.find(x=>x.id===id);
      const passage=getDemoCorpusPassage(id);
      return {kind:entity?"entity":story?"story":"passage",id,
        slug:entity?.slug??story?.slug??passage?.id??null,
        title:entity?.name[language]??story?.title[language]??(passage?`${passage.source.workTitle} ${passage.source.canonicalReference}`:null),
        available:!!(entity||story||passage),savedAt:""} satisfies KnowledgeSavedItem;
    });
  }
  async setSave(_kind: KnowledgeSaveKind,id: string,enabled: boolean) {
    const current=parseGraphSaves(localStorage.getItem(graphSaveKey(this.actorId))).includes(id);
    if(current!==enabled)toggleGraphSave(localStorage,this.actorId,id);
    return enabled;
  }
}
