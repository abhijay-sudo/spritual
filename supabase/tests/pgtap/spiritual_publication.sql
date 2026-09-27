-- Synthetic-only publication fixture. Every row rolls back.
begin;
set local statement_timeout='15s';
select set_config('search_path',quote_ident(n.nspname)||',app,ops,public,pg_catalog',true)
  from pg_extension e join pg_namespace n on n.oid=e.extnamespace where e.extname='pgtap';
select plan(46);

select is((select count(*) from ops.fn_check_api_surface()),0::bigint,'new public RPCs exactly match the API allowlist');
select ok(not has_table_privilege('anon','app.spiritual_publication_audit','select'),'anon cannot inspect publication audit');
select ok(not has_table_privilege('authenticated','app.spiritual_entities','select'),'member cannot inspect draft entity table');
select ok(not has_table_privilege('authenticated','app.spiritual_saves','select'),'member cannot query private saves table');
select ok(not has_function_privilege('anon','app.fn_my_spiritual_saves(text)','execute'),'anon cannot list saves');
select ok(not has_function_privilege('anon','app.fn_set_spiritual_save(text,text,boolean)','execute'),'anon cannot mutate saves');
select is((select count(*) from app.fn_public_spiritual_entities()),0::bigint,'no published entity is seeded');

insert into app.knowledge_sources(id,title,source_identifier,source_url)
values ('fd000001-0000-4000-8000-000000000001','Synthetic source','fixture:phase3','https://example.invalid/phase3');
insert into app.knowledge_works(id,slug,title,work_kind)
values ('fd000002-0000-4000-8000-000000000002','synthetic-work','Synthetic work','other');
insert into app.knowledge_editions(id,work_id,source_id,edition_label,language_code)
values ('fd000003-0000-4000-8000-000000000003','fd000002-0000-4000-8000-000000000002',
  'fd000001-0000-4000-8000-000000000001','Synthetic edition','en');
insert into app.knowledge_source_licenses(edition_id)
values ('fd000003-0000-4000-8000-000000000003');
insert into app.reviewers(id,full_name,credentials,auth_user_id)
values ('fd000004-0000-4000-8000-000000000004','Synthetic reviewer','Test only',
  'fd000005-0000-4000-8000-000000000005');
insert into app.reviewer_languages(reviewer_id,language_code)
values ('fd000004-0000-4000-8000-000000000004','en'),
       ('fd000004-0000-4000-8000-000000000004','hi');
insert into app.spiritual_media_assets(id,storage_path,media_kind,alt_en,alt_hi)
values ('fd000006-0000-4000-8000-000000000006','synthetic/figure.webp','image','Synthetic figure','नमूना चित्र');
insert into app.spiritual_entities(id,slug,entity_kind,tradition_context,source_id,edition_id,source_reference,hero_media_id)
values ('fd000007-0000-4000-8000-000000000007','synthetic-figure','scriptural_character',
  'Synthetic test tradition','fd000001-0000-4000-8000-000000000001',
  'fd000003-0000-4000-8000-000000000003','fixture 1',
  'fd000006-0000-4000-8000-000000000006');
insert into app.spiritual_entity_names(entity_id,language_code,script_code,display_name,normalized_name,name_kind)
values ('fd000007-0000-4000-8000-000000000007','en','Latn','Synthetic figure','synthetic figure','primary'),
       ('fd000007-0000-4000-8000-000000000007','hi','Deva','नमूना पात्र','नमूना पात्र','primary'),
       ('fd000007-0000-4000-8000-000000000007','en','Latn','Fixture hero','fixture hero','alias');
insert into app.spiritual_stories(id,slug,title_en,title_hi,story_kind,source_id,edition_id,source_reference)
values ('fd000008-0000-4000-8000-000000000008','synthetic-story','Synthetic story','नमूना कथा',
  'original_retelling','fd000001-0000-4000-8000-000000000001',
  'fd000003-0000-4000-8000-000000000003','fixture 1');
