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
