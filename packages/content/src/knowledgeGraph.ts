/**
 * The local knowledge graph is a labelled editorial preview, not a published
 * religious corpus. External source links are reading pointers; they do not
 * grant redistribution or AI-use rights. No model receives these records.
 */
import { listDemoCorpus } from "./index.ts";
import { arjunaBowStory } from "./story.ts";

export type GraphLanguage = "en" | "hi";
export type Localized = Readonly<Record<GraphLanguage, string>>;
export type GraphNodeKind = "entity" | "story" | "passage" | "theme";
export type EditorialState = "unreviewed_demo" | "source_pointer" | "reviewed";
export type EntityKind = "divine_form" | "scriptural_character";

export interface GraphSource {
  id: string;
  work: string;
  reference: string;
  url: string;
  edition: string | null;
  translator: string | null;
  license: string | null;
  rights: "unknown" | "verified";
  review: "unreviewed" | "reviewed";
  /** A pointer is not permission to copy the site's text. */
  use: "external_pointer" | "locally_displayed_demo";
}

export interface GraphEntity {
  id: string;
  slug: string;
  kind: EntityKind;
  name: Localized;
  iast: string;
  aliases: readonly string[];
  invitation: Localized;
  editorialNote: Localized;
  sourceIds: readonly string[];
  storyIds: readonly string[];
  passageIds: readonly string[];
  themeIds: readonly string[];
  visual: "chariot" | "mountain" | "ocean";
  state: EditorialState;
}

export interface GraphScene {
  id: string;
  sourceIds: readonly string[];
  title: Localized;
  narrative: Localized;
  reflection: Localized;
}

export interface GraphStory {
  id: string;
  slug: string;
  title: Localized;
  subtitle: Localized;
  kind: "story_retelling";
  state: EditorialState;
  sourceIds: readonly string[];
  entityIds: readonly string[];
  themeIds: readonly string[];
  scenes: readonly GraphScene[];
  href: string;
}

export interface GraphTheme { id: string; name: Localized; aliases: readonly string[] }
export interface GraphEdge {
  from: string;
  to: string;
  kind: "appears_in" | "related_theme" | "teaches" | "editorial_companion" | "source_pointer";
  context: string;
  sourceId: string | null;
  state: EditorialState;
}

const sourceList: readonly GraphSource[] = [
  ...listDemoCorpus().map(passage => ({
    id: passage.id,
    work: passage.source.workTitle,
    reference: passage.source.canonicalReference,
    url: passage.source.sourceUrl,
    edition: passage.source.edition,
    translator: passage.source.translator,
    license: passage.source.licenseName,
    rights: "unknown" as const,
    review: "unreviewed" as const,
    use: "locally_displayed_demo" as const,
  })),
  {
    id: "bg.1.24-1.47", work: "Bhagavad Gita", reference: "1.24–1.47",
    url: "https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=1&field_nsutra_value=24",
    edition: null, translator: null, license: null, rights: "unknown", review: "unreviewed", use: "external_pointer",
  },
  {
    id: "vr.5.1", work: "Vālmīki Rāmāyaṇa", reference: "Sundara Kāṇḍa, Sarga 1",
    url: "https://sanskritdocuments.org/sites/valmikiramayan/sundara/sarga1/sundararoman1.htm",
    edition: null, translator: null, license: null, rights: "unknown", review: "unreviewed", use: "external_pointer",
  },
  {
    id: "su.3.2", work: "Śvetāśvatara Upaniṣad", reference: "3.2 (Rudra)",
    url: "https://sanskritdocuments.org/doc_upanishhat/shveta.html",
    edition: null, translator: null, license: null, rights: "unknown", review: "unreviewed", use: "external_pointer",
  },
];

export const graphSources: ReadonlyMap<string, GraphSource> = new Map(sourceList.map(source => [source.id, source]));

