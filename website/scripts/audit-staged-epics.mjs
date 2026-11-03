// Local research evidence only; this never grants rights or editorial approval.
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {collections} from '../catalog.mjs';
const root=resolve(import.meta.dirname,'../../artifacts');
const staged=JSON.parse(await readFile(`${root}/library-source/staged.json`,'utf8'));
assert.equal(staged.rights.status,'unverified');
assert.equal(staged.review.status,'pending');
assert.equal(staged.access,'not-published');
assert.equal(Object.keys(staged.units).length,25);
assert.equal(staged.sources.length,8);
for(const source of staged.sources){
 const raw=await readFile(`${root}/library-source/pg${source.id}.txt`);
 assert.equal(createHash('sha256').update(raw).digest('hex'),source.sha256);
 assert.equal(raw.length,source.bytes);
 assert.match(raw.toString(),/PROJECT GUTENBERG.*LICENSE/);
}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
let total=0;
for(const collection of collections.slice(0,2))for(const unit of collection.units){
 const id=`${collection.id}/${unit.id}`;
 const record=staged.units[id];assert(record,`Missing ${id}`);
 assert(record.chapters.length>0);
 const guide=await readFile(`${root}/editorial-site/hi/library/${id}/index.html`,'utf8');
 assert(guide.includes(`href="/library/${id}/read/1/"`),'Hindi navigation must open the available English reader');
 for(const [index,chapter] of record.chapters.entries()){
  assert.equal(chapter.id,String(index+1));assert(chapter.text.length>0);
  const html=await readFile(`${root}/editorial-site/library/${id}/read/${chapter.id}/index.html`,'utf8');
  assert(html.includes(escape(chapter.text)),`${id}/${chapter.id} dropped or altered source text`);
  assert(html.includes('noindex, follow'));
  for(const [,target] of html.matchAll(/href="(\/[^"?#]*)"/g)){
   const path=target.endsWith('/')?`${target}index.html`:target;
   assert((await stat(`${root}/editorial-site${path}`)).isFile(),`Broken ${target}`);
  }
  total++;
 }
}
console.log(`PASS: 8 source hashes and licenses; 25 books; ${total} nonempty source sections rendered unchanged; all local reader links resolve. This is import integrity, not collation or approval.`);
