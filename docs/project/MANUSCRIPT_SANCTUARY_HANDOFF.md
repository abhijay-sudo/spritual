# Living Manuscript & One Quiet Minute

14 October 2026 UTC. Release-preparation record; confirm deployment verification below before claiming this is live.

## Current authority and checkout

- Selected checkout: `/Users/abhijay/Documents/Codex/2026-10-11/task-2/spritual-sanatan-illustrated-20261011`.
- Branch: `codex/sanatan-reading`; HEAD: `90821ac10475f5ad7842d6c66253d1c74066ef6b`. Changes are uncommitted. The GitHub production branch `codex/public-website` was read at the same HEAD on 14 October.
- The owner's latest instruction, relayed with transcript evidence on 14 October, authorizes making tested, release-eligible changes live. It does not approve the exact twelve connecting chapters, expanded source maps or 35 new paintings. The public projection below is the prepared release scope.
- Direct Vercel project lookup for `spritual-website` (`prj_xkulmp32dAg96BHwHFL5SW0L4XbR`) in `spritual1` returned 403; its mapped CLI fallback reported an unavailable scope. This does **not** block the existing Git integration: a fresh GitHub permission check returned push/admin access, `git ls-remote` confirmed production HEAD, and the prior commit's successful Vercel status maps to `https://vercel.com/spritual1/spritual-website/7cDEzNuZUsYTRY9kSrStojAuMJew`. GitHub deployment `7046714509` is Production and succeeded at that exact prior SHA. No credentials or project settings were changed.
- At release preparation no push had occurred. The intended operation is a normal fast-forward push to the existing production branch, not a second deployment route. No revert, model change, dependency installation or production-data mutation is involved. Do not stage the entire dirty checkout: existing database/editorial/alpha work is unrelated and retained.

## Compact outcome checklist

- [x] Two-pixel reading thread, centered 42rem column, English drop cap, Hindi-safe text and interruptible paragraph reveals.
- [x] Exclusive Retelling / Source Locator / Reflection drawers with keyboard operation, Escape and focus restoration.
- [x] Optional focus mode, opening-art disclosure, a single Contents navigation, wide-screen bilingual parallel reading, preserved appearance/font preferences.
- [x] Exact semantic paragraph/offset resume through quiet-minute exit, language switching and immediate/delayed saves. The sticky Contents has a real quiet-minute link, so entering mid-paragraph does not require scrolling to the title.
- [x] Full-screen lotus sanctuary: four 4/4/6 cycles, then four unpaced seconds; total exactly 60 seconds. Skip-hold and natural modes are available.
- [x] Deliberate start, pause, reset, early exit and end state; hidden-tab pause; language change never restarts breathing or sound.
- [x] Optional, off-by-default synthetic soft tone and bounded 24-particle canvas. Reduced motion disables decorative geometry motion/particles.
- [x] Arrival links to Today or back to the actual paragraph/source guide. No automatic Sankalpa, completion badge, saved intention or reading award.
- [x] Real language-specific narrative word counts drive clearly labelled reading-time estimates.
- [x] Public build excludes pending narrative, maps and artwork while preserving all 22 known saved IDs; finite ten-story public journeys and honest availability pages.
- [ ] Production deployment and live verification: use the verified existing Git-connected route; record the new SHA/status after the push.
- [ ] Exact-version editorial/art approval for the complete 22-chapter Illustrated Edition.
- [ ] Full newest-brief reconciliation: the supplied 59,819-byte Library attachment could not be materialized after the supported attempt and one bounded retry. Its local bytes/hash were not verified; its full contents were not read.
- [ ] Optional 3D card tilt, device-orientation/parallax treatment, human narration/recorded ambience and haptics are not implemented. Do not describe this as the entire sensory brief completed.

## Implementation and deliberate choices

The existing Node/static/native-JavaScript website is retained. Native Web Animations, CSS and a lifecycle-bound animation-frame clock provide the requested behaviours; **React/Framer Motion was not introduced**. The stronger alternative, a framework migration, would change the site's architecture and payload for these bounded effects. No dependency was added.

