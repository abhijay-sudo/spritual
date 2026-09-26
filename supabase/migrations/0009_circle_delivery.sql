-- 0009_circle_delivery.sql
-- Teacher-controlled delivery of an already published knowledge rendering.
-- This migration carries no content, reviewer approval, invitation delivery,
-- payment or client-side auth substitute. All reads recheck current rights.

create table app.circle_reading_releases (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  cohort_id uuid not null,
  rendering_id uuid not null references app.knowledge_renderings(id),
  release_at timestamptz not null,
  scheduled_by_user_id uuid not null,
  scheduled_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  withdrawn_by_user_id uuid,
  constraint circle_release_cohort_fk foreign key (cohort_id, org_id)
    references app.cohorts(id, org_id) on delete cascade,
  constraint circle_release_withdrawal_pair check (
    (withdrawn_at is null) = (withdrawn_by_user_id is null)
  )
);
create unique index circle_reading_one_active_release
  on app.circle_reading_releases (cohort_id, rendering_id)
  where withdrawn_at is null;
create index circle_reading_member_feed_idx
  on app.circle_reading_releases (cohort_id, release_at, id)
  where withdrawn_at is null;

revoke all on table app.circle_reading_releases from public, anon, authenticated;
alter table app.circle_reading_releases enable row level security;
alter table app.circle_reading_releases force row level security;

-- A schedule is only eligible while the exact rendering remains published,
-- human-reviewed in its active language and backed by current redistribution
-- rights. A later rights or review change makes it disappear from delivery.
create or replace function app.fn_circle_rendering_ready(p_rendering_id uuid)
returns boolean
language sql stable security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1
      from app.knowledge_renderings r
      join app.knowledge_editions e on e.id = r.edition_id
        and e.work_id = r.work_id and e.language_code = r.language_code
      join app.knowledge_sources s on s.id = e.source_id
      join app.knowledge_source_licenses lic on lic.edition_id = e.id
      join app.languages lang on lang.code = r.language_code and lang.is_active
      join app.reviewers rv on rv.id = r.reviewed_by and rv.auth_user_id is not null
      join app.reviewer_languages rl on rl.reviewer_id = rv.id
        and rl.language_code = r.language_code
     where r.id = p_rendering_id and r.status = 'published'
       and r.access_class in ('public','member','paid')
       and r.reviewed_at is not null and r.published_at is not null
       and s.provenance_status = 'verified'
       and lic.status = 'verified' and lic.may_redistribute
       and (lic.valid_from is null or lic.valid_from <= current_date)
       and (lic.valid_until is null or lic.valid_until >= current_date)
  );
$$;
revoke all on function app.fn_circle_rendering_ready(uuid)
  from public, anon, authenticated;

-- A provisioned teacher/admin creates a bounded circle in their own tenant.
-- Account provisioning and teacher role assignment are still operator work.
create or replace function app.fn_create_circle(
  p_org_id uuid, p_name text, p_start_at timestamptz,
  p_end_at timestamptz, p_capacity integer
) returns uuid
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org app.organizations%rowtype;
  v_id uuid;
begin
  if v_caller is null or p_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = p_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select * into v_org from app.organizations where id = p_org_id for update;
  if not found then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  -- Hold the actor's membership through the write; a concurrent revocation
  -- must serialise before or after this authorised action.
  perform 1 from app.memberships m
   where m.org_id = p_org_id and m.user_id = v_caller
     and m.revoked_at is null and m.role in ('teacher','admin') for share;
  if not found then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  if nullif(btrim(coalesce(p_name,'')), '') is null or
     length(btrim(p_name)) > 160 or
     p_start_at is null or p_end_at is null or
     p_start_at >= p_end_at or p_end_at <= clock_timestamp() or
     p_capacity is null or p_capacity < 1 or p_capacity > v_org.seat_cap then
    raise exception 'invalid circle details' using errcode = '23514';
  end if;
  insert into app.cohorts (org_id, name, start_at, end_at, capacity)
    values (p_org_id, btrim(p_name), p_start_at, p_end_at, p_capacity)
    returning id into v_id;
  return v_id;
end $$;

