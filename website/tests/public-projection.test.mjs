import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {withheldStoryIds,publicStorageKeys,publicJourneys} from '../public-projection.mjs';
import {editionStories} from '../illustrated-chapters.mjs';
import {READING_KEY,readReadingState,setPreference,saveProgress} from '../reading-state.mjs';
const root=resolve(import.meta.dirname,'..');
test('public projection excludes every pending narrative/art asset and keeps noindex availability routes',async()=>{
 const files=await readdir(resolve(root,'dist'),{recursive:true});
 assert(!files.some(file=>file.startsWith('assets/illustrated/')));
 const sitemap=await readFile(resolve(root,'dist/sitemap.xml'),'utf8');
 const html=(await Promise.all(files.filter(file=>file.endsWith('.html')).map(file=>readFile(resolve(root,'dist',file),'utf8')))).join('\n');
 assert(!html.includes('/assets/illustrated/'));
 assert(!html.includes('owner approved this exact illustrated website release'));
 assert(!html.includes('Source-Verified Retellings · Editorial Review by Puja Bhagat'));
 for(const id of withheldStoryIds){
  const draft=editionStories.find(story=>story.id===id);
  for(const block of draft.scenes.flatMap(scene=>scene.blocks))for(const language of ['en','hi'])assert(!html.includes(JSON.stringify(block.text[language]).slice(1,-1)),`${id} draft ${language}`);
  for(const prefix of ['','hi/'])for(const kind of ['read','story']){
   const path=`${prefix}${kind}/${id}/`,page=await readFile(resolve(root,'dist',path,'index.html'),'utf8');
   assert.match(page,/data-unavailable-chapter/);assert.match(page,/noindex, follow/);assert(!page.includes('data-block-id'));
   assert(!sitemap.includes(`https://spritual.co.in/${path}</loc>`));
  }
 }
 assert.equal(publicJourneys.ramayana.storyIds.length,10);
 assert(Object.values(publicJourneys).every(journey=>journey.storyIds.every(id=>!withheldStoryIds.includes(id))));
});
test('known unavailable saved IDs survive preferences and available-story progress writes',()=>{
 const progress=Object.fromEntries(withheldStoryIds.map(storyId=>[storyId,{storyId,contentRevision:'prior-version',language:'hi',sceneId:'saved-scene',blockId:'saved-block',blockOffsetRatio:.43,updatedAt:100,journeyId:'ramayana'}]));
 const state={version:2,preferences:{language:'hi',theme:'dark',textSize:24,interests:[]},progress,bookmarks:[{storyId:withheldStoryIds[0],sceneId:'saved-scene',blockId:'saved-block',language:'hi',kind:'place',createdAt:10}],onboarding:null};
 let raw=JSON.stringify(state);const storage={getItem:()=>raw,setItem:(key,value)=>{assert.equal(key,READING_KEY);raw=value;}};
 setPreference(storage,publicStorageKeys,'textSize',28);
 saveProgress(storage,publicStorageKeys,{storyId:publicJourneys.ramayana.storyIds[0],contentRevision:'current',language:'en',sceneId:'first',blockId:'one',blockOffsetRatio:.1,updatedAt:200});
 const current=readReadingState(storage,publicStorageKeys).state;
 for(const id of withheldStoryIds)assert.deepEqual(current.progress[id],progress[id]);
 assert.deepEqual(current.bookmarks,state.bookmarks);
});
test('production configuration cannot build the unapproved illustrated release',async()=>{
 const config=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));assert.equal(config.buildCommand,'node build.mjs');
 const result=spawnSync(process.execPath,[resolve(root,'build.mjs'),'--sanatan-release'],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.match(result.stderr,/exact-version editorial and artwork approvals are unresolved/);
});
