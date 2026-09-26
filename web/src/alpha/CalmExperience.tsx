import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { searchLessons } from "../lib/lessonSearch";
import { chooseToday } from "./calmModel";
import { localDay, useWisdom } from "./Wisdom";
import { readingHref } from "./wisdomState";
import { glideSpring, touchFeedback, useMotionSettings } from "./MotionSystem";
import "./calm-experience.css";

const filters = [
  { value: "all", en: "All", hi: "सभी" },
  { value: "purpose", en: "Work", hi: "कर्म" },
  { value: "balance", en: "Balance", hi: "संतुलन" },
  { value: "attention", en: "Attention", hi: "ध्यान" },
] as const;

function useReadingLanguage() {
  const { state, error, update, timeZone } = useWisdom();
  const language = state.language;
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const setReadingLanguage = (next: "en" | "hi") => {
    if (next !== language && update(current => ({ ...current, language: next }))) {
      window.dispatchEvent(new Event("spritual-alpha-language"));
    }
  };
  const changeLanguage = () => setReadingLanguage(language === "hi" ? "en" : "hi");
  return { state, error, timeZone, language, t, changeLanguage, setReadingLanguage };
}

function LanguageButton({ language, onClick }: { language: "en" | "hi"; onClick: () => void }) {
  return <button className="calm-language" type="button" onClick={onClick} aria-label={language === "hi" ? "Switch to English" : "हिन्दी में पढ़ें"}>{language === "hi" ? "EN" : "हिं"}<span aria-hidden="true">⇄</span></button>;
}

