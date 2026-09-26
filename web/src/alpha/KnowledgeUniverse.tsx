import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { graphConnectionsForSource, graphEntities, graphSources, graphStories, graphThemes, graphWorks, searchKnowledgeGraph, type GraphEntity, type GraphStory } from "../../../packages/content/src/knowledgeGraph";
import { getDemoCorpusPassage } from "../../../packages/content/src/index";
import { useWisdom } from "./Wisdom";
import { useGraphSaves } from "./graphSaves";
import "./knowledge-universe.css";

function useLanguage() {
  const { state, error } = useWisdom();
  const language = state.language;
  return { language, error, t: (en: string, hi: string) => language === "hi" ? hi : en };
}

function SaveControl({ id }: { id: string }) {
  const { ids, error, toggle } = useGraphSaves();
  const { t } = useLanguage();
  const saved = ids.includes(id);
  return <div className="ku-save-wrap"><button className="ku-save" type="button" aria-pressed={saved} disabled={!!error} onClick={() => toggle(id)}>{saved ? t("Saved · remove", "सहेजा · हटाएँ") : t("Save for later", "बाद के लिए सहेजें")}</button>{error && <p role="alert">{error}</p>}<small>{t("Only on this device. You can remove it anytime.", "केवल इस डिवाइस पर। कभी भी हटा सकते हैं।")}</small></div>;
}

function Back({ to = "/alpha/library", label }: { to?: string; label?: string }) {
  const { t } = useLanguage();
  return <Link className="ku-back" to={to}>← {label ?? t("Explore", "खोजें")}</Link>;
}

function SourceLink({ id, compact = false }: { id: string; compact?: boolean }) {
  const source = graphSources.get(id);
  const { t } = useLanguage();
  const location = useLocation();
  if (!source) return null;
  return <Link className={compact ? "ku-source ku-source-compact" : "ku-source"} to={`/alpha/sources/${encodeURIComponent(id)}`} state={{ from: location.pathname }}><span><strong>{source.work}</strong><small>{source.reference} · {t("View source context and rights status", "स्रोत का संदर्भ और अधिकार स्थिति देखें")}</small></span><span aria-hidden="true">→</span></Link>;
}

