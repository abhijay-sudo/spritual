import {test,expect} from '@playwright/test';
test.skip(Boolean(process.env.WEBSITE_RELEASE),'Public projection only; draft preview intentionally contains these chapters.');
test('unavailable chapters remain visible in Saved without losing their exact original records',async({page})=>{
 await page.goto('/');
 const record={storyId:'princes-and-teacher',contentRevision:'prior-illustrated',language:'en',sceneId:'a-request-at-court',blockId:'saved-block-2',blockOffsetRatio:.43,updatedAt:100,journeyId:'ramayana'};
 await page.evaluate(record=>localStorage.setItem('spritual_reading_v2',JSON.stringify({version:2,preferences:{language:'en',theme:'light',textSize:20,interests:[]},progress:{[record.storyId]:record},bookmarks:[{storyId:record.storyId,sceneId:record.sceneId,blockId:record.blockId,kind:'place',language:'en',createdAt:50}],onboarding:null})),record);
 await page.goto('/my-reading/');await expect(page.locator('[data-unavailable-story]')).toHaveCount(2);await expect(page.locator('[data-unavailable-story]').first()).toContainText('Your saved place is kept');
 await page.locator('[data-unavailable-story] a').first().click();await expect(page.locator('[data-unavailable-chapter]')).toBeVisible();await expect(page.locator('[data-block-id]')).toHaveCount(0);
 await page.locator('.language').click();await expect(page).toHaveURL(/\/hi\/read\/princes-and-teacher\//);
 await page.goto('/read/what-makes-a-person-admirable/');await page.locator('#reader-settings-open').click();await page.locator('[data-reader-size="28"]').click();await page.keyboard.press('Escape');await page.locator('#bookmark-place').click();
 const state=await page.evaluate(()=>JSON.parse(localStorage.getItem('spritual_reading_v2')!));expect(state.progress['princes-and-teacher']).toEqual(record);expect(state.bookmarks.some((x:any)=>x.storyId===record.storyId)).toBe(true);
 await page.goto('/my-reading/');await page.locator('[data-unavailable-story] button').first().click();await page.locator('#reading-undo button').click();await expect(page.locator('[data-unavailable-story]')).toHaveCount(2);
});
test('public journeys are finite and never navigate to withheld chapters',async({page})=>{
 for(const [journey,count,last]of [['ramayana',10,'returning-responsibility'],['hanuman',3,'a-ring-brings-hope'],['together',3,'shabaris-welcome']] as const){
  await page.goto(`/journeys/${journey}/`);await expect(page.locator('.journey-chapter')).toHaveCount(count);
  await page.goto(`/read/${last}/?journey=${journey}`);await expect(page.locator('[data-journey-end]')).toBeVisible();await expect(page.locator('[data-journey-next]')).toHaveCount(0);
 }
});
