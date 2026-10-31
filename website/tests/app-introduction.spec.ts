import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const evidence=resolve('artifacts/premium-web-2026-10-23/responsive');
test.use({reducedMotion:'reduce'});
test('four source-linked collections lead to chapters and preserve both reading languages',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('h1')).toHaveText('Stories worth slowing down for.');
 await expect(page.locator('[data-volume]')).toHaveCount(4);
 for(const id of ['ramayana','krishna','shiva','dhruva']){
  await page.goto('/#journey');await page.locator(`[data-volume="${id}"] .volume-link`).click();
  await expect(page).toHaveURL(new RegExp(`/books/${id}/${id==='ramayana'?'(?:#chapters)?':''}$`));
  await page.locator('#chapters.collection-chapters>li>a, #chapters>.collection-chapters>li>a, #chapters .collection-part .collection-chapters>li>a').first().click();
  for(const language of ['hi','en']){
   await page.locator('.language-link[data-language-switch]').click();
   await expect(page.locator('html')).toHaveAttribute('lang',language);
   await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
   await expect(page.locator('[data-folio]:visible .folio-prose')).not.toBeEmpty();
  }
  expect(await page.locator('#edition-note a').count()).toBeGreaterThan(0);
  await expect.poll(()=>page.locator('.frontispiece img').first().evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
  await page.locator('.reader-path a').click();await expect(page).toHaveURL(new RegExp(`/books/${id}/${id==='ramayana'?'(?:#chapters)?':''}$`));
 }
 expect(errors).toEqual([]);
});
test('app demonstration supports Hindi, font bounds, scenes, context and visit-only notebook',async({page})=>{
 await page.goto('/#experience');await page.getByRole('button',{name:'Read in Hindi',exact:true}).click();
 await page.getByRole('button',{name:'Save this passage',exact:true}).click();await page.getByRole('tab',{name:'Notebook',exact:true}).click();await expect(page.locator('.notebook-quote')).toHaveAttribute('lang','hi');
 await page.getByRole('tab',{name:'Read',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Increase text size'}).click();await expect(page.getByRole('button',{name:'Increase text size'})).toBeDisabled();
 await page.getByRole('tab',{name:'Scenes',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();
 await expect(page.locator('#feature-panel').getByRole('heading',{name:'The sage who tells.',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'People & Places',exact:true}).click();await page.locator('.person-item summary').nth(1).click();await expect(page.locator('.person-item').nth(1)).toHaveAttribute('open','');
 await page.reload();await page.getByRole('tab',{name:'Notebook',exact:true}).click();await expect(page.locator('.notebook-page')).toContainText('SAMPLE PASSAGE');
});
test('Get Spritual stays honestly unavailable and restores its actual opener',async({page})=>{
 await page.goto('/');const opener=page.locator('.header-cta[data-launch]');await opener.click();await expect(page.locator('#launch-dialog')).toBeVisible();await expect(page.locator('#dialog-description')).toContainText('coming soon');await expect(page.locator('#launch-dialog a[href*="apps.apple.com"],#launch-dialog a[href*="play.google.com"]')).toHaveCount(0);await expect(page.locator('#launch-dialog a[href="/books/"]')).toHaveCount(1);await page.keyboard.press('Escape');await expect(opener).toBeFocused();
});
test('mobile collections, short landscape reading and legacy links remain usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.getByRole('link',{name:'Choose your book',exact:true}).click();await expect(page.locator('[data-volume]')).toHaveCount(4);
 await page.locator('[data-volume="dhruva"] .volume-link').click();await expect(page.locator('.collection-chapter')).toHaveCount(1);await page.locator('.collection-chapter').click();await page.setViewportSize({width:568,height:320});await expect(page.locator('[data-folio]:visible')).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('.reader-path a').click();await expect(page).toHaveURL(/\/books\/dhruva\/$/);
 await page.goto('/#dharma-yatra');await expect(page).toHaveURL(/\/reading-room\/#dharma-yatra$/);await expect(page.locator('#dharma-yatra')).toBeVisible();
});
for(const width of [320,390,768,1440])test(`premium invitation remains readable and actionable at ${width}px`,async({page})=>{
 await mkdir(evidence,{recursive:true});await page.setViewportSize({width,height:900});await page.goto('/');
 await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode().catch(()=>{})));});
 const title=page.locator('h1'),primary=page.getByRole('link',{name:'Choose your book',exact:true});
 await expect(title).toHaveText('Stories worth slowing down for.');await expect(title).toBeInViewport();
 await expect(primary).toHaveAttribute('href','#journey');await expect(primary).toBeInViewport();
 await expect(page.locator('.site-header .brand img')).toHaveAttribute('src','/stories-app/assets/brand-icon.svg');
 expect(await page.locator('.site-header .brand img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:resolve(evidence,`viewport-${width}.png`)});
 // Visit the seven visible painting containers; hidden no-script preview art and
 // closed legacy dialogs are intentionally outside the rendered page.
 const paintings=page.locator('[data-volume] .volume-cover,.featured-edition-art,.experience-landscape,.launch-landscape');
 await expect(paintings).toHaveCount(7);
 for(const container of await paintings.all()){
  await container.scrollIntoViewIfNeeded();
  const image=container.locator('> img');
  await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await expect(image).toBeVisible();
 }
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:resolve(evidence,`homepage-${width}.png`),fullPage:true});
 await primary.click();await expect(page).toHaveURL(/#journey$/);await expect(page.locator('#journey')).toBeInViewport();
 await expect(page.locator('[data-volume] .volume-link').first()).toBeVisible();
});
