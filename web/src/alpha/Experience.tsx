import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import { readingHref } from "./wisdomState";
import { searchLessons } from "../lib/lessonSearch";
import { ImmersiveHero, IntentionPortals, GitaReel } from "./ImmersiveModules";
import "./life-entry.css";

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
      <section className="life-entry" aria-labelledby="life-entry-heading"><div><span>{t("ANOTHER WAY TO BEGIN", "शुरू करने का एक और तरीका")}</span><h2 id="life-entry-heading">{t("Start with life. Find a source.", "जीवन से शुरू करें। स्रोत तक पहुँचें।")}</h2><p>{t("Tell us what is on your mind. Explore a related teaching from the three source-linked Gita passages available here.", "मन की बात लिखें। यहाँ उपलब्ध गीता के तीन स्रोत-संबद्ध श्लोकों में कोई जुड़ी सीख खोजें।")}</p></div><Link to="/alpha/life">{t("Find wisdom for a moment", "अपनी स्थिति से सीख खोजें")}<Icon name="arrow" size={19}/></Link></section>
    </>}
    {explore && <><p className="experience-intro">{t("Ancient words. Everyday questions. Start where you are.", "प्राचीन शब्द। रोज़ के सवाल। जहाँ हैं, वहीं से शुरू करें।")}</p><Link to="/alpha/life" className="life-explore-link"><span><small>{t("BEGIN WITH YOUR QUESTION", "अपने सवाल से शुरू करें")}</small><strong>{t("Find a teaching for this moment", "इस पल के लिए कोई सीख खोजें")}</strong></span><Icon name="arrow" size={20}/></Link><Link to="/alpha/stories/arjuna-bow" className="before-explore-link"><img src="/art/gita-chariot-cover-v1.webp" alt="" loading="lazy"/><span><small>{t("A SOURCE-LINKED STORY · 3 MOMENTS", "स्रोत से जुड़ी कथा · ३ चरण")}</small><strong>{t("Before the teaching", "उपदेश से पहले")}</strong><em>{t("Why Arjuna laid down his bow", "अर्जुन ने धनुष क्यों रखा")}</em></span><Icon name="arrow" size={20}/></Link><label className="experience-search"><Icon name="search"/><input type="search" aria-label={t("Search readings", "पाठ खोजें")} placeholder={t("Search a thought or verse…", "विचार या श्लोक खोजें…")} value={query} onChange={e => setQuery(e.target.value)}/></label><div className="experience-filters" role="group" aria-label={t("Reading theme", "पाठ का विषय")}>{topics.map((topic, i) => <button key={i} aria-pressed={filter === i} onClick={() => setFilter(i)}>{topic[hi ? 1 : 0]}</button>)}</div></>}
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
