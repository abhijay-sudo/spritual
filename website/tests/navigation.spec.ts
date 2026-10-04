import {test,expect} from '@playwright/test';

test('global navigation has one clear hierarchy at mobile and desktop sizes',async({page})=>{
 for(const width of [360,390,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await expect(page.locator('.world-bar')).toHaveCount(0);
  await expect(page.locator('a[href*="undefined"]')).toHaveCount(0);
  const more=page.getByRole('button',{name:'More'});
  await expect(more).toBeVisible();
  await more.click();
  const menu=page.locator('#mobile-menu');
  for(const [name,href] of [['Stories','/library/'],['Today','/daily/'],['Quiet moment','/pause/'],['Saved','/my-reading/'],['Source guides','/library/sources/'],['Corrections','/corrections/'],['Privacy','/privacy/']] as const){
   await expect(menu.getByRole('link',{name,exact:true})).toHaveAttribute('href',href);
  }
  await expect(menu.getByRole('heading',{name:'Choose the page’s look'})).toBeVisible();
  await expect(menu.getByText(/does not filter stories/)).toBeVisible();
  await page.getByRole('button',{name:/Close/}).click();
 }
});

test('Stories remains the active parent across details, characters and source guides',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 for(const path of ['/library/','/story/a-ring-brings-hope/','/characters/hanuman/','/library/sources/','/library/ramayana/sundara/']){
  await page.goto(path);
  await expect(page.locator('.desktop-nav').getByRole('link',{name:'Stories',exact:true})).toHaveAttribute('aria-current','page');
  await expect(page.locator('a[href*="undefined"]')).toHaveCount(0);
 }
 await page.goto('/daily/');
 await expect(page.locator('.desktop-nav').getByRole('link',{name:'Today',exact:true})).toHaveAttribute('aria-current','page');
 await page.goto('/my-reading/');
 await expect(page.locator('.desktop-nav').getByRole('link',{name:'Saved',exact:true})).toHaveAttribute('aria-current','page');
});

test('story discovery and source guides are distinct but connected journeys',async({page})=>{
 await page.goto('/library/');
 await expect(page.getByRole('heading',{level:1,name:'Find your way into the story.'})).toBeVisible();
 const sourceLink=page.locator('.library-intro').getByRole('link',{name:/Open the source archive/});
 await expect(sourceLink).toHaveAttribute('href','/library/sources/');
 await sourceLink.click();
 await expect(page.getByRole('heading',{level:1,name:'Source guides'})).toBeVisible();
 await expect(page.getByRole('link',{name:/All stories/}).first()).toHaveAttribute('href','/library/');
 await expect(page.locator('.library-subnav').getByRole('link',{name:'Source guides',exact:true})).toHaveAttribute('aria-current','page');
 await page.goto('/library/saved/');
 await expect(page).toHaveURL(/\/library\/saved\/$/);
 await expect(page.getByRole('link',{name:/All saved items/}).first()).toHaveAttribute('href','/my-reading/');
});

