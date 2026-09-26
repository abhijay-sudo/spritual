import { expect, test } from "@playwright/test";

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const { viewport, content } = await page.evaluate(() => ({
    viewport: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(content, `document width ${content}px at viewport ${viewport}px`).toBeLessThanOrEqual(viewport);
}

test("a saved reading becomes a small step only after an explicit choice", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));

  await page.goto("/alpha/today");
  await expect(page.getByRole("heading", { name: "Begin here." })).toBeVisible();
  await page.getByRole("link", { name: "Sit with this verse" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("heading", { name: "Read it slowly." })).toBeFocused();
  await page.getByRole("button", { name: "Save this reading" }).click();
  await expect(page.getByText("Reading saved on this device. No practice is assumed.")).toBeVisible();

  await page.goto("/alpha/today");
  const returnLink = page.locator(".dev-continuity");
  await expect(returnLink).toContainText("SAVED READING");
  await expect(returnLink).not.toContainText("SMALL STEP");
  await expect(returnLink).toHaveAttribute("href", "/alpha/episode/gita-2-47?scene=1");
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: "Saved", exact: true }).click();
  await page.getByRole("button", { name: "Make this a small step" }).click();
  await page.getByLabel("Make space for this").selectOption("after-breakfast");
  await page.getByRole("link", { name: "Today", exact: true }).click();
  await expect(returnLink).toContainText("YOUR SMALL STEP");
  await expect(returnLink).toContainText("After breakfast");
  await expect(returnLink).toHaveAttribute("href", "/alpha/my-day");
  await expectNoHorizontalOverflow(page);

  await page.locator('.dev-language button[lang="hi"]').click();
  await expect(returnLink).toContainText("आपका छोटा कदम");
  await expect(returnLink).toContainText("नाश्ते के बाद");
  await expectNoHorizontalOverflow(page);
  await page.reload();
  await expect(returnLink).toContainText("आपका छोटा कदम");
  await expect(returnLink).toContainText("नाश्ते के बाद");
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("finishing a reading lets the member deliberately repeat or continue", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/alpha/today");
  await page.getByRole("link", { name: "Sit with this verse" }).click();
  const sourceCue = page.locator(".story-player-scene--0 .story-eyebrow");
  await expect(sourceCue).toContainText(/Gita 2\.47 · THE QUESTION/i);
  await expect(sourceCue).toHaveCSS("color", "rgb(246, 228, 189)");
  expect(await sourceCue.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(30);
  await page.getByRole("button", { name: "हिन्दी" }).click();
  await expect(sourceCue).toContainText("गीता 2.47 · सवाल");
  expect(await sourceCue.evaluate(element => element.getBoundingClientRect().height)).toBeLessThan(30);
  await page.getByRole("button", { name: "English" }).click();
  for (let step = 0; step < 3; step++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Finish reading" }).click();
  await expect(page.getByRole("group", { name: "Choose your next reading" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: /Stay with this passage/ }).click();
  await expect(page.locator(".dev-moment-meta")).toContainText("A PASSAGE YOU CHOSE");
  await expect(page.locator(".dev-moment")).toContainText("Gita 2.47");
  await page.reload();
  await expect(page.getByRole("link", { name: "Return to this verse" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: "Return to this verse" }).click();
  for (let step = 0; step < 3; step++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Finish reading" }).click();
  await page.getByRole("button", { name: /Continue to another/ }).click();
  await expect(page.locator(".dev-moment-meta")).toContainText("WHEN YOU ARE READY");
  await expect(page.locator(".dev-moment")).toContainText("Gita 2.48");
  await page.getByRole("link", { name: "Begin the next reading" }).click();
  await expect(page.getByRole("heading", { name: "When life changes course" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("a private thought opened from a reading returns to its final step", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/alpha/today");
  await page.getByRole("link", { name: "Sit with this verse" }).click();
  for (let step = 0; step < 3; step++) await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("link", { name: /Write a private thought/ }).click();

  await expect(page).toHaveURL(/\/alpha\/reflection\/gita-2-47\?from=reading$/);
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Back to reading" })).toBeVisible();
  await page.getByRole("textbox", { name: "My reflection" }).fill("A thought to revisit privately.");
  await page.getByRole("button", { name: "Save on this device" }).click();
  await page.getByRole("link", { name: "Return to reading" }).click();
  await expect(page).toHaveURL(/\/alpha\/episode\/gita-2-47\?scene=3$/);
  await expect(page.getByRole("button", { name: "Finish reading" })).toBeVisible();
  await page.getByRole("button", { name: "Finish reading" }).click();
  await expect(page.getByRole("heading", { name: "Let this be enough for now." })).toBeVisible();

  await page.getByRole("link", { name: "Open Saved" }).click();
  await page.locator(".calm-note-list").getByRole("link", { name: "One thing you can do" }).click();
  await expect(page.getByRole("textbox", { name: "My reflection" })).toHaveValue("A thought to revisit privately.");
  await expect(page.getByRole("link", { name: "Return to Saved" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("reader links remain visible when reached by keyboard above sticky controls", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    for (const language of ["en", "hi"] as const) {
      await page.goto("/alpha/episode/gita-2-47?scene=1");
      if (language === "hi") await page.getByRole("button", { name: "हिन्दी" }).click();
      const source = page.locator(".story-verse-tools a");
      await page.locator(".story-text-button").focus();
      await page.keyboard.press("Tab");
      await expect(source).toBeFocused();
      await expect.poll(() => source.evaluate(element => {
        const footer = document.querySelector(".story-player-controls")!.getBoundingClientRect();
        return Math.round(footer.top - element.getBoundingClientRect().bottom);
      })).toBeGreaterThanOrEqual(12);

      await page.goto("/alpha/episode/gita-2-47?scene=3");
      const note = page.locator(".story-reflect-link");
      await page.locator(".story-action-scene h1").focus();
      await page.keyboard.press("Tab");
      await expect(note).toBeFocused();
      await expect.poll(() => note.evaluate(element => {
        const footer = document.querySelector(".story-player-controls")!.getBoundingClientRect();
        return Math.round(footer.top - element.getBoundingClientRect().bottom);
      })).toBeGreaterThanOrEqual(12);
      await expectNoHorizontalOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("the private writing field stays unobscured at phone widths", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/alpha/reflection/gita-2-47?from=reading");
    await expect(page.getByRole("link", { name: "Back to reading" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
    const visibleEditorHit = await page.getByRole("textbox", { name: "My reflection" }).evaluate(editor => {
      const bounds = editor.getBoundingClientRect();
      const y = (Math.max(bounds.top + 8, 0) + Math.min(bounds.bottom - 8, window.innerHeight - 8)) / 2;
      return document.elementFromPoint(bounds.left + bounds.width / 2, y) === editor;
    });
    expect(visibleEditorHit, `writing field should be touchable at ${width}px`).toBe(true);
    await expectNoHorizontalOverflow(page);
  }
});

test("private reflection deletion keeps keyboard focus inside the choice and returns it safely", async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.goto("/alpha/reflection/gita-2-47?from=reading");
    const editor = page.getByRole("textbox", { name: "My reflection" });
    await editor.fill("A private thought for this isolated test.");
    await page.getByRole("button", { name: "Save on this device" }).click();

    const trigger = page.getByRole("button", { name: "Delete this reflection" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    const confirmation = page.getByRole("group", { name: "Delete this saved reflection and its draft from this device?" });
    await expect(confirmation).toBeVisible();
    await expect(confirmation.getByRole("button", { name: "Keep it" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(confirmation).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(editor).toHaveValue("A private thought for this isolated test.");

    await page.keyboard.press("Enter");
    await expect(confirmation.getByRole("button", { name: "Keep it" })).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(confirmation.getByRole("button", { name: "Delete reflection" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(confirmation).toHaveCount(0);
    await expect(editor).toBeFocused();
    await expect(editor).toHaveValue("");
    await expect(page.getByRole("status").filter({ hasText: "Reflection deleted." })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("the four primary destinations remain usable at narrow phone widths", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const destinations = [
    { path: "/alpha/today", heading: "Begin here." },
    { path: "/alpha/library", heading: "Follow what matters." },
    { path: "/alpha/practice", heading: "A little room to practise." },
    { path: "/alpha/my-day", heading: "What you chose to keep." },
  ];
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    for (const destination of destinations) {
      await page.goto(destination.path);
      await expect(page.getByRole("heading", { level: 1, name: destination.heading })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  }
  expect(errors).toEqual([]);
});

test("Hindi, larger text, night appearance, and reduced motion survive the reading journey", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/alpha/settings");
  await page.getByRole("radio", { name: "Night" }).check();
  await page.getByRole("checkbox", { name: "Larger text" }).check();
  await page.getByRole("checkbox", { name: "Reduce motion" }).check();
  await page.getByRole("link", { name: "Today", exact: true }).click();
  await page.locator('.dev-language button[lang="hi"]').click();
  await expect(page.getByRole("heading", { name: "यहीं से शुरू करें।" })).toBeVisible();
  await expect(page.locator(".alpha")).toHaveAttribute("data-appearance", "night");
  await expect(page.locator(".alpha")).toHaveAttribute("data-large", "true");
  await expect(page.locator(".alpha")).toHaveAttribute("data-reduced", "true");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("link", { name: /इस श्लोक के साथ ठहरें/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: /आगे बढ़ें/ }).click();
  await expect(page.locator("blockquote[lang='sa-Deva']")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.reload();
  await expect(page.locator(".alpha")).toHaveAttribute("data-appearance", "night");
  await expect(page.locator(".alpha")).toHaveAttribute("data-large", "true");
  await expect(page.locator(".alpha")).toHaveAttribute("data-reduced", "true");
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test.describe("offline reading", () => {
  test.use({ serviceWorkers: "allow" });

  test("a bookmarked passage remains readable after the network drops", async ({ page, context }) => {
    await page.goto("/alpha/today");
    await page.getByRole("link", { name: "Sit with this verse" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Save this reading" }).click();

    await expect.poll(() => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

    await context.setOffline(true);
    await page.goto("/alpha/today");
    await expect(page.getByText("You’re offline. Local readings and notes remain available; external sources need internet.")).toBeVisible();
    await page.locator(".dev-continuity").click();
    await expect(page.getByRole("heading", { name: "Read it slowly." })).toBeVisible();
    await expect(page.locator("blockquote[lang='sa-Deva']")).toContainText("कर्मण्येवाधिकारस्ते");
  });
});

test("the optional practice keeps a count and asks before replacing it", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/alpha/practice");
  const count = page.getByRole("button", { name: /^Count one repetition/ });
  await count.click();
  await count.click();
  await expect(page.getByRole("progressbar", { name: "Repetitions counted" })).toHaveAttribute("aria-valuenow", "2");
  await page.reload();
  await expect(page.getByRole("progressbar", { name: "Repetitions counted" })).toHaveAttribute("aria-valuenow", "2");
  await page.getByRole("button", { name: "Start a new round" }).click();
  await expect(page.getByRole("group", { name: "Confirm counter reset" })).toBeVisible();
  await page.getByRole("button", { name: "Keep this count" }).click();
  await expect(page.getByRole("progressbar", { name: "Repetitions counted" })).toHaveAttribute("aria-valuenow", "2");
  await page.getByRole("button", { name: "Start a new round" }).click();
  await page.getByRole("button", { name: "Reset count" }).click();
  await expect(page.getByRole("progressbar", { name: "Repetitions counted" })).toHaveAttribute("aria-valuenow", "0");

  await page.getByRole("button", { name: "10 min" }).click();
  await page.getByRole("button", { name: "Begin pause" }).click();
  await expect(page.getByRole("button", { name: "10 min" })).toBeDisabled();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(page.getByText("Paused", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Reset timer" }).first().click();
  await page.getByRole("button", { name: "Keep the pause" }).click();
  await expect(page.getByText("Paused", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Reset timer" }).first().click();
  await page.getByRole("group", { name: "Confirm timer reset" }).getByRole("button", { name: "Reset timer" }).click();
  await expect(page.getByText("Ready when you are")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test("the local delivery workspace keeps author and reviewer actions separate", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/alpha/teacher");
  await expect(page.getByRole("heading", { name: "This area is for delivery staff" })).toBeVisible();
  await page.getByText("Demo workspace controls").click();
  const identity = page.getByLabel("Demonstration identity");
  await identity.selectOption("demo-teacher");
  await expect(page.getByRole("heading", { name: "A thoughtful practice, carefully delivered." })).toBeVisible();

  const title = "Notice a small pause";
  await page.getByLabel("Lesson title").fill(title);
  await page.getByLabel("Purpose for the member").fill("A brief original pause before the day begins.");
  await page.getByLabel("Practice transcript").fill("Sit comfortably. Notice one breath. Continue when you are ready.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const lesson = page.getByRole("article").filter({ hasText: title });
  await expect(lesson).toContainText("draft");
  await expect(lesson.getByRole("button", { name: "Send for review" })).toBeDisabled();

  await lesson.getByLabel("Language").fill("English");
  await lesson.getByLabel("Permitted territory").fill("India");
  await lesson.getByLabel("Permission expires").fill(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16));
  await lesson.getByRole("checkbox").check();
  await lesson.getByRole("button", { name: "Save permission record" }).click();
  await lesson.getByRole("button", { name: "Send for review" }).click();
  await expect(lesson).toContainText("awaiting review");
  await expect(lesson.getByRole("button", { name: "Record demo review approval" })).toHaveCount(0);

  await identity.selectOption("demo-reviewer");
  await lesson.getByRole("button", { name: "Record demo review approval" }).click();
  await expect(lesson).toContainText("approved");
  await identity.selectOption("demo-teacher");
  await lesson.getByLabel("Release to cohort").selectOption("demo-cohort");
  await lesson.getByLabel("Release date and time").fill(new Date(Date.now() - 3600000).toISOString().slice(0, 16));
  await lesson.getByRole("button", { name: "Publish to cohort" }).click();
  await expect(lesson).toContainText("published");
  await lesson.getByRole("button", { name: "Withdraw lesson" }).click();
  await expect(lesson).toContainText("withdrawn");
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});
