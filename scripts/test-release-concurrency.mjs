#!/usr/bin/env node
// Verify two teachers cannot publish the same active release concurrently.
// Only the disposable loopback cluster created by run-database-local.sh is accepted.
import { spawn, spawnSync } from 'node:child_process';

const url = new URL(process.env.DB_URL || 'postgresql://invalid/invalid');
if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    decodeURIComponent(url.pathname.slice(1)) !== 'spritual_test' ||
    decodeURIComponent(url.username) !== 'spritual_test_admin' ||
    url.search || url.hash) {
  console.error('Refused: release race test requires the disposable spritual_test loopback database.');
  process.exit(1);
}
const env = Object.fromEntries(Object.entries(process.env)
  .filter(([name]) => !name.startsWith('PG') && name !== 'DB_URL'));
Object.assign(env, {
  PGHOST: url.hostname.replace(/^\[|\]$/g, ''), PGPORT: url.port || '5432',
  PGDATABASE: 'spritual_test', PGUSER: 'spritual_test_admin',
  PGPASSWORD: decodeURIComponent(url.password), PGCONNECT_TIMEOUT: '5',
  PGSSLMODE: 'disable',
});
const psqlArgs = ['--no-psqlrc', '--no-password', '--quiet', '--no-align',
  '--tuples-only', '--set', 'ON_ERROR_STOP=1'];