export function SourceContext() {
  const { id } = useParams();
  const location = useLocation();
  const { language, t } = useLanguage();
  const source = id ? graphSources.get(id) : undefined;
  const state = location.state as { from?: unknown } | null;
  const returnTo = typeof state?.from === "string" && /^\/alpha\/(life|divine(?:\/[^/]+)?|scriptures(?:\/[^/]+)?|stories\/[^/]+|episode\/[^/]+)$/.test(state.from) ? state.from : "/alpha/library";
  if (!source) return <div className="ku-page"><Back/><h1>{t("Source not found.", "स्रोत नहीं मिला।")}</h1><p>{t("No source text or personal data has changed.", "मूल पाठ या निजी डेटा नहीं बदला है।")}</p></div>;
  const related = graphConnectionsForSource(source.id);
  return <article className="ku-page ku-source-context" lang={language}>
    <Back to={returnTo} label={t("Back to reading", "पाठ पर लौटें")}/>
    <header className="ku-intro"><span className="ku-kicker">{t("SOURCE CONTEXT", "स्रोत का संदर्भ")}</span><h1>{source.work}</h1><p>{source.reference}</p></header>
    <div className="ku-source-record"><h2>{t("What we know about this link", "इस कड़ी के बारे में क्या ज्ञात है")}</h2><dl>
      <div><dt>{t("Edition", "संस्करण")}</dt><dd>{source.edition ?? t("Not established", "पुष्टि नहीं हुई")}</dd></div>
      <div><dt>{t("Translator", "अनुवादक")}</dt><dd>{source.translator ?? t("Not established", "पुष्टि नहीं हुई")}</dd></div>
      <div><dt>{t("Reuse rights", "पुनः उपयोग के अधिकार")}</dt><dd>{source.rights === "verified" ? t("Verified", "सत्यापित") : t("Not established", "पुष्टि नहीं हुई")}</dd></div>
      <div><dt>{t("Human review", "मानवीय समीक्षा")}</dt><dd>{source.review === "reviewed" ? t("Reviewed", "समीक्षित") : t("Pending", "बाकी है")}</dd></div>
    </dl><p>{source.use === "external_pointer" ? t("This is an external reading pointer. Spritual does not reproduce or approve that site's text.", "यह बाहरी पाठ का संकेत है। Spritual उस साइट के पाठ को पुनः प्रकाशित या स्वीकृत नहीं करता।") : t("A short local demo excerpt is available. Its edition, rights and explanation still need review.", "एक छोटा स्थानीय नमूना अंश उपलब्ध है। उसके संस्करण, अधिकार और व्याख्या की समीक्षा अभी बाकी है।")}</p>
    <a className="ku-primary" href={source.url} target="_blank" rel="noopener noreferrer">{t("Open original source", "मूल स्रोत खोलें")} <span aria-hidden="true">↗</span></a></div>
    {(related.works.length > 0 || related.passages.length > 0 || related.stories.length > 0 || related.entities.length > 0) && <section className="ku-related" aria-labelledby="ku-source-connections"><span className="ku-kicker">{t("IN THIS PREVIEW", "इस पूर्वावलोकन में")}</span><h2 id="ku-source-connections">{t("Continue exploring", "आगे पढ़ें")}</h2><div className="ku-related-list">
      {related.passages.map(passage => <Link key={passage.id} to={`/alpha/episode/${passage.lessonId}`}><strong>{source.work} {passage.source.canonicalReference}</strong><span>{t("Original · unreviewed demo meaning", "मूल · समीक्षा-रहित नमूना अर्थ")} →</span></Link>)}
      {related.stories.map(story => <Link key={story.id} to={story.href}><strong>{story.title[language]}</strong><span>{t("Original retelling · unreviewed", "मौलिक पुनर्कथन · समीक्षा बाकी")} →</span></Link>)}
      {related.entities.map(entity => <Link key={entity.id} to={`/alpha/divine/${entity.slug}`}><strong>{entity.name[language]}</strong><span>{t("Editorial entry · not a doctrinal definition", "संपादकीय प्रविष्टि · धार्मिक परिभाषा नहीं")} →</span></Link>)}
      {related.works.map(work => <Link key={work.id} to={`/alpha/scriptures/${work.slug}`}><strong>{work.title[language]}</strong><span>{t("Available material in this work", "इस ग्रंथ में उपलब्ध सामग्री")} →</span></Link>)}
    </div></section>}
    <p className="ku-disclosure">{t("An external link is not proof of a specific edition, a license, or an approved interpretation. Do not treat this preview as a complete text.", "बाहरी कड़ी किसी विशेष संस्करण, लाइसेंस या स्वीकृत व्याख्या का प्रमाण नहीं है। यह पूर्वावलोकन पूरा पाठ नहीं है।")}</p>
  </article>;
}

export function ScriptureLibrary() {
  const { language, t } = useLanguage();
  return <div className="ku-page ku-scripture" lang={language}><Back/><header className="ku-intro"><span className="ku-kicker">{t("SCRIPTURES · AVAILABLE PATHS", "ग्रंथ · उपलब्ध रास्ते")}</span><h1>{t("Read what is here.", "जो उपलब्ध है, वही पढ़ें।")}</h1><p>{t("One work has three local verse selections. Two others have external source pointers and original editorial connections. None is a complete digital edition here.", "एक ग्रंथ के तीन स्थानीय चुने हुए श्लोक हैं। दो अन्य के बाहरी स्रोत-संकेत और मौलिक संपादकीय कड़ियाँ हैं। यहाँ किसी का पूरा डिजिटल संस्करण नहीं है।")}</p></header><div className="ku-work-list">{graphWorks.map(work => <Link key={work.id} to={`/alpha/scriptures/${work.slug}`}><small>{work.availability === "local_selection" ? t("LOCAL SELECTION · UNREVIEWED", "स्थानीय चयन · समीक्षा बाकी") : t("EXTERNAL SOURCE POINTER", "बाहरी स्रोत-संकेत")}</small><strong>{work.title[language]}</strong><span>{work.orientation[language]}</span><em>{t("Explore this work", "यह ग्रंथ देखें")} →</em></Link>)}</div><p className="ku-disclosure">{t("Links are navigation, not redistribution rights or a claim of complete scripture coverage.", "कड़ियाँ केवल मार्गदर्शन हैं, पुनर्प्रकाशन अधिकार या पूरे ग्रंथ की उपलब्धता का दावा नहीं।")}</p></div>;
}

