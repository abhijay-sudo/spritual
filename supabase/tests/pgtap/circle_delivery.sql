-- Disposable synthetic fixtures only. The transaction rolls back; no source is
-- actually approved, no invitation is delivered, and auth.uid() is a test shim.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgtap';
select plan(59);

select is((select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
  where n.nspname='app' and c.relname='circle_reading_releases'
    and (not c.relrowsecurity or not c.relforcerowsecurity)),0::bigint,
  'circle releases force RLS');
select is((select count(*) from information_schema.role_table_grants
  where table_schema='app' and table_name='circle_reading_releases'
    and grantee in ('anon','authenticated')),0::bigint,
  'circle release rows have no client table grants');
select is((select count(*) from ops.fn_check_api_surface()),0::bigint,
  'delivery RPCs match the audited allowlist');
select ok(has_function_privilege('authenticated',
  'app.fn_create_circle(uuid,text,timestamptz,timestamptz,integer)','execute'),
  'authenticated circle creation is granted');
select ok(has_function_privilege('authenticated',
  'app.fn_circle_readings(uuid,text)','execute'),
  'authenticated member delivery read is granted');
select ok(not has_function_privilege('anon',
  'app.fn_circle_readings(uuid,text)','execute'),
  'anonymous delivery read is denied');
select ok(not has_function_privilege('authenticated',
  'app.fn_circle_rendering_ready(uuid)','execute'),
  'internal rights helper is not an exposed content oracle');

insert into app.organizations(id,kind,display_name,seat_cap) values
  ('fe000001-0000-4000-8000-000000000001','institution','Synthetic delivery A',3),
  ('fe000001-0000-4000-8000-000000000002','institution','Synthetic delivery B',2);
insert into app.memberships(org_id,user_id,role,revoked_at) values
  ('fe000001-0000-4000-8000-000000000001','fe000002-0000-4000-8000-000000000001','teacher',null),
  ('fe000001-0000-4000-8000-000000000002','fe000002-0000-4000-8000-000000000002','teacher',null),
  ('fe000001-0000-4000-8000-000000000001','fe000002-0000-4000-8000-000000000003','teacher',now());

set local role anon;
select throws_ok($$select app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000001'::uuid,'No',now(),now()+interval '1 day',1)$$,
  '42501',null,'anonymous caller cannot create a circle');
select throws_ok($$select * from app.fn_circle_readings(
  'fe000003-0000-4000-8000-000000000001'::uuid,'en')$$,
  '42501',null,'anonymous caller cannot read a circle');
select throws_ok('select * from app.fn_my_circles()',
  '42501',null,'anonymous caller cannot list circles');
select throws_ok($$select * from app.fn_teacher_release_candidates(
  'fe000003-0000-4000-8000-000000000001'::uuid)$$,
  '42501',null,'anonymous caller cannot inspect teacher candidates');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000003';
set local role authenticated;
select throws_ok($$select app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000001'::uuid,'Revoked',now(),now()+interval '1 day',1)$$,
  '42501','teacher access required','revoked teacher cannot create a circle');
select throws_ok($$select * from app.fn_teacher_release_candidates(
  'fe000003-0000-4000-8000-000000000001'::uuid)$$,
  '42501','teacher access required','revoked teacher cannot inspect candidates');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok($$select app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000001'::uuid,'Wrong tenant',now(),now()+interval '1 day',1)$$,
  '42501','teacher access required','other-tenant teacher cannot create here');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000001'::uuid,'Too large',now(),now()+interval '1 day',4)$$,
  '23514','invalid circle details','circle capacity cannot exceed organisation cap');
select set_config('test.delivery_circle_a',app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000001','  A circle  ',
  now()-interval '1 hour',now()+interval '3 days',2)::text,true);
reset role;
select is((select name from app.cohorts where id=current_setting('test.delivery_circle_a')::uuid),
  'A circle','teacher-created circle persists with a trimmed name');
set local role authenticated;
select is((select cohort_id from app.fn_my_circles()),
  current_setting('test.delivery_circle_a')::uuid,
  'returning teacher can rediscover their circle');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000002';
set local role authenticated;
select set_config('test.delivery_circle_b',app.fn_create_circle(
  'fe000001-0000-4000-8000-000000000002','B circle',
  now()-interval '1 hour',now()+interval '3 days',1)::text,true);
select is((select cohort_id from app.fn_my_circles()),
  current_setting('test.delivery_circle_b')::uuid,
  'teacher circle list excludes another tenant');
