import test from "node:test";
import assert from "node:assert/strict";
import { actors, createSeed } from "../web/src/alpha/fixtures.ts";
import {
  access,
  localDay,
  transition,
  visibleContents,
} from "../web/src/alpha/domain.ts";
const now = new Date("2026-09-25T10:00:00Z");
const [member, otherMember, teacher, reviewer, operator, foreign] = actors;
const joined = () =>
  transition(
    createSeed(now),
    member,
    { type: "join", token: "WELCOME-DEMO", adult: true },
    now,
  );
test("personal invitation grants included access without payment and cannot be replayed", () => {
  const before = createSeed(now);
  const after = transition(
    before,
    member,
    { type: "join", token: "WELCOME-DEMO", adult: true },
    now,
  );
  assert.equal(before.memberships.length, 0);
  assert.equal(access(after, member, "demo-cohort", now).allowed, true);
  assert.equal(after.grants[0].source, "institution");
  assert.equal(visibleContents(after, member, "demo-cohort", now).length, 1);
  assert.throws(
    () =>
      transition(
        after,
        member,
        { type: "join", token: "WELCOME-DEMO", adult: true },
        now,
      ),
    /already been used/,
  );
});
test("invitations reject wrong recipient, invalid, revoked, expired, minors and capacity", () => {
  const join = { type: "join", token: "WELCOME-DEMO", adult: true } as const;
  assert.throws(
    () => transition(createSeed(now), otherMember, join, now),
    /another member/,
  );
  assert.throws(
    () => transition(createSeed(now), foreign, join, now),
    /not found/,
  );
  assert.throws(
    () =>
      transition(createSeed(now), member, { ...join, token: "unknown" }, now),
    /not found/,
  );
  assert.throws(
    () => transition(createSeed(now), member, { ...join, adult: false }, now),
    /adults/,
  );
  const revoked = createSeed(now);
  revoked.invitations[0].revoked = true;
  assert.throws(() => transition(revoked, member, join, now), /revoked/);
  const expired = createSeed(now);
  expired.invitations[0].expiresAt = now.toISOString();
  assert.throws(() => transition(expired, member, join, now), /expired/);
  const full = createSeed(now);
  full.cohorts[0].capacity = 0;
  assert.throws(() => transition(full, member, join, now), /full/);
});
test("roles and organisation isolate content transitions", () => {
  for (const actor of [member, operator])
    assert.throws(
      () =>
        transition(
          createSeed(now),
          actor,
          { type: "review", contentId: "demo-kindness-v1" },
          now,
        ),
      /Teacher/,
    );
  assert.throws(
    () =>
      transition(
        createSeed(now),
        foreign,
        { type: "review", contentId: "demo-kindness-v1" },
        now,
      ),
    /organisation/,
  );
  assert.throws(
    () =>
      transition(
        createSeed(now),
        teacher,
        { type: "approve", contentId: "demo-kindness-v1" },
        now,
      ),
    /Reviewer/,
  );
  assert.throws(
    () =>
      transition(
        createSeed(now),
        reviewer,
        { type: "approve", contentId: "demo-kindness-v1" },
        now,
      ),
    /submitted/,
  );
});
test("review rights and exact version govern release; revisions preserve old published version", () => {
  let state = createSeed(now);
  assert.throws(
    () =>
      transition(
        state,
        teacher,
        { type: "review", contentId: "demo-kindness-v1" },
        now,
      ),
    /rights/,
  );
  state = transition(
    state,
    teacher,
    {
      type: "rights",
      contentId: "demo-kindness-v1",
      language: "en",
      territory: "worldwide",
      expiresAt: "2026-10-30T00:00:00Z",
    },
    now,
  );
  state = transition(
    state,
    teacher,
    { type: "review", contentId: "demo-kindness-v1" },
    now,
  );
  state = transition(
    state,
    reviewer,
    { type: "approve", contentId: "demo-kindness-v1" },
    now,
  );
  assert.throws(
    () =>
      transition(
        state,
        teacher,
        {
          type: "rights",
          contentId: "demo-kindness-v1",
          language: "hi",
          territory: "India",
          expiresAt: "2026-10-30T00:00:00Z",
        },
        now,
      ),
    /draft/,
  );
  assert.throws(
    () =>
      transition(
        state,
        teacher,
        {
          type: "publish",
          contentId: "demo-kindness-v1",
          cohortId: "demo-cohort",
          releaseAt: "2027-01-01T00:00:00Z",
        },
        now,
      ),
    /within/,
  );
  state = transition(
    state,
    teacher,
    {
      type: "publish",
      contentId: "demo-kindness-v1",
      cohortId: "demo-cohort",
      releaseAt: now.toISOString(),
    },
    now,
  );
  const previous = structuredClone(state.contents[1]);
  state = transition(
    state,
    teacher,
    { type: "revise", contentId: previous.id },
    now,
  );
  assert.deepEqual(state.contents[1], previous);
  const revision = state.contents.at(-1)!;
  assert.equal(revision.version, 2);
  assert.equal(revision.approvedBy, undefined);
  assert.equal(revision.rights.recorded, false);
  assert.throws(
    () =>
      transition(
        state,
        teacher,
        {
          type: "publish",
          contentId: revision.id,
          cohortId: "demo-cohort",
          releaseAt: now.toISOString(),
        },
        now,
      ),
    /exact approved/,
  );
});
test("content rights expiry, scheduled releases and overlapping grants fail closed appropriately", () => {
  const state = joined();
  state.grants[0].status = "refunded";
  assert.equal(access(state, member, "demo-cohort", now).allowed, false);
  state.grants.push({
    ...state.grants[0],
    id: "independent",
    status: "active",
    source: "direct",
  });
  assert.equal(access(state, member, "demo-cohort", now).allowed, true);
  state.contents[0].releaseAt = "2026-09-26T00:00:00Z";
  assert.equal(visibleContents(state, member, "demo-cohort", now).length, 0);
  state.contents[0].releaseAt = now.toISOString();
  state.contents[0].rights.expiresAt = now.toISOString();
  assert.equal(visibleContents(state, member, "demo-cohort", now).length, 0);
  assert.equal(access(state, foreign, "demo-cohort", now).allowed, false);
});
test("deliberate completion authorizes first, deduplicates local day and never audits transcript", () => {
  const action = {
    type: "complete",
    contentId: "demo-pause-v1",
    cohortId: "demo-cohort",
    timeZone: "Asia/Kolkata",
  } as const;
  assert.throws(
    () => transition(createSeed(now), member, action, now),
    /not available/,
  );
  const once = transition(joined(), member, action, now);
  const twice = transition(once, member, action, now);
  assert.equal(twice.completions.length, 1);
  assert.equal(twice.audit.length, once.audit.length);
  const tomorrow = transition(twice, member, action, new Date(+now + 86400000));
  assert.equal(tomorrow.completions.length, 2);
  assert.equal(
    JSON.stringify(tomorrow.audit).includes(tomorrow.contents[0].transcript),
    false,
  );
  once.contents[0].status = "withdrawn";
  assert.throws(() => transition(once, member, action, now), /not available/);
  assert.equal(
    localDay(new Date("2026-09-25T20:00:00Z"), "Asia/Kolkata"),
    "2026-09-26",
  );
  assert.equal(
    localDay(new Date("2026-09-25T20:00:00Z"), "America/New_York"),
    "2026-09-25",
  );
  assert.throws(() => localDay(now, "invalid"));
});
test("draft edits reset rights and cannot mutate published versions", () => {
  const state = createSeed(now);
  const edit = {
    type: "editContent",
    contentId: "demo-kindness-v1",
    title: "Updated draft",
    purpose: "Original demonstration",
    transcript: "Choose one considerate action.",
  } as const;
  const rights = transition(
    state,
    teacher,
    {
      type: "rights",
      contentId: edit.contentId,
      language: "en",
      territory: "worldwide",
      expiresAt: "2026-10-30T00:00:00Z",
    },
    now,
  );
  const edited = transition(rights, teacher, edit, now);
  assert.equal(edited.contents[1].title, edit.title);
  assert.equal(edited.contents[1].rights.recorded, false);
  assert.equal(rights.contents[1].rights.recorded, true);
  assert.throws(
    () =>
      transition(state, teacher, { ...edit, contentId: "demo-pause-v1" }, now),
    /draft/,
  );
});
test("scheduled revision replaces old version only after release, within assigned circle", () => {
  let state = joined();
  state = transition(
    state,
    teacher,
    { type: "revise", contentId: "demo-pause-v1" },
    now,
  );
  const contentId = state.contents.at(-1)!.id;
  state = transition(
    state,
    teacher,
    {
      type: "rights",
      contentId,
      language: "en",
      territory: "worldwide",
      expiresAt: "2026-10-30T00:00:00Z",
    },
    now,
  );
  state = transition(state, teacher, { type: "review", contentId }, now);
  state = transition(state, reviewer, { type: "approve", contentId }, now);
  const tomorrow = new Date(+now + 86400000);
  state = transition(
    state,
    teacher,
    {
      type: "publish",
      contentId,
      cohortId: "demo-cohort",
      releaseAt: tomorrow.toISOString(),
    },
    now,
  );
  assert.deepEqual(
    visibleContents(state, member, "demo-cohort", now).map((c) => c.id),
    ["demo-pause-v1"],
  );
  assert.deepEqual(
    visibleContents(state, member, "demo-cohort", tomorrow).map((c) => c.id),
    [contentId],
  );
  assert.equal(state.contents[0].status, "published");
});
test("leaving community removes only own records, revokes used invite and retains minimal audit", () => {
  let state = joined();
  state = transition(
    state,
    member,
    {
      type: "complete",
      contentId: "demo-pause-v1",
      cohortId: "demo-cohort",
      timeZone: "Asia/Kolkata",
    },
    now,
  );
  state.memberships.push({ ...state.memberships[0], userId: otherMember.id });
  state.grants.push({
    ...state.grants[0],
    id: "other-grant",
    userId: otherMember.id,
  });
  state.completions.push({
    ...state.completions[0],
    id: "other-completion",
    userId: otherMember.id,
  });
  const left = transition(state, member, { type: "leaveCommunity" }, now);
  for (const rows of [left.memberships, left.grants, left.completions]) {
    assert.equal(rows.length, 1);
    assert.equal(rows[0].userId, otherMember.id);
  }
  assert.equal(left.invitations[0].revoked, true);
  assert.equal(left.audit.at(-1)!.action, "leaveCommunity");
  assert.equal(access(left, member, "demo-cohort", now).allowed, false);
  assert.throws(
    () => transition(state, teacher, { type: "leaveCommunity" }, now),
    /Member/,
  );
});
test("ordinary member cannot invoke staff writes across the entire action surface", () => {
  const staffActions = [
    { type: "createContent", title: "x", purpose: "x", transcript: "x" },
    {
      type: "editContent",
      contentId: "demo-kindness-v1",
      title: "x",
      purpose: "x",
      transcript: "x",
    },
    { type: "revise", contentId: "demo-pause-v1" },
    {
      type: "rights",
      contentId: "demo-kindness-v1",
      language: "en",
      territory: "worldwide",
      expiresAt: "2027-01-01T00:00:00Z",
    },
    { type: "review", contentId: "demo-kindness-v1" },
    { type: "approve", contentId: "demo-kindness-v1" },
    {
      type: "publish",
      contentId: "demo-kindness-v1",
      cohortId: "demo-cohort",
      releaseAt: now.toISOString(),
    },
    { type: "withdraw", contentId: "demo-pause-v1" },
    {
      type: "createCohort",
      name: "x",
      startAt: now.toISOString(),
      endAt: "2027-01-01T00:00:00Z",
      capacity: 2,
    },
    { type: "invite", cohortId: "demo-cohort", recipientId: otherMember.id },
    { type: "revokeInvite", invitationId: "demo-invitation" },
    { type: "logMinutes", minutes: 10, kind: "support" },
  ] as const;
  for (const action of staffActions)
    assert.throws(
      () => transition(createSeed(now), member, action, now),
      /access is required/,
      action.type,
    );
});
test("duplicate invitation issuance and last seat are enforced without consuming failed invitation", () => {
  let state = createSeed(now);
  assert.throws(
    () =>
      transition(
        state,
        teacher,
        { type: "invite", cohortId: "demo-cohort", recipientId: member.id },
        now,
      ),
    /already exists/,
  );
  state.cohorts[0].capacity = 1;
  state = transition(
    state,
    teacher,
    { type: "invite", cohortId: "demo-cohort", recipientId: otherMember.id },
    now,
  );
  state = transition(
    state,
    member,
    { type: "join", token: "WELCOME-DEMO", adult: true },
    now,
  );
  const otherInvite = state.invitations.find(
    (i) => i.recipientId === otherMember.id,
  )!;
  assert.throws(
    () =>
      transition(
        state,
        otherMember,
        { type: "join", token: otherInvite.token, adult: true },
        now,
      ),
    /full/,
  );
  assert.equal(otherInvite.acceptedBy, undefined);
});
test('withdrawn or rights-expired released revision never silently restores its predecessor', () => {
  let state = joined();
  state = transition(state, teacher, { type: 'revise', contentId: 'demo-pause-v1' }, now);
  const contentId = state.contents.at(-1)!.id;
  assert.equal(state.contents.at(-1)!.publishedAt, undefined);
  state = transition(state, teacher, { type: 'rights', contentId, language: 'en', territory: 'worldwide', expiresAt: new Date(+now + 1000).toISOString() }, now);
  state = transition(state, teacher, { type: 'review', contentId }, now);
  state = transition(state, reviewer, { type: 'approve', contentId }, now);
  state = transition(state, teacher, { type: 'publish', contentId, cohortId: 'demo-cohort', releaseAt: now.toISOString() }, now);
  assert.equal(state.contents.at(-1)!.publishedAt, now.toISOString());
  assert.deepEqual(visibleContents(state, member, 'demo-cohort', new Date(+now + 1000)), []);
  const withdrawn = transition(state, teacher, { type: 'withdraw', contentId }, now);
  assert.deepEqual(visibleContents(withdrawn, member, 'demo-cohort', now), []);
  delete withdrawn.contents.at(-1)!.publishedAt;
  assert.deepEqual(visibleContents(withdrawn, member, 'demo-cohort', now), [], 'legacy withdrawn approved revision is treated conservatively');
});
