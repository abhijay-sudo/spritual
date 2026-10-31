import {_android as android} from 'playwright';
import {expect} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

// Opt-in Android OS emulator QA. Boot the project's existing AVD first and map
// device tcp:4196 to host tcp:4194. Never wipes a device or changes its settings.
const serial=process.env.SPRITUAL_QA_ANDROID_SERIAL;
if(!serial?.startsWith('emulator-'))throw Error('Set SPRITUAL_QA_ANDROID_SERIAL to the already-running project emulator.');
const device=(await android.devices()).find(d=>d.serial()===serial);
if(!device)throw Error(`Android emulator ${serial} is not available.`);
device.setDefaultTimeout(20000);
const output='docs/qa/ramayana-release-2026-10-27';await mkdir(output,{recursive:true});
const report={kind:'Android OS emulator, not physical hardware',serial,model:device.model(),checks:[],errors:[],userAgent:null};
let context;
try{
  context=await device.launchBrowser({baseURL:'http://127.0.0.1:4196',viewport:null,serviceWorkers:'block'});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
  const ready=async()=>{await expect(page.locator('html')).toHaveClass(/scene-enhanced/);await page.evaluate(()=>document.fonts.ready.then(()=>undefined));};
  await page.goto('/books/');
  report.userAgent=await page.evaluate(()=>navigator.userAgent);
  await page.locator('a[href="/books/ramayana/"]').tap();
  await expect(page.locator('.collection-chapters a')).toHaveCount(28);
  await page.locator('.collection-chapters a[href="/books/read/ramayana-across-the-ocean/"]').tap();await ready();
  report.checks.push('Bookshelf to 28-chapter contents to illustrated reader');
  await page.locator('[data-leaf-step="1"]').tap();
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id','ocean-mainaka');
  await expect(page.locator('.turn-sheet,.turn-shadow')).toHaveCount(0);
  report.checks.push('Android Chrome touch tap turns and cleans up the real duplex animation');
  await page.locator('[data-keep]').tap();
  await expect(page.locator('[data-keep]')).toHaveText('Page kept');
  await page.locator('.reader-path a').tap();
  await page.locator('[data-kept-list] a').tap();await ready();
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id','ocean-mainaka');
  report.checks.push('Explicit kept page reopens at the correct folio');
  await page.locator('[data-open-dialog="book-contents"]').tap();
  await expect(page.locator('#book-contents .other-chapters a')).toHaveCount(28);
  await page.locator('#book-contents [data-close-dialog]').tap();
  await page.locator('[data-language-switch]').first().tap();await ready();
  await page.locator('[data-open-dialog="book-appearance"]').tap();
  await page.locator('[data-text-size="26"]').tap();
  await page.locator('#book-appearance [data-close-dialog]').tap();
  await expect(page.locator('[data-folio]:visible .folio-prose')).toHaveCSS('font-size','26px');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`${output}/android-os-hindi.png`});
  await device.screenshot({path:`${output}/android-os-device.png`});
  report.checks.push('Hindi, 26px text and contents sheet work on Android OS');
  await page.locator('[data-leaf-step="1"]').tap();await page.locator('[data-leaf-step="1"]').tap();
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id','ocean-lanka');
  await page.locator('[data-chapter-step="1"]').tap();await ready();
  await expect(page.locator('[data-folio]:visible')).toHaveAttribute('id','lanka-gate');
  report.checks.push('Rapid taps and last-page-to-next-chapter navigation');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  expect(report.errors).toEqual([]);report.status='passed';
}catch(error){report.status='failed';report.failure=String(error);throw error;}
finally{
  await writeFile(`${output}/android-os-results.json`,JSON.stringify(report,null,2)+'\n');
  await context?.close();await device.close();
}
console.log(JSON.stringify(report,null,2));
