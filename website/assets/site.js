// Spritual: progressive enhancement only. Every page reads and navigates without this file.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  let UI = {};
  try { UI = JSON.parse($('#ui')?.textContent || '{}'); } catch {}
  const fmt = (s, o) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const store = {
    get(k, d) { try { const v = localStorage.getItem('spritual:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('spritual:' + k, JSON.stringify(v)); } catch {} },
  };
  const reduced = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  // "Automatic" motion still honours the device's reduce-motion setting (boot.js sets this on load)
  const osCalm = () => { if (matchMedia('(prefers-reduced-motion: reduce)').matches) root.dataset.motion = 'reduce'; };
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const dayIndex = (n) => { const d = new Date(); return Math.floor((d - d.getTimezoneOffset() * 6e4) / 864e5) % n; };
  const haptic = (ms = 8) => { try { if (store.get('sound', false)) navigator.vibrate?.(ms); } catch {} };
  // a quiet word for screen readers (a visually hidden role=status on pages that have one)
  const say = (txt) => { const sr = $('[data-sr]'); if (!sr) return; sr.textContent = ''; setTimeout(() => { sr.textContent = txt; }, 30); };

  /* ---------- A pointer to the Hindi edition (English home), only when the browser itself asks for Hindi ---------- */
  // Never a redirect: one quiet line the reader can follow or close; closing it is remembered on this device.
  (() => {
    const hint = $('[data-hi-hint]'); if (!hint || store.get('hiHint', false)) return;
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ''];
    if (!langs.some((x) => /^hi\b/i.test(x))) return;
    hint.hidden = false;
    $('[data-hi-hint-close]', hint)?.addEventListener('click', () => { store.set('hiHint', true); hint.hidden = true; $('.cx-read')?.focus(); });
    $('a', hint)?.addEventListener('click', () => store.set('hiHint', true));
  })();

  /* ---------- Sound: synthesised, opt-in, remembered ---------- */
  const Sound = (() => {
    let ctx, master, drone;
    const on = () => store.get('sound', false);
    const ensure = () => {
      if (!ctx) { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.6; master.connect(ctx.destination); }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    };
    // Recorded-quality sounds rendered offline (scripts/sound.py); the synthesised versions below remain the fallback
    const SOUND = (UI.artBase || '').replace(/art\/$/, 'sound/'); const bufs = {};
    const load = (name) => bufs[name] || (bufs[name] = fetch(SOUND + name + '.mp3').then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then((b) => new Promise((res, rej) => ensure().decodeAudioData(b, res, rej))).catch(() => null));
    const bell = (base = 660, vol = 0.22) => {
      if (!on()) return; const c = ensure();
      load('bell').then((buf) => {
        if (!buf) return synthBell(base, vol);
        const s = c.createBufferSource(); s.buffer = buf; s.playbackRate.value = base / 880;
        const g = c.createGain(); g.gain.value = Math.min(1, vol * 2.4); s.connect(g).connect(master); s.start();
      });
    };
    const synthBell = (base = 660, vol = 0.22) => {
      const c = ensure(); const t = c.currentTime;
      [[1, 1], [2.01, 0.45], [2.98, 0.3], [4.2, 0.15]].forEach(([r, a]) => {
        const o = c.createOscillator(); const g = c.createGain();
        o.type = 'sine'; o.frequency.value = base * r;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol * a, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 / r);
        o.connect(g).connect(master); o.start(t); o.stop(t + 3);
      });
    };
    const whisper = () => {
      if (!on()) return; const c = ensure(); const t = c.currentTime;
      const len = 0.28; const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate); const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.8;
      const g = c.createGain(); g.gain.value = 0.12;
      src.connect(f).connect(g).connect(master); src.start(t);
    };
    const breath = (dir, secs) => {
      if (!on()) return; const c = ensure(); const t = c.currentTime;
      const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine';
      const [a, b] = dir === 'in' ? [196, 294] : [294, 196];
      o.frequency.setValueAtTime(a, t); o.frequency.linearRampToValueAtTime(b, t + secs);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.6); g.gain.setValueAtTime(0.05, t + secs - 0.6); g.gain.linearRampToValueAtTime(0, t + secs);
      o.connect(g).connect(master); o.start(t); o.stop(t + secs);
    };
    // Tanpura-like drone: Pa, Sa, Sa (slightly detuned), low Sa. Triangle through a gentle low-pass, slow breathing of volume.
    const droneStart = () => {
      if (!on() || drone) return; const c = ensure(); const mine = drone = { pending: true };
      load('tanpura').then((buf) => {
        if (drone !== mine) return;
        if (!buf) { drone = null; synthDrone(); return; }
        const src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = 1; src.loopEnd = 1 + 22.4;
        const g = c.createGain(); const t = c.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.55, t + 3);
        src.connect(g).connect(master); src.start(0, 1);
        drone = { g, src, sample: true, level: 0.55 };
      });
    };
    const synthDrone = () => {
      if (!on() || drone) return; const c = ensure();
      const g = c.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.07, c.currentTime + 2.5);
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 520;
      const lfo = c.createOscillator(); const lg = c.createGain(); lfo.frequency.value = 0.11; lg.gain.value = 0.02; lfo.connect(lg).connect(g.gain); lfo.start();
      const oscs = [98, 130.81, 130.81, 65.41].map((hz, i) => { const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = hz; o.detune.value = i === 2 ? 4 : 0; o.connect(f); o.start(); return o; });
      f.connect(g).connect(master);
      drone = { g, oscs, lfo };
    };
    const droneStop = () => {
      if (!drone || !ctx) return; const d = drone; drone = null;
      if (d.pending) return;
      const t = ctx.currentTime; d.g.gain.cancelScheduledValues(t); d.g.gain.setValueAtTime(d.g.gain.value, t); d.g.gain.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(() => { if (d.sample) d.src.stop(); else { d.oscs.forEach((o) => o.stop()); d.lfo.stop(); } }, 1400);
    };
    let river = null;
    const riverStart = () => {
      if (!on() || river) return; const c = ensure();
      const len = 4; const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate); const d = buf.getChannelData(0); let b0 = 0, b1 = 0;
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.98 * b0 + w * 0.02; b1 = 0.9 * b1 + w * 0.1; d[i] = (b0 * 3 + b1 * 0.6 + w * 0.08) * 0.6; }
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; f.Q.value = 0.5;
      const g = c.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.035, c.currentTime + 4);
      const lfo = c.createOscillator(); const lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 0.012; lfo.connect(lg).connect(g.gain); lfo.start();
      src.connect(f).connect(g).connect(master); src.start();
      river = { src, g, lfo };
    };
    const riverStop = () => { if (!river || !ctx) return; const r = river; river = null; r.g.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5); setTimeout(() => { r.src.stop(); r.lfo.stop(); }, 1700); };
    const swell = () => { if (!drone || drone.pending || !ctx) return; const g = drone.g.gain; const t = ctx.currentTime; const lv = drone.level || 0.07; g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(lv * 1.6, t + 1.2); g.linearRampToValueAtTime(lv, t + 4); };
    return { on, bell, whisper, breath, droneStart, droneStop, swell, river: riverStart, riverStop };
  })();
  const paintSound = () => {
    const on = Sound.on();
    for (const b of $$('[data-sound]')) { b.setAttribute('aria-pressed', String(on)); b.title = on ? UI.soundDrone : UI.soundOffLong; const l = b.querySelector('.label, .visually-hidden'); if (l) l.textContent = on ? UI.soundDrone : UI.soundOffLong; }
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sound]');
    if (!b) return;
    const next = !Sound.on();
    store.set('sound', next); paintSound();
    if (next) { Sound.bell(880, 0.18); Sound.droneStart(); if ($('.act')) Sound.river(); } else { Sound.droneStop(); Sound.riverStop(); }
  });
  paintSound();
  // the score carries on from page to page: browsers only let it start again after the first touch or key on a new page
  if (Sound.on()) { const resume = (e) => { if (e.target.closest?.('[data-sound], [data-sound-invite]')) return; removeEventListener('pointerdown', resume); removeEventListener('keydown', resume); Sound.droneStart(); }; addEventListener('pointerdown', resume); addEventListener('keydown', resume); }
  addEventListener('pagehide', Sound.droneStop);

  /* ---------- Opening ---------- */
  const opening = $('[data-opening-screen]');
  const runOpening = (byUser) => {
    if (!opening) return;
    const variant = opening.classList.contains('opening--film') ? 'opening opening--film' : 'opening opening--mark';
    opening.hidden = false; opening.className = variant;
    root.dataset.opening = 'live';
    let done = false; const timers = []; const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const name = $('.opening-name', opening); const brand = $('.site-head .brand-name');
    const finish = (fast) => {
      if (done) return; done = true; timers.forEach(clearTimeout);
      store.set('opened', 'v5');
      const ms = fast ? 480 : 800;
      opening.classList.remove('is-montage'); opening.classList.add('is-on'); opening.classList.add('is-out');
      if (name && brand && !reduced()) {
        const a = name.getBoundingClientRect(), b = brand.getBoundingClientRect(); const sc = b.height / a.height;
        const cream = getComputedStyle(name).color, forest = getComputedStyle(brand).color;
        name.animate([
          { transform: 'translate(0,0) scale(1)', color: cream, offset: 0 },
          { color: cream, offset: .55 },
          { transform: `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(${sc})`, color: forest, offset: 1 },
        ], { duration: ms, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      }
      setTimeout(() => {
        delete root.dataset.opening; document.dispatchEvent(new CustomEvent('spritual:enter'));
        setTimeout(() => { opening.hidden = true; opening.className = variant; if (name) name.getAnimations().forEach((x) => x.cancel()); }, 80);
      }, ms - 40);
    };
    const frames = $$('[data-montage]', opening); const film = variant.includes('film') && frames.length > 0;
    if (film) {
      // a title montage: five frames down the river, a slate on each, then the mark over the first frame
      opening.classList.add('is-montage'); const STEP = 560; let shown = 0;
      frames.forEach((f, i) => at(80 + i * STEP, () => { frames.forEach((x) => x.classList.remove('is-on')); const img = f.querySelector('img'); if (img.complete && img.naturalWidth) { f.classList.add('is-on'); shown++; Sound.whisper(); haptic(3); } }));
      at(80 + frames.length * STEP, () => { opening.classList.remove('is-montage'); opening.classList.add('is-on'); Sound.bell(659, 0.14); haptic(4); });
      at(80 + frames.length * STEP + 1700, () => finish(false));
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => opening.classList.add('is-on')));
      at(120, () => { Sound.whisper(); haptic(4); });
      at(900, () => { Sound.bell(659, 0.14); });
      at(2300, () => finish(false));
    }
    opening.addEventListener('click', () => finish(true));
    if (byUser) Sound.bell(523, 0.2);
    addEventListener('keydown', (e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { if (!done) { e.preventDefault(); finish(true); } } });
  };
  if (opening) {
    const seen = store.get('opened', '') === 'v5';
    if (!seen && !reduced()) {
      runOpening(false);
    } else { opening.hidden = true; delete root.dataset.opening; setTimeout(() => document.dispatchEvent(new CustomEvent('spritual:enter')), 50); }
    $('[data-replay]')?.addEventListener('click', (e) => { e.preventDefault(); scrollTo({ top: 0, behavior: 'auto' }); runOpening(true); });
  }

  /* ---------- Shared-element transitions between a card and its story ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('.card .card-title a'); if (!a || a.target === '_blank') return;
    const img = a.closest('.card')?.querySelector('.card-art img'); if (!img) return;
    try { sessionStorage.setItem('spritual:vt', a.closest('.card').dataset.slug); } catch {}
    img.style.viewTransitionName = 'story-art';
  });
  addEventListener('pagereveal', () => {
    let slug = null; try { slug = sessionStorage.getItem('spritual:vt'); sessionStorage.removeItem('spritual:vt'); } catch {}
    if (!slug || $('[data-reader]')) return;
    const img = $(`.card[data-slug="${slug}"] .card-art img`); if (img) img.style.viewTransitionName = 'story-art';
  });
  // 3D tilt on the featured card and collection cards, hover devices only
  if (matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest('.card--feature, .coll'); if (!el || reduced()) return;
      const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--tx', (y * -3).toFixed(2) + 'deg'); el.style.setProperty('--ty', (x * 3).toFixed(2) + 'deg');
    });
    document.addEventListener('pointerout', (e) => { const el = e.target.closest('.card--feature, .coll'); if (el) { el.style.removeProperty('--tx'); el.style.removeProperty('--ty'); } });
  }

  /* ---------- Folds: long lists (the footer's groups, a story's sources) are open on a large screen, folded on a phone ---------- */
  // The markup has them open (so without this script nothing is hidden); on a large screen they cannot be folded at all.
  const folds = $$('details[data-fold]');
  if (folds.length) {
    const phone = matchMedia('(max-width: 759px)');
    const setFolds = () => folds.forEach((d) => { d.open = !phone.matches; });
    setFolds(); phone.addEventListener?.('change', setFolds);
    folds.forEach((d) => d.querySelector('summary')?.addEventListener('click', (e) => { if (!phone.matches) e.preventDefault(); }));
  }

  /* ---------- Dialogs ---------- */
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-open]');
    if (b) {
      const d = $('#' + b.dataset.open); if (!d) return;
      d.showModal(); haptic();
      // a sheet opens at its top, its heading holding the focus (so the first choices, not the last button, are in view)
      const h = d.querySelector('h2[tabindex="-1"]');
      if (h) { d.scrollTop = 0; h.focus({ preventScroll: true }); }
    }
  });
  if (!('closedBy' in HTMLDialogElement.prototype)) {
    const outside = (e, d) => { const r = d.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
    for (const d of $$('dialog[closedby="any"]')) {
      let down = false;
      d.addEventListener('pointerdown', (e) => { down = outside(e, d); });
      d.addEventListener('pointerup', (e) => { if (down && outside(e, d)) d.close(); });
    }
  }

  /* ---------- Reading comfort ---------- */
  const form = $('[data-comfort]');
  if (form) {
    const prefs = store.get('prefs', {});
    for (const k of ['size', 'theme', 'motion']) {
      const input = form.querySelector(`input[name="${k}"][value="${prefs[k] || ''}"]`);
      if (input) input.checked = true;
    }
    form.addEventListener('change', (e) => {
      const { name, value } = e.target;
      const p = store.get('prefs', {});
      const apply = () => { if (value) { root.dataset[name] = value; p[name] = value; } else { delete root.dataset[name]; delete p[name]; } if (name === 'motion') osCalm(); };
      if (name === 'theme' && document.startViewTransition && !reduced()) document.startViewTransition(apply); else apply();
      store.set('prefs', p); haptic();
    });
  }

  /* ---------- Scroll reveal fallback (CSS view() timelines where supported) ---------- */
  if (!CSS.supports('animation-timeline: view()')) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach((el) => io.observe(el));
  }

  /* ---------- Save for later ---------- */
  const savedList = () => store.get('saved', []);
  const paintSave = () => {
    const list = savedList();
    for (const b of $$('[data-save]')) {
      const on = list.includes(b.dataset.save);
      b.setAttribute('aria-pressed', String(on));
      const label = b.querySelector('span:not(.visually-hidden)');
      if (label) label.textContent = on ? UI.saved : UI.save;
    }
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-save]');
    if (!b) return;
    e.preventDefault();
    const list = savedList();
    const i = list.indexOf(b.dataset.save);
    if (i >= 0) list.splice(i, 1); else { list.unshift(b.dataset.save); Sound.bell(784, 0.12); }
    store.set('saved', list); haptic();
    paintSave(); renderSaved();
  });

  /* ---------- Shared card source ---------- */
  const cardSrc = () => $('[data-grid]') || $('#cards')?.content;
  const cardFor = (slug) => { const c = cardSrc()?.querySelector(`.card[data-slug="${slug}"]`); return c ? c.cloneNode(true) : null; };
  const allCards = () => (cardSrc() ? [...cardSrc().querySelectorAll('.card')] : []);
  const allSlugs = () => allCards().map((c) => c.dataset.slug);
  /* Figures: cards use the shared sprite; featured ones are swapped for inline copies so they can blink and breathe */
  let spriteDoc = null;
  const sprite = async () => { if (spriteDoc) return spriteDoc; const src = $('.fig-use use')?.getAttribute('href')?.split('#')[0]; if (!src) return null; try { const txt = await (await fetch(src)).text(); spriteDoc = new DOMParser().parseFromString(txt, 'image/svg+xml'); } catch { spriteDoc = null; } return spriteDoc; };
  const enliven = async (el) => {
    const doc = await sprite(); if (!doc || !el?.isConnected) return;
    const id = el.dataset.fig; const sym = doc.getElementById('fig-' + id); if (!sym) return;
    el.classList.add('fig-live'); el.classList.remove('fig-use'); el.innerHTML = sym.innerHTML;
  };
  const feature = (c) => { c.classList.add('card--feature'); const img = c.querySelector('img'); if (img) { img.removeAttribute('loading'); img.setAttribute('fetchpriority', 'high'); } const f = c.querySelector('.fig-use'); if (f) enliven(f); return c; };

  /* ---------- Greeting, plan, today's story, "what do you need" ---------- */
  const h = new Date().getHours();
  const greet = $('[data-greet]');
  {
    // the reader's own "when will you read tomorrow" (kept on this device): inside that window, today's story greets them
    const plan = store.get('plan', null);
    const base = h < 12 ? UI.greetMorning : h < 17 ? UI.greetAfternoon : h < 21 ? UI.greetEvening : UI.greetNight;
    const when = plan === 'morning' && h < 12 ? UI.morning : plan === 'evening' && h >= 17 ? UI.evening : null;
    if (greet) { greet.textContent = when ? `${base} ${fmt(UI.planReady, { when })}` : base; greet.hidden = false; }
    const pg = $('[data-plan-greet]');
    if (pg && when) { pg.replaceChildren(document.createTextNode(base + ' '), Object.assign(document.createElement('b'), { textContent: fmt(UI.planReady, { when }) })); pg.hidden = false; }
  }
  const slots = $$('[data-today]');
  const needForm = $('[data-need]');
  const todayPick = () => {
    const slugs = allSlugs(); if (!slugs.length) return null;
    const need = store.get('need', null);
    if (need && need.day === dayKey() && needForm) {
      const values = (needForm.dataset[need.id] || '').split(' ');
      const match = allCards().filter((c) => c.dataset.values.split(' ').some((v) => values.includes(v))).map((c) => c.dataset.slug);
      if (match.length) return { slug: match[dayIndex(match.length)], need };
    }
    return { slug: slugs[dayIndex(slugs.length)], need: null };
  };
  const renderToday = () => {
    const pick = todayPick(); if (!pick) return;
    for (const slot of slots) {
      const c = cardFor(pick.slug); if (!c) continue;
      feature(c);
      const label = slot.closest('[data-today-wrap]')?.querySelector('[data-today-label]');
      if (label) label.textContent = pick.need ? UI.chosen : UI.todayLabel;
      const why = slot.closest('[data-today-wrap]')?.querySelector('[data-why]');
      if (why) { why.hidden = !pick.need; if (pick.need) why.textContent = fmt(UI.because, { need: pick.need.label.toLowerCase() }); }
      slot.replaceChildren(c);
    }
    const heroFig = $('[data-hero-fig] img');
    if (heroFig) {
      const c = cardFor(pick.slug); const lead = c?.dataset.lead; const id = (UI.art || []).includes(lead) ? lead : (UI.art || []).includes(c?.dataset.c) ? c.dataset.c : null;
      if (id && heroFig.dataset.art !== id) {
        const src = c.querySelector(`img[data-art="${id}"]`);
        const swap = () => { heroFig.src = UI.artBase + id + '-540.webp'; heroFig.srcset = `${UI.artBase}${id}-540.webp 540w, ${UI.artBase}${id}-1080.webp 1080w, ${UI.artBase}${id}-1600.webp 1600w`; if (src) { heroFig.width = src.width; heroFig.height = src.height; } heroFig.dataset.art = id; heroFig.classList.remove('is-swapping'); };
        if (reduced()) swap(); else { heroFig.classList.add('is-swapping'); setTimeout(swap, 260); }
      }
    }
    const more = $('[data-more]');
    if (more) { const slugs = allSlugs(); const i = slugs.indexOf(pick.slug); more.replaceChildren(...[1, 2, 3].map((k) => cardFor(slugs[(i + k) % slugs.length])).filter(Boolean)); }
    paintSave();
  };
  if (needForm) {
    const saved = store.get('need', null);
    if (saved && saved.day === dayKey()) { const r = needForm.querySelector(`input[value="${saved.id}"]`); if (r) r.checked = true; }
    needForm.addEventListener('change', (e) => {
      const r = e.target; if (r.name !== 'need') return;
      store.set('need', { id: r.value, label: r.closest('label').textContent.trim(), day: dayKey() });
      Sound.bell(659, 0.12); haptic(); renderToday();
      $('[data-today]')?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'nearest' });
    });
  }
  if (slots.length) renderToday();

  /* ---------- Days with a story: only the days read are drawn, never the days not ---------- */
  const paintStreak = () => {
    const days = store.get('days', []);
    const since = new Date(); since.setDate(since.getDate() - 29); const from = dayKey(since);
    const recent = [...new Set(days)].filter((k) => k >= from).sort();
    const n = recent.length;
    for (const el of $$('[data-streak]')) {
      const dots = el.querySelector('[data-dots]'); const line = el.querySelector('[data-streak-line]');
      if (dots) { dots.hidden = !n; dots.replaceChildren(...recent.map((k, i) => { const s = document.createElement('span'); s.className = 'dot on' + (k === dayKey() ? ' is-today' : ''); s.style.setProperty('--i', Math.min(i, 10)); return s; })); }
      if (line) line.textContent = n ? fmt(n === 1 ? UI.streakLine1 : UI.streakLine, { n }) : days.length ? UI.streakAgain : UI.streakNone;
    }
  };
  paintStreak();

  /* ---------- Festivals: next one, with countdown ---------- */
  for (const el of $$('[data-fest-next]')) {
    const items = $$('[data-fest-date]', el);
    const today = dayKey();
    const next = items.find((i) => i.dataset.festDate >= today);
    items.forEach((i) => { i.hidden = i !== next; });
    if (!next) { el.hidden = true; continue; }
    const d = Math.round((new Date(next.dataset.festDate) - new Date(today)) / 864e5);
    const when = $('[data-fest-when]', next);
    if (when) when.textContent = d === 0 ? UI.festToday : d === 1 ? UI.festTomorrow : fmt(UI.festIn, { n: d });
  }
  // the festivals page: what has passed steps aside, and the next one is marked as coming up
  // (if every listed date has passed, nothing is hidden: the list stays readable until next year's dates are added)
  { const rows = $$('[data-fest-row]'); const today = dayKey(); const anyAhead = rows.some((r) => r.dataset.festRow >= today); let marked = false;
    for (const row of rows) { const past = anyAhead && row.dataset.festRow < today; row.classList.toggle('past', past); if (!past && !marked && row.dataset.festRow >= today) { row.classList.add('next'); row.classList.toggle('is-today', row.dataset.festRow === today); marked = true; } } }

  /* ---------- Continue reading ---------- */
  // Built from the story index every page carries, so it never depends on cards being on the page.
  // A finished story offers the one after it instead of its own last scene.
  {
    const IDX = UI.stories || {}; const last = store.get('last', null); const here = $('[data-reader]')?.dataset.slug;
    const was = last && IDX[last.slug];
    if (was && !(here && here === last.slug)) {
      const total = Math.max(1, +last.total || 1); const n = Math.max(1, Math.min(total, +last.scene || 1));
      const done = n >= total; const s = done ? IDX[was.x] : was;
      if (s) for (const a of $$('[data-continue]')) {
        a.href = done ? s.h : s.h.split('#')[0] + '#page-' + n;
        a.querySelector('[data-continue-kicker]').textContent = done ? UI.upNext : UI.continue;
        a.querySelector('[data-continue-title]').textContent = s.t;
        a.querySelector('[data-continue-scene]').textContent = done ? fmt(UI.afterStory, { title: was.t }) : fmt(UI.sceneOf, { n, t: total });
        const bar = a.querySelector('[data-continue-bar]'); if (bar) { bar.parentElement.hidden = done; bar.style.setProperty('--p', (n / total).toFixed(3)); }
        const im = a.querySelector('[data-continue-pic]'); if (im && s.p) { im.src = s.p; im.hidden = false; } else if (im) im.parentElement.hidden = true;
        a.classList.toggle('is-next', done);
        a.hidden = false; const block = a.closest('[data-continue-block]'); if (block) block.hidden = false;
        // on the home page the returning reader's place takes the slot of the rotating cards
        const deck = a.closest('.cx-open-side')?.querySelector('[data-cards]'); if (deck) deck.hidden = true;
      }
    }
  }

  /* ---------- Saved page: stories + reflections ---------- */
  function renderSaved() {
    const grid = $('[data-saved-grid]'); if (!grid) return;
    const cards = savedList().map(cardFor).filter(Boolean);
    grid.replaceChildren(...cards); $('[data-saved-empty]').hidden = cards.length > 0; paintSave();
  }
  renderSaved(); paintSave();
  // Reflections: each can be removed (with an undo that waits for the reader, no timer); dates in the reader's language
  const journal = $('[data-journal]');
  const humanDay = (k) => { const [y, m, d] = String(k).split('-').map(Number); if (!y || !m || !d) return String(k); try { return new Date(y, m - 1, d).toLocaleDateString(UI.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }); } catch { return String(k); } };
  const sameRefl = (a, b) => a.slug === b.slug && a.day === b.day;
  let lastRemoved = null;
  const renderJournal = (focusKey) => {
    if (!journal) return;
    const items = store.get('reflections', []);
    $('[data-journal-empty]').hidden = items.length > 0;
    journal.replaceChildren(...items.map((r) => {
      const li = document.createElement('li'); li.className = 'journal-item';
      const c = cardFor(r.slug); const title = c?.querySelector('.card-title a');
      li.innerHTML = `<p class="journal-text"></p><div class="journal-foot"><p class="note"><span></span> · <time></time></p><button type="button" class="journal-remove"></button></div>`;
      li.querySelector('.journal-text').textContent = r.text;
      const t = li.querySelector('span'); if (title) { const a = document.createElement('a'); a.href = title.getAttribute('href'); a.textContent = title.textContent; t.replaceChildren(a); } else t.textContent = r.slug;
      const when = humanDay(r.day); const tm = li.querySelector('time'); tm.textContent = when; tm.dateTime = r.day;
      const rm = li.querySelector('.journal-remove'); rm.textContent = UI.remove;
      rm.setAttribute('aria-label', fmt(UI.removeRefl, { title: title ? title.textContent : r.slug, date: when }));
      rm.dataset.key = r.slug + '|' + r.day;
      return li;
    }));
    if (focusKey) [...journal.querySelectorAll('.journal-remove')].find((b) => b.dataset.key === focusKey)?.focus();
  };
  if (journal) {
    renderJournal();
    const msg = $('[data-journal-msg]'); const undo = $('[data-journal-undo]');
    journal.addEventListener('click', (e) => {
      const b = e.target.closest('.journal-remove'); if (!b) return;
      const list = store.get('reflections', []); const [slug, day] = b.dataset.key.split('|');
      const i = list.findIndex((r) => sameRefl(r, { slug, day })); if (i < 0) return;
      lastRemoved = { item: list[i], at: i };
      list.splice(i, 1); store.set('reflections', list); haptic();
      renderJournal();
      msg.textContent = UI.reflRemoved; undo.hidden = false; undo.focus();
    });
    undo.addEventListener('click', () => {
      if (!lastRemoved) return;
      const list = store.get('reflections', []).filter((r) => !sameRefl(r, lastRemoved.item));
      list.splice(Math.min(lastRemoved.at, list.length), 0, lastRemoved.item); store.set('reflections', list.slice(0, 200));
      const key = lastRemoved.item.slug + '|' + lastRemoved.item.day; lastRemoved = null;
      undo.hidden = true; msg.textContent = UI.reflRestored; renderJournal(key);
    });
  }

  /* ---------- Erase everything this site keeps in this browser ---------- */
  // Storage for this site (including records from older versions), the offline copies and the service worker.
  // It asks first, says plainly what goes, and then shows the page as a first-time reader would see it.
  const eraseAll = async () => {
    let ok = true;
    try { localStorage.clear(); } catch { ok = false; }
    try { sessionStorage.clear(); } catch {}
    // the worker still serving this page is told to stop keeping copies first, so nothing is re-saved behind the reader
    try { navigator.serviceWorker?.controller?.postMessage('spritual:erase'); const regs = (await navigator.serviceWorker?.getRegistrations?.()) || []; await Promise.all(regs.map((r) => r.unregister())); } catch {}
    const sweep = async () => { if ('caches' in window) { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } };
    try { await sweep(); } catch { ok = false; }
    setTimeout(() => sweep().catch(() => {}), 1500);   // a painting that was already on its way in
    return ok;
  };
  const afterErase = () => {
    for (const k of ['size', 'theme', 'motion']) delete root.dataset[k];
    osCalm();
    for (const r of $$('[data-comfort] input[value=""]')) r.checked = true;
    Sound.droneStop(); Sound.riverStop(); paintSound();
    lastRemoved = null; const undo = $('[data-journal-undo]'); if (undo) undo.hidden = true; const jm = $('[data-journal-msg]'); if (jm) jm.textContent = '';
    renderSaved(); renderJournal(); paintStreak();
    for (const a of $$('[data-continue]')) { a.hidden = true; const block = a.closest('[data-continue-block]'); if (block) block.hidden = true; const deck = a.closest('.cx-open-side')?.querySelector('[data-cards]'); if (deck) deck.hidden = false; }
    for (const g of $$('[data-greet]')) g.hidden = true;
  };
  for (const box of $$('[data-erase]')) {
    const ask = $('[data-erase-ask]', box); const conf = $('[data-erase-confirm]', box); const yes = $('[data-erase-yes]', box); const no = $('[data-erase-no]', box); const done = $('[data-erase-done]', box);
    ask.hidden = false;
    const close = (back = true) => { conf.hidden = true; ask.hidden = false; ask.setAttribute('aria-expanded', 'false'); if (back) ask.focus(); };
    ask.addEventListener('click', () => { done.textContent = ''; conf.hidden = false; ask.hidden = true; ask.setAttribute('aria-expanded', 'true'); no.focus(); });
    no.addEventListener('click', () => close());
    conf.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } });
    yes.addEventListener('click', async () => {
      yes.disabled = no.disabled = true;
      const ok = await eraseAll();
      yes.disabled = no.disabled = false; close(false); afterErase();
      for (const d of $$('[data-erase-done]')) d.textContent = '';
      done.textContent = ok ? UI.eraseDone : UI.eraseFail; done.focus();
    });
  }

  /* ---------- Library filters ---------- */
  const filters = $('[data-filters]');
  if (filters) {
    const grid = $('[data-grid]'); const cards = $$('.card', grid); const count = $('[data-count]'); const empty = $('[data-empty]');
    // the visible number counts up; screen readers hear one settled result, after typing pauses
    const countSr = $('[data-count-sr]'); let countRaf = 0, srTimer = 0;
    // Hindi is spelt both ways (सुन्दर / सुंदर, चाँद / चांद): a nasal consonant joined to the next one, or a chandrabindu,
    // reads as the anusvara; roman diacritics fold away (Rāma finds Rama). Both the query and what it searches are folded.
    const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC').replace(/[ङञणनम]्(?=[क-ह])/g, 'ं').replace(/ँ/g, 'ं');
    for (const el of [...cards, ...$$('[data-more] li')]) el.dataset.search = norm(el.dataset.search || '');
    const apply = () => {
      const f = new FormData(filters);
      const rawQ = String(f.get('q') || '').trim(); const q = norm(rawQ.toLowerCase()); const value = f.get('value') || ''; const coll = f.get('coll') || ''; const time = f.get('time') || '';
      let n = 0;
      const words = q ? q.split(/\s+/).filter((w) => w.length > 1 || /[^\x00-\x7f]/.test(w)) : [];
      const passes = (c, every) => { const m = +c.dataset.minutes; return (!words.length || words[every ? 'every' : 'some']((w) => c.dataset.search.includes(w))) && (!value || c.dataset.values.split(' ').includes(value)) && (!coll || c.dataset.c === coll)
        && (!time || (time === '6' ? m <= 6 : time === '7' ? m === 7 : m >= 8)); };
      for (const c of cards) { const ok = passes(c, true); c.hidden = !ok; if (ok) n++; }
      // nothing matches every word: show the stories that match some, and say so
      let some = false;
      if (!n && words.length > 1) { for (const c of cards) { const ok = passes(c, false); c.hidden = !ok; if (ok) { n++; some = true; } } }
      const someNote = $('[data-some]'); if (someNote) someNote.hidden = !some;
      // the rest of Spritual (the Ramcharitmanas, the hymns, the characters, the festivals) answers the same search
      const more = $('[data-more]'); let m2 = 0;
      // only the best answers: those matching the most words ("Sundar Kand" finds the Sundar Kand, not every kand)
      if (more) {
        const lis = $$('li', more); const score = (li) => words.filter((w) => li.dataset.search.includes(w)).length;
        const best = words.length ? Math.max(0, ...lis.map(score)) : 0;
        for (const li of lis) { const ok = best > 0 && score(li) === best; li.hidden = !ok; if (ok) m2++; }
        more.hidden = !m2;
      }
      // the empty box: "not on Spritual yet" only when nothing anywhere has the words; if the reader's own filters hid the
      // matching stories it says to clear them; and the suggestions only show when there is nothing better below
      const emptyMsg = $('[data-empty-msg]'); const filtered = !!(value || coll || time);
      const anyText = !!words.length && cards.some((c) => words.some((w) => c.dataset.search.includes(w)));
      if (emptyMsg) {
        emptyMsg.dataset.base ??= emptyMsg.textContent;
        const none = q && !n && !m2 && !(filtered && anyText);
        emptyMsg.textContent = none ? (empty.dataset.none || '').replace('{q}', () => rawQ) : !filtered && q && m2 ? (empty.dataset.below || emptyMsg.dataset.base).replace('{q}', () => rawQ) : emptyMsg.dataset.base;
        const tryRow = $$('.lib-try, .lib-try-links', empty); tryRow.forEach((x) => { x.hidden = !!m2; });
        const reset = $('[data-reset]', empty); if (reset) reset.hidden = !filtered && !q;
      }
      const prev = +(count.dataset.n ?? cards.length); count.dataset.n = n;
      const res = (v) => fmt(v === 1 ? UI.results1 || UI.results : UI.results, { n: v, t: cards.length });
      cancelAnimationFrame(countRaf);
      if (reduced() || prev === n) count.textContent = res(n);
      else { const t0 = performance.now(); const step = (now) => { const k = Math.min(1, (now - t0) / 300); const v = Math.round(prev + (n - prev) * (1 - Math.pow(1 - k, 3))); count.textContent = res(v); if (k < 1) countRaf = requestAnimationFrame(step); }; countRaf = requestAnimationFrame(step); }
      if (countSr) { clearTimeout(srTimer); srTimer = setTimeout(() => { if (countSr.textContent !== res(n)) countSr.textContent = res(n); }, 400); }
      empty.hidden = n > 0;
    };
    filters.addEventListener('input', apply); filters.addEventListener('change', apply);
    filters.addEventListener('submit', (e) => e.preventDefault()); filters.addEventListener('reset', () => setTimeout(apply));
    $('[data-reset]')?.addEventListener('click', () => filters.reset());
    addEventListener('keydown', (e) => { if (e.key === '/' && !/input|textarea/i.test(document.activeElement?.tagName)) { e.preventDefault(); $('#q')?.focus(); } });
  }

  /* ---------- Glossary ---------- */
  const gloss = $('#gloss');
  if (gloss) {
    let defs = {}; try { defs = JSON.parse($('#glossary')?.textContent || '{}'); } catch {}
    const body = $('[data-gloss-body]', gloss); const head = $('[data-gloss-term]', gloss);
    const rail = $('[data-lens-rail]'); const sheet = $('#lens'); const railOn = () => rail && getComputedStyle(rail).display !== 'none';
    const lit = (id) => { $$('.lens-card').forEach((c) => c.classList.toggle('is-lit', c.dataset.lensCard === id)); $$('.term').forEach((t) => t.classList.toggle('is-lit', t.dataset.term === id)); };
    const cardHtml = (d) => `<li class="lens-card"><p class="lens-term"><b></b>${d.deva && d.deva !== d.term ? ' <span class="lens-deva" lang="hi"></span>' : ''}${d.translit ? ' <i class="lens-translit"></i>' : ''}</p>${d.literal ? `<p class="lens-row"><span class="lens-k">${UI.lensLiteral}</span><span data-lit></span></p>` : ''}<p class="lens-row"><span class="lens-k">${UI.lensMeaning}</span><span data-def></span></p>${d.context ? '<p class="lens-row"><span class="lens-k" data-ctx-k></span><span data-ctx></span></p>' : ''}${d.source ? `<p class="lens-src"><span class="lens-k">${UI.lensSource}</span><cite></cite>${d.source.verify ? ` <span class="verify" title="${UI.verify}">[VERIFY]</span>` : ''}</p>` : ''}</li>`;
    const show = (btn) => {
      const id = btn.dataset.term; const d = defs[id]; if (!d) return;
      $$('.term[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false')); btn.setAttribute('aria-expanded', 'true');
      if (railOn()) {
        lit(id); const card = $(`[data-lens-card="${id}"]`);
        if (card) {
          btn.setAttribute('aria-controls', card.id); card.scrollIntoView({ behavior: 'auto', block: 'nearest' });
          // a full-width painting can pass over the rail: keep the lit card in a clear stretch of it, or show the meaning by the word
          if (!clearOfShots(card)) { pop(btn, d); return; }
        }
        // the rail is visual; say the meaning too, so "expanded" is never empty
        say(`${d.term}: ${d.def}`);
        return;
      }
      if (sheet) { openSheet(d, btn); return; }
      pop(btn, d);
    };
    function pop(btn, d) {
      head.textContent = d.term; body.textContent = d.def;
      const r = btn.getBoundingClientRect();
      gloss.style.left = Math.max(8, Math.min(r.left, innerWidth - 300)) + 'px';
      gloss.style.top = (r.bottom + 8) + 'px';
      try { gloss.showPopover(); } catch { gloss.hidden = false; }
    }
    function openSheet(d, btn) {
        const b = $('[data-lens-body]', sheet); b.innerHTML = `<ol class="lens-list">${cardHtml(d)}</ol>`;
        b.querySelector('b').textContent = d.term; const dv = b.querySelector('.lens-deva'); if (dv) dv.textContent = d.deva; const tr = b.querySelector('.lens-translit'); if (tr) tr.textContent = d.translit;
        const li = b.querySelector('[data-lit]'); if (li) li.textContent = d.literal; b.querySelector('[data-def]').textContent = d.def; if (d.context) { b.querySelector('[data-ctx-k]').textContent = d.ctxLabel; b.querySelector('[data-ctx]').textContent = d.context; } const ci = b.querySelector('cite'); if (ci) ci.textContent = d.source.label;
        sheet.showModal();
        // the word stays in sight, above the (short) sheet
        if (btn) requestAnimationFrame(() => {
          const r = btn.getBoundingClientRect(); const room = innerHeight - sheet.getBoundingClientRect().height;
          const want = Math.max(80, room * .45); if (r.top > room - 24 || r.top < 60) scrollBy({ top: r.top - want, behavior: 'auto' });
        });
    }
    // a downward swipe on the sheet puts it away (only from its top, so the meaning itself can still be scrolled)
    if (sheet) {
      let y0 = null;
      sheet.addEventListener('pointerdown', (e) => { y0 = sheet.scrollTop <= 0 && e.pointerType !== 'mouse' ? e.clientY : null; });
      sheet.addEventListener('pointermove', (e) => { if (y0 != null && e.clientY - y0 > 60) { y0 = null; sheet.close(); } });
      sheet.addEventListener('pointerup', () => { y0 = null; }); sheet.addEventListener('pointercancel', () => { y0 = null; });
    }
    // is the card clear of every full-width painting on screen? If not, scroll the rail so it sits in a clear stretch.
    function clearOfShots(card) {
      const bands = () => $$('.shot:not(.shot--card)').map((x) => x.getBoundingClientRect()).filter((r) => r.bottom > 0 && r.top < innerHeight);
      const hit = (top, bottom) => bands().some((r) => r.bottom > top + 4 && r.top < bottom - 4);
      let c = card.getBoundingClientRect(); if (!hit(c.top, c.bottom)) return true;
      const box = rail.getBoundingClientRect(); const lo = Math.max(box.top, 0); const hi = Math.min(box.bottom, innerHeight);
      const cuts = bands().map((r) => [Math.max(lo, r.top), Math.min(hi, r.bottom)]).filter(([a, z]) => z > a).sort((x, y) => x[0] - y[0]);
      const gaps = []; let at = lo; for (const [a, z] of cuts) { if (a > at) gaps.push([at, a]); at = Math.max(at, z); } if (hi > at) gaps.push([at, hi]);
      const room = gaps.find(([a, z]) => z - a >= c.height + 16); if (!room) return false;
      rail.scrollTop += c.top - (room[0] + 8); c = card.getBoundingClientRect();
      return !hit(c.top, c.bottom) && c.top >= lo - 1 && c.bottom <= hi + 1;
    }
    // the lens rail fades at its foot while there is more to scroll
    if (rail) {
      const edge = () => rail.classList.toggle('is-end', rail.scrollTop + rail.clientHeight >= rail.scrollHeight - 4);
      rail.addEventListener('scroll', edge, { passive: true }); addEventListener('resize', edge); edge();
    }
    document.addEventListener('click', (e) => {
      const b = e.target.closest('.term');
      if (b) { show(b); haptic(); } else if (!e.target.closest('.lens-card')) { try { gloss.hidePopover(); } catch { gloss.hidden = true; } $$('.term[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false')); if (railOn()) lit(null); }
    });
    if (matchMedia('(hover: hover)').matches) {
      document.addEventListener('mouseover', (e) => { const b = e.target.closest('.term'); if (b && railOn() && !$('.term[aria-expanded="true"]')) lit(b.dataset.term); });
      document.addEventListener('mouseover', (e) => { const c = e.target.closest('.lens-card'); if (c && !$('.term[aria-expanded="true"]')) lit(c.dataset.lensCard); });
    }
    sheet?.addEventListener('close', () => $$('.term[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false')));
    gloss.addEventListener('toggle', (e) => { if (e.newState === 'closed') $$('.term[aria-expanded="true"]').forEach((t) => t.setAttribute('aria-expanded', 'false')); });
  }

  /* ---------- Reader ---------- */
  const reader = $('[data-reader]');
  const readLang = () => { const r = root.dataset.read || UI.lang; return r === 'both' ? UI.lang : r; };
  const visibleParas = (scene) => $$(`.pair > p[lang="${readLang()}"]`, scene);
  if (reader) {
    const scenes = $$('.scene', reader); const total = scenes.length; const slug = reader.dataset.slug;
    /* Reading edition: English, Hindi or both side by side, without leaving the page */
    const readBtns = $$('[data-read]');
    const setRead = (mode, save) => {
      const btn = readBtns.find((b) => b.dataset.read === mode); if (!btn || btn.disabled) mode = UI.lang;
      // keep the reader's exact place: hold the current scene, and how far into it they were, steady across the change
      const y = scrollY; const anchor = save ? scenes[current - 1] : null; const r0 = anchor?.getBoundingClientRect();
      const f = r0 && r0.top < 0 ? Math.min(1, -r0.top / Math.max(1, r0.height)) : 0;
      root.dataset.read = mode;
      readBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.read === mode)));
      const note = $('[data-draft-note]'); if (note) note.hidden = !((UI.draft || {})[readLang()] || (mode === 'both' && Object.values(UI.draft || {}).some(Boolean)));
      if (save) { const p = store.get('prefs', {}); p.read = mode; store.set('prefs', p); haptic(); }
      if (anchor) { const r1 = anchor.getBoundingClientRect(); const dy = (r1.top + f * r1.height) - (r0.top + f * r0.height); if (Math.abs(dy) > 1) scrollBy({ top: dy, behavior: 'instant' }); }
      else requestAnimationFrame(() => scrollTo(0, y));
    };
    setRead(store.get('prefs', {}).read || UI.lang, false);
    readBtns.forEach((b) => b.addEventListener('click', () => setRead(b.dataset.read, true)));
    const nowLabel = $('[data-scene-now]'); const tocLinks = $$('#toc a'); const toast = $('[data-toast]'); const beads = $$('[data-bead]');
    let current = 1; let maxSeen = 1; let entered = false;
    const langLinks = $$('[data-lang-switch]');
    // Switching language switches the reading edition with it (a reader on the English edition who taps हिं gets the Hindi
    // story, not Hindi menus around English text); side by side stays side by side. The scene carried across is the one at
    // the reading line (30% down the screen), the same one the dock names.
    langLinks.forEach((a) => a.addEventListener('click', () => {
      const p = store.get('prefs', {}); const to = a.getAttribute('lang') === 'hi' ? 'hi' : 'en';
      if (p.read && p.read !== 'both' && p.read !== to) { p.read = to; store.set('prefs', p); }
      if (UI.samePath && entered && root.dataset.mode !== 'leaf') {
        const line = innerHeight * .3; let n = current;
        scenes.forEach((sc, i) => { if (sc.getBoundingClientRect().top <= line) n = i + 1; });
        a.href = a.getAttribute('href').split('#')[0] + '#page-' + n;
      }
    }));
    const markDay = () => { const days = store.get('days', []); if (!days.includes(dayKey())) { days.push(dayKey()); store.set('days', days.slice(-120)); } };
    // real: the reader is actually in the scenes (not just looking at the title card), so their place is worth keeping
    const setCurrent = (n, scrollInto, real = true) => {
      current = n; maxSeen = Math.max(maxSeen, n);
      if (nowLabel) nowLabel.textContent = fmt(UI.sceneOf, { n, t: total });
      tocLinks.forEach((a, i) => a.setAttribute('aria-current', String(i + 1 === n)));
      beads.forEach((b, i) => { b.classList.toggle('on', i + 1 <= n); b.classList.toggle('now', i + 1 === n); });
      const fill = $('[data-rail-fill]'); if (fill) fill.style.setProperty('--p', (n / total).toFixed(3));
      const left = $('[data-left-time]'); if (left) { const mins = Math.ceil(+reader.dataset.minutes * (1 - (n - 1) / total)); left.textContent = n === total ? UI.leftDone : fmt(UI.leftTime, { n: mins }); }
      if (real) entered = true;
      // the language switch carries the scene across (only when the other language has this story)
      if (UI.samePath) langLinks.forEach((a) => { a.href = a.getAttribute('href').split('#')[0] + (entered ? '#page-' + n : ''); });
      if (!real) return;
      store.set('last', { slug, scene: n, total, at: Date.now() });
      if (n >= Math.ceil(total / 2)) markDay();
      if (n === total && !reader.dataset.done) { reader.dataset.done = '1'; Sound.bell(523, 0.2); const d = $('[data-done-line]'); if (d) d.textContent = UI.doneLine; const f = $('[data-story-fig] .fig, [data-story-fig] .art'); if (f) { f.classList.add('is-bowing'); f.addEventListener('animationend', () => f.classList.remove('is-bowing'), { once: true }); } }
      if (scrollInto) scenes[n - 1].scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
    };
    const io = new IntersectionObserver((entries) => { for (const en of entries) if (en.isIntersecting && root.dataset.mode !== 'leaf') setCurrent(scenes.indexOf(en.target) + 1); }, { rootMargin: '-30% 0px -60% 0px' });
    scenes.forEach((s) => io.observe(s));
    // choosing a scene from Contents or the reel moves focus there too, so keyboard and screen-reader readers arrive with it
    // (tabindex is added only here: a focusable section in the markup would stop the browser honouring #page-N on arrival)
    const focusScene = (n) => requestAnimationFrame(() => { const s = scenes[n - 1]; if (!s) return; s.tabIndex = -1; s.focus({ preventScroll: true }); });
    [tocLinks, beads].forEach((links) => links.forEach((a, i) => a.addEventListener('click', (e) => { a.closest('dialog')?.close(); if (root.dataset.mode === 'leaf') { e.preventDefault(); goTo(i + 1); } focusScene(i + 1); })));

    // Leaf mode: one scene at a time
    const goTo = (n, dir) => {
      n = Math.max(1, Math.min(total, n));
      if (n === current && scenes[n - 1].classList.contains('leaf-on')) return;
      scenes.forEach((s, i) => { s.classList.toggle('leaf-on', i + 1 === n); s.classList.remove('leaf-fwd', 'leaf-back'); });
      if (dir) scenes[n - 1].classList.add(dir > 0 ? 'leaf-fwd' : 'leaf-back');
      setCurrent(n, false);
      history.replaceState(null, '', '#page-' + n);
      $('.scenes', reader).scrollIntoView({ behavior: 'auto', block: 'start' });
      Sound.whisper(); haptic(5);
      const prev = $('[data-prev]'), next = $('[data-next]');
      if (prev) prev.disabled = n === 1; if (next) next.disabled = n === total;
      const fin = $('[data-finished]'); if (fin) fin.hidden = n !== total;
      if (dir) say(`${fmt(UI.sceneOf, { n, t: total })}: ${$(`#page-${n}-h`)?.textContent || ''}`);
    };
    const setMode = (m) => {
      if (m === 'leaf') { root.dataset.mode = 'leaf'; goTo(current); } else { delete root.dataset.mode; scenes.forEach((s) => s.classList.remove('leaf-on', 'leaf-fwd', 'leaf-back')); scenes[current - 1].scrollIntoView({ block: 'start' }); }
      const p = store.get('prefs', {}); if (m === 'leaf') p.mode = 'leaf'; else delete p.mode; store.set('prefs', p);
      $$('button[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === (m || 'scroll'))));
    };
    $$('button[data-mode]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    $('[data-prev]')?.addEventListener('click', () => goTo(current - 1, -1));
    $('[data-next]')?.addEventListener('click', () => goTo(current + 1, 1));
    addEventListener('keydown', (e) => {
      if (root.dataset.mode !== 'leaf' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || $('dialog[open]')) return;
      // keys belong to whatever control has focus: Space presses a button, arrows move in a radio group or a text field
      if (e.target.closest?.('button, a[href], input, select, textarea, summary, label, [role="radio"], [role="tab"], [contenteditable]:not([contenteditable="false"]), [popover]')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goTo(current + 1, 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(current - 1, -1); }
    });
    let sx = 0, sy = 0;
    reader.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    reader.addEventListener('touchend', (e) => {
      if (root.dataset.mode !== 'leaf') return;
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }, { passive: true });
    const startScene = Math.max(1, Math.min(total, parseInt((location.hash.match(/page-(\d+)/) || [])[1] || '1', 10)));
    if (store.get('prefs', {}).mode === 'leaf') { current = startScene; setMode('leaf'); } else {
      const hashed = /page-\d+/.test(location.hash);
      setCurrent(startScene, false, hashed); $$('button[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === 'scroll')));
      // arriving at #page-N (Continue reading, a language switch, a shared link): make sure the scene is really in view, even
      // when the browser's own jump happened before pictures and fonts had settled; stop the moment the reader scrolls themselves
      if (hashed) {
        const target = scenes[startScene - 1]; let mine = false;
        const jump = () => { if (!mine) target.scrollIntoView({ block: 'start', behavior: 'instant' }); };
        for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, () => { mine = true; }, { once: true, passive: true });
        jump(); (document.fonts?.ready || Promise.resolve()).then(jump);
        if (document.readyState !== 'complete') addEventListener('load', () => setTimeout(jump, 60), { once: true });
      }
    }

    // Copy link / copy line
    const copyText = async (text, okMsg, btn) => { try { await navigator.clipboard.writeText(text); toast.textContent = okMsg; } catch { toast.textContent = text; } Sound.bell(988, 0.1); haptic(); if (btn) { btn.classList.add('is-done'); setTimeout(() => btn.classList.remove('is-done'), 1200); } setTimeout(() => { toast.textContent = ''; }, 4000); };
    $('[data-copy]')?.addEventListener('click', (e) => copyText(location.href.split('#')[0] + '#page-' + current, UI.copied, e.currentTarget));
    $('[data-copy-line]')?.addEventListener('click', () => {
      const p = visibleParas(scenes[current - 1]).map((x) => x.textContent).join(' ');
      const line = (p.match(/[^.!?।]+[.!?।]/) || [p])[0].trim();
      copyText(`“${line}”\n${document.title.replace(' | Spritual', '')} · Spritual\n${location.href.split('#')[0]}#page-${current}`, UI.quoteCopied, $('[data-copy-line]'));
    });

    // Reflection
    const refl = $('[data-reflect]');
    if (refl) {
      const ta = $('textarea', refl); const kept = $('[data-reflect-kept]');
      const mine = store.get('reflections', []).find((r) => r.slug === slug && r.day === dayKey());
      if (mine) { ta.value = mine.text; kept.textContent = UI.reflectKept; }
      ta.addEventListener('input', () => { if (kept.textContent === UI.reflectEmpty) kept.textContent = ''; });
      refl.addEventListener('submit', (e) => {
        e.preventDefault(); const text = ta.value.trim(); if (!text) { kept.textContent = UI.reflectEmpty; ta.focus(); return; }
        const list = store.get('reflections', []).filter((r) => !(r.slug === slug && r.day === dayKey()));
        list.unshift({ slug, text, day: dayKey() }); store.set('reflections', list.slice(0, 200));
        kept.textContent = UI.reflectKept; Sound.bell(659, 0.18); haptic(12); markDay(); paintStreak();
      });
    }
    // Plan
    for (const b of $$('[data-plan]')) {
      b.addEventListener('click', () => { store.set('plan', b.dataset.plan); $$('[data-plan]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); const s = $('[data-plan-set]'); if (s) s.textContent = fmt(UI.planSet, { when: b.dataset.plan === 'morning' ? UI.morning : UI.evening }); Sound.bell(784, 0.12); haptic(); });
      if (store.get('plan', null) === b.dataset.plan) b.setAttribute('aria-pressed', 'true');
    }

    // Listen: the browser's own speech engine, scene by scene
    const listenBtns = $$('[data-listen]'); const synth = window.speechSynthesis; let state = 'idle';
    const label = (txt) => listenBtns.forEach((b) => {
      b.querySelector('span').textContent = txt; b.setAttribute('aria-pressed', String(state === 'playing'));
      const ic = b.querySelector('svg.ic'); const want = state === 'playing' ? UI.icPause : UI.icPlay; if (ic && want) ic.outerHTML = want;
    });
    const voice = (L = readLang()) => { const want = L === 'hi' ? 'hi' : 'en'; const vs = synth.getVoices(); return vs.find((v) => v.lang.toLowerCase() === `${want}-in`) || vs.find((v) => v.lang.toLowerCase().startsWith(want)) || null; };
    // Only the paragraph being read is marked (a warm rule and tint), and it is kept in view; a thin line on the dock shows
    // how far through the story the voice has come. Doubled stops ("ice..") are made single before they are spoken.
    const dockBar = $('.reader-bar');
    let speakingEl = null;
    const mark = (el) => { if (speakingEl && speakingEl !== el) speakingEl.classList.remove('is-speaking'); speakingEl = el || null; if (el) el.classList.add('is-speaking'); };
    const progress = (v) => dockBar?.style.setProperty('--listen-p', v.toFixed(4));
    const clean = (t) => t.replace(/\s+/g, ' ').replace(/\.{2,}/g, '.').replace(/([.!?।])\s*\./g, '$1').trim();
    const speakScene = (n) => {
      if (n > total) { state = 'idle'; mark(null); progress(0); dockBar?.classList.remove('is-listening'); label(UI.listen); return; }
      const s = scenes[n - 1];
      if (root.dataset.mode === 'leaf') goTo(n, 1);
      const L = readLang(); const h = s.querySelector(`h2[lang="${L}"]`);
      const items = [...(h ? [h] : []), ...visibleParas(s)].filter((el) => el.textContent.trim());
      if (!items.length) { speakScene(n + 1); return; }
      const v = voice(L);
      items.forEach((el, k) => {
        const text = clean(el.textContent); const parts = text.match(/[^.!?।]+[.!?।]+["”’]?|\S[^.!?।]*$/g) || [text];
        parts.forEach((part, i) => {
          const u = new SpeechSynthesisUtterance(part.trim()); u.lang = L === 'hi' ? 'hi-IN' : 'en-IN'; if (v) u.voice = v; u.rate = 0.95;
          if (i === 0) u.onstart = () => {
            mark(el); progress((n - 1 + k / items.length) / total);
            if (root.dataset.mode !== 'leaf') el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
          };
          if (k === items.length - 1 && i === parts.length - 1) u.onend = () => { if (state === 'playing') speakScene(n + 1); };
          synth.speak(u);
        });
      });
    };
    listenBtns.forEach((b) => b.addEventListener('click', () => {
      if (!synth) { toast.textContent = UI.listenNA; return; } haptic();
      if (state === 'idle') {
        // say so plainly when this device has no voice for the language being read, instead of reading it wrongly or not at all
        const L = readLang(); if (synth.getVoices().length && !voice(L)) { toast.textContent = fmt(UI.listenNoVoice, { lang: L === 'hi' ? UI.voiceHi : UI.voiceEn }); setTimeout(() => { toast.textContent = ''; }, 8000); return; }
        state = 'playing'; label(UI.pauseListen); synth.cancel(); dockBar?.classList.add('is-listening'); progress((current - 1) / total); speakScene(current);
      }
      else if (state === 'playing') { state = 'paused'; synth.pause(); label(UI.resume); }
      else { state = 'playing'; synth.resume(); label(UI.pauseListen); }
    }));
    addEventListener('pagehide', () => synth?.cancel());
    // the floating reader dock steps aside once the story has ended, so it never sits over the reflection or the footer links
    // It also stays out of the way while the story's opening is on screen (the opening has its own Begin and Listen).
    const dock = $('.reader-bar'); const ends = $$('.story-end, .cx-credits'); const hero = $('.cx-film-open');
    if (dock && 'IntersectionObserver' in window) {
      const seen = new Set(); let heroOn = false;
      const place = () => { const away = seen.size > 0 || heroOn; dock.classList.toggle('is-away', away); dock.inert = away; };
      const eio = new IntersectionObserver((es) => { es.forEach((en) => (en.isIntersecting ? seen.add(en.target) : seen.delete(en.target))); place(); }, { rootMargin: '0px 0px -20% 0px' });
      ends.forEach((el) => eio.observe(el));
      if (hero) new IntersectionObserver((es) => { heroOn = es[es.length - 1].intersectionRatio >= .15; place(); }, { threshold: [0, .15, .3, .6, 1] }).observe(hero);
    }
    // on a phone (or a phone on its side) the dock tucks away while the reader scrolls on into the story, and comes back
    // the moment they scroll up, in the same rhythm as the header
    const pocket = matchMedia('(max-width: 759px), (orientation: landscape) and (max-height: 520px)');
    if (dock) {
      let lastY = scrollY, tick = false;
      const tuck = () => {
        tick = false; const y = scrollY;
        if (!pocket.matches || dock.contains(document.activeElement)) dock.classList.remove('is-tucked');
        else if (y > lastY + 6) dock.classList.add('is-tucked');
        else if (y < lastY - 6) dock.classList.remove('is-tucked');
        if (Math.abs(y - lastY) > 6) lastY = y;
      };
      addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(tuck); } }, { passive: true });
      dock.addEventListener('focusin', () => dock.classList.remove('is-tucked'));
    }
    if (Sound.on()) Sound.droneStart();
    // Leaving for the quiet minute: remember where the reader was, so /pause/ can show this story's question and bring them back
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href]'); if (!a || !/\/pause\/(index\.html)?$/.test(a.getAttribute('href').replace(/[?#].*$/, ''))) return;
      store.set('pausedFrom', { slug, title: reader.dataset.title, question: reader.dataset.question, url: location.href.split('#')[0] + '#page-' + current, scroll: scrollY, at: Date.now() });
    });
    const back = store.get('returnTo', null);
    if (back && back.slug === slug) { store.set('returnTo', null); const go = () => scrollTo({ top: back.scroll, behavior: 'auto' }); go(); (document.fonts?.ready || Promise.resolve()).then(() => { go(); setTimeout(go, 120); }); if (document.readyState !== 'complete') addEventListener('load', () => setTimeout(go, 60)); }
    /* The verse card: a bilingual line and the collection's emblem, drawn on a canvas on this device */
    const verse = $('#verse');
    if (verse) {
      const canvas = $('[data-verse-canvas]', verse); const dl = $('[data-verse-download]', verse); let format = 'story';
      const lineOf = (lang) => { const sc = scenes[current - 1]; const p = $$(`.pair > p[lang="${lang}"]`, sc).map((x) => x.textContent).join(' '); if (!p) return ''; return (p.match(/[^.!?।]+[.!?।]/) || [p])[0].trim(); };
      const wrap = (ctx, text, x, y, maxW, lh) => { const words = text.split(/\s+/); let line = ''; const lines = []; for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; } if (line) lines.push(line); lines.forEach((l, i) => ctx.fillText(l, x, y + i * lh)); return y + lines.length * lh; };
      const emblemImg = () => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none" stroke="#b08227" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${(UI.emblem || '').replace(/class="dot"/g, 'fill="#b08227" stroke="none"')}</svg>`); });
      const draw = async () => {
        const W = format === 'story' ? 1080 : 1200, H = format === 'story' ? 1920 : 1200; canvas.width = W; canvas.height = H;
        const ctx = canvas.getContext('2d'); const pad = Math.round(W * 0.09);
        try { await document.fonts.load('500 60px Newsreader'); await document.fonts.load('400 40px "Tiro Devanagari Hindi"'); } catch {}
        ctx.fillStyle = '#fbf8f3'; ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = UI.pigment || '#9e2a2b'; ctx.globalAlpha = 0.08; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
        ctx.fillStyle = '#b08227'; ctx.fillRect(pad, pad, W - pad * 2, 3);
        const em = await emblemImg(); const es = Math.round(W * 0.14); if (em) ctx.drawImage(em, pad, pad + 40, es, es);
        ctx.fillStyle = '#786f65'; ctx.font = `600 ${Math.round(W * 0.022)}px "Plus Jakarta Sans", system-ui, sans-serif`; ctx.textBaseline = 'top';
        ctx.fillText((UI.collName || '').toUpperCase(), pad + es + 30, pad + 56);
        ctx.fillStyle = '#181512'; ctx.font = `500 ${Math.round(W * 0.03)}px Newsreader, Georgia, serif`; ctx.fillText(reader.dataset.title, pad + es + 30, pad + 56 + Math.round(W * 0.034));
        const primary = lineOf(readLang()); const other = lineOf(readLang() === 'en' ? 'hi' : 'en');
        let y = format === 'story' ? Math.round(H * 0.34) : Math.round(H * 0.36);
        ctx.fillStyle = '#9e2a2b'; ctx.font = `500 ${Math.round(W * 0.09)}px Newsreader, Georgia, serif`; ctx.fillText('“', pad - 10, y - Math.round(W * 0.07));
        ctx.fillStyle = '#181512';
        const big = Math.round(W * (format === 'story' ? 0.052 : 0.046)); const hi = readLang() === 'hi';
        ctx.font = `${hi ? '400' : '500'} ${big}px ${hi ? '"Tiro Devanagari Hindi"' : 'Newsreader'}, Georgia, serif`;
        y = wrap(ctx, primary, pad, y, W - pad * 2, Math.round(big * (hi ? 1.7 : 1.35))) + Math.round(W * 0.03);
        if (other) { ctx.fillStyle = '#4a433c'; const sm = Math.round(W * 0.034); ctx.font = `${hi ? '400 italic' : '400'} ${sm}px ${hi ? 'Newsreader' : '"Tiro Devanagari Hindi"'}, Georgia, serif`; y = wrap(ctx, other, pad, y, W - pad * 2, Math.round(sm * (hi ? 1.4 : 1.75))); }
        ctx.fillStyle = '#b08227'; ctx.fillRect(pad, H - pad - 90, 80, 2);
        ctx.fillStyle = '#181512'; ctx.font = `600 ${Math.round(W * 0.04)}px Newsreader, Georgia, serif`; ctx.fillText('Spritual', pad, H - pad - 70);
        const wm = ctx.measureText('Spritual').width; ctx.fillStyle = '#9e2a2b'; ctx.fillText('.', pad + wm, H - pad - 70);
        ctx.fillStyle = '#b08227'; ctx.font = `600 ${Math.round(W * 0.02)}px "Plus Jakarta Sans", system-ui, sans-serif`; ctx.textAlign = 'right'; ctx.fillText('spritual.co.in', W - pad, H - pad - 56); ctx.textAlign = 'left';
        try { dl.href = canvas.toDataURL('image/png'); } catch {}
      };
      $$('[data-verse-open]').forEach((b) => b.addEventListener('click', () => { verse.showModal(); draw(); haptic(); }));
      $$('[data-verse-format]', verse).forEach((b) => b.addEventListener('click', () => { format = b.dataset.verseFormat; $$('[data-verse-format]', verse).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); }));
      $('[data-verse-copy]', verse)?.addEventListener('click', async () => { try { const blob = await new Promise((r) => canvas.toBlob(r, 'image/png')); await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); toast.textContent = UI.verseCopied; Sound.bell(988, 0.1); } catch { toast.textContent = UI.listenNA || ''; } setTimeout(() => { toast.textContent = ''; }, 3000); });
    }
  }

  /* ---------- Today: keep an intention ---------- */
  const intent = $('[data-intent]');
  if (intent) {
    const ta = $('#intent'); const kept = $('[data-kept]'); const saved = store.get('intent', null);
    if (saved?.day === dayKey()) { ta.value = saved.text; kept.textContent = UI.kept; }
    intent.addEventListener('submit', (e) => { e.preventDefault(); const text = ta.value.trim() || ta.placeholder; ta.value = text; store.set('intent', { day: dayKey(), text }); kept.textContent = UI.kept; Sound.bell(659, 0.2); haptic(12); });
  }

  /* ---------- Quiet moment: 70 s, five rounds of 4 s in, 4 s hold, 6 s out ---------- */
  const pause = $('[data-pause]');
  if (pause) {
    const breath = $('[data-breath]'); const cue = $('[data-cue]'); const left = $('[data-left]'); const begin = $('[data-begin]'); const stop = $('[data-stop]'); const done = $('[data-done]'); const bead = $('[data-ring-bead]');
    const TOTAL = 70, CYCLE = 14; let timer = null; let lock = null; let t0 = 0; let raf = 0;
    const clock = (s) => `${Math.floor(s / 60)}:${pad(s % 60)}`;
    // where the reader came from
    const from = store.get('pausedFrom', null);
    if (from && Date.now() - from.at < 864e5) {
      const box = $('[data-paused-from]'); box.hidden = false; $('[data-paused-title]').textContent = from.title; $('[data-paused-q]').textContent = from.question;
      for (const a of $$('[data-return], [data-return-done]')) { a.hidden = false; a.href = from.url; a.addEventListener('click', () => store.set('returnTo', { slug: from.slug, scroll: from.scroll })); }
    }
    const spin = () => { if (!bead || reduced()) return; const el = (performance.now() - t0) / 1000; const deg = ((el % CYCLE) / CYCLE) * 360; bead.setAttribute('transform', `rotate(${deg.toFixed(1)} 50 50)`); raf = requestAnimationFrame(spin); };
    const end = (finished) => {
      clearInterval(timer); timer = null; cancelAnimationFrame(raf); breath.removeAttribute('data-phase'); begin.hidden = false; stop.hidden = true; bead?.setAttribute('transform', 'rotate(0 50 50)');
      cue.textContent = finished ? '' : UI.pauseReady; left.textContent = clock(TOTAL); done.hidden = !finished; lock?.release?.().catch(() => {}); lock = null;
      Sound.droneStop(); if (finished) Sound.bell(523, 0.25);
    };
    const start = async () => {
      done.hidden = true; begin.hidden = true; stop.hidden = false; stop.focus(); Sound.droneStart(); t0 = performance.now(); spin();
      try { lock = await navigator.wakeLock?.request('screen'); } catch {}
      let t = 0;
      const tick = () => {
        const c = t % CYCLE;
        if (c === 0) { breath.dataset.phase = 'in'; cue.textContent = UI.pauseIn; Sound.breath('in', 4); haptic(6); }
        if (c === 4) { breath.dataset.phase = 'hold'; cue.textContent = UI.pauseHold; }
        if (c === 8) { breath.dataset.phase = 'out'; cue.textContent = UI.pauseOut; Sound.breath('out', 6); haptic(6); }
        left.textContent = clock(TOTAL - t);
        if (t >= TOTAL) { end(true); return; } t++;
      };
      tick(); timer = setInterval(tick, 1000);
    };
    begin.addEventListener('click', start); $('[data-again]').addEventListener('click', start); stop.addEventListener('click', () => { end(false); begin.focus(); });
  }

  /* ---------- The film clips: each frame's painting breathes as a rendered 2.5D camera move ----------
     Loaded only when the frame is near the viewport, at 720p on small screens or slow connections, never on
     data-saver or reduced motion. The still stays underneath; the clip fades in on its first real frame. */
  const clips = $$('video.frame-video[data-video]');
  const lowData = !!navigator.connection?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches;
  if (clips.length && !reduced() && !lowData) {
    const slow = /\b(2g|3g)\b/.test(navigator.connection?.effectiveType || '');
    // 1080p only for a wide screen (CSS width, not pixel density) on a connection that is not cellular; phones get 720p
    const wantHD = !slow && innerWidth >= 1000 && !/cellular/.test(navigator.connection?.type || '');
    // The opening film carries a ladder of sizes (data-ladder; data-portrait for phone-shaped screens). How much to send:
    // - a slow (2g/3g) or mobile-data connection, or a low-memory device: the smallest cut;
    // - otherwise the smallest cut that covers the screen at its own pixel density;
    // - a phone whose connection the browser does not report (Safari never does) gets the 2160 cut only in HEVC or AV1
    //   (about 2-3 MB for 12 s, less than the old 1080p H.264), else at most the 1280/1080 cut.
    // For the codec, ask the browser (Media Capabilities) instead of guessing from names: HEVC or AV1 where it decodes them
    // smoothly (power-efficiently if it can say), else H.264; if no cut of a size would play smoothly, step down a size.
    // A cut that fails to load is remembered and never asked for again on this page.
    const conn = navigator.connection;
    const smallest = slow || /cellular/.test(conn?.type || '') || (navigator.deviceMemory || 8) < 4;
    const phoneSized = () => Math.min(innerWidth, innerHeight) < 600;
    const tall = () => matchMedia('(max-aspect-ratio: 3/5)').matches;   // the same test as the poster's <source> (build.mjs OPEN_PORTRAIT)
    const CODEC = { hevc: 'hvc1.1.6.L153.B0', av1: 'av01.0.12M.08', h264: 'avc1.640033' };
    const failed = new Set();
    const decodes = async (codec, w, h) => {
      const type = `video/mp4; codecs="${CODEC[codec]}"`;
      try {
        if (navigator.mediaCapabilities?.decodingInfo) {
          const r = await navigator.mediaCapabilities.decodingInfo({ type: 'file', video: { contentType: type, width: w, height: h, bitrate: w * h * 2, framerate: 24 } });
          return r.supported ? (r.smooth ? (r.powerEfficient ? 3 : 2) : 1) : 0;
        }
        return document.createElement('video').canPlayType(type) ? 2 : 0;
      } catch (e) { return codec === 'h264' ? 2 : 0; }
    };
    const fileOf = (v, port, size, codec) => `${v.dataset.video}${port ? '-portrait' : ''}-${size}${codec === 'h264' ? '' : '-' + codec}.mp4`;
    const ladder = async (v) => {
      // a soft, painted film needs far fewer pixels than text: density counts only up to 1.25, and the cut may be
      // upscaled by up to a fifth, so a 1440x900 retina laptop gets the ~1 MB 1080p cut, not the 4.5 MB 2160p one
      const dpr = Math.min(devicePixelRatio || 1, 1.25) * .82; const w = innerWidth, h = innerHeight;
      const port = !!(tall() && v.dataset.portrait);
      const all = (port ? v.dataset.portrait : v.dataset.ladder).split(',').map(Number).sort((a, b) => a - b);
      // a cover-fitted 16:9 film is as tall as the screen or taller (a screen wider than 16:9); a 9:16 one likewise
      const need = (port ? Math.max(h, w * 16 / 9) : Math.max(h, w * 9 / 16)) * dpr * .98;
      const fit = all.find((x) => x >= need) || all[all.length - 1];
      const tryList = smallest ? [all[0]] : all.filter((x) => x <= fit).reverse();
      for (const size of tryList) {
        const key = port ? `p${size}` : String(size); const fw = port ? Math.round(size * 9 / 16) : Math.round(size * 16 / 9);
        const has = (c) => (v.dataset[c] || '').split(',').includes(key);
        // an unreported connection on a phone: the big cut only in an efficient codec
        const bigOnPhone = !conn && phoneSized() && size >= 2160;
        const options = [...['hevc', 'av1'].filter(has), ...(bigOnPhone ? [] : ['h264'])].filter((c) => !failed.has(fileOf(v, port, size, c).split('/').pop()));
        if (!options.length) continue;
        const scores = await Promise.all(options.map((c) => decodes(c, fw, size)));
        const best = Math.max(...scores);
        if (best >= 2 || size === tryList[tryList.length - 1]) {
          const codec = best > 0 ? options[scores.indexOf(best)] : 'h264';
          return { key, url: fileOf(v, port, size, codec) };
        }
      }
      return { key: String(all[0]), url: fileOf(v, false, (v.dataset.ladder || '1080').split(',')[0], 'h264') };
    };
    const src = async (v) => {
      if (v.dataset.ladder) { const pick = await ladder(v); v.dataset.rung = pick.key; v.dataset.shape = pick.key[0] === 'p' ? 'p' : 'l'; return pick.url; }
      return `${v.dataset.video}-${wantHD && (v.hasAttribute('data-hd') || v.closest('.act, .page-frame, .pause--framed')) ? 1080 : 720}.mp4`;
    };
    // a phone turned on its side (or a window dragged from tall to wide) changes which cut fits: swap it at the same moment
    let turnT = 0;
    addEventListener('resize', () => { clearTimeout(turnT); turnT = setTimeout(() => clips.forEach(async (v) => {
      if (!v.dataset.ladder || !v.getAttribute('src') || v.dataset.dead || v.dataset.picking || v.dataset.fellBack) return;
      const shapeNow = tall() && v.dataset.portrait ? 'p' : 'l'; if (shapeNow === v.dataset.shape) return;
      const t = v.currentTime; const was = !v.paused; hide(v);
      v.dataset.picking = '1'; const u = await src(v); delete v.dataset.picking;
      v.src = u; v.load();
      v.addEventListener('loadedmetadata', () => { try { v.currentTime = t % (v.duration || 1); } catch (e) {} if (was) v.play().catch(() => {}); }, { once: true });
    }), 250); });
    const host = (v) => v.closest('[data-media]') || v.closest('.frame');
    const show = (v) => { host(v)?.classList.add('is-live'); };
    const hide = (v) => { host(v)?.classList.remove('is-live'); };
    const start = (v) => {
      if (v.dataset.dead || v.dataset.hold) return;   // a clip held back by its section (e.g. the featured strip) waits its turn
      if (!v.getAttribute('src')) {
        if (v.dataset.picking) return;   // the size and codec are being chosen; play() follows
        v.dataset.picking = '1';
        src(v).then((u) => { delete v.dataset.picking; if (v.dataset.dead || v.getAttribute('src')) return; v.src = u; v.load(); if (v.dataset.near) start(v); });
        return;
      }
      const p = v.play();
      if (p && p.catch) p.catch(() => hide(v));   // autoplay refused (battery saver, policy): the still remains
    };
    clips.forEach((v) => {
      v.addEventListener('playing', () => show(v));
      v.addEventListener('waiting', () => {});
      v.addEventListener('error', () => {
        hide(v);
        // a 4K, portrait, HEVC or AV1 cut that will not load or decode is remembered, and the film falls back once to the
        // plain 1080p H.264 cut (decided by the file that failed, not by its size label)
        const bad = v.currentSrc || v.getAttribute('src') || ''; const plain = `${v.dataset.video}-1080.mp4`;
        const base = (u) => u.split('?')[0].split('/').pop();
        if (v.dataset.ladder && bad) failed.add(base(bad));
        if (v.dataset.ladder && !v.dataset.fellBack && base(bad) !== base(plain)) { v.dataset.fellBack = '1'; v.dataset.rung = '1080'; v.dataset.shape = 'l'; v.src = plain; v.load(); if (v.dataset.near) v.play().catch(() => {}); return; }
        v.removeAttribute('src'); v.dataset.dead = '1';
      });
    });
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      const v = en.target; if (v.dataset.dead) return;
      v.dataset.near = en.isIntersecting ? '1' : '';
      if (en.isIntersecting) start(v); else if (!v.paused) v.pause();
    }), { rootMargin: '40% 0px 40% 0px' });
    window.SpritualClips = { start: (v) => { if (v.dataset.near) start(v); }, stop: (v) => { if (!v.paused) v.pause(); } };
    // the film waits until the page (poster, words, first pictures) has loaded, then for a quiet moment
    // On a phone the opening film waits until the title sequence's curtain has opened (mobile.css: about 2.2 s in), and
    // a 2g/3g connection keeps the poster alone: the film is a nicety, never worth the reader's data on a slow line.
    const pocket = matchMedia('(max-width: 759px), (orientation: landscape) and (max-height: 520px)').matches;
    const titlesOn = !!document.querySelector('.cx-home .cx-spark') && root.classList.contains('cx-js') && !root.classList.contains('cx-seen');
    const watch = () => clips.forEach((v) => {
      if (pocket && v.closest('.cx-open')) {
        if (slow) return;
        const wait = titlesOn ? 2300 - performance.now() : 0;
        if (wait > 0) { setTimeout(() => io.observe(v), wait); return; }
      }
      io.observe(v);
    });
    const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(watch, { timeout: 1500 }) : setTimeout(watch, 300));
    if (document.readyState === 'complete') idle(); else addEventListener('load', idle, { once: true });
    document.addEventListener('visibilitychange', () => clips.forEach((v) => { if (document.hidden) { if (!v.paused) v.pause(); } else if (v.getAttribute('src') && !v.dataset.hold && host(v)?.classList.contains('is-live')) v.play().catch(() => {}); }));
  }

  /* ---------- The film: act progress, the scrubber, the drone that swells between acts ---------- */
  const acts = $$('.act');
  if (acts.length) {
    const nodes = $$('[data-scrub-node]'); const fill = $('[data-scrub-fill]'); let active = -1;
    const tints = ['120 130 190', '235 190 120', '240 170 90', '255 255 255', '240 150 90', '200 150 190'];
    acts.forEach((a, i) => a.style.setProperty('--act-tint', tints[i] || '255 255 255'));
    const update = () => {
      const vh = innerHeight; let best = -1, bestV = 0;
      acts.forEach((a, i) => {
        const r = a.getBoundingClientRect(); const span = Math.max(1, r.height - vh); const p = Math.min(1, Math.max(0, -r.top / span));
        a.style.setProperty('--act-progress', p.toFixed(3));
        const vis = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)); if (vis > bestV) { bestV = vis; best = i; }
      });
      if (best !== active) {
        const was = active; active = best; root.dataset.act = String(best);
        nodes.forEach((n, i) => n.setAttribute('aria-current', String(i === best)));
        if (was >= 0) { Sound.swell(); haptic(4); }
      }
      if (fill) fill.style.setProperty('--p', ((active + (parseFloat(acts[active]?.style.getPropertyValue('--act-progress')) || 0)) / acts.length).toFixed(3));
    };
    let ticking = false;
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { update(); ticking = false; }); } }, { passive: true });
    addEventListener('resize', update); update();
    nodes.forEach((n, i) => n.addEventListener('click', (e) => { e.preventDefault(); acts[i].scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); }));
    // the camera follows the pointer a little: paintings one way, cards the other
    if (matchMedia('(hover: hover)').matches) {
      let px = 0, py = 0, tx = 0, ty = 0, pr = 0;
      const ease = () => { px += (tx - px) * 0.08; py += (ty - py) * 0.08; root.style.setProperty('--px', px.toFixed(3)); root.style.setProperty('--py', py.toFixed(3)); pr = Math.abs(tx - px) + Math.abs(ty - py) > 0.002 ? requestAnimationFrame(ease) : 0; };
      addEventListener('pointermove', (e) => { if (reduced()) return; tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2; if (!pr) pr = requestAnimationFrame(ease); }, { passive: true });
    }
    const grain = $('[data-grain]');
    if (grain && window.SpritualScene?.grain) SpritualScene.grain(grain);
    if (Sound.on()) { Sound.droneStart(); Sound.river(); }
    addEventListener('pagehide', Sound.riverStop);
  }
})();
