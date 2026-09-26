import { lazy, Suspense, useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../../components/Icon";
import {
  claimCircleSeat, clearMyReadingProgress, createRealClient, loadCircleReadings,
  loadMyCircles, loadReadingProgress, loadTeacherAccess, realErrorMessage, setReadingMark,
  validateRealConfig, type RealCircle, type RealLanguage, type RealMarkKind,
  type RealReading, type RealReadingMark, type RealReadingProgress,
} from "./backend";
import "./real-alpha.css";

const RealTeacher = lazy(() => import("../teacher-real/TeacherReal"));
type AuthState =
  | { kind: "checking" }
  | { kind: "signed-out" }
  | { kind: "ready"; userId: string; email: string | null }
  | { kind: "error"; message: string };
type LoadState<T> =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; data: T };

const languagePreferenceKey = "spritual_alpha_real_language_v1";
const tr = (language: RealLanguage, english: string, hindi: string) => language === "hi" ? hindi : english;
function initialLanguage(): RealLanguage {
  try {
    const deepLinkLanguage = new URLSearchParams(window.location.search).get("language");
    if (deepLinkLanguage === "en" || deepLinkLanguage === "hi") return deepLinkLanguage;
    return window.localStorage.getItem(languagePreferenceKey) === "hi" ? "hi" : "en";
  }
  catch { return "en"; }
}
function rememberLanguage(language: RealLanguage) {
  try { window.localStorage.setItem(languagePreferenceKey, language); }
  catch { /* A blocked preference store must not block reading. */ }
}

function useRealAuth(client: SupabaseClient) {
  const [state, setState] = useState<AuthState>({ kind: "checking" });
  const sequence = useRef(0);
  const verify = useCallback(async () => {
    const request = ++sequence.current;
    setState({ kind: "checking" });
    try {
      // getSession is used only to detect whether a local session exists. The
      // user identity is accepted only after getUser verifies it with Auth.
      const { data: session, error: sessionError } = await client.auth.getSession();
      if (request !== sequence.current) return;
      if (sessionError) throw sessionError;
      if (!session.session) {
        setState({ kind: "signed-out" });
        return;
      }
      const { data, error } = await client.auth.getUser();
      if (request !== sequence.current) return;
      if (error || !data.user) throw error ?? Error("User verification failed");
      setState({ kind: "ready", userId: data.user.id, email: data.user.email ?? null });
    } catch {
      if (request === sequence.current) setState({ kind: "error", message: "Your account could not be verified. Check the connection and try again." });
    }
  }, [client]);

  useEffect(() => {
    void verify();
    const { data: { subscription } } = client.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        ++sequence.current;
        setState({ kind: "signed-out" });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        // Supabase advises against awaiting its API inside this callback.
        window.setTimeout(() => { void verify(); }, 0);
      }
    });
    return () => { ++sequence.current; subscription.unsubscribe(); };
  }, [client, verify]);

  return { state, verify };
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => { window.removeEventListener("online", update); window.removeEventListener("offline", update); };
  }, []);
  return online;
}

function LanguageSwitch({ language, onChange }: { language: RealLanguage; onChange: (value: RealLanguage) => void }) {
  return <fieldset className="real-language" aria-label={tr(language, "App language", "ऐप की भाषा")}>
    <legend>{tr(language, "App language", "ऐप की भाषा")}</legend>
    <button type="button" lang="en" aria-pressed={language === "en"} onClick={() => onChange("en")}>English</button>
    <button type="button" lang="hi" aria-pressed={language === "hi"} onClick={() => onChange("hi")}>हिन्दी</button>
  </fieldset>;
}

