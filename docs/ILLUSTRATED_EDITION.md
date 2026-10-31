# Spritual — The Illustrated Edition

Current local-review revision: `illustrated-local-review-2026-10-13.1`. The owner's general request to push the website did not establish exact-version editorial/art approval. The earlier `illustrated-public-2026-10-13.1` release is historical; the controlled replacement excludes the twelve new chapters, expanded maps and 35 paintings. See [the current handoff](project/MANUSCRIPT_SANCTUARY_HANDOFF.md) for tests and release verification. Nothing here claims independent scholarly, theological, iconographic or legal certification.

## Product shape

The local edition connects discovery, a chosen journey, chapter overview, illustrated reader, source map, deliberate continuation, device-only save, language switch and semantic resume. Its primary route is a continuous 22-chapter abridgement: ten existing reviewed bilingual retellings plus twelve original bilingual connecting chapters pending review. The twelve do not inherit the earlier named review. The path reaches Rama’s return in Yuddha Kanda; it does not claim every sarga, a complete scripture edition, or Uttara Kanda. Three finite journeys provide different contexts without changing source order:

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

The local edition contains 35 generated paintings: the existing 23 story paintings plus one distinct, chapter-specific opener for each of the twelve connecting chapters. Originals remain under ignored `artifacts/illustrated-edition/originals/`; 105 active responsive derivatives are stored in `website/assets/illustrated/` and excluded from the ordinary public build. Two superseded story-ten opener attempts remain only as local working-history files and are not referenced by the preview.

All paintings were generated with OpenAI image generation, directed for this project and visually inspected at original resolution on 11–13 October 2026. The registry in `website/illustrated-edition.mjs` records a bilingual alt description and provenance per painting. The twelve new scenes cover departure, travel, abduction and witness, ethical dispute, search, Lanka reconnaissance, verified report, refuge, aftermath, Sita’s public speech and the road home without copying the three supplied photographs. Exact art approval remains unresolved; no independent iconographic or scholarly certification is claimed.

## Editorial boundary

New paintings, captions, journey bridges, source-map expansions and illustrated framing do not inherit the prior named review of the existing public retellings. The historical general deployment instruction in `docs/project/OWNER_RELEASE_APPROVAL_2026-10-13.md` does not supply exact-version approval. The bilingual review packet and source maps are generated at:

- `artifacts/illustrated-edition/REVISED_DRAFTS_AND_SOURCE_MAPS.md`
- `artifacts/illustrated-edition/EDITORIAL_MATRIX.md`

The packet is substantive narrative copy, not a framing-only index: all 22 chapters contain at least three English and three Hindi narrative scenes plus a separate reflection, adaptation boundary and checked source map. The twelve new drafts explicitly retain difficult events including Vali’s objection and Sita’s public ordeal, distinguish variant readings, and avoid presenting a single interpretation as universal. Automated checks enforce minimum English/Hindi narrative depth without treating word count as editorial approval.

The former `node website/build.mjs --sanatan-release` command now fails closed. `node website/build.mjs --sanatan-preview` remains a noindex local-review mode and refuses CI or Vercel. Production configuration uses `node build.mjs` from `website/`, the ten-story public projection with finite selected-story journeys and availability pages preserving withheld saved IDs.

## Implementation map

- `website/illustrated-edition.mjs`: journeys, source maps, bilingual aliases, art and provenance registry.
- `website/illustrated-chapters.mjs`: twelve local-only connecting drafts, new contextual characters and the stable 22-chapter sequence.
- `website/generate-illustrated-assets.mjs`: guarded local generation of the 640/960/1280 JPEG derivatives from working originals.
- `website/illustrated-views.mjs`: journey, overview and reader renderers.
- `website/story-views.mjs`: redesigned home and mode-aware library/Today/character integration; the public mode uses only approved content.
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
WEBSITE_RELEASE=1 WEBSITE_URL=http://127.0.0.1:4192 playwright test --config website/playwright.config.ts website/tests/illustrated.spec.ts
node website/export-illustrated-editorial.mjs
```

These commands build and test local output; Git-connected publication occurs only when the production branch is pushed.
