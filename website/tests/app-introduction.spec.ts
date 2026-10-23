import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const evidence=resolve('artifacts/premium-web-2026-10-23/responsive');
test('six source-linked stories work in both languages, with filters and focus recovery',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
 await expect(page.locator('h1')).toHaveText('A whole world. In your hands.');
 for(const [filter,count]of [['ramayana',4],['bhagavata',2],['all',6]] as const){await page.locator(`[data-story-filter="${filter}"]`).click();await expect(page.locator('[data-story-card]:visible')).toHaveCount(count);}
 for(const button of await page.locator('[data-open-story]').all()){
  await button.click();await expect(page.locator('#story-dialog')).toBeVisible();
  for(const language of ['hi','en']){await page.locator(`[data-story-language="${language}"]`).click();await expect(page.locator('#story-prose')).toHaveAttribute('lang',language);await expect(page.locator('#story-prose p')).toHaveCount(3);}
  expect(await page.locator('#story-source-list a').count()).toBeGreaterThan(0);
  await expect.poll(()=>page.locator('#story-dialog-image').evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
  await page.keyboard.press('Escape');await expect(button).toBeFocused();
 }
 expect(errors).toEqual([]);
});
test('app demonstration supports Hindi, font bounds, scenes, context and visit-only notebook',async({page})=>{
 await page.goto('/');await page.getByRole('link',{name:'Take a first look',exact:true}).click();await page.getByRole('button',{name:'Read in Hindi',exact:true}).click();
 await page.getByRole('button',{name:'Save this passage',exact:true}).click();await page.getByRole('tab',{name:'Notebook',exact:true}).click();await expect(page.locator('.notebook-quote')).toHaveAttribute('lang','hi');
 await page.getByRole('tab',{name:'Read',exact:true}).click();for(let i=0;i<3;i++)await page.getByRole('button',{name:'Increase text size'}).click();await expect(page.getByRole('button',{name:'Increase text size'})).toBeDisabled();
 await page.getByRole('tab',{name:'Scenes',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();
 // Assert the accessible current scene, excluding the inert outgoing fade layer.
 await expect(page.locator('#feature-panel').getByRole('heading',{name:'The sage who tells.',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:'People & Places',exact:true}).click();await page.locator('.person-item summary').nth(1).click();await expect(page.locator('.person-item').nth(1)).toHaveAttribute('open','');
 await page.reload();await page.getByRole('tab',{name:'Notebook',exact:true}).click();await expect(page.locator('.notebook-page')).toContainText('SAMPLE PASSAGE');
});
test('Get Spritual stays honestly unavailable and returns focus from a story',async({page})=>{
 await page.goto('/');const opener=page.locator('[data-open-story]').first();await opener.click();await page.locator('[data-story-download]').click();await expect(page.locator('#story-dialog')).not.toBeVisible();await expect(page.locator('#launch-dialog')).toBeVisible();await expect(page.locator('#dialog-description')).toContainText('coming soon');await expect(page.locator('#launch-dialog a')).toHaveCount(0);await page.keyboard.press('Escape');await expect(opener).toBeFocused();
});
test('native mobile rail, short landscape reader and legacy links remain usable',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('[data-story-filter="bhagavata"]').click();await page.locator('[data-rail="1"]').click();await expect(page.locator('#collection-position')).toHaveText('2 / 2');await expect(page.locator('[data-rail="1"]')).toHaveAttribute('aria-disabled','true');
 await page.locator('[data-open-story]').last().click();await page.setViewportSize({width:568,height:320});await expect(page.locator('#story-dialog')).toBeVisible();expect(await page.locator('#story-dialog').evaluate(e=>e.getBoundingClientRect().height<=innerHeight)).toBe(true);await page.keyboard.press('Escape');
 await page.goto('/#dharma-yatra');await expect(page).toHaveURL(/\/reading-room\/#dharma-yatra$/);await expect(page.locator('#dharma-yatra')).toBeVisible();
});
for(const width of [320,390,768,1440])test(`premium invitation remains readable and actionable at ${width}px`,async({page})=>{
 await mkdir(evidence,{recursive:true});await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].filter(i=>i.getAttribute('src')).map(i=>i.decode().catch(()=>{})));});
 const title=page.locator('h1'),primary=page.getByRole('link',{name:'Find your story',exact:true});
 await expect(title).toHaveText('A whole world. In your hands.');await expect(title).toBeInViewport();
 await expect(primary).toHaveAttribute('href','#journey');await expect(primary).toBeInViewport();
 await expect(page.locator('.site-header .brand img')).toHaveAttribute('src','/stories-app/assets/brand-icon.svg');
 expect(await page.locator('.site-header .brand img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:resolve(evidence,`viewport-${width}.png`)});
 await page.screenshot({path:resolve(evidence,`homepage-${width}.png`),fullPage:true});
 await primary.click();await expect(page).toHaveURL(/#journey$/);await expect(page.locator('#journey')).toBeInViewport();
 await expect(page.locator('[data-open-story]').first()).toBeVisible();
});
