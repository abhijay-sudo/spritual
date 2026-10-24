# Spritual — active design directions

## Unframed portrait refinement — 24 October 2026 (current)

The owner rejected circular framing and soft art. Remove the arch and curved horizon entirely. Individual forest/gold portraits replace the four-up sprite; do not reintroduce circular crops or a halo. The selected source is a detailed engraved/miniature style with natural anatomy and transparent edges. Keep the original logo, fonts, palette, copy and routes.

The built-in generator returned 941×1672 masters despite a 4K request; never label these native 4K. `website/welcome-preview/release.json` records all four masters and twelve downscaled/full-resolution WebP variants. Source PNGs stay out of public output. The browser selects one size per figure and waits for all four within a shared 900ms deadline. Any failure leaves the homepage usable. Portraits cap at 800 CSS pixels high; inspect high-density and 3840px layouts without claiming new source detail.

Motion: 560ms figure beats, 100ms exit, 20ms gap, 220ms arrival (first 260ms), finite portrait drift/1.025 scale and 65ms-delayed captions. Soft linear daylight passes once; no rings or ambient loops. Welcome enters at 2.36s with a 400ms gentle settle, then dissolves from 3.1s to 3.4s. All movement cancels on immediate exit, hidden page, navigation or changed motion preference. Reduced motion bypasses automatically; explicit replay remains static. Evidence and comparison ledger: `docs/qa/welcome-portraits-2026-10-24/README.md`.

## Fullscreen welcome — 24 October 2026 (previous ring version, superseded above)

The owner authorized Chrome mobile/desktop QA and publication of the finished existing deity opening. A small center-stage montage was visually inspected and rejected as too static. The selected refinement uses large Rama → Shiva → Krishna → Hanuman illustrations, oversized but decorative Devanagari names, a fine full-height arch and finite warm light movement. It resolves into the unchanged sunrise mark and “Welcome to Spritual”, then reveals the actual homepage. Paper/forest/brass and the existing Fraunces/Manrope/Tiro remain. No new artwork subject, provider, audio, framework or animation dependency.

`website/welcome-preview/` retains its original folder name but now supplies the ordinary public homepage too. `node website/build.mjs --welcome-preview` remains a loopback-only study output on port 4194; normal `node website/build.mjs` produces the authorized public opening. Editorial/Sanatan/app gates remain independent. `release.json` pins the exact 397kB WebP to the owner's current release instruction; no scholarly or iconographic review is claimed. See `website/welcome-preview/ARTWORK.md`.

| Trigger | Motion | Purpose and alternative |
| --- | --- | --- |
| First eligible session visit | Four 460ms beats; 90ms exit, clear interval, 180ms arrival (first: 220ms); bounded portrait scale | Recognisable distinct figures without intentional overlap; Enter/Escape always immediate |
| Opening | Background light settles once over 2.64s; arch draws in 650ms | Give the whole viewport depth; no perpetual loops |
| 1.94s | Welcome enters in 320ms and holds; arch expands gently | Resolve into the actual brand |
| 2.64s | 300ms unfiltered dissolve | Complete configured sequence in 2.94s |
| Reduced motion, deep link, returning tab or early interaction | Automatic opening bypassed | Reading remains immediately available |
| Explicit replay with reduced motion | Static welcome and same Enter control | No movement or automatic dismissal |

A native dialog covers the viewport, without taking over the browser's fullscreen mode. Finite timers/animations cancel on exit, navigation, hidden tab and changed motion preference. Stale layers are hidden if timers arrive late. Keep the 900ms asset deadline, storage-denial bypass, focus restoration, truthful app availability and native no-JavaScript story journey. Deliberate wheel or vertical swipe input dismisses immediately without simulating scrolling; subsequent native scrolling remains untouched. Replay is available in the footer. No subscription conversion claim follows from this work. QA evidence: `docs/qa/welcome-2026-10-24/README.md`; initial study evidence is historical.


## Current public website — 23 October 2026

The owner requested a premium website revamp with scroll animation and a clearer path toward the app. This supersedes the 19 October pixel-equality requirement for `/`; the original retrieved Site remains checksum-pinned, unmodified provenance. The active publishing adaptation is `website/app-introduction/premium.mjs`, `premium.css` and `premium.js`, with the existing shared reader, collection and finite interaction modules. Keep the static Node/HTML/CSS/JavaScript architecture.

