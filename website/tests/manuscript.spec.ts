import {test,expect} from '@playwright/test';
import {resolve} from 'node:path';
const evidence=resolve(process.cwd(),'artifacts/manuscript-sanctuary/evidence');
const readingKey='spritual_reading_v2';
const story='what-makes-a-person-admirable';

test('sanctuary early return and language links survive a delayed module graph',async({page})=>{
  let release!:()=>void;const blocked=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/site.js',async route=>{await blocked;await route.continue();});
  const from=`/read/${story}/?from=resume&journey=ramayana#block-question-2`;
  await page.goto(`/pause/?from=${encodeURIComponent(from)}&world=shiva&elapsed=9000`,{waitUntil:'commit'});
  await expect(page.locator('#timer-toggle')).toBeDisabled();
  await page.locator('.language').click();await expect(page).toHaveURL(/\/hi\/pause\/.*elapsed=9000/);
  expect(new URL(page.url()).searchParams.get('from')).toContain(`/hi/read/${story}/?from=resume&journey=ramayana&world=shiva#block-question-2`);
  await expect(page.locator('#timer-toggle')).toBeDisabled();
  release();await expect(page.locator('#timer-toggle')).toBeEnabled();await expect(page.locator('#time')).toHaveText('0:51');
  await page.locator('.ritual-close').click();await expect(page).toHaveURL(new RegExp(`/hi/read/${story}/.*#block-question-2$`));
});

test('sanctuary can return immediately while its interaction module is unavailable',async({page})=>{
  await page.route('**/site.js',route=>route.abort());
  const from=`/read/${story}/?from=resume&journey=ramayana#block-question-2`;
  await page.goto(`/pause/?from=${encodeURIComponent(from)}`);
  await expect(page.locator('#timer-toggle')).toBeDisabled();
  await page.locator('.ritual-close').click();await expect(page).toHaveURL(new RegExp(`/read/${story}/.*#block-question-2$`));
});

test('reader context is keyboard operable, exclusive, interruptible and returns focus',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/read/${story}/`);
  await expect(page.locator('.reader-title')).toContainText('About');
  const source=page.locator('#editorial-source-toggle');await source.focus();await page.keyboard.press('Enter');
  await expect(source).toHaveAttribute('aria-expanded','true');await expect(page.locator('#editorial-source')).toContainText('Bala Kanda');
  await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Escape');
  await expect(source).toBeFocused();await expect(page.locator('#editorial-source')).toBeHidden();
  await page.evaluate(()=>{for(let i=0;i<6;i++)for(const id of ['retelling','source','reflection'])document.getElementById(`editorial-${id}-toggle`)!.click();});
  await expect(page.locator('.editorial-drawer:visible')).toHaveCount(1);await expect(page.locator('#editorial-reflection')).toContainText('not source text');
  await page.locator('#editorial-reflection .text-button').click();await expect(page.locator('#editorial-reflection-toggle')).toBeFocused();
  await page.locator('#manuscript-focus').click();await expect(page.locator('#manuscript-exit-focus')).toBeFocused();
  expect(await page.locator('.reader-chrome').evaluate((el:any)=>el.inert)).toBe(true);
  await page.keyboard.press('Escape');await expect(page.locator('#manuscript-focus')).toBeFocused();
  await expect(page.locator('.reader-progress')).toHaveCSS('height','2px');expect(errors).toEqual([]);
});

test('reader survives immediate save, quiet-minute early exit and exact semantic resume across language',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(`/read/${story}/?journey=ramayana&world=shiva`);
  await page.locator('.reader-contents summary').click();await page.locator('.reader-journey a[href^="#scene-"]').nth(1).click();
  await page.locator('#bookmark-place').click();
  const saved=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),readingKey);
  const block=saved.bookmarks[0].blockId;expect(saved.bookmarks[0].sceneId).not.toBe('');
  await page.waitForTimeout(1900);
  await page.locator('#manuscript-focus').scrollIntoViewIfNeeded();await page.locator('#reader-quiet-minute').click();
  await expect(page).toHaveURL(/\/pause\/\?/);await page.clock.install();await page.locator('#timer-toggle').click();await page.clock.runFor(9500);
  await page.locator('.language').click();await expect(page.locator('html')).toHaveAttribute('lang','hi');await expect(page.locator('#time')).toHaveText('0:51');
  await expect(page.locator('body')).not.toHaveClass(/ritual-running/);
  await page.locator('.ritual-close').click();await expect(page).toHaveURL(new RegExp(`/hi/read/${story}/.*from=resume`));
  await expect(page).toHaveURL(/journey=ramayana/);await expect(page.locator('html')).toHaveAttribute('data-world','shiva');
  const current=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)!),readingKey);expect(current.bookmarks[0].blockId).toBe(block);
  expect(await page.evaluate(()=>Object.keys(localStorage).some(k=>k.startsWith('spritual_sankalpa')))).toBe(false);
});

test('quiet-minute round trip restores a fractional paragraph and language maps that block',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(`/read/${story}/?journey=together`);await page.waitForTimeout(1900);
  const block=page.locator('[data-block-id]').nth(1),id=await block.getAttribute('data-block-id');
  await block.evaluate(el=>{const r=el.getBoundingClientRect();scrollTo(0,scrollY+r.top+r.height*.4-88);});
  await expect.poll(async()=>page.evaluate(({key,id})=>JSON.parse(localStorage.getItem(key)||'{}').progress?.[id]?.blockOffsetRatio,{key:readingKey,id:story})).toBeGreaterThan(.3);
  // A real pointer route from the sticky Contents must not scroll the paragraph away.
  await page.locator('.reader-contents summary').click();await page.locator('#contents-quiet-minute').click();await page.locator('.ritual-close').click();await page.waitForTimeout(2200);
  await expect(page).toHaveURL(new RegExp(`#block-${id}$`));
  const ratio=await page.locator(`[data-block-id="${id}"]`).evaluate(el=>{const r=el.getBoundingClientRect();return (88-r.top)/r.height;});expect(ratio).toBeGreaterThan(.3);expect(ratio).toBeLessThan(.5);
  await page.locator('.reader-language a').click();await page.waitForTimeout(1800);await expect(page).toHaveURL(new RegExp(`/hi/read/.*#block-${id}$`));
});

