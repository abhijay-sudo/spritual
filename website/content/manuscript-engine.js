// =========================================================================
// SPRITUAL — MASTER CREATIVE ENGINEERING ENGINE (120FPS LIVING MANUSCRIPT)
// 3D Tome Matrix, GSAP Timelines, SVG Ink-Bleed, Ashrama Dust, Procedural Audio
// =========================================================================

import { playPageRustle, playTempleChime, playBowShockwave } from './manuscript-audio.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const hi = document.documentElement.lang === 'hi';

// Helper for resilient library access
function getGSAP() {
  return window.gsap || null;
}
function getScrollTrigger() {
  return window.ScrollTrigger || null;
}
function getFlip() {
  return window.Flip || null;
}
function getLenis() {
  return window.Lenis || null;
}

// =========================================================================
// 1. INERTIAL LENIS SMOOTH SCROLL + GSAP TICKER
// =========================================================================
let lenis = null;
if (!reducedMotion.matches && typeof window !== 'undefined') {
  const LenisClass = getLenis();
  const gsap = getGSAP();
  const ScrollTrigger = getScrollTrigger();

  if (LenisClass) {
    lenis = new LenisClass({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 0.95
    });

    if (gsap) {
      if (ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);
      }
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  const Flip = getFlip();
  if (gsap && Flip) {
    gsap.registerPlugin(Flip);
  }
}

// =========================================================================
// 2. 3D HARDCOVER MANUSCRIPT TOME ENGINE (HOVER & GRAND UNFURL TIMELINE)
// =========================================================================
function init3DTomes() {
  const tomes = document.querySelectorAll('.tome-3d');
  if (!tomes.length) return;

  // Ensure unfurl backdrop exists in DOM
  let backdrop = document.querySelector('.tome-unfurl-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'tome-unfurl-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);
  }

  tomes.forEach((tome) => {
    const frontCover = tome.querySelector('.tome-cover-front');
    const leaves = tome.querySelectorAll('.tome-inner-leaf');
    let isOpening = false;

    // A. 3D Magnetic Cursor Tracking + Cover Crack-Open on Hover
    tome.addEventListener('pointermove', (e) => {
      if (isOpening || reducedMotion.matches) return;
      const rect = tome.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      // Update gold-foil glare position
      frontCover?.style.setProperty('--mouse-x', `${(px * 100).toFixed(1)}%`);
      frontCover?.style.setProperty('--mouse-y', `${(py * 100).toFixed(1)}%`);

      const rotX = -((py - 0.5) * 16).toFixed(2); // -8deg .. 8deg
      const rotY = ((px - 0.5) * 24 - 6).toFixed(2); // -18deg .. 6deg

      tome.style.transform = `perspective(2200px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(36px)`;

      // Crack front cover open
      if (frontCover) {
        frontCover.style.transform = 'rotateY(-32deg)';
      }
      // Fan out inner leaves in 3D depth
      if (leaves[0]) leaves[0].style.transform = 'rotateY(-22deg)';
      if (leaves[1]) leaves[1].style.transform = 'rotateY(-14deg)';
      if (leaves[2]) leaves[2].style.transform = 'rotateY(-6deg)';
    });

    tome.addEventListener('pointerenter', () => {
      if (isOpening || reducedMotion.matches) return;
      playPageRustle();
    });

    tome.addEventListener('pointerleave', () => {
      if (isOpening || reducedMotion.matches) return;
      tome.style.transform = 'perspective(2200px) rotateX(4deg) rotateY(-8deg) translateZ(0px)';
      if (frontCover) frontCover.style.transform = 'rotateY(0deg)';
      leaves.forEach((leaf) => {
        leaf.style.transform = 'rotateY(0deg)';
      });
    });

    // B. Clicking a Book: "The Grand Manuscript Unfurl" Master Timeline (920ms)
    tome.addEventListener('click', (e) => {
      const link = tome.dataset.tomeLink || tome.querySelector('a')?.getAttribute('href');
      if (!link) return;

      // Intercept navigation for the grand 3D opening animation
      e.preventDefault();
      if (isOpening) return;
      isOpening = true;

      playPageRustle();
      backdrop.classList.add('active');

      const rect = tome.getBoundingClientRect();
      const deltaX = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const deltaY = window.innerHeight / 2 - (rect.top + rect.height / 2);

      const gsap = getGSAP();
      if (gsap && !reducedMotion.matches) {
        const tl = gsap.timeline({
          onComplete: () => {
            window.location.href = link;
          }
        });

        // Step 1 (0.0s – 0.35s): Center tome to viewport stage
        tl.to(tome, {
          x: deltaX,
          y: deltaY,
          scale: 1.35,
          rotateX: 0,
          rotateY: 0,
          zIndex: 9999,
          duration: 0.35,
          ease: 'expo.inOut'
        });

        // Step 2 (0.25s – 0.75s): Swing front cover wide open to -162deg
        tl.to(
          frontCover,
          {
            rotateY: -162,
            duration: 0.5,
            ease: 'power4.inOut'
          },
          0.25
        );

        // Fan inner leaves across -145deg, -115deg, -75deg
        if (leaves.length) {
          tl.to(
            leaves[0],
            { rotateY: -145, duration: 0.45, ease: 'power3.inOut' },
            0.28
          );
          if (leaves[1]) {
            tl.to(
              leaves[1],
              { rotateY: -115, duration: 0.45, ease: 'power3.inOut' },
              0.32
            );
          }
          if (leaves[2]) {
            tl.to(
              leaves[2],
              { rotateY: -75, duration: 0.45, ease: 'power3.inOut' },
              0.36
            );
          }
        }

        // Step 3 (0.55s – 0.92s): Pulse SVG ink-bleed displacement filter on revealed art
        const inkDisp = document.getElementById('ink-displacement');
        if (inkDisp) {
          tl.fromTo(
            inkDisp,
            { attr: { scale: 45 } },
            { attr: { scale: 0 }, duration: 0.37, ease: 'power2.out' },
            0.55
          );
        }

        // Camera zoom into right-hand open page
        tl.to(
          tome,
          {
            scale: 2.4,
            opacity: 0,
            duration: 0.37,
            ease: 'power3.in'
          },
          0.55
        );
      } else {
        // Reduced motion fallback
        setTimeout(() => {
          window.location.href = link;
        }, 120);
      }
    });
  });
}

