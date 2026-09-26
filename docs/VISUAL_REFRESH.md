# Living wisdom visual refresh

24 September 2026. A new visual direction implemented after the owner rejected the previous visually uniform interface. This is an implemented design hypothesis, not evidence of customer demand or improved retention.

## What changed

- Welcome now has visible original landscape art on phones, a short value proposition and direct entry to a real lesson. Signup is not required. English at 320 × 568 places the entire primary action at y=458–514, without horizontal overflow.
- Today uses one dominant artwork/lesson composition. Actual interrupted reading remains first; otherwise a kept practice can precede the next lesson. Repeated support cards and weekly-goal prose moved out of this screen; the existing My Practice controls remain available.
- Three differentiated situation tiles map to the actual sources: action → 2.47, response → 2.48, attention → 6.26. Sources are derived from the lesson catalog.
- The collection summary presents real completed counts and one path link. Repeated first/next lesson buttons were removed.
- Explore uses three editorial covers with existing bookmark and reading behavior. No new content, teachers, recordings or membership offers were invented.
- Reader uses one numbered, accessible stage navigator and an editorial text surface. Original Sanskrit, IAST, interpretation warning, settings, timer, source disclosure and optional reflection behavior remain.
- Palette: petrol teal `#123d3a`, warm ivory `#f6f3eb`, butter `#eed9a1`, burnt ochre `#96542d`. The dock has a solid active state; larger layouts use a dark sidebar with corrected secondary-text contrast.
- Fraunces is self-hosted with its SIL Open Font License. The 249 KB WebP and fonts are precached for web and packaged into native builds. The original PNG stays outside shipped assets.

## Design work and evidence

Three v8 concepts were created in the existing [Stitch project](https://stitch.withgoogle.com/projects/9638448800553082833): Welcome, Today and Explore. Their generated prose included incorrect source associations and unearned review/calendar labels; these were rejected in local implementation and a correction prompt was submitted. Stitch is an art-direction reference, not the app's runtime or an approved content source. The three v8 frames and correction response remained present after reopening the project following a Chrome crash. No Figma document was created in this pass.

The original artwork uses built-in image generation. [Exact prompt and provenance](ARTWORK_PROMPT.md). UI graphics remain local vectors. No competitor art was copied.

Primary references used for design principles: [Headspace illustration guidance](https://live.standards.site/headspace/illustration), [Hallow home grouping](https://help.hallow.com/en/articles/9650908-overview-of-the-mobile-app), [Miracle of Mind developer listing](https://apps.apple.com/in/app/miracle-of-mind-sadhguru/id6737795677), [Google's Stitch iteration workflow](https://developers.googleblog.com/stitch-a-new-way-to-design-uis/). These document advertised experiences and visual patterns, not transferable acquisition or retention results.

## Verification

- `npm test`: 56 passed. No test-count inflation for the decorative changes.
- Web production build passed. Final build before native packaging: `index-DqBXBew3.js` / `index-C48IFQ7p.css`; JS 93.90 KB gzip; complete precache 739.57 KiB uncompressed.
- Chrome visual inspection: 390 × 844 Welcome, Today, Explore. In-app browser: 320 × 568 English Welcome and Hindi/Large reading, Today, Explore and saved collection; no horizontal overflow. Also checked 1280px Hindi/Large layout without horizontal overflow. Final Chrome desktop inspection at 1728px also passed with the corrected sidebar tagline contrast. Browser viewport checks do not establish physical-device behavior.
- In isolated QA storage, navigated Welcome → lesson → original verse → source/interpretation → practical takeaway → explicit completion → Today. Verified 1/3 completed, next lesson 2.48, saved lesson count 1 and history count 1. User preview records were not used for QA data.
- Search miss and Show all recovery passed. Paper/Evening and Large text controls remained operable. Stage targets measured 71 × 66 CSS px in Hindi/Large at 320px. Floating navigation targets exceeded 48px. Reduced-motion preference persisted after reload and computed animation was `none`.
- Native bundle guard now recursively verifies art/fonts/license along with JS/CSS against both synchronized projects. Android APK compilation, package asset comparison, signature and installation are recorded in [MOBILE_BUILD.md](MOBILE_BUILD.md).

Not validated: real-user preference, retention, native emulator screen behavior, physical-device accessibility, iOS compilation or store readiness. Demo content still requires human review and licensed recordings before release.
