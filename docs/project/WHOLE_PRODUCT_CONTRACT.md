# Spritual whole-product implementation contract

Prepared from the rendered public website and `/alpha` implementation on 4 October 2026. This is an implementation boundary, not a claim that the public website and local alpha already form one released product.

## Acceptance journey

1. A fresh visitor reaches Home or Today and sees one clear first reading action without an account prompt.
2. Explore lets the visitor enter by story, divine form, theme or source without confusing a source guide with a reviewed story.
3. Story detail states content type, source locator and editorial status before the complete reading.
4. Reader preserves an explicit scene or paragraph across language changes, context sheets, refresh and Save place.
5. Optional reflection or quiet pause never claims divine speech or inferred completion and can return to the exact source surface.
6. Saved brings resume positions, story bookmarks and bibliographic guides together while keeping their identities distinct.
7. A return visit presents the unfinished reading before new recommendations.
8. The local `/alpha` companion may demonstrate broader discovery, but must remain explicitly separate from the public approved corpus until its content and runtime gates are satisfied.

Observable verification: English/Hindi; 390 and 1440 CSS pixels, with 320 and 768 regressions; keyboard; 200% text; reduced motion; denied/corrupt storage; exact deep links; no-JavaScript public reading; and no horizontal overflow.

## Surface and navigation contract

| Product role | Public website | Local alpha | Rule |
| --- | --- | --- | --- |
| Today | `/daily/` | `/alpha/today` | One current invitation; unfinished reading outranks a fresh recommendation. |
| Explore | `/library/` | `/alpha/library` | Stories are primary; source guides and broader graph discovery are clearly labelled secondary paths. |
| Ask | Not currently public | `/alpha/life` | Curated local routing only; never imply unrestricted divine or AI advice. |
| Saved | `/my-reading/` | `/alpha/my-day` | Explain device/account scope. Preserve content, revision, language, kind and exact place. |
| Practice | `/pause/` | `/alpha/practice` | Optional companion, not a primary product identity or completion requirement. |
| Divine context | `/characters/:slug/` | `/alpha/divine/:slug` | Contextual discovery, not ranking, biography completeness or theological consensus. |
| Source context | `/library/<collection>/<unit>/` | `/alpha/sources/:id`, `/alpha/scriptures/:slug` | Edition and eligibility must stay visible. Public guides do not become scripture text. |

The redesign may change presentation and labels, but existing public URLs, `/alpha` deep links, language prefixes and back/return semantics remain compatible.

## Semantic token bridge

Do not copy raw hex values between stacks. Alias each stack to these semantic roles after the approved visual direction arrives.

| Shared role | Current website | Current alpha |
| --- | --- | --- |
| Canvas | `--paper` | `--a-bg` |
| Raised surface | `--ivory`, `--lantern-surface` | `--a-paper`, `--m-panel` |
| Subtle surface | `--paper-2`, `--sage` | `--a-sage`, `--m-panel-alt` |
| Primary text | `--ink`, `--lantern-text` | `--a-ink`, `--dev-ink` |
| Secondary text | `--muted`, `--lantern-muted` | `--a-muted`, `--dev-muted` |
| Action/accent | `--copper`, `--lantern-action` | `--a-gold`, `--dev-accent` |
| Border | `--line`, `--lantern-border` | `--a-line`, `--dev-line` |
| Focus | `--copper`, `--lantern-focus` | current `#a06a29`; replace with an alias |
| Display type | `--serif`, `--reader-serif` | current devotional display faces |
| UI/body type | `--sans`, `--ui-sans` | current alpha system/UI face |

World/deity atmospheres remain bounded overrides of canvas, accent, glow, surface and artwork. They must not alter content availability or masquerade as navigation filters.

## Motion contract

- Control feedback: 160–240 ms; opacity/transform only; immediately interruptible.
- Sheets and restrained artwork reveals: 250–400 ms.
- One or two meaningful moving elements per view; no paragraph cascades or perpetual reading motion.
- Website CSS motion aliases its existing `--dur-fast`, `--dur-med`, `--ease-out`, `--motion-control` and `--motion-sheet` roles.
- Alpha continues through `MotionSystem.tsx`, `tactileSpring`, `glideSpring`, visibility pausing and optional native haptics.
- OS reduced motion governs both surfaces. Alpha's independent haptics preference remains separate.
- Motion never delays navigation, saving, reading, audio controls or focus transfer.

## State and adapter boundaries

Existing stores are authoritative; do not add a third reading store or silently merge unlike records.

