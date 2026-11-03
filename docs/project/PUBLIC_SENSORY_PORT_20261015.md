# Public sensory port — 15 October 2026

## Scope and authority

The owner requested the eligible changes be made live. Work starts from verified public commit `24bd769b3c83df0363ebaa1f46fac3e8301cee1d` in this established production working copy, on local branch `codex/sanatan-reading`. The release destination is the existing GitHub `codex/public-website` branch, via an explicit repository URL; the local `origin` is intentionally unchanged.

This is a code-only port, not a merge of the separate lamp-and-pothi tree. Existing public text, language pairs, approved collection artwork, URLs, storage schemas, Sankalpa, parallel reading and publication gates remain authoritative. No package, model, plugin, backend, tracking or deployment configuration changes.

## Compact checklist

Latest checkpoint: the frozen candidate passed **50/50 unit checks**, **122/122 Chromium checks** (no skips/retries), **216 layout/theme/enlarged-text cases**, and **96 automated WCAG A/AA audits with zero violations** (not a conformance certification). The final full suite includes the actual-doubled-text/caption regression. No push/deployment is asserted by this preparation document. Public HTML, assets and content data remain byte-identical to the baseline; only four shipped CSS/JS files differ.

- [x] Revalidate HEAD, branch, dirty state, applicable instructions and scripts.
- [x] Build the unchanged 206-page public projection; capture/open EN/HI baseline screenshots.
- [x] Measure baseline overview, EN reader and Hindi reader sequentially with Lighthouse.
- [x] Port print mats, restrained static light, readable reflection framing, small-screen masthead sizing and bounded/interrupted reader motion.
- [x] Remove delayed navigation scroll race while retaining semantic anchors and existing Save behavior.
- [x] Build candidate; 50 unit checks pass.
- [x] Full existing browser suite plus new interruption regressions.
- [x] EN/HI responsive, 200% text, keyboard, reduced motion and all six themes.
- [x] Byte-level public HTML/assets comparison and measured candidate Lighthouse.
- [ ] Scoped commit, normal fast-forward push, exact-SHA deployment and live verification.

## Preservation and deferred approval

All dirty files recorded at entry are outside the website source and remain untouched. The five already-dirty contextual-world screenshots were copied into the before-evidence folder before browser testing. Existing installed dependencies are reused through an ignored `node_modules` symlink; nothing was installed.

The separate review packet remains at `../sensory-evidence-20261015/RECONCILIATION.md`, `approval-strings.md` and `approval-inventory.json`. It is not a public asset. New wording/translations, the family prompt, narration/drone interface, private journal/edition features, pothi/relic derivatives, colophons and pending narrative paintings/connecting chapters are **not shipped or approved by this port**. Existing exact-version approvals are not extended.

## Evidence

External evidence root: `/Users/abhijay/Documents/Codex/2026-10-11/task-2/public-port-evidence-20261015/`.

Lighthouse 12.8.2, simulated mobile, one sequential run per route per revision, using the same uncompressed loopback server (local lab, not field data):

| Route | Performance before → after | LCP before → after | CLS before → after | Candidate transferred bytes |
| --- | --- | --- | --- | --- |
| EN overview | 68 → 68 | 7056 → 7054 ms | 0 → 0 | 1,072,961 |
| EN reader | 66 → 67 | 7205 → 7203 ms | 0.03575 → 0.03575 | 1,075,203 |
| Hindi reader | 66 → 67 | 7205 → 7204 ms | 0.03541 → 0.03541 | 1,091,594 |

Accessibility and best practices: 100/100 before and after on all three. TBT: 0 ms throughout. The tiny score/timing differences are not evidence of a meaningful speed improvement. Existing mobile payload/LCP debt remains; the loopback server does not model production compression or field usage.

`candidate-integrity.json` records 259 output files: 255 unchanged, including all 207 HTML files, all artwork, content data, fonts and deployment entry scripts. Only `manuscript.css`, `manuscript.js`, `reading.js` and `recovery.css` differ. Their combined increase is 8,367 raw bytes / 2,263 gzip bytes. The upright reflection treatment also avoids an italic-font request on the measured reader routes; no font asset was removed.

Frozen shipped-file fingerprint: `45839eb0bba53b359a114ca59dd5a82e23cd81a19f5d2d35fe5c3c6fcada81f8`.

`local-interaction-trace.zip` and `local-flow.json` record 14 successful checks: discover → overview → source → read/save → quiet minute → Hindi → exact return → Saved/Undo → forward continuation. The saved departure offset for `gift-2` was 0.2010416667; returned Hindi offset was 0.2009214744. Paragraph bookmarks retain their existing distinct paragraph-start contract; no storage schema or consent behavior changed.

## Visual fidelity and copy ledger

| Comparison | Result |
| --- | --- |
| Logo and local Cormorant/Tiro/Jakarta fonts | Preserved |
| 360px bilingual header tools | One row at normal text; deliberate wrapping at narrower/enlarged sizes |
| Overview | Existing parchment retained; false center gutter removed; double-hairline print mat around identical artwork |
| Reader | Same 42rem column, semantic blocks, drop cap and parallel controls; quiet static light and restrained frame |
| Reflection | Thin rules and upright, readable text replace the oversized oval; source distinction unchanged |
| Motion | Native navigation commits immediately; 420ms decorative turn and 500ms reveals cancel on input, hiding, navigation or reduced motion |
| Enlarged text | Real glyph sizes doubled, overflow clipping removed for assertions; hero caption grows intrinsically instead of clipping its CTA |
| Theme contrast | Existing ink/muted tokens replace low-contrast accent text; palette tokens unchanged |
| Public copy | Zero HTML/content-data changes; no new visible strings or review claims |

Opened before/after screenshots include the story overview and reader at 1440, compact Hindi masthead at 360, enlarged Hindi at 360, dark and enlarged reader at 320, plus the matrix captures for responsive verification. Captures at 320/390/768/1024/1440 and breakpoint checks at 349/350, 620/621, 959/960, 979/980 are saved under `matrix/`. Automated checks use Chromium; they are not physical-device, Safari or participant tests.

## Changed files and release boundary

Runtime changes: the four CSS/JS files above. Regression coverage: `website/tests/public-sensory.spec.ts`. Documentation: `website/README.md` and this scoped handoff. Unrelated dirty app/database/editorial files and five dirty screenshot files are preserved byte-for-byte; none belongs in the release commit.

The first broad sweep exposed and corrected inherited theme-label contrast and 200%-text overflow. Manual screenshot review then caught vertically clipped hero copy that a horizontal-overflow assertion missed; a dedicated caption-bounds regression now guards it. The public review/rights gates were never relaxed to pass a test.

Remaining limits: pending editorial/art approval items listed above; pre-existing mobile performance debt; no direct Vercel logs/observability access. Release confirmation must use the exact GitHub commit's Vercel status, live byte comparison and live interaction trace. The existing Git route is authorized; do not substitute a new project/team or merge the lamp tree.

Next step: commit only the seven scoped files and use the existing normal fast-forward Git route. Record the resulting SHA and live checks in the external evidence folder; no successful deployment is implied by this document alone.
