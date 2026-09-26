import { expect, test } from "@playwright/test";

test("changing duration cannot silently discard a paused quiet pause", async ({ page }) => {
  await page.goto("/alpha/practice");
  await page.getByRole("button", { name: "Begin pause" }).click();
  await expect.poll(() => page.locator(".practice-breath strong").innerText()).not.toBe("5:00");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const remaining = await page.locator(".practice-breath strong").innerText();

  await page.getByRole("button", { name: "5 min", exact: true }).click();
  await expect(page.locator(".practice-breath strong")).toHaveText(remaining);

  await page.getByRole("button", { name: "10 min", exact: true }).click();
  const confirmation = page.getByRole("group", { name: "Confirm duration change" });
  await expect(confirmation).toBeFocused();
  await expect(page.locator(".practice-breath strong")).toHaveText(remaining);
  await confirmation.getByRole("button", { name: "Keep current pause" }).click();
  await expect(page.locator(".practice-breath strong")).toHaveText(remaining);
  await expect(page.getByRole("button", { name: "5 min", exact: true })).toBeFocused();

  await page.getByRole("button", { name: "10 min", exact: true }).click();
  await confirmation.getByRole("button", { name: "Use 10 min" }).click();
  await expect(page.locator(".practice-breath strong")).toHaveText("10:00");
  await expect(page.getByText("Ready when you are")).toBeVisible();
  await expect(page.getByRole("button", { name: "Begin pause" })).toBeFocused();
});
