(() => {
const d = document, root = d.documentElement;
const $ = (s, r = d) => r.querySelector(s);
const $$ = (s, r = d) => [...r.querySelectorAll(s)];
const fmt = (s, o) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => o[k]);
const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const svg = (p) => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC = {
prev: svg('<path class="ic-fill" d="M17.5 6.2v11.6a.8.8 0 0 1-1.2.7L8 12.7a.8.8 0 0 1 0-1.4l8.3-5.8a.8.8 0 0 1 1.2.7Z"/><path d="M6.5 6v12"/>'),
next: svg('<path class="ic-fill" d="M6.5 6.2v11.6a.8.8 0 0 0 1.2.7l8.3-5.8a.8.8 0 0 0 0-1.4L7.7 5.5a.8.8 0 0 0-1.2.7Z"/><path d="M17.5 6v12"/>'),
x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
snd: svg('<path class="ic-fill" d="M4 9.5v5h3.5l5 4v-13l-5 4H4Z"/><path class="wt-on-ic" d="M16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10"/><path class="wt-off-ic" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>'),
cc: svg('<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M10.5 10.2a2.3 2.3 0 1 0 0 3.6M17 10.2a2.3 2.3 0 1 0 0 3.6"/>'),
};
const SIZES = '(min-aspect-ratio: 21/9) 177.78vh, (min-aspect-ratio: 16/9) 100vw, 177.78vh';
let T = null;
window.SpritualWatch = (ctx, opener) => (T || (T = make(ctx))).open(opener);
function make(ctx) {
const { UI } = ctx; const W = UI.w; const L = UI.lang; const N = ctx.total;
let data = {}; try { data = JSON.parse($('#watch-data').textContent); } catch {}
const hero = $('.cx-film-open-pic img');
const title = ($('#story-h .visually-hidden') || $('#story-h') || {}).textContent?.trim() || d.title;
const kicker = $$('.cx-film-k span').map((s) => s.textContent).join(' · ');
const nextA = $('.cx-next');
const reduced = ctx.reduced;
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const seg = window.Intl?.Segmenter ? new Intl.Segmenter(L, { granularity: 'grapheme' }) : null;
const readMs = (t) => Math.max(3200, L === 'hi' && seg ? [...seg.segment(t.replace(/\s+/g, ''))].length * 100 : words(t) * 330);
const halve = (s) => {
if (words(s) <= 28) return [s];
let best = -1; const mid = s.length / 2;
for (const m of s.matchAll(/[,;:—–]\s/g)) { const i = m.index + 1; if (words(s.slice(0, i)) >= 6 && words(s.slice(i)) >= 6 && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i; }
return best < 0 ? [s] : [...halve(s.slice(0, best).trim()), ...halve(s.slice(best).trim())];
};
const chunk = (text) => {
const ss = (text.replace(/\s+/g, ' ').trim().match(/[^.!?।]+(?:[.!?।]+["”’')]*|$)/g) || []).map((x) => x.trim()).filter(Boolean).flatMap(halve);
const out = [];
for (const s of ss) { const p = out[out.length - 1]; if (p && (words(p) < 7 || words(s) < 5) && words(p) + words(s) <= 20) out[out.length - 1] = p + ' ' + s; else out.push(s); }
return out;
};
const SC = [{ ...(data.open || {}), steps: [{ k: 'open', say: title, ms: 4600 }] }];
for (let k = 1; k <= N; k++) {
const sec = ctx.scenes[k - 1]; const h = $(`#page-${k}-h`, sec)?.textContent.trim() || ''; let steps = null;
SC.push({ ...(data.scenes?.[k - 1] || {}), h, get steps() {
return steps || (steps = [{ k: 'title', say: h, ms: 3600 }, ...$$(`.scene-text .pair > p[lang="${L}"]`, sec).flatMap((p) => chunk(p.textContent)).map((c) => ({ k: 'cap', text: c, say: c, ms: readMs(c) + 400 }))]);
} });
}
const dlg = d.createElement('dialog');
dlg.className = 'wt'; dlg.lang = L; dlg.tabIndex = -1; dlg.autofocus = true; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true');
dlg.setAttribute('aria-labelledby', 'wt-name'); dlg.setAttribute('aria-describedby', 'wt-help');
const layer = () => '<div class="wt-layer"><img class="wt-fill" alt="" decoding="async"><div class="wt-cam"><img class="wt-img" alt="" decoding="async"></div></div>';
dlg.innerHTML = `<div class="wt-stage" aria-hidden="true">${layer()}${layer()}<div class="wt-dim"></div><div class="wt-shade"></div></div>
<div class="wt-title" aria-live="polite"><p class="wt-k"></p><h2 class="wt-h"></h2><p class="wt-sub"></p></div>
<div class="wt-cap" aria-live="polite" aria-atomic="true"><p></p></div>
<span class="wt-flash" aria-hidden="true"></span>
<div class="wt-ui">
<div class="wt-top"><p class="wt-name" id="wt-name">${esc(title)}</p><p class="wt-note" role="status"></p><button type="button" class="wt-b" data-a="close" aria-label="${esc(W.wClose)}">${IC.x}</button></div>
<div class="wt-bot">
<div class="wt-prog" role="group" aria-label="${esc(W.wScenes)}">${SC.slice(1).map((s, i) => `<button type="button" class="wt-seg" data-k="${i + 1}" aria-label="${esc(fmt(UI.sceneOf, { n: i + 1, t: N }))}: ${esc(s.h)}"><i></i></button>`).join('')}</div>
<div class="wt-row"><p class="wt-now" aria-hidden="true"></p>
<div class="wt-mid"><button type="button" class="wt-b" data-a="prev" aria-label="${esc(W.wPrev)}">${IC.prev}</button><button type="button" class="wt-b wt-play" data-a="play"></button><button type="button" class="wt-b" data-a="next" aria-label="${esc(W.wNext)}">${IC.next}</button></div>
<div class="wt-opt"><button type="button" class="wt-b" data-a="caps" aria-pressed="true" aria-label="${esc(W.wCaps)}">${IC.cc}</button><button type="button" class="wt-b wt-snd" data-a="sound" aria-pressed="false" aria-label="${esc(W.wSound)}">${IC.snd}</button></div></div>
</div>
</div>
<section class="wt-end" hidden aria-labelledby="wt-end-t">
<div class="wt-end-pic" aria-hidden="true"><img alt="" decoding="async"></div>
<div class="wt-end-in"><p class="wt-k">${esc(UI.theEnd || '')}</p><h2 class="wt-end-t" id="wt-end-t">${esc(title)}</h2>
<div class="wt-end-row"><button type="button" class="cx-btn cx-btn--light" data-a="read">${esc(W.wReadIt)}</button><button type="button" class="cx-btn cx-btn--ghost" data-a="replay">${esc(W.wReplay)}</button></div>
${nextA ? `<a class="wt-next" href="${esc(nextA.getAttribute('href').split('#')[0])}#watch"><small>${esc(W.wNextStory)}</small><strong>${esc($('strong', nextA)?.textContent || '')}</strong><span class="wt-next-go" aria-hidden="true">${IC.next}</span></a>` : ''}
</div>
</section>
<p class="visually-hidden" id="wt-help">${esc(W.wHelp)}</p>`;
d.body.append(dlg);
const q = (s) => $(s, dlg);
const layers = $$('.wt-layer', dlg).map((el) => ({ el, cam: $('.wt-cam', el), img: $('.wt-img', el), fill: $('.wt-fill', el), anim: null }));
const titleEl = q('.wt-title'), capEl = q('.wt-cap'), capP = $('p', capEl), note = q('.wt-note'), now = q('.wt-now'), flash = q('.wt-flash');
const playBtn = q('[data-a="play"]'), sndBtn = q('[data-a="sound"]'), capsBtn = q('[data-a="caps"]'), segs = $$('.wt-seg', dlg), endEl = q('.wt-end');
titleEl.lang = capEl.lang = L;
let open = false, playing = false, ended = false, scene = 0, idx = 0, token = 0, sayTok = 0, cur = 0, z = 1, back = null, pushed = false;
let reached = 0, spoken = false, autoPaused = false, fire = null, fireNow = false, capsOn = ctx.store.get('wtCaps', true);
let timer = 0, due = 0, left = 0, fn = null;
const after = (ms, f) => { clearTimeout(timer); timer = 0; fn = f; left = ms; due = performance.now() + ms; if (playing) timer = setTimeout(tick, ms); };
const tick = () => { timer = 0; const f = fn; fn = null; f?.(); };
const freeze = () => { if (timer) { clearTimeout(timer); timer = 0; left = Math.max(0, due - performance.now()); } };
const thaw = () => { if (fn && !timer) { due = performance.now() + left; timer = setTimeout(tick, left); } };
const stopClock = () => { clearTimeout(timer); timer = 0; fn = null; };
const MOVES = [[1.03, 0, 0, 1.16, 0, 0], [1.15, -1, 0, 1.15, 1, 0], [1.2, 0, 0, 1.05, 0, 0], [1.13, 0, .8, 1.16, 0, -.8], [1.05, .7, .5, 1.17, -.5, -.4]];
const tf = (s, x, y, fx, fy) => { const b = (u, f) => (u >= 0 ? f : 100 - f) * (s - 1) * .85 * u; return `translate3d(${b(x, fx).toFixed(2)}%, ${b(y, fy).toFixed(2)}%, 0) scale(${s.toFixed(3)})`; };
const camera = (ly, k) => {
ly.anim?.cancel(); ly.anim = null;
const sc = SC[k]; const fx = sc.x ?? 50, fy = sc.y ?? 45;
ly.cam.style.transform = sc.p && reduced() ? 'scale(1.3)' : '';
if (reduced()) return;
const m = k === 0 ? [1.02, 0, 0, 1.1, 0, 0] : MOVES[(k - 1) % MOVES.length].slice();
if (sc.p) { m[0] += .22; m[3] += .22; }
if (k % MOVES.length === 2) { const dir = fx < 45 ? 1 : fx > 55 ? -1 : (k % 4 ? 1 : -1); m[1] *= dir; m[4] *= dir; }
let st = m.slice(0, 3), en = m.slice(3), dur = 10000 + ((k * 7) % 5) * 1000, ease = 'cubic-bezier(.45, .05, .4, 1)';
const leg = () => {
if (ly !== layers[cur] && ly.anim) return;
const a = ly.cam.animate([{ transform: tf(...st, fx, fy) }, { transform: tf(...en, fx, fy) }], { duration: dur, easing: ease, fill: 'forwards' });
if (!playing) a.pause();
ly.anim = a;
a.finished.then(() => { if (ly.anim !== a || !open) return; st = en; const s = en[0] > 1.19 ? en[0] - .05 : en[0] + .04; en = [s, -en[1] * .5, -en[2] * .5]; dur = 14000; ease = 'ease-in-out'; leg(); }, () => {});
};
leg();
};
const lowData = !!navigator.connection?.saveData || matchMedia('(prefers-reduced-data: reduce)').matches;
const pick = (img, sc) => { img.sizes = SIZES; img.srcset = (!lowData && sc.s) || ''; img.src = sc.i; };
const setImg = (img, sc) => { if (img.dataset.i === sc.i) return; img.dataset.i = sc.i; pick(img, sc); };
let pre = null;
const preload = (sc) => { if (!sc?.i) return; pre = new Image(); pick(pre, sc); pre.decode?.().catch(() => {}); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const show = async (k, my) => {
const sc = SC[k]; const ly = layers[cur ^ 1]; const old = layers[cur];
if (ly.el.classList.contains('is-on')) { old.el.style.transition = 'none'; ly.el.classList.remove('is-on'); ly.anim?.cancel(); ly.anim = null; void old.el.offsetWidth; old.el.style.transition = ''; }
ly.el.style.setProperty('--fx', (sc.x ?? 50) + '%'); ly.el.style.setProperty('--fy', (sc.y ?? 45) + '%');
ly.el.classList.toggle('is-plate', !!sc.p);
if (k === 0 && hero?.currentSrc && hero.complete) { ly.img.dataset.i = ''; ly.img.removeAttribute('srcset'); ly.img.src = hero.currentSrc; } else setImg(ly.img, sc);
const wide = matchMedia('(min-aspect-ratio: 21/9)').matches;
await Promise.race([ly.img.decode().catch(() => {}), wait(3500)]);
if (my !== token) return;
if (wide) ly.fill.src = ly.img.currentSrc || ly.img.src;
ly.el.style.zIndex = ++z; ly.el.classList.add('is-on'); cur ^= 1;
camera(ly, k);
setTimeout(() => { if (layers[cur] === ly) { old.el.classList.remove('is-on'); old.anim?.cancel(); old.anim = null; } }, reduced() ? 950 : 1000);
fireNow = !!sc.f; embers();
};
const embers = () => {
if (fireNow && !fire && window.SpritualFx) fire = SpritualFx.embers($('.wt-stage', dlg), () => open && fireNow);
if (fire) { fire.cv.classList.toggle('is-on', fireNow && open); fire.wake(); }
};
new MutationObserver(() => {
if (!open || ended) return;
if (reduced()) layers.forEach((l) => { l.anim?.cancel(); l.anim = null; });
else if (!layers[cur].anim) camera(layers[cur], scene);
}).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
let shownCap = '';
const setCap = (text, hold = 0) => {
if (text === shownCap) return; shownCap = text; capEl.classList.add('is-out');
setTimeout(() => { if (shownCap !== text) return; capP.textContent = text; if (text) capEl.classList.remove('is-out'); }, capP.textContent ? 400 : hold);
};
let titleT = 0;
const setTitle = (st) => {
clearTimeout(titleT);
if (!st) { titleEl.classList.remove('is-in'); dlg.classList.remove('is-titling'); return; }
const k = st.k === 'open' ? kicker : fmt(UI.sceneOf, { n: scene, t: N }), h = st.k === 'open' ? title : SC[scene].h, sub = st.k === 'open' ? fmt(W.wFilmOf, { n: N }) : '';
const up = () => {
titleEl.classList.toggle('is-open', st.k === 'open');
$('.wt-k', titleEl).textContent = k; $('.wt-h', titleEl).textContent = h; $('.wt-sub', titleEl).textContent = sub;
titleEl.classList.add('is-in'); dlg.classList.add('is-titling');
};
titleEl.classList.remove('is-in');
const o = +getComputedStyle(titleEl).opacity;
if (o > .02) {
titleEl.getAnimations().forEach((a) => a.cancel());
titleEl.animate([{ opacity: o }, { opacity: 0 }], { duration: 250, easing: 'ease' });
titleT = setTimeout(up, 260);
} else up();
};
let fillA = 0, fillB = 0, fillT = 0, fillMs = 0;
const fillTo = (a, b, ms) => {
const i = $('i', segs[scene - 1] || d.createElement('b')); fillA = a; fillB = b; fillT = performance.now(); fillMs = ms;
i.style.transition = 'none'; i.style.transform = `scaleX(${a})`;
if (playing) requestAnimationFrame(() => { i.style.transition = `transform ${ms}ms linear`; i.style.transform = `scaleX(${b})`; });
};
const fillHold = () => { if (!scene) return; const f = fillA + (fillB - fillA) * Math.min(1, (performance.now() - fillT) / Math.max(1, fillMs)); fillTo(f, f, 0); fillB = f; };
const paintProg = () => segs.forEach((s, i) => { const k = i + 1; if (k === scene) s.setAttribute('aria-current', 'step'); else { s.removeAttribute('aria-current'); $('i', s).style.cssText = `transition:transform .5s;transform:scaleX(${k < scene ? 1 : 0})`; } });
const paintPlay = () => { playBtn.innerHTML = (playing ? UI.icPause : UI.icPlay) || ''; playBtn.setAttribute('aria-label', playing ? W.wPause : W.wPlay); dlg.classList.toggle('is-paused', !playing); };
const paintOpts = () => { const on = ctx.sound.on(); sndBtn.setAttribute('aria-pressed', String(on)); capsBtn.setAttribute('aria-pressed', String(capsOn)); dlg.classList.toggle('no-caps', !capsOn); dlg.classList.toggle('is-sound', on); };
let noteT = 0;
const say = (t) => { note.textContent = t; clearTimeout(noteT); noteT = setTimeout(() => { note.textContent = ''; }, 6000); };
const voiced = () => ctx.sound.on() && !ctx.mute();
const run = (i) => {
const st = SC[scene].steps[i];
if (!st) return go(scene + 1);
idx = i; spoken = false; const titled = titleEl.classList.contains('is-in') && !reduced();
setTitle(st.k === 'cap' ? null : st); setCap(st.k === 'cap' ? st.text : '', titled ? 500 : 0);
const n = SC[scene].steps.length; if (scene) fillTo(i / n, (i + 1) / n, st.ms);
const nextStep = () => run(i + 1);
if (playing && voiced() && st.say) {
const me = ++sayTok; spoken = true; let started = false; const t0 = performance.now();
const hold = st.k === 'cap' ? 1800 : st.ms;
const ok = ctx.speak(st.say, () => { if (me === sayTok) after(Math.max(st.k === 'cap' ? 500 : 900, hold - (performance.now() - t0)), nextStep); }, (e) => { if (me === sayTok && e?.error !== 'interrupted' && e?.error !== 'canceled') { spoken = false; after(Math.max(0, st.ms - (performance.now() - t0)), nextStep); } }, () => { started = true; });
if (ok) { after(2500, () => { if (me !== sayTok) return; if (started) after(Math.max(st.ms * 3, 15000) - 2500, nextStep); else { sayTok++; ctx.hush(); spoken = false; after(Math.max(0, st.ms - 2500), nextStep); } }); return; }
spoken = false;
}
after(st.ms, nextStep);
};
const go = async (k) => {
const my = ++token; sayTok++; ctx.hush(); stopClock();
if (k > N) return end();
k = Math.max(0, k);
if (ended) { ended = false; endEl.hidden = true; dlg.classList.remove('is-ended'); }
scene = k; now.textContent = k ? fmt(UI.sceneOf, { n: k, t: N }) : ''; paintProg();
if (k) { reached = Math.max(reached, k); ctx.reached(k); }
setCap(''); if (k) setTitle(null);
await show(k, my);
if (my !== token) return;
preload(k < N ? SC[k + 1] : data.next);
run(0);
};
const end = () => {
ended = true; stopClock(); setCap(''); setTitle(null); fireNow = false; embers();
segs.forEach((s) => { $('i', s).style.cssText = 'transform:scaleX(1)'; s.removeAttribute('aria-current'); });
const img = $('img', endEl); if (data.next && img.dataset.i !== data.next.i) setImg(img, data.next);
endEl.hidden = false; dlg.classList.add('is-ended'); dlg.classList.remove('is-idle');
requestAnimationFrame(() => q('[data-a="read"]').focus({ preventScroll: true }));
};
const play = () => {
if (playing) return; playing = true; paintPlay();
if (ended) return go(0);
layers.forEach((l) => l.anim?.play());
if (spoken || !fn) run(idx); else { thaw(); if (scene) fillTo(fillB, (idx + 1) / SC[scene].steps.length, left); }
};
const pause = () => {
if (!playing) return; playing = false; paintPlay();
freeze(); fillHold(); layers.forEach((l) => l.anim?.pause());
if (spoken) { sayTok++; ctx.hush(); stopClock(); }
};
const toggle = () => { (playing ? pause : play)(); flash.className = 'wt-flash'; void flash.offsetWidth; flash.innerHTML = (playing ? UI.icPlay : UI.icPause) || ''; flash.className = 'wt-flash is-on'; };
const sound = () => {
const on = !ctx.sound.on(); ctx.sound.duck(.35); ctx.sound.set(on); paintOpts(); ctx.haptic?.();
if (on && ctx.mute()) say(ctx.noVoice());
if (!on) { sayTok++; ctx.hush(); }
if (playing && !ended) { stopClock(); run(idx); }
};
const caps = () => { capsOn = !capsOn; ctx.store.set('wtCaps', capsOn); paintOpts(); };
let idleT = 0;
let keyNav = false;
const kbd = () => { const a = d.activeElement; return keyNav && !!a && a !== dlg && dlg.contains(a) && !!a.closest('.wt-ui, .wt-end'); };
d.addEventListener('keydown', (e) => { if (e.key === 'Tab' || e.key === 'Enter') keyNav = true; }, true);
d.addEventListener('pointerdown', () => { keyNav = false; }, true);
const idle = () => { if (playing && !ended && open && !kbd()) dlg.classList.add('is-idle'); };
const poke = () => { dlg.classList.remove('is-idle'); clearTimeout(idleT); idleT = setTimeout(idle, 2500); };
dlg.addEventListener('click', (e) => {
const b = e.target.closest('[data-a], .wt-seg, a'); poke();
if (b?.classList.contains('wt-next') && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && e.button === 0) { e.preventDefault(); ctx.hush(); location.replace(b.href); return; }
if (!b) { if (swiped) { swiped = false; return; } if (!ended && !e.target.closest('.wt-ui')) toggle(); return; }
if (b.classList.contains('wt-seg')) return go(+b.dataset.k);
const a = b.dataset.a;
if (a === 'close') close();
else if (a === 'play') toggle();
else if (a === 'prev') go(scene > 1 ? scene - 1 : scene);
else if (a === 'next') go(scene + 1);
else if (a === 'sound') sound();
else if (a === 'caps') caps();
else if (a === 'replay') { reached = 0; playing = true; paintPlay(); go(0); }
else if (a === 'read') close(false, ended ? 1 : scene || 1);   // after the whole film, the reading starts at the beginning
});
d.addEventListener('keydown', (e) => {
if (!open || e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
const k = e.key, c = e.code; poke();
if (k === 'Tab') {
const f = $$('button, a[href]', dlg).filter((el) => el.offsetParent && getComputedStyle(el).visibility !== 'hidden');
const i = f.indexOf(d.activeElement); e.preventDefault(); keyNav = true;
f[i < 0 ? (e.shiftKey ? f.length - 1 : 0) : (i + (e.shiftKey ? f.length - 1 : 1)) % f.length]?.focus();
}
else if (k === ' ' && !e.target.closest('button, a')) { e.preventDefault(); toggle(); }
else if (k === 'ArrowRight' && !ended) { e.preventDefault(); go(scene + 1); }
else if (k === 'ArrowLeft') { e.preventDefault(); go(ended ? N : scene > 1 ? scene - 1 : scene); }
else if (c === 'KeyM' || k === 'm' || k === 'M') sound();
else if (c === 'KeyC' || k === 'c' || k === 'C') caps();
});
dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
let mx = -1, my2 = -1;
dlg.addEventListener('pointermove', (e) => { if (Math.abs(e.clientX - mx) + Math.abs(e.clientY - my2) > 4) { mx = e.clientX; my2 = e.clientY; poke(); } });
dlg.addEventListener('focusin', poke);
let sx = 0, sy = 0, swiped = false;
dlg.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; swiped = false; poke(); }, { passive: true });
dlg.addEventListener('touchend', (e) => {
const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
if (!ended && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; go(scene + (dx < 0 ? 1 : scene > 1 ? -1 : 0)); }
}, { passive: true });
addEventListener('popstate', () => { if (open && location.hash !== '#watch') close(true); });
addEventListener('pageshow', (e) => { if (e.persisted && open && location.hash !== '#watch') close(true); });
d.addEventListener('visibilitychange', () => { if (!open) return; if (d.hidden && playing) { autoPaused = true; pause(); } else if (!d.hidden && autoPaused) { autoPaused = false; play(); } });
addEventListener('pagehide', () => { if (open) ctx.hush(); });
const close = (fromPop, at = scene > 1 ? scene : 0) => {
if (!open) return; open = false; token++; sayTok++; stopClock(); ctx.hush(); playing = false; clearTimeout(idleT);
fireNow = false; embers(); ctx.sound.duck(1);
if (!fromPop && pushed) history.back();
else if (!fromPop && location.hash === '#watch') history.replaceState(history.state, '', location.pathname + location.search);
pushed = false;
const done = () => {
dlg.close(); dlg.classList.remove('is-closing'); root.classList.remove('wt-on');
layers.forEach((l) => { l.anim?.cancel(); l.anim = null; l.el.classList.remove('is-on'); });
shownCap = ''; capP.textContent = ''; titleEl.classList.remove('is-in'); dlg.classList.remove('is-titling');
if (!ctx.land(at)) back?.focus?.({ preventScroll: true });
};
if (reduced()) done(); else { dlg.classList.add('is-closing'); setTimeout(done, 320); }
};
return {
open(opener) {
if (open) return; open = true; back = opener || d.activeElement; try { keyNav = !!opener?.matches(':focus-visible'); } catch {} reached = 0; ended = false; endEl.hidden = true; dlg.classList.remove('is-ended', 'is-idle', 'is-closing');
if (location.hash !== '#watch') { history.pushState(history.state, '', '#watch'); pushed = true; }
playing = true; paintPlay(); paintOpts(); ctx.sound.duck(.35); if (ctx.sound.on()) ctx.sound.set(true);
segs.forEach((s) => { $('i', s).style.cssText = 'transform:scaleX(0)'; });
const shown = () => { root.classList.add('wt-on'); poke(); go(0); };
const focus = () => (keyNav ? playBtn : dlg).focus({ preventScroll: true });
const hr = hero?.getBoundingClientRect();
if (opener && hero && d.startViewTransition && !reduced() && hr && hr.bottom > innerHeight * .4) {
const ly = layers[cur ^ 1]; ly.img.dataset.i = ''; ly.img.removeAttribute('srcset'); ly.img.src = hero.currentSrc || hero.src;
ly.el.style.setProperty('--fx', (SC[0].x ?? 50) + '%'); ly.el.style.setProperty('--fy', (SC[0].y ?? 45) + '%');
hero.style.viewTransitionName = 'wt-hero'; dlg.classList.add('is-vt');
const vt = d.startViewTransition(async () => { hero.style.viewTransitionName = ''; dlg.showModal(); focus(); ly.img.style.viewTransitionName = 'wt-hero'; ly.el.style.zIndex = ++z; ly.el.classList.add('is-on'); await ly.img.decode().catch(() => {}); });
vt.finished.finally(() => { ly.img.style.viewTransitionName = ''; dlg.classList.remove('is-vt'); });
shown();
} else { dlg.showModal(); focus(); shown(); }
},
};
}
})();
