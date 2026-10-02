# Sanatan reading release audit

Audit date: 2 October 2026

Revision: `ramayana-draft-2026-10-02.1`

Release decision: **hold — technically previewable, not approved for public story publication**

This record covers the new free reading experience only. It does not extend any approval previously given to the 32 bibliographic guides or seven existing art families.

## Release inventory

- One epic: Valmiki Ramayana.
- Ten original stories, each complete in English and Hindi.
- Three stable scenes and six stable paragraph blocks per story: 30 scenes and 60 bilingual blocks in total.
- Ten story-detail routes and ten scroll-reader routes per language: 40 generated story pages.
- Twelve character/deity context pages per language: 24 generated context pages.
- Daily story and My reading per language: four generated utility pages.
- 68 new bilingual route variants in total. The preview build contains 148 pages because it deliberately retains the existing public guides and support routes alongside them.
- Device-only progress, bookmarks, language, text size, theme and optional broad interests under `spritual_reading_v2`.
- No account, commerce, checkout, price, analytics, streak, missed-day count, reminder, audio or synchronization feature.

All 68 new routes and the redesigned bilingual home, library and privacy surfaces are local-only. `--sanatan-preview` refuses CI/Vercel, generates `noindex`, and writes to `artifacts/sanatan-site/`; the normal public build remains separate.

## Nine-screen contract

| Surface | Implemented contract | Audit result |
| --- | --- | --- |
| Home | Free reading proposition, daily invitation, ten-story epic shelf, curated paths, optional setup | Pass in EN/HI; no commercial language |
| Library | Text search plus epic, age guidance, value and duration filters; URL state and empty recovery | Pass; all results open real stories |
| Story detail | Retelling status, age/content notes, values, characters, source map and reader entry | Pass; draft and adaptation labels visible |
| Reader | 42rem reading column, scene/block anchors, source/reflection separation, character/glossary sheets, next story | Pass at 390/768/1440; EN/HI |
| Character/deity | Context, aliases, source scope, related stories and tradition plurality note | Pass for 12 records in both languages |
| Glossary sheet | Tap/click contextual meaning, labelled as a library aid rather than doctrine | Pass; keyboard-operable dialog |
| Daily story | Date-based rotation through the same ten stories, explicitly not a streak | Pass; honest deterministic selection |
| My reading | Precise resume, story and passage bookmarks, excerpts, remove/undo and corrupt-data repair | Pass; same-scene passages remain distinct |
| Preferences/settings | Optional language/text setup; reader 18–28px and light/sepia/dark; device-only disclosure | Pass; changes remain active in the tab if storage writes fail |

## Quality and standards audit

### Verified by automation or inspection

- Semantic headings, landmarks, a skip link, visible keyboard focus, 44px-or-larger interactive targets in the reading surfaces, labelled controls and live status regions.
- Keyboard navigation and reduced-motion behavior in the focused browser suite.
- Responsive overflow checks at 390px, 768px and 1440px; prior implementation inspection also covered the small-screen bottom-sheet limit of `85dvh`.
- Real English and Hindi navigation through home, library, detail and reader; the Hindi build uses bundled OFL-licensed Devanagari fonts rather than depending only on a system font.
- Reader theme and type size coexist with the deity/world shell. Resume waits for webfonts and restores a validated within-block ratio without startup scroll tracking overwriting it.
- Local storage is schema/version bounded. Unreadable records are not overwritten. Storage denial degrades to current-tab preferences with an honest status message.
- The static response policy in `website/vercel.json` denies framing, forms, camera, microphone, geolocation and payment, and limits scripts, styles, images, fonts and connections to self.
- The preview makes no review, publication, translation-rights, audio, synchronization or audience-count claim.

### Not established by this audit

- This is not a WCAG 2.2 AA certification. A screen-reader pass, 200%/400% zoom pass, forced-colors pass and physical-device assistive-technology review still require humans and devices.
- A lab performance budget/Lighthouse result has not been treated as proof. The implementation is dependency-free static HTML/CSS/JS with local fonts and images, but production CDN behavior must be measured on the release candidate.
- Browser automation does not establish literary quality, Sanskrit accuracy, Hindi editorial quality, child-development suitability or religious/tradition review.

## Source witness map

The linked pages were checked on 2 October 2026 as provenance witnesses. They are not the selected publication edition and their modern translation text is not reproduced.

| Story | Working locator | Evidence boundary |
| --- | --- | --- |
| What makes a person admirable? | Bala Kanda 1.1 | Valmiki's opening question, especially 1.1.1–5 |
| Knowing how to stop | Bala Kanda 1.28 | Recall/withdrawal request is explicit at 1.28.2 |
| The bow at Mithila | Bala Kanda 1.67 | Bow presentation and permission in the 1.67.12 onward sequence |
| A friend beside the Ganga | Ayodhya Kanda 2.50 | Guha's friendship and hospitality, 2.50.33–47 |
| Bharata and the sandals | Ayodhya Kanda 2.112 | Sandals at 2.112.21–23; explicit vow at 2.112.25 is omitted and disclosed |
| Shabari's welcome | Aranya Kanda 3.74 | Welcome and forest food, 3.74.6–17; tasted berries are not attributed to this chapter |
| Hanuman's first conversation | Kishkindha Kanda 4.3 | Hanuman's approach and speech from 4.3.1 onward |
| Across the ocean | Sundara Kanda 5.1 | Whole-chapter condensation; malformed web verse identifiers are not imported |
| A ring brings hope | Sundara Kanda 5.36 | Ring at 5.36.2–4 within a wider cautious exchange |
| Returning responsibility | Yuddha Kanda 6.128 | Bharata's handover and homecoming in this witness; numbering is edition-specific |

## Mandatory human publication gates

Production publication must remain blocked until the repository receives all of the following for the exact commit/revision:

1. A named, qualified source reviewer signs the ten source mappings, selects the publication edition, confirms verse ranges and checks that both retellings do not introduce source claims the witness does not support.
2. A named Hindi editor reviews all Hindi titles, summaries, 60 blocks, notes, glossary/character copy and interface strings for natural language, accuracy and age-appropriate tone.
3. An accountable family/sensitivity reviewer approves age guidance and the treatment of grief, captivity, threat, weapons, marriage custom and the omitted self-harm vow.
4. The rights owner records permission/ownership for the exact English and Hindi retellings and explicitly approves every artwork used by these new story routes. Approval for older guides/art does not silently transfer.
5. The release owner supplies a real public corrections contact and owner. No email address or monitored correction inbox is present, so one must not be invented.
6. The release owner reviews this inventory and gives final approval for the exact release commit after the checks above are recorded.

No code change can truthfully substitute for these decisions. When they are complete, remove the local-only guard in a reviewable release commit, update editorial states and reviewer records from the signed evidence, run the ordinary public build/preflights, then deploy that exact commit.