export function CalmToday() {
  const { state, error, timeZone, language, t, setReadingLanguage } = useReadingLanguage();
  const { reduced } = useMotionSettings();
  const today = localDay(timeZone);
  const selection = chooseToday(state, lessons, today, timeZone);
  const { lesson, kind, href } = selection;
  // A deliberate small step takes precedence over a reading bookmark; lesson order stays stable.
  const savedLesson = lessons.find(item => state.kept[item.id]?.day === today && state.kept[item.id]?.kind === "practice")
    ?? lessons.find(item => state.kept[item.id]?.day === today);
  const savedToday = savedLesson ? state.kept[savedLesson.id] : undefined;
  const savedCue = savedToday?.kind === "practice" && savedToday.cue
    ? { "after-breakfast": t("After breakfast", "नाश्ते के बाद"), "before-work": t("Before work or study", "काम या पढ़ाई से पहले"), evening: t("During my evening pause", "शाम के विराम में") }[savedToday.cue]
    : undefined;
  const headline = kind === "active" ? t("Your place is here.", "आपकी जगह यहीं है।")
    : kind === "repeat" ? t("Stay with this thought.", "इसी विचार के साथ रहें।")
    : kind === "next" ? t("Another reading awaits.", "अगला पाठ आपका इंतज़ार करे।")
    : kind === "completed" ? t("A good place to pause.", "यहीं ठहरना भी अच्छा है।")
    : kind === "returning" ? t("Welcome back.", "फिर से स्वागत है।")
    : t("A little space for today.", "आज के लिए थोड़ा समय।");
  const action = kind === "active" ? t("Continue reading", "पढ़ना जारी रखें")
    : kind === "repeat" ? t("Read this again", "इसे फिर पढ़ें")
    : kind === "next" ? t("Begin next reading", "अगला पाठ शुरू करें")
    : kind === "completed" ? t("Read again", "फिर पढ़ें")
    : t("Begin reading", "पढ़ना शुरू करें");
  const introduction = kind === "repeat" ? t("You chose to return to this passage. It will be here when you are ready.", "आपने इसी पाठ पर लौटने का विकल्प चुना है। जब तैयार हों, यह यहीं मिलेगा।")
    : kind === "next" ? t("You chose another passage. Begin whenever it feels right.", "आपने अगला पाठ चुना है। जब ठीक लगे, शुरू करें।")
    : kind === "completed" ? t("You can leave this thought here and return whenever you like.", "यह विचार यहीं रख सकते हैं। जब चाहें फिर लौटें।")
    : t("One reading is enough. Take what is useful into your day.", "एक पाठ काफ़ी है। जो काम आए, उसे दिन में साथ रखें।");

  return <div className="calm-page calm-today" lang={language}>
    <header className="calm-page-head"><div><span className="calm-eyebrow">{t("TODAY", "आज")}</span><h1>{headline}</h1><p>{introduction}</p></div></header>
    <div className="calm-language-choice" role="group" aria-label="Reading language / पढ़ने की भाषा">
      <span>Read in / पढ़ें</span>
      <div>
        <button type="button" lang="en" aria-pressed={language === "en"} disabled={!!error} onClick={() => setReadingLanguage("en")}>English</button>
        <button type="button" lang="hi" aria-pressed={language === "hi"} disabled={!!error} onClick={() => setReadingLanguage("hi")}>हिन्दी</button>
      </div>
    </div>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <motion.section
      className="calm-feature"
      aria-labelledby="calm-feature-title"
      data-kind={kind}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={glideSpring}
    >
      <div className="calm-feature-image"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" alt={t("Illustrated chariot in the Gita setting", "गीता के प्रसंग में रथ का चित्र")} /></div>
      <div className="calm-feature-body"><div className="calm-feature-meta"><span>{lesson.reference}</span><span>{t("ABOUT 3 MIN READ", "लगभग ३ मिनट का पाठ")}</span></div><span className="calm-status">{kind === "active" ? t("CONTINUE WHERE YOU LEFT OFF", "जहाँ रुके थे, वहीं से") : kind === "repeat" ? t("YOUR CHOSEN PASSAGE", "आपका चुना पाठ") : kind === "next" ? t("NEXT, WHEN YOU ARE READY", "जब तैयार हों, अगला पाठ") : kind === "completed" ? t("READ TODAY", "आज पढ़ा") : t("A READING FOR THIS MOMENT", "इस पल के लिए एक पाठ")}</span><h2 id="calm-feature-title">{lesson.title[language]}</h2><p>{lesson.subtitle[language]}</p><Link className="calm-primary" to={href} onClick={() => void touchFeedback(reduced)}>{action}<Icon name="arrow" size={19}/></Link></div>
    </motion.section>
    {savedLesson && savedToday && <Link className="calm-return" to={savedToday.kind === "bookmark" ? readingHref(savedLesson.id, state.resume) : "/alpha/my-day"}><span><small>{savedToday.kind === "bookmark" ? t("SAVED READING", "सहेजा हुआ पाठ") : t("YOUR SMALL STEP", "आपका छोटा कदम")}{savedCue ? ` · ${savedCue}` : ""}</small><strong>{savedLesson.title[language]}</strong></span><span>{savedToday.kind === "bookmark" ? t("Open reading", "पाठ खोलें") : t("Open small step", "छोटा कदम देखें")} <Icon name="arrow" size={16}/></span></Link>}
    <section className="calm-next" aria-labelledby="calm-next-heading">
      <div className="calm-next-heading"><span className="calm-eyebrow">{t("MAKE IT YOURS", "अपनी तरह से पढ़ें")}</span><h2 id="calm-next-heading">{t("Another way in.", "शुरू करने का एक और रास्ता।")}</h2></div>
      <div className="calm-next-grid">
        <Link className="calm-next-item calm-next-question" to="/alpha/life"><span className="calm-next-symbol" aria-hidden="true">?</span><span><small>{t("FROM LIFE TO WISDOM", "जीवन से सीख तक")}</small><strong>{t("Start with a question", "किसी सवाल से शुरू करें")}</strong><em>{t("Find a passage in the three available readings.", "तीन उपलब्ध पाठों में संबंधित श्लोक खोजें।")}</em></span><Icon name="arrow" size={19}/></Link>
        <Link className="calm-next-item calm-next-story" to="/alpha/stories/arjuna-bow"><span className="calm-next-symbol" aria-hidden="true"><Icon name="book" size={23}/></span><span><small>{t("BEFORE THE TEACHING", "उपदेश से पहले")}</small><strong>{t("Read Arjuna’s story", "अर्जुन की कथा पढ़ें")}</strong><em>{t("Meet the moment behind the Gita, with sources beside it.", "मूल स्रोत के साथ गीता का प्रसंग जानें।")}</em></span><Icon name="arrow" size={19}/></Link>
      </div>
      <div className="calm-next-footer"><Link className="calm-all-readings" to="/alpha/library">{t("Choose another reading", "दूसरा पाठ चुनें")} <Icon name="arrow" size={17}/></Link><Link className="calm-all-readings" to="/alpha/practice">{t("Take a quiet pause", "शांत विराम लें")} <Icon name="arrow" size={17}/></Link></div>
    </section>
    <p className="calm-disclosure">{t("Local preview · Three source-linked Gita selections. Editorial explanations await human review.", "स्थानीय पूर्वावलोकन · स्रोत से जुड़े गीता के तीन पाठ। मौलिक व्याख्याओं की मानवीय समीक्षा बाकी है।")}</p>
  </div>;
}

