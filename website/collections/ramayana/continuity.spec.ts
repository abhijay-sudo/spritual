import {test,expect,type Page} from '@playwright/test';

const ocean='/books/read/ramayana-across-the-ocean/';
const lanka='/books/read/ramayana-through-lanka-at-night/';
const shelf='/books/ramayana/';
const savedKey='spritual_book_places_v1';
const localPage='[data-folio]:visible';

async function ready(page:Page){
  await expect(page.locator('html')).toHaveClass(/book-enhanced/);
  await expect(page.locator('html')).toHaveClass(/scene-enhanced/);
  await expect(page.locator(localPage)).toHaveCount(1);
}
async function appearance(page:Page){
  await expect(page.locator('body')).toHaveAttribute('data-page-theme','evening');
  await expect(page.locator(`${localPage} .folio-prose`)).toHaveCSS('font-size','26px');
  await page.locator('[data-open-dialog="book-appearance"]').click();
  await expect(page.locator('[data-text-size="26"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('button[data-page-theme="evening"]')).toHaveAttribute('aria-pressed','true');
  await page.locator('#book-appearance [data-close-dialog]').click();
}
async function chooseAppearance(page:Page){
  await page.locator('[data-open-dialog="book-appearance"]').click();
  await page.locator('[data-text-size="26"]').click();
  await page.locator('button[data-page-theme="evening"]').click();
  await page.locator('#book-appearance [data-close-dialog]').click();
}
async function swipe(page:Page,direction:'forward'|'back'){
  const start=direction==='forward'?300:90,end=direction==='forward'?90:300;
  await page.locator('.book-leaves').dispatchEvent('pointerdown',{pointerType:'touch',isPrimary:true,pointerId:41,clientX:start,clientY:400});
  await page.locator('.book-leaves').dispatchEvent('pointerup',{pointerType:'touch',isPrimary:true,pointerId:41,clientX:end,clientY:405});
}

for(const prefix of ['', '/hi'])test(`native chapter controls preserve adjacent pages ${prefix||'English'}`,async({page})=>{
  await page.goto(prefix+ocean+'#ocean-lanka');await ready(page);
  await expect(page.locator('[data-leaf-step="1"]')).toBeHidden();
  const next=page.locator('[data-chapter-step="1"]');
  await expect(next).toBeVisible();
  await expect(next).toHaveAttribute('href',prefix+lanka);
  const chapterNumber=Number(await page.locator('[data-reader]').getAttribute('data-chapter-number'));
  await next.click();await expect(page).toHaveURL(prefix+lanka);await ready(page);
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-chapter-number',String(chapterNumber+1));
  await expect(page.locator(localPage)).toHaveAttribute('id','lanka-gate');
  await expect(page.locator('[data-leaf-step="-1"]')).toBeHidden();
  const previous=page.locator('[data-chapter-step="-1"]');
  await expect(previous).toHaveAttribute('href',prefix+ocean+'#ocean-lanka');
  await previous.click();await expect(page).toHaveURL(prefix+ocean+'#ocean-lanka');await ready(page);
  await expect(page.locator(localPage)).toHaveAttribute('id','ocean-lanka');
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-current-page','3');
  await page.locator('[data-leaf-step="-1"]').click();
  await expect(page.locator('[data-chapter-step="1"]')).toBeHidden();
  await expect(page.locator('[data-leaf-step="1"]')).toBeVisible();
});

test('keyboard and touch-style turns cross chapters in both directions',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto(ocean+'#ocean-lanka');await ready(page);
  await page.locator(localPage).focus();await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(lanka);await ready(page);
  await page.locator(localPage).focus();await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(ocean+'#ocean-lanka');await ready(page);
  await expect(page.locator(localPage)).toHaveAttribute('id','ocean-lanka');
  await swipe(page,'forward');await expect(page).toHaveURL(lanka);await ready(page);
  await swipe(page,'back');await expect(page).toHaveURL(ocean+'#ocean-lanka');await ready(page);
  await expect(page.locator(localPage)).toHaveAttribute('id','ocean-lanka');
});

for(const prefix of ['', '/hi'])test(`contents exposes all 28 ordered chapters and the active chapter ${prefix||'English'}`,async({page})=>{
  await page.goto(prefix+ocean+'#ocean-surasa');await ready(page);
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-chapter-count','28');
  const chapterNumber=Number(await page.locator('[data-reader]').getAttribute('data-chapter-number'));
  await page.locator('[data-open-dialog="book-contents"]').click();
  const contents=page.locator('#book-contents');
  await expect(contents.locator('.folio-contents a')).toHaveCount(4);
  await expect(contents.locator('.other-chapters a')).toHaveCount(28);
  expect(await contents.locator('[data-chapter-index]').evaluateAll(rows=>rows.map(row=>Number(row.getAttribute('data-chapter-index'))))).toEqual(Array.from({length:28},(_,i)=>i+1));
  expect(await contents.locator('.contents-chapter-number').allTextContents()).toEqual(Array.from({length:28},(_,i)=>String(i+1).padStart(2,'0')));
  const current=contents.locator('.other-chapters a[aria-current="page"]');
  await expect(current).toHaveCount(1);await expect(current).toHaveAttribute('href',prefix+ocean);
  await expect(contents.locator(`[data-chapter-index="${chapterNumber}"] a`)).toHaveAttribute('aria-current','page');
  const links=await contents.locator('.other-chapters a').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
  expect(new Set(links).size).toBe(28);
  const target=contents.locator('.other-chapters a').last(),targetURL=await target.getAttribute('href');
  await target.click();await expect(page).toHaveURL(targetURL!);await ready(page);
  await expect(page.locator('[data-reader]')).toHaveAttribute('data-chapter-number','28');
});

test('explicit text size and evening paper survive chapter and language navigation',async({page})=>{
  await page.goto(ocean+'#ocean-lanka');await ready(page);await chooseAppearance(page);await appearance(page);
  await page.locator('[data-chapter-step="1"]').click();await expect(page).toHaveURL(lanka);await ready(page);await appearance(page);
  await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();
  await expect(page).toHaveURL('/hi'+lanka+'#lanka-gate');await ready(page);await appearance(page);
  await page.reload();await ready(page);await appearance(page);
});

test('denied storage does not prevent applying reading preferences or turning a page',async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{
    Storage.prototype.getItem=function(){throw new DOMException('Storage blocked','SecurityError');};
    Storage.prototype.setItem=function(){throw new DOMException('Storage blocked','SecurityError');};
  });
  await page.goto(ocean+'#ocean-departure');await ready(page);await chooseAppearance(page);await appearance(page);
  await page.locator('[data-leaf-step="1"]').click();
  await expect(page.locator(localPage)).toHaveAttribute('id','ocean-mainaka');await appearance(page);
  expect(errors).toEqual([]);
});

