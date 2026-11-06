// Spritual editorial layer: the bar, the collections panel, scroll reveals, the six worlds, the figures,
// the featured strip and the rail. Progressive enhancement only; every page reads without it.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduced = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- The bar: clear over a hero, solid once you scroll, tucks away on the way down ---------- */
  const head = $('[data-ed-head]');
  const mega = $('[data-mega]'); const megaBtn = $('[data-mega-btn]');
  const setMega = (open) => {
    if (!mega || !megaBtn) return;
    mega.hidden = !open; megaBtn.setAttribute('aria-expanded', String(open)); head.classList.toggle('is-open', open);
  };
  if (head) {
    let lastY = scrollY, ticking = false;
    const onScroll = () => {
      const y = scrollY;
      head.classList.toggle('is-solid', y > 24);
      const down = y > lastY + 4, up = y < lastY - 4;
      if (down && y > 420 && !head.classList.contains('is-open') && !head.contains(document.activeElement)) head.classList.add('is-hidden');
      else if (up || y < 120) head.classList.remove('is-hidden');
      if (down && mega && !mega.hidden && y > 200) setMega(false);
      lastY = y; ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    head.addEventListener('focusin', () => head.classList.remove('is-hidden'));
    onScroll();
  }
  if (megaBtn && mega) {
    megaBtn.addEventListener('click', () => setMega(mega.hidden));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !mega.hidden) { setMega(false); megaBtn.focus(); } });
    document.addEventListener('click', (e) => { if (!mega.hidden && !e.target.closest('[data-ed-head]')) setMega(false); });
    // keyboard: the panel follows its button in the tab order; it closes once focus moves on past both
    const leave = (e) => { const to = e.relatedTarget; if (!mega.hidden && to && to !== megaBtn && !mega.contains(to)) setMega(false); };
    mega.addEventListener('focusout', leave); megaBtn.addEventListener('focusout', leave);
  }
  // the full-screen menu closes when a link inside it is followed (same-page anchors included)
  $('#ed-menu')?.addEventListener('click', (e) => { if (e.target.closest('a')) e.currentTarget.close(); });

  /* ---------- Portraits fade in once they have actually arrived (no half-drawn cut-outs) ---------- */
  root.classList.add('js-fade');
  $$('img.art').forEach((im) => { const done = () => im.classList.add('is-in'); if (im.complete) done(); else { im.addEventListener('load', done, { once: true }); im.addEventListener('error', done, { once: true }); } });

  /* ---------- Hero side cards: three ways in, turning every 6 s ---------- */
  const deck = $('[data-cards]');
  // a returning reader's "Continue reading" takes this slot (site.js hides the deck); then it never turns
  if (deck && !deck.hidden) {
    const cards = $$('[data-card]', deck); const ticks = $$('[data-card-go]', deck); const pauseBtn = $('[data-cards-pause]', deck);
    const MS = 6000; let i = 0, timer = 0, held = false, stopped = reduced();
    deck.style.setProperty('--ed-card-ms', MS + 'ms');
    const show = (n, user) => {
      const prev = cards[i]; i = (n + cards.length) % cards.length;
      cards.forEach((c, k) => {
        const on = k === i; c.classList.toggle('is-on', on); c.classList.toggle('is-leaving', c === prev && !on);
        // the slide (a labelled group) is hidden from assistive tech while off screen; its story link leaves the tab order
        const link = c.querySelector('a') || c;
        if (on) { c.removeAttribute('aria-hidden'); link.removeAttribute('tabindex'); } else { c.setAttribute('aria-hidden', 'true'); link.setAttribute('tabindex', '-1'); }
      });
      // restart the tick's fill so it measures this card's full turn
      ticks.forEach((t, k) => { t.setAttribute('aria-pressed', String(k === i)); });
      deck.classList.remove('is-auto'); void deck.offsetWidth; if (!stopped) deck.classList.add('is-auto');
      if (user) schedule();
    };
    const schedule = () => { clearTimeout(timer); if (stopped || held || document.hidden) return; timer = setTimeout(() => { show(i + 1); schedule(); }, MS); };
    const hold = (v) => { held = v; deck.classList.toggle('is-held', v); if (v) clearTimeout(timer); else schedule(); };
    ticks.forEach((t, k) => t.addEventListener('click', () => show(k, true)));
    deck.addEventListener('mouseenter', () => hold(true)); deck.addEventListener('mouseleave', () => hold(false));
    deck.addEventListener('focusin', () => hold(true)); deck.addEventListener('focusout', (e) => { if (!deck.contains(e.relatedTarget)) hold(false); });
    document.addEventListener('visibilitychange', () => (document.hidden ? clearTimeout(timer) : schedule()));
    // a finger on the deck: the card stays put under it, and once someone has touched the cards they stop turning by themselves
    const stopForGood = () => { if (stopped) return; stopped = true; clearTimeout(timer); deck.classList.remove('is-auto'); pauseBtn?.setAttribute('aria-pressed', 'true'); if (pauseBtn) pauseBtn.setAttribute('aria-label', pauseBtn.dataset.lPlay); };
    deck.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse' && !e.target.closest('[data-cards-pause]')) stopForGood(); }, { passive: true });
    deck.addEventListener('touchstart', (e) => { if (!e.target.closest('[data-cards-pause]')) stopForGood(); }, { passive: true });
    pauseBtn?.addEventListener('click', () => {
      stopped = !stopped; pauseBtn.setAttribute('aria-pressed', String(stopped));
      pauseBtn.setAttribute('aria-label', stopped ? pauseBtn.dataset.lPlay : pauseBtn.dataset.lPause);
      deck.classList.toggle('is-auto', !stopped); schedule();
    });
    // swipe between cards on touch screens
    let x0 = null;
    deck.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    deck.addEventListener('touchend', (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 40) show(i + (dx < 0 ? 1 : -1), true); }, { passive: true });
    if (stopped) { pauseBtn?.setAttribute('aria-pressed', 'true'); pauseBtn?.setAttribute('aria-label', pauseBtn.dataset.lPlay); }
    // the first turn waits for the opening titles (instant for a returning reader)
    setTimeout(() => { show(0); schedule(); }, reduced() || root.classList.contains('cx-seen') ? 0 : 900);
  }

  /* ---------- Reveals ---------- */
  const rv = $$('.rv, .rv-img');
  if (rv.length) {
    if (reduced() || !('IntersectionObserver' in window)) rv.forEach((el) => el.classList.add('in'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((en) => {
        // in view, or already scrolled past (a reload mid-page, a jump to an anchor): show it, never leave it hidden
        if (en.isIntersecting || en.boundingClientRect.bottom < 0) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px 18% 0px' });
      rv.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Stills begin their slow push-in once they are actually seen ---------- */
  const seen = $$('[data-media]:not(.ed-hero-media), .frame');
  if (seen.length && 'IntersectionObserver' in window && !reduced()) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-seen'); io.unobserve(en.target); } }), { threshold: .15 });
    seen.forEach((el) => io.observe(el));
  }

  /* ---------- Six worlds: the list swaps the picture ---------- */
  const worlds = $('[data-worlds]');
  if (worlds) {
    const pics = $$('[data-world-pic]'); const links = $$('[data-world]', worlds);
    const on = (i) => { pics.forEach((p) => p.classList.toggle('is-on', p.dataset.worldPic === String(i))); links.forEach((a) => a.classList.toggle('is-on', a.dataset.world === String(i))); };
    links.forEach((a) => { a.addEventListener('mouseenter', () => on(a.dataset.world)); a.addEventListener('focus', () => on(a.dataset.world)); });
    on(0);
    // on touch screens there is no hover: the picture follows whichever row is centred while scrolling
    if (!matchMedia('(hover: hover)').matches && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) on(en.target.dataset.world); }), { rootMargin: '-45% 0px -45% 0px' });
      links.forEach((a) => io.observe(a));
    }
  }

  /* ---------- Key figures count up once ---------- */
  const counts = $$('[data-count-to]');
  if (counts.length && !reduced() && 'IntersectionObserver' in window) {
    const run = (el) => {
      const n = +el.dataset.countTo; const t0 = performance.now(); const dur = 1100;
      const step = (now) => { const k = Math.min(1, (now - t0) / dur); el.textContent = String(Math.round(n * (1 - Math.pow(1 - k, 4)))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    counts.forEach((el) => { if (el.getBoundingClientRect().top > innerHeight) el.textContent = '0'; });   // only figures still below the fold count up
    const io = new IntersectionObserver((es) => es.forEach((en) => {
      if (en.isIntersecting && en.target.textContent === '0') { run(en.target); io.unobserve(en.target); }
      else if (en.boundingClientRect.bottom < 0) { en.target.textContent = en.target.dataset.countTo; io.unobserve(en.target); }
    }), { threshold: .25 });
    counts.forEach((el) => io.observe(el));
  }

  /* ---------- Featured: pinned while three paintings pass behind one card ---------- */
  const feat = $('[data-featured]');
  if (feat) {
    const bgs = $$('[data-feat-bg]', feat); const cards = $$('[data-feat]', feat); const dots = $$('[data-feat-go]', feat);
    const vids = bgs.map((b) => $('video', b));
    let cur = -1;
    const go = (i) => {
      if (i === cur) return; cur = i;
      bgs.forEach((b, k) => b.classList.toggle('is-on', k === i));
      cards.forEach((c, k) => { c.classList.toggle('is-on', k === i); c.inert = k !== i; });
      dots.forEach((d, k) => d.setAttribute('aria-pressed', String(k === i)));
      vids.forEach((v, k) => { if (!v) return; if (k === i) { delete v.dataset.hold; window.SpritualClips?.start(v); } else { v.dataset.hold = '1'; window.SpritualClips?.stop(v); } });
    };
    vids.forEach((v, k) => { if (v && k) v.dataset.hold = '1'; });
    if (!reduced()) {
      feat.dataset.pin = '';
      const update = () => {
        const r = feat.getBoundingClientRect(); const span = Math.max(1, r.height - innerHeight);
        const p = Math.min(.999, Math.max(0, -r.top / span));
        go(Math.floor(p * cards.length));
      };
      let t = false;
      addEventListener('scroll', () => { if (!t) { t = true; requestAnimationFrame(() => { update(); t = false; }); } }, { passive: true });
      addEventListener('resize', update); update();
      dots.forEach((d, k) => d.addEventListener('click', () => {
        const r = feat.getBoundingClientRect(); const span = r.height - innerHeight; const top = scrollY + r.top + span * ((k + .5) / cards.length);
        scrollTo({ top, behavior: 'smooth' });
      }));
    } else {
      go(0); cards.forEach((c) => { c.inert = false; c.classList.add('is-on'); });
    }
  }

  /* ---------- The rail ---------- */
  const rail = $('[data-rail]');
  if (rail) {
    const prev = $('[data-rail-prev]'); const next = $('[data-rail-next]');
    const stepW = () => (rail.querySelector('li')?.getBoundingClientRect().width || 300) + 16;
    const sync = () => { if (prev) prev.disabled = rail.scrollLeft < 4; if (next) next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; };
    prev?.addEventListener('click', () => rail.scrollBy({ left: -stepW(), behavior: reduced() ? 'auto' : 'smooth' }));
    next?.addEventListener('click', () => rail.scrollBy({ left: stepW(), behavior: reduced() ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', sync, { passive: true }); addEventListener('resize', sync); sync();
  }
})();
