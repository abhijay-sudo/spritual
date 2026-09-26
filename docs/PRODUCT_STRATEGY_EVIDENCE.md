# Product strategy evidence — 25 September 2026

## Decision

Build a complete **read → understand → try → return** loop around the three actual bilingual Gita samples. The immediate product promise is “Don’t collect wisdom. Live it.” Source-linked text, separate interpretation, a small voluntary action and effortless re-entry should be one connected experience. This is a positioning hypothesis, not a proven moat or a claim of religious authority.

A simpler skin-only polish would preserve the owner's aesthetic preference but leave interruption and return friction unresolved. An AI adviser or broader catalogue would require new content, rights, privacy, review and infrastructure decisions. The stronger bounded choice is persistent reading continuation plus an optional daily cue: it improves the current product without pretending those dependencies exist.

## Competitor evidence

Official product/help pages checked on 25 September 2026. These establish advertised capabilities, not installed-app usability, competitor motion behavior, retention, ranking or causal conversion effects.

| Product | Primary evidence | Consequence for Spritual |
| --- | --- | --- |
| Hallow | [Official features](https://hallow.com/features/) describes prayer journal, challenges and personalized prayer experiences. | Journaling and scheduled spiritual practice are established patterns. A generic journal is not differentiation; connect the note/action to the exact passage while preserving privacy. |
| Insight Timer | [Daily Check-in](https://help.insighttimer.com/support/solutions/articles/67000685931-what-is-daily-check-in-) records mood before/after meditation and permits disabling prompts. | Do not claim check-ins are new. Our bounded loop can ask whether the user tried their chosen action, without collecting moods or implying mental-health improvement. |
| Calm | [Free content help](https://support.calm.com/hc/en-us/articles/360044707294-What-Free-Content-is-Available-on-the-Calm-App) describes guided/timed meditations, sleep sessions, program samples and a Daily Calm preview. | Useful content must precede conversion. Keep all three actual samples easy to start; do not reproduce fake premium locks or trial offers. |
| Sri Mandir | [Official product](https://www.srimandir.com/en-US) lists virtual temple/darshan, devotional literature/music and personalized temple puja/chadhava bookings. | Ritual fulfillment is a different operating business. Compete through understandable scripture and application rather than adding booking buttons without fulfillment. |

The existing [competitor UX record](COMPETITOR_UX_2026-09-25.md) covers the closer Gita/Indian scripture apps. Together, these sources support learning from content hierarchy and continuity. They do not prove incumbents cannot copy this loop or that Spritual will rank first.

## Implementable habit loop

1. **Arrive:** immediately offer one readable lesson; no forced account, survey or ritual scheduling.
2. **Resume:** if reading was interrupted, restore the same lesson and actual stage. Distinguish opened, read and tried; never infer comprehension or completion from elapsed time.
3. **Understand:** preserve Sanskrit, IAST and source reference, clearly separating original unreviewed explanatory writing.
4. **Choose one action:** explicit keep/save; nothing is shared. Keep the action next to its source so it is more than an isolated motivational quote.
5. **Attach an optional cue:** a small set of everyday moments such as after tea or before work. Store only the chosen cue locally; do not represent it as a notification or automatic reminder.
6. **Return:** show the kept action and voluntary “I tried this.” A pause, missed day or refusal is not a failure. Provide edit/remove/undo and a sensible next reading when all three are read.

Behavioral mechanisms are design hypotheses: a familiar cue may reduce initiation effort; preserved context may reduce restart cost; a small action may make learning concrete. No numerical retention uplift or medical benefit is asserted. Optimize for useful return and action, not compulsive screen time. Use restrained finite transitions and respect reduced motion.

## Acceptance criteria for this slice

- Fresh English/Hindi visitor can enter a sample without an account; one primary action is visible.
- Reader who leaves at a middle stage can resume that stage after reload through a visible Home entry.
- Stored state rejects unknown lessons, invalid stages and unsupported shapes without deleting earlier data or falsely reporting success.
- Saved cue is optional, editable, removable and actor-scoped; no notification delivery or cloud-sync claim.
- Explicit completion, kept action and tried action remain distinct. Completion links cannot manufacture saved completion.
- One actor's state never briefly appears for another actor, and return state survives local refresh.
- Same-page and cross-tab updates cannot silently overwrite unrelated current fields.
- All three finished readings produce a useful reread state instead of an empty catalogue or fabricated new content.
- At 320px in English/Hindi: no horizontal overflow; touch controls have accessible names; focus and reduced-motion behavior remain usable.
- Storage failures and invalid deep links offer honest recovery. Existing local reflections and teacher demo behavior remain preserved.

These are acceptance targets, not a statement that tests have passed. Actual evidence belongs in VERIFICATION.md.

## Release and growth limits

The alpha has three samples and local fixture identities. Auth, applied database migrations, licensed reviewed teaching, human narration, payment, notification delivery, production analytics and high-concurrency load proof remain separate work. UI controls and SQL files cannot establish secure integration or support for millions of concurrent users.

The smallest credible growth experiment is an observed reader session followed by voluntary return to the saved action, using the existing USER_TEST_PLAN.md. No participant results exist here. Any future sharing should preview only selected public passage material, never automatically include private notes, practice history or inferred beliefs. No automatic contacts/invitations are authorized.
