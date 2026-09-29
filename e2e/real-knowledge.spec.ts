import { expect, test } from "@playwright/test";

test.skip(!process.env.SPIRITUAL_REAL_E2E, "Requires isolated real-mode build and synthetic network fixtures");
test.use({ viewport: { width: 390, height: 844 } });

const entityId = "ee000001-0000-4000-8000-000000000001";
const publishedEntity = {
  id: entityId, slug: "synthetic-shiva", entity_kind: "deity", display_name: "Synthetic Shiva entry",
  description: "Synthetic editorial text for UI testing only.", tradition_context: "Synthetic tradition",
  source_title: "Synthetic source", source_url: null, edition_label: "Synthetic edition",
  source_reference: "Synthetic 1.1", reviewer_name: "Synthetic reviewer", media_path: null, media_alt: null,
};
const headers = { "access-control-allow-origin": "*", "access-control-allow-headers": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS", "content-type": "application/json" };

test("connected knowledge shows only API content, recovers from failure, and keeps saves account-bound", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  let unavailable = false;
  await page.route("http://127.0.0.1:54321/**", async route => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers, body: "" });
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    if (unavailable) return route.fulfill({ status: 503, headers, body: JSON.stringify({ code: "PGRST000", message: "Fixture unavailable" }) });
    if (name === "fn_public_spiritual_entities") return route.fulfill({ status: 200, headers, body: JSON.stringify([publishedEntity]) });
    if (name === "fn_public_spiritual_entity") return route.fulfill({ status: 200, headers, body: JSON.stringify(publishedEntity) });
    if (name === "fn_public_spiritual_stories" || name === "fn_knowledge_catalogue") return route.fulfill({ status: 200, headers, body: "[]" });
    if (name === "fn_my_spiritual_saves" || name === "fn_set_spiritual_save") {
      return route.fulfill({ status: 403, headers, body: JSON.stringify({ code: "42501", message: "Sign in required" }) });
    }
    return route.fulfill({ status: 404, headers, body: JSON.stringify({ code: "PGRST202", message: "Unexpected fixture RPC" }) });
  });
  await page.goto("/alpha/library");
  await expect(page.getByRole("link", { name: /Synthetic Shiva entry/ })).toBeVisible();
  await page.getByRole("link", { name: /Synthetic Shiva entry/ }).click();
  await expect(page.getByRole("heading", { name: "Synthetic Shiva entry" })).toBeVisible();
  await expect(page.getByText("Synthetic reviewer")).toBeVisible();
  await page.screenshot({ path: "test-results/real-knowledge-detail-390.png", fullPage: true });
  await page.getByRole("button", { name: "Save for later" }).click();
  await expect(page.getByText("Sign in to save across devices.")).toBeVisible();
  await page.getByRole("link", { name: "Saved" }).click();
  await expect(page.getByRole("heading", { name: "Your saved readings" })).toBeVisible();
  await expect(page.getByText("Sign in to see readings saved to your account.")).toBeVisible();
  await page.screenshot({ path: "test-results/real-knowledge-saved-390.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  unavailable = true;
  await page.goto("/alpha/library");
  await expect(page.getByText(/knowledge service could not be checked/).first()).toBeVisible();
  await expect(page.getByText("Synthetic Shiva entry")).toHaveCount(0);
  unavailable = false;
  await page.getByRole("button", { name: "Try again" }).first().click();
  await expect(page.getByRole("link", { name: /Synthetic Shiva entry/ })).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("a guest finishes a published story, resumes the same scene, keeps an optional step locally, and previews a clean link", async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const story = {
    id: "ef000001-0000-4000-8000-000000000001", slug: "synthetic-story", story_kind: "original_retelling",
    title: "Synthetic two-part story", source_reference: "Synthetic source 1–2", source_title: "Synthetic source",
    source_url: null, edition_label: "Synthetic edition", reviewer_name: "Synthetic reviewer",
    scenes: [
      { sequence_no: 1, source_reference: "Part one · Synthetic 1", body: "Synthetic first part with a real ending later.", reflection: "A synthetic editorial question." },
      { sequence_no: 2, source_reference: "Part two · Synthetic 2", body: "Synthetic ending, complete for network testing.", reflection: null },
    ],
  };
  let withdrawn = false;
  const routeStory = async (route: import("@playwright/test").Route) => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers, body: "" });
    const name = new URL(route.request().url()).pathname.split("/").at(-1);
    if (name === "fn_public_spiritual_story") {
      const hindi = route.request().postDataJSON()?.p_language === "hi";
      const result = hindi ? { ...story, title: "कृत्रिम दो-भाग कथा", scenes: [
        { ...story.scenes[0], body: "कृत्रिम पहला भाग।", reflection: "कृत्रिम संपादकीय प्रश्न।" },
        { ...story.scenes[1], body: "कृत्रिम अंत।" },
      ] } : story;
      return route.fulfill({ status: 200, headers, body: JSON.stringify(withdrawn ? null : result) });
    }
    if (name === "fn_set_spiritual_save") return route.fulfill({ status: 403, headers, body: JSON.stringify({ code: "42501", message: "Sign in required" }) });
    return route.fulfill({ status: 404, headers, body: JSON.stringify({ code: "PGRST202", message: "Unexpected fixture RPC" }) });
  };
  await page.route("http://127.0.0.1:54321/**", routeStory);
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as typeof window & { __copied?: string }).__copied = value; } } }));
  await page.goto("/alpha/stories/synthetic-story");
  await expect(page.getByRole("heading", { name: story.title })).toBeVisible();
  await expect(page.getByText("Synthetic first part with a real ending later.")).toBeVisible();
  await expect(page.getByText("Synthetic ending, complete for network testing.")).toHaveCount(0);
  await expect(page.getByText("ORIGINAL RETELLING · NOT SOURCE TEXT")).toBeVisible();
  await page.screenshot({ path: "test-results/connected-story-opening-390.png", fullPage: true });
  await page.getByText("View source and review").click();
  await expect(page.getByText("Synthetic reviewer")).toBeVisible();
  await page.getByRole("button", { name: "Continue story" }).click();
  await expect(page.getByRole("heading", { name: "Part two · Synthetic 2" })).toBeFocused();
  await page.reload();
  await expect(page.getByText("Resumed at your last scene on this device.")).toBeVisible();
  await expect(page.getByText("Synthetic ending, complete for network testing.")).toBeVisible();
  await page.getByRole("button", { name: "Finish for now" }).click();
  await expect(page.getByText("Reading is enough. Any step below is optional and yours to choose.")).toBeVisible();
  await page.getByRole("textbox", { name: "One thing I might try" }).fill("Pause before one difficult reply");
  await page.getByRole("button", { name: "Keep this step on this device" }).click();
  await expect(page.getByText("Pause before one difficult reply", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Pause before one difficult reply", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "I tried it" }).click();
  await page.getByRole("button", { name: "Helpful", exact: true }).click();
  await expect(page.getByRole("button", { name: "Helpful", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Preview local story link" }).click();
  await expect(page.getByRole("heading", { name: "Preview the link" })).toBeVisible();
  await expect(page.locator(".rk-share-preview")).not.toContainText("Pause before one difficult reply");
  await page.getByRole("button", { name: "Copy link" }).click();
  expect(await page.evaluate(() => (window as typeof window & { __copied?: string }).__copied)).toBe("http://127.0.0.1:4183/alpha/stories/synthetic-story");
  await page.screenshot({ path: "test-results/connected-story-390.png", fullPage: true });
  for (const width of [768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/connected-story-${width}.png`, fullPage: true });
  }
  const fresh = await browser.newContext({ baseURL: "http://127.0.0.1:4183", viewport: { width: 320, height: 740 }, serviceWorkers: "block" });
  const recipient = await fresh.newPage();
  await recipient.route("http://127.0.0.1:54321/**", routeStory);
  await recipient.goto("/alpha/stories/synthetic-story?language=hi");
  await expect(recipient.getByRole("heading", { name: "कृत्रिम दो-भाग कथा" })).toBeVisible();
  await expect(recipient.getByText("कृत्रिम पहला भाग।")).toBeVisible();
  await expect(recipient.getByText("मूल पुनर्कथन · ग्रंथ का मूल पाठ नहीं")).toBeVisible();
  await expect(recipient.getByText("Pause before one difficult reply")).toHaveCount(0);
  expect(await recipient.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await recipient.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  expect(await recipient.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await fresh.close();
  withdrawn = true;
  await page.reload();
  await expect(page.getByText("This story is unavailable or no longer published.")).toBeVisible();
  await expect(page.getByText("Pause before one difficult reply")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a blocked device store never reports a private step as saved", async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key: string, value: string) {
      if (key.startsWith("spritual_story_session_v1_")) throw new DOMException("Storage blocked", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.route("http://127.0.0.1:54321/**", route => route.fulfill({ status: 200, headers, body: JSON.stringify({
    id: "ef000001-0000-4000-8000-000000000099", slug: "blocked-story", title: "Blocked storage story",
    story_kind: "original_retelling", source_reference: "Synthetic 1", source_title: "Synthetic source",
    source_url: null, edition_label: "Synthetic edition", reviewer_name: "Synthetic reviewer",
    scenes: [{ sequence_no: 1, source_reference: "Synthetic 1", body: "One complete synthetic scene.", reflection: null }],
  }) }));
  await page.goto("/alpha/stories/blocked-story");
  await page.getByRole("button", { name: "Finish for now" }).click();
  await page.getByRole("textbox", { name: "One thing I might try" }).fill("A private action");
  await page.getByRole("button", { name: "Keep this step on this device" }).click();
  await expect(page.getByRole("alert")).toContainText("This device could not keep that change");
  await expect(page.getByRole("textbox", { name: "One thing I might try" })).toHaveValue("A private action");
  await expect(page.locator(".rk-kept-step")).toHaveCount(0);
});

test("an unreadable saved place is not overwritten until the reader explicitly clears it", async ({ page }) => {
  const storyId = "ef000001-0000-4000-8000-000000000088";
  const key = `spritual_story_session_v1_guest_${storyId}`;
  await page.addInitScript(({ key }) => localStorage.setItem(key, "{corrupt"), { key });
  await page.route("http://127.0.0.1:54321/**", route => route.fulfill({ status: 200, headers, body: JSON.stringify({
    id: storyId, slug: "corrupt-story", title: "Corrupt state story", story_kind: "original_retelling",
    source_reference: "Synthetic 1", source_title: "Synthetic source", source_url: null,
    edition_label: "Synthetic edition", reviewer_name: "Synthetic reviewer",
    scenes: [
      { sequence_no: 1, source_reference: "Part one", body: "First synthetic scene.", reflection: null },
      { sequence_no: 2, source_reference: "Part two", body: "Second synthetic scene.", reflection: null },
    ],
  }) }));
  await page.goto("/alpha/stories/corrupt-story");
  await expect(page.getByText("An older saved place cannot be read.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Continue story" }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe("{corrupt");
  await page.getByRole("button", { name: "Start again on this device" }).click();
  await page.getByRole("button", { name: "Continue story" }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toContain('"scene":1');
});

test("account switching does not display another reader's device-only step", async ({ page }) => {
  const baseUser = { aud: "authenticated", role: "authenticated", created_at: "2026-01-01T00:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] }, user_metadata: {} };
  const first = { ...baseUser, id: "fe000002-0000-4000-8000-000000000011", email: "reader-a@example.test" };
  const second = { ...baseUser, id: "fe000002-0000-4000-8000-000000000012", email: "reader-b@example.test" };
  let current = first;
  const session = (person: typeof first) => ({ access_token: "synthetic.header.signature", refresh_token: "synthetic-refresh",
    token_type: "bearer", expires_in: 7200, expires_at: Math.floor(Date.now()/1000)+7200, user: person });
  await page.addInitScript(value => { if (!sessionStorage.getItem("account-test-seeded")) {
    localStorage.setItem("spritual_alpha_real_auth", JSON.stringify(value));
    sessionStorage.setItem("account-test-seeded", "1");
  } }, session(first));
  await page.route("http://127.0.0.1:54321/**", async route => {
    if (route.request().method() === "OPTIONS") return route.fulfill({ status: 204, headers, body: "" });
    const path = new URL(route.request().url()).pathname;
    if (path === "/auth/v1/user") return route.fulfill({ status: 200, headers, body: JSON.stringify(current) });
    if (path.endsWith("/fn_public_spiritual_story")) return route.fulfill({ status: 200, headers, body: JSON.stringify({
      id: "ef000001-0000-4000-8000-000000000042", slug: "account-story", title: "Account story",
      story_kind: "original_retelling", source_reference: "Synthetic 1", source_title: "Synthetic source",
      source_url: null, edition_label: "Synthetic edition", reviewer_name: "Synthetic reviewer",
      scenes: [{ sequence_no: 1, source_reference: "Synthetic 1", body: "One synthetic complete scene.", reflection: null }],
    }) });
    return route.fulfill({ status: 404, headers, body: JSON.stringify({ code: "PGRST202", message: "Unexpected fixture RPC" }) });
  });
  await page.goto("/alpha/stories/account-story");
  await page.getByRole("button", { name: "Finish for now" }).click();
  await page.getByRole("textbox", { name: "One thing I might try" }).fill("Reader A private step");
  await page.getByRole("button", { name: "Keep this step on this device" }).click();
  await expect(page.getByText("Reader A private step")).toBeVisible();
  current = second;
  await page.evaluate(value => localStorage.setItem("spritual_alpha_real_auth", JSON.stringify(value)), session(second));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Account story" })).toBeVisible();
  await expect(page.getByText("Reader A private step")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Finish for now" })).toBeVisible();
  await page.evaluate(() => localStorage.removeItem("spritual_alpha_real_auth"));
  await page.reload();
  await expect(page.getByText("Reader A private step")).toHaveCount(0);
});
