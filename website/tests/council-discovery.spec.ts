import {test,expect} from '@playwright/test';
test('mobile home keeps reading action in the first viewport',async({page})=>{
 await page.setViewportSize({width:360,height:800});await page.goto('/');
 const box=await page.locator('.editorial-hero .primary').boundingBox();expect(box).not.toBeNull();expect(box!.y+box!.height).toBeLessThan(800);
 await page.screenshot({path:'docs/qa/council-home-360.png'});
});
test('Hindi search and readable age filters find existing stories',async({page})=>{
 await page.goto('/hi/');const input=page.locator('[data-search-input]');
 await input.fill('गणेश');await expect(page.locator('[data-story]:visible')).toHaveCount(1);
 await input.fill('साहस');expect(await page.locator('[data-story]:visible').count()).toBeGreaterThan(0);
 await input.fill('');await page.locator('.filters summary').click();await page.locator('[data-filter="age"]').selectOption('independent-8+');
 expect(await page.locator('[data-story]:visible').count()).toBeGreaterThan(0);
 await expect(page.locator('[data-filter="age"]')).toContainText('8 वर्ष और अधिक');
});
test('available arc is the first book navigation and story identity stays visible',async({page})=>{
 await page.goto('/collections/mahabharata/books/vyasa-mahabharata/');
 await expect(page.locator('.directory-row').first()).toContainText('Mahaprasthanika');
 await page.locator('.directory-begin').click();await expect(page.locator('h1.reader-story-title')).toBeVisible();
 await expect(page.locator('h1')).toHaveCount(1);
});