function RealSignIn({ client, onVerified, language, onLanguageChange }: { client: SupabaseClient; onVerified: () => Promise<void>; language: RealLanguage; onLanguageChange: (value: RealLanguage) => void }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const redirect = window.location.protocol === "https:" || window.location.protocol === "http:"
        ? { emailRedirectTo: `${window.location.origin}/alpha/today` }
        : {};
      const { error: authError } = await client.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: false, ...redirect },
      });
      if (authError) throw authError;
      setSent(true);
    } catch {
      setError(tr(language, "We could not start sign-in. Check your address and connection, then try again.", "साइन इन शुरू नहीं हो सका। अपना ईमेल पता और इंटरनेट जाँचें, फिर दोबारा कोशिश करें।"));
    } finally { setBusy(false); }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error: authError } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "email" });
      if (authError) throw authError;
      await onVerified();
    } catch {
      setError(tr(language, "That code could not be verified. Check it or request a new email.", "यह कोड सत्यापित नहीं हो सका। कोड जाँचें या नया ईमेल मँगाएँ।"));
    } finally { setBusy(false); }
  }

  return <div className="real-intro alpha-stack">
    <LanguageSwitch language={language} onChange={onLanguageChange} />
    <p className="alpha-kicker">{tr(language, "A place in your circle", "आपके समूह में आपका स्थान")}</p>
    <h1>{tr(language, "Continue with your teacher.", "अपने शिक्षक के साथ आगे बढ़ें।")}</h1>
    <p className="alpha-lead">{tr(language, "Sign in with an account your community has already arranged. Only released, reviewed readings can appear here.", "अपने समुदाय द्वारा पहले से बनाए गए खाते से साइन इन करें। यहाँ केवल जाँची और जारी की गई सामग्री दिखाई देगी।")}</p>
    <div className="real-auth-panel alpha-panel">
      <h2>{sent ? tr(language, "Check your email", "अपना ईमेल देखें") : tr(language, "Sign in", "साइन इन करें")}</h2>
      {!sent ? <form className="alpha-stack" onSubmit={sendCode}>
        <label className="alpha-field">{tr(language, "Email address", "ईमेल पता")}
          <input required autoComplete="email" inputMode="email" type="email" value={email} onChange={event => setEmail(event.target.value)} disabled={busy} />
        </label>
        <button className="alpha-button" type="submit" disabled={busy}>{busy ? tr(language, "Please wait…", "कृपया प्रतीक्षा करें…") : tr(language, "Send sign-in email", "साइन इन ईमेल भेजें")}</button>
      </form> : <>
        <p>{tr(language, "If this account is provisioned, your email will contain a sign-in link or code. A code works here when the email template is configured for it.", "अगर आपका खाता बनाया गया है, तो ईमेल में साइन इन लिंक या कोड आएगा। यहाँ कोड तभी काम करेगा जब ईमेल टेम्पलेट उसके लिए तैयार हो।")}</p>
        <form className="alpha-stack" onSubmit={verifyCode}>
          <label className="alpha-field">{tr(language, "Email code", "ईमेल कोड")}
            <input required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,8}" maxLength={8} value={token} onChange={event => setToken(event.target.value)} disabled={busy} />
          </label>
          <button className="alpha-button" type="submit" disabled={busy}>{busy ? tr(language, "Verifying…", "सत्यापन हो रहा है…") : tr(language, "Verify code", "कोड सत्यापित करें")}</button>
        </form>
        <button className="alpha-text-button" type="button" onClick={() => { setSent(false); setToken(""); setError(""); }} disabled={busy}>{tr(language, "Use another email or request again", "दूसरा ईमेल इस्तेमाल करें या फिर मँगाएँ")}</button>
      </>}
      {error && <p role="alert" className="alpha-error">{error}</p>}
    </div>
    <p className="alpha-muted">{tr(language, "A sign-in email does not create an account, accept an invitation, or grant paid access.", "साइन इन ईमेल से नया खाता नहीं बनता, निमंत्रण स्वीकार नहीं होता और भुगतान वाली पहुँच नहीं मिलती।")}</p>
  </div>;
}

function useCircles(client: SupabaseClient, language: RealLanguage) {
  const [state, setState] = useState<LoadState<RealCircle[]>>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    loadMyCircles(client).then(data => { if (active) setState({ kind: "ready", data }); }, error => {
      if (active) setState({ kind: "error", message: realErrorMessage(error, language) });
    });
    return () => { active = false; };
  }, [client, language, attempt]);
  return { state, retry: () => setAttempt(value => value + 1) };
}

function useTeacherAccess(client: SupabaseClient, language: RealLanguage) {
  const [state, setState] = useState<LoadState<boolean>>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    loadTeacherAccess(client).then(data => { if (active) setState({ kind: "ready", data }); }, error => {
      if (active) setState({ kind: "error", message: realErrorMessage(error, language) });
    });
    return () => { active = false; };
  }, [client, language, attempt]);
  useEffect(() => {
    const recheck = () => { if (document.visibilityState === "visible") setAttempt(value => value + 1); };
    document.addEventListener("visibilitychange", recheck);
    return () => document.removeEventListener("visibilitychange", recheck);
  }, []);
  return { state, retry: () => setAttempt(value => value + 1) };
}

function useReadings(client: SupabaseClient, cohortId: string | undefined, language: RealLanguage) {
  const [state, setState] = useState<LoadState<RealReading[]>>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    if (!cohortId) {
      setState({ kind: "error", message: tr(language, "This circle address is incomplete.", "इस समूह का पता अधूरा है।") });
      return () => { active = false; };
    }
    loadCircleReadings(client, cohortId, language).then(data => { if (active) setState({ kind: "ready", data }); }, error => {
      if (active) setState({ kind: "error", message: realErrorMessage(error, language) });
    });
    return () => { active = false; };
  }, [client, cohortId, language, attempt]);
  useEffect(() => {
    const recheck = () => { if (document.visibilityState === "visible") setAttempt(value => value + 1); };
    document.addEventListener("visibilitychange", recheck);
    return () => document.removeEventListener("visibilitychange", recheck);
  }, []);
  return { state, retry: () => setAttempt(value => value + 1) };
}

