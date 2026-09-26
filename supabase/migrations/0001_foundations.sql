-- 0001_foundations.sql
-- Schemas, extensions, languages, organisations, profiles, memberships.
--
-- SECURITY MODEL (assertions P1-P3 of the build plan):
--   * Schema `app` holds all tenant data. NO base table is granted to anon/authenticated.
--   * Schema `ops` holds operator-only data and is NOT in the PostgREST exposed-schema list.
--   * All client access flows through SECURITY DEFINER functions with explicit EXECUTE grants
--     and a pinned search_path. A table added later is inaccessible by default rather than
--     accidentally public -- absence of a grant is the safe state.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create schema if not exists app;
create schema if not exists ops;

-- Revoke the ambient CREATE/USAGE that would otherwise let a role reach new objects.
revoke all on schema app from public;
revoke all on schema ops from public;
grant usage on schema app to authenticated, anon;   -- usage only; no table grants follow
-- `ops` deliberately gets no grant at all.

-- Default privileges: anything created later in `app` grants nothing to clients.
alter default privileges in schema app revoke all on tables from anon, authenticated;
alter default privileges in schema ops revoke all on tables from anon, authenticated;


-- ---------------------------------------------------------------------------
-- Languages. Multi-language is a day-1 schema fact, not a later migration.
-- `script` matters because the three-column player renders source text in its
-- own writing system; two languages can share a script (Hindi/Marathi = Devanagari).
-- ---------------------------------------------------------------------------
create table app.languages (
  code              text primary key,              -- BCP-47: 'hi', 'ta', 'sa', 'en-IN'
  english_name      text not null,
  endonym           text not null,                 -- the language's name in itself
  script            text not null,                 -- ISO 15924: 'Deva', 'Taml', 'Latn'
  direction         text not null default 'ltr' check (direction in ('ltr','rtl')),
  transliteration_scheme text,                     -- 'ISO15919', 'IAST', null for Latn
  is_active         boolean not null default false,-- a language goes live only when it has a reviewer
  created_at        timestamptz not null default now()
);

comment on column app.languages.is_active is
  'False until a named reviewer exists for this language. The publish gate in 0002 '
  'refuses to publish a variant in an inactive language, so adding a row here is safe.';

insert into app.languages (code, english_name, endonym, script, transliteration_scheme) values
  ('en',    'English',   'English',    'Latn', null),
  ('sa',    'Sanskrit',  'संस्कृतम्',      'Deva', 'ISO15919'),
  ('hi',    'Hindi',     'हिन्दी',         'Deva', 'ISO15919'),
  ('bn',    'Bengali',   'বাংলা',        'Beng', 'ISO15919'),
  ('ta',    'Tamil',     'தமிழ்',        'Taml', 'ISO15919'),
  ('te',    'Telugu',    'తెలుగు',       'Telu', 'ISO15919'),
  ('mr',    'Marathi',   'मराठी',        'Deva', 'ISO15919'),
  ('gu',    'Gujarati',  'ગુજરાતી',       'Gujr', 'ISO15919'),
  ('kn',    'Kannada',   'ಕನ್ನಡ',        'Knda', 'ISO15919'),
  ('ml',    'Malayalam', 'മലയാളം',      'Mlym', 'ISO15919'),
  ('pa',    'Punjabi',   'ਪੰਜਾਬੀ',        'Guru', 'ISO15919'),
  ('or',    'Odia',      'ଓଡ଼ିଆ',         'Orya', 'ISO15919'),
  ('as',    'Assamese',  'অসমীয়া',      'Beng', 'ISO15919'),
  ('ur',    'Urdu',      'اردو',         'Arab', 'ISO15919'),
  ('ne',    'Nepali',    'नेपाली',        'Deva', 'ISO15919'),
  ('si',    'Sinhala',   'සිංහල',        'Sinh', 'ISO15919'),
  ('sd',    'Sindhi',    'سنڌي',         'Arab', 'ISO15919'),
  ('ks',    'Kashmiri',  'کٲشُر',         'Arab', 'ISO15919'),
  ('kok',   'Konkani',   'कोंकणी',        'Deva', 'ISO15919'),
  ('mai',   'Maithili',  'मैथिली',        'Deva', 'ISO15919'),
  ('doi',   'Dogri',     'डोगरी',        'Deva', 'ISO15919'),
  ('sat',   'Santali',   'ᱥᱟᱱᱛᱟᱲᱤ',      'Olck', 'ISO15919'),
  ('mni',   'Manipuri',  'ꯃꯤꯇꯩꯂꯣꯟ',     'Mtei', 'ISO15919'),
  ('bho',   'Bhojpuri',  'भोजपुरी',       'Deva', 'ISO15919'),
  ('raj',   'Rajasthani','राजस्थानी',     'Deva', 'ISO15919'),
  ('tcy',   'Tulu',      'ತುಳು',         'Knda', 'ISO15919'),
  ('ar',    'Arabic',    'العربية',       'Arab', 'ISO15919');

