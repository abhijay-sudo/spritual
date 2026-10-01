import {test,expect} from '@playwright/test';

const active=async(page:any,name:string)=>{
  await expect(page.locator('html')).toHaveAttribute('data-world',name);
  await expect(page.locator(`[data-world-option="${name}"]`)).toHaveAttribute('aria-current','true');
};

test('all six reading worlds are real navigation with durable URL and browser history',async({page})=>{
  await page.goto('/');
  await expect(page.locator('[data-world-option]')).toHaveCount(6);
  await active(page,'neutral');
  await page.getByRole('link',{name:'Krishna',exact:true}).click();
  await expect(page).toHaveURL(/\?world=krishna$/);
  await active(page,'krishna');
  await expect(page.locator('[data-context-art]')).toHaveAttribute('src','/assets/world-krishna.webp');
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('spritual_world_v1'))).toBe('krishna');
  await page.getByRole('link',{name:'Shiva',exact:true}).click();
  await active(page,'shiva');
  await page.goBack();
  await active(page,'krishna');
  await page.getByRole('link',{name:'Still',exact:true}).click();
  await active(page,'neutral');
});

test('story context is honest and an explicit choice overrides it',async({page})=>{
  for(const [path,world] of [
    ['/library/mahabharata/adi/','epic'],
    ['/library/ramayana/bala/','rama'],
    ['/library/ramayana/sundara/','hanuman'],
    ['/library/shiva/vidyeshvara/','shiva']
  ] as const){await page.goto(path);await active(page,world);}
  await page.goto('/library/mahabharata/adi/?world=krishna');
  await active(page,'krishna');
  await expect(page.locator('[data-context-art]')).toHaveAttribute('src','/assets/world-krishna.webp');
});

test('world choice follows language and neutral routes without losing the selected page',async({page})=>{
  await page.goto('/library/ramayana/sundara/?world=hanuman');
  await page.getByRole('link',{name:'हिन्दी',exact:true}).click();
  await expect(page).toHaveURL(/\/hi\/library\/ramayana\/sundara\/\?world=hanuman$/);
  await active(page,'hanuman');
  await page.getByRole('link',{name:'पुस्तकालय',exact:true}).first().click();
  await expect(page).toHaveURL(/\/hi\/library\/\?world=hanuman$/);
  await active(page,'hanuman');
});

test('saved reading becomes a quiet homepage continuation and pause can return to its guide',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('spritual_website_shelf_v1',JSON.stringify({version:1,items:['ramayana/sundara']})));
  await page.goto('/');
  await expect(page.getByRole('link',{name:'Continue your saved guide',exact:false})).toHaveAttribute('href','/library/ramayana/sundara/');
  await page.goto('/pause/?from=%2Flibrary%2Framayana%2Fsundara%2F&world=hanuman');
  await page.locator('#timer-toggle').click();
  await page.locator('#finish').click();
  await expect(page.getByRole('link',{name:'Return to your guide',exact:false})).toHaveAttribute('href','/library/ramayana/sundara/?world=hanuman');
  await page.getByRole('link',{name:'हिन्दी',exact:true}).click();
  await expect(page).toHaveURL(/from=%2Fhi%2Flibrary%2Framayana%2Fsundara%2F/);
});

test('pause controls remain compact and return keeps explicit or neutral world context',async({page})=>{
  for(const width of [390,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto('/pause/?world=hanuman');
    const icon=await page.locator('#share-link svg').boundingBox();
    expect(icon?.width).toBeLessThanOrEqual(20);expect(icon?.height).toBeLessThanOrEqual(20);
  }
  await page.goto('/pause/?from=%2Flibrary%2Framayana%2Fsundara%2F&world=shiva');
  await page.locator('#timer-toggle').click();await page.locator('#finish').click();
  await expect(page.locator('#return-reading')).toHaveAttribute('href','/library/ramayana/sundara/?world=shiva');
  await page.goto('/pause/?from=%2Flibrary%2Framayana%2Fsundara%2F&world=neutral');
  await page.locator('#timer-toggle').click();await page.locator('#finish').click();
  await expect(page.locator('#return-reading')).toHaveAttribute('href','/library/ramayana/sundara/?world=neutral');
});

test('active world chip is visible on narrow deep links and history changes',async({page})=>{
  await page.setViewportSize({width:320,height:760});await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/hi/library/shiva/vidyeshvara/?world=shiva');
  const visible=async(name:string)=>page.locator(`[data-world-option="${name}"]`).evaluate((item)=>{const chip=item.getBoundingClientRect(),rail=item.parentElement!.getBoundingClientRect();return chip.left>=rail.left-1&&chip.right<=rail.right+1;});
  await expect.poll(()=>visible('shiva')).toBe(true);
  await page.getByRole('link',{name:'राम',exact:true}).click();await expect.poll(()=>visible('rama')).toBe(true);
  await page.goBack();await expect.poll(()=>visible('shiva')).toBe(true);
});

test('capture final must-fix evidence from current code',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height,name,path] of [
    [1440,1000,'pause-hanuman-1440','/pause/?world=hanuman'],
    [390,844,'pause-hanuman-390','/pause/?world=hanuman'],
    [390,844,'guide-shiva-hi-390','/hi/library/shiva/vidyeshvara/?world=shiva'],
    [320,760,'guide-shiva-hi-320','/hi/library/shiva/vidyeshvara/?world=shiva']
  ] as const){await page.setViewportSize({width,height});await page.goto(path);await expect(page.locator('html')).toHaveAttribute('data-world',path.includes('shiva')?'shiva':'hanuman');await page.screenshot({path:`docs/qa/contextual-worlds/final-${name}.png`,fullPage:true});}
  await page.setViewportSize({width:390,height:844});await page.goto('/pause/?from=%2Flibrary%2Framayana%2Fsundara%2F&world=shiva');await page.locator('#timer-toggle').click();await page.locator('#finish').click();await expect(page.locator('#return-reading')).toHaveAttribute('href','/library/ramayana/sundara/?world=shiva');await page.screenshot({path:'docs/qa/contextual-worlds/final-pause-return-shiva-390.png',fullPage:true});
});

test('every public surface exposes the chooser and storage failure keeps a usable neutral fallback',async({page})=>{
  for(const path of ['/','/library/','/library/saved/','/pause/','/privacy/','/missing-page/']){
    await page.goto(path);await expect(page.locator('[data-world-option]')).toHaveCount(6);
  }
  await page.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('blocked')};Storage.prototype.setItem=()=>{throw Error('blocked')};});
  await page.goto('/');await active(page,'neutral');
  await page.getByRole('link',{name:'Rama',exact:true}).click();await active(page,'rama');
});

test('reduced motion keeps complete themed content without transitions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?world=hanuman');await active(page,'hanuman');
  await expect(page.locator('[data-context-art]')).toHaveCSS('transition-duration','0s');
  await expect(page.locator('h1')).toBeVisible();
});
