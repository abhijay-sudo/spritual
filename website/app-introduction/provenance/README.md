# Spritual — A whole world. In your hands.

A responsive app-introduction page for Spritual. Version two was redesigned on 19 October 2026 after the user requested a more sophisticated presentation, while retaining the latest Spritual experience handoff and the original sunrise mark.

## Experience

The page has four distinct sections:

1. A large typographic opening with three composed handsets: the Ramayana cover, an English reading sample, and a passage notebook. The main handset opens the interactive reading preview.
2. An illustrated collection with six English/Hindi story previews, source-tradition filters, and a focused reading dialog. Desktop uses a three-column gallery; phones use native horizontal browsing. The first planned Ramayana app edition follows the collection.
3. A forest-green reading room. Four feature tabs update the working phone preview and the surrounding editorial description together, with distinct artwork for Read, Scenes, and People & Places.
4. A quiet closing app invitation, followed by availability and story-source dialogs.

Version three preserves the approved version-two interface while expanding from three to twelve distinct illustrations. Six new paintings introduce Rama, Sita, Krishna, Hanuman, Shiva, and Dhruva. Three further images give Narada, Valmiki, and the Sarayu riverfront their own app-preview compositions. A selected story uses its own cover again in its reader; different page sections no longer recycle the same painting.

Original miniature-inspired illustrations, Fraunces typography, warm paper, forest green, and restrained gold carry the visual identity. The opening handsets enter once and spread slightly with desktop scrolling. Story browsing and reader navigation change only on visitor input. Reduced-motion preferences disable the presentation movement.

The app preview includes:

- English and Hindi versions of a short original opening retelling.
- Adjustable reading type, defaulting to 18 px within a 16–21 px range.
- Two illustrated Scenes inside the phone, with previous/next controls. These are separate from the three-image world explorer above.
- Expandable People & Places.
- A sample passage notebook. Saving retains the passage language and lasts for the current page visit.
- Per-feature scroll restoration, keyboard tab navigation, native modal dialogs, and reduced-motion support.

This is a presentation website with a demonstrative interface. It does not implement the production app, identity, payments, native distribution, or durable notebook storage.

## Project

- Site: `appgprj_6ad5fc9d959481919221666054dd834e`
- Static root: `dist/`
- No build step or package installation.
- `dist/index.html`: page content, metadata, and modal markup.
- `dist/reader.css`: reusable phone-reader and app-preview components.
- `dist/styles.css`: version-two typography, page layouts, handset composition, responsive rules, and motion. It loads after the reader components.
- `dist/app.js`: interactive reading preview and availability logic.
- `dist/site.js`: feature context and scroll-coupled presentation motion.
- `dist/collection.css` and `dist/collection.js`: story gallery, source filters, mobile rail, and bilingual story dialog.
- `dist/stories-data.js`: six original story previews and their source links.
- `editorial/story-sources.json`: internal passage support and editorial provenance.
- `dist/release-config.js`: future verified app-store URLs.
- `dist/assets/`: optimized, self-hosted production assets and bundled font licenses.
- `artwork/originals/`: original generated PNG artwork, retained with source and excluded from the static payload.

The Site is owner-private. Its review URL is the native URL returned by deployment. The private page intentionally includes `noindex, nofollow`. This project does not configure the public `spritual.co.in` domain.

## Download availability

Both store URLs are deliberately `null`:

```js
window.SPRITUAL_RELEASE = Object.freeze({
  iosUrl: null,
  androidUrl: null
});
```

The Get Spritual buttons open the coming-soon dialog. The store rows are informational until actual listings exist. To enable a platform, supply its real HTTPS listing URL on `apps.apple.com` or `play.google.com`. Verify that the listing belongs to Spritual and review launch copy before publishing the release change. A host check in the client is a URL safeguard, not verification of listing ownership or product release.

No form collects personal information. No tracking, third-party scripts, account requests, or simulated successful downloads are present.

## Editorial grounding

The broader website collection contains six short retellings from the Valmiki Ramayana and Bhagavata Purana. Each story includes passage-specific sources, English and Hindi, and its own original illustration. These selections show the collection in development.

The planned first app edition is **Ramayana: The First Journey**, a selected twelve-chapter arc. At launch, chapters 1–3 are intended to be free, with the full edition available through one purchase. The landing page does not invent a price, reviews, reader counts, store approval, or a release date.

The short opening is an original retelling of Valmiki's question to Narada and Narada's identification of Rama. The source is named in the reader and linked from About the stories:

https://www.valmikiramayan.net/utf8/baala/sarga1/balaitrans1.htm

No launch narration, offline package, or PDF entitlement is promised.

## Verification

Source checks cover JavaScript syntax, HTML ID uniqueness, anchor and asset resolution, ARIA references, image metadata, CSS structure, release state, and the six story records. Independent editorial review covers source fidelity and Hindi/English alignment. Original illustrations are visually inspected before integration.

Browser review uses the connected Chrome session at the published owner-private Site. Key flows are the desktop gallery, source filters, all six English/Hindi story readers, previous/next navigation, Escape and focus return, the story-to-app invitation, native phone browsing, short mobile landscape, and the existing app preview. Record the final review separately from real-device testing.

The managed local preview infrastructure previously failed before startup. The connected Chrome session can review the published Site. Physical iPhone and Android device testing remains a release follow-through item.

## Preview and publishing

Use the supported managed workflow when its infrastructure is available:

```sh
sites-preview start /absolute/path/to/spritual-app-landing
```

Open `http://terminal.local:4173/` through the supported cloud browser when the supervisor is available. Stop with `sites-preview stop`.

Source and deployment are managed through Sites. Preserve the project ID and the private audience. Push the exact source state with the Site workflow helper and publish the matching static archive; do not embed repository credentials in files.