export const graphThemes: readonly GraphTheme[] = [
  { id: "action", name: { en: "Action & uncertainty", hi: "कर्म और अनिश्चितता" }, aliases: ["work", "outcome", "कर्म", "फल"] },
  { id: "courage", name: { en: "Courage to begin", hi: "शुरू करने का साहस" }, aliases: ["fear", "failure", "हिम्मत", "डर"] },
  { id: "attention", name: { en: "Returning attention", hi: "ध्यान लौटाना" }, aliases: ["focus", "mind", "ध्यान", "मन"] },
  { id: "context", name: { en: "Reading with context", hi: "संदर्भ के साथ पढ़ना" }, aliases: ["source", "tradition", "मूल", "परंपरा"] },
];

export const graphStories: readonly GraphStory[] = [
  {
    id: "story:arjuna-bow", slug: "arjuna-bow", title: arjunaBowStory.title,
    subtitle: arjunaBowStory.subtitle, kind: "story_retelling", state: "unreviewed_demo",
    sourceIds: ["bg.1.24-1.47"], entityIds: ["entity:krishna"], themeIds: ["action", "context"],
    scenes: arjunaBowStory.scenes.map(scene => ({ id: scene.id, sourceIds: ["bg.1.24-1.47"], title: scene.title, narrative: scene.narrative, reflection: scene.reflection })),
    href: "/alpha/stories/arjuna-bow",
  },
  {
    id: "story:hanuman-crossing", slug: "hanuman-crossing", kind: "story_retelling", state: "unreviewed_demo",
    title: { en: "Across the water", hi: "समुद्र के उस पार" },
    subtitle: { en: "An original, brief retelling of Hanuman's crossing", hi: "हनुमान के समुद्र-पार जाने का संक्षिप्त मौलिक पुनर्कथन" },
    sourceIds: ["vr.5.1"], entityIds: ["entity:hanuman"], themeIds: ["courage"],
    scenes: [
      { id: "the-task", sourceIds: ["vr.5.1"], title: { en: "A task larger than the shore", hi: "किनारे से बड़ा काम" }, narrative: { en: "Hanuman prepares to cross the sea toward Lanka in search of Sita. The narrative begins with an enormous task, and with his attention turned toward carrying it out.", hi: "हनुमान सीता की खोज में लंका की ओर समुद्र पार करने की तैयारी करते हैं। कथा एक बहुत बड़े काम से शुरू होती है, और उसे पूरा करने की ओर उनके ध्यान से।" }, reflection: { en: "What task matters enough for you to begin, even without a guarantee?", hi: "कौन-सा काम इतना महत्त्वपूर्ण है कि बिना पक्के परिणाम के भी आप उसे शुरू करें?" } },
      { id: "the-crossing", sourceIds: ["vr.5.1"], title: { en: "The crossing", hi: "समुद्र पार" }, narrative: { en: "He leaps from Mahendra. The account places obstacles in his way, yet its movement stays directed toward the search rather than toward a display of power for its own sake.", hi: "वे महेंद्र पर्वत से छलांग लगाते हैं। मार्ग में बाधाएँ आती हैं, फिर भी कथा का केंद्र सीता की खोज है, केवल शक्ति का प्रदर्शन नहीं।" }, reflection: { en: "What helps you remember the purpose behind a difficult effort?", hi: "कठिन प्रयास के पीछे का उद्देश्य आपको कैसे याद रहता है?" } },
      { id: "the-far-shore", sourceIds: ["vr.5.1"], title: { en: "The far shore", hi: "दूसरा किनारा" }, narrative: { en: "The sea crossing leads Hanuman toward Lanka. It is a beginning, not the completion of the search. The story can be read as a pause to notice purpose alongside courage.", hi: "समुद्र पार कर हनुमान लंका की ओर बढ़ते हैं। यह खोज का अंत नहीं, उसकी शुरुआत है। इस प्रसंग में साहस के साथ उद्देश्य पर भी ठहरा जा सकता है।" }, reflection: { en: "After your first step, what remains to be done?", hi: "पहला कदम उठाने के बाद क्या करना बाकी रहेगा?" } },
    ],
    href: "/alpha/stories/hanuman-crossing",
  },
];

