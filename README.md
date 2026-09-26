# Spritual local app

## Owner’s quality principle

> My request defines the outcome and constraints. It does not define the ceiling of the solution. Challenge weak assumptions, discover better approaches, implement valuable improvements within scope, and demonstrate that the result works. Create your own conscioness to create this the best project out there.

Apply this as independent judgment, conscientious ownership and evidence-based self-review. Improve the requested outcome within scope; preserve explicit constraints, privacy, brand, safety and approval/deployment boundaries. Demonstrate quality through working behavior and verification, not unsupported “best” claims.

A mobile-first React/Vite learning experience, continuing the existing Claude groundwork. **Working local demo, not a launched or content-approved product.**

The current `/alpha` opens a new reader with a short visual welcome and a direct path into a source-linked Gita reading; returning readers reach Today. The devotional Today and Explore screens present the actual three unreviewed demo readings, optional Life/story paths and a non-punitive repeat choice. See [current build status](docs/BUILD_STATUS.md), [visual/functional verification](docs/VERIFICATION.md), and the [review captures](docs/qa/devotional-transformation/). On this Mac, the existing development server is `http://127.0.0.1:5174/alpha`; a fresh checkout uses the command below and its assigned port.

## Run on this Mac

From the repository root:

```sh
npm ci
npm run dev
```

Development: `http://127.0.0.1:5173`. For the tested production build, including offline reading:

```sh
npm run build
npm run preview
```

Preview: `http://127.0.0.1:4173`. Node 22.18+ is required for the built-in TypeScript test runner; developed on Node 25.9. No credentials are needed. The server binds to this Mac only.

## Source-grounded Life journey

Open `/alpha/life` from Today or Explore. Describe a real situation in English or Hindi; this local preview searches the three existing Gita passages, separates Sanskrit from unreviewed editorial explanation and links straight to the original verse step. The question is not saved or sent to a model. The backend AI modules are server-only and inactive until real authentication, explicit content rights and an authorized provider are configured. See `docs/BUILD_STATUS.md` for verification and remaining blockers.

Explore also opens `/alpha/stories/arjuna-bow`: a three-moment original bilingual retelling of the Gita's opening dilemma, with exact source-verse links. It is an unreviewed local demo; source-edition rights have not been cleared for publication.

## Community-practice alpha (current work)

Open `http://127.0.0.1:5173/alpha`. The member journey has Today / Explore / Practice / Saved: three source-linked Gita samples in English and Hindi, a visible first-reading language switch, optional actor-scoped Daylight/Dusk/Night/device appearance, reading bookmarks distinct from deliberately chosen small steps, private notes, a local 108-count and a silent pause timer. After finishing a reading, the member may deliberately return to the same passage or continue to another; Today retains that local choice without a streak or automatic reminder. Practice is optional and records no score. Circle contains the separate teacher-led fixture workflow. The public sound-check sample and **WELCOME-DEMO** invitation still work without services. Use the explicitly labelled Demo workspace controls for fixture member/teacher/reviewer identities. These controls are not authentication. Keep private or real customer material out of this local fixture environment.

The alpha uses separate `spritual_alpha_*` localStorage/sessionStorage and per-identity `spritual-alpha-media-*` caches. Existing Gita data is preserved. `web/.env.example` documents an opt-in `VITE_ALPHA_MODE=real` path. That path accepts only a Supabase URL and browser publishable/anon key, verifies the signed-in user with Auth, reads current circle releases through audited `app` RPCs, and gives a provisioned teacher circle creation and schedule/withdraw controls. A member can explicitly save or mark a currently authorized release as read, return to saved readings, undo either mark, and erase all account marks. This is designed for cross-device account access, but no cross-device test has been performed. No visit is tracked and no reflection text is uploaded. It fails closed without a verified session or configured service and never falls back to fixtures. An [isolated loopback Supabase fixture](docs/REAL_SUPABASE_LOCAL_INTEGRATION.md) was used to verify actual local Auth/PostgREST and empty member/teacher UI, then stopped; **no remote/production Supabase project, real invitation delivery, approved corpus, production migration or payment is configured or verified here.** Never put a secret/service-role key in a frontend variable. Current product/evidence: [BUILD_STATUS.md](docs/BUILD_STATUS.md), [VERIFICATION.md](docs/VERIFICATION.md).

