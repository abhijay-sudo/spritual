// Run after the separate local research build and --books-preview server.
import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const origin='http://127.0.0.1:4193';
const evidence='docs/qa/book-library-2026-10-20';
const manifest=JSON.parse(await readFile('artifacts/book-research-manifest.json','utf8'));
const longest=[...manifest.generated].sort((a,b)=>b.folios-a.folios)[0];
const browser=await chromium.launch();const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
try{
 await page.goto(origin+'/books/sources/');assert.equal(await page.locator('main li a').count(),37);checks.push('12 episode entry points and 25 book contents');
 await page.getByRole('link',{name:'Nala and Damayanti',exact:true}).click();assert.match(page.url(),/vana\/53/);await page.locator('.folio:visible .chapter-ending a').click();assert.match(page.url(),/vana\/54/);await page.locator('[data-leaf-step="1"]').tap();assert.match(await page.locator('[data-page-position]').innerText(),/Page 2 of/);await page.locator('[data-keep]').tap();assert.equal(await page.locator('[data-keep]').innerText(),'Page kept');await page.goto(origin+'/books/#kept');await page.locator('[data-kept-list] a').click();assert.match(page.url(),/#leaf-2/);checks.push('episode reading, touch page turn, explicit save and resume');
 await page.locator('[data-open-dialog="book-contents"]').click();await page.locator('[data-leaf-link]').last().click();const next=page.locator('.folio:visible .chapter-ending a');await next.click();assert.match(page.url(),/vana\/55/);checks.push('contents and next source section');
 await page.locator('.source-trigger').click();const file=page.getByRole('link',{name:'Complete original source file and licence'});const response=await page.request.get(origin+await file.getAttribute('href'));assert.equal(response.status(),200);assert((await response.text()).includes('PROJECT GUTENBERG'));checks.push('original source file and licence reachable');
 await page.goto(origin+longest.route);assert.equal(await page.locator('[data-folio]').count(),longest.folios);await page.locator('[data-open-dialog="book-contents"]').click();await page.getByRole('link',{name:/Edition notes/}).first().click();assert.match(await page.locator('.folio:visible h2').innerText(),/Edition notes/);checks.push('largest imported unit separates volume notes from narrative');
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await page.goto(origin+longest.route);await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{})));});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await mkdir(evidence,{recursive:true});await page.screenshot({path:`${evidence}/source-reader-${width}.png`});}
 checks.push('largest imported unit renders without horizontal overflow at 320,390,768,1440');assert.deepEqual(errors,[]);checks.push('no page JavaScript errors');
 await writeFile(`${evidence}/research-browser.json`,JSON.stringify({checks,longest,errors,limits:'Chromium desktop and touch emulation. Not physical-device, scan collation or editorial approval.'},null,2));console.log(`PASS: ${checks.length} research-reader checks`,checks);
}finally{await browser.close();}
