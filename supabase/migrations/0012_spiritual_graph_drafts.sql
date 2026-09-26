-- Generic editorial graph foundation. No religious records or media are seeded.
-- All rows remain private drafts; public release requires a separately audited
-- rights-aware read API and editor workflow. Do not expose these tables to clients.

create table app.spiritual_entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  entity_kind text not null check (entity_kind in
    ('divine_form','avatar','sage','scriptural_character','teacher','place','concept')),
  editorial_status text not null default 'draft' check (editorial_status in
    ('draft','review_required','verified','archived')),
  tradition_context text,
  description_en text,
  description_hi text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table app.spiritual_entity_names (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references app.spiritual_entities(id) on delete cascade,
  language_code text not null references app.languages(code),
  script_code text not null check (script_code in ('Deva','Latn')),
  display_name text not null check (length(btrim(display_name)) between 1 and 160),
  normalized_name text not null check (length(btrim(normalized_name)) between 1 and 160),
  name_kind text not null check (name_kind in ('primary','alias','epithet','honorific','regional')),
  created_at timestamptz not null default now(),
  unique (entity_id, language_code, script_code, normalized_name)
);
create index spiritual_entity_names_lookup_idx
  on app.spiritual_entity_names (language_code, normalized_name);

create table app.spiritual_themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name_en text not null check (length(btrim(name_en)) > 0),
  name_hi text not null check (length(btrim(name_hi)) > 0),
  editorial_status text not null default 'draft' check (editorial_status in
    ('draft','review_required','verified','archived'))
);

create table app.spiritual_media_assets (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (storage_path ~ '^[a-z0-9/_-]+[.][a-z0-9]+$'),
  media_kind text not null check (media_kind in ('image','audio','video')),
  alt_en text,
  alt_hi text,
  creator_credit text,
  rights_status text not null default 'unknown' check (rights_status in
    ('unknown','permission_pending','verified','revoked')),
  rights_evidence text,
  editorial_status text not null default 'draft' check (editorial_status in
    ('draft','review_required','verified','archived')),
  created_at timestamptz not null default now(),
  constraint verified_media_needs_rights check (
    editorial_status <> 'verified' or
    (rights_status = 'verified' and nullif(btrim(coalesce(rights_evidence,'')), '') is not null))
);
alter table app.spiritual_entities
  add column hero_media_id uuid references app.spiritual_media_assets(id);

create table app.spiritual_stories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title_en text not null check (length(btrim(title_en)) > 0),
  title_hi text not null check (length(btrim(title_hi)) > 0),
  story_kind text not null check (story_kind in ('original_retelling','source_navigation')),
  source_id uuid not null references app.knowledge_sources(id),
  edition_id uuid references app.knowledge_editions(id),
  source_reference text not null check (length(btrim(source_reference)) > 0),
  editorial_status text not null default 'draft' check (editorial_status in
    ('draft','review_required','verified','archived')),
  reviewer_id uuid references app.reviewers(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint verified_story_has_named_review check (
    editorial_status <> 'verified' or
    (reviewer_id is not null and reviewed_at is not null and edition_id is not null)),
  constraint review_pair check ((reviewer_id is null) = (reviewed_at is null))
);

create or replace function app.trg_guard_spiritual_story_review()
returns trigger language plpgsql security invoker
set search_path = app, pg_catalog as $$
begin
  if new.editorial_status <> 'verified' then return new; end if;
  if not exists (
    select 1 from app.knowledge_editions e
      join app.knowledge_sources s on s.id = e.source_id
      join app.knowledge_source_licenses lic on lic.edition_id = e.id
      join app.reviewers rv on rv.id = new.reviewer_id
     where e.id = new.edition_id and e.source_id = new.source_id
       and s.provenance_status = 'verified'
       and lic.status = 'verified' and lic.may_redistribute
       and (lic.valid_from is null or lic.valid_from <= current_date)
       and (lic.valid_until is null or lic.valid_until >= current_date)
       and rv.auth_user_id is not null
       and exists (select 1 from app.reviewer_languages rl
                   where rl.reviewer_id = rv.id and rl.language_code = 'en')
       and exists (select 1 from app.reviewer_languages rl
                   where rl.reviewer_id = rv.id and rl.language_code = 'hi')
  ) then
    raise exception 'story review requires current exact-edition rights, verified provenance and a named bilingual reviewer'
      using errcode = '23514';
  end if;
  return new;
end $$;
create trigger guard_spiritual_story_review
  before insert or update on app.spiritual_stories
  for each row execute function app.trg_guard_spiritual_story_review();
revoke all on function app.trg_guard_spiritual_story_review() from public, anon, authenticated;

create table app.spiritual_story_scenes (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references app.spiritual_stories(id) on delete cascade,
  sequence_no integer not null check (sequence_no > 0),
  source_reference text not null check (length(btrim(source_reference)) > 0),
  body_en text not null check (length(btrim(body_en)) > 0),
  body_hi text not null check (length(btrim(body_hi)) > 0),
  reflection_en text,
  reflection_hi text,
  unique (story_id, sequence_no)
);

create table app.spiritual_graph_links (
  id uuid primary key default gen_random_uuid(),
  from_entity_id uuid references app.spiritual_entities(id) on delete cascade,
  to_entity_id uuid references app.spiritual_entities(id) on delete cascade,
  to_story_id uuid references app.spiritual_stories(id) on delete cascade,
  to_passage_id uuid references app.knowledge_passages(id),
  to_theme_id uuid references app.spiritual_themes(id),
  relation_kind text not null check (relation_kind in
    ('appears_in','associated_with','teaches','editorial_companion','source_pointer')),
  tradition_context text,
  editorial_note text not null check (length(btrim(editorial_note)) > 0),
  source_id uuid references app.knowledge_sources(id),
  source_reference text,
  editorial_status text not null default 'draft' check (editorial_status in
    ('draft','review_required','verified','archived')),
  created_at timestamptz not null default now(),
  constraint graph_link_one_target check (
    num_nonnulls(to_entity_id,to_story_id,to_passage_id,to_theme_id) = 1),
  constraint graph_link_has_start check (from_entity_id is not null),
  constraint graph_link_context_for_entity_relation check (
    to_entity_id is null or
    (nullif(btrim(coalesce(tradition_context,'')), '') is not null and
     source_id is not null and
     nullif(btrim(coalesce(source_reference,'')), '') is not null))
);
create index spiritual_graph_links_from_idx on app.spiritual_graph_links(from_entity_id);

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'spiritual_entities','spiritual_entity_names','spiritual_stories',
    'spiritual_story_scenes','spiritual_graph_links','spiritual_themes',
    'spiritual_media_assets'] loop
    execute format('revoke all on table app.%I from public, anon, authenticated', table_name);
    execute format('alter table app.%I enable row level security', table_name);
    execute format('alter table app.%I force row level security', table_name);
  end loop;
end $$;
