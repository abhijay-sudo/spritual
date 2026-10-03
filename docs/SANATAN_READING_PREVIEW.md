# Sanatan reading preview

Status: owner-approved release, 3 October 2026. The default website build is the production candidate; `--sanatan-preview` remains a local noindex inspection mode.

## What is implemented

- A free reading-first homepage, story library, daily selection and local My reading shelf.
- Ten complete original English/Hindi Valmiki Ramayana retellings, each split into stable scenes and paragraph blocks.
- Search plus epic, reading-guidance, value and duration filters with URL state.
- Story detail pages with age guidance, content notes, values, character links, editorial status and checked chapter locator.
- A scroll reader with 18/20/22/24/28px type, light/sepia/dark appearance, source context, reflection labels, character and glossary sheets, progress, bookmarks and next-story navigation.
- Character/deity context pages, a rotating Daily story and optional skippable local preferences.
- Device-only progress and bookmarks. No account, sync, streak, reminders, analytics, audio, payment, cart or checkout.

The preview preserves the existing dependency-free static generator. It does not migrate the website to a framework.

## Run it

```bash
npm --prefix website run build:sanatan-preview
npm --prefix website run dev:sanatan-preview
```

If running from the repository root without npm workspace selection:

```bash
node website/build.mjs --sanatan-preview
node website/serve.mjs --sanatan-preview
```

Open `http://127.0.0.1:4192/`. Output is isolated in ignored `artifacts/sanatan-site/`. The ordinary `node website/build.mjs` builds the release into `website/dist/`.

`--sanatan-preview` refuses to run when `CI` or `VERCEL` is present. Every preview page is `noindex` and carries a visible local-release-preview banner.

## Content and source boundary

Every story is labelled **Original retelling · reviewed by Puja Bhagat**. The owner attests that review and rights tasks for the exact release are complete; reviewer credentials and independent legal clearance are not claimed. Source passages, retellings and reflections remain distinct:

- Source cards identify Valmiki Ramayana, kanda and sarga, link the checked web witness and state that exact print-edition lineage and final verse cuts are pending.
- Retellings are original Spritual prose; linked modern translation prose is not copied.
- Reflection prompts are labelled as editorial reflection, not source text.
- Puja Bhagat is the named reviewer in the owner-attested release record. No scholar title, affiliation or credential is invented.
- The Bharata adaptation records its omission of an explicit self-harm detail for younger readers.
- Shabari's story explicitly does not attribute the familiar tasted-berries detail to Valmiki Ramayana 3.74.
- The ocean-crossing record warns that its web witness has malformed verse identifiers and is not imported automatically.
- Yuddha 6.128 is presented as numbering in the linked witness, not a universal numbering claim.

The release record is in `docs/SANATAN_RELEASE_RECORD_2026-10-03.md`. Public source/language/retelling corrections route through the repository's enabled GitHub Issues tracker.

## Storage contract

Key: `spritual_reading_v2`.

Progress records store only:

```text
storyId, contentRevision, language, sceneId, blockId,
blockOffsetRatio, updatedAt
```

Bookmarks store the story, scene, block, language, creation time and whether the save represents a whole story or a precise reading place. Older bookmarks without the optional kind remain readable. Preferences store language, reader theme, text size and optional broad reading interests. The parser validates versions, story IDs, bounds and record counts. Unreadable data is never silently overwritten; My reading offers an explicit repair action. Revision changes restore to the nearest surviving scene/block instead of guessing an old scroll offset.

## Honest v1/v2 seams

- `CONTENT_REVISION` is already recorded with progress for safe editorial updates.
- Story → scene → block IDs are stable and can later map to a reviewed publication record.
- `editorial.state` is `reviewed` only for this exact owner-attested revision and includes the named reviewer/date/basis.
- Source cards can accept an exact edition and checked verse range after review without changing public routes.
- Device-only storage can remain a private baseline if account sync is later designed. There is no hidden sync flag or fake remote state.

## Verification

Run:

```bash
node --test website/tests/*.test.mjs
WEBSITE_URL=http://127.0.0.1:4192 npx playwright test --config website/playwright.config.ts sanatan.spec.ts
```

The focused browser suite covers desktop/mobile/tablet reflow, English/Hindi, filters and URL state, review/source disclosures, the corrections route, reader settings, glossary and character sheets, progress, distinct same-scene bookmarks, precise within-paragraph resume, storage-denied fallback, keyboard skip navigation and reduced motion.

The complete release inventory, technical audit and human-required publication gates are in `docs/SANATAN_RELEASE_AUDIT.md`.
