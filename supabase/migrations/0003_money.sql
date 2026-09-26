-- 0003_money.sql
-- Payments and entitlements.
--
-- THREE RULES THIS FILE ENFORCES STRUCTURALLY
--   1. Legal state moves are ROWS in app.entitlement_transitions, not branches in code.
--      An illegal move is a foreign-key violation. Adding a state cannot silently
--      permit a transition nobody reasoned about.
--   2. Payment application is idempotent at two levels: a unique index on the
--      provider's event id, and a unique index on the *effect*. Fifty concurrent
--      replays of one webhook produce exactly one entitlement.
--   3. A refund revokes only the entitlement descended from the refunded payment.
--      A consumer refund never touches an institution seat.
--
-- Money is stored as integer minor units with an explicit currency. Never float.

create type app.entitlement_state as enum
  ('pending', 'active', 'grace', 'expired', 'refunded', 'revoked');

create type app.payment_provider as enum
  ('bank_transfer', 'razorpay', 'cashfree', 'apple', 'google');

-- ---------------------------------------------------------------------------
-- Products. What can be sold. Prices live here, never in client code.
-- ---------------------------------------------------------------------------
create table app.products (
  code              text primary key,             -- 'intl_individual_annual'
  display_name      text not null,
  seat_cap          integer not null check (seat_cap between 1 and 500),
  duration_days     integer not null check (duration_days > 0),
  auto_renews       boolean not null default true,
  is_active         boolean not null default true
);

create table app.product_prices (
  id                uuid primary key default gen_random_uuid(),
  product_code      text not null references app.products(code),
  currency          text not null check (currency ~ '^[A-Z]{3}$'),
  amount_minor      bigint not null check (amount_minor >= 0),
  tax_inclusive     boolean not null default false,
  country           text,                         -- null = default for that currency
  is_active         boolean not null default true,
  unique (product_code, currency, country)
);

insert into app.products (code, display_name, seat_cap, duration_days, auto_renews) values
  ('intl_individual_annual', 'Individual, one year',        1, 365, true),
  ('intl_household_annual',  'Household, one year',         5, 365, true),
  ('in_household_annual',    'Household (India), one year', 4, 365, true),
  ('intl_individual_monthly','Individual, monthly',         1,  30, true),
  ('prepaid_year',           'Prepaid year, does not renew',1, 365, false),
  ('institution_pilot',      'Institution pilot, 4 weeks',  30, 28, false);

insert into app.product_prices (product_code, currency, amount_minor, tax_inclusive, country) values
  ('intl_individual_annual',  'USD',  3900, false, null),
  ('intl_household_annual',   'USD',  6900, false, null),
  ('in_household_annual',     'INR', 249900, true,  'IN'),
  ('intl_individual_monthly', 'USD',   499, false, null),
  ('prepaid_year',            'USD',  3900, false, null),
  ('institution_pilot',       'INR',1500000, true,  'IN');


-- ---------------------------------------------------------------------------
-- Payment events. Append-only. One row per provider notification.
--
-- Five separate minor-unit integers because the royalty base is "billings
-- excluding indirect tax, less refunds and channel fees" -- a single `amount`
-- column makes that base uncomputable after the fact.
-- ---------------------------------------------------------------------------
create table app.payment_events (
  id                  uuid primary key default gen_random_uuid(),
  provider            app.payment_provider not null,
  provider_event_id   text not null,
  kind                text not null check (kind in ('captured','refunded','chargeback','renewal_failed')),
  currency            text not null check (currency ~ '^[A-Z]{3}$'),
  gross_minor         bigint not null,
  tax_minor           bigint not null default 0,
  withholding_minor   bigint not null default 0,  -- TDS: the buyer may deduct it
  fee_minor           bigint not null default 0,
  settlement_minor    bigint not null default 0,
  is_live             boolean not null default true,
  org_id              uuid references app.organizations(id),
  user_id             uuid,
  product_code        text references app.products(code),
  referral_code       text,                       -- captured at purchase; unrecoverable later
  utr                 text,                       -- bank rail only
  evidence_url        text,                       -- bank statement image for a manual receipt
  occurred_at         timestamptz not null default now(),
  recorded_at         timestamptz not null default now()
);

