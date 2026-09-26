import { expect, test } from "@playwright/test";

// Run only against an isolated build made with VITE_ALPHA_MODE=real and a
// loopback Supabase URL. This fixture tests client wiring, not live Auth/RLS.
test.skip(!process.env.SPIRITUAL_REAL_E2E, "Requires isolated real-mode build and synthetic network fixtures");
test.use({ viewport: { width: 390, height: 844 } });

const userId = "fe000002-0000-4000-8000-000000000001";
const orgId = "fe000001-0000-4000-8000-000000000001";
const cohortId = "fe000003-0000-4000-8000-000000000001";
const renderingId = "fe000010-0000-4000-8000-000000000009";
const releaseId = "fe000020-0000-4000-8000-000000000001";
const createdId = "fe000003-0000-4000-8000-000000000002";
const user = {
  id: userId, aud: "authenticated", role: "authenticated", email: "teacher@example.test",
  created_at: "2026-01-01T00:00:00Z", app_metadata: { provider: "email", providers: ["email"] },
  user_metadata: {},
};
const reading = {
  release_id: releaseId, release_at: "2026-01-01T00:00:00Z", rendering_id: renderingId,
  canonical_id: "bg.2.47", canonical_reference: "Bhagavad Gita 2.47",
  work_slug: "bhagavad-gita", work_title: "Bhagavad Gita", content_kind: "canonical_text",
  language_code: "en", body: "Synthetic reviewed fixture for network testing only.",
  transliteration: null, access_class: "member", source_title: "Synthetic source",
  source_url: "https://example.invalid/source", source_identifier: "fixture:source",
  edition_label: "Synthetic edition", attribution_text: "Synthetic attribution",
  license_kind: "owned", reviewer_name: "Synthetic reviewer", reviewed_at: "2026-01-01T00:00:00Z",
};
const hindiReading = {
  ...reading, release_id: "fe000020-0000-4000-8000-000000000002",
  rendering_id: "fe000010-0000-4000-8000-000000000010", language_code: "hi",
  body: "केवल नेटवर्क परीक्षण के लिए कृत्रिम हिन्दी पाठ।",
};
const circle = {
  cohort_id: cohortId, org_id: orgId, org_name: "Synthetic community",
  circle_name: "Morning circle", start_at: "2026-01-01T00:00:00Z",
  end_at: "2027-01-01T00:00:00Z", my_role: "teacher",
};
const createdCircle = { ...circle, cohort_id: createdId, circle_name: "New circle" };

