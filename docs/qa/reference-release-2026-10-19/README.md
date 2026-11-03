# Exact reference import — 19 October 2026

## Scope and source

Owner request: publish `https://spritual-stories-app.abhijaypl.chatgpt.site/` exactly on `https://spritual.co.in/`. Authenticated Chrome inspection and the Sites connector/source workflow were used to retrieve the actual source, not approximate a screenshot. Version 4, source commit `16c0ba01def25b4c31516e9bb032706ea0328df5`; 27 static files pinned by SHA-256 in `website/app-introduction/source-manifest.json`.

Implementation starts from public branch `f271ffacf67f8fc8ac0bda6501c54e198a3f5ef4`, isolated from unfinished local work. No production account, payment, native release, source-Site sharing or gated manuscript-content settings were changed. The imported source notes describe their own prior work; they are not newly verified human editorial certification.

## Acceptance and implementation

- Exact homepage structure, typography, colors, artwork, responsive composition, motion and interaction source retained. Twelve illustrations, six bilingual source-linked stories, four app-preview modes and truthful coming-soon dialog.
- Only deployment metadata and asset paths adapted. Static assets are namespaced at `/stories-app/`; the source manifest fails the build if an imported original changes unexpectedly.
- Previous English homepage preserved at `/reading-room/`; Hindi counterpart at `/hi/reading-room/`. Root world/welcome and legacy anchor links are forwarded with query/hash intact. No storage migration or reset.
- Original output baseline contained 268 files. Final SHA comparison: only `index.html` changed, zero original files missing. All 267 other files byte-identical. New build: 208 pages plus 404.
- Existing private/editorial release gates remain in force. This release imports only the explicitly selected reference, not the separate local illustrated edition.

## Actual verification

- Build passed. Node unit/output tests: **52/52 passed** (`unit.log`).
- Initial complete browser run: 125/132 passed. Five failures were outdated old-home test entry points; two found real integration gaps (Hindi reading-room alias and welcome-query compatibility). No assertions were relaxed; old-page cases now target its retained route.
- After fixes, all 68 cases in the seven affected spec files passed (`corrected-browser.log`), including all seven failures. The other 64 cases passed in the initial run and their affected implementation was unchanged. This is coverage across runs, not a claim of a new 132/132 single run.
- Four full-page PNG comparisons are byte-identical to a locally served copy of the retrieved reference in the same Chromium process at **320, 390, 768, 1440 CSS px**, reduced motion. This does not claim pixel identity across different operating systems or browser engines. Source and implementation PNG pairs are locally available; the test regenerates them.
- Viewport captures at all four widths were opened and visually inspected. Actual hosted reference inspected in authenticated Chrome. Imported Hindi story also opened and visually inspected in the built-in browser.
- New homepage tests: six story dialogs in EN/HI, source links/artwork, filters, focus return/Escape, mobile rail end states, short-landscape dialog, preview text-size bounds, scene navigation, People & Places, language-preserving visit-only notebook, reload semantics and coming-soon availability.
- Extra real-browser check: touch taps, arrow-key tab switching, eight repeated scene-next/previous cycles; actual production CSP applied locally; zero page errors, zero failed HTTP responses and zero off-origin requests. See `accessibility-network.json`.
- Six settled axe scans recorded in `accessibility-settled.json`. EN/HI story dialogs have no detected WCAG A/AA violations in these scans. Inherited low-contrast small labels remain in the decorative handset samples, the reader source line (4.48:1) and availability labels (4.44:1). Exact owner-selected visual source is preserved. The earlier animated scan includes transient-opacity findings; settled evidence is authoritative for these findings. Neither scan is accessibility certification.
- Authored-code whitespace check passed. Original imported license/provenance whitespace is intentionally retained to preserve the source checksums. No new dependency or changed deployment/security configuration.

## Limits and release status

The app is still presented as coming soon; no App Store/Play Store URL was invented. Notebook changes in the demonstration last for the current page visit. No physical iPhone/Android, Safari or Firefox test was performed in this task. No frame-rate or performance score is claimed.

This report records pre-release verification. Production commit, deployment status and live parity are recorded separately after publication. Source-selected appearance is intentionally unchanged despite the minor contrast limitations above.
