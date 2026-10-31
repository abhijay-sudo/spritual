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
      wheelMultiplier: 0.95,
      prevent: (node) => !!node?.closest?.('[data-lenis-prevent], dialog, .fluid-sheet, .fluid-sheet-content, .command-dialog, [role="dialog"]')
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

    // Keep Lenis halted during arrival ceremony to preserve instant scroll positioning
    if (document.documentElement.dataset.arrival !== 'done') {
      lenis.stop();
    }
    document.addEventListener('manuscript:opened', () => {
      lenis?.start();
    });
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
      if (tome.hasAttribute('data-home-book')) return;
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

  // Story Reader Sanctuary Opening Ceremony
  if (gsap && !reducedMotion.matches) {
    const openBook = document.querySelector('.open-book');
    const storyTitle = document.querySelector('.reader-story-title');

    if (openBook) {
      gsap.fromTo(
        openBook,
        { opacity: 0.88, y: 14, rotateX: 2 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.85, ease: 'power2.out' }
      );
    }
    if (asideImg) {
      gsap.fromTo(
        asideImg,
        { opacity: 0.65, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1.05, ease: 'power2.out' }
      );
      const inkDisp = document.getElementById('ink-displacement');
      if (inkDisp) {
        gsap.fromTo(inkDisp, { attr: { scale: 32 } }, { attr: { scale: 0 }, duration: 0.8, ease: 'power2.out' });
      }
    }
    if (storyTitle) {
      gsap.fromTo(
        storyTitle,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.65, delay: 0.1, ease: 'power2.out' }
      );
    }
  }

  // Create Golden Shockwave Element for Climax
  let shockwaveRing = document.querySelector('.golden-shockwave-ring');
  if (!shockwaveRing) {
    shockwaveRing = document.createElement('div');
    shockwaveRing.className = 'golden-shockwave-ring';
    shockwaveRing.setAttribute('aria-hidden', 'true');
    document.body.appendChild(shockwaveRing);
  }

  // Dual Mode Switcher wired to existing appearance settings
  const leafFlowBtn = document.querySelector('[data-reading-flow="leaf"]');
  const scrollFlowBtn = document.querySelector('[data-reading-flow="scroll"]');
  if (leafFlowBtn) leafFlowBtn.addEventListener('click', enable3DPageFlipMode);
  if (scrollFlowBtn) scrollFlowBtn.addEventListener('click', disable3DPageFlipMode);

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
// =========================================================================
// 4. TOP-OF-THE-LINE SACRED DEITY ARRIVAL CEREMONY & SANCTUM CURTAIN
// Silhouette emergence, rotating mandala halo, golden rim glow, procedural chime
// =========================================================================
function initAshramaLightCanvas() {
  // Dust motes removed per user mandate
  const canvas = document.getElementById('ashrama-light-canvas');
  if (canvas) canvas.remove();
}

