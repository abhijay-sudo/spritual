import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const evidence='docs/qa/ramayana-collection-2026-10-27';
const route='/books/read/ramayana-across-the-ocean/';
const home='/books/ramayana/';
test.beforeAll(async()=>{await mkdir(evidence,{recursive:true});});
for(const width of [320,390,768,1440])test(`collection, illustrated turn, Hindi and kept-page return at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto(home);await expect(page.locator('.collection-chapters a')).toHaveCount(28);
  await expect(page.locator('h1')).toContainText('The Ramayana');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:`${evidence}/shelf-${width}.png`,fullPage:true});
  await page.locator(`.collection-chapters a[href="${route}"]`).click();
  await expect(page.locator('html')).toHaveClass(/scene-enhanced/);
  await expect(page.locator('[data-scene]:visible')).toHaveCount(1);
  await expect(page.locator('[data-scene]:visible img')).toHaveJSProperty('complete',true);
  await page.screenshot({path:`${evidence}/reader-${width}.png`,fullPage:true});
  await page.locator('[data-leaf-step="1"]').click();
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','1');
  const id=await page.locator('[data-folio]:visible').getAttribute('id');
  await expect(page.locator('[data-scene-stage]')).toHaveAttribute('data-active-scene',id!);
  if(width<=700)await expect(page.locator('[data-scene]:visible .painting-window')).toBeInViewport();
  await page.screenshot({path:`${evidence}/turn-${width}.png`,fullPage:false});
  await expect(page.locator('.turn-sheet')).toHaveCount(0);
  if(width<=700)expect((await page.locator('[data-scene]:visible .painting-window').boundingBox())!.y).toBeGreaterThanOrEqual(-2);
  await page.screenshot({path:`${evidence}/settled-${width}.png`,fullPage:false});
  await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();
  await expect(page).toHaveURL(new RegExp(`/hi${route}#${id}`));
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id',id!);
  await page.locator('[data-open-dialog="book-appearance"]').click();
  await page.locator('[data-text-size="26"]').click();
  await page.locator('#book-appearance [data-close-dialog]').click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
  await page.screenshot({path:`${evidence}/hindi-large-${width}.png`,fullPage:true});
  await page.locator('[data-keep]').click();await expect(page.locator('[data-storage-status]')).toContainText('सहेजा');
  await page.locator('.reader-path a').click();await expect(page).toHaveURL('/hi/books/ramayana/');
  await page.locator('[data-kept-list] a').click();
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id',id!);
  await page.locator('.source-trigger').click();await expect(page.locator('#edition-note')).toHaveAttribute('open','');
  await expect(page.locator('#edition-note a').first()).toBeVisible();
});

test('finite scene motion, rapid turns, pause, dialogs and reduced motion',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto(route);
  await expect(page.locator('html')).toHaveClass(/scene-enhanced/);
  await page.locator('[data-scene-replay]').click();
  await expect.poll(()=>page.locator('[data-scene-stage]').getAttribute('data-motion-state')).toBe('playing');
  await page.locator('[data-open-dialog="book-contents"]').click();
  await expect(page.locator('[data-scene-stage]')).toHaveAttribute('data-motion-state','paused');
  await page.locator('#book-contents [data-close-dialog]').click();
  await page.locator('[data-scene-toggle]').click();
  await expect(page.locator('[data-scene-toggle]')).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  for(let i=0;i<6;i++){await page.locator('[data-leaf-step="1"]').click();await page.locator('[data-leaf-step="-1"]').click();}
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('[data-scene]:visible')).toHaveCount(1);
  await expect(page.locator('.scene-ghost')).toHaveCount(0);
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  await page.locator('[data-scene-toggle]').click();await page.locator('[data-scene-replay]').click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('[data-scene-toggle]')).toBeDisabled();
  await expect(page.locator('[data-scene-replay]')).toBeDisabled();
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('[data-scene-replay]').click();
  await expect.poll(()=>page.locator('[data-scene-stage]').getAttribute('data-motion-state'),{timeout:10000}).toBe('settled');
});

