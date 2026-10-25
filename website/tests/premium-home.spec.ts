import { test, expect, type Page, type Locator } from '@playwright/test';

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 40; step++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate(element => element === document.activeElement)) return;
  }
  await expect(target, 'The intended action must be reachable with Tab').toBeFocused();
}

test('keyboard discovery reaches a real book and preserves dialog focus recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const primary = page.getByRole('link', { name: 'Find your story', exact: true });
  await tabTo(page, primary);
  await expect(primary).toBeFocused();
  const focus = await primary.evaluate(element => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect(focus.style).not.toBe('none');
  expect(focus.width).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#journey$/);
  const story = page.locator('[data-open-story]').first();
  await tabTo(page, story);
  await page.keyboard.press('Enter');
  await expect(page.locator('#story-dialog')).toBeVisible();
  await expect(page.locator('#story-dialog-title')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(story).toBeFocused();
  await page.keyboard.press('Enter');
  const book = page.locator('[data-open-book]');
  await expect(book).toHaveAttribute('href', /^\/books\/read\/[a-z0-9-]+\/$/);
  const destination = await book.getAttribute('href');
  await tabTo(page, book);
  await page.keyboard.press('Enter');
  await expect.poll(() => new URL(page.url()).pathname).toBe(destination);
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('h1')).not.toBeEmpty();
});

test.describe('progressive enhancement', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

  test('JavaScript-free visitors can use the invitation and enter the published bookshelf', async ({ page }) => {
    await test.step('Follow the native story invitation', async () => {
      await page.goto('/');
      await expect(page.locator('h1')).toHaveText('Stories worth slowing down for.');
      await page.getByRole('link', { name: 'Find your story', exact: true }).click();
      await expect(page).toHaveURL(/#journey$/);
    });
    await test.step('Enter the real bookshelf', async () => {
      const bookshelf = page.locator('a[href="/books/"]:visible').first();
      await expect(bookshelf).toBeVisible();
      await bookshelf.click();
      await expect(page).toHaveURL(/\/books\/$/);
    });
    await test.step('Open and read a published chapter', async () => {
      const firstBook = page.locator('[data-book-entry] > a').first();
      await expect(firstBook).toBeVisible();
      await firstBook.click();
      await expect(page.locator('[data-folio]:visible').first()).toBeVisible();
      await expect(page.locator('h1')).not.toBeEmpty();
    });
  });
});

test('native desktop scrolling moves the painted scene without delaying navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  // Wait for the opening to start, then finish; a hidden pre-decode dialog is not handover.
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await expect(page.locator('#welcome-intro')).not.toBeVisible({ timeout: 4500 });
  const gallery = page.locator('.hero-gallery');
  const progress = () => gallery.evaluate(element => getComputedStyle(element).getPropertyValue('--scene-progress').trim());
  await expect.poll(progress).toMatch(/^\d*\.?\d+$/);
  const initial = Number(await progress());
  await page.mouse.wheel(0, 360);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(async () => Number(await progress())).not.toBe(initial);
  await page.getByRole('link', { name: 'Find your story', exact: true }).click();
  await expect(page).toHaveURL(/#journey$/);
  await expect(page.locator('#journey')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('reduced motion cancels ambient motion while stories and actions remain available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.mouse.wheel(0, 240);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.getByRole('link', { name: 'Find your story', exact: true }).click();
  await page.locator('[data-open-story]').first().click();
  await expect(page.locator('#story-dialog')).toBeVisible();
  await page.locator('[data-story-language="hi"]').click();
  await expect(page.locator('#story-prose')).toHaveAttribute('lang', 'hi');
  await expect(page.locator('.motion-ghost')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});

test('touch discovery remains within the phone viewport through story and availability dialogs', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
    baseURL: process.env.WEBSITE_URL || 'http://127.0.0.1:4190',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Find your story', exact: true }).tap();
    await expect(page.locator('#journey')).toBeInViewport();
    await page.locator('[data-open-story]').first().tap();
    await expect(page.locator('#story-dialog')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-story-download]').tap();
    await expect(page.locator('#launch-dialog')).toBeVisible();
    await expect(page.locator('#dialog-description')).toContainText('coming soon');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  } finally {
    await context.close();
  }
});