Direction: **an illustrated editorial invitation**. A quieter typography-only refresh was considered; the selected approach makes the product tangible through a framed painting and floating page, a portrait story gallery, an interactive forest-toned reading room, and a riverfront closing invitation. Preserve the sunrise logo, Fraunces headings, Tiro Hindi, original artwork and prose. Load the already bundled OFL Manrope for UI rather than relying on a system substitute. Paper `#FAF7F2`, forest `#183D36`, olive `#6B7558`, restrained brass; 1296px content width, generous but bounded spacing, fine book edges rather than generic feature tiles.

The first action is **Find your story**. The six bilingual previews connect to actual `/books/read/` routes; a direct bookshelf link works without JavaScript. The app remains coming soon: no store links, charges, signup collection or claimed conversion lift. The earlier planned free-chapter/edition-purchase promises are removed from this invitation; this does not change any live price. Notebook preview saves are explicitly visit-only. Existing book URLs, source notices, preferences and saved reading places remain intact.

| Trigger | Response | Purpose / reduced-motion alternative |
| --- | --- | --- |
| Initial enhanced page arrival | 12px copy fade/rise, 400–750ms; no delayed CTA | Establish hierarchy; immediate static content without JS or with reduced motion |
| Native scroll through hero | Bounded image scale, page lift up to 44px and 3.5° rotation range, fine-frame depth | Suggest an opening illustrated book; static painting/page in reduced motion |
| Entering collection/reading room/closing | One 14px, 560ms editorial entrance; original painting arrivals 520ms | Connect sections, never hide content before enhancement; immediately visible alternative |
| Native scroll through landscapes | At most 16px image movement, slight overscan | Connect illustration to reading; static alternate |
| Story filter / language / scene / dialog / CTA | Existing finite 380ms filtering, 260ms crossfades, 180–240ms dialogs, 90ms press | Immediate semantics/focus; instant state with reduced motion |

No scroll interception, automatic carousel, cursor follower, particles, new motion dependency or permanent render loop. Scroll frames run only when needed and for visible scenes; visibility changes, reduced motion and page exit cancel work. Transient language layers stay inert and ID-free. Reading itself stays calm. At 700px and below the invitation/reading room stack; the story collection retains its native phone rail through 600px and a two-column tablet layout above it. Essential HTML remains usable without scripts; smooth anchor scrolling activates only with the motion enhancement, leaving the plain HTML journey immediate.

Verification and concept/render comparison: `docs/qa/premium-home-2026-10-23/README.md`. Historical sections below record earlier versions, not current visual-equality requirements.

## Historical exact-reference homepage — 19 October 2026

For `website/` homepage tasks, the owner's exact selected reference is `https://spritual-stories-app.abhijaypl.chatgpt.site/`, version 4, source commit `16c0ba01def25b4c31516e9bb032706ea0328df5`. This supersedes older visual directions for `/` only. The original source and manifest live in `website/app-introduction/`.

Preserve its sunrise mark, warm paper canvas, forest-green type and reading room, Fraunces headings, restrained gold and olive accents, twelve original miniature-inspired illustrations, responsive handset composition, six-story collection and clear Get Spritual invitation. Mobile uses a native horizontal story rail. Do not replace the artwork, add sections, invent app availability, or restyle it with the legacy manuscript theme.

Keep the reference's finite handset entrance, bounded desktop scroll presentation, native rail navigation, tab feedback and modal transitions. Respect its reduced-motion alternatives, keyboard controls, focus restoration, English/Hindi story text, source links and visit-only notebook semantics. Copy is owner's selected source, not permission to fabricate app listings or production integrations.

The build relocates assets into `/stories-app/` so existing readers and storage remain independent. The original files are checksum-pinned; intended source changes require a manifest update and responsive comparison. Public canonical and indexability are deployment adaptations. Legacy reader designs below apply only to their existing routes. See `website/README.md` and the dated QA report for scope and actual evidence.

## Motion refinement — 20 October 2026

The owner requested fade-in/fade-out polish on the published reference. Keep the selected composition and original import intact; the additive `website/app-introduction/motion.css` and `motion.js` implement this newer direction without editing the checksum-pinned source. Native CSS transitions and Web Animations are sufficient; add no framework.