update app.languages set direction = 'rtl' where script = 'Arab';
-- English is active on day 1 because meaning glosses are authored in it and it needs no
-- separate scholarly review to be trustworthy as a *gloss* language.
update app.languages set is_active = true where code = 'en';


-- ---------------------------------------------------------------------------
-- Reviewers. A real named human who vouches for a language variant.
-- Referenced NOT NULL by published content: the constraint is the product.
-- ---------------------------------------------------------------------------
create table app.reviewers (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null check (length(trim(full_name)) > 2),
  credentials       text not null,                 -- shown to users verbatim
  affiliation       text,
  auth_user_id      uuid unique,                   -- set when the reviewer has a login
  created_at        timestamptz not null default now()
);

-- Which languages a reviewer is competent to sign off. A Tamil scholar does not
-- silently become authoritative for Bengali because a column allowed it.
create table app.reviewer_languages (
  reviewer_id       uuid not null references app.reviewers(id) on delete cascade,
  language_code     text not null references app.languages(code),
  primary key (reviewer_id, language_code)
);


-- ---------------------------------------------------------------------------
-- Organisations (institutions/circles) and membership.
-- ---------------------------------------------------------------------------
create type app.org_kind as enum ('institution', 'household');

create table app.organizations (
  id                uuid primary key default gen_random_uuid(),
  kind              app.org_kind not null,
  display_name      text not null,
  country           text not null default 'IN',    -- ISO 3166-1 alpha-2
  primary_language  text not null references app.languages(code) default 'en',
  seat_cap          integer not null check (seat_cap between 1 and 500),
  created_at        timestamptz not null default now()
);

comment on column app.organizations.seat_cap is
  'Households cap at 5 (India 4); institutions at their contracted seat count. '
  'Enforced atomically at claim time by app.fn_claim_seat, not by application code.';

create type app.member_role as enum ('member', 'admin', 'teacher', 'reviewer');

create table app.memberships (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references app.organizations(id) on delete cascade,
  user_id           uuid not null,                 -- auth.users.id
  role              app.member_role not null default 'member',
  joined_at         timestamptz not null default now(),
  revoked_at        timestamptz,
  unique (org_id, user_id)
);

create index on app.memberships (user_id) where revoked_at is null;
create index on app.memberships (org_id) where revoked_at is null;


-- ---------------------------------------------------------------------------
-- Profiles. Deliberately thin.
--
-- `tradition` and `preferred_language` are Article 9 special-category data under
-- GDPR the moment they sit against an identifiable account. Both are NULLABLE:
-- the product must work for someone who declines to state either. See 0004 for
-- the consent gate that must exist before either is written.
-- ---------------------------------------------------------------------------
create table app.profiles (
  user_id             uuid primary key,
  display_name        text,
  preferred_language  text references app.languages(code),
  tradition           text,
  reminder_local_time time,                        -- nothing reads this until cron-reminders ships
  timezone            text not null default 'Asia/Kolkata',
  quiet_hours_start   time not null default '21:00',
  quiet_hours_end     time not null default '07:00',
  created_at          timestamptz not null default now()
);

comment on table app.profiles is
  'tradition and preferred_language are GDPR Article 9 data. They must never be '
  'copied into app.product_events, never sent to any analytics processor, and '
  'never inferred from behaviour. Both are optional by design.';


-- ---------------------------------------------------------------------------
-- Force RLS everywhere in `app`. FORCE applies the policy even to the table
-- owner, so a SECURITY DEFINER function cannot accidentally bypass it.
-- ---------------------------------------------------------------------------
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'app'
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;
