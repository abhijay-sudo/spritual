import test from "node:test";
import assert from "node:assert/strict";
import { graphConnectionsForSource, graphEntities, graphSourcePointerForQuestion, graphSources, graphStories, graphStoryForQuestion, graphWorks, searchKnowledgeGraph, validateKnowledgeGraph } from "../packages/content/src/knowledgeGraph.ts";

test("editorial graph has resolvable edges and keeps every source unapproved", () => {
  assert.deepEqual(validateKnowledgeGraph(), []);
  assert.deepEqual(graphEntities.map(entity => entity.slug), ["krishna", "hanuman", "shiva"]);
  assert.ok([...graphSources.values()].every(source => source.rights === "unknown" && source.review === "unreviewed"));
  assert.ok(graphStories.every(story => story.state === "unreviewed_demo"));
  assert.equal(graphEntities.find(entity => entity.slug === "shiva")?.state, "source_pointer");
});

test("search resolves distinct Hindi, romanized and numbered entries without inventing a result", () => {
  for (const query of ["Hanuman", "Hanumān", "हनुमान"]) {
    assert.equal(searchKnowledgeGraph(query, "en")[0]?.id, "entity:hanuman");
  }
  for (const query of ["Kṛṣṇa", "कृष्ण"]) {
    assert.equal(searchKnowledgeGraph(query, "hi")[0]?.id, "entity:krishna");
  }
  assert.equal(searchKnowledgeGraph("भगवद्गीता २.४७", "hi")[0]?.id, "bg.2.47");
  assert.equal(searchKnowledgeGraph("रामायण", "hi")[0]?.id, "work:ramayana");
  assert.equal(searchKnowledgeGraph("unavailable verse 99.99", "en").length, 0);
  const theme = searchKnowledgeGraph("courage", "en").find(result => result.kind === "theme");
  assert.equal(theme?.href, "/alpha/search?topic=courage");
});

test("Life story companion is narrowly triggered and explicitly editorial", () => {
  assert.equal(graphStoryForQuestion("I am afraid of failing")?.id, "story:hanuman-crossing");
  assert.equal(graphStoryForQuestion("मुझे साहस चाहिए")?.id, "story:hanuman-crossing");
  assert.equal(graphStoryForQuestion("Where is Gita 2.47?"), undefined);
  assert.ok(graphStories.find(story => story.slug === "hanuman-crossing")?.scenes.every(scene => scene.sourceIds.includes("vr.5.1")));
});

test("source context derives backlinks and never invents cross-source answers", () => {
  assert.deepEqual(graphConnectionsForSource("vr.5.1").stories.map(story => story.slug), ["hanuman-crossing"]);
  assert.deepEqual(graphConnectionsForSource("vr.5.1").works.map(work => work.slug), ["ramayana"]);
  assert.deepEqual(graphConnectionsForSource("vr.5.1").entities.map(entity => entity.slug), ["hanuman"]);
  assert.deepEqual(graphConnectionsForSource("bg.2.47").passages.map(passage => passage.id), ["bg.2.47"]);
  assert.deepEqual(graphConnectionsForSource("missing"), { works: [], entities: [], stories: [], passages: [] });
  assert.deepEqual(graphWorks.map(work => work.availability), ["local_selection", "external_pointer", "external_pointer"]);
  assert.equal(graphSourcePointerForQuestion("What does Shiva teach?")?.id, "su.3.2");
  assert.equal(graphSourcePointerForQuestion("रामायण कहाँ पढ़ें?")?.id, "vr.5.1");
  assert.equal(graphSourcePointerForQuestion("I am worried about my work"), undefined);
});