-- A returning member can rediscover claimed circles; teachers/admins can find
-- only their own organisation circles. This returns no roster or invite tokens.
create or replace function app.fn_my_circles()
returns table (
  cohort_id uuid, org_id uuid, org_name text, circle_name text,
  start_at timestamptz, end_at timestamptz, my_role text
)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  return query
    select c.id, c.org_id, o.display_name, c.name, c.start_at, c.end_at,
           m.role::text
      from app.cohorts c
      join app.organizations o on o.id = c.org_id
      join app.memberships m on m.org_id = c.org_id and m.user_id = v_caller
     where m.revoked_at is null
       and (m.role in ('teacher','admin') or exists (
         select 1 from app.cohort_memberships cm
          where cm.org_id = c.org_id and cm.cohort_id = c.id
            and cm.user_id = v_caller and cm.revoked_at is null
       ))
     order by c.start_at desc, c.id;
end $$;

-- Scheduling never grants editorial approval or rights. A teacher selects an
-- exact, immutable published rendering; a correction must be released anew.
create or replace function app.fn_schedule_circle_reading(
  p_cohort_id uuid, p_rendering_id uuid, p_release_at timestamptz default null
) returns uuid
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org_id uuid;
  v_cohort app.cohorts%rowtype;
  v_release_at timestamptz;
  v_id uuid;
begin
  if v_caller is null or p_cohort_id is null or p_rendering_id is null then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select org_id into v_org_id from app.cohorts where id = p_cohort_id;
  if v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  -- Same organisation -> cohort ordering as invitation claims.
  perform 1 from app.organizations where id = v_org_id for update;
  perform 1 from app.memberships m
   where m.org_id = v_org_id and m.user_id = v_caller
     and m.revoked_at is null and m.role in ('teacher','admin') for share;
  if not found then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select * into v_cohort from app.cohorts
   where id = p_cohort_id and org_id = v_org_id for update;
  if v_cohort.id is null or v_cohort.end_at <= clock_timestamp() then
    raise exception 'circle not available' using errcode = 'P0002';
  end if;
  v_release_at := coalesce(p_release_at, greatest(clock_timestamp(), v_cohort.start_at));
  if v_release_at < v_cohort.start_at or v_release_at >= v_cohort.end_at then
    raise exception 'release outside circle dates' using errcode = '23514';
  end if;
  if not app.fn_circle_rendering_ready(p_rendering_id) then
    raise exception 'reviewed, rights-cleared reading required' using errcode = '23514';
  end if;
  insert into app.circle_reading_releases
    (org_id, cohort_id, rendering_id, release_at, scheduled_by_user_id)
    values (v_org_id, p_cohort_id, p_rendering_id, v_release_at, v_caller)
    returning id into v_id;
  return v_id;
end $$;

create or replace function app.fn_withdraw_circle_reading(p_release_id uuid)
returns boolean
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org_id uuid;
  v_release app.circle_reading_releases%rowtype;
begin
  if v_caller is null or p_release_id is null then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select org_id into v_org_id from app.circle_reading_releases
   where id = p_release_id;
  if v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  perform 1 from app.organizations where id = v_org_id for update;
  perform 1 from app.memberships m
   where m.org_id = v_org_id and m.user_id = v_caller
     and m.revoked_at is null and m.role in ('teacher','admin') for share;
  if not found then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  select * into v_release from app.circle_reading_releases
   where id = p_release_id and org_id = v_org_id for update;
  if v_release.id is null then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  if v_release.withdrawn_at is not null then return false; end if;
  update app.circle_reading_releases
     set withdrawn_at = clock_timestamp(), withdrawn_by_user_id = v_caller
   where id = p_release_id;
  return true;
end $$;

-- Teacher sees the queue without bypassing current content validity. No raw
-- manuscript, token, reflection or member identity is returned.
create or replace function app.fn_circle_delivery_queue(p_cohort_id uuid)
returns table (
  release_id uuid, release_at timestamptz, withdrawn_at timestamptz,
  rendering_id uuid, canonical_reference text, language_code text,
  access_class text, ready_now boolean
)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid(); v_org_id uuid;
begin
  select c.org_id into v_org_id from app.cohorts c where c.id = p_cohort_id;
  if v_caller is null or v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  return query
    select cr.id, cr.release_at, cr.withdrawn_at, cr.rendering_id,
           p.canonical_reference, r.language_code, r.access_class,
           app.fn_circle_rendering_ready(cr.rendering_id)
      from app.circle_reading_releases cr
      join app.knowledge_renderings r on r.id = cr.rendering_id
      join app.knowledge_passages p on p.id = r.passage_id
     where cr.cohort_id = p_cohort_id and cr.org_id = v_org_id
     order by cr.release_at, cr.id;
end $$;

