/* ==========================================================================
   SPRITUAL.CO.IN — 120FPS 3D MANUSCRIPT, SHADER, PAGE-CURL & AUDIO ENGINE
   ========================================================================== */

const gsap = window.gsap || globalThis.gsap;
const ScrollTrigger = window.ScrollTrigger || globalThis.ScrollTrigger;
const Flip = window.Flip || globalThis.Flip;
const Lenis = window.Lenis || globalThis.Lenis;

if (gsap && ScrollTrigger && Flip) {
  gsap.registerPlugin(ScrollTrigger, Flip);
}

const reducedMotion = typeof window !== 'undefined' && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function safeGet(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

/* --------------------------------------------------------------------------
   1. PROCEDURAL WEB AUDIO SYNTHESIZER (VELLUM PAGE RUSTLE, 432HZ CHIME, BOW)
   -------------------------------------------------------------------------- */
class ManuscriptAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = safeGet("spritual_sound") !== "off";
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playPageRustle(duration = 0.16) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(850, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + duration * 0.55);
    filter.frequency.exponentialRampToValueAtTime(650, now + duration);
    filter.Q.value = 3.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + duration * 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
  }

  playTempleChime(baseFreq = 432) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    [1, 1.5, 2.01].forEach((ratio, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.07 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2 - idx * 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 3.3);
    });
  }

  playBowShockwave() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.9);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(380, now);
    filter.frequency.exponentialRampToValueAtTime(65, now + 0.9);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  }
}

export const soundEngine = new ManuscriptAudioEngine();

/* --------------------------------------------------------------------------
   2. GLOBAL SVG FRACTAL INK-BLEED FILTER + PORTAL BACKDROP INJECTION
   -------------------------------------------------------------------------- */
