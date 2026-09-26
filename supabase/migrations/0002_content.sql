-- 0002_content.sql
-- The script-first practice record. This file IS the product thesis in schema form.
--
-- THE CORE SHAPE
--   practice                 "Gayatri Mantra" -- the canonical thing
--   └ practice_version       one authored, versioned rendering in a SOURCE language (e.g. Sanskrit)
--     └ segment              one line: source text + transliteration + alignment timestamps
--       └ segment_gloss      that line's meaning, in ONE gloss language (en/hi/ta/bn/...)
--
-- Why the gloss is its own table: a Tamil speaker reciting a Sanskrit stotra needs
-- Sanskrit script + transliteration + TAMIL meaning. The source text never changes;
-- only the gloss language does. One expensive authoring pass (timestamps, translit)
-- serves every regional language by adding gloss rows. That is what makes
-- "all regional languages" affordable at this price instead of a per-language treadmill.
--
-- THE CONSTRAINT THAT IS THE PRODUCT
--   No version reaches state='published' without an in-term rights grant, a named
--   reviewer competent in the relevant language, and a source citation. Enforced by
--   trigger, not by policy document. It also makes per-user AI generation impossible
--   by construction -- generated text has no reviewer, so it cannot publish.

-- ---------------------------------------------------------------------------
-- Rights ledger. A recording without recorded rights cannot be sold.
-- ---------------------------------------------------------------------------
create table app.partners (
  id                uuid primary key default gen_random_uuid(),
  legal_name        text not null,
  royalty_rate_bps  integer not null default 1500 check (royalty_rate_bps between 0 and 10000),
  settlement_terms  text not null default 'monthly, after the 30-day refund window',
  created_at        timestamptz not null default now()
);

create table app.rights (
  id                  uuid primary key default gen_random_uuid(),
  licensor_id         uuid not null references app.partners(id),
  work_title          text not null,
  underlying_work_status text not null
    check (underlying_work_status in ('public_domain','licensed','original','traditional_unattributed')),
  underlying_work_reference text,
  territory           text[] not null default array['WW'],
  term_start          date not null,
  term_end            date,                       -- null = perpetual; see CHECK below
  languages           text[] not null,            -- gloss languages this grant covers
  may_redistribute    boolean not null default false,
  may_edit            boolean not null default false,
  may_use_for_ai      boolean not null default false,
  permits_permanent_copy boolean not null default false,
  grant_form          text not null default 'signed'
    check (grant_form in ('signed','written_consent_pending_signature')),
  provisional_expires_at date,                    -- a pending grant must have a hard date
  created_at          timestamptz not null default now(),

  -- A provisional grant without an expiry would become permanent by inattention.
  constraint provisional_needs_expiry check (
    grant_form = 'signed' or provisional_expires_at is not null
  )
);

comment on column app.rights.grant_form is
  'The escape valve from the build plan gate G6: a teacher email confirming terms '
  'unblocks launch, but provisional_expires_at forces the signature. fn_can_publish '
  'refuses a provisional grant past its expiry, so paperwork delay degrades to a '
  'content gap rather than a silent rights breach.';


-- ---------------------------------------------------------------------------
-- Practices and their versions.
-- ---------------------------------------------------------------------------
create table app.practices (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  tradition         text not null,
  created_at        timestamptz not null default now()
);

create type app.content_state as enum
  ('draft', 'awaiting_review', 'approved', 'published', 'superseded', 'withdrawn');

create table app.practice_versions (
  id                  uuid primary key default gen_random_uuid(),
  practice_id         uuid not null references app.practices(id) on delete cascade,
  version_number      integer not null,
  source_language     text not null references app.languages(code),
  title               text not null,
  purpose             text not null,              -- shown on every item header
  source_citation     text not null,              -- NOT NULL: "Rigveda 3.62.10"
  rights_id           uuid not null references app.rights(id),
  audio_object_key    text,                       -- R2 key in the private bucket
  audio_duration_ms   integer check (audio_duration_ms > 0),
  state               app.content_state not null default 'draft',
  superseded_by       uuid references app.practice_versions(id),
  withdrawn_reason    text,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  unique (practice_id, version_number),

  constraint withdrawn_needs_reason check (
    state <> 'withdrawn' or withdrawn_reason is not null
  )
);

-- ---------------------------------------------------------------------------
-- Segments: one recited line. The unit the three-column player scrolls.
--
-- optional_at drives the 3/5/10-minute variants: a segment is included in a
-- duration if that integer appears in the array. One recording, three honest
-- teacher-approved lengths -- not three worse recordings.
-- ---------------------------------------------------------------------------
create table app.segments (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id) on delete cascade,
  ordinal           integer not null check (ordinal > 0),
  source_text       text not null,                -- in the source language's own script
  transliteration   text,                         -- ISO 15919; null when source is Latn
  start_ms          integer not null check (start_ms >= 0),
  end_ms            integer not null,
  optional_at       integer[] not null default array[3,5,10],
  is_silence        boolean not null default false,
  unique (version_id, ordinal),
  constraint segment_time_ordered check (end_ms > start_ms),
  constraint optional_at_valid check (optional_at <@ array[3,5,10])
);

comment on column app.segments.optional_at is
  'Which duration variants include this segment. array[10] = only the long form. '
  'The 3-minute variant must still be a complete practice, not a truncation: '
  'that is an editorial judgement made when authoring, enforced by review.';