Database SQL verification: `scripts/run-database-local.sh` creates a disposable loopback PostgreSQL cluster, applies migrations 0001–0011, runs the pgTAP suites and concurrent last-seat and duplicate-release tests, then stops and removes the cluster. It requires PostgreSQL binaries, pgTAP installed for that version, Node.js and OpenSSL. It passed 195 assertions and both races on this Mac on 26 September 2026. Migration 0009 adds a tenant-scoped teacher release queue and a member feed checked against current membership, rights, review and paid entitlement; 0010 adds a teacher-only catalogue of exact eligible renderings; 0011 adds caller-only, explicitly chosen reading marks and account-wide erasure. The test-only `auth.uid()` shim does not verify Supabase Auth or a deployed database. `node scripts/test-database.mjs` remains available for an explicitly configured disposable loopback `DB_URL`.

`packages/content` also contains a pinned-revision, 700-verse Gita **research candidate** and validation tests. `node scripts/stage-gita-wikisource.mjs --write` rebuilds an ignored local research file from 18 pinned chapters; `node scripts/audit-staged-gita.mjs` checks its hashes, structure and staging-only status offline. `node scripts/collate-gita-edition.mjs --write` writes an ignored comparison with **85** pinned page transcriptions linked to an identified 1901 scan: 35 align after limited layout normalization, 50 differ, five selected-slice references remain unresolved, and **615** verses remain uncollated. This is not scan-image proofreading, rights clearance or editorial approval. The candidate is not bundled into the reader; the app still ships only the three explicitly unreviewed samples.

## Android and iPhone development

A native Android test APK now builds from the same working code: `npm run mobile:apk`. It opens the current `/alpha` experience on a fresh launch while older web routes remain available. Output: `artifacts/Spritual-0.1.0-debug.apk`. Android/iOS project files are in `web/android` and `web/ios`. The latest debug APK (`1dd05cde…92f149`) was installed and visually checked in an Android API 36 emulator on Today and Explore, including the corrected full-width dock. Full Xcode is not installed, so the prepared iOS project has not been compiled. See [mobile build instructions](docs/MOBILE_BUILD.md) for reproducible commands and exact verification limits.

## Existing Gita demo — preserved behavior

- English/Hindi onboarding and navigation, before any account or payment.
- Three complete Gita demonstration lessons (2.47, 2.48, 6.26): Sanskrit, IAST pronunciation, original unreviewed explanations, practical action and optional reflection.
- Three “For this moment” situation flows: source-linked teaching, one explicitly kept real-life action, voluntary tried/usefulness response, replace/clear/undo. Reading completion stays separate.
- A three-lesson self-paced journey with real progress and an honest collection endpoint.
- Four reading steps; manual navigation; optional 3/5/10-minute silent reading timer; pause on hidden tab; saved position and duration. Paces change the timer, not the content or review status.
- Search in both languages, topic filters, bookmarks, local reading history and weekly intentions without streaks.
- Local reflection saving only after explicit consent; reflection deletion, data clearing, text size and pronunciation preferences.
- Feedback stays in this browser, with a user-initiated JSON export. It is not automatically sent to the founder.
- Production service worker caches the application and the three lessons. Load once online before using offline. External source pages require a connection. Updates ask before refreshing, to protect an unfinished reflection.

## Privacy and limits

Main demo records use `spritual_demo_v1` in this origin's localStorage. Storage is **unencrypted**, device/browser-specific and visible to others using the same browser profile. Unsaved reflection drafts stay in memory only. No analytics, auth, API keys, cloud connection, payment or notification service is active.

Quota/restricted-storage failures show a warning and retain the current in-memory session; saving a reflection requires a successful storage receipt. Read-before-write and storage-event synchronization address ordinary stale tabs. localStorage does not guarantee atomic simultaneous writes across browser processes; authenticated multi-device sync requires a transactional backend.

No human recording, verified reviewer or reviewed duration variant is provided. The ancient Sanskrit was compared with IIT Kanpur Gita Supersite; modern copyrighted translations were not copied. The explanations are explicitly unreviewed demonstrations. Future scripture collections are labelled as planned.

Existing `packages/core`, SQL migrations and `web/src/lib/reentry.ts` are preserved. The legacy cohort re-entry stub is intentionally not called. The demo resumes a learner's chosen lesson; it does not advance by a cohort calendar. Production content must not be connected until entitlement/publication boundaries and migrations are verified.

