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
import "./devotional-experience.css";

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
  const change = (next: "en" | "hi") => {
    if (next !== language && update(current => ({ ...current, language: next }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };
  return { state, error, timeZone, language, t, change };
}

function Language({ language, change, disabled }: { language: "en" | "hi"; change: (language: "en" | "hi") => void; disabled: boolean }) {
  return <div className="dev-language" role="group" aria-label="Reading language / पढ़ने की भाषा">
    <button type="button" lang="en" aria-pressed={language === "en"} disabled={disabled} onClick={() => change("en")}>English</button>
    <button type="button" lang="hi" aria-pressed={language === "hi"} disabled={disabled} onClick={() => change("hi")}>हिन्दी</button>
  </div>;
}

export function DevotionalToday() {
  const { state, error, timeZone, language, t, change } = useReadingLanguage();
  const { reduced } = useMotionSettings();
  const day = localDay(timeZone);
  const { lesson, kind, href } = chooseToday(state, lessons, day, timeZone);
  const savedLesson = lessons.find(item => state.kept[item.id]?.day === day && state.kept[item.id]?.kind === "practice") ?? lessons.find(item => state.kept[item.id]?.day === day);
  const saved = savedLesson ? state.kept[savedLesson.id] : undefined;
  const cue = saved?.kind === "practice" && saved.cue ? { "after-breakfast": t("After breakfast", "नाश्ते के बाद"), "before-work": t("Before work or study", "काम या पढ़ाई से पहले"), evening: t("During my evening pause", "शाम के विराम में") }[saved.cue] : undefined;
  const action = kind === "active" ? t("Continue this reading", "यह पाठ आगे पढ़ें") : kind === "repeat" ? t("Return to this verse", "इस श्लोक पर लौटें") : kind === "next" ? t("Begin the next reading", "अगला पाठ शुरू करें") : t("Sit with this verse", "इस श्लोक के साथ ठहरें");
  const invitation = kind === "active" ? t("PICK UP THE THREAD", "जहाँ रुके थे, वहीं से") : kind === "repeat" ? t("A PASSAGE YOU CHOSE", "आपका चुना श्लोक") : kind === "next" ? t("WHEN YOU ARE READY", "जब आप तैयार हों") : t("ONE TEACHING FOR TODAY", "आज की एक सीख");
  return <div className="dev-page dev-today" lang={language}>
    <header className="dev-today-top"><div><span className="dev-kicker">{t("TODAY · A QUIET MOMENT", "आज · एक शांत पल")}</span><h1>{t("Begin here.", "यहीं से शुरू करें।")}</h1></div><Language language={language} change={change} disabled={!!error}/></header>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <motion.section className="dev-moment" aria-labelledby="dev-moment-title" initial={reduced ? false : { opacity: .92, y: 9 }} animate={{ opacity: 1, y: 0 }} transition={reduced ? { duration: 0 } : glideSpring}>
      <img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" alt={t("Illustrated Gita chariot at sunrise", "सूर्योदय के समय गीता के रथ का चित्र")} fetchPriority="high"/>
      <div className="dev-moment-shade" aria-hidden="true"/>
      <div className="dev-moment-copy"><div className="dev-moment-meta"><span>{invitation}</span><span>{t("3 MIN", "३ मिनट")}</span></div><p className="dev-moment-source">{lesson.reference}</p><h2 id="dev-moment-title">{lesson.title[language]}</h2><p className="dev-moment-subtitle">{lesson.subtitle[language]}</p><Link className="dev-primary" to={href} onClick={() => void touchFeedback(reduced)}>{action}<Icon name="arrow" size={19}/></Link></div>
    </motion.section>
    {savedLesson && saved && <Link className="dev-continuity" to={saved.kind === "bookmark" ? readingHref(savedLesson.id, state.resume) : "/alpha/my-day"}><span><small>{saved.kind === "bookmark" ? t("YOUR SAVED READING", "आपका सहेजा पाठ") : t("YOUR SMALL STEP", "आपका छोटा कदम")}{cue ? ` · ${cue}` : ""}</small><strong>{savedLesson.title[language]}</strong></span><Icon name="arrow" size={20}/></Link>}
    <section className="dev-discover" aria-labelledby="dev-discover-title"><div><span className="dev-kicker">{t("GO DEEPER, WHEN YOU WISH", "चाहें तो आगे बढ़ें")}</span><h2 id="dev-discover-title">{t("There is more to explore.", "आगे पढ़ने को और भी है।")}</h2></div><Link to="/alpha/library">{t("Explore the collection", "संग्रह देखें")} <Icon name="arrow" size={18}/></Link></section>
    <p className="dev-disclosure">{t("Local preview · Three source-linked Gita selections. Original explanations await human review.", "स्थानीय पूर्वावलोकन · स्रोत से जुड़े गीता के तीन पाठ। मौलिक व्याख्याओं की मानवीय समीक्षा बाकी है।")}</p>
  </div>;
}

export function DevotionalExplore() {
  const { state, error, language, t, change } = useReadingLanguage();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const visible = searchLessons(lessons, query, filter);
  return <div className="dev-page dev-explore" lang={language}>
    <header className="dev-explore-top"><div><span className="dev-kicker">{t("EXPLORE", "खोजें")}</span><h1>{t("Follow what matters.", "जो ज़रूरी लगे, उसे पढ़ें।")}</h1><p>{t("A small, source-linked collection to enter at your own pace.", "स्रोत से जुड़ा छोटा संग्रह, अपनी गति से पढ़ें।")}</p></div><Language language={language} change={change} disabled={!!error}/></header>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <Link className="dev-collection" to="/alpha/series/gita"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" loading="lazy" alt=""/><span className="dev-collection-shade" aria-hidden="true"/><span className="dev-collection-copy"><small>{t("SCRIPTURE · 3 AVAILABLE READINGS", "ग्रंथ · अभी ३ पाठ")}</small><strong>{t("The Bhagavad Gita", "भगवद्गीता")}</strong><span>{t("Three moments for work, balance and attention.", "कर्म, संतुलन और ध्यान पर तीन प्रसंग।")}</span><em>{t("Open the guided reading", "साथ पढ़ना शुरू करें")} <Icon name="arrow" size={17}/></em></span></Link>
    <section className="dev-reading-index" aria-labelledby="dev-readings-title"><div className="dev-section-head"><span className="dev-kicker">{t("READ A PASSAGE", "श्लोक पढ़ें")}</span><h2 id="dev-readings-title">{t("Begin with one verse.", "एक श्लोक से शुरू करें।")}</h2></div><label className="dev-search">{t("Find a verse or theme", "श्लोक या विषय खोजें")}<span><Icon name="search" size={19}/><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={t("Try 2.47 or balance", "२.४७ या संतुलन लिखें")}/></span></label><div className="dev-filters" role="group" aria-label={t("Filter readings", "पाठ छाँटें")}>{filters.map(item => <button type="button" key={item.value} aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>{item[language]}</button>)}</div><div className="dev-reading-list">{visible.map(lesson => <Link key={lesson.id} to={readingHref(lesson.id, state.resume)}><span className="dev-reading-ref">{lesson.reference.replace("Bhagavad Gita ", "")}</span><span><strong>{lesson.title[language]}</strong><small>{lesson.theme[language]}</small></span><Icon name="arrow" size={19}/></Link>)}{visible.length === 0 && <div className="dev-no-results"><p>{t("No match in these three readings.", "इन तीन पाठों में मेल नहीं मिला।")}</p><button type="button" onClick={() => { setFilter("all"); setQuery(""); }}>{t("Show all readings", "सभी पाठ देखें")}</button></div>}</div></section>
    <section className="dev-other-paths" aria-labelledby="dev-paths-title"><span className="dev-kicker">{t("ANOTHER WAY IN", "शुरुआत का एक और रास्ता")}</span><h2 id="dev-paths-title">{t("From story or from life.", "कथा से या जीवन से।")}</h2><Link to="/alpha/stories/arjuna-bow"><span><small>{t("AN ORIGINAL RETELLING · GITA 1.24–1.47", "मौलिक पुनर्कथन · गीता १.२४–१.४७")}</small><strong>{t("Before the teaching", "उपदेश से पहले")}</strong><em>{t("The human moment before Krishna speaks.", "कृष्ण के उपदेश से पहले का मानवीय प्रसंग।")}</em></span><Icon name="arrow" size={19}/></Link><Link to="/alpha/life"><span><small>{t("START WITH YOUR QUESTION", "अपने सवाल से शुरू करें")}</small><strong>{t("What’s on your mind?", "मन में क्या चल रहा है?")}</strong><em>{t("Find one relevant passage in this collection.", "इस संग्रह में एक संबंधित श्लोक खोजें।")}</em></span><Icon name="arrow" size={19}/></Link></section>
    <p className="dev-disclosure">{t("This is not a complete scripture library. The three Gita explanations and the original story await human editorial and rights review.", "यह पूरा ग्रंथ-संग्रह नहीं है। गीता की तीन व्याख्याओं और मौलिक कथा की मानवीय संपादकीय व अधिकार समीक्षा बाकी है।")}</p>
  </div>;
}
