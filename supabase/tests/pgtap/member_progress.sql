-- Synthetic fixtures only. This transaction rolls back and the auth.uid()
-- shim is not proof of a live Supabase Auth deployment.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgtap';
select plan(47);

select is((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='app' and c.relname='member_reading_progress'
    and (not c.relrowsecurity or not c.relforcerowsecurity)),0::bigint,
  'private progress table forces RLS');
select is((select count(*) from information_schema.role_table_grants
  where table_schema='app' and table_name='member_reading_progress'
    and grantee in ('anon','authenticated')),0::bigint,
  'clients have no direct progress table grants');
select is((select count(*) from ops.fn_check_api_surface()),0::bigint,
  'new RPC grants match the audited API allowlist');
select ok(not has_function_privilege('authenticated',
  'app.fn_member_can_read_release(uuid)','execute'),
  'internal access gate is not a client release oracle');
select ok(has_function_privilege('authenticated',
  'app.fn_set_circle_reading_mark(uuid,text,boolean)','execute'),
  'authenticated caller can invoke mark mutation');
select ok(not has_function_privilege('anon',
  'app.fn_my_circle_reading_progress(uuid)','execute'),
  'anonymous caller cannot list marks');

insert into app.organizations (id,kind,display_name,seat_cap) values
  ('fa000001-0000-4000-8000-000000000001','institution','Synthetic progress A',4),
  ('fa000001-0000-4000-8000-000000000002','institution','Synthetic progress B',4);
insert into app.memberships (org_id,user_id,role) values
  ('fa000001-0000-4000-8000-000000000001','fa000002-0000-4000-8000-000000000001','teacher'),
  ('fa000001-0000-4000-8000-000000000001','fa000002-0000-4000-8000-000000000002','member'),
  ('fa000001-0000-4000-8000-000000000001','fa000002-0000-4000-8000-000000000003','member'),
  ('fa000001-0000-4000-8000-000000000001','fa000002-0000-4000-8000-000000000004','member'),
  ('fa000001-0000-4000-8000-000000000002','fa000002-0000-4000-8000-000000000005','teacher');
insert into app.cohorts (id,org_id,name,start_at,end_at,capacity) values
  ('fa000003-0000-4000-8000-000000000001',
   'fa000001-0000-4000-8000-000000000001','Synthetic circle A',
   now()-interval '1 day',now()+interval '3 days',4),
  ('fa000003-0000-4000-8000-000000000002',
   'fa000001-0000-4000-8000-000000000002','Synthetic circle B',
   now()-interval '1 day',now()+interval '3 days',4);
insert into app.cohort_invitations
  (id,org_id,cohort_id,recipient_user_id,token_hash,issued_by_user_id,expires_at,
   accepted_at,accepted_by_user_id) values
  ('fa000004-0000-4000-8000-000000000001',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000002-0000-4000-8000-000000000002',digest('progress-invite-1','sha256'),
   'fa000002-0000-4000-8000-000000000001',now()+interval '1 day',now(),
   'fa000002-0000-4000-8000-000000000002'),
  ('fa000004-0000-4000-8000-000000000002',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000002-0000-4000-8000-000000000003',digest('progress-invite-2','sha256'),
   'fa000002-0000-4000-8000-000000000001',now()+interval '1 day',now(),
   'fa000002-0000-4000-8000-000000000003');
insert into app.cohort_memberships
  (org_id,cohort_id,user_id,invitation_id) values
  ('fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000002-0000-4000-8000-000000000002',
   'fa000004-0000-4000-8000-000000000001'),
  ('fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000002-0000-4000-8000-000000000003',
   'fa000004-0000-4000-8000-000000000002');

insert into app.knowledge_sources
  (id,title,source_identifier,source_url,provenance_status,
   provenance_evidence,verified_at) values
  ('fa000010-0000-4000-8000-000000000001','Synthetic progress source',
   'fixture:progress','https://example.invalid/progress','verified',
   'Synthetic SQL fixture',now());
insert into app.knowledge_works (id,slug,title,work_kind) values
  ('fa000010-0000-4000-8000-000000000002','fixture-progress',
   'Synthetic progress work','other');
insert into app.knowledge_editions
  (id,work_id,source_id,edition_label,language_code) values
  ('fa000010-0000-4000-8000-000000000003',
   'fa000010-0000-4000-8000-000000000002',
   'fa000010-0000-4000-8000-000000000001','Synthetic progress edition','en');
insert into app.knowledge_source_licenses
  (edition_id,license_kind,status,rights_evidence,attribution_text,
   may_redistribute,verified_at) values
  ('fa000010-0000-4000-8000-000000000003','owned','verified',
   'Synthetic SQL fixture','Synthetic attribution',true,now());
