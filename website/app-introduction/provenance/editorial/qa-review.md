# Spritual V3 — QA review

**Published commit:** `b5bb57001c217b10704f07e0f1707284a274502e`

Reviewed in Chrome on 19 October 2026. The following checks were performed on the published page.

## Chrome — 1280 × 900

- Six story cards displayed. Filters returned All: **6**, Ramayana: **4**, and Bhagavata: **2**.
- All six story dialogs worked in **English and Hindi**, with three paragraphs per language, the correct distinct illustration loaded, and the appropriate source-link counts.
- After browsing the collection, Escape closed the story dialog and returned focus to its original opening card.
- **Get Spritual** from a story opened only the launch dialog. Closing that dialog returned focus to the original story card.
- The existing app preview remained functional: Scenes advanced to the Narada scene, People & Places rendered, and a saved Hindi passage appeared in Notebook in Hindi.

## Chrome — 360 × 800

- No horizontal overflow of the document.
- The native story rail advanced to **2 / 6**.
- Selecting Bhagavata reset the rail; it then advanced to **2 / 2**.
- At the rail endpoint, Next retained keyboard focus and exposed `aria-disabled="true"`.
- The Dhruva story dialog in Hindi was visually sound.

## Chrome — 568 × 320 landscape

- Story-dialog artwork was hidden as intended for the short viewport.
- The reading area was **189px** high with **678px** of scrollable content.
- The toolbar and footer remained visible.
- The **548 × 308px** dialog fit within the **568 × 320px** viewport.
- Pressing End in the reading area reached the end of the story and brought both source references into view.

## Final visual and console check

- The temporary viewport override was reset to the browser's normal **3072 × 1594px** viewport.
- The complete six-card collection was reviewed; every story illustration had loaded and no dialog remained open.
- The document did not overflow horizontally at the normal viewport.
- The captured Chrome warning/error log was empty after the reviewed interactions.
- Browser proof: [six-story collection](../artwork/review/spritual-collection-desktop.jpg). This is a cropped Chrome screenshot retaining the site header and all six story cards; it is not a design mockup.

## Previously completed static checks

- JavaScript syntax passed.
- **59 unique IDs**; ARIA targets, local anchors, and referenced assets were valid.
- **12 WebP assets**, totalling **4,014,696 bytes**; image alternative text and dimensions were present.
- **Six unique story-data records**, each with source references.
- Store URLs remained `null`; availability continued to display **Coming soon**.

## Scope

These Chrome checks used simulated viewports. They do not constitute physical-device testing or a full accessibility audit.

