import {test,expect} from '@playwright/test';
const route='/collections/ramayana/books/valmiki-ramayana/arcs/bala-kanda/stories/ramayana-beginnings/';
test('paper turn uses inert rendered text and rapid reversal cleans up',async({page})=>{
 await page.goto(route);const original=await page.locator('[data-folio]:visible h2').textContent();
 await page.getByRole('button',{name:'Next page →',exact:true}).click();
 await expect(page.locator('.manuscript-turn')).toHaveCount(1);
 expect(await page.locator('.manuscript-turn').evaluate(el=>el.hasAttribute('inert'))).toBe(true);
 await expect(page.locator('.turn-content h2')).toHaveText(original!);
 await expect(page.locator('.manuscript-turn [id]')).toHaveCount(0);
 await page.evaluate(()=>{for(const a of document.getAnimations()){if((a.effect as KeyframeEffect)?.target instanceof HTMLElement&&((a.effect as KeyframeEffect).target as HTMLElement).classList.contains('turn-leaf')){a.pause();a.currentTime=150;}}});
 await page.screenshot({path:'docs/qa/premium-turn-midpoint.png',fullPage:false});
 await page.keyboard.press('ArrowRight');await page.keyboard.press('ArrowLeft');
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');
 await expect(page.locator('.manuscript-turn')).toHaveCount(0,{timeout:2000});
 await expect(page.locator('[data-folio]:visible')).toHaveCount(1);
});
test('reduced motion changes pages immediately without a decorative leaf',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(route);await page.keyboard.press('ArrowRight');
 await expect(page.locator('[data-page-position]')).toHaveText('Page 2 of 11');await expect(page.locator('.manuscript-turn')).toHaveCount(0);
});
