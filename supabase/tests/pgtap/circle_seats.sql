-- Disposable local PostgreSQL + auth.uid() test shim only. All identities are
-- synthetic and the entire fixture rolls back. This is not a Supabase Auth test.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgtap';
select plan(38);

select is((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'app' and c.relname in
    ('cohorts','cohort_invitations','cohort_memberships')
    and (not c.relrowsecurity or not c.relforcerowsecurity)), 0::bigint,
  'circle tables force RLS');
select is((select count(*) from information_schema.role_table_grants
  where table_schema = 'app' and table_name in
    ('cohorts','cohort_invitations','cohort_memberships')
    and grantee in ('anon','authenticated')), 0::bigint,
  'client roles have no circle table grants');
select is((select count(*) from ops.fn_check_api_surface()), 0::bigint,
  'new RPC grants match the audited allowlist');
select ok(has_function_privilege('authenticated',
  'app.fn_issue_circle_invitation(uuid,uuid,uuid)','execute'),
  'authenticated teacher issuer RPC is granted');
select ok(has_function_privilege('authenticated',
  'app.fn_claim_seat(text,boolean)','execute'),
  'authenticated claim RPC is granted');
select ok(not has_function_privilege('anon',
  'app.fn_claim_seat(text,boolean)','execute'),
  'anonymous callers cannot claim a seat');
select ok(not has_function_privilege('anon',
  'app.fn_issue_circle_invitation(uuid,uuid,uuid)','execute'),
  'anonymous callers cannot issue invitations');

insert into app.organizations (id,kind,display_name,seat_cap) values
  ('fc000001-0000-4000-8000-000000000001','institution','Synthetic circle A',2),
  ('fc000001-0000-4000-8000-000000000002','institution','Synthetic circle B',1);
insert into app.cohorts (id,org_id,name,start_at,end_at,capacity) values
  ('fc000002-0000-4000-8000-000000000001',
   'fc000001-0000-4000-8000-000000000001','A first',now()-interval '1 day',now()+interval '9 days',1),
  ('fc000002-0000-4000-8000-000000000002',
   'fc000001-0000-4000-8000-000000000001','A second',now()-interval '1 day',now()+interval '9 days',2),
  ('fc000002-0000-4000-8000-000000000003',
   'fc000001-0000-4000-8000-000000000002','B first',now()-interval '1 day',now()+interval '9 days',1);
insert into app.memberships (org_id,user_id,role,revoked_at) values
  ('fc000001-0000-4000-8000-000000000001','fc000003-0000-4000-8000-000000000001','teacher',null),
  ('fc000001-0000-4000-8000-000000000002','fc000003-0000-4000-8000-000000000002','teacher',null),
  ('fc000001-0000-4000-8000-000000000001','fc000004-0000-4000-8000-000000000001','admin',now()-interval '1 day');

set local role anon;
select throws_ok($$select app.fn_claim_seat(repeat('a',64),true)$$,
  '42501', null, 'anonymous claim fails at execution');
select throws_ok($$select app.fn_issue_circle_invitation(
  'fc000001-0000-4000-8000-000000000001'::uuid,
  'fc000002-0000-4000-8000-000000000001'::uuid,
  'fc000004-0000-4000-8000-000000000001'::uuid)$$,
  '42501', null, 'anonymous issuance fails at execution');
reset role;

set local request.jwt.claim.sub = 'fc000004-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok($$select app.fn_issue_circle_invitation(
  'fc000001-0000-4000-8000-000000000001'::uuid,
  'fc000002-0000-4000-8000-000000000001'::uuid,
  'fc000004-0000-4000-8000-000000000002'::uuid)$$,
  '42501','teacher access required',
  'revoked former admin cannot issue invitations');
select throws_ok('select * from app.cohort_invitations',
  '42501', null, 'recipient cannot inspect invitation table or its token hashes');
reset role;