function sql(query, appName = 'spritual_release_control') {
  const result = spawnSync('psql', psqlArgs, {
    env: { ...env, PGAPPNAME: appName }, input: query, encoding: 'utf8',
    timeout: 10000, maxBuffer: 512 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'psql failed');
  }
  return result.stdout.trim();
}
function startSession(appName) {
  const child = spawn('psql', psqlArgs, {
    env: { ...env, PGAPPNAME: appName }, stdio: ['pipe', 'pipe', 'pipe'],
  });
  const state = { child, output: '', exited: false, code: null };
  child.stdout.on('data', chunk => { state.output += chunk; });
  child.stderr.on('data', chunk => { state.output += chunk; });
  child.on('exit', code => { state.exited = true; state.code = code; });
  return state;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitFor(marker, state, timeoutMs = 5000) {
  for (let elapsed = 0; elapsed < timeoutMs; elapsed += 20) {
    if (state.output.includes(marker)) return;
    if (state.exited) throw new Error(`psql exited before ${marker}: ${state.output.slice(-800)}`);
    await delay(20);
  }
  throw new Error(`Timed out waiting for ${marker}: ${state.output.slice(-800)}`);
}

const org = 'ee000001-0000-4000-8000-000000000001';
const cohort = 'ee000002-0000-4000-8000-000000000001';
const firstTeacher = 'ee000003-0000-4000-8000-000000000001';
const secondTeacher = 'ee000003-0000-4000-8000-000000000002';
const rendering = 'ee000004-0000-4000-8000-000000000006';
let first;
let second;
try {
  if (sql("select current_user || ':' || current_database()") !==
      'spritual_test_admin:spritual_test') {
    throw new Error('Expected the disposable local test superuser/database.');
  }
  sql(`
    insert into app.organizations(id,kind,display_name,seat_cap)
      values ('${org}','institution','Synthetic release race',3);
    insert into app.memberships(org_id,user_id,role) values
      ('${org}','${firstTeacher}','teacher'),
      ('${org}','${secondTeacher}','teacher');
    insert into app.cohorts(id,org_id,name,start_at,end_at,capacity)
      values ('${cohort}','${org}','Synthetic circle',
        now()-interval '1 hour',now()+interval '1 day',1);
    insert into app.knowledge_sources
      (id,title,source_identifier,provenance_status,provenance_evidence,verified_at)
      values ('ee000004-0000-4000-8000-000000000001','Synthetic source',
        'fixture:release-race','verified','Synthetic test only',now());
    insert into app.knowledge_works(id,slug,title,work_kind)
      values ('ee000004-0000-4000-8000-000000000002',
        'fixture-release-race','Synthetic work','other');
    insert into app.knowledge_editions
      (id,work_id,source_id,edition_label,language_code)
      values ('ee000004-0000-4000-8000-000000000003',
        'ee000004-0000-4000-8000-000000000002',
        'ee000004-0000-4000-8000-000000000001','Synthetic edition','en');
    insert into app.knowledge_source_licenses
      (edition_id,license_kind,status,rights_evidence,may_redistribute,verified_at)
      values ('ee000004-0000-4000-8000-000000000003',
        'owned','verified','Synthetic test only',true,now());
    insert into app.knowledge_passages
      (id,work_id,canonical_id,canonical_reference,unit_kind,sequence_no)
      values ('ee000004-0000-4000-8000-000000000004',
        'ee000004-0000-4000-8000-000000000002',
        'fixture.race.1','Fixture 1','other',1);
    insert into app.reviewers(id,full_name,credentials,auth_user_id)
      values ('ee000004-0000-4000-8000-000000000005',
        'Synthetic reviewer','Test only','ee000003-0000-4000-8000-000000000003');
    insert into app.reviewer_languages(reviewer_id,language_code)
      values ('ee000004-0000-4000-8000-000000000005','en');
    insert into app.knowledge_renderings
      (id,work_id,passage_id,edition_id,language_code,kind,body,
       status,access_class,reviewed_by,reviewed_at)
      values ('${rendering}',
        'ee000004-0000-4000-8000-000000000002',
        'ee000004-0000-4000-8000-000000000004',
        'ee000004-0000-4000-8000-000000000003',
        'en','editorial_explanation','Synthetic released fixture.',
        'published','member','ee000004-0000-4000-8000-000000000005',now());
  `);

  first = startSession('spritual_release_first');
  first.child.stdin.write(`begin;\nset local request.jwt.claim.sub='${firstTeacher}';\n`);
  first.child.stdin.write(`set local role authenticated;\n`);
  first.child.stdin.write(`select app.fn_schedule_circle_reading('${cohort}','${rendering}');\n`);
  first.child.stdin.write("select 'FIRST_RELEASE_HELD';\n");
  await waitFor('FIRST_RELEASE_HELD', first);

  second = startSession('spritual_release_second');
  second.child.stdin.end(`begin;\nset local request.jwt.claim.sub='${secondTeacher}';\n` +
    `set local role authenticated;\n` +
    `select app.fn_schedule_circle_reading('${cohort}','${rendering}');\ncommit;\n`);
  let waiting = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (sql(`select count(*) from pg_stat_activity where
      application_name='spritual_release_second' and wait_event_type='Lock'`) === '1') {
      waiting = true; break;
    }
    if (second.exited) break;
    await delay(50);
  }
  if (!waiting) throw new Error(
    `Second schedule did not wait on the first transaction: ${second.output.slice(-800)}`);

  first.child.stdin.end('commit;\n');
  for (let attempt = 0; attempt < 100 && (!first.exited || !second.exited); attempt += 1) {
    await delay(50);
  }
  if (!first.exited || first.code !== 0) throw new Error(
    `First release did not commit: ${first.output.slice(-800)}`);
  if (!second.exited || second.code === 0 ||
      !second.output.includes('circle_reading_one_active_release')) throw new Error(
    `Second release did not fail on the active-release constraint: ${second.output.slice(-800)}`);
  const count = sql(`select count(*) from app.circle_reading_releases where
    cohort_id='${cohort}' and rendering_id='${rendering}' and withdrawn_at is null`);
  if (count !== '1') throw new Error(`Active release count was ${count}, expected exactly one.`);
  console.log('Verified concurrent release race: second teacher waited and failed; exactly one active release committed.');
} catch (error) {
  console.error(`Circle release concurrency verification failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const state of [first, second]) {
    if (state && !state.exited) {
      state.child.stdin.end();
      state.child.kill();
    }
  }
}
