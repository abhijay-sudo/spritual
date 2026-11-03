import {test,expect} from '@playwright/test';
for(const width of [360,390,768,1280])for(const lang of ['','hi/'])test(`manuscript ${lang||'en'} ${width}`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.goto('/'+lang);await page.locator('.manuscript-hero-art').evaluate((im:HTMLImageElement)=>im.decode());
 await expect(page.locator('.manuscript-intro h1')).toBeVisible();await expect(page.locator('.manuscript-primary')).toHaveAttribute('href',/books\/read\/knowing-how-to-stop/);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(await page.locator('.manuscript-hero-art').evaluate((im:HTMLImageElement)=>im.naturalWidth)).toBeGreaterThan(0);
 await expect(page.locator('.manuscript-places a')).toHaveCount(4);await expect(page.locator('.manuscript-cards>a')).toHaveCount(3);
 await page.screenshot({path:`docs/qa/manuscript-${lang?'hi':'en'}-${width}.png`,fullPage:true});
 await page.locator('.manuscript-primary').click();await expect(page.locator('[data-page-position]')).toContainText('1');await page.locator('[data-leaf-step="1"]').click();await expect(page.locator('[data-page-position]')).toContainText('2');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`docs/qa/manuscript-reader-${lang?'hi':'en'}-${width}.png`,fullPage:true});
});
test('share, journey links and keyboard navigation',async({page})=>{await page.goto('/');await page.locator('[data-share-reflection]').click();await expect(page.locator('[data-download]')).toBeEnabled();await page.keyboard.press('Escape');await expect(page.locator('dialog')).toHaveCount(0);for(const a of await page.locator('.manuscript-places a,.manuscript-cards>a').all()){const href=await a.getAttribute('href');const r=await page.request.get(href!);expect(r.status()).toBe(200);}});