test("connected mode signs in with a verified session, reads a circle and controls a release", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  let queue: Array<Record<string, unknown>> = [];
  let createCalls = 0;
  let scheduleCalls = 0;
  let withdrawCalls = 0;
  let clearCalls = 0;
  let progressUnavailable = false;
  let mark: { release_id: string; bookmarked_at: string | null; completed_at: string | null } = {
    release_id: releaseId, bookmarked_at: null, completed_at: null,
  };
  await page.addInitScript(({ user }) => {
    localStorage.setItem("spritual_alpha_real_auth", JSON.stringify({
      access_token: "synthetic.header.signature", refresh_token: "synthetic-refresh",
      token_type: "bearer", expires_in: 7200, expires_at: Math.floor(Date.now() / 1000) + 7200,
      user,
    }));
  }, { user });
  await page.route("http://127.0.0.1:54321/**", async route => {
    const url = new URL(route.request().url());
    const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "content-type": "application/json" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers, body: "" });
    if (url.pathname === "/auth/v1/user") return route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
    const rpc = url.pathname.split("/").at(-1);
    let response: unknown;
    switch (rpc) {
      case "fn_my_circles": response = createCalls ? [circle, createdCircle] : [circle]; break;
      case "fn_circle_readings": response = withdrawCalls ? [] : [route.request().postDataJSON()?.p_language === "hi" ? hindiReading : reading]; break;
      case "fn_my_circle_reading_progress":
        if (progressUnavailable) return route.fulfill({ status: 404, headers, body: JSON.stringify({ code: "PGRST202", message: "Fixture progress API temporarily unavailable" }) });
        response = withdrawCalls || (!mark.bookmarked_at && !mark.completed_at) ? [] : [{
        ...mark, cohort_id: cohortId, canonical_reference: reading.canonical_reference,
        work_title: reading.work_title, language_code: reading.language_code,
      }]; break;
      case "fn_set_circle_reading_mark": {
        if (withdrawCalls) return route.fulfill({ status: 403, headers, body: JSON.stringify({ code: "42501", message: "No current access" }) });
        const payload = route.request().postDataJSON();
        const field = payload?.p_kind === "bookmark" ? "bookmarked_at" : payload?.p_kind === "completed" ? "completed_at" : null;
        if (!field) return route.fulfill({ status: 400, headers, body: JSON.stringify({ code: "22023", message: "Invalid mark" }) });
        mark = { ...mark, [field]: payload.p_enabled ? "2026-09-26T07:00:00Z" : null };
        response = mark;
        break;
      }
      case "fn_clear_my_reading_progress": clearCalls += 1; mark = { release_id: releaseId, bookmarked_at: null, completed_at: null }; response = 1; break;
      case "fn_me": response = { authenticated: true, user_id: userId, memberships: [{ org_id: orgId, name: "Synthetic community", role: "teacher" }] }; break;
      case "fn_teacher_release_candidates": response = [{
        rendering_id: renderingId, canonical_id: "bg.2.47", canonical_reference: "Bhagavad Gita 2.47",
        work_slug: "bhagavad-gita", work_title: "Bhagavad Gita", content_kind: "canonical_text",
        language_code: "en", body: reading.body, access_class: "member", source_title: reading.source_title,
        source_url: reading.source_url, attribution_text: reading.attribution_text, reviewer_name: reading.reviewer_name,
      }]; break;
      case "fn_circle_delivery_queue": response = route.request().postDataJSON()?.p_cohort_id === createdId ? [] : queue; break;
      case "fn_create_circle": createCalls += 1; response = createdId; break;
      case "fn_schedule_circle_reading": scheduleCalls += 1; queue = [{
        release_id: releaseId, release_at: "2026-09-26T06:00:00Z", withdrawn_at: null,
        rendering_id: renderingId, canonical_reference: "Bhagavad Gita 2.47",
        language_code: "en", access_class: "member", ready_now: true,
      }]; response = releaseId; break;
      case "fn_withdraw_circle_reading": withdrawCalls += 1; queue = queue.map(item => ({ ...item, withdrawn_at: "2026-09-26T07:00:00Z" })); response = true; break;
      default: return route.fulfill({ status: 404, headers, body: JSON.stringify({ code: "PGRST202", message: "Unexpected fixture RPC" }) });
    }
    await route.fulfill({ status: 200, headers, body: JSON.stringify(response) });
  });

  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "One reading at a time." })).toBeVisible();
  await expect(page.getByText("CONNECTED MODE")).toBeVisible();
  await expect(page.getByRole("link", { name: /Teacher workspace/ })).toBeVisible();
  await expect(page.locator(".real-nav")).toHaveCount(0);
  await page.getByRole("link", { name: /Morning circle/ }).click();
  await expect(page.getByRole("heading", { name: "Morning circle" })).toBeVisible();
  await page.getByRole("link", { name: /Bhagavad Gita 2.47/ }).click();
  await expect(page.getByText(reading.body)).toBeVisible();
  await expect(page.getByText("Synthetic attribution")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save for later" })).toBeVisible();
  await page.getByRole("button", { name: "Save for later" }).click();
  await expect(page.getByText("Saved privately to your account.")).toBeVisible();
  await page.getByRole("button", { name: "Mark as read" }).click();
  await expect(page.getByText("Marked as read. This does not measure understanding.")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove saved mark" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Undo read mark" })).toBeVisible();
  await page.screenshot({ path: "test-results/real-reading-mobile.png", fullPage: true });
  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "Your saved readings" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Marked as read · Return whenever you like/ })).toBeVisible();
  await page.screenshot({ path: "test-results/real-home-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/real-home-320.png", fullPage: true });
  await page.getByRole("link", { name: /Marked as read · Return whenever you like/ }).click();
  await expect(page.getByText(reading.body)).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  progressUnavailable = true;
  await page.reload();
  await expect(page.getByText(reading.body)).toBeVisible();
  await expect(page.getByText("Reading marks are unavailable right now. You can still read this passage.")).toBeVisible();
  progressUnavailable = false;
  await page.locator(".real-reading-actions").getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("button", { name: "Remove saved mark" })).toBeVisible();

  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByRole("heading", { name: "पाठ उपलब्ध नहीं है।" })).toBeVisible();
  await expect(page.getByText(reading.body)).toHaveCount(0);
  await page.getByRole("link", { name: "उपलब्ध पाठ देखें" }).click();
  await page.getByRole("link", { name: /Bhagavad Gita 2.47/ }).click();
  await expect(page.getByText(hindiReading.body)).toBeVisible();
  await expect(page.getByRole("button", { name: "बाद के लिए सहेजें" })).toBeVisible();
  await page.reload();
  await expect(page.getByText(hindiReading.body)).toBeVisible();
  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "एक समय में एक पाठ।" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/real-home-hindi-mobile.png", fullPage: true });
  await page.setViewportSize({ width: 320, height: 720 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/real-home-hindi-320.png", fullPage: true });
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "One reading at a time." })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/alpha/teacher");
  await expect(page.getByRole("heading", { name: "Choose what reaches your circle." })).toBeVisible();
  await expect(page.getByText("Synthetic reviewed fixture for network testing only.")).toBeVisible();
  await page.getByRole("radio").check();
  await page.getByRole("button", { name: "Schedule selected reading" }).click();
  await expect(page.getByText("Reading scheduled. Member access is checked again at delivery time.")).toBeVisible();
  await expect(page.getByRole("list").getByText("Bhagavad Gita 2.47")).toBeVisible();
  await page.getByRole("button", { name: "Withdraw", exact: true }).click();
  await page.getByRole("button", { name: "Confirm withdrawal" }).click();
  await expect(page.getByText("Release withdrawn. It is no longer in the member feed.")).toBeVisible();
  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "Your saved readings" })).toBeVisible();
  await expect(page.getByText("Nothing saved yet.", { exact: false })).toBeVisible();
  await page.getByText("Your reading marks and privacy").click();
  await page.getByRole("button", { name: "Remove all my saved and read marks" }).click();
  await page.getByRole("button", { name: "Yes, remove all marks" }).click();
  await expect(page.getByText("Your saved and read marks were removed from this account.")).toBeVisible();
  await page.goto(`/alpha/circle/${cohortId}/reading/${releaseId}`);
  await expect(page.getByRole("heading", { name: "Reading unavailable." })).toBeVisible();
  await expect(page.getByText(reading.body)).toHaveCount(0);
  await page.goto("/alpha/teacher");
  await page.getByText("Create a circle").click();
  await page.getByLabel("Circle name").fill("New circle");
  const starts = new Date(Date.now() + 3600_000);
  const ends = new Date(Date.now() + 86400_000);
  await page.getByLabel("Starts").fill(starts.toISOString().slice(0, 16));
  await page.getByLabel("Ends").fill(ends.toISOString().slice(0, 16));
  await page.getByRole("button", { name: "Create circle" }).click();
  await expect(page.getByText("Circle created. Only invited members who claim a seat can see its released readings.")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Circle", exact: true })).toHaveValue(createdId);
  expect(createCalls).toBe(1);
  expect(scheduleCalls).toBe(1);
  expect(withdrawCalls).toBe(1);
  expect(clearCalls).toBe(1);
  expect(pageErrors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("connected mode does not expose demo identities to a signed-out visitor", async ({ page }) => {
  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "Continue with your teacher." })).toBeVisible();
  await expect(page.getByLabel("Email address")).toBeVisible();
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(page.getByRole("heading", { name: "अपने शिक्षक के साथ आगे बढ़ें।" })).toBeVisible();
  await expect(page.getByLabel("ईमेल पता")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "अपने शिक्षक के साथ आगे बढ़ें।" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByText("Demo workspace controls")).toHaveCount(0);
});

