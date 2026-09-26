import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { randomBytes, randomUUID } from 'node:crypto';

const projectDir = process.env.SPIRITUAL_LOCAL_SUPABASE_DIR;
if (!projectDir) throw Error('Set SPIRITUAL_LOCAL_SUPABASE_DIR to an isolated local Supabase CLI project.');
const require = createRequire(new URL('../package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');
const status = JSON.parse(execFileSync('supabase', ['status', '-o', 'json'], { cwd: projectDir, encoding: 'utf8' }));
for (const key of ['API_URL', 'DB_URL', 'MAILPIT_URL']) {
  const url = new URL(status[key]);
  assert.ok(['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname), `${key} must be loopback`);
}
assert.ok(status.PUBLISHABLE_KEY && status.SECRET_KEY, 'local CLI keys missing');
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }, db: { schema: 'app' } };
const guest = createClient(status.API_URL, status.PUBLISHABLE_KEY, clientOptions);
const member = createClient(status.API_URL, status.PUBLISHABLE_KEY, clientOptions);
const invitee = createClient(status.API_URL, status.PUBLISHABLE_KEY, clientOptions);
const admin = createClient(status.API_URL, status.SECRET_KEY, clientOptions);
const email = `auth-check-${randomUUID()}@example.test`;
const password = randomBytes(24).toString('hex');
const inviteeEmail = `auth-check-${randomUUID()}@example.test`;
const orgId = randomUUID();
let authUserId;
let inviteeId;
let orgCreated = false;
const checks = [];
function checked(name) { checks.push(name); console.log(`PASS ${name}`); }
function sql(statement) {
  return execFileSync('psql', [status.DB_URL, '-X', '-A', '-t', '-v', 'ON_ERROR_STOP=1'], { input: statement, encoding: 'utf8' }).trim();
}
try {
  const anonIdentity = await guest.rpc('fn_me');
  assert.ok(anonIdentity.error, 'anon must not execute authenticated identity RPC');
  checked('anon cannot invoke fn_me');

  const signup = await member.auth.signUp({ email, password });
  assert.ifError(signup.error);
  assert.ok(signup.data.user?.id && signup.data.session?.access_token, 'local signup must return a session');
  authUserId = signup.data.user.id;
  checked('real GoTrue signup returned a JWT session');

  const verified = await member.auth.getUser();
  assert.ifError(verified.error);
  assert.equal(verified.data.user?.id, authUserId);
  checked('getUser verified the JWT against GoTrue');

  const identity = await member.rpc('fn_me');
  assert.ifError(identity.error);
  assert.equal(identity.data?.authenticated, true);
  assert.equal(identity.data?.user_id, authUserId);
  assert.deepEqual(identity.data?.memberships, []);
  checked('PostgREST app.fn_me resolved the JWT subject');

  const initialCircles = await member.rpc('fn_my_circles');
  assert.ifError(initialCircles.error);
  assert.deepEqual(initialCircles.data, []);
  checked('unprovisioned user sees no circles');

  const noTeacher = await member.rpc('fn_create_circle', {
    p_org_id: orgId, p_name: 'Denied fixture',
    p_start_at: new Date(Date.now() - 60000).toISOString(),
    p_end_at: new Date(Date.now() + 8 * 86400000).toISOString(), p_capacity: 3,
  });
  assert.ok(noTeacher.error, 'unprovisioned user must not create a circle');
  checked('unprovisioned user cannot create a circle');

  const tableProbe = await member.from('memberships').select('id').limit(1);
  assert.ok(tableProbe.error, 'client must not read base table');
  checked('authenticated client cannot read app.memberships table');

  const opsProbe = await member.schema('ops').rpc('fn_check_api_surface');
  assert.ok(opsProbe.error, 'ops must not be exposed');
  checked('ops schema is not exposed in PostgREST');

  assert.match(authUserId, /^[0-9a-f-]{36}$/i);
  sql(`begin;\ninsert into app.organizations(id,kind,display_name,seat_cap) values ('${orgId}','institution','Local auth integration fixture',5);\ninsert into app.memberships(org_id,user_id,role) values ('${orgId}','${authUserId}','teacher');\ncommit;`);
  orgCreated = true;
  const promoted = await member.rpc('fn_me');
  assert.ifError(promoted.error);
  assert.ok(promoted.data.memberships.some((row) => row.org_id === orgId && row.role === 'teacher'));
  checked('fixture teacher membership appears only for signed-in account');

  const created = await member.rpc('fn_create_circle', {
    p_org_id: orgId, p_name: 'Local integration circle',
    p_start_at: new Date(Date.now() - 60000).toISOString(),
    p_end_at: new Date(Date.now() + 8 * 86400000).toISOString(), p_capacity: 3,
  });
  assert.ifError(created.error);
  assert.match(created.data, /^[0-9a-f-]{36}$/i);
  const circles = await member.rpc('fn_my_circles');
  assert.ifError(circles.error);
  assert.ok(circles.data.some((row) => row.cohort_id === created.data && row.my_role === 'teacher'));
  checked('provisioned teacher creates and discovers a circle through RPC');

  const releaseCandidates = await member.rpc('fn_teacher_release_candidates', { p_cohort_id: created.data, p_language: 'en' });
  assert.ifError(releaseCandidates.error);
  assert.deepEqual(releaseCandidates.data, []);
  checked('teacher release candidates stay empty without approved content');

  const teacherFeed = await member.rpc('fn_circle_readings', { p_cohort_id: created.data, p_language: 'en' });
  assert.ok(teacherFeed.error, 'teacher without a cohort seat must not receive member feed');
  checked('teacher cannot bypass member-seat access for the reading feed');

  const inviteeSignup = await invitee.auth.signUp({ email: inviteeEmail, password: randomBytes(24).toString('hex') });
  assert.ifError(inviteeSignup.error);
  assert.ok(inviteeSignup.data.session?.access_token);
  inviteeId = inviteeSignup.data.user.id;
  const invitation = await member.rpc('fn_issue_circle_invitation', {
    p_org_id: orgId, p_cohort_id: created.data, p_recipient_user_id: inviteeId,
  });
  assert.ifError(invitation.error);
  assert.match(invitation.data?.token, /^[0-9a-f]{64}$/);
  checked('teacher issues a recipient-bound synthetic invitation');

  const wrongAccount = await member.rpc('fn_claim_seat', { p_token: invitation.data.token, p_adult: true });
  assert.ok(wrongAccount.error, 'teacher must not claim invitee token');
  const noAdult = await invitee.rpc('fn_claim_seat', { p_token: invitation.data.token, p_adult: false });
  assert.ok(noAdult.error, 'adult confirmation is required');
  checked('invitation rejects the wrong account and missing adult confirmation');

  const claim = await invitee.rpc('fn_claim_seat', { p_token: invitation.data.token, p_adult: true });
  assert.ifError(claim.error);
  assert.equal(claim.data?.cohort_id, created.data);
  const memberCircles = await invitee.rpc('fn_my_circles');
  assert.ifError(memberCircles.error);
  assert.ok(memberCircles.data.some((row) => row.cohort_id === created.data && row.my_role === 'member'));
  checked('signed-in recipient claims a seat and rediscovers the circle');

  const noContent = await invitee.rpc('fn_circle_readings', { p_cohort_id: created.data, p_language: 'en' });
  assert.ifError(noContent.error);
  assert.deepEqual(noContent.data, []);
  checked('unreviewed/unlicensed empty corpus yields no member reading');

  const progress = await invitee.rpc('fn_my_circle_reading_progress', { p_cohort_id: created.data });
  assert.ifError(progress.error);
  assert.deepEqual(progress.data, []);
  checked('member progress starts private and empty');

  const unknownMark = await invitee.rpc('fn_set_circle_reading_mark', { p_release_id: randomUUID(), p_kind: 'bookmark', p_enabled: true });
  assert.ok(unknownMark.error, 'unknown release must not be markable');
  checked('member cannot mark an unknown release');

  const erased = await invitee.rpc('fn_clear_my_reading_progress');
  assert.ifError(erased.error);
  assert.equal(erased.data, 0);
  checked('account-wide progress erasure succeeds with zero rows');

  await invitee.auth.signOut();
  const sent = await invitee.auth.signInWithOtp({ email: inviteeEmail, options: { shouldCreateUser: false } });
  assert.ifError(sent.error);
  let code;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(`${status.MAILPIT_URL}/view/latest.html?query=${encodeURIComponent(`to:${inviteeEmail}`)}`);
    if (response.ok) code = (await response.text()).match(/<strong>(\d{6})<\/strong>/)?.[1];
    if (code) break;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  assert.ok(code, 'local Mailpit did not receive an OTP');
  const otp = await invitee.auth.verifyOtp({ email: inviteeEmail, token: code, type: 'email' });
  assert.ifError(otp.error);
  assert.equal(otp.data.user?.id, inviteeId);
  const afterOtp = await invitee.rpc('fn_my_circles');
  assert.ifError(afterOtp.error);
  assert.ok(afterOtp.data.some((row) => row.cohort_id === created.data));
  checked('Mailpit six-digit OTP restores the same authorized member');

  console.log(`VERIFIED ${checks.length} live Auth/PostgREST checks`);
} finally {
  if (orgCreated) {
    try { sql(`delete from app.organizations where id = '${orgId}';`); }
    catch (error) { console.error('LOCAL CLEANUP ERROR: fixture org was not removed:', error.message); process.exitCode = 1; }
  }
  if (inviteeId) {
    const removedInvitee = await admin.auth.admin.deleteUser(inviteeId);
    if (removedInvitee.error) { console.error('LOCAL CLEANUP ERROR: synthetic invitee was not removed:', removedInvitee.error.message); process.exitCode = 1; }
  }
  if (authUserId) {
    const removed = await admin.auth.admin.deleteUser(authUserId);
    if (removed.error) { console.error('LOCAL CLEANUP ERROR: synthetic Auth user was not removed:', removed.error.message); process.exitCode = 1; }
  }
}