Reader modules: `website/manuscript.js` and `manuscript.css`. Integration in `reading.js` keeps explicit reflection/source/practice destinations from overwriting narrative progress, preserves block fractions across layout changes, cancels stale navigation saves and tolerates denied storage. The English initial uses a CSS drop cap; Hindi graphemes are not split. Parallel reading is available from 980px and preserves stable block IDs.

Sanctuary modules: `sanctuary-state.mjs`, `sanctuary-views.mjs`, `sanctuary.js`, `sanctuary.css`. The pure timer derives phase/scale from actual elapsed time, never an accumulated animation count. A complete 4/4/6 cycle takes fourteen seconds, so four cycles plus four seconds of natural settling fill the minute without cutting an exhalation short. Natural breathing and skip-hold are choices, not medical advice. Optional sound is an original two-sine synthetic tone (174/261 Hz, low gain), not a traditional recording, human narration or a therapeutic claim. It requires an explicit gesture and stops on hiding, pausing, exit and completion. Audio lifecycle was tested, not acoustic quality on a physical device.

The arrival line is an existing editorial reflection from “Knowing how to stop”, labelled as such with its Bala Kanda 28 locator. It is not presented as a verbatim Ramayana quotation. Existing explicit optional intention saving remains available through Finish and retains its prior storage key; the timer itself writes no completion state.

`reading-metadata.mjs` counts whitespace-delimited tokens in the actual narrative bodies of each language, excluding UI, source notes, reflection and practice. Estimates use 180 English / 150 Hindi tokens per minute, rounded up with a one-minute minimum. These are transparent heuristics, not observed reading speeds. Existing story prose and stable IDs were not rewritten.

## Controlled public projection

`node website/build.mjs` emits **206 pages plus 404**: the prior 152-page public surface, six bilingual finite journey pages and 48 bilingual story/reader availability pages for twelve withheld IDs. `website/vercel.json` and the website workflow use this unflagged build. The unsupported illustrated release command now fails before touching output. `--sanatan-preview` remains separate, local/noindex, and retains the full draft edition.

`public-projection.mjs` contains only the withheld IDs and generic bilingual availability metadata, not their draft titles, prose or expanded source maps. Public client data knows these IDs so later save/preference operations do not silently prune existing progress. Saved shows unavailable entries with explicit remove/Undo; its stored original paragraph and offset survive. Public journeys contain only approved stories and have finite endings; they are labelled selected moments, not a complete continuous Ramayana.

| Material | Status / release handling |
| --- | --- |
| Original ten bilingual retellings | Existing owner-recorded review scope retained; no new claim of scholarly certification. Public narrative unchanged. |
| Existing source guides and earlier approved artwork | Original scope retained; full imported epic prose and alpha assets remain excluded. |
| Twelve connecting chapters, bridges and expanded source maps | Local review only; no exact-version approval supplied. Not in public output. |
| 35 new paintings / 105 derivatives | Local preview only; existing provenance retained, no new rights/iconographic approval inferred. Not in public output. |
| New UI and ten practical Sankalpa invitations | Implementation copy, not scripture or an extension of Puja Bhagat's review. Human bilingual editorial QA remains advisable. |
| Two generated reader/sanctuary concepts | Design references only, not published narrative paintings or approved religious artwork. |

The requested global “Source-Verified Retellings · Editorial Review by Puja Bhagat” badge is not added because it would extend a bounded prior review to unreviewed material. Public footer wording is “Source-Mapped Retellings · Editorial Details Available”; the actual original story record remains accessible. Unsupported exact-owner-approval wording has been removed from the preview/release path.

## Verification and evidence

One loopback server and one Chromium runner were used at a time. The in-app browser tool was unavailable, so the existing Playwright installation is the documented fallback. No user's browser storage was cleared.

Final source/asset fingerprint: `cb45d8ea69de6e2084f0cbb8250410c40af7f06443afa7e4f62e56f1407fc553`. This is SHA-256 of 200 sorted relative paths + NUL + bytes + NUL: the website tree excluding `dist`, `test-results`, `artifacts`, `node_modules` and `.vercel`, plus `.github/workflows/website.yml`. Per-file sizes/hashes are in `evidence/source-manifest.json`; reproduce with `node artifacts/manuscript-sanctuary/fingerprint.mjs`. Runtime source matches both final suites; afterward only release-status documentation and one trailing whitespace character in the bundled OFL text changed. The public build and 49 unit checks were rerun after that non-runtime cleanup.

