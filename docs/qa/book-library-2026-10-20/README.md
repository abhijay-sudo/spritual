# Source-linked book reader — verification, 20 October 2026

## Delivered scope

A complete website bookshelf and book reader at `/books/` and `/hi/books/`, connected to the existing homepage. Sixteen existing bilingual readings retain their exact prose and citations: ten reviewed Ramayana retellings plus six owner-selected illustrated shorts. These are not sixteen new or non-overlapping episodes. Native app code was not changed.

The separate local research reader contains 2,755 parsed source sections across all 18 Mahabharata parvas and seven Ramayana kandas. Eight complete downloaded source files and their licences are retained. Twelve text-checked episode entry points support discovery. This corpus is not included in the public build and has no publication approval. See [research and boundaries](../../project/BOOK_LIBRARY_20261020.md).

## Evidence

- `build.log`: ordinary public build, 242 pages plus 404.
- `unit.log`: 58 tests passed, including exact prose preservation, route containment, source footnote separation and bookmark validation.
- `browser.log`: 27/27 passed in the final focused Chromium regression run (54.1 seconds). Covers the new book journey, existing homepage and finite motion. Existing four viewport reference comparisons remain included.
- `accessibility.json`: 12 axe scans, zero reported violations under WCAG 2 A/AA and 2.1 AA tags. Includes EN/HI shelves and readers, paper/evening, phone/desktop. Incomplete colour-contrast checks remain recorded; this is not accessibility certification.
- `research-integrity.log`: all 2,755 source sections retain every parsed paragraph and heading; source hashes, original licences and internal links pass. This proves import/render integrity, not accuracy of the historical transcription against scans.
- `research-browser.json`: seven checks passed for discovery, touch reading, keep/resume, next section, original source/licence, volume-note distinction and the largest imported unit at 320/390/768/1440; no JavaScript errors.

Screenshots were captured and opened for visual review. `before-*` show the prior short-modal experience; `reader-*`, `shelf-*`, `hindi-large-*` show the finished public reader. `source-reader-*` show the local source edition. Files labelled `first`, `settled`, or `initial` are development history, not final evidence.

## Tested journeys and states

Homepage → book; exact illustrated story and language from modal → reader; all 32 story/language pages and images; folio turn; contents; browser back; keyboard arrows and focus restoration; language switch retaining semantic page; explicit local keep/reload/resume/remove; blocked/corrupt storage and malformed hashes; no-result search recovery; source disclosure; paper/evening; 26px Hindi text; widths 320/390/768/1440; reduced motion; rapid repeated page input; JavaScript-disabled complete text; touch emulation. No reading history is persisted until the visitor chooses Keep this page.

## Findings corrected

1. The former primary homepage invitations reached a sample instead of standalone reading. They now reach actual book routes.
2. Mobile/tablet frontispieces crowded the text. Mobile now uses a compact illustrated title, tablet a full-width leaf; body prose uses a quiet book face.
3. Small gold index labels initially measured 4.48:1. Their colour was darkened and the 12 scans rerun.
4. The importer places volume-wide footnotes after some final narrative sections. The research reader now starts these on separately labelled Edition notes folios, preserving all original paragraphs and headings. The largest imported unit is 341 display folios including those notes, not a claim that one narrative chapter is that long.

## Limits

No physical-device, Safari, Firefox, manual screen-reader or native-wrapper verification. No claim of a frame rate or performance score. No new Hindi translation, narration, AI integration, paid access or account sync. Further exact-edition/territory rights review, named editorial review and scan collation are unresolved for the new historical corpus. Public content reuse does not extend old attestations to new source texts or research metadata. OG tags were checked structurally, not inside WhatsApp/social preview clients.

Publication and live verification, if completed, are recorded in DEPLOYMENT.md separately.
