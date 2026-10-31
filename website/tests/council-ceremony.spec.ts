import {test,expect} from '@playwright/test';
for(const width of [390,768,1440])test(`single manuscript arrival and return at ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/');await expect(page.locator('[data-home-book]')).toHaveCount(1);
 await expect(page.locator('html')).toHaveAttribute('data-arrival','done',{timeout:3000});
 const elapsed=Number(await page.locator('[data-home-book]').getAttribute('data-opening-elapsed'));expect(elapsed).toBeLessThanOrEqual(2250);
 await expect(page.locator('.manuscript-running-head')).toHaveText('Spritual');await expect(page.locator('.paper-sound')).toHaveAttribute('aria-pressed','false');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`docs/qa/ceremony-final-${width}.png`});
 await page.reload();await expect(page.locator('html')).toHaveAttribute('data-arrival','done');await expect(page.locator('.paper-surface')).toHaveCount(0);
});
for(const input of ['Escape','Enter','book','scroll','swipe'])test(`opening fast forwards with ${input}`,async({page})=>{
 await page.goto('/');if(input==='book')await page.locator('[data-home-book]').click();else if(input==='scroll')await page.mouse.wheel(0,100);else if(input==='swipe')await page.locator('[data-home-book]').dispatchEvent('touchmove');else await page.keyboard.press(input);
 await expect(page.locator('html')).toHaveAttribute('data-arrival','done',{timeout:900});await expect(page.locator('.paper-surface')).toHaveCount(0);
});
test('reduced motion, blocked storage and replay stay usable',async({page})=>{
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-arrival','done');await expect(page.locator('.paper-surface')).toHaveCount(0);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('.arrival-replay').click();await expect(page.locator('.arrival-skip')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('html')).toHaveAttribute('data-arrival','done');
});
test('CSS curl fallback keeps one semantic page and no duplicated IDs',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type:any,...args:any[]){return type==='webgl2'?null:get.call(this,type,...args)}as any;});
 await page.goto('/');await expect(page.locator('.manuscript-prose-page')).toHaveAttribute('data-paper-engine','css-curl');await expect(page.locator('html')).toHaveAttribute('data-arrival','done');
 await page.locator('[data-manuscript-enter]').click();await expect(page.locator('[data-page-position]')).toContainText('5');await page.keyboard.press('ArrowRight');await expect(page.locator('.book-leaves')).toHaveAttribute('data-paper-engine','css-curl');await expect(page.locator('.paper-surface [id]')).toHaveCount(0);await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
});
test('sound is remembered only after explicit opt-in',async({page})=>{
 await page.goto('/');await page.keyboard.press('Escape');await page.locator('.paper-sound').click();await expect(page.locator('.paper-sound')).toHaveAttribute('aria-pressed','true');await page.reload();await expect(page.locator('.paper-sound')).toHaveAttribute('aria-pressed','true');
});
test('Save-Data selects fallback and thirty-day expiry replays opening',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'connection',{value:{saveData:true},configurable:true});localStorage.setItem('spritual_manuscript_arrival_v1',String(Date.now()-31*86400000));});
 await page.goto('/');await expect(page.locator('.manuscript-prose-page')).toHaveAttribute('data-paper-engine','css-curl');await expect(page.locator('html')).toHaveAttribute('data-arrival','done');
});
test('slow frame rate downgrades and preserves the final manuscript',async({page})=>{
 await page.addInitScript(()=>{window.requestAnimationFrame=(cb:FrameRequestCallback)=>setTimeout(()=>cb(performance.now()),40) as any;window.cancelAnimationFrame=id=>clearTimeout(id);});
 await page.goto('/');await expect(page.locator('html')).toHaveAttribute('data-arrival','done');await expect(page.locator('.manuscript-prose-page')).toHaveAttribute('data-paper-downgraded','true');await expect(page.locator('.paper-surface')).toHaveCount(0);
});
test('mobile header controls meet target size without overlap',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 for(const selector of ['header nav>a','.header-tools>a,.header-tools>button,.header-tools summary,header .brand']){
 const boxes=await page.locator(selector).evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height}}));
 for(const box of boxes){expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);}
 const ordered=boxes.sort((a,b)=>a.left-b.left);for(let i=1;i<ordered.length;i++)expect(ordered[i].left).toBeGreaterThanOrEqual(ordered[i-1].right-1);
 }
});
