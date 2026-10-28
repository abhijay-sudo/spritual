# Living Manuscript motion release — 28 October 2026

## Implementation
- Shared `PaperEngine` in website/experience/paper-engine.js. WebGL2 GLSL cylinder curl on a 64 by 16 subdivided surface; gutter shading and 8% reverse print-through. The visible HTML book and semantic prose remain in the DOM; GPU rendering exists only during a turn. Eighteen bent CSS strips provide the no-WebGL/Save-Data fallback. Slow RAF sampling downgrades GPU to strips, then crossfade. No render loop at rest.
- Independent empty desk plate and manuscript illumination. Home and the featured reader use the same illustration. Page two is selectable bilingual HTML, with Spritual as its running head. Mobile prioritizes a single page at 52vh.
- External synchronous arrival-init.js prevents open/closed flash; watchdog reveals content even if the module fails. First visit expires after 30 days. No-JS gets the final book. Reduced-motion home uses only a short opacity reveal; reduced-motion reader changes immediately.
- Skip: Escape, Enter, click book, scroll/wheel, swipe; 280ms fast-forward. Replay is at the foot of the home page. Audio is opt-in, remembered, unlocked by a user gesture; synthesized brief paper/settle noise only.
- Existing reader state, hashes, bookmarks, language behavior and source links remain. Arrow keys, Space, swipe/drag and edge taps turn. Turns do not call scrollIntoView. Chrome fades after 2400ms idle and returns on pointer/focus/key interaction. Evening theme remains.
- 240ms same-origin cross-document view transition on the named manuscript object, where supported. Ordinary navigation remains the fallback.
- UI floor 13px, 17px mobile body / 19px desktop; brand subtitle 11px. Solid cloth-gold CTA, 90ms press. Desktop header 72px. Mobile needs two rows (approximately 96px) to preserve four visible links and 44px targets; it is intentionally not squeezed to 72px.

## Shipped timings
Arrival 700ms; page turn 1100ms; room reveal 240ms with 60ms stagger; finish by 2200ms watchdog; skip 280ms; navigation 240ms; chrome idle 2400ms.

## Verification
- 90 Node tests passed.
- 13 existing reader browser tests passed (including saved places, keyboard, Hindi, no-JS, 320–1440px).
- 15 motion/browser scenarios passed, plus the cold throttled-4G case: opening observed 2110–2119ms at 390, 768 and 1440; 2202ms with simulated 150ms latency / 1.6Mbps down / 4x CPU slowdown (timer scheduling jitter). Skip inputs, repeat/expired visits, blocked storage, reduced motion, no-WebGL, Save-Data, forced <50fps and context loss exercised.
- Static navigation audit: zero failures.
- Screenshots in docs/qa/paper-rest-* and paper-turn-* inspected.

These are Chromium emulation results, not physical-device FPS, Safari validation, or a Lighthouse performance guarantee. The WebGL effect is a turning mesh over a semantic DOM spread, not a permanently rendered 3D scene. No new story text or content-review claims were added.
