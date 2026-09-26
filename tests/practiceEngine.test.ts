import assert from "node:assert/strict";
import test from "node:test";
import {
  durationSeconds,
  elapsedForStep,
  formatTime,
  stepForElapsed,
  weekCompletionDates,
} from "../web/src/lib/practiceEngine.ts";

test("duration choices and clock formatting handle boundaries", () => {
  assert.deepEqual(
    [3, 5, 10].map((value) => durationSeconds(value as 3 | 5 | 10)),
    [180, 300, 600],
  );
  assert.equal(formatTime(0), "0:00");
  assert.equal(formatTime(59.9), "0:59");
  assert.equal(formatTime(60), "1:00");
  assert.equal(formatTime(600), "10:00");
  assert.equal(formatTime(-5), "0:00");
  assert.equal(formatTime(Number.NaN), "0:00");
  assert.equal(formatTime(Infinity), "0:00");
});

test("timed reading advances only at a boundary and preserves the final step", () => {
  assert.equal(stepForElapsed(0, 180, 3), 0);
  assert.equal(stepForElapsed(59.99, 180, 3), 0);
  assert.equal(stepForElapsed(60, 180, 3), 1);
  assert.equal(stepForElapsed(119.99, 180, 3), 1);
  assert.equal(stepForElapsed(120, 180, 3), 2);
  assert.equal(stepForElapsed(180, 180, 3), 2);
  assert.equal(stepForElapsed(500, 180, 3), 2);
  assert.equal(stepForElapsed(-5, 180, 3), 0);
});

test("manual navigation and timed navigation agree, including uneven divisions", () => {
  for (const total of [180, 300, 600]) {
    for (const count of [1, 3, 7, 11]) {
      for (let step = 0; step < count; step++) {
        assert.equal(
          stepForElapsed(elapsedForStep(step, total, count), total, count),
          step,
        );
      }
    }
  }
  assert.equal(elapsedForStep(-1, 180, 3), 0);
  assert.equal(elapsedForStep(500, 180, 3), 120);
});

test("invalid timing input yields usable finite defaults", () => {
  for (const invalid of [0, -1, Number.NaN, Infinity]) {
    assert.equal(stepForElapsed(90, invalid, 3), 0);
    assert.equal(stepForElapsed(90, 180, invalid), 0);
    assert.equal(elapsedForStep(1, invalid, 3), 0);
    assert.equal(elapsedForStep(1, 180, invalid), 0);
  }
});

test("week activity uses local Monday boundaries, deduplicates and excludes future entries", () => {
  const previousTimezone = process.env.TZ;
  try {
    process.env.TZ = "Asia/Kolkata";
    const now = new Date("2026-09-23T12:00:00+05:30");
    const completions = [
      { completedAt: "2026-09-22T20:30:00.000Z" }, // Wednesday in India.
      { completedAt: "2026-09-20T18:30:00.000Z" }, // Exactly Monday midnight in India.
      { completedAt: "2026-09-22T04:00:00.000Z" },
      { completedAt: "2026-09-22T08:00:00.000Z" }, // Same local day counts once.
      { completedAt: "2026-09-20T18:29:59.999Z" }, // Previous Sunday.
      { completedAt: "2026-09-23T07:00:00.000Z" }, // Later than now.
      { completedAt: "2026-09-28T04:00:00.000Z" },
      { completedAt: "bad timestamp" },
    ];
    const original = structuredClone(completions);
    assert.deepEqual(weekCompletionDates(completions, now), [
      "2026-09-21",
      "2026-09-22",
      "2026-09-23",
    ]);
    assert.deepEqual(completions, original);
    assert.equal(now.toISOString(), "2026-09-23T06:30:00.000Z");
    assert.deepEqual(weekCompletionDates(completions, new Date("invalid")), []);
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

test("Sunday and daylight saving retain the actual local completion dates", () => {
  const previousTimezone = process.env.TZ;
  try {
    process.env.TZ = "America/New_York";
    const completions = [
      { completedAt: "2026-03-02T05:00:00.000Z" }, // Monday midnight before DST.
      { completedAt: "2026-03-08T06:59:59.000Z" }, // Sunday 01:59:59.
      { completedAt: "2026-03-08T07:00:00.000Z" }, // Sunday 03:00:00 after DST.
      { completedAt: "2026-03-09T04:00:00.000Z" }, // Next Monday midnight.
    ];
    assert.deepEqual(
      weekCompletionDates(completions, new Date("2026-03-08T23:30:00-04:00")),
      ["2026-03-02", "2026-03-08"],
    );
    assert.deepEqual(
      weekCompletionDates(completions, new Date("2026-03-09T00:00:00-04:00")),
      ["2026-03-09"],
    );
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});