for(const width of [390,1440])test(`duplex turns retain heading typography and reach the opposite paper face at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  // Freeze the real paper animation, not a replacement effect. This permits
  // deterministic inspection on both sides of its 90-degree hinge.
  await page.addInitScript(()=>{
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(keyframes,options){
      const effect=animate.call(this,keyframes,options);
      if(this.classList.contains('turn-sheet')&&this.querySelector('.turn-content')){effect.pause();effect.currentTime=0;}
      return effect;
    };
  });
  await page.goto(ocean+'#ocean-departure');await ready(page);
  await page.evaluate(()=>document.fonts.ready.then(()=>undefined));
  const typography=()=>page.locator(`${localPage} h2`).evaluate(heading=>{
    const s=getComputedStyle(heading);
    return {text:heading.textContent,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,spacing:s.letterSpacing,margin:s.marginBottom,width:heading.getBoundingClientRect().width};
  });
  const original=await typography();
  for(const direction of ['forward','back'] as const){
    await page.locator(`[data-leaf-step="${direction==='forward'?1:-1}"]`).click();
    const sheet=page.locator('.turn-sheet');await expect(sheet).toHaveCount(1);
    await expect(sheet).toHaveAttribute('data-direction',direction);
    await expect(sheet).toHaveAttribute('aria-hidden','true');
    expect(await sheet.evaluate(element=>(element as HTMLElement).inert)).toBe(true);
    await expect(sheet.locator('.turn-front')).toHaveCount(1);await expect(sheet.locator('.turn-back')).toHaveCount(1);
    await expect(sheet.locator('[data-folio], [id]')).toHaveCount(0);
    await expect(page.locator(localPage)).toHaveCount(1);
    const cloned=await sheet.locator('.turn-content h2').evaluate(heading=>{
      const s=getComputedStyle(heading);
      return {text:heading.textContent,font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,line:s.lineHeight,spacing:s.letterSpacing,margin:s.marginBottom,width:heading.getBoundingClientRect().width};
    });
    const expected=direction==='forward'?original:await typography();
    const {width:cloneWidth,...cloneStyle}=cloned,{width:originalWidth,...originalStyle}=expected;
    expect(cloneStyle).toEqual(originalStyle);
    // At the start of a backwards turn the page is mirrored by its transform;
    // its absolute projected width must still equal the semantic page width.
    expect(Math.abs(Math.abs(cloneWidth)-originalWidth)).toBeLessThanOrEqual(3);
    const sample=await sheet.evaluate(async element=>{
      const effect=element.getAnimations()[0],duration=Number(effect.effect!.getTiming().duration);
      effect.currentTime=duration*.75;await new Promise(requestAnimationFrame);
      const middle=new DOMMatrixReadOnly(getComputedStyle(element).transform).m11;
      effect.currentTime=duration-.01;await new Promise(requestAnimationFrame);
      const finish=new DOMMatrixReadOnly(getComputedStyle(element).transform);
      return {duration,middle,endCos:finish.m11,endSin:finish.m13};
    });
    expect(sample.duration).toBeGreaterThan(0);
    expect(direction==='forward'?sample.middle<0:sample.middle>0).toBe(true);
    expect(sample.endCos).toBeCloseTo(direction==='forward'?-1:1,3);
    expect(Math.abs(sample.endSin)).toBeLessThan(.01);
    await sheet.evaluate(element=>element.getAnimations()[0].play());
    await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  }
});

for(const mode of ['off','reduced'] as const)test(`paper motion remains absent with ${mode} motion while reading works`,async({page})=>{
  await page.addInitScript(()=>{
    (window as any).__paperTurnCalls=0;
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(keyframes,options){
      if(this.classList.contains('turn-sheet'))(window as any).__paperTurnCalls++;
      return animate.call(this,keyframes,options);
    };
  });
  if(mode==='reduced')await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(ocean+'#ocean-departure');await ready(page);
  if(mode==='off'){
    await page.locator('[data-scene-toggle]').click();
    await expect(page.locator('[data-scene-toggle]')).toHaveAttribute('aria-pressed','false');
  }
  await page.locator('[data-leaf-step="1"]').click();await expect(page.locator(localPage)).toHaveAttribute('id','ocean-mainaka');
  await page.locator('[data-leaf-step="-1"]').click();await expect(page.locator(localPage)).toHaveAttribute('id','ocean-departure');
  await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  expect(await page.evaluate(()=>(window as any).__paperTurnCalls)).toBe(0);
});

test('legacy kept war pages resolve to their new chapter without rewriting saved data',async({page})=>{
  for(const prefix of ['', '/hi'])for(const folio of ['war-last-message','war-medicine']){
    const language=prefix?'hi':'en',oldRoute=prefix+'/books/read/ramayana-war-and-its-cost/';
    const target=prefix+'/books/read/ramayana-at-lankas-gates/#'+folio;
    const original=JSON.stringify({version:1,places:[{id:'ramayana-war-and-its-cost',lang:language,title:'My kept war chapter',route:oldRoute,folio,revision:'prior-edition'},{id:'ramayana-across-the-ocean',lang:'en',title:'Another kept chapter',route:ocean,folio:'ocean-surasa',revision:'untouched-edition'}]});
    await page.goto(prefix+shelf);
    await page.evaluate(({key,value})=>localStorage.setItem(key,value),{key:savedKey,value:original});
    await page.reload();
    await page.locator(`[data-kept-list] a[href="${oldRoute}#${folio}"]`).click();
    await expect(page).toHaveURL(target);await ready(page);
    await expect(page.locator(localPage)).toHaveAttribute('id',folio);
    expect(await page.evaluate(key=>localStorage.getItem(key),savedKey)).toBe(original);
  }
});

test('without JavaScript native adjacent chapters and legacy recovery remain operable',async({browser},testInfo)=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL:String(testInfo.project.use.baseURL),viewport:{width:390,height:844}});
  try{
    const page=await context.newPage();
    await page.goto(lanka);
    const previous=page.locator('[data-static-chapter-navigation] a[rel="prev"]');
    await expect(previous).toBeVisible();await expect(previous).toHaveAttribute('href',ocean+'#ocean-lanka');
    await previous.click();await expect(page).toHaveURL(ocean+'#ocean-lanka');
    await expect(page.locator('[data-folio]:visible')).toHaveCount(4);
    for(const prefix of ['', '/hi'])for(const folio of ['war-last-message','war-medicine']){
      const target=prefix+'/books/read/ramayana-at-lankas-gates/#'+folio;
      await page.goto(prefix+'/books/read/ramayana-war-and-its-cost/#'+folio);
      const recovery=page.locator(`[data-legacy-folio][href="${target}"]`);
      await expect(recovery).toBeVisible();await recovery.click();await expect(page).toHaveURL(target);
      await expect(page.locator(`[data-folio][id="${folio}"]`)).toBeVisible();
    }
  }finally{await context.close();}
});

test('the settled reverse face visually matches its facing leaf, without mirrored prose',async({page})=>{
  const {default:sharp}=await import('sharp');
  await page.setViewportSize({width:1440,height:1000});
  await page.addInitScript(()=>{
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(keyframes,options){
      const effect=animate.call(this,keyframes,options);
      if(this.tagName==='IMG')effect.finish();
      if(this.classList.contains('turn-sheet')){effect.pause();effect.currentTime=Number(effect.effect!.getTiming().duration)-.001;}
      return effect;
    };
  });
  await page.goto('/books/read/ramayana-a-home-in-panchavati/#panchavati-counsel');await ready(page);
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('[data-leaf-step="1"]').click();await expect(page.locator('.turn-sheet')).toHaveCount(1);
  const facing=page.locator('.open-book > .frontispiece');
  const turned=await facing.screenshot();
  await page.locator('.turn-sheet').evaluate(el=>el.getAnimations()[0].finish());
  await expect(page.locator('.turn-sheet')).toHaveCount(0);
  const settled=await facing.screenshot();
  const pixels=async(bytes:Buffer)=>sharp(bytes).resize(100,100).removeAlpha().raw().toBuffer();
  const a=await pixels(turned),b=await pixels(settled);
  const error=a.reduce((sum,value,i)=>sum+Math.abs(value-b[i]),0)/a.length;
  // A small border/light difference is expected. A mirrored text face replacing
  // the painting is materially different; this checks rendered pixels, not CSS names.
  expect(error).toBeLessThan(8);
});
