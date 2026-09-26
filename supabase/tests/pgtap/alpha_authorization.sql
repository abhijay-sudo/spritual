-- Existing migrations 0001–0005 only. Local disposable Supabase database required.
-- No cohort-alpha schema or paid-content authorization is asserted here.
-- Run through scripts/test-database.mjs; all fixtures and tests roll back.
begin;
set local statement_timeout = '15s';
select set_config('search_path', quote_ident(n.nspname) || ',app,ops,public,pg_catalog', true)
from pg_extension e join pg_namespace n on n.oid = e.extnamespace where e.extname = 'pgtap';
select plan(21);

select ok(has_schema_privilege('anon', 'app', 'usage'), 'anon can resolve the public RPC schema');
select ok(not has_schema_privilege('anon', 'ops', 'usage'), 'anon cannot resolve operator schema');
select ok(not has_schema_privilege('authenticated', 'ops', 'usage'), 'authenticated cannot resolve operator schema');
select is((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname in ('app','ops') and c.relkind in ('r','p') and (has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') or has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'))), 0::bigint, 'client roles have no base-table privileges');
select is((select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'app' and c.relkind in ('r','p') and (not c.relrowsecurity or not c.relforcerowsecurity)), 0::bigint, 'all application tables force row-level security');
select is((select count(*) from ops.fn_check_api_surface()), 0::bigint, 'no function or table exposure outside allowlist');
select ok(has_function_privilege('anon', 'app.fn_catalog(text)', 'execute'), 'anonymous catalog RPC is explicitly granted');
select ok(has_function_privilege('anon', 'app.fn_practice_document(uuid,text,integer)', 'execute'), 'anonymous document RPC is currently public (not an entitlement assertion)');
select ok(not has_function_privilege('anon', 'app.fn_me()', 'execute'), 'anonymous identity RPC is denied');
select ok(has_function_privilege('authenticated', 'app.fn_me()', 'execute'), 'authenticated identity RPC is explicitly granted');
select ok(not has_function_privilege('authenticated', 'app.fn_has_access(uuid)', 'execute'), 'clients cannot query arbitrary user access through internal helper');
select ok(not has_function_privilege('authenticated', 'ops.fn_check_api_surface()', 'execute'), 'client cannot execute operator audit function');

-- Distinct synthetic profiles: never insert real identities or spiritual history.
insert into app.profiles (user_id, display_name) values
('fa000001-0000-4000-8000-000000000001', 'SQL test caller'),
('fa000002-0000-4000-8000-000000000002', 'SQL test other user');
set local request.jwt.claim.sub = 'fa000001-0000-4000-8000-000000000001';
set local request.jwt.claims = '{"sub":"fa000001-0000-4000-8000-000000000001","role":"authenticated"}';
set local role authenticated;
select is(app.fn_me()->>'user_id', 'fa000001-0000-4000-8000-000000000001', 'identity RPC resolves only JWT caller');
select is(app.fn_me()->'profile'->>'display_name', 'SQL test caller', 'caller receives own profile rather than another profile');
select is(app.fn_me()->>'has_access', 'false', 'profile existence does not grant paid access');
select throws_ok('select * from app.profiles', '42501', null, 'direct profile table read is denied');
select throws_ok($$select app.fn_has_access('fa000002-0000-4000-8000-000000000002'::uuid)$$, '42501', null, 'arbitrary-user internal access call is denied at execution');
reset role;
set local role anon;
select throws_ok('select app.fn_me()', '42501', null, 'anonymous identity call is denied at execution');
select throws_ok($$select app.fn_practice_document('fa000003-0000-4000-8000-000000000003'::uuid, 'en', 10)$$, 'P0002', 'practice not available', 'missing document does not return material');
select throws_ok($$select app.fn_practice_document('fa000003-0000-4000-8000-000000000003'::uuid, 'en', 7)$$, '23514', 'duration must be 3, 5 or 10', 'unapproved duration is rejected');
reset role;
grant execute on function app.fn_me() to anon;
select is((select count(*) from ops.fn_check_api_surface()
  where violation = 'client grant mismatch: app.fn_me()'), 1::bigint,
  'API audit detects a role grant that exceeds the allowlist');
revoke execute on function app.fn_me() from anon;
select * from finish();
rollback;
