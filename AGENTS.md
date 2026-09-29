# Spritual — outcome-driven development

## Owner’s quality principle

> My request defines the outcome and constraints. It does not define the ceiling of the solution. Challenge weak assumptions, discover better approaches, implement valuable improvements within scope, and demonstrate that the result works. Create your own conscioness to create this the best project out there.

Apply this as independent judgment, conscientious ownership and evidence-based self-review. Improve the requested outcome within scope; preserve explicit constraints, privacy, brand, safety and approval/deployment boundaries. Demonstrate quality through working behavior and verification, not unsupported “best” claims.

## Current execution authority
- The owner's 27 September `Spritual_Ultra_Max_Next_Steps_Superprompt.md` in Downloads now sets the **target product direction**: one calm consumer application connecting life questions, scripture, stories, divine forms, themes, reflection and optional source-grounded AI. The teacher/community model remains an optional existing capability, not the primary positioning. This changes product direction but does not approve any content, AI provider call, production migration, tracking, payment or deployment. The target is not a claim that the current app delivers the whole system. See the current opening of `docs/project/PRODUCT_DECISION.md` and `docs/BUILD_STATUS.md`.
- The owner's 27 September Phase II directive (`/Users/abhijay/.codex/attachments/a1d09159-658d-4579-9295-f925607fd492/Pasted text.txt`) authorizes a generic Sanatan knowledge graph and connected Explore → Divine → story/source/search/Saved journeys inside the existing `/alpha`. The current graph is a bilingual **local editorial preview**; migration `0012` is a private draft schema, not a live CMS or public catalogue. Continue to require exact-edition rights and named human review before publication or AI use.
- The owner's 27 September visual directive (`Spritual_God_Level_Visual_UX_Superprompt.md` in Downloads) guides the current `/alpha` art and experience preview within those same boundaries. Six registered images remain unreviewed and rights-unverified; `docs/ART_DIRECTION.md` and `docs/VISUAL_COVERAGE.md` record the art rules and route coverage.
- The owner’s latest devotional UI directive (`docs/project/DEVOTIONAL_UI_DIRECTIVE.md`, 26 September) guides the current default member experience: fewer surfaces, meaning-first reading and restrained motion. It supersedes the earlier calm brief’s visual direction while preserving its privacy, content and product boundaries. `docs/project/Spiritual_Codex_Master_Prompt.md` remains the original alpha execution brief; the primary product source is `docs/project/Spiritual_Strategic_Blueprint.pdf` (36 pages, 22 September 2026).
- The earlier engineering-forward adaptation authorized a bounded community-practice alpha and isolated demo fixtures. Its institution-first positioning is historical under the newer consumer direction; its privacy, rights and release limits remain active. No deployment, real charge/invitation, production migration or native/store release is authorized by local work.
- Current implementation is `/alpha`, isolated in `web/src/alpha`; the native wrapper opens this route from a fresh launch while legacy web routes remain available. Default demo roles are simulation, not authentication. `VITE_ALPHA_MODE=real` has a separate fail-closed Supabase Auth/RPC member and teacher path. An isolated **local** Supabase Auth/API fixture outside this checkout has been tested; no remote/production project or repository credentials are configured. It never substitutes demo content when verification or current access is missing. No production migration, invitation delivery, real charge or provider call is authorized by this local work.
- Read `docs/BUILD_STATUS.md` for current capabilities/blockers and the current opening of `docs/project/PRODUCT_DECISION.md` for product scope. Old handoff sections are historical.

## Work and scope
- Own the requested user outcome: inspect the affected journey, define observable acceptance criteria, implement valuable reversible improvements in scope, and verify them. For consequential choices, briefly compare a simpler option and a stronger alternative; avoid ceremony for small fixes.
- Preserve user changes, brand/logo and working features. No new scaffold or major architecture change without agreement. Ask before changing product direction, pricing, sensitive-data collection, paid services, destructive operations or production state unless explicitly authorized.
- Use one primary agent by default. Reuse running servers; stop only processes you started. Report implemented, tested, visually inspected and deployed separately. Evidence beats arbitrary quality scores.

