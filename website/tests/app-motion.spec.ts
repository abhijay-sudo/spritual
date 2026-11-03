import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const evidence='artifacts/premium-web-2026-10-23/motion';
test.beforeEach(async({page})=>{await page.emulateMedia({reducedMotion:'no-preference'});});
async function enterChapter(page:Page){
 await page.goto('/#journey');await page.locator('[data-volume="ramayana"] .volume-link').click();
 await expect(page).toHaveURL(/\/books\/ramayana\/(?:#chapters)?$/);
 await page.locator('#chapters a[href*="knowing-how-to-stop"]').click();
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
}
test('chapter turns keep semantic text immediate and discard inert outgoing paper before language navigation',async({page})=>{
 await enterChapter(page);await page.locator('[data-leaf-step="1"]').click();
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
 const folio=await page.locator('[data-folio]:visible').getAttribute('id');
 const paper=page.locator('.turn-sheet');
 await expect(paper).toHaveAttribute('aria-hidden','true');
 expect(await paper.evaluate((e:HTMLElement)=>e.inert)).toBe(true);
 await expect(paper.locator('[id],[data-folio]')).toHaveCount(0);
 await expect(paper).toHaveCount(0);
 await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();
 await expect(page.locator('html')).toHaveAttribute('lang','hi');
 await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id',folio!);
 await expect(page.locator('.turn-sheet')).toHaveCount(0);
});
test('rapid repeated input, Escape, resize and reduced-motion changes cancel preview and reader layers',async({page})=>{
 await page.goto('/#experience');await page.getByRole('tab',{name:'Scenes',exact:true}).click();
 await page.getByRole('button',{name:'Next scene',exact:true}).scrollIntoViewIfNeeded();
 await page.evaluate(()=>{for(let i=0;i<12;i++)document.querySelector<HTMLButtonElement>('[data-scene="1"]')!.click();});
 await expect(page.locator('#feature-panel > .motion-ghost')).toHaveCount(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.motion-ghost')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('tab',{name:'Read',exact:true}).click();await page.setViewportSize({width:768,height:900});await expect(page.locator('.motion-ghost')).toHaveCount(0);
 expect(await page.locator('[data-motion-host]').count()).toBe(0);
 await enterChapter(page);await page.locator('[data-leaf-step="1"]').click();await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.turn-sheet')).toHaveCount(0);
 await page.getByRole('button',{name:'Reading appearance'}).click();await page.keyboard.press('Escape');await expect(page.locator('#book-appearance')).not.toBeVisible();await expect(page.getByRole('button',{name:'Reading appearance'})).toBeFocused();
});
test('native reader dialog exits do not defer close or focus restoration',async({page})=>{
 await enterChapter(page);const opener=page.getByRole('button',{name:'Reading appearance'});await opener.click();await expect(page.locator('#book-appearance')).toBeVisible();
 await page.locator('#book-appearance [data-close-dialog]').click();
 expect(await page.locator('#book-appearance').evaluate((e:HTMLDialogElement)=>e.open)).toBe(false);await expect(opener).toBeFocused();
 await expect.poll(()=>page.locator('#book-appearance').evaluate(e=>getComputedStyle(e).display)).toBe('none');
 await opener.click();await page.keyboard.press('Escape');await opener.click();await expect(page.locator('#book-appearance')).toHaveAttribute('open','');
 await expect(page.locator('#book-appearance [data-close-dialog]')).toBeFocused();
});
test('no-JavaScript and reduced motion retain collections, contents and bilingual reading',async({browser,page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await enterChapter(page);await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();await page.locator('[data-leaf-step="1"]').click();await expect(page.locator('[data-folio]:visible')).toHaveCount(1);await expect(page.locator('.turn-sheet,.motion-ghost')).toHaveCount(0);expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length)).toBe(0);
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190'});
 try{const plain=await context.newPage();await plain.goto('/');await expect(plain.locator('h1')).toHaveText('Stories worth slowing down for.');await expect(plain.locator('[data-volume]')).toHaveCount(4);await plain.locator('[data-volume="krishna"] .volume-link').click();await plain.locator('.collection-chapter').click();await expect(plain.locator('[data-folio]:visible')).toHaveCount(1);await expect(plain.locator('.folio-prose p')).toHaveCount(3);}finally{await context.close();}
});
test('motion evidence and responsive reading retain the approved composition',async({page})=>{
 await mkdir(evidence,{recursive:true});const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();await expect(page.locator('#welcome-intro')).not.toBeVisible({timeout:5000});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`${evidence}/home-${width}.png`});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await enterChapter(page);await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();await expect(page.locator('.turn-sheet')).toHaveCount(0);await page.screenshot({path:`${evidence}/chapter-hi-1440.png`});
 await page.goto('/#experience');await page.getByRole('tab',{name:'Scenes',exact:true}).click();await page.getByRole('button',{name:'Next scene',exact:true}).click();await expect(page.locator('.motion-ghost')).toHaveCount(0);await page.evaluate(async()=>{await Promise.all(document.getAnimations().map(animation=>animation.finished.catch(()=>{})));});await page.screenshot({path:`${evidence}/scenes-1440.png`});expect(errors).toEqual([]);
});
test('outgoing preview language stays invisible during the incoming fade and never flashes back',async({page})=>{
 await page.goto('/#experience');await page.getByRole('button',{name:'Read in Hindi',exact:true}).scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Read in Hindi',exact:true}).click();
 const frame=await page.locator('#feature-panel').evaluate(async host=>{
  await new Promise(requestAnimationFrame);
  const animations=host.getAnimations({subtree:true});
  animations.forEach(animation=>{animation.pause();animation.currentTime=120;});
  const ghost=host.querySelector(':scope > .motion-ghost');
  const current=host.querySelector(':scope > .phone-scroll');
  return {language:current?.querySelector('.reader-body')?.getAttribute('lang'),old:ghost?getComputedStyle(ghost).opacity:null,current:current?getComputedStyle(current).opacity:null,animations:animations.length,inert:ghost?(ghost as HTMLElement).inert:false,ids:ghost?.querySelectorAll('[id]').length};
 });
 expect(frame.language).toBe('hi');expect(frame.animations).toBeGreaterThan(0);expect(frame.old).toBe('0');expect(Number(frame.current)).toBeGreaterThan(0);expect(frame.inert).toBe(true);expect(frame.ids).toBe(0);
 await mkdir(evidence,{recursive:true});await page.screenshot({path:`${evidence}/preview-language-midpoint.png`});
 await page.locator('#feature-panel').evaluate(host=>host.getAnimations({subtree:true}).forEach(animation=>animation.play()));await expect(page.locator('.motion-ghost')).toHaveCount(0);
});
