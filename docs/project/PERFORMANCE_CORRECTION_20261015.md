# Public story performance correction — 15 October 2026

## Scope

Base: `f52d0d055f9fb5c168d068a927aaa00d7b6e3f5b`. Local branch `codex/sanatan-reading`; authorized release destination remains `abhijay-sudo/spritual:codex/public-website`, connected to `spritual1 / spritual-website`. The local `origin` is unchanged.

The requested correction targets mobile loading of the existing English/Hindi story overviews and readers. It introduces no new design, prose, illustration, settings, backend, tracking, dependency installation or deployment configuration. All ten public stories use the same responsive delivery improvement; the ten-story projection and pending-content gates remain authoritative.

## Diagnosis and chosen fix

The actual reader LCP node is `.reader-art-frame img`; the overview's LCP is its `h1`. The heaviest artwork was 467,616 bytes and selected as a 1120px source on Lighthouse's 412px/1.75DPR mobile viewport, bypassing the existing 560px candidate. The overview downloaded that same asset while its title, fonts and CSS competed for bandwidth. Discovery is already early, from static HTML; the reader image is eager and high-priority. There is no lazy-LCP bug. All three fonts use `font-display:swap` and are preloaded. The measured unthrottled server response was about 28–96ms; the render-blocking CSS diagnostic estimated about 300ms. Reader entrance effects have opacity 1 and do not hide the image until JavaScript completes.

Chosen: delivery-only AVIF encodes, intermediate responsive sizes, accurate layout size hints, and original WebP fallback. The source composition, CSS crop, artwork files, alt text, typography and motion are preserved. Larger CSS/font architecture changes were not required for this first bounded correction and have not been made.

| Reviewed family | Previous mobile request | New 800px request | Reduction |
| --- | --- | --- | --- |
| Ramayana collection | 467,616 B | 127,864 B | 72.7% |
| Rama atmosphere | 279,594 B | 87,507 B | 68.7% |
| Hanuman atmosphere | 223,308 B | 80,817 B | 63.8% |

The offline generator pins each original's SHA-256 before encoding and never overwrites it. The normal static build copies nine precomputed delivery files with no image-library dependency. The explicit registry and budgets are covered by tests. `website/assets/GENERATED_ART.md` records encoding provenance. No pending narrative art is substituted or approved.

## Measurements

Evidence root: `/Users/abhijay/Documents/Codex/2026-10-11/task-2/performance-evidence-20261015/`.

Lighthouse 12.8.2 defaults: mobile 412×823, DPR 1.75; simulated 150ms RTT / 1638.4Kbps, CPU slowdown 4; normal JavaScript, motion and resource loading; browser cache/storage reset by Lighthouse. Runs were sequential with one browser at a time and one loopback server. Three samples per primary route, not best-of selection. JSON/HTML reports and raw trace/network artifacts are retained.

| Primary route | Live baseline score range | Live baseline LCP median (range), ms | Uncompressed local LCP median before → after, ms |
| --- | --- | --- | --- |
| EN overview | 84–85 | 4394 (4306–4402) | 7057 → 5405 |
| Hindi overview | 84–85 | 4389 (4379–4403) | 7056 → 5404 |
| EN reader | 85 | 4382 (4381–4382) | 7055 → 5404 |
| Hindi reader | 84–85 | 4387 (4379–4399) | 7055 → 5404 |

Local candidate score was 71 in all twelve samples versus baseline 67–68. Local candidate LCP ranges: EN overview 5404–5405; Hindi overview 5404–5554; EN reader 5404–5404; Hindi reader 5404–5405ms. The normal loopback server is uncompressed HTTP/1, unlike production; these are improvement measurements, not a claim that local or production has met 95.

A separate single-sample controlled gzip/HTTP-1 diagnostic improved 78→88 and roughly 5.26s→3.61s, with the same gzip level and Lighthouse settings before/after. It is not represented as the production transport. Supplemental live baselines for Rama were 91–92 / 3317–3493ms and Hanuman 93–94 / 3067–3210ms, across EN/HI overview/reader. All Lighthouse accessibility/best-practices scores remained 100, and TBT was 0; these are lab observations, not field or conformance claims.

Final live results, deployed SHA and byte verification belong in the external release record after publication; no 95+ claim is made by this preparation document.

## Verification and preservation

- 52/52 unit/output/publication-gate checks and the final 124/124 public Chromium checks pass, with no skips/retries/flaky cases. `final-playwright.json` records the final rerun against the normal server.
- 84 before/after rendered comparisons across three art families, two languages and seven widths (320, 360, 390, 768, 1024, 1280, 1440) preserve image geometry and visitor text; no overflow or browser errors. Actual mobile/desktop artwork pixels were opened and compared.
- The source-to-output integrity check covers all 207 HTML files: extracted public text, links and embedded scripts/data are unchanged. All original asset, CSS and JavaScript bytes are unchanged. Only 40 overview/reader HTML files differ, plus nine new delivery variants. Output: 268 files.
- Candidate output fingerprint: `a053187afccfc6bacb6d307343a023186484574374c1e7fa8a9d59c3ec663945`.
- The first broad browser sweep passed 122/124. Its two failures were a new fallback assertion sampled during the preserved 420ms entrance, and the temporary diagnostic server's plain 404 response. The fallback check now waits for that entrance to settle without changing its geometry assertion; final regressions use the normal website server and real 404. The initial report/traces are retained honestly.
- Existing dirty alpha/database/editorial files and screenshots remain outside the commit. No review gate or existing test was weakened; new tests check all three asset families, eager/intermediate selection, no duplicate full-image request and original-format fallback.

## Remaining sensory scope

Pending new prose/translations and reviewer claims, family prompts, narration/drone interfaces, private journal/edition features, pothi/relic derivatives, colophons, twelve connecting chapters and 35 narrative paintings (105 JPEG variants) remain unpublished pending their exact-version approval. Existing approved public content supports this engineering work; transport encoding is not narrative-art approval. No new motion/design scope was added to meet a score.

Production observability access remains unavailable; use exact-commit Vercel/GitHub status, live byte matching and a recorded live reading/quiet-minute/language-resume journey. Next: publish only after the final regressions pass, then measure all primary live routes three times and record the result without converting lab data into a field-performance claim.
