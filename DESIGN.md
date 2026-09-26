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
