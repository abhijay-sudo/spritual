# Spritual app route and state coverage

Updated 2026-09-30 for the local full-revamp worktree. This matrix describes the current `/alpha` consumer experience; it does not claim production publication, rights clearance, a paid service, or a complete scripture corpus.

| Journey | Routes and states | Current result | Automated coverage |
|---|---|---|---|
| First entry | `/alpha`, `/alpha/welcome` | Meaningful EN/HI preview entry; no account or payment required | `devotional-first-use.spec.ts` |
| Today / continue | `/alpha/today`, new reader, paused reader, saved reading, chosen small step, completed reading | Source-linked daily entry, direct continuation, optional next reading, no streak | `member-journey.spec.ts`, `consumer-route-coverage.spec.ts` |
| Explore | `/alpha/library`, search/filter/no-result, return-user continuation | Direct resume or Saved path appears before discovery; finished Krishna/Gita imagery; honest three-reading boundary | `member-journey.spec.ts`, `consumer-route-coverage.spec.ts` |
| Life → wisdom | `/alpha/life`, matched, source-pointer, unmatched, safety, source-return | In-session private question, source-first result, separately labelled interpretation, optional private follow-through | `life-question.spec.ts`, `knowledge-universe.spec.ts`, `consumer-route-coverage.spec.ts` |
| Divine discovery | `/alpha/divine`, `/alpha/divine/:slug`, known/missing/failed-image | Krishna, Hanuman and Shiva paths with source/review state and resilient finished imagery | `knowledge-universe.spec.ts` |
| Stories | `/alpha/stories`, `/alpha/stories/arjuna-bow`, `/alpha/stories/hanuman-crossing`, missing story | Two original, source-linked, explicitly unreviewed retellings; no invented scripture body | `knowledge-universe.spec.ts` |
| Sources and works | `/alpha/search`, `/alpha/sources/:id`, `/alpha/scriptures`, `/alpha/scriptures/:slug` | Local Gita selections separated from external-only Ramayana/Shiva pointers; missing states remain useful | `knowledge-universe.spec.ts`, `consumer-route-coverage.spec.ts` |
| Reading | `/alpha/wisdom/:id`, `/alpha/series/gita`, `/alpha/episode/:id`, all stages, text-size, EN/HI, reduced motion | Context → original verse → unreviewed meaning → optional action; progress and controls preserve working storage | `member-journey.spec.ts`, `devotional-first-use.spec.ts` |
| Saved / progress | `/alpha/my-day`, empty/populated, bookmark/practice/tried, graph saves, private notes | Calm on-device overview for saved items, notes and completed readings; no score, public profile or streak | `member-journey.spec.ts`, `knowledge-universe.spec.ts` |
| Reflection | `/alpha/reflection/:id`, empty/draft/saved/delete, reading return | Private local note with explicit unencrypted-device boundary and safe return to reader or Saved | `member-journey.spec.ts` |
| Quiet pause | `/alpha/practice`, loading/ready/reset/recovery | Optional pause; no autoplay, claim of meditation benefit or scheduled reminder | `practice-duration-recovery.spec.ts` |
| Settings | `/alpha/settings`, appearance, language context, large type, reduced motion, export/delete | Consumer preferences are primary; test identity is collapsed under “Local preview identity” | `member-journey.spec.ts`, `consumer-route-coverage.spec.ts` |
| Missing route | `/alpha/*` | Bilingual useful recovery with Today and Explore actions; explicitly leaves local saves unchanged | `consumer-route-coverage.spec.ts` |
| Optional community simulation | `/alpha/program`, `/alpha/circle`, `/alpha/practice/:id`, `/alpha/complete/:id`, `/alpha/institutions`, `/alpha/teacher` | Preserved historical fixture workflow with a visible local-simulation/English-only boundary; kept outside the four-tab consumer journey | `member-journey.spec.ts`, `consumer-route-coverage.spec.ts` |

## Deliberate boundaries

- The bundled app corpus remains three source-linked Gita selections plus two original, unreviewed retellings and external source pointers. The 32 bilingual website guides are orientation pages, not rights-cleared scripture bodies and are not silently copied into the app reader.
- Human editorial/tradition review and full-text reuse rights remain publication gates, separate from the completed UI work.
- Community, institution and teacher screens are a local historical simulation. They are preserved for functional testing, not presented as a live account or service.
- Physical-device screen-reader/touch testing, store packaging, backend-connected mode, production monitoring and p75 Core Web Vitals require external environments and remain outside local browser verification.