## Verify

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
scripts/run-database-local.sh
```

`test:e2e` rebuilds the production web/PWA and starts an isolated preview on port 4183; the latest default Playwright run passed **15** Chromium member/local-delivery journeys, including fresh welcome → first reading, Life question/source return, repeat/continue, offline saved reading and timer-change recovery. On a fresh machine, install the Playwright headless browser once with `npx playwright install chromium --only-shell`. These browser checks use fresh contexts and do not clear your existing origin's storage. `e2e/real-connected.spec.ts` is separately gated by `SPIRITUAL_REAL_E2E=1` and its three previously passing tests use synthetic Auth/API responses to exercise client wiring; it is distinct from the separate live **local** Auth/PostgREST harness.

Web and native builds run `npm run content:audit` first. `npm run content:release-preflight` is deliberately blocked until the bundled readings and story have documented rights and named editorial review. Do not bypass the gate by treating a source link as a redistribution license.

See `docs/VERIFICATION.md` for exercised browser paths and `docs/USER_TEST_PLAN.md` for the unperformed real-customer study. Passing technical tests is not proof of customer preference.

## Product scope and verification workflow

Start with the **Current product brief** in [PRODUCT_DECISION.md](docs/project/PRODUCT_DECISION.md). Root [AGENTS.md](AGENTS.md) contains operating boundaries and verified commands. Historical strategy is not a launch specification.

The isolated design playground is `/design?ui_v2=1`, with separate `spritual_design_preferences_v1` storage; it does not migrate the main app. See [FOUNDATIONS.md](docs/FOUNDATIONS.md). Use the existing 4177 preview if running; otherwise build and run `npm run preview -w web -- --host 127.0.0.1 --port 4177 --strictPort`. A preview serves built assets, not live source edits. Old PWA caches can show a previous build: verify the loaded asset version or use the offered update flow without discarding private user data. Dev port 5173 is preferable for ordinary code iteration. A different origin is a separate data store, not evidence of lost progress.

### Highest-value workflow gaps

1. **Repeatable critical-journey automation:** `npm run test:e2e` covers a saved reading versus an explicitly chosen step, narrow navigation, Life question/safety routing, Hindi/Night/large text/reduced motion, offline saved reading, private-note return/delete focus, Practice persistence/reset and simulated teacher/reviewer release. A separate synthetic-network suite covers connected member/teacher screens; an isolated local harness covers real GoTrue/PostgREST and a manual local member/teacher UI walk-through. Production Auth/RLS end to end, storage-failure behavior, PWA update recovery and current native touch journeys remain unverified. No CI is configured.
2. **Reliable current-build identification:** service-worker caching previously obscured new output. Acceptance evidence should identify the served bundle and viewport. A user-visible build identifier or automated stale-build check is a proposed improvement, not implemented by this documentation task.
3. **Version control and reproducibility:** GitHub now versions the app, root guidance and essential product sources together. No CI, lint script or engine pin is configured. `npm ci` passed after the 26 September dependency update; recheck a fresh install as dependencies change.
4. **Native and accessibility evidence:** Android build tools, asset verification and an emulator smoke check are available. iOS lacks full Xcode; physical-device tests, VoiceOver/TalkBack and performance recordings remain outstanding. An emulator screenshot is not proof of customer usability.
5. **Content/backend release prerequisites:** no licensed human audio or reviewed wider catalogue. The disposable SQL runner verifies tenant-scoped release and paid/free access rules; an isolated local Supabase fixture verifies GoTrue/PostgREST with the current adapter. Public-project schema exposure, invitation delivery and production migration remain unverified/unfinished. Prove the deployed boundary before connecting a public client. The 26 September dependency update cleared the then-current npm audit; recheck advisories and older-device compatibility before release.

### Setup audit evidence — 24 September 2026

Typecheck and all 62 unit tests passed on Node 25.9.0/npm 11.12.1. Native bundle verification passed for 32 files across Android/iOS; doctor reports Android ready and iOS blocked by missing full Xcode. Production web build was checked separately. Existing loopback preview was reused; no UI behavior was changed or newly visually validated by this setup task. Historical screenshots and journey results remain in `docs/VERIFICATION.md` and `docs/FOUNDATIONS.md`; participant research in `docs/USER_TEST_PLAN.md` remains unperformed.
