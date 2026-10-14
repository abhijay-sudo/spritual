import {readIntention, saveIntention, KEY, selectMoment, timerRemaining, shareOrigin} from './session.js';
import {MINUTE_MS, BREATH_MODES, breathingFrame, safeQuietReturn} from './sanctuary-state.js';

export function initSanctuary(c) {
  const $ = id => document.getElementById(id), root = document.querySelector('.sanctuary');
  const hi = document.documentElement.lang === 'hi', lang = hi ? 'hi' : 'en', base = hi ? '/hi/' : '/';
  const say = (en, hindi) => hi ? hindi : en, motion = matchMedia('(prefers-reduced-motion: reduce)');
  const params = new URLSearchParams(location.search), moment = selectMoment(location.search);
  let returnPath = safeQuietReturn(params.get('from'), lang, location.origin);
  const explicitWorld = params.get('world');
  if (returnPath && ['neutral','epic','rama','hanuman','shiva','krishna'].includes(explicitWorld)) {
    const target = new URL(returnPath, location.origin); target.searchParams.set('world', explicitWorld);
    returnPath = target.pathname + target.search + target.hash;
  }
  const initialElapsed = Number(params.get('elapsed'));
  let remaining = MINUTE_MS - (Number.isFinite(initialElapsed) ? Math.max(0, Math.min(MINUTE_MS, initialElapsed)) : 0);
  let mode = BREATH_MODES.includes(params.get('breath')) ? params.get('breath') : 'guided';
  let startedAt = 0, running = false, finished = false, frame = 0, lastPhase = '', lastSecond = -1;
  let stored, storage;
  try { storage = localStorage; } catch { storage = {getItem(){throw Error('Unavailable');},setItem(){throw Error('Unavailable');},removeItem(){throw Error('Unavailable');}}; }
  $('pause-reflection').textContent = c.moments.find(item => item[3] === moment)[1];
  for (const link of document.querySelectorAll('[data-quiet-return],.ritual-close')) {
    if (returnPath) link.href = returnPath;
    if (link.matches('.ritual-close')) { link.firstChild.textContent = say('Return quietly ', 'शांति से लौटें '); link.setAttribute('aria-label', say('Return quietly', 'शांति से लौटें')); }
  }
  if (returnPath) {
    $('return-reading').href = returnPath; $('return-reading').hidden = false;
    if (/\/read\//.test(returnPath)) $('return-reading').textContent = say('Return to your reading place', 'अपने पठन स्थान पर लौटें');
  }
  const current = () => running ? timerRemaining(remaining, startedAt, performance.now()) : remaining;
  function syncLanguage() {
    for (const link of document.querySelectorAll('.language')) {
      const target = link.lang === 'hi' ? 'hi' : 'en', url = new URL(link.href, location.origin);
      url.searchParams.set('moment', moment); url.searchParams.set('elapsed', String(Math.round(MINUTE_MS - current()))); url.searchParams.set('breath', mode);
      const translated = safeQuietReturn(returnPath, target, location.origin); if (translated) url.searchParams.set('from', translated);
      link.href = url.pathname + url.search;
    }
  }
  document.querySelectorAll('.language').forEach(link => link.addEventListener('click', () => { syncLanguage(); stop(c.paused); }));
  const cues = {
    inhale: [say('Inhale','श्वास लें'), say('Draw in stillness','भीतर शांति आने दें')],
    hold: [say('Hold','सहज ठहरें'), say('Rest in awareness','सजगता में ठहरें')],
    exhale: [say('Exhale','श्वास छोड़ें'), say('Release the day','दिन का भार छोड़ें')],
    natural: [say('Breathe naturally','स्वाभाविक श्वास लें'), say('Nothing to match. Simply be here.','किसी गति से मिलाना नहीं। बस यहीं रहें।')],
    settle: [say('Breathe naturally','स्वाभाविक श्वास लें'), say('Let the rhythm go. Return in your own time.','अब लय छोड़ दें। अपनी गति से लौटें।')],
    ended: [say('A moment to carry','साथ ले जाने वाला पल'), say('Return when you are ready.','जब तैयार हों, लौटें।')],
  };
  function cue(phase) {
    if (phase === lastPhase) return; lastPhase = phase;
    $('breath-phase').textContent = cues[phase][0]; $('breath-invitation').textContent = cues[phase][1];
    root.dataset.phase = phase;
  }
  function label(text) { $('timer-toggle').textContent = text; }
  function draw() {
    const value = current(), elapsed = MINUTE_MS - value, seconds = Math.ceil(value / 1000);
    if (seconds !== lastSecond) { lastSecond = seconds; $('time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; syncLanguage(); }
    $('timer-progress').style.strokeDashoffset = String(60 - value / 1000);
    const breath = breathingFrame(elapsed, mode);
    if (running || elapsed > 0) cue(breath.phase);
    root.querySelector('.orb-petals').style.transform = `scale(${motion.matches ? .82 : breath.scale})`;
    if (running && value <= 0) {
      remaining = 0; running = false; cancelAnimationFrame(frame); document.body.classList.remove('ritual-running'); stopSound(); showArrival(); return;
    }
    if (running) { drawDust(elapsed); frame = requestAnimationFrame(draw); }
  }
  function showArrival() {
    root.dataset.ended = 'true'; $('sanctuary-arrival').hidden = false; $('timer-status').textContent = c.done;
    const moveFocus = document.activeElement === $('timer-toggle'); $('timer-toggle').hidden = true; $('timer-reset').hidden = false; $('finish').hidden = false;
    if (moveFocus) $('sanctuary-arrival').querySelector('a.button').focus({preventScroll: true});
  }
  function stop(message = c.paused) {
    if (running) { remaining = current(); running = false; cancelAnimationFrame(frame); }
    document.body.classList.remove('ritual-running'); stopSound(); draw();
    label(remaining === MINUTE_MS ? c.start : c.resume); $('timer-reset').hidden = remaining === MINUTE_MS;
    $('timer-status').textContent = remaining === 0 ? c.done : message;
    syncLanguage();
  }
  $('timer-toggle').addEventListener('click', () => {
    if (running) { stop(); return; } if (remaining <= 0) return;
    startedAt = performance.now(); running = true; document.body.classList.add('ritual-running'); label(c.pause);
    $('finish').hidden = false; $('timer-reset').hidden = true; $('timer-status').textContent = say('Your minute is underway.','आपका शांत मिनट चल रहा है।'); draw();
  });
  $('timer-reset').addEventListener('click', () => {
    stop(); remaining = MINUTE_MS; finished = false; lastPhase = ''; lastSecond = -1; root.dataset.ended = 'false'; root.dataset.phase = 'ready';
    $('sanctuary-arrival').hidden = true; $('timer-toggle').hidden = false; $('timer-reset').hidden = true; $('finish').hidden = true;
    $('breath-phase').textContent = say('At your own pace','अपनी गति से'); $('breath-invitation').textContent = say('Follow only what feels comfortable.','जितना सहज लगे, उतना ही करें।');
    label(c.start); $('timer-status').textContent = c.ready; draw(); $('timer-toggle').focus();
  });
  function updateModeHelp() {
    root.querySelector('.sanctuary-help').textContent = mode === 'guided' ? say('The last four seconds are unpaced. Your minute pauses when you leave this tab.','अंतिम चार सेकंड स्वाभाविक श्वास के लिए हैं। टैब छोड़ने पर मिनट रुक जाता है।') : say('Your minute pauses when you leave this tab.','टैब छोड़ने पर मिनट रुक जाता है।');
  }
  updateModeHelp();
  for (const option of document.querySelectorAll('[name="breath-mode"]')) {
    option.checked = option.value === mode;
    option.addEventListener('change', () => {
      mode = option.value; lastPhase = ''; if (frame) cancelAnimationFrame(frame); draw(); syncLanguage();
      updateModeHelp();
    });
  }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(running ? c.hidden : $('timer-status').textContent); } });
  addEventListener('pagehide', () => stop(c.hidden));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.querySelector('dialog[open]')) { stop(); document.querySelector('.ritual-close').focus(); } });
  $('finish').addEventListener('click', () => {
    stop(); finished = true; $('timer-view').hidden = true; $('finish-view').hidden = false; $('finish-heading').focus({preventScroll: true});
    $('finish-view').scrollIntoView({block: 'nearest', behavior: 'auto'});
  });
  function renderSaved() {
    $('saved-panel').hidden = stored.kind === 'empty'; $('saved-text').textContent = stored.kind === 'saved' ? c.steps[stored.intention] : stored.kind === 'invalid' ? c.corrupt : '';
    $('save-step').disabled = stored.kind === 'invalid';
  }
  function load() { stored = readIntention(storage); renderSaved(); }
  load(); addEventListener('storage', event => { if (event.key === KEY || event.key === null) load(); });
  $('save-step').addEventListener('click', () => {
    if (!finished) return; const option = document.querySelector('input[name="intention"]:checked');
    if (!option) { $('save-status').textContent = c.choose; document.querySelector('input[name="intention"]').focus(); return; }
    try {
      if (readIntention(storage).kind === 'invalid') { load(); $('save-status').textContent = c.corrupt; return; }
      saveIntention(storage, Number(option.value)); load(); $('save-status').textContent = c.saved;
    } catch { $('save-status').textContent = c.storageError; }
  });
  $('remove-step').addEventListener('click', () => {
    try { storage.removeItem(KEY); load(); $('save-status').textContent = c.removed; $('timer-status').textContent = c.removed; (finished ? $('save-step') : $('timer-toggle')).focus(); }
    catch { $('remove-status').textContent = c.removeError; }
  });
  $('share-link').addEventListener('click', async () => {
    const link = `${shareOrigin(location.origin)}${base}pause/?moment=${moment}`;
    try { await navigator.clipboard.writeText(link); $('share-status').textContent = c.copied; $('copy-fallback').hidden = true; }
    catch { $('copy-fallback').hidden = false; $('copy-url').value = link; $('copy-url').focus(); $('copy-url').select(); $('share-status').textContent = ''; }
  });

  // Optional original synthetic tone; no recording, narration or efficacy claim.
  let audio = null, audioGeneration = 0;
  function stopSound() {
    audioGeneration++; if (audio) { audio.close().catch(() => {}); audio = null; }
    $('sanctuary-sound').setAttribute('aria-pressed','false'); $('sanctuary-sound').textContent = say('Sound off','ध्वनि बंद');
  }
  $('sanctuary-sound').addEventListener('click', async () => {
    if (audio) { stopSound(); return; }
    const generation = ++audioGeneration;
    try {
      const Audio = window.AudioContext || window.webkitAudioContext; const engine = new Audio(); audio = engine; await engine.resume();
      if (generation !== audioGeneration || document.hidden) { if (engine.state !== 'closed') await engine.close(); return; }
      const gain = engine.createGain(); gain.gain.setValueAtTime(0,engine.currentTime); gain.gain.linearRampToValueAtTime(.015,engine.currentTime + .8); gain.connect(engine.destination);
      for (const frequency of [174,261]) { const oscillator = engine.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(gain); oscillator.start(); }
      $('sanctuary-sound').setAttribute('aria-pressed','true'); $('sanctuary-sound').textContent = say('Stop soft tone','मंद ध्वनि बंद करें'); $('sound-status').textContent = say('A quiet synthetic tone is on.','मंद संश्लेषित ध्वनि चालू है।');
    } catch { stopSound(); $('sound-status').textContent = say('Sound is unavailable. The quiet minute still works.','ध्वनि उपलब्ध नहीं है। शांत मिनट जारी रह सकता है।'); }
  });
  // Bounded, theme-reactive dust. Shares the timer RAF, never runs in the background.
  const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'); let dustAt = -1000;
  function drawDust(elapsed) {
    if (elapsed < dustAt) dustAt = -1000;
    if (!ctx || motion.matches || document.hidden || elapsed - dustAt < 42) return; dustAt = elapsed;
    const width = root.clientWidth, height = Math.min(root.clientHeight,1200), ratio = Math.min(devicePixelRatio,1.5);
    if (canvas.width !== Math.round(width*ratio) || canvas.height !== Math.round(height*ratio)) { canvas.width = Math.round(width*ratio); canvas.height = Math.round(height*ratio); }
    ctx.setTransform(ratio,0,0,ratio,0,0); ctx.clearRect(0,0,width,height); ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--copper');
    for (let i=0;i<24;i++) { const x = ((i*97.13)%1)*width, y = (((i*61.73)%1)*height - elapsed*.0017 + height)%height; ctx.beginPath(); ctx.arc(x + Math.sin(elapsed/9000+i)*5,y,.7+(i%3)*.35,0,Math.PI*2); ctx.fill(); }
  }
  motion.addEventListener('change', () => { if (motion.matches && ctx) ctx.clearRect(0,0,canvas.width,canvas.height); if (frame) cancelAnimationFrame(frame); draw(); });
  draw(); syncLanguage(); if (remaining === 0) showArrival(); else if (remaining < MINUTE_MS) { label(c.resume); $('timer-reset').hidden = false; $('finish').hidden = false; $('timer-status').textContent = c.paused; }
}
