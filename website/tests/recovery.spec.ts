import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
const evidence='artifacts/illustrated-recovery/evidence';
const first='what-makes-a-person-admirable',second='knowing-how-to-stop';
const count=process.env.WEBSITE_RELEASE?22:10;
const key=(id:string)=>`spritual_sankalpa_v1:${id}`;
test.beforeAll(async()=>mkdir(evidence,{recursive:true}));

test('illustrated home reflows at every target width and images remain visible in both languages',async({page})=>{
 test.setTimeout(120000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [320,390,768,979,980,1024,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('[data-yatra-id]')).toHaveCount(count);
  await expect.poll(()=>page.locator('.arrival-art img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width<980){const quick=await page.locator('[data-art-enter]').boundingBox();expect(quick!.y+quick!.height).toBeLessThan(900);}
  for(const card of await page.locator('.chapter-art img').all()){
   await card.scrollIntoViewIfNeeded();await expect.poll(()=>card.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
   const box=(await card.boundingBox())!;expect(box.width).toBeGreaterThan(200);expect(box.height).toBeGreaterThan(100);
  }
  await page.goto('/hi/?world=shiva');const size=page.locator('[data-font-toggle]');if(await size.getAttribute('aria-pressed')!=='true')await size.click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${evidence}/responsive-hi-${width}.png`});
 }
 expect(errors).toEqual([]);
});

test('six atmosphere choices update only the hero; interrupted or failed images retain usable art',async({page})=>{
 await page.goto('/');const before=await page.locator('.chapter-art img').evaluateAll(images=>images.map(i=>i.getAttribute('src')));
 const bindings={neutral:'collection-ramayana',epic:'collection-mahabharata',rama:'world-rama',krishna:'world-krishna',hanuman:'world-hanuman',shiva:'world-shiva'};
 for(const [world,file] of Object.entries(bindings)){
  await page.locator(`.arrival-themes [data-world-option=${world}]`).click();
  await expect(page.locator('.arrival-art img')).toHaveAttribute('src',`/assets/${file}.webp`);
  await expect(page.locator('.arrival-art img')).toHaveCSS('opacity','1');
  expect(await page.locator('.chapter-art img').evaluateAll(images=>images.map(i=>i.getAttribute('src')))).toEqual(before);
  await page.screenshot({path:`${evidence}/theme-${world}.png`});
 }
 await page.evaluate(()=>{for(let i=0;i<12;i++)for(const theme of ['epic','rama','krishna']) (document.querySelector(`.arrival-themes [data-world-option=${theme}]`) as HTMLElement).click();});
 await expect(page.locator('.arrival-art img')).toHaveAttribute('src','/assets/world-krishna.webp');
 await page.route('**/world-shiva.webp',route=>route.abort());
 await page.locator('.arrival-themes [data-world-option=shiva]').click();
 await expect(page.locator('.arrival-art img')).toHaveAttribute('data-art-unavailable','true');
 await expect(page.locator('.arrival-art img')).toHaveAttribute('src','/assets/world-krishna.webp');
});

test('inline breath is optional, finite, cancellable and never records practice or reading',async({page})=>{
 await page.goto('/');await page.clock.install();const start=page.locator('[data-breath-start]');
 await expect(page.locator('[data-settled-enter]')).toHaveAttribute('href',`/read/${first}/?journey=ramayana`);
 await start.click();await page.clock.runFor(1500);await expect(page.locator('[data-breath-cue]')).toHaveText('Inhale gently');
 await page.locator('[data-breath-cancel]').click();await page.clock.runFor(9000);await expect(start).toBeEnabled();
 await start.click();await page.clock.runFor(4100);await expect(page.locator('[data-breath-cue]')).toHaveText('Exhale gently');
 await page.clock.runFor(4000);await expect(page.locator('[data-breath-cue]')).toContainText('Enter whenever');
 expect(await page.evaluate(()=>localStorage.length)).toBe(0);expect(await page.evaluate(()=>sessionStorage.getItem('spritual_settled'))).toBeNull();
 await start.click();await page.evaluate(()=>dispatchEvent(new Event('blur')));await expect(start).toBeEnabled();
 await page.locator('[data-show-path]').click();await expect(page.locator('[data-arrival-active]')).toBeVisible();
 await page.reload();await expect(page.locator('[data-arrival-active]')).toBeVisible();expect(await page.evaluate(()=>localStorage.length)).toBe(0);
 await page.locator('[data-settle-again]').click();await page.emulateMedia({reducedMotion:'reduce'});await start.click();await page.clock.runFor(2000);
 await expect(start).toHaveCSS('transform','none');await page.locator('[data-breath-cancel]').click();
});

test('returning arrival spotlights exact progress and Hindi uses the localized scene title',async({page})=>{
 await page.goto(`/read/${first}/?journey=ramayana`);await page.waitForTimeout(1900);
 const block=page.locator('[data-block-id]').nth(1),id=await block.getAttribute('data-block-id');
 await block.evaluate(el=>{const r=el.getBoundingClientRect();scrollTo(0,scrollY+r.top+r.height*.4-88);});
 await expect.poll(()=>page.evaluate(id=>JSON.parse(localStorage.getItem('spritual_reading_v2')||'{}').progress?.[id]?.blockOffsetRatio,first)).toBeGreaterThan(.3);
 await page.goto('/hi/?world=shiva');await expect(page.locator('[data-arrival-active]')).toBeVisible();
 await expect(page.locator('#continue-context')).not.toContainText('the question');
 await expect(page.locator('[data-current-read]')).toHaveAttribute('href',new RegExp(`journey=ramayana.*#block-${id}`));
 await page.locator('[data-current-read]').click();await page.waitForTimeout(2100);
 const ratio=await page.locator(`[data-block-id="${id}"]`).evaluate(el=>{const r=el.getBoundingClientRect();return (88-r.top)/r.height;});
 expect(ratio).toBeGreaterThan(.27);expect(ratio).toBeLessThan(.55);
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('spritual_sankalpa')))).toEqual([]);
});

test('Kanda filters, language and diya jump preserve URLs and never manufacture completion',async({page})=>{
 await page.goto('/?world=krishna#dharma-yatra');
 await page.locator('[data-kanda=sundara-kanda]').click();await expect(page.locator('[data-kanda-group]:visible')).toHaveCount(1);
 expect(new URL(page.url()).searchParams.get('kanda')).toBe('sundara-kanda');
 await page.locator('.language').click();await expect(page).toHaveURL(/\/hi\/.*kanda=sundara-kanda/);
 await expect(page.locator('[data-kanda-group]:visible')).toHaveCount(1);
 await page.locator(`[data-diya-id=${first}]`).click();await expect(page.locator('[data-kanda-group]:visible')).toHaveCount(6);
 await expect(page.locator(`#yatra-${first} .chapter-copy h4`)).toBeFocused();
 expect(new URL(page.url()).searchParams.get('world')).toBe('krishna');expect(new URL(page.url()).searchParams.has('kanda')).toBe(false);
 expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('spritual_sankalpa')))).toEqual([]);
});

