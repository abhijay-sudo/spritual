import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultState,
  loadState,
  persistState,
  serializeState,
  selectResumeLessonId,
  pruneReflectionDrafts,
  hasUnsavedReflectionDraft,
  STORAGE_KEY,
  type LocalState,
  type StorageLike,
  type ReflectionDrafts,
} from "../web/src/lib/localStore.ts";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

const timestamp = "2026-09-23T05:30:00.000Z";

function populatedState(): LocalState {
  return {
    ...defaultState(),
    language: "hi",
    textSize: "large",
    transliteration: false,
    weeklyGoal: 5,
    routine: "evening",
    bookmarks: ["gita-2-47"],
    progress: { "gita-2-47": { step: 1, elapsedSeconds: 90.5, duration: 3 } },
    completions: [
      {
        id: "completion-1",
        lessonId: "gita-2-47",
        completedAt: timestamp,
        duration: 3,
      },
    ],
    reflections: [
      {
        id: "reflection-1",
        lessonId: "gita-2-47",
        text: "One small action.",
        createdAt: timestamp,
      },
    ],
    feedback: [
      {
        id: "feedback-1",
        rating: "helpful",
        comment: "",
        createdAt: timestamp,
      },
    ],
    onboardingDone: true,
  };
}

test("fresh defaults have no activity or private reflections and do not share mutable objects", () => {
  const first = defaultState();
  first.bookmarks.push("example");
  first.progress.example = { step: 0, elapsedSeconds: 0, duration: 3 };
  first.reflections.push({
    id: "r",
    lessonId: "example",
    text: "Private",
    createdAt: timestamp,
  });
  const second = defaultState();
  assert.deepEqual(second.bookmarks, []);
  assert.deepEqual(second.progress, {});
  assert.deepEqual(second.reflections, []);
  assert.deepEqual(second.completions, []);
  assert.equal(second.onboardingDone, false);
});

test("valid state round-trips through a versioned key without changing actual history", () => {
  const storage = new MemoryStorage();
  const state = populatedState();
  state.completions.push({
    id: "completion-2",
    lessonId: "gita-2-47",
    completedAt: "2026-09-21T05:30:00.000Z",
    duration: 5,
  });
  assert.equal(persistState(state, storage), true);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)!).version, 1);
  const restored = loadState(storage);
  assert.deepEqual(restored, state);
  restored.bookmarks.push("another");
  assert.deepEqual(loadState(storage).bookmarks, ["gita-2-47"]);
});

test("missing, corrupt, oversized and incompatible storage fall back safely", () => {
  const storage = new MemoryStorage();
  for (const raw of [
    null,
    "{invalid",
    "null",
    "[]",
    JSON.stringify({ version: 2, state: populatedState() }),
    "x".repeat(2_000_001),
  ]) {
    if (raw === null) storage.values.delete(STORAGE_KEY);
    else storage.setItem(STORAGE_KEY, raw);
    assert.deepEqual(loadState(storage), defaultState());
  }
});

test("invalid preferences, timestamps, progress, duplicate IDs and unsafe keys are rejected", () => {
  const invalidStates: unknown[] = [
    { ...populatedState(), language: "xx" },
    { ...populatedState(), weeklyGoal: 7 },
    { ...populatedState(), textSize: "tiny" },
    { ...populatedState(), routine: "daily" },
    { ...populatedState(), onboardingDone: "true" },
    { ...populatedState(), bookmarks: ["gita-2-47", "gita-2-47"] },
    {
      ...populatedState(),
      progress: { sample: { step: -1, elapsedSeconds: 10, duration: 3 } },
    },
    {
      ...populatedState(),
      progress: { sample: { step: 1.5, elapsedSeconds: 10, duration: 3 } },
    },
    {
      ...populatedState(),
      progress: { sample: { step: 1, elapsedSeconds: 181, duration: 3 } },
    },
    {
      ...populatedState(),
      progress: JSON.parse(
        '{"__proto__":{"step":0,"elapsedSeconds":0,"duration":3}}',
      ),
    },
    {
      ...populatedState(),
      completions: [
        {
          id: "c",
          lessonId: "sample",
          duration: 3,
          completedAt: "2026-02-30T05:30:00.000Z",
        },
      ],
    },
    {
      ...populatedState(),
      completions: [
        populatedState().completions[0],
        populatedState().completions[0],
      ],
    },
    {
      ...populatedState(),
      reflections: [
        {
          id: "r",
          lessonId: "sample",
          text: "x".repeat(10_001),
          createdAt: timestamp,
        },
      ],
    },
    {
      ...populatedState(),
      feedback: [
        { id: "f", rating: "amazing", comment: "", createdAt: timestamp },
      ],
    },
  ];
  for (const state of invalidStates) {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
    assert.deepEqual(loadState(storage), defaultState());
    assert.equal(persistState(state as LocalState, storage), false);
  }
});

test("unavailable and quota-limited storage never throws or reports success", () => {
  const failingStorage: StorageLike = {
    getItem() {
      throw new Error("SecurityError");
    },
    setItem() {
      throw new Error("QuotaExceededError");
    },
  };
  const state = populatedState();
  const before = structuredClone(state);
  assert.deepEqual(loadState(failingStorage), defaultState());
  assert.deepEqual(loadState(null), defaultState());
  assert.equal(persistState(state, failingStorage), false);
  assert.equal(persistState(state, null), false);
  assert.deepEqual(state, before);
});