export function ScriptureWork() {
  const { slug } = useParams();
  const { language, t } = useLanguage();
  const work = graphWorks.find(item => item.slug === slug);
  if (!work) return <div className="ku-page"><Back to="/alpha/scriptures"/><h1>{t("This work is not available.", "यह ग्रंथ उपलब्ध नहीं है।")}</h1></div>;
  const passages = work.sourceIds.map(id => getDemoCorpusPassage(id)).filter((passage): passage is NonNullable<typeof passage> => !!passage);
  const stories = graphStories.filter(story => story.sourceIds.some(id => work.sourceIds.includes(id)));
  return <article className="ku-page ku-scripture" lang={language}><Back to="/alpha/scriptures" label={t("Scriptures", "ग्रंथ")}/><header className="ku-intro"><span className="ku-kicker">{work.availability === "local_selection" ? t("SELECTED LOCAL READINGS", "चुने हुए स्थानीय पाठ") : t("SOURCE POINTER", "स्रोत-संकेत")}</span><h1>{work.title[language]}</h1><p>{work.orientation[language]}</p></header>
    {passages.length > 0 && <section className="ku-related" aria-labelledby="ku-work-readings"><span className="ku-kicker">{t("AVAILABLE TO READ HERE", "यहाँ पढ़ने को उपलब्ध")}</span><h2 id="ku-work-readings">{t("Selected passages", "चुने हुए श्लोक")}</h2><div className="ku-related-list">{passages.map(passage => <Link key={passage.id} to={`/alpha/episode/${passage.lessonId}?origin=work`}><strong>{work.title[language]} {passage.source.canonicalReference}</strong><span>{t("Original verse · unreviewed demo meaning", "मूल श्लोक · समीक्षा-रहित नमूना अर्थ")} →</span></Link>)}</div><p>{t("These selections do not make up a complete chapter. Continue in context through the source links below.", "इन चुने श्लोकों से पूरा अध्याय नहीं बनता। नीचे स्रोत-कड़ियों से संदर्भ में पढ़ें।")}</p></section>}
    {stories.length > 0 && <section className="ku-related" aria-labelledby="ku-work-stories"><span className="ku-kicker">{t("EDITORIAL CONTEXT", "संपादकीय संदर्भ")}</span><h2 id="ku-work-stories">{t("A story to enter through", "कथा से प्रवेश करें")}</h2><div className="ku-related-list">{stories.map(story => <Link key={story.id} to={story.href}><strong>{story.title[language]}</strong><span>{t("Original retelling · not scripture", "मौलिक पुनर्कथन · मूल ग्रंथ नहीं")} →</span></Link>)}</div></section>}
    <section className="ku-related" aria-labelledby="ku-work-sources"><span className="ku-kicker">{t("TRACE THE TEXT", "मूल पाठ देखें")}</span><h2 id="ku-work-sources">{t("Sources and status", "स्रोत और उनकी स्थिति")}</h2><div className="ku-related-list">{work.sourceIds.map(id => <SourceLink key={id} id={id}/>)}</div></section>
    <p className="ku-disclosure">{t("No listed work has a cleared, complete local edition. External pointers require internet; local explanations and retellings await rights and named human review.", "किसी भी सूचीबद्ध ग्रंथ का पूरा स्वीकृत स्थानीय संस्करण नहीं है। बाहरी संकेत के लिए इंटरनेट चाहिए; स्थानीय व्याख्या और पुनर्कथन के अधिकार व नामित मानवीय समीक्षा बाकी हैं।")}</p>
  </article>;
}