// =========================================================================
// 3. 11-SCENE STORY READER: DUAL 3D PAGE-CURL & SCROLLYTELLING ENGINE
// =========================================================================
function initStoryReaderEngine() {
  const reader = document.querySelector('[data-canonical-reader], [data-reader]');
  if (!reader) return;

  const folios = document.querySelectorAll('.book-leaves .folio, [data-folio]');
  const asideImg = document.querySelector('.frontispiece-art img');
  const spineFill = document.querySelector('[data-spine-fill]');
  const beads = document.querySelectorAll('[data-spine-bead]');
  const gsap = getGSAP();
  const ScrollTrigger = getScrollTrigger();

  // Create Golden Shockwave Element for Climax
  let shockwaveRing = document.querySelector('.golden-shockwave-ring');
  if (!shockwaveRing) {
    shockwaveRing = document.createElement('div');
    shockwaveRing.className = 'golden-shockwave-ring';
    shockwaveRing.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shockwaveRing);
  }

  // Dual Mode Switcher: [ 📖 3D Open Book | 📜 Living Scroll ]
  const controlsBar = document.querySelector('.reader-mode-bar');
  if (controlsBar && !document.querySelector('.reader-mode-switch')) {
    const switchWrap = document.createElement('div');
    switchWrap.className = 'reader-mode-switch';
    switchWrap.setAttribute('role', 'group');
    switchWrap.setAttribute('aria-label', hi ? 'पठन विधि चुनें' : 'Reading presentation');

    const bookBtn = document.createElement('button');
    bookBtn.type = 'button';
    bookBtn.setAttribute('aria-pressed', 'false');
    bookBtn.textContent = hi ? '📖 3D पुस्तक' : '📖 3D Open Book';

    const scrollBtn = document.createElement('button');
    scrollBtn.type = 'button';
    scrollBtn.setAttribute('aria-pressed', 'true');
    scrollBtn.textContent = hi ? '📜 जीवंत प्रवाह' : '📜 Living Scroll';

    switchWrap.appendChild(bookBtn);
    switchWrap.appendChild(scrollBtn);
    controlsBar.prepend(switchWrap);

    bookBtn.addEventListener('click', () => {
      bookBtn.setAttribute('aria-pressed', 'true');
      scrollBtn.setAttribute('aria-pressed', 'false');
      enable3DPageFlipMode();
    });

    scrollBtn.addEventListener('click', () => {
      scrollBtn.setAttribute('aria-pressed', 'true');
      bookBtn.setAttribute('aria-pressed', 'false');
      disable3DPageFlipMode();
    });
  }

  // Scrollytelling Living Scroll Engine
  let climaxPlayed = false;
  if (folios.length) {
    let scrollRaf = 0;
    function scrubSpine() {
      scrollRaf = 0;
      const first = folios[0], last = folios[folios.length - 1];
      if (!first || !last || !spineFill) return;
      const top = first.getBoundingClientRect().top + window.scrollY;
      const bottom = last.getBoundingClientRect().bottom + window.scrollY;
      const total = bottom - top - window.innerHeight * 0.5;
      const current = window.scrollY - top;
      const progress = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
      spineFill.style.transform = `scaleY(${progress})`;
    }

    addEventListener('scroll', () => {
      if (!scrollRaf) scrollRaf = requestAnimationFrame(scrubSpine);
    }, { passive: true });
    scrubSpine();

    // Scene Intersection & Climax Trigger
    folios.forEach((folio, idx) => {
      if (gsap && ScrollTrigger && !reducedMotion.matches) {
        ScrollTrigger.create({
          trigger: folio,
          start: 'top 45%',
          end: 'bottom 45%',
          onEnter: () => activateScene(idx, folio),
          onEnterBack: () => activateScene(idx, folio)
        });
      }
    });

    function activateScene(idx, folio) {
      folios.forEach(f => f.classList.remove('active-reading-scene'));
      folio.classList.add('active-reading-scene');

      // Update spine bead indicators
      beads.forEach((bead, i) => {
        if (i === idx) {
          bead.setAttribute('aria-current', 'step');
          bead.classList.add('bead-active');
        } else {
          bead.removeAttribute('aria-current');
          bead.classList.remove('bead-active');
        }
      });

      // Camera pan/zoom on aside artwork with SVG ink-bleed pulse
      if (asideImg && folio.dataset.sceneImage) {
        const newSrc = folio.dataset.sceneImage;
        if (asideImg.getAttribute('src') !== newSrc) {
          asideImg.src = newSrc;
          if (folio.dataset.sceneAlt) asideImg.alt = folio.dataset.sceneAlt;
          if (folio.dataset.sceneFocal) asideImg.style.objectPosition = folio.dataset.sceneFocal;

          if (gsap && !reducedMotion.matches) {
            gsap.fromTo(asideImg, { scale: 1.0, opacity: 0.5 }, { scale: 1.08, opacity: 1, duration: 0.65, ease: 'power2.out' });
            const inkDisp = document.getElementById('ink-displacement');
            if (inkDisp) {
              gsap.fromTo(inkDisp, { attr: { scale: 28 } }, { attr: { scale: 0 }, duration: 0.6, ease: 'power2.out' });
            }
          }
        }
      }

      // Climax Special Effect: Scenes 10 & 11 (Shiva's Bow Breaks)
      if (idx === 9 || idx === 10) {
        triggerClimaxBowBreak();
      }
    }

    function triggerClimaxBowBreak() {
      if (climaxPlayed) return;
      climaxPlayed = true;

      // 1. Procedural sub-bass bow resonance
      playBowShockwave();

      // 2. Expanding golden shockwave ring
      shockwaveRing.classList.remove('trigger');
      void shockwaveRing.offsetWidth; // reflow
      shockwaveRing.classList.add('trigger');

      // 3. Camera elastic tremor on <main>
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.classList.remove('climax-tremor');
        void mainEl.offsetWidth;
        mainEl.classList.add('climax-tremor');
      }

      setTimeout(() => {
        climaxPlayed = false;
      }, 8000);
    }
  }

  // 3D PageFlip Mode Integration
  let pageFlipInstance = null;
  function enable3DPageFlipMode() {
    const leavesContainer = document.querySelector('.book-leaves');
    if (!leavesContainer) return;

    // Check if PageFlip library is loaded
    const St = window.St;
    if (St && St.PageFlip && !pageFlipInstance) {
      let flipWrapper = document.querySelector('.stpageflip-wrapper');
      if (!flipWrapper) {
        flipWrapper = document.createElement('div');
        flipWrapper.className = 'stpageflip-wrapper';
        flipWrapper.innerHTML = `<div id="stpageflip-book"></div>`;
        leavesContainer.parentElement.insertBefore(flipWrapper, leavesContainer);

        const bookEl = document.getElementById('stpageflip-book');
        folios.forEach((f, i) => {
          const pageDiv = document.createElement('div');
          pageDiv.className = 'page-flip-leaf';
          pageDiv.style.background = '#FAF6EE';
          pageDiv.style.padding = '32px';
          pageDiv.style.boxSizing = 'border-box';
          pageDiv.innerHTML = f.innerHTML;
          bookEl.appendChild(pageDiv);
        });

        pageFlipInstance = new St.PageFlip(bookEl, {
          width: 520,
          height: 680,
          showCover: true,
          maxShadowOpacity: 0.65,
          flippingTime: 850
        });

        pageFlipInstance.loadFromHTML(document.querySelectorAll('.page-flip-leaf'));
        pageFlipInstance.on('flip', () => {
          playPageRustle();
        });
      }
      leavesContainer.hidden = true;
      flipWrapper.hidden = false;
    }
  }

  function disable3DPageFlipMode() {
    const leavesContainer = document.querySelector('.book-leaves');
    const flipWrapper = document.querySelector('.stpageflip-wrapper');
    if (leavesContainer) leavesContainer.hidden = false;
    if (flipWrapper) flipWrapper.hidden = true;
  }
}

