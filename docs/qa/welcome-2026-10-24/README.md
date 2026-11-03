# Fullscreen welcome — Chrome QA, 24 October 2026

The owner requested Chrome desktop/mobile inspection, a fullscreen lively refinement and publication after QA. The scope is the existing deity opening; story text, app, backend, pricing, store availability and unpublished content remain unchanged. The earlier browser-policy limitation was resolved for this turn by authorized Chrome access; it does not describe this verification.

## Implemented

The selected composition expands the figures and arch to fill the viewport, retaining paper, forest and brass; the existing sunrise mark and bundled Fraunces/Manrope/Tiro remain. Large decorative Devanagari names, finite portrait scale and a warm moving light provide depth. Separate exits/entries prevent intentional combined deity ghosts. The brand reveal dissolves into the actual homepage with no backdrop-blur snap.

- Rama → Shiva → Krishna → Hanuman → welcome → homepage. Configured total: 2.94 seconds; a deterministic runtime test verifies the timeline. No measured frame-rate claim.
- Native Enter and Escape, scroll/swipe dismissal, restored focus, session-only autoplay and explicit replay. Deep links/return navigation bypass; reduced motion bypasses automatically and uses static manual replay.
- A 900ms artwork deadline and bounded watchdog preserve usable content; missing script/media, denied storage, hidden pages, interrupted playback and repeated input cannot strand a modal.
- The unchanged generated artwork is now a 397,350-byte WebP, down from a 1,400,086-byte PNG (about 72% smaller). The source PNG and release record are excluded from deployed assets. Exact artwork hash is checked by the build. Owner publication authorization is recorded without inventing an independent iconographic review.
- Native scroll feedback on the home scene remains intact after the opening. The regression test now waits for that explicit handoff; a separate test verifies wheel dismissal and subsequent native scrolling. Touch swipe dismissal is also exercised.

## Actual inspection

Chrome extension session: “✨ Spritual welcome QA”. Inspected real animated playback at 1440×900 and 390×844, including distinct deity phases and brand reveal. Manually completed keyboard entry → Find your story → Krishna story → Hindi → the actual Hindi book. Captured and opened settled compositions at 320, 390, 768 and 1440 CSS pixels. The responsive tests also assert the opening's bounding box equals the entire viewport, rather than merely fitting inside it.

The screenshots deliberately finish the current Web Animation under a controlled clock to show settled composition. They are visual evidence, not proof of animation cadence. The real-time journey, Chrome session and phone recording exercise running choreography separately.

## Verification

- Isolated public release base: `a21ddfa4da0b6d413ceb19d06063c98864e41f49` (`origin/codex/public-website`). No merge from the app development branch.
- Public and local-preview builds: 242 pages plus 404 each.
- `node --test website/tests/*.test.mjs`: **72 passed**, no failures/skips.
- `WELCOME_CHROME=1 ... website/welcome.playwright.config.ts`: **19 passed**, using installed Google Chrome. Includes desktop/phone journey, touch, keyboard, fullscreen bounds, short landscape, both languages, repeat/skip, motion preference changes, slow/failed assets, denied storage and no JavaScript.
- JavaScript syntax and focused TypeScript checks: passed.
- Main website regression: **156 passed** in the final complete rerun (4.5 minutes), no failures or skips. The initial run exposed the scroll/handoff test; gesture exit was added and that behavior plus the full suite were reverified.
- Existing broader reader checks cover doubled text, saved place, source notices and normal reading behavior. Physical phones, Safari, a measured performance score and subscription conversion are not verified by this work.

## Evidence

`rama-320.png`, `rama-390.png`, `rama-768.png`, `rama-1440.png` and the matching `welcome-*.png` files are current settled Chrome captures. `mobile-journey.webm` records the actual opening followed by touch/Hindi/landscape interactions; it is not a promotional render. The original smaller framing is in `../welcome-2026-10-23/` and is historical evidence only.

The app invitation still reports coming soon. No subscriptions, real store links or conversion uplift are claimed. Publication status and exact deployment verification belong in `DEPLOYMENT.md` after deployment.
