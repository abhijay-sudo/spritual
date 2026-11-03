import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const ocean='/books/read/ramayana-across-the-ocean/';
const visible='[data-folio]:visible';
const evidence='docs/qa/ramayana-release-2026-10-27';
async function ready(page:Page){
  await expect(page.locator('html')).toHaveClass(/scene-enhanced/);
  await expect(page.locator(visible)).toHaveCount(1);
  await page.evaluate(()=>document.fonts.ready.then(()=>undefined));
}
async function capture(page:Page,name:string,fullPage=true){
  await mkdir(evidence,{recursive:true});
  if(fullPage){
    await expect(page.locator('.scene-ghost')).toHaveCount(0);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  await page.screenshot({path:`${evidence}/${name}.png`,fullPage});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
}
async function press(page:Page,selector:string,touch:boolean){
  if(touch)await page.locator(selector).tap();else await page.locator(selector).click();
}

for(const language of ['en','hi'])test(`shelf → chapter → pages → keep → return (${language})`,async({page,isMobile},info)=>{
  const prefix=language==='hi'?'/hi':'';
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(prefix+'/books/');
  await page.locator(`a[href="${prefix}/books/ramayana/"]`).click();
  await expect(page.locator('.collection-chapters a')).toHaveCount(28);
  await page.locator(`.collection-chapters a[href="${prefix}${ocean}"]`).click();await ready(page);
  await page.locator('[data-open-dialog="book-contents"]').click();
  await expect(page.locator('#book-contents .other-chapters a')).toHaveCount(28);
  await page.locator('#book-contents [data-close-dialog]').click();
  await press(page,'[data-leaf-step="1"]',isMobile);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-mainaka');
  await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  await press(page,'[data-leaf-step="1"]',isMobile);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-surasa');
  await page.locator('[data-keep]').click();
  await page.locator('[data-open-dialog="book-appearance"]').click();
  await page.locator('[data-text-size="26"]').click();
  await page.locator('button[data-page-theme="evening"]').click();
  await page.locator('#book-appearance [data-close-dialog]').click();
  await capture(page,`${info.project.name}-${language}-large-evening`);
  await page.locator(`.reader-path a[href="${prefix}/books/ramayana/"]`).click();
  await page.locator('[data-kept-list] a').click();await ready(page);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-surasa');
  await expect(page.locator(`${visible} .folio-prose`)).toHaveCSS('font-size','26px');
  await page.locator('[data-language-switch]').first().click();await ready(page);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-surasa');
  await press(page,'[data-leaf-step="1"]',isMobile);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-lanka');
  await press(page,'[data-chapter-step="1"]',isMobile);await ready(page);
  await expect(page.locator(visible)).toHaveAttribute('id','lanka-gate');
  await press(page,'[data-chapter-step="-1"]',isMobile);await ready(page);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-lanka');
  expect(errors).toEqual([]);
});

test('paper fronts and reverse faces, rapid input, keyboard and history recover',async({page},info)=>{
  await page.goto(ocean+'#ocean-departure');await ready(page);
  await page.evaluate(()=>{
    const original=Element.prototype.animate;
    Element.prototype.animate=function(frames,options){
      const effect=original.call(this,frames,options);
      if(this.matches('.turn-sheet,.turn-face')){effect.pause();effect.currentTime=60;}
      return effect;
    };
  });
  await page.locator('[data-leaf-step="1"]').click();
  const sheet=page.locator('.turn-sheet');await expect(sheet).toHaveCount(1);
  await expect(sheet).toHaveAttribute('aria-hidden','true');
  await sheet.evaluate(e=>{for(const a of e.getAnimations({subtree:true})){a.pause();a.currentTime=60;}});
  await expect(sheet.locator('.turn-front')).toHaveCSS('visibility','visible');
  await expect(sheet.locator('.turn-back')).toHaveCSS('visibility','hidden');
  await capture(page,`${info.project.name}-paper-front`,false);
  // Compare actual pixels with the opposite face explicitly hidden. This catches
  // mirrored backface leaks that CSS declarations/interaction checks can miss.
  const sharp=(await import('sharp')).default;
  const region=await page.locator('.book-leaves').boundingBox();
  const clip={x:Math.max(0,region!.x+8),y:Math.max(0,region!.y+10),width:Math.min(region!.width-16,300),height:Math.min(200,page.viewportSize()!.height-Math.max(0,region!.y+10)-80)};
  const actual=await page.screenshot({clip});
  await sheet.locator('.turn-back').evaluate(e=>e.remove());
  const reference=await page.screenshot({clip});
  const a=await sharp(actual).resize(100,100).removeAlpha().raw().toBuffer(),b=await sharp(reference).resize(100,100).removeAlpha().raw().toBuffer();
  expect(a.reduce((sum,n,i)=>sum+Math.abs(n-b[i]),0)/a.length).toBeLessThan(1);
  // A new backwards/forwards step recreates the full sheet for reverse QA.
  await page.locator('[data-leaf-step="-1"]').click();
  await page.locator('[data-leaf-step="1"]').click();
  await sheet.evaluate(async e=>{for(const a of e.getAnimations({subtree:true}))a.currentTime=510;await new Promise(requestAnimationFrame);});
  await expect(sheet.locator('.turn-front')).toHaveCSS('visibility','hidden');
  await expect(sheet.locator('.turn-back')).toHaveCSS('visibility','visible');
  await capture(page,`${info.project.name}-paper-reverse`,false);
  await sheet.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.play()));
  await expect(sheet).toHaveCount(0);
  // Keep exercising real controls with unbounded input after animation cleanup.
  await page.locator(visible).focus();
  await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-surasa');
  await page.locator('[data-open-dialog="book-contents"]').click();
  await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-open-dialog="book-contents"]')).toBeFocused();
  await page.goBack();await expect(page.locator(visible)).toHaveAttribute('id','ocean-mainaka');
  await page.goForward();await expect(page.locator(visible)).toHaveAttribute('id','ocean-surasa');
});