test("import and default persistence remain safe without a browser window", () => {
  assert.equal(typeof window, "undefined");
  assert.deepEqual(loadState(), defaultState());
  assert.equal(persistState(defaultState()), false);
});

test("earlier version-1 records remain readable without a last-active lesson", () => {
  const storage = new MemoryStorage();
  const legacy = populatedState();
  delete legacy.lastActiveLessonId;
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: legacy }));
  const restored = loadState(storage);
  assert.deepEqual(restored, { ...legacy, lastActiveLessonId: null });
  assert.equal(selectResumeLessonId(restored, ["gita-2-47"]), "gita-2-47");
});

test("resume prefers the last active available lesson and falls back for legacy data", () => {
  const state = populatedState();
  state.progress["gita-6-26"] = { step: 2, elapsedSeconds: 90, duration: 3 };
  state.lastActiveLessonId = "gita-6-26";
  const ids = ["gita-2-47", "gita-6-26"];
  assert.equal(selectResumeLessonId(state, ids), "gita-6-26");
  assert.equal(selectResumeLessonId(state, ["gita-2-47"]), "gita-2-47");
  delete state.progress["gita-6-26"];
  assert.equal(selectResumeLessonId(state, ids), "gita-2-47");
  state.progress = {};
  assert.equal(selectResumeLessonId(state, ids), undefined);
});

test("last-active lesson must refer to existing progress before persistence", () => {
  const storage = new MemoryStorage();
  const state = populatedState();
  state.lastActiveLessonId = "gita-2-47";
  assert.equal(persistState(state, storage), true);
  assert.equal(loadState(storage).lastActiveLessonId, "gita-2-47");
  state.lastActiveLessonId = "missing";
  assert.equal(persistState(state, storage), false);
  assert.equal(loadState(storage).lastActiveLessonId, "gita-2-47");
});

test("reflection drafts stay transient even if accidentally passed to persistence", () => {
  const storage = new MemoryStorage();
  const drafts: ReflectionDrafts = {
    "completion-1": { text: "Private unsaved writing", consent: false },
  };
  const state = Object.assign(populatedState(), { drafts });
  assert.equal(persistState(state, storage), true);
  const raw = storage.getItem(STORAGE_KEY)!;
  assert.equal(raw.includes("Private unsaved writing"), false);
  assert.equal(Object.hasOwn(loadState(storage), "drafts"), false);
  assert.equal(hasUnsavedReflectionDraft(drafts), true);
  assert.equal(
    hasUnsavedReflectionDraft({ blank: { text: "  \n", consent: true } }),
    false,
  );
});

test("removing completions clears their private drafts without touching remaining drafts", () => {
  const drafts: ReflectionDrafts = {
    first: { text: "Keep for this visit", consent: false },
    second: { text: "Remove with deleted history", consent: true },
  };
  assert.equal(
    pruneReflectionDrafts(drafts, [{ id: "first" }, { id: "second" }]),
    drafts,
  );
  assert.deepEqual(pruneReflectionDrafts(drafts, [{ id: "first" }]), {
    first: drafts.first,
  });
  assert.deepEqual(pruneReflectionDrafts(drafts, []), {});
  assert.equal(
    hasUnsavedReflectionDraft(pruneReflectionDrafts(drafts, [])),
    false,
  );
});

test("motion preference round-trips and legacy records preserve private data", () => {
  const storage = new MemoryStorage();
  const state = { ...populatedState(), motion: "reduced" as const };
  assert.equal(persistState(state, storage), true);
  assert.deepEqual(loadState(storage), state);
  const legacy = populatedState();
  delete legacy.motion;
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: legacy }));
  assert.deepEqual(loadState(storage), { ...legacy, motion: "system" });
  assert.equal(defaultState().motion, "system");
});

test("unknown optional motion safely falls back without discarding saved reflections", () => {
  const base = populatedState();
  for (const motion of ["full", "off", null, true, 1, {}, []]) {
    const storage = new MemoryStorage();
    const state = { ...base, motion } as LocalState;
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
    assert.deepEqual(loadState(storage), { ...base, motion: "system" });
    assert.equal(JSON.parse(serializeState(state)).state.motion, "system");
  }
});

test("reading theme round-trips and legacy records retain saved reading data", () => {
  const storage = new MemoryStorage();
  const state = { ...populatedState(), readingTheme: "evening" as const };
  assert.equal(persistState(state, storage), true);
  assert.deepEqual(loadState(storage), state);
  const legacy = populatedState();
  delete legacy.readingTheme;
  storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state: legacy }));
  assert.deepEqual(loadState(storage), { ...legacy, readingTheme: "paper" });
  assert.equal(defaultState().readingTheme, "paper");
});

test("invalid optional reading themes normalize to paper without erasing notes", () => {
  const base = populatedState();
  for (const readingTheme of ["dark", "light", null, false, 5, {}, []]) {
    const storage = new MemoryStorage();
    const state = { ...base, readingTheme } as LocalState;
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, state }));
    assert.deepEqual(loadState(storage), { ...base, readingTheme: "paper" });
    assert.equal(JSON.parse(serializeState(state)).state.readingTheme, "paper");
  }
});