select throws_ok(format('select * from app.fn_teacher_release_candidates(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','teacher access required','other-tenant teacher cannot inspect candidates');
reset role;

insert into app.knowledge_sources(id,title,source_identifier,source_url)
 values ('fe000010-0000-4000-8000-000000000001','Synthetic source',
   'fixture:delivery','https://example.invalid/delivery');
insert into app.knowledge_works(id,slug,title,work_kind)
 values ('fe000010-0000-4000-8000-000000000002','fixture-delivery',
   'Synthetic work','other');
insert into app.knowledge_editions(id,work_id,source_id,edition_label,language_code)
 values ('fe000010-0000-4000-8000-000000000003',
   'fe000010-0000-4000-8000-000000000002',
   'fe000010-0000-4000-8000-000000000001','Synthetic edition','en');
insert into app.knowledge_source_licenses(edition_id)
 values ('fe000010-0000-4000-8000-000000000003');
insert into app.knowledge_passages
  (id,work_id,canonical_id,canonical_reference,unit_kind,sequence_no) values
  ('fe000010-0000-4000-8000-000000000004',
   'fe000010-0000-4000-8000-000000000002','fixture.delivery.1','Fixture 1','other',1),
  ('fe000010-0000-4000-8000-000000000005',
   'fe000010-0000-4000-8000-000000000002','fixture.delivery.2','Fixture 2','other',2),
  ('fe000010-0000-4000-8000-000000000006',
   'fe000010-0000-4000-8000-000000000002','fixture.delivery.3','Fixture 3','other',3);
insert into app.reviewers(id,full_name,credentials,auth_user_id)
 values ('fe000010-0000-4000-8000-000000000007',
   'Synthetic reviewer','Test only','fe000010-0000-4000-8000-000000000008');
insert into app.reviewer_languages(reviewer_id,language_code)
 values ('fe000010-0000-4000-8000-000000000007','en');
insert into app.knowledge_renderings
  (id,work_id,passage_id,edition_id,language_code,kind,body,access_class)
 values ('fe000010-0000-4000-8000-000000000009',
  'fe000010-0000-4000-8000-000000000002',
  'fe000010-0000-4000-8000-000000000004',
  'fe000010-0000-4000-8000-000000000003',
  'en','editorial_explanation','Synthetic draft, not approved.','internal');

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok(format('select app.fn_schedule_circle_reading(%L::uuid,%L::uuid)',
  current_setting('test.delivery_circle_a'),'fe000010-0000-4000-8000-000000000009'),
  '23514','reviewed, rights-cleared reading required',
  'teacher cannot schedule a draft without provenance, rights or review');
select is((select count(*) from app.fn_teacher_release_candidates(
  current_setting('test.delivery_circle_a')::uuid)),0::bigint,
  'draft is absent from teacher candidates');
reset role;

update app.knowledge_sources set provenance_status='verified',
  provenance_evidence='Synthetic SQL fixture',verified_at=now()
 where id='fe000010-0000-4000-8000-000000000001';
update app.knowledge_source_licenses set license_kind='owned',status='verified',
  rights_evidence='Synthetic SQL fixture',verified_at=now(),may_redistribute=true,
  attribution_text='Synthetic attribution'
 where edition_id='fe000010-0000-4000-8000-000000000003';
update app.knowledge_renderings set status='published',access_class='member',
  reviewed_by='fe000010-0000-4000-8000-000000000007',reviewed_at=now()
 where id='fe000010-0000-4000-8000-000000000009';
insert into app.knowledge_renderings
 (id,work_id,passage_id,edition_id,language_code,kind,body,
  status,access_class,reviewed_by,reviewed_at)
 values
 ('fe000010-0000-4000-8000-000000000010',
  'fe000010-0000-4000-8000-000000000002',
  'fe000010-0000-4000-8000-000000000005',
  'fe000010-0000-4000-8000-000000000003',
  'en','editorial_explanation','Synthetic paid fixture.',
  'published','paid','fe000010-0000-4000-8000-000000000007',now()),
 ('fe000010-0000-4000-8000-000000000011',
  'fe000010-0000-4000-8000-000000000002',
  'fe000010-0000-4000-8000-000000000006',
  'fe000010-0000-4000-8000-000000000003',
  'en','editorial_explanation','Synthetic future fixture.',
  'published','public','fe000010-0000-4000-8000-000000000007',now());

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok(format('select app.fn_schedule_circle_reading(%L::uuid,%L::uuid)',
  current_setting('test.delivery_circle_a'),'fe000010-0000-4000-8000-000000000009'),
  '42501','teacher access required','teacher cannot schedule into another tenant');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_teacher_release_candidates(
  current_setting('test.delivery_circle_a')::uuid)),2::bigint,
  'teacher candidates include reviewed public and member text, not unentitled paid text');
