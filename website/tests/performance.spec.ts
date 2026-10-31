import {test,expect} from '@playwright/test';

test.use({deviceScaleFactor:1.75,viewport:{width:412,height:823}});

test('mobile English and Hindi openers select the intermediate delivery size without duplicate full-image downloads',async({page})=>{
 for(const [story,file] of [['knowing-how-to-stop','collection-ramayana'],['the-bow-at-mithila','world-rama'],['across-the-ocean','world-hanuman']])for(const language of ['','/hi'])for(const kind of ['story','read']){
  const images:string[]=[];const record=(request:any)=>{if(request.resourceType()==='image')images.push(request.url());};
  page.on('request',record);
  await page.goto(`${language}/${kind}/${story}/`);
  const art=page.locator('.detail-art img,.reader-art-frame img');await art.evaluate((image:HTMLImageElement)=>image.decode());
  expect(await art.evaluate((image:HTMLImageElement)=>image.currentSrc)).toContain(`${file}-800.avif`);
  expect(images.some(url=>url.endsWith(`${file}.webp`))).toBe(false);
  await expect(art).toBeVisible();await expect(page.locator('h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(412);
  page.off('request',record);
 }
});

test('unsupported picture format still displays the original reviewed WebP',async({page})=>{
 await page.goto('/read/knowing-how-to-stop/');
 const art=page.locator('.reader-art-frame img'),source=page.locator('.reader-art-frame source');
 await art.evaluate((image:HTMLImageElement)=>image.decode());
 // The existing 420ms entrance is unrelated to format fallback geometry.
 await page.waitForTimeout(600);
 const before=await art.boundingBox();
 await source.evaluate((element:HTMLSourceElement)=>{element.type='image/unsupported-test-format';});
 await expect.poll(()=>art.evaluate((image:HTMLImageElement)=>image.currentSrc)).toMatch(/collection-ramayana\.webp$/);
 await art.evaluate((image:HTMLImageElement)=>image.decode());
 expect(await art.boundingBox()).toEqual(before);
 await expect(art).toHaveAttribute('alt','Atmospheric landscape for this collection; not a depiction of this event.');
});
