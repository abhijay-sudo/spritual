-- Run only against a disposable local database with migrations 0001-0007 and
-- pgTAP installed. All synthetic fixtures roll back; no content is approved.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgtap';
select plan(30);

select is((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'app' and c.relname like 'knowledge_%' and c.relkind = 'r'
    and (not c.relrowsecurity or not c.relforcerowsecurity)),
  0::bigint, 'all knowledge tables force RLS');
select is((select count(*) from information_schema.role_table_grants
  where table_schema = 'app' and table_name like 'knowledge_%'
    and grantee in ('anon','authenticated')),
  0::bigint, 'no knowledge table is granted to client roles');
select is((select count(*) from ops.fn_check_api_surface()), 0::bigint,
  'new public RPCs are explicitly allowlisted');
select ok(has_function_privilege('anon','app.fn_knowledge_search(text,text,integer)','execute'),
  'anonymous search is explicitly granted');
select ok(has_function_privilege('anon','app.fn_knowledge_passage(text,text)','execute'),
  'anonymous citation resolution is explicitly granted');
select ok(has_function_privilege('anon','app.fn_knowledge_catalogue(text)','execute'),
  'anonymous rights-filtered work catalogue is explicitly granted');
select ok(has_function_privilege('anon','app.fn_knowledge_work_passages(text,text,integer,integer)','execute'),
  'anonymous rights-filtered passage browse is explicitly granted');

insert into app.knowledge_sources
  (id,title,source_identifier,source_url)
values ('fb000001-0000-4000-8000-000000000001','Synthetic source','fixture:synthetic-1',
  'https://example.invalid/fixture');
insert into app.knowledge_works
  (id,slug,title,work_kind)
values ('fb000002-0000-4000-8000-000000000002','fixture-gita',
  'Synthetic Gita test work','scripture');
insert into app.knowledge_editions
  (id,work_id,source_id,edition_label,language_code)
values ('fb000003-0000-4000-8000-000000000003',
  'fb000002-0000-4000-8000-000000000002',
  'fb000001-0000-4000-8000-000000000001','Synthetic edition','en');
insert into app.knowledge_source_licenses (edition_id)
values ('fb000003-0000-4000-8000-000000000003');
insert into app.knowledge_passages
  (id,work_id,canonical_id,canonical_reference,unit_kind,sequence_no)
values ('fb000004-0000-4000-8000-000000000004',
  'fb000002-0000-4000-8000-000000000002','test.bg.2.47','2.47','verse',1);
insert into app.reviewers
  (id,full_name,credentials,auth_user_id)
values ('fb000005-0000-4000-8000-000000000005','Synthetic reviewer',
  'SQL fixture only','fb000006-0000-4000-8000-000000000006');
insert into app.reviewer_languages (reviewer_id,language_code)
values ('fb000005-0000-4000-8000-000000000005','en');
insert into app.knowledge_renderings
  (id,work_id,passage_id,edition_id,language_code,kind,body)
values ('fb000007-0000-4000-8000-000000000007',
  'fb000002-0000-4000-8000-000000000002',
  'fb000004-0000-4000-8000-000000000004',
  'fb000003-0000-4000-8000-000000000003',
  'en','editorial_explanation','Synthetic fixture: release a result.');

set local role anon;
select is((select count(*) from app.fn_knowledge_search('release','en',20)),
  0::bigint, 'draft material is absent from public search');
select is(app.fn_knowledge_passage('test.bg.2.47','en'), null::jsonb,
  'draft material has no public citation payload');
select is((select count(*) from app.fn_knowledge_catalogue('en')),
  0::bigint, 'draft work is absent from the public catalogue');
select is((select count(*) from app.fn_knowledge_work_passages('fixture-gita','en')),
  0::bigint, 'draft passage is absent from work navigation');
select throws_ok($$select * from app.knowledge_renderings$$, '42501', null,
  'anonymous direct table read is denied');
select throws_ok($$select * from app.fn_knowledge_search('x','en',20)$$,
  '23514', 'search query must be 3 to 160 characters',
  'short or malformed searches are bounded');
reset role;

select throws_ok($$update app.knowledge_renderings
  set status='published',access_class='public',
      reviewed_by='fb000005-0000-4000-8000-000000000005',
      reviewed_at=now()
  where id='fb000007-0000-4000-8000-000000000007'$$,
  '23514','edition provenance or current redistribution rights are unverified',
  'publication fails before source and rights verification');
select ok(not (select may_use_for_ai from app.knowledge_source_licenses
  where edition_id='fb000003-0000-4000-8000-000000000003'),
  'AI use is denied independently by default');