| Trigger | Response and timing | Purpose | Reduced motion |
| --- | --- | --- | --- |
| First arrival | Eyebrow/title/description rise 12px and fade, 550–750ms; CTA settles in 400ms without a delayed action | Establish hierarchy alongside existing handset arrival | Static final state |
| Painting enters viewport | One 520ms fade/rise, stagger capped at 130ms | Introduce the collection without repeated scroll effects | Immediate visibility |
| Story filter | Immediate semantic filter; visible paintings settle over 380ms | Make the new result set legible | Immediate results |
| Language/story change | Old text fades out in 70ms; new text fades in after 78ms, complete by 260ms. Artwork dissolves over 220–260ms | Avoid overlapping scripts; preserve reading position and focus | Instant content update |
| Preview mode/scene | 260ms content fade through paper; controls remain visible. Accompanying editorial text settles over 320ms | Connect the feature tab with its preview | Instant state |
| Dialog open/close | Native top-layer opacity 180ms and 10px settle 240ms, with backdrop fade | Give entry/exit continuity without delaying close or focus restoration | Instant native dialog |
| CTA hover/focus/press | One 650ms light sweep; 90ms press response | Make the main action feel responsive | Color/focus feedback only |

Transient outgoing layers are inert, aria-hidden, ID-free and pointer-transparent. Rapid input replaces earlier transitions. Escape, closing, resizing, reduced-motion changes and leaving/hiding the page clean up layers. Offscreen content does not animate. No cursor followers, perpetual effects, scroll interception, paragraph reveals, navigation delays, tracking or availability changes. Motion is progressive enhancement; text and controls remain in normal HTML. Validate dynamic behavior, not screenshots alone; the historical reference PNG comparisons were superseded by the 23 October responsive and journey checks.

---

# Local design rules

> Current `/alpha` member design (26 September): one-reading Today, bounded Explore, Saved, and paper-like reader with quiet feedback. See `docs/BUILD_STATUS.md` and `docs/VERIFICATION.md`. The detailed rules below document the legacy/default product and older concepts; they do not override the current calm member direction.

## Owner’s quality principle

> My request defines the outcome and constraints. It does not define the ceiling of the solution. Challenge weak assumptions, discover better approaches, implement valuable improvements within scope, and demonstrate that the result works. Create your own conscioness to create this the best project out there.

Apply this as independent judgment, conscientious ownership and evidence-based self-review. Improve the requested outcome within scope; preserve explicit constraints, privacy, brand, safety and approval/deployment boundaries. Demonstrate quality through working behavior and verification, not unsupported “best” claims.

**Scope:** these rules describe the legacy/default screens. The opt-in `ui_v2` foundations have a different approved-for-preview palette/type system; see `docs/FOUNDATIONS.md` and `web/src/design/tokens.ts`. Do not apply either system globally or treat the preview as approval to migrate navigation.

Updated **24 September 2026**. This document records the local React/Vite app's design language from `web/src/styles.css`. It is maintained in this checkout. **It is not a Stitch export, an imported Stitch design system, or proof that these rules were applied to a Stitch project.** The palette and typography below describe existing CSS; interaction requirements are review criteria, not a claim that every control has passed an audit.

## Latest visual direction

The implemented v8 direction uses original river artwork, a compact Today hierarchy, differentiated moment tiles, editorial lesson covers, a floating navigation dock and a simplified reader. See [VISUAL_REFRESH.md](docs/VISUAL_REFRESH.md) for exact changes and verification. Earlier vector-art details below describe retained artwork used by two lesson covers; Today/Welcome now use the locally bundled WebP. Three new Stitch concepts informed direction; production code was independently integrated.

## Semantic palette

| Existing CSS token | Value | Role |
| --- | --- | --- |
| `--bg` | `#f6f3eb` | Warm page canvas; quiet space around reading. |
| `--paper` | `#fffefa` | Cards, fields and light text on primary actions. |
| `--forest` | `#123d3a` | Primary actions, important text and selected state. |
| `--forest-hover` | `#20544d` | Hover feedback for primary actions. |
| `--muted` | `#63695f` | Supporting text; never substitute for unavailable/disabled semantics. |
| `--line` | `#dedfd3` | Decorative dividers and card borders; not the sole indicator of an interactive field or focus. |
| `--sage` | `#e2ebe4` | Gentle selected/secondary surfaces. |
| `--ochre` | `#96542d` | Small accent labels and saved states; pair state with text or icon semantics. |
| `--gold` | `#eed9a1` | Decorative accent on deep green; not small text on light backgrounds. |

