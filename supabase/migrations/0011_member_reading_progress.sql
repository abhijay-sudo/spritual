-- 0011_member_reading_progress.sql
-- A member explicitly marks a currently accessible circle release as saved or
-- complete. No reflection, inferred tradition, streak, activity stream, or
-- teacher-visible progress is stored. Old rows remain private if access ends;
-- reads never return them unless the exact release is currently authorized.

create table app.member_reading_progress (
  user_id uuid not null,
  release_id uuid not null references app.circle_reading_releases(id) on delete cascade,
  bookmarked_at timestamptz,
  completed_at timestamptz,
  primary key (user_id, release_id),
  constraint member_reading_progress_has_mark check (
    bookmarked_at is not null or completed_at is not null
  )
);
create index member_reading_progress_release_idx
  on app.member_reading_progress (release_id);
revoke all on table app.member_reading_progress from public, anon, authenticated;
alter table app.member_reading_progress enable row level security;
alter table app.member_reading_progress force row level security;

-- Internal exact-release gate shared by reads and writes. No client EXECUTE
-- grant: an opaque release ID cannot be used as an entitlement oracle.
create or replace function app.fn_member_can_read_release(p_release_id uuid)
returns boolean
language sql volatile security definer set search_path = app, pg_catalog as $$
  select exists (
    select 1
      from app.circle_reading_releases cr
      join app.cohorts c on c.id = cr.cohort_id and c.org_id = cr.org_id
      join app.memberships m on m.org_id = cr.org_id
        and m.user_id = auth.uid() and m.revoked_at is null
      join app.cohort_memberships cm on cm.org_id = cr.org_id
        and cm.cohort_id = cr.cohort_id and cm.user_id = auth.uid()
        and cm.revoked_at is null
      join app.knowledge_renderings r on r.id = cr.rendering_id
     where cr.id = p_release_id
       and c.start_at <= clock_timestamp() and c.end_at > clock_timestamp()
       and cr.withdrawn_at is null and cr.release_at <= clock_timestamp()
       and app.fn_circle_rendering_ready(r.id)
       and (r.access_class <> 'paid' or exists (
         select 1 from app.entitlements ent
          where ent.org_id = cr.org_id and ent.state in ('active','grace')
            and clock_timestamp() >= ent.effective_from
            and clock_timestamp() < coalesce(ent.grace_until, ent.effective_to)
       ))
  );
$$;
revoke all on function app.fn_member_can_read_release(uuid)
  from public, anon, authenticated;

-- Null lists the caller's currently accessible marks across circles for a
-- personal Saved view. A specified circle is checked even if no marks exist.
-- Neither this RPC nor any teacher RPC exposes a member's progress to others.
create or replace function app.fn_my_circle_reading_progress(
  p_cohort_id uuid default null
) returns table (
  release_id uuid, cohort_id uuid, canonical_reference text, work_title text,
  language_code text,
  bookmarked_at timestamptz, completed_at timestamptz
)
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  if p_cohort_id is not null and not exists (
    select 1 from app.cohorts c
      join app.memberships m on m.org_id = c.org_id
        and m.user_id = v_caller and m.revoked_at is null
      join app.cohort_memberships cm on cm.org_id = c.org_id
        and cm.cohort_id = c.id and cm.user_id = v_caller
        and cm.revoked_at is null
     where c.id = p_cohort_id
       and c.start_at <= clock_timestamp() and c.end_at > clock_timestamp()
  ) then
    raise exception 'circle access required' using errcode = '42501';
  end if;

  return query
    select cr.id, cr.cohort_id, p.canonical_reference, w.title,
           r.language_code,
           mp.bookmarked_at, mp.completed_at
      from app.member_reading_progress mp
      join app.circle_reading_releases cr on cr.id = mp.release_id
      join app.knowledge_renderings r on r.id = cr.rendering_id
      join app.knowledge_passages p on p.id = r.passage_id
      join app.knowledge_works w on w.id = p.work_id
     where mp.user_id = v_caller
       and (p_cohort_id is null or cr.cohort_id = p_cohort_id)
       and app.fn_member_can_read_release(cr.id)
     order by greatest(mp.bookmarked_at, mp.completed_at) desc nulls last,
              cr.id;
end $$;

-- One field per explicit tap prevents a stale device from overwriting the
-- other mark. Disabling the last mark deletes the row rather than storing a
-- negative activity event. Every mutation rechecks access under locks, in the
-- same organisation-first order as circle delivery and invitation writes.
create or replace function app.fn_set_circle_reading_mark(
  p_release_id uuid, p_kind text, p_enabled boolean
) returns jsonb
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org_id uuid;
  v_cohort_id uuid;
  v_bookmarked_at timestamptz;
  v_completed_at timestamptz;
