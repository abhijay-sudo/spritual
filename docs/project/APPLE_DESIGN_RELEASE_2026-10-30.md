# Spritual — Apple design refinement, 30 October 2026

## Scope and decisions

The illustrated Living Manuscript remains the visual identity. This release refines the whole canonical static application: home, six collections and their source/arc pages, English/Hindi reading, Today, Quiet moment, Saved, character pages, and utility pages. No framework or dependency migration, new account, tracking, payment, AI service, content publication claim, or paid-access claim was introduced.

- A shared editorial system uses warm paper, forest ink, local manuscript/Devanagari typography, quieter metadata, consistent controls and illustrated cards.
- Four destinations have a selected state. On narrow screens they become a bottom navigation bar; the wordmark and language/sound controls remain at the top. The header stays independent of the fixed dock when scrolling.
- Discovery uses one set of value choices, labeled search, collection/time selectors, and an accessible advanced-filter disclosure. URL parameters retain selections through reload; Unicode case matching and Hindi search are preserved.
- Collection, Book and Arc pages have distinct source context and actual story/scene counts. The canonical six-tier taxonomy and redirects remain intact.
- Reader turns follow horizontal input, estimate recent velocity, and settle with a critically damped spring. A moving page can be caught and reversed. Native vertical touch scrolling, pinch zoom, mouse text selection, keyboard navigation, exact scene/hash/language/save continuity and reduced motion remain available. The CSS ribbon avoids first-use shader compilation on direct input; the homepage keeps its existing timed opening.
- Contents, appearance and source dialogs retain native modal semantics while providing desktop side panels and phone bottom sheets. Direct drag, reversal, cancellation, focus recovery, contrast and transparency preferences are covered.
- Reader chrome is compact and stable when saving. Deep-linked headings clear sticky controls. An explicit Page top action returns to the current heading without an automatic scroll jump after turning a long mobile page.
- Saved pages have scene illustrations, exact resume links and reversible removal. Undo reads current storage, preserves newer saves, restores the exact record removed, and reports denied writes honestly. Toast dismissal returns keyboard focus.
- Today and Quiet moment share the same visual system. Intentional hold feedback respects reduced motion. Sound remains off until explicitly enabled.

## Verification and evidence boundaries

Local browser evidence and independent review are in `docs/qa/apple-audit/` and `docs/qa/apple-redesign/`. These screenshots are local QA artifacts, not new site assets. The review found and led to fixes for dock positioning, reader control wrapping, filter restoration, Undo races and focus recovery. Contrast scanning also found and led to fixes for the Ganesha accent and the evening-mode scene caption.

The release build enforces the existing exact content/art hashes. Story prose, source references and illustration assets were not rewritten in this design task. Existing owner-directed publication authority is retained; independent editorial/artwork review remains pending. No new reviewer approval is claimed.

Browser tests and emulated touch are not physical-device refresh-rate measurements. No 120fps, real-device usability study, screen-reader audit, or user willingness-to-pay result is claimed.

Production acceptance requires Vercel READY state, the intended custom-domain aliases, deployed commit identity, matching delivered assets, a canonical route crawl and live browser journeys. A Git push alone is not deployment evidence.

## Final local preflight

- Node: 110 passed.
- Chromium: 77 passed.
- WebKit: 76 passed, one Chrome-only CDP touch case intentionally skipped.
- Axe WCAG A/AA/2.1 AA: zero reported violations across 15 representative routes plus the mobile evening reader at its largest text setting. This is automated scanning, not complete accessibility certification.
- Release build: 276 canonical routes, 12 stories, zero schema issues, existing owner-directed release gate passed.
- Generated-file audit: 461 HTML files, zero failures.
- Independent visual review: English/Hindi at 390 and 1440, with additional 320px checks; midpoint page curls and sheet drag/reversal inspected.
- No external service or package dependency was added. Existing untracked work was excluded from the release commit.