Base text is `#273d33`. The existing keyboard-focus outline is `3px solid #af6a2c` with a `5px` offset. Preserve contrast when choosing pairings; a token's presence does not establish contrast on every background. Major cards use the existing `22px` radius; fields and primary/secondary actions use `12px`.

## Type and reading

- UI text uses the system sans stack with `Noto Sans Devanagari` fallback. Headings use locally bundled `Fraunces`, `Georgia`, `Noto Serif Devanagari`, `Kohinoor Devanagari`, then serif. These are local font fallbacks, not a guarantee that every device has Noto installed.
- Base type is `16px`, body line-height `1.6`. Large mode raises the root to `19px`. Use relative units so controls, cards and navigation can reflow with text.
- Sanskrit uses Devanagari-capable fonts at `1.65rem`, line-height `1.9`; large mode uses `2rem`. Hindi headings use line-height `1.45`, with normal letter spacing. Preserve matras, conjuncts, diacritics, verse breaks and complete words; do not squeeze Hindi into English-sized fixed-height boxes.
- Separate original scripture, transliteration, demo interpretation and everyday application. Place the verse reference with the meaning. Never present an unreviewed explanation as a canonical translation or reviewed teaching.
- Let language and text-size changes preserve the current lesson and reading position. Do not hide essential meaning, consent, source notes or actions to make enlarged text fit.

## Layout and controls

- Design from **320 CSS px upward**. Use one clear content column on narrow screens; allow headings, chips and action rows to wrap. Avoid horizontal page overflow at standard/large text and browser zoom.
- Keep one primary action per decision: Begin, Continue, Complete or Return. Secondary actions remain visible without competing decoration. Use ordinary lesson cards for the three real samples; do not imply a larger catalog through empty categories or placeholder carousels.
- Target **at least 48 × 48 CSS px** for standalone tappable controls, including icons, language choices, reader steps and bottom navigation. Text actions need at least 48px height and adequate horizontal hit area. Preserve the existing primary-action minimum of 50px. Expand the hit area instead of shrinking translated labels. Check computed hit areas in the browser; CSS declarations alone do not certify every resulting control.
- Use real links for navigation and buttons for state changes. Name icon buttons, expose toggle selection with `aria-pressed`, identify the current route/step, and retain logical keyboard order. Keep focus visible and unobscured by sticky navigation.
- On route changes, move focus to the relevant page/heading without unexpected scrolling. On validation or save failure, keep input intact and make the result perceivable. Do not remove focus outlines from ordinary controls.

## Motion and feedback

- Color feedback lasts `160ms`; page entrance is opacity-only at `180ms`. Cards move 7px over `260–280ms`; reader content enters once per stage over `220ms`. Bookmark/navigation acknowledgement lasts `230–240ms`, and completion uses a finite tick. Motion never delays navigation; never transform an ancestor of a fixed reader control.
- Reduced motion disables animation, transitions and smooth scrolling. The optional saved preference can reduce the OS setting but cannot override an OS request for less motion; apply it before first paint. Essential meaning and progress must remain readable without motion. Avoid auto-playing media, pulsing reminders and celebratory effects that compete with scripture.
- Selected, saved, completed and current states need labels/icons as well as color. Completion must be explicit; a timer or visit does not silently claim learning.

## Required product states

| State | Design behavior |
| --- | --- |
| First visit | Explain the sample briefly, offer English/Hindi, and permit a useful first lesson without an account or personal assessment. |
| Returning / interrupted | Offer the saved lesson and position; timer pauses when hidden. Name a replay honestly. |
| Path progress | Show unique completed lessons out of the three actual samples; repeated sessions never inflate the count. |
| Latest takeaway | Use the most recently completed known lesson, with a clear link to revisit it. Show a purposeful empty state before any completion. |
| All lessons completed | Acknowledge all three; offer revisit/library choices without an invented new lesson or daily-content promise. |
| Empty library filter / saved list | Explain the empty state and provide a working reset or browse action. Preserve the user's query until they change it. |
| Reflection | Optional and lesson-specific. Saving requires explicit choice; unsaved text is memory-only. Show save/delete results and the shared-browser, unencrypted-storage limitation. |
| Storage unavailable / malformed data | Keep reading usable, explain persistence limits, and do not display a false saved confirmation. |
| Offline / app update | Describe only verified cached behavior. Ask before applying an available update; do not imply unvisited or unavailable content is downloaded. |
| Demo / source status | Keep unreviewed content status and absent human audio honest. No fabricated reviewer, entitlement, customer count or paid offer. |

