import { Link, Navigate } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useWisdom } from "./Wisdom";
import { EditorialImage } from "./EditorialImage";
import "./devotional-welcome.css";

const introKey = "spritual_intro_seen_v1";
const introSeen = () => {
  try { return localStorage.getItem(introKey) === "yes"; }
  catch { return true; }
};
const rememberIntro = () => { try { localStorage.setItem(introKey, "yes"); } catch { /* The reading remains available without storage. */ } };

export function FirstEntry() {
  const { state } = useWisdom();
  const hasReading = Boolean(state.resume || state.readingChoice || Object.keys(state.kept).length || Object.keys(state.finished ?? {}).length);
  return <Navigate to={introSeen() || hasReading ? "/alpha/today" : "/alpha/welcome"} replace/>;
}

export function DevotionalWelcome() {
  const { state, update } = useWisdom();
  const language = state.language;
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const change = (next: "en" | "hi") => {
    if (next !== language && update(current => ({ ...current, language: next }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };
  return <div className="dev-welcome" lang={language}>
    <EditorialImage asset="gitaChariot" language={language} priority className="dev-welcome-art"/>
    <div className="dev-welcome-shade" aria-hidden="true"/>
    <header className="dev-welcome-top"><span className="dev-welcome-brand"><Icon name="sun" size={30}/> Spritual</span><div role="group" aria-label="Reading language / पढ़ने की भाषा"><button type="button" lang="en" aria-pressed={language === "en"} onClick={() => change("en")}>EN</button><button type="button" lang="hi" aria-pressed={language === "hi"} onClick={() => change("hi")}>हि</button></div></header>
    <main className="dev-welcome-content"><span className="dev-welcome-kicker">{t("A MOMENT TO BEGIN", "शुरुआत का एक पल")}</span><h1>{t("Meet the teaching.\nCarry one thought.", "श्लोक से मिलें।\nएक विचार साथ लें।")}</h1><p>{t("Read the original verse, understand its setting, and find one small way to bring it into your day.", "मूल श्लोक पढ़ें, उसका संदर्भ समझें और एक छोटा विचार अपने दिन में अपनाएँ।")}</p><Link className="dev-welcome-primary" to="/alpha/episode/gita-2-47" onClick={rememberIntro}>{t("Begin with a verse", "एक श्लोक से शुरू करें")} <Icon name="arrow" size={20}/></Link><Link className="dev-welcome-secondary" to="/alpha/today" onClick={rememberIntro}>{t("See Today first", "पहले आज का पाठ देखें")}</Link><small>{t("Local preview · Sample text awaiting human review · No account needed", "स्थानीय पूर्वावलोकन · नमूना पाठ की मानवीय समीक्षा बाकी · खाता आवश्यक नहीं")}</small></main>
  </div>;
}