test('home cards have independent cancellable holds, explicit tried acknowledgement, Undo and multitab sync',async({page,context})=>{
 await page.goto('/');const card=page.locator(`#yatra-${second}`),hold=card.locator('[data-sankalpa-hold]');
 await hold.focus();await page.keyboard.down('Space');await page.waitForTimeout(200);await page.keyboard.press('Escape');await page.keyboard.up('Space');
 expect(await page.evaluate(k=>localStorage.getItem(k),key(second))).toBeNull();
 const other=await context.newPage();await other.goto('/');await page.bringToFront();await hold.focus();await page.keyboard.down('Space');
 await expect.poll(()=>page.evaluate(k=>localStorage.getItem(k),key(second)),{timeout:3500}).not.toBeNull();await page.keyboard.up('Space');
 await expect(other.locator(`#yatra-${second} [data-sankalpa]`)).toHaveAttribute('data-practice-state','sealed');
 await expect(page.locator(`[data-diya-id=${second}]`)).not.toHaveClass(/is-tried/);
 await card.locator('[data-sankalpa-try]').click();await expect(page.locator(`[data-diya-id=${second}]`)).toHaveClass(/is-tried/);
 await card.locator('[data-sankalpa-undo]').click();await expect(page.locator(`[data-diya-id=${second}]`)).not.toHaveClass(/is-tried/);
 await card.locator('[data-sankalpa-clear]').click();await card.locator('[data-sankalpa-undo]').click();
 expect(await page.evaluate(()=>localStorage.getItem('spritual_reading_v2'))).toBeNull();
 await page.locator(`#yatra-${first} [data-sankalpa-seal]`).click();await expect(card.locator('[data-sankalpa]')).toHaveAttribute('data-practice-state','sealed');
 await other.close();
});

test('short-screen sanctuary controls and reader continuation labels are visibly separated in EN and Hindi',async({page})=>{
 for(const prefix of ['','/hi']){
  await page.setViewportSize({width:400,height:609});await page.goto(`${prefix}/pause/`);await page.evaluate(()=>document.fonts.ready);
  for(const running of [false,true]){if(running)await page.locator('#timer-toggle').click();const box=(await page.locator('#timer-toggle').boundingBox())!;expect(box.y).toBeGreaterThan(0);expect(box.y+box.height).toBeLessThan(609);}
  await page.screenshot({path:`${evidence}/short-sanctuary${prefix?'-hi':''}.png`});
  await page.goto(`${prefix}/read/${first}/?journey=ramayana`);const link=page.locator('[data-journey-next]');await link.scrollIntoViewIfNeeded();
  const label=(await link.locator(':scope > span').boundingBox())!,title=(await link.locator(':scope > strong').boundingBox())!;
  expect(title.y).toBeGreaterThanOrEqual(label.y+label.height);
 }
});

test('public no-JavaScript artwork and reading links do not depend on animation or storage',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190',viewport:{width:390,height:844}});
 const page=await context.newPage();await page.goto('/');await expect(page.locator('.arrival-art img')).toBeVisible();
 await expect(page.locator('.chapter-art img')).toHaveCount(count);await page.locator('[data-art-enter]').click();
 await expect(page.locator('.reader-opening-art img')).toBeVisible();await expect(page.locator('.reader-title h1')).toBeVisible();
 await context.close();
});

test('denied and corrupted home storage keep navigation open and preserve unreadable records',async({page})=>{
 await page.addInitScript(id=>{localStorage.setItem('spritual_sankalpa_v1:'+id,'{broken');localStorage.setItem('spritual_reading_v2','{broken');},first);
 await page.goto('/');await page.locator(`#yatra-${first} [data-sankalpa-seal]`).click();
 await expect(page.locator(`#yatra-${first} [data-sankalpa-status]`)).toContainText('not saved');
 expect(await page.evaluate(id=>localStorage.getItem('spritual_sankalpa_v1:'+id),first)).toBe('{broken');
 await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('Denied')};Storage.prototype.setItem=()=>{throw Error('Denied')};});
 await page.goto('/');await expect(page.locator('[data-arrival-threshold]')).toBeVisible();await expect(page.locator('[data-settled-enter]')).toBeVisible();
 await page.locator('[data-show-path]').click();await expect(page.locator('[data-arrival-active]')).toBeVisible();
});