function useReadingProgress(client: SupabaseClient, language: RealLanguage, cohortId: string | null = null) {
  const [state, setState] = useState<LoadState<RealReadingProgress[]>>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setState({ kind: "loading" });
    loadReadingProgress(client, cohortId).then(data => {
      if (active) setState({ kind: "ready", data });
    }, error => {
      if (active) setState({ kind: "error", message: realErrorMessage(error, language) });
    });
    return () => { active = false; };
  }, [client, cohortId, language, attempt]);
  useEffect(() => {
    const recheck = () => { if (document.visibilityState === "visible") setAttempt(value => value + 1); };
    document.addEventListener("visibilitychange", recheck);
    return () => document.removeEventListener("visibilitychange", recheck);
  }, []);
  const applyMark = useCallback((mark: RealReadingMark, reading: RealReading, circleId: string) => {
    setState(previous => {
      if (previous.kind !== "ready") return previous;
      const data = previous.data.filter(item => item.releaseId !== mark.releaseId);
      if (mark.bookmarkedAt || mark.completedAt) data.push({
        ...mark, cohortId: circleId, reference: reading.reference,
        workTitle: reading.workTitle, language: reading.language,
      });
      return { kind: "ready", data };
    });
  }, []);
  return { state, retry: () => setAttempt(value => value + 1), applyMark };
}

function LoadResult<T>({ state, retry, language, children }: { state: LoadState<T>; retry: () => void; language: RealLanguage; children: (data: T) => React.ReactNode }) {
  if (state.kind === "loading") return <p role="status" className="real-status">{tr(language, "Checking current access…", "वर्तमान पहुँच जाँची जा रही है…")}</p>;
  if (state.kind === "error") return <div className="alpha-panel alpha-stack" role="alert"><p>{state.message}</p><button className="alpha-secondary" type="button" onClick={retry}>{tr(language, "Try again", "फिर कोशिश करें")}</button></div>;
  return <>{children(state.data)}</>;
}

function circleState(circle: RealCircle, language: RealLanguage): string {
  const now = Date.now();
  if (Date.parse(circle.startsAt) > now) return tr(language, "Starts soon", "जल्द शुरू होगा");
  if (Date.parse(circle.endsAt) <= now) return tr(language, "Ended", "समाप्त");
  return tr(language, "Open", "खुला है");
}
function circleRole(circle: RealCircle, language: RealLanguage): string {
  if (circle.role === "member") return tr(language, "Member", "सदस्य");
  if (circle.role === "teacher") return tr(language, "Teacher", "शिक्षक");
  if (circle.role === "reviewer") return tr(language, "Reviewer", "समीक्षक");
  return tr(language, "Admin", "प्रबंधक");
}

