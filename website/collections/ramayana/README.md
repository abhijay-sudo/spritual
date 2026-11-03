# Illustrated Ramayana collection — local review edition

Expanded and refined 27 October 2026. Start at **http://127.0.0.1:4194/books/ramayana/**; Hindi at `/hi/books/ramayana/`.

## Delivered scope

Twenty-eight connected chapters in English and Hindi, with four reading scenes each. This is an original **abridgement from Bala Kanda through the return in Yuddha Kanda**, not a complete Sanskrit translation, every episode, or Uttara Kanda. The catalogue, all chapter transitions, source notes, language changes, appearance controls and explicit kept-page return are connected. No login, payment, provider integration or publication approval is simulated.

Forty distinct illustrated plates support 112 scenes. Plates intentionally repeat within chapters where another scene-specific depiction is unavailable; captions say “chapter illustration.” They are not 112 unique images or character-animation videos. Two new single-moment plates replace the ambiguous abduction composite and duplicate-Hanuman test scene. Their exact prompts, dimensions and master hashes are in `art/provenance.json`. Six further original paintings cover the second bow, Dasharatha’s last night, Panchavati, monsoon waiting, Angada’s embassy and the medicinal mountain. Their actual 1536×1024 masters, prompts and hashes are in `art-expansion-2026-10-27.json`; no 4K claim is made. Existing paintings remain governed by `../../illustrated-edition.mjs` and the earlier illustrated-edition artwork notes. No internet image or modern translation block was scraped into this edition.

The existing sixteen public retellings, their prose, URLs and bookmark schema remain separate. The new first chapter is titled **The story begins**; its compatibility identifier retains `what-makes-a-person-admirable`.

## 27 October completion

Six narrative gaps now have full bilingual chapters: **The second bow**, **The king’s last night**, **A home in Panchavati**, **When the rains ended**, **At Lanka’s gates**, and **A brother’s life**. The old war chapter now concentrates on the final combat and its aftermath. Two adjacent paragraphs were adjusted to avoid repeating the new chapters. Current narrative: **11,541 English words**, revision `7d2503c2eca5f1d2`.

The full contents includes all 28 chapters. At either chapter boundary, the page control becomes a native next/previous chapter link; going back opens the preceding final page. Keyboard and touch-style gestures follow the same sequence. The last chapter retains its return-to-shelf action. No-JavaScript navigation remains available.

`war-and-its-cost/#war-last-message` and `#war-medicine` now recover to the same scene IDs under `at-lankas-gates/`, in both languages, without rewriting saved data. A visible fragment-target recovery link works without JavaScript. Existing bookmarks keep their storage schema.

Paper turns use two actual CSS faces through 180 degrees, cloned typography, bounded lighting and a reverse leaf that matches the facing illustration at desktop sizes. The paper has faint fibres, a central gutter and layered edges. Long passages retain native vertical scrolling rather than clipping text to imitate a fixed physical page. Appearance choices persist for the browsing session; blocked storage still permits changes on the current page.

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

- A visible, loaded scene receives one 7.6-second camera move, a finite light pass and, for water plates, two soft water-light cycles. Navigation crossfades the previous picture for 280ms; page-turn feedback uses the 580ms duplex paper turn (660ms cloth-cover opening). Text never waits for motion.
- Offscreen, hidden-tab and open-dialog states pause the scene. Fast repeated turns cancel old effects and remove overlay copies. The motion preference survives chapter/language changes in guarded **sessionStorage**, only after explicit selection. Reduced motion or unavailable Web Animations yields still images. If storage is denied, reading and the current page's toggle remain usable; cross-document preference persistence cannot be guaranteed.
- Existing bookmarks are optional, local to this browser and written only on Keep this page. No automatic reading history, inferred faith profile, account sync or analytics was added.
- Without JavaScript, all four passages, illustrations, citations and next-chapter link remain available. Missing artwork shows a recovery note without blocking prose.

## Exact review packet before public or paid use

**Start with [REVIEW_REQUIRED.md](REVIEW_REQUIRED.md).** The 27 October evidence pass checked all 123 cited URLs, all 120 responsive image hashes and the eight newer masters. It identifies the 32 inherited plates whose full generation/input records remain missing and lists exact high-risk editorial/art decisions. The limited English exact-phrase screen is not legal clearance or Hindi review.

`publication-review.json` is an explicitly pending decision record, bound to the text, scene mapping and 121 delivered asset files (including the collection cover). Run `node website/collections/ramayana/publication-preflight.mjs` from the checkout root. Exit 1 is currently expected: six named review decisions and the rights markets/basis remain open. This command cannot enable publication or remove the local-only guard. Never fill reviewer fields with assumed approvals.

Run the local build, then open `/books/ramayana/review-manifest.json`. It pins the text revision, every chapter's source URLs, scene-art mapping and SHA-256 of all 120 responsive image files. The generated master records are separate. Any text/art correction changes the material that must be reviewed.

1. **Source/content review:** a named qualified reviewer must read the exact bilingual edition and the chapter research ledgers. Confirm sequence, character agency, omissions, cited sargas and editorial interpretation. Episode-level AI research is not a critical-edition collation or human approval.
2. **Hindi review:** edit all 28 chapters for natural Hindi, Indic typography, transliteration and consistent names. Automated checks establish presence and rendering, not literary correctness.
3. **Sensitive passages:** specifically review Dasharatha’s recollection and death, Vali’s challenge and Rama’s response, Sita in captivity, Lanka’s fire, the expanded war and mourning, and Sita’s public rejection, speech and ordeal. This is not automatically a children's edition. Do not animate injury or ordeal as spectacle.
4. **Rights:** record the basis for publishing the original English/Hindi adaptation and generated illustrations in intended markets. Linked modern translations are reference material, not licensed copy. Gutenberg's USA public-domain designation alone is not a worldwide commercial clearance.
5. **Art review:** inspect each exact plate for identities, anatomy, dress, objects and chronology, including Surasa, Mainaka, Vali and the coronation. The contact sheet is an index, not an approval. The 1536×1024 new masters are not 4K.
6. **Owner release:** record reviewer, date, exact revision/hash and distribution decision in the existing release workflow. Existing website deployment permission does not manufacture approval of these new versions.

Open blockers: named source/Hindi/rights/iconography review, inherited-art provenance decision and physical-phone verification. WebKit with iPhone emulation and Chrome with Android emulation now have repeatable checks in `website/collection-devices.playwright.config.ts`; these are not physical iOS Safari/Android evidence. The existing Android OS emulator boots, but its Chrome first-run Terms require the owner's action before testing; full Xcode/iOS Simulator is unavailable. Participant feedback and willingness-to-pay remain unmeasured, not fabricated release approvals. Native app packaging and billing were not changed by this website collection task.

Research: [original opening chapters](research-01-11.md), [original return chapters](research-12-22.md), [four inserted chapters](research-interludes.md), [expanded war sequence](research-war-expansion.md). Latest rendered evidence: `../../../docs/qa/ramayana-collection-2026-10-27/README.md`. The 26 October record is historical.