test("a signed-in member gets a circle but no teacher entry", async ({ page }) => {
  await page.addInitScript(({ user }) => {
    localStorage.setItem("spritual_alpha_real_auth", JSON.stringify({
      access_token: "synthetic.header.signature", refresh_token: "synthetic-refresh",
      token_type: "bearer", expires_in: 7200, expires_at: Math.floor(Date.now() / 1000) + 7200,
      user,
    }));
  }, { user });
  await page.route("http://127.0.0.1:54321/**", async route => {
    const url = new URL(route.request().url());
    const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "content-type": "application/json" };
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers, body: "" });
    if (url.pathname === "/auth/v1/user") return route.fulfill({ status: 200, headers, body: JSON.stringify(user) });
    const rpc = url.pathname.split("/").at(-1);
    const data = rpc === "fn_me" ? { authenticated: true, user_id: userId, memberships: [{ org_id: orgId, name: "Synthetic community", role: "member" }] }
      : rpc === "fn_my_circles" ? [{ ...circle, my_role: "member" }]
      : rpc === "fn_my_circle_reading_progress" || rpc === "fn_circle_readings" ? [] : null;
    await route.fulfill({ status: data === null ? 404 : 200, headers, body: JSON.stringify(data) });
  });
  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "One reading at a time." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Morning circle/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Teacher workspace/ })).toHaveCount(0);
  await expect(page.locator(".real-nav")).toHaveCount(0);
  await page.getByRole("link", { name: /Morning circle/ }).click();
  await expect(page.getByRole("heading", { name: "Nothing released in this language yet." })).toBeVisible();
});
