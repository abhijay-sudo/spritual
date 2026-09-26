import test from "node:test";
import assert from "node:assert/strict";
import { arjunaBowStory } from "../packages/content/src/story.ts";

test("each story moment points to its own Gita source and has complete bilingual copy", () => {
  assert.equal(arjunaBowStory.scenes.length, 3);
  for (const scene of arjunaBowStory.scenes) {
    assert.ok(scene.sourceVerses.length, `missing sources for ${scene.id}`);
    for (const source of scene.sourceVerses) {
      assert.ok(scene.reference.includes(String(source.verse)), `reference does not name source ${source.verse}`);
      assert.equal(new URL(source.url).searchParams.get("field_nsutra_value"), String(source.verse));
    }
    for (const language of ["en", "hi"] as const) {
      assert.ok(scene.title[language].trim());
      assert.ok(scene.narrative[language].trim());
      assert.ok(scene.reflection[language].trim());
    }
  }
  assert.equal(arjunaBowStory.kind, "STORY_RETELLING");
  assert.equal(arjunaBowStory.publicationState, "demo_only");
  assert.equal(arjunaBowStory.reviewState, "unreviewed");
  assert.equal(arjunaBowStory.aiUseAllowed, false);
  assert.equal(Object.isFrozen(arjunaBowStory.scenes[0].sourceVerses[0]), true);
  assert.throws(() => {
    (arjunaBowStory as { reviewState: string }).reviewState = "approved";
  }, TypeError);
});