function initDeitySanctumCurtain() {
  const curtain = document.getElementById('deity-sanctum-curtain');
  if (!curtain) return;

  // Immediate bypass if reduced motion is requested
  if (reducedMotion.matches) {
    curtain.style.display = 'none';
    curtain.setAttribute('hidden', '');
    return;
  }

  // If arrival has already completed for this session/visit, hide immediately
  let sessionDismissed = false;
  try {
    sessionDismissed = sessionStorage.getItem('spritual_sanctum_session_dismissed') === '1';
  } catch {}
  if (sessionDismissed && document.documentElement.dataset.arrival === 'done') {
    curtain.style.display = 'none';
    curtain.setAttribute('hidden', '');
    return;
  }

  const deityImg = curtain.querySelector('[data-deity-img]');
  const mantraEl = curtain.querySelector('[data-sanctum-mantra]');
  const pills = curtain.querySelectorAll('[data-deity-choice]');
  const enterBtn = curtain.querySelector('[data-sanctum-enter]');
  const mandalaHalo = curtain.querySelector('.deity-mandala-halo');
  const radiance = curtain.querySelector('.sanctum-sun-burst');
  const invocation = curtain.querySelector('.sanctum-invocation');

  const DEITY_PROFILES = {
    shiva: {
      mantra: '॥ ॐ नमः शिवाय ॥',
      freq: 432,
      src: '/content-assets/portraits/shiva-960.webp'
    },
    rama: {
      mantra: '॥ ॐ रामाय नमः ॥',
      freq: 480,
      src: '/content-assets/portraits/rama-960.webp'
    },
    krishna: {
      mantra: '॥ ॐ नमो भगवते वासुदेवाय ॥',
      freq: 528,
      src: '/content-assets/portraits/krishna-960.webp'
    },
    ganesha: {
      mantra: '॥ ॐ गं गणपतये नमः ॥',
      freq: 396,
      src: '/content-assets/portraits/ganesha-960.webp'
    },
    durga: {
      mantra: '॥ ॐ दुं दुर्गायै नमः ॥',
      freq: 639,
      src: '/content-assets/portraits/durga-960.webp'
    }
  };

  const gsap = getGSAP();
  let entranceTimeline = null;

  function runEntrance() {
    if (!gsap) return;
    if (entranceTimeline) entranceTimeline.kill();

    entranceTimeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        setTimeout(() => {
          if (!dismissed) dismissSanctum(false);
        }, 3400);
      }
    });

    gsap.set(deityImg, {
      opacity: 0,
      scale: 0.92,
      filter: 'brightness(0) drop-shadow(0 0 10px rgba(212, 175, 55, 0.1))'
    });
    gsap.set(mandalaHalo, { opacity: 0, scale: 0.65 });
    gsap.set(radiance, { opacity: 0, scale: 0.7 });
    gsap.set(invocation, { opacity: 0, y: 16 });
    gsap.set(pills, { opacity: 0, y: 10 });
    gsap.set(enterBtn, { opacity: 0, scale: 0.9 });

    entranceTimeline
      .to(radiance, { opacity: 0.9, scale: 1.1, duration: 1.2, ease: 'sine.out' }, 0)
      .to(mandalaHalo, { opacity: 0.85, scale: 1, duration: 1.3, ease: 'back.out(1.2)' }, 0.15)
      .to(deityImg, {
        opacity: 1,
        scale: 1,
        filter: 'brightness(0) drop-shadow(0 0 35px rgba(212, 175, 55, 0.75)) drop-shadow(0 0 70px rgba(200, 75, 49, 0.35)) drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8))',
        duration: 1.3,
        ease: 'power3.out'
      }, 0.25)
      .to(invocation, { opacity: 1, y: 0, duration: 0.9 }, 0.65)
      .to(pills, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.85)
      .to(enterBtn, { opacity: 1, scale: 1, duration: 0.5 }, 1.05);
  }

  runEntrance();

  // Switch divine archetype on pill selection
  pills.forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const choice = pill.dataset.deityChoice;
      const profile = DEITY_PROFILES[choice];
      if (!profile) return;

      pills.forEach(p => p.classList.toggle('active', p === pill));

      try {
        playTempleChime(profile.freq);
      } catch {}

      if (mantraEl) {
        mantraEl.textContent = profile.mantra;
        if (gsap) {
          gsap.fromTo(mantraEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: 0.35 });
        }
      }

      if (deityImg) {
        if (gsap) {
          gsap.to(deityImg, {
            opacity: 0.35,
            scale: 0.96,
            duration: 0.2,
            onComplete: () => {
              deityImg.src = profile.src;
              gsap.to(deityImg, {
                opacity: 1,
                scale: 1,
                duration: 0.45,
                ease: 'back.out(1.2)'
              });
            }
          });
        } else {
          deityImg.src = profile.src;
        }
      }
    });
  });

  let dismissed = false;
  function dismissSanctum(fastForward = true) {
    if (dismissed) return;
    dismissed = true;
    try {
      sessionStorage.setItem('spritual_sanctum_session_dismissed', '1');
    } catch {}

    if (entranceTimeline) entranceTimeline.kill();

    curtain.style.pointerEvents = 'none';
    if (gsap) {
      gsap.to(curtain, {
        opacity: 0,
        scale: 1.06,
        duration: 0.55,
        ease: 'power2.inOut',
        onComplete: () => {
          curtain.style.display = 'none';
          curtain.setAttribute('hidden', '');
        }
      });
    } else {
      curtain.style.display = 'none';
      curtain.setAttribute('hidden', '');
    }

    if (fastForward) {
      const skipBtn = document.querySelector('.arrival-skip');
      if (skipBtn) {
        skipBtn.click();
      } else {
        document.documentElement.dataset.arrival = 'done';
        try {
          localStorage.setItem('spritual_manuscript_arrival_v1', String(Date.now()));
        } catch {}
        document.dispatchEvent(new CustomEvent('manuscript:opened'));
      }
    }
  }

  // Dismissal triggers: enter button
  if (enterBtn) {
    enterBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissSanctum(true);
    });
  }

  // Click on curtain or outside controls (excluding replay button)
  document.addEventListener('click', (e) => {
    if (dismissed || e.target.closest('.deity-pill, .sanctum-enter-btn, .arrival-replay')) return;
    if (curtain.style.display !== 'none' && !curtain.hasAttribute('hidden')) {
      dismissSanctum(true);
    }
  });

  // Keyboard navigation: Escape, Enter, Space
  window.addEventListener('keydown', (e) => {
    if (!dismissed && ['Escape', 'Enter', ' '].includes(e.key)) {
      if (e.key === 'Enter' && e.target.closest('.deity-pill')) return;
      dismissSanctum(true);
    }
  });

  // Wheel dismissal
  window.addEventListener('wheel', (e) => {
    if (!dismissed && Math.abs(e.deltaY) > 8) {
      dismissSanctum(true);
    }
  }, { passive: true });

  // Touch dismissal
  curtain.addEventListener('touchmove', () => {
    if (!dismissed) {
      dismissSanctum(true);
    }
  }, { passive: true });

  // Sync with system arrival state only if already session-dismissed or explicit skip
  const observer = new MutationObserver(() => {
    if (document.documentElement.dataset.arrival === 'done' && sessionDismissed) {
      dismissSanctum(false);
    }
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-arrival'] });

  document.addEventListener('manuscript:opened', () => {
    if (sessionDismissed) dismissSanctum(false);
  });

  // Replay integration: re-opening ceremony when footer replay button is clicked
  const replayBtn = document.querySelector('.arrival-replay');
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      dismissed = false;
      try {
        sessionStorage.removeItem('spritual_sanctum_session_dismissed');
      } catch {}
      lenis?.stop();
      curtain.removeAttribute('hidden');
      curtain.style.display = 'flex';
      curtain.style.opacity = '1';
      curtain.style.transform = 'none';
      curtain.style.pointerEvents = 'auto';
      runEntrance();
    });
  }
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
  initDeitySanctumCurtain();
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
