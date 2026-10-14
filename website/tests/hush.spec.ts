import {test,expect} from '@playwright/test';

test('one responsive navigation exposes every primary destination and compact controls',async({page})=>{
 await page.goto('/');await expect(page.locator('header nav[aria-label="Main navigation"]')).toHaveCount(1);await expect(page.locator('#mobile-menu')).toHaveCount(0);
 for(const name of ['Yatra','Today','Quiet moment','Saved'])await expect(page.locator('.desktop-nav').getByRole('link',{name,exact:true})).toBeVisible();
 await expect(page.getByRole('button',{name:'Change text size'})).toBeVisible();await expect(page.locator('.theme-picker summary')).toBeVisible();
 await page.locator('.desktop-nav').getByRole('link',{name:'Today',exact:true}).click();await expect(page).toHaveURL(/\/daily\/$/);
});

test('single navigation reflows without a duplicate menu',async({page})=>{
 for(const width of [320,390,1024]){await page.setViewportSize({width,height:900});await page.goto('/hi/');await expect(page.locator('header nav')).toHaveCount(1);await expect(page.locator('.desktop-nav')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});

test('one header, immediate reading, optional breath and keyboard preferences',async({page})=>{
 await page.goto('/');await expect(page.locator('.library-subnav')).toHaveCount(0);await expect(page.locator('[data-settled-enter]')).toHaveAttribute('href','/read/what-makes-a-person-admirable/?journey=ramayana');await expect(page.locator('[data-breath-start]')).toBeEnabled();await expect(page.locator('.art-play')).toHaveCount(0);await expect(page.locator('.arrival-section, #dharma-yatra, .recovery-today, .journey-section')).toHaveCount(4);
 const preferences=page.getByRole('button',{name:'Choose reading preferences'});await preferences.focus();await page.keyboard.press('Enter');await expect(page.getByRole('heading',{name:'How would you like to read?'})).toBeVisible();await page.keyboard.press('Escape');await expect(preferences).toBeFocused();
 await page.goto('/library/');const search=await page.locator('#story-search').boundingBox(),cards=await page.locator('.story-results').boundingBox();expect(search!.y).toBeLessThan(cards!.y);await expect(page.locator('[data-story-card]')).toHaveCount(10);
});

test('focus mode removes chrome from keyboard navigation and Escape returns focus',async({page})=>{
 await page.goto('/hi/library/mahabharata/adi/');await page.locator('#focus-reading').click();await expect(page.locator('#exit-focus')).toBeFocused();expect(await page.locator('.header').evaluate(el=>(el as HTMLElement).inert)).toBe(true);await page.keyboard.press('Escape');await expect(page.locator('#focus-reading')).toBeFocused();await expect(page.locator('#exit-focus')).toBeHidden();expect(await page.locator('.header').evaluate(el=>(el as HTMLElement).inert)).toBe(false);
});

test('pause runs smoothly without storing completion; reduced motion disables decorative loops',async({page})=>{
 await page.goto('/pause/');await page.clock.install();await expect(page.locator('#finish')).toBeHidden();await expect(page.locator('#timer-reset')).toBeHidden();await expect(page.locator('.library-subnav')).toHaveCount(0);await page.locator('#timer-toggle').click();await expect(page.locator('body')).toHaveClass(/ritual-running/);await expect(page.locator('#finish')).toBeVisible();await expect(page.locator('#timer-reset')).toBeHidden();
 await page.clock.runFor(250);const offset=await page.locator('#timer-progress').evaluate(el=>parseFloat((el as SVGElement).style.strokeDashoffset));expect(offset).toBeGreaterThan(.1);expect(offset).toBeLessThan(.4);
 await page.emulateMedia({reducedMotion:'reduce'});expect(await page.locator('.orb-center').evaluate(el=>getComputedStyle(el).animationName)).toBe('none');await page.locator('#timer-toggle').click();await expect(page.locator('#timer-reset')).toBeVisible();await expect(page.locator('body')).not.toHaveClass(/ritual-running/);expect(await page.evaluate(()=>localStorage.length)).toBe(0);
});

for(const width of [390,768,1024,1440,1680])test(`Hush visual states and reflow at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});await page.emulateMedia({reducedMotion:'reduce'});
 for(const [name,path] of [['home','/'],['library','/library/'],['guide','/library/mahabharata/adi/'],['pause-idle','/pause/']]){
  await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/hush-${name}-${width}.png`,fullPage:name==='home'});
 }
 const begin=await page.locator('#timer-toggle').boundingBox();expect(begin!.y+begin!.height).toBeLessThan(900);await page.locator('#timer-toggle').click();await page.screenshot({path:`test-results/hush-pause-running-${width}.png`});await page.locator('#finish').click();await expect(page.locator('#finish-heading')).toBeFocused();await page.screenshot({path:`test-results/hush-pause-complete-${width}.png`});
 if(width===390){for(const [name,path] of [['home','/hi/'],['library','/hi/library/'],['guide','/hi/library/mahabharata/adi/'],['pause','/hi/pause/']]){await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`test-results/hush-hi-${name}.png`,fullPage:name==='home'});}}
});
