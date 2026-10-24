# Site polish and loading audit — 24 October 2026

## Scope and observed baseline

Owner requested less sluggishness, a broader famous-deity opening and greater confidence in the website. Existing website publication authorization applies; no app-store release, paid subscription, provider, account, analytics or new story-corpus release is included.

Chrome desktop/mobile inspection showed a coherent accepted paper/forest editorial layout worth preserving. Three supported gaps:

1. The opening downloaded all four portraits concurrently and left unfinished requests alive after its deadline. A cold simulated mobile run took 14.741 s to finish the hero painting; native lazy loading also fetched distant story cards.
2. Four individual portraits consumed 3.4 s before entry. The repeated sequence felt disproportionate to its content. The current opening includes eight distinct figures in four paired compositions, finishes in 2.8 s, and keeps immediate entry.
3. A story's strongest action led to an unavailable app. The actual matching book link was below the story prose; privacy guidance pointed only to legacy saved-reading controls.

## Implementation

- Eight generated decorative portraits, original source masters preserved and metadata/hash-pinned. All largest delivered variants total 1,342,938 B, below the existing 1.5 MB budget. No native 4K, scholarly or iconographic approval claim.
- Shared compositor timeline, bounded lateral/vertical arrival and drift, no rings or particles. Reduced motion, section links, early input, Escape, touch/scroll, repeated navigation and queued-close recovery remain supported.
- The useful hero has priority before optional welcome downloads. The shared 900 ms deadline cancels pending requests and prevents a late hero from starting new downloads. Manual replay retries.
- Source-preserving responsive derivatives for homepage, bookshelf and book art. Offscreen cards/landscapes use one viewport observer; the interactive phone initializes on approach. A no-JavaScript image fallback retains the illustrated reading path. Dynamic modal/scene source selection remains responsive.
- Shared Fraunces URL avoids a duplicate font download when entering books. Removed unused fan geometry and the sticky header blur; an opaque paper header prevents text from showing through the logo.
- Continue reading opens the corresponding complete English/Hindi book. Availability offers the real bookshelf. About/Privacy/Corrections explain source notes, optional browser-local page keeps and the visit-only sample notebook.

## Visual comparison ledger

The accepted reference is the existing published editorial design and current generated portrait art, not a newly invented brand. Chrome captures were opened with the image viewer.

| Point | Review and correction |
| --- | --- |
| Branding / palette | Sunrise mark and forest/paper/brass retained. No black-theme or generic feature-grid substitution. |
| Typography | Fraunces headline, Manrope controls and Tiro Hindi retained; deity labels are native text and remain readable at 320 px. |
| Composition | Two isolated figures occupy each spread without overlapping figure boxes. No circle/oval frame. Eight subjects fit the shorter timeline. |
| Image quality / crop | Original paintings remain unchanged. Derivatives are selected with crop-aware sizes; deferred artwork has layout space and a no-JS fallback. |
| Primary action | Existing hero action preserved; modal footer now leads to actual reading. No unconfigured store/checkout claim. |
| Spacing / navigation | Inspected 320/390/768/1440 widths. Opaque sticky header corrected text ghosting; footer links wrap and dialog action fits narrow phones. |
| Motion | Composition captures sample paused frames; real playback/rapid-input tests and recordings separately check behavior. Static screenshots do not prove smoothness. |

Intentional visible-copy changes: stronger actual reading action, accurate availability/About copy, Privacy/Corrections links, added deity labels. Hero headline, narrative prose, sources, routes and logo are unchanged.

## Verification

- Dependency-free production build: `node --no-addons website/build.mjs` passed, 242 pages plus 404. The preview build passed too. The image adapter uses verified precomputed WebP assets and Node built-ins; deployment does not install Sharp.
- 80/80 Node/output tests passed. 31/31 installed-Chrome welcome cases passed, including production CSP playback/cancellation, image failure, slow hero, every-visit/history replay, rapid input, hidden page, reduced motion, 320–3840px composition and high-density phone selection.
- The complete general suite passed 166/167 initially. Its one failure was an early negative visibility assertion that raced image decoding; it now explicitly waits for opening and completion before testing native scroll. All 39 focused cases passed afterward, including that case, both script-failure fallbacks, no-JS images, image errors, bilingual preview→book navigation, source notes, consent-based kept pages and privacy controls. Final clean-checkout CI is recorded in the deployment evidence.
- Chrome captures reviewed at 320, 390, 768 and 1440 CSS pixels. Real playback recordings: `journey-390.webm` and `journey-1440.webm` (local). Captures include the four-pair composition, welcome handover, homepage, story collection and dialog. Desktop dialog art and the narrow sticky-header correction were reinspected after changes.
- Installed-Chrome frame sampling over the 2.8-second opening: 168 desktop / 167 mobile-width intervals, median and p95 16.7ms, no intervals over 34ms and no observed opening long tasks. This is local timing evidence, not a frame-rate guarantee on other hardware.

### Measured loading comparison

One cold local run before and after, installed Chrome, 390×844 at DPR2, 100ms added latency, 1.5Mbps download and 4× CPU slowdown. Cache disabled. Bytes are completed resource transfer sizes at hero-ready plus one second; this is not a full-page weight or field Core Web Vitals study.

| Measure | Before | After |
| --- | ---: | ---: |
| Main painting response complete | 14,741ms | 3,660ms |
| Last observed LCP at checkpoint | 14,764ms | 3,684ms |
| Completed resource bytes at checkpoint | 2,481,248 | 612,523 |
| Observed CLS | 0.0003105 | 0.0003105 |

This constrained run bypassed the optional opening after its deadline and kept reading usable. Normal local visits played the complete opening. The measured painting time improved by about 75%; real visitor/device results remain unmeasured. Raw data: `before.json`, `after.json`, `motion-sample.json`.

No user conversion study, physical-phone Safari test, accessibility certification or subscription-revenue result is claimed. App/store links and paid subscriptions remain unavailable; no fabricated checkout is shown.
