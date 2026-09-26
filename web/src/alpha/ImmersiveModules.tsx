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