function RealHome({ client, language, onLanguageChange, canTeach }: { client: SupabaseClient; language: RealLanguage; onLanguageChange: (value: RealLanguage) => void; canTeach: boolean }) {
  const { state, retry } = useCircles(client, language);
  const progress = useReadingProgress(client, language);
  const [token, setToken] = useState("");
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimNotice, setClaimNotice] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearError, setClearError] = useState("");
  const [clearNotice, setClearNotice] = useState("");
  async function claim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClaiming(true);
    setClaimError("");
    setClaimNotice("");
    try {
      await claimCircleSeat(client, token, adultConfirmed);
      setToken("");
      setAdultConfirmed(false);
      setClaimNotice(tr(language, "Your place was claimed. Check your circles for readings released by the teacher.", "आपका स्थान स्वीकार हो गया। शिक्षक द्वारा जारी सामग्री अपने समूह में देखें।"));
      retry();
    } catch (error) {
      setClaimError(realErrorMessage(error, language));
    } finally { setClaiming(false); }
  }
  async function clearProgress() {
    setClearing(true);
    setClearError("");
    setClearNotice("");
    try {
      await clearMyReadingProgress(client);
      setConfirmClear(false);
      setClearNotice(tr(language, "Your saved and read marks were removed from this account.", "इस खाते से आपके सहेजे गए और पढ़े गए निशान हटा दिए गए हैं।"));
      progress.retry();
    } catch (error) {
      setClearError(realErrorMessage(error, language));
    } finally { setClearing(false); }
  }
  return <section className="alpha-stack real-home">
    <p className="alpha-kicker">{tr(language, "Your community", "आपका समुदाय")}</p>
    <h1>{tr(language, "One reading at a time.", "एक समय में एक पाठ।")}</h1>
    <p className="alpha-lead">{tr(language, "Your circle’s released readings appear here after a teacher schedules them. Begin whenever you have a little room.", "शिक्षक जब आपके समूह के लिए पाठ जारी करेंगे, वे यहाँ दिखाई देंगे। जब थोड़ा समय मिले, तब शुरू करें।")}</p>
    {canTeach && <Link className="real-teacher-entry" to="/alpha/teacher"><span><strong>{tr(language, "Teacher workspace", "शिक्षक कार्यक्षेत्र")}</strong><small>{tr(language, "Create circles and schedule eligible readings", "समूह और पाठ जारी करें · कार्यस्थल अभी अंग्रेज़ी में है")}</small></span><span aria-hidden="true">↗</span></Link>}
    <LoadResult state={state} retry={retry} language={language}>{circles => circles.length ? <div className="real-circle-list">
      {circles.map(circle => <Link className="real-circle" to={`/alpha/circle/${circle.cohortId}`} key={circle.cohortId}>
        <span className="alpha-kicker">{circle.orgName}</span>
        <strong>{circle.name}</strong>
        <span>{circleState(circle, language)} · {circleRole(circle, language)}</span>
        <span aria-hidden="true" className="real-arrow">↗</span>
      </Link>)}
    </div> : <div className="alpha-panel alpha-stack"><h2>{tr(language, "No circle yet.", "अभी कोई समूह नहीं।")}</h2><p>{tr(language, "Your account is verified, but no invitation has been claimed for it. Ask your community organiser for a recipient-bound code.", "आपका खाता सत्यापित है, पर अभी कोई निमंत्रण स्वीकार नहीं हुआ है। अपने समुदाय के आयोजक से अपने खाते के लिए निमंत्रण कोड माँगें।")}</p><p className="alpha-muted">{tr(language, "No sample content has been inserted into this account.", "इस खाते में कोई नमूना सामग्री नहीं जोड़ी गई है।")}</p></div>}</LoadResult>
    <section className="real-return alpha-stack" aria-labelledby="real-return-heading">
      <div className="real-section-heading"><div><p className="alpha-kicker">{tr(language, "For another moment", "जब फिर समय मिले")}</p><h2 id="real-return-heading">{tr(language, "Your saved readings", "आपके सहेजे हुए पाठ")}</h2></div><p>{tr(language, "Only passages you choose to save appear here.", "यहाँ केवल वही पाठ दिखते हैं जिन्हें आप सहेजते हैं।")}</p></div>
      {progress.state.kind === "loading" && <p className="real-status" role="status">{tr(language, "Checking your saved readings…", "आपके सहेजे पाठ जाँचे जा रहे हैं…")}</p>}
      {progress.state.kind === "error" && <div className="alpha-panel alpha-stack" role="alert"><p>{tr(language, "Saved readings are unavailable right now. Your circles can still be opened.", "अभी सहेजे पाठ उपलब्ध नहीं हैं। आप अपने समूह खोल सकते हैं।")}</p><p className="alpha-muted">{progress.state.message}</p><button className="alpha-secondary" type="button" onClick={progress.retry}>{tr(language, "Try again", "फिर कोशिश करें")}</button></div>}
      {progress.state.kind === "ready" && (() => {
        const saved = progress.state.data.filter(item => item.bookmarkedAt);
        return saved.length ? <div className="real-reading-list">{saved.map(item => <Link className="real-reading-link" key={item.releaseId} onClick={() => onLanguageChange(item.language)} to={`/alpha/circle/${item.cohortId}/reading/${item.releaseId}?language=${item.language}`}>
          <span className="alpha-kicker">{item.workTitle} · {item.language === "hi" ? "हिन्दी" : "English"}</span>
          <strong>{item.reference}</strong>
          <span>{item.completedAt ? tr(language, "Marked as read · Return whenever you like", "पढ़ा हुआ · जब चाहें लौटें") : tr(language, "Saved for later", "बाद के लिए सहेजा")}</span>
          <span className="real-arrow" aria-hidden="true">→</span>
        </Link>)}</div> : <p className="alpha-muted">{tr(language, "Nothing saved yet. A reading can be saved only while you have access to it.", "अभी कोई पाठ सहेजा नहीं है। पहुँच रहने पर ही आप पाठ सहेज सकते हैं।")}</p>;
      })()}
      <details className="real-data-control"><summary>{tr(language, "Your reading marks and privacy", "आपके पाठ निशान और गोपनीयता")}</summary><p>{tr(language, "Saving and marking as read are optional actions stored privately in this account across devices. They are not shared with a teacher and do not measure understanding. Personal reflections are not uploaded.", "सहेजना और पढ़ा हुआ चिह्नित करना वैकल्पिक है। ये निशान आपके खाते में निजी रूप से रहते हैं और दूसरे उपकरणों पर भी दिखते हैं। शिक्षक के साथ साझा नहीं होते और समझ को नहीं मापते। निजी मनन यहाँ अपलोड नहीं होते।")}</p>
        {!confirmClear ? <button className="alpha-text-button" type="button" onClick={() => { setConfirmClear(true); setClearError(""); }}>{tr(language, "Remove all my saved and read marks", "मेरे सभी सहेजे और पढ़े निशान हटाएँ")}</button> : <div className="real-clear-confirm"><p>{tr(language, "This removes every reading mark in this account, including marks for readings you can no longer open.", "इस खाते के सभी पाठ निशान हट जाएँगे, उन पाठों के भी जिन्हें अब आप खोल नहीं सकते।")}</p><button className="alpha-secondary" type="button" disabled={clearing} onClick={clearProgress}>{clearing ? tr(language, "Removing…", "हटाया जा रहा है…") : tr(language, "Yes, remove all marks", "हाँ, सभी निशान हटाएँ")}</button><button className="alpha-text-button" type="button" disabled={clearing} onClick={() => setConfirmClear(false)}>{tr(language, "Keep my marks", "मेरे निशान रहने दें")}</button></div>}
        {clearError && <p className="alpha-error" role="alert">{clearError}</p>}
        {clearNotice && <p className="alpha-notice" role="status">{clearNotice}</p>}
      </details>
    </section>
    <form className="alpha-panel alpha-stack real-claim" onSubmit={claim}>
      <h2>{tr(language, "Have an invitation code?", "क्या आपके पास निमंत्रण कोड है?")}</h2>
      <p>{tr(language, "Enter the code given directly to your account by your organiser. This claims a seat only; it does not charge you or create paid access.", "आयोजक से सीधे आपके खाते के लिए मिला कोड डालें। इससे केवल समूह में स्थान मिलता है; कोई शुल्क नहीं लगता और भुगतान वाली पहुँच नहीं मिलती।")}</p>
      <label className="alpha-field">{tr(language, "Invitation code", "निमंत्रण कोड")}
        <input value={token} onChange={event => setToken(event.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} minLength={64} maxLength={64} pattern="[0-9a-fA-F]{64}" required disabled={claiming} />
      </label>
      <label className="alpha-check-field"><input type="checkbox" checked={adultConfirmed} onChange={event => setAdultConfirmed(event.target.checked)} required disabled={claiming} /><span>{tr(language, "I confirm that I am an adult and I choose to join this circle.", "मैं पुष्टि करता/करती हूँ कि मैं वयस्क हूँ और अपनी इच्छा से इस समूह में जुड़ रहा/रही हूँ।")}</span></label>
      <button className="alpha-button" type="submit" disabled={claiming}>{claiming ? tr(language, "Checking invitation…", "निमंत्रण जाँचा जा रहा है…") : tr(language, "Claim my place", "मेरा स्थान स्वीकार करें")}</button>
      {claimError && <p role="alert" className="alpha-error">{claimError}</p>}
      {claimNotice && <p role="status" className="alpha-notice">{claimNotice}</p>}
    </form>
  </section>;
}

