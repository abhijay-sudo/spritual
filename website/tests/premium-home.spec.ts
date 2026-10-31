import { test, expect, type Page, type Locator } from '@playwright/test';

async function tabTo(page: Page, target: Locator) {
  for (let step = 0; step < 40; step++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate(element => element === document.activeElement)) return;
  }
  await expect(target, 'The intended action must be reachable with Tab').toBeFocused();
}

const ramayanaChapters=(page:Page)=>page.locator('#chapters.collection-chapters>li>a, #chapters>.collection-chapters>li>a, #chapters .collection-part .collection-chapters>li>a');

test('keyboard discovery reaches chapter contents and real reading; availability preserves focus recovery', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const primary = page.getByRole('link', { name: 'Choose your book', exact: true });
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
  const volume = page.locator('[data-volume="ramayana"] .volume-link');
  await tabTo(page, volume);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/books\/ramayana\/(?:#chapters)?$/);
  const chapter=ramayanaChapters(page).first();
  const destination=await chapter.getAttribute('href');
  await tabTo(page,chapter);
  await page.keyboard.press('Enter');
  await expect.poll(() => new URL(page.url()).pathname).toBe(destination);
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('h1')).not.toBeEmpty();
  await page.goto('/');
  const availability=page.locator('.header-cta[data-launch]');
  await tabTo(page,availability);
  await page.keyboard.press('Enter');
  await expect(page.locator('#launch-dialog')).toBeVisible();
  await expect(page.locator('#dialog-description')).toContainText('coming soon');
  await page.keyboard.press('Escape');
  await expect(availability).toBeFocused();
});

test.describe('progressive enhancement', () => {
  test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  test('JavaScript-free visitors can use the invitation, bookshelf and chapter contents', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Stories worth slowing down for.');
    await page.getByRole('link', { name: 'Choose your book', exact: true }).click();
    await expect(page).toHaveURL(/#journey$/);
    const bookshelf = page.locator('a[href="/books/"]:visible').first();
    await expect(bookshelf).toBeVisible();
    await bookshelf.click();
    await expect(page).toHaveURL(/\/books\/$/);
    await page.locator('[data-volume="ramayana"] .volume-link').click();
    await expect(page).toHaveURL(/\/books\/ramayana\/(?:#chapters)?$/);
    await ramayanaChapters(page).first().click();
    await expect(page.locator('[data-folio]:visible').first()).toBeVisible();
    await expect(page.locator('h1')).not.toBeEmpty();
  });
});

test('native desktop scrolling moves the painted scene without delaying navigation', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await expect(page.locator('#welcome-intro')).not.toBeVisible({ timeout: 4500 });
  const gallery = page.locator('.hero-gallery');
  const progress = () => gallery.evaluate(element => getComputedStyle(element).getPropertyValue('--scene-progress').trim());
  await expect.poll(progress).toMatch(/^\d*\.?\d+$/);
  const initial = Number(await progress());
  await page.mouse.wheel(0, 360);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  await expect.poll(async () => Number(await progress())).not.toBe(initial);
  await page.getByRole('link', { name: 'Choose your book', exact: true }).click();
  await expect(page).toHaveURL(/#journey$/);
  await expect(page.locator('#journey')).toBeInViewport();
  expect(errors).toEqual([]);
});

test('reduced motion cancels ambient motion while bilingual chapters remain available', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.mouse.wheel(0, 240);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
  await page.getByRole('link', { name: 'Choose your book', exact: true }).click();
  await page.locator('[data-volume="krishna"] .volume-link').click();
  await expect(page).toHaveURL(/\/books\/krishna\/$/);
  await page.locator('.language-link').click();
  await expect(page.locator('html')).toHaveAttribute('lang','hi');
  await page.locator('.collection-chapter').click();
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('.motion-ghost')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0);
});

test('touch discovery fits the phone through collection reading and honest availability', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },hasTouch: true,isMobile: true,reducedMotion: 'reduce',
    baseURL: process.env.WEBSITE_URL || 'http://127.0.0.1:4190',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('link', { name: 'Choose your book', exact: true }).tap();
    await expect(page.locator('#journey')).toBeInViewport();
    await page.locator('[data-volume="shiva"] .volume-link').tap();
    await expect(page.locator('.collection-chapter')).toHaveCount(1);
    await page.locator('.collection-chapter').tap();
    await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.goto('/#get-app');
    await page.locator('#get-app [data-launch]').tap();
    await expect(page.locator('#launch-dialog')).toBeVisible();
    await expect(page.locator('#dialog-description')).toContainText('coming soon');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('#launch-dialog a[href="/books/"]').tap();
    await expect(page).toHaveURL(/\/books\/$/);
  } finally {await context.close();}
});
