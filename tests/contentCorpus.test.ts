import assert from "node:assert/strict";
import test from "node:test";

import { lessons } from "../web/src/data/lessons.ts";
import {
  canPublishContent,
  getDemoCorpusPassage,
  listDemoCorpus,
  listDemoPassages,
} from "../packages/content/src/index.ts";

test("demo corpus stays aligned with the actual three reader lessons", () => {
  const english = listDemoPassages("en");
  const hindi = listDemoPassages("hi");
  assert.equal(english.length, 3);
  assert.deepEqual(english.map((item) => item.id), ["bg.2.47", "bg.2.48", "bg.6.26"]);

  for (const [index, passage] of english.entries()) {
    const lesson = lessons[index];
    const verse = lesson.steps.find((step) => step.kind === "verse");
    const meaning = lesson.steps.find((step) => step.kind === "understand");
    assert.equal(passage.original, verse?.script);
    assert.equal(passage.transliteration, verse?.transliteration);
    assert.equal(passage.interpretation, meaning?.body.en);
    assert.equal(hindi[index].interpretation, meaning?.body.hi);
    assert.equal(passage.reference, lesson.reference);
    assert.equal(passage.localPath, `/alpha/episode/${lesson.id}?scene=1`);
    assert.equal(passage.sourceUrl, lesson.sourceUrl);
    assert.equal(passage.language, "en");
    assert.equal(hindi[index].language, "hi");
  }
});

test("unreviewed demo source is never exposed as a licensed translation or AI input", () => {
  for (const passage of listDemoCorpus()) {
    assert.equal(passage.publicationState, "demo_only");
    assert.equal(passage.aiUseAllowed, false);
    assert.equal(passage.source.rightsState, "unknown");
    assert.equal(passage.source.licenseName, null);
    assert.equal(passage.source.copyrightStatus, "unknown");
    assert.equal(passage.renderings.some((item) => item.kind === "TRANSLATION"), false);
    assert.equal(passage.renderings.some((item) => item.reviewState === "approved"), false);
    assert.ok(passage.renderings.some((item) => item.kind === "CANONICAL_TEXT"));
    assert.ok(passage.renderings.some((item) => item.kind === "EDITORIAL_EXPLANATION"));
  }
  assert.equal(getDemoCorpusPassage("gita-2-47")?.id, "bg.2.47");
  assert.equal(getDemoCorpusPassage("bogus"), undefined);
});

test("consumers cannot mutate bundled source, review, AI-use, or citation records", () => {
  const corpus = listDemoCorpus();
  const passage = corpus[0];
  const adapter = listDemoPassages("en");

  assert.equal(Object.isFrozen(corpus), true);
  assert.equal(Object.isFrozen(passage.source), true);
  assert.equal(Object.isFrozen(passage.renderings[0]), true);
  assert.equal(Object.isFrozen(adapter[0]), true);
  assert.equal(Object.isFrozen(adapter[0].tags), true);
  assert.throws(() => { (passage.source as { rightsState: string }).rightsState = "permission_recorded"; }, TypeError);
  assert.throws(() => { (passage as { aiUseAllowed: boolean }).aiUseAllowed = true; }, TypeError);
  assert.throws(() => { (adapter[0] as { sourceUrl: string }).sourceUrl = "https://example.com"; }, TypeError);
  assert.equal(getDemoCorpusPassage("bg.2.47")?.source.rightsState, "unknown");
});

test("publication metadata gate fails closed on every missing element", () => {
  const ready = {
    rightsState: "permission_recorded" as const,
    rightsEvidenceRef: "rights-record-123",
    licenseName: "documented-license",
    provenanceVerified: true,
    reviewState: "approved" as const,
    reviewerName: "Recorded reviewer",
  };
  assert.equal(canPublishContent(ready), true);
  assert.equal(canPublishContent({ ...ready, rightsState: "unknown" }), false);
  assert.equal(canPublishContent({ ...ready, rightsEvidenceRef: null }), false);
  assert.equal(canPublishContent({ ...ready, licenseName: " " }), false);
  assert.equal(canPublishContent({ ...ready, provenanceVerified: false }), false);
  assert.equal(canPublishContent({ ...ready, reviewState: "unreviewed" }), false);
  assert.equal(canPublishContent({ ...ready, reviewerName: "" }), false);
});
