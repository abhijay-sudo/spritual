import { expect, test, type Page } from "@playwright/test";

const consumerRoutes = [
  "/alpha/today",
  "/alpha/library",
  "/alpha/divine",
  "/alpha/divine/krishna",
  "/alpha/search",
  "/alpha/sources/bg.2.47",
  "/alpha/scriptures",
  "/alpha/scriptures/gita",
  "/alpha/practice",
  "/alpha/life",
  "/alpha/stories",
  "/alpha/stories/arjuna-bow",
  "/alpha/stories/hanuman-crossing",
  "/alpha/wisdom/gita-2-47",
  "/alpha/series/gita",
  "/alpha/episode/gita-2-47",
  "/alpha/my-day",
  "/alpha/reflection/general",
  "/alpha/settings",
] as const;

async function expectPopulated(page: Page, route: string) {
  await page.goto(route);
  await expect(page.locator("#alpha-main")).toBeVisible();
  await expect(page.locator(".alpha-route-loading")).toHaveCount(0);
  await expect.poll(async () => (await page.locator("#alpha-main").innerText()).trim().length).toBeGreaterThan(24);
  await expect(page.locator("#alpha-main h1, #alpha-main h2").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth), `${route} should not overflow`).toBeLessThanOrEqual(320);
}

test("every consumer route is populated at 320px and keeps fixture controls out of the journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of consumerRoutes) {
    await expectPopulated(page, route);
    if (route !== "/alpha/settings") await expect(page.getByText("Demo workspace controls", { exact: true })).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("returning journeys expose continuation, private follow-through and a bilingual recovery state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/alpha/today");
  await page.getByRole("link", { name: "Sit with this verse" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.goto("/alpha/library");
  await expect(page.getByText("CONTINUE WHERE YOU PAUSED")).toBeVisible();

  await page.goto("/alpha/life");
  await page.getByLabel("What is happening in your life?").fill("I keep worrying about the result of my work");
  await page.getByRole("button", { name: "Find a teaching" }).click();
  await expect(page.getByRole("heading", { name: "Keep the next step private and small." })).toBeVisible();
  await expect(page.getByText("Your question is not saved.")).toBeVisible();
  await expect(page.getByRole("link", { name: /Write a private reflection/ })).toBeVisible();

  await page.goto("/alpha/today");
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await page.goto("/alpha/this-route-does-not-exist");
  await expect(page.getByRole("heading", { name: "अपनी जगह फिर से खोजें।" })).toBeVisible();
  await expect(page.getByRole("link", { name: "आज पर जाएँ" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("legacy community routes disclose their simulation boundary", async ({ page }) => {
  await page.goto("/alpha/program");
  await expect(page.getByText("Local community simulation", { exact: true })).toBeVisible();
  await expect(page.getByText(/not a real account, payment or teacher service/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to the wisdom companion" })).toBeVisible();
  await expect(page.getByText("Demo workspace controls", { exact: true })).toBeVisible();
});