test('reader contents, character context and return path preserve the reading place',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/read/hanumans-first-conversation/');
 await expect(page.getByRole('link',{name:'Back to story overview'})).toHaveAttribute('href','/story/hanumans-first-conversation/');
 const contents=page.locator('.reader-contents');
 await contents.locator('summary').click();
 await expect(contents.getByRole('link')).toHaveCount(5);
 const secondScene=contents.getByRole('link').nth(1);
 const target=await secondScene.getAttribute('href');
 await secondScene.click();
 await expect(contents).not.toHaveAttribute('open','');
 await expect.poll(async()=>Math.round((await page.locator(target!).boundingBox())!.y)).toBeLessThan(110);

 const character=page.locator('[data-character]').first();
 await character.click();
 const fullPage=page.getByRole('link',{name:'Open full page'});
 await expect(fullPage).toHaveAttribute('href',/\/characters\/[a-z0-9-]+\/\?from=%2Fread%2Fhanumans-first-conversation%2F/);
 await fullPage.click();
 const back=page.getByRole('link',{name:/Back to reading/});
 await expect(back).toHaveAttribute('href',/\/read\/hanumans-first-conversation\/#block-/);
 await back.click();
 await expect(page).toHaveURL(/\/read\/hanumans-first-conversation\/.*#block-/);
});

test('reader contents stays fully inside narrow viewports',async({page})=>{
 for(const width of [320,390]){
  await page.setViewportSize({width,height:844});
  await page.goto('/read/hanumans-first-conversation/');
  const contents=page.locator('.reader-contents');
  await contents.locator('summary').click();
  const panel=contents.locator('nav');
  await expect(panel).toBeVisible();
  const panelBox=await panel.boundingBox();
  expect(panelBox!.x).toBeGreaterThanOrEqual(12);
  expect(panelBox!.x+panelBox!.width).toBeLessThanOrEqual(width-12);
  for(const link of await panel.getByRole('link').all()){
   const box=await link.boundingBox();
   expect(box!.x).toBeGreaterThanOrEqual(panelBox!.x);
   expect(box!.x+box!.width).toBeLessThanOrEqual(panelBox!.x+panelBox!.width);
  }
  await expect(panel.getByRole('link',{name:/01/})).toBeVisible();
  await expect(panel.getByRole('link',{name:'Reflection'})).toBeVisible();
  await expect(panel.getByRole('link',{name:'Source context'})).toBeVisible();
 }
});

test('explicit reader sections outrank saved progress and survive language changes',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/read/a-ring-brings-hope/');
 const revision=await page.locator('#reading-data').evaluate(node=>JSON.parse(node.textContent!).revision);
 await page.evaluate(({revision})=>localStorage.setItem('spritual_reading_v2',JSON.stringify({version:2,preferences:{language:'en',theme:'light',textSize:20,interests:[]},progress:{'a-ring-brings-hope':{storyId:'a-ring-brings-hope',contentRevision:revision,language:'en',sceneId:'careful-approach',blockId:'approach-2',blockOffsetRatio:.65,updatedAt:100}},bookmarks:[],onboarding:null})),{revision});

 await page.goto('/read/a-ring-brings-hope/');
 await expect(page).toHaveURL(/#block-approach-2$/);
 await page.locator('.reader-contents summary').click();
 await page.locator('.reader-contents').getByRole('link',{name:'Reflection'}).click();
 await expect(page).toHaveURL(/#story-reflection$/);
 await page.locator('.reader-language a[lang="hi"]').click();
 await expect(page).toHaveURL(/\/hi\/read\/a-ring-brings-hope\/#story-reflection$/);
 await expect(page.locator('html')).toHaveAttribute('lang','hi');
 await expect.poll(async()=>Math.round((await page.locator('#story-reflection').boundingBox())!.y)).toBeLessThan(420);

 await page.goto('/read/a-ring-brings-hope/#story-source');
 await expect(page).toHaveURL(/#story-source$/);
 await expect.poll(async()=>Math.round((await page.locator('#story-source').boundingBox())!.y)).toBeLessThan(650);
 await expect(page.locator('.reader-language a[lang="hi"]')).toHaveAttribute('href','/hi/read/a-ring-brings-hope/#story-source');
 await page.waitForTimeout(600);
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('spritual_reading_v2')!).progress['a-ring-brings-hope']);
 expect(saved.blockId).toBe('approach-2');
 expect(saved.updatedAt).toBe(100);
});

test('Hindi keeps the same navigation model and direct daily context',async({page})=>{
 await page.goto('/hi/');
 await expect(page.getByRole('link',{name:'आज की कथा शुरू करें'})).toHaveAttribute('href',/^\/hi\/read\//);
 await page.getByRole('button',{name:'और'}).click();
 const menu=page.locator('#mobile-menu');
 for(const name of ['कथाएँ','आज','शांत पल','सहेजा','स्रोत-मार्गदर्शिकाएँ'])await expect(menu.getByRole('link',{name,exact:true})).toBeVisible();
 await menu.getByRole('link',{name:'आज',exact:true}).click();
 await expect(page.getByRole('link',{name:/सभी कथाएँ/})).toHaveAttribute('href','/hi/library/');
});

test('Saved hub brings story reading and legacy source-guide saves together',async({page})=>{
 await page.goto('/library/ramayana/sundara/');
 await page.getByRole('button',{name:'Save this place',exact:true}).click();
 await page.goto('/my-reading/');
 await expect(page.getByRole('heading',{level:1,name:'Saved & reading'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Saved source guides'})).toBeVisible();
 await expect(page.locator('#saved-guide-list')).toContainText('Sundara Kanda');
 await expect(page.locator('#manage-saved-guides')).toBeVisible();
 await expect(page.locator('#manage-saved-guides')).toHaveAttribute('href','/library/saved/');
});

test('returning readers see Continue immediately and reader language stays in the top chrome',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/read/a-ring-brings-hope/');
 for(const item of await page.locator('.reader-language>*').all()){const box=await item.boundingBox();expect(box?.height).toBeGreaterThanOrEqual(44);}
 await page.locator('[data-block-id]').nth(3).scrollIntoViewIfNeeded();
 await page.waitForTimeout(500);
 await page.goto('/');
 const band=page.locator('#continue-reading');
 await expect(band).toBeVisible();
 const box=await band.boundingBox();
 expect(box!.y).toBeLessThan(260);
});
