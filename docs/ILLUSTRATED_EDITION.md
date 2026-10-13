# Spritual — The Illustrated Edition

This document describes exact release revision `illustrated-public-2026-10-13.1`. After reviewing the implementation summary, scope, artwork count and remaining certification limits, the owner instructed on 13 October 2026: “Whatever what left to push, please push it on live website asap.” That instruction is recorded as owner approval to release this exact website edition. It is not represented as independent scholarly, theological, iconographic or legal certification.

## Product shape

The edition connects discovery, a chosen journey, chapter overview, illustrated reader, source map, deliberate continuation, device-only save, language switch and semantic resume. Its primary route is a continuous 22-chapter abridgement: ten existing reviewed bilingual retellings plus twelve original bilingual connecting chapters released under the owner’s exact-version direction. The twelve do not inherit the earlier named review. The path reaches Rama’s return in Yuddha Kanda; it does not claim every sarga, a complete scripture edition, or Uttara Kanda. Three finite journeys provide different contexts without changing source order:

- Abridged Ramayana in source order: all 22 chapters, with a causal handoff at every boundary.
- Hanuman’s path: Hanuman’s first conversation → Across the ocean → A ring brings hope.
- Reading together: A friend beside the Ganga → Bharata and the sandals → Shabari’s welcome.

Every journey has a real final state. No ending loops to its beginning.

## Visual system

The three supplied reference photographs informed, but were not copied into, a reusable print-inspired system:

- pearl paper and ruled folios for reading surfaces;
- indigo volume fields for orientation and journey covers;
- restrained vermillion for current location and action;
- muted gold rules and physical-looking plate mounts;
- Cormorant Garamond/Tiro Devanagari for narrative voice and Manrope/Anek Devanagari for interface text;
- responsive paintings in 640, 960 and 1280 pixel JPEG derivatives;
- one-language phone reading and optional English/Hindi parallel reading on wide screens.

Motion is deterministic and interruptible. A new folio turn cancels the previous veil and timers. Reduced-motion mode scrolls and focuses the destination without a page-turn veil.

## Artwork and provenance

The release contains 35 generated paintings: the existing 23 story paintings plus one distinct, chapter-specific opener for each of the twelve connecting chapters. Originals remain under ignored `artifacts/illustrated-edition/originals/`; 105 active responsive derivatives are published from `website/assets/illustrated/`. Two superseded story-ten opener attempts remain only as local working-history files and are not referenced by the release.

All paintings were generated with OpenAI image generation, directed for this project and visually inspected at original resolution on 11–13 October 2026. The registry in `website/illustrated-edition.mjs` records a bilingual alt description and provenance per painting. The twelve new scenes cover departure, travel, abduction and witness, ethical dispute, search, Lanka reconnaissance, verified report, refuge, aftermath, Sita’s public speech and the road home without copying the three supplied photographs. The owner approved this exact website release; no independent iconographic or scholarly certification is claimed.

## Editorial boundary

New paintings, captions, journey bridges, source-map expansions and illustrated framing do not inherit the prior named review of the existing public retellings. They are released under the owner’s exact-version direction recorded in `docs/project/OWNER_RELEASE_APPROVAL_2026-10-13.md`. The exact bilingual packet and source maps are generated at:

- `artifacts/illustrated-edition/REVISED_DRAFTS_AND_SOURCE_MAPS.md`
- `artifacts/illustrated-edition/EDITORIAL_MATRIX.md`

The packet is substantive narrative copy, not a framing-only index: all 22 chapters contain at least three English and three Hindi narrative scenes plus a separate reflection, adaptation boundary and checked source map. The twelve new drafts explicitly retain difficult events including Vali’s objection and Sita’s public ordeal, distinguish variant readings, and avoid presenting a single interpretation as universal. Automated checks enforce minimum English/Hindi narrative depth without treating word count as editorial approval.

The production command `node website/build.mjs --sanatan-release` includes `assets/illustrated/`, all `/journeys/` routes and release-safe editorial disclosures. Vercel uses that command. `node website/build.mjs --sanatan-preview` remains a noindex local-review mode and fails closed under CI or Vercel; `node website/build.mjs` remains the 10-story fallback build.

## Implementation map

- `website/illustrated-edition.mjs`: journeys, source maps, bilingual aliases, art and provenance registry.
- `website/illustrated-chapters.mjs`: twelve local-only connecting drafts, new contextual characters and the stable 22-chapter sequence.
- `website/generate-illustrated-assets.mjs`: guarded local generation of the 640/960/1280 JPEG derivatives from working originals.
- `website/illustrated-views.mjs`: journey, overview and reader renderers.
- `website/story-views.mjs`: illustrated home and preview-aware library/Today/character integration; legacy public home remains the default.
- `website/reading.js`: journey-aware persistence, language-safe resume, parallel reading, plate viewer and interruptible folio turns.
- `website/reading.css`: responsive edition tokens and surfaces.
- `website/tests/illustrated.test.mjs`: registry and public-boundary checks.
- `website/tests/illustrated.spec.ts`: browser acceptance and evidence capture.

## Local commands

```sh
node website/build.mjs
node --test website/tests/*.test.mjs
node website/generate-illustrated-assets.mjs
node website/build.mjs --sanatan-preview
node website/serve.mjs --sanatan-preview
WEBSITE_URL=http://127.0.0.1:4192 playwright test --config website/playwright.config.ts website/tests/illustrated.spec.ts
node website/build.mjs --sanatan-release
node website/tests/illustrated-release-check.mjs
WEBSITE_RELEASE=1 playwright test --config website/playwright.config.ts website/tests/illustrated.spec.ts
node website/export-illustrated-editorial.mjs
```

These commands build and test local output; Git-connected publication occurs only when the production branch is pushed.