export function CalmExplore() {
  const { state, error, language, t, changeLanguage } = useReadingLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const visible = searchLessons(lessons, query, filter);

  return <div className="calm-page calm-explore" lang={language}>
    <header className="calm-page-head"><div><span className="calm-eyebrow">{t("EXPLORE", "खोजें")}</span><h1>{t("Follow what matters.", "जो ज़रूरी लगे, उसे पढ़ें।")}</h1><p>{t("Begin with a question, a story, or a passage. There is no required order.", "सवाल, कथा या श्लोक से शुरू करें। कोई तय क्रम नहीं है।")}</p></div><LanguageButton language={language} onClick={changeLanguage}/></header>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <Link className="calm-question-link" to="/alpha/life"><span><small>{t("BEGIN WITH LIFE", "जीवन से शुरुआत")}</small><strong>{t("What’s on your mind?", "मन में क्या चल रहा है?")}</strong><em>{t("Find a source-linked passage in this small collection.", "इस छोटे संग्रह में स्रोत से जुड़ा श्लोक खोजें।")}</em></span><Icon name="arrow" size={20}/></Link>
    <section className="calm-readings" aria-labelledby="calm-readings-heading"><div className="calm-section-heading"><div><span className="calm-eyebrow">{t("AVAILABLE READINGS", "उपलब्ध पाठ")}</span><h2 id="calm-readings-heading">{t("Three passages.", "तीन श्लोक।")}</h2></div><Link to="/alpha/series/gita">{t("See guided journey", "साथ पढ़ने की यात्रा")} ↗</Link></div>
      <label className="calm-search">{t("Search readings", "पाठ खोजें")}<span><Icon name="search" size={19}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Try a theme or verse number", "विषय या श्लोक संख्या लिखें")}/></span></label>
      <div className="calm-filters" role="group" aria-label={t("Filter readings", "पाठ छाँटें")}>{filters.map(item => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item[language]}</button>)}</div>
      <div className="calm-reading-list">{visible.map((lesson, index) => <Link key={lesson.id} to={readingHref(lesson.id, state.resume)}><span className="calm-reading-index">{String(index + 1).padStart(2, "0")}</span><span><small>{lesson.reference} · {lesson.theme[language]}</small><strong>{lesson.title[language]}</strong><em>{lesson.subtitle[language]}</em></span><Icon name="arrow" size={19}/></Link>)}{visible.length === 0 && <div className="calm-no-results"><p>{t("No match in these three readings.", "इन तीन पाठों में मेल नहीं मिला।")}</p><button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>{t("Show all readings", "सभी पाठ देखें")}</button></div>}</div>
    </section>
    <section className="calm-explore-story" aria-labelledby="calm-story-heading"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" loading="lazy" alt=""/><div><span className="calm-eyebrow">{t("A SHORT STORY · BHAGAVAD GITA", "एक छोटी कथा · भगवद्गीता")}</span><h2 id="calm-story-heading">{t("Before the teaching", "उपदेश से पहले")}</h2><p>{t("The moment Arjuna sets down his bow. Read at your own pace, with the source beside the telling.", "जब अर्जुन धनुष रख देते हैं। अपनी गति से पढ़ें; कथा के साथ मूल स्रोत भी देखें।")}</p><Link to="/alpha/stories/arjuna-bow">{t("Read the story", "कथा पढ़ें")} <Icon name="arrow" size={17}/></Link></div></section>
    <p className="calm-disclosure">{t("These are three Gita selections, not a complete scripture library. Interpretations are original demos awaiting human review; each reading links to its source.", "ये गीता के तीन चुने हुए पाठ हैं, पूरा ग्रंथ-संग्रह नहीं। मौलिक व्याख्याओं की मानवीय समीक्षा बाकी है; हर पाठ में स्रोत का लिंक है।")}</p>
  </div>;
}
