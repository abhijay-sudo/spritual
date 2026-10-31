import {test,expect,type Page} from '@playwright/test';
import {mkdir} from 'node:fs/promises';

const evidence='docs/qa/collection-home-2026-10-27';
const base=process.env.WEBSITE_URL||'http://127.0.0.1:4190';
const volume=(page:Page,id:string)=>page.locator(`[data-volume="${id}"] .volume-link`);
async function settled(page:Page){
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});
}
async function noOverflow(page:Page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}

for(const entry of ['/','/books/'])test(`${entry} opens a volume, its contents and a real chapter with a route back`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(entry);
  await expect(page.locator('.volume-link')).toHaveCount(4);
  await expect(page.locator('[data-open-story]')).toHaveCount(0);
  const preview=await page.locator('[data-volume="ramayana"] .volume-preview').count()>0;
  await expect(page.locator('[data-volume="ramayana"] .volume-meta')).toContainText(`${preview?28:10} chapters`);
  await volume(page,'ramayana').click();
  await expect(page).toHaveURL(/\/books\/ramayana\/(?:#chapters)?$/);
  await expect(page.locator('#welcome-intro')).toHaveCount(0);
  const chapters=page.locator('#chapters.collection-chapters>li>a, #chapters>.collection-chapters>li>a, #chapters .collection-part .collection-chapters>li>a');
  await expect(chapters).toHaveCount(preview?28:10);
  await expect(chapters.first()).toBeInViewport();
  const chapterPath=await chapters.first().getAttribute('href');
  await chapters.first().click();
  await expect.poll(()=>new URL(page.url()).pathname).toBe(chapterPath);
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('#welcome-intro')).toHaveCount(0);
  await expect(page.locator('.reader-path a')).toHaveAttribute('href','/books/ramayana/');
  await page.locator('.reader-path a').click();
  await expect(page).toHaveURL(/\/books\/ramayana\/(?:#chapters)?$/);
});

for(const id of ['krishna','shiva'])test(`${id} is an honest single-chapter collection, with bilingual contents`,async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/books/');
  await expect(page.locator(`[data-volume="${id}"] .volume-meta`)).toContainText('1 chapter');
  await volume(page,id).click();
  await expect(page).toHaveURL(new RegExp(`/books/${id}/$`));
  await expect(page.locator('#chapters .collection-chapter')).toHaveCount(1);
  await page.locator('.language-link').click();
  await expect(page).toHaveURL(new RegExp(`/hi/books/${id}/$`));
  await expect(page.locator('html')).toHaveAttribute('lang','hi');
  await expect(page.locator('.collection-count')).toContainText('1 अध्याय');
  await page.locator('#chapters .collection-chapter').click();
  await expect(page).toHaveURL(new RegExp(`/hi/books/read/${id==='krishna'?'krishna-mountain':'shiva-river'}/`));
  await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
  await expect(page.locator('.reader-path a')).toHaveAttribute('href',`/hi/books/${id}/`);
});

test('the dedicated story index preserves all sixteen originals and bilingual search recovery',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/books/');
  await page.getByRole('link',{name:/Search all stories/}).click();
  await expect(page).toHaveURL(/\/books\/stories\/$/);
  await expect(page.locator('[data-book-entry]')).toHaveCount(16);
  const paths=await page.locator('[data-book-entry]>a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')));
  expect(new Set(paths).size).toBe(16);
  for(const path of paths){const response=await page.request.get(path!);expect(response.status(),path!).toBe(200);}
  await page.getByRole('searchbox').fill('ध्रुव');
  await expect(page.locator('[data-book-entry]:visible')).toHaveCount(1);
  await expect(page.locator('[data-book-entry]:visible>a')).toHaveAttribute('href','/books/read/dhruva-star/');
  await page.getByRole('searchbox').fill('no-matching-story');
  await expect(page.locator('[data-search-empty]')).toBeVisible();
  await page.getByRole('button',{name:'Clear search',exact:true}).click();
  await expect(page.locator('[data-book-entry]:visible')).toHaveCount(16);
  await page.locator('.language-link').click();
  await expect(page).toHaveURL(/\/hi\/books\/stories\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang','hi');
  await expect(page.locator('[data-book-entry]')).toHaveCount(16);
});

for(const route of ['/books/','/hi/books/'])test(`${route} plays the welcome, completes and can replay without trapping entry`,async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(route);
  const intro=page.locator('#welcome-intro');
  await expect(intro).toBeVisible();
  expect(await intro.evaluate(element=>element.getAnimations({subtree:true}).some(a=>a.playState==='running'))).toBe(true);
  await expect(intro).not.toBeVisible({timeout:5000});
  await expect(page.locator('[data-welcome-focus]')).toBeFocused();
  await page.locator('[data-replay-welcome]').click();
  await expect(intro).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(intro).not.toBeVisible();
  await expect(page.locator('[data-replay-welcome]')).toBeFocused();
  expect(await intro.evaluate(element=>element.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
});

test('hash destinations and reduced motion bypass automatic welcome; reduced replay stays static',async({page})=>{
  await page.goto('/books/#collections');
  await expect(page.locator('[data-replay-welcome]')).not.toHaveAttribute('hidden','');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await expect(page.locator('#collections')).toBeInViewport();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/hi/books/');
  await expect(page.locator('[data-replay-welcome]')).not.toHaveAttribute('hidden','');
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
  await page.locator('[data-replay-welcome]').click();
  await expect(page.locator('#welcome-intro')).toBeVisible();
  expect(await page.locator('#welcome-intro').evaluate(el=>el.getAnimations({subtree:true}).length)).toBe(0);
  await page.getByRole('button',{name:/Spritual में प्रवेश करें/}).click();
  await expect(page.locator('#welcome-intro')).not.toBeVisible();
});

test('without JavaScript every volume still leads through contents to readable pages',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,baseURL:base,viewport:{width:390,height:844}});
  try{
    const page=await context.newPage();
    await page.goto('/');
    await volume(page,'shiva').click();
    await expect(page).toHaveURL(/\/books\/shiva\/$/);
    await page.locator('#chapters .collection-chapter').click();
    await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
    await expect(page.locator('.folio-prose>p:visible')).toHaveCount(3);
    await expect(page.locator('.page-controls')).not.toBeVisible();
    await page.locator('.reader-path a').click();
    await expect(page).toHaveURL(/\/books\/shiva\/$/);
  }finally{await context.close();}
});

for(const width of [320,390,768,1440])test(`collections and chapter contents fit ${width}px`,async({page})=>{
  await mkdir(evidence,{recursive:true});
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [route,label] of [['/','home'],['/books/','shelf'],['/books/shiva/','shiva'],['/hi/books/krishna/','krishna-hi']]){
    await page.goto(route);await settled(page);await noOverflow(page);
    // Capture the actual scrolled experience, including viewport-deferred art.
    for(const cover of await page.locator('.volume-cover').all()){
      await cover.scrollIntoViewIfNeeded();
      await expect.poll(()=>cover.locator('img').first().evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0&&getComputedStyle(img).display!=='none')).toBe(true);
    }
    await page.evaluate(()=>scrollTo(0,0));await settled(page);
    await page.screenshot({path:`${evidence}/${label}-${width}.png`,fullPage:true});
  }
});
