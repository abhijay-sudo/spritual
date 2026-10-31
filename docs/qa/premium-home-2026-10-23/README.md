# Premium editorial website — 23 October 2026

Implemented locally in `stories-reference-release` on `codex/app-source-bookshelf`. Public release status belongs in `DEPLOYMENT.md`; this file alone does not confirm deployment. No app, auth, payments, tracking, new content approval or production configuration changes.

## Baseline observations and chosen direction

Real desktop and mobile browser inspection found an oversized handset-led opening delaying the stories, a primary invitation ending at unavailable store downloads, and a lower page whose artwork/interactive reading room felt detached from the opening. A typography-only refresh was considered; the selected editorial direction gives the existing art and actual reading journey the first screen.

- [Desktop before](before-1440.png) → [desktop after](after-1440.png).
- [Mobile before](before-390.png) → [mobile after](after-390.png).
- [Interactive reading room](experience-1440.png), [closing invitation](closing-1440.png).

The existing logo, original paintings, all story text and source links remain intact. A framed painting and floating excerpt replace the handset fan; story discovery becomes the primary action. The gallery has finer frames and editorial spacing; the functional phone preview lives in a forest landscape; the final invitation uses the existing riverfront painting. Planned purchase/free-chapter promises are removed without setting a new price. App downloads remain coming soon and the preview notebook's visit-only lifetime is visible.

## Actual verification

- `node website/build.mjs`: 242 public pages plus 404; original import hashes validated.
- `node --test website/tests/*.test.mjs`: **63 passed** on the development branch, zero failures/skips.
- Focused Playwright (`app-introduction`, `app-motion`, `books`, `premium-home`): **33 passed**, zero failures/skips, after fixes.
- Rendered screenshots opened and inspected at **320, 390, 768, 1440px**, with additional intermediate checks at 601/640/700/900/1100. At 640px the first pass cramped navigation and over-wrapped the headline; the revised stacked invitation was inspected again. Public bookshelf and enlarged Hindi app-preview screenshots were also opened.
- Tested mouse, keyboard and emulated touch: discovery → story dialog → same-story book; Hindi retained in book destination; page turning, explicit save/reload/return/remove, corrupt and blocked storage, filters, tab/scene/context/notebook controls, font limits, Escape/focus return, short landscape dialogs and legacy redirects.
- Dynamic reduced-motion changes, rapid repeated actions and outgoing-layer cleanup passed. Native wheel input changed the floating page transform; actual interaction was recorded locally and several motion states inspected. No FPS or performance score is claimed.
- JavaScript-disabled reading passed after initial copy entrances were gated behind the enhancement script. Plain HTML stays visible and the real bookshelf/reader path works. No hidden pre-reveal state is needed.
- Inspection also corrected light inherited text inside the cream reader preview and an obscured painting caption. No JavaScript errors occurred during the recorded journey.

The isolated public release was separately rebuilt and verified: **59 Node/output tests and 32 focused Chromium cases passed**. Homepage HTML, premium CSS/JS, shared motion CSS/JS and collection JS are byte-identical to the inspected development build. The release starts from public `ab15bf1`; it does not include the app branch’s intervening content-delivery/backend work.

## Concept/render comparison

An image-generation board explored all four sections before implementation; it is a design reference only, not deployed imagery. Local file: `artifacts/premium-web-2026-10-23/concept.png`.

1. **Hierarchy:** asymmetric copy/art opening and one immediate reading action retained.
2. **Type and palette:** actual Fraunces/Manrope/Tiro, warm paper, forest and olive preserve the existing brand.
3. **Imagery:** original source paintings replace the concept's illustrative approximations. No generated concept artwork or invented prose is published.
4. **Composition:** floating excerpt, portrait collection, forest reader and riverfront closing are all implemented. Tabs use a compact two-column control to preserve the actual accessible preview behavior.
5. **Mobile and motion:** layouts deliberately stack at 700px; native collection rail retained below 600px. Bounded scroll depth and finite entrances augment usable static HTML.

Copy intentionally differs from the generated board where necessary: existing story titles/prose and logo remain exact; no invented quotation, pricing, store claim or testimonial was adopted. The small preview limit is a truthful disclosure.

## Limits

No measured conversion lift, user-preference study, accessibility certification, physical-device Safari test, shipped native app, real download funnel or new editorial clearance is claimed. Public release uses the website's existing approved scope, not the local app/corpus/backend candidate. Scratch captures, test logs and the interaction recording live under ignored `artifacts/premium-web-2026-10-23/`.