## Location and commands
This repository root is the Git and npm root. Run commands here. Inspect `git status --short`, branch and remotes before edits. Preserve existing work; do not reset, clean or overwrite it. Never commit credentials, dependencies or generated native builds.

Node 22.18+ is documented for direct TypeScript tests; the current Vite 7 toolchain needs Node 20.19+ or 22.12+. This Mac is verified on Node 25.9.0/npm 11.12.1. `npm ci` passed after the 26 September dependency update; do not reinstall an already working checkout unnecessarily.

| Command (in repository root) | Purpose / limits |
| --- | --- |
| `npm run dev` | Vite on loopback port 5173, strict port |
| `npm run typecheck` | TypeScript validation; passed in setup audit |
| `npm test` | Node TypeScript unit suite; 157 passed on 29 September after connected story-session and link validation |
| `npm run content:audit` | Fail the build if bundled demo content gains unsupported review, rights or AI-use claims |
| `npm run content:release-preflight` | Expected to block public release until exact-version rights and named editorial review are recorded |
| `npm run media:audit` | Check local image files, responsive variants, bilingual alt/provenance and required graph mappings; current assets warn as unreviewed |
| `npm run media:release-preflight` | Expected to block the six assets until rights and named human review are recorded |
| `npm run build` | Content and media audits, TypeScript and Vite production/PWA build |
| `npm run test:e2e` | Rebuild and run isolated Chromium demo journeys on port 4183; the latest complete default run passed 21/21, with seven connected-mode cases skipped at that run. Eight focused connected cases passed separately after adding the corrupt-storage case, with `SPIRITUAL_REAL_E2E=1` and synthetic network responses. Fresh install needs `npx playwright install chromium --only-shell`. |
| `npm audit` | Current lockfile reported zero advisories on 26 September after compatible router/Vite/PWA updates; recheck before release, and do not treat this as a security guarantee. |
| `npm run preview` | Built `web/dist` on loopback port 4173; build first |
| `npm run preview -w web -- --host 127.0.0.1 --port 4177 --strictPort` | Current alternative preview; reuse if already running |
| `npm run mobile:doctor` | Readiness only; Android ready, full Xcode absent at audit |
| `npm run mobile:verify` | Compare existing native assets/config; passed, not a device test |
| `npm run mobile:apk` | Build/sync native assets and compile Android debug APK; optional native scope, not store release |
| `scripts/run-database-local.sh` | Disposable loopback PostgreSQL + pgTAP through migration 0015; 257 assertions plus last-seat and duplicate-release races passed locally on 29 September. Test auth shim is not Supabase Auth. |
| `node scripts/test-real-supabase-local.mjs` and `node scripts/test-real-spiritual-local.mjs` | Opt-in isolated local GoTrue/PostgREST integration; respectively 20 circle and 16 graph checks passed after migrations 0001–0015. Requires the external CLI/Colima fixture and loopback services; see `docs/REAL_SUPABASE_LOCAL_INTEGRATION.md`. Not production tests. |
| `node scripts/audit-staged-gita.mjs` | Audit the ignored 18-chapter/700-verse research file; staging is not publication or rights approval. |
| `node scripts/collate-gita-edition.mjs` | Compare 85 pinned 1901-scan-linked page transcriptions against the staged candidate; 615 verses remain uncollated, and this is not scan-image proof or rights clearance. |

`node scripts/test-database.mjs` remains available with an explicit disposable loopback `DB_URL`. PostgreSQL/pgTAP development tools are installed on this Mac; seven rollback-only suites pass 257/257 after clean local application of migrations 0001–0015. These SQL checks use a test identity shim. A separate isolated local GoTrue/PostgREST fixture passed 20/20 circle and 16/16 graph checks on 28 September after migration 0015; it was not rerun for the 29 September UI-only story change. No production migration was applied. A minimal GitHub Actions workflow runs Node/typecheck/build/default browser checks; no lint command is configured. Use checks proportionate to the change; UI changes also need running-browser inspection. A build alone does not prove usability. Cached PWA output may be stale: check the served bundle/update state before judging screenshots; do not clear a user's storage to fix it. Different ports have separate saved data.

