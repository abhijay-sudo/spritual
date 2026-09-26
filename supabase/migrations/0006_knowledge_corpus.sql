-- 0006_knowledge_corpus.sql
-- Structured, source-grounded corpus. This migration contains NO scripture text:
-- the current Gita examples are unreviewed demo fixtures, not licensed seeds.
-- Client roles receive no table privileges; public RPCs filter rights at read time.

create table app.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  publisher text,
  source_identifier text not null check (length(btrim(source_identifier)) > 0),
  source_url text check (source_url is null or source_url ~ '^https?://[^[:space:]]+$'),
  provenance_status text not null default 'pending'
    check (provenance_status in ('pending','verified','rejected')),
  provenance_evidence text,
  verified_at timestamptz,
  ingested_at timestamptz not null default now(),
  unique (source_identifier),
  constraint verified_source_needs_evidence check (
    provenance_status <> 'verified' or
    (nullif(btrim(coalesce(provenance_evidence,'')), '') is not null and verified_at is not null)
  )
);

create table app.knowledge_works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) > 0),
  work_kind text not null check (work_kind in
    ('scripture','epic','story_collection','commentary_collection','other')),
  tradition_label text,
  created_at timestamptz not null default now()
);

-- Editions distinguish ancient source text from a modern translator's copyright.
-- The source row records where material came from; the license row records what
-- the operator has actually verified may be redistributed or used for AI.
create table app.knowledge_editions (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references app.knowledge_works(id),
  source_id uuid not null references app.knowledge_sources(id),
  edition_label text not null check (length(btrim(edition_label)) > 0),
  language_code text not null references app.languages(code),
  translator_name text,
  editor_name text,
  copyright_status text not null default 'unknown'
    check (copyright_status in ('unknown','public_domain','copyrighted','original')),
  created_at timestamptz not null default now(),
  unique (work_id, source_id, edition_label, language_code),
  unique (id, work_id)
);

create table app.knowledge_source_licenses (
  edition_id uuid primary key references app.knowledge_editions(id),
  license_kind text not null default 'unknown'
    check (license_kind in ('unknown','public_domain','permissive','owned','licensed')),
  status text not null default 'pending'
    check (status in ('pending','verified','revoked')),
  license_url text check (license_url is null or license_url ~ '^https?://[^[:space:]]+$'),
  rights_evidence text,
  attribution_text text,
  may_redistribute boolean not null default false,
  may_use_for_ai boolean not null default false,
  valid_from date,
  valid_until date,
  verified_at timestamptz,
  constraint license_dates_ordered check (valid_until is null or valid_from is null or valid_until >= valid_from),
  constraint verified_license_needs_evidence check (
    status <> 'verified' or
    (license_kind <> 'unknown' and nullif(btrim(coalesce(rights_evidence,'')), '') is not null
      and verified_at is not null)
  )
);

comment on column app.knowledge_source_licenses.may_use_for_ai is
  'Independent of redistribution rights. AI retrieval must filter this flag and current validity; a public passage is not automatically usable for model context.';

-- One passage is a meaningful citation unit, not an arbitrary token chunk.
-- canonical_id remains stable across editions and languages (e.g. bg.2.47).
create table app.knowledge_passages (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references app.knowledge_works(id),
  canonical_id text not null unique check (canonical_id ~ '^[a-z0-9]+(?:[.-][a-z0-9]+)*$'),
  canonical_reference text not null check (length(btrim(canonical_reference)) > 0),
  unit_kind text not null check (unit_kind in
    ('verse','section','story_scene','episode','mantra','other')),
  sequence_no integer not null check (sequence_no > 0),
  parent_id uuid,
  created_at timestamptz not null default now(),
  unique (work_id, canonical_reference),
  unique (work_id, sequence_no),
  unique (id, work_id),
  foreign key (parent_id, work_id) references app.knowledge_passages(id, work_id)
);

create index knowledge_passages_reference_fold_idx
  on app.knowledge_passages (lower(canonical_reference));

create table app.knowledge_renderings (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null,
  passage_id uuid not null,
  edition_id uuid not null,
  revision integer not null default 1 check (revision > 0),
  language_code text not null references app.languages(code),
  kind text not null check (kind in
    ('canonical_text','translation','commentary','scholarly_context',
     'editorial_explanation','story_retelling')),
  body text not null check (length(btrim(body)) > 0),
  transliteration text,
  content_origin text not null default 'human'
    check (content_origin in ('human','ai_assisted','ai_generated')),
  access_class text not null default 'internal'
    check (access_class in ('internal','public','member','paid')),
  status text not null default 'draft'
    check (status in ('draft','awaiting_review','approved','published','withdrawn')),
  reviewed_by uuid references app.reviewers(id),
  reviewed_at timestamptz,
  published_at timestamptz,
  withdrawn_reason text,
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector('simple'::regconfig, coalesce(body,'') || ' ' || coalesce(transliteration,''))
  ) stored,
  foreign key (passage_id, work_id) references app.knowledge_passages(id, work_id),
  foreign key (edition_id, work_id) references app.knowledge_editions(id, work_id),
  unique (passage_id, edition_id, kind, revision),
  constraint published_has_review check (
    status <> 'published' or
    (reviewed_by is not null and reviewed_at is not null and published_at is not null)
  ),
  constraint withdrawn_has_reason check (
    status <> 'withdrawn' or nullif(btrim(coalesce(withdrawn_reason,'')), '') is not null
  )
);

