import {test,expect} from '@playwright/test';
import {mkdir} from 'node:fs/promises';
declare global { interface Window { welcomeStates: string[]; welcomeImageLoaders: HTMLImageElement[]; } }
const evidence='docs/qa/site-polish-2026-10-24';
test('complete opening visits eight figures in eight single portraits and reaches a real book',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await mkdir(evidence,{recursive:true});
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(() => {
    const state = window;
    state.welcomeStates = [];
    new MutationObserver(records => {
      const changes=records.filter(record=>(record.target as HTMLElement).id==='welcome-intro');
      // Preserve intermediate labels even if two 35ms-spaced mutations share one callback.
      for(const record of changes)if(record.oldValue)state.welcomeStates.push(record.oldValue);
      const current=(changes.at(-1)?.target as HTMLElement|undefined)?.dataset.state;
      if(current)state.welcomeStates.push(current);
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['data-state'], attributeOldValue: true });
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const intro=page.locator('#welcome-intro');
  await expect(intro).toBeVisible();
  await expect(page.getByRole('button',{name:'Enter Spritual'})).toBeFocused();
  await expect(intro).not.toBeVisible({timeout:6500});
  const states = await page.evaluate(() => [...new Set(window.welcomeStates)]);
  expect(states).toEqual(['ganesha','lakshmi','rama','hanuman','shiva','durga','krishna','saraswati','welcome','revealing','complete']);
  await expect(page.locator('.hero-actions a').first()).toBeFocused();
  expect(await page.evaluate(()=>document.getAnimations().filter(a=>a.effect&&((a.effect as KeyframeEffect).target as Element)?.closest('#welcome-intro')).length)).toBe(0);
  await page.getByRole('link',{name:'Find your story',exact:true}).click();
  await page.locator('[data-open-story]').first().click();
  await page.locator('[data-open-book]').click();
  await expect(page).toHaveURL(/\/books\/read\//);
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  expect(errors).toEqual([]);
});
test('skip is immediate and keyboard safe while every homepage refresh plays again',async({page})=>{
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await expect(page.locator('.hero-actions a').first()).toBeFocused();
  await page.reload();await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Enter');await expect(page.locator('#welcome-intro')).not.toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.classList.contains('welcome-playing'))).toBe(false);
  await page.getByRole('button',{name:'Replay welcome'}).click();
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button',{name:'Replay welcome'})).toBeFocused();
  await page.waitForTimeout(1200);
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('rapid replay and dismissal never leave a stale timer or scroll lock',async({page})=>{
  await page.goto('/#experience');
  const replay=page.getByRole('button',{name:'Replay welcome'});
  for(let i=0;i<3;i++){await replay.click();await expect(page.locator('#welcome-intro')).toBeVisible();await page.keyboard.press('Escape');}
  await page.waitForTimeout(1300);
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  expect(await page.evaluate(()=>getComputedStyle(document.body).overflow)).not.toBe('hidden');
});
test('scroll intent dismisses the opening and native scrolling remains available',async({page})=>{
  await page.goto('/?intro=replay');
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.mouse.wheel(0,260);
  await expect(page.locator('#welcome-intro')).not.toBeVisible({timeout:500});
  await page.mouse.wheel(0,260);
  await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(0);
  await page.waitForTimeout(1100);
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('deep links and anchored history returns preserve immediate access',async({page})=>{
  await page.goto('/#journey');await expect(page.locator('#journey')).toBeInViewport();await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.getByRole('link',{name:'Open the bookshelf',exact:true}).click();await page.goBack();
  await expect(page.locator('#welcome-intro')).not.toBeVisible();await expect(page).toHaveURL(/#journey$/);
  await page.goto('/?world=epic');await expect(page).toHaveURL(/\/reading-room\/\?world=epic/);
  await expect(page.locator('#welcome-intro')).toHaveCount(0);
});
test('every direct homepage visit plays even when a previous session marker exists',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('spritual_welcome_seen_v1','1'));
  for(let visit=0;visit<3;visit++){
    await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
    await page.getByRole('button',{name:'Enter Spritual'}).click();
    await expect(page.locator('#welcome-intro')).not.toBeVisible();
    await page.goto('/books/');await expect(page.locator('#welcome-intro')).toHaveCount(0);
  }
});
test('unanchored homepage visits through Back and Forward play again',async({page})=>{
  await page.goto('/books/');
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goBack();await expect(page).toHaveURL(/\/books\/$/);
  await page.goForward();await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('#welcome-intro')).toBeVisible();await page.keyboard.press('Escape');
  await page.goto('/books/');await page.goBack();
  await expect(page.locator('#welcome-intro')).toBeVisible();await page.keyboard.press('Enter');
  await expect(page.locator('.hero-actions a').first()).toBeFocused();
});
test('persisted pageshow restarts an eligible restored homepage while keeping bypasses',async({page})=>{
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');
  // Exercise the browser-cache restoration event explicitly; this does not claim actual BFCache eligibility.
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:false})));
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  for(let restore=0;restore<2;restore++){
    await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    await expect(page.locator('#welcome-intro')).toBeVisible();
    await page.keyboard.press('Escape');await expect(page.locator('#welcome-intro')).not.toBeVisible();
  }
  await page.goto('/#journey');
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.locator('#welcome-intro')).not.toBeVisible();await expect(page.locator('#journey')).toBeInViewport();
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
  await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('reduced motion bypasses automatically and explicit replay is static',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?intro=replay');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.getByRole('button',{name:'Replay welcome'}).click();
  await expect(page.locator('#welcome-intro')).toBeVisible();await expect(page.locator('#welcome-intro')).toHaveAttribute('data-state','welcome');
  expect(await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  await page.getByRole('button',{name:'Enter Spritual'}).click();await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('changing motion preference and hiding the page terminate the cinematic sequence',async({page})=>{
  await page.goto('/?intro=replay');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.emulateMedia({reducedMotion:'no-preference'});await page.getByRole('button',{name:'Replay welcome'}).click();
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('denied session storage does not prevent playback or change book storage',async({page})=>{
  await page.addInitScript(()=>{
    localStorage.setItem('spritual_book_places_v1','preserve-me');
    Object.defineProperty(window,'sessionStorage',{configurable:true,get(){throw new Error('Denied');}});
  });
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Enter');await expect(page.locator('#welcome-intro')).not.toBeVisible();
  expect(await page.evaluate(()=>localStorage.getItem('spritual_book_places_v1'))).toBe('preserve-me');
  await page.reload();await expect(page.locator('#welcome-intro')).toBeVisible();await page.keyboard.press('Escape');
  expect(await page.evaluate(()=>localStorage.getItem('spritual_book_places_v1'))).toBe('preserve-me');
  await page.getByRole('link',{name:'Find your story',exact:true}).click();await expect(page).toHaveURL(/#journey$/);
});
test('asset failure leaves immediate usable HTML',async({page})=>{
  await page.route('**/welcome/portraits/*.webp',route=>route.abort());await page.goto('/');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.waitForTimeout(1100);await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.getByRole('link',{name:'Find your story',exact:true}).click();await expect(page).toHaveURL(/#journey$/);
});
test('slow artwork cannot interrupt someone after they start using the page',async({page})=>{
  await page.route('**/welcome/portraits/*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,1700));await route.continue();});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.getByRole('link',{name:'Find your story',exact:true}).click();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/#journey$/);await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
for(const reason of ['early input','deadline'] as const)test(`${reason} abandons pending responsive artwork and keeps reading usable`,async({page})=>{
  await page.addInitScript(()=>{
    window.welcomeImageLoaders=[];
    window.Image=new Proxy(window.Image,{construct(Target,args){
      const image=Reflect.construct(Target,args) as HTMLImageElement;
      window.welcomeImageLoaders.push(image);return image;
    }});
  });
  let release!:()=>void;
  const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/welcome/portraits/*.webp',async route=>{
    await gate;
    // The browser may already have canceled the intercepted image request.
    await route.continue().catch(()=>{});
  });
  try{
    await page.goto('/',{waitUntil:'domcontentloaded'});
    await expect.poll(()=>page.evaluate(()=>window.welcomeImageLoaders.filter(image=>image.src.includes('/welcome/portraits/')).length)).toBe(8);
    if(reason==='early input')await page.getByRole('link',{name:'Find your story',exact:true}).click();
    await expect.poll(()=>page.evaluate(()=>window.welcomeImageLoaders.filter(image=>!image.hasAttribute('src')&&!image.hasAttribute('srcset')).length),{timeout:1500,intervals:[50]}).toBe(8);
    await expect(page.locator('#welcome-intro')).not.toBeVisible();
    release();
    await page.waitForTimeout(1000);
    await expect(page.locator('#welcome-intro')).not.toBeVisible();
    expect(await page.locator('[data-welcome-art]').evaluateAll(images=>images.every(image=>!image.hasAttribute('src')))).toBe(true);
    if(reason==='deadline')await page.getByRole('link',{name:'Find your story',exact:true}).click();
    await expect(page).toHaveURL(/#journey$/);
  }finally{release();}
});
test('missing script fails open but a stale seen marker cannot suppress restored playback',async({page})=>{
  await page.route('**/welcome/welcome.js',route=>route.abort());await page.goto('/');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();await expect(page.locator('[data-replay-welcome]')).not.toBeVisible();
  await page.unroute('**/welcome/welcome.js');
  await page.evaluate(()=>sessionStorage.setItem('spritual_welcome_seen_v1','unrecognised-old-value'));
  await page.reload();await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await expect(page.locator('[data-replay-welcome]')).toBeVisible();
});
test('pending autoplay yields when a visitor opens another dialog before art is ready',async({page})=>{
  await page.route('**/welcome/portraits/*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,650));await route.continue();});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await page.locator('.header-cta').click();await expect(page.locator('#launch-dialog')).toBeVisible();
  await page.waitForTimeout(1000);await expect(page.locator('#welcome-intro')).not.toBeVisible();await expect(page.locator('#launch-dialog')).toBeVisible();
});
test('replay retries failed media and a subsequent homepage visit still plays',async({page})=>{
  await page.route('**/welcome/portraits/*.webp',route=>route.abort());await page.goto('/#journey');
  await page.getByRole('button',{name:'Replay welcome'}).click();await page.waitForTimeout(200);
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.unroute('**/welcome/portraits/*.webp');await page.getByRole('button',{name:'Replay welcome'}).click();
  await expect(page.locator('#welcome-intro')).toBeVisible();await page.keyboard.press('Escape');
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test.describe('plain HTML',()=>{
  test.use({javaScriptEnabled:false});
  test('website and bookshelf work without an intro script',async({page})=>{
    await page.goto('/');await expect(page.locator('#welcome-intro')).not.toBeVisible();
    await expect(page.locator('[data-replay-welcome]')).not.toBeVisible();
    await page.getByRole('link',{name:'Open the bookshelf',exact:true}).click();await expect(page).toHaveURL(/\/books\/$/);
  });
});
for(const width of [320,390,768,1440])test(`opening and welcome fit ${width}px with a usable exit`,async({page})=>{
  await mkdir(evidence,{recursive:true});
  await page.setViewportSize({width,height:width===1440?900:844});
  await page.clock.install({time:new Date('2026-10-24T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-24T00:00:01Z'));
  await page.goto('/?intro=replay',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#welcome-intro')).toHaveAttribute('data-state','ganesha');
  expect(await page.locator('#welcome-intro').boundingBox()).toEqual({x:0,y:0,width,height:width===1440?900:844});
  await page.clock.runFor(250);
  // Sample the shared animation timeline without finishing future scenes or the final exit.
  // The unpaused journey above exercises actual playback rather than these composition captures.
  await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=250;}));
  expect(await page.locator('#welcome-intro').evaluate(e=>e.scrollWidth<=innerWidth)).toBe(true);
  const pair=await page.locator('.welcome-figure').evaluateAll(figures=>figures.filter(figure=>Number(getComputedStyle(figure).opacity)>.05).map(figure=>{const box=figure.getBoundingClientRect();return {id:(figure as HTMLElement).dataset.deity,left:box.left,right:box.right};}));
  expect(pair.map(figure=>figure.id)).toEqual(['ganesha']);
  expect((pair[0].left+pair[0].right)/2).toBeCloseTo(width/2,0);
  await page.screenshot({path:`${evidence}/single-ganesha-${width}.png`});
  await page.clock.runFor(3500);
  await expect(page.locator('#welcome-intro')).toHaveAttribute('data-state','welcome');
  await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=3700;}));
  expect(await page.locator('.welcome-title').evaluate(e=>Number(getComputedStyle(e).opacity))).toBe(0);
  const openingWidth=(await page.locator('.welcome-book').boundingBox())!.width;
  await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=4900;}));
  const expanded=await page.locator('.welcome-book').boundingBox();
  expect(expanded!.width).toBeGreaterThan(openingWidth);expect(expanded!.height).toBeGreaterThan(width===1440?900:844);
  await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=5150;}));
  expect(await page.locator('.welcome-title').evaluate(e=>Number(getComputedStyle(e).opacity))).toBe(1);
  await page.screenshot({path:`${evidence}/single-welcome-${width}.png`});
  await expect(page.getByRole('button',{name:'Enter Spritual'})).toBeInViewport();
  await page.getByRole('button',{name:'Enter Spritual'}).click();
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});
test('phone touch skip opens the Hindi story journey and supports short landscape',async({browser})=>{
  const context=await browser.newContext({baseURL:process.env.WEBSITE_URL||`http://127.0.0.1:${process.env.WELCOME_PUBLIC?'4190':'4194'}`,viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'no-preference',recordVideo:{dir:'artifacts/site-polish-2026-10-24/video',size:{width:390,height:844}}});
  const page=await context.newPage();
  await page.goto('/?intro=replay');await expect(page.locator('#welcome-intro')).toBeVisible();
  await expect(page.locator('#welcome-intro')).not.toBeVisible({timeout:8000});
  await page.getByRole('link',{name:'Find your story',exact:true}).tap();await page.locator('[data-open-story]').first().tap();
  await page.locator('[data-story-language="hi"]').tap();await expect(page.locator('#story-prose')).toHaveAttribute('lang','hi');
  await page.locator('[data-close-story]').tap();await page.setViewportSize({width:844,height:390});
  await page.getByRole('button',{name:'Replay welcome'}).tap();await expect(page.locator('#welcome-intro')).toBeVisible();
  await expect(page.getByRole('button',{name:'Enter Spritual'})).toBeInViewport();await page.getByRole('button',{name:'Enter Spritual'}).tap();
  await page.getByRole('button',{name:'Replay welcome'}).tap();
  await expect(page.locator('#welcome-intro')).toBeVisible();
  const touch=await context.newCDPSession(page);
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:420,y:240}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:420,y:130}]});
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  await expect(page.locator('#welcome-intro')).not.toBeVisible({timeout:500});
  await touch.detach();
  await context.close();
});

