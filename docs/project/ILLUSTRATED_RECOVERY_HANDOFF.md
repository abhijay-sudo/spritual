# Illustrated recovery — 14 October 2026

## Current checklist

- [x] Local execution restored; checkout `codex/sanatan-reading`, starting HEAD `b46b63dd0583e1ef9ddf0ff0070561421e99ede3`.
- [x] Git diff / image audit: existing source artwork is intact; all 22 opening records have 640/960/1280px local files. No reset or restoration of old commits needed.
- [x] Baseline: public theme handler replaces story pictures with the neutral SVG; 9/10 timeline images hidden; reader artwork column hidden; 400×609 Begin starts at y=617.8.
- [x] Restore eligible artwork, inline non-blocking arrival, all-card Kanda path, separate intention/tried controls.
- [x] Correct Hindi resume label, continuation layout and short-screen sanctuary controls.
- [x] Public/preview automated and visual verification; denial/corruption/multitab/Undo, no-JS, reduced motion.
- [ ] Scoped commit, ordinary fast-forward to `codex/public-website`, CI/deployment and live verification.

## Scope and visual specification

Latest complete recovery brief was supplied inline by the parent task (16:40 UTC; Library reference `libfile_74eb0fbece848191b36a7f112e363409`). Its text is read; no new download or local-byte claim is made. It supersedes the blocking arrival/masked-arch proposal. No entry overlay is being implemented.

Reuse existing static Node/native-JavaScript architecture, logo, source prose, routes, preferences and storage identities. Public build: ten eligible source-ordered retellings, not a complete continuous 22-chapter epic. The 22-chapter noindex edition and 35 new paintings remain intact for local review. No human source/art approval is inferred from this UI request.

Design references (built-in Image Gen, not public assets): `artifacts/illustrated-recovery/concepts/hero.png` and `yatra.png`. Existing approved raster paintings were input references. Use the requested parchment #FBF8F3, ink #1C1917, brass #B45309, Cormorant/Tiro editorial typography and Plus Jakarta UI; 5/7 desktop hero, artwork first on phones, stable 16:10/16:9 image frames, small non-blocking breath control. Kanda groups use 1/2/3-column illustrated cards, a numbered diya ribbon, and one finite scrolling sutra.

Intentional concept corrections: preserve the actual logo; use actual story titles, locators, summaries and practice copy instead of invented titles/Sarga values in imagegen output; omit the unrequested masked illustration above the grid; keep public counts at ten; no glowing completed practice without explicit “I tried it”. Theme art is atmospheric, not an illustration of each Ramayana event. All practice choices remain original UI invitations, not scripture or a claimed reviewed retelling.

Baseline screenshots and machine report: `artifacts/illustrated-recovery/evidence/before-{home,reader,quiet,home-mobile}.png`, `baseline.json`. Existing Browser/IAB tools are unavailable in this executor; use the installed Playwright Chromium runner, one server and one browser process at a time. Old post-deploy `live-final.json` was not recovered; parent supplies independent cloud-browser verification of b46b63d.

## Publication and handoff limits

Preserve unrelated dirty alpha/backend/editorial files. Use the existing Git-connected route only; no force push, credentials/project settings, migrations or additional service. All new paintings and connecting prose are still excluded from public output. Full 22 unique event paintings in production remains blocked on exact-version editorial/rights approval.

## Verification in progress

`node website/build.mjs`: 206 pages plus 404. `node --test website/tests/*.test.mjs`: 49/49 pass, including independent bridge intentions without modifying original anchor records, publication exclusion and retained unavailable Saved IDs. Initial focused browser pass: 7/9; failures were two test assumptions (Hindi button wording and requesting a journey that does not contain the story), corrected before the full run. Three additional regression assertions still refer to the superseded homepage structure/copy and are being reconciled, not disabled.

First rendered evidence was opened at native size: desktop arrival, Kanda cards and visible reader banner; phone arrival and Hindi 400×609 sanctuary. The Begin control moved from y=617.8 to y=414.7 English / 419 Hindi, with 48px control height. No page errors or horizontal overflow were recorded in that six-surface check. New direct mobile artwork CTA allows immediate reading without waiting for the optional breath.

All 11 image URLs referenced by the 207 public HTML documents resolve to nonempty local output files. The new pending-art folder contains all 105 variants (35 paintings); public output has zero illustrated assets. Machine measurements: `artifacts/illustrated-recovery/evidence/payload-and-assets.json`. These are file/loopback measurements, not field Core Web Vitals or physical-device evidence.

## Concept fidelity review

Both generated concepts and the actual rendered captures were opened, not inferred from source. The hero follows the parchment/brass palette, left threshold/right landscape composition, serif hierarchy, six atmosphere strip and unobstructed CTA. The implementation preserves the real Spritual logo rather than the concept's invented mark. The Kanda path follows the three-column image/card rhythm, editorial dividers and inset practice invitation. Actual source locators/titles replace the concept's invented titles and sargas. Unchosen diyas remain outlines, rather than the concept's all-lit row. The concept's masked upper-right landscape is intentionally omitted. Mobile is a one-column, artwork-first layout with a direct reading link; reduced motion keeps all content visible.

## Final public verification and measurements

