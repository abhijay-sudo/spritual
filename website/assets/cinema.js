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
  if (reel && !reduced()) {
    // The prologue plays itself, like a trailer: a painting holds for a few seconds with a slow drift, then dissolves to
    // the next. It runs only while it is the scene on screen; pause, previous and next are real buttons.
    const frames = $$('[data-frame]', reel); const n = frames.length; const HOLD = 6500;
    const fill = $('[data-reel-fill]', reel); const label = $('[data-reel-n]', reel);
    const toggle = $('[data-reel-toggle]', reel); const stack = reel.closest('.cx-stack'); const open = stack && $('.cx-open', stack);
    const imgOf = (k) => frames[k] && $('img[data-later]', frames[k]);
    let cur = 0, held = 0, last = 0, userPaused = false, onScreen = false, ticking2 = false;
    const show = (k) => {
      k = (k + n) % n; hydrate(imgOf(k)); hydrate(imgOf((k + 1) % n));
      if (k !== cur) { frames[cur].classList.remove('is-on'); frames[k].classList.add('is-on'); cur = k; }
      held = 0;
      if (label) label.textContent = fmt(label.dataset.of || '{n} / {t}', { n: k + 1, t: n });
      if (fill) fill.style.setProperty('--p', (k / n).toFixed(4));
    };
    const rolling = () => onScreen && !userPaused && !document.hidden;
    const tick = (t) => {
      if (!rolling()) { ticking2 = false; reel.classList.remove('is-rolling'); return; }
      held += Math.min(100, t - last); last = t;
      if (held >= HOLD) show(cur + 1);
      if (fill) fill.style.setProperty('--p', ((cur + held / HOLD) / n).toFixed(4));
      requestAnimationFrame(tick);
    };
    const wake = () => { if (rolling() && !ticking2) { ticking2 = true; last = performance.now(); reel.classList.add('is-rolling'); requestAnimationFrame(tick); } };
    const setPaused = (v) => { userPaused = v; if (toggle) { toggle.setAttribute('aria-pressed', String(v)); toggle.setAttribute('aria-label', v ? toggle.dataset.lPlay : toggle.dataset.lPause); } wake(); };
    toggle?.addEventListener('click', () => setPaused(!userPaused));
    $('[data-reel-prev]', reel)?.addEventListener('click', () => show(cur - 1));
    $('[data-reel-next]', reel)?.addEventListener('click', () => show(cur + 1));
    // a keyboard user tabbing to a frame's "Read this story" is shown that frame, and the reel waits for them
    frames.forEach((fr, k) => fr.addEventListener('focusin', () => { if (k !== cur) { show(k); setPaused(true); } }));
    document.addEventListener('visibilitychange', wake);
    // which scene is on screen: the opening (scroll 0..1 screens), the prologue (about .5..1.5), then the feature covers both.
    // A covered scene is still "in the viewport" as far as the browser knows, so the film and the reel are told to rest.
    const film = open && $('video.frame-video', open);
    jobs.push(() => {
      const vh = innerHeight; const s = stack ? -stack.getBoundingClientRect().top : -reel.getBoundingClientRect().top + vh;
      if (s > vh * .2) { hydrate(imgOf(1)); }
      const now = stack ? (s > vh * .45 && s < vh * 1.6) : (s > vh * .45 && s < vh * 1.6);
      if (now !== onScreen) { onScreen = now; wake(); }
      if (film && window.SpritualClips) {
        const covered = s > vh * .98;
        if (covered && !film.dataset.hold) { film.dataset.hold = '1'; window.SpritualClips.stop(film); }
        else if (!covered && film.dataset.hold) { delete film.dataset.hold; window.SpritualClips.start(film); }
      }
    });
    // focus that lands on a scene hidden under the next one brings that scene back
    open?.addEventListener('focusin', () => { if (scrollY > innerHeight * .5) scrollTo({ top: 0, behavior: 'instant' }); });
    reel.addEventListener('focusin', () => { const top = scrollY + (stack || reel).getBoundingClientRect().top + (stack ? innerHeight : 0); if (Math.abs(scrollY - top) > innerHeight * .5) scrollTo({ top, behavior: 'instant' }); });
  }

  /* ---------- Arrivals: tiles and titles come in once, in sequence, when they reach the screen, then stay put ---------- */
  if (!reduced() && 'IntersectionObserver' in window) {
    const targets = $$('[data-room="theatre"] .grid > .card, .cx-posters > li, .cast-tiles > li, .cast-rows > li, .cx-ways-grid > li, .cx-cast-row > li, .cx-rail > li, .cx-strip > li, .cx-head, .cx-row-head, .cast-h, .cx-now-body > *');
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
  let vtImg = null;
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
      const quiet = () => document.hidden || reduced() || root.dataset.theme === 'light';
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
      new MutationObserver(wake).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] });
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
