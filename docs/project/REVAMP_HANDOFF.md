# Spritual full-revamp handoff

## 1 October contextual-world polish pass

The website now uses a coherent illuminated-archive system rather than one uniform palette. A site-wide chooser provides neutral Still, generic Mahabharata, Rama, Krishna, Hanuman and Shiva worlds. Each changes the whole shell—header, footer, page ambience, accent system, surfaces, hero/reader art and geometry—without changing or hiding content. Route defaults remain truthful: Mahabharata is generic epic context, Ramayana defaults to Rama, Kishkindha/Sundara default to Hanuman, and Shiva routes default to Shiva. Explicit URL choices override route context; stored preference applies only on neutral routes; invalid storage falls back safely.

Functional polish includes URL/history/refresh/EN-HI theme continuity, a visible neutral reset, no-flash initialization, reduced-motion parity, URL-backed library query/filter state, progressive collection disclosure with no-JavaScript full availability, a saved-guide continuation on home, compact provenance in guides, 3–5 minute orientation labels, 44px mobile reader controls and an image-led guide opening. Theme choice is ambience, never an implicit content filter.

Current verification after this pass:

- Static build: 80 public pages plus 404.
- Website Node/output/state tests: 17/17 passed.
- Website Chromium journeys: 43/43 passed, including 320/390/768/1024/1440/1680 layouts, 200% text, keyboard/focus, no JavaScript, storage failures, search/filter persistence, URL/deep-link/history, six-world chooser, route-context precedence, EN/HI continuity, reduced motion and saved/resume.
- Ordinary text token contrast against each world paper is 5.04:1 or higher; primary ink is 9.35:1 or higher. This is a token check, not a WCAG certification.
- Final website captures: `docs/qa/contextual-worlds/`, with the must-fix regression set captured 1 October 2026 at 18:44:55–18:44:56 IST.

On 1 October 2026, after being asked whether they had reviewed and approved all 32 guides and seven artworks for publication, including their source and usage rights, the owner replied, “Yeah. Do it.” This supplies explicit owner publication approval and is recorded in `OWNER_RELEASE_APPROVAL_2026-10-01.md`. It does not invent independent scholarly review or turn these original orientations into scripture translations. The visible `unreviewed` and `sourceRights: unknown` metadata continues to describe the absence of an independently named editorial review and the linked external editions; the public build still contains no imported scripture prose.

## Where the work is

- **Revamp worktree:** `/Users/abhijay/Documents/Codex/2026-10-01/task/spritual-revamp`
- **Base:** `34d5bda62510c56414523223a8d09575118ab371` (detached, uncommitted)
- **Original checkout:** `/Users/abhijay/Desktop/spritual/app` remains clean and unchanged on `codex/public-website`.
- **Local review:** website `http://127.0.0.1:4190/`; app `http://127.0.0.1:4192/alpha/today`. These loopback previews are not deployments.

Preserve the entire worktree. Do not copy `node_modules`, native generated bundles, test traces, or other ignored outputs into a commit.

## Completed product scope

### Public website

- 32/32 distinct EN/HI editorial orientation guides: 18 Mahabharata parvas, seven Ramayana kandas and seven Shiva samhitas.
- Every guide has a populated overview, figures, themes, optional reflection, edition/variant caveat where relevant and specific source locators.
- All guides remain explicitly `unreviewed` and `sourceRights: unknown`; they are not scripture translations or canonical full text.
- Library discovery now has collection headings, search/filter/jump navigation, compact finished collection art, resilient SVG controls, improved saved-place empty/recovery states and Devanagari sizing.
- Generated public surface: 80 pages plus `404.html`, with imported scripture prose and `/read/` routes excluded.

### App / native wrapper

- Today and the four-tab consumer navigation remain the primary loop.
- Explore surfaces paused-reading or Saved continuity before discovery, then connects Divine, stories, works, source context, search, Life and optional Practice.
- Life → wisdom keeps the question in memory only, preserves safety routing and source-first results, and now ends with separately chosen private reflection, Saved or Explore paths.
- Saved presents calm on-device context for readings/steps, private notes and completed readings with no streak, score or public profile.
- Lazy-loading, missing-route and legacy-community states are populated and bilingual. Consumer routes do not expose test identity controls; Settings keeps the optional local identity under progressive disclosure.
- Legacy community/institution/teacher workflows remain functional and are visibly labelled as a local simulation with some historical English-only fixture text.
- Capacitor native output was rebuilt and verified on both wrappers; generated native assets remain ignored.