test('60-second sanctuary has exact phases, deliberate settling, no automatic intention and optional sound lifecycle',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/pause/');await page.clock.install();await expect(page.locator('#sanctuary-sound')).toHaveAttribute('aria-pressed','false');
  await page.locator('#timer-toggle').click();await expect(page.locator('#breath-phase')).toHaveText('Inhale');
  await page.clock.runFor(4000);await expect(page.locator('#breath-phase')).toHaveText('Hold');await page.clock.runFor(4000);await expect(page.locator('#breath-phase')).toHaveText('Exhale');
  await page.locator('#timer-toggle').click();const paused=await page.locator('#time').textContent();await page.clock.runFor(7000);await expect(page.locator('#time')).toHaveText(paused!);
  await page.locator('#timer-toggle').click();await page.clock.runFor(48000);await expect(page.locator('#breath-phase')).toHaveText('Breathe naturally');await expect(page.locator('#time')).toHaveText('0:04');
  await page.clock.runFor(4000);await expect(page.locator('#sanctuary-arrival')).toBeVisible();await expect(page.locator('#time')).toHaveText('0:00');
  await expect(page.locator('#sanctuary-arrival')).toContainText('An editorial reflection');await expect(page.locator('#finish-view')).toBeHidden();
  expect(await page.evaluate(()=>localStorage.length)).toBe(0);await page.screenshot({path:`${evidence}/sanctuary-ended.png`});expect(errors).toEqual([]);
});