set local request.jwt.claim.sub = 'fc000003-0000-4000-8000-000000000001';
set local role authenticated;
do $$
declare v jsonb;
begin
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000001',
    'fc000002-0000-4000-8000-000000000001',
    'fc000004-0000-4000-8000-000000000001');
  perform set_config('test.token_m1',v->>'token',true);
  perform set_config('test.invitation_m1',v->>'invitation_id',true);
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000001',
    'fc000002-0000-4000-8000-000000000001',
    'fc000004-0000-4000-8000-000000000002');
  perform set_config('test.token_m2_a1',v->>'token',true);
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000001',
    'fc000002-0000-4000-8000-000000000002',
    'fc000004-0000-4000-8000-000000000002');
  perform set_config('test.token_m2_a2',v->>'token',true);
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000001',
    'fc000002-0000-4000-8000-000000000002',
    'fc000004-0000-4000-8000-000000000003');
  perform set_config('test.token_expired',v->>'token',true);
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000001',
    'fc000002-0000-4000-8000-000000000002',
    'fc000004-0000-4000-8000-000000000004');
  perform set_config('test.token_revoked',v->>'token',true);
  perform set_config('test.invitation_revoked',v->>'invitation_id',true);
end $$;
select ok(current_setting('test.token_m1') ~ '^[0-9a-f]{64}$',
  'issued one-time token has 64 hexadecimal characters');
select throws_ok($$select app.fn_issue_circle_invitation(
  'fc000001-0000-4000-8000-000000000001'::uuid,
  'fc000002-0000-4000-8000-000000000001'::uuid,
  'fc000004-0000-4000-8000-000000000001'::uuid)$$,
  '23505','current invitation already exists',
  'teacher cannot issue duplicate unexpired invitation to recipient');
select throws_ok($$select app.fn_issue_circle_invitation(
  'fc000001-0000-4000-8000-000000000002'::uuid,
  'fc000002-0000-4000-8000-000000000003'::uuid,
  'fc000004-0000-4000-8000-000000000002'::uuid)$$,
  '42501','teacher access required',
  'teacher cannot issue into another organisation');
select is(app.fn_revoke_circle_invitation(
  current_setting('test.invitation_revoked')::uuid),true,
  'teacher can revoke unused own-org invitation');
select is(app.fn_revoke_circle_invitation(
  current_setting('test.invitation_revoked')::uuid),false,
  'repeated invitation revocation is idempotent');
reset role;

set local request.jwt.claim.sub = 'fc000003-0000-4000-8000-000000000002';
set local role authenticated;
do $$
declare v jsonb;
begin
  v := app.fn_issue_circle_invitation(
    'fc000001-0000-4000-8000-000000000002',
    'fc000002-0000-4000-8000-000000000003',
    'fc000004-0000-4000-8000-000000000002');
  perform set_config('test.invitation_b',v->>'invitation_id',true);
end $$;
reset role;

set local request.jwt.claim.sub = 'fc000003-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok(format('select app.fn_revoke_circle_invitation(%L::uuid)',
  current_setting('test.invitation_b')),
  '42501','teacher access required',
  'teacher cannot revoke another organisation invitation');
reset role;

select is((select token_hash from app.cohort_invitations
  where id=current_setting('test.invitation_m1')::uuid),
  sha256(convert_to(current_setting('test.token_m1'),'UTF8')),
  'only the SHA-256 digest of the invitation token is retained');
select is((select count(*) from app.cohort_invitations
  where token_hash=convert_to(current_setting('test.token_m1'),'UTF8')),
  0::bigint, 'raw token bytes are absent from the token_hash field');

-- This transaction began before the invitation expired. A claim must compare
-- with wall-clock time after taking the lock, not PostgreSQL's stale now().
update app.cohort_invitations
  set issued_at=clock_timestamp()-interval '2 days',
      expires_at=clock_timestamp()+interval '700 milliseconds'
  where token_hash=sha256(convert_to(current_setting('test.token_expired'),'UTF8'));