- `spritual_reading_v2`: public story preferences, progress and typed story/place bookmarks.
- `spritual_website_shelf_v1`: public bibliographic guide IDs.
- quiet-moment intention and visual-world keys: independent public preferences.
- `spritual_alpha_wisdom_v1_<actor>` and alpha graph/private/playback keys: local alpha state scoped to the simulated or authenticated actor.

The public Saved hub may present existing public stores together, but writes continue through their current adapters. Website-to-alpha continuity is an explicit future bridge, never an automatic upload or key-copy. Private notes are not bridged. Account sync requires a separate consented merge design and server authorization.

## Content/runtime gates

- Public redesign uses only the currently approved ten-story corpus, approved website assets and honest bibliographic source guides.
- Imported epic prose, unreviewed alpha explanations/art, Shiva translation text and demo audio remain unavailable for public promotion.
- Connected catalogue failures stay fail-closed. No fixture fallback, payment lock, provider call or production database change is part of the visual redesign.
- Static public routes remain crawlable and useful without JavaScript. Alpha remains React/Vite and is not a reason to migrate the website framework.

## Baseline evidence and current gaps

The repeatable capture is `scripts/capture-product-baseline.mjs`; images are in `docs/qa/full-product-baseline-2026-10-04/`. All twelve captures returned HTTP 200 with no console errors or horizontal overflow.

Highest-impact gaps observed:

1. Public website and alpha use different navigation, token and motion vocabularies, so continuity is not visually or conceptually credible.
2. Public Home and Explore are polished but repeat similar cards/art and do not make divine-form discovery a first-class route.
3. Character/deity pages are thin endpoints rather than useful discovery hubs.
4. Source guides are honest but considerably denser than story surfaces and visually read as a separate product.
5. Saved correctly separates record kinds but its empty state occupies a large surface before offering meaningful starting points.
6. Alpha has a stronger immersive Today entry, but desktop navigation behaves like a floating mobile rail and the local-preview boundary is visually detached from the public product.
7. Existing visual-world controls change theme only; the redesign must not let them look like content filters.
8. The source-guide quiet-pause link previously dropped its return path. The implementation now carries the exact bilingual guide route into the pause flow.

## Living Manuscript implementation evidence

Implemented locally on 4 October 2026; not deployed by this change.

- Public Home now opens with one direct complete-reading action, a secondary library action, a single illustrated folio, and an exact-resume band when local progress exists. Quiet practice remains secondary.
- Explore now provides real doorway routes for Rama, Hanuman and the bibliographic source archive before the filterable ten-story index. It does not imply unavailable deity biographies or additional story inventory.
- Character pages, source guides, Saved, Today, detail and reader retain their existing content/state boundaries while sharing the forest navigation, parchment surfaces, editorial type rhythm and restrained copper/gold accents.
- The alpha Today/Explore shell uses the same semantic visual vocabulary and an actual desktop archive rail while retaining its `LOCAL PREVIEW` disclosure, four consumer destinations and local/connected separation.
- Control motion is 200 ms and artwork motion is 320 ms. Public reduced-motion mode disables the new transitions; alpha continues to honor both OS and stored reduced-motion settings through its existing motion system.
- The capture script accepts `PRODUCT_CAPTURE_DIR` so a review pass does not overwrite its baseline. The post-change images are in `docs/qa/living-manuscript-2026-10-04/` alongside the original baseline directory.

Observed verification:

- Website static build: 152 public pages plus 404.
- Website Node suite: 29/29.
- Website Chromium suite: 76/76 passed, including new computed-contrast coverage for the saved source-guide action at 320/390/1440. The final saved state remains readable after touch/hover as well as at rest.
- Root unit suite: 160/160 when run with loopback permission (the sandbox-only run blocked two temporary HTTP listeners; it did not expose a product failure).
- Root build: content/media audits, TypeScript, Vite and PWA generation passed. Preview-only art remains explicitly unreviewed.
- Alpha default Chromium suite: 34/34 passed. The local Hindi switch now updates the document language immediately and after reload; the connected shell uses the same document-language boundary. Ten opt-in connected-mode cases remain behind their documented gate.
- Fourteen final responsive captures returned HTTP 200 with no console errors and no horizontal overflow, including the corrected source-guide saved state on mobile and desktop.
- The mobile epic shelf now changes from a short forest introduction to a parchment card field, Explore gives the Rama and Hanuman entry stories distinct feature rows, and source guides use the shared manuscript reading desk without adding content or changing source claims.
