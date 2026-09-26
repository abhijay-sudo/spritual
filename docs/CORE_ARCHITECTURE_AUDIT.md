# Core architecture audit — 25 September 2026

## Evidence and scope

Read-only review of the checked-in source structure, five SQL migration files, shared contracts, the pgTAP test file and runner, and `docs/BUILD_STATUS.md`. No database migration, external integration or production operation was performed. Existing source is untracked on branch `main`, with no remote shown by Git; this audit does not establish versioned release provenance.

**Current boundary:** `/alpha` is a local demonstration. `web/src/alpha/AlphaApp.tsx` blocks any non-demo `VITE_ALPHA_MODE` with “Connection required.” Actor selection is a simulation, not authentication. The member front door and teacher fixtures must not be described as a production backend.

## Verified folder inventory

```text
app/
  web/src/alpha/
    AlphaApp.tsx             route/shell and non-demo connection gate
    Experience.tsx          consumer experience
    Wisdom.tsx, Story.tsx    scripture learning and local reading state
    Player.tsx              fixture practice playback
    Teacher.tsx             local teacher delivery UI
    domain.ts, types.ts      fixture authorization and transitions
    context.tsx, storage.ts  local persistence and private note handling
    fixtures.ts             explicitly simulated actors/content
  web/src/data/lessons.ts    three Gita samples
  packages/core/src/contracts.ts
                            SQL RPC payload contracts and playback helpers
  supabase/migrations/
    0001_foundations.sql     identity, language and organization groundwork
    0002_content.sql         rights, versioned content, approval/publish gate
    0003_money.sql           commercial ledger and transition helpers
    0004_api_surface.sql     three explicit client RPCs and exposure audit
    0005_seal_api_surface.sql
                            function grant sealing event trigger
  supabase/tests/pgtap/alpha_authorization.sql
  scripts/test-database.mjs  explicit loopback-only database harness
  scripts/payment-fixture.mjs
                            fixture verification, not payment endpoint
  tests/                    Node tests, including alpha domain/storage/payment
```

Keep this architecture for the alpha. A second scaffold or microservice split would introduce migration cost without solving an observed capacity problem.

## Existing database schema, not a deployed schema

| Area | Tables and relationships | Relevant constraints |
| --- | --- | --- |
| Language/review | `app.languages`, `reviewers`, `reviewer_languages` | Language key; reviewer-language composite primary key; reviewer auth ID unique when set |
| Membership | `organizations`, `memberships`, `profiles` | Organization seat cap 1–500; unique organization/user membership; revocation timestamp; optional language/tradition |
| Rights | `partners`, `rights` | Licensor FK; term and territory/language fields; redistribution/edit/AI/copy flags; provisional grant requires expiry |
| Content | `practices`, `practice_versions`, `segments`, `segment_glosses` | Unique slug, practice/version, version/ordinal and segment/language; source citation required; positive segment duration; allowed duration selections 3/5/10 |
| Editorial evidence | `version_language_approvals`, `corrections` | Unique version/language approval; reviewer references; public correction flag |
| Offers | `products`, `product_prices` | Minor-unit prices; currency format; product/currency/country uniqueness; historical seeded offers, not approved live pricing |
| Payment/access | `payment_events`, `entitlements`, `entitlement_transitions`, `entitlement_events` | Unique provider/event; unique origin event/seat; ordered entitlement dates; transition ledger; row lock in transition helper |
| Operator surface | `ops.api_allowlist` | Signature key with intended recipient roles |

Three RPCs are explicitly granted: `app.fn_catalog(text)` and `app.fn_practice_document(uuid,text,integer)` to anonymous/authenticated callers; `app.fn_me()` to authenticated callers. `packages/core/src/contracts.ts` models their content and identity payloads. Its `mapPracticeDocument` maps field names; TypeScript types are not runtime validation of untrusted server JSON.

The separate alpha types include cohorts, invitations, cohort membership, grants, completions and delivery audit records. These are **not persisted by the existing SQL schema**. Do not assume that the shared RPC contracts are already an authenticated adapter for those alpha types.

## Important findings from source inspection

These are code observations, not reproduced database exploit claims; SQL has not been executed in this review.