select pg_sleep(1.1);
set local request.jwt.claim.sub = 'fc000004-0000-4000-8000-000000000003';
set local role authenticated;
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_expired')),
  'P0002','invitation not available',
  'expiry uses live time even when the transaction began before expiry');
reset role;

set local request.jwt.claim.sub = '';
set local role authenticated;
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_m1')),
  '42501','authentication required',
  'authenticated role without a JWT subject cannot claim');
reset role;

set local request.jwt.claim.sub = 'fc000004-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok(format('select app.fn_claim_seat(%L,false)',
  current_setting('test.token_m1')),
  '23514','adult confirmation required',
  'adult confirmation is required before claiming');
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_m2_a1')),
  'P0002','invitation not available',
  'a different recipient cannot redeem a valid token');
select throws_ok($$select app.fn_claim_seat('bad-token',true)$$,
  'P0002','invitation not available',
  'malformed token is rejected without lookup detail');
select is(app.fn_claim_seat(upper(' ' || current_setting('test.token_m1') || ' '),true)->>'cohort_id',
  'fc000002-0000-4000-8000-000000000001',
  'bound recipient claims the intended circle despite copy-paste case and spaces');
select is(app.fn_me()->'profile','null'::jsonb,
  'profile remains optional after a seat claim');
select is(jsonb_array_length(app.fn_me()->'memberships'),1,
  'identity RPC shows claimed organisation even without a profile');
select is(app.fn_me()->'memberships'->0->>'role','member',
  'reclaim of a revoked admin record does not revive admin privilege');
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_m1')),
  'P0002','invitation not available',
  'accepted token cannot be replayed');
select throws_ok($$select app.fn_issue_circle_invitation(
  'fc000001-0000-4000-8000-000000000001'::uuid,
  'fc000002-0000-4000-8000-000000000001'::uuid,
  'fc000004-0000-4000-8000-000000000003'::uuid)$$,
  '42501','teacher access required',
  'ordinary member cannot issue invitations');
reset role;

select is((select count(*) from app.cohort_memberships
  where user_id='fc000004-0000-4000-8000-000000000001'
    and org_id='fc000001-0000-4000-8000-000000000001'
    and revoked_at is null), 1::bigint,
  'claim writes one tenant-scoped active cohort membership');
select is((select accepted_by_user_id from app.cohort_invitations
  where id=current_setting('test.invitation_m1')::uuid),
  'fc000004-0000-4000-8000-000000000001'::uuid,
  'accepted invitation is bound to the same recipient');
select is((select count(*) from app.entitlements),0::bigint,
  'joining a circle does not manufacture paid access');

set local request.jwt.claim.sub = 'fc000003-0000-4000-8000-000000000001';
set local role authenticated;
select throws_ok(format('select app.fn_revoke_circle_invitation(%L::uuid)',
  current_setting('test.invitation_m1')),
  '23514','accepted invitation cannot be revoked',
  'revocation cannot pretend an accepted membership never happened');
reset role;

set local request.jwt.claim.sub = 'fc000004-0000-4000-8000-000000000002';
set local role authenticated;
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_m2_a1')),
  '23514','circle is full',
  'second recipient cannot exceed one-seat circle capacity');
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_m2_a2')),
  '23514','organisation is full',
  'second recipient cannot exceed organisation cap in another circle');
reset role;

set local request.jwt.claim.sub = 'fc000004-0000-4000-8000-000000000004';
set local role authenticated;
select throws_ok(format('select app.fn_claim_seat(%L,true)',
  current_setting('test.token_revoked')),
  'P0002','invitation not available',
  'revoked invitation cannot be redeemed');
reset role;

select is((select count(*) from app.memberships
  where org_id='fc000001-0000-4000-8000-000000000002'
    and user_id='fc000004-0000-4000-8000-000000000001'),0::bigint,
  'claim in organisation A never creates membership in B');
select * from finish();
rollback;