begin
  if v_caller is null or p_release_id is null then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  if p_kind is null or p_kind not in ('bookmark', 'completed') or
     p_enabled is null then
    raise exception 'invalid reading mark' using errcode = '23514';
  end if;

  select cr.org_id, cr.cohort_id into v_org_id, v_cohort_id
    from app.circle_reading_releases cr where cr.id = p_release_id;
  if v_org_id is null then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  perform 1 from app.organizations o where o.id = v_org_id for share;
  perform 1 from app.memberships m
    where m.org_id = v_org_id and m.user_id = v_caller
      and m.revoked_at is null for share;
  if not found then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  perform 1 from app.cohorts c
    where c.id = v_cohort_id and c.org_id = v_org_id for share;
  perform 1 from app.cohort_memberships cm
    where cm.cohort_id = v_cohort_id and cm.org_id = v_org_id
      and cm.user_id = v_caller and cm.revoked_at is null for share;
  if not found then
    raise exception 'circle access required' using errcode = '42501';
  end if;
  perform 1 from app.circle_reading_releases cr
    where cr.id = p_release_id and cr.org_id = v_org_id for share;
  if not app.fn_member_can_read_release(p_release_id) then
    raise exception 'circle access required' using errcode = '42501';
  end if;

  if p_enabled then
    insert into app.member_reading_progress
      (user_id, release_id, bookmarked_at, completed_at)
    values (
      v_caller, p_release_id,
      case when p_kind = 'bookmark' then clock_timestamp() end,
      case when p_kind = 'completed' then clock_timestamp() end
    )
    on conflict (user_id, release_id) do update set
      bookmarked_at = case when p_kind = 'bookmark'
        then coalesce(app.member_reading_progress.bookmarked_at, excluded.bookmarked_at)
        else app.member_reading_progress.bookmarked_at end,
      completed_at = case when p_kind = 'completed'
        then coalesce(app.member_reading_progress.completed_at, excluded.completed_at)
        else app.member_reading_progress.completed_at end;
  else
    -- Delete first when clearing the final mark; the table check deliberately
    -- rejects a transient all-null row, even within one transaction.
    delete from app.member_reading_progress mp
     where mp.user_id = v_caller and mp.release_id = p_release_id
       and ((p_kind = 'bookmark' and mp.completed_at is null) or
            (p_kind = 'completed' and mp.bookmarked_at is null));
    if p_kind = 'bookmark' then
      update app.member_reading_progress mp set bookmarked_at = null
       where mp.user_id = v_caller and mp.release_id = p_release_id;
    else
      update app.member_reading_progress mp set completed_at = null
       where mp.user_id = v_caller and mp.release_id = p_release_id;
    end if;
  end if;

  select mp.bookmarked_at, mp.completed_at
    into v_bookmarked_at, v_completed_at
    from app.member_reading_progress mp
   where mp.user_id = v_caller and mp.release_id = p_release_id;
  return jsonb_build_object(
    'release_id', p_release_id,
    'bookmarked_at', v_bookmarked_at,
    'completed_at', v_completed_at
  );
end $$;

-- Revoked or expired marks are intentionally hidden by the read API, but a
-- member can still erase *all* of their own stored marks without regaining
-- access. No roster, title, or old release metadata is returned.
create or replace function app.fn_clear_my_reading_progress()
returns integer
language plpgsql volatile security definer set search_path = app, pg_catalog as $$
declare v_caller uuid := auth.uid(); v_deleted integer;
begin
  if v_caller is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  delete from app.member_reading_progress where user_id = v_caller;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end $$;

revoke all on function app.fn_my_circle_reading_progress(uuid)
  from public, anon, authenticated;
revoke all on function app.fn_set_circle_reading_mark(uuid,text,boolean)
  from public, anon, authenticated;
revoke all on function app.fn_clear_my_reading_progress()
  from public, anon, authenticated;
grant execute on function app.fn_my_circle_reading_progress(uuid)
  to authenticated;
grant execute on function app.fn_set_circle_reading_mark(uuid,text,boolean)
  to authenticated;
grant execute on function app.fn_clear_my_reading_progress()
  to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_my_circle_reading_progress(uuid)', 'authenticated',
   'caller sees only their own explicit marks on currently accessible circle releases'),
  ('app.fn_set_circle_reading_mark(uuid,text,boolean)', 'authenticated',
   'caller explicitly adds or clears one private mark after current release authorization'),
  ('app.fn_clear_my_reading_progress()', 'authenticated',
   'caller erases all their own stored marks, including those hidden after access ends');
