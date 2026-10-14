import {ANCHOR_IDS, PRACTICE_REVISION, practiceById} from './practice-data.js';
import {PRACTICE_PREFIX, readPractice, updatePractice, undoPractice, milestoneStates} from './practice-state.js';

const hi = document.documentElement.lang === 'hi';
const say = (en, hindi) => hi ? hindi : en;
const pick = value => value[hi ? 'hi' : 'en'];
// Resolve the localStorage getter inside the guarded state functions too.
const storage = {getItem:key => localStorage.getItem(key), setItem:(key,value) => localStorage.setItem(key,value), removeItem:key => localStorage.removeItem(key)};
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const card = document.querySelector('[data-sankalpa]');
const practiceId = card?.dataset.sankalpa;
const hold = card?.querySelector('[data-sankalpa-hold]');
const status = card?.querySelector('[data-sankalpa-status]');
let lastChange = null;
let holdFrame = 0;
let holding = null;
let rippleTimer = 0;
const snapshot = () => Object.fromEntries(ANCHOR_IDS.map(id => [id, readPractice(storage,id)]));
const announce = text => { if (status) status.textContent = text; };

function render() {
  const records = snapshot();
  const states = milestoneStates(records,ANCHOR_IDS);
  const intentions = ANCHOR_IDS.filter(id => records[id].record).length;
  for (const petal of document.querySelectorAll('[data-practice-petal]')) {
    const record = records[petal.dataset.practicePetal]?.record;
    petal.classList.toggle('is-chosen',Boolean(record));
    petal.classList.toggle('is-tried',Boolean(record?.triedAt));
  }
  for (const link of document.querySelectorAll('[data-practice-lotus]')) link.setAttribute('aria-label',say(`Lotus of Practice: ${intentions} of 10 intentions chosen. Open Dharma Yatra.`,`अभ्यास का कमल: दस में से ${intentions} संकल्प चुने। धर्म यात्रा खोलें।`));
  for (const milestone of document.querySelectorAll('[data-yatra-id]')) {
    const id = milestone.dataset.yatraId, record = records[id].record;
    const state = states[id];
    milestone.dataset.state = state;
    const link = milestone.querySelector('.yatra-card');
    if (state === 'current') link.setAttribute('aria-current','step'); else link.removeAttribute('aria-current');
    milestone.querySelector('[data-yatra-state]').textContent = state === 'completed' ? say('Practised','अभ्यास किया') : state === 'current' ? say('Your next step','अगला पड़ाव') : say('Read ahead','आगे पढ़ें');
    const badge = milestone.querySelector('[data-yatra-badge]');
    badge.hidden = !record;
    badge.textContent = record ? `${record.triedAt ? say('Practised','अभ्यास किया') : say('Intention sealed','संकल्प सहेजा')} · ${pick(practiceById[id].title)}` : '';
  }
  const warning = document.querySelector('[data-yatra-storage]');
  if (warning) {
    warning.hidden = !ANCHOR_IDS.some(id => ['invalid','unavailable'].includes(records[id].kind));
    warning.textContent = say('Some practice records could not be read. They have been left untouched; every story is still open.','कुछ अभ्यास अभिलेख पढ़े नहीं जा सके। उन्हें बदला नहीं गया है; हर कथा फिर भी खुली है।');
  }
  const finished = document.querySelector('[data-yatra-finished]');
  if (finished) finished.hidden = !ANCHOR_IDS.every(id => records[id].record?.triedAt);
  if (!card) return;
  const current = records[practiceId];
  const record = current.record;
  card.dataset.practiceState = record?.triedAt ? 'tried' : record ? 'sealed' : 'empty';
  card.querySelector('[data-seal-controls]').hidden = Boolean(record);
  card.querySelector('[data-sankalpa-saved]').hidden = !record;
  const triedButton = card.querySelector('[data-sankalpa-try]');
  triedButton.hidden = Boolean(record?.triedAt);
  card.querySelector('[data-sankalpa-saved-label]').textContent = record?.triedAt ? say('Practice acknowledged. Your petal stays.','अभ्यास दर्ज हुआ। आपकी पंखुड़ी बनी रहेगी।') : say('Intention sealed. Try it when you are ready.','संकल्प सहेजा गया। जब तैयार हों, आज़माएँ।');
  card.querySelector('[data-sankalpa-undo]').hidden = !lastChange;
  if (current.kind === 'invalid') announce(say('This saved Sankalpa could not be read and has not been overwritten. You can still try the practice.','सहेजा संकल्प पढ़ा नहीं जा सका और उसे बदला नहीं गया। आप फिर भी अभ्यास कर सकते हैं।'));
  else if (current.kind === 'unavailable') announce(say('This browser cannot save your Sankalpa. You can still try the practice.','यह ब्राउज़र संकल्प सहेज नहीं सकता। आप फिर भी अभ्यास कर सकते हैं।'));
}

