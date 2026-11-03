import {test,expect} from '@playwright/test';
const route='/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/';
test('shared mesh turn cleans up after rapid reversal',async({page})=>{
 await page.goto(route);await page.getByRole('button',{name:'Next page →',exact:true}).click();
 await expect(page.locator('.paper-surface')).toHaveCount(1);await expect(page.locator('.paper-surface')).toHaveAttribute('aria-hidden','true');
 await expect(page.locator('.book-leaves')).toHaveAttribute('data-paper-engine',/webgl2|css-curl/);
 await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowLeft');await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 await expect(page.locator('.paper-surface')).toHaveCount(0,{timeout:2000});await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
});
test('reduced motion changes pages immediately without a decorative leaf',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');await expect(page.locator('.paper-surface')).toHaveCount(0);
});