// =========================================================================
// 4. AMBIENT SUNLIT ASHRAMA SHADER & DRIFTING GOLD DUST CANVAS
// =========================================================================
function initAshramaLightCanvas() {
  let canvas = document.getElementById('ashrama-light-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'ashrama-light-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
  }

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  let w = window.innerWidth;
  let h = window.innerHeight;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  addEventListener('resize', resize);

  // 35 Floating Golden Dust Motes with 3D Depth (z) and Cursor Velocity Repulsion
  const MOTES_COUNT = 35;
  const motes = [];
  let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0 };

  window.addEventListener('pointermove', (e) => {
    mouse.vx = e.clientX - mouse.lastX;
    mouse.vy = e.clientY - mouse.lastY;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.lastX = e.clientX;
    mouse.lastY = e.clientY;
  });

  for (let i = 0; i < MOTES_COUNT; i++) {
    motes.push({
      x: Math.random() * w,
      y: Math.random() * h,
      z: 0.4 + Math.random() * 1.6, // depth scaling
      radius: 1.2 + Math.random() * 2.4,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: 0.18 + Math.random() * 0.42,
      baseAlpha: 0.35 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      freq: 0.006 + Math.random() * 0.012
    });
  }

  let startTime = performance.now();
  function renderAshrama(time) {
    if (reducedMotion.matches) return;
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, w, h);

    // Pass 1: Warm Diagonal Sunbeams
    const rayGrad = ctx.createLinearGradient(0, 0, w * 0.75, h);
    rayGrad.addColorStop(0, 'rgba(250, 240, 215, 0.07)');
    rayGrad.addColorStop(0.35, 'rgba(212, 175, 55, 0.035)');
    rayGrad.addColorStop(0.7, 'rgba(250, 240, 215, 0.015)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, 0, w, h);

    // Pass 2: Golden Dust Motes with Velocity Repulsion
    for (const m of motes) {
      // Repulsion physics from pointer
      const dx = m.x - mouse.x;
      const dy = m.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 120 && dist > 0) {
        const force = (1 - dist / 120) * 2.2;
        m.x += (dx / dist) * force + mouse.vx * 0.05;
        m.y += (dy / dist) * force + mouse.vy * 0.05;
      }

      // Harmonic sinusoidal drift
      m.x += m.speedX * m.z + Math.sin(elapsed * m.freq + m.phase) * 0.3;
      m.y += m.speedY * m.z;

      // Wrap boundaries
      if (m.x < 0) m.x = w;
      if (m.x > w) m.x = 0;
      if (m.y > h) { m.y = -10; m.x = Math.random() * w; }

      const shimmer = m.baseAlpha * (0.7 + 0.3 * Math.sin(elapsed * 0.002 + m.phase));
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * m.z * 2.2);
      grad.addColorStop(0, `rgba(229, 192, 75, ${shimmer})`);
      grad.addColorStop(0.5, `rgba(200, 75, 49, ${shimmer * 0.4})`);
      grad.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius * m.z * 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    requestAnimationFrame(renderAshrama);
  }

  requestAnimationFrame(renderAshrama);
}

