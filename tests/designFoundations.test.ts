import test from "node:test";
import assert from "node:assert/strict";
import {
  parsePreferences,
  defaults,
  resolveTheme,
  isDesignPreview,
} from "../web/src/design/preferences.ts";
import { themes } from "../web/src/design/tokens.ts";
import { skyAt, skyForDate, moonPath } from "../web/src/design/sky.ts";
test("preview requires both its route and explicit opt-in", () => {
  assert.equal(isDesignPreview("/design", "?ui_v2=1"), true);
  for (const [p, q] of [
    ["/today", "?ui_v2=1"],
    ["/design", ""],
    ["/design", "?ui_v2=0"],
  ])
    assert.equal(isDesignPreview(p, q), false);
});
test("corrupt and unsupported preferences recover without accepting arbitrary settings", () => {
  assert.deepEqual(parsePreferences("{"), defaults);
  assert.deepEqual(
    parsePreferences('{"scale":10,"appearance":"unknown"}'),
    defaults,
  );
  assert.equal(parsePreferences('{"scale":2,"language":"hi"}').scale, 2);
});
test("device and solar themes respond to actual boundaries", () => {
  assert.equal(resolveTheme("system", true, 60), "dark");
  assert.equal(resolveTheme("sun", false, -10), "dark");
  assert.equal(resolveTheme("sun", true, 20), "light");
  assert.equal(resolveTheme("lamp", true, 20), "lamp");
});
const luminance = (hex: string) => {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
};
test("all primary, secondary and action text pairs meet AA contrast", () => {
  for (const [name, t] of Object.entries(themes)) {
    for (const [fg, bg] of [
      [t.textPrimary, t.bg],
      [t.textSecondary, t.bg],
      [t.textPrimary, t.surface],
      [t.textSecondary, t.surface],
      [t.textOnAccent, t.accent],
      [t.textOnAccent, t.accentPressed],
    ]) {
      const a = luminance(fg),
        b = luminance(bg);
      assert.ok(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) >= 4.5,
        `${name} ${fg}/${bg}`,
      );
    }
  }
});
test("solar calculations use degrees and distinguish Pune midday from midnight", () => {
  assert.ok(
    skyForDate(new Date("2026-09-24T07:00:00Z"), "pune").elevation > 50,
  );
  assert.ok(
    skyForDate(new Date("2026-09-24T19:00:00Z"), "pune").elevation < -50,
  );
});
test("sky samples and illumination remain bounded across the horizon", () => {
  for (let elevation = -90; elevation <= 90; elevation++) {
    for (const rising of [true, false]) {
      const sky = skyAt(elevation, rising);
      assert.ok(sky.stars >= 0 && sky.stars <= 1);
      assert.ok(sky.colors.every((c) => !c.includes("NaN")));
    }
  }
  for (const f of [0, 0.25, 0.5, 0.75, 1])
    assert.ok(!moonPath(f, true).includes("NaN"));
});