function RealCirclePage({ client, language }: { client: SupabaseClient; language: RealLanguage }) {
  const { cohortId } = useParams();
  const { state: circles, retry: retryCircles } = useCircles(client, language);
  const { state: readings, retry: retryReadings } = useReadings(client, cohortId, language);
  const progress = useReadingProgress(client, language, cohortId ?? null);
  return <section className="alpha-stack real-home">
    <Link className="alpha-back" to="/alpha/today">← {tr(language, "Your circles", "आपके समूह")}</Link>
    <LoadResult state={circles} retry={retryCircles} language={language}>{items => {
      const circle = items.find(item => item.cohortId === cohortId);
      if (!circle) return <div className="alpha-panel"><h1>{tr(language, "Circle unavailable.", "समूह उपलब्ध नहीं है।")}</h1><p>{tr(language, "This account does not currently belong to this circle.", "यह खाता अभी इस समूह का सदस्य नहीं है।")}</p></div>;
      return <><p className="alpha-kicker">{circle.orgName}</p><h1>{circle.name}</h1><p className="alpha-lead">{tr(language, "Released readings in English. Content can change when a release, permission or source right changes.", "हिन्दी में जारी पाठ। जारी करने की स्थिति, अनुमति या स्रोत अधिकार बदलने पर सामग्री बदल सकती है।")}</p>
        {Date.parse(circle.startsAt) > Date.now() || Date.parse(circle.endsAt) <= Date.now() ? <div className="alpha-panel"><p>{tr(language, `This circle is ${circleState(circle, language).toLowerCase()}. Readings are available only while it is open.`, `यह समूह ${circleState(circle, language)}। पाठ केवल समूह के खुले रहने पर उपलब्ध होते हैं।`)}</p></div> : <LoadResult state={readings} retry={retryReadings} language={language}>{items => items.length ? <ol className="real-reading-list">{items.map(item => {
          const mark = progress.state.kind === "ready" ? progress.state.data.find(entry => entry.releaseId === item.releaseId) : undefined;
          return <li key={item.releaseId}><Link className="real-reading-link" to={`/alpha/circle/${cohortId}/reading/${item.releaseId}`}><span className="alpha-kicker">{item.workTitle} · {tr(language, item.kind.replaceAll("_", " "), item.kind === "canonical_text" ? "मूल ग्रंथ" : "पाठ")}</span><strong>{item.reference}</strong><span>{tr(language, "Reviewed by", "समीक्षक")}: {item.reviewerName}</span>{mark && <span className="real-mark-pills">{mark.bookmarkedAt && <small>{tr(language, "Saved", "सहेजा")}</small>}{mark.completedAt && <small>{tr(language, "Read", "पढ़ा")}</small>}</span>}<span aria-hidden="true" className="real-arrow">→</span></Link></li>;
        })}</ol> : <div className="alpha-panel alpha-stack"><h2>{tr(language, "Nothing released in this language yet.", "इस भाषा में अभी कुछ जारी नहीं हुआ है।")}</h2><p>{tr(language, "Your teacher may not have released a reviewed reading in English yet. You can try the other language.", "शिक्षक ने शायद अभी हिन्दी में जाँचा हुआ पाठ जारी नहीं किया है। आप दूसरी भाषा आज़मा सकते हैं।")}</p></div>}</LoadResult>}
      </>;
    }}</LoadResult>
  </section>;
}

