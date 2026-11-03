import {test,expect,type Page} from '@playwright/test';

const story='/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/';
const leaves='.book-leaves';
async function openReader(page:Page){
 await page.setViewportSize({width:1440,height:1100});
 await page.goto(story);
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-reading-mode-state','book');
 await page.locator(leaves).scrollIntoViewIfNeeded();
 const box=await page.locator(leaves).boundingBox();
 if(!box)throw new Error('Reader leaf has no presentation box');
 // The top paper margin deliberately leaves ordinary prose selectable by mouse.
 return {x:box.x+box.width-24,y:box.y+12,width:box.width};
}
async function progress(page:Page){return Number(await page.locator(leaves).getAttribute('data-paper-progress'));}

test('curl follows a held pointer and a short, stopped drag restores the original scene',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const p=await openReader(page),url=page.url();
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-p.width*.24,p.y,{steps:12});
 await expect(page.locator(leaves)).toHaveAttribute('data-paper-state','dragging');
 expect(await progress(page)).toBeGreaterThan(.20);expect(await progress(page)).toBeLessThan(.28);
 await expect(page.locator('.paper-surface')).toHaveAttribute('aria-hidden','true');
 await expect(page.locator('.paper-preview')).toHaveAttribute('aria-hidden','true');
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
 expect(page.url()).toBe(url);
 const held=await progress(page);await page.waitForTimeout(150);expect(await progress(page)).toBe(held);
 await page.mouse.up();await expect(page.locator('.paper-surface')).toHaveCount(0);
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','0');
 expect(page.url()).toBe(url);expect(errors).toEqual([]);
});

test('a deliberate turn commits one scene and preserves language and saved-place continuity',async({page})=>{
 const p=await openReader(page);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-p.width*.67,p.y,{steps:12});
 await page.waitForTimeout(120);await page.mouse.up();
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 await expect(page).toHaveURL(/#page-2$/);
 await expect(page.locator('.paper-surface,.paper-preview')).toHaveCount(0);
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
 await expect(page.getByRole('link',{name:'Read in Hindi',exact:true})).toHaveAttribute('href',/#page-2$/);
 await page.locator('[data-keep]').click();
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('spritual_book_places_v1')||'null'));
 expect(JSON.stringify(saved)).toContain('page-2');
});

test('release momentum can finish a short, decisive flick',async({page})=>{
 const p=await openReader(page);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-12,p.y);
 await page.waitForTimeout(20);await page.mouse.move(p.x-p.width*.25,p.y);await page.mouse.up();
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
});

test('a settling leaf can be re-grabbed at its presented progress and reversed',async({page})=>{
 const p=await openReader(page),url=page.url();
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-p.width*.60,p.y,{steps:8});
 await page.waitForTimeout(120);await page.mouse.up();await page.waitForTimeout(40);
 const grabX=p.x-p.width*.60;
 await page.locator(leaves).evaluate(leaf=>leaf.addEventListener('pointerdown',()=>{const node=leaf as HTMLElement;node.dataset.testGrabBefore=node.dataset.paperProgress;queueMicrotask(()=>node.dataset.testGrabAfter=node.dataset.paperProgress);},{capture:true,once:true}));
 await page.mouse.move(grabX,p.y);await page.mouse.down();
 const held=await progress(page);expect(await page.locator(leaves).getAttribute('data-test-grab-after')).toBe(await page.locator(leaves).getAttribute('data-test-grab-before'));
 await page.waitForTimeout(70);expect(await progress(page)).toBe(held);
 await page.mouse.move(grabX+p.width*(held-.2),p.y,{steps:10});
 expect(await progress(page)).toBeCloseTo(.2,2);
 await page.waitForTimeout(120);await page.mouse.up();
 await expect(page.locator('.paper-surface,.paper-preview')).toHaveCount(0);
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','0');expect(page.url()).toBe(url);
});

test('vertical intent and ordinary mouse text interaction do not turn the page',async({page})=>{
 const p=await openReader(page);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-2,p.y+100,{steps:8});await page.mouse.up();
 await expect(page.locator('.paper-surface')).toHaveCount(0);
 const prose=await page.locator('[data-folio]:visible .folio-prose p').first().boundingBox();if(!prose)throw new Error('Missing prose');
 await page.mouse.move(prose.x+20,prose.y+12);await page.mouse.down();await page.mouse.move(prose.x+160,prose.y+12,{steps:8});await page.mouse.up();
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','0');
 await expect(page.locator('.paper-surface')).toHaveCount(0);
});

