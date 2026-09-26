# Spritual — implemented motion overhaul

> Historical 25 September delivery snapshot. The 26 September calm-experience brief supersedes these member visual/motion choices. The tilt portals, pulsing aura, mesh background and crossfade reader are no longer mounted in the current `/alpha` member journey; see `BUILD_STATUS.md` and `VERIFICATION.md` for the current implementation. Retained source below is provenance, not current UI instruction.

Delivered locally on 25 September 2026. Open http://127.0.0.1:5173/alpha/today with the existing dev server, or run `npm run dev` from `/Users/abhijay/Desktop/spritual/app`. This document contains the complete changed UI source, not pseudocode. The working repository remains authoritative; this is a delivery snapshot of this pass, not a replacement application scaffold.

## Implemented behavior

- Three intention portals: mouse-following 3D tilt, spring focus/hover glow, staggered viewport entrances, keyboard focus and touch press feedback. Touch does not need hover to reveal information.
- Artwork-led hero: spring entrance, slow repeating spring aura when visible, press scale and optional native light haptics. Reading navigation retains actual resume state.
- Gita reel: native touch scrolling with snap points, mouse dragging with accidental-click suppression, spring arrow/dot controls, Home/End/arrow-key navigation, live position and disabled end controls. Programmatic springs temporarily suspend CSS snap to avoid two competing scroll systems.
- Reader: both languages share one layout cell, reserving the taller translation’s height; active language crossfades with a spring and inactive copy is aria-hidden. Original Sanskrit remains clearly distinct from the unreviewed interpretation.
- Layered teal/amber/violet mesh, glass navigation/reader chrome and depth. Decorative ambience uses slow periodic CSS transforms; interactive movements use spring mass/stiffness/damping. Reduced motion removes travel and ambient animation, rather than merely slowing it down.
- Existing content, teacher gates, state, local privacy labels and navigation remain functional. No new content approvals, service integration or pricing claims.

## Dependencies and tradeoffs

Pinned `motion@13.4.4` and `@capacitor/haptics@8.0.2` in the web workspace. The Android/iOS native allowlist now includes Haptics alongside App and Share; the native guard still requires an exact plugin set. Haptics is dynamically imported only on native and is skipped with reduced motion.

The alpha route chunk is now about 230 KB raw / 76 KB gzip, approximately 53 KB gzip larger than before this pass. This buys one coherent spring system rather than multiple animation packages. No 60 fps, battery, or physical-device performance claim is made. Blur layers and motion need profiling on representative lower-end Android hardware before production.

