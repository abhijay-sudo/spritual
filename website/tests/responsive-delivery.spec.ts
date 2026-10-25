import {test, expect, type Locator} from '@playwright/test';

test.use({reducedMotion: 'reduce', viewport: {width: 390, height: 844}});

async function imageReady(image: Locator) {
  await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
}

test('the hero loads immediately while distant paintings and the phone wait', async ({page}) => {
  const requested: string[] = [];
  page.on('request', request => {if (request.resourceType() === 'image') requested.push(request.url());});
  await page.goto('/');
  const hero = page.locator('.invitation-painting img');
  await imageReady(hero);
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  await expect(hero).not.toHaveAttribute('data-deferred-src');
  const farCard = page.locator('[data-open-story="dhruva-star"] .story-art > img');
  await expect(farCard).toHaveAttribute('data-image-state', 'waiting');
  expect(await farCard.getAttribute('src')).toBeNull();
  expect(requested.some(url => /dhruva-under-stars|forest-sages|ayodhya-dawn/.test(url))).toBe(false);
  const preload = page.locator('link[rel="preload"][as="image"]').first();
  expect(await preload.getAttribute('imagesrcset')).toBe(await hero.getAttribute('srcset'));
  expect(await preload.getAttribute('imagesizes')).toBe(await hero.getAttribute('sizes'));
});

test('arriving and filtering load the selected story and preserve the reader journey', async ({page}) => {
  await page.goto('/');
  await page.getByRole('link', {name: 'Find your story', exact: true}).click();
  const first = page.locator('.story-art > img[data-deferred-image]').first();
  await imageReady(first);
  await expect(first).toHaveAttribute('data-image-state', 'ready');
  await page.locator('[data-story-filter="bhagavata"]').click();
  const krishna = page.locator('[data-open-story="krishna-mountain"]');
  await imageReady(krishna.locator('.story-art > img'));
  await krishna.click();
  const dialogArt = page.locator('#story-dialog-image');
  await imageReady(dialogArt);
  await expect(dialogArt).toHaveAttribute('srcset', /krishna-govardhana/);
  await page.locator('[data-story-language="hi"]').click();
  await page.locator('[data-open-book]').click();
  await expect(page).toHaveURL(/\/hi\/books\/read\/krishna-mountain\/$/);
  await imageReady(page.locator('.frontispiece-art img'));
  await expect(page.locator('.frontispiece-art img')).not.toHaveAttribute('data-deferred-src');
});

test('bookshelf art waits until search makes the matching book available', async ({page}) => {
  await page.goto('/books/');
  await imageReady(page.locator('.edition-cover > img'));
  expect(await page.locator('.short-art > img[data-deferred-image][src]').count()).toBe(0);
  await page.locator('#book-search').fill('Krishna');
  const entry = page.locator('.short-list [data-book-entry]:not([hidden])').first();
  await entry.scrollIntoViewIfNeeded();
  await imageReady(entry.locator('.short-art > img'));
  await entry.locator('a').click();
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('.frontispiece-art img')).toHaveAttribute('srcset', /krishna-govardhana/);
});

test('an unavailable painting leaves its story usable and exposes the existing alt text', async ({page}) => {
  await page.route('**/*krishna-govardhana*.webp', route => route.abort());
  await page.goto('/#journey');
  await page.locator('[data-story-filter="bhagavata"]').click();
  const story = page.locator('[data-open-story="krishna-mountain"]');
  await expect(story.locator('.story-art > img')).toHaveAttribute('data-image-state', 'error');
  await story.click();
  await expect(page.locator('#story-prose')).not.toBeEmpty();
  await expect(page.locator('[data-open-book]')).toHaveAttribute('href', '/books/read/krishna-mountain/');
});

test.describe('no JavaScript', () => {
  test.use({javaScriptEnabled: false});

  test('normal fallback paintings occupy each card once and books remain readable', async ({page}) => {
    await page.goto('/#journey');
    const art = page.locator('.story-art').first();
    await art.scrollIntoViewIfNeeded();
    await expect(art.locator('> img')).not.toBeVisible();
    await expect(art.locator('noscript img')).toBeVisible();
    await imageReady(art.locator('noscript img'));
    await page.goto('/books/');
    const shortArt = page.locator('.short-art').first();
    await shortArt.scrollIntoViewIfNeeded();
    await expect(shortArt.locator('> img')).not.toBeVisible();
    await imageReady(shortArt.locator('noscript img'));
    await page.goto('/books/read/what-makes-a-person-admirable/');
    await imageReady(page.locator('.frontispiece-art img'));
    await expect(page.locator('[data-folio]:visible')).toHaveCount(3);
  });
});


test('failed optional loader scripts recover native artwork on home and shelf',async({page})=>{
  await page.route('**/responsive-loading.js',route=>route.abort());
  await page.goto('/#journey');
  const home=page.locator('.story-art > img').first();
  await expect(home).toHaveAttribute('data-image-state','fallback');
  await imageReady(home);await expect(home).toBeVisible();
  await page.goto('/books/');
  const book=page.locator('.short-art > img').first();
  await book.scrollIntoViewIfNeeded();
  await expect(book).toHaveAttribute('data-image-state','fallback');
  await imageReady(book);await expect(book).toBeVisible();
});

test('failed interactive preview script still leaves its illustrated excerpt available',async({page})=>{
  await page.route('**/stories-app/app.js',route=>route.abort());
  await page.goto('/#experience');
  const art=page.locator('.no-script-preview > img');
  await art.scrollIntoViewIfNeeded();await imageReady(art);await expect(art).toBeVisible();
  await expect(page.locator('.no-script-preview')).toContainText('Valmiki has a question');
});