| Check | Final result |
| --- | --- |
| `node website/build.mjs` | 206 public pages plus 404; pending prose/art excluded |
| `node --test website/tests/*.test.mjs` | 49/49 passed; retained `evidence/unit-final.tap` |
| `WEBSITE_URL=http://127.0.0.1:4190 node node_modules/@playwright/test/cli.js test --config website/playwright.config.ts --workers=1` | 105/105 passed, no skips/retries/flakes; 171.553 seconds; `evidence/public-projection-ready.json` |
| `node website/build.mjs --sanatan-preview` | 224 local-review pages plus 404, counted from actual output; public output unchanged |
| `WEBSITE_RELEASE=1 WEBSITE_URL=http://127.0.0.1:4192 node node_modules/@playwright/test/cli.js test --config website/playwright.config.ts website/tests/manuscript.spec.ts website/tests/illustrated.spec.ts website/tests/practice.spec.ts --workers=1 --trace on` | 32/32 passed, no skips/retries/flakes; 106.734 seconds; `evidence/preview-final.json` |
| `git diff --check` | Passed |

Public coverage includes homepage, timeline, every major destination, EN/HI, 320/390/768/1024/1440 and additional layout boundaries, six worlds, three reader appearances, 200% text, keyboard, no-JavaScript reading, reduced motion, source/focus interruption, short/full/cancelled holds, Undo, multi-tab state, corrupt/denied storage, immediate/delayed saves, finite journey endings and exact block-offset return. The timer tests exercise the complete minute using a controlled browser clock, plus actual lifecycle and explicit sound-gesture checks. These are not physical-device or participant results.

Evidence root: `artifacts/manuscript-sanctuary/` (ignored, retained locally).

- Before: `evidence/before-reader.png`, `evidence/before-pause.png` (1440 × 1000).
- Concepts: `concepts/reader.png`, `concepts/sanctuary.png` (1505 × 1045).
- Native-size after: `evidence/public-reader-native.png`, `public-source-native.png`, `public-focus-native.png`, `public-sanctuary-native.png` and corresponding `preview-*` captures.
- Reflow: `reader-{en,hi}-{320,390,768,1024,1440}.png`, `reader-source-large-dark-*`, `sanctuary-*` and the enlarged Hindi capture are preserved separately in `evidence/public-widths/` and `evidence/preview-widths/`; native-size captures also carry their build-mode prefix.
- State/layout: `public-parallel-sepia-1024.png`, `public-sanctuary-{inhale,hold,exhale}.png`, `public-world-{neutral,epic,rama,hanuman,shiva,krishna}.png`, `public-home-1440.png`, `public-unavailable-1440.png`.
- Traces: `evidence/public-interaction-trace.zip`, `preview-interaction-trace.zip`, `exact-resume-trace.zip`, `breathing-trace.zip`, `complete-22-chapter-preview-trace.zip`. The latter three were copied from the final 32-case run; the resume trace clicks the visible sticky Contents link. ZIP integrity checks passed for the resume, breathing and public interaction traces.
- Reproducible capture/loopback measurement helper: `capture-final.mjs`. It creates isolated test contexts only.

| Concept intent | Implemented / inspected |
| --- | --- |
| Warm quiet manuscript, not a complex spread | Parchment single column, 42rem measure and generous leading; native-size reader capture. |
| High-contrast book typography | Cormorant English / Tiro Hindi, English drop cap, preserved reader font-size controls. Default size respects existing preferences rather than forcing the mockup's larger setting. |
| Context without persistent clutter | Three glass pills, exclusive source/retelling/reflection drawers and one Contents navigation. |
| Distraction-free immersion | Focus hides/inerts chrome but keeps an obvious exit; no inaccessible keyboard trap. |
| A calm central breathing object | Two-layer twelve-petal code-native lotus, continuous ring and proportionate expansion/contraction. The SVG is the requested interactive geometry, not a substitute narrative painting. |
| Continuity with Spritual | Original logo, English/Hindi, URLs, themes and saved paragraph identities retained. |
| Actual content, not concept fiction | Existing approved prose and editorial reflection replace any mockup copy; pending art stays in the separate preview. |