-- Idempotency level 1: the provider's own event id, per provider.
create unique index payment_events_provider_uniq
  on app.payment_events (provider, provider_event_id);

create index on app.payment_events (org_id) where org_id is not null;
create index on app.payment_events (user_id) where user_id is not null;


-- ---------------------------------------------------------------------------
-- Entitlements. Access is a ledger fact, never a client assertion.
-- ---------------------------------------------------------------------------
create table app.entitlements (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid references app.organizations(id) on delete cascade,
  user_id                 uuid,
  product_code            text not null references app.products(code),
  state                   app.entitlement_state not null default 'pending',
  effective_from          timestamptz not null,
  effective_to            timestamptz not null,
  grace_until             timestamptz,
  origin_payment_event_id uuid references app.payment_events(id),
  purchase_platform       text not null default 'web'
                            check (purchase_platform in ('web','apple','google','bank')),
  seat_index              integer,                -- which seat of a multi-seat grant
  created_at              timestamptz not null default now(),

  constraint entitlement_dates_ordered check (effective_to > effective_from),
  constraint entitlement_has_subject   check (org_id is not null or user_id is not null)
);

comment on column app.entitlements.purchase_platform is
  'CORRECTIONS 1.1: a web payment grants access with no StoreKit receipt. Apple 3.1.3(b) '
  'permits showing that access natively provided the native app sells nothing. This column '
  'is what lets commerce UI be hidden per storefront. Two chars now; an App Review '
  'rejection later.';

-- Idempotency level 2: one payment event yields at most one entitlement per seat.
create unique index entitlements_one_per_payment_seat
  on app.entitlements (origin_payment_event_id, coalesce(seat_index, 0))
  where origin_payment_event_id is not null;

create index on app.entitlements (user_id, state) where user_id is not null;
create index on app.entitlements (org_id, state)  where org_id is not null;
-- Supports the hourly expiry sweep without a sequential scan.
create index on app.entitlements (effective_to) where state in ('active','grace');
create index on app.entitlements (effective_from) where state = 'pending';


-- ---------------------------------------------------------------------------
-- The transition table. THIS is the state machine.
-- ---------------------------------------------------------------------------
create table app.entitlement_transitions (
  from_state        app.entitlement_state not null,
  to_state          app.entitlement_state not null,
  requires_actor    text not null check (requires_actor in ('webhook','scheduled_job','operator','user','any')),
  note              text not null,
  primary key (from_state, to_state)
);

insert into app.entitlement_transitions (from_state, to_state, requires_actor, note) values
  ('pending','active',   'scheduled_job', 'a dated program reaching its start date'),
  ('pending','revoked',  'operator',      'cancelled before it ever began'),
  ('pending','refunded', 'webhook',       'refunded before it ever began'),
  ('active','grace',     'webhook',       'renewal payment failed; access continues briefly'),
  ('active','expired',   'scheduled_job', 'term ended'),
  ('active','refunded',  'webhook',       'refund issued against the originating payment'),
  ('active','revoked',   'operator',      'revoked for cause, with a mandatory reason'),
  ('grace','active',     'webhook',       'retry succeeded'),
  ('grace','expired',    'scheduled_job', 'grace window elapsed'),
  ('grace','refunded',   'webhook',       'refund issued during grace'),
  ('grace','revoked',    'operator',      'revoked for cause during grace'),
  ('expired','active',   'webhook',       'lapsed customer paid again on the same entitlement');
-- Deliberately absent: anything out of 'refunded' or 'revoked'. Those are terminal.

-- ---------------------------------------------------------------------------
-- Entitlement events: the audit trail. Every move leaves a row.
-- ---------------------------------------------------------------------------
create table app.entitlement_events (
  id                      uuid primary key default gen_random_uuid(),
  entitlement_id          uuid not null references app.entitlements(id) on delete cascade,
  from_state              app.entitlement_state,
  to_state                app.entitlement_state not null,
  actor_type              text not null check (actor_type in ('webhook','scheduled_job','operator','user','system')),
  actor_id                text,
  cause_payment_event_id  uuid references app.payment_events(id),
  reason                  text,
  occurred_at             timestamptz not null default now()
);

