-- 0004_api_surface.sql
-- Locks down function privileges and defines the ONLY three calls a client can make.
-- See 0005 for the event trigger that makes this durable against future migrations.

do $$
declare f record;
begin
  for f in select n.nspname, p.oid::regprocedure::text as sig
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname in ('app','ops')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

alter default privileges in schema app revoke execute on functions from public, anon, authenticated;
alter default privileges in schema ops revoke execute on functions from public, anon, authenticated;

drop extension if exists citext;   -- unused; the linter flags extensions in public

create table ops.api_allowlist (
  function_signature text primary key,
  granted_to         text not null check (granted_to in ('anon','authenticated','both')),
  rationale          text not null
);

create or replace function app.fn_catalog(p_language text default 'en')
returns table (
  version_id uuid, slug text, title text, purpose text, tradition text,
  source_language text, source_script text, source_direction text,
  duration_ms integer, source_citation text, reviewer_name text, reviewer_credentials text)
language sql stable security definer set search_path = app, pg_catalog as $$
  select pv.id, p.slug, pv.title, pv.purpose, p.tradition,
         pv.source_language, l.script, l.direction,
         pv.audio_duration_ms, pv.source_citation, rv.full_name, rv.credentials
    from app.practice_versions pv
    join app.practices p on p.id = pv.practice_id
    join app.languages  l on l.code = pv.source_language
    join app.version_language_approvals a on a.version_id = pv.id and a.language_code = p_language
    join app.reviewers rv on rv.id = a.reviewer_id
   where pv.state = 'published'
   order by p.slug;
$$;

-- THE three-column payload. p_duration filters segments.optional_at so the
-- 3-minute form is a real teacher-approved practice, not a truncation.
create or replace function app.fn_practice_document(
  p_version_id uuid, p_language text default 'en', p_duration integer default 10)
returns jsonb
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare doc jsonb;
begin
  if p_duration not in (3,5,10) then
    raise exception 'duration must be 3, 5 or 10' using errcode = 'check_violation';
  end if;
  select jsonb_build_object(
    'version_id', pv.id, 'title', pv.title, 'purpose', pv.purpose,
    'source_citation', pv.source_citation, 'source_language', pv.source_language,
    'script', l.script, 'direction', l.direction,
    'transliteration_scheme', l.transliteration_scheme,
    'gloss_language', p_language, 'duration_variant', p_duration,
    'audio_object_key', pv.audio_object_key,
    'reviewer', jsonb_build_object('name', rv.full_name, 'credentials', rv.credentials),
    'segments', coalesce((
      select jsonb_agg(jsonb_build_object(
               'ordinal', s.ordinal, 'source_text', s.source_text,
               'transliteration', s.transliteration, 'translation', g.translation,
               'meaning', g.meaning, 'start_ms', s.start_ms, 'end_ms', s.end_ms,
               'is_silence', s.is_silence) order by s.ordinal)
        from app.segments s
        join app.segment_glosses g on g.segment_id = s.id and g.language_code = p_language
       where s.version_id = pv.id and p_duration = any(s.optional_at)), '[]'::jsonb),
    'corrections', coalesce((
      select jsonb_agg(jsonb_build_object('what_changed', c.what_changed, 'why', c.why,
               'corrected_at', c.corrected_at, 'by', r2.full_name) order by c.corrected_at desc)
        from app.corrections c join app.reviewers r2 on r2.id = c.corrected_by
       where c.version_id = pv.id and c.is_public
         and (c.language_code is null or c.language_code = p_language)), '[]'::jsonb)
  ) into doc
    from app.practice_versions pv
    join app.languages l on l.code = pv.source_language
    join app.version_language_approvals a on a.version_id = pv.id and a.language_code = p_language
    join app.reviewers rv on rv.id = a.reviewer_id
   where pv.id = p_version_id and pv.state = 'published';
  if doc is null then
    raise exception 'practice not available' using errcode = 'no_data_found';
  end if;
  return doc;
end $$;

create or replace function app.fn_me()
returns jsonb
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare uid uuid := auth.uid(); out jsonb;
begin
  if uid is null then
    return jsonb_build_object('authenticated', false, 'has_access', false);
  end if;
  select jsonb_build_object('authenticated', true, 'user_id', uid,
    'has_access', app.fn_has_access(uid), 'profile', to_jsonb(pr) - 'user_id',
    'memberships', coalesce((
      select jsonb_agg(jsonb_build_object('org_id', o.id, 'name', o.display_name,
               'kind', o.kind, 'role', m.role))
        from app.memberships m join app.organizations o on o.id = m.org_id
       where m.user_id = uid and m.revoked_at is null), '[]'::jsonb)) into out
  from app.profiles pr where pr.user_id = uid;
  return coalesce(out, jsonb_build_object('authenticated', true, 'user_id', uid,
    'has_access', app.fn_has_access(uid), 'profile', null, 'memberships', '[]'::jsonb));
end $$;

-- Per-schema default privileges cannot revoke PostgreSQL's global EXECUTE
-- default for PUBLIC. Lock down these newly created functions before granting
-- the deliberate client surface below.
revoke all on function app.fn_catalog(text) from public, anon, authenticated;
revoke all on function app.fn_practice_document(uuid, text, integer) from public, anon, authenticated;
revoke all on function app.fn_me() from public, anon, authenticated;

grant execute on function app.fn_catalog(text)                          to anon, authenticated;
grant execute on function app.fn_practice_document(uuid, text, integer) to anon, authenticated;
grant execute on function app.fn_me()                                   to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_catalog(text)', 'both', 'free sample must work before sign-up'),
  ('app.fn_practice_document(uuid,text,integer)', 'both', 'free daily practice is public; gated items filtered by state'),
  ('app.fn_me()', 'authenticated', 'caller reads only their own record');

-- CI meta-test: a grant not in the allowlist fails the build BY EXISTING.
create or replace function ops.fn_check_api_surface()
returns table (violation text)
language sql stable security invoker set search_path = ops, pg_catalog as $$
  select format('ungranted-but-exposed: %s', p.oid::regprocedure::text)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('app','ops')
     and (has_function_privilege('anon', p.oid, 'execute')
       or has_function_privilege('authenticated', p.oid, 'execute'))
     and p.oid::regprocedure::text not in (select function_signature from ops.api_allowlist)
  union all
  select format('client grant mismatch: %s', a.function_signature)
    from ops.api_allowlist a
    join pg_proc p on p.oid::regprocedure::text = a.function_signature
   where has_function_privilege('anon', p.oid, 'execute')
           <> (a.granted_to in ('anon', 'both'))
      or has_function_privilege('authenticated', p.oid, 'execute')
           <> (a.granted_to in ('authenticated', 'both'))
  union all
  select format('table grant leaked: %s.%s', table_schema, table_name)
    from information_schema.role_table_grants
   where table_schema in ('app','ops') and grantee in ('anon','authenticated');
$$;