insert into app.spiritual_story_scenes(story_id,sequence_no,source_reference,body_en,body_hi)
values ('fd000008-0000-4000-8000-000000000008',1,'fixture 1','Synthetic scene','नमूना दृश्य');

select is((select count(*) from app.fn_public_spiritual_entities()),0::bigint,'draft entity hidden');
select is((select count(*) from app.fn_public_spiritual_stories()),0::bigint,'draft story hidden');
select throws_ok($$update app.spiritual_entities set published_at=now(),published_by='fd000005-0000-4000-8000-000000000005'
  where slug='synthetic-figure'$$,'23514',null,'cannot publish without rights and review');
select is((select count(*) from app.fn_public_spiritual_search('fixture hero')),0::bigint,'draft alias absent from search');

update app.knowledge_sources set provenance_status='verified',provenance_evidence='Synthetic test evidence',verified_at=now()
 where source_identifier='fixture:phase3';
update app.knowledge_source_licenses set license_kind='owned',status='verified',
  rights_evidence='Synthetic test permission',verified_at=now(),may_redistribute=true,may_use_for_ai=false
 where edition_id='fd000003-0000-4000-8000-000000000003';
update app.spiritual_media_assets set rights_status='verified',rights_evidence='Synthetic image permission',
  editorial_status='verified',reviewer_id='fd000004-0000-4000-8000-000000000004',reviewed_at=now()
 where id='fd000006-0000-4000-8000-000000000006';
update app.spiritual_entities set editorial_status='verified',reviewer_id='fd000004-0000-4000-8000-000000000004',
  reviewed_at=now() where slug='synthetic-figure';
update app.spiritual_stories set editorial_status='verified',reviewer_id='fd000004-0000-4000-8000-000000000004',
  reviewed_at=now() where slug='synthetic-story';
select is((select count(*) from app.fn_public_spiritual_entities()),0::bigint,'verified entity remains unpublished');
select is((select count(*) from app.fn_public_spiritual_stories()),0::bigint,'verified story remains unpublished');
select ok((select may_use_for_ai=false from app.knowledge_source_licenses where edition_id='fd000003-0000-4000-8000-000000000003'),
  'redistribution does not imply AI permission');

update app.spiritual_media_assets set published_at=now(),published_by='fd000005-0000-4000-8000-000000000005'
 where id='fd000006-0000-4000-8000-000000000006';
update app.spiritual_entities set published_at=now(),published_by='fd000005-0000-4000-8000-000000000005'
 where slug='synthetic-figure';
update app.spiritual_stories set published_at=now(),published_by='fd000005-0000-4000-8000-000000000005'
 where slug='synthetic-story';
select throws_ok($$update app.spiritual_entities set description_en='Unreviewed change' where slug='synthetic-figure'$$,
  '23514',null,'published entity prose cannot change in place');
select throws_ok($$update app.spiritual_stories set title_en='Unreviewed change' where slug='synthetic-story'$$,
  '23514',null,'published story title cannot change in place');
select throws_ok($$update app.spiritual_entity_names set display_name='Unreviewed change'
  where entity_id='fd000007-0000-4000-8000-000000000007' and name_kind='primary' and language_code='en'$$,
  '23514',null,'published entity name cannot change in place');
select throws_ok($$update app.spiritual_story_scenes set body_en='Unreviewed change'
  where story_id='fd000008-0000-4000-8000-000000000008'$$,
  '23514',null,'published story scene cannot change in place');