update app.knowledge_sources
  set provenance_status='verified',provenance_evidence='Synthetic SQL fixture',verified_at=now()
  where id='fb000001-0000-4000-8000-000000000001';
update app.knowledge_source_licenses
  set license_kind='owned',status='verified',rights_evidence='Synthetic SQL fixture',
      verified_at=now(),may_redistribute=true
  where edition_id='fb000003-0000-4000-8000-000000000003';
update app.knowledge_renderings
  set status='published',access_class='public',
      reviewed_by='fb000005-0000-4000-8000-000000000005',reviewed_at=now()
  where id='fb000007-0000-4000-8000-000000000007';
insert into app.knowledge_renderings
  (id,work_id,passage_id,edition_id,language_code,kind,body,
   status,access_class,reviewed_by,reviewed_at)
values ('fb000008-0000-4000-8000-000000000008',
  'fb000002-0000-4000-8000-000000000002',
  'fb000004-0000-4000-8000-000000000004',
  'fb000003-0000-4000-8000-000000000003',
  'en','commentary','Synthetic paid fixture: release a result.',
  'published','paid','fb000005-0000-4000-8000-000000000005',now());
insert into app.knowledge_passages
  (id,work_id,canonical_id,canonical_reference,unit_kind,sequence_no)
values ('fb000009-0000-4000-8000-000000000009',
  'fb000002-0000-4000-8000-000000000002','test.bg.2.48','2.48','verse',2);
insert into app.knowledge_renderings
  (id,work_id,passage_id,edition_id,language_code,kind,body,
   status,access_class,reviewed_by,reviewed_at)
values ('fb000010-0000-4000-8000-000000000010',
  'fb000002-0000-4000-8000-000000000002',
  'fb000009-0000-4000-8000-000000000009',
  'fb000003-0000-4000-8000-000000000003',
  'en','editorial_explanation','Synthetic paid-only fixture.',
  'published','paid','fb000005-0000-4000-8000-000000000005',now());

set local role anon;
select is((select count(*) from app.fn_knowledge_search('release','en',20)),
  1::bigint, 'reviewed rights-eligible content becomes searchable');
select is((select count(*) from app.fn_knowledge_search('test.bg.2.47','en',20)),
  1::bigint, 'stable canonical identifiers resolve in search');
select is(app.fn_knowledge_passage('test.bg.2.47','en')->>'canonical_id',
  'test.bg.2.47', 'citation RPC carries the stable passage identifier');
select is(jsonb_array_length(app.fn_knowledge_passage('test.bg.2.47','en')->'renderings'),
  1, 'public citation payload excludes paid content');
select is((select count(*) from app.fn_knowledge_catalogue('en')),
  1::bigint, 'work appears when a public reviewed rendering is available');
select is((select available_passage_count from app.fn_knowledge_catalogue('en')),
  1::bigint, 'catalogue count excludes paid-only passages');
select is((select first_canonical_id from app.fn_knowledge_catalogue('en')),
  'test.bg.2.47', 'catalogue entry opens the first public passage');
select is((select count(*) from app.fn_knowledge_work_passages('fixture-gita','en')),
  1::bigint, 'work navigation includes only public passages');
select is((select count(*) from app.fn_knowledge_work_passages('fixture-gita','en')
  where canonical_id='test.bg.2.48'), 0::bigint,
  'work navigation excludes a paid-only passage');
select is((select count(*) from app.fn_knowledge_work_passages('fixture-gita','en',1,50)),
  0::bigint, 'work navigation cursor continues after its last public passage');
select throws_ok($$select * from app.fn_knowledge_work_passages('fixture-gita','en',0,0)$$,
  '23514','invalid catalogue page request', 'invalid page size is rejected');
reset role;

select throws_ok($$update app.knowledge_renderings
  set body='Changed after publication'
  where id='fb000007-0000-4000-8000-000000000007'$$,
  '23514','published rendering is immutable; create a new revision or withdraw it',
  'published words cannot be silently rewritten');
update app.knowledge_source_licenses set status='revoked'
  where edition_id='fb000003-0000-4000-8000-000000000003';
set local role anon;
select is((select count(*) from app.fn_knowledge_search('release','en',20)),
  0::bigint, 'rights revocation removes public search immediately');
select is((select count(*) from app.fn_knowledge_catalogue('en')),
  0::bigint, 'rights revocation removes the work from public navigation');
select is((select count(*) from app.fn_knowledge_work_passages('fixture-gita','en')),
  0::bigint, 'rights revocation removes public passage references');
reset role;
select * from finish();
rollback;
