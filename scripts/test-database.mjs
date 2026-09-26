#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

function fail(message) { console.error(message); process.exit(1); }
if (!process.env.DB_URL) fail('Blocked: set DB_URL explicitly to a disposable local Supabase PostgreSQL database. No database was contacted.');
let url;
try { url = new URL(process.env.DB_URL); } catch { fail('Invalid DB_URL. Expected a PostgreSQL URL; value omitted for privacy.'); }
if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.search || url.hash) {
  fail('Refused: DB_URL must use PostgreSQL on literal loopback/localhost, with no query parameters or fragment. Remote databases are not supported.');
}
if (!url.pathname.slice(1) || !url.username) fail('DB_URL must explicitly identify the database and user.');
// Ignore ambient PostgreSQL service/host settings so they cannot override the URL.
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('PG') && key !== 'DB_URL'));
Object.assign(env, { PGHOST: url.hostname.replace(/^\[|\]$/g, ''), PGPORT: url.port || '5432', PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGCONNECT_TIMEOUT: '5', PGSSLMODE: 'disable' });
function psql(sql) {
  return spawnSync('psql', ['--no-psqlrc', '--no-password', '--quiet', '--no-align', '--tuples-only', '--set', 'ON_ERROR_STOP=1'], { env, input: sql, encoding: 'utf8', timeout: 60000, maxBuffer: 2 * 1024 * 1024 });
}
const preflight = psql("select (exists(select 1 from pg_extension where extname='pgtap') and to_regprocedure('ops.fn_check_api_surface()') is not null and to_regclass('app.knowledge_passages') is not null and to_regprocedure('app.fn_knowledge_passage(text,text)') is not null and to_regprocedure('app.fn_knowledge_catalogue(text)') is not null and to_regprocedure('app.fn_knowledge_work_passages(text,text,integer,integer)') is not null and to_regclass('app.cohort_invitations') is not null and to_regprocedure('app.fn_claim_seat(text,boolean)') is not null and to_regclass('app.circle_reading_releases') is not null and to_regprocedure('app.fn_circle_readings(uuid,text)') is not null and to_regprocedure('app.fn_teacher_release_candidates(uuid,text,text,integer)') is not null and to_regclass('app.member_reading_progress') is not null and to_regprocedure('app.fn_my_circle_reading_progress(uuid)') is not null and to_regprocedure('app.fn_set_circle_reading_mark(uuid,text,boolean)') is not null and to_regprocedure('app.fn_clear_my_reading_progress()') is not null and exists(select 1 from pg_event_trigger where evtname='trg_seal_functions' and evtenabled <> 'D') and exists(select 1 from pg_roles where rolname=current_user and rolsuper))::text;");
if (preflight.error?.code === 'ENOENT') fail('Blocked: psql is not installed or is not on PATH. Tests were not executed.');
if (preflight.error || preflight.status !== 0) fail(`Blocked: cannot connect to the explicit local database or inspect prerequisites. Tests were not executed.\n${preflight.stderr || preflight.error?.message || ''}`);
if (preflight.stdout.trim() !== 'true') fail('Blocked: require pgTAP, migrations 0001–0011, the enabled sealing trigger, and a local test superuser. This runner does not install extensions or apply migrations.');
let total = 0;
const suites = ['alpha_authorization.sql', 'knowledge_corpus.sql', 'circle_seats.sql', 'circle_delivery.sql', 'member_progress.sql'];
for (const suite of suites) {
  const sql = readFileSync(new URL(`../supabase/tests/pgtap/${suite}`, import.meta.url), 'utf8');
  const result = psql(sql);
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.status !== 0) fail(`${suite} did not complete. The fixture transaction rolls back on exit. ${result.error?.message || ''}`);
  const lines = result.stdout.split(/\r?\n/);
  const plan = lines.find(line => /^1\.\.\d+$/.test(line));
  const expected = plan ? Number(plan.slice(3)) : 0;
  const passed = lines.filter(line => /^ok \d+(?:\s|$)/.test(line)).length;
  if (!expected || expected !== passed || lines.some(line => /^not ok\b|^Bail out!/i.test(line))) fail(`${suite} failed or TAP output was incomplete (${passed}/${expected || '?'} passing).`);
  total += passed;
}
console.log(`Verified ${total} database authorization assertions across ${suites.length} suites; fixture transactions rolled back.`);
const race = spawnSync(process.execPath, [new URL('./test-seat-concurrency.mjs', import.meta.url).pathname], {
  env: { ...env, DB_URL: process.env.DB_URL }, encoding: 'utf8', timeout: 30000,
  maxBuffer: 512 * 1024,
});
if (race.stdout) process.stdout.write(race.stdout);
if (race.stderr) process.stderr.write(race.stderr);
if (race.error || race.status !== 0) fail(`Last-seat concurrency test failed. ${race.error?.message || ''}`);
const releaseRace = spawnSync(process.execPath, [new URL('./test-release-concurrency.mjs', import.meta.url).pathname], {
  env: { ...env, DB_URL: process.env.DB_URL }, encoding: 'utf8', timeout: 30000,
  maxBuffer: 512 * 1024,
});
if (releaseRace.stdout) process.stdout.write(releaseRace.stdout);
if (releaseRace.stderr) process.stderr.write(releaseRace.stderr);
if (releaseRace.error || releaseRace.status !== 0) fail(`Circle release concurrency test failed. ${releaseRace.error?.message || ''}`);