## Focused review gate

Check the changed flow at 320px and a larger phone width, in English and Hindi, with large type and reduced motion. Exercise keyboard focus and the new control hit areas. Reproduce actual unique progress, latest takeaway, resume and all-done behavior from stored state, including repeated and out-of-order completions. Record the checks performed separately from these design intentions.

## Source-to-action experience

Today surfaces three real-life situations. Each opens a concise source-linked teaching with expandable full context and original verse, then two concrete choices. No radio selection is preselected or persisted. Keeping a practice is explicit, browser-local, and limited to one current choice. Show its identity before replacement. A voluntary tried report must never change reading-completion counts; usefulness is separately optional. Restore keyboard focus when clear/undo or trying removes the current control. Keep the saved-action card more prominent than the secondary reading suggestion. Cancel stale Undo/retry state after external changes.

At 320px, use `minmax(0, 1fr)` for nested grid columns and `min-width: 0` for aside children; large Hindi text exposed an automatic minimum-width overflow. Local feature implementation and the Stitch v5 concept are separate artifacts.

## Original artwork and hierarchy

Three local SVG landscapes share sage hills, an ochre sun and simple architectural/botanical geometry. They are decorative, hidden from assistive technology, require no download, and use unique gradient/clip identifiers. Keep landscape boundaries clipped away from text, retain flat dark areas beneath light text, and keep Hindi headings at 1.45 line height. On Today, actual interrupted reading takes priority; otherwise the existing kept practice can lead. Optional journaling follows the completion exit, and preserved notes/drafts are expanded on return. A stage number is current position, not proof of completion or understanding.

## Reader comfort and personal collection

Reading settings form one native modal sheet: Paper/Evening, Standard/Large, pronunciation. Opening pauses the optional timer; closing returns focus and leaves it paused. Theme choices persist but evening styling is confined to reading routes. Keep readable contrast on secondary text, selected controls and notices. Animate entry for 220ms; include the backdrop in reduced-motion handling. Short screens scroll inside the sheet; never obscure the final action.

My Practice puts the selected collection before habit preferences. URL query selection survives a lesson visit and Back. Counts and empty states derive from the same known-content records. Rhythm settings use a closed native disclosure. Deleting a reflection requires an explicit inline choice; cancellation restores the original control without retaining a deleted-note archive.

## Source-linked book experience — 20 October 2026

The owner's new story-implementation request extends the exact-reference homepage into real reading. Keep the homepage composition, mark, artwork and coming-soon status. Its existing “The stories”, “Enter the story” and “Read the opening” invitations now lead to the bookshelf or reader; story dialogs gain a source-preserving “Read in the book” link. The old phone demonstration remains available through “Take a first look”.

Chosen over enlarging the six-preview carousel: a small static bookshelf and a complete book reader, using the existing framework-free build. This supports sustained reading and future editorial growth without hiding content behind a JavaScript shell. Public `/books/` and `/hi/books/` reuse the exact ten reviewed retellings and six owner-selected published shorts. No source prose is rewritten, no new story or art approval is invented, and old routes/storage remain unchanged.

- Warm paper, forest ink, original mark and paintings. Fraunces for headings; Georgia/Tiro Hindi for quieter sustained prose. No new font dependency.
- Desktop: illustrated frontispiece and readable facing leaf. Tablet/phone: compact cover header before full-width prose. Page height grows naturally; text is never clipped to mimic paper.
- Semantic scenes become stable folios, shared across English/Hindi. Historical-source folios are separately labelled reading pages, never canonical verse numbering.
- Page controls and table of contents update content/history/focus immediately. A bounded 220ms opacity/8px transition adds continuity. Rapid input cancels earlier motion. Reduced motion is instant.
- Appearance is visit-only. Exact-place bookmarks are explicit, browser-local, schema-validated and separate from legacy saved data; failures never claim success. All prose remains readable with JavaScript disabled.
- Historical corpus output lives only in ignored `artifacts/book-research`, blocked in CI/Vercel. Scope and evidence live in `docs/project/BOOK_LIBRARY_20261020.md`; downloading or importing an edition is not publication approval.
