# Every-visit welcome — 24 October 2026

## Behavior and visual review

The owner requested automatic playback on every visit and smoother movement. Eligible homepage navigations, refreshes and unanchored history returns now play regardless of old seen markers or unavailable browser storage. The welcome performs no storage read/write. Anchored section links and reduced motion still bypass automatically. Back/forward navigation was exercised; the persisted-pageshow event was also simulated explicitly, which is not a claim that every browser will place this page in BFCache.

A single browser animation origin now schedules all fifteen effects. The later phase timers only label stages; they cannot restart old figure animation after a busy frame. The overlay fades in for 120ms and out for 300ms. The total remains 3.4 seconds, with immediately usable Enter/Escape/scroll/swipe cancellation. No asset, route, brand or visitor-facing copy changed.

| Inspected comparison | Result |
| --- | --- |
| Individual forest/gold artwork and unframed paper | Preserved |
| Original logo and fonts | Preserved |
| Desktop/phone portrait placement and crop | Preserved |
| Visible labels, CTA and welcome copy | No text diff |
| Figure sequence and 3.4s duration | Preserved; shared native timeline |
| Arrival and exit | Soft 120ms entrance and 300ms exit; immediate cancellation |
| Repeat visit | Now automatic; old storage markers cannot suppress it |

Screenshots at 320/390/768/1440 and 3840 are composition evidence. Chrome desktop/mobile playback was also inspected. Both baseline and revised local headless Chrome timing samples had no frame gaps above 34ms and no observed long tasks during the opening; samples are in `timing-before.json` and `timing-after.json`. The local baseline was already smooth, so these samples establish no measured regression rather than a quantified performance improvement. They do not establish physical-device or universal frame-rate performance.

## Verification

- Public and local builds: 242 pages plus 404.
- 78 Node checks passed, including every-visit/storage/cache restoration and cancellation.
- 27 Chrome welcome cases passed in the final full run. The new stall test was corrected to account for finished effects clamping to their end time; it confirms effects stay synchronized through a deliberate 700 ms main-thread stall, retain the same animation objects and never show overlapping figures. Only opacity/transform are animated.
- Focused TypeScript and JS syntax passed.
- 13 homepage/introduction cases passed. Live release evidence is recorded separately after completion.

A browser-reproduced lifecycle race was fixed: native queued `close` events from an earlier visit are ignored if the dialog has already reopened. Both VM and Chrome regression cases verify the new opening completes normally.

Tests run one worker at a time. No new dependency, server, analytics, sensitive storage, auth, provider, price, payment or corpus change. Unrelated Android and older QA edits remain untouched.
