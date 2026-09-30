import { test } from 'node:test';
import assert from 'node:assert/strict';
import {readIntention,saveIntention,selectMoment,timerRemaining,KEY} from '../session.mjs';
function memory(){const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
test('only explicit preset ID persists; invalid records are not treated as successful saves',()=>{const s=memory();assert.equal(readIntention(s).kind,'empty');saveIntention(s,2);assert.deepEqual(readIntention(s),{kind:'saved',intention:2});assert.deepEqual(JSON.parse(s.getItem(KEY)),{version:1,intention:2});assert.throws(()=>saveIntention(s,-1));s.setItem(KEY,'{bad');assert.equal(readIntention(s).kind,'invalid');s.setItem(KEY,JSON.stringify({version:1,intention:50}));assert.equal(readIntention(s).kind,'invalid');});
test('storage exceptions are recoverable and writes report failure',()=>{const s={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(readIntention(s).kind,'invalid');assert.throws(()=>saveIntention(s,1));});
test('timer is bounded and excludes time before running starts',()=>{assert.equal(timerRemaining(60000,1000,31000),30000);assert.equal(timerRemaining(60000,1000,99000),0);assert.equal(timerRemaining(30000,40000,35000),30000);});
test('URL accepts only known public reflection IDs',()=>{assert.equal(selectMoment('?moment=focus'),'focus');assert.equal(selectMoment('?moment=private-journal'),'stillness');assert.equal(selectMoment(''),'stillness');});