-- An authenticated, claimed and still active member receives only this
-- circle's released readings in the requested language. Paid renderings need
-- a live same-organisation entitlement; membership alone never manufactures one.
create or replace function app.fn_circle_readings(
  p_cohort_id uuid, p_language text default 'en'
) returns table (
  release_id uuid, release_at timestamptz, rendering_id uuid,
  canonical_id text, canonical_reference text, work_slug text, work_title text,
  content_kind text, language_code text, body text, transliteration text,
  access_class text, source_title text, source_url text,
  source_identifier text, edition_label text, attribution_text text,
  license_kind text, reviewer_name text, reviewed_at timestamptz
)
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid(); v_org_id uuid;
begin
  select c.org_id into v_org_id from app.cohorts c
   where c.id = p_cohort_id
     and c.start_at <= clock_timestamp() and c.end_at > clock_timestamp();
  if v_caller is null or v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null
  ) or not exists (
    select 1 from app.cohort_memberships cm
     where cm.org_id = v_org_id and cm.cohort_id = p_cohort_id
       and cm.user_id = v_caller and cm.revoked_at is null
  ) then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  return query
    select cr.id, cr.release_at, r.id, p.canonical_id,
           p.canonical_reference, w.slug, w.title, r.kind, r.language_code,
           r.body, r.transliteration, r.access_class, s.title, s.source_url,
           s.source_identifier, e.edition_label, lic.attribution_text,
           lic.license_kind, rv.full_name, r.reviewed_at
      from app.circle_reading_releases cr
      join app.knowledge_renderings r on r.id = cr.rendering_id
      join app.knowledge_passages p on p.id = r.passage_id
      join app.knowledge_works w on w.id = p.work_id
      join app.knowledge_editions e on e.id = r.edition_id
      join app.knowledge_sources s on s.id = e.source_id
      join app.knowledge_source_licenses lic on lic.edition_id = e.id
      join app.reviewers rv on rv.id = r.reviewed_by
     where cr.cohort_id = p_cohort_id and cr.org_id = v_org_id
       and cr.withdrawn_at is null and cr.release_at <= clock_timestamp()
       and r.language_code = p_language
       and app.fn_circle_rendering_ready(r.id)
       -- A personal entitlement or one in another tenant does not authorize
       -- this circle's paid teaching; its commercial policy remains separate.
       and (r.access_class <> 'paid' or exists (
         select 1 from app.entitlements ent
          where ent.org_id = v_org_id and ent.state in ('active','grace')
            and clock_timestamp() >= ent.effective_from
            and clock_timestamp() < coalesce(ent.grace_until, ent.effective_to)
       ))
     order by cr.release_at, cr.id;
end $$;

revoke all on function app.fn_create_circle(uuid,text,timestamptz,timestamptz,integer)
  from public, anon, authenticated;
revoke all on function app.fn_my_circles()
  from public, anon, authenticated;
revoke all on function app.fn_schedule_circle_reading(uuid,uuid,timestamptz)
  from public, anon, authenticated;
revoke all on function app.fn_withdraw_circle_reading(uuid)
  from public, anon, authenticated;
revoke all on function app.fn_circle_delivery_queue(uuid)
  from public, anon, authenticated;
revoke all on function app.fn_circle_readings(uuid,text)
  from public, anon, authenticated;
grant execute on function app.fn_create_circle(uuid,text,timestamptz,timestamptz,integer)
  to authenticated;
grant execute on function app.fn_my_circles()
  to authenticated;
grant execute on function app.fn_schedule_circle_reading(uuid,uuid,timestamptz)
  to authenticated;
grant execute on function app.fn_withdraw_circle_reading(uuid)
  to authenticated;
grant execute on function app.fn_circle_delivery_queue(uuid)
  to authenticated;
grant execute on function app.fn_circle_readings(uuid,text)
  to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_create_circle(uuid,text,timestamp with time zone,timestamp with time zone,integer)',
   'authenticated', 'active teacher/admin creates a bounded circle in their organisation'),
  ('app.fn_my_circles()', 'authenticated',
   'returning teacher or claimed member finds only their own organisation circles'),
  ('app.fn_schedule_circle_reading(uuid,uuid,timestamp with time zone)',
   'authenticated', 'active teacher/admin schedules an already reviewed and rights-cleared rendering'),
  ('app.fn_withdraw_circle_reading(uuid)', 'authenticated',
   'active teacher/admin withdraws an own-organisation release'),
  ('app.fn_circle_delivery_queue(uuid)', 'authenticated',
   'active teacher/admin reviews their own circle delivery queue'),
  ('app.fn_circle_readings(uuid,text)', 'authenticated',
   'active claimed member reads released content with current rights and entitlement checks');
