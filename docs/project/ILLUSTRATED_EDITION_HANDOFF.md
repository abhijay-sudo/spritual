# Illustrated Edition handoff

## Current correction — 14 October 2026

The historical release below did not establish exact-version editorial or art approval. The new controlled public projection excludes twelve pending chapters, expanded maps and 35 paintings while preserving their saved IDs. The full edition remains local-review-only at `illustrated-local-review-2026-10-13.1`; `--sanatan-release` now fails closed. See [MANUSCRIPT_SANCTUARY_HANDOFF.md](MANUSCRIPT_SANCTUARY_HANDOFF.md) for current tests and the Vercel access blocker. Historical test/release results below are not current production readiness.

## Historical implementation record

Last updated: 13 October 2026
Branch: `codex/sanatan-reading`
Starting HEAD: `a5bbbe49c167f99da784676f47c681bcc808fc33`
Tested release revision: `illustrated-public-2026-10-13.1`

## Persistent checklist

- [x] Pack, superprompt, historical audit notes and acceptance checklist read.
- [x] All three supplied reference photographs inspected at original resolution.
- [x] Existing branch, HEAD, deployment boundary and dirty work revalidated and preserved.
- [x] Full discovery → journey → story → reader → source → continuation → save → language → exact-resume slice implemented.
- [x] Home, story catalogue, three collections/journeys, 22 overviews, 22 readers, characters, Saved, Today and source archive connected.
- [x] A continuous, explicitly abridged 22-chapter Ramayana path reaches Rama's return without cycling; every chapter boundary carries cause, context or the open question forward.
- [x] Twelve new bilingual connecting chapters add the missing narrative bridges while preserving the ten existing reviewed retellings.
- [x] Thirty-five distinct active paintings generated and inspected: one opener for every chapter plus thirteen additional narrative plates for the ten existing chapters.
- [x] Responsive art variants generated at 640/960/1280 and registered with bilingual alt/provenance.
- [x] Bilingual alias search, parallel reading, explicit journey endings and interruptible/reduced motion implemented.
- [x] Ordinary public build proven independent of local-review art and routes.
- [x] Exact 22-chapter bilingual editorial packet and review matrix generated locally.
- [x] Browser-inspected English/Hindi desktop and 390 px reader slice.
- [x] Automated widths 320, 390, 768, 1024 and 1440, themes, enlarged text and parallel reading.
- [x] Final ordinary build, repository typecheck, audited app build, 36 website tests, 160 shared tests and eight recorded browser acceptance journeys passed.
- [ ] Exact-version editorial/art approval: the general 13 October deployment request did not establish this.
- [ ] Independent scholarly/editorial certification for the twelve connecting chapters.
- [ ] Independent iconographic or legal rights opinion for the 35 generated paintings.
- [x] No active painting is missing; each of the twelve new connecting chapters has its own scene-specific opener.
- [ ] Participant usability study and field-performance evidence.

## Evidence

The accepted browser suite writes full-page PNG evidence to ignored `artifacts/illustrated-edition/evidence/`:

- `home-1440.png`
- `reader-320.png`
- `reader-390.png`
- `reader-768.png`
- `reader-1024.png`
- `reader-1440.png`
- `reader-sita-1440.png`
- `reader-hi-exile-390.png`
- `test-results/website/illustrated-the-full-abrid-87f53--and-stops-after-the-return/trace.zip` (replayable 22-chapter browser trace)

The acceptance spec also covers the complete Hanuman path and finite ending, bilingual aliases, immediate save, language-preserving semantic resume, rapid interrupted page turns, reduced motion, denied/corrupt storage, Undo, multitab storage events and missing-asset responses.

Final local verification on 13 October 2026:

- ordinary public build: 152 pages plus 404; no Illustrated Edition assets, routes or draft copy
- illustrated release build: 218 pages plus 404; release-boundary check passed
- website Node suite: 36/36 passed
- shared repository Node suite: 160/160 passed
- TypeScript: passed
- focused Illustrated Edition Chromium suite: 8/8 passed in one worker, with a retained trace for every case
- manual browser inspection: 1280 px English sensitive chapter, 390 px Hindi connecting chapter, no horizontal overflow or console warnings/errors

The active package contains 105 responsive local-review JPEG variants for 35 paintings: 21,008,319 bytes of JPEG data (average 200,079; range 77,858–373,071 bytes) and about 24 MB on disk. The guarded preview contains 366 files and occupies about 53 MB; key generated HTML is 96,389 bytes for home, 194,172 for the full journey, and 185,894 for the sensitive Sita reader before transfer compression. Ignored originals occupy about 130 MB because working-history images are retained. These are development payload measurements, not field-performance, customer-device or release-readiness claims.

## Editorial matrix summary

All ten existing public retellings retain their prior owner-recorded review state. The twelve connecting chapters, every new illustration, all new journey bridges and expanded source maps do not inherit that named review; the general deployment instruction did not supply their exact-version approval. The generated packet includes at least three substantive narrative scenes in both languages for every chapter, not only framing and locators. It explicitly keeps the Ahalya variant boundary, Vali's objection, Sita's agency during abduction, the cost of war and Sita's public ordeal open to ethical and traditional plurality. Linked renderings remain provenance witnesses only, not republished source text or an independent rights clearance.

## Next command

```sh
cd /Users/abhijay/Documents/Codex/2026-10-11/task-2/spritual-sanatan-illustrated-20261011
node website/build.mjs --sanatan-preview
```

The former release check intentionally fails closed. Use the current handoff for the ten-story public projection; no full-edition publication is cleared here.
