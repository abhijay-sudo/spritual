import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultState,
  loadState,
  persistState,
  serializeState,
  STORAGE_KEY,
  type LocalState,
  type PracticeIntention,
  type StorageLike,
} from "../web/src/lib/localStore.ts";
import {
  createPracticeIntention,
  markPracticeIntentionTried,
  resolvePracticeIntention,
  respondToPracticeIntention,
  samePracticeIntention,
} from "../web/src/lib/practiceIntention.ts";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const createdAt = "2026-09-23T05:30:00.000Z";
const triedAt = "2026-09-23T06:30:00.000Z";
const catalog = [
  {
    lessonId: "gita-2-47",
    actionKey: "purpose-first-line",
    label: "Write the first line",
  },
  {
    lessonId: "gita-2-48",
    actionKey: "balance-pause-before-reply",
    label: "Pause before replying",
  },
] as const;

function chosenIntention(): PracticeIntention {
  return createPracticeIntention(
    catalog[0].lessonId,
    catalog[0].actionKey,
    catalog,
    createdAt,
  )!;
}

function existingState(): LocalState {
  return {
    ...defaultState(),
    language: "hi",
    progress: { "gita-2-48": { step: 2, elapsedSeconds: 90, duration: 3 } },
    completions: [
      { id: "c1", lessonId: "gita-2-47", completedAt: createdAt, duration: 3 },
    ],
    reflections: [
      {
        id: "r1",
        lessonId: "gita-2-47",
        text: "An explicitly saved private note",
        createdAt,
      },
    ],
  };
}

test("legacy reading and completion data never invent a chosen intention", () => {
  const storage = new MemoryStorage();
  const legacy = existingState();
  delete legacy.practiceIntention;
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: legacy }));
  assert.deepEqual(loadState(storage), { ...legacy, practiceIntention: null });
  assert.equal(defaultState().practiceIntention, null);
});

test("choice, explicit trying and optional response round-trip without changing learning history", () => {
  const chosen = chosenIntention();
  assert.deepEqual(chosen, {
    lessonId: catalog[0].lessonId,
    actionKey: catalog[0].actionKey,
    createdAt,
  });
  const tried = markPracticeIntentionTried(chosen, triedAt)!;
  const responded = respondToPracticeIntention(tried, "not-yet")!;
  for (const intention of [chosen, tried, responded]) {
    const state = { ...existingState(), practiceIntention: intention };
    const storage = new MemoryStorage();
    assert.equal(persistState(state, storage), true);
    assert.deepEqual(loadState(storage), state);
  }
  assert.equal(chosen.triedAt, undefined);
  assert.equal(tried.response, undefined);
  assert.equal(responded.response, "not-yet");
  assert.equal(
    markPracticeIntentionTried(responded, "2026-09-23T07:30:00.000Z")?.triedAt,
    triedAt,
  );
});

test("catalog lookup rejects unknown or mismatched lesson/action pairs without fallback", () => {
  const chosen = chosenIntention();
  assert.equal(resolvePracticeIntention(chosen, catalog), catalog[0]);
  assert.equal(resolvePracticeIntention(chosen, []), undefined);
  assert.equal(resolvePracticeIntention(null, catalog), undefined);
  assert.equal(
    createPracticeIntention(
      "unknown",
      catalog[0].actionKey,
      catalog,
      createdAt,
    ),
    null,
  );
  assert.equal(
    createPracticeIntention(catalog[0].lessonId, "unknown", catalog, createdAt),
    null,
  );
  assert.equal(
    createPracticeIntention(
      catalog[0].lessonId,
      catalog[1].actionKey,
      catalog,
      createdAt,
    ),
    null,
  );
  const retired = { ...chosen, lessonId: "retired-lesson" };
  const storage = new MemoryStorage();
  assert.equal(
    persistState({ ...existingState(), practiceIntention: retired }, storage),
    true,
  );
  assert.equal(
    resolvePracticeIntention(loadState(storage).practiceIntention, catalog),
    undefined,
  );
});