function act(action) {
  cancelHold();
  try {
    const change = updatePractice(storage,practiceId,action,PRACTICE_REVISION);
    if (change.changed) lastChange = change;
    render();
    announce(action === 'seal' ? say('Intention saved on this browser. One petal is lit.','संकल्प इस ब्राउज़र में सहेजा गया। एक पंखुड़ी प्रकाशित है।') : action === 'try' ? say('Your practice is acknowledged. Revisit whenever it helps.','आपका अभ्यास दर्ज हुआ। जब उपयोगी लगे, फिर लौटें।') : say('Intention released. You can undo this.','संकल्प हटाया गया। चाहें तो वापस लें।'));
    if (action === 'seal') {
      card.classList.add('is-sealed');
      clearTimeout(rippleTimer);
      rippleTimer = setTimeout(() => card.classList.remove('is-sealed'),800);
      card.querySelector('[data-sankalpa-try]').focus({preventScroll:true});
    } else if (action === 'try') card.querySelector('[data-sankalpa-undo]').focus({preventScroll:true});
    else card.querySelector('[data-sankalpa-seal]').focus({preventScroll:true});
  } catch {
    render();
    announce(say('Your Sankalpa was not saved. Existing records are unchanged. You can try again or practise without saving.','आपका संकल्प सहेजा नहीं गया। पुराने अभिलेख वैसे ही हैं। फिर कोशिश करें या सहेजे बिना अभ्यास करें।'));
  }
}

function cancelHold() {
  if (!holding) return;
  const pointer = holding.pointerId;
  holding = null;
  cancelAnimationFrame(holdFrame);
  card.style.setProperty('--hold-progress','0');
  card.classList.remove('is-holding');
  if (pointer !== undefined && hold.hasPointerCapture?.(pointer)) hold.releasePointerCapture(pointer);
}

function startHold(input) {
  if (holding || readPractice(storage,practiceId).record) return;
  holding = {...input, started:performance.now()};
  card.classList.add('is-holding');
  announce('');
  const tick = now => {
    if (!holding) return;
    const progress = Math.min(1,(now-holding.started)/2000);
    card.style.setProperty('--hold-progress',String(progress));
    if (progress >= 1) { act('seal'); return; }
    holdFrame = requestAnimationFrame(tick);
  };
  holdFrame = requestAnimationFrame(tick);
}

if (card) {
  hold.addEventListener('pointerdown',event => {
    if (!event.isPrimary || event.button !== 0) return;
    event.preventDefault();
    hold.focus({preventScroll:true});
    hold.setPointerCapture(event.pointerId);
    startHold({pointerId:event.pointerId});
  });
  hold.addEventListener('pointermove',event => {
    if (holding?.pointerId !== event.pointerId) return;
    const box = hold.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) cancelHold();
  });
  for (const event of ['pointerup','pointercancel','lostpointercapture','blur']) hold.addEventListener(event,cancelHold);
  hold.addEventListener('click',event => event.preventDefault());
  hold.addEventListener('contextmenu',event => event.preventDefault());
  hold.addEventListener('keydown',event => {
    if (event.key === 'Escape') { cancelHold(); return; }
    if (![' ','Enter'].includes(event.key)) return;
    event.preventDefault();
    if (!event.repeat) startHold({key:event.key});
  });
  hold.addEventListener('keyup',event => { if ([' ','Enter'].includes(event.key)) { event.preventDefault(); cancelHold(); } });
  card.querySelector('[data-sankalpa-seal]').addEventListener('click',() => act('seal'));
  card.querySelector('[data-sankalpa-try]').addEventListener('click',() => act('try'));
  card.querySelector('[data-sankalpa-clear]').addEventListener('click',() => act('clear'));
  card.querySelector('[data-sankalpa-undo]').addEventListener('click',() => {
    cancelHold();
    if (!lastChange) return;
    try {
      const restored = undoPractice(storage,lastChange);
      lastChange = null;
      render();
      announce(restored ? say('Your last change was undone.','आपका पिछला बदलाव वापस लिया गया।') : say('This intention changed in another tab. Its newer state was kept.','यह संकल्प दूसरे टैब में बदला है। नई स्थिति रखी गई।'));
      const target = card.querySelector('[data-seal-controls]').hidden ? card.querySelector('[data-sankalpa-clear]') : card.querySelector('[data-sankalpa-seal]');
      target.focus({preventScroll:true});
    } catch { announce(say('Undo could not be saved. Please try again.','बदलाव वापस नहीं हो सका। फिर कोशिश करें।')); }
  });
}

addEventListener('storage',event => {
  if (event.key !== null && !event.key.startsWith(PRACTICE_PREFIX)) return;
  cancelHold();
  if (!event.key || event.key === PRACTICE_PREFIX + practiceId) { lastChange = null; announce(''); }
  render();
});
addEventListener('blur',cancelHold);
addEventListener('pagehide',cancelHold);
addEventListener('pageshow',render);
document.addEventListener('visibilitychange',() => { cancelHold(); if (!document.hidden) render(); });
render();

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
