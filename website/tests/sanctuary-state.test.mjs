import test from 'node:test';
import assert from 'node:assert/strict';
import {breathingFrame, safeQuietReturn} from '../sanctuary-state.mjs';
import {readingMetadata} from '../reading-metadata.mjs';
import {readFile} from 'node:fs/promises';
test('public sanctuary prepares safe navigation before modules without relaxing its CSP',async()=>{
  const html=await readFile(new URL('../dist/pause/index.html',import.meta.url),'utf8');
  const guard=html.indexOf('<script src="/sanctuary-entry.js"></script>');
  assert(guard>0&&guard<html.indexOf('<script type="module" src="/site.js">'));
  assert.match(html,/id="timer-toggle"[^>]*disabled data-sanctuary-pending/);
  const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
  const csp=config.headers.flatMap(rule=>rule.headers).find(header=>header.key==='Content-Security-Policy').value;
  assert.match(csp,/(?:^|;)\s*script-src 'self';/);
  assert(!html.includes('<script>'));
});
test('reading estimates derive from actual bilingual paragraphs, not a supplied duration',()=>{
  const story={duration:8,scenes:[{blocks:[{text:{en:'one '.repeat(181),hi:'एक '.repeat(151)}}]}]};
  assert.deepEqual(readingMetadata(story),{wordCounts:{en:181,hi:151},durationByLanguage:{en:2,hi:2},duration:2});
  // The same single paragraph can have different lengths and estimates by language.
  story.scenes[0].blocks[0].text={en:'one '.repeat(90),hi:'एक '.repeat(601)};
  assert.deepEqual(readingMetadata(story),{wordCounts:{en:90,hi:601},durationByLanguage:{en:1,hi:5},duration:1});
});
test('guided minute completes four whole 4/4/6 cycles and settles for four seconds',()=>{
  for(let cycle=0;cycle<4;cycle++){
    const start=cycle*14000;
    assert.equal(breathingFrame(start).phase,'inhale');
    assert.equal(breathingFrame(start+4000).phase,'hold');
    assert.equal(breathingFrame(start+8000).phase,'exhale');
    assert.equal(breathingFrame(start+13999).phase,'exhale');
  }
  assert.equal(breathingFrame(56000).phase,'settle');
  assert.equal(breathingFrame(59999).phase,'settle');
  assert.deepEqual(breathingFrame(60000),{phase:'ended',scale:.82,remaining:0});
});
test('skip hold finishes six complete 4/6 cycles; natural mode never prescribes a hold',()=>{
  for(let t=0;t<60000;t+=500){assert.notEqual(breathingFrame(t,'skip').phase,'hold');assert.equal(breathingFrame(t,'natural').phase,'natural');}
  assert.equal(breathingFrame(4000,'skip').phase,'exhale');
  assert.equal(breathingFrame(10000,'skip').phase,'inhale');
  assert.equal(breathingFrame(59999,'skip').phase,'exhale');
});
test('scale and time are bounded and deterministic at interruptions',()=>{
  assert.deepEqual(breathingFrame(10500),breathingFrame(10500));
  assert.equal(breathingFrame(-100).remaining,60000);
  assert.equal(breathingFrame(999999).remaining,0);
  for(let t=0;t<=60000;t+=100){assert.ok(breathingFrame(t).scale>=.72);assert.ok(breathingFrame(t).scale<=1.01);}
});
test('quiet return only carries known route context and exact semantic block',()=>{
  assert.equal(safeQuietReturn('/read/across-the-ocean/?journey=hanuman&world=shiva&secret=private#block-ocean-1','hi'),'/hi/read/across-the-ocean/?from=resume&journey=hanuman&world=shiva#block-ocean-1');
  assert.equal(safeQuietReturn('/hi/library/ramayana/bala/','en'),'/library/ramayana/bala/');
  for(const input of ['https://evil.example/read/story/','javascript:alert(1)','//evil.example/read/story/','/alpha/','/my-reading/'])assert.equal(safeQuietReturn(input),null);
});
