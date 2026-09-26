import assert from "node:assert/strict";
import test from "node:test";
import { lessons } from "../web/src/data/lessons.ts";
import { searchLessons } from "../web/src/lib/lessonSearch.ts";

const ids = (query: string, topic = "all") =>
  searchLessons(lessons, query, topic).map((lesson) => lesson.id);

test("Hindi and transliterated scripture names find the available Gita samples", () => {
  const allIds = lessons.map((lesson) => lesson.id);
  for (const query of [
    "गीता",
    "भगवद्गीता",
    "भगवद् गीता",
    "Bhagavad Gita",
    "BHAGAVAD GĪTĀ",
  ]) {
    assert.deepEqual(ids(query), allIds, query);
  }
  assert.deepEqual(ids("गीता 2.47"), ["gita-2-47"]);
});

test("search covers English and Hindi titles, subtitles, themes and references", () => {
  for (const lesson of lessons) {
    for (const field of [lesson.title, lesson.subtitle, lesson.theme]) {
      for (const query of [field.en, field.hi]) {
        assert.ok(ids(query).includes(lesson.id), query);
      }
    }
    assert.deepEqual(ids(lesson.reference), [lesson.id]);
  }
  assert.deepEqual(ids("संतुलन"), ["gita-2-48"]);
  assert.deepEqual(ids("एकाग्रता"), ["gita-6-26"]);
  assert.deepEqual(ids("purpose"), ["gita-2-47"]);
});

test("case, accents and extra whitespace do not obstruct a search", () => {
  assert.deepEqual(ids("  bHaGaVaD\t GĪTĀ\n 2.48  "), ["gita-2-48"]);
  assert.deepEqual(ids("BÁLANCE"), ["gita-2-48"]);
  assert.deepEqual(ids("  एक\tकाम,\n पूरे मन से  "), ["gita-2-47"]);
  assert.deepEqual(
    ids("  "),
    lessons.map((lesson) => lesson.id),
  );
});

test("topic and query combine while unknown topics safely show all topics", () => {
  assert.deepEqual(ids("", "purpose"), ["gita-2-47"]);
  assert.deepEqual(ids("गीता", "balance"), ["gita-2-48"]);
  assert.deepEqual(ids("", "attention"), ["gita-6-26"]);
  assert.deepEqual(ids("2.47", "balance"), []);
  assert.deepEqual(
    ids("गीता", "unknown"),
    lessons.map((lesson) => lesson.id),
  );
  assert.deepEqual(ids("2.48", "unknown"), ["gita-2-48"]);
  assert.deepEqual(ids("", "  BALANCE  "), ["gita-2-48"]);
  assert.deepEqual(ids("nothing matches this query"), []);
});

test("Gita aliases are not applied to unrelated scripture records", () => {
  const otherLesson = {
    ...lessons[0],
    id: "other-scripture",
    reference: "Other scripture 1.1",
  };
  assert.deepEqual(searchLessons([otherLesson], "गीता", "all"), []);
});

test("search preserves lesson order and does not mutate the content", () => {
  const original = structuredClone(lessons);
  assert.deepEqual(searchLessons(lessons, "गीता", "all"), lessons);
  assert.deepEqual(lessons, original);
  assert.notEqual(searchLessons(lessons, "", "all"), lessons);
});


test("complete verse references accept common separators and Hindi digits", () => {
  for (const query of ["bg 2 47", "BG 2:47", "2.47", "गीता २.४७", "२ ४७", "Bhagavad Gita 02:047"]) {
    assert.deepEqual(ids(query), ["gita-2-47"], query);
  }
  for (const query of ["2.4", "BG 2 4", "गीता २:४", "BG 99:99"]) {
    assert.deepEqual(ids(query), [], query);
  }
  assert.deepEqual(ids("bg 2 47", "balance"), []);
  assert.deepEqual(ids("BG 6:26", "attention"), ["gita-6-26"]);
});
