import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const evidence = resolve(process.cwd(), 'artifacts/illustrated-edition/evidence');
test.beforeAll(async () => mkdir(evidence, { recursive: true }));

test('complete illustrated journey reaches the correct story, source map and finite ending', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Before the stories');
  await page.getByRole('link', { name: 'Hanuman’s path', exact: false }).click();
  await expect(page).toHaveURL(/\/journeys\/hanuman\/$/);
  await expect(page.locator('.journey-chapter')).toHaveCount(3);
  await page.getByRole('link', { name: /Hanuman’s first conversation/ }).click();
  await expect(page).toHaveURL(/\/read\/hanumans-first-conversation\/\?journey=hanuman$/);
  await expect(page.locator('[data-journey-choice="hanuman"]')).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-journey-next]')).toHaveAttribute('href', '/read/across-the-ocean/?journey=hanuman');
  await page.locator('[data-journey-next]').click();
  await expect(page).toHaveURL(/\/read\/across-the-ocean\/\?journey=hanuman$/);
  await expect(page.locator('.source-map-list li')).toHaveCount(2);
  await page.locator('[data-journey-next]').click();
  await expect(page).toHaveURL(/\/read\/a-ring-brings-hope\/\?journey=hanuman$/);
  await expect(page.locator('.source-map-list li')).toHaveCount(3);
  await expect(page.locator('[data-journey-next]')).toHaveCount(0);
  await expect(page.locator('[data-journey-end]')).toContainText('This journey is complete.');
  await expect(page.locator('[data-journey-end]')).toContainText('does not loop');
});

