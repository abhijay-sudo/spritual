import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const evidence='artifacts/premium-web-2026-10-23/motion';
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'no-preference'});});
test('crossfades keep current meaning immediate and retire inert outgoing layers',async({page})=>{
 await page.goto('/');await page.locator('[data-open-story]').first().click();
 await page.locator('[data-story-language="hi"]').click();
 await expect(page.locator('#story-prose')).toHaveAttribute('lang','hi');
 const layer=page.locator('#story-prose > .motion-ghost');
 await expect(layer).toHaveAttribute('aria-hidden','true');
 expect(await layer.evaluate((e:HTMLElement)=>e.inert)).toBe(true);
 await expect(layer.locator('[id]')).toHaveCount(0);
 await expect(page.locator('[data-story-language="hi"]')).toBeFocused();
 await expect(layer).toHaveCount(0);
 await page.locator('[data-story-step="1"]').click();await expect(page.locator('#story-dialog-position')).toHaveText('2 / 6');
 await expect(page.locator('.motion-ghost')).toHaveCount(0);
});
test('rapid repeated input, Escape, resize and reduced-motion changes cancel every layer',async({page})=>{
 await page.goto('/');await page.getByRole('tab',{name:'Scenes',exact:true}).click();
 // Bring the phone into view: offscreen previews intentionally do not animate.
 await page.getByRole('button',{name:'Next scene',exact:true}).scrollIntoViewIfNeeded();
 await page.evaluate(()=>{for(let i=0;i<12;i++)document.querySelector<HTMLButtonElement>('[data-scene="1"]')!.click();});
 await expect(page.locator('#feature-panel > .motion-ghost')).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.motion-ghost')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('tab',{name:'Read',exact:true}).click();await page.setViewportSize({width:768,height:900});await expect(page.locator('.motion-ghost')).toHaveCount(0);
 await page.locator('[data-open-story]').first().click();await page.locator('[data-story-language="hi"]').click();await page.keyboard.press('Escape');await expect(page.locator('#story-dialog')).not.toBeVisible();await expect(page.locator('.motion-ghost')).toHaveCount(0);await expect(page.locator('[data-open-story]').first()).toBeFocused();
 expect(await page.locator('[data-motion-host]').count()).toBe(0);
});
test('native dialog exits animate without deferring close or focus restoration',async({page})=>{
 await page.goto('/');const opener=page.locator('[data-open-story]').first();await opener.click();await expect(page.locator('#story-dialog')).toBeVisible();
 await page.locator('[data-close-story]').click();
 expect(await page.locator('#story-dialog').evaluate((e:HTMLDialogElement)=>e.open)).toBe(false);await expect(opener).toBeFocused();
 await expect.poll(()=>page.locator('#story-dialog').evaluate(e=>getComputedStyle(e).display)).toBe('none');
 await opener.click();await page.keyboard.press('Escape');await opener.click();await expect(page.locator('#story-dialog')).toHaveAttribute('open','');await expect(page.locator('#story-dialog-title')).toBeFocused();
});
test('no-JavaScript and reduced motion retain the entire invitation and story controls',async({browser,page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await page.locator('[data-open-story]').first().click();await page.locator('[data-story-language="hi"]').click();await expect(page.locator('.motion-ghost')).toHaveCount(0);expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190'});const plain=await context.newPage();await plain.goto('/');await expect(plain.locator('h1')).toHaveText('Stories worth slowing down for.');await expect(plain.locator('[data-story-card]')).toHaveCount(6);await context.close();
});
test('motion evidence and responsive reading retain the approved composition',async({page})=>{
 await mkdir(evidence,{recursive:true});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1400);
  await page.screenshot({path:`${evidence}/home-${width}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.locator('[data-open-story]').first().click();await page.locator('[data-story-language="hi"]').click();await page.screenshot({path:`${evidence}/language-crossfade.png`});await expect(page.locator('.motion-ghost')).toHaveCount(0);await page.screenshot({path:`${evidence}/story-hi-1440.png`});
 await page.keyboard.press('Escape');await page.getByRole('tab',{name:'Scenes',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();await expect(page.locator('.motion-ghost')).toHaveCount(0);await page.evaluate(async()=>{await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});await page.screenshot({path:`${evidence}/scenes-1440.png`});expect(errors).toEqual([]);
});
test('outgoing language stays invisible during the incoming fade and never flashes back',async({page})=>{
 await page.goto('/');await page.locator('[data-open-story]').first().click();
 await expect.poll(()=>page.locator('#story-dialog').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
 await page.locator('[data-story-language="hi"]').click();
 const frame=await page.locator('#story-prose').evaluate(async host=>{
  await new Promise(requestAnimationFrame);
  const animations=host.getAnimations({subtree:true});
  animations.forEach(animation=>{animation.pause();animation.currentTime=120;});
  const ghost=host.querySelector('.motion-ghost');
  return {old:ghost?getComputedStyle(ghost).opacity:null,current:getComputedStyle(host.children[0]).opacity,animations:animations.length};
 });
 expect(frame.animations).toBeGreaterThan(0);expect(frame.old).toBe('0');expect(Number(frame.current)).toBeGreaterThan(0);
 await page.screenshot({path:`${evidence}/language-midpoint.png`});
 await page.locator('#story-prose').evaluate(host=>host.getAnimations({subtree:true}).forEach(animation=>animation.play()));await expect(page.locator('.motion-ghost')).toHaveCount(0);
});