test('keyboard and touch-style turns keep source, language and browser history coherent',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(route);
  await expect(page.locator('html')).toHaveClass(/scene-enhanced/);
  await page.locator('[data-folio]:visible').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','1');
  await expect(page.locator('[data-folio]:visible')).toBeFocused();
  await expect(page.locator('[data-folio]:visible')).toBeInViewport();
  await page.locator('.book-leaves').dispatchEvent('pointerdown',{pointerType:'touch',isPrimary:true,pointerId:9,clientX:300,clientY:300});
  await page.locator('.book-leaves').dispatchEvent('pointerup',{pointerType:'touch',isPrimary:true,pointerId:9,clientX:100,clientY:305});
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','2');
  await page.goBack();await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','1');
  await page.locator('[data-open-dialog="book-contents"]').click();await page.keyboard.press('Escape');
  await expect(page.locator('[data-open-dialog="book-contents"]')).toBeFocused();
});

test('without JavaScript all prose, paintings, sources and next chapter remain available',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),page=await context.newPage();
  await page.goto('http://127.0.0.1:4194'+route);
  await expect(page.locator('[data-folio]:visible')).toHaveCount(4);
  await expect(page.locator('[data-scene]:visible')).toHaveCount(4);
  await expect(page.locator('#edition-note a').first()).toBeVisible();
  await expect(page.locator('.chapter-ending a')).toHaveAttribute('href','/books/read/ramayana-through-lanka-at-night/');
  await context.close();
});

test('failed artwork and denied storage preserve reading without false save confirmation',async({page})=>{
  await page.route('**/assets/illustrated/**',r=>r.abort());
  await page.addInitScript(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
  await page.goto(route);await expect(page.locator('[data-art-recovery]')).toBeVisible();
  await page.locator('[data-leaf-step="1"]').click();await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','1');
  await page.locator('[data-keep]').click();await expect(page.locator('[data-storage-status]')).toContainText('could not save');
  await expect(page.locator('[data-keep]')).toHaveText('Keep this page');
});

test('every chapter is reachable in English and Hindi and the ending returns to the collection',async({page})=>{
  for(const lang of ['','/hi']) {
    await page.goto(lang+home);
    const urls=await page.locator('.collection-chapters a').evaluateAll(links=>links.map(a=>a.getAttribute('href')!));
    for(const url of urls){const response=await page.request.get(url);expect(response.status()).toBe(200);const html=await response.text();expect(html).toContain('noindex, nofollow');expect(html).toContain('data-illustrated-reader');}
    await page.goto(urls.at(-1)!);await page.locator('[data-open-dialog="book-contents"]').click();await page.locator('[data-leaf-link="3"]').click();
    await expect(page.locator('.chapter-ending a')).toHaveAttribute('href',lang+home);
    await page.locator('.chapter-ending a').click();await expect(page.locator('.collection-chapters a')).toHaveCount(28);
  }
});

test('explicit motion choice survives chapter and language navigation, with native-motion fallback',async({page})=>{
  await page.goto(route);await page.locator('[data-scene-toggle]').click();
  await expect(page.locator('[data-scene-toggle]')).toHaveAttribute('aria-pressed','false');
  await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();
  await expect(page.locator('[data-scene-toggle]')).toHaveAttribute('aria-pressed','false');
  await page.locator('[data-open-dialog="book-contents"]').click();await page.locator('[data-leaf-link="3"]').click();
  await page.locator('.chapter-ending a').click();
  await expect(page.locator('[data-scene-toggle]')).toHaveAttribute('aria-pressed','false');
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
  await page.addInitScript(()=>{Element.prototype.animate=undefined as any;});
  await page.goto(route);await expect(page.locator('[data-scene-toggle]')).toHaveText('Still illustrations');
  await expect(page.locator('[data-scene-replay]')).toBeDisabled();
  await page.locator('[data-leaf-step="1"]').click();await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','1');
});

test('intermediate widths and new single-moment plates preserve layout and reading',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(route+'#ocean-surasa');
  for(const width of [820,1100,1180,390]) {
    await page.setViewportSize({width,height:900});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
    await expect(page.locator('[data-scene]:visible img')).toHaveAttribute('src',/24-surasa-test/);
    await expect.poll(()=>page.locator('[data-scene]:visible img').evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBeTruthy();
    await expect.poll(()=>page.locator('[data-scene]:visible img').evaluate((image:HTMLImageElement)=>image.currentSrc)).toMatch(/24-surasa-test-(640|960|1280)\.jpg$/);
    await page.screenshot({path:`${evidence}/surasa-${width}.png`,fullPage:true});
  }
  await page.goto('/books/read/ramayana-forest-torn-apart/');
  await expect(page.locator('[data-scene]:visible img')).toHaveAttribute('src',/23-empty-hermitage/);
  await page.screenshot({path:`${evidence}/hermitage-390.png`,fullPage:true});
  expect(errors).toEqual([]);
});
