import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { buildGroundedFallback, isImmediateSafetyQuery, retrieveWisdom } from "../../../packages/ai/src/index";
import { getDemoCorpusPassage, listDemoPassages } from "../../../packages/content/src/index";
import { graphSourcePointerForQuestion, graphStoryForQuestion } from "../../../packages/content/src/knowledgeGraph";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { useWisdom } from "./Wisdom";
import { useMotionSettings } from "./MotionSystem";
import "./life-wisdom.css";

const examples = [
  { en: "I keep worrying about the result of my work", hi: "मुझे अपने काम के फल की चिंता रहती है" },
  { en: "Things changed and I feel unsettled", hi: "बदलाव के बीच मुझे संतुलन चाहिए" },
  { en: "My mind keeps wandering", hi: "मेरा मन बार-बार भटकता है" },
] as const;

/** An in-session question is never placed in the URL, local storage, or an AI request. */
export function LifeWisdom({ restoreQuestion = null, onOpenSource }: { restoreQuestion?: string | null; onOpenSource?: (question: string) => void }) {
  const { state, update, error } = useWisdom();
  const { reduced } = useMotionSettings();
  const language = state.language;
  const hi = language === "hi";
  const t = (en: string, hindi: string) => hi ? hindi : en;
  const [draft, setDraft] = useState(restoreQuestion ?? "");
  const [asked, setAsked] = useState<string | null>(restoreQuestion);
  const resultRef = useRef<HTMLElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (asked === null) return;
    resultHeadingRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [asked, reduced]);
  const passages = useMemo(() => listDemoPassages(language), [language]);
  const sourcePointer = asked && !isImmediateSafetyQuery(asked) ? graphSourcePointerForQuestion(asked) : undefined;
  const hits = useMemo(() => {
    // An explicit request for another work should never be answered with an incidental Gita theme match.
    if (!asked || isImmediateSafetyQuery(asked) || graphSourcePointerForQuestion(asked)) return [];
    return retrieveWisdom(asked, passages, { language, maxResults: 1 });
  }, [asked, language, passages]);
  const answer = asked === null ? null : buildGroundedFallback(asked, hits, language);
  const companionStory = answer?.kind !== "safety" && asked ? graphStoryForQuestion(asked) : undefined;
  const ask = (value: string) => {
    const question = value.trim().slice(0, 280);
    if (!question) return;
    setDraft(question);
    setAsked(question);
  };
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ask(draft);
  };
  const changeLanguage = () => {
    if (update(current => ({ ...current, language: hi ? "en" : "hi" }))) {
      window.dispatchEvent(new Event("spritual-alpha-language"));
    }
  };

  return <div className="life-wisdom" lang={language}>
    <div className="life-topline"><Link to="/alpha/library"><Icon name="back" size={18}/>{t("Explore", "खोजें")}</Link><button type="button" onClick={changeLanguage} aria-label={hi ? "Switch to English" : "हिन्दी में पढ़ें"}>{hi ? "EN" : "हिं"} <span aria-hidden="true">⇄</span></button></div>
    <header className="life-intro"><p className="life-overline">{t("LIFE → WISDOM", "जीवन → सीख")}</p><h1>{t("Begin with what’s on your mind.", "मन में जो है, वहीं से शुरू करें।")}</h1><p>{t("Describe a moment. We’ll look for a relevant passage in the small, source-linked collection available here.", "अपनी स्थिति लिखें। हम यहाँ उपलब्ध छोटे, स्रोत से जुड़े संग्रह में कोई संबंधित श्लोक खोजेंगे।")}</p></header>
    {error && <p role="alert" className="alpha-error">{error}</p>}
    <form className="life-question" onSubmit={onSubmit}>
      <label htmlFor="life-question-input">{t("What is happening in your life?", "आपके जीवन में अभी क्या चल रहा है?")}</label>
      <textarea id="life-question-input" value={draft} onChange={event => { setDraft(event.target.value); if (asked !== null) setAsked(null); }} maxLength={280} rows={3} placeholder={t("For example: I am working hard, but keep worrying about the result.", "जैसे: मैं मेहनत कर रहा हूँ, पर फल की चिंता होती रहती है।")}/>
      <div className="life-question-foot"><span>{t("Private during this visit · not sent to a model", "केवल इस सत्र में · किसी मॉडल को नहीं भेजा जाता")}</span><button type="submit" disabled={!draft.trim()}>{t("Find a teaching", "सीख खोजें")}<Icon name="arrow" size={19}/></button></div>
    </form>
    <div className="life-examples"><p>{t("Or begin with a familiar feeling", "या किसी परिचित स्थिति से शुरू करें")}</p><div>{examples.map(example => <button type="button" key={example.en} onClick={() => ask(example[language])}>{example[language]} <Icon name="arrow" size={16}/></button>)}</div></div>

    {answer && <section ref={resultRef} className={`life-answer life-answer-${answer.kind}`} aria-labelledby="life-answer-heading">
      <div className="life-answer-head"><span className="life-overline">{answer.kind === "matched" ? t("A THREAD TO FOLLOW", "एक सूत्र") : t("WHAT WE COULD FIND", "जो मिल सका")}</span><h2 id="life-answer-heading" ref={resultHeadingRef} tabIndex={-1}>{answer.kind === "matched" ? t("Start with the source.", "मूल श्लोक से शुरू करें।") : answer.kind === "safety" ? t("Please seek immediate support.", "कृपया तुरंत सहायता लें।") : sourcePointer ? t("A source to inspect.", "देखने के लिए एक स्रोत।") : t("No clear source match yet.", "अभी स्पष्ट स्रोत नहीं मिला।")}</h2><p>{sourcePointer ? t("We have not verified a passage or interpretation from this work. Start with the source record below.", "इस ग्रंथ से किसी अंश या अर्थ की समीक्षा अभी नहीं हुई है। नीचे दिए स्रोत के विवरण से शुरू करें।") : answer.message}</p></div>
      {answer.kind === "safety" && <a className="life-support-link" href="tel:14416">{t("Call Tele-MANAS 14416 (India)", "टेली मानस 14416 पर कॉल करें (भारत)")}</a>}
      {answer.kind === "matched" && answer.sources.map((source, index) => {
        const lessonId = getDemoCorpusPassage(source.id)?.lessonId;
        const lesson = lessons.find(item => item.id === lessonId);
        const verse = lesson?.steps.find(step => step.kind === "verse");
        const explanation = lesson?.steps.find(step => step.kind === "understand");
        const hit = hits[index];
        return <article className="life-source" key={source.id}>
          <div className="life-source-index"><span>{String(index + 1).padStart(2, "0")}</span><span>{hit?.matchedBy.includes("reference") ? t("EXACT REFERENCE", "सटीक संदर्भ") : hit?.matchedBy.includes("theme") ? t("THEME MATCH", "विषय से जुड़ा") : t("TEXT MATCH", "पाठ से जुड़ा")}</span></div>
          <div className="life-source-body"><p className="life-source-work">{source.reference}</p><h3>{lesson?.title[language] || source.reference}</h3><blockquote lang="sa-Deva">{source.original}</blockquote>
            {verse?.transliteration && <details><summary>{t("Read in Roman letters", "रोमन अक्षरों में पढ़ें")}</summary><p lang="sa-Latn">{source.transliteration}</p></details>}
            {explanation && <div className="life-interpretation"><span>{t("ORIGINAL DEMO INTERPRETATION · NOT HUMAN REVIEWED", "मौलिक डेमो व्याख्या · मानवीय समीक्षा बाकी")}</span><p>{explanation.body[language]}</p></div>}
            {lesson && <div className="life-practice"><span>{t("ONE POSSIBLE STEP", "एक संभव कदम")}</span><p>{lesson.action[language]}</p></div>}
            <div className="life-source-links">{lesson && <Link to={source.localPath} onClick={() => { if (asked) onOpenSource?.(asked); }}>{t("Read this verse", "यह श्लोक पढ़ें")}<Icon name="arrow" size={18}/></Link>}<a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Open source text", "मूल स्रोत देखें")} ↗</a></div>
            {source.id === "bg.2.47" && <Link className="life-before-story" to="/alpha/stories/arjuna-bow" onClick={() => { if (asked) onOpenSource?.(asked); }}>{t("Before this teaching: Arjuna’s story", "इस सीख से पहले: अर्जुन की कथा")} <Icon name="arrow" size={17}/></Link>}
          </div>
        </article>;
      })}
      {companionStory && <div className="life-story-companion"><span className="life-overline">{t("AN EDITORIAL PATH · NOT A VERSE MATCH", "संपादकीय राह · श्लोक का मेल नहीं")}</span><p>{t("A separate, unreviewed retelling about beginning a difficult task. It is linked for reflection, not presented as the answer to your question.", "कठिन काम शुरू करने पर एक अलग, समीक्षा-रहित पुनर्कथन। यह सोचने के लिए जुड़ा है, आपके सवाल का उत्तर बताकर नहीं।")}</p><Link className="life-before-story" to={companionStory.href} onClick={() => { if (asked) onOpenSource?.(asked); }}>{t("Read Hanuman’s crossing", "हनुमान का समुद्र-पार जाना पढ़ें")} <Icon name="arrow" size={17}/></Link></div>}
      {sourcePointer && <div className="life-story-companion"><span className="life-overline">{t("SOURCE POINTER · NOT AN ANSWER", "स्रोत-संकेत · उत्तर नहीं")}</span><p>{t("This collection has a link to a relevant source, but no reviewed passage or interpretation to answer this question. You can inspect its context and open the original yourself.", "इस संग्रह में संबंधित स्रोत की कड़ी है, लेकिन इस सवाल का उत्तर देने वाला समीक्षित पाठ या अर्थ नहीं है। आप उसका संदर्भ देखकर स्वयं मूल स्रोत खोल सकते हैं।")}</p><Link className="life-before-story" to={`/alpha/sources/${encodeURIComponent(sourcePointer.id)}`} state={{ from: "/alpha/life" }} onClick={() => { if (asked) onOpenSource?.(asked); }}>{sourcePointer.work} · {sourcePointer.reference} <Icon name="arrow" size={17}/></Link></div>}
      {answer.kind === "unverified" && !sourcePointer && <Link className="life-browse" to="/alpha/library">{t("Browse the three available readings", "तीन उपलब्ध पाठ देखें")}<Icon name="arrow" size={18}/></Link>}
      <p className="life-disclosure">{answer.disclosure}</p>
    </section>}
    {!answer && <div className="life-endnote"><Icon name="book" size={22}/><p>{t("The current collection has three Gita passages. A question about another text or tradition may have no verified match yet.", "अभी इस संग्रह में गीता के तीन श्लोक हैं। दूसरे ग्रंथ या परंपरा से जुड़े सवाल का प्रमाणित मेल अभी न मिले।")}</p></div>}
  </div>;
}
