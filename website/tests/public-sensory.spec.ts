import {test, expect} from '@playwright/test';

test('360px masthead keeps all existing EN and Hindi tools on one row', async ({page}) => {
  await page.setViewportSize({width:360,height:844});
  for(const path of ['/','/hi/']){
    await page.goto(path);await page.evaluate(()=>document.fonts.ready);
    const bounds=await page.locator('.header-actions').evaluate(el=>[...el.children].filter(n=>n.getClientRects().length).map(n=>n.getBoundingClientRect().toJSON()));
    expect(Math.max(...bounds.map(r=>r.top))-Math.min(...bounds.map(r=>r.top))).toBeLessThan(8);
    for(const r of bounds){expect(r.left).toBeGreaterThanOrEqual(0);expect(r.right).toBeLessThanOrEqual(360);}
    await expect(page.locator('.desktop-nav a')).toHaveCount(4);
    await page.locator('.theme-picker summary').click();await expect(page.locator('.theme-popover')).toBeVisible();
  }
});

test('print mats preserve existing image, caption and reading column without clipping', async ({page}) => {
  for(const width of [320,360,768,1440]){
    await page.setViewportSize({width,height:1000});
    for(const path of ['/story/knowing-how-to-stop/','/read/knowing-how-to-stop/']){
      await page.goto(path);await page.evaluate(()=>document.fonts.ready);
      const frame=page.locator(path.startsWith('/story')?'.detail-art':'.reader-art-frame');
      const result=await frame.evaluate(el=>{const r=el.getBoundingClientRect(),img=el.querySelector('img')!,i=img.getBoundingClientRect();return {outer:r.toJSON(),image:i.toJSON(),loaded:img.complete&&img.naturalWidth>0,padding:parseFloat(getComputedStyle(el).paddingLeft),overflow:document.documentElement.scrollWidth>innerWidth};});
      expect(result.loaded).toBe(true);expect(result.overflow).toBe(false);expect(result.padding).toBeGreaterThanOrEqual(8);
      expect(result.image.left).toBeGreaterThan(result.outer.left+7);expect(result.image.right).toBeLessThan(result.outer.right-7);
      expect(result.image.bottom).toBeLessThanOrEqual(result.outer.bottom);
    }
  }
});

test('page turn commits before immediate save and interrupt cancels every delayed effect', async ({page}) => {
  await page.goto('/read/a-ring-brings-hope/');await page.waitForTimeout(1800);
  await page.locator('.reader-scene').first().locator('.leaf-turn-forward').evaluate((el:HTMLButtonElement)=>el.click());
  await expect(page).toHaveURL(/#scene-the-ring$/);
  await page.locator('#bookmark-place').click();
  const bookmark=await page.evaluate(()=>JSON.parse(localStorage.getItem('spritual_reading_v2')!).bookmarks[0]);
  expect(bookmark.sceneId).toBe('the-ring');
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0);
  await page.locator('#scene-the-ring .leaf-turn-forward').evaluate((el:HTMLButtonElement)=>el.click());
  await page.mouse.wheel(0,100);await page.waitForTimeout(100);
  const scroll=await page.evaluate(()=>scrollY);await page.waitForTimeout(600);
  expect(await page.evaluate(()=>scrollY)).toBeCloseTo(scroll,0);
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0);
});

test('rapid turns, reduced-motion changes and hidden-page interruption never leave a veil', async ({page}) => {
  await page.goto('/read/a-ring-brings-hope/');await page.waitForTimeout(1800);
  await page.evaluate(()=>{document.querySelector<HTMLButtonElement>('.reader-scene .leaf-turn-forward')!.click();for(const selector of ['#scene-the-ring .leaf-turn-forward','#scene-message-returning .leaf-turn-back'])document.querySelector<HTMLButtonElement>(selector)!.click();});
  await page.locator('#scene-the-ring .leaf-turn-forward').evaluate((el:HTMLButtonElement)=>el.click());
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0);
  await expect(page.locator('#scene-message-returning')).toBeInViewport();
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('#scene-message-returning .leaf-turn-back').evaluate((el:HTMLButtonElement)=>el.click());
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('.reader-page-turn-veil')).toHaveCount(0);
  expect(await page.locator('.parallel-block').first().evaluate(el=>getComputedStyle(el).opacity)).toBe('1');
});

test('focus and context controls remain usable after interrupting entry and paragraph effects', async ({page}) => {
  await page.goto('/read/knowing-how-to-stop/');
  await page.keyboard.press('Tab');await page.locator('#editorial-source-toggle').click();
  await page.keyboard.press('Escape');await expect(page.locator('#editorial-source-toggle')).toBeFocused();
  await page.locator('#manuscript-focus').click();await expect(page.locator('#manuscript-exit-focus')).toBeFocused();
  await page.mouse.wheel(0,150);await page.keyboard.press('Escape');await expect(page.locator('#manuscript-focus')).toBeFocused();
  await expect(page.locator('.reader-chrome')).toBeVisible();
  expect(await page.locator('.reader-chrome').evaluate((el:HTMLElement)=>el.inert)).toBe(false);
});

test('actual doubled text reflows without a decorative overflow clip in both languages', async ({page}) => {
  test.setTimeout(60000);
  for(const lang of ['en','hi'])for(const width of [320,360,1440])for(const route of ['/','/story/knowing-how-to-stop/','/read/knowing-how-to-stop/','/pause/']){
    await page.setViewportSize({width,height:1000});await page.goto(`${lang==='hi'?'/hi':''}${route}`);await page.evaluate(()=>document.fonts.ready);
    await page.addStyleTag({content:'html,body{overflow-x:visible!important}'});
    await page.evaluate(()=>{
      const nodes=[...document.querySelectorAll<HTMLElement>('body *')].filter(el=>el.getClientRects().length&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent?.trim())&&!['SCRIPT','STYLE'].includes(el.tagName));
      const sizes=nodes.map(el=>({el,size:parseFloat(getComputedStyle(el).fontSize)}));
      for(const {el,size} of sizes)el.style.fontSize=`${size*2}px`;
    });
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),`${lang} ${route} at ${width}px`).toBeLessThanOrEqual(width);
    if(route==='/'){
      const bounds=await page.locator('.arrival-art').evaluate(el=>({frame:el.getBoundingClientRect().toJSON(),caption:el.querySelector('figcaption')!.getBoundingClientRect().toJSON()}));
      expect(bounds.caption.top).toBeGreaterThanOrEqual(bounds.frame.top);
      expect(bounds.caption.bottom).toBeLessThanOrEqual(bounds.frame.bottom);
    }
  }
});
