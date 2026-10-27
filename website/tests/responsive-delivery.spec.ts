import {test, expect, type Locator} from '@playwright/test';

test.use({reducedMotion: 'reduce', viewport: {width: 390, height: 844}});
async function imageReady(image: Locator) {
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
}

test('the hero loads immediately while distant collection paintings and the phone wait', async ({page}) => {
  const requested: string[] = [];
  page.on('request', request => {if (request.resourceType() === 'image') requested.push(request.url());});
  await page.goto('/');
  const hero = page.locator('.invitation-painting img');
  await imageReady(hero);
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).not.toHaveAttribute('data-deferred-src');
  const farCard = page.locator('[data-volume="dhruva"] .volume-cover > img');
  await expect(farCard).toHaveAttribute('data-image-state', 'waiting');
  expect(await farCard.getAttribute('src')).toBeNull();
  expect(requested.some(url => /dhruva-under-stars|forest-sages|ayodhya-dawn/.test(url))).toBe(false);
  const preload = page.locator('link[rel="preload"][as="image"]').first();
  expect(await preload.getAttribute('imagesrcset')).toBe(await hero.getAttribute('srcset'));
  expect(await preload.getAttribute('imagesizes')).toBe(await hero.getAttribute('sizes'));
});

test('arriving loads responsive collection artwork and preserves the bilingual chapter journey', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Choose your book', exact: true}).click();
  const krishna = page.locator('[data-volume="krishna"] .volume-link');
  const cover=krishna.locator('.volume-cover > img');
  await cover.scrollIntoViewIfNeeded();await imageReady(cover);
  await expect(cover).toHaveAttribute('data-image-state', 'ready');
  await expect(cover).toHaveAttribute('srcset', /krishna-govardhana/);
  await expect(cover).toHaveAttribute('sizes',/calc/);
  await krishna.click();
  await expect(page).toHaveURL(/\/books\/krishna\/$/);
  await imageReady(page.locator('.volume-contents-layout .volume-cover>img'));
  await page.locator('.language-link').click();await page.locator('.collection-chapter').click();
  await expect(page).toHaveURL(/\/hi\/books\/read\/krishna-mountain\/$/);
  await imageReady(page.locator('.frontispiece-art img'));
  await expect(page.locator('.frontispiece-art img')).not.toHaveAttribute('data-deferred-src');
  await expect(page.locator('.frontispiece-art img')).toHaveAttribute('srcset',/krishna-govardhana/);
});

test('story index art waits until search makes the matching book available', async ({page}) => {
  await page.goto('/books/stories/');
  expect(await page.locator('.short-art > img[data-deferred-image][src]').count()).toBe(0);
  await page.locator('#book-search').fill('Krishna');
  const entry = page.locator('.short-list [data-book-entry]:not([hidden])').first();
  await entry.scrollIntoViewIfNeeded();await imageReady(entry.locator('.short-art > img'));
  await entry.locator('a').click();
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('.frontispiece-art img')).toHaveAttribute('srcset', /krishna-govardhana/);
});

test('an unavailable collection painting leaves the named volume and source-linked chapter usable', async ({page}) => {
  await page.route('**/*krishna-govardhana*.webp', route => route.abort());
  await page.goto('/#journey');
  const volume=page.locator('[data-volume="krishna"] .volume-link');
  await volume.scrollIntoViewIfNeeded();
  await expect(volume.locator('.volume-cover > img')).toHaveAttribute('data-image-state', 'error');
  await expect(volume).toHaveAccessibleName('Krishna — view chapters');
  await expect(volume.locator('.volume-inscription strong')).toHaveText('Krishna');
  await volume.click();await page.locator('.collection-chapter').click();
  await expect(page.locator('[data-folio]:visible .folio-prose')).not.toBeEmpty();
  await expect(page.locator('.frontispiece-art img')).not.toHaveAttribute('alt','');
  expect(await page.locator('#edition-note a').count()).toBeGreaterThan(0);
});

test.describe('no JavaScript', () => {
  test.use({javaScriptEnabled: false});
  test('normal fallback paintings occupy each volume once and books remain readable', async ({page}) => {
    await page.goto('/#journey');
    const art = page.locator('[data-volume="krishna"] .volume-cover');
    await art.scrollIntoViewIfNeeded();
    await expect(art.locator('> img')).not.toBeVisible();
    await expect(art.locator('noscript img')).toBeVisible();await imageReady(art.locator('noscript img'));
    await page.goto('/books/');
    const shelfArt=page.locator('[data-volume="shiva"] .volume-cover');
    await shelfArt.scrollIntoViewIfNeeded();await expect(shelfArt.locator('> img')).not.toBeVisible();await imageReady(shelfArt.locator('noscript img'));
    await page.goto('/books/stories/');
    const shortArt = page.locator('.short-art').first();
    await shortArt.scrollIntoViewIfNeeded();await expect(shortArt.locator('> img')).not.toBeVisible();await imageReady(shortArt.locator('noscript img'));
    await page.goto('/books/read/what-makes-a-person-admirable/');
    await imageReady(page.locator('.frontispiece-art img'));
    await expect(page.locator('[data-folio]:visible')).toHaveCount(3);
  });
});

test('failed optional loader scripts recover native artwork on home and shelf',async({page})=>{
  await page.route('**/responsive-loading.js',route=>route.abort());await page.goto('/#journey');
  const home=page.locator('[data-volume="krishna"] .volume-cover > img');await home.scrollIntoViewIfNeeded();
  await expect(home).toHaveAttribute('data-image-state','fallback');await imageReady(home);await expect(home).toBeVisible();
  await page.goto('/books/');const book=page.locator('[data-volume="shiva"] .volume-cover > img');await book.scrollIntoViewIfNeeded();
  await expect(book).toHaveAttribute('data-image-state','fallback');await imageReady(book);await expect(book).toBeVisible();
  await page.goto('/books/stories/');const short=page.locator('.short-art > img').first();await short.scrollIntoViewIfNeeded();
  await expect(short).toHaveAttribute('data-image-state','fallback');await imageReady(short);
});

test('failed interactive preview script still leaves its illustrated excerpt available',async({page})=>{
  await page.route('**/stories-app/app.js',route=>route.abort());await page.goto('/#experience');
  const art=page.locator('.no-script-preview > img');
  await art.scrollIntoViewIfNeeded();await imageReady(art);await expect(art).toBeVisible();
  await expect(page.locator('.no-script-preview')).toContainText('Valmiki has a question');
});
