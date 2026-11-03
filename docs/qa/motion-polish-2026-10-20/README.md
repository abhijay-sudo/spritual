# Homepage motion polish — 20 October 2026

Owner request: add polished fade-in/fade-out motion to the live Spritual introduction. The selected source, branding, artwork, copy, geometry, availability and all existing routes remain intact. No new feature, provider, dependency or deployment configuration.

## Implementation

An additive native CSS/Web Animations layer provides staged headline entrances, finite painting arrivals, filtered-result staggering, a single CTA light sweep on interaction, press feedback, language/story fade-throughs, artwork dissolves, preview transitions, supporting text movement and native dialog/backdrop entrances and exits. Root DESIGN.md records triggers, durations, rationale and reduced-motion alternatives.

State changes and native dialog.close happen immediately; no timer delays the action or focus restoration. Transient outgoing layers are inert, aria-hidden, ID-free and pointer-transparent. New reading controls do not fade. Rapid input replaces the earlier visual effect. Escape, closing, resizing, visibility changes and reduced-motion changes cancel effects. Offscreen previews skip animation. No perpetual effect, scroll interception, analytics, tracking, storage change or fabricated release availability.

All 27 imported source files still pass their original checksums. Only the root build's inclusion of the two additive assets changes. The layer is 7,244 bytes JS plus 2,705 bytes CSS; local gzip sizes total 3,277 bytes (about 3.2 KiB), not a network performance score.

## Verification before publishing

- Production build passed: 208 public pages plus 404.
- 52/52 Node tests passed.
- 14/14 focused browser tests passed: the original eight reference/interaction tests plus six motion tests. Final evidence-capture adjustment was rerun separately: 6/6 motion cases passed.
- Exact reduced-motion PNG comparisons at 320, 390, 768, 1440 CSS px still match the retrieved reference. Normal-motion captures at all four sizes were opened and visually reviewed. Mid-transition text and settled preview captures were also inspected.
- Dynamic checks cover active outgoing layers, immediate semantic language changes, no duplicate IDs, inertness, rapid scene input, Escape/focus restoration, reduced-motion changes, resizing, dialog close/reopen, no-JavaScript content and outgoing text remaining invisible while new text appears.
- Touch emulation at 390px passed story opening, Hindi, next story, close, Scenes and cleanup with zero page errors. Physical-device behavior is unverified.
- Inspection corrected a capture-phase microtask timing error, a transient text-overlap problem and an outgoing-layer fill-state problem. A regression test samples actual animation state to prevent the outgoing language flashing back.
- No FPS, accessibility certification, Safari/Firefox compatibility or conversion/hype uplift is claimed. Previously documented small-label contrast limitations in the chosen reference remain outside this motion-only change.

Evidence: release-browser.log, visual-final.log, unit.log, touch.json, size.json and the local screenshots. Deployment and CI results are recorded separately after publication.
