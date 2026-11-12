// Spritual cinema layer: letterbox bars that open and close with the scroll, the prologue reel, the film-strip rails,
// the sound invitation and the poster that opens into its story. Progressive enhancement only.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => (o[k] ?? ''));
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  if (!reduced()) root.classList.add('cx-js'); else root.classList.remove('cx-js');

  /* ---------- One scroll loop for everything that follows the scroll ---------- */
  const jobs = [];
  let ticking = false;
  const run = () => { ticking = false; for (const j of jobs) j(); };
  const kick = () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } };
  addEventListener('scroll', kick, { passive: true });
  addEventListener('resize', kick);

  /* ---------- Letterbox: the bars open as the film starts, and close again at the finale ---------- */
  if (!reduced()) {
    for (const el of $$('[data-letterbox]')) {
      const closing = el.dataset.letterbox === 'in';
      let last = -1;
      jobs.push(() => {
        const r = el.getBoundingClientRect(); const vh = innerHeight;
        if (r.bottom < -50 || r.top > vh + 50) return;
        const v = closing ? clamp((vh - r.top) / (vh * .9)) : clamp(1 - Math.max(0, -r.top) / (vh * .45));
        if (Math.abs(v - last) < .002) return;
        last = v; el.style.setProperty('--lb', v.toFixed(3));
      });
    }
  }

  /* ---------- Prologue: one painting per stretch of scroll; each pushes in slowly, then dissolves into the next ---------- */
  const reel = $('[data-reel]');
  // the later paintings wait in data-src/data-srcset so the opening screen loads first; each is fetched as the reel nears it
  const hydrate = (img) => {
    if (!img || !img.dataset.srcset) return;
    img.srcset = img.dataset.srcset; img.src = img.dataset.src;
    img.removeAttribute('data-srcset'); img.removeAttribute('data-src');
  };
  const laterImgs = reel ? $$('img[data-later]', reel) : [];
  if (reel && reduced()) laterImgs.forEach(hydrate);   // stacked, not pinned: the browser's own lazy loading takes over
  let vtImg = null;   // the picture that opens into the next page (a poster, or the story select's stage)
  /* ---------- The opening's scenery leans with the pointer (rays, mist, birds and lamps at different depths) ---------- */
  const openEl = $('.cx-home .cx-open'); const lean = { x: 0, y: 0 };
  if (openEl && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let or = 0;
    openEl.addEventListener('pointermove', (e) => { if (or || reduced()) return; or = requestAnimationFrame(() => { or = 0; lean.x = (e.clientX / innerWidth) - .5; lean.y = (e.clientY / innerHeight) - .5; openEl.style.setProperty('--ox', lean.x.toFixed(3)); openEl.style.setProperty('--oy', lean.y.toFixed(3)); }); });
  }

  /* ---------- Gold dust in the lamplight: motes rise through the dark behind the name, sparks lift off the line of light
     as it is drawn, and a few keep drifting in the sunrise once the curtain has opened. One small canvas, drawn only
     while the opening is on screen and the tab is visible; never under reduced motion. ---------- */
  const dust = $('.cx-home .cx-dust');
  if (dust && openEl && dust.getContext && !reduced()) {
    const g = dust.getContext('2d');
    const titles = root.classList.contains('cx-js') && !root.classList.contains('cx-seen');   // the title sequence is playing
    const spark = $('.cx-spark', openEl); const letters = $('.cx-wm-letters', openEl);
    const light = (navigator.deviceMemory || 8) < 4 || (navigator.hardwareConcurrency || 8) <= 2;
    // one soft mote, drawn once and stamped many times
    const mote = document.createElement('canvas'); mote.width = mote.height = 64;
    { const m = mote.getContext('2d'); const gr = m.createRadialGradient(32, 32, 0, 32, 32, 32);
      gr.addColorStop(0, 'rgba(255,246,214,1)'); gr.addColorStop(.18, 'rgba(255,214,140,.85)'); gr.addColorStop(.45, 'rgba(255,170,80,.28)'); gr.addColorStop(1, 'rgba(255,150,60,0)');
      m.fillStyle = gr; m.fillRect(0, 0, 64, 64); }
    const sparkAnim = titles && spark && spark.getAnimations ? spark.getAnimations()[0] : null;
    // rectangles inside the zoomed card (screens above 1920x1080): older engines report them divided by the zoom (see boot.js)
    let zf = 0; const zoomFix = () => {
      if (!zf) { const o = document.createElement('div'), i = document.createElement('div');
        o.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;zoom:2;visibility:hidden;pointer-events:none'; i.style.cssText = 'position:absolute;left:0;top:50px;width:1px;height:1px';
        o.appendChild(i); document.body.appendChild(o); zf = (i.getBoundingClientRect().top - o.getBoundingClientRect().top) < 75 ? 2 : 1; o.remove(); }
      return zf === 2 ? (parseFloat(root.style.getPropertyValue('--cx-k')) || 1) : 1; };
    let W = 0, H = 0, motes = [], sparks = [], raf = 0, seen = true, last = 0, born = performance.now(), lamp = null, lampAt = 0, carry = 0;
    // a small repeatable generator: the field looks the same on every visit, and nothing here needs real randomness
    let seed = 20261112; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const make = (anywhere) => { const z = .25 + .75 * rnd() * rnd(); return { x: rnd() * W, y: anywhere ? rnd() * H : H + 12 + rnd() * 30, z, r: 1 + 2.6 * z * z, vy: 5 + 20 * z, ph: rnd() * 6.283, f: .25 + rnd() * .5, tw: .6 + rnd() * 1.5, a: .22 + .6 * z }; };
    const size = () => {
      const k = Math.min(devicePixelRatio || 1, 2); const w = dust.clientWidth, h = dust.clientHeight;
      if (!w || !h) return;   // hidden (reduced motion): keep the last size
      W = w; H = h;
      dust.width = Math.round(W * k); dust.height = Math.round(H * k); g.setTransform(k, 0, 0, k, 0, 0);
      const n = Math.round(clamp(W * H / 15000, 30, 110) * (light ? .5 : 1));
      while (motes.length < n) motes.push(make(true)); motes.length = n;
    };
    const frame = (now) => {
      raf = 0;
      if (reduced()) { g.clearRect(0, 0, W, H); return; }
      // the sequence's own clock: the line of light's CSS animation says how far in we are (this script may start late)
      if (sparkAnim && sparkAnim.playState === 'running' && typeof sparkAnim.currentTime === 'number') born = now - sparkAnim.currentTime;
      const dt = Math.min(.05, (now - (last || now)) / 1000); last = now; const t = now / 1000; const age = (now - born) / 1000;
      g.clearRect(0, 0, W, H);
      // in the dark the dust is at its brightest; once the curtain has opened it thins, so the river stays the picture
      const amb = !titles || root.classList.contains('cx-seen') ? .55 : 1 - .45 * clamp((age - 4.4) / 2.6);
      // the lamp's glow behind the name, while the screen is dark
      if (titles && letters && age < 6 && !root.classList.contains('cx-seen')) {
        if (!lamp || now - lampAt > 400) { const z = zoomFix(), r = letters.getBoundingClientRect(), o = openEl.getBoundingClientRect(); lamp = { x: (r.left + r.width / 2) * z - o.left, y: (r.top + r.height / 2) * z - o.top, r: Math.max(r.width * z * .95, 180) }; lampAt = now; }
        const la = clamp((age - 1.2) / 1.4) * (1 - clamp((age - 3.1) / 1.9)) * (.9 + .1 * Math.sin(t * 5.1) * Math.sin(t * 1.7));
        if (la > .01) {
          // a wide, low ellipse with a long soft falloff (many stops), so no edge of it can be seen on the dark
          g.save(); g.translate(lamp.x, lamp.y); g.scale(1, .55);
          const gr = g.createRadialGradient(0, 0, 0, 0, 0, lamp.r);
          [[0, .2], [.12, .17], [.26, .12], [.42, .07], [.58, .035], [.74, .014], [.88, .004], [1, 0]].forEach(([at, a]) => gr.addColorStop(at, `rgba(255,${Math.round(176 - 30 * at)},${Math.round(96 - 30 * at)},${(a * la).toFixed(4)})`));
          g.fillStyle = gr; g.fillRect(-lamp.r, -lamp.r, lamp.r * 2, lamp.r * 2);
          // and the first rays of the morning behind it: thin, slowly turning, gone before the sunrise itself arrives
          const R = lamp.r * 1.2 + 120; const rg = g.createRadialGradient(0, 0, lamp.r * .1, 0, 0, R);
          rg.addColorStop(0, 'rgba(255,220,160,0)'); rg.addColorStop(.22, `rgba(255,208,140,${(.075 * la).toFixed(4)})`); rg.addColorStop(.6, `rgba(255,190,115,${(.03 * la).toFixed(4)})`); rg.addColorStop(1, 'rgba(255,180,100,0)');
          g.fillStyle = rg;
          // each ray is laid down three times, wide to narrow, so its sides are soft rather than ruled
          for (const [wide, share] of [[1.9, .3], [1.15, .35], [.5, .35]]) {
            g.globalAlpha = share; g.beginPath();
            for (let i = 0; i < 18; i++) { const a0 = i / 18 * 6.2832 + t * .03 + Math.sin(i * 12.9898) * .09; const w = (.024 + .03 * ((i * 7) % 5) / 5) * wide; g.moveTo(0, 0); g.arc(0, 0, R, a0 - w, a0 + w); g.closePath(); }
            g.fill();
          }
          g.globalAlpha = 1; g.restore();
        }
      }
      // sparks lift off the line of light for as long as it is on screen, along exactly as much of it as has been drawn
      if (titles && spark && age < 4) {
        const r = spark.getBoundingClientRect();
        if (r.width > 6 && r.height > 0 && +getComputedStyle(spark).opacity > .3) {
          const o = openEl.getBoundingClientRect(); carry += dt * (light ? 26 : 60) * Math.min(1, r.width / 420);
          while (carry >= 1 && sparks.length < 150) { carry -= 1; const z = .4 + .6 * rnd(); sparks.push({ x: r.left - o.left + rnd() * r.width, y: r.top - o.top, z, r: .8 + 1.6 * z, vx: (rnd() - .5) * 26, vy: 16 + 64 * rnd() * z, life: 0, max: 1.1 + 1.9 * rnd() }); }
        }
      }
      g.globalCompositeOperation = 'lighter';
      for (const p of motes) {
        p.y -= p.vy * dt; p.x += (Math.sin(t * p.f + p.ph) * 7 * p.z + 2.5) * dt;
        if (p.y < -14) Object.assign(p, make(false)); if (p.x > W + 14) p.x = -14;
        const a = amb * p.a * (.62 + .38 * Math.sin(t * p.tw + p.ph)); const s = p.r * 5;
        g.globalAlpha = a; g.drawImage(mote, p.x - s / 2 - lean.x * 26 * p.z, p.y - s / 2 - lean.y * 14 * p.z, s, s);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i]; p.life += dt; if (p.life >= p.max) { sparks.splice(i, 1); continue; }
        p.y -= p.vy * dt; p.vy *= 1 - .35 * dt; p.x += (p.vx + Math.sin(t * 2 + p.y * .03) * 10) * dt;
        const k = p.life / p.max; const s = p.r * 6 * (1 - .4 * k);
        g.globalAlpha = Math.min(1, k * 8) * (1 - k) * (1 - k) * .95; g.drawImage(mote, p.x - s / 2, p.y - s / 2, s, s);
      }
      g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
      go();
    };
    const go = () => { if (!raf && seen && !document.hidden && !reduced()) raf = requestAnimationFrame(frame); };
    size(); go();
    let sizeT = 0; addEventListener('resize', () => { clearTimeout(sizeT); sizeT = setTimeout(() => { size(); go(); }, 150); });
    root.classList.add('cx-open-on');
    if ('IntersectionObserver' in window) new IntersectionObserver((es) => { seen = es[es.length - 1].isIntersecting; root.classList.toggle('cx-open-on', seen); last = 0; go(); }).observe(openEl);
    document.addEventListener('visibilitychange', () => { last = 0; go(); });
    // the motion switch (and the device's own setting) can be turned back on: the canvas is shown again, so wake the loop
    const wake = () => { last = 0; size(); go(); };
    if ('MutationObserver' in window) new MutationObserver(wake).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', wake);
  }

  /* ---------- Choose your story: the roster along the bottom, the one in hand on the stage ---------- */
  const sel = $('[data-select]');
  let selOnScreen = false, selWake = () => {};
  if (sel) {
    const tiles = $$('.cx-sel-tile', sel); const n = tiles.length; const grid = $('[data-sel-grid]', sel);
    const T = (k) => $(`[data-sel-${k}]`, sel);
    const out = { n: T('n'), coll: T('coll'), title: T('title'), sum: T('sum'), min: T('min'), scenes: T('scenes'), go: T('go'), hero: T('hero'), name: T('name'), who: T('who'), chips: T('chips'), goT: $('[data-sel-go-t]', sel), story: T('story'), storyT: $('[data-sel-story-t]', sel) };
    const whoLabel = out.who ? out.who.textContent.replace(out.name ? out.name.textContent : '', '').trim() : '';
    const layers = $$('.cx-sel-bg img', sel); const fig = $('[data-sel-fig]', sel); const auto = $('[data-sel-auto]', sel);
    // a url() inside a custom property resolves against the stylesheet that uses it, not the page: give the sheen's mask an absolute address
    const heroUrl = (u) => { if (fig && u) fig.style.setProperty('--hero-url', `url('${new URL(u, document.baseURI).href}')`); };
    if (out.hero) heroUrl(out.hero.getAttribute('src'));
    // on a phone the frame is tall and narrow: the camera goes to the character's face, not the middle of the figure
    const narrow = matchMedia('(max-width: 699px)');
    let outT = 0;
    let cur = 0, front = 0, token = 0, stopped = reduced(), lastPointer = 'mouse', timer = 0, leaving = false;
    const pick = (i, byUser) => {
      i = (i + n) % n; if (byUser) halt();
      if (i === cur) return;
      const t = tiles[i]; const d = t.dataset; cur = i;
      tiles.forEach((x, k) => { x.classList.toggle('is-on', k === i); if (k === i) x.setAttribute('aria-current', 'true'); else x.removeAttribute('aria-current'); });
      sel.style.setProperty('--sel-glow', d.glow); sel.style.setProperty('--sel-base', d.base);
      if (out.name) { out.name.textContent = d.name; out.name.style.setProperty('--nl', [...d.name].length); }
      if (out.who) out.who.textContent = d.who || '';
      out.n.textContent = String(i + 1).padStart(2, '0'); out.coll.textContent = d.coll; out.sum.textContent = d.sum;
      // the name lands letter by letter
      out.title.textContent = ''; (typeof Intl !== 'undefined' && Intl.Segmenter ? [...new Intl.Segmenter(root.lang || undefined, { granularity: 'grapheme' }).segment(d.title)].map((x) => x.segment) : [d.title]).forEach((ch, k) => { const sp = document.createElement('span'); sp.className = 'cx-sel-ch'; sp.style.setProperty('--k', k); sp.textContent = ch; out.title.append(sp); });
      out.title.setAttribute('aria-label', d.title);
      if (out.chips) out.chips.innerHTML = d.chips || '';   // built by the site's own generator (escaped there)
      out.go.href = t.href; out.go.setAttribute('aria-label', d.meet || d.title); if (out.goT) out.goT.textContent = d.meet || d.title;
      if (out.story && d.story) { out.story.href = d.story; out.story.setAttribute('aria-label', `${out.storyT ? out.storyT.textContent : ''}: ${d.storyT || ''}`); }
      // a character with a cut-out portrait steps in front of their world; one painted inside a scene is found by the
      // camera instead: the world itself pushes in on them, and the words move to the other side
      const scene = d.mode === 'scene';
      sel.classList.toggle('is-scene', scene); sel.classList.toggle('is-left', d.side === 'left');
      if (!scene && d.hero) { out.hero.srcset = d.heroset; out.hero.src = d.hero; heroUrl(d.hero); }
      // the painting: the roster's small copy at once (it is already loaded), the full one as soon as it has decoded
      // the new world comes in over the old one behind a blade of light; the old one leaves when it is covered
      const my = ++token; const next = layers[1 - front]; const prev = layers[front]; const thumb = $('img', t);
      next.removeAttribute('srcset'); next.removeAttribute('sizes'); { const face = d.ffx && narrow.matches; next.style.setProperty('--fx', `${face ? d.ffx : d.fx}%`); next.style.setProperty('--fy', `${face ? d.ffy : d.fy}%`); } next.style.setProperty('--z', d.z || 1); next.src = thumb.currentSrc || thumb.src;
      layers.forEach((x) => x.classList.remove('is-out', 'is-in'));
      prev.classList.remove('is-on'); prev.classList.add('is-out'); next.classList.add('is-on');
      if (!reduced()) { void next.offsetWidth; next.classList.add('is-in'); }
      clearTimeout(outT); outT = setTimeout(() => { if (my === token) { prev.classList.remove('is-out'); next.classList.remove('is-in'); } }, 800);
      front = 1 - front;
      const vw = `${Math.round(100 * (parseFloat(d.z) || 1))}vw`; const big = new Image(); big.sizes = vw; big.srcset = d.picset; big.src = d.pic;
      (big.decode ? big.decode() : Promise.resolve()).then(() => { if (my === token) { next.sizes = vw; next.srcset = d.picset; next.src = d.pic; } }).catch(() => {});
      if (!reduced()) { sel.classList.remove('is-swap'); void sel.offsetWidth; sel.classList.add('is-swap'); }
      if (grid.scrollWidth > grid.clientWidth + 4) { const li = t.parentElement; grid.scrollTo({ left: li.offsetLeft - (grid.clientWidth - li.offsetWidth) / 2, behavior: reduced() || byUser ? 'auto' : 'smooth' }); }
    };
    // left alone, the screen shows each story in turn; any choice by hand stops it, and the button starts it again
    // one fixed name ("Pause the showcase") with aria-pressed as its state: a toggle whose name also changes contradicts itself
    const showAuto = () => { if (auto) auto.setAttribute('aria-pressed', String(stopped)); };
    const halt = () => { if (!stopped) { stopped = true; showAuto(); } clearTimeout(timer); timer = 0; };
    const turn = () => { timer = 0; if (reduced()) { halt(); return; } if (stopped || !selOnScreen || document.hidden || leaving) return; pick(cur + 1, false); timer = setTimeout(turn, 4800); };
    selWake = () => { if (!timer && !stopped && selOnScreen && !document.hidden) timer = setTimeout(turn, 4800); };
    auto?.addEventListener('click', () => { if (stopped) { stopped = reduced() ? true : false; showAuto(); selWake(); } else halt(); });
    document.addEventListener('visibilitychange', selWake); showAuto();
    new MutationObserver(() => { if (reduced()) halt(); }).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change', () => { if (reduced()) halt(); });
    // leaving for a story: a flare, the name steps forward, and the painting opens into the story's own first frame
    const begin = (e, href) => {
      if (leaving) { e.preventDefault(); e.stopImmediatePropagation(); return; }
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0 || reduced()) return;
      e.preventDefault(); leaving = true; halt(); sel.classList.add('is-go');
      let url; try { url = new URL(href, location.href); } catch { location.href = href; return; }
      vtImg = layers[front]; try { sessionStorage.setItem('cx-vt', url.pathname); } catch {}
      setTimeout(() => { location.href = url.href; }, 430);
    };
    addEventListener('pageshow', (e) => { if (e.persisted) { leaving = false; sel.classList.remove('is-go'); } });
    let downCur = 0;   // what was in hand when the finger came down (the tap's own focus changes it before the click arrives)
    sel.addEventListener('pointerdown', (e) => { lastPointer = e.pointerType || 'mouse'; downCur = cur; }, true);
    tiles.forEach((t, i) => {
      t.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pick(i, true); });
      t.addEventListener('focus', () => pick(i, true));
      t.addEventListener('click', (e) => {
        // by touch, the first tap looks and the second begins; a mouse or the keyboard is already looking
        if (lastPointer !== 'mouse' && e.detail > 0 && i !== downCur) { e.preventDefault(); pick(i, true); return; }
        if (i !== cur) pick(i, true);
        begin(e, t.href);
      });
      t.addEventListener('keydown', (e) => {
        const cols = tiles.filter((x) => x.offsetTop === tiles[0].offsetTop).length || n;
        if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) return;
        const to = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: n - 1 }[e.key];
        if (to === undefined) return;
        e.preventDefault(); if (to >= 0 && to < n) tiles[to].focus();
      });
    });
    out.go.addEventListener('click', (e) => begin(e, out.go.href));
    out.story?.addEventListener('click', (e) => begin(e, out.story.href));
    // depth: the world, the lead and their name sit at different distances, and drift apart as the pointer moves
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let pr = 0;
      sel.addEventListener('pointermove', (e) => { if (pr || reduced()) return; pr = requestAnimationFrame(() => { pr = 0; const r = sel.getBoundingClientRect(); sel.style.setProperty('--px', (((e.clientX - r.left) / r.width) - .5).toFixed(3)); sel.style.setProperty('--py', (((e.clientY - r.top) / r.height) - .5).toFixed(3)); }); });
      sel.addEventListener('pointerleave', () => { sel.style.setProperty('--px', 0); sel.style.setProperty('--py', 0); });
    }
    // sparks: a burst of the lead's own light as they arrive
    const heroBox = $('.cx-select > .cx-sel-hero', sel);
    if (heroBox && !reduced()) { const burst = document.createElement('span'); burst.className = 'cx-sel-sparks'; burst.setAttribute('aria-hidden', 'true'); for (let k = 0; k < 14; k++) { const sp = document.createElement('i'); sp.style.setProperty('--a', `${(k / 14) * 360 + (k % 2) * 9}deg`); sp.style.setProperty('--d', `${7 + (k % 4) * 3}rem`); sp.style.setProperty('--t', `${(k % 5) * 40}ms`); burst.append(sp); } heroBox.append(burst); }
    // the lead stands between the heading and the roster, whatever the screen and the reader's text size
    const roster = $('.cx-sel-roster', sel);
    const setRoster = () => sel.style.setProperty('--sel-roster-h', `${Math.round(roster.getBoundingClientRect().height)}px`);
    setRoster(); if ('ResizeObserver' in window) new ResizeObserver(setRoster).observe(roster); else addEventListener('resize', setRoster);
    // resting on, focusing or pressing the way in is a choice too: the story must not change under it
    out.go.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') halt(); });
    out.go.addEventListener('focus', () => halt());
    out.go.addEventListener('pointerdown', () => halt());
    // on a touch screen, a sideways swipe across the stage turns to the next or the previous story
    const stage = $('.cx-sel-stage', sel); let sx = 0, sy = 0;
    stage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; const dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) pick(cur + (dx < 0 ? 1 : -1), true); }, { passive: true });
    $$('.cx-sel-grid > li', sel).forEach((li, k) => li.style.setProperty('--k', k));
    // a keyboard user arriving in the select gets all of it on screen, not a half-scrolled slice under the header
    sel.addEventListener('focusin', (e) => { const r = sel.getBoundingClientRect(); if (e.target.matches(':focus-visible') && Math.abs(r.top) > 2 && r.height <= innerHeight + 2) scrollTo({ top: scrollY + r.top, behavior: 'instant' }); });
    if ('IntersectionObserver' in window) {
      // the select waits in the dark until it is reached, then its world fades up and its lead steps in, once
      if (!reduced() && sel.getBoundingClientRect().top > innerHeight * .5) sel.classList.add('sel-wait');
      new IntersectionObserver((es) => {
        const en = es[0]; selOnScreen = en.intersectionRatio >= .5;
        if (en.intersectionRatio >= .35 && sel.classList.contains('sel-wait')) { sel.classList.replace('sel-wait', 'is-lit'); }
        selWake();
      }, { threshold: [0, .35, .5, .75] }).observe(sel);
    } else selOnScreen = true;
  }

  /* ---------- Ramcharitmanas: the transliteration under each line can be hidden; the choice is remembered ---------- */
  const mx = $('[data-manas]'); const trBtn = $('[data-mx-tr]');
  if (mx && trBtn) {
    const KEY = 'spritual:manas-tr';
    const apply = (on) => { mx.classList.toggle('no-tr', !on); trBtn.setAttribute('aria-pressed', String(on)); };
    let on = true; try { on = localStorage.getItem(KEY) !== '0'; } catch {}
    apply(on);
    trBtn.addEventListener('click', () => { on = !on; apply(on); try { localStorage.setItem(KEY, on ? '1' : '0'); } catch {} });
  }
  // the doha list closes once a doha is chosen
  $$('.mx-jump a').forEach((a) => a.addEventListener('click', () => a.closest('details')?.removeAttribute('open')));

  /* ---------- Arrivals: tiles and titles come in once, in sequence, when they reach the screen, then stay put ---------- */
  if (!reduced() && 'IntersectionObserver' in window) {
    const targets = $$('[data-room="theatre"] .grid > .card, .cx-posters > li, .cast-tiles > li, .cast-rows > li, .cx-ways-grid > li, .cx-cast-row > li, .cx-rail > li, .cx-strip > li, .cx-head, .cx-row-head, .cast-h, .cx-now-body > *, .mx-opener, .mx-kand-grid > li');
    const vh = innerHeight;
    const fresh = targets.filter((el) => el.getBoundingClientRect().top > vh * .9);   // what is already on screen is left alone
    fresh.forEach((el) => el.classList.add('th-rv'));
    const io = new IntersectionObserver((es) => {
      const inNow = es.filter((en) => en.isIntersecting).map((en) => en.target).sort((a, b) => (a.getBoundingClientRect().top - b.getBoundingClientRect().top) || (a.getBoundingClientRect().left - b.getBoundingClientRect().left));
      inNow.forEach((el, k) => {
        io.unobserve(el); el.style.setProperty('--th-i', Math.min(k, 8)); el.classList.add('th-in');
        const done = () => { el.classList.remove('th-rv', 'th-in'); el.style.removeProperty('--th-i'); };
        el.addEventListener('animationend', (e) => { if (e.target === el) done(); }, { once: false });
        setTimeout(done, 2600);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: .08 });
    fresh.forEach((el) => io.observe(el));
    // a library filter shows and hides cards: anything still waiting when the list changes is simply shown
    $('[data-filters]')?.addEventListener('input', () => fresh.forEach((el) => { el.classList.remove('th-rv', 'th-in'); io.unobserve(el); }));
  }

  /* ---------- Rails: film strips that scroll sideways, with buttons on pointer screens ---------- */
  for (const rail of $$('[data-rail-x]')) {
    const scope = rail.parentElement;
    const prev = $('[data-rail-prev]', scope); const next = $('[data-rail-next]', scope);
    const step = () => { const li = rail.querySelector('li'); return li ? li.getBoundingClientRect().width + (parseFloat(getComputedStyle(li.parentElement).columnGap) || 16) : 300; };
    const sync = () => { if (prev) prev.disabled = rail.scrollLeft < 4; if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; };
    prev?.addEventListener('click', () => rail.scrollBy({ left: -step() * (innerWidth > 1000 ? 2 : 1), behavior: reduced() ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => rail.scrollBy({ left: step() * (innerWidth > 1000 ? 2 : 1), behavior: reduced() ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  }

  /* ---------- The sound invitation on the opening screen mirrors the bar's sound switch ---------- */
  const invite = $('[data-sound-invite]'); const headBtn = $('.ed-head [data-sound]');
  if (invite && headBtn) {
    const lab = $('[data-sound-label]', invite);
    const sync = () => { const on = headBtn.getAttribute('aria-pressed') === 'true'; invite.setAttribute('aria-pressed', String(on)); if (lab) lab.textContent = on ? invite.dataset.lOn : invite.dataset.lOff; };
    invite.addEventListener('click', () => headBtn.click());
    new MutationObserver(sync).observe(headBtn, { attributes: true, attributeFilter: ['aria-pressed'] });
    sync();
  }

  /* ---------- A story poster opens into its story (cross-document view transition; the page also dissolves without it) ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]'); vtImg = null;
    if (!a || a.target === '_blank' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    let url; try { url = new URL(a.href, location.href); } catch { return; }
    if (url.origin !== location.origin || !/\/stories\//.test(url.pathname) || url.hash) return;
    const img = a.querySelector('.cx-poster-pic img, .cx-now-screen img, .card-art img, .ed-card-pic img, .cx-next-pic img') || (a.matches('[data-vt-link], .cx-btn') ? $('.cx-now-screen img') : null);
    if (!img) return;
    vtImg = img;
    try { sessionStorage.setItem('cx-vt', url.pathname); } catch {}
  }, true);
  addEventListener('pageswap', (e) => {
    if (!e.viewTransition || !vtImg) return;
    vtImg.style.viewTransitionName = 'cx-hero';
    e.viewTransition.finished?.finally?.(() => { if (vtImg) vtImg.style.viewTransitionName = ''; });
  });

  /* ---------- A scene's title card arrives a moment before its painting is fully on screen ---------- */
  const shots = $$('.shot[data-media]');
  if (shots.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting || en.boundingClientRect.bottom < 0) { en.target.classList.add('is-seen'); io.unobserve(en.target); } }), { rootMargin: '0px 0px 12% 0px' });
    shots.forEach((el) => io.observe(el));
  }

  /* ---------- The title sequence can be skipped: any key, click, tap or scroll during it puts everything in place ---------- */
  if ($('.cx-home .cx-spark') && root.classList.contains('cx-js') && !root.classList.contains('cx-seen')) {
    const evs = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
    const done = () => { root.classList.add('cx-seen'); evs.forEach((n) => removeEventListener(n, done)); };
    evs.forEach((n) => addEventListener(n, done, { passive: true }));
    setTimeout(() => evs.forEach((n) => removeEventListener(n, done)), 5600);
  }

  /* ---------- Theatre: the poster under the pointer leans toward it and catches the light ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduced()) {
    for (const el of $$('[data-room="theatre"] .card, .cx-poster, .cast-tile')) {
      el.classList.add('tilt');
      const sheen = document.createElement('span'); sheen.className = 'sheen'; sheen.setAttribute('aria-hidden', 'true'); el.append(sheen);
      let raf = 0;
      el.addEventListener('pointermove', (e) => {
        if (raf || reduced()) return;
        raf = requestAnimationFrame(() => {
          raf = 0; const r = el.getBoundingClientRect(); const x = clamp((e.clientX - r.left) / r.width); const y = clamp((e.clientY - r.top) / r.height);
          el.classList.add('is-lean');
          el.style.setProperty('--ry', ((x - .5) * 9).toFixed(2) + 'deg'); el.style.setProperty('--rx', ((.5 - y) * 7).toFixed(2) + 'deg');
          el.style.setProperty('--gx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', () => { el.classList.remove('is-lean'); el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    }
  }

  /* ---------- Theatre: dust in the projector's light, and a lamp that follows the hand ----------
     Forty-odd warm motes rising slowly behind everything, on the dark pages only. Stops when the tab is hidden, when
     motion is reduced, or when the reader chooses the light theme. */
  if (root.dataset.room === 'theatre' && !reduced()) {
    const cv = document.createElement('canvas'); cv.className = 'th-embers'; cv.setAttribute('aria-hidden', 'true');
    const g = cv.getContext('2d');
    if (g) {
      document.body.append(cv);
      let W = 0, H = 0, motes = [], last = 0, on = false; const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const make = (anyY) => ({ x: Math.random() * W, y: anyY ? Math.random() * H : H + 10, r: .5 + Math.random() * 1.5, vy: 5 + Math.random() * 16, sway: 6 + Math.random() * 16, ph: Math.random() * 6.28, sp: .2 + Math.random() * .6, a: .12 + Math.random() * .4 });
      const size = () => { W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); const n = Math.round(Math.min(46, Math.max(14, W / 30))); motes = Array.from({ length: n }, () => make(true)); };
      // the home opening has its own, richer dust (above): this layer rests while that one is on screen
      const quiet = () => document.hidden || reduced() || root.dataset.theme === 'light' || root.classList.contains('cx-open-on');
      const frame = (t) => {
        if (quiet()) { on = false; g.clearRect(0, 0, W, H); return; }
        const dt = Math.min(.05, (t - last) / 1000 || 0); last = t; g.clearRect(0, 0, W, H);
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i]; m.y -= m.vy * dt; m.ph += m.sp * dt; const x = m.x + Math.sin(m.ph) * m.sway;
          if (m.y < -12) motes[i] = make(false);
          const a = m.a * (.6 + .4 * Math.sin(m.ph * 2.3));
          g.fillStyle = `rgba(255,190,110,${(a * .18).toFixed(3)})`; g.beginPath(); g.arc(x, m.y, m.r * 3.4, 0, 6.283); g.fill();
          g.fillStyle = `rgba(255,214,160,${a.toFixed(3)})`; g.beginPath(); g.arc(x, m.y, m.r, 0, 6.283); g.fill();
        }
        requestAnimationFrame(frame);
      };
      const wake = () => { if (!on && !quiet()) { on = true; last = performance.now(); requestAnimationFrame(frame); } };
      size(); wake();
      addEventListener('resize', size);
      document.addEventListener('visibilitychange', wake);
      new MutationObserver(wake).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion', 'class'] });
    }
    if (fine) {
      const lamp = document.createElement('div'); lamp.className = 'th-lamp'; lamp.setAttribute('aria-hidden', 'true'); document.body.append(lamp);
      let lr = 0;
      addEventListener('pointermove', (e) => { if (lr) return; lr = requestAnimationFrame(() => { lr = 0; lamp.style.setProperty('--px', e.clientX + 'px'); lamp.style.setProperty('--py', e.clientY + 'px'); lamp.classList.add('is-on'); }); }, { passive: true });
      document.addEventListener('pointerleave', () => lamp.classList.remove('is-on'));
    }
  }

  kick();
  addEventListener('load', kick);
})();