-- ---------------------------------------------------------------------------
-- Glosses: the meaning of one segment in ONE language. The multilingual seam.
-- ---------------------------------------------------------------------------
create table app.segment_glosses (
  id                uuid primary key default gen_random_uuid(),
  segment_id        uuid not null references app.segments(id) on delete cascade,
  language_code     text not null references app.languages(code),
  translation       text not null,                -- literal rendering of the line
  meaning           text not null,                -- one plain sentence: what it MEANS
  created_at        timestamptz not null default now(),
  unique (segment_id, language_code)
);

-- ---------------------------------------------------------------------------
-- Per-language sign-off. A version is publishable IN A LANGUAGE only when a
-- reviewer competent in that language has signed that language's glosses.
-- This is why adding Bengali needs a Bengali scholar and nothing else.
-- ---------------------------------------------------------------------------
create table app.version_language_approvals (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id) on delete cascade,
  language_code     text not null references app.languages(code),
  reviewer_id       uuid not null references app.reviewers(id),
  approved_at       timestamptz not null default now(),
  approved_by_auth_user uuid not null,            -- the reviewer's OWN session, not the founder's
  notes             text,
  unique (version_id, language_code)
);

comment on table app.version_language_approvals is
  'approved_by_auth_user must be the reviewer''s own auth.uid(). The founder holding '
  'that credential would make the named-reviewer claim false, which is the one claim '
  'the whole product rests on. Verified manually at launch (assertion P25).';

-- ---------------------------------------------------------------------------
-- Correction log. Public, dated, per practice. The defensibility item.
-- ---------------------------------------------------------------------------
create table app.corrections (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id),
  language_code     text references app.languages(code),   -- null = affects source text
  segment_ordinal   integer,
  what_changed      text not null,
  why               text not null,
  corrected_by      uuid not null references app.reviewers(id),
  corrected_at      timestamptz not null default now(),
  is_public         boolean not null default true
);


-- ---------------------------------------------------------------------------
-- THE PUBLISH GATE
-- ---------------------------------------------------------------------------
create or replace function app.fn_can_publish(p_version_id uuid, p_language text)
returns table (ok boolean, reason text)
language plpgsql
stable
security invoker
set search_path = app, pg_catalog
as $$
declare
  v record;
  r record;
  n_segments integer;
  n_glossed  integer;
begin
  select * into v from app.practice_versions where id = p_version_id;
  if not found then
    return query select false, 'version does not exist'; return;
  end if;

  if not exists (select 1 from app.languages where code = p_language and is_active) then
    return query select false, format('language %s is not active: it has no named reviewer', p_language);
    return;
  end if;

  select * into r from app.rights where id = v.rights_id;
  if r.term_end is not null and r.term_end < current_date then
    return query select false, 'rights grant has expired'; return;
  end if;
  if r.grant_form = 'written_consent_pending_signature'
     and r.provisional_expires_at < current_date then
    return query select false, 'provisional rights grant has lapsed; signature required'; return;
  end if;
  if not (p_language = any(r.languages)) then
    return query select false, format('rights grant does not cover language %s', p_language); return;
  end if;

  if v.audio_object_key is null then
    return query select false, 'no audio recording attached'; return;
  end if;

  select count(*) into n_segments from app.segments where version_id = p_version_id;
  if n_segments = 0 then
    return query select false, 'version has no segments: nothing to render'; return;
  end if;

  -- Every segment must be glossed. A half-translated practice is worse than none:
  -- the user hits an untranslated line exactly when they trusted the product most.
  select count(*) into n_glossed
    from app.segments s
    join app.segment_glosses g on g.segment_id = s.id and g.language_code = p_language
   where s.version_id = p_version_id;
  if n_glossed < n_segments then
    return query select false,
      format('%s of %s segments lack a %s gloss', n_segments - n_glossed, n_segments, p_language);
    return;
  end if;

  -- The named reviewer, competent in THIS language, must have signed.
  if not exists (
    select 1
      from app.version_language_approvals a
      join app.reviewer_languages rl
        on rl.reviewer_id = a.reviewer_id and rl.language_code = a.language_code
     where a.version_id = p_version_id and a.language_code = p_language
  ) then
    return query select false,
      format('no approval by a reviewer competent in %s', p_language);
    return;
  end if;

  return query select true, 'publishable';
end $$;

-- Trigger form: refuses the state transition rather than trusting the caller.
create or replace function app.trg_guard_publish()
returns trigger
language plpgsql
security invoker
set search_path = app, pg_catalog
as $$
declare
  langs text[];
  l text;
  res record;
begin
  if new.state = 'published' and (old.state is distinct from 'published') then
    select array_agg(distinct language_code) into langs
      from app.version_language_approvals where version_id = new.id;

    if langs is null or array_length(langs, 1) = 0 then
      raise exception 'cannot publish version %: no language has been approved', new.id
        using errcode = 'check_violation';
    end if;

    foreach l in array langs loop
      select * into res from app.fn_can_publish(new.id, l);
      if not res.ok then
        raise exception 'cannot publish version % in %: %', new.id, l, res.reason
          using errcode = 'check_violation';
      end if;
    end loop;

    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;

create trigger guard_publish
  before update on app.practice_versions
  for each row execute function app.trg_guard_publish();


do $$
declare t record;
begin
  for t in select tablename from pg_tables
            where schemaname = 'app' and tablename in (
              'partners','rights','practices','practice_versions','segments',
              'segment_glosses','version_language_approvals','corrections')
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;