insert into app.knowledge_passages
  (id,work_id,canonical_id,canonical_reference,unit_kind,sequence_no) values
  ('fa000010-0000-4000-8000-000000000004',
   'fa000010-0000-4000-8000-000000000002','fixture.progress.1',
   'Fixture progress 1','other',1),
  ('fa000010-0000-4000-8000-000000000005',
   'fa000010-0000-4000-8000-000000000002','fixture.progress.2',
   'Fixture progress 2','other',2),
  ('fa000010-0000-4000-8000-000000000006',
   'fa000010-0000-4000-8000-000000000002','fixture.progress.3',
   'Fixture progress 3','other',3);
insert into app.reviewers (id,full_name,credentials,auth_user_id) values
  ('fa000010-0000-4000-8000-000000000007','Synthetic reviewer',
   'Test only','fa000010-0000-4000-8000-000000000008');
insert into app.reviewer_languages (reviewer_id,language_code) values
  ('fa000010-0000-4000-8000-000000000007','en');
insert into app.knowledge_renderings
  (id,work_id,passage_id,edition_id,language_code,kind,body,
   status,access_class,reviewed_by,reviewed_at) values
  ('fa000010-0000-4000-8000-000000000009',
   'fa000010-0000-4000-8000-000000000002',
   'fa000010-0000-4000-8000-000000000004',
   'fa000010-0000-4000-8000-000000000003','en',
   'editorial_explanation','Synthetic member fixture.',
   'published','member','fa000010-0000-4000-8000-000000000007',now()),
  ('fa000010-0000-4000-8000-000000000010',
   'fa000010-0000-4000-8000-000000000002',
   'fa000010-0000-4000-8000-000000000005',
   'fa000010-0000-4000-8000-000000000003','en',
   'editorial_explanation','Synthetic paid fixture.',
   'published','paid','fa000010-0000-4000-8000-000000000007',now()),
  ('fa000010-0000-4000-8000-000000000011',
   'fa000010-0000-4000-8000-000000000002',
   'fa000010-0000-4000-8000-000000000006',
   'fa000010-0000-4000-8000-000000000003','en',
   'editorial_explanation','Synthetic future fixture.',
   'published','member','fa000010-0000-4000-8000-000000000007',now());
insert into app.circle_reading_releases
  (id,org_id,cohort_id,rendering_id,release_at,scheduled_by_user_id) values
  ('fa000020-0000-4000-8000-000000000001',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000010-0000-4000-8000-000000000009',now()-interval '1 hour',
   'fa000002-0000-4000-8000-000000000001'),
  ('fa000020-0000-4000-8000-000000000002',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000010-0000-4000-8000-000000000010',now()-interval '1 hour',
   'fa000002-0000-4000-8000-000000000001'),
  ('fa000020-0000-4000-8000-000000000003',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000010-0000-4000-8000-000000000011',now()+interval '1 hour',
   'fa000002-0000-4000-8000-000000000001');

set local role anon;
select throws_ok($$select * from app.fn_my_circle_reading_progress()$$,
  '42501',null,'anonymous caller cannot read marks');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001'::uuid,'bookmark',true)$$,
  '42501',null,'anonymous caller cannot mark a release');
select throws_ok('select app.fn_clear_my_reading_progress()',
  '42501',null,'anonymous caller cannot erase account marks');
reset role;

set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok($$select * from app.fn_my_circle_reading_progress(
  'fa000003-0000-4000-8000-000000000001'::uuid)$$,
  '42501','circle access required','unclaimed account cannot inspect circle marks');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001'::uuid,'bookmark',true)$$,
  '42501','circle access required','unclaimed account cannot mark a release');
reset role;

set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok('select * from app.member_reading_progress',
  '42501',null,'member cannot query progress rows directly');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000002'::uuid,'bookmark',true)$$,
  '42501','circle access required','paid release requires same-organisation entitlement');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000003'::uuid,'bookmark',true)$$,
  '42501','circle access required','future release cannot be marked');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001'::uuid,'done',true)$$,
  '23514','invalid reading mark','unknown mark kind is rejected');
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','bookmark',true)->>'bookmarked_at') is not null,
  'member explicitly saves the current release');
select is((select count(*) from app.fn_my_circle_reading_progress()),1::bigint,
  'global read returns own currently accessible mark');
select is((select canonical_reference from app.fn_my_circle_reading_progress()),
  'Fixture progress 1','saved mark carries a citation for personal navigation');
select is((select language_code from app.fn_my_circle_reading_progress()),
  'en','saved mark preserves reading language');
select is((select work_title from app.fn_my_circle_reading_progress()),
  'Synthetic progress work','saved mark carries only a work title, not text');
select is((select bookmarked_at from app.fn_my_circle_reading_progress()),
  (app.fn_set_circle_reading_mark(
    'fa000020-0000-4000-8000-000000000001','bookmark',true)->>'bookmarked_at')::timestamptz,
  'repeat save is idempotent and preserves first timestamp');
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','completed',true)->>'completed_at') is not null,
  'explicit completion records a separate mark');
