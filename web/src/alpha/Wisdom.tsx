import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "motion/react";
import { lessons, type Language } from "../data/lessons";
import { useAlpha } from "./context";
import { glideSpring, useMotionSettings } from "./MotionSystem";
import "./wisdom.css";
import "./calm-saved.css";

import { freshWisdom as fresh, parseWisdom, mutateWisdomStorage, markPracticeTried, setPracticeCue, choosePractice, type PracticeCue } from "./wisdomState";
import type { WisdomState } from "./wisdomState";
export type { WisdomState } from "./wisdomState";
const keyFor = (actorId: string) => `spritual_alpha_wisdom_v1_${actorId}`;
const parse = (raw: string | null) => parseWisdom(raw, lessons.map(lesson => lesson.id));
function read(key: string): { state: WisdomState; error: string } {
  try { return { state: parse(localStorage.getItem(key)), error: "" }; }
  catch { return { state: fresh(), error: "Reading data is unavailable. Changes are paused to protect what is saved in this browser." }; }
}
export function useWisdom() {
  const { actor, prefs } = useAlpha();
  const key = keyFor(actor.id);
  const [snapshot, setSnapshot] = useState(() => ({ key, ...read(key) }));
  // Never render the previous demo identity's private practice while the actor changes.
  const current = snapshot.key === key ? snapshot : { key, ...read(key) };
  const { state, error } = current;
  useEffect(() => { setSnapshot({ key, ...read(key) }); }, [key]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== key) return;
      setSnapshot({ key, ...read(key) });
    };
    const reset = (event: Event) => {
      if ((event as CustomEvent<{ actorId: string }>).detail?.actorId === actor.id)
        setSnapshot({ key, ...read(key) });
    };
    window.addEventListener("storage", sync);
    window.addEventListener("spritual-alpha-wisdom-reset", reset);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("spritual-alpha-wisdom-reset", reset); };
  }, [key, actor.id]);
  const update = (change: (latest: WisdomState) => WisdomState) => {
    if (error) return false;
    try {
      const next = mutateWisdomStorage(localStorage, key, lessons.map(lesson => lesson.id), change);
      setSnapshot({ key, state: next, error: "" }); return true;
    } catch { setSnapshot({ key, state, error: "Could not save on this device. Your earlier reading data was left untouched." }); return false; }
  };
  return { state, error, update, timeZone: prefs.timeZone };
}
const feature = [
  { id: "gita-2-47", label: "When outcomes feel uncertain", hi: "जब नतीजा अनिश्चित लगे", color: "amber" },
  { id: "gita-2-48", label: "When you need balance", hi: "जब संतुलन चाहिए", color: "sage" },
  { id: "gita-6-26", label: "When your mind wanders", hi: "जब मन भटके", color: "indigo" },
] as const;
export const localDay = (timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find(p => p.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
function Lang({ language, change }: { language: Language; change: (l: Language) => void }) {
  return <div className="wisdom-language" role="group" aria-label="Reading language"><button aria-pressed={language === "en"} onClick={() => { change("en"); window.dispatchEvent(new Event("spritual-alpha-language")); }}>English</button><button aria-pressed={language === "hi"} onClick={() => { change("hi"); window.dispatchEvent(new Event("spritual-alpha-language")); }}>हिन्दी</button></div>;
}
function Disclose({ error }: { error: string }) { return error ? <p role="alert" className="alpha-error">{error}</p> : null; }
function LessonArt({ theme, small = false }: { theme: string; small?: boolean }) {
  return <div className={`wisdom-art wisdom-art-${theme} ${small ? "wisdom-art-small" : ""}`} aria-hidden="true"><span className="wisdom-art-sun"/><span className="wisdom-art-arch"/><span className="wisdom-art-horizon"/></div>;
}
function JourneyTeaser({ language, completed }: { language: Language; completed: number }) {
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <Link to="/alpha/series/gita" className="wisdom-journey-teaser"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" loading="lazy" alt=""/><span className="wisdom-journey-teaser-copy"><small>{t("A GUIDED GITA JOURNEY", "गीता के साथ एक यात्रा")} · {completed}/3 {t("read", "पढ़े")}</small><strong>{t("Three questions for real life.", "जीवन के तीन सच्चे सवाल।")}</strong><span>{t("Four short moments in each reading. Start anywhere.", "हर पाठ में चार छोटे चरण। कहीं से भी शुरू करें।")}</span><b>{t("Open the journey", "यात्रा खोलें")} ↗</b></span></Link>;
}
export function WisdomWelcome() {
  const { state, update } = useWisdom();
  const language = state.language;
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-welcome" lang={language}>
    <div className="wisdom-welcome-art"><img src="/art/river-sanctuary-v1.webp" alt="" width="1536" height="1024"/><div className="wisdom-art-overlay"/><div className="wisdom-welcome-copy"><span className="wisdom-overline">SPRITUAL · A LITTLE, EVERY DAY</span><h1>{t("Wisdom you can", "ऐसी सीख जो")}<br/><em>{t("live with.", "जीवन में उतरे।")}</em></h1><p>{t("Read one shloka. Understand its place. Carry one small idea into your day.", "एक श्लोक पढ़ें। उसका संदर्भ समझें। एक छोटा विचार आज के दिन में अपनाएँ।")}</p><Link className="wisdom-primary" to="/alpha/today">{t("Begin with today", "आज से शुरू करें")} <span aria-hidden="true">↗</span></Link></div></div>
    <div className="wisdom-welcome-bottom"><div><span className="wisdom-overline">{t("BEGIN AT YOUR OWN PACE", "अपनी गति से शुरू करें")}</span><p>{t("Three source-linked Gita lessons in English and Hindi. No account or payment to begin.", "स्रोत से जुड़े गीता के तीन पाठ, अंग्रेज़ी और हिंदी में। शुरुआत के लिए खाता या भुगतान नहीं चाहिए।")}</p></div><Lang language={language} change={l=>update(v=>({...v,language:l}))}/><Link to="/alpha/program">{t("I have a community invitation", "मेरे पास समुदाय का निमंत्रण है")} <span aria-hidden="true">→</span></Link></div>
    <p className="wisdom-footnote">{t("Original explanations are demonstration material awaiting human review. Other texts and human audio are not available in this alpha.", "मौलिक व्याख्याएँ अभी नमूना सामग्री हैं और मानवीय समीक्षा बाकी है। दूसरे ग्रंथ और मानव स्वर में ऑडियो अभी उपलब्ध नहीं हैं।")}</p>
  </div>;
}
export function WisdomToday() {
  const { state, error, update, timeZone } = useWisdom();
  const language = state.language;
  const day = localDay(timeZone);
  const todaysIndex = Number(day.replaceAll("-", "")) % lessons.length;
  const selected = lessons[todaysIndex];
  const current = Object.entries(state.kept).find(([, record]) => record.day === day);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className={`wisdom-home ${current ? "wisdom-home-returning" : ""}`} lang={language}>
    <header className="wisdom-home-header"><div><span className="wisdom-overline">{t("YOUR QUIET CORNER", "आपका शांत स्थान")} · {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</span><h1>{language === "hi" ? "आज क्या साथ ले जाएँ?" : "A thought for today."}</h1><p>{t("Read it. Understand it. Let it shape one small moment.", "पढ़ें, समझें, और एक छोटा कदम अपनाएँ।")}</p></div><Lang language={language} change={l => update(s => ({ ...s, language: l }))}/></header>
    <Disclose error={error}/>
    {current && <Link to="/alpha/my-day" className="wisdom-return"><span className="wisdom-return-icon" aria-hidden="true">↗</span><span><strong>{current[1].kind === "bookmark" ? t("Your saved reading", "आपका सहेजा हुआ पाठ") : t("Your small step", "आपका छोटा कदम")}</strong><small>{lessons.find(l => l.id === current[0])?.title[language]} · {current[1].triedAt ? t("Tried today", "आज आज़माया") : current[1].kind === "bookmark" ? t("For reading", "पढ़ने के लिए") : t("Carry it with you", "साथ रखें")}</small></span><span aria-hidden="true">→</span></Link>}
    <Link className="wisdom-feature" to={`/alpha/wisdom/${selected.id}`}><div className="wisdom-feature-image"><img src="/art/river-sanctuary-v1.webp" alt="" width="1536" height="1024"/><div className="wisdom-feature-shade"/><div className="wisdom-feature-top"><span>{t("THE BHAGAVAD GITA", "भगवद्गीता")}</span><span>{selected.reference.replace("Bhagavad Gita ", "")}</span></div><span className="wisdom-feature-script">{selected.steps.find(s => s.kind === "verse")?.script?.split("\n")[0]}</span></div><div className="wisdom-feature-content"><span className="wisdom-overline">{t("TODAY’S READ · FROM 3 SAMPLE LESSONS", "आज का पाठ · 3 नमूना पाठों में से")}</span><h2>{selected.title[language]}</h2><p>{selected.subtitle[language]}</p><span className="wisdom-feature-cta">{t("Read this shloka", "यह श्लोक पढ़ें")} <span aria-hidden="true">↗</span></span></div></Link>
    <JourneyTeaser language={language} completed={Object.keys(state.finished || {}).length}/>
    <section className="wisdom-browse"><div className="wisdom-section-head"><div><span className="wisdom-overline">{t("START WHERE LIFE IS", "यहीं से शुरुआत करें")}</span><h2>{language === "hi" ? "अभी आपके मन में क्या है?" : "What’s on your mind?"}</h2></div><Link to="/alpha/library">{t("All lessons", "सभी पाठ")} →</Link></div><div className="wisdom-topic-grid">{feature.map((item,i) => { const lesson = lessons.find(l => l.id === item.id)!; return <Link to={`/alpha/wisdom/${item.id}`} className="wisdom-topic" key={item.id}><LessonArt theme={item.color} small/><span className="wisdom-topic-copy"><small>{String(i+1).padStart(2,"0")} · {lesson.reference}</small><strong>{language === "hi" ? item.hi : item.label}</strong><span>{lesson.title[language]} <b aria-hidden="true">↗</b></span></span></Link>; })}</div></section>
    <section className="wisdom-community"><div><span className="wisdom-overline">{t("PRACTISE TOGETHER", "साथ में अभ्यास")}</span><h2>{t("A familiar thread,", "एक परिचित साथ,")}<br/><em>{t("between gatherings.", "मुलाक़ातों के बीच भी।")}</em></h2><p>{t("Have an invitation from a teacher or community? Your shared program lives here. Private reflections stay yours.", "शिक्षक या समुदाय से निमंत्रण मिला है? आपका साझा कार्यक्रम यहाँ है। निजी विचार सिर्फ़ आपके हैं।")}</p><Link to="/alpha/program">{t("Open my community space", "मेरा समुदाय देखें")} →</Link></div><span className="wisdom-community-glyph" aria-hidden="true">✧</span></section>
    <p className="wisdom-footnote">{t("These three Gita samples have source-linked Sanskrit and original, unreviewed explanations. No verse audio or AI teacher is claimed.", "इन तीन गीता पाठों में स्रोत से जुड़ा संस्कृत पाठ और मौलिक, अभी समीक्षा-रहित व्याख्या है। श्लोक का ऑडियो या AI शिक्षक उपलब्ध नहीं है।")}</p>
  </div>;
}
export function WisdomLibrary() {
  const {state,error,update}=useWisdom();
  const [query,setQuery]=useState("");
  const language=state.language;
  const matches=useMemo(()=>lessons.filter(l => `${l.reference} ${l.title.en} ${l.title.hi} ${l.theme.en} ${l.theme.hi}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),[query]);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-library" lang={language}><header className="wisdom-library-head"><span className="wisdom-overline">{t("THE LIBRARY · CURRENTLY 3 LESSONS", "पाठशाला · अभी 3 पाठ")}</span><h1>{t("Begin with", "शुरू करें")}<br/><em>{t("what matters now.", "जो अभी ज़रूरी है।")}</em></h1><p>{t("Browse the available Gita readings. Ramayana and the Vedas need reviewed text, source and rights work before they can be offered here.", "अभी उपलब्ध गीता के पाठ पढ़ें। रामायण और वेद जोड़ने से पहले पाठ, स्रोत और अधिकारों की समीक्षा ज़रूरी है।")}</p><Lang language={language} change={l=>update(s=>({...s,language:l}))}/></header><Disclose error={error}/><JourneyTeaser language={language} completed={Object.keys(state.finished || {}).length}/><label className="wisdom-search">{t("Find a lesson or reference", "पाठ या श्लोक संख्या खोजें")}<input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("Try balance, attention, or 2.47", "संतुलन, ध्यान या 2.47 लिखें")} type="search"/></label><div className="wisdom-library-list">{matches.map(l=>{const info=feature.find(f=>f.id===l.id)!;return <Link to={`/alpha/wisdom/${l.id}`} className="wisdom-library-item" key={l.id}><LessonArt theme={info.color} small/><span><small>{l.reference} · {l.theme[language]}</small><strong>{l.title[language]}</strong><span>{l.subtitle[language]}</span></span><b aria-hidden="true">↗</b></Link>})}{matches.length===0&&<div className="alpha-panel"><h2>{t("Nothing in this small collection yet.", "इस छोटे संग्रह में यह पाठ नहीं मिला।")}</h2><p>{t("Try another word or clear the search.", "दूसरा शब्द लिखें या खोज मिटाएँ।")}</p><button className="alpha-secondary" onClick={()=>setQuery("")}> {t("Show all three lessons", "तीनों पाठ देखें")}</button></div>}</div></div>;
}
export function WisdomLesson() {
  const {id}=useParams();const navigate=useNavigate();const {state,error,update,timeZone}=useWisdom();
  const { reduced, active } = useMotionSettings();
  const lesson=lessons.find(l=>l.id===id);
  const [part,setPart]=useState(0);
  const previousPart=useRef(part);
  const hasNavigated=useRef(false);
  const stageCard=useRef<HTMLDivElement>(null);
  const stageHeading=useRef<HTMLHeadingElement>(null);
  const changingPart=part!==previousPart.current;
  const direction=part>=previousPart.current?1:-1;
  const [showRoman,setShowRoman]=useState(false);
  const [notice,setNotice]=useState("");
  useEffect(()=>{setPart(0);setShowRoman(false);setNotice("")},[id]);
  useEffect(()=>{
    if(hasNavigated.current){
      stageHeading.current?.focus({preventScroll:true});
      stageCard.current?.scrollIntoView({block:"start",behavior:"instant"});
    }
    previousPart.current=part;
  },[part]);
  const goToPart=(next:number)=>{
    if(next===part)return;
    hasNavigated.current=true;
    setPart(next);
  };
  if(!lesson)return <div className="alpha-panel"><h1>This lesson isn’t here.</h1><Link to="/alpha/library">Browse available lessons</Link></div>;
  const language=state.language;
  const verse=lesson.steps.find(s=>s.kind==="verse")!;
  const understand=lesson.steps.find(s=>s.kind==="understand")!;
  const apply=lesson.steps.find(s=>s.kind==="apply")!;
  const info=feature.find(f=>f.id===id)!;
  const keep=()=>{if(update(s=>choosePractice(s, lesson.id, localDay(timeZone))))navigate("/alpha/my-day");else setNotice(state.language === "hi" ? "आपका कदम सहेजा नहीं गया। आप पढ़ना जारी रख सकते हैं।" : "Your action was not saved. You can still keep reading.")};
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-lesson" lang={language}><div className="wisdom-lesson-head"><Link to="/alpha/library" className="wisdom-back">← {t("Library", "सभी पाठ")}</Link><Lang language={language} change={l=>update(s=>({...s,language:l}))}/></div><div className="wisdom-lesson-intro"><span className="wisdom-overline">{t("BHAGAVAD GITA", "भगवद्गीता")} · {lesson.reference.replace("Bhagavad Gita ", "")}</span><h1>{lesson.title[language]}</h1><p>{lesson.subtitle[language]}</p></div><div className="wisdom-stepper" role="group" aria-label={t("Reading stages", "पाठ के चरण")}>{[language==="hi"?"श्लोक":"Read",language==="hi"?"अर्थ":"Meaning",language==="hi"?"अपनाएँ":"Live it"].map((name,index)=><button type="button" aria-pressed={part===index} className={part===index?"active":""} key={name} onClick={()=>goToPart(index)}>{part===index&&<motion.span className="wisdom-stepper-indicator" layoutId="wisdom-reading-position" transition={reduced||!active?{duration:0}:glideSpring} aria-hidden="true"/>}<span className="wisdom-step-number">{String(index+1).padStart(2,"0")}</span><span className="wisdom-step-label">{name}</span></button>)}</div>
    <motion.div ref={stageCard} key={`${lesson.id}-${part}`} className="wisdom-stage" initial={!changingPart||reduced||!active?false:{opacity:.88,y:direction*10}} animate={{opacity:1,y:0}} transition={reduced||!active?{duration:0}:glideSpring}>
      {part===0&&<><div className="wisdom-verse-art"><LessonArt theme={info.color}/><span>{lesson.reference}</span></div><div className="wisdom-verse-body"><span className="wisdom-overline">{t("THE ORIGINAL VERSE", "मूल श्लोक")}</span><h2 ref={stageHeading} tabIndex={-1} lang="sa-Deva">{verse.script}</h2><button className="wisdom-reveal" aria-expanded={showRoman} onClick={()=>setShowRoman(!showRoman)}>{showRoman?t("Hide pronunciation guide", "उच्चारण सहायता छिपाएँ"):t("Show pronunciation guide", "उच्चारण सहायता दिखाएँ")} <span aria-hidden="true">{showRoman?"−":"+"}</span></button>{showRoman&&<p className="wisdom-transliteration">{verse.transliteration}</p>}<p>{verse.body[language]}</p></div></>}
      {part===1&&<div className="wisdom-meaning"><span className="wisdom-overline">{t("MEANING · ORIGINAL DEMO INTERPRETATION", "अर्थ · मौलिक नमूना व्याख्या")}</span><h2 ref={stageHeading} tabIndex={-1}>{understand.title[language]}</h2><p>{understand.body[language]}</p><details><summary>{t("Where does this come from?", "इसका स्रोत क्या है?")}</summary><p>{lesson.sourceNote[language]}</p><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer"> {t("View source Sanskrit", "मूल संस्कृत स्रोत देखें")} ↗</a></details></div>}
      {part===2&&<div className="wisdom-apply"><span className="wisdom-overline">{t("ONE SMALL STEP", "एक छोटा कदम")}</span><h2 ref={stageHeading} tabIndex={-1}>{apply.title[language]}</h2><p>{apply.body[language]}</p><div className="wisdom-action-note"><span>✦</span><strong>{lesson.action[language]}</strong></div><p className="wisdom-fine">{t("Keeping an idea is optional and stored only in this browser. This is a personal practice prompt, not a measure of spiritual progress.", "किसी विचार को सहेजना वैकल्पिक है और वह इसी ब्राउज़र में रहता है। यह निजी अभ्यास है, आध्यात्मिक प्रगति का पैमाना नहीं।")}</p></div>}
    </motion.div><Disclose error={error}/><p role="status" className="wisdom-fine">{notice}</p><div className="wisdom-lesson-actions">{part>0&&<button className="alpha-secondary" onClick={()=>goToPart(part-1)}>← {t("Back", "वापस")}</button>}{part<2?<button className="wisdom-primary" onClick={()=>goToPart(part+1)}>{part===0?t("Understand the verse", "श्लोक समझें"):t("Take it into my day", "आज के दिन में अपनाएँ")} <span aria-hidden="true">→</span></button>:<button className="wisdom-primary" onClick={keep}>{t("Keep this small step", "यह छोटा कदम सहेजें")} <span aria-hidden="true">→</span></button>}</div><div className="wisdom-alternative"><Link to="/alpha/library"> {t("Explore another reading", "दूसरा पाठ देखें")}</Link><Link to="/alpha/reflection/general"> {t("Write a private note", "निजी नोट लिखें")}</Link></div></div>;
}
export function WisdomMyDay() {
  const { actor } = useAlpha();
  const { state, error, update, timeZone } = useWisdom();
  const [cueNotice, setCueNotice] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const language = state.language;
  const kept = Object.entries(state.kept).reverse().sort((a, b) => b[1].day.localeCompare(a[1].day) || Number(Boolean(a[1].triedAt)) - Number(Boolean(b[1].triedAt)));
  const today = localDay(timeZone);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const noteIds = ["general", ...lessons.map(lesson => lesson.id)].filter(id => {
    try { return Boolean(localStorage.getItem(`spritual_alpha_private_${actor.id}_${id}`)?.trim()); }
    catch { return false; }
  });
  const remove = (id: string) => {
    if (update(latest => {
      const next = { ...latest.kept };
      delete next[id];
      return { ...latest, kept: next };
    })) setRemoving(null);
  };
  return <div className="wisdom-my-day calm-saved" lang={language}>
    <span className="wisdom-overline">{t("SAVED · ON THIS DEVICE", "सहेजा हुआ · इस डिवाइस पर")}</span>
    <h1>{t("What you chose", "जो आपने चुना,")}<br/><em>{t("to keep.", "वह यहाँ है।")}</em></h1>
    <p>{t("Your readings, small steps and private notes live here. Return when useful; there is no streak or missed-day debt.", "आपके पाठ, छोटे कदम और निजी नोट यहाँ हैं। जब ठीक लगे लौटें; लगातार दिनों का कोई दबाव नहीं।")}</p>
    <Disclose error={error}/><p className="practice-feedback" role="status">{cueNotice}</p>
    <section className="calm-saved-section" aria-labelledby="saved-readings-title"><h2 id="saved-readings-title">{t("Saved readings", "सहेजे हुए पाठ")}</h2>
    {kept.length === 0 ? <div className="calm-saved-empty"><p>{t("Nothing saved yet. Read a passage and save it if you wish.", "अभी कुछ सहेजा नहीं है। चाहें तो एक श्लोक पढ़कर सहेजें।")}</p><Link to="/alpha/today">{t("Begin with Today", "आज से शुरू करें")} →</Link></div> : <div className="wisdom-kept-list">{kept.map(([id, entry]) => {
      const lesson = lessons.find(item => item.id === id)!;
      return <article key={id} className="wisdom-kept"><small>{lesson.reference} · {entry.day === today ? t("TODAY", "आज") : entry.day} · {entry.kind === "bookmark" ? t("READING", "पाठ") : t("SMALL STEP", "छोटा कदम")}</small><h2>{lesson.title[language]}</h2>
        {entry.kind === "bookmark" ? <div className="saved-bookmark"><p>{t("Saved for reading again. Choosing a practice is optional.", "फिर पढ़ने के लिए सहेजा गया। अभ्यास चुनना वैकल्पिक है।")}</p><button type="button" className="alpha-secondary" onClick={() => { if (update(latest => choosePractice(latest, id, today))) setCueNotice(t("You chose a small step. Nothing is shared or scheduled.", "आपने एक छोटा कदम चुना। न कुछ साझा होता है, न सूचना तय होती है।")); }}>{t("Make this a small step", "इसे छोटा अभ्यास बनाएँ")}</button></div> : <><p>{lesson.action[language]}</p>
        <div className="practice-cue"><label htmlFor={`cue-${id}`}>{t("Make space for this", "इसके लिए एक पल चुनें")}</label><select id={`cue-${id}`} value={entry.cue || ""} onChange={e => { if (update(latest => setPracticeCue(latest, id, (e.target.value || undefined) as PracticeCue | undefined))) setCueNotice(t("Your cue is saved on this device.", "आपका संकेत इस डिवाइस पर सहेजा गया।")); }}><option value="">{t("Whenever it fits", "जब सुविधाजनक हो")}</option><option value="after-breakfast">{t("After breakfast", "नाश्ते के बाद")}</option><option value="before-work">{t("Before work or study", "काम या पढ़ाई से पहले")}</option><option value="evening">{t("During my evening pause", "शाम के विराम में")}</option></select><small>{t("A cue you choose, not a scheduled notification.", "आपका चुना संकेत, तय समय की सूचना नहीं।")}</small></div>
        {entry.triedAt ? <div className="practice-tried-row"><div className="wisdom-tried">✓ {t("You marked this as tried. That is enough.", "आपने इसे आज़माया। इतना काफ़ी है।")}</div><button className="practice-undo" onClick={() => { if (update(latest => markPracticeTried(latest, id))) setCueNotice(t("Check-in undone. Your idea is still saved.", "चिन्ह हटा दिया। आपका विचार सहेजा हुआ है।")); }}>{t("Undo", "वापस लें")}</button></div> : <div className="wisdom-kept-actions"><button className="alpha-secondary" onClick={() => update(latest => markPracticeTried(latest, id, new Date().toISOString()))}>{t("I tried this", "मैंने इसे आज़माया")}</button><span>{t("Not yet is fine, too.", "अभी नहीं भी ठीक है।")}</span></div>}</>}
        <div className="wisdom-kept-links"><Link to={`/alpha/episode/${id}?scene=1`}>{t("Read again", "फिर पढ़ें")} →</Link><Link to={`/alpha/reflection/${id}`}>{t("Private note", "निजी नोट")} →</Link><button type="button" onClick={() => setRemoving(id)}>{t("Remove from Saved", "सहेजे हुए से हटाएँ")}</button></div>
        {removing === id && <div className="wisdom-remove-confirm"><p>{t("Remove this item from Saved on this device? The reading itself remains available.", "इसे इस डिवाइस पर सहेजे हुए से हटाएँ? पाठ उपलब्ध रहेगा।")}</p><div><button type="button" className="alpha-secondary" onClick={() => setRemoving(null)}>{t("Keep it", "रहने दें")}</button><button type="button" className="alpha-danger" onClick={() => remove(id)}>{t("Remove", "हटाएँ")}</button></div></div>}
      </article>;
    })}</div>}</section>
    <section className="calm-saved-section" aria-labelledby="saved-notes-title"><h2 id="saved-notes-title">{t("Private notes", "निजी नोट")}</h2>{noteIds.length ? <div className="calm-note-list">{noteIds.map(id => <Link key={id} to={`/alpha/reflection/${id}`}>{id === "general" ? t("A thought of your own", "आपका निजी विचार") : lessons.find(lesson => lesson.id === id)?.title[language]} <span aria-hidden="true">↗</span></Link>)}</div> : <p className="calm-saved-note-empty">{t("No notes saved. Writing is always optional.", "अभी कोई नोट नहीं है। लिखना हमेशा वैकल्पिक है।")}</p>}<Link className="calm-note-new" to="/alpha/reflection/general">{t("Write a private note", "निजी नोट लिखें")} →</Link></section>
    <p className="wisdom-footnote">{t("This record stays in this browser profile and is unencrypted. It is not shared with a community or teacher.", "यह जानकारी इसी ब्राउज़र में बिना एन्क्रिप्शन रहती है। यह समुदाय या शिक्षक से साझा नहीं होती।")}</p>
  </div>;
}
