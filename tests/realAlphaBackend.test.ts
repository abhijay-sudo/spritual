import assert from "node:assert/strict";
import { test } from "node:test";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  claimCircleSeat, clearMyReadingProgress, loadCircleReadings, loadMyCircles,
  loadReadingProgress, loadTeacherAccess, parseRealReading, parseRealReadingProgress, setReadingMark,
  realErrorMessage, validateRealConfig,
} from "../web/src/alpha/real/backend.ts";

const cohortId = "11111111-1111-4111-8111-111111111111";
const orgId = "22222222-2222-4222-8222-222222222222";
const releaseId = "33333333-3333-4333-8333-333333333333";
const renderingId = "44444444-4444-4444-8444-444444444444";
const circle = {
  cohort_id: cohortId, org_id: orgId, org_name: "A community",
  circle_name: "Morning reading", start_at: "2026-09-26T00:00:00Z",
  end_at: "2026-10-26T00:00:00Z", my_role: "member",
};
const reading = {
  release_id: releaseId, release_at: "2026-09-26T09:00:00Z",
  rendering_id: renderingId, canonical_id: "bg.2.47",
  canonical_reference: "Bhagavad Gita 2.47", work_slug: "gita",
  work_title: "Bhagavad Gita", content_kind: "translation", language_code: "en",
  body: "A reviewed reading.", transliteration: null, access_class: "member",
  source_title: "Primary source", source_url: "https://example.org/source",
  source_identifier: "scan-01", edition_label: "1901 edition",
  attribution_text: "Source attribution", license_kind: "public_domain",
  reviewer_name: "A named reviewer", reviewed_at: "2026-09-25T10:00:00Z",
};

type MockResult = { data: unknown; error: { code: string } | null };
function mockClient(expectedName: string, expectedArgs: Record<string, unknown> | undefined, result: MockResult) {
  let calls = 0;
  const client = {
    schema(schema: string) {
      assert.equal(schema, "app");
      return { async rpc(name: string, args?: Record<string, unknown>) {
        calls += 1;
        assert.equal(name, expectedName);
        assert.deepEqual(args, expectedArgs);
        return result;
      } };
    },
  } as unknown as SupabaseClient;
  return { client, calls: () => calls };
}

test("real-mode config permits only HTTPS or loopback and a browser-safe key", () => {
  assert.equal(validateRealConfig("https://sample.supabase.co/", "sb_publishable_abc123").url, "https://sample.supabase.co");
  assert.equal(validateRealConfig("http://127.0.0.1:54321", "sb_publishable_abc123").url, "http://127.0.0.1:54321");
  assert.throws(() => validateRealConfig("http://sample.supabase.co", "sb_publishable_abc123"));
  assert.throws(() => validateRealConfig("https://sample.supabase.co", "sb_secret_abc123"));
  const jwt = (role: string) => `x.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.x`;
  assert.equal(validateRealConfig("https://sample.supabase.co", jwt("anon")).publishableKey, jwt("anon"));
  assert.throws(() => validateRealConfig("https://sample.supabase.co", jwt("service_role")));
});

test("circle and reading RPCs keep the app schema, parameters and reviewed metadata", async () => {
  const circles = mockClient("fn_my_circles", undefined, { data: [circle], error: null });
  assert.deepEqual((await loadMyCircles(circles.client))[0], {
    cohortId, orgId, orgName: "A community", name: "Morning reading",
    startsAt: circle.start_at, endsAt: circle.end_at, role: "member",
  });
  assert.equal(circles.calls(), 1);
  const readings = mockClient("fn_circle_readings", { p_cohort_id: cohortId, p_language: "en" }, { data: [reading], error: null });
  const [result] = await loadCircleReadings(readings.client, cohortId, "en");
  assert.equal(result.releaseId, releaseId);
  assert.equal(result.body, "A reviewed reading.");
  assert.equal(result.reviewerName, "A named reviewer");
  assert.equal(result.sourceIdentifier, "scan-01");
});

test("teacher navigation follows current organization roles and malformed identity fails closed", async () => {
  const identity = (role: string) => ({ authenticated: true, user_id: cohortId, memberships: [{ org_id: orgId, name: "A community", role }] });
  assert.equal(await loadTeacherAccess(mockClient("fn_me", undefined, { data: identity("member"), error: null }).client), false);
  assert.equal(await loadTeacherAccess(mockClient("fn_me", undefined, { data: identity("teacher"), error: null }).client), true);
  assert.equal(await loadTeacherAccess(mockClient("fn_me", undefined, { data: identity("admin"), error: null }).client), true);
  await assert.rejects(loadTeacherAccess(mockClient("fn_me", undefined, { data: { ...identity("teacher"), memberships: [identity("teacher").memberships[0], { role: "unknown", org_id: orgId }] }, error: null }).client));
  await assert.rejects(loadTeacherAccess(mockClient("fn_me", undefined, { data: null, error: { code: "42501" } }).client));
});