select ok((select bookmarked_at is not null and completed_at is not null
  from app.fn_my_circle_reading_progress()),
  'completion does not overwrite bookmark');
reset role;

set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000003';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'second member cannot inspect first member progress');
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','bookmark',true)->>'bookmarked_at') is not null,
  'second member owns an independent mark');
reset role;

set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'teacher cannot inspect members progress via own read');
reset role;

set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','bookmark',false)->>'bookmarked_at') is null,
  'clearing bookmark leaves completion');
select is((select count(*) from app.fn_my_circle_reading_progress()),1::bigint,
  'completion remains after bookmark cleared');
select is((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','completed',false)->>'completed_at'),
  null::text,'clearing final mark returns no completion timestamp');
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'clearing final mark deletes private row');
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001','bookmark',true)->>'bookmarked_at') is not null,
  'member can save again after clearing');
reset role;

update app.circle_reading_releases set withdrawn_at=now(),
  withdrawn_by_user_id='fa000002-0000-4000-8000-000000000001'
 where id='fa000020-0000-4000-8000-000000000001';
set local request.jwt.claim.sub='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'withdrawal hides existing personal mark and reference');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000001'::uuid,'bookmark',false)$$,
  '42501','circle access required','withdrawn release cannot be mutated');
reset role;

-- A fresh release has a fresh identity; an old withdrawn bookmark must not
-- bleed into it. Further access checks also apply to the new explicit mark.
insert into app.circle_reading_releases
  (id,org_id,cohort_id,rendering_id,release_at,scheduled_by_user_id) values
  ('fa000020-0000-4000-8000-000000000004',
   'fa000001-0000-4000-8000-000000000001',
   'fa000003-0000-4000-8000-000000000001',
   'fa000010-0000-4000-8000-000000000009',now()-interval '1 minute',
   'fa000002-0000-4000-8000-000000000001');
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'a later release does not inherit the withdrawn release mark');
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000004','bookmark',true)->>'bookmarked_at') is not null,
  'member may explicitly mark a new current release');
reset role;
update app.knowledge_source_licenses set status='revoked'
 where edition_id='fa000010-0000-4000-8000-000000000003';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'rights revocation hides marks and source references immediately');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000004'::uuid,'completed',true)$$,
  '42501','circle access required','rights-revoked release cannot be marked');
reset role;
update app.knowledge_source_licenses set status='verified'
 where edition_id='fa000010-0000-4000-8000-000000000003';
update app.memberships set revoked_at=now()
 where org_id='fa000001-0000-4000-8000-000000000001'
   and user_id='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'organisation membership revocation hides marks');
reset role;
update app.memberships set revoked_at=null
 where org_id='fa000001-0000-4000-8000-000000000001'
   and user_id='fa000002-0000-4000-8000-000000000002';
update app.cohort_memberships set revoked_at=now()
 where cohort_id='fa000003-0000-4000-8000-000000000001'
   and user_id='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'circle membership revocation hides marks');
reset role;
update app.cohort_memberships set revoked_at=null
 where cohort_id='fa000003-0000-4000-8000-000000000001'
   and user_id='fa000002-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select * from app.fn_my_circle_reading_progress(
  'fa000003-0000-4000-8000-000000000002'::uuid)$$,
  '42501','circle access required','cross-tenant circle filter is denied');
reset role;

insert into app.entitlements (org_id,product_code,state,effective_from,effective_to)
 values ('fa000001-0000-4000-8000-000000000001','institution_pilot',
   'active',now()-interval '1 hour',now()+interval '1 day');
set local role authenticated;
select ok((app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000002','bookmark',true)->>'bookmarked_at') is not null,
  'same-organisation entitlement permits an explicit paid mark');
reset role;
update app.entitlements set state='expired'
 where org_id='fa000001-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()
  where release_id='fa000020-0000-4000-8000-000000000002'),0::bigint,
  'expired paid entitlement hides its old mark');
reset role;
update app.cohorts set end_at=clock_timestamp()-interval '1 second'
 where id='fa000003-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'expired circle hides all retained marks and metadata');
select throws_ok($$select app.fn_set_circle_reading_mark(
  'fa000020-0000-4000-8000-000000000004'::uuid,'completed',true)$$,
  '42501','circle access required','expired circle cannot receive new marks');
select is(app.fn_clear_my_reading_progress(),3,
  'member can erase own withdrawn and expired marks');
select is((select count(*) from app.fn_my_circle_reading_progress()),0::bigint,
  'erasure leaves no visible marks');
reset role;

select is((select count(*) from app.member_reading_progress
  where user_id='fa000002-0000-4000-8000-000000000003'),1::bigint,
  'one member erasing marks preserves another member data');

select * from finish();
rollback;
