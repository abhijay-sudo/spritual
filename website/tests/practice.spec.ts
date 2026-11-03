import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {ANCHOR_IDS,PRACTICE_REVISION} from '../practice-data.mjs';
import {editionStoryKeys} from '../illustrated-chapters.mjs';

const evidence=resolve(process.cwd(),'artifacts/dharma-yatra/evidence');
const key=(id:string)=>`spritual_sankalpa_v1:${id}`;
const first=ANCHOR_IDS[0], second=ANCHOR_IDS[1];
const read=async(page:any,id:string)=>page.evaluate((key:string)=>JSON.parse(localStorage.getItem(key)||'null'),key(id));
const openPractice=async(page:any,id=second,lang='en')=>{
  await page.goto(`${lang==='hi'?'/hi':''}/read/${id}/?world=neutral#story-sankalpa`);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('[data-sankalpa]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-sankalpa]')).toBeVisible();
};
test.beforeAll(async()=>mkdir(evidence,{recursive:true}));

test('chronological illustrated milestones, scroll-only sutra and all chapter links remain usable',async({page})=>{
  await page.goto('/#dharma-yatra');
  await page.locator('.yatra-heading').scrollIntoViewIfNeeded();
  expect(await page.locator('[data-yatra-id]').evaluateAll(nodes=>nodes.map(node=>(node as HTMLElement).dataset.yatraId))).toEqual(process.env.WEBSITE_RELEASE?editionStoryKeys:ANCHOR_IDS);
  await expect(page.locator('[data-yatra-id]').last()).toContainText('Returning responsibility');
  await expect(page.locator('[data-yatra-id][data-state=current]')).toHaveAttribute('data-yatra-id',first);
  const thread=page.locator('.yatra-thread');
  expect((await thread.boundingBox())!.height).toBeGreaterThan(1000);
  const offset=parseFloat(await page.locator('.yatra-thread-fill').evaluate(node=>getComputedStyle(node).strokeDashoffset));
  await page.locator('[data-yatra-id]').last().scrollIntoViewIfNeeded();
  await expect.poll(async()=>parseFloat(await page.locator('.yatra-thread-fill').evaluate(node=>getComputedStyle(node).strokeDashoffset))).toBeLessThan(offset);
  expect(await read(page,first)).toBeNull();
  if(process.env.WEBSITE_RELEASE){
    await expect(page.locator('.chapter-card')).toHaveCount(22);
    await page.locator('#yatra-princes-and-teacher .chapter-read').click();
    await expect(page).toHaveURL(/\/read\/princes-and-teacher\/\?journey=ramayana/);
    await expect(page.locator('[data-sankalpa]')).toHaveAttribute('data-sankalpa','princes-and-teacher');
  }
});

