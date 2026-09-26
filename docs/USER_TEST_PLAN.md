# Spritual: first-use mobile usability study

Status: proposed protocol only. No participants have been recruited, contacted or tested. No customer validation, accessibility conformance or market demand is established by this document.

## What this study decides

Can an interested adult independently start a useful silent lesson, understand the content layers, save and resume it, and control their local data? Test the working build, not screenshots. The six sessions are a formative study for finding usability problems; they cannot establish population adoption, retention or willingness to pay.

Scope: English/Hindi welcome, Today, three available Gita lessons in Explore, a sequential silent reader, optional local reflection, My Practice, preferences and deletion. The reader offers 3/5/10-minute self-paced choices. No licensed human audio exists; do not imply it works. Other scripture collections must be clearly identified as future availability, not selectable completed libraries.

## Six participants

Recruit only after the owner authorises recruitment. Use adults who independently express an interest in learning this material. Do not recruit on inferred religion, caste or family background. Avoid recruiting only technically confident friends.

| ID  | Relevant experience                                                                 | Device and language                                                                           |
| --- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| P1  | Beginner, comfortable using everyday phone apps                                     | Own Android; prefers English explanations; needs Roman pronunciation help                     |
| P2  | Beginner or returning learner; limited comfort reading English                      | Own Android; Hindi interface and explanation preference                                       |
| P3  | Age 60+; reads Hindi; uses larger phone text                                        | Own phone with usual font size and display settings; Hindi preferred                          |
| P4  | Regularly limits mobile data or has intermittent connectivity                       | Own lower-cost Android; preferred English or Hindi; also test controlled network loss         |
| P5  | Regular screen-reader user, not a sighted person temporarily enabling one           | Own Android with TalkBack, or iPhone with VoiceOver; their normal speech/language settings    |
| P6  | Regular prayer/scripture learner who can compare reading needs with existing habits | Own Android or iPhone; preferred English or Hindi; inspect sources and distinguish commentary |

These profiles can overlap, but include six distinct people. Record actual device, browser, preferred language and accessibility settings. Do not generalise Hindi results to other Indian languages. Record unmet language needs without suggesting those languages already work.

## Preparation and consent

- Allow 35–45 minutes per session, with breaks and flexible time for assistive technology. Use the participant's usual accessibility settings throughout.
- Record build identifier/date, lesson IDs, network condition and whether local data starts empty. Use an isolated test browser profile when possible; never delete the person's unrelated browser data.
- Confirm that the actual sample text, pronunciation, meaning and reflection are clearly labelled and sourced. A separate qualified content review is required; usability participants do not certify religious accuracy.
- Tell participants: “We are testing the app, not you. You can skip anything or stop. This is a sample learning experience. Please use an invented sentence if you try the journal.”
- Ask separately for session participation and any screen/audio recording. Declining recording must not prevent participation. Do not collect private reflections, belief histories or sensitive household details.
- Capture participant IDs, observations and timings. Keep contact details separate if follow-up is authorised. Agree a retention period before collecting anything; proposed default is deleting recordings after 30 days and keeping only de-identified findings.
- Do not collect analytics, network payloads or screenshots containing a real reflection. Have a moderator with sufficient Hindi fluency for Hindi sessions.

## Tasks and observation sheet

Give one task at a time. Do not name buttons, point at navigation or explain the intended path. After 30 seconds of being stuck, ask “What are you looking for?” If the participant wants help, provide it, record the prompt and mark the task assisted. Do not make anyone struggle to protect a metric.

| Task                       | Neutral instruction                                                                                                                            | Evidence to record                                                                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Start                   | “You have a few minutes and want to understand a Gita teaching. Start in the language you prefer.”                                             | Time from interactive welcome to first lesson content; whether login seems necessary; chosen language; wrong turns; help                                                       |
| 2. Understand and navigate | “Work through this lesson without sound. Show what you would do if you wanted to reread the previous part.”                                    | Can find next/back; original text versus pronunciation versus meaning; control names; focus order; reading and text-size comfort                                               |
| 3. Interpret time choices  | “What do the time options mean? Choose one that suits you.”                                                                                    | Whether 3/5/10 means an estimate, a timer or different content in the participant's mind; whether the screen's actual behaviour matches its promise                            |
| 4. Save and resume         | “Keep this lesson so you can find it later. Leave before finishing. Now close and reopen the app and continue.”                                | Saved lesson discoverability; exact prior lesson/step; language and duration persistence; confusion between saved and completed                                                |
| 5. Finish and reflect      | “Finish this lesson. If you want to try a note, use an invented sentence. You may skip it.”                                                    | Whether completion works without a reflection; voluntary note storage; ability to locate the note; any pressure to write or continue                                           |
| 6. Explore honestly        | “Find another lesson you can use now. Then find out whether you can study the Ramayana here today, and whether you can listen to a recording.” | Correctly finds one of three available lessons; correctly identifies unavailable collections and audio; dead ends or deceptive controls                                        |
| 7. Recover                 | “Imagine your connection has dropped partway through. What would you expect? Try continuing, then reopen when the connection returns.”         | Actual continued-reading behaviour, error clarity, recovered state, absence of blank screen/data loss; record loaded-page and fresh-load behaviour separately                  |
| 8. Privacy and deletion    | “You no longer want this app to keep your activity or invented note on this device. Remove it, then check.”                                    | Finds deletion; understands scope/confirmation; cancellation works; confirmed delete removes notes, saved items and progress after reload; no promise of cross-device deletion |

