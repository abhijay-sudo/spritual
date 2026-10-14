import {ANCHOR_IDS, practiceForStory} from './practice-data.js';
import {readPractice,milestoneStates} from './practice-state.js';
import {connectPracticeCards} from './practice-cards.js';
const hi=document.documentElement.lang==='hi',say=(en,hindi)=>hi?hindi:en;
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value),removeItem:key=>localStorage.removeItem(key)};
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const milestones=[...document.querySelectorAll('[data-yatra-id]')];
const ids=[...new Set([...ANCHOR_IDS,...milestones.map(m=>m.dataset.yatraId)])];
function render(){
 const records=Object.fromEntries(ids.map(id=>[id,readPractice(storage,id)]));
 const pathIds=milestones.map(m=>m.dataset.yatraId),states=milestoneStates(records,pathIds);
 const intentions=ANCHOR_IDS.filter(id=>records[id].record).length;
 for(const petal of document.querySelectorAll('[data-practice-petal]')){const r=records[petal.dataset.practicePetal]?.record;petal.classList.toggle('is-chosen',Boolean(r));petal.classList.toggle('is-tried',Boolean(r?.triedAt));}
 for(const link of document.querySelectorAll('[data-practice-lotus]'))link.setAttribute('aria-label',say('Lotus of Practice: '+intentions+' of 10 intentions chosen. Open Dharma Yatra.','अभ्यास का कमल: दस में से '+intentions+' संकल्प चुने। धर्म यात्रा खोलें।'));
 for(const milestone of milestones){
  const id=milestone.dataset.yatraId,record=records[id].record,state=states[id],link=milestone.querySelector('.yatra-card');
  milestone.dataset.state=state;if(state==='current')link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');
  milestone.querySelector('[data-yatra-state]').textContent=state==='completed'?say('Practised','अभ्यास किया'):state==='current'?say('Your next step','अगला पड़ाव'):say('Read ahead','आगे पढ़ें');
  const badge=milestone.querySelector('[data-yatra-badge]'),practice=practiceForStory(id);badge.hidden=!record;badge.textContent=record?(record.triedAt?say('Practised','अभ्यास किया'):say('Intention sealed','संकल्प सहेजा'))+' · '+practice.title[hi?'hi':'en']:'';
  const lit=milestone.querySelector('[data-yatra-lit]');if(lit)lit.hidden=!record?.triedAt;
 }
 for(const link of document.querySelectorAll('[data-diya-id]')){const id=link.dataset.diyaId,record=records[id]?.record;link.dataset.state=states[id]||'upcoming';link.classList.toggle('is-chosen',Boolean(record));link.classList.toggle('is-tried',Boolean(record?.triedAt));link.querySelector('[data-diya-state]').textContent=record?.triedAt?say('Practised','अभ्यास किया'):record?say('Intention chosen, not yet tried','संकल्प चुना, अभी अभ्यास दर्ज नहीं'):say('Not yet chosen','अभी नहीं चुना');}
 const warning=document.querySelector('[data-yatra-storage]');if(warning){warning.hidden=!ids.some(id=>['invalid','unavailable'].includes(records[id].kind));warning.textContent=say('Some practice records could not be read. They have been left untouched; every story is still open.','कुछ अभ्यास अभिलेख पढ़े नहीं जा सके। उन्हें बदला नहीं गया है; हर कथा फिर भी खुली है।');}
 const finished=document.querySelector('[data-yatra-finished]');if(finished)finished.hidden=!pathIds.length||!pathIds.every(id=>records[id].record?.triedAt);
}
connectPracticeCards(storage,render);render();

// A damped scroll spring in the site's native DOM architecture. It runs only
// while settling; no dependency, completion mutation or perpetual RAF loop.
const path = document.querySelector('[data-yatra-path]');
if (path) {
  const thread = path.querySelector('.yatra-thread-fill');
  let value = 0, target = 0, velocity = 0, frame = 0, previous = 0;
  function draw() { thread.style.strokeDashoffset = String(1-Math.max(0,Math.min(1,value))); }
  function step(now) {
    const dt = Math.min((now-previous)/1000 || 1/60,.032); previous = now;
    velocity += ((target-value)*180-velocity*26)*dt;
    value += velocity*dt;
    if (Math.abs(target-value)<.0001 && Math.abs(velocity)<.001) { value=target; draw(); frame=0; return; }
    draw(); frame=requestAnimationFrame(step);
  }
  function measure() {
    const rect = path.getBoundingClientRect();
    target = Math.max(0,Math.min(1,(innerHeight*.62-rect.top)/Math.max(1,rect.height)));
    if (reduced.matches) { cancelAnimationFrame(frame); frame=0; value=target; velocity=0; draw(); }
    else if (!frame && !document.hidden) { previous=performance.now(); frame=requestAnimationFrame(step); }
  }
  addEventListener('scroll',measure,{passive:true});
  addEventListener('resize',measure,{passive:true});
  reduced.addEventListener('change',measure);
  new ResizeObserver(measure).observe(path);
  document.addEventListener('visibilitychange',() => { if(document.hidden){cancelAnimationFrame(frame);frame=0;} else measure(); });
  measure();
}
