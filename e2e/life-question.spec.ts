import { expect, test } from "@playwright/test";

test("a private life question leads to a source and keeps the action clear on a narrow phone", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/alpha/life");

  const submit = page.getByRole("button", { name: "Find a teaching" });
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
  const bounds = await submit.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(740);

  await page.getByLabel("What is happening in your life?").fill("I keep worrying about the result of my work");
  await submit.click();
  await expect(page.getByRole("heading", { name: "Start with the source." })).toBeFocused();
  await expect(page.getByText("Bhagavad Gita 2.47")).toBeVisible();
  await expect(page.getByRole("link", { name: "Read this verse" })).toHaveAttribute("href", "/alpha/episode/gita-2-47?scene=1");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.getByLabel("What is happening in your life?").fill("quantum mango telescope");
  await submit.click();
  await expect(page.getByRole("heading", { name: "No clear source match yet." })).toBeFocused();
  await expect(page.getByRole("link", { name: "Browse the three available readings" })).toBeVisible();

  await page.getByRole("button", { name: "हिन्दी में पढ़ें" }).click();
  await page.getByRole("button", { name: /मेरा मन बार-बार भटकता है/ }).click();
  await expect(page.getByRole("heading", { name: "मूल श्लोक से शुरू करें।" })).toBeFocused();
  await expect(page.getByText("Bhagavad Gita 6.26")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);

  await page.getByRole("button", { name: "Switch to English" }).click();
  await page.getByLabel("What is happening in your life?").fill("I feel suicidal");
  await submit.click();
  await expect(page.getByRole("heading", { name: "Please seek immediate support." })).toBeFocused();
  const supportLink = page.getByRole("link", { name: "Call Tele-MANAS 14416 (India)" });
  await expect(supportLink).toHaveAttribute("href", "tel:14416");
  await expect(supportLink).toHaveCSS("color", "rgb(255, 253, 247)");
  await expect(page.locator(".life-source")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("a source visit returns to the in-memory question without retaining it after leaving", async ({ page }) => {
  const question = "I keep worrying about the result of my work";
  await page.goto("/alpha/life");
  await page.getByLabel("What is happening in your life?").fill(question);
  await page.getByRole("button", { name: "Find a teaching" }).click();
  await page.getByRole("link", { name: "Read this verse" }).click();
  await expect(page.getByRole("heading", { name: "Read it slowly." })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: "Start with the source." })).toBeFocused();
  await expect(page.getByLabel("What is happening in your life?")).toHaveValue(question);
  expect(page.url()).not.toContain(encodeURIComponent(question));
  expect(await page.evaluate(() => Object.values(localStorage).join(" "))).not.toContain(question);
  expect(await page.evaluate(() => Object.values(sessionStorage).join(" "))).not.toContain(question);

  await page.getByRole("link", { name: "Explore", exact: true }).click();
  await page.getByRole("navigation", { name: "Main navigation" }).getByRole("link", { name: "Ask" }).click();
  await expect(page.getByLabel("What is happening in your life?")).toHaveValue("");
  await expect(page.getByRole("heading", { name: "Start with the source." })).toHaveCount(0);

  await page.getByLabel("What is happening in your life?").fill(question);
  await page.getByRole("button", { name: "Find a teaching" }).click();
  await page.reload();
  await expect(page.getByLabel("What is happening in your life?")).toHaveValue("");

  await page.getByRole("button", { name: /I keep worrying about the result of my work/ }).click();
  await page.goto("/alpha/settings");
  await page.locator(".alpha-footer details").evaluate((details: HTMLDetailsElement) => { details.open = true; });
  await page.locator(".alpha-footer select").selectOption({ index: 1 });
  await page.goto("/alpha/life");
  await expect(page.getByLabel("What is happening in your life?")).toHaveValue("");
  await expect(page.getByRole("heading", { name: "Start with the source." })).toHaveCount(0);
});