function RealReadingPage({ client, language }: { client: SupabaseClient; language: RealLanguage }) {
  const { cohortId, releaseId } = useParams();
  const { state, retry } = useReadings(client, cohortId, language);
  const progress = useReadingProgress(client, language, cohortId ?? null);
  const [busyKind, setBusyKind] = useState<RealMarkKind | null>(null);
  const [markError, setMarkError] = useState("");
  const [markNotice, setMarkNotice] = useState("");
  async function changeMark(reading: RealReading, kind: RealMarkKind, enabled: boolean) {
    if (!cohortId || busyKind || progress.state.kind !== "ready") return;
    setBusyKind(kind);
    setMarkError("");
    setMarkNotice("");
    try {
      const mark = await setReadingMark(client, reading.releaseId, kind, enabled);
      progress.applyMark(mark, reading, cohortId);
      setMarkNotice(kind === "bookmark" ? (enabled ? tr(language, "Saved privately to your account.", "आपके खाते में निजी रूप से सहेजा गया।") : tr(language, "Saved mark removed.", "सहेजने का निशान हटाया गया।")) : (enabled ? tr(language, "Marked as read. This does not measure understanding.", "पढ़ा हुआ चिह्नित किया गया। यह आपकी समझ को नहीं मापता।") : tr(language, "Read mark removed.", "पढ़ने का निशान हटाया गया।")));
    } catch (error) {
      setMarkError(realErrorMessage(error, language));
      // A release may have been withdrawn while the member was reading.
      // Recheck before allowing a second write and remove unavailable text.
      if (!navigator.onLine || (error instanceof Error && "code" in error && error.code === "42501")) {
        retry();
      }
    } finally { setBusyKind(null); }
  }
  return <section className="alpha-stack real-reading">
    <Link className="alpha-back" to={cohortId ? `/alpha/circle/${cohortId}` : "/alpha/today"}>← {tr(language, "Circle readings", "समूह के पाठ")}</Link>
    <LoadResult state={state} retry={retry} language={language}>{items => {
      const reading = items.find(item => item.releaseId === releaseId);
      if (!reading) return <div className="alpha-panel alpha-stack"><h1>{tr(language, "Reading unavailable.", "पाठ उपलब्ध नहीं है।")}</h1><p>{tr(language, "It may have been withdrawn, changed language, or lost current permission or source rights.", "यह पाठ वापस लिया गया हो सकता है, भाषा बदली हो सकती है, या अनुमति अथवा स्रोत अधिकार अब उपलब्ध न हों।")}</p><Link className="alpha-secondary" to={cohortId ? `/alpha/circle/${cohortId}` : "/alpha/today"}>{tr(language, "See available readings", "उपलब्ध पाठ देखें")}</Link></div>;
      return <article className="alpha-stack">
        <div className="real-reading-head"><p className="alpha-kicker">{reading.workTitle} · {tr(language, reading.kind.replaceAll("_", " "), reading.kind === "canonical_text" ? "मूल ग्रंथ" : "पाठ")}</p><h1>{reading.reference}</h1><p className="alpha-muted">{reading.accessClass === "paid" ? tr(language, "Included through this circle’s current entitlement", "इस समूह की वर्तमान पात्रता से उपलब्ध") : tr(language, "Shared with your circle", "आपके समूह के साथ साझा किया गया")}</p></div>
        <div className="real-reading-body alpha-panel"><p lang={language}>{reading.body}</p>{reading.transliteration && <div className="real-transliteration"><span className="alpha-kicker">{tr(language, "Pronunciation guide", "उच्चारण सहायता")}</span><p lang="sa-Latn">{reading.transliteration}</p></div>}</div>
        <div className="real-reading-actions alpha-panel alpha-stack" aria-label={tr(language, "Private reading actions", "निजी पाठ विकल्प")}>
          <div><h2>{tr(language, "Carry this reading with you", "इस पाठ को साथ रखें")}</h2><p>{tr(language, "Choose what to keep. Opening this page never records progress, and a read mark is only your own note to yourself.", "क्या रखना है, यह आप तय करें। पेज खोलने से प्रगति दर्ज नहीं होती और पढ़ा हुआ निशान केवल आपके लिए है।")}</p></div>
          {progress.state.kind === "loading" && <p className="real-status" role="status">{tr(language, "Checking your private reading marks…", "आपके निजी पाठ निशान जाँचे जा रहे हैं…")}</p>}
          {progress.state.kind === "error" && <div className="real-mark-error" role="alert"><p>{tr(language, "Reading marks are unavailable right now. You can still read this passage.", "अभी पाठ निशान उपलब्ध नहीं हैं। आप फिर भी यह पाठ पढ़ सकते हैं।")}</p><p>{progress.state.message}</p><button type="button" className="alpha-secondary" onClick={progress.retry}>{tr(language, "Try again", "फिर कोशिश करें")}</button></div>}
          {progress.state.kind === "ready" && (() => {
            const mark = progress.state.data.find(item => item.releaseId === reading.releaseId);
            const saved = !!mark?.bookmarkedAt;
            const completed = !!mark?.completedAt;
            return <div className="real-mark-buttons"><button type="button" className="alpha-secondary" aria-pressed={saved} disabled={!!busyKind} onClick={() => void changeMark(reading, "bookmark", !saved)}>{busyKind === "bookmark" ? tr(language, "Saving…", "सहेजा जा रहा है…") : saved ? tr(language, "Remove saved mark", "सहेजा निशान हटाएँ") : tr(language, "Save for later", "बाद के लिए सहेजें")}</button><button type="button" className="alpha-secondary" aria-pressed={completed} disabled={!!busyKind} onClick={() => void changeMark(reading, "completed", !completed)}>{busyKind === "completed" ? tr(language, "Updating…", "बदला जा रहा है…") : completed ? tr(language, "Undo read mark", "पढ़ा हुआ निशान हटाएँ") : tr(language, "Mark as read", "पढ़ा हुआ चिह्नित करें")}</button></div>;
          })()}
          {markError && <p role="alert" className="alpha-error">{markError}</p>}
          {markNotice && <p role="status" className="alpha-notice">{markNotice}</p>}
          <p className="alpha-muted">{tr(language, "Only you can see these account marks. You can undo either action or remove all marks from Your circles. No reflection text is saved here.", "खाते के ये निशान केवल आपको दिखते हैं। दोनों कार्य वापस किए जा सकते हैं या सभी निशान आपके समूह पेज से हटाए जा सकते हैं। यहाँ मनन का पाठ सहेजा नहीं जाता।")}</p>
        </div>
        <aside className="real-source alpha-panel" aria-label={tr(language, "Source and review details", "स्रोत और समीक्षा विवरण")}><h2>{tr(language, "Where this comes from", "इसका स्रोत")}</h2><dl>
          <div><dt>{tr(language, "Reference", "संदर्भ")}</dt><dd>{reading.reference} · {reading.canonicalId}</dd></div>
          <div><dt>{tr(language, "Edition", "संस्करण")}</dt><dd>{reading.editionLabel}</dd></div>
          <div><dt>{tr(language, "Source", "स्रोत")}</dt><dd>{reading.sourceUrl ? <a href={reading.sourceUrl} target="_blank" rel="noopener noreferrer">{reading.sourceTitle} ↗</a> : reading.sourceTitle} · {reading.sourceIdentifier}</dd></div>
          <div><dt>{tr(language, "Review", "समीक्षा")}</dt><dd>{reading.reviewerName} · {new Date(reading.reviewedAt).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")}</dd></div>
          <div><dt>{tr(language, "Rights", "अधिकार")}</dt><dd>{reading.licenseKind.replaceAll("_", " ")}{reading.attribution ? ` · ${reading.attribution}` : ""}</dd></div>
        </dl></aside>
      </article>;
    }}</LoadResult>
  </section>;
}

function RealWorkspace({ client, email, language, onLanguageChange }: { client: SupabaseClient; email: string | null; language: RealLanguage; onLanguageChange: (value: RealLanguage) => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const requestedLanguage = new URLSearchParams(location.search).get("language");
  const activeLanguage: RealLanguage = requestedLanguage === "en" || requestedLanguage === "hi" ? requestedLanguage : language;
  const teacherAccess = useTeacherAccess(client, activeLanguage);
  const canTeach = teacherAccess.state.kind === "ready" && teacherAccess.state.data;
  function changeLanguage(value: RealLanguage) {
    onLanguageChange(value);
    if (requestedLanguage) navigate(location.pathname, { replace: true });
  }
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    } catch {
      setSignOutError(tr(activeLanguage, "Could not sign out. Please try again.", "साइन आउट नहीं हो सका। कृपया दोबारा कोशिश करें।"));
    } finally { setSigningOut(false); }
  }
  return <div className="alpha real-shell" lang={activeLanguage}>
    <header className="real-header"><Link to="/alpha/today" className="real-brand"><span className="brand-mark"><Icon name="sun" size={25} /></span><span>Spritual<small>{tr(activeLanguage, "A little, every day", "हर दिन थोड़ा सा")}</small></span></Link><button className="real-signout" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? tr(activeLanguage, "Signing out…", "साइन आउट हो रहा है…") : tr(activeLanguage, "Sign out", "साइन आउट")}</button></header>
    <div className="real-mode-banner">{tr(activeLanguage, "CONNECTED MODE · Real account and current permissions · No demo identities", "जुड़ा हुआ मोड · वास्तविक खाता और वर्तमान अनुमतियाँ · कोई डेमो पहचान नहीं")}</div>
    <div className="real-toolbar"><LanguageSwitch language={activeLanguage} onChange={changeLanguage} />{email && <span className="alpha-muted real-account">{email}</span>}</div>
    {teacherAccess.state.kind === "error" && <div className="alpha-panel alpha-stack real-role-error" role="alert"><p>{tr(activeLanguage, "Teacher access could not be checked. Your member readings remain available.", "शिक्षक की पहुँच जाँची नहीं जा सकी। आपके सदस्य पाठ अभी भी उपलब्ध हैं।")}</p><button type="button" className="alpha-secondary" onClick={teacherAccess.retry}>{tr(activeLanguage, "Check again", "फिर जाँचें")}</button></div>}
    {signOutError && <p role="alert" className="alpha-error real-flash">{signOutError}</p>}
    <main className="alpha-main" id="real-main"><Routes>
      <Route path="/alpha" element={<Navigate to="/alpha/today" replace />} />
      <Route path="/alpha/today" element={<RealHome client={client} language={activeLanguage} onLanguageChange={onLanguageChange} canTeach={canTeach} />} />
      <Route path="/alpha/circle/:cohortId" element={<RealCircleRoute client={client} language={activeLanguage} />} />
      <Route path="/alpha/circle/:cohortId/reading/:releaseId" element={<RealReadingRoute client={client} language={activeLanguage} />} />
      <Route path="/alpha/teacher" element={<div className="alpha-stack"><Link className="alpha-back" to="/alpha/today">← {tr(activeLanguage, "Your circles", "आपके समूह")}</Link><Suspense fallback={<p role="status">{tr(activeLanguage, "Opening teacher workspace…", "शिक्षक कार्यक्षेत्र खुल रहा है…")}</p>}><RealTeacher client={client} /></Suspense></div>} />
      <Route path="*" element={<div className="alpha-panel alpha-stack"><h1>{tr(activeLanguage, "Page unavailable.", "पेज उपलब्ध नहीं है।")}</h1><Link className="alpha-button" to="/alpha/today">{tr(activeLanguage, "Your circles", "आपके समूह")}</Link></div>} />
    </Routes></main>
  </div>;
}

