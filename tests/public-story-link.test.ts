import assert from "node:assert/strict";
import test from "node:test";
import { publicStoryLink } from "../web/src/alpha/knowledge/publicStoryLink.ts";

test("public story link preserves language and contains no private state", () => {
  assert.deepEqual(publicStoryLink("hanuman-crossing", "hi", "http://127.0.0.1:4183", undefined, false), {
    url: "http://127.0.0.1:4183/alpha/stories/hanuman-crossing?language=hi", localOnly: true,
  });
  assert.deepEqual(publicStoryLink("hanuman-crossing", "en", "http://localhost:5173", "https://spritual.co.in", true), {
    url: "https://spritual.co.in/alpha/stories/hanuman-crossing", localOnly: false,
  });
});

test("native localhost and malformed or unsafe origins never become share links", () => {
  assert.equal(publicStoryLink("hanuman-crossing", "en", "http://localhost", undefined, true), null);
  assert.equal(publicStoryLink("hanuman-crossing", "en", "http://localhost", "http://spritual.co.in", true), null);
  assert.equal(publicStoryLink("hanuman-crossing", "en", "http://localhost", "https://spritual.co.in/private", true), null);
  assert.equal(publicStoryLink("../private", "en", "https://spritual.co.in", undefined, false), null);
});
