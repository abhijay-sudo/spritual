# Ramayana publication preparation — 27 October 2026

**Status: technically checked local review candidate; not cleared or deployed.** Active checkout: `/tmp/spritual-welcome-release-20261024`, branch `codex/ramayana-semi-animated-20261026`. Reused local server: <http://127.0.0.1:4194/books/ramayana/>. The existing public sixteen-retelling collection remains intact.

The candidate contains 28 English/Hindi chapters, 112 scenes, 40 plates and 11,541 English narrative words. It is an abridgement through the return in Yuddha Kanda, not every sarga or Uttara Kanda. Text revision: `7d2503c2eca5f1d2`.

## Supported fixes

- Corrected 193 English native navigation links that targeted fragments on the replaced homepage. They now point directly to `/reading-room/`; navigation does not depend on the compatibility redirect.
- Corrected the saved-page message when storage access is blocked. Corrupt data remains distinguished and preserved; reading still works.
- Visual WebKit inspection exposed a mirrored/incorrect rear face in the animated paper turn. The two paper faces now switch visibility at the calculated edge-on hinge, synchronized with the existing 580ms native animation. Forward and backward rendered frames, including a pixel comparison against a removed rear face, guard the fix. No animation dependency or per-frame JavaScript was added.

## Verification actually performed

| Check | Result and scope |
| --- | --- |
| Local collection build | Passed; 300 routes plus 404, noindex/disallow-all, local-only guard retained. |
| Default public build | Passed; 242 routes plus 404, all 58 collection draft routes absent. |
| Node tests | 100 passed, 0 failed. Includes collection/model, navigation-audit and publication-record regressions. |
| Existing collection browser suite | 25 passed in installed Chrome. |
| Existing book/motion regressions | 19 passed in installed Chrome. |
| New browser matrix | 25 passed, 3 inapplicable CDP-touch cases skipped, 0 failed/flaky. iPhone 13 WebKit emulation, Pixel 7 Chrome emulation, desktop Chrome and desktop WebKit, sequentially with one worker. See [device-results.json](device-results.json). |
| Native navigation and assets | Local: 301 HTML pages, 8,990 anchors, 1,685 fragment references, 5,873 asset references; all 90 required bilingual collection/public-reader routes reachable. Public: 243 HTML pages, 6,272 anchors, 1,107 fragments, 4,571 assets; all 32 existing public-reader routes reachable. Both: zero broken references. [Local](navigation.json), [public](navigation-public.json). |
| Source availability | All 123 distinct cited URLs returned recognizable source pages. Each has retrieval metadata and a body hash. The exact 12-word English overlap screen found no matches against the passages' own cited pages; this is not a complete originality or legal review. [Evidence](source-checks.json). |
| Artwork identity | All 120 responsive JPEG hashes and eight newer PNG master hashes matched existing records. Full generation/input records for 32 inherited plates remain unresolved. |
| Publication preflight | Correctly blocked: six pending exact-version review decisions and unspecified rights markets. [Report](publication-preflight.json). |

Total: **100 Node checks and 69 browser cases passed; three inapplicable cases skipped.** These counts describe this run, not universal compatibility or a performance certification. The same test behaviours repeated across engine profiles are separate cases.

Browser journeys covered bookshelf → collection contents → chapter → forward/back page → next/previous chapter → explicit kept page → shelf → saved-page return. Also checked language switching while retaining the scene, appearance persistence, source and contents dialogs, keyboard operation, rapid repeated turns, JavaScript-free recovery, blocked storage, failed images, motion off/reduced motion, large text, and 320/390/768/1440 CSS-pixel layouts. Android-Chrome emulation used CDP touch input to distinguish horizontal turns from vertical scrolling.

Screenshots were opened and inspected, including forward/backward faces, English/Hindi, evening/large text and phone/desktop layouts. [Desktop reader](desktop-reader-final.png), [iPhone-sized reader](iphone-webkit-390.png), [Hindi large-text reader](iphone-webkit-hi-large-evening.png), [WebKit front](desktop-webkit-paper-front.png), [WebKit reverse](desktop-webkit-paper-reverse.png). Full-page captures can show the sticky paging controls at their initial viewport position; content remains accessible by native scrolling. The desktop final capture is the actual settled viewport.

## Device limits and exact blocker

The Android API 36 emulator was booted and connected, but installed Chrome 154 stopped at its first-run Terms of Service screen. No agreement was accepted or bypassed. **No website check ran inside Android OS.** The opt-in `android-qa.mjs` harness is prepared, but remains unverified until the owner completes browser onboarding. See [blocked run](android-os-results.json) and [screen](android-os-blocker.png). The emulator and temporary reverse mapping started for this attempt were stopped/removed.

No physical iPhone or Android phone was attached. Full Xcode/iOS Simulator is unavailable on this Mac. WebKit emulation is not Mobile Safari on actual iOS hardware; desktop tests ran on macOS, not Windows. No FPS, low-end-device performance, accessibility certification, or smoothness-everywhere claim is made. Physical Safari and Android Chrome touch/scroll tests remain a release check, especially browser toolbar resizing, long-page reading, interrupted turns and device back/forward restoration.

## Exactly what needs human review

Start with [REVIEW_REQUIRED.md](../../../website/collections/ramayana/REVIEW_REQUIRED.md). It identifies the exact candidate, chapter/scene locators, artwork filenames, source checks, rights distinctions and decision record.

1. Approve the English/Hindi abridgement and selected narrative tradition, with real source/Hindi review and decisions on sensitive passages such as Ahalya, Vali, abduction, war and Sita's ordeal.
2. Review all 40 paintings and the existing cover: identities, chronology and iconography. Explicit decisions include the single-faced Ravana portrait and reuse of the medicine-mountain painting for distinct journeys.
3. Resolve the 32 older artwork provenance gaps through recovered records, a documented rights decision, or replacement; confirm input rights, applicable provider/account terms and intended distribution markets. Reachable source pages are not permission to reproduce modern translations.
4. Authorize the exact final website edition and truthful AI/reviewer credits after corrections. Paid access and native distribution are outside this review.

`publication-review.json` deliberately contains no invented names or approvals. The fingerprint binds text, scene mappings, 120 plate derivatives and the cover. Its readiness script cannot publish content or remove the build guard. After actual decisions: apply corrections, refresh the fingerprint and review evidence, rerun checks, then prepare the separately authorized release and verify deployed routes/assets.

## Reproduce from the checkout root

```sh
node website/build.mjs --welcome-preview --collection-preview
# Reuse the existing 4194 server. Run these suites sequentially.
node --test website/tests/*.test.mjs website/collections/ramayana/*.test.mjs
npx playwright test --config website/collection.playwright.config.ts
npx playwright test --config website/collection-devices.playwright.config.ts
WEBSITE_URL=http://127.0.0.1:4194 npx playwright test --config website/playwright.config.ts website/tests/books.spec.ts website/tests/book-motion.spec.ts
node website/collections/ramayana/navigation-audit.mjs artifacts/welcome-site --output=docs/qa/ramayana-release-2026-10-27/navigation.json
node website/build.mjs
node website/collections/ramayana/navigation-audit.mjs website/dist --public --output=docs/qa/ramayana-release-2026-10-27/navigation-public.json
# Expected exit 1 while human decisions remain pending:
node website/collections/ramayana/publication-preflight.mjs --output=docs/qa/ramayana-release-2026-10-27/publication-preflight.json
```

Both builds use separate output directories; the default build does not replace the served local preview. No public deployment, payment, authentication, production configuration or native release occurred. Unrelated Android and prior QA changes were preserved.
