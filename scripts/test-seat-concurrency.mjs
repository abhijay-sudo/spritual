#!/usr/bin/env node
// A real two-session last-seat race against the disposable database created by
// run-database-local.sh. This deliberately refuses an arbitrary DB target.
import { spawn, spawnSync } from 'node:child_process';

const url = new URL(process.env.DB_URL || 'postgresql://invalid/invalid');
if (!['postgres:', 'postgresql:'].includes(url.protocol) ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    decodeURIComponent(url.pathname.slice(1)) !== 'spritual_test' ||
    decodeURIComponent(url.username) !== 'spritual_test_admin' ||
    url.search || url.hash) {
  console.error('Refused: last-seat race test requires the disposable spritual_test loopback database.');
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
function sql(query, appName = 'spritual_race_control') {
  const result = spawnSync('psql', psqlArgs, {
    env: { ...env, PGAPPNAME: appName }, input: query, encoding: 'utf8',
    timeout: 10000, maxBuffer: 512 * 1024,
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'psql failed');
  }
  return result.stdout.trim();
}
const org = 'fd000001-0000-4000-8000-000000000001';
const cohort = 'fd000002-0000-4000-8000-000000000001';
const firstUser = 'fd000003-0000-4000-8000-000000000001';
const secondUser = 'fd000003-0000-4000-8000-000000000002';
const firstToken = 'a'.repeat(64);
const secondToken = 'b'.repeat(64);
const invitationA = 'fd000004-0000-4000-8000-000000000001';
const invitationB = 'fd000004-0000-4000-8000-000000000002';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
function waitFor(marker, processState, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error(
      `Timed out waiting for ${marker}; output: ${processState.output.slice(-800)}`)), timeoutMs);
    const check = () => {
      if (processState.output.includes(marker)) {
        clearTimeout(deadline); resolve();
      } else if (processState.exited) {
        clearTimeout(deadline); reject(new Error(
          `psql exited before ${marker}: ${processState.output.slice(-800)}`));
      } else setTimeout(check, 20);
    };
    check();
  });
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

let first;
let second;
try {
  if (sql("select current_user || ':' || current_database()") !==
      'spritual_test_admin:spritual_test') {
    throw new Error('Expected the disposable local test superuser/database.');
  }
  sql(`
    insert into app.organizations(id,kind,display_name,seat_cap)
      values ('${org}','institution','Synthetic race only',1);
    insert into app.cohorts(id,org_id,name,start_at,end_at,capacity)
      values ('${cohort}','${org}','Synthetic race cohort',
        now()-interval '1 day',now()+interval '1 day',2);
    insert into app.cohort_invitations
      (id,org_id,cohort_id,recipient_user_id,token_hash,issued_by_user_id,expires_at)
      values
      ('${invitationA}','${org}','${cohort}','${firstUser}',
        sha256(convert_to('${firstToken}','UTF8')),'${firstUser}',now()+interval '1 day'),
      ('${invitationB}','${org}','${cohort}','${secondUser}',
        sha256(convert_to('${secondToken}','UTF8')),'${secondUser}',now()+interval '1 day');
  `);

  first = startSession('spritual_claim_first');
  first.child.stdin.write(`begin;\nset local request.jwt.claim.sub = '${firstUser}';\n`);
  first.child.stdin.write(`set local role authenticated;\n`);
  first.child.stdin.write(`select app.fn_claim_seat('${firstToken}',true)->>'membership_id';\n`);
  first.child.stdin.write("select 'FIRST_CLAIM_HELD';\n");
  await waitFor('FIRST_CLAIM_HELD', first);

  second = startSession('spritual_claim_second');
  second.child.stdin.end(`begin;\nset local request.jwt.claim.sub = '${secondUser}';\n` +
    `set local role authenticated;\nselect app.fn_claim_seat('${secondToken}',true);\ncommit;\n`);
  let waiting = false;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (sql(`select count(*) from pg_stat_activity where
      application_name='spritual_claim_second' and wait_event_type='Lock'`) === '1') {
      waiting = true; break;
    }
    if (second.exited) break;
    await delay(50);
  }
  if (!waiting) throw new Error(
    `Second claim did not wait on the first transaction: ${second.output.slice(-800)}`);

  first.child.stdin.end('commit;\n');
  await waitFor('FIRST_CLAIM_HELD', first);
  for (let attempt = 0; attempt < 100 && (!first.exited || !second.exited); attempt += 1) {
    await delay(50);
  }
  if (!first.exited || first.code !== 0) throw new Error(
    `First claim did not commit: ${first.output.slice(-800)}`);
  if (!second.exited || second.code === 0 ||
      !second.output.includes('organisation is full')) throw new Error(
    `Second claim did not fail at capacity: ${second.output.slice(-800)}`);

  const state = sql(`select (select count(*) from app.memberships where
    org_id='${org}' and revoked_at is null)::text || ':' ||
    (select count(*) from app.cohort_memberships where
    cohort_id='${cohort}' and revoked_at is null)::text || ':' ||
    (select count(*) from app.cohort_invitations where
    org_id='${org}' and accepted_at is not null)::text`);
  if (state !== '1:1:1') throw new Error(
    `Last-seat state was ${state}, expected one membership, cohort seat and accepted token.`);
  console.log('Verified concurrent last-seat race: second claim waited on the organisation lock and failed; exactly one seat committed.');
} catch (error) {
  console.error(`Last-seat concurrency verification failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const state of [first, second]) {
    if (state && !state.exited) {
      state.child.stdin.end();
      state.child.kill();
    }
  }
}
