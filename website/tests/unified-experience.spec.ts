import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const output='docs/qa/unified-experience-2026-10-28';

test('immediate bilingual reading fits mobile and desktop; no welcome or app dead ends',async({page},info)=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await mkdir(output,{recursive:true});
 for(const lang of ['','hi/'])for(const width of [320,360,390,768,1280]){
  await page.setViewportSize({width,height:900});await page.goto('/'+lang+'?world=neutral');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('h1')).toBeVisible();await expect(page.locator('.living-primary')).toBeVisible();
  const bounds=await page.locator('.living-primary').boundingBox();expect(bounds!.y+bounds!.height).toBeLessThan(900);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  await expect(page.locator('#welcome-intro')).toHaveCount(0);await expect(page.getByText('Get Spritual',{exact:true})).toHaveCount(0);
  await expect(page.locator('.experience-header nav a')).toHaveCount(4);
  await page.screenshot({path:`${output}/${info.project.name}-${lang?'hi':'en'}-${width}.png`,fullPage:true});
 }
 expect(errors).toEqual([]);
});

test('Sankalpa can be sealed, restored on reload and released without a reading-completion claim',async({page})=>{
 await page.goto('/');await page.locator('[data-sankalpa-seal]').click();await expect(page.locator('[data-sankalpa-saved]')).toBeVisible();
 await page.reload();await expect(page.locator('[data-sankalpa-saved]')).toBeVisible();await page.locator('[data-sankalpa-clear]').click();await expect(page.locator('[data-seal-controls]')).toBeVisible();
});

test('shared navigation and language work across library, sources, character, quiet moment and both readers',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const path of ['/library/','/books/','/library/stories/','/story/shabaris-welcome/','/books/read/shabaris-welcome/','/read/shabaris-welcome/','/library/sources/','/library/ramayana/aranya/','/characters/vishvamitra/','/daily/','/my-reading/','/pause/']){
  const response=await page.goto(path);expect(response!.status()).toBe(200);await expect(page.locator('.experience-header')).toHaveCount(1);await expect(page.locator('.experience-header nav a')).toHaveCount(4);
  await expect(page.locator('.experience-language')).toHaveAttribute('href',new RegExp('/hi'+path));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 }
 expect(errors).toEqual([]);
});