See [APP_ROUTE_COVERAGE.md](./APP_ROUTE_COVERAGE.md) and `website/ROUTE_COVERAGE.md` for the detailed route/state matrix.

## Verification snapshot

- TypeScript: passed.
- Unit: 157/157 passed.
- Website Node: 17/17 passed.
- App Chromium: 24/24 default tests passed; eight opt-in connected-mode cases skipped because no connected local backend was enabled.
- Website Chromium: 43/43 passed at 320, 390, 768 and 1440px where applicable. This includes the final pause-icon, visible-world-selector and return-context regressions.
- Content and media audits: passed in preview mode; six artworks correctly remain preview-only.
- Production web build: passed.
- Native build/verification: 64 files byte-matched across Android and iOS; offline startup, no PWA worker, restricted navigation and Android privacy defaults confirmed.
- `git diff --check`: passed. No dependency tree or native generated-path noise remains in the visible diff.

## Current visual evidence

Stable final-code app captures are retained under `docs/qa/revamp-final/`. They were captured 1 October 2026 from 01:38:18–01:38:51 IST (30 September 2026, 20:08 UTC) after the final production/native builds and browser suites.

App screenshots:

- `docs/qa/revamp-final/app-revamp-today-390.png`
- `docs/qa/revamp-final/app-revamp-today-hi-320.png`
- `docs/qa/revamp-final/app-revamp-explore-returning-390.png`
- `docs/qa/revamp-final/app-revamp-life-result-390.png`
- `docs/qa/revamp-final/app-revamp-saved-390.png`
- `docs/qa/revamp-final/app-revamp-settings-768.png`
- `docs/qa/revamp-final/app-today-hi-320-viewport.png`
- `docs/qa/revamp-final/app-today-hi-320-sticky-bottom.png`
- `docs/qa/revamp-final/app-reader-hi-320-viewport.png`
- `docs/qa/revamp-final/app-saved-counts-390-viewport.png`
- `docs/qa/revamp-final/app-settings-disclosure-390-viewport.png`

Website screenshots:

- `test-results/revamp-library-320.png`
- `test-results/revamp-guide-320.png`
- `test-results/revamp-guide-hi-320.png`
- `test-results/revamp-library-1440.png`
- `test-results/revamp-guide-1440.png`
- `test-results/revamp-saved-empty-390.png`
- `docs/qa/contextual-worlds/final-pause-hanuman-1440.png`
- `docs/qa/contextual-worlds/final-pause-hanuman-390.png`
- `docs/qa/contextual-worlds/final-guide-shiva-hi-390.png`
- `docs/qa/contextual-worlds/final-guide-shiva-hi-320.png`
- `docs/qa/contextual-worlds/final-pause-return-shiva-390.png`

The five `final-*` website captures were produced from the current build on 1 October 2026 at 18:44:55–18:44:56 IST. They verify the compact share icon, initially visible selected world at narrow widths and explicit Shiva context on the return-to-guide journey.

## Limits that remain external

- Independent named editorial/tradition review beyond the owner's explicit publication attestation.
- Six IIT Kanpur Ramayana URLs remain intermittently unreachable (timeouts/502), so they are retained as citations but not described as reliably reachable. Edition-labelled alternate locators are present for those six references. The Kishkindha 4.9 IIT locator was reachable. This does not replace named human editorial review.
- Physical Android/iOS screen-reader, touch, keyboard and interruption testing.
- Connected-mode backend verification against an explicitly started local fixture or approved environment.
- Production real-user Core Web Vitals; LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 are targets, not measured results.
- App-store/native distribution, production backend integration and physical-device sign-off require separate deliberate actions.

No commerce/audio backend, AI provider, canonical full-text corpus, push, merge or public deployment was added.