For an isolated connected UI check, build with `VITE_ALPHA_MODE=real VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test_fixture npm run build`, then run `SPIRITUAL_REAL_E2E=1 npx playwright test e2e/real-connected.spec.ts e2e/real-knowledge.spec.ts`; restore the ordinary demo build afterward. This exercises synthetic network fixtures only. The separate live **local** Auth/PostgREST harness and real UI inspection use the isolated CLI/Colima fixture documented in `docs/REAL_SUPABASE_LOCAL_INTEGRATION.md`; no production service is implied.

## Application conventions and boundaries
- React 18/Vite/React Router in `web`; `src/pages` are existing journeys, `context.tsx` and `lib/localStore.ts` own demo state, `data/lessons.ts` holds three Gita samples. Preserve source/IAST and explicitly unreviewed meanings.
- New foundations live in `src/design`, opt-in at `/design?ui_v2=1`. Legacy routes stay intact. Main demo storage is `spritual_demo_v1`; foundations preferences are separate. Preserve schema compatibility and unsaved drafts.
- Reflections are private, local and unencrypted; save/share needs specific consent. No inferred faith profiles, blanket membership sharing, pre-consent tracking or fabricated reviewer approval. Completion is not comprehension; no punitive streaks or missed-day counts.
- Demo is not licensed/reviewed production content. Human audio, reviewed duration variants, wider published scripture, live AI, production-verified auth and real paid access are not present. Alpha uses an original synthetic sound-check fixture. Reading and Practice timers are silent; astronomical sky is not a tithi calendar.
- Phase II graph fixtures in `packages/content/src/knowledgeGraph.ts` add Krishna, Hanuman and a Shiva source pointer, one new original Hanuman retelling, scripture/work and source-context navigation, and local search. These are not a licensed public corpus. `0012_spiritual_graph_drafts.sql` is private; migrations 0013–0015 add a separate rights-gated public projection and account Saved IDs without seeding religious records or completing an editor CMS. Connected story place/action is device-only and must remain distinct from cross-device account Saved.
- SQL/contracts and the opt-in connected adapter have local Auth/PostgREST evidence, not evidence of applied production migrations, deployed identity, safe live entitlements or approved content. Reverify schema exposure, publication versus free/paid authorization and access boundaries with any public project before client/payment integration. Recheck official billing/privacy/platform rules when implementing them.
- Preserve current design and language behavior; use purposeful motion, reduced-motion support, keyboard/focus access, readable Indic text and responsive layouts. Inspect relevant loading, empty, error, disabled, success and recovery states.

## Read by relevance, not ritual
- `docs/project/PRODUCT_DECISION.md` **Current product brief** is the concise working scope; the rest is historical rationale, not verified commercial state.
- `docs/project/ASTRA_HANDOFF.md`: read the latest status when resuming, and older sections only for the affected area. Update the top when delivering meaningful changes; do not reread the entire archive each task.
- `README.md`: setup, capabilities, workflow gaps. `docs/VERIFICATION.md`: historical browser evidence. `docs/USER_TEST_PLAN.md`: unperformed participant study.
- UI work: the latest devotional member status is at the top of `docs/BUILD_STATUS.md` and its browser evidence in `docs/VERIFICATION.md`. `DESIGN.md` describes legacy design; `docs/FOUNDATIONS.md` describes opt-in foundations. `docs/MOTION_OVERHAUL.md` is a historical 25 September delivery snapshot, not the current member UI specification. Preserve legacy routes and avoid punitive streaks.
- Backend work: `packages/core`, `supabase/migrations` and `supabase/tests`; inspect before integration.
- Earlier institution pilot (`docs/project/PRODUCT_DECISION.md`, requirements), strategy, pricing and role-play evaluations are historical proposals. The newest owner direction selects a consumer, multi-source spiritual learning product while preserving the optional teacher workflow. Do not treat simulated judges as employees/interviews. Current product brief controls conflicts; prices, demand, provider approval and content rights remain unknown.