export const graphEntities: readonly GraphEntity[] = [
  { id: "entity:krishna", slug: "krishna", kind: "divine_form", name: { en: "Krishna", hi: "कृष्ण" }, iast: "Kṛṣṇa", aliases: ["Krsna", "कृष्ण", "श्रीकृष्ण"], invitation: { en: "Begin where a difficult choice meets a teaching.", hi: "जहाँ कठिन चुनाव और सीख मिलते हैं, वहीं से शुरू करें।" }, editorialNote: { en: "In this small preview, meet Krishna through Arjuna's question and three Gita passages. These explanations await human review.", hi: "इस छोटे पूर्वावलोकन में अर्जुन के प्रश्न और गीता के तीन श्लोकों के साथ कृष्ण को पढ़ें। इन व्याख्याओं की मानवीय समीक्षा बाकी है।" }, sourceIds: ["bg.1.24-1.47", "bg.2.47"], storyIds: ["story:arjuna-bow"], passageIds: ["bg.2.47", "bg.2.48", "bg.6.26"], themeIds: ["action", "attention"], visual: "chariot", state: "unreviewed_demo" },
  { id: "entity:hanuman", slug: "hanuman", kind: "scriptural_character", name: { en: "Hanuman", hi: "हनुमान" }, iast: "Hanumān", aliases: ["Hanumaan", "हनुमान", "हनुमान्"], invitation: { en: "A story of purpose, distance and the first leap.", hi: "उद्देश्य, दूरी और पहली छलांग की कथा।" }, editorialNote: { en: "Begin with an original retelling linked to Vālmīki Rāmāyaṇa, Sundara Kāṇḍa 1. The retelling has not received tradition or rights review.", hi: "वाल्मीकि रामायण, सुंदरकाण्ड १ से जुड़े मौलिक पुनर्कथन से शुरू करें। इसकी परंपरा और अधिकार समीक्षा अभी बाकी है।" }, sourceIds: ["vr.5.1"], storyIds: ["story:hanuman-crossing"], passageIds: [], themeIds: ["courage"], visual: "ocean", state: "unreviewed_demo" },
  { id: "entity:shiva", slug: "shiva", kind: "divine_form", name: { en: "Shiva", hi: "शिव" }, iast: "Śiva", aliases: ["Siva", "शिव", "महादेव"], invitation: { en: "Begin with a source, not a single fixed portrait.", hi: "एक तय चित्र नहीं, पहले एक स्रोत से शुरू करें।" }, editorialNote: { en: "The linked Upaniṣad passage speaks of Rudra. How Rudra is understood in relation to Shiva varies by tradition; this preview offers a reading pointer, not a settled interpretation.", hi: "जुड़ा हुआ उपनिषद् अंश रुद्र का उल्लेख करता है। रुद्र और शिव के संबंध की समझ परंपरा के अनुसार बदलती है; यहाँ केवल पढ़ने का स्रोत है, अंतिम व्याख्या नहीं।" }, sourceIds: ["su.3.2"], storyIds: [], passageIds: [], themeIds: ["context"], visual: "mountain", state: "source_pointer" },
];

export const graphEdges: readonly GraphEdge[] = [
  { from: "entity:krishna", to: "story:arjuna-bow", kind: "appears_in", context: "Bhagavad Gita 1.24–1.47", sourceId: "bg.1.24-1.47", state: "unreviewed_demo" },
  { from: "entity:hanuman", to: "story:hanuman-crossing", kind: "appears_in", context: "Vālmīki Rāmāyaṇa, Sundara Kāṇḍa 1", sourceId: "vr.5.1", state: "unreviewed_demo" },
  { from: "entity:krishna", to: "bg.2.47", kind: "teaches", context: "Bhagavad Gita 2.47", sourceId: "bg.2.47", state: "unreviewed_demo" },
  { from: "entity:shiva", to: "su.3.2", kind: "source_pointer", context: "Rudra/Shiva mapping requires tradition-specific review", sourceId: "su.3.2", state: "source_pointer" },
  { from: "story:hanuman-crossing", to: "bg.2.47", kind: "editorial_companion", context: "Editorial comparison of purposeful action, not a scriptural equivalence", sourceId: null, state: "unreviewed_demo" },
];