create index on app.entitlement_events (entitlement_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- The only legal way to move an entitlement.
-- ---------------------------------------------------------------------------
create or replace function app.fn_transition_entitlement(
  p_entitlement_id uuid,
  p_to_state       app.entitlement_state,
  p_actor_type     text,
  p_actor_id       text default null,
  p_cause_payment  uuid default null,
  p_reason         text default null
) returns app.entitlements
language plpgsql
security definer
set search_path = app, pg_catalog
as $$
declare
  e app.entitlements;
  t app.entitlement_transitions;
begin
  -- Lock first: two concurrent webhooks must serialise, not interleave.
  select * into e from app.entitlements where id = p_entitlement_id for update;
  if not found then
    raise exception 'entitlement % does not exist', p_entitlement_id using errcode = 'no_data_found';
  end if;

  if e.state = p_to_state then
    return e;                                     -- idempotent: replay is a no-op
  end if;

  select * into t from app.entitlement_transitions
   where from_state = e.state and to_state = p_to_state;
  if not found then
    raise exception 'illegal entitlement transition % -> %', e.state, p_to_state
      using errcode = 'check_violation';
  end if;

  if t.requires_actor <> 'any' and t.requires_actor <> p_actor_type then
    raise exception 'transition % -> % requires actor %, got %',
      e.state, p_to_state, t.requires_actor, p_actor_type
      using errcode = 'insufficient_privilege';
  end if;

  if p_to_state = 'revoked' and coalesce(trim(p_reason), '') = '' then
    raise exception 'revocation requires a reason' using errcode = 'check_violation';
  end if;

  update app.entitlements set state = p_to_state where id = p_entitlement_id returning * into e;

  insert into app.entitlement_events
    (entitlement_id, from_state, to_state, actor_type, actor_id, cause_payment_event_id, reason)
  values
    (p_entitlement_id, t.from_state, p_to_state, p_actor_type, p_actor_id, p_cause_payment, p_reason);

  return e;
end $$;

-- ---------------------------------------------------------------------------
-- Does this user have access right now? The single source of truth.
-- Both conditions matter: a state of 'active' on a term that ended yesterday
-- is not access. A trigger cannot fire on wall-clock passing.
-- ---------------------------------------------------------------------------
create or replace function app.fn_has_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select exists (
    select 1
      from app.entitlements e
     where e.state in ('active','grace')
       and now() >= e.effective_from
       and now() < coalesce(e.grace_until, e.effective_to)
       and (
            e.user_id = p_user_id
         or e.org_id in (
              select m.org_id from app.memberships m
               where m.user_id = p_user_id and m.revoked_at is null
            )
       )
  );
$$;

-- ---------------------------------------------------------------------------
-- Refund scoping. Revokes ONLY what descended from the refunded payment.
-- ---------------------------------------------------------------------------
create or replace function app.fn_apply_refund(p_payment_event_id uuid, p_seats integer default null)
returns integer
language plpgsql
security definer
set search_path = app, pg_catalog
as $$
declare
  n integer := 0;
  r record;
begin
  for r in
    select id from app.entitlements
     where origin_payment_event_id = p_payment_event_id
       and state not in ('refunded','revoked')
     order by coalesce(seat_index, 0)
     limit coalesce(p_seats, 2147483647)
     for update
  loop
    perform app.fn_transition_entitlement(
      r.id, 'refunded', 'webhook', null, p_payment_event_id, 'refund issued');
    n := n + 1;
  end loop;
  return n;
end $$;

comment on function app.fn_apply_refund is
  'Scoped by origin_payment_event_id. A consumer refund cannot touch an institution '
  'seat the same person holds, because that seat descends from a different payment. '
  'p_seats supports a partial refund: 4 of 30 seats revokes exactly 4.';

do $$
declare t record;
begin
  for t in select tablename from pg_tables
            where schemaname = 'app' and tablename in (
              'products','product_prices','payment_events','entitlements',
              'entitlement_transitions','entitlement_events')
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;
