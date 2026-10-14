import test from 'node:test';
import assert from 'node:assert/strict';
import {PRACTICE_PREFIX,readPractice,updatePractice,undoPractice,milestoneStates} from '../practice-state.mjs';
import {ANCHOR_IDS,PRACTICE_REVISION,practiceForStory} from '../practice-data.mjs';
import {editionStories} from '../illustrated-chapters.mjs';
const memory = () => {const data = new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};};
const [first,second] = ANCHOR_IDS;

test('all twenty-two chapters have a bilingual invitation tied to one of ten stable milestones',()=>{
  assert.equal(ANCHOR_IDS.length,10);
  for(const story of editionStories){const practice=practiceForStory(story.id);assert(practice);assert(ANCHOR_IDS.includes(practice.id));assert(practice.action.en);assert(practice.action.hi);}
});
test('a sealed intention is distinct from practice; repeat actions do not inflate or expire petals',()=>{
  const store=memory();updatePractice(store,first,'seal',PRACTICE_REVISION,100);
  assert.equal(readPractice(store,first).record.triedAt,null);
  updatePractice(store,first,'seal',PRACTICE_REVISION,99999999);
  assert.equal(readPractice(store,first).record.sealedAt,100);
  updatePractice(store,first,'try',PRACTICE_REVISION,200);
  updatePractice(store,first,'try',PRACTICE_REVISION,99999999);
  assert.equal(readPractice(store,first).record.triedAt,200);
  assert.throws(()=>updatePractice(store,second,'try',PRACTICE_REVISION,300));
});
test('out-of-order practice keeps the first untried milestone current',()=>{
  const store=memory();updatePractice(store,second,'seal',PRACTICE_REVISION,100);updatePractice(store,second,'try',PRACTICE_REVISION,200);
  const states=milestoneStates(Object.fromEntries(ANCHOR_IDS.map(id=>[id,readPractice(store,id)])),ANCHOR_IDS);
  assert.equal(states[first],'current');assert.equal(states[second],'completed');assert.equal(states[ANCHOR_IDS[2]],'upcoming');
});
test('per-intention writes and guarded Undo preserve newer and unrelated browser activity',()=>{
  const store=memory(),change=updatePractice(store,first,'seal',PRACTICE_REVISION,100);
  updatePractice(store,second,'seal',PRACTICE_REVISION,150);
  assert.equal(undoPractice(store,change),true);assert.equal(readPractice(store,second).kind,'ready');
  const stale=updatePractice(store,first,'seal',PRACTICE_REVISION,200);
  updatePractice(store,first,'try',PRACTICE_REVISION,250);
  assert.equal(undoPractice(store,stale),false);assert.equal(readPractice(store,first).record.triedAt,250);
  const cleared=updatePractice(store,first,'clear',PRACTICE_REVISION,300);
  assert.equal(undoPractice(store,cleared),true);assert.equal(readPractice(store,first).record.triedAt,250);
});
test('corrupt and denied storage do not get overwritten or yield false confirmation',()=>{
  const store=memory();store.setItem(PRACTICE_PREFIX+first,'{broken');
  assert.equal(readPractice(store,first).kind,'invalid');assert.throws(()=>updatePractice(store,first,'seal',PRACTICE_REVISION));
  assert.equal(store.getItem(PRACTICE_PREFIX+first),'{broken');
  const denied={getItem(){throw Error('Denied');}};
  assert.equal(readPractice(denied,first).kind,'unavailable');assert.throws(()=>updatePractice(denied,first,'seal',PRACTICE_REVISION));
  const quota={getItem:()=>null,setItem(){throw Error('Quota');}};
  assert.throws(()=>updatePractice(quota,first,'seal',PRACTICE_REVISION));assert.equal(readPractice(quota,first).kind,'empty');
});
