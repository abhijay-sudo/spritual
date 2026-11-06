// The living painting behind the home hero, and the diya of the opening.
// Everything is drawn procedurally: sky, mountains, mist, river, floating lamps, fireflies.
// It stops drawing when off-screen, when the tab is hidden, and when motion is reduced (one still frame).
(() => {
  const root = document.documentElement;
  const reduced = () => root.dataset.motion === 'reduce' || matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);

  // Palettes by hour. Night palettes are used in the dark theme whatever the hour.
  const PAL = {
    // Light theme: watercolour washes on off-white paper.
    dawn:    { sky: ['#e3dfe6', '#f1e6df', '#f8f6f1'], far: '#c6c1cc', near: '#aeb3bf', water: ['#d9d6de', '#f5f1ea'], mist: 'rgba(255,255,255,.5)', sun: '#f6e3c3', star: 0, starColor: '#8d93a8', lamp: '#e4b86f' },
    day:     { sky: ['#dde3ea', '#ecf0f3', '#f8f6f1'], far: '#c3cad3', near: '#a9b4bd', water: ['#d3dbe2', '#f4f2ed'], mist: 'rgba(255,255,255,.55)', sun: '#fbf3df', star: 0, starColor: '#8d93a8', lamp: '#e4b86f' },
    dusk:    { sky: ['#dcd6e2', '#ecdcd6', '#f8f6f1'], far: '#c2bac9', near: '#a8a9b8', water: ['#d6cfd8', '#f5efe8'], mist: 'rgba(255,255,255,.45)', sun: '#f3dcc0', star: 0.35, starColor: '#8d93a8', lamp: '#e4b86f' },
    moonlit: { sky: ['#d8dce6', '#e8eaef', '#f8f6f1'], far: '#bcc2cf', near: '#a3abbb', water: ['#cfd5e0', '#f3f2ee'], mist: 'rgba(255,255,255,.5)', sun: '#fbf6e8', star: 0.6, starColor: '#7f879e', lamp: '#e4b86f' },
    // Dark theme: slate night and a quiet dusk.
    night:   { sky: ['#161822', '#1e2130', '#2a2e40'], far: '#262a3a', near: '#1d2030', water: ['#20233a', '#343954'], mist: 'rgba(170,180,210,.14)', sun: '#eceaf0', star: 1, starColor: '#ffffff', lamp: '#e4b86f' },
    nightDusk: { sky: ['#1b1b28', '#3a2e3c', '#5a4a4a'], far: '#32303f', near: '#24232f', water: ['#2d2a3e', '#5b4d4c'], mist: 'rgba(200,180,180,.16)', sun: '#f0dcc5', star: 0.6, starColor: '#ffffff', lamp: '#e4b86f' },
  };
  const pick = () => {
    const h = new Date().getHours();
    if (isDark()) return h >= 17 && h < 20 ? PAL.nightDusk : PAL.night;
    if (h >= 5 && h < 8) return PAL.dawn;
    if (h >= 8 && h < 17) return PAL.day;
    if (h >= 17 && h < 20) return PAL.dusk;
    return PAL.moonlit; // light theme at night: a moonlit sky the ink stays readable over
  };

  // Small deterministic noise so the ridges look the same on every visit.
  const seed = (n) => { let x = Math.sin(n * 9301 + 49297) * 233280; return x - Math.floor(x); };
  const ridge = (count, y0, amp, k) => {
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const y = y0 + amp * (Math.sin(t * 6.3 * k) * 0.5 + Math.sin(t * 17 * k + 1.3) * 0.25 + (seed(i * k) - 0.5) * 0.35);
      pts.push([t, y]);
    }
    return pts;
  };

  function livingPainting(canvas) {
    const overlay = canvas.dataset.painting === 'overlay';
    const ctx = canvas.getContext('2d', { alpha: overlay });
    let W = 0, H = 0, dpr = 1, raf = 0, last = 0, visible = true, onScreen = true;
    let px = 0, py = 0, tx = 0, ty = 0; // pointer parallax target / eased
    const far = ridge(48, 0.52, 0.10, 1.0);
    const near = ridge(64, 0.60, 0.08, 1.7);
    const lamps = Array.from({ length: 7 }, (_, i) => ({ x: seed(i + 3) * 1.2 - 0.1, y: 0.80 + seed(i + 11) * 0.14, s: 0.6 + seed(i + 5) * 0.6, v: 0.004 + seed(i + 7) * 0.004, ph: seed(i + 9) * 6.28 }));
    const flies = Array.from({ length: 36 }, (_, i) => ({ x: seed(i + 21), y: 0.25 + seed(i + 31) * 0.5, r: 0.6 + seed(i + 41) * 1.4, ph: seed(i + 51) * 6.28, v: 0.02 + seed(i + 61) * 0.03 }));
    const stars = Array.from({ length: 90 }, (_, i) => ({ x: seed(i + 71), y: seed(i + 81) * 0.5, r: 0.4 + seed(i + 91) * 1.1, ph: seed(i + 101) * 6.28 }));

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    function draw(now) {
      const t = now / 1000;
      const P = pick();
      root.dataset.daypart = P === PAL.night || P === PAL.nightDusk ? 'night' : P === PAL.dusk ? 'dusk' : P === PAL.dawn ? 'dawn' : P === PAL.moonlit ? 'moonlit' : 'day';
      if (overlay) { drawOverlay(now, t, P); return; }
      const still = reduced();
      const sy = still ? 0 : Math.min(scrollY, 900) / 900; // scroll parallax 0..1
      if (!still) { px += (tx - px) * 0.04; py += (ty - py) * 0.04; }
      const ox = px * 14, oy = py * 8;

      // Sky
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, P.sky[0]); g.addColorStop(0.55, P.sky[1]); g.addColorStop(1, P.sky[2]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

      // Stars
      if (P.star > 0) {
        for (const s of stars) {
          const a = P.star * (0.45 + 0.55 * (still ? 0.7 : Math.sin(t * 1.3 + s.ph) * 0.5 + 0.5));
          ctx.globalAlpha = a; ctx.fillStyle = P.starColor;
          ctx.beginPath(); ctx.arc(s.x * W + ox * 0.2, s.y * H + oy * 0.2 - sy * 20, s.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Sun or moon
      const isNight = P === PAL.night || P === PAL.moonlit;
      const dark = P === PAL.night || P === PAL.nightDusk;
      const mx = W * 0.74 + ox * 0.3, my = H * (isNight ? 0.2 : 0.3) + oy * 0.3 - sy * 40;
      const mr = Math.min(W, H) * 0.06;
      const halo = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, mr * 4);
      halo.addColorStop(0, P.sun + 'aa'); halo.addColorStop(1, P.sun + '00');
      ctx.fillStyle = halo; ctx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8);
      ctx.fillStyle = P.sun; ctx.beginPath(); ctx.arc(mx, my, mr, 0, 6.283); ctx.fill();
      if (isNight) { ctx.fillStyle = P.sky[1]; ctx.beginPath(); ctx.arc(mx + mr * 0.42, my - mr * 0.18, mr * 0.9, 0, 6.283); ctx.fill(); }

      // Far ridge
      const drawRidge = (pts, color, dx, dy) => {
        ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(-20, H);
        for (const [x, y] of pts) ctx.lineTo(x * (W + 40) - 20 + dx, y * H + dy);
        ctx.lineTo(W + 20, H); ctx.closePath(); ctx.fill();
      };
      drawRidge(far, P.far, ox * 0.5, oy * 0.5 - sy * 24);
      // Mist
      const mist = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.72);
      mist.addColorStop(0, 'rgba(255,255,255,0)'); mist.addColorStop(0.6, P.mist); mist.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = mist; ctx.fillRect(0, H * 0.45 + (still ? 0 : Math.sin(t * 0.3) * 6), W, H * 0.3);
      drawRidge(near, P.near, ox * 0.9, oy * 0.9 - sy * 10);

      // River
      const wy = H * 0.72;
      const wg = ctx.createLinearGradient(0, wy, 0, H);
      wg.addColorStop(0, P.water[0]); wg.addColorStop(1, P.water[1]);
      ctx.fillStyle = wg; ctx.fillRect(0, wy, W, H - wy);
      // Shimmer lines
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.22)' : 'rgba(80,90,120,.16)'; ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const yy = wy + 8 + i * ((H - wy) / 14);
        const phase = still ? 0 : t * 0.6 + i;
        ctx.globalAlpha = 0.12 + 0.1 * Math.sin(phase);
        ctx.beginPath();
        for (let x = 0; x <= W; x += 18) ctx.lineTo(x, yy + Math.sin(x * 0.03 + phase) * 1.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Mountain reflection
      ctx.save(); ctx.globalAlpha = 0.18; ctx.translate(0, wy * 2); ctx.scale(1, -1);
      drawRidge(near, P.near, ox * 0.9, oy * 0.9 - sy * 10); ctx.restore();

      // Floating lamps
      for (const l of lamps) {
        if (!still) { l.x += l.v / 60; if (l.x > 1.1) l.x = -0.1; }
        const bob = still ? 0 : Math.sin(t * 1.4 + l.ph) * 2;
        const x = l.x * W + ox * 1.2, y = l.y * H + bob;
        const s = l.s * Math.min(W, H) * 0.02;
        // reflection streak
        const rg = ctx.createLinearGradient(x, y, x, y + s * 7);
        rg.addColorStop(0, dark ? 'rgba(255,180,70,.45)' : 'rgba(228,184,111,.35)'); rg.addColorStop(1, 'rgba(255,180,70,0)');
        ctx.fillStyle = rg; ctx.fillRect(x - s * 0.5, y, s, s * 7);
        // boat
        ctx.fillStyle = dark ? '#4a2b1a' : '#8a6a56'; ctx.beginPath(); ctx.ellipse(x, y, s * 1.3, s * 0.45, 0, 0, 6.283); ctx.fill();
        // glow + flame
        const fl = still ? 1 : 0.85 + 0.15 * Math.sin(t * 11 + l.ph);
        const gg = ctx.createRadialGradient(x, y - s, 0, x, y - s, s * 3.2 * fl);
        gg.addColorStop(0, dark ? 'rgba(255,200,90,.55)' : 'rgba(228,184,111,.4)'); gg.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = gg; ctx.fillRect(x - s * 4, y - s * 5, s * 8, s * 8);
        ctx.fillStyle = P.lamp; ctx.beginPath();
        ctx.moveTo(x, y - s * 2.1 * fl); ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.9, x, y - s * 0.3); ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.9, x, y - s * 2.1 * fl); ctx.fill();
      }

      // Fireflies by night, pollen by day
      ctx.fillStyle = dark ? '#ffe9a3' : '#c8a862';
      for (const f of flies) {
        const a = still ? 0.35 : 0.15 + 0.5 * (Math.sin(t * 1.1 + f.ph) * 0.5 + 0.5);
        const x = (f.x + (still ? 0 : Math.sin(t * f.v * 8 + f.ph) * 0.02)) * W + ox * 1.5;
        const y = (f.y + (still ? 0 : Math.cos(t * f.v * 6 + f.ph) * 0.02)) * H + oy * 1.5 - sy * 60;
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, f.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Living overlay over the painted river: the water itself moves (each row of the painting's water is
    // redrawn with a slow sinusoidal wobble), ripples drift with the current, the sun glitters on it, mist
    // crosses the mountains, a flock of birds passes now and then, lamps float, fireflies rise at night.
    const bg = canvas.parentElement.querySelector('.hero-bg') || canvas.parentElement.querySelector('img');
    const D = canvas.dataset;
    // The water polygon, in painting coordinates (u,v in 0..1), per painting; the hero river is the default.
    const WATER = D.water ? D.water.trim().split(/\s+/).map((p) => p.split(',').map(Number)) : D.water === '' ? [] : [[0, 0.735], [0.3, 0.74], [0.55, 0.755], [0.72, 0.76], [0.8, 0.79], [0.88, 0.84], [1, 0.9], [1, 1], [0, 1]];
    const WTOP = WATER.length ? Math.min(...WATER.map((p) => p[1])) : 1;
    const SUN = D.sun !== undefined && D.sun !== '' ? +D.sun : null;
    const NLAMPS = D.lamps !== undefined ? +D.lamps : 7;
    const MISTY = D.mist === 'none' ? null : D.mist ? +D.mist : 0.56;
    const FX = new Set((D.fx || '').split(',').map((x) => x.trim()).filter(Boolean));
    const weather = Array.from({ length: FX.has('flicker') ? 70 : 48 }, (_, i) => ({ x: seed(i + 501), y: seed(i + 511), r: 0.8 + seed(i + 521) * 1.6, v: 0.03 + seed(i + 531) * 0.05, ph: seed(i + 541) * 6.28 }));
    const ripples = Array.from({ length: 44 }, (_, i) => ({ x: seed(i + 101), d: seed(i + 111), len: 0.03 + seed(i + 121) * 0.06, ph: seed(i + 131) * 6.28, v: 0.006 + seed(i + 141) * 0.008 }));
    const glints = Array.from({ length: 34 }, (_, i) => ({ x: SUN === null ? 0.1 + seed(i + 201) * 0.8 : SUN - 0.1 + seed(i + 201) * 0.2, d: seed(i + 211), r: 0.6 + seed(i + 221) * 1.2, ph: seed(i + 231) * 6.28 }));
    const birds = Array.from({ length: 6 }, (_, i) => ({ dx: seed(i + 301) * 0.05, dy: (seed(i + 311) - 0.5) * 0.03, ph: seed(i + 321) * 6.28 }));
    const mists = MISTY === null ? [] : [{ x: 0.1, y: MISTY, w: 0.5, h: 0.08, v: 0.004 }, { x: 0.5, y: MISTY + 0.04, w: 0.6, h: 0.07, v: 0.0028 }, { x: 0.8, y: MISTY - 0.04, w: 0.45, h: 0.06, v: 0.0035 }];
    let enterAt = 0;
    document.addEventListener('spritual:enter', () => { enterAt = performance.now(); kick(); });
    // drawImage samples the decoded bitmap, whose pixel size differs from naturalWidth for srcset candidates, so sample a bitmap we own
    let bmp = null, bmpSrc = '';
    // when the frame's film clip is playing, the water rows are redrawn from the clip so still and motion never disagree
    const liveClip = () => { const v = canvas.parentElement.querySelector('video.frame-video'); return v && !v.paused && v.readyState >= 2 && v.videoWidth && v.closest('.frame')?.classList.contains('is-live') ? v : null; };
    const bitmap = () => {
      const v = liveClip(); if (v) return v;
      if (!bg || !bg.complete || !bg.naturalWidth) return null;
      if (bg.currentSrc !== bmpSrc && window.createImageBitmap) { bmpSrc = bg.currentSrc; bmp = null; createImageBitmap(bg).then((b) => { if (bmpSrc === bg.currentSrc) bmp = b; }).catch(() => {}); }
      return bmp;
    };
    const cover = () => {
      // where the painting sits under object-fit: cover, reading object-position from CSS so the crop can change per breakpoint
      const v = liveClip(); const iw = v ? v.videoWidth : bg.naturalWidth, ih = v ? v.videoHeight : bg.naturalHeight; const sc = Math.max(W / iw, H / ih);
      let px = 0.6, py = 1.0;
      try { const m = getComputedStyle(bg).objectPosition.match(/([\d.]+)%\s+([\d.]+)%/); if (m) { px = +m[1] / 100; py = +m[2] / 100; } } catch {}
      return { iw, ih, sc, ox: (W - iw * sc) * px, oy: (H - ih * sc) * py };
    };
    function drawOverlay(now, t, P) {
      const still = reduced();
      ctx.clearRect(0, 0, W, H);
      const dark = P === PAL.night || P === PAL.nightDusk;
      if (!still) { px += (tx - px) * 0.04; py += (ty - py) * 0.04; }
      const ox = px * 10;
      const ent = enterAt ? Math.min(1, (now - enterAt) / 3200) : 1;   // entrance progress
      const src = bitmap();
      let c = src ? cover() : null;
      if (c && !(c.iw > 0 && c.ih > 0 && isFinite(c.ox) && isFinite(c.oy) && isFinite(c.sc))) c = null;
      const ready = !!c;
      const X = (u) => (c ? c.ox + u * c.iw * c.sc : u * W);
      const Y = (v) => (c ? c.oy + v * c.ih * c.sc : v * H);
      const top = Y(WTOP);
      // a playing film clip already carries its own moving water; repainting it from the still's geometry would smear
      const clipLive = !!liveClip();
      if (ready && !still && WATER.length && !clipLive) {
        // 1. the water moves: redraw the painting's water rows with a depth-weighted wobble
        ctx.save(); ctx.beginPath(); WATER.forEach(([u, v], i) => (i ? ctx.lineTo(X(u), Y(v)) : ctx.moveTo(X(u), Y(v)))); ctx.closePath(); ctx.clip();
        const rh = W < 700 ? 5 : 4;
        for (let y = Math.max(0, top - 2); y < H; y += rh) {
          const depth = (y - top) / Math.max(1, H - top);
          const amp = 0.8 + depth * 5.5;
          const off = amp * Math.sin(y * 0.045 + t * 1.5) + amp * 0.5 * Math.sin(y * 0.12 - t * 2.1 + 1.3);
          const sw = src.videoWidth || src.width; const sy = (y - c.oy) / c.sc; const k = sw / c.iw;
          ctx.drawImage(src, 0, sy * k, sw, (rh / c.sc + 0.5) * k, c.ox + off, y, c.iw * c.sc, rh + 0.5);
        }
        // 2. ripples drift with the current, longer and brighter in the foreground
        ctx.lineWidth = 1; ctx.lineCap = 'round';
        for (const r of ripples) {
          const u = (r.x + t * r.v) % 1.1 - 0.05; const v = WTOP + 0.02 + r.d * (0.98 - WTOP);
          const x = X(u) + ox, y = Y(v); const len = r.len * W * (0.5 + r.d);
          ctx.globalAlpha = (0.08 + 0.16 * r.d) * (0.6 + 0.4 * Math.sin(t * 1.3 + r.ph)); ctx.strokeStyle = dark ? 'rgba(200,210,235,1)' : 'rgba(255,252,240,1)';
          ctx.beginPath(); ctx.moveTo(x - len / 2, y); ctx.quadraticCurveTo(x, y - 1.5 - r.d * 2, x + len / 2, y); ctx.stroke();
        }
        // 3. the sun glitters on the water
        ctx.fillStyle = dark ? '#dfe6ff' : '#fff3c8';
        for (const g of glints) {
          const a = Math.max(0, Math.sin(t * 2.4 + g.ph)) * 0.75; const x = X(g.x + Math.sin(t * 0.5 + g.ph) * 0.01) + ox, y = Y(WTOP + 0.03 + g.d * (0.95 - WTOP));
          ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, g.r * (0.6 + g.d), 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.restore();
      }
      // 4. mist crosses the mountains
      for (const m of mists) {
        const u = ((m.x + t * m.v) % 1.6) - 0.3; const cx = X(u), cy = Y(m.y + (still ? 0 : Math.sin(t * 0.2 + m.x * 7) * 0.006));
        if (!isFinite(cx) || !isFinite(cy)) continue;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, m.w * W * 0.5);
        const ma = (dark ? 0.16 : 0.42) * (1 + (1 - ent) * 1.6);   // mist is thick at the entrance and settles
        g.addColorStop(0, dark ? `rgba(190,200,230,${ma})` : `rgba(255,255,255,${ma})`); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save(); ctx.translate(cx, cy); ctx.scale(1, m.h / m.w); ctx.translate(-cx, -cy); ctx.fillStyle = g; ctx.fillRect(cx - m.w * W, cy - m.w * W, m.w * W * 2, m.w * W * 2); ctx.restore();
      }
      // 5. a flock crosses the sky every 28 s
      if (!still && D.birds !== '0') {
        const cyc = enterAt && now - enterAt < 12000 ? (now - enterAt) / 12000 : (t % 28) / 12; // a flock crosses at the entrance, then every 28 s
        if (cyc < 1) {
          ctx.strokeStyle = dark ? 'rgba(220,225,240,.5)' : 'rgba(70,70,90,.45)'; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
          for (const b of birds) {
            const x = X(-0.05 + cyc * 1.1 + b.dx), y = Y(0.22 + b.dy + Math.sin(cyc * 6 + b.ph) * 0.01); const w = 5 + b.dx * 60; const flap = Math.sin(t * 9 + b.ph) * 2.5;
            ctx.beginPath(); ctx.moveTo(x - w, y + flap); ctx.quadraticCurveTo(x, y - 1, x + w, y + flap); ctx.stroke();
          }
        }
      }
      // 6. lamps on the water
      if (!clipLive) lamps.slice(0, NLAMPS).forEach((l, li) => {
        if (!still) { l.x += l.v / 60; if (l.x > 1.1) l.x = -0.1; }
        const lit = Math.max(0, Math.min(1, (ent * 7 - li * 0.8) / 1.2)); const flare = lit < 1 ? 1 + Math.sin(lit * Math.PI) * 0.8 : 1;   // each lamp catches in turn
        const bob = still ? 0 : Math.sin(t * 1.4 + l.ph) * 2;
        const x = X(l.x) + ox, y = Y(WTOP + 0.05 + (l.y - 0.8) * 0.9 * ((1 - WTOP) / 0.265)) + bob, s = l.s * Math.min(W, H) * 0.016;
        if (lit === 0) { ctx.fillStyle = '#8a6a56'; ctx.beginPath(); ctx.ellipse(x, y, s * 1.3, s * 0.45, 0, 0, 6.283); ctx.fill(); return; }
        ctx.globalAlpha = lit;
        const rg = ctx.createLinearGradient(x, y, x, y + s * 7); rg.addColorStop(0, 'rgba(228,184,111,.38)'); rg.addColorStop(1, 'rgba(228,184,111,0)');
        ctx.fillStyle = rg; ctx.fillRect(x - s * 0.5, y, s, s * 7);
        ctx.fillStyle = '#8a6a56'; ctx.beginPath(); ctx.ellipse(x, y, s * 1.3, s * 0.45, 0, 0, 6.283); ctx.fill();
        const fl = still ? 1 : 0.85 + 0.15 * Math.sin(t * 11 + l.ph);
        const gg = ctx.createRadialGradient(x, y - s, 0, x, y - s, s * 3.2 * fl); gg.addColorStop(0, 'rgba(255,200,90,.5)'); gg.addColorStop(1, 'rgba(255,200,90,0)');
        ctx.fillStyle = gg; ctx.fillRect(x - s * 4, y - s * 5, s * 8, s * 8);
        ctx.fillStyle = P.lamp; ctx.beginPath(); ctx.moveTo(x, y - s * 2.1 * fl * flare); ctx.quadraticCurveTo(x + s * 0.6, y - s * 0.9, x, y - s * 0.3); ctx.quadraticCurveTo(x - s * 0.6, y - s * 0.9, x, y - s * 2.1 * fl * flare); ctx.fill();
        ctx.globalAlpha = 1;
      });
      // 7. fireflies by night, pollen by day
      if (!FX.has('nopollen')) {
        ctx.fillStyle = dark ? '#ffe9a3' : '#cfa85c';
        for (const f of flies) {
          const a = still ? 0.3 : 0.1 + 0.45 * (Math.sin(t * 1.1 + f.ph) * 0.5 + 0.5);
          const x = (f.x + (still ? 0 : Math.sin(t * f.v * 8 + f.ph) * 0.02)) * W + ox * 1.5;
          const y = (0.3 + f.y * 0.6 + (still ? 0 : Math.cos(t * f.v * 6 + f.ph) * 0.02)) * H;
          ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, f.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      // 8. the act's own weather: light rays, snow, petals, embers, lamp-flicker, spray
      if (FX.has('rays')) {
        const sx = X(SUN === null ? 0.78 : SUN), sy = Y(0.12); const L = Math.max(W, H) * 1.6;
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        for (let i = 0; i < 5; i++) {
          const a0 = 2.1 + i * 0.16 + (still ? 0 : Math.sin(t * 0.07 + i) * 0.05); const wdt = 0.05 + (i % 2) * 0.03;
          const pulse = still ? 0.6 : 0.5 + 0.5 * Math.sin(t * 0.21 + i * 1.3);
          const g = ctx.createLinearGradient(sx, sy, sx + Math.cos(a0) * L, sy + Math.sin(a0) * L); g.addColorStop(0, `rgba(255,236,190,${0.16 * pulse})`); g.addColorStop(0.5, `rgba(255,236,190,${0.05 * pulse})`); g.addColorStop(1, 'rgba(255,236,190,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(a0 - wdt) * L, sy + Math.sin(a0 - wdt) * L); ctx.lineTo(sx + Math.cos(a0 + wdt) * L, sy + Math.sin(a0 + wdt) * L); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (FX.has('snow') || FX.has('spray')) {
        const near = FX.has('spray'); const ax = +(D.spray || '0.2,0.35').split(',')[0], ay = +(D.spray || '0.2,0.35').split(',')[1];
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (const f of weather) {
          const life = (t * f.v + f.ph) % 1;
          const x = near ? X(ax + (f.x - 0.5) * 0.12 + Math.sin(t * 0.6 + f.ph) * 0.01) : X(f.x + Math.sin(t * 0.3 + f.ph) * 0.03);
          const y = near ? Y(ay + life * 0.5) : Y(life * 0.75);
          ctx.globalAlpha = (near ? 0.35 : 0.5) * Math.sin(life * Math.PI);
          ctx.beginPath(); ctx.arc(x + ox * 0.5, y, near ? f.r * 2.4 : f.r, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (FX.has('petals')) {
        for (const f of weather) {
          const life = (t * f.v * 0.6 + f.ph) % 1; const x = X(f.x + Math.sin(t * 0.9 + f.ph) * 0.04 - life * 0.08) + ox, y = Y(-0.05 + life * 1.1);
          const rot = t * 1.7 + f.ph; const r = f.r * 1.4;
          ctx.fillStyle = f.ph % 2 > 1 ? 'rgba(232,150,60,.85)' : 'rgba(248,196,110,.85)'; ctx.globalAlpha = 0.9 * Math.sin(life * Math.PI);
          ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.45, rot, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (FX.has('embers')) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const f of weather) {
          const life = (t * f.v * 0.9 + f.ph) % 1; const x = X(f.x + Math.sin(t * 1.3 + f.ph) * 0.015) + ox, y = Y(0.98 - life * 0.55);
          ctx.fillStyle = 'rgba(255,170,70,1)'; ctx.globalAlpha = 0.7 * Math.sin(life * Math.PI) * (0.6 + 0.4 * Math.sin(t * 9 + f.ph));
          ctx.beginPath(); ctx.arc(x, y, f.r * 0.7, 0, 6.283); ctx.fill();
        }
        ctx.restore();
      }
      if (FX.has('flicker') && WATER.length) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        for (const f of weather) {
          const x = X(f.x) + ox, y = Y(WTOP + 0.08 + f.y * (0.9 - WTOP)); const a = still ? 0.3 : 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(t * (2 + f.v * 60) + f.ph));
          const g = ctx.createRadialGradient(x, y, 0, x, y, f.r * 6); g.addColorStop(0, `rgba(255,200,110,${a})`); g.addColorStop(1, 'rgba(255,200,110,0)');
          ctx.fillStyle = g; ctx.fillRect(x - f.r * 6, y - f.r * 6, f.r * 12, f.r * 12);
        }
        ctx.restore();
      }
    }
    const loop = (now) => {
      raf = 0;
      if (!visible || !onScreen || reduced()) return;
      if (now - last > (overlay ? 40 : 33)) { last = now; draw(now); } // 24 to 30 fps is plenty for a slow painting
      raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; kick(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => { visible = !document.hidden; kick(); });
    matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { draw(performance.now()); kick(); });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => draw(performance.now()));
    new MutationObserver(() => { draw(performance.now()); kick(); }).observe(root, { attributes: true, attributeFilter: ['data-theme', 'data-motion'] });
    if (matchMedia('(hover: hover)').matches) {
      canvas.parentElement.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2; ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      canvas.parentElement.addEventListener('pointerleave', () => { tx = 0; ty = 0; });
    }
    resize(); kick();
  }

  // Opening diya: one flame lights, its glow reveals the name, then the page is there.
  function diya(canvas, onDone, ms, flameOnly = false) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const start = performance.now();
    let raf;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = flameOnly ? H * 0.655 : H * 0.62, s = Math.min(W, H) * (flameOnly ? 0.035 : 0.06);
      const glowR = s * (2 + e * 22);
      const g = ctx.createRadialGradient(cx, cy - s, 0, cx, cy - s, glowR);
      g.addColorStop(0, `rgba(255,190,80,${0.55 * e})`); g.addColorStop(0.35, `rgba(255,150,60,${0.22 * e})`); g.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // lamp
      if (!flameOnly) { ctx.fillStyle = '#6b3a1f'; ctx.beginPath(); ctx.ellipse(cx, cy + s * 0.2, s * 1.6, s * 0.55, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = '#8a4a26'; ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.05, s * 1.6, s * 0.4, 0, 0, 6.283); ctx.fill(); }
      // flame grows from a spark
      const fh = s * (0.2 + e * 2.2) * (0.92 + 0.08 * Math.sin(now / 45));
      const fg = ctx.createLinearGradient(cx, cy, cx, cy - fh);
      fg.addColorStop(0, '#fff2c2'); fg.addColorStop(0.5, '#ffb347'); fg.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = fg; ctx.beginPath();
      ctx.moveTo(cx, cy - fh); ctx.quadraticCurveTo(cx + s * 0.55, cy - fh * 0.4, cx, cy - s * 0.15); ctx.quadraticCurveTo(cx - s * 0.55, cy - fh * 0.4, cx, cy - fh); ctx.fill();
      if (p < 1) raf = requestAnimationFrame(frame); else onDone();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }

  // Opening: a spark becomes a flame over the painted lamp; its light spreads; fireflies rise. Returns a cancel function.
  function opening(canvas, onDone, ms) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const start = performance.now();
    const flies = Array.from({ length: 46 }, (_, i) => ({ x: seed(i + 3), y: 0.55 + seed(i + 9) * 0.5, r: 0.8 + seed(i + 15) * 1.6, v: 0.012 + seed(i + 21) * 0.02, ph: seed(i + 27) * 6.28 }));
    const embers = Array.from({ length: 18 }, (_, i) => ({ x: (seed(i + 41) - 0.5) * 0.06, v: 0.05 + seed(i + 51) * 0.08, r: 0.6 + seed(i + 61), ph: seed(i + 71) * 6.28, life: seed(i + 81) }));
    let raf, dawnAt = 0, dawnMs = 1500, finished = false;
    const frame = (now) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const t = now / 1000;
      const d = dawnAt ? Math.min(1, (now - dawnAt) / dawnMs) : 0;   // dawn progress
      const de = d * d * (3 - 2 * d);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H * 0.655, s = Math.min(W, H) * 0.035;
      // spreading light, then daylight
      const glowR = s * (3 + e * 60) + de * Math.max(W, H) * 1.4;
      const g = ctx.createRadialGradient(cx, cy - s, 0, cx, cy - s, glowR);
      const warm = 0.45 * Math.min(1, p * 3) + de * 0.55;
      g.addColorStop(0, `rgba(255,${190 + de * 50},${90 + de * 140},${Math.min(1, warm)})`); g.addColorStop(0.3 + de * 0.5, `rgba(255,${150 + de * 90},${60 + de * 160},${0.16 + de * 0.8})`); g.addColorStop(1, `rgba(250,246,238,${de * 0.82})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // fireflies rise once there is light, and scatter at dawn
      const fa = Math.max(0, Math.min(1, (p - 0.25) * 2.2)) * (1 - de);
      ctx.fillStyle = '#ffe9a3';
      for (const f of flies) {
        const y = (f.y - (t * f.v) % 0.9);
        const x = f.x + Math.sin(t * 0.8 + f.ph) * 0.015;
        ctx.globalAlpha = fa * (0.25 + 0.6 * (Math.sin(t * 2 + f.ph) * 0.5 + 0.5));
        ctx.beginPath(); ctx.arc(x * W, (y < 0 ? y + 0.9 : y) * H, f.r, 0, 6.283); ctx.fill();
      }
      // embers drift up from the flame
      ctx.fillStyle = '#ffb347';
      for (const m of embers) {
        const k = ((t * m.v + m.life) % 1);
        ctx.globalAlpha = (1 - k) * 0.6 * Math.min(1, p * 2) * (1 - de);
        ctx.beginPath(); ctx.arc(cx + (m.x + Math.sin(t * 1.7 + m.ph) * 0.01) * W, cy - s * 2 - k * H * 0.25, m.r * (1 - k * 0.5), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      // flame: spark, then a breathing teardrop with a bright core; it swells at dawn and dissolves into the light
      const grow = Math.min(1, p * 2.2);
      const fh = s * (0.15 + grow * 2.4 + de * 3) * (0.93 + 0.07 * Math.sin(now / 55) + 0.04 * Math.sin(now / 23));
      const lean = Math.sin(now / 160) * s * 0.12;
      ctx.globalAlpha = 1 - de;
      const fg = ctx.createLinearGradient(cx, cy, cx, cy - fh);
      fg.addColorStop(0, '#fff6d6'); fg.addColorStop(0.45, '#ffc257'); fg.addColorStop(1, 'rgba(255,110,40,0)');
      ctx.fillStyle = fg; ctx.beginPath();
      ctx.moveTo(cx + lean, cy - fh); ctx.quadraticCurveTo(cx + s * 0.6, cy - fh * 0.4, cx, cy - s * 0.1); ctx.quadraticCurveTo(cx - s * 0.6, cy - fh * 0.4, cx + lean, cy - fh); ctx.fill();
      const core = ctx.createRadialGradient(cx, cy - fh * 0.3, 0, cx, cy - fh * 0.3, s * 0.5);
      core.addColorStop(0, 'rgba(255,255,240,.9)'); core.addColorStop(1, 'rgba(255,255,240,0)');
      ctx.fillStyle = core; ctx.beginPath(); ctx.arc(cx, cy - fh * 0.3, s * 0.5, 0, 6.283); ctx.fill();
      ctx.globalAlpha = 1;
      if (p >= 1 && !dawnAt && !finished) { finished = true; onDone(); }
      if (!dawnAt || d < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return { dawn(msDawn) { dawnMs = msDawn; dawnAt = performance.now(); }, cancel() { cancelAnimationFrame(raf); } };
  }

  // Dust motes in a shaft of light over the reading desk; at dawn the light fills the room.
  function dust(canvas) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const motes = Array.from({ length: 70 }, (_, i) => ({ x: seed(i + 7), y: seed(i + 17), r: 0.5 + seed(i + 27) * 1.4, vx: (seed(i + 37) - 0.5) * 0.004, vy: -0.002 - seed(i + 47) * 0.004, ph: seed(i + 57) * 6.28 }));
    const start = performance.now(); let raf, dawnAt = 0, dawnMs = 1500, stopped = false;
    const frame = (now) => {
      if (stopped) return;
      const t = now / 1000; const p = Math.min(1, (now - start) / 1200);
      const d = dawnAt ? Math.min(1, (now - dawnAt) / dawnMs) : 0; const de = d * d * (3 - 2 * d);
      ctx.clearRect(0, 0, W, H);
      // a soft shaft of light from the upper left, warming to day
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 0, W * 0.5, H * 0.45, Math.max(W, H) * (0.55 + de * 1.2));
      g.addColorStop(0, `rgba(255,${214 + de * 30},${150 + de * 80},${0.22 * p + de * 0.7})`); g.addColorStop(1, `rgba(250,246,238,${de * 0.82})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffe9b8';
      for (const m of motes) {
        m.x += m.vx / 60; m.y += m.vy / 60; if (m.y < -0.02) { m.y = 1.02; m.x = seed(m.ph * 10 + t); } if (m.x < 0) m.x = 1; if (m.x > 1) m.x = 0;
        ctx.globalAlpha = p * (1 - de) * (0.15 + 0.45 * (Math.sin(t * 1.5 + m.ph) * 0.5 + 0.5));
        ctx.beginPath(); ctx.arc(m.x * W, m.y * H, m.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (!dawnAt || d < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return { dawn(ms) { dawnMs = ms; dawnAt = performance.now(); }, stop() { stopped = true; cancelAnimationFrame(raf); } };
  }

  // Watercolour blooms: each deity soaks into the paper inside a growing pigment blot with a pooled rim.
  function blooms(canvas, items) {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const portrait = H > W * 1.1;
    const R = portrait ? Math.min(W * 0.23, H * 0.125) : Math.min(W * 0.095, H * 0.2);
    const pos = portrait ? [[.27, .45], [.73, .45], [.27, .79], [.73, .79]] : [[.14, .62], [.38, .62], [.62, .62], [.86, .62]];
    const imgs = items.map((it) => { const im = new Image(); im.decoding = 'async'; im.src = it.src; return im; });
    const started = items.map(() => 0);
    const N = 80;
    const ph = items.map((_, i) => [0, 1, 2, 3].map((k) => seed(i * 131 + k * 7 + 3) * 6.28));
    const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
    let raf, fadeAt = 0, fadeMs = 800, stopped = false;
    const blob = (cx, cy, r, t, i, spread) => {
      ctx.beginPath();
      for (let k = 0; k <= N; k++) {
        const a = (k / N) * 6.2832; const q = ph[i];
        const n = 1 + 0.09 * Math.sin(a * 2 + q[0]) + 0.07 * Math.sin(a * 3 + q[1] + t * 0.25) + 0.045 * Math.sin(a * 5 - t * 0.2 + q[2]) + 0.02 * Math.sin(a * 8 + q[3] + t * 0.4);
        const rr = r * n * spread; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
    };
    const frame = (now) => {
      if (stopped) return;
      const t = now / 1000;
      const d = fadeAt ? Math.min(1, (now - fadeAt) / fadeMs) : 0; const de = d * d * (3 - 2 * d);
      ctx.clearRect(0, 0, W, H);
      let live = false;
      items.forEach((it, i) => {
        if (!started[i]) return;
        const p = Math.min(1, (now - started[i]) / 1250); if (p < 1) live = true;
        const e = 1 - Math.pow(1 - p, 3);
        const cx = pos[i][0] * W, cy = pos[i][1] * H, r = R * (0.08 + 0.92 * e);
        const im = imgs[i];
        ctx.save(); ctx.globalAlpha = Math.min(1, p * 2.2) * (1 - de);
        // wet spread beyond the blot
        blob(cx, cy, r, t, i, 1.09); ctx.fillStyle = rgba(it.tint, 0.09); ctx.fill();
        // the blot: a pale wash of the pigment, the portrait soaked into it, a multiply tint for granulation
        ctx.save(); blob(cx, cy, r, t, i, 1); ctx.clip();
        ctx.fillStyle = rgba(it.tint, 0.16); ctx.fillRect(cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
        if (im.complete && im.naturalWidth) { const w = r * 2.25, h = (w * im.naturalHeight) / im.naturalWidth; ctx.drawImage(im, cx - w / 2, cy - r * 0.94, w, h); }
        ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = rgba(it.tint, 0.08); ctx.fillRect(cx - r * 1.3, cy - r * 1.3, r * 2.6, r * 2.6);
        ctx.restore();
        // pooled rim where the pigment dried
        blob(cx, cy, r, t, i, 1); ctx.lineWidth = 2; ctx.strokeStyle = rgba(it.tint, 0.42); ctx.stroke();
        blob(cx, cy, r, t, i, 0.985); ctx.lineWidth = 5; ctx.strokeStyle = rgba(it.tint, 0.08); ctx.stroke();
        ctx.restore();
      });
      if (!(fadeAt && d >= 1)) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return {
      positions: () => pos.map(([x, y]) => ({ x: x * W, y: y * H, r: R })),
      open(i) { if (!started[i]) { started[i] = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); } },
      fade(ms) { fadeMs = ms; fadeAt = performance.now(); },
      stop() { stopped = true; cancelAnimationFrame(raf); },
    };
  }

  // Film grain: a small noise texture, refreshed ten times a second, stretched over the viewport.
  function grain(canvas) {
    const ctx = canvas.getContext('2d', { alpha: true }); const w = 180, h = 110; canvas.width = w; canvas.height = h;
    const img = ctx.createImageData(w, h); const d = img.data; let last = 0, raf = 0;
    const loop = (now) => { raf = requestAnimationFrame(loop); if (document.hidden || reduced() || now - last < 100) return; last = now; for (let i = 0; i < d.length; i += 4) { const v = 120 + Math.random() * 135; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } ctx.putImageData(img, 0, 0); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }
  window.SpritualScene = { livingPainting, diya, opening, dust, blooms, grain };
  document.querySelectorAll('canvas[data-painting]').forEach(livingPainting);
  document.dispatchEvent(new Event('spritual:scene-ready'));
})();