create index knowledge_renderings_fts_idx on app.knowledge_renderings using gin (search_vector);
create index knowledge_renderings_public_idx
  on app.knowledge_renderings (language_code, passage_id, published_at desc)
  where status = 'published';
create unique index knowledge_renderings_one_public_revision_idx
  on app.knowledge_renderings (passage_id, edition_id, kind)
  where status = 'published';
create index knowledge_editions_work_idx on app.knowledge_editions (work_id, language_code);

-- A published rendering may only be withdrawn. Corrected text is a new revision,
-- retaining a stable passage citation and an auditable old version.
create or replace function app.trg_guard_knowledge_publication()
returns trigger language plpgsql security invoker
set search_path = app, pg_catalog as $$
declare e record; s record; lic record;
begin
  if tg_op = 'UPDATE' then
    if old.status = 'published' then
      if new.status <> 'withdrawn' or
         (to_jsonb(new) - 'status' - 'withdrawn_reason' - 'search_vector') is distinct from
         (to_jsonb(old) - 'status' - 'withdrawn_reason' - 'search_vector') then
        raise exception 'published rendering is immutable; create a new revision or withdraw it'
          using errcode = 'check_violation';
      end if;
    end if;
  end if;

  if new.status <> 'published' then return new; end if;
  if tg_op = 'UPDATE' then
    if old.status = 'published' then return new; end if;
  end if;
  if new.access_class = 'internal' then
    raise exception 'publication requires an explicit access class'
      using errcode = 'check_violation';
  end if;

  select * into e from app.knowledge_editions where id = new.edition_id;
  select * into s from app.knowledge_sources where id = e.source_id;
  select * into lic from app.knowledge_source_licenses where edition_id = e.id;
  if e.language_code <> new.language_code or s.provenance_status <> 'verified' or
     lic.status is distinct from 'verified' or not coalesce(lic.may_redistribute, false) or
     (lic.valid_from is not null and current_date < lic.valid_from) or
     (lic.valid_until is not null and current_date > lic.valid_until) then
    raise exception 'edition provenance or current redistribution rights are unverified'
      using errcode = 'check_violation';
  end if;
  if new.content_origin = 'ai_generated' and new.kind in ('canonical_text','translation') then
    raise exception 'AI-generated text cannot publish as canonical scripture or translation'
      using errcode = 'check_violation';
  end if;
  if not exists (select 1 from app.languages l
                 where l.code = new.language_code and l.is_active) then
    raise exception 'rendering language has not been activated for publication'
      using errcode = 'check_violation';
  end if;
  if new.reviewed_by is null or new.reviewed_at is null or not exists (
    select 1 from app.reviewers rv
      join app.reviewer_languages rl on rl.reviewer_id = rv.id
     where rv.id = new.reviewed_by and rv.auth_user_id is not null
       and rl.language_code = new.language_code
  ) then
    raise exception 'named reviewer competent in rendering language is required'
      using errcode = 'check_violation';
  end if;
  new.published_at := coalesce(new.published_at, now());
  return new;
end $$;

create trigger guard_knowledge_publication
  before insert or update on app.knowledge_renderings
  for each row execute function app.trg_guard_knowledge_publication();

-- Dynamic rights filtering matters: grants can lapse or be revoked without
-- touching publication rows. No client receives underlying table access.
create or replace function app.fn_knowledge_search(
  p_query text, p_language text default 'en', p_limit integer default 20)