1. **Resource authorization is missing in public content RPCs.** In `0004_api_surface.sql`, catalogue/document selection checks published state and a language approval but not the caller’s grant, a free/public classification, cohort assignment, current rights validity or territory. `fn_has_access` in `0003_money.sql` is a global boolean and does not repair these queries. Publication is not permission to serve all material publicly. Keep these RPCs disconnected from real paid/licensed content until a resource-scoped gate is implemented and tested.
2. **Publication checks are incomplete and do not continuously protect delivery.** `fn_can_publish` checks expiry/language/audio/segments/approval, but omits rights `term_start`, redistribution permission and territory. `guard_publish` is a `BEFORE UPDATE` trigger only, so an insert already marked published does not run that trigger. Changes to approved content, glosses or rights do not automatically revoke the existing approval. Published-state updates also bypass the transition guard. Clients currently lack direct table privileges, but future administrative writers must preserve these invariants rather than assume this trigger is sufficient.
3. **Reviewer identity is not enforced by the existing approval table.** `approved_by_auth_user` is recorded, but this migration does not constrain it to the referenced reviewer’s identity or the authenticated session. A privileged writer can insert any non-null UUID. A server-side review operation must bind identity and freeze the reviewed revision before a real “reviewed by” claim.
4. **Capacity enforcement is only promised in prose.** `0001_foundations.sql` mentions `fn_claim_seat`, but no such implementation exists in migrations 0001–0005. There is no transactional invitation redemption/cohort join in SQL. A local JavaScript capacity check cannot settle competing last-seat requests.
5. **RLS comments overstate protection.** Application tables enable and force RLS, but these migrations define no policies. A normal owner subject to FORCE RLS can see no rows; a superuser/BYPASSRLS function owner can bypass it. Therefore a deployment’s actual function ownership and role privileges determine behavior. Explicit RPC checks and tests under actual roles are required; the comment claiming FORCE always restrains SECURITY DEFINER is not sufficient evidence.
6. **Identity memberships can disappear when a profile is absent.** `fn_me()` builds its result from `profiles`; its no-profile fallback returns an empty membership list even if memberships exist. Auth provisioning must either enforce profile creation atomically or query memberships independently.
7. **Several schema details need adversarial tests before commerce.** The nullable `country` unique key can allow multiple default price rows under ordinary PostgreSQL NULL uniqueness. `fn_has_access` uses `coalesce(grace_until,effective_to)` for both active/grace states, so stale grace values can alter effective access. The schema does not validate grace bounds. These are not exercised by the current 20-assertion authorization file.

## Privacy and rights boundaries

- Keep reflections private, opt-in, user-scoped and explicitly disclosed as local/unencrypted. Teacher community membership does not grant access to private notes or personal practice history.
- Preserve original source, transliteration and clearly unreviewed interpretation. Fixture approvals do not establish human review or content rights.
- Do not infer religious affiliation from reading history. Keep spiritual content preferences and notes out of analytics/log payloads. Existing repository legal classifications are conservative project policies, not independently verified legal advice.
- Do not expose a service-role secret through `VITE_*`, client storage or generated browser code. A selected demo actor is never a server identity.
- Consent-specific sharing must expose only the item the user chooses. No automatic invitations, contact upload, public completion history or notification subscription.
- Payment state must come from verified, durable server events, never a client success screen. Existing seeded prices and provider enum values do not mean live approval/integration.

## Exact verification state and integration blockers

Executed `node app/scripts/test-database.mjs` from the workspace root. It exited with: **“Blocked: set DB_URL explicitly to a disposable local Supabase PostgreSQL database. No database was contacted.”** `command -v psql supabase docker pg_prove` found none on PATH in this shell. The pgTAP file contains 20 planned assertions; none ran in this audit. No application tests or UI checks were run by this audit task.

To establish a real backend, independent engineering remains necessary even after tools/credentials become available:

1. A disposable local database with existing migrations and pgTAP applied deliberately, followed by role/owner inspection and execution of the current harness.
2. An authenticated adapter, session lifecycle, callback/recovery path and email delivery test environment; demo role selection must remain isolated.
3. Tenant/cohort schema and server transactions for invitation redemption, release scheduling, completion and membership revocation. Store invitation token hashes, enforce recipient/expiry/replay atomically, and lock capacity allocation.
4. Resource-specific public/free/entitled access; current rights and publication checks on every content/media delivery; independently attributed review of immutable revisions.
5. Private approved-media storage with short-lived authorized delivery, withdrawal/expiry enforcement and deliberate offline rules.
6. Server webhook endpoint, raw-body signature verification, durable unique event processing and entitlement updates in one transaction. Provider test charges/refunds and reconciliation must prove the outcome before live commerce.

These are production prerequisites, not silently substituted demonstrations. No provider credentials, production migrations, payments or content rights were requested or fabricated in this audit.

## Scale path and release evidence

“Millions of concurrent users” is not established by a folder structure or schema. This repository has no measured throughput, real database query plans, connection-pool limits, cache hit rates or load test results. Keep a modular monolith initially: static app assets via CDN, indexed transactional PostgreSQL for authoritative state, and separately authorized object storage for media. Move only demonstrated bottlenecks.

After correctness gates pass, add bounded/paginated catalogue queries, connection pooling, idempotency keys, retry-safe background work, privacy-preserving operational metrics, and cache invalidation keyed to content revision and rights expiry. Public approved catalogue metadata can be cached; personalized entitlements and notes must not enter shared caches. Partition event histories only when measured volume warrants it. Every additional RPC must be explicitly granted and audited.

Release evidence should include cross-tenant denial, expired/revoked rights, anonymous versus paid reads, missing profiles, invite replay, concurrent last-seat joins, out-of-order refunds, direct draft access, and content edits after approval. Then measure latency/error rates against a declared workload using synthetic identities and representative media sizes. Document actual supported capacity; do not convert a design aspiration into a “production-grade” or “zero-vulnerability” claim.
