import { expect, test } from "@playwright/test";

test("Explore connects Divine, a source-linked story, private Saved and search on a narrow phone", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/alpha/library");
  await page.getByRole("link", { name: /Explore Divine/ }).click();
  await expect(page.getByRole("heading", { name: "Meet a story. Follow its source." })).toBeVisible();
  await page.getByRole("link", { name: /Hanuman.*Begin here/ }).click();
  await expect(page.getByRole("heading", { name: "Hanuman", exact: true })).toBeVisible();
  await page.getByRole("link", { name: /Read the story/ }).click();
  await expect(page.getByRole("heading", { name: "Across the water" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Vālmīki Rāmāyaṇa/ }).first()).toHaveAttribute("href", /sanskritdocuments\.org/);
  await page.getByRole("button", { name: "Save for later" }).click();
  await expect(page.getByRole("button", { name: "Saved · remove" })).toHaveAttribute("aria-pressed", "true");
  await page.goto("/alpha/my-day");
  await expect(page.getByRole("heading", { name: "Stories & entries" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Across the water/ })).toBeVisible();
  await page.getByRole("link", { name: "Explore Divine entries" }).click();
  await page.goto("/alpha/search");
  await page.getByLabel("Search", { exact: true }).fill("भगवद्गीता २.४७");
  await expect(page.getByRole("link", { name: /Bhagavad Gita 2.47/ })).toBeVisible();
  await page.getByLabel("Search", { exact: true }).fill("unavailable verse 99.99");
  await expect(page.getByRole("heading", { name: "No clear match here yet." })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  expect(errors).toEqual([]);
});

test("the graph respects Hindi, unsupported paths, storage reset and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/alpha/today");
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await page.goto("/alpha/divine/hanuman");
  await expect(page.getByRole("heading", { name: "हनुमान" })).toBeVisible();
  await page.getByRole("button", { name: "बाद के लिए सहेजें" }).click();
  await page.goto("/alpha/divine/unknown");
  await expect(page.getByRole("heading", { name: "यह प्रवेश उपलब्ध नहीं है।" })).toBeVisible();
  await page.goto("/alpha/my-day");
  await expect(page.getByRole("link", { name: /हनुमान/ })).toBeVisible();
  await page.goto("/alpha/settings");
  await page.getByRole("button", { name: "मेरा स्थानीय अल्फ़ा डेटा हटाएँ" }).first().click();
  await page.getByRole("button", { name: "मेरा स्थानीय अल्फ़ा डेटा हटाएँ" }).last().click();
  await page.goto("/alpha/my-day");
  await expect(page.getByRole("link", { name: /हनुमान/ })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
