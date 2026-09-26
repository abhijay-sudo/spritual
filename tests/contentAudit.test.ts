import assert from "node:assert/strict";
import test from "node:test";

import { auditBundledContent } from "../scripts/audit-bundled-content.mjs";
import { listDemoCorpus } from "../packages/content/src/index.ts";
import { arjunaBowStory } from "../packages/content/src/story.ts";
import { lessons } from "../web/src/data/lessons.ts";

function fixtures() {
  return structuredClone({
    passages: listDemoCorpus(),
    stories: [arjunaBowStory],
    readerLessons: lessons,
  });
}

test("bundled content passes the local demo audit but fails public release preflight", () => {
  const records = fixtures();
  const local = auditBundledContent(records);
  assert.deepEqual(local.errors, []);
  assert.equal(local.releaseBlockers.length, 4);
  assert.match(local.releaseBlockers[0], /rights evidence.*named editorial approval/);

  const release = auditBundledContent({ ...records, mode: "release" });
  assert.deepEqual(release.errors, []);
  assert.equal(release.releaseBlockers.length, 4);
});

test("local audit rejects rights, approval, publication and AI-use claims in a demo bundle", () => {
  const records = fixtures();
  const passage = records.passages[0] as Record<string, unknown>;
  passage.publicationState = "published";
  passage.aiUseAllowed = true;
  passage.source = { ...(passage.source as object), rightsState: "permission_recorded", licenseName: "unverified" };
  passage.renderings = (passage.renderings as Array<Record<string, unknown>>).map((item, index) =>
    index === 0 ? { ...item, reviewState: "approved" } : item);
  const story = records.stories[0] as Record<string, unknown>;
  story.publicationState = "published";
  story.aiUseAllowed = true;

  const audit = auditBundledContent(records);
  assert.ok(audit.errors.some((error: string) => error.includes("must stay demo_only")));
  assert.ok(audit.errors.some((error: string) => error.includes("must not be sent to an AI provider")));
  assert.ok(audit.errors.some((error: string) => error.includes("unverified rights or license claim")));
  assert.ok(audit.errors.some((error: string) => error.includes("approved review")));
  assert.ok(audit.errors.some((error: string) => error.includes("story must remain")));
  assert.ok(audit.releaseBlockers.some((error: string) => error.includes("AI use requires independent")));
});

test("audit catches source-reference drift and disconnected reader copy", () => {
  const records = fixtures();
  records.passages[0].source.sourceUrl = records.passages[1].source.sourceUrl;
  records.readerLessons[0].steps.find((step) => step.kind === "understand")!.body.hi = "Changed without provenance alignment";
  records.stories[0].scenes[0].sourceVerses[0].url = "https://example.com/?field_chapter_value=1&field_nsutra_value=99";

  const audit = auditBundledContent(records);
  assert.ok(audit.errors.some((error: string) => error.includes("canonical chapter and verse")));
  assert.ok(audit.errors.some((error: string) => error.includes("reader reference or source URL")));
  assert.ok(audit.errors.some((error: string) => error.includes("EDITORIAL_EXPLANATION/hi")));
  assert.ok(audit.errors.some((error: string) => error.includes("stated Gita 1 verse disagree")));
});

test("same-number lookalike links cannot replace the current recorded demo source", () => {
  const records = fixtures();
  const lookalike = "https://example.com/srimad?field_chapter_value=2&field_nsutra_value=47";
  records.passages[0].source.sourceUrl = lookalike;
  records.readerLessons[0].sourceUrl = lookalike;
  records.stories[0].scenes[0].sourceVerses[0].url =
    "https://example.com/srimad?field_chapter_value=1&field_nsutra_value=24";

  const audit = auditBundledContent(records);
  assert.ok(audit.errors.some((error: string) => error.includes("recorded IIT Kanpur site")));
  assert.ok(audit.errors.some((error: string) => error.includes("current story source")));
});