- Runtime fingerprint: `a8b47348d30f252272542f17b6019946455b030434306f5c1f3352c16c1a31a4`. This hashes sorted top-level `website/*.{mjs,js,css}` filenames followed by bytes; `artifacts/illustrated-recovery/measure.mjs` reproduces it. It is not the older full-tree fingerprint convention.
- `node website/build.mjs`: 206 public pages plus 404. `node --test website/tests/*.test.mjs`: 49/49.
- `PLAYWRIGHT_JSON_OUTPUT_FILE=artifacts/illustrated-recovery/evidence/public-final.json npx playwright test -c website/playwright.config.ts --reporter=list,json`: **114/114**, 208.800 seconds, no skips/retries/flakes. Earlier run: 106/114, eight obsolete copy/DOM assertions; all corrected while retaining the equivalent behavioral checks. Nine affected checks also passed independently before the full final run.
- `node artifacts/illustrated-recovery/capture-final.mjs`: successful recorded discover → intention/try/Undo → reader → source drawer → passage/save → Hindi → sanctuary/pause → exact return → returning homepage. Zero page errors or failed HTTP responses. Trace: `evidence/verified-interaction.zip`.
- Separate `--sanatan-preview` build: 224 pages plus 404. `WEBSITE_RELEASE=1 WEBSITE_URL=http://127.0.0.1:4192 PLAYWRIGHT_JSON_OUTPUT_FILE=artifacts/illustrated-recovery/evidence/preview-final.json npx playwright test -c website/playwright.config.ts website/tests/manuscript.spec.ts website/tests/illustrated.spec.ts website/tests/practice.spec.ts website/tests/recovery.spec.ts --reporter=list,json`: **41/41**, 140.481 seconds, no skips/retries/flakes. Three initial preview fixture assumptions still modeled the old ten-anchor path; the fixtures now seed/expect the actual available 22 independent chapter choices. No runtime change was needed.
- Latest public screenshots: `final-home-1440.png`, `final-home-390.png`, `final-cards-1440.png`, `final-reader-1440.png`, `final-reader-hi-390.png`, `final-source-drawer.png`, `final-quiet-hi-400.png`, `final-return-hi-1440.png`. Target-width Hindi captures and six theme captures are in the same evidence directory. Desktop, mobile and tablet captures were actually opened, including cold-font/large-text checks and 979/980 layout boundaries in the automated suite.
- Three new runtime files total **33,359 raw / 9,873 separately gzipped bytes**. `practice-cards.js` is partly extraction of the earlier practice module, so this is not net bundle growth. Public image bindings reference only 11 existing eligible files, including logo and responsive variants. The phone hero actually selects the existing 136,866-byte `collection-ramayana-sm.webp` instead of the 467,616-byte large original.

Fresh-context 390×844 loopback measurements (unthrottled, local HTTP, one run; not field performance):

| Surface | Requests | Encoded bytes | Transfer bytes | DOM ready / load |
|---|---:|---:|---:|---:|
| Home | 29 | 1,037,100 | 1,045,800 | 73.5 / 80.5 ms |
| Reader | 28 | 771,453 | 779,853 | 53.6 / 56.6 ms |
| Quiet minute | 24 | 484,955 | 492,155 | 54.3 / 54.7 ms |

## Editorial and asset separation

| Material | State |
|---|---|
| Ten original bilingual public retellings and existing locators | Prior bounded owner-recorded review retained, text unchanged. |
| Existing atmospheric art | Eligible families restored to visible frames; not presented as unique depictions of each event. |
| Twelve connecting chapters and expanded source maps | Substantive local-review material preserved, excluded from public output. |
| 35 narrative paintings / 105 derivatives | All files present; exact editorial/iconographic/rights approval still pending. Zero included in public build. |
| Two recovery concepts | Inspected layout references only, not published story paintings. |

No missing painting files were found. Remaining release blocker for the complete illustrated corpus is approval, not file restoration. No real-device/Safari, screen-reader or field-performance certification is claimed. No dependency/model/plugin, backend, credentials, production data or deployment configuration changed. Existing unrelated work—including five prior QA screenshots—was preserved; those five files were checked byte-for-byte against the pre-run copies.

The later parent request names `spritual-site-builder`, `spritual-content-architecture`, `spritual-brand-voice`, and `spritual-qa-launch`. A complete executor skill listing and local `SKILL.md` search exposed none of them; no installation or model change was attempted. Their supplied shared guidance was reconciled as requested: one primary action, one main navigation, compact controls, quiet whitespace, concise copy, truthful device-only/availability details. No invented ten-Bala inventory, six-minute CTA, subscription capability or review badge was added. Supplemental 360/1280 six-theme EN/HI QA is recorded separately; no true design conflict blocks the scoped release.

Supplemental results: **24/24** 360/1280 × six themes × EN/HI checks passed, zero page errors (`evidence/studio-qa.json`). The 360px Krishna/Hanuman and 1280px Still captures were opened at native size. The three reconciled public practice fixtures also pass (4.515 seconds; `evidence/public-practice-fixtures.json`). Runtime remains unchanged from the 114-case final public suite.

Next: commit only `website/` and this handoff, then use the existing authorized normal fast-forward Git route. Verify exact SHA, CI/deployment and live bytes before claiming publication.