test('a failed later portrait fails open instead of presenting a blank deity phase',async({page})=>{
  await page.route('**/welcome/portraits/krishna-*.webp',route=>route.abort());
  await page.goto('/?intro=replay');
  await page.waitForTimeout(1000);
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.getByRole('link',{name:'Find your story',exact:true}).click();
  await expect(page).toHaveURL(/#journey$/);
});
test('high-density phones receive separate sharp portraits and no framing or duplicate masters',async({browser})=>{
  const context=await browser.newContext({baseURL:process.env.WEBSITE_URL||`http://127.0.0.1:${process.env.WELCOME_PUBLIC?'4190':'4194'}`,viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  try{
    const page=await context.newPage();const requests:string[]=[];
    page.on('request',r=>{if(r.url().includes('/welcome/portraits/'))requests.push(r.url());});
    await page.goto('/?intro=replay');
    await expect(page.locator('#welcome-intro')).toBeVisible();
    await expect(page.locator('.welcome-arch,.welcome-horizon')).toHaveCount(0);
    const assets=await page.locator('[data-welcome-art]').evaluateAll(images=>images.map(image=>({src:(image as HTMLImageElement).currentSrc,width:(image as HTMLImageElement).naturalWidth,height:(image as HTMLImageElement).naturalHeight})));
    expect(assets).toHaveLength(8);
    for(const asset of assets){expect(asset.src).toMatch(/-1280\.webp$/);expect(asset.width).toBe(asset.src.includes('saraswati-')?721:720);expect(asset.height).toBe(1280);}
    expect(new Set(requests).size).toBe(8);
    await expect(page.locator('#welcome-intro')).not.toBeVisible({timeout:6500});
  }finally{await context.close();}
});
test('4K desktop canvas keeps bounded full portraits without enlarging their source pixels',async({page})=>{
  await page.setViewportSize({width:3840,height:2160});
  await page.clock.install({time:new Date('2026-10-24T00:00:00Z')});
  await page.clock.pauseAt(new Date('2026-10-24T00:00:01Z'));
  await page.goto('/?intro=replay',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#welcome-intro')).toHaveAttribute('data-state','ganesha');
  const geometry=await page.locator('[data-welcome-art]').first().evaluate(image=>({natural:(image as HTMLImageElement).naturalHeight,rendered:image.getBoundingClientRect().height}));
  expect(geometry.natural).toBeGreaterThanOrEqual(geometry.rendered);
  await page.clock.runFor(320);
  await page.locator('#welcome-intro').evaluate(e=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=320;}));
  await page.screenshot({path:`${evidence}/single-ganesha-3840.png`});
  await page.getByRole('button',{name:'Enter Spritual'}).click();
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});

test('all motion shares a browser timeline and survives a stalled main thread without restarting',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#welcome-intro')).toBeVisible();
  const evidence=await page.locator('#welcome-intro').evaluate(async dialog=>{
    await new Promise(requestAnimationFrame);
    const effects=dialog.getAnimations({subtree:true});
    const origins=effects.map(animation=>animation.startTime);
    const before=effects.map(animation=>animation.currentTime as number);
    const end=performance.now()+700;
    while(performance.now()<end){ /* Deliberate test-only main-thread stall. */ }
    await new Promise(requestAnimationFrame);
    const after=effects.map(animation=>animation.currentTime as number);
    const visible=Array.from(dialog.querySelectorAll('.welcome-figure')).filter(figure=>Number(getComputedStyle(figure).opacity)>.05).length;
    const keys=effects.flatMap(animation=>(animation.effect as KeyframeEffect).getKeyframes().flatMap(frame=>Object.keys(frame))).filter(key=>!['offset','computedOffset','easing','composite'].includes(key));
    const elapsed=(document.timeline.currentTime as number)-(origins[0] as number);
    const ends=effects.map(animation=>Number(animation.effect!.getComputedTiming().endTime));
    return {origins,before,after,elapsed,ends,visible,count:effects.length,sameEffects:effects.every(effect=>dialog.getAnimations({subtree:true}).includes(effect)),keys:[...new Set(keys)]};
  });
  expect(evidence.count).toBe(27);
  expect(new Set(evidence.origins).size).toBe(1);
  expect(evidence.origins[0]).not.toBeNull();
  expect(evidence.sameEffects).toBe(true);
  expect(evidence.visible).toBeLessThanOrEqual(2);
  expect(evidence.keys.sort()).toEqual(['opacity','transform']);
  expect(evidence.elapsed-evidence.before[0]).toBeGreaterThanOrEqual(650);
  evidence.after.forEach((time,i)=>{
    // Finished effects correctly clamp at their end time; future effects keep the shared clock.
    expect(Math.abs(time-Math.min(evidence.elapsed,evidence.ends[i]))).toBeLessThan(2);
  });
  await page.keyboard.press('Escape');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});

test('a queued old close event cannot cancel a newly restored welcome',async({page})=>{
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.evaluate(()=>{
    dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));
    dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  });
  await page.waitForTimeout(100);
  const intro=page.locator('#welcome-intro');
  await expect(intro).toBeVisible();
  expect(await intro.evaluate(dialog=>dialog.getAnimations({subtree:true}).length)).toBe(27);
  await expect(intro).not.toBeVisible({timeout:6500});
  await expect(page.locator('.hero-actions a').first()).toBeFocused();
});


