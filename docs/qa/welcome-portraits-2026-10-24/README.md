# Unframed portrait welcome — 24 October 2026

## Scope and decisions

Remove the rejected oval and curved floor framing, replace soft shared artwork, and polish the existing homepage opening. A simple enlargement of the old sheet was rejected because it cannot add detail. The selected approach gives each deity an individual, richly detailed portrait, preserves the warm paper/forest/gold brand, and retains immediate access to the actual site.

The source resolution is honestly documented: **941×1672 per generated portrait**, not native 4K. Requests for 2160×3840 returned smaller images. The rendering is bounded and uses responsive assets without upscaling the masters. A 3840×2160 viewport test verifies layout/source density; it is not evidence of native 4K artwork. See `website/welcome-preview/ARTWORK.md` for prompts, provenance and measured delivery sizes.

## Visual comparison ledger

Baseline `../welcome-2026-10-24/rama-390.png` and revised `rama-390.png`/`rama-1440.png` were opened with view_image in the same review. Chrome extension playback was inspected at desktop and phone sizes. The generated Rama source is the portrait style reference; no new page structure or branding is introduced.

| Point | Baseline | Revised and inspected |
| --- | --- | --- |
| Framing | Oval arch, curved floor line | Both removed from markup, CSS and animation logic; open paper composition |
| Artwork | Four subjects share 2172×724 | Four separate 941×1672 masters; much finer faces, fabric, jewellery and edges |
| Hierarchy | Figure sits within a decorative ring | Larger figure with quiet Devanagari behind; English/Hindi caption and stable Enter control |
| Motion | Quick scale/fade with arch expansion | Finite 14px arrival, gentle portrait drift/scale, slightly delayed caption, softly settling welcome and passing daylight |
| Pacing | Configured 2.94s | 3.4s gives the detailed portraits a brief settled moment; skip/scroll/swipe remain immediate |
| Branding/copy | Original mark, paper/forest/brass, Fraunces/Manrope/Tiro | Preserved; no visible copy added, removed or reordered |
| Responsive delivery | Same sprite at every density | One 840/1280/1672px WebP per portrait; actual currentSrc checked at phone DPR3 |

## Verified locally

- Public and loopback-preview builds passed: 242 pages plus 404 each.
- **75 Node checks passed**, including encoded PNG/WebP dimensions, hashes, exact public asset allowlist, max-selected 1.5MB budget and later-portrait failure recovery.
- **22 installed-Chrome welcome tests passed**: complete journey, keyboard, Enter/Escape/wheel/touch, repeated input, no-JS, reduced motion, visibility changes, missing/slow/later-image failure, session storage, fullscreen at 320/390/768/1440, phone DPR3 and 3840×2160 layout.
- **13 homepage and introduction browser cases passed**, including actual story/book navigation, both languages, touch and native scrolling.
- Focused TypeScript and JavaScript checks plus scoped whitespace check passed.
- Screenshots use a controlled clock and settled animation state for composition; real-time tests and a phone recording exercise actual playback separately. No frame-rate, conversion or physical-device/Safari claim.

The test source contains the actual checks. Publication status is recorded separately after live verification. Existing app download and subscription availability is unchanged.