test('an in-flight keyboard turn can be caught and reversed without losing navigation state',async({page})=>{
 const p=await openReader(page);await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 const x=p.x-p.width*.75;await page.mouse.move(x,p.y);await page.mouse.down();
 const held=await progress(page);await page.mouse.move(x+p.width*(held-.12),p.y,{steps:8});
 await page.waitForTimeout(120);await page.mouse.up();
 await expect(page.locator('[data-page-position]')).toHaveText('Page 1 of 11');
 await expect(page).toHaveURL(/#page-1$/);await expect(page.locator('.paper-surface,.paper-preview')).toHaveCount(0);
 await page.keyboard.press('ArrowRight');await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
});

test('reduced motion keeps the same drag decision without a decorative surface',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});const p=await openReader(page);
 await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(p.x-p.width*.65,p.y,{steps:8});
 await expect(page.locator('.paper-surface,.paper-preview')).toHaveCount(0);
 await page.mouse.up();await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-page-position]')).toHaveText('Page 1 of 11');
});

test('touch-pointer vertical intent remains unclaimed',async({page})=>{
 const p=await openReader(page);
 const send=async(type:string,x:number,y:number)=>page.locator(leaves).dispatchEvent(type,{pointerId:7,pointerType:'touch',isPrimary:true,button:0,clientX:x,clientY:y,bubbles:true});
 // Synthetic pointer events verify arbitration only; physical touch scrolling is a separate device check.
 await send('pointerdown',p.x,p.y);await send('pointermove',p.x-2,p.y+45);await send('pointerup',p.x-2,p.y+45);
 await expect(page.locator(leaves)).not.toHaveAttribute('data-page-dragging',/./);
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','0');
});

for(const width of [390,1440])test(`Book deep links keep the scene heading below sticky chrome at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:900});await page.goto(story+'#page-5');
 await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','4');
 await page.evaluate(()=>document.fonts.ready);
 const geometry=await page.evaluate(()=>{const bottom=(selector:string)=>document.querySelector(selector)!.getBoundingClientRect().bottom;return {chrome:Math.max(bottom('.site-header'),bottom('.reader-mode-bar')),heading:document.querySelector('#page-5 h2')!.getBoundingClientRect().top};});
 expect(geometry.heading).toBeGreaterThanOrEqual(geometry.chrome);
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
});

test.describe('mobile touch dispatch',()=>{
 test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 test('a horizontal touch drag commits through the native pointer path',async({page,browserName})=>{
  test.skip(browserName!=='chromium','Chrome DevTools touch dispatch is not available in WebKit.');
  await page.goto(story);await expect(page.locator('[data-reader]')).toHaveAttribute('data-reading-mode-state','book');
  await page.locator(leaves).scrollIntoViewIfNeeded();
  const leaf=(await page.locator(leaves).boundingBox())!,bar=(await page.locator('.reader-mode-bar').boundingBox())!;
  const x=leaf.x+leaf.width-15,y=Math.max(leaf.y+20,bar.y+bar.height+30),cdp=await page.context().newCDPSession(page);
  const touch=(type:string,position:number)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:position,y,id:1}]});
  await touch('touchStart',x);for(let i=1;i<=12;i++)await touch('touchMove',x-leaf.width*.67*i/12);
  await expect(page.locator(leaves)).toHaveAttribute('data-paper-state','dragging');
  await expect.poll(()=>progress(page)).toBeCloseTo(.67,2);await touch('touchEnd',x-leaf.width*.67);
  await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
  await expect(page.locator('.paper-surface,.paper-preview')).toHaveCount(0);
 });
});

test('saved-place Undo restores the exact latest record removed after a concurrent update',async({page})=>{
 await page.goto(story);await page.locator('[data-keep]').click();await page.goto('/my-reading/');
 await expect(page.locator('[data-kept-list] li')).toHaveCount(1);
 // Storage may change before another tab's queued storage event reaches this UI.
 await page.evaluate(()=>{const key='spritual_book_places_v1',value=JSON.parse(localStorage.getItem(key)!);value.places[0].folio='page-5';value.places[0].savedAt='2026-10-30T12:00:00.000Z';localStorage.setItem(key,JSON.stringify(value));});
 await page.getByRole('button',{name:/Remove/}).click();await page.getByRole('button',{name:'Undo',exact:true}).click();
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('spritual_book_places_v1')!).places[0]);
 expect(restored.folio).toBe('page-5');expect(restored.savedAt).toBe('2026-10-30T12:00:00.000Z');
 await expect(page.locator('[data-kept-list] a').first()).toHaveAttribute('href',/#page-5$/);
});

test('removing an already removed record does not offer a fabricated Undo',async({page})=>{
 await page.goto(story);await page.locator('[data-keep]').click();await page.goto('/my-reading/');
 await expect(page.locator('[data-kept-list] li')).toHaveCount(1);
 await page.evaluate(()=>localStorage.setItem('spritual_book_places_v1',JSON.stringify({version:1,places:[]})));
 await page.getByRole('button',{name:/Remove/}).click();
 await expect(page.locator('[data-kept-list] li')).toHaveCount(0);await expect(page.getByRole('button',{name:'Undo',exact:true})).not.toBeVisible();
});