function EntityArt({ entity, hero = false }: { entity: GraphEntity; hero?: boolean }) {
  return <div className={`ku-art ku-art-${entity.visual} ${hero ? "ku-art-hero" : ""}`} aria-hidden="true">{entity.visual === "chariot" && <img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" alt="" loading={hero ? "eager" : "lazy"}/>}<span className="ku-art-light"/><span className="ku-art-horizon"/></div>;
}

export function DivineDiscover() {
  const { language, t } = useLanguage();
  return <div className="ku-page ku-divine" lang={language}>
    <Back/><header className="ku-intro"><span className="ku-kicker">{t("DIVINE · A WAY INTO THE SOURCES", "दिव्य · स्रोत तक पहुँच")}</span><h1>{t("Meet a story. Follow its source.", "कथा से मिलें। उसके स्रोत तक जाएँ।")}</h1><p>{t("Begin with a figure who matters to you. These are carefully labelled preview paths, not complete or approved accounts of any tradition.", "जिस रूप से आपका जुड़ाव हो, वहाँ से शुरू करें। ये स्पष्ट रूप से चिह्नित पूर्वावलोकन हैं, किसी परंपरा का पूरा या स्वीकृत वर्णन नहीं।")}</p></header>
    <div className="ku-entity-list">{graphEntities.map((entity, index) => <Link className="ku-entity-row" to={`/alpha/divine/${entity.slug}`} key={entity.id}><EntityArt entity={entity}/><span className="ku-entity-row-copy"><small>{String(index + 1).padStart(2, "0")} · {entity.state === "source_pointer" ? t("SOURCE POINTER", "स्रोत का संकेत") : t("EDITORIAL PREVIEW", "संपादकीय पूर्वावलोकन")}</small><strong>{entity.name[language]}</strong><em>{entity.invitation[language]}</em><span>{t("Begin here", "यहाँ से शुरू करें")} ↗</span></span></Link>)}</div>
    <p className="ku-disclosure">{t("Only three entries are open in this local preview. Tradition-specific meanings, imagery and wider stories need named human review before publication.", "इस स्थानीय पूर्वावलोकन में केवल तीन प्रवेश उपलब्ध हैं। परंपरा-विशिष्ट अर्थ, चित्र और विस्तृत कथाओं को प्रकाशन से पहले नामित मानवीय समीक्षा चाहिए।")}</p>
  </div>;
}

export function DivineEntry() {
  const { slug } = useParams();
  const entity = graphEntities.find(item => item.slug === slug);
  const { language, t } = useLanguage();
  if (!entity) return <div className="ku-page"><Back to="/alpha/divine"/><h1>{t("This entry is not available.", "यह प्रवेश उपलब्ध नहीं है।")}</h1></div>;
  const firstStory = graphStories.find(story => story.id === entity.storyIds[0]);
  const firstPassage = entity.passageIds.length ? getDemoCorpusPassage(entity.passageIds[0]) : undefined;
  const source = entity.sourceIds[0];
  return <article className="ku-page ku-entry" lang={language}>
    <Back to="/alpha/divine" label={t("Divine", "दिव्य")}/>
    <header className="ku-entry-hero"><EntityArt entity={entity} hero/><div className="ku-entry-hero-copy"><span className="ku-kicker">{entity.kind === "scriptural_character" ? t("IN THE EPIC", "महाकाव्य में") : t("DIVINE ENTRY", "दिव्य प्रवेश")}</span><h1>{entity.name[language]}</h1><p className="ku-iast" lang="sa-Latn">{entity.iast}</p><p>{entity.invitation[language]}</p></div></header>
    <div className="ku-entry-body"><section className="ku-begin" aria-labelledby="ku-begin-title"><span className="ku-kicker">{t("BEGIN HERE", "यहाँ से शुरू करें")}</span><h2 id="ku-begin-title">{firstStory ? firstStory.title[language] : firstPassage ? t("A teaching to read slowly", "धीरे पढ़ने की एक सीख") : t("Begin with the source", "स्रोत से शुरू करें")}</h2><p>{entity.editorialNote[language]}</p>{firstStory ? <Link className="ku-primary" to={firstStory.href}>{t("Read the story", "कथा पढ़ें")} <span aria-hidden="true">→</span></Link> : firstPassage ? <Link className="ku-primary" to={`/alpha/episode/${firstPassage.lessonId}`}>{t("Read the passage", "श्लोक पढ़ें")} <span aria-hidden="true">→</span></Link> : source ? <SourceLink id={source}/> : null}</section>
      <SaveControl id={entity.id}/>
      {entity.passageIds.length > 0 && <section className="ku-related" aria-labelledby="ku-teachings-title"><span className="ku-kicker">{t("FROM THE TEXT", "मूल पाठ से")}</span><h2 id="ku-teachings-title">{t("Three Gita moments", "गीता के तीन प्रसंग")}</h2><div className="ku-related-list">{entity.passageIds.map(id => { const passage = getDemoCorpusPassage(id); return passage ? <Link key={id} to={`/alpha/episode/${passage.lessonId}`}><strong>Bhagavad Gita {passage.source.canonicalReference}</strong><span>{t("Original verse · demo explanation", "मूल श्लोक · नमूना व्याख्या")} ↗</span></Link> : null; })}</div></section>}
      <section className="ku-related" aria-labelledby="ku-source-title"><span className="ku-kicker">{t("TRACE THE SOURCE", "स्रोत देखें")}</span><h2 id="ku-source-title">{t("See where this begins.", "देखें, यह कहाँ से शुरू होता है।")}</h2><div className="ku-related-list">{entity.sourceIds.map(id => <SourceLink key={id} id={id}/>)}</div>{entity.slug === "shiva" && <p className="ku-caution">{t("The Rudra–Shiva relationship is interpreted differently across traditions. This link is a research pointer, not an approved theological claim.", "रुद्र–शिव संबंध की व्याख्या परंपराओं में अलग-अलग है। यह शोध के लिए स्रोत है, स्वीकृत धार्मिक दावा नहीं।")}</p>}</section>
      <section className="ku-related" aria-labelledby="ku-themes-title"><span className="ku-kicker">{t("EDITORIAL THREADS", "संपादकीय सूत्र")}</span><h2 id="ku-themes-title">{t("Continue with a question.", "किसी सवाल के साथ आगे बढ़ें।")}</h2><div className="ku-theme-list">{entity.themeIds.map(id => { const theme = graphThemes.find(item => item.id === id); return theme ? <Link key={id} to={`/alpha/search?topic=${encodeURIComponent(id)}`}>{theme.name[language]} ↗</Link> : null; })}</div></section>
      <p className="ku-disclosure">{t("Local preview. Names and links are editorial navigation, not an exhaustive description. No deity speaks through the app. Source rights and human review remain open.", "स्थानीय पूर्वावलोकन। नाम और कड़ियाँ मार्गदर्शन हैं, पूरा वर्णन नहीं। ऐप किसी देवता की आवाज़ होने का दावा नहीं करता। स्रोत अधिकार और मानवीय समीक्षा बाकी हैं।")}</p>
    </div>
  </article>;
}

export function GraphStoryReader() {
  const { slug } = useParams();
  const story = graphStories.find(item => item.slug === slug && item.slug !== "arjuna-bow");
  const { language, t } = useLanguage();
  if (!story) return <div className="ku-page"><Back/><h1>{t("This story is not available.", "यह कथा उपलब्ध नहीं है।")}</h1></div>;
  const entity = graphEntities.find(item => item.id === story.entityIds[0]);
  return <article className="ku-page ku-story" lang={language}><Back to={entity ? `/alpha/divine/${entity.slug}` : "/alpha/library"} label={entity?.name[language]}/><header className="ku-story-hero"><div className="ku-story-glow"/><span className="ku-kicker">{t("AN ORIGINAL RETELLING · UNREVIEWED", "मौलिक पुनर्कथन · समीक्षा बाकी")}</span><h1>{story.title[language]}</h1><p>{story.subtitle[language]}</p><small>{t("Three quiet moments · read at your own pace", "तीन छोटे प्रसंग · अपनी गति से पढ़ें")}</small></header>
    <div className="ku-story-body"><p className="ku-story-lead">{t("The narrative below is original editorial prose based on the linked source. It is not scripture, a translation or a teacher-approved telling.", "नीचे का वर्णन जुड़े हुए स्रोत पर आधारित मौलिक संपादकीय गद्य है। यह मूल शास्त्र, अनुवाद या शिक्षक द्वारा स्वीकृत कथा नहीं है।")}</p>{story.scenes.map((scene, index) => <section className="ku-scene" key={scene.id} aria-labelledby={`ku-scene-${scene.id}`}><span className="ku-kicker">{String(index + 1).padStart(2, "0")} / {String(story.scenes.length).padStart(2, "0")}</span><h2 id={`ku-scene-${scene.id}`}>{scene.title[language]}</h2><p>{scene.narrative[language]}</p><aside><span>{t("PAUSE WITH THIS", "इस पर ठहरें")}</span><p>{scene.reflection[language]}</p></aside><div className="ku-scene-source">{scene.sourceIds.map(id => <SourceLink key={id} id={id} compact/>)}</div></section>)}
      <SaveControl id={story.id}/><section className="ku-story-next"><span className="ku-kicker">{t("FOLLOW THE THREAD", "सूत्र आगे बढ़ाएँ")}</span><h2>{t("One story. Another perspective.", "एक कथा। एक और दृष्टि।")}</h2><p>{t("The connection below is an editorial comparison about purposeful action, not a claim that the texts teach the same thing.", "नीचे की कड़ी उद्देश्यपूर्ण कर्म की संपादकीय तुलना है; यह दावा नहीं कि दोनों ग्रंथ एक ही बात कहते हैं।")}</p><Link to="/alpha/episode/gita-2-47">{t("Read Bhagavad Gita 2.47", "भगवद्गीता २.४७ पढ़ें")} ↗</Link></section><p className="ku-disclosure">{t("Source edition, redistribution rights and named human review are not yet established. This remains a local preview.", "स्रोत-संस्करण, पुनर्प्रकाशन अधिकार और नामित मानवीय समीक्षा अभी स्थापित नहीं हैं। यह केवल स्थानीय पूर्वावलोकन है।")}</p>
    </div>
  </article>;
}

export function UniversalSearch() {
  const [params] = useSearchParams();
  const topic = params.get("topic");
  const initial = graphThemes.find(item => item.id === topic);
  const { language, t } = useLanguage();
  const [draft, setDraft] = useState(initial?.name[language] ?? "");
  const [query, setQuery] = useState(initial?.name[language] ?? "");
  useEffect(() => {
    if (!initial) return;
    setDraft(initial.name[language]);
    setQuery(initial.name[language]);
  }, [initial, language]);
  const results = useMemo(() => searchKnowledgeGraph(query, language), [query, language]);
  const submit = (event: FormEvent) => { event.preventDefault(); setQuery(draft.trim().slice(0, 120)); };
  return <div className="ku-page ku-search-page" lang={language}><Back/><header className="ku-intro"><span className="ku-kicker">{t("SEARCH THE AVAILABLE COLLECTION", "उपलब्ध संग्रह में खोजें")}</span><h1>{t("Follow a name, a story or a question.", "नाम, कथा या सवाल से आगे बढ़ें।")}</h1><p>{t("Search stays on this device during this visit. The collection is small; no model is asked and no result is invented.", "इस सत्र में खोज इसी डिवाइस पर रहती है। संग्रह छोटा है; किसी मॉडल से नहीं पूछा जाता और कोई परिणाम गढ़ा नहीं जाता।")}</p></header><form className="ku-search-form" onSubmit={submit}><label htmlFor="ku-search-input">{t("Search", "खोजें")}</label><div><input id="ku-search-input" type="search" value={draft} maxLength={120} onChange={event => { setDraft(event.target.value); setQuery(event.target.value); }} placeholder={t("Try Hanuman, Krishna, Gita 2.47", "हनुमान, कृष्ण, गीता २.४७ लिखें")}/><button type="submit">{t("Find", "ढूँढें")}</button></div></form>
    {query.trim() ? <section className="ku-results" aria-live="polite"><h2>{results.length ? t("In this preview", "इस पूर्वावलोकन में") : t("No clear match here yet.", "यहाँ अभी स्पष्ट मेल नहीं मिला।")}</h2>{results.length ? <div className="ku-result-list">{results.map(result => <Link key={`${result.kind}-${result.id}`} to={result.href}><small>{result.kind === "entity" ? t("DIVINE / CHARACTER", "दिव्य / पात्र") : result.kind === "story" ? t("STORY · RETELLING", "कथा · पुनर्कथन") : result.kind === "passage" ? t("PASSAGE · DEMO", "श्लोक · नमूना") : result.kind === "work" ? t("SCRIPTURE · AVAILABLE PATH", "ग्रंथ · उपलब्ध रास्ता") : t("THEME · EDITORIAL", "विषय · संपादकीय")}</small><strong>{result.title[language]}</strong><span>{result.subtitle[language]}</span><em>{result.state === "source_pointer" ? t("Source pointer only", "केवल स्रोत-संकेत") : t("Unreviewed preview", "समीक्षा-रहित पूर्वावलोकन")} ↗</em></Link>)}</div> : <p>{t("Try a different name or browse the available entries. We will not invent a scripture result for this question.", "कोई दूसरा नाम लिखें या उपलब्ध प्रविष्टियाँ देखें। हम इस सवाल के लिए शास्त्रीय परिणाम नहीं गढ़ेंगे।")}</p>}</section> : <div className="ku-search-starters"><span className="ku-kicker">{t("BEGIN SOMEWHERE", "कहीं से शुरू करें")}</span>{["Hanuman", "Shiva", "Gita 2.47"].map(value => <button type="button" key={value} onClick={() => { setDraft(value); setQuery(value); }}>{value} ↗</button>)}</div>}
    <p className="ku-disclosure">{t("Only the currently available, labelled demo material is searched. External source links and unreviewed retellings are distinct from approved scripture translations.", "खोज केवल वर्तमान चिह्नित नमूना सामग्री में होती है। बाहरी स्रोत और समीक्षा-रहित पुनर्कथन स्वीकृत शास्त्रीय अनुवाद से अलग हैं।")}</p>
  </div>;
}