test('backward turns reveal the correct face on both sides of the hinge',async({page},info)=>{
  await page.addInitScript(()=>{
    const original=Element.prototype.animate;
    Element.prototype.animate=function(k,o){const a=original.call(this,k,o);if(this.matches('.turn-sheet,.turn-face')){a.pause();a.currentTime=60;}return a;};
  });
  await page.goto(ocean+'#ocean-mainaka');await ready(page);
  await page.locator('[data-leaf-step="-1"]').click();
  const sheet=page.locator('.turn-sheet');
  await expect(sheet).toHaveAttribute('data-direction','back');
  await expect(sheet.locator('.turn-front')).toHaveCSS('visibility','hidden');
  await expect(sheet.locator('.turn-back')).toHaveCSS('visibility','visible');
  await capture(page,`${info.project.name}-backward-start`,false);
  await sheet.evaluate(async e=>{for(const a of e.getAnimations({subtree:true}))a.currentTime=510;await new Promise(requestAnimationFrame);});
  await expect(sheet.locator('.turn-front')).toHaveCSS('visibility','visible');
  await expect(sheet.locator('.turn-back')).toHaveCSS('visibility','hidden');
  await capture(page,`${info.project.name}-backward-finish`,false);
  await sheet.evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>a.play()));
  await expect(sheet).toHaveCount(0);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-departure');
});

test('motion reduction, denied storage and missing artwork keep reading available',async({page,isMobile},info)=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{
    Storage.prototype.getItem=()=>{throw new DOMException('Denied','SecurityError');};
    Storage.prototype.setItem=()=>{throw new DOMException('Denied','SecurityError');};
  });
  await page.route('**/assets/illustrated/*',r=>r.abort());
  await page.goto(ocean);await ready(page);
  await expect(page.locator('[data-art-recovery]')).toBeVisible();
  await press(page,'[data-leaf-step="1"]',isMobile);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-mainaka');
  await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  await page.locator('[data-keep]').click();
  await expect(page.locator('[data-storage-status]').first()).toContainText('could not save');
  await capture(page,`${info.project.name}-recovery`);
});

test('responsive paper layout and controls fit narrow, tablet and desktop widths',async({page},info)=>{
  await page.goto('/books/read/ramayana-a-home-in-panchavati/#panchavati-counsel');await ready(page);
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await capture(page,`${info.project.name}-${width}`);
    const targets=await page.locator('.page-controls button:visible,.page-controls a:visible').evaluateAll(nodes=>nodes.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));
    for(const target of targets){expect(target.w).toBeGreaterThanOrEqual(44);expect(target.h).toBeGreaterThanOrEqual(44);}
  }
});

test('Android browser touch swipes turn horizontally and scroll vertically',async({page,browserName,isMobile,context})=>{
  test.skip(browserName!=='chromium'||!isMobile,'CDP touch injection available only in Chromium mobile emulation; other projects test taps.');
  await page.goto(ocean+'#ocean-departure');await ready(page);
  await page.locator(`${visible} h2`).scrollIntoViewIfNeeded();
  const cdp=await context.newCDPSession(page);
  async function touch(from:{x:number,y:number},to:{x:number,y:number}){
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[from]});
    for(let i=1;i<=8;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:from.x+(to.x-from.x)*i/8,y:from.y+(to.y-from.y)*i/8}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  }
  const box=await page.locator(`${visible} h2`).boundingBox();
  const y=Math.min(700,Math.max(200,box!.y+box!.height+20));
  await touch({x:330,y},{x:90,y:y+4});
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-mainaka');
  await page.locator(`${visible} h2`).scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>scrollY);
  await touch({x:200,y:650},{x:200,y:350});
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(before+50);
  await expect(page.locator(visible)).toHaveAttribute('id','ocean-mainaka');
  await cdp.detach();
});
