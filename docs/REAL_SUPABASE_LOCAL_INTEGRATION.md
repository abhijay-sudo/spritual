# Disposable local Auth + API integration check

**Verified 26 September 2026; stopped after QA:** An isolated Supabase CLI project was run on this Mac under `/Users/abhijay/.local/share/spritual-supabase-auth-check`. Its dedicated Colima profile is `spritual-auth`; the user's default Docker context was not activated. When started, the API, database and captured-email inbox listen only on `127.0.0.1:54321`, `:54322` and `:54324`. Migrations 0001–0011 were applied to its fresh local database. After the checks, the real-mode Vite server on 5175, isolated Supabase project and dedicated Colima profile were stopped; only the pre-existing default demo servers on 5173/5174 remained listening. This is not a deployed Supabase project or a public content release.

To restart only this saved local fixture before rerunning tests or the connected UI:

```sh
colima --profile spritual-auth start
export DOCKER_HOST=unix:///Users/abhijay/.colima/spritual-auth/docker.sock
cd /Users/abhijay/.local/share/spritual-supabase-auth-check
supabase start --exclude realtime,storage-api,imgproxy,postgres-meta,studio,edge-runtime,logflare,vector,supavisor
```

The CLI project and its data remain outside the repository. Do not run `supabase db reset` or print/commit service-role credentials to recreate the UI state.

From the Git/npm root (`app/`), rerun the live integration check without placing any local keys in this repository:

```sh
export DOCKER_HOST=unix:///Users/abhijay/.colima/spritual-auth/docker.sock
export SPIRITUAL_LOCAL_SUPABASE_DIR=/Users/abhijay/.local/share/spritual-supabase-auth-check
node scripts/test-real-supabase-local.mjs
```

The test requires the local Supabase CLI, running Docker-compatible runtime, Postgres `psql`, and the project's installed `@supabase/supabase-js`. It refuses non-loopback API, database and Mailpit URLs. It creates random synthetic accounts and an organization, then removes them. It currently verifies 20 live GoTrue/PostgREST checks: email signup and JWT verification, app-schema identity RPC, provisioned teacher circle creation, recipient-bound invitation and seat claim, direct-table and `ops` denials, empty rights-gated catalogue/feed, private progress and erasure, and a six-digit code delivered through Mailpit and verified by GoTrue. This covers real local Auth/API wiring, not deployment, content rights, payment or a live UI journey.

The original isolated **local** Supabase PostgreSQL database was checked separately with pgTAP enabled. All five rollback-only suites passed **195/195**: 21 authorization, 30 knowledge-corpus, 38 circle-seat, 59 delivery and 47 member-progress assertions. Sampled tables contained no synthetic test rows afterward. For guarded concurrency checks, a separate disposable `spritual_test` database and `spritual_test_admin` role were created inside the isolated local Supabase container. The **unchanged** `node scripts/test-database.mjs` harness passed **195/195** again plus the last-seat race (one committed claim) and duplicate-release race (one active release committed). The disposable database/role were verified absent before creation and absent after cleanup. The SQL suites use a test identity shim, distinct from the 20 live GoTrue/PostgREST checks on the original fixture. None of this establishes production Auth, a deployed schema or public-client entitlement safety.

For a separate connected UI inspection, source the **publishable-key-only** environment file outside the repository and start Vite on free port 5175:

```sh
source /Users/abhijay/.local/share/spritual-supabase-auth-check/local-web-env.sh
npm run dev -w web -- --host 127.0.0.1 --port 5175 --strictPort
```

Open `http://127.0.0.1:5175/alpha/today`. The local-only teacher and member emails, circle ID and one-time invitation token are in mode-600 `/Users/abhijay/.local/share/spritual-supabase-auth-check/local-ui-qa-fixture.json`. Use an email on the app's sign-in screen, read its six-digit code from [the local Mailpit inbox](http://127.0.0.1:54324), and enter the code in the app. **The original UI-QA member already claimed the one-time local token** and should see **Local empty circle** with no readings; do not expect that token to claim a second time. The teacher is provisioned for **LOCAL AUTH TEST - NO APPROVED CONTENT**, and should see an empty release queue. Do not treat these fixture identities as real invitations, paid access, human review or content approval. No scripture or fabricated approval was seeded.

The current isolated CLI config exposes `app` through `[api].schemas = ["public", "app"]` while keeping `ops` unexposed. It enables GoTrue, PostgREST, Kong and Mailpit, captures mail locally, and uses a local-only six-digit `{{ .Token }}` magic-link template. Redirects allow the local app on ports 5173–5175. The CLI project and credentials live outside the Git checkout. To inspect the local publishable key without copying secret/service-role keys, read `local-web-env.sh`; do not commit `supabase status` output or the fixture JSON.

If the stack must be recreated, follow [Supabase's local CLI setup](https://supabase.com/docs/guides/local-development/cli/getting-started) with a Docker-compatible runtime in a separate directory, copy this repository's migrations into that project's `supabase/migrations/`, expose `app` via the [local API config](https://supabase.com/docs/guides/local-development/cli/config), and start only GoTrue, PostgREST, Kong, Postgres and Mailpit on a Docker network bound to `127.0.0.1`. [Supabase documents Mailpit](https://supabase.com/docs/guides/local-development/cli/testing-and-linting) for captured Auth mail and a `{{ .Token }}` template for [email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless). Do not initialize or reset the repository's existing `supabase/` directory to perform this check.

**After UI QA is finished**, stop only this isolated project with `DOCKER_HOST=... supabase stop` from its own directory, then `colima --profile spritual-auth stop`. Do not use `supabase stop --all` or `--no-backup` unless the local fixture data is deliberately disposable. Do not stop the stack while another agent is inspecting it.