select is((select canonical_id from app.fn_teacher_release_candidates(
  current_setting('test.delivery_circle_a')::uuid,'en','Fixture 1')), 
  'fixture.delivery.1','teacher can find an exact cited rendering');
select set_config('test.member_release',app.fn_schedule_circle_reading(
  current_setting('test.delivery_circle_a')::uuid,
  'fe000010-0000-4000-8000-000000000009')::text,true);
select is((select count(*) from app.fn_circle_delivery_queue(
  current_setting('test.delivery_circle_a')::uuid)),1::bigint,
  'teacher sees their scheduled release');
select throws_ok(format('select app.fn_schedule_circle_reading(%L::uuid,%L::uuid)',
  current_setting('test.delivery_circle_a'),'fe000010-0000-4000-8000-000000000009'),
  '23505',null,'duplicate active release cannot be scheduled');
select throws_ok(format('select app.fn_schedule_circle_reading(%L::uuid,%L::uuid,now()+interval ''5 days'')',
  current_setting('test.delivery_circle_a'),'fe000010-0000-4000-8000-000000000010'),
  '23514','release outside circle dates','release cannot occur after circle closes');
select set_config('test.paid_release',app.fn_schedule_circle_reading(
  current_setting('test.delivery_circle_a')::uuid,
  'fe000010-0000-4000-8000-000000000010')::text,true);
select set_config('test.future_release',app.fn_schedule_circle_reading(
  current_setting('test.delivery_circle_a')::uuid,
  'fe000010-0000-4000-8000-000000000011',now()+interval '1 day')::text,true);
select is((select count(*) from app.fn_circle_delivery_queue(
  current_setting('test.delivery_circle_a')::uuid)),3::bigint,
  'teacher queue includes released, paid and future entries');
do $$ begin
  perform set_config('test.delivery_token',app.fn_issue_circle_invitation(
    'fe000001-0000-4000-8000-000000000001',
    current_setting('test.delivery_circle_a')::uuid,
    'fe000002-0000-4000-8000-000000000004') ->> 'token',true);
end $$;
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok(format('select * from app.fn_circle_delivery_queue(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','teacher access required','other-tenant teacher cannot inspect queue');
select throws_ok(format('select app.fn_withdraw_circle_reading(%L::uuid)',
  current_setting('test.member_release')),
  '42501','teacher access required','other-tenant teacher cannot withdraw release');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok('select * from app.circle_reading_releases',
  '42501',null,'member cannot read release table directly');
select throws_ok(format('select * from app.fn_circle_readings(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','circle access required','invited but unclaimed recipient has no feed');
select is((select count(*) from app.fn_my_circles()),0::bigint,
  'invited but unclaimed recipient has no circle in their list');
select throws_ok(format('select app.fn_schedule_circle_reading(%L::uuid,%L::uuid)',
  current_setting('test.delivery_circle_a'),'fe000010-0000-4000-8000-000000000009'),
  '42501','teacher access required','recipient cannot schedule before claim');
select is(app.fn_claim_seat(current_setting('test.delivery_token'),true)->>'cohort_id',
  current_setting('test.delivery_circle_a'),'recipient joins exact circle through claimed seat');
select is((select cohort_id from app.fn_my_circles()),
  current_setting('test.delivery_circle_a')::uuid,
  'claimed member can rediscover their circle');
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),1::bigint,
  'joined member sees released member reading, not paid or future content');
select is((select canonical_id from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),
  'fixture.delivery.1','delivery preserves the source citation identity');
select is((select attribution_text from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),
  'Synthetic attribution','delivery includes rights attribution');
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'hi')),0::bigint,
  'unsupported language returns no mismatched text');
select throws_ok(format('select * from app.fn_circle_readings(%L::uuid)',
  current_setting('test.delivery_circle_b')),
  '42501','circle access required','member cannot see another tenant feed');
select throws_ok(format('select app.fn_withdraw_circle_reading(%L::uuid)',
  current_setting('test.member_release')),
  '42501','teacher access required','ordinary member cannot withdraw');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select is(app.fn_withdraw_circle_reading(
  current_setting('test.member_release')::uuid),true,
  'own teacher can withdraw a member-visible release');
