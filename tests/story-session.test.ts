import assert from "node:assert/strict";
import test from "node:test";
import { clearStorySession, loadStorySession, parseStorySession, storySessionKey, writeStorySession, type StorySession } from "../web/src/alpha/knowledge/storySession.ts";

const storyId = "c3208272-0480-4455-a3c2-828b02f06f15";
const anotherId = "e519fc42-a89e-45f0-8d52-5147bfd61779";

test("story position and a chosen action persist only for the same actor and published revision ID", () => {
  const rows = new Map<string, string>();
  const storage = { getItem: (key: string) => rows.get(key) ?? null, setItem: (key: string, value: string) => { rows.set(key, value); }, removeItem: (key: string) => { rows.delete(key); } };
  const value: StorySession = { schema: 1, storyId, scene: 1, action: { text: "Pause before one reply", savedAt: "2026-09-29T10:00:00.000Z" } };
  writeStorySession(storage, "guest", value, 3);
  assert.deepEqual(loadStorySession(storage, "guest", storyId, 3), { kind: "ready", value });
  assert.deepEqual(loadStorySession(storage, "guest", anotherId, 3), { kind: "empty" });
  assert.deepEqual(loadStorySession(storage, anotherId, storyId, 3), { kind: "empty" });
  clearStorySession(storage, "guest", storyId);
  assert.deepEqual(loadStorySession(storage, "guest", storyId, 3), { kind: "empty" });
});

test("corrupt, foreign or stale scene state fails closed without overwriting storage", () => {
  const raw = JSON.stringify({ schema: 1, storyId, scene: 3 });
  assert.deepEqual(parseStorySession(raw, storyId, 3), { kind: "error" });
  assert.deepEqual(parseStorySession(raw, anotherId, 4), { kind: "error" });
  assert.deepEqual(parseStorySession("{broken", storyId, 3), { kind: "error" });
  assert.deepEqual(parseStorySession(JSON.stringify({ schema: 1, storyId, scene: 0, action: {
    text: "A private step", savedAt: "2026-09-29T10:00:00.000Z", response: "helpful" } }), storyId, 3), { kind: "error" });
  assert.throws(() => storySessionKey("other-user@example.com", storyId));
});

test("saved action and report remain distinct from merely finishing or spending time", () => {
  const value: StorySession = { schema: 1, storyId, scene: 2, finishedAt: "2026-09-29T10:00:00.000Z" };
  assert.deepEqual(parseStorySession(JSON.stringify(value), storyId, 3), { kind: "ready", value });
  assert.equal(value.action, undefined);
  assert.deepEqual(parseStorySession(JSON.stringify({ ...value, action: {
    text: "Ask before deciding", savedAt: "2026-09-29T10:00:00.000Z", triedAt: "2026-09-29T11:00:00.000Z", response: "not-yet" } }), storyId, 3).kind, "ready");
});