The frontend skill guided concept generation and native-size concept/render comparisons. Browser inspection found a real 320px enlarged-Hindi mode-label collision even though document-width assertions passed; the controls now wrap intrinsically and a label-bounds assertion covers it. The final parallel-tablet painting also revealed an inherited negative margin clipping its frame; the corrected selector now keeps the full frame inside the column, with bounds assertions across both languages and all five widths. Other repaired regressions include a mobile Contents panel extending offscreen, duplicate Reflection destinations, stale save timers after navigation, false source-map matches from cloned drawers, hidden Continue during initial parallel setup and unavailable Saved entries missing from page data. An initial preview run passed 31/32: the remaining expectation incorrectly looked for a historical released label; the UI correctly said local review. That expectation was corrected, not the review boundary weakened. The subsequent complete 32-case run passed, then passed again after the painting-frame correction.

No missing painting file or failing page-asset response was found in the final preview acceptance checks; all 35 registered paintings are still pending exact art approval. This increment generated only two layout concepts, not new narrative art. The public candidate deliberately uses the earlier approved art rather than presenting pending paintings as cleared.

## Measured cost

The five added browser assets total **43,603 bytes raw / 13,737 bytes gzip**, each compressed separately with Node `gzipSync`: `manuscript.js` 11,114/3,607; `manuscript.css` 9,071/2,475; `sanctuary.js` 13,744/4,559; `sanctuary.css` 7,426/2,132; `sanctuary-state.mjs` (served as `.js`) 2,248/964. This does not include the pre-existing site bundle, fonts, story HTML or paintings.

One unthrottled loopback Chromium cold-context sample per public route, with service workers blocked:

| Route | Resources | Encoded body bytes incl. document | Transfer bytes incl. overhead | DOM ready / load |
| --- | ---: | ---: | ---: | ---: |
| First story reader | 25 | 1,072,268 | 1,080,068 | 34.4 / 39.8 ms |
| Quiet minute | 19 | 449,735 | 455,735 | 43.8 / 44.1 ms |

These are development payload/timing observations, not CDN compression, device-speed, frame-rate or field Core Web Vitals claims. `public-measurements.json` retains the sample, asset sizes, zero captured page errors and 320/320px enlarged Hindi document/viewport width. Actual opened pixels, not just that width check, confirmed the mode controls no longer overlap.

## Remaining limits and next action

No physical-device/Safari, screen-reader, hearing/acoustic-quality or field-performance certification is claimed. Loopback timings are not Core Web Vitals or real-network evidence. No test supplies editorial approval, rights clearance, iconographic validation or proof of habit effectiveness. The full newest Library brief remains unread because materialization failed; do not infer exhaustive compliance from the delivered visible requirements.

The verified existing Git deployment route is the authorized release mechanism. Before the normal push, confirm it still points to the expected base without changing any remote configuration:

```sh
git ls-remote https://github.com/abhijay-sudo/spritual.git refs/heads/codex/public-website
```

The prior successful Git deployment confirms the intended team/project/environment; the branch's current `website/vercel.json` and the eligible replacement build have been inspected. Stage only reviewed website/workflow and related release documentation, then perform a normal fast-forward push to `codex/public-website`. Never force push or use this branch as a preview. Verify deployment SHA, CI, apex/`www`, bilingual routes, unavailable chapters, no pending art and saved/quiet-minute flows before saying this is live. Direct Vercel logs/monitoring access remains unavailable; do not invent that observability evidence or silently select another team.

For local review without publication:

```sh
node website/build.mjs
node website/serve.mjs
```

The separate draft edition uses `node website/build.mjs --sanatan-preview` then `node website/serve.mjs --sanatan-preview` on 4192; stop the task-owned public server before switching modes.