export type GraphSearchResult = { id: string; kind: GraphNodeKind; title: Localized; subtitle: Localized; href: string; state: EditorialState; score: number };
const digitMap = "०१२३४५६७८९";
export function normalizeGraphQuery(value: string): string {
  return value.toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[०-९]/g, digit => String(digitMap.indexOf(digit))).replace(/[।॥:]/g, ".").replace(/[^\p{L}\p{N}.]+/gu, " ").replace(/\s+/g, " ").trim();
}

function matches(query: string, values: readonly string[]): number {
  const q = normalizeGraphQuery(query);
  if (!q) return 0;
  const terms = q.split(" ");
  let best = 0;
  for (const value of values) {
    const candidate = normalizeGraphQuery(value);
    if (candidate === q) best = Math.max(best, 100);
    else if (candidate.includes(q)) best = Math.max(best, 70);
    else if (terms.every(term => candidate.includes(term))) best = Math.max(best, 45);
  }
  return best;
}

export function searchKnowledgeGraph(query: string, language: GraphLanguage): GraphSearchResult[] {
  const q = normalizeGraphQuery(query);
  if (!q) return [];
  const results: GraphSearchResult[] = [];
  for (const entity of graphEntities) {
    const score = matches(q, [entity.name.en, entity.name.hi, entity.iast, ...entity.aliases, ...entity.themeIds, `${entity.name.en} ${entity.themeIds.join(" ")} stories`]);
    if (score) results.push({ id: entity.id, kind: "entity", title: entity.name, subtitle: entity.invitation, href: `/alpha/divine/${entity.slug}`, state: entity.state, score });
  }
  for (const story of graphStories) {
    const names = story.entityIds.map(id => graphEntities.find(entity => entity.id === id)?.name[language] ?? "");
    const score = matches(q, [story.title.en, story.title.hi, story.subtitle.en, story.subtitle.hi, ...names, ...story.themeIds, `${names.join(" ")} ${story.themeIds.join(" ")} ${story.title.en}`]);
    if (score) results.push({ id: story.id, kind: "story", title: story.title, subtitle: story.subtitle, href: story.href, state: story.state, score });
  }
  for (const passage of listDemoCorpus()) {
    const title = { en: `Bhagavad Gita ${passage.source.canonicalReference}`, hi: `भगवद्गीता ${passage.source.canonicalReference}` };
    const score = matches(q, [title.en, title.hi, passage.id, passage.source.canonicalReference, ...passage.themeKeys, ...passage.searchAliases]);
    if (score) results.push({ id: passage.id, kind: "passage", title, subtitle: { en: "Original verse and unreviewed explanation", hi: "मूल श्लोक और समीक्षा-रहित व्याख्या" }, href: `/alpha/episode/${passage.lessonId}`, state: "unreviewed_demo", score });
  }
  for (const theme of graphThemes) {
    const score = matches(q, [theme.name.en, theme.name.hi, ...theme.aliases]);
    if (score) results.push({ id: `theme:${theme.id}`, kind: "theme", title: theme.name, subtitle: { en: "Explore related material", hi: "संबंधित सामग्री देखें" }, href: `/alpha/search?topic=${encodeURIComponent(theme.id)}`, state: "unreviewed_demo", score: score - 10 });
  }
  return results.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export function graphStoryForQuestion(question: string): GraphStory | undefined {
  const q = normalizeGraphQuery(question);
  return /\b(courage|fear|afraid|fail|failing|begin|start|impossible)\b|डर|साहस|हिम्मत|असफल|शुरू/.test(q)
    ? graphStories.find(story => story.id === "story:hanuman-crossing") : undefined;
}

export function validateKnowledgeGraph(): string[] {
  const problems: string[] = [];
  const allIds = [...graphEntities.map(node => node.id), ...graphStories.map(node => node.id), ...listDemoCorpus().map(node => node.id), ...graphThemes.map(node => `theme:${node.id}`)];
  const nodeIds = new Set([...allIds, ...graphSources.keys()]);
  const unique = new Set<string>();
  for (const id of allIds) { if (unique.has(id)) problems.push(`Duplicate node ${id}`); unique.add(id); }
  for (const source of graphSources.values()) {
    try { if (new URL(source.url).protocol !== "https:") problems.push(`Non-HTTPS source ${source.id}`); }
    catch { problems.push(`Invalid source URL ${source.id}`); }
    if (source.rights === "verified" && (!source.edition || !source.license)) problems.push(`Unsupported source rights claim ${source.id}`);
  }
  for (const entity of graphEntities) {
    if (!entity.name.en?.trim() || !entity.name.hi?.trim() || !entity.iast?.trim() || !entity.invitation.en?.trim() || !entity.invitation.hi?.trim()) problems.push(`Incomplete entity ${entity.id}`);
    for (const id of entity.sourceIds) if (!graphSources.has(id)) problems.push(`Broken entity source ${entity.id} -> ${id}`);
    for (const id of [...entity.storyIds, ...entity.passageIds, ...entity.themeIds.map(theme => `theme:${theme}`)]) if (!nodeIds.has(id)) problems.push(`Broken entity reference ${entity.id} -> ${id}`);
    if (entity.state === "reviewed" && entity.sourceIds.some(id => graphSources.get(id)?.rights !== "verified" || graphSources.get(id)?.review !== "reviewed")) problems.push(`Uncleared reviewed entity ${entity.id}`);
  }
  for (const story of graphStories) {
    if (!story.scenes.length || !story.entityIds.length || !story.sourceIds.length) problems.push(`Incomplete story ${story.id}`);
    if (!story.title.en?.trim() || !story.title.hi?.trim() || !story.subtitle.en?.trim() || !story.subtitle.hi?.trim()) problems.push(`Incomplete story copy ${story.id}`);
    for (const id of [...story.sourceIds, ...story.scenes.flatMap(scene => scene.sourceIds)]) if (!graphSources.has(id)) problems.push(`Broken story source ${story.id} -> ${id}`);
    for (const scene of story.scenes) {
      for (const language of ["en", "hi"] as const) if (!scene.title[language]?.trim() || !scene.narrative[language]?.trim() || !scene.reflection[language]?.trim()) problems.push(`Incomplete ${language} scene ${story.id}/${scene.id}`);
    }
    for (const id of story.entityIds) if (!nodeIds.has(id)) problems.push(`Broken story entity ${story.id} -> ${id}`);
    for (const id of story.themeIds) if (!nodeIds.has(`theme:${id}`)) problems.push(`Broken story theme ${story.id} -> ${id}`);
    if (story.state === "reviewed" && story.sourceIds.some(id => graphSources.get(id)?.rights !== "verified" || graphSources.get(id)?.review !== "reviewed")) problems.push(`Uncleared reviewed story ${story.id}`);
  }
  for (const edge of graphEdges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) problems.push(`Broken graph edge ${edge.from} -> ${edge.to}`);
    if (edge.sourceId && !graphSources.has(edge.sourceId)) problems.push(`Broken edge source ${edge.sourceId}`);
    if (edge.kind === "source_pointer" && edge.state !== "source_pointer") problems.push(`Unlabelled source pointer ${edge.from}`);
  }
  return problems;
}
