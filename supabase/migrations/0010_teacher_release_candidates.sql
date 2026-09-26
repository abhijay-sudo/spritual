-- 0010_teacher_release_candidates.sql
-- A provisioned teacher needs to choose an exact, currently deliverable
-- rendering before scheduling it. This read does not grant rights, approve
-- content, create an entitlement or expose a raw editorial draft.

create or replace function app.fn_teacher_release_candidates(
  p_cohort_id uuid, p_language text default 'en',
  p_query text default '', p_limit integer default 30
) returns table (
  rendering_id uuid, canonical_id text, canonical_reference text,
  work_slug text, work_title text, content_kind text, language_code text,
  body text, access_class text, source_title text, source_url text,
  attribution_text text, reviewer_name text
)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_org_id uuid;
  v_query text := btrim(coalesce(p_query, ''));
begin
  select c.org_id into v_org_id from app.cohorts c
   where c.id = p_cohort_id and c.end_at > clock_timestamp();
  if v_caller is null or v_org_id is null or not exists (
    select 1 from app.memberships m
     where m.org_id = v_org_id and m.user_id = v_caller
       and m.revoked_at is null and m.role in ('teacher','admin')
  ) then
    raise exception 'teacher access required' using errcode = '42501';
  end if;
  if p_language is null or length(p_language) > 16 or length(v_query) > 160 then
    raise exception 'invalid catalogue filter' using errcode = '23514';
  end if;

  return query
    select r.id, p.canonical_id, p.canonical_reference,
           w.slug, w.title, r.kind, r.language_code,
           r.body, r.access_class, s.title, s.source_url,
           lic.attribution_text, rv.full_name
      from app.knowledge_renderings r
      join app.knowledge_passages p on p.id = r.passage_id
      join app.knowledge_works w on w.id = p.work_id
      join app.knowledge_editions e on e.id = r.edition_id
      join app.knowledge_sources s on s.id = e.source_id
      join app.knowledge_source_licenses lic on lic.edition_id = e.id
      join app.reviewers rv on rv.id = r.reviewed_by
     where r.language_code = p_language
       and app.fn_circle_rendering_ready(r.id)
       and (v_query = '' or lower(p.canonical_id) like '%' || lower(v_query) || '%'
            or lower(p.canonical_reference) like '%' || lower(v_query) || '%'
            or lower(w.title) like '%' || lower(v_query) || '%'
            or lower(r.body) like '%' || lower(v_query) || '%')
       and (r.access_class <> 'paid' or exists (
         select 1 from app.entitlements ent
          where ent.org_id = v_org_id and ent.state in ('active','grace')
            and clock_timestamp() >= ent.effective_from
            and clock_timestamp() < coalesce(ent.grace_until, ent.effective_to)
       ))
     order by w.title, p.sequence_no, r.kind, r.id
     limit least(greatest(coalesce(p_limit, 30), 1), 50);
end $$;

revoke all on function app.fn_teacher_release_candidates(uuid,text,text,integer)
  from public, anon, authenticated;
grant execute on function app.fn_teacher_release_candidates(uuid,text,text,integer)
  to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_teacher_release_candidates(uuid,text,text,integer)',
   'authenticated', 'active teacher/admin selects only a currently deliverable exact rendering for their circle');
