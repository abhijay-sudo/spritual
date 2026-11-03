# Independent review and corrective release — 29 October 2026

Three independent agents reviewed the deployed canonical site: reader behavior, visual/browse experience, and architecture/SEO. These were separate reviews, not evidence of different underlying models or human editorial review. The primary agent reproduced findings and integrated fixes.

## Reproduced and fixed

- Hindi searches for गणेश and साहस returned zero: bilingual search aliases and readable localized metadata now cover existing content; duplicate filter labels collapse without losing matching stories.
- Empty books/arcs appeared as ordinary navigation: available sections now carry counts, unused taxonomy is collapsed, empty pages recover within their collection and are excluded from the sitemap with noindex.
- Reader story title was clipped: one visible story heading now distinguishes the episode from its scene.
- Removing the last bookmark threw an exception: focus now safely returns to the saved-page heading.
- Mobile font-size controls did not change text: the selected size now applies and survives Hindi navigation.
- Next page on mobile left the scene opening above the viewport: user-directed turns reveal the new opening when needed.
- At 360×800 the home CTA began at y805: reading copy and action now precede the illustration on mobile.
- Common pages lacked social metadata: added canonical sharing metadata, bilingual alternates, and story hierarchy structured data.

## Evidence

110 unit tests pass. All 15 browser journeys pass in both Chromium and WebKit locally. Static auditing covers 460 HTML files with zero broken local references or forbidden visitor-copy findings. Desktop and mobile screenshots were inspected. The production release is followed by the same browser suite using QA_BASE_URL=https://spritual.co.in.

Commands:

```sh
node --test website/tests/*.test.mjs
node website/content/build.mjs
node website/content/qa.mjs
npx playwright test -c website/canonical.playwright.config.ts
QA_BROWSER=webkit npx playwright test -c website/canonical.playwright.config.ts
node website/content/build.mjs --release
```

This does not establish physical-device performance, 120fps animation, a full WCAG conformance audit, or independent scholarly approval. Story prose and artwork bytes were not changed by this corrective release.
