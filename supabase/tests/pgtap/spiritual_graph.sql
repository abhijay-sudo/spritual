-- Synthetic draft graph test. Rollback leaves no editorial claims or records.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
  from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgtap';
select plan(16);

select is((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='app' and c.relname in
    ('spiritual_entities','spiritual_entity_names','spiritual_stories',
     'spiritual_story_scenes','spiritual_graph_links','spiritual_themes',
     'spiritual_media_assets')
    and (not c.relrowsecurity or not c.relforcerowsecurity)),0::bigint,
  'all draft graph tables force RLS');
select is((select count(*) from information_schema.role_table_grants
  where table_schema='app' and table_name like 'spiritual_%'
    and grantee in ('anon','authenticated')),0::bigint,
  'client roles have no graph table grants');
select is((select count(*) from ops.fn_check_api_surface()),0::bigint,
  'graph migration adds no unaudited client API');
select ok(not has_table_privilege('anon','app.spiritual_entities','select'),
  'anonymous role cannot read draft entities');
select ok(not has_table_privilege('authenticated','app.spiritual_stories','select'),
  'authenticated role cannot read draft stories');
select ok(not has_table_privilege('authenticated','app.spiritual_graph_links','insert'),
  'member cannot write theological links');

insert into app.knowledge_sources(id,title,source_identifier,source_url)
values ('fc000001-0000-4000-8000-000000000001','Synthetic graph source',
  'fixture:graph','https://example.invalid/graph');
insert into app.spiritual_entities(id,slug,entity_kind)
values ('fc000002-0000-4000-8000-000000000002','fixture-figure','scriptural_character');
insert into app.spiritual_entity_names(entity_id,language_code,script_code,display_name,normalized_name,name_kind)
values ('fc000002-0000-4000-8000-000000000002','en','Latn','Fixture figure','fixture figure','primary');
insert into app.spiritual_stories(id,slug,title_en,title_hi,story_kind,source_id,source_reference)
values ('fc000003-0000-4000-8000-000000000003','fixture-story','Fixture','नमूना',
  'original_retelling','fc000001-0000-4000-8000-000000000001','fixture 1');
insert into app.spiritual_story_scenes(story_id,sequence_no,source_reference,body_en,body_hi)
values ('fc000003-0000-4000-8000-000000000003',1,'fixture 1','Synthetic prose','नमूना गद्य');
insert into app.spiritual_graph_links(from_entity_id,to_story_id,relation_kind,editorial_note,source_id,source_reference)
values ('fc000002-0000-4000-8000-000000000002',
  'fc000003-0000-4000-8000-000000000003','appears_in','Synthetic fixture',
  'fc000001-0000-4000-8000-000000000001','fixture 1');
select is((select editorial_status from app.spiritual_entities where slug='fixture-figure'),
  'draft','entity starts unpublished');
select is((select editorial_status from app.spiritual_stories where slug='fixture-story'),
  'draft','story starts unpublished');
select throws_ok($$update app.spiritual_stories set editorial_status='verified'
  where slug='fixture-story'$$,'23514',null,
  'story cannot claim verification without edition and named review');
insert into app.knowledge_works(id,slug,title,work_kind)
values ('fc000004-0000-4000-8000-000000000004','fixture-work','Synthetic work','other');
insert into app.knowledge_editions(id,work_id,source_id,edition_label,language_code)
values ('fc000005-0000-4000-8000-000000000005',
  'fc000004-0000-4000-8000-000000000004',
  'fc000001-0000-4000-8000-000000000001','Synthetic edition','en');
insert into app.knowledge_source_licenses(edition_id)
values ('fc000005-0000-4000-8000-000000000005');
insert into app.reviewers(id,full_name,credentials,auth_user_id)
values ('fc000006-0000-4000-8000-000000000006','Synthetic reviewer',
  'Test only','fc000007-0000-4000-8000-000000000007');
insert into app.reviewer_languages(reviewer_id,language_code)
values ('fc000006-0000-4000-8000-000000000006','en'),
       ('fc000006-0000-4000-8000-000000000006','hi');
select throws_ok($$update app.spiritual_stories set editorial_status='verified',
  edition_id='fc000005-0000-4000-8000-000000000005',
  reviewer_id='fc000006-0000-4000-8000-000000000006',reviewed_at=now()
  where slug='fixture-story'$$,'23514',null,
  'named review alone cannot bypass pending provenance and rights');
select throws_ok($$insert into app.spiritual_graph_links
  (from_entity_id,to_entity_id,relation_kind,editorial_note) values
  ('fc000002-0000-4000-8000-000000000002',
   'fc000002-0000-4000-8000-000000000002','associated_with','Synthetic')$$,
  '23514',null,'entity relation requires tradition context and source');
select throws_ok($$insert into app.spiritual_entity_names
  (entity_id,language_code,script_code,display_name,normalized_name,name_kind)
  values ('fc000002-0000-4000-8000-000000000002','en','Latn','Fixture','fixture figure','alias')$$,
  '23505',null,'duplicate normalized name is rejected');
select throws_ok($$insert into app.spiritual_media_assets
  (storage_path,media_kind,editorial_status) values
  ('fixture/cover.webp','image','verified')$$,
  '23514',null,'media cannot claim verification without rights evidence');
insert into app.spiritual_themes(slug,name_en,name_hi)
values ('fixture-theme','Synthetic theme','नमूना विषय');
select is((select editorial_status from app.spiritual_themes where slug='fixture-theme'),
  'draft','theme starts unpublished');
set local role anon;
select throws_ok($$select * from app.spiritual_entities$$,'42501',null,
  'anonymous caller cannot read draft graph');
reset role;
set local role authenticated;
select throws_ok($$select * from app.spiritual_story_scenes$$,'42501',null,
  'authenticated caller cannot read draft scenes');
reset role;
select * from finish();
rollback;
