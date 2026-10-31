import {test,expect} from '@playwright/test';
test('footer provides current privacy and correction information',async({page})=>{
 await page.goto('/');await page.locator('footer').getByRole('link',{name:'Privacy',exact:true}).click();
 await expect(page.getByRole('heading',{name:'What this browser remembers'})).toBeVisible();
 await expect(page.locator('main')).not.toContainText('Daily Sankalpa');
 await page.locator('footer').getByRole('link',{name:'Report a correction'}).click();
 await expect(page.locator('main a.primary')).toHaveAttribute('href','https://github.com/abhijay-sudo/spritual/issues/new');
});
test('finishing an episode offers the next episode in the same collection',async({page})=>{
 await page.goto('/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/#page-11');
 const next=page.locator('[data-folio]:visible .chapter-ending a');await expect(next).toContainText('Promises and partings');
 await next.click();await expect(page.locator('h1.reader-story-title')).toHaveText('Promises and partings');
});
