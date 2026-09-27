# Canonical local preview visual coverage — 27 September 2026

`/alpha` is the mounted phone preview and the native wrapper's current entry. Legacy `/today`, `/explore`, `/journey`, `/moment`, `/my-practice`, `/settings`, `/practice`, `/complete` and opt-in `/design` remain for compatibility; they are not the chosen member visual system. Connected `VITE_ALPHA_MODE=real` uses a separate fail-closed flow. This is a **local UI inventory**, not a public-release approval.

| Route / view | Media need | Primary visual / status | Current QA |
| --- | --- | --- | --- |
| `/alpha`, `/alpha/welcome` | Required | Gita chariot, unreviewed; direct content access | First-use E2E; 390 light browser |
| `/alpha/today` | Required, one anchor | Gita chariot, unreviewed; one teaching | 320/390 light inspected |
| `/alpha/library` | Required, selective | Krishna Divine feature + Gita cover; stories remain a quiet link | 390 light and 320 Hindi/Night/Larger inspected; contrast fix made |
| `/alpha/divine` | Required | Krishna, Hanuman, Shiva distinct portraits, unreviewed | 390 light and 320 Hindi/Night/Larger inspected |
| `/alpha/divine/:slug` | Required | matching portrait, alt and focal point; unreviewed | all three at 390 light; 320 overflow check |
| `/alpha/stories` | Required | two coherent story covers; unreviewed | 390 light and 320 Hindi/Night/Larger inspected |
| `/alpha/stories/arjuna-bow` | Required | Gita chariot; unreviewed | existing route, functional E2E historical |
| `/alpha/stories/hanuman-crossing` | Required | Hanuman cover, one sea interlude, paced text reader | 390 light and 320 Hindi/Night/Larger inspected |
| `/alpha/scriptures` | Work-level | Gita and Ramayana covers; Upaniṣad deliberate text source pointer | 320/390 overflow and 768 tablet inspected |
| `/alpha/scriptures/:slug` | Work-level | Gita/Ramayana cover, Upaniṣad text-only pointer | Gita at 390 light; 320 overflow |
| `/alpha/series/gita` | Required | existing Gita cover | functional E2E historical |
| `/alpha/episode/:id`, `/alpha/wisdom/:id` | Text-first | image only at narrative opening, not over verse | functional E2E historical |
| `/alpha/life`, `/alpha/search` | Optional | text-first question; typed results use entity/story/work thumbnails | functional E2E historical; image-result visual detail not reaudited |
| `/alpha/my-day` | Optional | saved stories/entities retain image; verses remain text | 320/390 light inspected |
| `/alpha/settings`, `/alpha/account` | No decorative image | typography and controls | functional E2E historical |
| `/alpha/practice`, `/alpha/my-day`, `/alpha/reflection/:id` | Text-first | no mandatory image | functional E2E historical |
| `/alpha/sources/:id` | Text-first | source metadata and status | functional E2E historical |
| `/alpha/sample`, `/alpha/sample-complete`, `/alpha/join`, `/alpha/circle`, `/alpha/program`, `/alpha/practice/:id`, `/alpha/complete/:id`, `/alpha/institutions`, `/alpha/teacher` | Optional historical/community flow | no new decorative imagery; product trust states control | not visually reaudited in this pass |

All six manifest entries are **unreviewed / rights unverified** and must stay local. No current image qualifies as production-cleared media. `media:audit` requires current Divine, story and image-led work mappings, checks local files/dimensions/alt/provenance/size, and intentionally warns on review state. The same manifest drives responsive `srcSet`, crop, alt and missing-image fallback. A 320 px Hindi/Night/Larger Text/OS-reduced-motion browser pass found no page errors, broken images or horizontal overflow on Today, Explore, Divine, Hanuman, Stories, Hanuman story, Gita work and Saved; an initial story-index appearance mismatch was fixed. A 768 px tablet pass covered Today, Explore, Stories, Divine, Shiva, a work page and the reader; it caught and corrected a Krishna feature crop before reinspection. The latest debug APK was installed on an Android API 36 emulator and Today, Explore and Divine were touched and visually inspected. This is not a physical-device or screen-reader audit. Visual 200% text, additional completed/empty states and public-release media review remain open; browser screenshots are not customer preference evidence.