select is(app.fn_withdraw_circle_reading(
  current_setting('test.member_release')::uuid),false,
  'repeat withdrawal is idempotent');
reset role;
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),0::bigint,
  'withdrawn release disappears immediately');
reset role;

set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('test.member_rerelease',app.fn_schedule_circle_reading(
  current_setting('test.delivery_circle_a')::uuid,
  'fe000010-0000-4000-8000-000000000009')::text,true);
select isnt(current_setting('test.member_rerelease'),current_setting('test.member_release'),
  'withdrawn rendering can be deliberately released again with a new audit row');
reset role;

update app.knowledge_source_licenses set status='revoked'
 where edition_id='fe000010-0000-4000-8000-000000000003';
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_teacher_release_candidates(
  current_setting('test.delivery_circle_a')::uuid)),0::bigint,
  'rights revocation also removes teacher candidates');
reset role;
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),0::bigint,
  'later rights revocation hides previously released text');
reset role;
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select is((select ready_now from app.fn_circle_delivery_queue(
  current_setting('test.delivery_circle_a')::uuid)
  where release_id=current_setting('test.member_rerelease')::uuid),false,
  'teacher queue marks rights-revoked release unavailable');
reset role;
update app.knowledge_source_licenses set status='verified'
 where edition_id='fe000010-0000-4000-8000-000000000003';
delete from app.reviewer_languages
 where reviewer_id='fe000010-0000-4000-8000-000000000007' and language_code='en';
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),0::bigint,
  'loss of named reviewer language competency hides released text');
reset role;
insert into app.reviewer_languages(reviewer_id,language_code)
 values ('fe000010-0000-4000-8000-000000000007','en');

insert into app.entitlements(user_id,product_code,state,effective_from,effective_to)
 values ('fe000002-0000-4000-8000-000000000004','intl_individual_annual',
  'active',now()-interval '1 hour',now()+interval '1 day');
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),1::bigint,
  'unrelated personal entitlement does not unlock this institution reading');
reset role;

insert into app.entitlements(org_id,product_code,state,effective_from,effective_to)
 values ('fe000001-0000-4000-8000-000000000001','institution_pilot',
  'active',now()-interval '1 hour',now()+interval '1 day');
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000001';
set local role authenticated;
select is((select count(*) from app.fn_teacher_release_candidates(
  current_setting('test.delivery_circle_a')::uuid)),3::bigint,
  'current same-organisation entitlement makes paid text selectable by teacher');
reset role;
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),2::bigint,
  'paid reading appears only after server-side active entitlement exists');
reset role;
update app.entitlements set state='expired'
 where org_id='fe000001-0000-4000-8000-000000000001';
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select is((select count(*) from app.fn_circle_readings(
  current_setting('test.delivery_circle_a')::uuid,'en')),1::bigint,
  'expired entitlement removes paid reading while retaining member reading');
reset role;

update app.memberships set revoked_at=now()
 where org_id='fe000001-0000-4000-8000-000000000001'
   and user_id='fe000002-0000-4000-8000-000000000004';
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok(format('select * from app.fn_circle_readings(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','circle access required','revoked organisation membership removes feed');
select is((select count(*) from app.fn_my_circles()),0::bigint,
  'revoked organisation membership removes circle from list');
reset role;
update app.memberships set revoked_at=null
 where org_id='fe000001-0000-4000-8000-000000000001'
   and user_id='fe000002-0000-4000-8000-000000000004';
update app.cohort_memberships set revoked_at=now()
 where cohort_id=current_setting('test.delivery_circle_a')::uuid
   and user_id='fe000002-0000-4000-8000-000000000004';
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok(format('select * from app.fn_circle_readings(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','circle access required','revoked circle membership removes feed');
select is((select count(*) from app.fn_my_circles()),0::bigint,
  'revoked circle membership removes circle from list');
reset role;
update app.cohort_memberships set revoked_at=null
 where cohort_id=current_setting('test.delivery_circle_a')::uuid
   and user_id='fe000002-0000-4000-8000-000000000004';
update app.cohorts set end_at=clock_timestamp()-interval '1 second'
 where id=current_setting('test.delivery_circle_a')::uuid;
set local request.jwt.claim.sub='fe000002-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok(format('select * from app.fn_circle_readings(%L::uuid)',
  current_setting('test.delivery_circle_a')),
  '42501','circle access required','expired circle window removes member feed');
reset role;

select * from finish();
rollback;
