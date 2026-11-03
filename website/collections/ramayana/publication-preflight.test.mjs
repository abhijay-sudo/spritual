import test from 'node:test';
import assert from 'node:assert/strict';
import {publicationFingerprint,reviewBlockers,reviewAreas,preflight} from './publication-preflight.mjs';

test('publication fingerprint covers exact text, scene mappings, 120 plates and the collection cover',async()=>{
  const current=await publicationFingerprint();
  assert.equal(current.chapterCount,28);assert.equal(current.sceneCount,112);
  assert.equal(current.assets.length,121);assert.match(current.fingerprint,/^[a-f0-9]{64}$/);
  assert(current.assets.every(a=>a.bytes>0&&/^[a-f0-9]{64}$/.test(a.sha256)));
  assert.equal(new Set(current.assets.map(a=>a.file)).size,121);
});
test('missing review stays blocked and never implies publication',()=>{
  assert.equal(reviewBlockers(null,{revision:'fixture',fingerprint:'fixture'}).length,10);
});
test('review checks reject stale versions, incomplete names and missing distribution basis',()=>{
  // Test-only records; no fictional reviewer is persisted as a real approval.
  const current={revision:'test-only',fingerprint:'test-only'};
  const record={...current,distribution:'spritual.co.in bilingual website',paidAccess:false,rightsMarkets:['test-only'],reviews:Object.fromEntries(reviewAreas.map(area=>[area,{status:'approved',reviewer:'Test-only fixture',date:'2000-01-01',evidence:'Unit test fixture, never an approval'}]))};
  assert.deepEqual(reviewBlockers(record,current),[]);
  assert(reviewBlockers(record,{...current,fingerprint:'changed-art'}).length);
  record.reviews.hindi.reviewer='';assert(reviewBlockers(record,current).some(b=>b.startsWith('hindi:')));
  record.rightsMarkets=[];assert(reviewBlockers(record,current).some(b=>b.startsWith('Rights reviewer')));
});
test('current collection remains explicitly blocked awaiting real reviews',async()=>{
  const result=await preflight();assert.equal(result.status,'blocked');
  for(const area of reviewAreas)assert(result.blockers.some(b=>b.startsWith(area+':')));
});
