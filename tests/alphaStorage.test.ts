import test from 'node:test';
import assert from 'node:assert/strict';
import {isPrivateAlphaStorageKey, parseAlphaState} from '../web/src/alpha/storage.ts';
import {createSeed} from '../web/src/alpha/fixtures.ts';
test('demo persistence round-trips while rejecting malformed nested records',()=>{const seed=createSeed();assert.deepEqual(parseAlphaState(JSON.stringify(seed)),JSON.parse(JSON.stringify(seed)));for(const bad of [{...seed,contents:[null]},{...seed,contents:[{...seed.contents[0],rights:null}]},{...seed,cohorts:[{...seed.cohorts[0],programIds:[null]}]},{...seed,schema:99}])assert.throws(()=>parseAlphaState(JSON.stringify(bad)));});
test('local data cleanup includes the japa count and never selects another identity',()=>{
 const own=['spritual_alpha_private_demo-member_note','spritual_alpha_playback_demo-member_track','spritual_alpha_preferences_demo-member','spritual_alpha_wisdom_v1_demo-member','spritual_alpha_japa_v1_demo-member'];
 for(const key of own)assert.equal(isPrivateAlphaStorageKey(key,'demo-member'),true,key);
 for(const key of ['spritual_alpha_japa_v1_other','spritual_alpha_private_demo-member2_note','spritual_alpha_demo_v1','spritual_demo_v1'])assert.equal(isPrivateAlphaStorageKey(key,'demo-member'),false,key);
});