For Task 7, first record the participant's real connection. Then, with their agreement, simulate loss using the test device/browser; do not change an unrelated network or account. Never claim fresh-load offline support based only on an already-loaded page. No offline cache is assumed by this plan.

For P3, inspect wrapping and reachability at their large text size. For P5, complete the main journey using the screen reader throughout; check headings, language pronunciation, button labels, focus movement after next/back and deletion confirmation. Do not substitute sighted verbal guidance for accessible operation.

## Comprehension and value questions

After the lesson, ask without teaching the answers:

1. “In your own words, what was the main idea?”
2. “Which part is the original verse, and which part helps explain it?”
3. “What, if anything, could you take from this into your day?”
4. “Where is your note kept? Who can see it on a shared phone? What might happen if you clear the browser's data?”
5. “How easy was this session?” (1 = very difficult, 5 = very easy.)
6. “How useful was this session for what you wanted?” (1 = not useful, 5 = very useful.)
7. “Was anything confusing, uncomfortable or less trustworthy? What would you change first?”

Before sessions, agree a lesson-specific comprehension rubric grounded in the displayed content. Score main-idea comprehension as 0 = misunderstood, 1 = partly understood, 2 = accurate in the participant's own words. Do not demand agreement with the teaching, memorisation or one doctrinal interpretation. Report privacy comprehension separately; “local-only” must not be mistaken for encryption, device locking or protection from another person using the same browser.

## Measures and proposed decision gates

All thresholds below are proposed product decisions, not industry benchmarks or evidence of demand. Report counts such as 5/6, not precise-looking population percentages. Keep assisted and independent outcomes separate.

| Measure                   | Definition                                                                                                                       | Proposed gate before a wider alpha                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| First lesson reached      | Independent arrival at actual lesson content, excluding researcher/setup delays                                                  | At least 5/6 within 90 seconds; report median, range and individual barriers                                     |
| Core journey success      | Start, advance/back, finish without mandatory reflection                                                                         | At least 5/6 independently; no unresolved blocker for Hindi, larger text or screen reader                        |
| Save/resume success       | Reopen the same unfinished lesson at the expected step                                                                           | At least 5/6 independently and no reproduced loss of state                                                       |
| Navigation misclicks      | Tap or activation the participant identifies as accidental or inconsistent with their goal; normal exploration is not a misclick | Median no more than two before first completion; any repeated same-control error in two people triggers redesign |
| Learning comprehension    | Main-idea score 2 and correct separation of verse from explanation                                                               | At least 5/6; if unmet, revise content presentation and retest                                                   |
| Honest availability       | Correctly identifies no human recording and future collections as unavailable                                                    | 6/6; fix misleading affordances or copy before wider release                                                     |
| Time-choice comprehension | Participant expectation matches the actual self-paced experience                                                                 | At least 5/6; never claim three distinct reviewed lessons when only pacing differs                               |
| Ease and usefulness       | Separate 1–5 ratings plus explanation                                                                                            | Median at least 4 for each; investigate each score of 1–2 rather than averaging it away                          |
| Deletion and privacy      | Data removal survives reload; local/shared-device scope is understood                                                            | Removal works for all completed attempts; any reproduced privacy/data-loss defect blocks release                 |

Do not rank slower assistive-technology users as less successful. Report their timing with context; an accessibility failure is a design defect even when the aggregate gate passes. Similarly, fast completion does not compensate for poor understanding or a confusing Hindi translation.

## Analysis, retest and limits

Create one row per task per participant: outcome (independent/assisted/failed/skipped), seconds, misclicks, observed error, verbatim de-identified remark and severity. Separate observation from interpretation. A skipped optional reflection is not a failure.

- **Blocker:** cannot start/read/navigate with supported language or assistive technology; false content/audio availability; deletion failure; unexpected disclosure or loss of local data. Fix and retest the affected journey before wider use.
- **Major:** two people misread the same control, cannot resume, or confuse verse with commentary. Simplify the relevant screen, then retest with new participants matching the affected profiles.
- **Minor:** cosmetic or preference issue without task impact. Prioritise only after blockers and major issues.

If separately authorised and consented, offer a 48–72-hour follow-up: ask participants to reopen and resume without a reminder explaining the steps. Report observed return separately from stated intention. A scheduled research follow-up is prompted use, not organic retention.

Report remaining content-review, language and device coverage gaps. This study does not validate pricing, clinical benefit, spiritual outcomes, long-term habit formation or the commercial case. Do not optimise for longer screen time alone; prioritise successful learning, useful practice and voluntary return.

## Additional source-to-action tasks

These are proposed tasks, not conducted research. After the existing reading tasks, ask a participant to choose a situation, explain the difference between the source and demo interpretation, choose an action without saving, then explicitly keep a different action. Ask them to replace it, mark tried only for a simulated task, distinguish trying from usefulness, and clear/undo. Check that they understand local shared-browser visibility and do not believe the app observed their offline action. Use the separate, consented follow-up gates in `build/X_FACTOR_STRATEGY.md`; collect no automatic faith or emotional profile. Any reported real-world practice must be labeled self-report, not independently measured benefit.
