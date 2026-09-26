import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../web/src/data/lessons.ts";
import { defaultState, type Completion } from "../web/src/lib/localStore.ts";
import {
  getJourneyState,
  getLatestCompletedLesson,
} from "../web/src/lib/journey.ts";

function completion(lessonId: string, day = 23, id = lessonId): Completion {
  return {
    id,
    lessonId,
    completedAt: `2026-09-${day}T08:00:00.000Z`,
    duration: 3,
  };
}

test("a fresh journey offers the first lesson with every lesson accessible", () => {
  const journey = getJourneyState(defaultState(), lessons);
  assert.equal(journey.completedCount, 0);
  assert.equal(journey.isComplete, false);
  assert.equal(journey.nextLesson?.id, lessons[0].id);
  assert.deepEqual(
    journey.items.map((item) => item.status),
    ["ready", "ready", "ready"],
  );
});

test("out-of-order and repeated completions count distinct known lessons only", () => {
  const state = defaultState();
  state.completions = [
    completion(lessons[2].id),
    completion(lessons[0].id),
    completion(lessons[2].id, 23, "repeat"),
    completion("unknown-lesson"),
  ];
  const journey = getJourneyState(state, lessons);
  assert.equal(journey.completedCount, 2);
  assert.equal(journey.nextLesson?.id, lessons[1].id);
  assert.deepEqual(
    journey.items.map((item) => item.status),
    ["completed", "ready", "completed"],
  );
});

test("last-opened progress takes priority over catalog order and unread suggestions", () => {
  const state = defaultState();
  state.progress = {
    [lessons[0].id]: { step: 2, elapsedSeconds: 90, duration: 3 },
    [lessons[2].id]: { step: 1, elapsedSeconds: 45, duration: 3 },
  };
  state.lastActiveLessonId = lessons[2].id;
  const journey = getJourneyState(state, lessons);
  assert.equal(journey.resumeLesson?.id, lessons[2].id);
  assert.equal(journey.nextLesson?.id, lessons[2].id);
  assert.equal(journey.nextUnreadLesson?.id, lessons[0].id);
  state.lastActiveLessonId = "unknown-lesson";
  assert.equal(getJourneyState(state, lessons).resumeLesson?.id, lessons[0].id);
});

test("unknown activity does not complete or resume a lesson in the collection", () => {
  const state = defaultState();
  state.progress.unknown = { step: 1, elapsedSeconds: 45, duration: 3 };
  state.lastActiveLessonId = "unknown";
  state.completions = [completion("unknown")];
  const journey = getJourneyState(state, lessons);
  assert.equal(journey.resumeLesson, undefined);
  assert.equal(journey.completedCount, 0);
  assert.equal(journey.nextLesson?.id, lessons[0].id);
  assert.equal(getLatestCompletedLesson(state, lessons), undefined);
});

test("all-completed journeys end without wrapping, while a deliberate reread still resumes", () => {
  const state = defaultState();
  state.completions = lessons.map((lesson) => completion(lesson.id));
  let journey = getJourneyState(state, lessons);
  assert.equal(journey.completedCount, 3);
  assert.equal(journey.isComplete, true);
  assert.equal(journey.nextLesson, undefined);
  state.progress[lessons[1].id] = { step: 1, elapsedSeconds: 45, duration: 3 };
  state.lastActiveLessonId = lessons[1].id;
  journey = getJourneyState(state, lessons);
  assert.equal(journey.isComplete, true);
  assert.equal(journey.nextLesson?.id, lessons[1].id);
  assert.equal(journey.items[1].status, "in-progress");
  assert.equal(journey.items[1].hasCompleted, true);
  assert.equal(journey.nextUnfinishedLesson, undefined);
});

test("completion suggestions skip rereads but retain active unfinished progress", () => {
  const state = defaultState();
  state.completions = [completion(lessons[0].id)];
  state.progress = {
    [lessons[0].id]: { step: 1, elapsedSeconds: 45, duration: 3 },
    [lessons[2].id]: { step: 2, elapsedSeconds: 90, duration: 3 },
  };
  state.lastActiveLessonId = lessons[0].id;
  let journey = getJourneyState(state, lessons);
  assert.equal(journey.nextLesson?.id, lessons[0].id);
  assert.equal(journey.nextUnfinishedLesson?.id, lessons[2].id);
  state.progress[lessons[1].id] = { step: 1, elapsedSeconds: 45, duration: 3 };
  state.lastActiveLessonId = lessons[2].id;
  journey = getJourneyState(state, lessons);
  assert.equal(journey.nextUnfinishedLesson?.id, lessons[2].id);
});

test("completion recommendations exclude the just-finished lesson without changing counts", () => {
  const state = defaultState();
  state.completions = [completion(lessons[0].id)];
  state.progress[lessons[0].id] = { step: 3, elapsedSeconds: 135, duration: 3 };
  state.lastActiveLessonId = lessons[0].id;
  const journey = getJourneyState(state, lessons, lessons[0].id);
  assert.equal(journey.completedCount, 1);
  assert.equal(journey.resumeLesson, undefined);
  assert.equal(journey.nextLesson?.id, lessons[1].id);
});

test("latest takeaway uses completion time and ignores unknown and invalid records", () => {
  const state = defaultState();
  state.completions = [
    completion(lessons[1].id, 22),
    completion(lessons[0].id, 23),
    completion(lessons[2].id, 21),
    completion("unknown", 24),
    { ...completion(lessons[2].id), completedAt: "invalid" },
  ];
  assert.equal(getLatestCompletedLesson(state, lessons)?.id, lessons[0].id);
  assert.equal(getJourneyState(state, []).isComplete, false);
  assert.equal(getLatestCompletedLesson(defaultState(), lessons), undefined);
});
