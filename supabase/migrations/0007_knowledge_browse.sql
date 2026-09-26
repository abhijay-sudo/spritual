-- 0007_knowledge_browse.sql
-- Navigation for a future scripture/story library. A work or passage is listed
-- only while it has at least one public rendering in the requested language
-- whose provenance, named review and redistribution rights remain current.
-- No scripture text, tentative work, member/paid item or private table is exposed.

create or replace function app.fn_knowledge_catalogue(p_language text default 'en')
returns table (
  work_slug text, work_title text, work_kind text,
  available_passage_count bigint, first_canonical_id text)
language sql stable security definer set search_path = app, pg_catalog as $$
  select w.slug, w.title, w.work_kind, count(*)::bigint,
         (array_agg(p.canonical_id order by p.sequence_no))[1]
    from app.knowledge_works w
    join app.knowledge_passages p on p.work_id = w.id
   where exists (
     select 1
       from app.knowledge_renderings r
       join app.knowledge_editions e on e.id = r.edition_id
       join app.knowledge_sources s on s.id = e.source_id
       join app.knowledge_source_licenses lic on lic.edition_id = e.id
       join app.reviewers rv on rv.id = r.reviewed_by
       join app.reviewer_languages rl on rl.reviewer_id = rv.id
        and rl.language_code = r.language_code
       join app.languages lang on lang.code = r.language_code and lang.is_active
      where r.passage_id = p.id and r.work_id = w.id
        and r.language_code = p_language and e.language_code = r.language_code
        and r.status = 'published' and r.access_class = 'public'
        and s.provenance_status = 'verified' and rv.auth_user_id is not null
        and lic.status = 'verified' and lic.may_redistribute
        and (lic.valid_from is null or lic.valid_from <= current_date)
        and (lic.valid_until is null or lic.valid_until >= current_date)
   )
   group by w.id
   order by w.title, w.slug;
$$;

-- Cursor is the work-scoped sequence_no from 0006, avoiding offset drift when
-- a licensed item is withdrawn. The caller resolves any chosen canonical_id
-- through fn_knowledge_passage, which repeats the live authorization checks.
create or replace function app.fn_knowledge_work_passages(
  p_work_slug text, p_language text default 'en',
  p_after_sequence_no integer default 0, p_limit integer default 50)
returns table (
  canonical_id text, canonical_reference text, unit_kind text,
  sequence_no integer)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
begin
  if p_work_slug is null or length(p_work_slug) = 0 or
     p_work_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'valid work slug is required' using errcode = 'check_violation';
  end if;
  if p_after_sequence_no is null or p_after_sequence_no < 0 or
     p_limit is null or p_limit not between 1 and 100 then
    raise exception 'invalid catalogue page request' using errcode = 'check_violation';
  end if;
  return query
  select p.canonical_id, p.canonical_reference, p.unit_kind, p.sequence_no
    from app.knowledge_works w
    join app.knowledge_passages p on p.work_id = w.id
   where w.slug = p_work_slug and p.sequence_no > p_after_sequence_no
     and exists (
       select 1
         from app.knowledge_renderings r
         join app.knowledge_editions e on e.id = r.edition_id
         join app.knowledge_sources s on s.id = e.source_id
         join app.knowledge_source_licenses lic on lic.edition_id = e.id
         join app.reviewers rv on rv.id = r.reviewed_by
         join app.reviewer_languages rl on rl.reviewer_id = rv.id
          and rl.language_code = r.language_code
         join app.languages lang on lang.code = r.language_code and lang.is_active
        where r.passage_id = p.id and r.work_id = w.id
          and r.language_code = p_language and e.language_code = r.language_code
          and r.status = 'published' and r.access_class = 'public'
          and s.provenance_status = 'verified' and rv.auth_user_id is not null
          and lic.status = 'verified' and lic.may_redistribute
          and (lic.valid_from is null or lic.valid_from <= current_date)
          and (lic.valid_until is null or lic.valid_until >= current_date)
     )
   order by p.sequence_no
   limit p_limit;
end $$;

revoke all on function app.fn_knowledge_catalogue(text)
  from public, anon, authenticated;
revoke all on function app.fn_knowledge_work_passages(text,text,integer,integer)
  from public, anon, authenticated;
grant execute on function app.fn_knowledge_catalogue(text) to anon, authenticated;
grant execute on function app.fn_knowledge_work_passages(text,text,integer,integer)
  to anon, authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_knowledge_catalogue(text)', 'both',
   'lists only works with currently rights-eligible public renderings'),
  ('app.fn_knowledge_work_passages(text,text,integer,integer)', 'both',
   'lists only currently rights-eligible public passage references in a work');
