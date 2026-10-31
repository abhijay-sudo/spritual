# Ramayana collection — executed local QA, 26 October 2026

Base checkout: detached `2211a6e` in `/tmp/spritual-welcome-release-20261024`. Reused the existing loopback 4194 server; no second watcher, service installation or production deployment. Scope is the website book reader. Native application packaging and billing are unchanged.

## Result

22 bilingual chapters, 88 reading scenes, 8,674 English narrative words, 91 distinct source-reference URLs and 34 distinct paintings. Text revision **466e7b922eec89f7**. It is a bounded abridgement through the return in Yuddha Kanda, not every Ramayana episode or Uttara Kanda. The two research ledgers distinguish checked episode facts, original connective prose, tradition differences, omissions and unresolved review. Source-link count is not a claim that every assertion has independent scholarly validation.

The copied `review-manifest.json` pins this exact version and 102 responsive artwork derivatives with full SHA-256 hashes. Two new generated masters are 1536×1024, with full prompts and hashes in `website/collections/ramayana/art/provenance.json`. All new text/art remains pending named human review.

## Checks actually executed

| Check | Result | Evidence/limits |
|---|---|---|
| Default website production build | Passed; 242 pages + 404 | No publication performed |
| Website + collection Node suite | 90/90 passed | Includes rejected CI/Vercel/destination builds, 46-route link graph, original public prose, source/translation fields, escaping, bookmark schema and public output exclusion |
| New collection browser suite | 11/11 passed in installed Chrome, one worker | 320, 390, 768, 1440 widths sequentially; intermediate 820/1100/1180; all 44 chapter URLs; English/Hindi, larger text, sources and finite endings |
| Existing book and paper-motion browser regression | 19/19 passed | Existing sixteen books, homepage-to-book entry, touch-style swipe, keyboard/focus, history, dialogs, stored places, corrupt/denied storage, reduced motion and JS-free reading |
| Source review | Separate agent reviewed implementation; two supported issues fixed | Explicit motion choice now survives chapter/language navigation; observer disconnects on every departure |
| Manual rendered inspection | Built-in browser and opened screenshots | Mobile/desktop catalogue and reader; 320 settled turn; 390 Surasa; 768 Hindi at large type; 1440 two-leaf reader; 34-plate contact sheet |
| Motion behavior | Exercised in Chrome and recorded at 390/1440 | Finite effects settle; rapid turns clean up; toggle/reduced motion cancel; modal/offscreen lifecycle handled. No measured FPS or performance-score claim |

The first nine-test run passed. Added tests exposed a real initial paper-opening animation after restoring Motion off; initialization now cancels it. Two test assumptions were corrected without changing product requirements: browser `naturalWidth` with responsive density correction is not the encoded file width, and an unrelated existing `/stories-app/collection.js` is not this `/books/ramayana/collection.js`. The final 90 Node checks and 11 collection browser checks passed.

## Focused visual refinements

1. Combined picture controls and made content notes native disclosures to reduce the mobile preamble.
2. Restored full 3:2 image framing after a tighter crop clipped Surasa's crown. No composited double Hanuman or abduction chronology remains in the selected plates.
3. Dispatched scene synchronization before the shared reader measures scroll position, preventing image/caption changes from shifting the phone's page-turn destination. Keyboard still moves focus to the prose; pointer/swipe exposes the new painting. A bounding-box assertion protects the phone's full image entry.

## Files to inspect

- `collection-final-1440.png`, `collection-final-390.png`: actual catalogue viewports.
- `reader-final-1440.png`, `reader-final-390.png`: actual reading viewports.
- `surasa-final-1440.png`, `surasa-final-390.png`: new single-moment plate in context.
- `reading-1440.webm`, `reading-390.webm`: recorded local motion, not a benchmark.
- `hindi-large-{320,390,768,1440}.png`, `settled-{320,390,768,1440}.png`: language and page-turn inspection.
- `paintings-contact-sheet.jpg`, `paintings-index.json`: selected art inventory.

Some full-page captures show the sticky controls at the viewport's capture position; viewport captures and the running browser were also used for actual visibility checks.

## Remaining boundaries

Not verified: physical iPhone/Android, Safari, assistive-technology certification, subjective preference with participants, subscription conversion, account/billing/native integration, live deployment. Rendered Hindi coverage is not human Hindi editorial approval. Review exact prose, Hindi, sensitive episodes, rights and iconography using `website/collections/ramayana/README.md` before any public or paid release. No approval has been fabricated.