test('living manuscript hero, single navigation and theme controls remain truthful and usable', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('header nav[aria-label="Main navigation"]')).toHaveCount(1);
  for (const name of ['Yatra','Today','Quiet moment','Saved']) await expect(page.locator('.desktop-nav').getByRole('link',{name,exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Explore all 22 chapters'})).toHaveAttribute('href','#dharma-yatra');
  await expect(page.locator('.illuminated-today')).toContainText("TODAY'S ILLUMINATED STORY");
  await expect(page.locator('.illuminated-meta span')).toHaveCount(3);
  for (const removed of ['reviewer credentials are not supplied','This changes colours and artwork only—it does not filter stories','No audio, completion badge or reminder']) await expect(page.locator('body')).not.toContainText(removed);
  await page.locator('.theme-picker summary').click();
  await page.locator('.theme-picker').getByRole('link',{name:'Shiva',exact:true}).click();
  await expect(page.locator('html')).toHaveAttribute('data-world','shiva');
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--paper').trim())).toBe('#0F172A');
  await page.getByRole('button',{name:'Change text size'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-text-scale','large');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-text-scale','large');
});

test('the full abridged storyline continues through all twenty-two chapters and stops after the return', async ({ page }) => {
  const ids = [
    'what-makes-a-person-admirable','princes-and-teacher','knowing-how-to-stop','road-to-mithila','the-bow-at-mithila','promise-of-exile',
    'a-friend-beside-the-ganga','bharata-and-the-sandals','forest-torn-apart','shabaris-welcome','hanumans-first-conversation','alliance-and-vali',
    'search-to-southern-sea','across-the-ocean','through-lanka-at-night','a-ring-brings-hope','witness-returns','refuge-and-crossing',
    'war-and-its-cost','sita-speaks-after-victory','northward-home','returning-responsibility',
  ];
  await page.goto('/journeys/ramayana/');
  await expect(page.locator('.journey-chapter')).toHaveCount(ids.length);
  await page.locator(`a[href="/read/${ids[0]}/?journey=ramayana"]`).first().click();
  for (let index = 0; index < ids.length; index += 1) {
    await expect(page).toHaveURL(new RegExp(`/read/${ids[index]}/\\?journey=ramayana$`));
    await expect(page.locator('[data-journey-progress] small')).toHaveText(`${index + 1} / ${ids.length}`);
    await expect(page.locator('.reader-opening-art img')).toHaveJSProperty('complete', true);
    if (index < ids.length - 1) {
      await expect(page.locator('[data-journey-next]')).toHaveAttribute('href', `/read/${ids[index + 1]}/?journey=ramayana`);
      await page.locator('[data-journey-next]').click();
    }
  }
  await expect(page.locator('[data-journey-next]')).toHaveCount(0);
  await expect(page.locator('[data-journey-end]')).toContainText('does not loop');
});

test('bilingual alias search, save, language switch and exact journey resume work together', async ({ page }) => {
  await page.goto('/library/');
  for (const term of ['Maruti', 'हनुमान']) {
    await page.getByLabel('Search stories').fill(term);
    await expect(page.locator('[data-story-card]:visible')).toHaveCount(12);
  }
  await page.goto('/read/across-the-ocean/?journey=hanuman#scene-changing-shape');
  await page.locator('#scene-changing-shape').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  await page.mouse.wheel(0, 24);
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Save place' }).click();
  await page.locator('.reader-language a').click();
  await expect(page).toHaveURL(/\/hi\/read\/across-the-ocean\/\?journey=hanuman#scene-changing-shape$/);
  await page.goto('/hi/my-reading/');
  const resume = page.locator('#resume-list .reading-row').first();
  await expect(resume).toContainText('रूप बदलती शक्ति');
  await resume.getByRole('link', { name: 'जारी रखें' }).click();
  await expect(page).toHaveURL(/\/hi\/read\/across-the-ocean\/\?from=resume&journey=hanuman#block-shape-1$/);
  await expect(page.locator('[data-block-id="shape-1"]')).toBeInViewport();
});

test('rapid folio navigation is interruptible and reduced motion creates no veil', async ({ page }) => {
  await page.goto('/read/across-the-ocean/?journey=hanuman');
  await page.locator('#scene-the-edge .leaf-turn-forward').click();
  await page.locator('#scene-mainakas-offer .leaf-turn-forward').click();
  await expect(page).toHaveURL(/#scene-changing-shape$/);
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0, { timeout: 1200 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('#scene-changing-shape .leaf-turn-back').click();
  await expect(page).toHaveURL(/#scene-mainakas-offer$/);
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0);
});

test('denied and corrupt storage fail closed while Undo and multi-tab updates recover', async ({ browser }) => {
  const editionUrl=process.env.WEBSITE_URL||'http://127.0.0.1:4192';
  const context = await browser.newContext({ baseURL: editionUrl });
  const first = await context.newPage();
  const second = await context.newPage();
  await first.goto('/read/across-the-ocean/?journey=hanuman');
  await second.goto('/my-reading/');
  await first.getByRole('button', { name: 'Save place' }).click();
  await expect(second.locator('#bookmark-list .reading-row')).toHaveCount(1);
  await second.locator('#bookmark-list').getByRole('button', { name: 'Remove' }).click();
  await expect(second.locator('#reading-undo')).toBeVisible();
  await second.getByRole('button', { name: 'Undo' }).click();
  await expect(second.locator('#bookmark-list .reading-row')).toHaveCount(1);
  await second.evaluate(() => localStorage.setItem('spritual_reading_v2', '{broken'));
  await second.reload();
  await expect(second.locator('#reading-storage-warning')).toBeVisible();
  await context.close();

  const denied = await browser.newContext({ baseURL: editionUrl });
  await denied.addInitScript(() => Object.defineProperty(Storage.prototype, 'setItem', { configurable: true, value() { throw new DOMException('Denied', 'SecurityError'); } }));
  const page = await denied.newPage();
  await page.goto('/read/across-the-ocean/?journey=hanuman');
  await page.getByRole('button', { name: 'Save place' }).click();
  await expect(page.locator('#bookmark-place')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => localStorage.getItem('spritual_reading_v2'))).toBeNull();
  await denied.close();
});

test('all requested widths, themes, enlarged text and parallel reading remain bounded', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 900 : 1000 });
    await page.goto('/read/across-the-ocean/?journey=hanuman');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px overflow`).toBe(true);
    await expect(page.locator('h1')).toBeVisible();
    if (width === 320) {
      await page.getByRole('button', { name: 'Reading settings' }).click();
      await page.getByRole('button', { name: '28' }).click();
      await page.getByRole('button', { name: 'Close settings' }).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), '320px enlarged overflow').toBe(true);
    }
    if (width === 1440) {
      await page.getByRole('button', { name: 'Reading settings' }).click();
      await page.getByRole('button', { name: 'Dark' }).click();
      await page.locator('#parallel-toggle').click();
      await page.getByRole('button', { name: 'Close settings' }).click();
      await expect(page.locator('.story-reader')).toHaveClass(/is-parallel/);
      await expect(page.locator('.parallel-language').first()).toBeVisible();
    } else await expect(page.locator('#parallel-toggle')).not.toBeVisible();
    await page.screenshot({ path: resolve(evidence, `reader-${width}.png`), fullPage: true });
    if (width === 390) {
      await page.goto('/hi/read/promise-of-exile/?journey=ramayana');
      await expect(page.getByText('नया अध्याय · केवल स्थानीय समीक्षा')).toBeVisible();
      await page.screenshot({ path: resolve(evidence, 'reader-hi-exile-390.png'), fullPage: true });
    }
    if (width === 1440) {
      await page.goto('/read/sita-speaks-after-victory/?journey=ramayana');
      await expect(page.getByText('New chapter · local review only')).toBeVisible();
      await page.screenshot({ path: resolve(evidence, 'reader-sita-1440.png'), fullPage: true });
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('#arrival-title')).toHaveCSS('opacity','1');
  await page.screenshot({ path: resolve(evidence, 'home-1440.png'), fullPage: true });
});

test('every illustrated page asset loads successfully', async ({ page }) => {
  const failed: string[] = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  for (const path of ['/', '/library/', '/journeys/ramayana/', '/story/promise-of-exile/', '/read/sita-speaks-after-victory/?journey=ramayana', '/characters/vibhishana/', '/daily/', '/my-reading/', '/library/sources/']) await page.goto(path);
  expect(failed).toEqual([]);
});

test('every story reader renders at least one inspected narrative plate beyond its opener', async ({ page }) => {
  const storyIds = [
    'what-makes-a-person-admirable', 'knowing-how-to-stop', 'the-bow-at-mithila',
    'a-friend-beside-the-ganga', 'bharata-and-the-sandals', 'shabaris-welcome',
    'hanumans-first-conversation', 'across-the-ocean', 'a-ring-brings-hope',
    'returning-responsibility',
  ];
  for (const id of storyIds) {
    await page.goto(`/read/${id}/?journey=ramayana`);
    const plates = page.locator('.illustration-plate img');
    await expect(plates.first(), `${id} narrative plate`).toBeVisible();
    for (let index = 0; index < await plates.count(); index += 1) {
      const plate = plates.nth(index);
      await plate.scrollIntoViewIfNeeded();
      await expect.poll(() => plate.evaluate(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0), { message: `${id} plate ${index + 1} pixels` }).toBe(true);
    }
  }
});