Official references used: [Motion springs](https://motion.dev/docs/react-use-spring), [reduced motion](https://motion.dev/docs/react-use-reduced-motion), [installation](https://motion.dev/docs/react-installation), [Capacitor haptics](https://capacitorjs.com/docs/apis/haptics).

## Verification actually completed

- `npm run typecheck`: passed, including after source formatting.
- `npm test`: 88 existing tests passed; no new visual-specific automated test suite claimed.
- `npm run build`: passed.
- `npm run mobile:apk`: passed after explicitly adding the new Haptics plugin to the native guard. 41 bundled files byte-matched on Android and iOS; Android debug compilation succeeded. Output: `artifacts/Spritual-0.1.0-debug.apk`. iOS remains synchronized source, not a compiled app.
- Browser: Today, Explore and meaning-reader layouts at 320/390/768/1440 CSS pixels, no horizontal document overflow. Visually inspected 390px hero, intention portals, reel and reader, plus desktop hero and compact Hindi with larger text.
- Carousel: arrow buttons, all three positions, boundary disabling, Home/End keys, real link into 6.26; mouse drag returned from third to second without accidental navigation. Physical-device touch gestures are not verified.
- Focused Balance portal reached glow opacity 1 with visible keyboard outline. New carousel controls measure at least 44px in both dimensions.
- At 390px on Gita 2.47 meaning, settled English and Hindi scene heights both measured 699px and footer y=773px; heading heights both 44.27px. No scene-height jump observed.
- App reduced motion: all three mesh animation names `none`, portal transforms `none`, aura opacity .2/transform `none`; third carousel position applied immediately and snap restored. At 320px with Hindi/larger text there was no document overflow.
- Inspected browser error log returned no errors. Original English, standard text, motion preference and Asha fixture identity restored; no reading/completion/action records were added by this pass.

Screenshots: `artifacts/qa/motion-hero-390.png`, `motion-portals-390.png`, `motion-carousel-390.png`, `motion-reader-390.png`.

## Remaining boundaries

This is still the local alpha with three source-linked Gita samples and explanations awaiting human review. Production authentication, payments, licensed human narration, backend access hardening and real-user validation are outside this motion pass. No deployment occurred. Native haptics is wired and compiled but not hardware-verified. Screen-reader usability, OS-level reduced-motion emulation, native UI, frame-rate and battery tests remain outstanding.

`npm audit` reports 8 advisories (7 moderate, 1 high) involving existing Capacitor CLI/xcode/uuid, Vite/esbuild/PWA and React Router packages. These are not caused by a known advisory in the new Motion/Haptics dependencies. Broad major-version audit fixes were not applied during this UI pass; security review is still required before production.

## Complete changed code

The following files are the exact implemented sources. Existing application data, context and storage modules remain in the repository and are imported normally. No placeholders or disconnected mock components are introduced.

### web/src/alpha/MotionSystem.tsx

```tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { useAlpha } from "./context";
import { isNativeApp } from "../lib/platform";
import type { Language, Localized } from "../data/lessons";
import "./motion-experience.css";

export const tactileSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 25,
  mass: 0.85,
};
export const glideSpring = {
  type: "spring" as const,
  stiffness: 150,
  damping: 28,
  mass: 1.1,
};
const MotionContext = createContext({ reduced: true, active: true });
export function MotionSystem({ children }: { children: ReactNode }) {
  const { prefs } = useAlpha();
  const systemReduced = useReducedMotion();
  const [active, setActive] = useState(!document.hidden);
  useEffect(() => {
    const change = () => setActive(!document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  const reduced = prefs.reduced || Boolean(systemReduced);
  return (
    <MotionContext.Provider value={{ reduced, active }}>
      <MotionConfig
        reducedMotion={reduced ? "always" : "user"}
        transition={tactileSpring}
      >
        {children}
      </MotionConfig>
    </MotionContext.Provider>
  );
}
export const useMotionSettings = () => useContext(MotionContext);
export async function touchFeedback(reduced: boolean) {
  if (reduced || !isNativeApp) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Haptics is optional: unsupported hardware never blocks the reading link.
  }
}
export function LivingEnvironment() {
  const { reduced, active } = useMotionSettings();
  return (
    <div
      className="living-environment"
      aria-hidden="true"
      data-still={reduced || !active}
    >
      <div className="living-mesh living-mesh-amber" />
      <div className="living-mesh living-mesh-teal" />
      <div className="living-mesh living-mesh-violet" />
      <div className="living-grain" />
    </div>
  );
}
/** Both translations share a grid cell; the taller one reserves height without duplicate accessible text. */
export function BilingualText({
  text,
  language,
}: {
  text: Localized;
  language: Language;
}) {
  const { reduced } = useMotionSettings();
  return (
    <span className="bilingual-crossfade">
      {(["en", "hi"] as const).map((lang) => (
        <motion.span
          key={lang}
          lang={lang}
          aria-hidden={language !== lang}
          initial={false}
          animate={{
            opacity: language === lang ? 1 : 0,
            y: reduced ? 0 : language === lang ? 0 : 5,
          }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: "spring", stiffness: 190, damping: 27, mass: 0.65 }
          }
          style={{ pointerEvents: language === lang ? "auto" : "none" }}
        >
          {text[lang]}
        </motion.span>
      ))}
    </span>
  );
}
```

### web/src/alpha/ImmersiveModules.tsx

```tsx
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Link } from "react-router-dom";
import { animate, motion, useInView, useSpring } from "motion/react";
import { Icon } from "../components/Icon";
import { lessons, type Language, type Lesson } from "../data/lessons";
import { readingHref, type WisdomState } from "./wisdomState";
import {
  BilingualText,
  glideSpring,
  tactileSpring,
  touchFeedback,
  useMotionSettings,
} from "./MotionSystem";

const MotionLink = motion.create(Link);
const chariot = "/art/gita-chariot-cover-v1.webp";
const river = "/art/river-sanctuary-v1.webp";
const themes = [
  {
    en: "Purpose",
    hi: "कर्म",
    note: {
      en: "Give your effort a direction.",
      hi: "अपने प्रयास को दिशा दें।",
    },
    color: "#edb967",
    icon: "sun" as const,
  },
  {
    en: "Balance",
    hi: "संतुलन",
    note: {
      en: "Find stillness within change.",
      hi: "बदलाव के बीच ठहराव पाएँ।",
    },
    color: "#a6d2c6",
    icon: "leaf" as const,
  },
  {
    en: "Attention",
    hi: "ध्यान",
    note: { en: "Return to this one moment.", hi: "इसी एक पल में फिर लौटें।" },
    color: "#c4b4ec",
    icon: "heart" as const,
  },
];
export function ImmersiveHero({
  lesson,
  language,
  href,
  resuming,
  allRead,
}: {
  lesson: Lesson;
  language: Language;
  href: string;
  resuming: boolean;
  allRead: boolean;
}) {
  const { reduced, active } = useMotionSettings();
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { amount: 0.2 });
  const t = (en: string, hi: string) => (language === "hi" ? hi : en);
  return (
    <motion.section
      ref={ref}
      className="sanctuary-hero"
      initial={reduced ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={glideSpring}
      aria-labelledby="sanctuary-heading"
    >
      <img
        className="sanctuary-hero-image"
        src={chariot}
        width="941"
        height="1672"
        alt=""
      />
      <div className="sanctuary-shade" />
      <div className="sanctuary-orbit" aria-hidden="true" />
      <div className="sanctuary-top">
        <span>{t("BHAGAVAD GITA", "भगवद्गीता")}</span>
        <span className="sanctuary-glass-tag">
          <Icon name="book" size={15} />
          {lesson.reference.replace("Bhagavad Gita ", "")}
        </span>
      </div>
      <div className="sanctuary-copy">
        <span className="sanctuary-kicker">
          {resuming
            ? t("YOUR JOURNEY CONTINUES", "आपकी यात्रा जारी है")
            : allRead
              ? t("A FAMILIAR VERSE. A NEW DAY.", "परिचित श्लोक। नया दिन।")
              : t(
                  "ONE VERSE. A DIFFERENT PERSPECTIVE.",
                  "एक श्लोक। एक नया नज़रिया।",
                )}
        </span>
        <h2 id="sanctuary-heading">
          <BilingualText text={lesson.title} language={language} />
        </h2>
        <p>
          {t(
            "A moment to read. A thought to carry.",
            "एक पल पढ़ने का। एक विचार साथ रखने का।",
          )}
        </p>
        <MotionLink
          className="sanctuary-action"
          to={href}
          whileTap={reduced ? undefined : { scale: 0.95 }}
          whileHover={reduced ? undefined : { y: -2 }}
          transition={tactileSpring}
          onClick={() => void touchFeedback(reduced)}
        >
          <motion.span
            className="sanctuary-aura"
            aria-hidden="true"
            initial={false}
            animate={{
              scale: !reduced && active && visible ? 1.16 : 1,
              opacity: !reduced && active && visible ? 0.55 : 0.2,
            }}
            transition={
              !reduced && active && visible
                ? {
                    type: "spring",
                    stiffness: 9,
                    damping: 8,
                    mass: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    repeatDelay: 1,
                  }
                : { duration: 0 }
            }
          />
          <span className="sanctuary-action-icon">
            <Icon name="arrow" size={22} />
          </span>
          <span>
            {resuming
              ? t("Continue my reading", "पढ़ना जारी रखें")
              : allRead
                ? t("Read with fresh eyes", "नई नज़र से पढ़ें")
                : t("Begin this reading", "यह पाठ शुरू करें")}
          </span>
          <span className="sanctuary-action-meta">
            {t("4 moments", "4 चरण")}
          </span>
        </MotionLink>
      </div>
      <div className="sanctuary-bottom">
        <span>{t("READ", "पढ़ें")}</span>
        <i />
        <span>{t("UNDERSTAND", "समझें")}</span>
        <i />
        <span>{t("LIVE IT", "अपनाएँ")}</span>
      </div>
    </motion.section>
  );
}
function IntentionCard({
  lesson,
  index,
  order,
  language,
  state,
}: {
  lesson: Lesson;
  index: number;
  order: number;
  language: Language;
  state: WisdomState;
}) {
  const { reduced } = useMotionSettings();
  const tiltX = useSpring(0, tactileSpring),
    tiltY = useSpring(0, tactileSpring);
  const theme = themes[index];
  const reset = () => {
    tiltX.set(0);
    tiltY.set(0);
  };
  useEffect(() => {
    if (reduced) {
      tiltX.jump(0);
      tiltY.jump(0);
    }
  }, [reduced, tiltX, tiltY]);
  const follow = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const r = event.currentTarget.getBoundingClientRect();
    tiltX.set(-((event.clientY - r.top) / r.height - 0.5) * 7);
    tiltY.set(((event.clientX - r.left) / r.width - 0.5) * 9);
  };
  return (
    <motion.div
      className="intention-perspective"
      initial={reduced ? false : { opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ ...tactileSpring, delay: reduced ? 0 : order * 0.085 }}
    >
      <MotionLink
        to={readingHref(lesson.id, state.resume)}
        className={`intention-portal intention-portal-${index}`}
        style={
          {
            rotateX: tiltX,
            rotateY: tiltY,
            "--portal-accent": theme.color,
          } as CSSProperties
        }
        onPointerMove={follow}
        onPointerLeave={reset}
        onBlur={reset}
        initial="rest"
        animate="rest"
        whileHover="lit"
        whileFocus="lit"
        whileTap={reduced ? undefined : { scale: 0.97 }}
      >
        <motion.span
          className="portal-light"
          aria-hidden="true"
          variants={{ rest: { opacity: 0 }, lit: { opacity: 1 } }}
          transition={reduced ? { duration: 0 } : tactileSpring}
        />
        <span className="portal-top">
          <span className="portal-symbol">
            <Icon name={theme.icon} size={25} />
          </span>
          <span className="portal-number">0{index + 1}</span>
        </span>
        <span className="portal-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="portal-label">
          {language === "hi" ? theme.hi : theme.en}
        </span>
        <strong>
          <BilingualText text={theme.note} language={language} />
        </strong>
        <span className="portal-foot">
          <span>
            {lesson.reference.replace(
              "Bhagavad Gita",
              language === "hi" ? "गीता" : "Gita",
            )}
          </span>
          <Icon
            name={state.finished?.[lesson.id] ? "check" : "arrow"}
            size={20}
          />
        </span>
      </MotionLink>
    </motion.div>
  );
}
export function IntentionPortals({
  items,
  language,
  state,
  explore,
}: {
  items: Lesson[];
  language: Language;
  state: WisdomState;
  explore: boolean;
}) {
  const t = (en: string, hi: string) => (language === "hi" ? hi : en);
  return (
    <section className="intention-section" aria-labelledby="intention-heading">
      <div className="motion-section-heading">
        <div>
          <span className="sanctuary-kicker">
            {t("BEGIN WITH WHAT YOU FEEL", "शुरू करें, जो मन में है")}
          </span>
          <h2 id="intention-heading">
            {explore
              ? t("The reading room", "पाठशाला")
              : t("What brings you here?", "मन में क्या चल रहा है?")}
          </h2>
        </div>
        {!explore && (
          <Link
            to="/alpha/library"
            aria-label={t("Explore all readings", "सभी पाठ खोजें")}
          >
            <Icon name="arrow" />
          </Link>
        )}
      </div>
      <div className="intention-portals">
        {items.map((lesson, order) => (
          <IntentionCard
            key={lesson.id}
            lesson={lesson}
            order={order}
            index={lessons.indexOf(lesson)}
            language={language}
            state={state}
          />
        ))}
      </div>
    </section>
  );
}
export function GitaReel({
  language,
  state,
}: {
  language: Language;
  state: WisdomState;
}) {
  const { reduced } = useMotionSettings();
  const rail = useRef<HTMLDivElement>(null);
  const animation = useRef<ReturnType<typeof animate> | null>(null);
  const gesture = useRef<{
    x: number;
    left: number;
    dragged: boolean;
    pointer: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const [active, setActive] = useState(0);
  const t = (en: string, hi: string) => (language === "hi" ? hi : en);
  useEffect(() => () => animation.current?.stop(), []);
  useEffect(() => {
    if (reduced) {
      animation.current?.stop();
      if (rail.current) rail.current.style.scrollSnapType = "";
    }
  }, [reduced]);
  const scrollTo = (index: number) => {
    const el = rail.current;
    if (!el) return;
    const target = el.children[Math.max(0, Math.min(2, index))] as HTMLElement;
    const left = Math.min(target.offsetLeft, el.scrollWidth - el.clientWidth);
    animation.current?.stop();
    el.style.scrollSnapType = "none";
    if (reduced) {
      el.scrollLeft = left;
      el.style.scrollSnapType = "";
      return;
    }
    animation.current = animate(el.scrollLeft, left, {
      ...glideSpring,
      onUpdate: (value) => {
        el.scrollLeft = value;
      },
      onComplete: () => {
        el.style.scrollSnapType = "";
      },
    });
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    animation.current?.stop();
    e.currentTarget.style.scrollSnapType = "";
    suppressClick.current = false;
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    gesture.current = {
      x: e.clientX,
      left: e.currentTarget.scrollLeft,
      dragged: false,
      pointer: e.pointerId,
    };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g) return;
    const delta = e.clientX - g.x;
    if (Math.abs(delta) > 7 && !g.dragged) {
      g.dragged = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (g.dragged) {
      e.preventDefault();
      e.currentTarget.style.scrollSnapType = "none";
      e.currentTarget.scrollLeft = g.left - delta;
      suppressClick.current = true;
    }
  };
  const release = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    gesture.current = null;
    if (g?.dragged) {
      if (e.currentTarget.hasPointerCapture(g.pointer))
        e.currentTarget.releasePointerCapture(g.pointer);
      scrollTo(active);
    }
  };
  return (
    <section className="gita-reel" aria-labelledby="gita-reel-heading">
      <div className="motion-section-heading">
        <div>
          <span className="sanctuary-kicker">
            {t("A JOURNEY, NOT A CHECKLIST", "एक यात्रा, कोई सूची नहीं")}
          </span>
          <h2 id="gita-reel-heading">
            {t("The Gita. Closer to life.", "गीता। जीवन के और पास।")}
          </h2>
        </div>
        <Link to="/alpha/series/gita" className="reel-all">
          {t("View journey", "यात्रा देखें")}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
      <div
        ref={rail}
        className="gita-reel-track"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={t(
          "Gita readings; swipe or use arrow keys",
          "गीता के पाठ; स्वाइप या तीर कुंजियाँ इस्तेमाल करें",
        )}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={(e) => {
          gesture.current = null;
          suppressClick.current = false;
          e.currentTarget.style.scrollSnapType = "";
        }}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault();
            e.stopPropagation();
            suppressClick.current = false;
          }
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            scrollTo(active + (e.key === "ArrowRight" ? 1 : -1));
          }
          if (e.key === "Home" || e.key === "End") {
            e.preventDefault();
            scrollTo(e.key === "Home" ? 0 : 2);
          }
        }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const children = Array.from(el.children) as HTMLElement[];
          const nearest = children.reduce(
            (best, child, i) =>
              Math.abs(child.offsetLeft - el.scrollLeft) <
              Math.abs(children[best].offsetLeft - el.scrollLeft)
                ? i
                : best,
            0,
          );
          setActive(
            el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 ? 2 : nearest,
          );
        }}
      >
        {lessons.map((lesson, i) => (
          <Link
            className={`reel-chapter reel-chapter-${i}`}
            key={lesson.id}
            to={readingHref(lesson.id, state.resume)}
            aria-label={`${i + 1}/3 · ${lesson.title[language]}`}
          >
            <img
              src={i === 0 ? chariot : river}
              alt=""
              loading="lazy"
              draggable={false}
            />
            <span className="reel-chapter-shade" />
            <span className="reel-chapter-top">
              <span>0{i + 1} / 03</span>
              <span>
                {state.finished?.[lesson.id]
                  ? t("READ", "पढ़ा")
                  : t("GUIDED READING", "साथ पढ़ें")}
              </span>
            </span>
            <span className="reel-chapter-copy">
              <small>
                {lesson.reference.replace("Bhagavad Gita", t("Gita", "गीता"))}
              </small>
              <strong>{lesson.title[language]}</strong>
              <span>{lesson.subtitle[language]}</span>
              <span className="reel-open">
                <Icon name="arrow" />
              </span>
            </span>
          </Link>
        ))}
      </div>
      <div className="reel-controls">
        <span className="reel-count" aria-live="polite">
          {String(active + 1).padStart(2, "0")} <span>/ 03</span>
        </span>
        <div className="reel-dots">
          {lessons.map((lesson, i) => (
            <button
              key={lesson.id}
              aria-label={t(`Show reading ${i + 1}`, `पाठ ${i + 1} दिखाएँ`)}
              aria-pressed={active === i}
              onClick={() => scrollTo(i)}
            >
              <span />
            </button>
          ))}
        </div>
        <div className="reel-arrows">
          <motion.button
            whileTap={reduced ? undefined : { scale: 0.9 }}
            aria-label={t("Previous reading", "पिछला पाठ")}
            disabled={active === 0}
            onClick={() => scrollTo(active - 1)}
          >
            <Icon name="back" size={19} />
          </motion.button>
          <motion.button
            whileTap={reduced ? undefined : { scale: 0.9 }}
            aria-label={t("Next reading", "अगला पाठ")}
            disabled={active === 2}
            onClick={() => scrollTo(active + 1)}
          >
            <Icon name="arrow" size={19} />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
```

### web/src/alpha/motion-experience.css

```css
/* Complete styles for the rebuilt motion components. Legacy component CSS stays untouched. */
.alpha.motion-world {
  background: #101917;
  isolation: isolate;
  position: relative;
}
.motion-world > .alpha-header,
.motion-world > .alpha-main,
.motion-world > .alpha-footer,
.motion-world > .alpha-demo-banner {
  position: relative;
  z-index: 1;
}
.motion-world .alpha-nav {
  z-index: 30;
  background: linear-gradient(140deg, #23302dd9, #2c241fdc) !important;
  backdrop-filter: blur(26px) saturate(140%);
  border-color: #d4bc8138 !important;
  box-shadow: 0 -8px 36px #0003 !important;
}
.living-environment {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  background: radial-gradient(
    ellipse at 45% 0%,
    #263b32 0%,
    #101b1a 46%,
    #161616 100%
  );
}
.living-mesh {
  position: absolute;
  width: 85vmax;
  height: 80vmax;
  border-radius: 48%;
  filter: blur(70px);
  opacity: 0.35;
  will-change: transform;
  animation: mesh-breathe 28s ease-in-out infinite alternate;
}
.living-mesh-amber {
  left: -45vmax;
  top: -28vmax;
  background: radial-gradient(ellipse, #a879344d, transparent 65%);
}
.living-mesh-teal {
  right: -44vmax;
  top: 5vh;
  background: radial-gradient(ellipse, #3f917a75, transparent 65%);
  animation-delay: -13s;
  animation-duration: 34s;
}
.living-mesh-violet {
  left: 5vw;
  bottom: -65vmax;
  background: radial-gradient(ellipse, #83618b65, transparent 60%);
  animation-delay: -7s;
  animation-duration: 39s;
}
.living-grain {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#fff7e81c 0.5px, transparent 0.5px);
  background-size: 5px 5px;
  opacity: 0.15;
}
.living-environment[data-still="true"] .living-mesh {
  animation-play-state: paused;
  will-change: auto;
}
@keyframes mesh-breathe {
  from {
    transform: translate3d(-4%, 0, 0) scale(0.94) rotate(-8deg);
  }
  to {
    transform: translate3d(7%, 6%, 0) scale(1.13) rotate(11deg);
  }
}
.bilingual-crossfade {
  display: grid;
  position: relative;
}
.bilingual-crossfade > span {
  grid-area: 1/1;
  align-self: start;
}
.bilingual-crossfade > span[aria-hidden="true"] {
  user-select: none;
}
.sanctuary-hero {
  position: relative;
  isolation: isolate;
  min-height: 590px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 32px;
  border: 1px solid #d9c09955;
  background: #20352d;
  box-shadow:
    0 35px 70px #030c0a65,
    inset 0 1px 0 #fff4d63b;
}
.sanctuary-hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 57%;
  z-index: -3;
}
.sanctuary-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(0deg, #0d1917fa 0%, #12231cc9 31%, #14251b08 75%),
    linear-gradient(90deg, #14231c6b, #0000);
  z-index: -2;
}
.sanctuary-orbit {
  position: absolute;
  width: 400px;
  height: 400px;
  border: 1px solid #fff2cf26;
  border-radius: 50%;
  right: -125px;
  top: -175px;
  z-index: -1;
  box-shadow:
    0 0 0 42px #fff2cf08,
    0 0 0 84px #fff2cf06;
}
.sanctuary-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 28px 32px;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: #fff3d7;
  font-weight: 600;
}
.sanctuary-glass-tag {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  padding: 9px 13px;
  background: #102b2561;
  border: 1px solid #ffeac435;
  border-radius: 50px;
  backdrop-filter: blur(16px);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.sanctuary-copy {
  margin-top: auto;
  padding: 115px 38px 25px;
  max-width: 680px;
}
.sanctuary-kicker {
  display: block;
  font-size: 10px;
  letter-spacing: 0.17em;
  font-weight: 650;
  line-height: 1.7;
  color: #dfbb82;
}
.alpha .sanctuary-copy h2 {
  font-size: clamp(39px, 5.8vw, 68px);
  font-weight: 450;
  line-height: 1.09;
  letter-spacing: -0.04em;
  margin: 13px 0 !important;
  color: #fff0d6;
  text-wrap: balance;
}
.sanctuary-copy > p {
  color: #ddd4be;
  font-size: 15px;
  line-height: 1.6;
}
.sanctuary-action {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 66px;
  padding: 10px 19px 10px 10px;
  margin-top: 26px;
  border: 1px solid #fff0c075;
  background: linear-gradient(115deg, #f2d499, #e7ad56);
  color: #282314 !important;
  border-radius: 50px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 8px 28px #080e0b44;
  max-width: 405px;
}
.sanctuary-aura {
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: #e9bd75;
  filter: blur(20px);
  pointer-events: none;
}
.sanctuary-action-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: none;
  background: #31403218;
  border: 1px solid #715b252f;
  border-radius: 50%;
}
.sanctuary-action-meta {
  font-size: 10px;
  font-weight: 500;
  margin-left: auto;
  border-left: 1px solid #5c46284f;
  padding-left: 12px;
  white-space: nowrap;
}
.sanctuary-bottom {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 22px 28px;
  border-top: 1px solid #dfd2b524;
  background: #0b221f38;
  color: #d7cbb1;
  font-size: 9px;
  letter-spacing: 0.2em;
  backdrop-filter: blur(8px);
}
.sanctuary-bottom i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #d7bb83;
}
.motion-section-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 18px;
  margin-bottom: 22px;
}
.alpha .motion-section-heading h2 {
  font-size: clamp(29px, 4vw, 43px);
  line-height: 1.2;
  color: #f0e6d4;
  margin-top: 8px !important;
  font-weight: 450;
  letter-spacing: -0.035em;
}
.motion-section-heading > a {
  min-height: 46px;
  min-width: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ebc991;
  text-decoration: none;
  gap: 8px;
  flex: none;
}
.intention-section {
  margin-top: 18px;
}
.intention-portals {
  display: flex;
  align-items: stretch;
  gap: 18px;
}
.intention-perspective {
  flex: 1;
  perspective: 1000px;
  min-width: 0;
  display: flex;
}
.intention-portal {
  position: relative;
  isolation: isolate;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 24px;
  min-height: 335px;
  border-radius: 95px 95px 24px 24px;
  background: linear-gradient(150deg, #4a493a45, #192b258c);
  border: 1px solid #d5c19539;
  text-decoration: none;
  box-shadow:
    0 20px 40px #0002,
    inset 0 1px 0 #fff2ca21;
  backdrop-filter: blur(18px);
  outline-offset: 5px !important;
}
.intention-portal-1 {
  background: linear-gradient(160deg, #38726955, #153029b0);
}
.intention-portal-2 {
  background: linear-gradient(150deg, #69577755, #272332b0);
}
.portal-light {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(
    ellipse at 50% 0%,
    color-mix(in srgb, var(--portal-accent) 26%, transparent),
    transparent 70%
  );
  box-shadow:
    inset 0 0 0 1px var(--portal-accent),
    inset 0 0 25px color-mix(in srgb, var(--portal-accent) 15%, transparent);
}
.intention-portal:focus-visible {
  outline: 2px solid var(--portal-accent);
}
.portal-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 6px 0;
  color: var(--portal-accent);
}
.portal-symbol {
  height: 47px;
  width: 47px;
  border: 1px solid color-mix(in srgb, var(--portal-accent) 35%, transparent);
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #ffffff06;
}
.portal-number {
  font:
    400 13px/1 Georgia,
    serif;
  color: #dacdb36f;
}
.portal-art {
  position: relative;
  height: 66px;
  margin: 8px 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.portal-art i {
  display: block;
  position: absolute;
  width: 64px;
  height: 64px;
  border: 1px solid color-mix(in srgb, var(--portal-accent) 55%, transparent);
  border-radius: 50%;
  box-shadow: 0 0 26px color-mix(in srgb, var(--portal-accent) 8%, transparent);
}
.portal-art i:nth-child(2) {
  width: 89px;
  height: 89px;
  opacity: 0.45;
}
.portal-art i:nth-child(3) {
  width: 113px;
  height: 113px;
  opacity: 0.15;
}
.intention-portal-1 .portal-art i {
  border-radius: 50% 50% 8px 8px;
  transform: scaleY(0.6);
}
.intention-portal-2 .portal-art i {
  width: 57px;
  height: 57px;
  transform: rotate(45deg);
  border-radius: 10px;
}
.intention-portal-2 .portal-art i:nth-child(2) {
  transform: rotate(75deg);
  opacity: 0.4;
}
.intention-portal-2 .portal-art i:nth-child(3) {
  transform: rotate(105deg);
  opacity: 0.2;
}
.portal-label {
  font-size: 11px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--portal-accent);
  margin: 12px 0;
}
.intention-portal strong {
  font:
    450 26px/1.22 Fraunces,
    Georgia,
    serif;
  color: #f4ead6;
  letter-spacing: -0.025em;
}
.portal-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 23px;
  font-size: 11px;
  color: #ccbfa6;
}
.portal-foot svg {
  color: var(--portal-accent);
}
.gita-reel {
  margin-top: 20px;
}
.reel-all {
  font-size: 12px;
}
.gita-reel-track {
  display: flex;
  gap: 18px;
  position: relative;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  border-radius: 25px;
  touch-action: pan-x pan-y;
  cursor: grab;
  padding-bottom: 2px;
}
.gita-reel-track::-webkit-scrollbar {
  display: none;
}
.gita-reel-track:active {
  cursor: grabbing;
}
.reel-chapter {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  flex: 0 0 75%;
  min-height: 355px;
  scroll-snap-align: start;
  border-radius: 25px;
  overflow: hidden;
  background: #23372f;
  border: 1px solid #e6d6af36;
  text-decoration: none;
  user-select: none;
}
.reel-chapter img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 61%;
  z-index: -3;
}
.reel-chapter-1 img {
  object-position: 28% center;
  filter: saturate(0.65);
}
.reel-chapter-2 img {
  object-position: 80% center;
  filter: hue-rotate(24deg) saturate(0.5);
}
.reel-chapter-shade {
  position: absolute;
  inset: 0;
  background: linear-gradient(0deg, #12211de8, #1527226b 50%, #10271c30);
  z-index: -2;
}
.reel-chapter-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 23px;
  color: #f8e6bf;
  font-size: 9px;
  letter-spacing: 0.13em;
}
.reel-chapter-top > span:last-child {
  background: #0c261f6b;
  border: 1px solid #f8e6bf35;
  border-radius: 30px;
  padding: 7px 10px;
  backdrop-filter: blur(10px);
}
.reel-chapter-copy {
  display: grid;
  gap: 10px;
  max-width: 530px;
  margin-top: auto;
  padding: 25px;
}
.reel-chapter-copy small {
  font-size: 11px;
  color: #ecc38a;
}
.reel-chapter-copy strong {
  font:
    450 clamp(30px, 4vw, 46px) / 1.1 Fraunces,
    Georgia,
    serif;
  color: #fff0d4;
  letter-spacing: -0.035em;
}
.reel-chapter-copy > span:not(.reel-open) {
  font-size: 14px;
  line-height: 1.5;
  color: #ddd2bb;
  max-width: 38ch;
}
.reel-open {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  margin-top: 5px;
  background: #ebd5a824;
  border: 1px solid #efdab361;
  color: #f6ddb0;
  backdrop-filter: blur(12px);
}
.reel-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 14px;
}
.reel-count {
  font:
    450 23px/1 Fraunces,
    Georgia,
    serif;
  color: #e9c997;
}
.reel-count span {
  font: 400 12px/1 sans-serif;
  color: #baad96;
}
.reel-dots {
  display: flex;
  gap: 1px;
  margin-right: auto;
}
.reel-dots button {
  min-width: 44px;
  min-height: 44px;
  border: 0;
  background: none;
  display: grid;
  place-items: center;
}
.reel-dots span {
  display: block;
  height: 3px;
  width: 16px;
  border-radius: 5px;
  background: #8b887160;
  transition: background 0.2s;
}
.reel-dots button[aria-pressed="true"] span {
  background: #e8c38a;
}
.reel-arrows {
  display: flex;
  gap: 9px;
}
.reel-arrows button {
  display: grid;
  place-items: center;
  min-width: 46px;
  min-height: 46px;
  border: 1px solid #dcc7a044;
  border-radius: 50%;
  background: #bcae8112;
  backdrop-filter: blur(15px);
  color: #ead5b0;
}
.reel-arrows button:disabled {
  opacity: 0.3;
}
.motion-world .experience {
  gap: 30px;
}
.motion-world .experience-greeting h1 {
  font-weight: 450;
  color: #eee7d6;
}
.motion-world .experience-greeting {
  align-items: center;
}
.motion-world .experience-language {
  background: #c7c6a812;
  border-color: #c5bc9759;
  backdrop-filter: blur(16px);
}
.motion-world .experience-resume,
.motion-world .experience-reading-return {
  background: linear-gradient(120deg, #4561584d, #64715817);
  backdrop-filter: blur(18px);
  border-color: #c8bb903a;
}
.motion-world .experience-disclosure {
  color: #b9b6a0;
}
.motion-world .story-player-scene.motion-reading-scene {
  animation: none;
}
.motion-reading-scene .bilingual-crossfade {
  width: 100%;
}
.motion-world .story-player-head {
  background: #14251ed4;
  backdrop-filter: blur(22px);
}
.motion-world .story-player-controls {
  background: #14251eeb;
  backdrop-filter: blur(22px);
}
.motion-world .story-player {
  background: radial-gradient(ellipse at 80% 20%, #253d31, #101c19 70%);
}
@media (min-width: 900px) {
  .sanctuary-hero {
    min-height: 640px;
  }
  .sanctuary-hero-image {
    object-position: center 62%;
  }
  .sanctuary-shade {
    background:
      linear-gradient(90deg, #0c231bb8, transparent 90%),
      linear-gradient(0deg, #0c201cf2, transparent 75%);
  }
  .intention-portals .intention-perspective:nth-child(2) {
    padding-top: 25px;
    padding-bottom: 0;
  }
  .intention-portals .intention-perspective:nth-child(1),
  .intention-portals .intention-perspective:nth-child(3) {
    padding-bottom: 25px;
  }
  .reel-chapter {
    flex-basis: 62%;
    min-height: 390px;
  }
}
@media (max-width: 600px) {
  .sanctuary-hero {
    min-height: 480px;
    border-radius: 26px;
  }
  .sanctuary-top {
    padding: 22px;
    font-size: 9px;
  }
  .sanctuary-copy {
    padding: 80px 23px 22px;
  }
  .alpha .sanctuary-copy h2 {
    font-size: 42px;
  }
  .sanctuary-copy > p {
    font-size: 14px;
  }
  .sanctuary-kicker {
    font-size: 9px;
    letter-spacing: 0.12em;
  }
  .sanctuary-action {
    font-size: 14px;
    padding-right: 15px;
    min-height: 62px;
    gap: 9px;
    margin-top: 22px;
  }
  .sanctuary-action-meta {
    display: none;
  }
  .sanctuary-bottom {
    font-size: 8px;
    gap: 11px;
    padding: 20px 14px;
  }
  .motion-section-heading {
    gap: 10px;
    align-items: center;
  }
  .alpha .motion-section-heading h2 {
    font-size: 30px;
  }
  .motion-section-heading > a.reel-all {
    max-width: 80px;
    font-size: 11px;
    line-height: 1.4;
  }
  .intention-portals {
    gap: 13px;
    flex-wrap: wrap;
  }
  .intention-perspective {
    flex: 1 1 calc(50% - 13px);
  }
  .intention-perspective:last-child:nth-child(odd) {
    flex-basis: 100%;
  }
  .intention-portal {
    min-height: 306px;
    padding: 18px 16px;
    border-radius: 70px 70px 20px 20px;
  }
  .portal-top {
    padding: 7px 1px 0;
  }
  .portal-symbol {
    height: 40px;
    width: 40px;
  }
  .portal-symbol svg {
    width: 21px;
  }
  .portal-art {
    height: 63px;
    margin: 9px 0 7px;
  }
  .portal-art i {
    width: 47px;
    height: 47px;
  }
  .portal-art i:nth-child(2) {
    width: 64px;
    height: 64px;
  }
  .portal-art i:nth-child(3) {
    width: 80px;
    height: 80px;
  }
  .intention-portal strong {
    font-size: 23px;
  }
  .portal-label {
    font-size: 10px;
  }
  .portal-foot {
    padding-top: 17px;
    font-size: 10px;
  }
  .intention-perspective:last-child:nth-child(odd) .intention-portal {
    min-height: 213px;
    border-radius: 24px;
    padding: 22px;
    display: grid;
    grid-template-columns: 1fr 110px;
    column-gap: 12px;
  }
  .intention-perspective:last-child:nth-child(odd) .portal-top {
    grid-column: 2;
    grid-row: 1/5;
    align-self: start;
    justify-content: end;
  }
  .intention-perspective:last-child:nth-child(odd) .portal-number {
    display: none;
  }
  .intention-perspective:last-child:nth-child(odd) .portal-art {
    grid-column: 2;
    grid-row: 2/5;
    align-self: center;
    margin-top: 45px;
  }
  .intention-perspective:last-child:nth-child(odd) .portal-label,
  .intention-perspective:last-child:nth-child(odd) strong,
  .intention-perspective:last-child:nth-child(odd) .portal-foot {
    grid-column: 1;
  }
  .reel-chapter {
    flex-basis: 87%;
    min-height: 345px;
  }
  .reel-chapter-top {
    padding: 18px;
    font-size: 8px;
  }
  .reel-chapter-copy {
    padding: 22px;
    gap: 10px;
  }
  .reel-chapter-copy strong {
    font-size: 33px;
  }
  .reel-chapter-copy > span:not(.reel-open) {
    font-size: 12px;
  }
  .reel-controls {
    gap: 10px;
  }
  .reel-dots button {
    min-width: 44px;
  }
  .reel-arrows {
    gap: 7px;
  }
  .reel-count {
    font-size: 22px;
  }
  .reel-chapter-top > span:last-child {
    padding: 6px 8px;
  }
}
@media (max-width: 350px) {
  .alpha .sanctuary-copy h2 {
    font-size: 36px;
  }
  .sanctuary-copy {
    padding: 80px 19px 23px;
  }
  .sanctuary-hero {
    min-height: 470px;
  }
  .intention-portal {
    padding: 17px 13px;
  }
  .intention-portal strong {
    font-size: 21px;
  }
  .intention-portals {
    gap: 10px;
  }
  .reel-dots button {
    min-width: 44px;
  }
  .reel-controls {
    gap: 4px;
  }
  .reel-count {
    font-size: 18px;
  }
  .reel-count span {
    font-size: 10px;
  }
  .reel-arrows {
    gap: 5px;
  }
  .reel-arrows button {
    min-width: 44px;
    min-height: 44px;
  }
  .reel-chapter-copy strong {
    font-size: 30px;
  }
  .reel-chapter {
    flex-basis: 90%;
  }
  .motion-section-heading > a.reel-all {
    max-width: 65px;
  }
  .intention-perspective:last-child:nth-child(odd) .intention-portal {
    grid-template-columns: 1fr 75px;
  }
}
.motion-world[data-large="true"] .sanctuary-copy > p,
.motion-world[data-large="true"] .reel-chapter-copy > span:not(.reel-open) {
  font-size: 19px;
}
.motion-world[data-large="true"] .intention-portal strong {
  font-size: 28px;
}
.motion-world[data-reduced="true"] .living-mesh {
  animation: none;
  will-change: auto;
}
@media (prefers-reduced-motion: reduce) {
  .living-mesh {
    animation: none;
    will-change: auto;
  }
  .portal-light,
  .reel-dots span {
    transition: none;
  }
}

.motion-world :is(.sanctuary-action, .intention-portal):active {
  scale: 1;
}

.motion-reading-scene :is(.story-meaning-scene, .story-action-scene) {
  background: none;
}
```

### web/src/alpha/AlphaApp.tsx

```tsx
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AlphaProvider, useAlpha } from "./context";
import { actors, createSeed } from "./fixtures";
import { access, visibleContents } from "./domain";
import { Icon } from "../components/Icon";
import Player from "./Player";
import { WisdomWelcome, WisdomLesson, WisdomMyDay } from "./Wisdom";
import "./alpha.css";
import { Experience, ExperienceProfile } from "./Experience";
import "./experience.css";
import { MotionSystem, LivingEnvironment } from "./MotionSystem";
const Teacher = lazy(() => import("./Teacher"));
const GitaJourney = lazy(() => import("./Story").then(module => ({ default: module.GitaJourney })));
const GitaEpisode = lazy(() => import("./Story").then(module => ({ default: module.GitaEpisode })));
const sample = {
  ...createSeed().contents[0],
  id: "public-sound-check",
  source:
    "Permanently public original sound-check fixture, independent of the teacher-controlled demo catalogue. No teacher recording or approval is claimed.",
};
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function AlphaApp() {
  const mode = import.meta.env.VITE_ALPHA_MODE || "demo";
  if (mode !== "demo")
    return (
      <div className="alpha">
        <main className="alpha-main alpha-stack">
          <p className="alpha-kicker">REAL-BACKED DEVELOPMENT</p>
          <h1>Connection required.</h1>
          <p>
            The authenticated alpha is not connected. Local fixture identities
            are disabled in this mode.
          </p>
          <p>
            Required: a configured development Supabase project, applied and
            tested tenant permissions, verified invitation/auth callbacks and
            approved media storage. No demo data is substituted.
          </p>
          <Link to="/today" className="alpha-secondary">
            Open the existing reading demo
          </Link>
        </main>
      </div>
    );
  return (
    <AlphaProvider>
      <MotionSystem><Shell /></MotionSystem>
    </AlphaProvider>
  );
}
function Shell() {
  const { actor, switchActor, prefs, error, notice } = useAlpha();
  const location = useLocation();
  const storyReader = location.pathname.startsWith("/alpha/episode/");
  const wisdomSurface = ["/alpha", "/alpha/today", "/alpha/library", "/alpha/my-day", "/alpha/series/gita", "/alpha/account", "/alpha/settings"].includes(location.pathname) || location.pathname.startsWith("/alpha/wisdom/") || storyReader;
  const [readingLanguage, setReadingLanguage] = useState<"en" | "hi">("en");
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(`spritual_alpha_wisdom_v1_${actor.id}`);
        setReadingLanguage(raw && JSON.parse(raw).language === "hi" ? "hi" : "en");
      } catch { setReadingLanguage("en"); }
    };
    sync();
    window.addEventListener("spritual-alpha-language", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("spritual-alpha-language", sync); window.removeEventListener("storage", sync); };
  }, [actor.id]);
  const label = (en: string, hi: string) => readingLanguage === "hi" ? hi : en;
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    main.current?.focus();
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return (
    <div
      className={`alpha ${!location.pathname.startsWith("/alpha/teacher") ? "motion-world" : ""}`}
      data-large={prefs.large}
      data-reduced={prefs.reduced}
      data-story={storyReader}
      data-cinematic={!location.pathname.startsWith("/alpha/teacher")}
      lang="en"
    >
      {!location.pathname.startsWith("/alpha/teacher") && <LivingEnvironment />}
      <a className="alpha-skip" href="#alpha-main">
        Skip to content
      </a>
      <div className="alpha-demo-banner">
        LOCAL PREVIEW · Sample readings · No payment
      </div>
      <header className="alpha-header">
        <Link to="/alpha" aria-label="Spritual alpha home">
          <span className="brand">
            <span className="brand-mark">
              <Icon name="sun" size={27} />
            </span>
            <span>
              Spritual<span className="brand-tag">A little, every day</span>
            </span>
          </span>
        </Link>
        <Link to="/alpha/account" className="alpha-profile">
          {wisdomSurface ? label("My space", "मेरा स्थान") : actor.name}
          <span aria-hidden="true">↗</span>
        </Link>
      </header>
      {!online && (
        <div className="alpha-offline" role="status">
          You’re offline. Local notes work; only previously downloaded audio is
          available.
        </div>
      )}
      <main ref={main} tabIndex={-1} id="alpha-main" className="alpha-main">
        <div role="alert">
          {error && <p className="alpha-error">{error}</p>}
        </div>
        <div role="status" className="alpha-notice">
          {notice}
        </div>
        <Routes>
          <Route path="/alpha" element={<Navigate to="/alpha/today" replace />} />
          <Route path="/alpha/welcome" element={<WisdomWelcome />} />
          <Route
            path="/alpha/sample"
            element={<Player key="sample" content={sample} sample />}
          />
          <Route path="/alpha/sample-complete" element={<SampleComplete />} />
          <Route path="/alpha/join" element={<Join />} />
          <Route path="/alpha/today" element={<Experience />} />
          <Route path="/alpha/library" element={<Experience explore />} />
          <Route path="/alpha/wisdom/:id" element={<WisdomLesson />} />
          <Route path="/alpha/series/gita" element={<Suspense fallback={<p role="status">Opening the journey…</p>}><GitaJourney /></Suspense>} />
          <Route path="/alpha/episode/:id" element={<Suspense fallback={<p className="story-loading" role="status">Opening the reading…</p>}><GitaEpisode /></Suspense>} />
          <Route path="/alpha/my-day" element={<WisdomMyDay />} />
          <Route path="/alpha/circle" element={<Today />} />
          <Route path="/alpha/program" element={<Program />} />
          <Route
            path="/alpha/practice/:id"
            element={<MemberPlayer key={actor.id} />}
          />
          <Route path="/alpha/complete/:id" element={<Complete />} />
          <Route
            path="/alpha/reflection/:id"
            element={<Reflection key={actor.id + location.pathname} />}
          />
          <Route path="/alpha/account" element={<ExperienceProfile />} />
          <Route path="/alpha/settings" element={<Account />} />
          <Route path="/alpha/institutions" element={<Institution />} />
          <Route
            path="/alpha/teacher"
            element={
              <Suspense fallback={<p>Opening delivery workspace…</p>}>
                <Teacher />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <div className="alpha-stack">
                <h1>Let’s find your place.</h1>
                <p>
                  This page is not available. Your saved notes haven’t changed.
                </p>
                <Link className="alpha-button" to="/alpha/today">
                  Go to today
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="alpha-footer">
        <details>
          <summary>Demo workspace controls</summary>
          <p>
            These are local test identities, not sign-in. Anyone with this
            browser can inspect its demo data. Never enter confidential content.
          </p>
          <label className="alpha-field">
            Demonstration identity
            <select
              value={actor.id}
              onChange={(e) => switchActor(e.target.value)}
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.roles.join(", ")}
                </option>
              ))}
            </select>
          </label>
          <Link to="/alpha/teacher">Open teacher workspace</Link>
          <Link to="/today">Earlier reading demo</Link>
        </details>
      </footer>
      <nav className="alpha-nav" aria-label="Alpha navigation">
        <NavLink to="/alpha/today"><Icon name="sun"/>{label("Today", "आज")}</NavLink>
        <NavLink to="/alpha/library" className={({isActive}) => isActive || location.pathname.startsWith("/alpha/series/") || location.pathname.startsWith("/alpha/wisdom/") ? "active" : undefined}><Icon name="book"/>{label("Explore", "खोजें")}</NavLink>
        <NavLink to="/alpha/my-day"><Icon name="bookmark"/>{label("My day", "मेरा दिन")}</NavLink>
        <NavLink to="/alpha/account" className={({isActive}) => isActive || location.pathname === "/alpha/settings" ? "active" : undefined}><Icon name="settings"/>{label("My space", "मेरा स्थान")}</NavLink>
      </nav>
    </div>
  );
}
function Welcome() {
  return (
    <div className="alpha-welcome">
      <div className="alpha-hero">
        <p className="alpha-kicker">BETWEEN GATHERINGS</p>
        <h1>
          A little practice.
          <br />
          <em>A familiar thread.</em>
        </h1>
        <p className="alpha-lead">
          Keep a teaching close, even when life gets busy. One clear practice, a
          little room to reflect, and a place to return.
        </p>
        <div className="alpha-hero-art" aria-hidden="true">
          <div />
          <i />
          <span />
        </div>
        <Link className="alpha-button" to="/alpha/sample">
          Try the complete sample <span aria-hidden="true">→</span>
        </Link>
        <p className="alpha-muted">No account. No payment. Your own pace.</p>
      </div>
      <section className="alpha-welcome-aside">
        <p className="alpha-kicker">A PRACTICE THAT BELONGS</p>
        <h2>
          From your gathering
          <br />
          into your day.
        </h2>
        <ol className="alpha-simple-list">
          <li>
            <span>01</span>
            <div>
              <h3>Begin with one thing</h3>
              <p>A short practice and its complete text.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Make it your own</h3>
              <p>Reflect privately, or simply carry on.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Return when you’re ready</h3>
              <p>Your place is kept. No missed-day score.</p>
            </div>
          </li>
        </ol>
        <Link className="alpha-secondary" to="/alpha/join?code=WELCOME-DEMO">
          I have a community invitation
        </Link>
        <Link className="alpha-text-link" to="/alpha/institutions">
          For teachers & institutions →
        </Link>
        <p className="alpha-muted">
          This alpha uses original demonstration text and a sound-check
          recording. No launch tradition or real teacher is represented.
        </p>
      </section>
    </div>
  );
}
function SampleComplete() {
  return (
    <section className="alpha-complete alpha-stack">
      <div className="alpha-check" aria-hidden="true">
        ✓
      </div>
      <p className="alpha-kicker">A SMALL BEGINNING</p>
      <h1>
        That can be enough
        <br />
        for now.
      </h1>
      <p className="alpha-lead">
        You’ve tried the complete sample. Joining a community is a separate
        choice.
      </p>
      <Link className="alpha-button" to="/alpha/join?code=WELCOME-DEMO">
        Explore the demo invitation
      </Link>
      <Link className="alpha-secondary" to="/alpha">
        Return without joining
      </Link>
      <p className="alpha-muted">
        No membership, payment or completion record was created by opening the
        sample.
      </p>
    </section>
  );
}
function Join() {
  const { state, actor, dispatch, prefs, setPrefs } = useAlpha();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("code") || "");
  const [adult, setAdult] = useState(false);
  const [zone, setZone] = useState(prefs.timeZone);
  const invitation = state.invitations.find((i) => i.token === token);
  const cohort = state.cohorts.find((c) => c.id === invitation?.cohortId);
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">YOUR INVITATION</p>
      <h1>A place in the practice.</h1>
      <p className="alpha-lead">
        Joining is your choice. Included community access never needs a second
        payment.
      </p>
      <div className="alpha-inclusion">
        <span className="alpha-badge">DEMO COMMUNITY</span>
        <h2>{cohort?.name || "Check your invitation"}</h2>
        <p>
          {cohort
            ? `${new Date(cohort.startAt).toLocaleDateString()} – ${new Date(cohort.endAt).toLocaleDateString()}`
            : "Use the code your coordinator supplied."}
        </p>
        <p>Institution-provided access · simulated, no money collected</p>
      </div>
      <form
        className="alpha-stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (dispatch({ type: "join", token: token.trim(), adult })) {
            setPrefs({ ...prefs, timeZone: zone });
            navigate("/alpha/circle");
          }
        }}
      >
        <label className="alpha-field">
          Invitation code
          <input
            required
            maxLength={100}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <p className="alpha-muted">
          Joining as {actor.name}. Fixture invitations are recipient-bound.
          Change test identity in Demo workspace controls only when testing
          another account.
        </p>
        <label className="alpha-field">
          Your time zone
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {["Asia/Kolkata", "Europe/London", "America/New_York", "UTC"].map(
              (z) => (
                <option key={z}>{z}</option>
              ),
            )}
          </select>
        </label>
        <label className="alpha-check-field">
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            required
          />
          <span>
            I am 18 or older and choose to join this demonstration community.
          </span>
        </label>
        <p>
          Reminders are off. Joining never grants a teacher or administrator
          role.
        </p>
        <button className="alpha-button">Accept invitation & begin</button>
      </form>
      <Link className="alpha-text-link" to="/alpha/sample">
        Try the sample without joining
      </Link>
    </div>
  );
}
function useMembership() {
  const { state, actor } = useAlpha();
  const memberships = state.memberships.filter(m => m.userId === actor.id && m.orgId === actor.orgId);
  const membership = memberships.find(m => access(state,actor,m.cohortId).allowed) || memberships[0];
  const cohort = state.cohorts.find((c) => c.id === membership?.cohortId);
  const result = cohort
    ? access(state, actor, cohort.id)
    : {
        allowed: false,
        reason: "Accept your invitation to see the community program.",
      };
  const contents = cohort ? visibleContents(state, actor, cohort.id) : [];
  return { membership, cohort, result, contents };
}
function JoinNeeded({ reason }: { reason: string }) {
  return (
    <div className="alpha-empty alpha-stack">
      <p className="alpha-kicker">YOUR COMMUNITY</p>
      <h1>Start with an invitation.</h1>
      <p>{reason}</p>
      <Link className="alpha-button" to="/alpha/join?code=WELCOME-DEMO">
        Check my invitation
      </Link>
      <Link className="alpha-secondary" to="/alpha/sample">
        Try the sample
      </Link>
    </div>
  );
}
function Today() {
  const { state, actor } = useAlpha();
  const { cohort, result, contents } = useMembership();
  if (!result.allowed || !cohort) return <JoinNeeded reason={result.reason} />;
  const completed = new Set(
    state.completions
      .filter((c) => c.userId === actor.id && c.cohortId === cohort.id)
      .map((c) => c.contentId),
  );
  const next = contents.find((c) => !completed.has(c.id)) || contents[0];
  return (
    <div className="alpha-today">
      <header className="alpha-day-heading">
        <p className="alpha-kicker">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1>
          Good to have
          <br />
          <em>you here.</em>
        </h1>
        <p>One small practice. Nothing to catch up on.</p>
      </header>
      <section className="alpha-feature">
        <div className="alpha-feature-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="alpha-feature-copy">
          <p className="alpha-kicker">YOUR NEXT PRACTICE</p>
          {next ? (
            <>
              <h2>{next.title}</h2>
              <p>{next.purpose}</p>
              <p className="alpha-muted">
                {next.audioUrl ? `${next.seconds} seconds · sound-check audio & complete text` : "Read at your own pace · no recording"}
              </p>
              <Link to={`/alpha/practice/${next.id}`} className="alpha-button">
                {completed.has(next.id)
                  ? "Return to this practice"
                  : "Begin / resume practice"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <h2>A little space before the next practice.</h2>
              <p>
                Your coordinator has no published practice available right now.
                Private notes and help are still yours.
              </p>
              <Link className="alpha-secondary" to="/alpha/account">
                Account & help
              </Link>
            </>
          )}
        </div>
      </section>
      <aside className="alpha-continuity">
        <p className="alpha-kicker">YOUR COMMUNITY THREAD</p>
        <h2>{cohort.name}</h2>
        <span className="alpha-badge">Access included · demo grant</span>
        <p>
          Available through{" "}
          {new Date(result.endsAt || cohort.endAt).toLocaleDateString()}.
        </p>
        <div className="alpha-rule" />
        <p>
          {completed.size} distinct practice{completed.size === 1 ? "" : "s"}{" "}
          completed
        </p>
        <Link className="alpha-text-link" to="/alpha/program">
          See your program →
        </Link>
        <p className="alpha-muted">
          The 14-day introduction and 28-day cycle are the intended program
          structure. This alpha shows only the content actually supplied.
        </p>
      </aside>
      <section className="alpha-note">
        <p className="alpha-kicker">A PRIVATE SPACE</p>
        <h2>Some thoughts are just for you.</h2>
        <p>
          A reflection is optional. It stays on this device and is never shown
          to the teacher workspace.
        </p>
        <Link to="/alpha/reflection/general" className="alpha-text-link">
          Open my reflection →
        </Link>
      </section>
    </div>
  );
}
function Program() {
  const { state, actor } = useAlpha();
  const { cohort, result, contents } = useMembership();
  if (!cohort || !result.allowed) return <JoinNeeded reason={result.reason} />;
  const done = new Set(
    state.completions
      .filter((c) => c.userId === actor.id && c.cohortId === cohort.id)
      .map((c) => c.contentId),
  );
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">MY PROGRAM</p>
      <h1>
        A steady thread.
        <br />
        <em>Your own pace.</em>
      </h1>
      <p>
        {cohort.name} · {new Date(cohort.startAt).toLocaleDateString()} –{" "}
        {new Date(cohort.endAt).toLocaleDateString()}
      </p>
      <p className="alpha-inclusion">
        {done.size} distinct practices completed · {contents.length} available
        now
      </p>
      <ol className="alpha-program-list">
        {contents.map((c, i) => (
          <li key={c.id}>
            <span className="alpha-step">
              {done.has(c.id) ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="alpha-kicker">
                {done.has(c.id) ? "COMPLETED · REVISIT ANYTIME" : "AVAILABLE"} ·
                VERSION {c.version}
              </p>
              <h2>{c.title}</h2>
              <p>{c.audioUrl ? `${c.seconds} seconds · demo audio fixture` : "Reading practice · no recording"}</p>
              <Link className="alpha-text-link" to={`/alpha/practice/${c.id}`}>
                {done.has(c.id) ? "Practise again" : "Open practice"} →
              </Link>
            </div>
          </li>
        ))}
      </ol>
      {contents.length === 0 && (
        <p>No practice has been released for you yet.</p>
      )}
      <section className="alpha-panel">
        <h2>What comes next</h2>
        <p>
          New items appear only after their exact version is reviewed, published
          and released. Draft titles and recordings stay out of the member view.
        </p>
        <p className="alpha-muted">
          No promised 14-recording catalogue is fabricated here. Genuine content
          is a release dependency.
        </p>
      </section>
    </div>
  );
}
function MemberPlayer() {
  const { id } = useParams();
  const { actor } = useAlpha();
  const { result, cohort, contents } = useMembership();
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  void clock;
  if (!result.allowed || !cohort) return <JoinNeeded reason={result.reason} />;
  const content = contents.find((c) => c.id === id);
  if (!content)
    return (
      <div className="alpha-narrow alpha-stack">
        <h1>This practice isn’t available.</h1>
        <p>
          It may be unreleased, withdrawn, or outside your access. Playback has
          stopped.
        </p>
        <Link className="alpha-button" to="/alpha/program">
          Return to my program
        </Link>
      </div>
    );
  return (
    <Player
      key={`${actor.id}-${content.id}`}
      content={content}
      cohortId={cohort.id}
    />
  );
}
function Complete() {
  const { id } = useParams();
  const { state, actor } = useAlpha();
  const complete = state.completions.some(
    (c) => c.userId === actor.id && c.contentId === id,
  );
  if (!complete) return <Navigate to="/alpha/circle" replace />;
  return (
    <div className="alpha-complete alpha-stack">
      <div className="alpha-check" aria-hidden="true">
        ✓
      </div>
      <p className="alpha-kicker">A MOMENT, MADE YOURS</p>
      <h1>
        Take this little space
        <br />
        <em>into your day.</em>
      </h1>
      <p className="alpha-lead">
        Your practice is marked complete. There’s nothing else you have to do.
      </p>
      <Link className="alpha-button" to="/alpha/circle">
        Back to my community
      </Link>
      <Link className="alpha-secondary" to={`/alpha/reflection/${id}`}>
        Keep a private thought
      </Link>
      <p className="alpha-muted">
        Optional, local to this device. No teacher visibility or AI sharing.
      </p>
    </div>
  );
}
function Reflection() {
  const { id = "general" } = useParams();
  const { actor, state, drafts, setDraft, localNotice } = useAlpha();
  const key = `spritual_alpha_private_${actor.id}_${id}`;
  const draftKey = `${actor.id}:${id}`;
  const [saved, setSaved] = useState(() => {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  });
  const text = drafts[draftKey] ?? saved;
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (text !== saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [text, saved]);
  const save = () => {
    try {
      localStorage.setItem(key, text);
      setSaved(text);
      setMessage("Saved only on this device.");
    } catch {
      setMessage(
        "Could not save. Your draft is still here; export it before leaving.",
      );
    }
  };
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">JUST FOR YOU</p>
      <h1>A thought to keep.</h1>
      <p className="alpha-lead">What would you like to carry into today?</p>
      <p className="alpha-privacy">
        Notes stay in this browser, unencrypted. Other people using this device
        may access them. They are not backed up, synchronized, sent to AI or
        included in teacher reports.
      </p>
      <label className="alpha-field">
        My reflection
        <textarea
          rows={8}
          maxLength={5000}
          value={text}
          onChange={(e) => {
            setDraft(draftKey, e.target.value);
            setMessage("Unsaved draft");
          }}
          placeholder="A word, a sentence, or nothing at all."
        />
      </label>
      <p className="alpha-muted">
        {text.length}/5,000 characters · {actor.name}
      </p>
      <div className="alpha-row">
        <button className="alpha-button" onClick={save}>
          Save on this device
        </button>
        <button
          className="alpha-secondary"
          disabled={!text}
          onClick={() => {
            downloadText("my-private-reflection.txt", text);
            setMessage(
              "Export prepared locally. Choose a private place to keep it.",
            );
          }}
        >
          Export my text
        </button>
      </div>
      <div role="status">{message}</div>
      {deleting ? (
        <div className="alpha-panel">
          <p>Delete this saved reflection and its draft from this device?</p>
          <div className="alpha-row">
            <button
              className="alpha-danger"
              onClick={() => {
                try {
                  localStorage.removeItem(key);
                  setDraft(draftKey, "");
                  setSaved("");
                  setMessage("Reflection deleted.");
                  setDeleting(false);
                } catch {
                  setMessage("Deletion failed. Please retry.");
                }
              }}
            >
              Delete reflection
            </button>
            <button
              className="alpha-secondary"
              onClick={() => setDeleting(false)}
            >
              Keep it
            </button>
          </div>
        </div>
      ) : (
        <button
          className="alpha-text-button"
          disabled={!text && !saved}
          onClick={() => setDeleting(true)}
        >
          Delete this reflection
        </button>
      )}
      <Link
        className="alpha-text-link"
        to={state.contents.some(c => c.id === id) ? "/alpha/circle" : "/alpha/my-day"}
        onClick={() =>
          localNotice(
            text !== saved
              ? "Your unsaved reflection remains in memory for this visit. Refreshing may lose it."
              : "",
          )
        }
      >
        {state.contents.some(c => c.id === id) ? "Return to my community" : "Return to my day"}
      </Link>
    </div>
  );
}
function Account() {
  const { state, actor, prefs, setPrefs, clearPersonal, dispatch } = useAlpha();
  const { cohort, result } = useMembership();
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">YOU & HELP</p>
      <h1>
        Make room
        <br />
        <em>your way.</em>
      </h1>
      <section className="alpha-panel">
        <h2>{actor.name}</h2>
        <p>Local demo identity · not a verified account</p>
        <p>
          {cohort
            ? `${cohort.name} · ${result.allowed ? "included access" : "access unavailable"}`
            : "No community joined yet"}
        </p>
        <p>{result.reason}</p>
        {result.endsAt && (
          <p>Access ends {new Date(result.endsAt).toLocaleString()}.</p>
        )}
        <p>No subscription or charge exists in this alpha.</p>
      </section>
      <label className="alpha-field">
        Time zone
        <select
          value={prefs.timeZone}
          onChange={(e) => setPrefs({ ...prefs, timeZone: e.target.value })}
        >
          {["Asia/Kolkata", "Europe/London", "America/New_York", "UTC"].map(
            (z) => (
              <option key={z}>{z}</option>
            ),
          )}
        </select>
      </label>
      <label className="alpha-check-field">
        <input
          type="checkbox"
          checked={prefs.large}
          onChange={(e) => setPrefs({ ...prefs, large: e.target.checked })}
        />
        <span>Larger text</span>
      </label>
      <label className="alpha-check-field">
        <input
          type="checkbox"
          checked={prefs.reduced}
          onChange={(e) => setPrefs({ ...prefs, reduced: e.target.checked })}
        />
        <span>Reduce motion</span>
      </label>
      <section className="alpha-panel">
        <h2>Reminders are off</h2>
        <p>
          Notification delivery is not connected. No permission is requested and
          your access is unaffected.
        </p>
      </section>
      <section className="alpha-stack">
        <h2>Private notes</h2>
        <Link to="/alpha/reflection/general" className="alpha-text-link">
          Open my personal reflection →
        </Link>
        {Object.keys(demoPrivateNotes(actor.id))
          .filter((k) => k !== "general")
          .map((k) => (
            <Link
              key={k}
              to={`/alpha/reflection/${encodeURIComponent(k)}`}
              className="alpha-text-link"
            >
              Reflection for{" "}
              {state.contents.find((c) => c.id === k)?.title ||
                "a previous practice"}{" "}
              →
            </Link>
          ))}
        <button
          className="alpha-secondary"
          onClick={() => {
            try {
              downloadText(
                "my-private-reflections.json",
                JSON.stringify(demoPrivateNotes(actor.id, true), null, 2),
              );
              setStatus("Private reflection export prepared on this device.");
            } catch {
              setStatus("Private notes could not be read.");
            }
          }}
        >
          Export all my private reflections
        </button>
      </section>
      <details className="alpha-disclosure">
        <summary>Help, privacy & access</summary>
        <p>
          This is a local test alpha. No live support mailbox or emergency
          response service is connected. Contact the person who shared this
          build for help; do not enter urgent or sensitive concerns into demo
          forms.
        </p>
        <p>
          Institution access is included. Cancellation and refund processing are
          unavailable because this build collects no payments. A real deployment
          must provide verified support and applicable cancellation routes.
        </p>
        <p>
          Teacher workspace reports suppress participation below five members.
          Local demo data is inspectable on this device; switching a fixture
          identity is not secure authentication.
        </p>
      </details>
      {confirm ? (
        <div className="alpha-panel">
          <h2>Remove my local alpha data?</h2>
          <p>
            This removes this demo identity’s notes, playback, preferences,
            membership and completion records. It does not delete another
            identity or the legacy app’s data. Export first if you want a copy.
          </p>
          <button
            className="alpha-danger"
            onClick={async () => {
              if (clearPersonal()) {
                if ("caches" in window)
                  await caches.delete(`spritual-alpha-media-${actor.id}`);
                dispatch({ type: "leaveCommunity" });
                setConfirm(false);
                setStatus(
                  "Local account cleanup requested. See any storage error above.",
                );
              }
            }}
          >
            Remove my local alpha data
          </button>
          <button className="alpha-secondary" onClick={() => setConfirm(false)}>
            Cancel
          </button>
        </div>
      ) : (
        <button className="alpha-text-button" onClick={() => setConfirm(true)}>
          Remove my local alpha data
        </button>
      )}
      <p role="status">{status}</p>
    </div>
  );
}
function demoPrivateNotes(actorId: string, strict = false) {
  const prefix = `spritual_alpha_private_${actorId}_`;
  const notes: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(prefix))
        notes[k.slice(prefix.length)] = localStorage.getItem(k) || "";
    }
  } catch {
    if (strict) throw Error("Private notes could not be read.");
  }
  return notes;
}
function Institution() {
  const [prepared, setPrepared] = useState(false);
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">FOR TEACHERS & COORDINATORS</p>
      <h1>
        Keep the thread
        <br />
        <em>between gatherings.</em>
      </h1>
      <p className="alpha-lead">
        Prepare a small program, review each version, and make the right
        practice available to your adult community.
      </p>
      <ol className="alpha-simple-list">
        <li>
          <span>01</span>
          <div>
            <h3>Prepare & review</h3>
            <p>Record content rights, then approve the exact version.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Invite deliberately</h3>
            <p>
              Up to 30 adults in a scoped pilot. Included access, no duplicate
              charge.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Learn from delivery</h3>
            <p>
              Aggregate participation and your actual delivery time, without
              private reflections.
            </p>
          </div>
        </li>
      </ol>
      <form
        className="alpha-stack"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          downloadText(
            "institution-pilot-inquiry.txt",
            `DRAFT — not submitted\nCommunity: ${data.get("community")}\nExpected adults: ${data.get("adults")}\nTeaching supplied and rights/reviewer: ${data.get("content")}\nNo contract or price accepted.`,
          );
          setPrepared(true);
        }}
      >
        <h2>Prepare a pilot inquiry</h2>
        <p>
          No live submission service is connected. This form creates a local
          draft for you to review and send yourself.
        </p>
        <label className="alpha-field">
          Community name
          <input name="community" required maxLength={100} />
        </label>
        <label className="alpha-field">
          Expected adult participants
          <input name="adults" type="number" min="1" max="30" required />
        </label>
        <label className="alpha-field">
          Content and review readiness
          <textarea name="content" required maxLength={1000} rows={3} />
        </label>
        <button className="alpha-button">Download inquiry draft</button>
        {prepared && <p role="status">Draft prepared. Nothing was sent.</p>}
      </form>
      <Link className="alpha-secondary" to="/alpha/teacher">
        Inspect the demo delivery workspace
      </Link>
    </div>
  );
}
```

### web/src/alpha/Experience.tsx

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import { readingHref } from "./wisdomState";
import { searchLessons } from "../lib/lessonSearch";
import { ImmersiveHero, IntentionPortals, GitaReel } from "./ImmersiveModules";

const topics = [["All", "सभी"], ["Purpose", "कर्म"], ["Balance", "संतुलन"], ["Attention", "ध्यान"]];
export function Experience({ explore = false }: { explore?: boolean }) {
  const { state, update, error, timeZone } = useWisdom();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState("");
  const hi = state.language === "hi";
  const t = (en: string, hindi: string) => hi ? hindi : en;
  const next = lessons.find(l => l.id === state.resume?.lessonId) || lessons.find(l => !state.finished?.[l.id]) || lessons[0];
  const returning = Boolean(state.resume || Object.keys(state.kept).length || Object.keys(state.finished || {}).length);
  const allRead = lessons.every(l => state.finished?.[l.id]);
  const nextHref = readingHref(next.id, state.resume);
  const kept = Object.entries(state.kept).reverse().filter(([, v]) => v.day === localDay(timeZone)).sort((a,b) => Number(Boolean(a[1].triedAt)) - Number(Boolean(b[1].triedAt)))[0];
  const cueLabels = { "after-breakfast": t("After breakfast", "नाश्ते के बाद"), "before-work": t("Before work or study", "काम या पढ़ाई से पहले"), evening: t("During my evening pause", "शाम के विराम में") };
  const change = () => { if (update(v => ({ ...v, language: hi ? "en" : "hi" }))) window.dispatchEvent(new Event("spritual-alpha-language")); };
  const visible = searchLessons(lessons, query, ["all", "purpose", "balance", "attention"][filter]);
  return <div className="experience" lang={state.language}>
    <header className={`experience-greeting ${!explore && !returning ? "experience-positioning" : ""}`}><div><span className="experience-eyebrow">{t("A LITTLE, EVERY DAY", "थोड़ा, हर दिन")}</span><h1>{explore ? t("Find your moment.", "अपना पल खोजें।") : returning ? t("Welcome back to yourself.", "अपने पास फिर लौटें।") : t("Don’t collect wisdom. Live it.", "ज्ञान सिर्फ़ संजोएँ नहीं। उसे जिएँ।")}</h1></div><button className="experience-language" onClick={change} aria-label={hi ? "Switch to English" : "हिन्दी में पढ़ें"}>{hi ? "EN" : "हिं"}<span aria-hidden="true">⇄</span></button></header>
    {!explore && !returning && <div className="experience-positioning-support"><p>{t("Read a Gita shloka, explore its meaning in English or Hindi, and choose one small action for your day. Original words, a plain-language explanation, and everyday practice—at your pace.", "गीता का एक श्लोक पढ़ें, उसका अर्थ समझें, और दिन के लिए एक छोटा कदम चुनें। मूल शब्द, सरल व्याख्या और रोज़ का अभ्यास—अपनी गति से।")}</p></div>}
    {!explore && state.resume && <div className="experience-reading-return"><Link to={nextHref}><span className="experience-resume-icon"><Icon name="book"/></span><span><small>{t("YOUR PLACE IS KEPT", "आपकी जगह सहेजी है")}</small><strong>{t("Continue reading", "पढ़ना जारी रखें")}</strong><span>{next.title[state.language]} · {state.resume.scene + 1}/4</span></span><Icon name="arrow"/></Link><button type="button" onClick={() => update(latest => { const nextState = { ...latest }; delete nextState.resume; return nextState; })}>{t("Clear reading position", "पढ़ने की जगह हटाएँ")}</button></div>}
    {error && <p role="alert" className="alpha-error">{error}</p>}
    {!explore && <>
      {kept && <Link className="experience-resume" to={kept ? "/alpha/my-day" : nextHref}><span className="experience-resume-icon"><Icon name={kept ? "bookmark" : "sun"}/></span><span><strong>{kept ? t("Your thought, carried forward", "आपकी सीख, दिन भर साथ") : t("A small pause. A fresh perspective.", "एक छोटा विराम। एक नई नज़र।")}</strong><small>{kept ? kept[1].triedAt ? t("You tried it. Return whenever you wish.", "आपने आज़माया। जब चाहें फिर लौटें।") : kept[1].cue ? cueLabels[kept[1].cue] : t("Return to the idea you saved today", "आज सहेजे विचार पर लौटें") : t("One verse is enough to begin", "शुरुआत के लिए एक श्लोक काफ़ी है")}</small></span><Icon name="chevron" size={18}/></Link>}
      <ImmersiveHero lesson={next} language={state.language} href={nextHref} resuming={Boolean(state.resume)} allRead={allRead}/>


    </>}
    {explore && <><p className="experience-intro">{t("Ancient words. Everyday questions. Start where you are.", "प्राचीन शब्द। रोज़ के सवाल। जहाँ हैं, वहीं से शुरू करें।")}</p><label className="experience-search"><Icon name="search"/><input type="search" aria-label={t("Search readings", "पाठ खोजें")} placeholder={t("Search a thought or verse…", "विचार या श्लोक खोजें…")} value={query} onChange={e => setQuery(e.target.value)}/></label><div className="experience-filters" role="group" aria-label={t("Reading theme", "पाठ का विषय")}>{topics.map((topic, i) => <button key={i} aria-pressed={filter === i} onClick={() => setFilter(i)}>{topic[hi ? 1 : 0]}</button>)}</div></>}
    <IntentionPortals items={visible} language={state.language} state={state} explore={explore}/>
    {!visible.length && <div className="experience-empty"><Icon name="search" size={30}/><h3>{t("A different word might help.", "कोई दूसरा शब्द आज़माएँ।")}</h3><p>{t("This preview has three Gita readings.", "इस पूर्वावलोकन में गीता के तीन पाठ हैं।")}</p><button className="wisdom-primary" onClick={() => {setQuery("");setFilter(0);}}>{t("Show all readings", "सभी पाठ देखें")}</button></div>}
    <GitaReel language={state.language} state={state}/>
    <p className="experience-disclosure">{t("Preview collection · Original explanations awaiting human review. Source Sanskrit is linked in every reading.", "पूर्वावलोकन संग्रह · मौलिक व्याख्याओं की मानवीय समीक्षा बाकी है। हर पाठ में संस्कृत स्रोत जुड़ा है।")}</p>
  </div>;
}

export function ExperienceProfile() {
  const { state, update, error } = useWisdom();
  const t = (en: string, hi: string) => state.language === "hi" ? hi : en;
  const change = (language: "en" | "hi") => { if (update(v => ({ ...v, language }))) window.dispatchEvent(new Event("spritual-alpha-language")); };
  return <div className="experience experience-profile" lang={state.language}>
    <header><span className="experience-eyebrow">{t("A PLACE TO RETURN", "फिर लौटने की जगह")}</span><h1>{t("Your own rhythm.", "आपकी अपनी लय।")}</h1><p>{t("A little reading. A little living. All at your pace.", "थोड़ा पढ़ें। थोड़ा अपनाएँ। अपनी गति से।")}</p></header>
    {error && <p role="alert" className="alpha-error">{error}</p>}
    <div className="experience-stats"><Link to="/alpha/series/gita"><Icon name="book"/><strong>{Object.keys(state.finished || {}).length}<small>/ 3</small></strong><span>{t("Readings explored", "पाठ पढ़े")}</span></Link><Link to="/alpha/my-day"><Icon name="bookmark"/><strong>{Object.keys(state.kept).length}</strong><span>{t("Ideas kept close", "विचार सहेजे")}</span></Link></div>
    <Link to="/alpha/my-day" className="experience-resume"><span className="experience-resume-icon"><Icon name="leaf"/></span><span><strong>{t("Bring a little wisdom into today", "आज थोड़ा ज्ञान अपनाएँ")}</strong><small>{t("Your saved ideas and small steps", "आपके सहेजे विचार और छोटे कदम")}</small></span><Icon name="chevron"/></Link>
    <section className="experience-profile-section"><h2>{t("Your reading language", "पढ़ने की भाषा")}</h2><div className="experience-filters" role="group" aria-label="Reading language"><button aria-pressed={state.language === "en"} onClick={() => change("en")}>English</button><button aria-pressed={state.language === "hi"} onClick={() => change("hi")}>हिन्दी</button></div></section>
    <div className="experience-menu"><Link to="/alpha/reflection/general"><Icon name="book"/><span><strong>{t("A private reflection", "एक निजी विचार")}</strong><small>{t("Make space for what stays with you", "जो मन में रह जाए, उसे लिखें")}</small></span><Icon name="chevron"/></Link><Link to="/alpha/program"><Icon name="heart"/><span><strong>{t("Your community", "आपका समुदाय")}</strong><small>{t("Open the local circle preview", "स्थानीय समुदाय का पूर्वावलोकन")}</small></span><Icon name="chevron"/></Link><Link to="/alpha/settings"><Icon name="settings"/><span><strong>{t("Comfort, privacy & help", "सुविधा, गोपनीयता और सहायता")}</strong><small>{t("Text size, motion and your local data", "अक्षर आकार, गति और स्थानीय जानकारी")}</small></span><Icon name="chevron"/></Link></div>
    <p className="experience-disclosure">{t("Your reading history stays on this device. This local preview is not a signed-in account; anyone using this browser profile can inspect its unencrypted data.", "पढ़ने की जानकारी इस डिवाइस पर रहती है। यह स्थानीय पूर्वावलोकन है, सुरक्षित खाता नहीं। इस ब्राउज़र का उपयोग करने वाला व्यक्ति बिना एन्क्रिप्शन की जानकारी देख सकता है।")}</p>
  </div>;
}
```

### web/src/alpha/Story.tsx

```tsx
import { motion } from "motion/react";
import { BilingualText, glideSpring, useMotionSettings } from "./MotionSystem";
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { lessons, type Language } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import "./story.css";
import { finishReading, moveReading, readingHref } from "./wisdomState";

const chapters = [
  { id: "gita-2-47", en: "When the result is uncertain", hi: "जब परिणाम तय न हो", theme: "work" },
  { id: "gita-2-48", en: "When life changes course", hi: "जब दिन दिशा बदले", theme: "balance" },
  { id: "gita-6-26", en: "When the mind wanders", hi: "जब मन भटके", theme: "attention" },
] as const;

const art = "/art/gita-chariot-cover-v1.webp";
const labels = (language: Language) => (en: string, hi: string) => language === "hi" ? hi : en;

function StoryLanguage({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <div className="story-language" role="group" aria-label="Reading language">
    <button type="button" aria-pressed={language === "en"} onClick={() => onChange("en")}>English</button>
    <button type="button" aria-pressed={language === "hi"} onClick={() => onChange("hi")}>हिन्दी</button>
  </div>;
}

export function GitaJourney() {
  const { state, error, update } = useWisdom();
  const language = state.language;
  const t = labels(language);
  const completed = chapters.filter(chapter => Boolean(state.finished?.[chapter.id]));
  const next = chapters.find(chapter => chapter.id === state.resume?.lessonId) || chapters.find(chapter => !state.finished?.[chapter.id]) || chapters[0];
  const changeLanguage = (nextLanguage: Language) => {
    if (update(latest => ({ ...latest, language: nextLanguage }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };

  return <div className="story-series" lang={language}>
    <div className="story-series-top"><Link to="/alpha/library">← {t("Explore", "खोजें")}</Link><StoryLanguage language={language} onChange={changeLanguage}/></div>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <section className="story-series-cover" aria-labelledby="story-series-heading">
      <img src={art} width="941" height="1672" alt={t("An illustrated chariot at sunrise before a difficult conversation", "कठिन बातचीत से पहले सूर्योदय में एक रथ का चित्र")} />
      <div className="story-series-copy">
        <span className="story-eyebrow">SPRITUAL / {t("GUIDED READING", "साथ पढ़ें")}</span>
        <h1 id="story-series-heading">{t("The Gita,", "गीता,")}<br/><em>{t("in the middle of life.", "जीवन के बीच।")}</em></h1>
        <p>{t("Three timeless questions. A verse, a perspective, a small step into your day.", "तीन सवाल। एक श्लोक, एक नज़रिया, और दिन के लिए एक छोटा कदम।")}</p>
        <Link className="story-gold-button" to={readingHref(next.id, state.resume)}>{state.resume ? t("Continue reading", "पढ़ना जारी रखें") : completed.length === 0 ? t("Begin the journey", "यात्रा शुरू करें") : completed.length === chapters.length ? t("Read again", "फिर पढ़ें") : t("Continue reading", "पढ़ना जारी रखें")} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <div className="story-series-progress"><div><strong>{completed.length} / {chapters.length}</strong><span>{t("read by you", "आपने पढ़े")}</span></div><p>{t("Read in any order. There are no locks or missed days.", "किसी भी क्रम में पढ़ें। यहाँ बंद पाठ या छूटे दिन नहीं हैं।")}</p></div>
    <section className="story-episodes" aria-labelledby="story-episodes-heading"><div className="story-section-head"><span className="story-eyebrow">{t("THREE AVAILABLE READINGS", "तीन उपलब्ध पाठ")}</span><h2 id="story-episodes-heading">{t("Choose a question.", "एक सवाल चुनें।")}</h2></div>
      <div className="story-episode-list">{chapters.map((chapter, index) => { const lesson = lessons.find(item => item.id === chapter.id)!; const finished = Boolean(state.finished?.[chapter.id]); return <Link className="story-episode" to={readingHref(chapter.id, state.resume)} key={chapter.id}><div className={`story-episode-thumb story-episode-thumb--${chapter.theme}`}><img src={index === 2 ? "/art/river-sanctuary-v1.webp" : art} alt="" loading="lazy"/></div><span className="story-episode-number">{String(index + 1).padStart(2, "0")}</span><span className="story-episode-text"><small>{lesson.reference} · {t("4 moments", "4 चरण")}</small><strong>{language === "hi" ? chapter.hi : chapter.en}</strong><span>{lesson.title[language]}</span></span><span className="story-episode-end">{finished ? <span className="story-finished">✓ {t("Read", "पढ़ा")}</span> : <span aria-hidden="true">↗</span>}</span></Link>; })}</div>
    </section>
    <p className="story-disclosure">{t("These are three Gita selections, not a complete scripture or a narrated/video series. The interpretations are original demonstrations awaiting human review. Sanskrit links appear in each reading.", "ये गीता के तीन चुने हुए पाठ हैं, पूरा ग्रंथ या ऑडियो/वीडियो श्रृंखला नहीं। व्याख्याएँ मौलिक नमूने हैं जिनकी मानवीय समीक्षा बाकी है। हर पाठ में संस्कृत स्रोत का लिंक है।")}</p>
  </div>;
}

export function GitaEpisode() {
  const { reduced } = useMotionSettings();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, error, update, timeZone } = useWisdom();
  const language = state.language;
  const t = labels(language);
  const lesson = lessons.find(item => item.id === id);
  const chapter = chapters.find(item => item.id === id);
  const raw = Number(params.get("scene") ?? (state.resume && state.resume.lessonId === id ? state.resume.scene : 0));
  const requested = Number.isInteger(raw) ? Math.min(4, Math.max(0, raw)) : 0;
  const scene = requested === 4 && !state.finished?.[id || ""] ? 3 : requested;
  const [pronunciation, setPronunciation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
    setPronunciation(false);
    setSavedNotice("");
  }, [id, scene]);

  if (!lesson || !chapter) return <div className="story-missing"><h1>{t("This reading is not here.", "यह पाठ उपलब्ध नहीं है।")}</h1><Link to="/alpha/series/gita">{t("See available readings", "उपलब्ध पाठ देखें")}</Link></div>;

  const step = [lesson.steps.find(item => item.kind === "arrive"), lesson.steps.find(item => item.kind === "verse"), lesson.steps.find(item => item.kind === "understand"), lesson.steps.find(item => item.kind === "apply")][Math.min(scene, 3)]!;
  const verse = lesson.steps.find(item => item.kind === "verse")!;
  const setScene = (next: number) => {
    if (next < 4) update(latest => moveReading(latest, lesson.id, next, new Date().toISOString()));
    setParams({ scene: String(next) }, { replace: true });
  };
  const changeLanguage = (nextLanguage: Language) => {
    if (update(latest => ({ ...latest, language: nextLanguage }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };
  const finish = () => {
    if (update(latest => finishReading(latest, lesson.id, new Date().toISOString()))) setScene(4);
  };
  const undoFinish = () => {
    if (update(latest => {
      const finished = { ...latest.finished };
      delete finished[lesson.id];
      return { ...latest, finished };
    })) setScene(3);
  };
  const keep = () => {
    if (update(latest => ({ ...latest, kept: { ...latest.kept, [lesson.id]: { day: localDay(timeZone) } } }))) setSavedNotice(t("Saved to My day. You can return whenever you like.", "मेरा दिन में सहेजा गया। जब चाहें फिर लौटें।"));
  };
  const nextChapter = chapters[chapters.findIndex(item => item.id === lesson.id) + 1];
  const keptToday = state.kept[lesson.id]?.day === localDay(timeZone);

  return <div className="story-player" lang={language}>
    <header className="story-player-head"><Link to="/alpha/series/gita" className="story-close" aria-label={t("Close reading", "पाठ बंद करें")}>×</Link><div className="story-progress" aria-label={scene === 4 ? t("Reading complete", "पाठ पूरा") : t(`Moment ${scene + 1} of 4`, `चरण ${scene + 1} / 4`)}>{[0, 1, 2, 3].map(index => <span key={index} className={index <= scene ? "is-past" : ""}/>)}</div><StoryLanguage language={language} onChange={changeLanguage}/></header>
    {error && <p role="alert" className="story-error">{error}</p>}
    <motion.div className={`story-player-scene motion-reading-scene story-player-scene--${scene}`} key={`${lesson.id}-${scene}`} initial={reduced ? false : {opacity:0,y:12}} animate={{opacity:1,y:0}} transition={glideSpring}>
      {scene === 0 && <><img className="story-player-art" src={art} width="941" height="1672" alt=""/><div className="story-scene-shade"/><div className="story-scene-copy"><span className="story-eyebrow">{lesson.reference} · {t("THE QUESTION", "सवाल")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={{en:chapter.en,hi:chapter.hi}} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p></div></>}
      {scene === 1 && <div className="story-paper-scene"><span className="story-eyebrow">{t("THE ORIGINAL VERSE", "मूल श्लोक")} · {lesson.reference}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={{en:"Read it slowly.",hi:"धीरे-धीरे पढ़ें।"}} language={language}/></h1><blockquote lang="sa-Deva">{verse.script}</blockquote><button className="story-text-button" type="button" aria-expanded={pronunciation} onClick={() => setPronunciation(!pronunciation)}>{pronunciation ? t("Hide reading guide", "उच्चारण सहायता छिपाएँ") : t("Show reading guide", "उच्चारण सहायता देखें")} <span aria-hidden="true">{pronunciation ? "−" : "+"}</span></button>{pronunciation && <p className="story-pronunciation">{verse.transliteration}</p>}<p><BilingualText text={verse.body} language={language}/></p></div>}
      {scene === 2 && <div className="story-meaning-scene"><span className="story-eyebrow">{t("MEANING · UNREVIEWED DEMO", "अर्थ · समीक्षा-रहित नमूना")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={step.title} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p><details><summary>{t("Read the source note", "स्रोत के बारे में पढ़ें")}</summary><p><BilingualText text={lesson.sourceNote} language={language}/></p><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Open source Sanskrit", "मूल संस्कृत देखें")} ↗</a></details></div>}
      {scene === 3 && <div className="story-action-scene"><span className="story-eyebrow">{t("BRING IT INTO TODAY", "आज के दिन में अपनाएँ")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={step.title} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p><div className="story-action-card"><small>{t("ONE POSSIBLE STEP", "एक संभव कदम")}</small><strong><BilingualText text={lesson.action} language={language}/></strong></div><p className="story-scene-footnote">{t("A personal prompt, not a measure of spiritual progress.", "यह निजी अभ्यास है, आध्यात्मिक प्रगति का पैमाना नहीं।")}</p></div>}
      {scene === 4 && <div className="story-end-scene">
        <span className="story-end-mark" aria-hidden="true">✦</span>
        <span className="story-eyebrow">{t("YOU MARKED THIS READING COMPLETE", "आपने यह पाठ पूरा किया")}</span>
        <h1 ref={heading} tabIndex={-1}>{t("Carry what stays with you.", "जो साथ रहे, उसे अपनाएँ।")}</h1>
        <p>{t("You can keep one small action in My day, or simply return when you wish. No streak starts here.", "एक छोटा कदम मेरा दिन में सहेजें, या जब चाहें लौट आएँ। यहाँ लगातार दिनों का कोई दबाव नहीं है।")}</p>
        <div className="story-end-actions">
          <button className="story-gold-button" type="button" onClick={keep} disabled={keptToday}>{keptToday ? t("Already in My day", "मेरा दिन में सहेजा गया") : t("Keep this idea for today", "यह विचार आज के लिए सहेजें")}</button>
          <Link to="/alpha/my-day">{t("Open My day", "मेरा दिन खोलें")} ↗</Link>
          <button className="story-undo-read" type="button" onClick={undoFinish}>{t("Undo read mark", "पढ़ा हुआ निशान हटाएँ")}</button>
        </div>
        <p role="status">{savedNotice}</p>
        {nextChapter && <Link className="story-next-chapter" to={`/alpha/episode/${nextChapter.id}`}>{t("Next reading", "अगला पाठ")} <strong>{language === "hi" ? nextChapter.hi : nextChapter.en}</strong> <span aria-hidden="true">↗</span></Link>}
      </div>}
    </motion.div>
    {scene < 4 && <footer className="story-player-controls"><button type="button" className="story-back" onClick={() => setScene(scene - 1)} disabled={scene === 0}>{t("Previous", "पीछे")}</button><span>{scene + 1} / 4</span><button type="button" className="story-gold-button" onClick={() => scene === 3 ? finish() : setScene(scene + 1)}>{scene === 3 ? t("Mark as read", "पढ़ा हुआ चिन्हित करें") : t("Continue", "आगे बढ़ें")} <span aria-hidden="true">→</span></button></footer>}
  </div>;
}
```

### web/package.json

```json
{
  "name": "web",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "build:native": "tsc -b && vite build --mode native"
  },
  "dependencies": {
    "@capacitor/app": "8.1.1",
    "@capacitor/core": "8.5.2",
    "@capacitor/haptics": "8.0.2",
    "@capacitor/share": "8.0.2",
    "@supabase/supabase-js": "^2.45.0",
    "motion": "13.4.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "suncalc": "2.0.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.6.2",
    "vite": "^5.4.3",
    "vite-plugin-pwa": "^0.20.5"
  }
}
```

### scripts/verify-native-bundle.mjs

```js
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'web/dist-native');
const sourceHtml = await readFile(resolve(source, 'index.html'), 'utf8');
async function bundleFiles(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      files.push(...await bundleFiles(resolve(directory, entry.name), relative + '/'));
    } else {
      assert(entry.isFile(), `Native bundle contains an unsupported entry: ${relative}`);
      files.push(relative);
    }
  }
  return files.sort();
}
const files = await bundleFiles(source);
const generatedExtras = new Set(['cordova.js', 'cordova_plugins.js']);
assert(!files.some(name => /(^|\/)(sw\.js|registerSW\.js|manifest\.webmanifest|workbox-)/.test(name)), 'Native assets must not contain a web update worker');
assert(!files.some(name => /(^|\/)river-sanctuary-v1\.png$/.test(name)), 'Ship the optimized WebP, not the original artwork PNG');
assert(!/<script[^>]+src=["']https?:\/\//.test(sourceHtml), 'Native startup must not require remote JavaScript');
assert(!/<link[^>]+rel=["']manifest/.test(sourceHtml), 'Native bundle must not install a second PWA');

for (const platform of [
  { name: 'Android', base: 'web/android/app/src/main/assets' },
  { name: 'iOS', base: 'web/ios/App/App' },
]) {
  const base = resolve(root, platform.base);
  const config = JSON.parse(await readFile(resolve(base, 'capacitor.config.json'), 'utf8'));
  assert.equal(config.appId, 'in.co.spiritual.app');
  assert(!config.server?.url, `${platform.name} must boot bundled assets, not the Mac's server`);
  assert(!config.server?.allowNavigation?.length, 'External sources must remain outside the privileged app view');
  assert(!config.android?.allowMixedContent);
  const synced = resolve(base, 'public');
  const syncedFiles = await bundleFiles(synced);
  assert.deepEqual(syncedFiles.filter(name => !generatedExtras.has(name)), files.filter(name => !generatedExtras.has(name)), `${platform.name}: missing or unexpected bundled files`);
  for (const name of files) {
    assert.deepEqual(await readFile(resolve(synced, name)), await readFile(resolve(source, name)), `${platform.name}: stale ${name}`);
  }
}
const manifest = await readFile(resolve(root, 'web/android/app/src/main/AndroidManifest.xml'), 'utf8');
assert(manifest.includes('android:allowBackup="false"'));
assert(manifest.includes('android:usesCleartextTraffic="false"'));
assert(manifest.includes('android:dataExtractionRules="@xml/data_extraction_rules"'));
const pluginConfig = JSON.parse(await readFile(resolve(root, 'web/android/app/src/main/assets/capacitor.plugins.json'), 'utf8'));
assert.deepEqual(pluginConfig.map(plugin => plugin.pkg).sort(), ['@capacitor/app', '@capacitor/haptics', '@capacitor/share']);
console.log(`Native bundle checks passed: ${files.length} files recursively byte-matched on both platforms (including artwork and fonts), offline startup, no PWA worker, restricted navigation and Android privacy defaults.`);
```
