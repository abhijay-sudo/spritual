-- 0008_circle_seats.sql
-- Authenticated, recipient-bound invitation claims for one organisation/circle.
-- This is membership capacity, not a payment entitlement or a production auth
-- integration. No invitation token is stored in plaintext.

create table app.cohorts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references app.organizations(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 160),
  start_at timestamptz not null,
  end_at timestamptz not null,
  capacity integer not null check (capacity between 1 and 500),
  created_at timestamptz not null default now(),
  constraint cohort_dates_ordered check (end_at > start_at),
  unique (id, org_id)
);

create table app.cohort_invitations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  cohort_id uuid not null,
  recipient_user_id uuid not null,
  token_hash bytea not null unique check (octet_length(token_hash) = 32),
  issued_by_user_id uuid not null,
  issued_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  accepted_at timestamptz,
  accepted_by_user_id uuid,
  constraint invitation_cohort_fk foreign key (cohort_id, org_id)
    references app.cohorts(id, org_id) on delete cascade,
  constraint invitation_acceptance_pair check (
    (accepted_at is null) = (accepted_by_user_id is null)
  ),
  constraint invitation_expiry_ordered check (expires_at > issued_at),
  constraint invitation_bound_acceptance check (
    accepted_by_user_id is null or accepted_by_user_id = recipient_user_id
  ),
  unique (id, org_id, cohort_id, recipient_user_id)
);
create index cohort_invitations_recipient_idx
  on app.cohort_invitations (recipient_user_id, expires_at)
  where revoked_at is null and accepted_at is null;

create table app.cohort_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  cohort_id uuid not null,
  user_id uuid not null,
  invitation_id uuid not null unique,
  joined_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint cohort_membership_cohort_fk foreign key (cohort_id, org_id)
    references app.cohorts(id, org_id) on delete cascade,
  constraint cohort_membership_invitation_fk
    foreign key (invitation_id, org_id, cohort_id, user_id)
    references app.cohort_invitations(id, org_id, cohort_id, recipient_user_id)
);
create unique index cohort_memberships_one_active_user
  on app.cohort_memberships (cohort_id, user_id) where revoked_at is null;
create index cohort_memberships_active_org_idx
  on app.cohort_memberships (org_id, user_id) where revoked_at is null;

do $$
declare t text;
begin
  foreach t in array array['cohorts','cohort_invitations','cohort_memberships'] loop
    execute format('alter table app.%I enable row level security', t);
    execute format('alter table app.%I force row level security', t);
  end loop;
end $$;

-- A teacher may issue to a specific known account in their own organisation.
-- The token is returned once, so the caller must deliver it out of band; this
-- RPC does not send messages or reserve a seat. A separate authenticated account
-- creation/email flow is still required before this can be used outside tests.
create or replace function app.fn_issue_circle_invitation(
  p_org_id uuid, p_cohort_id uuid, p_recipient_user_id uuid
) returns jsonb
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_cohort app.cohorts%rowtype;
  v_token text;
  v_invitation app.cohort_invitations%rowtype;
