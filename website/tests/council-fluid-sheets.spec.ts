import {test,expect,type Page} from '@playwright/test';

const story='/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/';
const contentsButton='[data-open-dialog="book-contents"]';
const appearanceButton='[data-open-dialog="book-appearance"]';
// These journeys exercise the mobile sheet. Individual desktop cases override
// this explicitly, so the suite does not depend on its runner's default viewport.
test.beforeEach(async({page})=>{await page.setViewportSize({width:390,height:844});});
async function readySheet(page:Page,id='book-contents'){
 await page.locator(`[data-open-dialog="${id}"]`).click();
 await expect(page.locator(`#${id}`)).toHaveAttribute('data-sheet-state','open');
 return page.locator(`#${id}`);
}
async function position(page:Page,id='book-contents'){
 return page.locator(`#${id}`).evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
}

test('desktop source panel has one heading, focus containment and symmetric Escape dismissal',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setViewportSize({width:1440,height:900});await page.goto(story);
 const trigger=page.locator('.source-trigger');await trigger.click();
 const sheet=page.locator('.source-drawer');await expect(sheet).toHaveAttribute('data-sheet-state','open');
 const rect=await sheet.boundingBox();expect(rect!.x).toBeGreaterThan(900);expect(rect!.width).toBeLessThanOrEqual(480);expect(rect!.y).toBe(12);
 await expect(sheet.getByRole('heading',{level:2})).toHaveCount(1);
 await expect(sheet.getByRole('button',{name:'Close sources'})).toBeFocused();
 await page.locator('[data-keep]').focus();expect(await sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
 await page.screenshot({path:'docs/qa/fluid-source-desktop.png'});
 await page.keyboard.press('Escape');await expect(sheet).toHaveAttribute('data-sheet-state','closing');
 await expect(sheet).not.toBeVisible();await expect(trigger).toBeFocused();expect(errors).toEqual([]);
});

test('mobile contents follows the pointer one for one and a short slow drag returns to rest',async({page})=>{
 await page.goto(story);const sheet=await readySheet(page);
 const rect=await sheet.boundingBox();expect(rect!.y+rect!.height).toBeCloseTo(844,0);
 const grip=await sheet.locator('.fluid-sheet-grip').boundingBox();const x=grip!.x+grip!.width/2,y=grip!.y+14;
 await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(x,y+35);
 const first=await position(page);await page.mouse.move(x,y+70);const second=await position(page);
 expect(first).toBeCloseTo(35,0);expect(second-first).toBeCloseTo(35,0);
 await expect(sheet).toHaveAttribute('data-sheet-state','dragging');
 await page.screenshot({path:'docs/qa/fluid-contents-mobile-drag.png'});
 await page.waitForTimeout(140);await page.mouse.up();await expect(sheet).toHaveAttribute('data-sheet-state','open');
 expect(await position(page)).toBe(0);await expect(sheet).toBeVisible();
 await sheet.locator('[data-close-dialog]').click();await expect(sheet).not.toBeVisible();await expect(page.locator(contentsButton)).toBeFocused();
});

test('mobile downward flick dismisses from a small displacement',async({page})=>{
 await page.goto(story);const sheet=await readySheet(page);const grip=await sheet.locator('.fluid-sheet-grip').boundingBox();
 const x=grip!.x+grip!.width/2,y=grip!.y+14;
 await page.mouse.move(x,y);await page.mouse.down();
 // Keep the release well below the positional threshold, but with outward velocity.
 await page.mouse.move(x,y+80,{steps:2});await page.mouse.up();
 await expect(sheet).not.toBeVisible();await expect(page.locator(contentsButton)).toBeFocused();
});

test('a sheet can be re-grabbed during dismissal and reversed without closing',async({page})=>{
 await page.clock.install();await page.goto(story);const sheet=await readySheet(page);
 // Freeze a rendered mid-dismissal frame so cross-process mouse latency cannot
 // move the target out from under the pointer before its down event arrives.
 await page.clock.pauseAt(await page.evaluate(()=>Date.now()+50));
 await sheet.evaluate(el=>{(el as any).closeCount=0;el.addEventListener('close',()=>{(el as any).closeCount++});(window as any).SpritualSheets.close(el)});
 await page.clock.runFor(50);
 await expect(sheet).toHaveAttribute('data-sheet-state','closing');
 const chrome=await sheet.locator('.fluid-sheet-chrome').boundingBox();const x=chrome!.x+chrome!.width/2,y=chrome!.y+chrome!.height-14;
 await page.mouse.move(x,y);await page.mouse.down();await expect(sheet).toHaveAttribute('data-sheet-state','held');
 await page.mouse.move(x,y-160,{steps:3});await page.mouse.up();
 await page.clock.runFor(1000);
 await expect(sheet).toHaveAttribute('data-sheet-state','open');expect(await position(page)).toBe(0);
 expect(await sheet.evaluate(el=>(el as any).closeCount)).toBe(0);
});

test('scrolling contents stays inside the sheet and selecting a scene restores reading focus',async({page})=>{
 await page.goto(story);const sheet=await readySheet(page);const content=sheet.locator('.fluid-sheet-content');
 await content.hover();await page.mouse.wheel(0,420);
 await expect.poll(()=>content.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
 expect(await position(page)).toBe(0);await expect(sheet).toHaveAttribute('data-sheet-state','open');
 await sheet.locator('[data-leaf-link="4"]').click();await expect(sheet).not.toBeVisible();
 await expect(page.locator('[data-page-position]')).toHaveText('Page 5 of 11');await expect(page.locator('#page-5')).toBeFocused();
});

test('scrim dismisses only an outside pointer sequence',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto(story);const sheet=await readySheet(page,'book-appearance');
 const title=await sheet.getByRole('heading',{level:2}).boundingBox();
 await page.mouse.move(title!.x+8,title!.y+8);await page.mouse.down();await page.mouse.move(300,100);await page.mouse.up();
 await expect(sheet).toHaveAttribute('data-sheet-state','open');
 await page.mouse.click(300,100);await expect(sheet).not.toBeVisible();await expect(page.locator(appearanceButton)).toBeFocused();
});

test('reduced motion opens and closes immediately while reading preferences persist',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(story);const sheet=await readySheet(page,'book-appearance');
 expect(await sheet.evaluate(el=>getComputedStyle(el).transform)).toBe('none');
 await sheet.locator('[data-text-size="26"]').click();await expect(page.locator('.folio-prose').first()).toHaveCSS('font-size','26px');
 await sheet.locator('[data-close-dialog]').click();expect(await sheet.evaluate((el:HTMLDialogElement)=>el.open)).toBe(false);
 await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();await expect(page.locator('.folio-prose').first()).toHaveCSS('font-size','26px');
 await readySheet(page,'book-appearance');await page.screenshot({path:'docs/qa/fluid-appearance-hindi-mobile.png'});
 await page.keyboard.press('Escape');await expect(page.locator(appearanceButton)).toBeFocused();
});

test('higher contrast uses an opaque high contrast panel',async({page})=>{
 await page.emulateMedia({contrast:'more',reducedMotion:'reduce'});await page.goto(story);const sheet=await readySheet(page,'book-appearance');
 await expect(sheet).toHaveCSS('background-color','rgb(255, 250, 240)');await expect(sheet).toHaveCSS('border-top-width','2px');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