// =========================================================================
// 5. GSAP FLIP VALUE FILTER (/#stories)
// =========================================================================
function initFlipValueFilter() {
  const pills = document.querySelectorAll('[data-value-pill]');
  const select = document.querySelector('[data-filter=value]');
  const cards = document.querySelectorAll('.story-card');
  const gsap = getGSAP();
  const Flip = getFlip();

  if (!pills.length || !select || !cards.length || !gsap || !Flip) return;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      if (reducedMotion.matches) return;

      // Capture state BEFORE visibility toggle
      const state = Flip.getState('.story-card');

      setTimeout(() => {
        Flip.from(state, {
          duration: 0.75,
          ease: 'expo.out',
          stagger: 0.04,
          absolute: true,
          onEnter: (elements) =>
            gsap.fromTo(
              elements,
              { opacity: 0, scale: 0.85, rotateY: -25 },
              { opacity: 1, scale: 1, rotateY: -8, duration: 0.6, ease: 'back.out(1.4)' }
            ),
          onLeave: (elements) =>
            gsap.to(elements, { opacity: 0, scale: 0.8, duration: 0.4, ease: 'power2.in' })
        });
      }, 20);
    });
  });
}

// =========================================================================
// 6. WORD-BY-WORD BLUR & RISE TYPOGRAPHY + SELF-DRAWING ❧ FLEURON
// =========================================================================
function initTypographyAndFleurons() {
  const gsap = getGSAP();
  const ScrollTrigger = getScrollTrigger();
  if (!gsap || !ScrollTrigger || reducedMotion.matches) return;

  // Animate headings
  document.querySelectorAll('h1:not(.text-reveal-headline), h2.daily-title').forEach((heading) => {
    const text = heading.textContent.trim();
    if (!text || heading.children.length > 0) return;
    const words = text.split(/\s+/);
    heading.innerHTML = words.map(w => `<span class="typog-word" style="display:inline-block;will-change:transform,opacity,filter;">${w}</span> `).join('');

    const wordEls = heading.querySelectorAll('.typog-word');
    gsap.fromTo(
      wordEls,
      { y: 18, opacity: 0, filter: 'blur(8px)' },
      {
        y: 0,
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.035,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: heading,
          start: 'top 85%'
        }
      }
    );
  });

  // Self-drawing fleuron path
  document.querySelectorAll('.foliate-path, .fleuron-path').forEach((path) => {
    if (path instanceof SVGGeometryElement) {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: path,
          start: 'top 88%'
        }
      });
    }
  });
}

// =========================================================================
// INITIALIZE ON DOM READY & AFTER NAVIGATION
// =========================================================================
function initAll() {
  init3DTomes();
  initStoryReaderEngine();
  initAshramaLightCanvas();
  initFlipValueFilter();
  initTypographyAndFleurons();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Support SPA/ViewTransition navigation
  window.addEventListener('pageswap', initAll);
  window.addEventListener('pagereveal', initAll);
}
