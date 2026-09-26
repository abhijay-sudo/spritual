import test from "node:test";
import assert from "node:assert/strict";
import { chooseToday } from "../web/src/alpha/calmModel.ts";
import { lessons } from "../web/src/data/lessons.ts";
import { chooseReadingAfter, finishReading, freshWisdom } from "../web/src/alpha/wisdomState.ts";

const today = "2026-09-26";
const zone = "Asia/Kolkata";

test("Today begins with one stable reading and resumes its exact stage", () => {
  const fresh = chooseToday(freshWisdom(), lessons, today, zone);
  assert.equal(fresh.kind, "new");
  assert.equal(fresh.lesson.id, lessons[0].id);
  const active = chooseToday({ ...freshWisdom(), resume: { lessonId: lessons[1].id, scene: 2, updatedAt: "2026-09-20T12:00:00Z" } }, lessons, today, zone);
  assert.equal(active.kind, "active");
  assert.equal(active.href, `/alpha/episode/${lessons[1].id}?scene=2`);
});

test("Today acknowledges a locally completed reading without inventing another assignment", () => {
  const completed = chooseToday({ ...freshWisdom(), finished: { [lessons[1].id]: "2026-09-25T20:00:00Z" } }, lessons, today, zone);
  assert.equal(completed.kind, "completed");
  assert.equal(completed.lesson.id, lessons[1].id);
  const later = chooseToday({ ...freshWisdom(), finished: { [lessons[1].id]: "2026-09-23T20:00:00Z" } }, lessons, today, zone);
  assert.equal(later.kind, "returning");
  assert.equal(later.lesson.id, lessons[0].id);
});

test("Today returns to a known available reading after all are completed", () => {
  const finished = Object.fromEntries(lessons.map((lesson, index) => [lesson.id, `2026-09-${20 + index}T12:00:00Z`]));
  const result = chooseToday({ ...freshWisdom(), finished }, lessons, today, zone);
  assert.equal(result.kind, "returning");
  assert.equal(result.lesson.id, lessons[2].id);
});

test("an intentional repeat stays on Today beyond the completion day until read again", () => {
  const finished = finishReading(freshWisdom(), lessons[0].id, "2026-09-25T20:00:00Z");
  const repeated = chooseReadingAfter(finished, lessons[0].id, lessons[0].id, "repeat");
  for (const day of [today, "2026-10-02"]) {
    const selection = chooseToday(repeated, lessons, day, zone);
    assert.equal(selection.kind, "repeat");
    assert.equal(selection.lesson.id, lessons[0].id);
  }
  assert.equal(finishReading(repeated, lessons[0].id, "2026-10-02T12:00:00Z").readingChoice, undefined);
});

test("an intentional next reading overrides same-day completion without claiming comprehension", () => {
  const finished = finishReading(freshWisdom(), lessons[0].id, "2026-09-25T20:00:00Z");
  const chosen = chooseReadingAfter(finished, lessons[0].id, lessons[1].id, "next");
  const selection = chooseToday(chosen, lessons, today, zone);
  assert.equal(selection.kind, "next");
  assert.equal(selection.lesson.id, lessons[1].id);
  const resumed = { ...chosen, resume: { lessonId: lessons[1].id, scene: 2, updatedAt: "2026-09-25T20:10:00Z" } };
  assert.equal(chooseToday(resumed, lessons, today, zone).kind, "active");
});
