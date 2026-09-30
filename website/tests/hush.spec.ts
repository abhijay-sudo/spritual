import {test,expect} from '@playwright/test';

test('mobile menu exposes every destination, traps focus, closes on Escape and restores focus',async({page})=>{
 await page.goto('/');const toggle=page.locator('#menu-toggle');await toggle.click();await expect(page.locator('#mobile-menu')).toBeVisible();await expect(toggle).toHaveAttribute('aria-expanded','true');
 for(const name of ['Library','Quiet moment','Approach','Questions','Saved places'])await expect(page.locator('#mobile-menu').getByRole('link',{name,exact:true})).toBeVisible();
 for(let i=0;i<10;i++){await page.keyboard.press('Tab');expect(await page.evaluate(()=>!!document.activeElement?.closest('#mobile-menu'))).toBe(true);}
 await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(page.locator('body')).not.toHaveClass(/menu-open/);
 await toggle.click();await page.locator('#mobile-menu').getByRole('link',{name:'Approach',exact:true}).click();await expect(page).toHaveURL(/#approach$/);await expect(page.locator('#mobile-menu')).not.toBeVisible();
});

test('mobile menu backdrop closes and desktop resize restores ordinary navigation',async({page})=>{
 await page.goto('/hi/');await page.locator('#menu-toggle').click();await page.mouse.click(10,840);await expect(page.locator('#mobile-menu')).not.toBeVisible();await page.locator('#menu-toggle').click();await page.setViewportSize({width:1024,height:900});await expect(page.locator('#mobile-menu')).not.toBeVisible();await expect(page.locator('.desktop-nav')).toBeVisible();await expect(page.locator('body')).not.toHaveClass(/menu-open/);
});

test('one header, equal hero choices, six blocks, tools-first library and keyboard moment selection',async({page})=>{
 await page.goto('/');await expect(page.locator('.library-subnav')).toHaveCount(0);await expect(page.locator('.hero-actions a')).toHaveCount(2);await expect(page.locator('.art-play')).toHaveCount(0);await expect(page.locator('main > section')).toHaveCount(6);
 await page.locator('[data-moment="0"]').focus();await page.keyboard.press('ArrowDown');await expect(page.locator('[data-moment="1"]')).toBeFocused();await expect(page.locator('[data-moment="1"]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('.reflection-card')).toHaveAttribute('data-mood','focus');await page.locator('.reflection-card').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.reflection-card').evaluate(el=>new DOMMatrixReadOnly(getComputedStyle(el).transform).isIdentity)).toBe(true);
 await page.goto('/library/');const search=await page.locator('#library-search').boundingBox(),art=await page.locator('.book-grid').boundingBox();expect(search!.y).toBeLessThan(art!.y);
});

test('focus mode removes chrome from keyboard navigation and Escape returns focus',async({page})=>{
 await page.goto('/hi/library/mahabharata/adi/');await page.locator('#focus-reading').click();await expect(page.locator('#exit-focus')).toBeFocused();expect(await page.locator('.header').evaluate(el=>(el as HTMLElement).inert)).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('#focus-reading')).toBeFocused();await expect(page.locator('#exit-focus')).toBeHidden();expect(await page.locator('.header').evaluate(el=>(el as HTMLElement).inert)).toBe(false);
});

test('pause runs smoothly without storing completion; reduced motion disables decorative loops',async({page})=>{
 await page.goto('/pause/');await page.clock.install();await expect(page.locator('#finish')).toBeHidden();await expect(page.locator('#timer-reset')).toBeHidden();await expect(page.locator('.library-subnav')).toHaveCount(0);await page.locator('#timer-toggle').click();await expect(page.locator('body')).toHaveClass(/ritual-running/);await expect(page.locator('#finish')).toBeVisible();await expect(page.locator('#timer-reset')).toBeHidden();
 await page.clock.runFor(250);const offset=await page.locator('#timer-progress').evaluate(el=>parseFloat((el as SVGElement).style.strokeDashoffset));expect(offset).toBeGreaterThan(.1);expect(offset).toBeLessThan(.4);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.timer-dial>div').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.locator('#timer-toggle').click();await expect(page.locator('#timer-reset')).toBeVisible();await expect(page.locator('body')).not.toHaveClass(/ritual-running/);expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});

for(const width of [390,768,1024,1440,1680])test(`Hush visual states and reflow at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 for(const [name,path] of [['home','/'],['library','/library/'],['guide','/library/mahabharata/adi/'],['pause-idle','/pause/']]){
  await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/hush-${name}-${width}.png`,fullPage:name==='home'});
 }
 const begin=await page.locator('#timer-toggle').boundingBox();expect(begin!.y+begin!.height).toBeLessThan(900);await page.locator('#timer-toggle').click();await page.screenshot({path:`test-results/hush-pause-running-${width}.png`});await page.locator('#finish').click();await expect(page.locator('#finish-heading')).toBeFocused();await page.screenshot({path:`test-results/hush-pause-complete-${width}.png`});
 if(width===390){for(const [name,path] of [['home','/hi/'],['library','/hi/library/'],['guide','/hi/library/mahabharata/adi/'],['pause','/hi/pause/']]){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/hush-hi-${name}.png`,fullPage:name==='home'});}}
});
