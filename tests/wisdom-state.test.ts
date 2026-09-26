import test from "node:test";
import assert from "node:assert/strict";
import { parseWisdom, freshWisdom, moveReading, finishReading, chooseReadingAfter, setPracticeCue, markPracticeTried, choosePractice, readingHref, mutateWisdomStorage } from "../web/src/alpha/wisdomState.ts";
const ids = ["gita-2-47", "gita-2-48", "gita-6-26"];
const now = "2026-09-25T10:00:00.000Z";
const roundtrip = value => parseWisdom(JSON.stringify(value), ids);
test("existing v1 reading records retain language and history without inventing practice intent", () => {
  const existing = { schema: 1, language: "hi", kept: { [ids[0]]: { day: "2026-09-25", triedAt: now } }, finished: { [ids[0]]: now } };
  assert.deepEqual(roundtrip(existing), { ...existing, kept: { [ids[0]]: { ...existing.kept[ids[0]], kind: "practice" } } });
  assert.equal(roundtrip({ ...freshWisdom(), kept: { [ids[1]]: { day: "2026-09-25" } } }).kept[ids[1]].kind, "bookmark");
  assert.deepEqual(parseWisdom(null, ids), freshWisdom());
});
test("interrupted reading resumes exact stage without inventing completion", () => {
  const state = roundtrip(moveReading(freshWisdom(), ids[1], 2, now));
  assert.equal(readingHref(ids[1], state.resume), "/alpha/episode/gita-2-48?scene=2");
  assert.equal(readingHref(ids[0], state.resume), "/alpha/episode/gita-2-47");
  assert.equal(state.finished, undefined);
});
test("completion clears only this reading's position and preserves saved practice", () => {
  const base = roundtrip({ ...moveReading(freshWisdom(), ids[0], 3, now), kept: { [ids[1]]: { day: "2026-09-25" } } });
  const done = roundtrip(finishReading(base, ids[0], now));
  assert.equal(done.resume, undefined);
  assert.equal(done.finished?.[ids[0]], now);
  assert.deepEqual(done.kept, base.kept);
  assert.deepEqual(finishReading(base, ids[1], now).resume, base.resume);
});
test("after-reading choices are explicit, private and consumed only by finishing the chosen passage", () => {
  assert.throws(() => chooseReadingAfter(freshWisdom(), ids[0], ids[0], "repeat"));
  const finished = finishReading(freshWisdom(), ids[0], now);
  assert.throws(() => chooseReadingAfter(finished, ids[0], ids[1], "repeat"));
  assert.throws(() => chooseReadingAfter(finished, ids[0], ids[0], "next"));
  const chosen = roundtrip(chooseReadingAfter(finished, ids[0], ids[0], "repeat"));
  assert.deepEqual(chosen.readingChoice, { afterLessonId: ids[0], lessonId: ids[0], mode: "repeat" });
  assert.deepEqual(finishReading(chosen, ids[1], now).readingChoice, chosen.readingChoice);
  assert.equal(finishReading(chosen, ids[0], now).readingChoice, undefined);
  const next = roundtrip(chooseReadingAfter(finished, ids[0], ids[1], "next"));
  assert.equal(next.readingChoice?.lessonId, ids[1]);
  assert.equal(finishReading(next, ids[1], now).readingChoice, undefined);
});
test("cue edit and check-in undo preserve original chosen action and other entries", () => {
  const base = roundtrip({ ...freshWisdom(), kept: { [ids[0]]: { day: "2026-09-25", kind: "practice" }, [ids[1]]: { day: "2026-09-24", triedAt: now } } });
  const cued = roundtrip(setPracticeCue(base, ids[0], "after-breakfast"));
  const tried = roundtrip(markPracticeTried(cued, ids[0], now));
  const undo = roundtrip(markPracticeTried(tried, ids[0]));
  assert.deepEqual(undo, cued);
  assert.deepEqual(setPracticeCue(undo, ids[0]), base);
  assert.throws(() => setPracticeCue(base, ids[2], "evening"));
  assert.throws(() => markPracticeTried(base, ids[2], now));
});
test("bookmark does not permit check-in until the reader explicitly chooses a step", () => {
  const bookmarked = roundtrip({ ...freshWisdom(), kept: { [ids[0]]: { day: "2026-09-25", kind: "bookmark" } } });
  assert.throws(() => markPracticeTried(bookmarked, ids[0], now));
  assert.throws(() => setPracticeCue(bookmarked, ids[0], "evening"));
  const chosen = roundtrip(choosePractice(bookmarked, ids[0], "2026-09-26"));
  assert.equal(chosen.kept[ids[0]].kind, "practice");
  assert.equal(chosen.kept[ids[0]].day, "2026-09-26");
  assert.equal(markPracticeTried(chosen, ids[0], now).kept[ids[0]].triedAt, now);
  const tried = markPracticeTried(chosen, ids[0], now);
  assert.deepEqual(choosePractice(tried, ids[0], "2026-09-27"), tried);
});
test("corrupt or foreign resume data and impossible days fail closed", () => {
  for (const resume of [{lessonId:ids[0],scene:4,updatedAt:now},{lessonId:"foreign",scene:1,updatedAt:now},{lessonId:ids[0],scene:1.5,updatedAt:now},{lessonId:ids[0],scene:1,updatedAt:"bad"}]) assert.throws(() => roundtrip({...freshWisdom(),resume}));
  for (const day of ["2026-02-30", "today", "2026-13-01"]) assert.throws(() => roundtrip({...freshWisdom(),kept:{[ids[0]]:{day}}}));
  assert.throws(() => roundtrip({...freshWisdom(),kept:{[ids[0]]:{day:"2026-09-25",cue:"inferred-faith"}}}));
  assert.throws(() => roundtrip({...freshWisdom(),kept:{[ids[0]]:{day:"2026-09-25",kind:"bookmark",triedAt:now}}}));
  for (const readingChoice of [
    { afterLessonId: "foreign", lessonId: ids[0], mode: "repeat" },
    { afterLessonId: ids[0], lessonId: ids[1], mode: "repeat" },
    { afterLessonId: ids[0], lessonId: ids[0], mode: "next" },
    { afterLessonId: ids[0], lessonId: ids[0], mode: "streak" },
  ]) assert.throws(() => roundtrip({ ...freshWisdom(), readingChoice }));
});
test("serializer allowlists fields rather than persisting accidental private text", () => {
  const saved = roundtrip({...freshWisdom(),reflection:"private",resume:{lessonId:ids[0],scene:2,updatedAt:now,profile:"private"},readingChoice:{afterLessonId:ids[0],lessonId:ids[0],mode:"repeat",note:"private"},kept:{[ids[0]]:{day:"2026-09-25",note:"private"}}});
  assert.equal(JSON.stringify(saved).includes("private"),false);
});

test("storage updates reread latest fields and remain scoped to the actor key", () => {
  const records = new Map([["asha", JSON.stringify({...freshWisdom(),language:"hi"})], ["ravi", JSON.stringify(freshWisdom())]]);
  const storage = { getItem: key => records.get(key) || null, setItem: (key, value) => records.set(key, value) };
  mutateWisdomStorage(storage, "asha", ids, latest => moveReading(latest, ids[0], 1, now));
  assert.equal(parseWisdom(records.get("asha"),ids).language,"hi");
  assert.deepEqual(parseWisdom(records.get("ravi"),ids),freshWisdom());
});
test("corrupt storage is not overwritten and failed writes never return success", () => {
  let writes = 0;
  assert.throws(() => mutateWisdomStorage({getItem:()=>"{broken",setItem:()=>{writes++;}},"asha",ids,s=>s));
  assert.equal(writes,0);
  assert.throws(() => mutateWisdomStorage({getItem:()=>null,setItem:()=>{throw Error("Quota exceeded");}},"asha",ids,s=>moveReading(s,ids[0],1,now)));
});