test('bookmarks remain available through the global Saved route and Hindi remains on the same book',async({page})=>{
 await page.goto('/books/read/shabaris-welcome/');await page.locator('[data-keep]').click();
 await page.locator('.experience-header nav').getByRole('link',{name:'Saved',exact:true}).click();
 await expect(page.locator('[data-kept-list] a')).toHaveCount(1);await expect(page.locator('[data-kept-list] a')).toContainText('Shabari');
 await page.locator('[data-kept-list] a').click();await page.locator('.experience-language').click();await expect(page).toHaveURL(/\/hi\/books\/read\/shabaris-welcome\//);await expect(page.locator('html')).toHaveAttribute('lang','hi');
});

test('source notes are accessible disclosures, and recovery banners stay hidden during normal use',async({page})=>{
 await page.goto('/library/ramayana/aranya/');const details=page.locator('details.source-disclosure').first();await expect(details).not.toHaveAttribute('open','');await expect(details.getByText('DRAFT ORIENTATION',{exact:true})).not.toBeVisible();await details.locator('summary').click();await expect(details.getByText('DRAFT ORIENTATION',{exact:true})).toBeVisible();
 await page.goto('/library/sources/');await expect(page.locator('#search-empty')).not.toBeVisible();await page.locator('#library-search').fill('does-not-exist-xyz');await expect(page.locator('#search-empty')).toBeVisible();await page.locator('#search-reset').click();await expect(page.locator('#search-empty')).not.toBeVisible();
 await page.goto('/story/shabaris-welcome/');await expect(page.locator('.detail-side>details')).not.toHaveAttribute('open','');await page.locator('.detail-actions a.button').click();await expect(page).toHaveURL(/\/books\/read\/shabaris-welcome\//);
});

test('reflection card previews and downloads both formats in English and Hindi',async({page},info)=>{
 for(const lang of ['','hi/']){
  await page.goto('/'+lang);await page.locator('[data-share-reflection]').click();const dialog=page.locator('.experience-share-dialog');await expect(dialog).toBeVisible();await expect(dialog.locator('[data-download]')).toBeEnabled();
  await expect(dialog.locator('canvas')).toHaveAttribute('width','1080');await expect(dialog.locator('canvas')).toHaveAttribute('height','1920');
  await page.screenshot({path:`${output}/${info.project.name}-share-${lang?'hi':'en'}.png`});
  const downloadPromise=page.waitForEvent('download');await dialog.locator('[data-download]').click();const download=await downloadPromise;expect(download.suggestedFilename()).toMatch(/spritual-reflection-(en|hi)-story.png/);await download.saveAs(`${output}/${info.project.name}-reflection-${lang?'hi':'en'}.png`);
  await dialog.locator('select').selectOption('portrait');await expect(dialog.locator('canvas')).toHaveAttribute('height','1350');await expect(dialog.locator('[data-download]')).toBeEnabled();await dialog.locator('form button').click();await expect(dialog).toHaveCount(0);await expect(page.locator('[data-share-reflection]')).toBeFocused();
 }
});

test('appearance keyboard recovery and six themes remain usable with reduced motion',async({page},info)=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:360,height:900});
 for(const world of ['neutral','epic','rama','krishna','hanuman','shiva']){
  await page.goto('/?world='+world);await expect(page.locator('html')).toHaveAttribute('data-world',world);await expect(page.locator('.living-primary')).toBeVisible();
  await page.screenshot({path:`${output}/${info.project.name}-theme-${world}.png`});
 }
 await page.locator('.experience-appearance summary').click();await page.locator('[data-experience-size="24"]').click();await page.locator('.experience-appearance summary').press('Escape');await expect(page.locator('.experience-appearance')).not.toHaveAttribute('open','');await expect(page.locator('.experience-appearance summary')).toBeFocused();
 await page.reload();expect(await page.locator('html').evaluate(el=>getComputedStyle(el).getPropertyValue('--living-read-size'))).toBe('24px');
});

test('native reading and sources remain usable without JavaScript',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto('http://127.0.0.1:4190/');await expect(page.locator('.living-primary')).toBeVisible();await expect(page.locator('#welcome-intro')).toHaveCount(0);await page.locator('.living-primary').click();await expect(page.locator('[data-folio]')).toHaveCount(3);await expect(page.locator('[data-folio]').last()).toBeVisible();await context.close();
});

test('corrupt kept-page records are reported without overwriting them',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('spritual_book_places_v1','unreadable-test'));await page.goto('/my-reading/');await expect(page.locator('[data-storage-status]')).toContainText('could not be read');expect(await page.evaluate(()=>localStorage.getItem('spritual_book_places_v1'))).toBe('unreadable-test');
});

test('homepage text meets AA contrast in each theme and hero artwork uses responsive delivery',async({page})=>{
 for(const world of ['neutral','epic','rama','krishna','hanuman','shiva']){
  await page.goto('/?world='+world);
  const checks=await page.evaluate(()=>{
   const rgb=(value:string)=>{const n=value.match(/[\d.]+/g)!.map(Number);return n.slice(0,3);};
   const lum=(c:number[])=>c.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
   return ['.living-eyebrow','.living-purpose','.living-excerpt p','.living-primary','.sankalpa-label','.sankalpa-action','.sankalpa-storage-note','.doorway-story','.living-carry .living-eyebrow'].map(selector=>{
    const el=document.querySelector(selector)!;let bg='rgb(255,255,255)';for(let p:Element|null=el;p;p=p.parentElement){const color=getComputedStyle(p).backgroundColor;if(!['rgba(0, 0, 0, 0)','transparent'].includes(color)){bg=color;break;}}
    const a=lum(rgb(getComputedStyle(el).color)),b=lum(rgb(bg));return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
   });
  });
  for(const result of checks)expect(result.ratio,world+' '+result.selector).toBeGreaterThanOrEqual(4.5);
 }
 await expect(page.locator('.living-stage figure img')).toHaveAttribute('srcset',/320w|480w|720w/);
});
