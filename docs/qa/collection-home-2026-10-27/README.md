# Collection-first homepage and bookshelf — 27 October 2026

Implemented locally in `/tmp/spritual-welcome-release-20261024`, branch `codex/ramayana-semi-animated-20261026`, reusing port 4194. No deployment, new story prose, generated artwork, prices, billing or native release.

## Observed problem and result

- The homepage mixed six short-story previews, and `/books/` foregrounded the older ten-story journey while the 28-chapter preview sat behind a small secondary link. Both entry pages now show distinct Ramayana, Krishna, Shiva and Dhruva volumes with actual counts.
- Selecting Ramayana lands directly on `#chapters`, with all 28local chapters in Kanda order, plus All collections and language navigation. The public build instead provides contents for the 10established journey retellings and 3related moments. Krishna, Shiva and Dhruva each lead to their existing single-chapter contents. Reader endings and back links stay inside that collection. The 16originals remain searchable at `/books/stories/`; old reader URLs and explicit bookmarks survive.
- The fullscreen welcome was injected only into `/`. Its DOM and runtime now support `/books/` and `/hi/books/` too. Existing eight single-portrait→book→welcome→hero sequence is preserved, with immediate skip, per-eligible-visit playback, hash/reduced-motion bypass, optional static replay and media-error recovery. No welcome is inserted into contents or reader routes.

## Verification actually performed

- Both `node website/build.mjs` and `node website/build.mjs --welcome-preview --collection-preview` passed.
- `node --test website/tests/*.test.mjs website/collections/ramayana/*.test.mjs`: 109passed. Projection checks still scan every draft paragraph in both languages and prohibit draft reader/art routes in ordinary public output; they allow only the newly introduced public contents route.
- Chromium website journeys: 65unique checks passed across the final 41-case app/reader/delivery/trust run and 24-case collection/premium/paper run. Includes keyboard, touch-style input, actual chapter navigation, EN/HI, saved-page consent/reload/remove, denied storage, no-JS, unavailable images/scripts, reduced motion, immediate chapter visibility, focused return and responsive delivery.
- Installed Chrome Ramayana collection suite: 25passed, including all 56bilingual chapter routes, cross-chapter continuity and reversible paper turns. Reader behavior was not rewritten in this change.
- Installed Chrome welcome suite: 31passed initially; 2stale pre-book-era effect-count assertions were corrected after inspecting the 32effects and both reruns passed. Synchronization, exactly one visible portrait, stalled-main-thread, history-race and cancellation checks remain. Thus 33unique welcome cases passed; this is not a claim of one clean 33-case run.
- Static link audits: `navigation.json` (local 309 HTML pages, 98 expected reading/library routes reachable) and `navigation-public.json` (253 HTML pages, 42 expected routes reachable) each have 0failures. Scope is generated links/fragments/assets/CSS, not external source availability.
- Actual screenshots inspected at 320, 390, 768, 1440 CSS px. IAB additionally used for real fullscreen playback, handoff, cover hover, desktop collection selection, mobile Shiva contents and direct mobile Ramayana contents. Deferred images were scrolled into view and confirmed decoded before final full-page captures; screenshot creation alone was not counted as review.
- Publication preflight remains correctly blocked at unchanged text revision `7d2503c2eca5f1d2`, fingerprint `9c9c73e72b1e1552c5ef1c300122cd4605a380b87a308c4ea19a5111fadd9380`. Named source/Hindi/sensitive-passage/art/rights/owner reviews remain pending.

## Visual evidence

- Before: `before-books-desktop.png`, `before-books-mobile.png`.
- Revised: `shelf-1440.png`, `shelf-390.png`; viewport detail `collections-desktop.png` and `chapters-mobile.png`.
- Additional local captures: `shelf-320.png`, `shelf-768.png`, homepage and bilingual contents at all four widths. These are local artifacts, not production evidence.

No physical iPhone/Android device or new WebKit run, conversion lift, subscription readiness, accessibility certification or frame-rate result is claimed by this turn. Tests were sequential; the existing server and user storage were preserved. Failed initial test assumptions (three folios versus three paragraphs, old modal routes, hidden screenshot targets,27 versus 32 welcome effects) were investigated and corrected without bypassing product checks.
