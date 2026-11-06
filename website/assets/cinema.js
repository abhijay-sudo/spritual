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
    const frames = $$('[data-frame]', reel); const n = frames.length;
    const fill = $('[data-reel-fill]', reel); const label = $('[data-reel-n]', reel);
    const imgOf = (k) => frames[k] && $('img[data-later]', frames[k]);
    let cur = 0;
    // a keyboard user tabbing to a frame's "Read this story" is carried to the stretch of scroll where that frame shows
    frames.forEach((fr, k) => fr.addEventListener('focusin', () => {
      if (k === cur) return;
      const top = scrollY + reel.getBoundingClientRect().top; const span = Math.max(1, reel.offsetHeight - innerHeight);
      scrollTo({ top: top + span * ((k + .5) / n), behavior: 'instant' }); kick();
    }));
    jobs.push(() => {
      const r = reel.getBoundingClientRect();
      if (r.top < innerHeight * .5) hydrate(imgOf(1));
      if (r.bottom < 0 || r.top > innerHeight) return;
      const span = Math.max(1, r.height - innerHeight);
      const p = clamp(-r.top / span, 0, .9999); const f = p * n; const i = Math.floor(f);
      // the frame on screen, any skipped over, and the one after it
      for (let k = 1; k <= Math.min(n - 1, r.top < innerHeight * .5 ? i + 1 : i); k++) hydrate(imgOf(k));
      frames.forEach((fr, k) => fr.style.setProperty('--k', clamp(f - k).toFixed(4)));
      if (i !== cur) {
        frames[cur].classList.remove('is-on'); frames[i].classList.add('is-on'); cur = i;
        if (label) label.textContent = fmt(label.dataset.of || '{n} / {t}', { n: i + 1, t: n });
      }
      if (fill) fill.style.setProperty('--p', p.toFixed(4));
    });
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

  kick();
  addEventListener('load', kick);
})();
