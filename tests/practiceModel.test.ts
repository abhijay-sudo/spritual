import test from "node:test";
import assert from "node:assert/strict";
import { JAPA_TARGET, formatPauseTime, nextJapaCount, parseJapaCount, remainingPauseMs } from "../web/src/alpha/practiceModel.ts";

test("a missing japa count begins at zero, while valid saved counts resume", () => {
  assert.equal(JAPA_TARGET, 108);
  assert.equal(parseJapaCount(null), 0);
  assert.equal(parseJapaCount("0"), 0);
  assert.equal(parseJapaCount("107"), 107);
  assert.equal(parseJapaCount("108"), 108);
});

test("corrupt saved japa counts are rejected instead of reset", () => {
  for (const raw of ["", "not json", "null", '"4"', "true", "[]", "{}", "-1", "108.5", "109", "1e309"]) {
    assert.throws(() => parseJapaCount(raw), /corrupted/, raw);
  }
});

test("a deliberate tap advances once and stops at 108", () => {
  assert.equal(nextJapaCount(0), 1);
  assert.equal(nextJapaCount(107), 108);
  assert.equal(nextJapaCount(108), 108);
  for (const invalid of [-1, 0.25, 109, Number.NaN, Infinity]) {
    assert.throws(() => nextJapaCount(invalid), RangeError);
  }
});

test("a pause resumes from elapsed wall time and never exceeds its bounds", () => {
  assert.equal(remainingPauseMs(1_000, 60_000, 1_000), 60_000);
  assert.equal(remainingPauseMs(1_000, 60_000, 16_000), 45_000);
  assert.equal(remainingPauseMs(1_000, 60_000, 61_000), 0);
  assert.equal(remainingPauseMs(1_000, 60_000, 90_000), 0);
  assert.equal(remainingPauseMs(1_000, 60_000, 500), 60_000); // clock moved backwards
  assert.equal(remainingPauseMs(0, 0, 0), 0);
});

test("invalid pause timestamps are rejected", () => {
  for (const invalid of [-1, Number.NaN, Infinity]) {
    assert.throws(() => remainingPauseMs(invalid, 1_000, 0), RangeError);
    assert.throws(() => remainingPauseMs(0, invalid, 0), RangeError);
    assert.throws(() => remainingPauseMs(0, 1_000, invalid), RangeError);
  }
});

test("pause time rounds remaining fractions up without displaying negatives", () => {
  assert.equal(formatPauseTime(0), "0:00");
  assert.equal(formatPauseTime(1), "0:01");
  assert.equal(formatPauseTime(59_001), "1:00");
  assert.equal(formatPauseTime(60_000), "1:00");
  assert.equal(formatPauseTime(60_001), "1:01");
  assert.equal(formatPauseTime(3_600_000), "60:00");
  assert.equal(formatPauseTime(-1), "0:00");
  assert.equal(formatPauseTime(Number.NaN), "0:00");
});