test('hidden document, reduced motion, natural mode, skip hold and language changes leave no live loops',async({page})=>{
  await page.goto('/pause/?world=shiva');await page.clock.install();await page.locator('#timer-toggle').click();await page.clock.runFor(5000);
  await page.locator('[name="breath-mode"][value="skip"]').check();await expect(page.locator('#breath-phase')).toHaveText('Exhale');
  await page.locator('[name="breath-mode"][value="natural"]').check();await expect(page.locator('#breath-phase')).toHaveText('Breathe naturally');
  await page.emulateMedia({reducedMotion:'reduce'});const transform=await page.locator('.orb-petals').evaluate(el=>getComputedStyle(el).transform);await page.clock.runFor(2000);expect(await page.locator('.orb-petals').evaluate(el=>getComputedStyle(el).transform)).toBe(transform);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  const paused=await page.locator('#time').textContent();await page.clock.runFor(10000);await expect(page.locator('#time')).toHaveText(paused!);await expect(page.locator('#timer-status')).toContainText('paused while');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('body')).not.toHaveClass(/ritual-running/);
  await page.locator('.language').click();await expect(page.locator('#time')).toHaveText(paused!);await expect(page.locator('[name="breath-mode"][value="natural"]')).toBeChecked();
  await page.keyboard.press('Escape');await expect(page.locator('.ritual-close')).toBeFocused();
});

test('sound requires a gesture, stops on hiding, and never restarts itself',async({page})=>{
  await page.goto('/pause/');await expect(page.locator('#sanctuary-sound')).toHaveAttribute('aria-pressed','false');
  await page.locator('#sanctuary-sound').click();await expect(page.locator('#sanctuary-sound')).toHaveAttribute('aria-pressed','true');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#sanctuary-sound')).toHaveAttribute('aria-pressed','false');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));});await expect(page.locator('#sanctuary-sound')).toHaveAttribute('aria-pressed','false');
});

test('denied storage and no JavaScript do not block readable paragraphs or timer exit',async({page,browser})=>{
  await page.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw Error('denied');}});});
  await page.goto(`/read/${story}/`);await expect(page.locator('#editorial-source-toggle')).toBeVisible();await page.locator('#editorial-source-toggle').click();await expect(page.locator('#editorial-source')).toBeVisible();
  await page.goto('/pause/');await page.locator('#timer-toggle').click();await page.locator('#finish').click();await expect(page.locator('#save-step')).toBeDisabled();await expect(page.locator('.ritual-close')).toBeVisible();
  const offline=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190'});const staticPage=await offline.newPage();await staticPage.goto(`/read/${story}/`);await expect(staticPage.locator('[data-block-id]').first()).toBeVisible();expect(await staticPage.locator('[data-block-id]').first().textContent()).toContain('Morning');await offline.close();
});

for(const width of [320,390,768,1024,1440])test(`reader and sanctuary reflow in both languages at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
  for(const lang of ['en','hi']){
    const prefix=lang==='hi'?'/hi':'';await page.goto(`${prefix}/read/${story}/`);await page.waitForLoadState('networkidle');
    await page.screenshot({path:`${evidence}/reader-${lang}-${width}.png`});
    await page.locator('#reader-settings-open').click();await page.locator('[data-reader-size="28"]').click();await page.locator('button[data-reader-theme="dark"]').click();
    if(width>=980){await page.locator('#parallel-toggle').click();await expect(page.locator('.story-reader')).toHaveClass(/is-parallel/);}
    await page.keyboard.press('Escape');await page.locator('#editorial-source-toggle').click();
    for(const plate of await page.locator('.illustration-plate').all()){
      const bounds=await plate.boundingBox();expect(bounds!.x).toBeGreaterThanOrEqual(0);expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`${evidence}/reader-source-large-dark-${lang}-${width}.png`});
    await page.goto(`${prefix}/pause/?world=${lang==='hi'?'shiva':'neutral'}`);await page.waitForLoadState('networkidle');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:`${evidence}/sanctuary-${lang}-${width}.png`});await page.locator('#timer-toggle').click();await expect(page.locator('.language')).toBeVisible();await page.locator('#finish').click();await expect(page.locator('#finish-heading')).toBeFocused();
  }
  if(width===320){
    await page.goto('/hi/pause/?world=krishna');
    await page.addStyleTag({content:'body{font-size:200%}.sanctuary p,.sanctuary button,.sanctuary label{font-size:1em!important;line-height:1.65!important}'});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    for(const label of await page.locator('.breath-options label').all()){
      expect(await label.evaluate(el=>{const outer=el.getBoundingClientRect(),inner=el.querySelector('span')!.getBoundingClientRect();return inner.left>=outer.left&&inner.right<=outer.right;})).toBe(true);
    }
    await page.screenshot({path:`${evidence}/sanctuary-hi-enlarged-320.png`,fullPage:true});
  }
});
