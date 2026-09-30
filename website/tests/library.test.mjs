import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {collections,allKeys,canPublishBody,releasePolicy} from '../catalog.mjs';
import {readShelf,changeShelf,normalizeSearch,SHELF_KEY} from '../library-state.mjs';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
test('32 stable source guides cover 18 parvas, seven kandas and seven samhitas',()=>{assert.deepEqual(collections.map(x=>x.units.length),[18,7,7]);assert.equal(new Set(allKeys).size,32);for(const c of collections)for(const u of c.units){assert(u.title.en&&u.title.hi);assert.equal(new URL(u.source).protocol,'https:');}assert.match(collections[1].units[6].source,/62496$/);});
test('saved places require an explicit bounded known ID, never a reading history',()=>{const s=memory();assert.equal(readShelf(s,allKeys).kind,'empty');changeShelf(s,allKeys,allKeys[0],true);changeShelf(s,allKeys,allKeys[0],true);assert.deepEqual(readShelf(s,allKeys).items,[allKeys[0]]);assert.deepEqual(JSON.parse(s.getItem(SHELF_KEY)),{version:1,items:[allKeys[0]]});assert.throws(()=>changeShelf(s,allKeys,'private journal',true));changeShelf(s,allKeys,allKeys[0],false);assert.deepEqual(readShelf(s,allKeys).items,[]);});
test('corrupt, unknown, oversized and denied storage are recoverable without overwriting',()=>{const s=memory();for(const value of ['bad',JSON.stringify({version:1,items:['unknown']}),JSON.stringify({version:1,items:Array(33).fill(allKeys[0])})]){s.setItem(SHELF_KEY,value);assert.equal(readShelf(s,allKeys).kind,'invalid');assert.throws(()=>changeShelf(s,allKeys,allKeys[0],true));assert.equal(s.getItem(SHELF_KEY),value);}assert.throws(()=>changeShelf({getItem:()=>null,setItem:()=>{throw Error('denied');}},allKeys,allKeys[0],true));});
test('search normalizes accents without stripping Hindi marks',()=>{assert.equal(normalizeSearch('Śiva'),'siva');assert.equal(normalizeSearch('  सभा '),'सभा');assert.equal(normalizeSearch('a'.repeat(140)).length,120);});
test('publication and paid access remain fail-closed',()=>{const record={version:2,rights:{status:'cleared',evidence:'test-only',territories:'worldwide'},review:{status:'approved',reviewer:'test reviewer',version:2},access:'free'};assert.equal(canPublishBody(record),true);for(const change of [{access:'paid'},{review:{...record.review,version:1}},{rights:{...record.rights,status:'unverified'}}])assert.equal(Boolean(canPublishBody({...record,...change})),false);assert.equal(Boolean(canPublishBody({})),false);assert.equal(releasePolicy.paidAccessEnabled,false);assert.equal(releasePolicy.price,null);});
test('public build never emits imported religious prose or protected reading routes',async()=>{const root=new URL('../dist/',import.meta.url);const files=await readdir(root,{recursive:true});assert(!files.some(f=>f.includes('/read/')||f.startsWith('sources/')||f.includes('staged.json')));for(const file of files.filter(f=>f.endsWith('.html'))){const html=await readFile(new URL(file,root),'utf8');assert(!html.includes('LOCAL EDITORIAL PREVIEW'));assert(!html.includes('Vaishampayana said,'));}const guarded=spawnSync(process.execPath,['website/build.mjs','--editorial-preview'],{cwd:new URL('../../',import.meta.url),env:{...process.env,CI:'true'},encoding:'utf8'});assert.notEqual(guarded.status,0);assert.match(guarded.stderr,/local only/);});
test('every library page has a unique title, working internal links and matching language',async()=>{
 const root=new URL('../dist/',import.meta.url);
 const files=await readdir(root,{recursive:true});
 const pages=files.filter(f=>f.endsWith('index.html')&&(f.startsWith('library/')||f.startsWith('hi/library/')));
 assert.equal(pages.length,74);
 const titles=new Set();
 for(const file of pages){
  const html=await readFile(new URL(file,root),'utf8');
  assert(html.includes(`<html lang="${file.startsWith('hi/')?'hi':'en'}">`));
  const title=html.match(/<title>(.*?)<\/title>/)[1];assert(!titles.has(title),`Duplicate ${title}`);titles.add(title);
  if(file.includes('/saved/'))assert(html.includes('noindex, follow'));
  for(const [,href] of html.matchAll(/href="(\/[^"?#]*)"/g)){
   const target=href.endsWith('/')?`${href.slice(1)}index.html`:href.slice(1);
   assert(files.includes(target),`${file} links to missing ${target}`);
  }
 }
});