test("responses cannot fabricate trying and helpers reject invalid or backwards timestamps", () => {
  const chosen = chosenIntention();
  assert.equal(respondToPracticeIntention(chosen, "helpful"), null);
  assert.equal(respondToPracticeIntention(chosen, "not-yet"), null);
  for (const invalid of [
    "not a date",
    "2026-02-30T05:30:00.000Z",
    "2026-09-23",
    "2026-09-22T05:30:00.000Z",
  ]) {
    assert.equal(markPracticeIntentionTried(chosen, invalid), null);
  }
  assert.equal(
    createPracticeIntention(
      catalog[0].lessonId,
      catalog[0].actionKey,
      catalog,
      "2026-02-30T05:30:00.000Z",
    ),
    null,
  );
  assert.equal(
    respondToPracticeIntention(
      markPracticeIntentionTried(chosen, triedAt)!,
      undefined,
    ),
    null,
  );
});

test("malformed optional records cannot overwrite storage or erase existing private notes on read", () => {
  const base = existingState();
  const chosen = chosenIntention();
  const invalid: unknown[] = [
    "chosen",
    [],
    {},
    { ...chosen, actionKey: "" },
    { ...chosen, lessonId: "__proto__" },
    { ...chosen, actionKey: "x".repeat(201) },
    { ...chosen, createdAt: "2026-02-30T05:30:00.000Z" },
    { ...chosen, triedAt: "2026-09-22T05:30:00.000Z" },
    { ...chosen, response: "helpful" },
    { ...chosen, triedAt, response: "healed" },
  ];
  for (const intention of invalid) {
    const storage = new MemoryStorage();
    assert.equal(persistState(base, storage), true);
    const original = storage.getItem(STORAGE_KEY);
    const corrupt = { ...base, practiceIntention: intention } as LocalState;
    assert.equal(persistState(corrupt, storage), false);
    assert.equal(storage.getItem(STORAGE_KEY), original);
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, state: corrupt }),
    );
    assert.deepEqual(loadState(storage), base);
  }
});

test("intention serialization drops accidental private text, profile and UI fields", () => {
  const intention = {
    ...chosenIntention(),
    privateText: "This was not consented for saving",
    inferredFaith: "never infer this",
    replacedIntentions: [chosenIntention()],
  };
  const state = {
    ...existingState(),
    practiceIntention: intention,
    intentionDraft: "Also not consented",
  };
  const serialized = serializeState(state);
  const stored = JSON.parse(serialized).state;
  assert.deepEqual(stored.practiceIntention, chosenIntention());
  assert.equal(Object.hasOwn(stored, "intentionDraft"), false);
  assert.equal(serialized.includes("not consented"), false);
  assert.deepEqual(stored.reflections, state.reflections);
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
  assert.deepEqual(loadState(storage).practiceIntention, chosenIntention());
});

test("replacement identity distinguishes fresh choices while repeated updates keep the same choice", () => {
  const first = chosenIntention();
  const tried = markPracticeIntentionTried(first, triedAt)!;
  assert.equal(samePracticeIntention(first, tried), true);
  assert.equal(samePracticeIntention(null, undefined), true);
  assert.equal(samePracticeIntention(first, null), false);
  assert.equal(
    samePracticeIntention(first, { ...first, createdAt: triedAt }),
    false,
  );
  assert.equal(
    samePracticeIntention(first, { ...first, actionKey: catalog[1].actionKey }),
    false,
  );
  assert.equal(
    samePracticeIntention(first, { ...first, lessonId: catalog[1].lessonId }),
    false,
  );
});

test("clearing and whole-device reset remove the intention with no retained history", () => {
  const storage = new MemoryStorage();
  const base = existingState();
  assert.equal(
    persistState({ ...base, practiceIntention: chosenIntention() }, storage),
    true,
  );
  const cleared = { ...loadState(storage), practiceIntention: null };
  assert.equal(persistState(cleared, storage), true);
  assert.deepEqual(loadState(storage), base);
  assert.equal(persistState(defaultState(), storage), true);
  assert.deepEqual(loadState(storage), defaultState());
  assert.equal(
    storage.getItem(STORAGE_KEY)?.includes(catalog[0].actionKey),
    false,
  );
});
