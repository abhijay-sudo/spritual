import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { arjunaBowStory } from "../../../packages/content/src/story";
import { useWisdom } from "./Wisdom";
import { useGraphSaves } from "./graphSaves";
import "./before-teaching.css";
import "./knowledge-universe.css";

const scenes = arjunaBowStory.scenes;

export function BeforeTeaching() {
  const { state, update, error } = useWisdom();
  const saved = useGraphSaves();
  const [params] = useSearchParams();
  const language = state.language;
  const hi = language === "hi";
  const t = (en: string, hindi: string) => hi ? hindi : en;
  const requestedMoment = params.get("moment");

  useEffect(() => {
    if (requestedMoment === null) return;
    const index = Number(requestedMoment);
    if (!Number.isInteger(index) || index < 0 || index >= scenes.length) return;
    requestAnimationFrame(() => document.getElementById(`story-moment-${index}`)?.scrollIntoView({ block: "start", behavior: "instant" }));
  }, [requestedMoment]);

  const changeLanguage = () => {
    if (update(current => ({ ...current, language: hi ? "en" : "hi" }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };

  return <article className="before-story" lang={language}>
    <div className="before-story-top"><Link to="/alpha/library" aria-label={t("Return to Explore", "खोज पर लौटें")}>← {t("Explore", "खोजें")}</Link><button className="before-story-language" type="button" onClick={changeLanguage} aria-label={hi ? "Switch to English" : "हिन्दी में पढ़ें"}>{hi ? "EN" : "हिं"} ⇄</button></div>
    {error && <p role="alert" className="alpha-error">{error}</p>}
    <header className="before-story-hero"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" alt={t("Illustrated chariot at sunrise", "सूर्योदय में रथ का चित्र")}/><div><span className="before-story-kicker">SPRITUAL / {t("BEFORE THE TEACHING", "उपदेश से पहले")}</span><h1>{arjunaBowStory.title[language]}</h1><p>{arjunaBowStory.subtitle[language]}</p></div></header>
    <div className="before-story-body"><p className="before-story-intro">{t("Before any teaching, there was a human moment. Read this brief retelling at your own pace.", "किसी भी उपदेश से पहले एक मानवीय क्षण था। इस संक्षिप्त पुनर्कथन को अपनी गति से पढ़ें।")}</p>
      <div className="before-story-save"><button type="button" disabled={!!saved.error} aria-pressed={saved.ids.includes("story:arjuna-bow")} onClick={() => saved.toggle("story:arjuna-bow")}>{saved.ids.includes("story:arjuna-bow") ? t("Saved · remove", "सहेजा · हटाएँ") : t("Save this story", "यह कथा सहेजें")}</button><span>{t("Only on this device.", "केवल इस डिवाइस पर।")}</span>{saved.error && <p role="alert">{saved.error}</p>}</div>
      {scenes.map((scene, index) => <section className="before-story-section" id={`story-moment-${index}`} key={scene.id} aria-labelledby={`story-moment-heading-${index}`}>
        <div className="before-story-count"><span>{String(index + 1).padStart(2, "0")}</span><span>{scene.reference}</span></div>
        <h2 id={`story-moment-heading-${index}`}>{scene.title[language]}</h2>
        <p className="before-story-narrative">{scene.narrative[language]}</p>
        <aside className="before-story-reflection"><span>{t("PAUSE WITH THIS", "इस पर ठहरें")}</span><p>{scene.reflection[language]}</p></aside>
        <div className="before-story-source"><span>{t("ORIGINAL RETELLING · UNREVIEWED DEMO", "मौलिक पुनर्कथन · समीक्षा-रहित डेमो")}</span><div>{scene.sourceVerses.map(source => <a key={source.verse} href={source.url} target="_blank" rel="noopener noreferrer">{t("Source", "मूल श्लोक")} 1.{source.verse} ↗</a>)}</div></div>
      </section>)}
      <div className="before-story-ending"><p>{t("When you are ready, continue with one source-linked Gita reading.", "जब आप तैयार हों, तो स्रोत से जुड़ा गीता का एक पाठ पढ़ें।")}</p><Link to="/alpha/series/gita">{t("Explore Gita readings", "गीता के पाठ खोजें")} <span aria-hidden="true">↗</span></Link><Link to="/alpha/divine/krishna">{t("Explore Krishna's entry", "कृष्ण की प्रविष्टि देखें")} <span aria-hidden="true">↗</span></Link></div>
      <p className="before-story-disclosure">{t("A short original retelling of Bhagavad Gita 1.24–1.47, not a translation, video, teacher-approved interpretation or complete account. Source edition rights and editorial review remain unresolved; this is a local preview only.", "भगवद्गीता १.२४–१.४७ का संक्षिप्त मौलिक पुनर्कथन; यह अनुवाद, वीडियो, शिक्षक-स्वीकृत व्याख्या या पूरा वृत्तांत नहीं है। स्रोत-संस्करण के अधिकार और संपादकीय समीक्षा बाकी हैं; यह केवल स्थानीय पूर्वावलोकन है।")}</p>
    </div>
  </article>;
}