// Remount on each address/language change so no previously authorised text is
// briefly presented under a new reference before the next rights check.
function RealCircleRoute({ client, language }: { client: SupabaseClient; language: RealLanguage }) {
  const { cohortId } = useParams();
  return <RealCirclePage key={`${cohortId}:${language}`} client={client} language={language} />;
}
function RealReadingRoute({ client, language }: { client: SupabaseClient; language: RealLanguage }) {
  const { cohortId, releaseId } = useParams();
  return <RealReadingPage key={`${cohortId}:${releaseId}:${language}`} client={client} language={language} />;
}

export default function RealAlphaApp() {
  const [language, setLanguage] = useState<RealLanguage>(initialLanguage);
  function changeLanguage(value: RealLanguage) { setLanguage(value); rememberLanguage(value); }
  const [connection] = useState(() => {
    try {
      return { client: createRealClient(validateRealConfig(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)), error: null };
    } catch (error) {
      return { client: null, error: realErrorMessage(error) };
    }
  });
  if (!connection.client) return <div className="alpha real-shell" lang={language}><main className="alpha-main alpha-stack real-intro"><LanguageSwitch language={language} onChange={changeLanguage} /><p className="alpha-kicker">{tr(language, "Connected alpha", "जुड़ा हुआ अल्फा")}</p><h1>{tr(language, "Connection required.", "कनेक्शन ज़रूरी है।")}</h1><p role="alert">{connection.error}</p><p>{tr(language, "The operator must configure a development Supabase project, expose only the audited app RPCs, apply tested migrations and provision accounts. This screen does not grant access or show demo readings.", "संचालक को विकास Supabase प्रोजेक्ट तैयार करना, केवल जाँचे हुए app RPC उपलब्ध कराना, परीक्षण किए गए माइग्रेशन लागू करना और खाते बनाना होगा। यह स्क्रीन पहुँच नहीं देती और डेमो पाठ नहीं दिखाती।")}</p></main></div>;
  return <RealConnected client={connection.client} language={language} onLanguageChange={changeLanguage} />;
}

