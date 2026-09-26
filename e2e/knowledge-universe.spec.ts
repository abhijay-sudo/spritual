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
  await page.getByRole("link", { name: /Vālmīki Rāmāyaṇa/ }).first().click();
  await expect(page.getByRole("heading", { name: "Vālmīki Rāmāyaṇa" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open original source/ })).toHaveAttribute("href", /sanskritdocuments\.org/);
  await expect(page.getByText("Not established").first()).toBeVisible();
  await page.getByRole("link", { name: /Back to reading/ }).click();
  await expect(page.getByRole("heading", { name: "Across the water" })).toBeVisible();
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

test("Life gives an honest non-Gita source pointer and preserves the question on return", async ({ page }) => {
  await page.goto("/alpha/life");
  await page.getByLabel("What is happening in your life?").fill("Where can I read about Shiva and Rudra?");
  await page.getByRole("button", { name: /Find a teaching/ }).click();
  await expect(page.getByText("SOURCE POINTER · NOT AN ANSWER")).toBeVisible();
  await expect(page.getByRole("heading", { name: "A source to inspect." })).toBeVisible();
  await page.getByRole("link", { name: /Śvetāśvatara Upaniṣad/ }).click();
  await expect(page.getByRole("heading", { name: "Śvetāśvatara Upaniṣad" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Open original source/ })).toHaveAttribute("href", /sanskritdocuments\.org/);
  await page.getByRole("link", { name: /Back to reading/ }).click();
  await expect(page.getByLabel("What is happening in your life?")).toHaveValue("Where can I read about Shiva and Rudra?");
  await expect(page.getByText("SOURCE POINTER · NOT AN ANSWER")).toBeVisible();
});

test("Scripture browsing distinguishes available Gita verses from external-only works", async ({ page }) => {
  await page.goto("/alpha/library");
  await page.getByRole("link", { name: /See all source-linked works/ }).click();
  await expect(page.getByRole("heading", { name: "Read what is here." })).toBeVisible();
  await page.getByRole("link", { name: /Bhagavad Gita.*Explore this work/ }).click();
  await expect(page.getByRole("heading", { name: "Bhagavad Gita" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Bhagavad Gita 2.47 Original/ })).toBeVisible();
  await page.getByRole("link", { name: /Bhagavad Gita 2.47 Original/ }).click();
  await expect(page.getByText("Bhagavad Gita 2.47").first()).toBeVisible();
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.getByRole("link", { name: "Close reading" }).click();
  await expect(page.getByRole("heading", { name: "Bhagavad Gita" })).toBeVisible();
  await page.goto("/alpha/scriptures/ramayana");
  await expect(page.getByText("no local scripture text", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Across the water/ })).toBeVisible();
  await page.getByRole("link", { name: /Vālmīki Rāmāyaṇa/ }).click();
  await expect(page.getByRole("heading", { name: "Vālmīki Rāmāyaṇa" })).toBeVisible();
  await page.getByRole("link", { name: /Back to reading/ }).click();
  await expect(page.getByRole("heading", { name: "Vālmīki Rāmāyaṇa" })).toBeVisible();
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