test('hold cancellation, sealing, explicit practice and return work without changing reading data',async({page,context})=>{
  await openPractice(page);
  const hold=page.locator('[data-sankalpa-hold]');
  await hold.scrollIntoViewIfNeeded();
  let box=(await hold.boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.waitForTimeout(350);await page.mouse.up();
  expect(await read(page,second)).toBeNull();
  await hold.focus();await page.keyboard.down('Space');await page.waitForTimeout(180);await page.keyboard.press('Escape');await page.keyboard.up('Space');
  expect(await read(page,second)).toBeNull();
  await hold.focus();await page.keyboard.down('Enter');await page.waitForTimeout(150);await page.locator('[data-sankalpa-seal]').focus();await page.keyboard.up('Enter');
  expect(await read(page,second)).toBeNull();
  box=(await hold.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x-15,box.y);await page.mouse.up();
  expect(await read(page,second)).toBeNull();
  const readingBefore=await page.evaluate(()=>localStorage.getItem('spritual_reading_v2'));
  await hold.scrollIntoViewIfNeeded();box=(await hold.boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await expect.poll(()=>read(page,second),{timeout:4000}).not.toBeNull();await page.mouse.up();
  expect((await read(page,second)).triedAt).toBeNull();
  expect(await page.evaluate(()=>localStorage.getItem('spritual_reading_v2'))).toBe(readingBefore);
  await expect(page.locator('[data-sankalpa]')).toHaveAttribute('data-practice-state','sealed');
  await page.screenshot({path:resolve(evidence,'sealed-intention.png')});
  await page.locator('.sankalpa-return').click();
  await expect(page.locator(`[data-yatra-id="${second}"]`)).toHaveAttribute('data-state','upcoming');
  await expect(page.locator(`[data-yatra-id="${second}"] [data-yatra-badge]`)).toContainText('Intention sealed');
  await openPractice(page);
  await page.getByRole('button',{name:'I tried it',exact:true}).click();
  await page.locator('.sankalpa-return').click();
  await expect(page.locator(`[data-yatra-id="${second}"]`)).toHaveAttribute('data-state','completed');
  await expect(page.locator(`[data-yatra-id="${first}"]`)).toHaveAttribute('data-state','current');
  await expect(page.locator('.header [data-practice-petal].is-chosen')).toHaveCount(1);
});

test('touch hold cancels on release and navigation, and only a full gesture seals',async({browser})=>{
  const context=await browser.newContext({hasTouch:true,isMobile:true,viewport:{width:390,height:844},baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190'});
  const page=await context.newPage();await openPractice(page);
  const cdp=await context.newCDPSession(page);
  const startTouch=async()=>{
    const hold=page.locator('[data-sankalpa-hold]');await hold.scrollIntoViewIfNeeded();
    const box=(await hold.boundingBox())!;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});
  };
  const endTouch=()=>cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await startTouch();await page.waitForTimeout(250);await endTouch();
  expect(await read(page,second)).toBeNull();
  await startTouch();await page.goto('/reading-room/');await endTouch();await page.waitForTimeout(2100);
  expect(await read(page,second)).toBeNull();
  await openPractice(page);await startTouch();
  await expect.poll(()=>read(page,second),{timeout:4500}).not.toBeNull();await endTouch();
  expect((await read(page,second)).triedAt).toBeNull();
  await context.close();
});

test('one-tap keyboard alternative, Undo, multi-tab sync and repeated choices stay idempotent',async({page,context})=>{
  await openPractice(page);
  const other=await context.newPage();await other.goto('/#dharma-yatra');
  await page.locator('[data-sankalpa-seal]').focus();await page.keyboard.press('Enter');
  await expect(other.locator(`[data-yatra-id="${second}"] [data-yatra-badge]`)).toContainText('Intention sealed');
  const original=await read(page,second);await page.reload();
  expect(await read(page,second)).toEqual(original);
  await page.locator('[data-sankalpa-try]').click();await page.locator('[data-sankalpa-undo]').click();
  expect((await read(page,second)).triedAt).toBeNull();
  await page.locator('[data-sankalpa-clear]').click();
  expect(await read(page,second)).toBeNull();
  await page.locator('[data-sankalpa-undo]').click();
  expect(await read(page,second)).toEqual(original);
  await other.goto(`/read/${second}/#story-sankalpa`);await other.locator('[data-sankalpa-try]').click();
  await expect(page.locator('[data-sankalpa]')).toHaveAttribute('data-practice-state','tried');
  await expect(page.locator('[data-sankalpa-undo]')).toBeHidden();
  await other.close();
});

test('corrupted and denied practice storage remain untouched with truthful recovery',async({page,context})=>{
  await page.goto('/reading-room/');
  await page.evaluate(k=>localStorage.setItem(k,'{broken'),key(second));
  await openPractice(page);await page.locator('[data-sankalpa-seal]').click();
  await expect(page.locator('[data-sankalpa-status]')).toContainText('not saved');
  expect(await page.evaluate(k=>localStorage.getItem(k),key(second))).toBe('{broken');
  await expect(page.locator('[data-sankalpa]')).toHaveAttribute('data-practice-state','empty');
  const denied=await context.newPage();
  await denied.addInitScript(()=>Object.defineProperty(Storage.prototype,'setItem',{configurable:true,value(){throw new DOMException('Denied','SecurityError');}}));
  await openPractice(denied,first);await denied.locator('[data-sankalpa-seal]').click();
  await expect(denied.locator('[data-sankalpa-status]')).toContainText('not saved');
  expect(await read(denied,first)).toBeNull();await denied.close();
});

test('Hindi switching preserves the Sankalpa anchor and the existing semantic reading place',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await openPractice(page);
  await page.locator('[data-sankalpa-seal]').click();
  const record=await read(page,second);
  await page.locator('.reader-language a').click();
  await expect(page).toHaveURL(/\/hi\/read\/knowing-how-to-stop\/\?world=neutral#story-sankalpa$/);
  await expect(page.locator('#sankalpa-title')).toHaveText('पाँच सेकंड का ठहराव');
  expect(await read(page,second)).toEqual(record);
  await page.locator('[data-sankalpa-try]').click();
  await page.locator('.sankalpa-return').click();
  await expect(page).toHaveURL(/\/hi\/.*#dharma-yatra$/);
  await expect(page.locator(`[data-yatra-id="${second}"]`)).toHaveAttribute('data-state','completed');
});

test('petals survive long breaks and the available path has a quiet finite ending',async({page})=>{
  await page.goto('/reading-room/');
  const ids=process.env.WEBSITE_RELEASE?editionStoryKeys:ANCHOR_IDS;
  await page.evaluate(({ids,revision})=>{for(const id of ids)localStorage.setItem(`spritual_sankalpa_v1:${id}`,JSON.stringify({version:1,revision,sealedAt:1,triedAt:2}));},{ids,revision:PRACTICE_REVISION});
  await page.reload();
  await expect(page.locator('[data-yatra-id][data-state=completed]')).toHaveCount(ids.length);
  await expect(page.locator('[data-yatra-id][data-state=current]')).toHaveCount(0);
  await expect(page.locator('.header [data-practice-petal].is-tried')).toHaveCount(10);
  await expect(page.locator('[data-yatra-finished]')).toBeVisible();
});

test('responsive timeline and Sankalpa, theme contrast, enlarged Hindi and reduced motion',async({page})=>{
  test.setTimeout(120000);
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  for(const width of [320,390,540,768,959,1024,1440]){
    await page.setViewportSize({width,height:width<700?900:1200});
    await page.goto('/#dharma-yatra');await page.evaluate(()=>document.fonts.ready);
    await page.locator('.yatra-heading').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
    await expect(page.locator('#dharma-yatra-title')).toBeInViewport();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`timeline ${width}`).toBe(true);
    if([320,390,768,1024,1440].includes(width))await page.screenshot({path:resolve(evidence,`timeline-${width}.png`)});
    await openPractice(page);
    await page.locator('[data-sankalpa-hold]').scrollIntoViewIfNeeded();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`practice ${width}`).toBe(true);
    for(const control of await page.locator('.reader-chrome>a,.reader-chrome>button,.reader-chrome>details').all()){
      if(!await control.isVisible())continue;
      const box=(await control.boundingBox())!;
      expect(box.x>=0&&box.x+box.width<=width+1,`reader control ${width}`).toBe(true);
    }
    if(width===768||width===959){
      expect((await page.locator('.reader-language').boundingBox())!.width).toBeLessThan(110);
      await expect(page.locator('#bookmark-place span')).toHaveCSS('clip-path','inset(50%)');
    }
    await expect(page.locator('[data-sankalpa-hold]')).toBeInViewport();
    if([320,390,768,1024,1440].includes(width))await page.screenshot({path:resolve(evidence,`sankalpa-${width}.png`)});
  }
  await page.setViewportSize({width:390,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await openPractice(page,second,'hi');
  const normalSize=await page.locator('.sankalpa-action').evaluate(node=>parseFloat(getComputedStyle(node).fontSize));
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.locator('.sankalpa-action').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThan(normalSize);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Hindi enlarged').toBe(true);
  await page.screenshot({path:resolve(evidence,'sankalpa-hi-large-390.png')});
  await page.locator('[data-sankalpa-seal]').click();
  await expect(page.locator('.sankalpa-ripple')).toHaveCSS('display','none');
  await page.goto('/?world=shiva#dharma-yatra');
  await page.locator('.yatra-heading').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
  expect(await page.locator('[data-yatra-id][data-state=current]').evaluate(node=>getComputedStyle(node).animationName)).toBe('none');
  await page.screenshot({path:resolve(evidence,'timeline-shiva-390.png')});
  expect(errors).toEqual([]);
});

test('practice stays legible in all six worlds, all reader appearances and enlarged English',async({page})=>{
  const parse=(value:string)=>value.match(/[\d.]+/g)!.slice(0,3).map(Number);
  const luminance=(rgb:number[])=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
  const contrast=(fg:string,bg:string)=>{const [a,b]=[luminance(parse(fg)),luminance(parse(bg))].sort((a,b)=>b-a);return (a+.05)/(b+.05);};
  await page.setViewportSize({width:390,height:950});await page.emulateMedia({reducedMotion:'reduce'});
  for(const world of ['neutral','epic','rama','hanuman','shiva','krishna']){
    await page.goto(`/?world=${world}#dharma-yatra`);
    await page.locator('.yatra-heading').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
    const colors=await page.locator('[data-yatra-id][data-state=current]').evaluate(node=>({background:getComputedStyle(node).backgroundColor,text:getComputedStyle(node.querySelector('.chapter-copy h4')!).color}));
    expect(contrast(colors.text,colors.background),`${world} heading`).toBeGreaterThanOrEqual(4.5);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),world).toBe(true);
    await page.screenshot({path:resolve(evidence,`timeline-world-${world}.png`)});
    await page.goto(`/story/${second}/?world=${world}#story-sankalpa`);
    const detailColors=await page.locator('.sankalpa-card').evaluate(node=>({background:getComputedStyle(node).backgroundColor,text:getComputedStyle(node.querySelector('.sankalpa-action')!).color}));
    expect(contrast(detailColors.text,detailColors.background),`${world} overview practice`).toBeGreaterThanOrEqual(4.5);
  }
  await openPractice(page);
  for(const theme of ['light','sepia','dark']){
    await page.locator('#reader-settings-open').click();
    await page.locator(`button[data-reader-theme="${theme}"]`).click();
    await page.locator('button[data-reader-size="28"]').click();
    await page.getByRole('button',{name:'Close settings',exact:true}).click();
    await page.locator('[data-sankalpa-hold]').scrollIntoViewIfNeeded();
    const colors=await page.locator('.sankalpa-card').evaluate(node=>({background:getComputedStyle(node).backgroundColor,text:getComputedStyle(node.querySelector('.sankalpa-action')!).color}));
    expect(contrast(colors.text,colors.background),`${theme} practice`).toBeGreaterThanOrEqual(4.5);
    expect(await page.locator('.sankalpa-action').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeGreaterThanOrEqual(28);
    await page.screenshot({path:resolve(evidence,`sankalpa-appearance-${theme}.png`)});
  }
  await page.setViewportSize({width:320,height:1000});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  await page.locator('[data-sankalpa-seal]').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('[data-sankalpa-seal]').click();
  await expect(page.locator('[data-sankalpa]')).toHaveAttribute('data-practice-state','sealed');
  await page.screenshot({path:resolve(evidence,'sankalpa-en-large-320.png')});
});

test('design evidence shows completed, current and upcoming nodes and the hold ripple',async({page})=>{
  await page.setViewportSize({width:1374,height:1145});
  await page.goto('/reading-room/');
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:resolve(evidence,'after-home.png'),fullPage:true});
  await page.evaluate(({id,revision})=>localStorage.setItem(`spritual_sankalpa_v1:${id}`,JSON.stringify({version:1,revision,sealedAt:100,triedAt:200})),{id:first,revision:PRACTICE_REVISION});
  await page.goto('/#dharma-yatra');await page.reload();await page.evaluate(()=>document.fonts.ready);
  await page.locator('.yatra-heading').evaluate(node=>node.scrollIntoView({block:'start',behavior:'instant'}));
  await expect(page.locator(`[data-yatra-id="${process.env.WEBSITE_RELEASE?editionStoryKeys[1]:second}"]`)).toHaveAttribute('data-state','current');
  await page.screenshot({path:resolve(evidence,'timeline-three-states.png')});
  await page.setViewportSize({width:1469,height:1071});
  await openPractice(page);await page.locator('[data-sankalpa-hold]').scrollIntoViewIfNeeded();
  const box=(await page.locator('[data-sankalpa-hold]').boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.waitForTimeout(900);
  await page.screenshot({path:resolve(evidence,'sankalpa-holding.png')});
  await page.mouse.up();
  expect(await read(page,second)).toBeNull();
  await page.locator('[data-sankalpa-seal]').click();
  await page.screenshot({path:resolve(evidence,'sankalpa-sealed.png')});
});

test('without JavaScript the timeline and practice invitation remain readable',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL:process.env.WEBSITE_URL||'http://127.0.0.1:4190'});
  const page=await context.newPage();await page.goto('/reading-room/#dharma-yatra');
  await expect(page.locator('[data-yatra-id]')).toHaveCount(process.env.WEBSITE_RELEASE?editionStoryKeys.length:10);
  await page.locator(`[data-yatra-id="${second}"] a.yatra-card`).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#sankalpa-title')).toBeVisible();
  await expect(page.locator('[data-seal-controls]')).toBeHidden();
  await context.close();
});