test("malformed or unsafe server rows fail closed", async () => {
  assert.throws(() => parseRealReading({ ...reading, source_url: "javascript:alert(1)" }));
  assert.throws(() => parseRealReading({ ...reading, reviewer_name: null }));
  assert.throws(() => parseRealReading({ ...reading, reviewed_at: "not-a-date" }));
  const malformed = mockClient("fn_my_circles", undefined, { data: [{ ...circle, cohort_id: "bad" }], error: null });
  await assert.rejects(loadMyCircles(malformed.client));
});

test("revoked access and missing API schema produce recoverable, non-sensitive errors", async () => {
  const revoked = mockClient("fn_circle_readings", { p_cohort_id: cohortId, p_language: "hi" }, { data: null, error: { code: "42501" } });
  await assert.rejects(loadCircleReadings(revoked.client, cohortId, "hi"), error => {
    assert.match(realErrorMessage(error), /no longer available/);
    assert.match(realErrorMessage(error, "hi"), /अब इस खाते के लिए उपलब्ध नहीं/);
    return true;
  });
  const missingSchema = mockClient("fn_my_circles", undefined, { data: null, error: { code: "PGRST106" } });
  await assert.rejects(loadMyCircles(missingSchema.client), error => {
    assert.match(realErrorMessage(error), /schema is not exposed/);
    assert.match(realErrorMessage(error, "hi"), /API स्कीमा उपलब्ध नहीं/);
    return true;
  });
});

test("claim calls only the recipient-bound RPC after token and adult confirmation", async () => {
  const token = "a".repeat(64);
  const claimed = mockClient("fn_claim_seat", { p_token: token, p_adult: true }, { data: { cohort_id: cohortId }, error: null });
  assert.equal(await claimCircleSeat(claimed.client, `  ${token.toUpperCase()}  `, true), cohortId);
  assert.equal(claimed.calls(), 1);
  await assert.rejects(claimCircleSeat(claimed.client, "short", true));
  await assert.rejects(claimCircleSeat(claimed.client, token, false));
  assert.equal(claimed.calls(), 1);
  const expired = mockClient("fn_claim_seat", { p_token: token, p_adult: true }, { data: null, error: { code: "P0002" } });
  await assert.rejects(claimCircleSeat(expired.client, token, true), error => {
    assert.match(realErrorMessage(error), /cannot be claimed/);
    return true;
  });
});

test("explicit reading marks use account-scoped RPCs and parse only minimal state", async () => {
  const progressRow = {
    release_id: releaseId, cohort_id: cohortId,
    canonical_reference: "Bhagavad Gita 2.47", work_title: "Bhagavad Gita", language_code: "hi",
    bookmarked_at: "2026-09-26T12:00:00Z", completed_at: null,
  };
  const progress = mockClient("fn_my_circle_reading_progress", { p_cohort_id: null }, { data: [progressRow], error: null });
  assert.deepEqual(await loadReadingProgress(progress.client), [{
    releaseId, cohortId, reference: "Bhagavad Gita 2.47", workTitle: "Bhagavad Gita",
    language: "hi", bookmarkedAt: progressRow.bookmarked_at, completedAt: null,
  }]);
  assert.equal(progress.calls(), 1);
  const scoped = mockClient("fn_my_circle_reading_progress", { p_cohort_id: cohortId }, { data: [], error: null });
  assert.deepEqual(await loadReadingProgress(scoped.client, cohortId), []);

  const mark = mockClient("fn_set_circle_reading_mark", {
    p_release_id: releaseId, p_kind: "bookmark", p_enabled: true,
  }, { data: { release_id: releaseId, bookmarked_at: progressRow.bookmarked_at, completed_at: null }, error: null });
  assert.deepEqual(await setReadingMark(mark.client, releaseId, "bookmark", true), {
    releaseId, bookmarkedAt: progressRow.bookmarked_at, completedAt: null,
  });
  assert.equal(mark.calls(), 1);
  await assert.rejects(setReadingMark(mark.client, "not-a-uuid", "bookmark", true));
  await assert.rejects(setReadingMark(mark.client, releaseId, "view" as "bookmark", true));
  assert.equal(mark.calls(), 1);
  const clear = mockClient("fn_clear_my_reading_progress", undefined, { data: 2, error: null });
  assert.equal(await clearMyReadingProgress(clear.client), 2);
});

test("malformed private progress and revoked mark access fail closed", async () => {
  const row = { release_id: releaseId, cohort_id: cohortId, canonical_reference: "Gita 2.47", work_title: "Gita", language_code: "en", bookmarked_at: null, completed_at: null };
  assert.throws(() => parseRealReadingProgress({ ...row, language_code: "sa" }));
  assert.throws(() => parseRealReadingProgress({ ...row, bookmarked_at: "invalid" }));
  const revoked = mockClient("fn_set_circle_reading_mark", { p_release_id: releaseId, p_kind: "completed", p_enabled: true }, { data: null, error: { code: "42501" } });
  await assert.rejects(setReadingMark(revoked.client, releaseId, "completed", true), error => {
    assert.match(realErrorMessage(error), /no longer available/);
    return true;
  });
});
