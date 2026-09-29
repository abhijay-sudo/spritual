import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { clearStorySession, loadStorySession, writeStorySession, type StoryResponse, type StorySession } from "./storySession";
import { publicStoryLink } from "./publicStoryLink";
import type { KnowledgeLanguage, KnowledgeStory } from "./types";

const tr = (language: KnowledgeLanguage, en: string, hi: string) => language === "hi" ? hi : en;
const initial = (storyId: string): StorySession => ({ schema: 1, storyId, scene: 0 });

export function ConnectedStoryReader({ item, language, actorKey, saveAction, sourceCard }: {
  item: KnowledgeStory; language: KnowledgeLanguage; actorKey: string; saveAction: ReactNode; sourceCard: ReactNode;
}) {
  const canPersist = actorKey !== "pending";
  const [loaded, setLoaded] = useState(() => canPersist
    ? loadStorySession(window.localStorage, actorKey, item.id, item.scenes.length)
    : { kind: "empty" as const });
  const [session, setSession] = useState<StorySession>(() => loaded.kind === "ready" ? loaded.value : initial(item.id));
  const [draft, setDraft] = useState("");
  const [notice, setNotice] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [shareNotice, setShareNotice] = useState("");
  const sceneHeading = useRef<HTMLHeadingElement>(null);
  const firstSceneRender = useRef(true);
  const scene = item.scenes[session.scene];
  const publicLink = publicStoryLink(item.slug, language, window.location.origin,
    import.meta.env.VITE_PUBLIC_ORIGIN, Capacitor.isNativePlatform());
  const shareUrl = publicLink?.url ?? "";
  useEffect(() => {
    if (firstSceneRender.current) { firstSceneRender.current = false; return; }
    sceneHeading.current?.focus();
  }, [session.scene]);

  function persist(next: StorySession, mustSave: boolean) {
    if (loaded.kind === "error") {
      if (!mustSave) setSession(next);
      setNotice(tr(language, "Clear the unreadable saved place before this device can keep a new one.", "नई जगह सहेजने से पहले पुरानी अपठनीय जगह हटाएँ।"));
      return false;
    }
    if (!canPersist) {
      if (mustSave) { setNotice(tr(language, "Your account is still being checked; try saving again shortly.", "आपका खाता जाँचा जा रहा है; थोड़ी देर बाद फिर सहेजें।")); return false; }
      setSession(next);
      return true;
    }
    try {
      writeStorySession(window.localStorage, actorKey, next, item.scenes.length);
      setSession(next);
      setNotice("");
      return true;
    } catch {
      setNotice(tr(language, "This device could not keep that change. Reading still works; check browser storage before leaving.", "यह डिवाइस बदलाव नहीं रख सका। पढ़ना जारी रख सकते हैं; जाने से पहले ब्राउज़र संग्रह जाँचें।"));
      if (!mustSave) setSession(next);
      return false;
    }
  }
  function move(to: number) {
    if (to < 0 || to >= item.scenes.length) return;
    persist({ ...session, scene: to }, false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function finish() {
    persist({ ...session, finishedAt: new Date().toISOString() }, false);
  }
  function saveStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || text.length > 240) return;
    if (persist({ ...session, action: { text, savedAt: new Date().toISOString() } }, true)) setDraft("");
  }
  function removeStep() {
    const { action: _removed, ...rest } = session;
    void _removed;
    persist(rest, true);
  }
  function markTried() {
    if (!session.action || session.action.triedAt) return;
    persist({ ...session, action: { ...session.action, triedAt: new Date().toISOString() } }, true);
  }
  function respond(response: StoryResponse) {
    if (!session.action?.triedAt) return;
    persist({ ...session, action: { ...session.action, response } }, true);
  }
  function clearCorrupt() {
    try {
      clearStorySession(window.localStorage, actorKey, item.id);
      setLoaded({ kind: "empty" });
      setSession(initial(item.id));
      setNotice("");
    } catch { setNotice(tr(language, "This device could not clear its old reading position.", "यह डिवाइस पुरानी पढ़ने की जगह हटा नहीं सका।")); }
  }
  async function copyLink() {
    if (!shareUrl) return;
    try { await navigator.clipboard.writeText(shareUrl); setShareNotice(tr(language, "Link copied. Sharing has not been confirmed.", "कड़ी कॉपी हुई। साझा होना पुष्टि नहीं हुआ है।")); }
    catch { setShareNotice(tr(language, "Could not copy. Select the link below instead.", "कॉपी नहीं हुआ। नीचे दी गई कड़ी चुनें।")); }
  }
  async function share() {
    if (!shareUrl) return;
    if (!navigator.share) { await copyLink(); return; }
    try { await navigator.share({ title: item.title, text: `${item.title} · ${item.source.reference}`, url: shareUrl });
      setShareNotice(tr(language, "Share sheet closed. Delivery is not confirmed.", "साझा करने की सूची बंद हुई। पहुँचना पुष्टि नहीं हुआ है।")); }
    catch { setShareNotice(tr(language, "Sharing was cancelled or unavailable. You can copy the link instead.", "साझा करना रुक गया या उपलब्ध नहीं है। कड़ी कॉपी कर सकते हैं।")); }
  }

  return <article className="ku-page rk-story-reader"><Link className="ku-back" to="/alpha/stories">← {tr(language,"Stories","कथाएँ")}</Link>
    <header className="ku-intro"><span className="ku-kicker">{tr(language,"PUBLISHED RETELLING · SOURCE LINKED","प्रकाशित पुनर्कथन · स्रोत सहित")}</span><h1>{item.title}</h1><p>{item.source.reference}</p></header>
    <details className="rk-source-drawer"><summary>{tr(language,"View source and review","स्रोत और समीक्षा देखें")}</summary>{sourceCard}</details>
    {loaded.kind === "error" && <div className="rk-error" role="alert"><p>{tr(language,"An older saved place cannot be read. The published story is still available; you can start again on this device.","पुरानी सहेजी जगह पढ़ी नहीं जा सकी। प्रकाशित कथा अभी उपलब्ध है; इस डिवाइस पर फिर शुरू कर सकते हैं।")}</p><button type="button" onClick={clearCorrupt}>{tr(language,"Start again on this device","इस डिवाइस पर फिर शुरू करें")}</button></div>}
    {loaded.kind === "ready" && session.scene > 0 && <p className="rk-resume-note">{tr(language,"Resumed at your last scene on this device.","इस डिवाइस पर पिछली जगह से जारी।")}</p>}
    <div className="rk-story-position" aria-label={tr(language,"Story position","कथा में स्थान")}><span>{tr(language,"Part","भाग")} {session.scene + 1} / {item.scenes.length}</span><span>{session.finishedAt ? tr(language,"Finished by you","आपने पूरा किया") : tr(language,"Read at your pace","अपनी गति से पढ़ें")}</span></div>
    <section className="rk-story-scene" aria-live="polite"><span className="ku-kicker">{tr(language,"ORIGINAL RETELLING · NOT SOURCE TEXT","मूल पुनर्कथन · ग्रंथ का मूल पाठ नहीं")}</span><h2 ref={sceneHeading} tabIndex={-1}>{scene.reference}</h2><p>{scene.body}</p>{scene.reflection && <aside><small>{tr(language,"EDITORIAL REFLECTION","संपादकीय मनन")}</small><p>{scene.reflection}</p></aside>}</section>
    <div className="rk-story-controls"><button type="button" disabled={session.scene===0} onClick={()=>move(session.scene-1)}>{tr(language,"Previous","पीछे")}</button>
      {session.scene < item.scenes.length-1 ? <button className="rk-primary" type="button" onClick={()=>move(session.scene+1)}>{tr(language,"Continue story","कथा आगे पढ़ें")} →</button>
        : !session.finishedAt ? <button className="rk-primary" type="button" onClick={finish}>{tr(language,"Finish for now","अभी के लिए पूरा करें")}</button>
          : <button type="button" onClick={()=>move(0)}>{tr(language,"Read again","फिर पढ़ें")}</button>}</div>
    {session.finishedAt && <p role="status" className="rk-finish-note">{tr(language,"Reading is enough. Any step below is optional and yours to choose.","पढ़ना ही पर्याप्त है। नीचे दिया कदम वैकल्पिक है और आपका अपना चुनाव है।")}</p>}
    {session.finishedAt && <section className="rk-story-after" aria-labelledby="rk-step-title"><h2 id="rk-step-title">{tr(language,"A small step, if useful","अगर उपयोगी लगे, एक छोटा कदम")}</h2>
      <p>{tr(language,"Choose your own action after reading. This is your note, not a quotation or instruction from the source.","पढ़ने के बाद अपना कदम चुनें। यह आपका नोट है, स्रोत का उद्धरण या निर्देश नहीं।")}</p>
      {!session.action ? <form onSubmit={saveStep}><label htmlFor="rk-step">{tr(language,"One thing I might try","एक काम जो मैं आज़मा सकता/सकती हूँ")}</label><textarea id="rk-step" maxLength={240} value={draft} onChange={event=>setDraft(event.target.value)} rows={3} placeholder={tr(language,"For example: pause before one difficult reply","जैसे: कठिन जवाब देने से पहले ठहरना")}/><button type="submit" disabled={!draft.trim()||!canPersist}>{tr(language,"Keep this step on this device","यह कदम इस डिवाइस पर रखें")}</button></form>
        : <div className="rk-kept-step"><strong>{session.action.text}</strong><p>{tr(language,"Saved on this device only. It is not sent to a teacher or shared with a link.","केवल इस डिवाइस पर सहेजा गया। शिक्षक या साझा कड़ी को नहीं भेजा गया।")}</p>
          {!session.action.triedAt ? <button type="button" onClick={markTried}>{tr(language,"I tried it","मैंने इसे आज़माया")}</button> : <div><p>{tr(language,"You marked this tried. Was it useful?","आपने इसे आज़माया हुआ चिह्नित किया। क्या यह उपयोगी था?")}</p><button type="button" aria-pressed={session.action.response==="helpful"} onClick={()=>respond("helpful")}>{tr(language,"Helpful","उपयोगी")}</button><button type="button" aria-pressed={session.action.response==="not-yet"} onClick={()=>respond("not-yet")}>{tr(language,"Not yet","अभी नहीं")}</button></div>}
          <button type="button" onClick={removeStep}>{tr(language,"Delete my step","मेरा कदम हटाएँ")}</button></div>}
      <p className="rk-device-note">{tr(language,"This optional step and your reading place are stored unencrypted on this device. Anyone using this browser may see them. Avoid sensitive details; deleting browser data removes them.","यह वैकल्पिक कदम और आपकी पढ़ने की जगह इस डिवाइस पर बिना एन्क्रिप्शन रखी जाती है। इस ब्राउज़र का उपयोग करने वाला इन्हें देख सकता है। संवेदनशील विवरण न लिखें; ब्राउज़र डेटा हटाने पर ये मिट जाएँगे।")}</p>
    </section>}
    {notice && <p className="rk-error" role="alert">{notice}</p>}
    <div className="rk-story-secondary">{saveAction}<button type="button" disabled={!publicLink} onClick={()=>setShareOpen(value=>!value)} aria-expanded={shareOpen}>{publicLink?.localOnly?tr(language,"Preview local story link","स्थानीय कथा कड़ी देखें"):tr(language,"Share this public story","यह सार्वजनिक कथा साझा करें")}</button>{!publicLink&&<p>{tr(language,"Public sharing needs a verified HTTPS web origin.","सार्वजनिक साझा करने के लिए सत्यापित HTTPS वेब पता चाहिए।")}</p>}</div>
    {shareOpen && publicLink && <section className="rk-share-preview"><h2>{tr(language,"Preview the link","कड़ी पहले देखें")}</h2><p><strong>{item.title}</strong> · {item.source.reference}</p><p>{tr(language,"Your private step and reading place are not included.","आपका निजी कदम और पढ़ने की जगह इसमें शामिल नहीं हैं।")}</p><a href={shareUrl}>{shareUrl}</a><div><button type="button" onClick={()=>void copyLink()}>{tr(language,"Copy link","कड़ी कॉपी करें")}</button>{typeof navigator.share === "function" && <button type="button" onClick={()=>void share()}>{tr(language,"Open share sheet","साझा करने की सूची खोलें")}</button>}</div>{shareNotice&&<p role="status">{shareNotice}</p>}{publicLink.localOnly && <p>{tr(language,"This local test link is not accessible to another person yet.","यह स्थानीय परीक्षण कड़ी अभी दूसरे व्यक्ति के लिए उपलब्ध नहीं है।")}</p>}</section>}
    <p className="ku-disclosure">{tr(language,"This retelling is editorial prose, not a verbatim scripture passage. Review and current source rights are checked before it is shown.","यह पुनर्कथन संपादकीय गद्य है, मूल ग्रंथ का शब्दशः पाठ नहीं। इसे दिखाने से पहले समीक्षा और वर्तमान स्रोत अधिकार जाँचे जाते हैं।")}</p>
  </article>;
}