returns table (
  passage_id uuid, canonical_id text, work_slug text, canonical_reference text,
  work_title text, rendering_id uuid, content_kind text, language_code text,
  body text, source_title text, source_url text, source_identifier text,
  attribution_text text, license_kind text, reviewer_name text, reviewed_at timestamptz)
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare q text := btrim(coalesce(p_query,'')); ts tsquery;
begin
  if length(q) < 3 or length(q) > 160 then
    raise exception 'search query must be 3 to 160 characters' using errcode = 'check_violation';
  end if;
  ts := websearch_to_tsquery('simple'::regconfig, q);
  return query
  select p.id, p.canonical_id, w.slug, p.canonical_reference, w.title,
         r.id, r.kind, r.language_code, r.body, s.title, s.source_url,
         s.source_identifier, lic.attribution_text, lic.license_kind,
         rv.full_name, r.reviewed_at
    from app.knowledge_renderings r
    join app.knowledge_passages p on p.id = r.passage_id
    join app.knowledge_works w on w.id = p.work_id
    join app.knowledge_editions e on e.id = r.edition_id
    join app.knowledge_sources s on s.id = e.source_id
    join app.knowledge_source_licenses lic on lic.edition_id = e.id
    join app.reviewers rv on rv.id = r.reviewed_by
    join app.reviewer_languages rl on rl.reviewer_id = rv.id and rl.language_code = r.language_code
    join app.languages lang on lang.code = r.language_code and lang.is_active
   where r.status = 'published' and r.access_class = 'public'
     and r.language_code = p_language
     and e.language_code = r.language_code
     and s.provenance_status = 'verified' and rv.auth_user_id is not null
     and lic.status = 'verified'
     and lic.may_redistribute
     and (lic.valid_from is null or lic.valid_from <= current_date)
     and (lic.valid_until is null or lic.valid_until >= current_date)
     and (
       r.search_vector @@ ts or
       lower(p.canonical_reference) = lower(q) or
       lower(p.canonical_id) = lower(q) or
       lower(w.slug) = lower(q) or
       lower(w.title) = lower(q)
     )
   order by
     (lower(p.canonical_id) = lower(q)) desc,
     (lower(p.canonical_reference) = lower(q)) desc,
     ts_rank_cd(r.search_vector, ts) desc,
     p.sequence_no, r.published_at desc
   limit least(greatest(coalesce(p_limit, 20), 1), 30);
end $$;

-- Citation resolver for a known passage, including the explicit content kind
-- and provenance of each currently available language rendering.
create or replace function app.fn_knowledge_passage(
  p_canonical_id text, p_language text default 'en')
returns jsonb
language sql stable security definer set search_path = app, pg_catalog as $$
  select coalesce((
    select jsonb_build_object(
      'passage_id', p.id, 'canonical_id', p.canonical_id,
      'canonical_reference', p.canonical_reference, 'work_slug', w.slug,
      'work_title', w.title, 'unit_kind', p.unit_kind,
      'renderings', jsonb_agg(jsonb_build_object(
        'rendering_id', r.id, 'kind', r.kind, 'language_code', r.language_code,
        'body', r.body, 'transliteration', r.transliteration,
        'content_origin', r.content_origin, 'reviewed_at', r.reviewed_at,
        'reviewer_name', rv.full_name, 'source_title', s.title,
        'source_url', s.source_url, 'source_identifier', s.source_identifier,
        'edition', e.edition_label, 'translator', e.translator_name,
        'editor', e.editor_name, 'license_kind', lic.license_kind,
        'attribution', lic.attribution_text) order by r.kind, r.published_at desc))
      from app.knowledge_passages p
      join app.knowledge_works w on w.id = p.work_id
      join app.knowledge_renderings r on r.passage_id = p.id
      join app.knowledge_editions e on e.id = r.edition_id and e.language_code = r.language_code
      join app.knowledge_sources s on s.id = e.source_id
      join app.knowledge_source_licenses lic on lic.edition_id = e.id
      join app.reviewers rv on rv.id = r.reviewed_by
      join app.reviewer_languages rl on rl.reviewer_id = rv.id and rl.language_code = r.language_code
      join app.languages lang on lang.code = r.language_code and lang.is_active
     where p.canonical_id = p_canonical_id
       and (r.language_code = p_language or r.kind = 'canonical_text')
       and r.status = 'published' and r.access_class = 'public'
       and s.provenance_status = 'verified'
       and rv.auth_user_id is not null
       and lic.status = 'verified' and lic.may_redistribute
       and (lic.valid_from is null or lic.valid_from <= current_date)
       and (lic.valid_until is null or lic.valid_until >= current_date)
     group by p.id, w.id), null::jsonb);
$$;

-- 0005 seals new function defaults, but make grants explicit for independent
-- migration inspection. No API for unpublished material or editor mutations.
revoke all on function app.trg_guard_knowledge_publication() from public, anon, authenticated;
revoke all on function app.fn_knowledge_search(text,text,integer) from public, anon, authenticated;
revoke all on function app.fn_knowledge_passage(text,text) from public, anon, authenticated;
grant execute on function app.fn_knowledge_search(text,text,integer) to anon, authenticated;
grant execute on function app.fn_knowledge_passage(text,text) to anon, authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_knowledge_search(text,text,integer)', 'both',
   'only reviewed renderings with current verified redistribution rights'),
  ('app.fn_knowledge_passage(text,text)', 'both',
   'citation resolver exposes only reviewed renderings with current verified rights');

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'app'
    and tablename in ('knowledge_sources','knowledge_works','knowledge_editions',
      'knowledge_source_licenses','knowledge_passages','knowledge_renderings')
  loop
    execute format('revoke all on table app.%I from public, anon, authenticated', t.tablename);
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;
