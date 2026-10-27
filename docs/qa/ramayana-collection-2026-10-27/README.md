# Ramayana expansion and continuous book — 27 October 2026

Local preview: http://127.0.0.1:4194/books/ramayana/

28 English/Hindi chapters, 112 reading scenes, 11,541 English narrative words, 40 paintings and 123 distinct linked source passages. Text revision: `7d2503c2eca5f1d2`. This is an abridgement from Bala Kanda through the return in Yuddha Kanda, not every sarga or Uttara Kanda. Six new 1536×1024 masters are artistic interpretations awaiting human publication review.

## Implemented

- Six full bilingual chapters fill the second-bow encounter, Dasharatha’s last night, Panchavati, the monsoon delay, Lanka’s gates and Lakshmana’s later recovery. The existing war chapter now completes the final combat and aftermath. Two adjoining bridge paragraphs remove repetition.
- Previous/next chapter controls continue the book at page boundaries. Previous enters the preceding last page. All 28 chapters appear in Contents. The final ending returns to the shelf.
- Old war-page hashes and saved links recover to their relocated scenes in both languages, without rewriting stored data. Native recovery links also work without JavaScript.
- A 580ms duplex paper turn passes through 180°, with matching type, reverse face, fold light and shadow. A 660ms cloth-cover opening is omitted on deep links. Text/navigation are immediate; no animation gate, new framework or dependency.
- Faint paper fibres, binding/gutter depth, layered edges and improved evening content-note contrast. Explicit text-size/theme settings persist across chapters and language changes for the session.

## Verification actually executed

- Default build: **242 public pages + 404**, excludes the new collection, text and art.
- Local preview build: **58 bilingual collection routes**, preserves the existing public catalogue.
- **90/90 Node checks passed**: all existing website tests plus collection validation, output exclusion, bilingual completeness, escaped content and valid route/fragment destinations.
- **25/25 Chrome collection checks passed** in the final complete run, including the new rendered-pixel reverse-face regression.
- **19/19 existing book/motion browser checks passed**. The six affected paper-motion cases were rerun after the final 3D fix and passed.
- Responsive samples: 320, 390, 768, 1440 CSS pixels; intermediate widths 820, 1100, 1180. English/Hindi, 26px text, paper/evening, reduced motion, motion off, keyboard, synthetic touch gestures, mouse, history, save/reload/return, denied/corrupt storage, failed images, absent animation API, rapid repeated input and no JavaScript.
- In-app browser inspection of actual desktop and mobile reader and Contents. Screenshots were opened and visually reviewed, including new chapter artwork, Hindi large type, evening paper and the two sides of the page turn. Videos were captured as supplementary artifacts, not a measured smoothness/FPS result.
- Final capture reported no page errors and no horizontal overflow at 390/1440 (`capture-results.json`). `git diff --check` passed.

## Findings corrected during QA

1. The old turn clone discarded its `.folio` class, changing heading typography. It now retains the original type styles.
2. The first duplex implementation inherited `will-change: opacity`, which flattened its 3D faces and exposed mirrored prose. Visual inspection caught this; transform-only compositing and separated faces fixed it. A rendered-pixel comparison against the facing leaf guards the defect.
3. Evening-paper content notes inherited a low-contrast muted colour. They now use a lighter text and rule colour.

One early browser pass encountered the preview’s temporary 404 because a build was running against the served directory. It was rerun after the build completed; the final full suite passed. Do not rebuild this directory during a browser run.

## Evidence

- `panchavati-1440.png`, `panchavati-390.png`: new illustrated chapter.
- `reader-{320,390,768,1440}.png`, `hindi-large-*.png`: responsive reading and language samples.
- `paper-front-*.png`, `paper-reverse-*.png`: paused frames of the actual browser animation, not mock-ups.
- `new-chapter-contact.png` and `new-*.png`: all six new chapter compositions.
- `contents-390.png`, `evening-390.png`: contents and appearance states.
- `reading-{390,1440}.webm`: supplementary recordings, including deliberate frozen frames used for inspection.
- `review-manifest.json`: exact text revision, citations, scene mappings and SHA-256 hashes for all 120 responsive artwork files.

## Remaining boundaries

No deployment, native package, production auth/payment change or subscription entitlement was added. Source/Hindi/sensitive-content/rights/iconography review must cover this exact new version before public or paid release; see the collection README and new research ledgers. The source checks and generated art are not named expert approval. Physical-device Safari/Android verification, participant usability feedback and willingness-to-pay evidence remain unperformed. No FPS, performance score or accessibility certification is claimed.