test('a cold hero gets network priority and a late load cannot begin optional portrait downloads',async({page})=>{
  const portraits:string[]=[];
  page.on('request',r=>{if(r.url().includes('/welcome/portraits/'))portraits.push(r.url());});
  await page.route('**/edition/open-book-*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,1500));await route.continue();});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await expect.poll(()=>page.locator('.invitation-painting img').evaluate((i:HTMLImageElement)=>i.complete&&i.naturalWidth>0)).toBe(true);
  await page.waitForTimeout(300);
  expect(portraits).toHaveLength(0);
  await page.getByRole('button',{name:'Replay welcome'}).click();
  await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');
});

test('production security policy permits playback and cancellation without violations',async({page})=>{
  const violations:string[]=[];
  await page.exposeFunction('reportPolicyViolation',(directive:string)=>violations.push(directive));
  await page.addInitScript(()=>document.addEventListener('securitypolicyviolation',event=>{(window as unknown as {reportPolicyViolation:(v:string)=>void}).reportPolicyViolation(event.violatedDirective);}));
  await page.route('**/',async route=>{
    if(route.request().resourceType()!=='document')return route.continue();
    const response=await route.fetch();
    await route.fulfill({response,headers:{...response.headers(),'content-security-policy':"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'"}});
  });
  await page.goto('/');await expect(page.locator('#welcome-intro')).toBeVisible();
  await page.keyboard.press('Escape');await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.route('**/welcome/portraits/*.webp',async route=>{await new Promise(resolve=>setTimeout(resolve,1400));await route.continue();});
  await page.reload();await page.waitForTimeout(1600);
  expect(violations).toEqual([]);
  await expect(page.getByRole('link',{name:'Find your story',exact:true})).toBeVisible();
});
