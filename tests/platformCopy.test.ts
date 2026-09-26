import assert from "node:assert/strict";
import test from "node:test";
import { platformCopy } from "../web/src/lib/platformCopy.ts";

test("web copy remains verbatim, including browser recovery instructions", () => {
  const en = "Unable to clear browser storage. Please clear site data in browser settings.";
  const hi = "ब्राउज़र संग्रह नहीं मिटा सके। ब्राउज़र सेटिंग में साइट डेटा मिटाएं।";
  assert.deepEqual(platformCopy(en, hi, false), [en, hi]);
});

test("native reflection consent names the app and preserves shared-device disclosure", () => {
  const [en, hi] = platformCopy(
    "Save this reflection in this browser. Anyone using this browser may see it.",
    "unused web Hindi",
    true,
  );
  assert.match(en, /this app/);
  assert.match(en, /Anyone using this app on your device may see it/);
  assert.match(hi, /आपके उपकरण पर इस ऐप/);
  assert.doesNotMatch(`${en} ${hi}`, /browser|ब्राउज़र/i);
});

test("native deletion recovery points to app settings instead of browser site data", () => {
  for (const message of [
    "Could not remove saved data. Clear site data in browser settings.",
    "Unable to clear browser storage. Please clear site data in browser settings.",
  ]) {
    const [en, hi] = platformCopy(message, "unused web Hindi", true);
    assert.match(en, /app’s settings on your device/);
    assert.match(hi, /उपकरण की सेटिंग/);
    assert.doesNotMatch(`${en} ${hi}`, /browser|site data|ब्राउज़र|साइट डेटा/i);
  }
});

test("native storage copy retains consent and app-encryption limits without blocking explicit sharing", () => {
  const [en, hi] = platformCopy(
    "Progress and preferences are saved in this browser. Reflections are saved only when you choose. Nothing is uploaded. Other people using this browser may see saved entries; they are not encrypted.",
    "unused web Hindi",
    true,
  );
  assert.match(en, /only when you choose/);
  assert.match(en, /Spritual does not upload your saved entries/);
  assert.match(en, /device backups may include them/);
  assert.match(en, /Browser data does not transfer into this app automatically/);
  assert.match(en, /app does not encrypt them/);
  assert.match(hi, /आपकी अनुमति/);
  assert.match(hi, /बैकअप में यह शामिल हो सकती है/);
  assert.match(hi, /ऐप इसे एन्क्रिप्ट नहीं करता/);
});

test("native draft copy does not imply an operating-system close warning", () => {
  const [en, hi] = platformCopy(
    "Your draft stays while you browse. Save it before closing or refreshing.",
    "unused web Hindi",
    true,
  );
  assert.match(en, /system may close the app without warning/);
  assert.match(hi, /बिना चेतावनी/);
});

test("unmapped copy is untouched, including genuine external browser references", () => {
  for (const en of ["Open the source in your browser", "constructor", "__proto__"]) {
    assert.deepEqual(platformCopy(en, "मूल पाठ", true), [en, "मूल पाठ"]);
  }
});
