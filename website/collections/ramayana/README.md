# Illustrated Ramayana collection — local review edition

Implemented 26 October 2026. Start at **http://127.0.0.1:4194/books/ramayana/**; Hindi at `/hi/books/ramayana/`.

## Delivered scope

Twenty-two connected chapters in English and Hindi, with four reading scenes each. This is an original **abridgement from Bala Kanda through the return in Yuddha Kanda**, not a complete Sanskrit translation, every episode, or Uttara Kanda. The catalogue, all chapter transitions, source notes, language changes, appearance controls and explicit kept-page return are connected. No login, payment, provider integration or publication approval is simulated.

Thirty-four distinct illustrated plates support 88 scenes. Plates intentionally repeat within chapters where another scene-specific depiction is unavailable; captions say “chapter illustration.” They are not 88 unique images or character-animation videos. Two new single-moment plates replace the ambiguous abduction composite and duplicate-Hanuman test scene. Their exact prompts, dimensions and master hashes are in `art/provenance.json`. Existing paintings remain governed by `../../illustrated-edition.mjs` and the earlier illustrated-edition artwork notes. No internet image or modern translation block was scraped into this edition.

The existing sixteen public retellings, their prose, URLs and bookmark schema remain separate. The new first chapter is titled **The story begins**; its compatibility identifier retains `what-makes-a-person-admirable`.

## Run and verify

From this Git checkout's root:

```sh
node website/build.mjs --welcome-preview --collection-preview
# Reuse the existing 4194 server; only start this when none is running:
node website/serve.mjs --welcome-preview

npx playwright test --config website/collection.playwright.config.ts
WEBSITE_URL=http://127.0.0.1:4194 npx playwright test --config website/playwright.config.ts website/tests/books.spec.ts website/tests/book-motion.spec.ts

node website/build.mjs
node --test website/tests/*.test.mjs website/collections/ramayana/collection.test.mjs
```

The default build targets `website/dist` and excludes this draft. The local flag writes `artifacts/welcome-site`, requires `--welcome-preview`, refuses CI/Vercel, and emits noindex pages plus disallow-all robots. Restore the local preview build afterward if inspecting on 4194. Do not enable draft release by removing these guards.

## Motion and privacy contract

- A visible, loaded scene receives one 7.6-second camera move, a finite light pass and, for water plates, two soft water-light cycles. Navigation crossfades the previous picture for 280ms; page-turn feedback uses the existing 480ms paper turn. Text never waits for motion.
- Offscreen, hidden-tab and open-dialog states pause the scene. Fast repeated turns cancel old effects and remove overlay copies. The motion preference survives chapter/language changes in guarded **sessionStorage**, only after explicit selection. Reduced motion or unavailable Web Animations yields still images. If storage is denied, reading and the current page's toggle remain usable; cross-document preference persistence cannot be guaranteed.
- Existing bookmarks are optional, local to this browser and written only on Keep this page. No automatic reading history, inferred faith profile, account sync or analytics was added.
- Without JavaScript, all four passages, illustrations, citations and next-chapter link remain available. Missing artwork shows a recovery note without blocking prose.

## Exact review packet before public or paid use

Run the local build, then open `/books/ramayana/review-manifest.json`. It pins the text revision, every chapter's source URLs, scene-art mapping and SHA-256 of all 102 responsive image files. The generated master records are separate. Any text/art correction changes the material that must be reviewed.

1. **Source/content review:** a named qualified reviewer must read the exact bilingual edition and the two research ledgers. Confirm sequence, character agency, omissions, cited sargas and editorial interpretation. Episode-level AI research is not a critical-edition collation or human approval.
2. **Hindi review:** edit all 22 chapters for natural Hindi, Indic typography, transliteration and consistent names. Automated checks establish presence and rendering, not literary correctness.
3. **Sensitive passages:** specifically review Vali's challenge and Rama's response (12), Sita in captivity (15–16), Lanka's fire (17), war and mourning (19), and Sita's public rejection, speech and ordeal (20). This is not automatically a children's edition. Do not animate injury or ordeal as spectacle.
4. **Rights:** record the basis for publishing the original English/Hindi adaptation and generated illustrations in intended markets. Linked modern translations are reference material, not licensed copy. Gutenberg's USA public-domain designation alone is not a worldwide commercial clearance.
5. **Art review:** inspect each exact plate for identities, anatomy, dress, objects and chronology, including Surasa, Mainaka, Vali and the coronation. The contact sheet is an index, not an approval. The 1536×1024 new masters are not 4K.
6. **Owner release:** record reviewer, date, exact revision/hash and distribution decision in the existing release workflow. Existing website deployment permission does not manufacture approval of these new versions.

Open blockers: named source/Hindi/rights/iconography review, physical phone/Safari verification, participant feedback and willingness-to-pay evidence. Native app packaging and billing were not changed by this website collection task.

Research: [chapters 1–11](research-01-11.md), [chapters 12–22](research-12-22.md). Rendered evidence and executed checks: `../../../docs/qa/ramayana-collection-2026-10-26/README.md`.