function RealConnected({ client, language, onLanguageChange }: { client: SupabaseClient; language: RealLanguage; onLanguageChange: (value: RealLanguage) => void }) {
  const online = useOnline();
  const { state, verify } = useRealAuth(client);
  const wasOnline = useRef(online);
  useEffect(() => {
    if (online && !wasOnline.current) void verify();
    wasOnline.current = online;
  }, [online, verify]);
  if (!online) return <div className="alpha real-shell" lang={language}><main className="alpha-main alpha-stack real-intro"><LanguageSwitch language={language} onChange={onLanguageChange} /><p className="alpha-kicker">{tr(language, "Connected alpha", "जुड़ा हुआ अल्फा")}</p><h1>{tr(language, "Reconnect to read.", "पढ़ने के लिए फिर कनेक्ट करें।")}</h1><p>{tr(language, "Circle access and source rights must be checked live. No previously loaded reading is displayed while offline.", "समूह की पहुँच और स्रोत अधिकारों की जाँच ऑनलाइन करनी होती है। ऑफलाइन होने पर पहले से लोड किया गया पाठ नहीं दिखाया जाता।")}</p></main></div>;
  if (state.kind === "checking") return <div className="alpha real-shell" lang={language}><main className="alpha-main real-intro"><p role="status">{tr(language, "Checking your account…", "आपका खाता जाँचा जा रहा है…")}</p></main></div>;
  if (state.kind === "error") return <div className="alpha real-shell" lang={language}><main className="alpha-main alpha-stack real-intro"><LanguageSwitch language={language} onChange={onLanguageChange} /><h1>{tr(language, "We couldn’t verify your account.", "आपका खाता सत्यापित नहीं हो सका।")}</h1><p role="alert">{tr(language, state.message, "अपना इंटरनेट जाँचें और फिर कोशिश करें।")}</p><button className="alpha-secondary" type="button" onClick={() => { void verify(); }}>{tr(language, "Try again", "फिर कोशिश करें")}</button></main></div>;
  if (state.kind === "signed-out") return <div className="alpha real-shell" lang={language}><main className="alpha-main"><RealSignIn client={client} onVerified={verify} language={language} onLanguageChange={onLanguageChange} /></main></div>;
  return <RealWorkspace client={client} email={state.email} language={language} onLanguageChange={onLanguageChange} />;
}