begin
  if v_caller is null or p_org_id is null or p_cohort_id is null or
     p_recipient_user_id is null or not exists (
       select 1 from app.memberships m
       where m.org_id = p_org_id and m.user_id = v_caller
         and m.revoked_at is null and m.role in ('teacher','admin')
     ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;

  -- Serialise duplicate issuance within this cohort. Claim takes the same
  -- organisation -> cohort lock order, avoiding an invitation/claim deadlock.
  perform 1 from app.organizations where id = p_org_id for update;
  select * into v_cohort from app.cohorts
   where id = p_cohort_id and org_id = p_org_id for update;
  if not found or v_cohort.end_at <= clock_timestamp() then
    raise exception 'circle not available' using errcode = 'P0002';
  end if;
  if exists (
    select 1 from app.cohort_invitations i
     where i.cohort_id = p_cohort_id and i.recipient_user_id = p_recipient_user_id
       and i.revoked_at is null and i.accepted_at is null
       and i.expires_at > clock_timestamp()
  ) then
    raise exception 'current invitation already exists' using errcode = '23505';
  end if;
  v_token := replace(gen_random_uuid()::text, '-', '') ||
             replace(gen_random_uuid()::text, '-', '');
  insert into app.cohort_invitations (
    org_id, cohort_id, recipient_user_id, token_hash,
    issued_by_user_id, expires_at
  ) values (
    p_org_id, p_cohort_id, p_recipient_user_id,
    sha256(convert_to(v_token, 'UTF8')),
    v_caller, least(clock_timestamp() + interval '7 days', v_cohort.end_at)
  ) returning * into v_invitation;
  return jsonb_build_object('invitation_id', v_invitation.id,
    'token', v_token, 'expires_at', v_invitation.expires_at);
end $$;

create or replace function app.fn_revoke_circle_invitation(p_invitation_id uuid)
returns boolean
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org_id uuid;
  v_invitation app.cohort_invitations%rowtype;
begin
  if v_caller is null or p_invitation_id is null then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select org_id into v_org_id from app.cohort_invitations
   where id = p_invitation_id;
  if v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  perform 1 from app.organizations where id = v_org_id for update;
  select * into v_invitation from app.cohort_invitations
   where id = p_invitation_id and org_id = v_org_id for update;
  if v_invitation.id is null then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  if v_invitation.accepted_at is not null then
    raise exception 'accepted invitation cannot be revoked' using errcode = '23514';
  end if;
  if v_invitation.revoked_at is not null then return false; end if;
  update app.cohort_invitations set revoked_at = clock_timestamp()
   where id = p_invitation_id;
  return true;
end $$;

-- Joining a circle must remain visible to the caller even if their optional
-- profile has not been created yet. The older identity RPC constructed all
-- fields through a profiles row and silently returned [] for such accounts.
create or replace function app.fn_me()
returns jsonb
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid();
begin
  if v_caller is null then
    return jsonb_build_object('authenticated', false, 'has_access', false);
  end if;
  return jsonb_build_object(
    'authenticated', true, 'user_id', v_caller,
    'has_access', app.fn_has_access(v_caller),
    'profile', (select to_jsonb(pr) - 'user_id' from app.profiles pr
                 where pr.user_id = v_caller),
    'memberships', coalesce((
      select jsonb_agg(jsonb_build_object('org_id', o.id,
        'name', o.display_name, 'kind', o.kind, 'role', m.role))
        from app.memberships m join app.organizations o on o.id = m.org_id
       where m.user_id = v_caller and m.revoked_at is null
    ), '[]'::jsonb)
  );
end $$;

-- Only the bound authenticated recipient may redeem the one-time token. The
-- organisation row is locked before counting seats, so competing last-seat
-- claims through this RPC cannot both pass. A claim records membership only;
-- it never manufactures a paid entitlement or implies a successful payment.
create or replace function app.fn_claim_seat(p_token text, p_adult boolean)
returns jsonb
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_probe record;
  v_org app.organizations%rowtype;
  v_cohort app.cohorts%rowtype;
  v_invitation app.cohort_invitations%rowtype;
  v_membership app.cohort_memberships%rowtype;
  v_checked_at timestamptz;
  v_token text := lower(btrim(p_token));
begin
  if v_caller is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_adult is distinct from true then
    raise exception 'adult confirmation required' using errcode = '23514';
  end if;
  if v_token is null or v_token !~ '^[0-9a-f]{64}$' then
    raise exception 'invitation not available' using errcode = 'P0002';
  end if;
  select id, org_id, cohort_id into v_probe
    from app.cohort_invitations
   where token_hash = sha256(convert_to(v_token, 'UTF8'));
  if not found then
    raise exception 'invitation not available' using errcode = 'P0002';
  end if;

  select * into v_org from app.organizations
   where id = v_probe.org_id for update;
  if not found then
    raise exception 'invitation not available' using errcode = 'P0002';
  end if;
  select * into v_cohort from app.cohorts
   where id = v_probe.cohort_id and org_id = v_org.id for update;
  select * into v_invitation from app.cohort_invitations
   where id = v_probe.id and org_id = v_org.id for update;
  -- now() is transaction-start time and can be stale after a lock wait.
  v_checked_at := clock_timestamp();
  if v_cohort.id is null or v_cohort.end_at <= v_checked_at or
     v_invitation.id is null or v_invitation.recipient_user_id <> v_caller or
     v_invitation.revoked_at is not null or
     v_invitation.accepted_at is not null or
     v_invitation.expires_at <= v_checked_at then
    raise exception 'invitation not available' using errcode = 'P0002';
  end if;
  if exists (select 1 from app.cohort_memberships cm
      where cm.cohort_id = v_cohort.id and cm.user_id = v_caller
        and cm.revoked_at is null) then
    raise exception 'already in circle' using errcode = '23505';
  end if;
  if (select count(*) from app.cohort_memberships cm
      where cm.cohort_id = v_cohort.id and cm.revoked_at is null)
      >= v_cohort.capacity then
    raise exception 'circle is full' using errcode = '23514';
  end if;
  if not exists (select 1 from app.memberships m
      where m.org_id = v_org.id and m.user_id = v_caller
        and m.revoked_at is null) and
     (select count(*) from app.memberships m
      where m.org_id = v_org.id and m.revoked_at is null) >= v_org.seat_cap then
    raise exception 'organisation is full' using errcode = '23514';
  end if;

  insert into app.memberships (org_id, user_id, role, joined_at)
    values (v_org.id, v_caller, 'member', clock_timestamp())
    on conflict (org_id, user_id) do update
      set joined_at = case when app.memberships.revoked_at is null
                           then app.memberships.joined_at else clock_timestamp() end,
          role = case when app.memberships.revoked_at is null
                      then app.memberships.role else 'member'::app.member_role end,
          revoked_at = null;
  insert into app.cohort_memberships (
    org_id, cohort_id, user_id, invitation_id, joined_at
  ) values (
    v_org.id, v_cohort.id, v_caller, v_invitation.id, clock_timestamp()
  ) returning * into v_membership;
  update app.cohort_invitations
     set accepted_at = clock_timestamp(), accepted_by_user_id = v_caller
   where id = v_invitation.id;
  return jsonb_build_object('membership_id', v_membership.id,
    'org_id', v_org.id, 'cohort_id', v_cohort.id,
    'joined_at', v_membership.joined_at);
end $$;

revoke all on function app.fn_issue_circle_invitation(uuid,uuid,uuid)
  from public, anon, authenticated;
revoke all on function app.fn_revoke_circle_invitation(uuid)
  from public, anon, authenticated;
revoke all on function app.fn_claim_seat(text,boolean)
  from public, anon, authenticated;
grant execute on function app.fn_issue_circle_invitation(uuid,uuid,uuid)
  to authenticated;
grant execute on function app.fn_revoke_circle_invitation(uuid)
  to authenticated;
grant execute on function app.fn_claim_seat(text,boolean)
  to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_issue_circle_invitation(uuid,uuid,uuid)', 'authenticated',
   'teacher or admin issues a one-time recipient-bound token in their organisation'),
  ('app.fn_revoke_circle_invitation(uuid)', 'authenticated',
   'teacher or admin withdraws an unused invitation in their organisation'),
  ('app.fn_claim_seat(text,boolean)', 'authenticated',
   'bound recipient claims an available circle and organisation seat atomically');
