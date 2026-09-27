import { BilingualText, glideSpring, useMotionSettings } from "./MotionSystem";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "motion/react";
import { lessons, type Language } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import { EditorialImage } from "./EditorialImage";
import "./story.css";
import "./calm-reader.css";
import { chooseReadingAfter, finishReading, moveReading, readingHref } from "./wisdomState";

const chapters = [
  { id: "gita-2-47", en: "When the result is uncertain", hi: "जब परिणाम तय न हो", theme: "work" },
  { id: "gita-2-48", en: "When life changes course", hi: "जब दिन दिशा बदले", theme: "balance" },
  { id: "gita-6-26", en: "When the mind wanders", hi: "जब मन भटके", theme: "attention" },
] as const;

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
  const chosen = state.readingChoice && state.finished?.[state.readingChoice.afterLessonId]
    ? chapters.find(chapter => chapter.id === state.readingChoice?.lessonId)
    : undefined;
  const next = chapters.find(chapter => chapter.id === state.resume?.lessonId) || chosen || chapters.find(chapter => !state.finished?.[chapter.id]) || chapters[0];
  const changeLanguage = (nextLanguage: Language) => {
    if (update(latest => ({ ...latest, language: nextLanguage }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };

  return <div className="story-series" lang={language}>
    <div className="story-series-top"><Link to="/alpha/library">← {t("Explore", "खोजें")}</Link><StoryLanguage language={language} onChange={changeLanguage}/></div>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <section className="story-series-cover" aria-labelledby="story-series-heading">
      <EditorialImage asset="gitaChariot" language={language} priority className="story-series-art"/>
      <div className="story-series-copy">
        <span className="story-eyebrow">SPRITUAL / {t("GUIDED READING", "साथ पढ़ें")}</span>
        <h1 id="story-series-heading">{t("The Gita,", "गीता,")}<br/><em>{t("in the middle of life.", "जीवन के बीच।")}</em></h1>
        <p>{t("Three timeless questions. A verse, a perspective, a small step into your day.", "तीन सवाल। एक श्लोक, एक नज़रिया, और दिन के लिए एक छोटा कदम।")}</p>
        <Link className="story-gold-button" to={readingHref(next.id, state.resume)}>{state.resume ? t("Continue reading", "पढ़ना जारी रखें") : completed.length === 0 ? t("Begin the journey", "यात्रा शुरू करें") : completed.length === chapters.length ? t("Read again", "फिर पढ़ें") : t("Continue reading", "पढ़ना जारी रखें")} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <div className="story-series-progress"><div><strong>{completed.length} / {chapters.length}</strong><span>{t("read by you", "आपने पढ़े")}</span></div><p>{t("Read in any order. There are no locks or missed days.", "किसी भी क्रम में पढ़ें। यहाँ बंद पाठ या छूटे दिन नहीं हैं।")}</p></div>
    <section className="story-episodes" aria-labelledby="story-episodes-heading"><div className="story-section-head"><span className="story-eyebrow">{t("THREE AVAILABLE READINGS", "तीन उपलब्ध पाठ")}</span><h2 id="story-episodes-heading">{t("Choose a question.", "एक सवाल चुनें।")}</h2></div>
      <div className="story-episode-list">{chapters.map((chapter, index) => { const lesson = lessons.find(item => item.id === chapter.id)!; const finished = Boolean(state.finished?.[chapter.id]); return <Link className="story-episode" to={readingHref(chapter.id, state.resume)} key={chapter.id}><div className={`story-episode-thumb story-episode-thumb--${chapter.theme}`}><EditorialImage asset={index === 2 ? "river" : "gitaChariot"} language={language} decorative/></div><span className="story-episode-number">{String(index + 1).padStart(2, "0")}</span><span className="story-episode-text"><small>{lesson.reference} · {t("4 moments", "4 चरण")}</small><strong>{language === "hi" ? chapter.hi : chapter.en}</strong><span>{lesson.title[language]}</span></span><span className="story-episode-end">{finished ? <span className="story-finished">✓ {t("Read", "पढ़ा")}</span> : <span aria-hidden="true">↗</span>}</span></Link>; })}</div>
    </section>
    <p className="story-disclosure">{t("These are three Gita selections, not a complete scripture or a narrated/video series. The interpretations are original demonstrations awaiting human review. Sanskrit links appear in each reading.", "ये गीता के तीन चुने हुए पाठ हैं, पूरा ग्रंथ या ऑडियो/वीडियो श्रृंखला नहीं। व्याख्याएँ मौलिक नमूने हैं जिनकी मानवीय समीक्षा बाकी है। हर पाठ में संस्कृत स्रोत का लिंक है।")}</p>
  </div>;
}

export function GitaEpisode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { state, error, update, timeZone } = useWisdom();
  const { reduced, active } = useMotionSettings();
  const language = state.language;
  const t = labels(language);
  const lesson = lessons.find(item => item.id === id);
  const chapter = chapters.find(item => item.id === id);
  const raw = Number(params.get("scene") ?? (state.resume && state.resume.lessonId === id ? state.resume.scene : 0));
  const requested = Number.isInteger(raw) ? Math.min(4, Math.max(0, raw)) : 0;
  const scene = requested === 4 && !state.finished?.[id || ""] ? 3 : requested;
  const previousScene = useRef(scene);
  const direction = scene >= previousScene.current ? 1 : -1;
  const changingScene = scene !== previousScene.current;
  const [pronunciation, setPronunciation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
    setPronunciation(false);
    setSavedNotice("");
    previousScene.current = scene;
  }, [id, scene]);

  if (!lesson || !chapter) return <div className="story-missing"><h1>{t("This reading is not here.", "यह पाठ उपलब्ध नहीं है।")}</h1><Link to="/alpha/series/gita">{t("See available readings", "उपलब्ध पाठ देखें")}</Link></div>;

  const step = [lesson.steps.find(item => item.kind === "arrive"), lesson.steps.find(item => item.kind === "verse"), lesson.steps.find(item => item.kind === "understand"), lesson.steps.find(item => item.kind === "apply")][Math.min(scene, 3)]!;
  const verse = lesson.steps.find(item => item.kind === "verse")!;
  const setScene = (next: number) => {
    if (next < 4) update(latest => moveReading(latest, lesson.id, next, new Date().toISOString()));
    setParams(previous => {
      const nextParams = new URLSearchParams({ scene: String(next) });
      if (previous.get("origin") === "work") nextParams.set("origin", "work");
      return nextParams;
    }, { replace: true });
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
      const next = { ...latest, finished };
      if (next.readingChoice?.afterLessonId === lesson.id) delete next.readingChoice;
      return next;
    })) setScene(3);
  };
  const keep = () => {
    if (update(latest => ({ ...latest, kept: { ...latest.kept, [lesson.id]: latest.kept[lesson.id] ?? { day: localDay(timeZone), kind: "bookmark" as const } } }))) setSavedNotice(t("Reading saved on this device. No practice is assumed.", "पाठ इस डिवाइस पर सहेजा गया। अभ्यास अपने आप नहीं माना जाएगा।"));
  };
  const nextChapter = chapters[(chapters.findIndex(item => item.id === lesson.id) + 1) % chapters.length];
  const chooseNextTime = (mode: "repeat" | "next") => {
    const targetId = mode === "repeat" ? lesson.id : nextChapter.id;
    if (update(latest => chooseReadingAfter(latest, lesson.id, targetId, mode))) navigate("/alpha/today");
  };
  const saved = Boolean(state.kept[lesson.id]);
  const moment = [t("Question", "सवाल"), t("Verse", "श्लोक"), t("Meaning", "अर्थ"), t("Today", "आज")][Math.min(scene, 3)];
  const progressLabel = scene === 4 ? t("Reading complete", "पाठ पूरा हुआ") : t(`Moment ${scene + 1} of 4: ${moment}`, `चरण ${scene + 1} / 4: ${moment}`);

  return <div className="story-player" lang={language}>
    <header className="story-player-head"><Link to={params.get("origin") === "work" ? "/alpha/scriptures/gita" : "/alpha/series/gita"} className="story-close" aria-label={t("Close reading", "पाठ बंद करें")}>×</Link><div className="story-progress-wrap"><div className="story-progress" role="progressbar" aria-label={t("Reading progress", "पाठ की प्रगति")} aria-valuemin={1} aria-valuemax={4} aria-valuenow={Math.min(scene + 1, 4)} aria-valuetext={progressLabel}>{[0, 1, 2, 3].map(index => <span key={index}><motion.span className="story-progress-fill" initial={false} animate={{ scaleX: index <= scene ? 1 : 0 }} transition={reduced || !active ? { duration: 0 } : glideSpring} /></span>)}</div><span className="story-progress-label" aria-hidden="true">{scene === 4 ? t("Complete", "पूरा") : moment}</span></div><StoryLanguage language={language} onChange={changeLanguage}/></header>
    {error && <p role="alert" className="story-error">{error}</p>}
    <motion.div
      className={`story-player-scene story-player-scene--${scene}`}
      key={`${lesson.id}-${scene}`}
      initial={!changingScene || reduced || !active ? false : { opacity: 0.88, y: direction * 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduced || !active ? { duration: 0 } : glideSpring}
    >
      {scene === 0 && <><EditorialImage className="story-player-art" asset="gitaChariot" language={language} decorative priority/><div className="story-scene-shade"/><div className="story-scene-copy"><span className="story-eyebrow">{lesson.reference.replace("Bhagavad Gita", t("Gita", "गीता"))} · {t("THE QUESTION", "सवाल")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={{en:chapter.en,hi:chapter.hi}} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p></div></>}
      {scene === 1 && <div className="story-paper-scene"><span className="story-eyebrow">{t("THE ORIGINAL VERSE", "मूल श्लोक")} · {lesson.reference}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={{en:"Read it slowly.",hi:"धीरे-धीरे पढ़ें।"}} language={language}/></h1><blockquote lang="sa-Deva">{verse.script}</blockquote><button className="story-text-button" type="button" aria-expanded={pronunciation} onClick={() => setPronunciation(!pronunciation)}>{pronunciation ? t("Hide reading guide", "उच्चारण सहायता छिपाएँ") : t("Show reading guide", "उच्चारण सहायता देखें")} <span aria-hidden="true">{pronunciation ? "−" : "+"}</span></button>{pronunciation && <p className="story-pronunciation" lang="sa-Latn">{verse.transliteration}</p>}<p><BilingualText text={verse.body} language={language}/></p><div className="story-verse-tools"><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Compare source text", "मूल पाठ देखें")} ↗</a><button type="button" onClick={keep} disabled={saved}>{saved ? t("In Saved", "सहेजा हुआ") : t("Save this reading", "यह पाठ सहेजें")}</button></div><p role="status" className="story-save-notice">{savedNotice}</p></div>}
      {scene === 2 && <div className="story-meaning-scene"><span className="story-eyebrow">{t("MEANING · UNREVIEWED DEMO", "अर्थ · समीक्षा-रहित नमूना")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={step.title} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p><details><summary>{t("Read the source note", "स्रोत के बारे में पढ़ें")}</summary><p><BilingualText text={lesson.sourceNote} language={language}/></p><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Open source Sanskrit", "मूल संस्कृत देखें")} ↗</a></details></div>}
      {scene === 3 && <div className="story-action-scene"><span className="story-eyebrow">{t("BRING IT INTO TODAY", "आज के दिन में अपनाएँ")}</span><h1 ref={heading} tabIndex={-1}><BilingualText text={step.title} language={language}/></h1><p><BilingualText text={step.body} language={language}/></p><div className="story-action-card"><small>{t("ONE POSSIBLE STEP", "एक संभव कदम")}</small><strong><BilingualText text={lesson.action} language={language}/></strong></div><p className="story-scene-footnote">{t("A personal prompt, not a measure of spiritual progress. You can finish without writing anything.", "यह निजी अभ्यास है, आध्यात्मिक प्रगति का पैमाना नहीं। कुछ लिखे बिना भी पाठ पूरा कर सकते हैं।")}</p><Link className="story-reflect-link" to={`/alpha/reflection/${lesson.id}?from=reading`}>{t("Write a private thought (optional)", "निजी विचार लिखें (वैकल्पिक)")} ↗</Link></div>}
      {scene === 4 && <div className="story-end-scene">
        <span className="story-eyebrow">{t("READING COMPLETE", "पाठ पूरा हुआ")}</span>
        <h1 ref={heading} tabIndex={-1}>{t("Let this be enough for now.", "अभी के लिए इतना काफ़ी है।")}</h1>
        <p>{t("If you want a path for next time, choose what feels useful. You can leave it undecided.", "अगली बार के लिए चाहें तो अपनी राह चुनें। अभी तय करना ज़रूरी नहीं है।")}</p>
        <div className="story-reading-choice" role="group" aria-label={t("Choose your next reading", "अगला पाठ चुनें")}>
          <button type="button" onClick={() => chooseNextTime("repeat")}><strong>{t("Stay with this passage", "इसी पाठ के साथ रहें")}</strong><span>{t("Return to it when you are ready.", "जब चाहें, इस पर फिर लौटें।")}</span></button>
          <button type="button" onClick={() => chooseNextTime("next")}><strong>{t("Continue to another", "अगले पाठ पर जाएँ")}</strong><span>{language === "hi" ? nextChapter.hi : nextChapter.en}</span></button>
        </div>
        <div className="story-end-actions">
          <Link to="/alpha/today">{t("Return to Today without choosing", "बिना चुने आज पर लौटें")} →</Link>
          <button type="button" onClick={keep} disabled={saved}>{saved ? t("In Saved", "सहेजा हुआ") : t("Save this reading", "यह पाठ सहेजें")}</button>
          <Link to="/alpha/my-day">{t("Open Saved", "सहेजे हुए देखें")} ↗</Link>
          <button className="story-undo-read" type="button" onClick={undoFinish}>{t("Undo read mark", "पढ़ा हुआ निशान हटाएँ")}</button>
        </div>
        <p role="status">{savedNotice}</p>
      </div>}
    </motion.div>
    {scene < 4 && <footer className="story-player-controls"><button type="button" className="story-back" onClick={() => setScene(scene - 1)} disabled={scene === 0}>{t("Previous", "पीछे")}</button><span>{scene + 1} / 4</span><button type="button" className="story-gold-button" onClick={() => scene === 3 ? finish() : setScene(scene + 1)}>{scene === 3 ? t("Finish reading", "पाठ पूरा करें") : t("Continue", "आगे बढ़ें")} <span aria-hidden="true">→</span></button></footer>}
  </div>;
}
