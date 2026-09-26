import { expect, test } from "@playwright/test";

test("first launch reaches a source-linked reading without sign-in and returns to Today", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page).toHaveURL(/\/alpha\/welcome$/);
  await expect(page.getByRole("heading", { name: /Meet the teaching/ })).toBeVisible();
  await expect(page.getByText(/No account needed/)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
  await page.getByRole("link", { name: "Begin with a verse" }).click();
  await expect(page).toHaveURL(/\/alpha\/episode\/gita-2-47$/);
  await expect(page.getByRole("heading", { name: "When the result is uncertain" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator("blockquote[lang='sa-Deva']")).toContainText("कर्मण्येवाधिकारस्ते");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("MEANING · UNREVIEWED DEMO")).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("link", { name: /Write a private thought/ })).toBeVisible();
  await page.getByRole("button", { name: "Finish reading" }).click();
  await page.getByRole("link", { name: /Return to Today without choosing/ }).click();
  await expect(page.getByRole("heading", { name: "Begin here." })).toBeVisible();
  await page.goto("/");
  await expect(page).toHaveURL(/\/alpha\/today$/);
  await expect(page.getByRole("heading", { name: "Begin here." })).toBeVisible();
  expect(errors).toEqual([]);
});
