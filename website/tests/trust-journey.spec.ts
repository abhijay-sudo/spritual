import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

for (const language of ['en', 'hi'] as const) {
  test(`${language} collection contents continue into the matching sourced book`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#journey');
    await page.locator('[data-volume="krishna"] .volume-link').click();
    await expect(page).toHaveURL(/\/books\/krishna\/$/);
    if(language==='hi')await page.locator('.language-link').click();
    const primary = page.locator('#chapters .collection-chapter');
    await expect(primary).toHaveCount(1);
    const destination = `${language === 'hi' ? '/hi' : ''}/books/read/krishna-mountain/`;
    await expect(primary).toHaveAttribute('href', destination);
    await primary.click();
    await expect(page).toHaveURL(new RegExp(`${destination}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
    await page.locator('.source-trigger').click();
    await expect(page.locator('#edition-note')).toHaveAttribute('open', '');
    expect(await page.locator('#edition-note a').count()).toBeGreaterThan(0);
    expect(errors).toEqual([]);
  });

  test(`${language} privacy controls return to the actual kept book page`, async ({ page }) => {
    const prefix = language === 'hi' ? '/hi' : '';
    await page.goto(`${prefix}/books/read/a-ring-brings-hope/`);
    await page.locator('[data-leaf-step="1"]').click();
    const folio = await page.locator('[data-folio]:visible').getAttribute('id');
    await page.locator('[data-keep]').click();
    await expect(page.locator('[data-storage-status]')).toContainText(language === 'hi' ? 'इसी ब्राउज़र' : 'this browser');
    await page.goto(`${prefix}/privacy/`);
    const manager = page.getByRole('link', { name: language === 'hi' ? 'आपके सहेजे पृष्ठ खोलें' : 'Open your kept pages', exact: true });
    await expect(manager).toHaveAttribute('href', `${prefix}/books/#kept`);
    await manager.click();
    const saved = page.locator('[data-kept-list] a');
    await expect(saved).toHaveCount(1);
    await expect(saved).toHaveAttribute('href', `${prefix}/books/read/a-ring-brings-hope/#${folio}`);
    await saved.click();
    await expect(page.locator('html')).toHaveClass(/book-enhanced/);
    await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id', folio!);
  });
}

test('app availability offers real reading without presenting an unconfigured download', async ({ page }) => {
  await page.goto('/');
  await page.locator('.header-cta').click();
  const availability = page.locator('#launch-dialog');
  await expect(availability).toBeVisible();
  await expect(page.locator('#dialog-description')).toContainText('coming soon');
  await expect(availability.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]')).toHaveCount(0);
  await availability.getByRole('link', { name: 'Explore the bookshelf', exact: true }).click();
  await expect(page).toHaveURL(/\/books\/$/);
  await expect(page.locator('[data-volume] .volume-link').first()).toBeVisible();
});

test('homepage exposes reading provenance, privacy and public correction guidance', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-about]').click();
  const about = page.locator('#about-dialog');
  await expect(about).toContainText('keep a page to return to in this browser');
  await expect(about).toContainText('Valmiki Ramayana and Bhagavata Purana');
  await expect(about.locator('a.source-link')).toHaveAttribute('rel', /noopener/);
  await page.keyboard.press('Escape');
  await page.locator('.site-footer').getByRole('link', { name: 'Privacy', exact: true }).click();
  await expect(page).toHaveURL(/\/privacy\/$/);
  await expect(page.locator('main')).toContainText('Reloading the page clears that sample save.');
  await page.goto('/');
  await page.locator('.site-footer').getByRole('link', { name: 'Suggest a correction', exact: true }).click();
  await expect(page).toHaveURL(/\/corrections\/$/);
  await expect(page.locator('main')).toContainText('your report will be public');
});


test('source access survives an early click before the reader module is ready', async ({page}) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/books/book.js', async route => {
    await gate;
    await route.continue().catch(() => {});
  });
  try {
    await page.goto('/books/read/krishna-mountain/', {waitUntil: 'commit'});
    await page.locator('.source-trigger').click();
    await expect(page).toHaveURL(/#edition-note$/);
    await expect(page.locator('#edition-note')).toHaveAttribute('open', '');
    await expect(page.locator('#edition-note a').first()).toBeVisible();
    release();
    await expect(page.locator('html')).toHaveClass(/book-enhanced/);
    await expect(page.locator('#edition-note')).toHaveAttribute('open', '');
    await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  } finally { release(); }
});