function injectGlobalSVGFiltersAndPortal() {
  if (!document.getElementById("ms-svg-filters")) {
    const svgWrap = document.createElement("div");
    svgWrap.id = "ms-svg-filters";
    svgWrap.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none;";
    svgWrap.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
        <defs>
          <filter id="manuscript-ink-bleed" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence id="ms-ink-turb" type="fractalNoise" baseFrequency="0.032" numOctaves="4" seed="11" result="noise"/>
            <feDisplacementMap id="ms-ink-disp" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
      </svg>
    `;
    document.body.prepend(svgWrap);
  }

  if (!document.getElementById("tome-grand-portal-backdrop")) {
    const portalBackdrop = document.createElement("div");
    portalBackdrop.id = "tome-grand-portal-backdrop";
    document.body.appendChild(portalBackdrop);
  }
}

/* --------------------------------------------------------------------------
   3. 120FPS SUNLIT ASHRAMA GOD-RAYS & GOLDEN DUST SHADER CANVAS
   -------------------------------------------------------------------------- */
function initSunlightAndDustShader() {
  if (reducedMotion || document.getElementById("ashrama-sunlight-canvas")) return;

  const canvas = document.createElement("canvas");
  canvas.id = "ashrama-sunlight-canvas";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let w = (canvas.width = window.innerWidth);
  let h = (canvas.height = window.innerHeight);
  window.addEventListener("resize", () => {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }, { passive: true });

  const pointer = { x: w * 0.5, y: h * 0.3, vx: 0, vy: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.vx = e.clientX - pointer.x;
    pointer.vy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }, { passive: true });

  const motes = Array.from({ length: 38 }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1.1 + Math.random() * 2.4,
    vx: (Math.random() - 0.5) * 0.28,
    vy: -0.15 - Math.random() * 0.35,
    phase: Math.random() * Math.PI * 2
  }));

  if (gsap) {
    gsap.ticker.add((time) => {
      ctx.clearRect(0, 0, w, h);

      // Warm diagonal ashrama morning sunbeam gradient
      const rayGrad = ctx.createLinearGradient(0, 0, w * 0.85, h * 0.85);
      rayGrad.addColorStop(0, "rgba(246, 211, 101, 0.085)");
      rayGrad.addColorStop(0.45, "rgba(197, 155, 39, 0.03)");
      rayGrad.addColorStop(1, "rgba(250, 246, 238, 0)");
      ctx.fillStyle = rayGrad;
      ctx.fillRect(0, 0, w, h);

      for (const m of motes) {
        m.phase += 0.025;
        m.x += m.vx + Math.sin(m.phase) * 0.18;
        m.y += m.vy;

        const dx = m.x - pointer.x;
        const dy = m.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < 18000 && distSq > 1) {
          const force = (18000 - distSq) / 18000;
          m.x += (dx / Math.sqrt(distSq)) * force * 2.2;
          m.y += (dy / Math.sqrt(distSq)) * force * 2.2;
        }

        if (m.y < -10) m.y = h + 10;
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;

        const alpha = 0.22 + 0.35 * (0.5 + 0.5 * Math.sin(time * 1.8 + m.phase));
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(218, 172, 52, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    });
  }
}

/* --------------------------------------------------------------------------
   4. LENIS SMOOTH SCROLL + MAGNETIC HEADER + SOUND TOGGLE
   -------------------------------------------------------------------------- */
function initLenisAndHeader() {
  if (!reducedMotion && Lenis && !window.__spritualLenis) {
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      prevent: (node) => !!node?.closest?.('[data-lenis-prevent], dialog, .fluid-sheet, [role="dialog"]')
    });
    if (ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
    if (gsap) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    window.__spritualLenis = lenis;
  }

  const header = document.querySelector("header");
  if (!header) return;

  window.addEventListener("scroll", () => {
    header.classList.toggle("header-scrolled", window.scrollY > 36);
  }, { passive: true });

  // Magnetic Nav Pill
  const nav = header.querySelector("nav.primary-navigation") || header.querySelector("nav");
  if (nav && !document.querySelector(".ms-nav-magnetic-pill") && window.innerWidth > 700) {
    const pill = document.createElement("div");
    pill.className = "ms-nav-magnetic-pill";
    document.body.appendChild(pill);

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("pointerenter", () => {
        if (window.innerWidth <= 700) return;
        const rect = link.getBoundingClientRect();
        pill.style.opacity = "1";
        if (gsap) {
          gsap.to(pill, {
            left: rect.left - 8,
            top: rect.top - 4,
            width: rect.width + 16,
            height: rect.height + 8,
            duration: 0.38,
            ease: "expo.out"
          });
        }
      });
    });
    nav.addEventListener("pointerleave", () => {
      pill.style.opacity = "0";
    });
  }

  // Inject Soundscape Toggle Button in Header if not already present
  const headerControls = header.querySelector(".header-tools") || header.querySelector("div:last-of-type") || header;
  if (!header.querySelector(".ms-sound-toggle") && !header.querySelector(".paper-sound")) {
    const soundBtn = document.createElement("button");
    soundBtn.type = "button";
    soundBtn.className = "ms-sound-toggle";
    const renderLabel = () => {
      soundBtn.innerHTML = soundEngine.enabled
        ? `<span>🔊</span><span>Sound</span>`
        : `<span>🔇</span><span>Muted</span>`;
    };
    renderLabel();
    soundBtn.addEventListener("click", () => {
      soundEngine.enabled = !soundEngine.enabled;
      safeSet("spritual_sound", soundEngine.enabled ? "on" : "off");
      renderLabel();
      if (soundEngine.enabled) soundEngine.playTempleChime(528);
    });
    headerControls.prepend(soundBtn);
  }
}

/* --------------------------------------------------------------------------
   5. 3D HARDCOVER MANUSCRIPT TOME ENGINE (AUTO-UPGRADES EVERY BOOK CARD)
   -------------------------------------------------------------------------- */
function init3DManuscriptTomes() {
  const heroManuscript = document.querySelector('[aria-label="Spritual illustrated manuscript"]');
  const articleCards = Array.from(document.querySelectorAll("main section article"));
  const targets = heroManuscript ? [heroManuscript, ...articleCards] : articleCards;

  targets.forEach((card, index) => {
    if (card.dataset.tomeUpgraded === "true") return;
    card.dataset.tomeUpgraded = "true";

    const titleText = card.querySelector("h2, h3")?.textContent?.trim() || "The Living Manuscript";
    const descText = card.querySelector("p")?.textContent?.trim() || "Step inside the stories that shaped a civilisation.";
    const primaryLink = card.querySelector("a[href]");

    let tome3D = card.querySelector(".tome-3d");
    let coverFront = card.querySelector(".tome-cover-front");
    let innerLeaves = Array.from(card.querySelectorAll(".tome-inner-leaf"));

    if (!tome3D) {
      card.classList.add("tome-stage");

      tome3D = document.createElement("div");
      tome3D.className = "tome-3d";

      coverFront = document.createElement("div");
      coverFront.className = "tome-cover-front";
      while (card.firstChild) {
        coverFront.appendChild(card.firstChild);
      }

      const spineWall = document.createElement("div");
      spineWall.className = "tome-spine-wall";

      const pageBlock = document.createElement("div");
      pageBlock.className = "tome-page-block";

      innerLeaves = [0, 1, 2].map((leafIdx) => {
        const leaf = document.createElement("div");
        leaf.className = "tome-inner-leaf";
        if (leafIdx === 0) {
          leaf.innerHTML = `
            <div class="tome-inner-leaf-ornament">❧</div>
            <strong style="font-size:0.82rem;letter-spacing:0.08em;text-transform:uppercase;color:#C84B31;margin-bottom:6px;">${titleText}</strong>
            <div class="tome-inner-leaf-verse">“${descText.slice(0, 110)}…”</div>
          `;
        }
        return leaf;
      });

      const coverBack = document.createElement("div");
      coverBack.className = "tome-cover-back";

      tome3D.appendChild(coverBack);
      innerLeaves.forEach((leaf) => tome3D.appendChild(leaf));
      tome3D.appendChild(pageBlock);
      tome3D.appendChild(spineWall);
      tome3D.appendChild(coverFront);
      card.appendChild(tome3D);
    }

    if (!reducedMotion && gsap && ScrollTrigger) {
      gsap.fromTo(
        tome3D,
        { opacity: 0, y: 42, rotateX: 14, rotateY: -24 },
        {
          opacity: 1,
          y: 0,
          rotateX: 4,
          rotateY: -9,
          duration: 0.9,
          delay: (index % 3) * 0.08,
          ease: "expo.out",
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            once: true
          }
        }
      );
    }

    if (gsap) {
      const rxTo = gsap.quickTo(tome3D, "rotateX", { duration: 0.45, ease: "power3.out" });
      const ryTo = gsap.quickTo(tome3D, "rotateY", { duration: 0.45, ease: "power3.out" });
      const zTo = gsap.quickTo(tome3D, "z", { duration: 0.45, ease: "power3.out" });

      card.addEventListener("pointerenter", () => {
        if (reducedMotion || card.dataset.opening === "true") return;
        soundEngine.playPageRustle(0.11);
        zTo(32);

        if (coverFront) gsap.to(coverFront, { rotateY: -34, duration: 0.55, ease: "expo.out", overwrite: "auto" });
        if (innerLeaves[0]) gsap.to(innerLeaves[0], { rotateY: -22, duration: 0.55, ease: "expo.out", overwrite: "auto" });
        if (innerLeaves[1]) gsap.to(innerLeaves[1], { rotateY: -13, duration: 0.55, ease: "expo.out", overwrite: "auto" });
        if (innerLeaves[2]) gsap.to(innerLeaves[2], { rotateY: -5, duration: 0.55, ease: "expo.out", overwrite: "auto" });
      });

      card.addEventListener("pointermove", (e) => {
        if (reducedMotion || card.dataset.opening === "true") return;
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        if (coverFront) {
          coverFront.style.setProperty("--glare-x", `${(px * 100).toFixed(1)}%`);
          coverFront.style.setProperty("--glare-y", `${(py * 100).toFixed(1)}%`);
        }

        rxTo((0.5 - py) * 14);
        ryTo(-9 + (px - 0.5) * 18);
      });

      card.addEventListener("pointerleave", () => {
        if (reducedMotion || card.dataset.opening === "true") return;
        rxTo(4);
        ryTo(-9);
        zTo(0);
        if (coverFront) {
          gsap.to([coverFront, ...innerLeaves], {
            rotateY: 0,
            duration: 0.6,
            ease: "power3.out",
            overwrite: "auto"
          });
        }
      });
    }

    card.addEventListener("click", (e) => {
      if (card.hasAttribute("data-home-book")) return;
      const clickedAnchor = e.target.closest("a[href]");
      const targetUrl = clickedAnchor?.getAttribute("href") || primaryLink?.getAttribute("href");
      if (!targetUrl || targetUrl.startsWith("#") || e.metaKey || e.ctrlKey) return;

      e.preventDefault();
      if (card.dataset.opening === "true") return;
      card.dataset.opening = "true";

      soundEngine.playPageRustle(0.24);
      soundEngine.playTempleChime(432);

      const rect = card.getBoundingClientRect();
      const centerX = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const centerY = window.innerHeight / 2 - (rect.top + rect.height / 2);
      const portalBackdrop = document.getElementById("tome-grand-portal-backdrop");
      const inkDisp = document.getElementById("ms-ink-disp");

      card.style.zIndex = "9999";

      if (gsap && !reducedMotion) {
        const tl = gsap.timeline({
          onComplete: () => {
            window.location.href = targetUrl;
          }
        });

        if (portalBackdrop) tl.to(portalBackdrop, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0);
        tl.to(
          tome3D,
          {
            x: centerX * 0.65,
            y: centerY * 0.65,
            z: 180,
            rotateX: 0,
            rotateY: 0,
            scale: Math.min(1.38, (window.innerWidth * 0.75) / rect.width),
            duration: 0.48,
            ease: "expo.inOut"
          },
          0
        );

        if (coverFront) tl.to(coverFront, { rotateY: -160, duration: 0.58, ease: "power4.inOut" }, 0.16);
        if (innerLeaves[0]) tl.to(innerLeaves[0], { rotateY: -135, duration: 0.54, ease: "power3.inOut" }, 0.22);
        if (innerLeaves[1]) tl.to(innerLeaves[1], { rotateY: -95, duration: 0.52, ease: "power3.inOut" }, 0.27);
        if (innerLeaves[2]) tl.to(innerLeaves[2], { rotateY: -35, duration: 0.50, ease: "power3.inOut" }, 0.32);

        if (inkDisp) {
          tl.fromTo(
            inkDisp,
            { attr: { scale: 0 } },
            { attr: { scale: 42 }, duration: 0.32, yoyo: true, repeat: 1, ease: "sine.inOut" },
            0.35
          );
        }

        tl.to(
          tome3D,
          {
            scale: 2.35,
            opacity: 0,
            duration: 0.36,
            ease: "power3.in"
          },
          0.62
        );
      } else {
        window.location.href = targetUrl;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. 11-SCENE STORY READER: DUAL 3D BOOK FLIP & LIVING SCROLL + BOW SHOCKWAVE
   -------------------------------------------------------------------------- */
function initStoryReaderEngine() {
  const readerArticle = document.querySelector("main article[aria-label]");
  const readerAside = document.querySelector("main aside");
  if (!readerArticle || !readerAside) return;
  if (document.querySelector(".ms-reader-toolbar")) return;

  const scenes = Array.from(readerArticle.querySelectorAll("section"));
  if (!scenes.length) return;

  const asideImg = readerAside.querySelector("img");
  if (asideImg) {
    asideImg.style.filter = "url(#manuscript-ink-bleed)";
    asideImg.style.transition = "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)";
  }

  // A. Inject Dual-Mode Toolbar ([ 📖 3D Open Book | 📜 Living Scroll ])
  const toolbar = document.createElement("div");
  toolbar.className = "ms-reader-toolbar";
  toolbar.innerHTML = `
    <div class="ms-mode-switch-group" role="tablist" aria-label="Reading view mode">
      <button type="button" class="ms-mode-btn active" data-mode="scroll">📜 Living Scroll</button>
      <button type="button" class="ms-mode-btn" data-mode="book">📖 3D Open Book</button>
    </div>
    <div style="font-size:0.84rem;color:var(--ms-ink-soft);font-variant-numeric:tabular-nums;">
      Scene <strong id="ms-active-scene-num">01</strong> / ${String(scenes.length).padStart(2, "0")}
    </div>
  `;
  readerArticle.parentElement.insertBefore(toolbar, readerArticle);

  // B. Inject Golden Spine Progress Thread with Interactive Scene Beads
  const spineTrack = document.createElement("div");
  spineTrack.className = "ms-golden-spine-track active";
  const spineFill = document.createElement("div");
  spineFill.className = "ms-golden-spine-fill";
  spineTrack.appendChild(spineFill);

  const beads = scenes.map((sec, idx) => {
    if (!sec.id) sec.id = `page-${idx + 1}`;
    const bead = document.createElement("button");
    bead.type = "button";
    bead.className = "ms-spine-bead" + (idx === 0 ? " active" : "");
    bead.style.top = `${(idx / Math.max(1, scenes.length - 1)) * 100}%`;
    bead.title = sec.querySelector("h2")?.textContent || `Scene ${idx + 1}`;
    bead.addEventListener("click", () => {
      soundEngine.playPageRustle(0.14);
      sec.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    spineTrack.appendChild(bead);
    return bead;
  });
  document.body.appendChild(spineTrack);

  // C. Inject Silk Bookmark Ribbon ("Keep Page") on Each Scene + ScrollTrigger Choreography
  const savedKey = "spritual_saved_pages_v1";
  const getSavedPages = () => {
    try {
      return JSON.parse(localStorage.getItem(savedKey) || "[]");
    } catch {
      return [];
    }
  };

  const cameraFocalPoints = [
    { scale: 1.0, pos: "50% 50%" },
    { scale: 1.08, pos: "42% 38%" },
    { scale: 1.12, pos: "58% 45%" },
    { scale: 1.06, pos: "48% 62%" },
    { scale: 1.14, pos: "35% 48%" },
    { scale: 1.09, pos: "62% 35%" },
    { scale: 1.04, pos: "50% 52%" },
    { scale: 1.15, pos: "45% 40%" },
    { scale: 1.11, pos: "55% 58%" },
    { scale: 1.18, pos: "50% 32%" },
    { scale: 1.22, pos: "50% 50%" }
  ];

  scenes.forEach((sec, idx) => {
    const headerRow = sec.querySelector("div:first-of-type");
    const sceneTitle = sec.querySelector("h2")?.textContent?.trim() || `Scene ${idx + 1}`;
    const sceneHref = `${window.location.pathname}#page-${idx + 1}`;

    if (headerRow && !headerRow.querySelector(".ms-silk-ribbon-btn")) {
      const btn = document.createElement("button");
      btn.type = "button";
      const isSaved = getSavedPages().some((p) => p.href === sceneHref);
      btn.className = "ms-silk-ribbon-btn" + (isSaved ? " saved" : "");
      btn.innerHTML = isSaved ? "🔖 Kept in Saved" : "🔖 Keep page";

      btn.addEventListener("click", () => {
        const list = getSavedPages();
        const existingIdx = list.findIndex((p) => p.href === sceneHref);
        if (existingIdx >= 0) {
          list.splice(existingIdx, 1);
          btn.classList.remove("saved");
          btn.innerHTML = "🔖 Keep page";
        } else {
          list.unshift({
            href: sceneHref,
            storyTitle: document.querySelector("main h1")?.textContent || "Story",
            sceneTitle,
            excerpt: sec.querySelector("p")?.textContent?.slice(0, 140) || "",
            img: asideImg?.getAttribute("src") || "/stories-app/assets/forest-sages.webp"
          });
          btn.classList.add("saved");
          btn.innerHTML = "🔖 Kept in Saved";
          soundEngine.playTempleChime(528);
        }
        safeSet(savedKey, JSON.stringify(list));
      });
      headerRow.appendChild(btn);
    }

    if (ScrollTrigger) {
      ScrollTrigger.create({
        trigger: sec,
        start: "top 58%",
        end: "bottom 42%",
        onEnter: () => activateScene(idx, sec),
        onEnterBack: () => activateScene(idx, sec)
      });
    }
  });

  function activateScene(idx, sec) {
    if (sec.hidden) return;
    const readerRoot = document.querySelector('[data-reader]');
    if (readerRoot && readerRoot.dataset.readingModeState && readerRoot.dataset.readingModeState !== 'flow') return;

    const numEl = document.getElementById("ms-active-scene-num");
    if (numEl) numEl.textContent = String(idx + 1).padStart(2, "0");

    spineFill.style.height = `${(idx / Math.max(1, scenes.length - 1)) * 100}%`;
    beads.forEach((b, i) => b.classList.toggle("active", i <= idx));

    if (asideImg) {
      const cam = cameraFocalPoints[idx % cameraFocalPoints.length];
      asideImg.style.transform = `scale(${cam.scale})`;
      asideImg.style.objectPosition = cam.pos;

      const inkDisp = document.getElementById("ms-ink-disp");
      if (inkDisp && !reducedMotion && gsap) {
        gsap.fromTo(
          inkDisp,
          { attr: { scale: 22 } },
          { attr: { scale: 0 }, duration: 0.55, ease: "power2.out", overwrite: "auto" }
        );
      }
    }

    // CLIMAX SCENE EFFECT: Breaking Shiva's Bow (Scene 10 / 11)
    const headingText = (sec.querySelector("h2")?.textContent || "").toLowerCase();
    if ((idx >= 9 || headingText.includes("bow")) && !sec.dataset.shockwavePlayed) {
      sec.dataset.shockwavePlayed = "true";
      triggerBowBreakShockwave();
    }
  }

  function triggerBowBreakShockwave() {
    soundEngine.playBowShockwave();
    if (reducedMotion) return;

    const ring = document.createElement("div");
    ring.className = "ms-bow-shockwave";
    document.body.appendChild(ring);

    if (gsap) {
      gsap.to(ring, {
        scale: 42,
        opacity: 0,
        duration: 1.15,
        ease: "expo.out",
        onComplete: () => ring.remove()
      });

      gsap.fromTo(
        "main",
        { x: -7, rotateZ: -0.35 },
        { x: 0, rotateZ: 0, duration: 0.7, ease: "elastic.out(1.4, 0.2)" }
      );
    }
  }

  // D. Build Interactive 3D Open-Book Page-Curl Spread Stage
  const bookStage = document.createElement("div");
  bookStage.className = "ms-3d-open-book-stage";
  const readerRoot = document.querySelector('[data-reader]');
  const initialPage = Number(readerRoot?.dataset?.currentPage || (location.hash.match(/#page-(\d+)/)?.[1] ? Number(location.hash.match(/#page-(\d+)/)[1]) - 1 : 0));
  let currentBookIndex = isNaN(initialPage) ? 0 : Math.max(0, Math.min(scenes.length - 1, initialPage));

  bookStage.innerHTML = `
    <div class="ms-book-spread">
      <div class="ms-book-page-left">
        <div>
          <small style="letter-spacing:0.08em;text-transform:uppercase;color:var(--ms-sindoor);" id="ms-book-collection-label">
            ${readerAside.querySelector("span")?.textContent || "The Living Manuscript"}
          </small>
          <div style="margin-top:14px;">
            <img id="ms-book-left-img" src="${asideImg?.getAttribute("src") || ""}" alt="${asideImg?.getAttribute("alt") || ""}"/>
          </div>
        </div>
        <p style="font-size:0.88rem;color:var(--ms-ink-soft);margin-top:14px;">
          ${readerAside.querySelector("p")?.textContent || ""}
        </p>
      </div>
      <div class="ms-book-page-right" id="ms-book-right-content">
        <div id="ms-book-scene-body"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:24px;padding-top:16px;border-top:1px solid rgba(197,155,39,0.3);">
          <button type="button" class="ms-mode-btn" id="ms-book-prev-btn">← Previous Leaf</button>
          <span id="ms-book-leaf-counter" style="font-size:0.85rem;font-variant-numeric:tabular-nums;">01 / ${String(scenes.length).padStart(2, "0")}</span>
          <button type="button" class="ms-mode-btn active" id="ms-book-next-btn">Turn Leaf →</button>
        </div>
        <div class="ms-book-curl-corner" id="ms-book-corner-trigger" title="Turn manuscript leaf"></div>
      </div>
      <div class="ms-turning-leaf-3d" id="ms-turning-leaf"></div>
    </div>
  `;

  readerArticle.parentElement.insertBefore(bookStage, readerArticle);

  const sceneBodyEl = bookStage.querySelector("#ms-book-scene-body");
  const leafCounterEl = bookStage.querySelector("#ms-book-leaf-counter");
  const turningLeafEl = bookStage.querySelector("#ms-turning-leaf");

  function renderBookSpread(idx, direction = 1) {
    const sec = scenes[idx];
    if (!sec) return;
    soundEngine.playPageRustle(0.19);

    if (!reducedMotion && gsap) {
      gsap.killTweensOf(turningLeafEl);
      gsap.fromTo(
        turningLeafEl,
        {
          opacity: 1,
          rotateY: direction > 0 ? 0 : -180
        },
        {
          rotateY: direction > 0 ? -180 : 0,
          opacity: 0,
          duration: 0.68,
          ease: "power3.inOut"
        }
      );
    }

    sceneBodyEl.innerHTML = sec.innerHTML;
    leafCounterEl.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(scenes.length).padStart(2, "0")}`;
    if (idx >= 9) triggerBowBreakShockwave();
  }

  renderBookSpread(currentBookIndex, 1);

  document.addEventListener("book:pagechange", (e) => {
    if (typeof e.detail?.index === "number" && e.detail.index >= 0 && e.detail.index < scenes.length) {
      currentBookIndex = e.detail.index;
      renderBookSpread(currentBookIndex, 1);
    }
  });

  bookStage.querySelector("#ms-book-next-btn").addEventListener("click", () => {
    if (currentBookIndex < scenes.length - 1) {
      currentBookIndex++;
      renderBookSpread(currentBookIndex, 1);
    }
  });

  bookStage.querySelector("#ms-book-corner-trigger").addEventListener("click", () => {
    if (currentBookIndex < scenes.length - 1) {
      currentBookIndex++;
      renderBookSpread(currentBookIndex, 1);
    }
  });

  bookStage.querySelector("#ms-book-prev-btn").addEventListener("click", () => {
    if (currentBookIndex > 0) {
      currentBookIndex--;
      renderBookSpread(currentBookIndex, -1);
    }
  });

  // Mode Switcher Handler
  toolbar.querySelectorAll(".ms-mode-btn[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      toolbar.querySelectorAll(".ms-mode-btn[data-mode]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const isBook = btn.dataset.mode === "book";

      bookStage.classList.toggle("active", isBook);
      readerArticle.style.display = isBook ? "none" : "";
      readerAside.style.display = isBook ? "none" : "";
      spineTrack.classList.toggle("active", !isBook);
      soundEngine.playPageRustle(0.2);
    });
  });
}

/* --------------------------------------------------------------------------
   7. QUIET MOMENT (`/pause/`) — 12-PETAL SACRED LOTUS PRANA MANDALA CANVAS
   -------------------------------------------------------------------------- */
function initQuietMomentMandala() {
  if (!window.location.pathname.includes("/pause")) return;
  const legacyWidget = document.querySelector('main div[aria-hidden="true"]:not(.prana-stage *)') || document.querySelector('.breath-mandala');
  if (!legacyWidget || document.getElementById("ms-prana-canvas")) return;

  const statusText = document.querySelector('main p[role="status"]:not([data-breath-phase])');

  const wrap = document.createElement("div");
  wrap.id = "ms-prana-mandala-wrap";
  const canvas = document.createElement("canvas");
  canvas.id = "ms-prana-canvas";
  canvas.width = 560;
  canvas.height = 560;
  wrap.appendChild(canvas);
  legacyWidget.replaceWith(wrap);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  let pointerOffset = { x: 0, y: 0 };

  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointerOffset.x = ((e.clientX - r.left) / r.width - 0.5) * 24;
    pointerOffset.y = ((e.clientY - r.top) / r.height - 0.5) * 24;
  }, { passive: true });

  canvas.addEventListener("click", () => {
    soundEngine.playTempleChime(432);
  });

  if (gsap) {
    // 12-Second Prana Cycle: Inhale 4s (0..4) -> Hold 2s (4..6) -> Exhale 6s (6..12)
    gsap.ticker.add((time) => {
      const cycle = time % 12;
      let breathProgress = 0;
      let phaseLabel = "Inhale gently… (4s)";

      if (cycle < 4) {
        breathProgress = gsap.parseEase("sine.inOut")(cycle / 4);
        phaseLabel = `Inhale… ${Math.ceil(4 - cycle)}s`;
      } else if (cycle < 6) {
        breathProgress = 1 + 0.03 * Math.sin((cycle - 4) * Math.PI * 2);
        phaseLabel = `Hold in stillness… ${Math.ceil(6 - cycle)}s`;
      } else {
        breathProgress = 1 - gsap.parseEase("sine.inOut")((cycle - 6) / 6);
        phaseLabel = `Exhale softly… ${Math.ceil(12 - cycle)}s`;
      }

      if (statusText && statusText.textContent !== phaseLabel) {
        statusText.textContent = phaseLabel;
      }

      ctx.clearRect(0, 0, 560, 560);
      const cx = 280 + pointerOffset.x * 0.35;
      const cy = 280 + pointerOffset.y * 0.35;
      const baseRadius = 68 + breathProgress * 105;

      // Outer Prana Ripple Rings
      for (let r = 1; r <= 3; r++) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius + r * 26, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(197, 155, 39, ${(0.28 - r * 0.07) * (0.5 + 0.5 * breathProgress)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 12 Sacred Lotus Petals
      const petals = 12;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + time * 0.12;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
          28 + breathProgress * 22,
          -baseRadius * 0.55,
          0,
          -baseRadius
        );
        ctx.quadraticCurveTo(
          -(28 + breathProgress * 22),
          -baseRadius * 0.55,
          0,
          0
        );

        const grad = ctx.createLinearGradient(0, 0, 0, -baseRadius);
        grad.addColorStop(0, "rgba(200, 75, 49, 0.22)");
        grad.addColorStop(0.65, "rgba(197, 155, 39, 0.34)");
        grad.addColorStop(1, "rgba(246, 211, 101, 0.65)");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = "rgba(197, 155, 39, 0.6)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }

      // Center Golden Bindu & Fleuron
      ctx.beginPath();
      ctx.arc(cx, cy, 24 + breathProgress * 8, 0, Math.PI * 2);
      ctx.fillStyle = "#FAF6EE";
      ctx.fill();
      ctx.strokeStyle = "#C59B27";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#C84B31";
      ctx.font = "24px Georgia, serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❧", cx, cy + 1);
    });
  }
}

/* --------------------------------------------------------------------------
   8. SAVED PAGES (`/my-reading/`) HYDRATION + GSAP FLIP FILTER + TEXT REVEALS
   -------------------------------------------------------------------------- */
function initSavedShelfAndTypography() {
  if (window.location.pathname.includes("/my-reading")) {
    const savedListEl = document.querySelector("main section ul:not([data-kept-list])");
    const savedPages = JSON.parse(safeGet("spritual_saved_pages_v1", "[]"));
    if (savedListEl && savedPages.length > 0) {
      savedListEl.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:28px;list-style:none;padding:0;margin-top:28px;";
      savedListEl.innerHTML = savedPages
        .map(
          (item) => `
          <li>
            <article>
              <a href="${item.href}">
                <div><img src="${item.img}" alt="${item.sceneTitle}" width="480" height="320" loading="lazy"/></div>
                <div>
                  <small>${item.storyTitle}</small>
                  <h3>${item.sceneTitle}</h3>
                  <p>${item.excerpt}…</p>
                  <span>Return to kept page →</span>
                </div>
              </a>
            </article>
          </li>
        `
        )
        .join("");
    }
  }

  // Word-by-Word Blur & Rise Reveal on Main Editorial Headings and Blockquotes
  if (!reducedMotion && gsap && ScrollTrigger) {
    document.querySelectorAll("main h1:not(.reader-story-title), main h2, main blockquote").forEach((heading) => {
      if (heading.dataset.wordSplit === "true" || heading.closest('[data-folio], .book-leaves, .folio, .reader-stage, dialog, .fluid-sheet, .edition-note, nav, header, article')) return;
      heading.dataset.wordSplit = "true";

      const words = heading.textContent.trim().split(/\s+/);
      heading.innerHTML = words
        .map((w) => `<span class="ms-word-reveal">${w}</span>`)
        .join(" ");

      gsap.fromTo(
        heading.querySelectorAll(".ms-word-reveal"),
        { opacity: 0, y: 16, filter: "blur(7px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
          stagger: 0.032,
          ease: "power3.out",
          scrollTrigger: {
            trigger: heading,
            start: "top 90%",
            once: true
          }
        }
      );
    });
  }

  // GSAP Flip Animation on Story Filter Buttons (`/#stories`)
  const filterSection = document.querySelector('section[aria-label="Filter stories"]') || document.querySelector('#stories');
  if (filterSection && Flip) {
    filterSection.addEventListener("click", (e) => {
      const btn = e.target.closest("button, summary, [role='button']");
      if (!btn) return;
      soundEngine.playPageRustle(0.12);
      const cards = document.querySelectorAll("main section article");
      const state = Flip.getState(cards);
      requestAnimationFrame(() => {
        Flip.from(state, {
          duration: 0.65,
          ease: "expo.out",
          stagger: 0.03,
          scale: true
        });
      });
    });
  }
}

/* --------------------------------------------------------------------------
   BOOT ALL MANUSCRIPT ENGINES
   -------------------------------------------------------------------------- */
export function bootLivingManuscript() {
  injectGlobalSVGFiltersAndPortal();
  initSunlightAndDustShader();
  initLenisAndHeader();
  initSavedShelfAndTypography();
  init3DManuscriptTomes();
  initStoryReaderEngine();
  initQuietMomentMandala();
}

if (typeof document !== 'undefined') {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootLivingManuscript);
  } else {
    bootLivingManuscript();
  }
}