select is((select count(*) from app.fn_public_spiritual_entities()),1::bigint,'published entity listed');
select is(app.fn_public_spiritual_entity('synthetic-figure')->>'media_path','synthetic/figure.webp','eligible image returned');
select is((select count(*) from app.fn_public_spiritual_stories()),1::bigint,'published story listed');
select is(jsonb_array_length(app.fn_public_spiritual_story('synthetic-story')->'scenes'),1,'story detail includes ordered scene');
select is((select kind from app.fn_public_spiritual_search('fixture hero') limit 1),'entity','search resolves published alias');
select is((select title from app.fn_public_spiritual_search('नमूना पात्र','hi') limit 1),'नमूना पात्र','Hindi alias resolves');
select throws_ok($$select * from app.fn_public_spiritual_search('%%')$$,'23514',null,'wildcard search is rejected');
select is((select count(*) from app.spiritual_publication_audit where action='publish'),3::bigint,'explicit publication actions audited');
set local request.jwt.claim.sub='fd000005-0000-4000-8000-000000000005';
set local role authenticated;
select is(app.fn_set_spiritual_save('entity','fd000007-0000-4000-8000-000000000007',true),true,'caller saves a published entity ID');
select is(app.fn_set_spiritual_save('story','fd000008-0000-4000-8000-000000000008',true),true,'caller saves a published story ID');
select is((select count(*) from app.fn_my_spiritual_saves()),2::bigint,'saved metadata returns two current references');
select ok((select bool_and(available and title is not null) from app.fn_my_spiritual_saves()),'saved items resolve only eligible published metadata');
select throws_ok($$select * from app.spiritual_saves$$,'42501',null,'member cannot read saves base table');
reset role;
set local request.jwt.claim.sub='fd000009-0000-4000-8000-000000000009';
set local role authenticated;
select is((select count(*) from app.fn_my_spiritual_saves()),0::bigint,'second user cannot see first user saves');
reset role;
set local request.jwt.claim.sub='fd000005-0000-4000-8000-000000000005';

update app.spiritual_media_assets set rights_status='revoked',editorial_status='archived'
 where id='fd000006-0000-4000-8000-000000000006';
select is(app.fn_public_spiritual_entity('synthetic-figure')->>'media_path',null::text,'revoked media disappears immediately');
update app.knowledge_source_licenses set status='revoked' where edition_id='fd000003-0000-4000-8000-000000000003';
select is((select count(*) from app.fn_public_spiritual_entities()),0::bigint,'source rights revocation hides entity');
select is((select count(*) from app.fn_public_spiritual_stories()),0::bigint,'source rights revocation hides story');
set local role authenticated;
select is((select count(*) from app.fn_my_spiritual_saves() where not available and title is null),2::bigint,
  'rights-revoked saves retain IDs but no protected titles or text');
select throws_ok($$select app.fn_set_spiritual_save('story','fd000008-0000-4000-8000-000000000008',true)$$,
  '42501',null,'member cannot save withdrawn or rights-revoked object');
select is(app.fn_set_spiritual_save('entity','fd000007-0000-4000-8000-000000000007',false),false,
  'member can erase unavailable saved ID');
reset role;
update app.knowledge_source_licenses set status='verified' where edition_id='fd000003-0000-4000-8000-000000000003';
update app.spiritual_stories set withdrawn_at=now() where slug='synthetic-story';
select is((select count(*) from app.fn_public_spiritual_search('synthetic story')),0::bigint,'withdrawn story absent from search');
select throws_ok($$update app.spiritual_stories set withdrawn_at=null where slug='synthetic-story'$$,
  '23514',null,'withdrawal cannot be silently reversed');
select is((select count(*) from app.spiritual_publication_audit where action='withdraw'),1::bigint,'withdrawal audited');
set local role authenticated;
select is((select count(*) from app.fn_my_spiritual_saves() where not available),1::bigint,
  'withdrawn story remains removable as unavailable metadata');
select is(app.fn_set_spiritual_save('story','fd000008-0000-4000-8000-000000000008',false),false,
  'withdrawn story save can be removed');
select is((select count(*) from app.fn_my_spiritual_saves()),0::bigint,'all private saves erased');
reset role;
set local role anon;
select is((select count(*) from app.fn_public_spiritual_entities()),1::bigint,'anon sees only eligible public entity through RPC');
select throws_ok($$select * from app.spiritual_entities$$,'42501',null,'anon cannot query editorial graph table');
reset role;
select * from finish();
rollback;
