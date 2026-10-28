import {test,expect} from '@playwright/test';
const story='/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/';

test('removing the final saved page restores focus without an exception',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto(story);await page.locator('[data-keep]').click();
 await page.goto('/my-reading/');await expect(page.locator('[data-kept-list] li')).toHaveCount(1);
 await page.getByRole('button',{name:/Remove/}).click();
 await expect(page.locator('[data-kept-list] li')).toHaveCount(0);
 await expect(page.locator('[data-kept-empty]')).toBeVisible();
 await expect(page.getByRole('heading',{name:'Your kept pages'})).toBeFocused();
 await expect(page.locator('[data-storage-status]')).toHaveText('Kept page removed');
 expect(errors).toEqual([]);
});

test('mobile reading appearance changes prose size and survives language navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(story);
 await page.locator('[data-open-dialog="book-appearance"]').click();await page.locator('[data-text-size="26"]').click();
 await expect(page.locator('.folio-prose').first()).toHaveCSS('font-size','26px');
 await page.locator('#book-appearance [data-close-dialog]').click();
 await page.getByRole('link',{name:'Read in Hindi',exact:true}).click();
 await expect(page.locator('.folio-prose').first()).toHaveCSS('font-size','26px');
});


test('mobile next page reveals the beginning of the new scene',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(story);
 await page.getByRole('button',{name:'Next page →',exact:true}).click();
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 const top=await page.locator('[data-folio]:visible h2').evaluate(node=>node.getBoundingClientRect().top);
 expect(top).toBeGreaterThanOrEqual(0);expect(top).toBeLessThan(400);
});
