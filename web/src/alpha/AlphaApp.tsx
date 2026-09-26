import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { AlphaProvider, useAlpha } from "./context";
import { actors, createSeed } from "./fixtures";
import { access, visibleContents } from "./domain";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { AlphaOpening } from "../components/AlphaOpening";
import { motion } from "motion/react";
import Player from "./Player";
import { WisdomLesson, WisdomMyDay, useWisdom } from "./Wisdom";
import "./alpha.css";
import { DevotionalToday, DevotionalExplore } from "./DevotionalExperience";
import { DevotionalWelcome, FirstEntry } from "./DevotionalWelcome";
import { MotionSystem, glideSpring, useMotionSettings } from "./MotionSystem";
import { AlphaNativeExperience } from "./AlphaNativeExperience";
import { isNativeApp } from "../lib/platform";
import "./calm-shell.css";
import "./calm-themes.css";
import "./devotional-polish.css";
const Teacher = lazy(() => import("./Teacher"));
const RealAlphaApp = lazy(() => import("./real/RealAlphaApp"));
const GitaJourney = lazy(() => import("./Story").then(module => ({ default: module.GitaJourney })));
const GitaEpisode = lazy(() => import("./Story").then(module => ({ default: module.GitaEpisode })));
const LifeWisdom = lazy(() => import("./LifeWisdom").then(module => ({ default: module.LifeWisdom })));
const BeforeTeaching = lazy(() => import("./BeforeTeaching").then(module => ({ default: module.BeforeTeaching })));
const DivineDiscover = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.DivineDiscover })));
const DivineEntry = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.DivineEntry })));
const GraphStoryReader = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.GraphStoryReader })));
const UniversalSearch = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.UniversalSearch })));
const SourceContext = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.SourceContext })));
const ScriptureLibrary = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.ScriptureLibrary })));
const ScriptureWork = lazy(() => import("./KnowledgeUniverse").then(module => ({ default: module.ScriptureWork })));
const PracticeHub = lazy(() => import("./PracticeHub"));
const sample = {
  ...createSeed().contents[0],
  id: "public-sound-check",
  source:
    "Permanently public original sound-check fixture, independent of the teacher-controlled demo catalogue. No teacher recording or approval is claimed.",
};
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function AlphaApp() {
  const mode = import.meta.env.VITE_ALPHA_MODE || "demo";
  if (mode === "real") return <Suspense fallback={<div className="alpha"><main className="alpha-main" role="status">Opening connected alpha…</main></div>}><RealAlphaApp /></Suspense>;
  if (mode !== "demo")
    return (
      <div className="alpha">
        <main className="alpha-main alpha-stack">
          <p className="alpha-kicker">REAL-BACKED DEVELOPMENT</p>
          <h1>Connection required.</h1>
          <p>
            The authenticated alpha is not connected. Local fixture identities
            are disabled in this mode.
          </p>
          <p>
            Required: a configured development Supabase project, applied and
            tested tenant permissions, verified invitation/auth callbacks and
            approved media storage. No demo data is substituted.
          </p>
          <Link to="/today" className="alpha-secondary">
            Open the existing reading demo
          </Link>
        </main>
      </div>
    );
  return (
    <AlphaProvider>
      <MotionSystem><Shell /></MotionSystem>
    </AlphaProvider>
  );
}
function Shell() {
  const { actor, switchActor, prefs, error, notice } = useAlpha();
  const { reduced } = useMotionSettings();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/alpha" || location.pathname === "/alpha/welcome") return;
    try { localStorage.setItem("spritual_intro_seen_v1", "yes"); } catch { /* Navigation remains available without storage. */ }
  }, [location.pathname]);
  // A Life question may follow its cited reading and return within this open app.
  // Keep it only in memory; never put a private question in history or storage.
  const lifeReturnQuestion = useRef<{ actorId: string; question: string } | null>(null);
  useEffect(() => {
    const isLifeSource = location.pathname.startsWith("/alpha/episode/") || location.pathname.startsWith("/alpha/stories/") || location.pathname.startsWith("/alpha/sources/");
    if (location.pathname !== "/alpha/life" && !isLifeSource) lifeReturnQuestion.current = null;
  }, [location.pathname]);
  useEffect(() => { lifeReturnQuestion.current = null; }, [actor.id]);
  const storyReader = location.pathname.startsWith("/alpha/episode/") || location.pathname.startsWith("/alpha/stories/");
  const welcomePage = location.pathname === "/alpha/welcome";
  const reflectionPage = location.pathname.startsWith("/alpha/reflection/");
  const wisdomSurface = ["/alpha", "/alpha/today", "/alpha/library", "/alpha/life", "/alpha/divine", "/alpha/search", "/alpha/stories/arjuna-bow", "/alpha/my-day", "/alpha/practice", "/alpha/series/gita", "/alpha/account", "/alpha/settings"].includes(location.pathname) || location.pathname.startsWith("/alpha/divine/") || location.pathname.startsWith("/alpha/sources/") || location.pathname.startsWith("/alpha/scriptures") || location.pathname.startsWith("/alpha/wisdom/") || location.pathname.startsWith("/alpha/reflection/") || storyReader;
  const [readingLanguage, setReadingLanguage] = useState<"en" | "hi">("en");
  const [systemDark, setSystemDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;
    const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", onChange);
    setSystemDark(media.matches);
    return () => media.removeEventListener("change", onChange);
  }, []);
  const appearance = prefs.appearance === "system" ? (systemDark ? "night" : "light") : prefs.appearance;
  const [nativeReady, setNativeReady] = useState(!isNativeApp);
  const markNativeReady = useCallback(() => setNativeReady(true), []);
  useEffect(() => {
    const sync = () => {
      try {
        const raw = localStorage.getItem(`spritual_alpha_wisdom_v1_${actor.id}`);
        setReadingLanguage(raw && JSON.parse(raw).language === "hi" ? "hi" : "en");
      } catch { setReadingLanguage("en"); }
    };
    sync();
    window.addEventListener("spritual-alpha-language", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("spritual-alpha-language", sync); window.removeEventListener("storage", sync); };
  }, [actor.id]);
  const label = (en: string, hi: string) => readingLanguage === "hi" ? hi : en;
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    // The restored Life result owns focus and scroll when returning from its source.
    if (location.pathname === "/alpha/life" && lifeReturnQuestion.current?.actorId === actor.id) return;
    // The episode reader focuses its current heading; keep that context when entering it.
    if (!location.pathname.startsWith("/alpha/episode/")) main.current?.focus({ preventScroll: true });
    window.scrollTo({ left: 0, top: 0, behavior: "instant" });
  }, [location.pathname, nativeReady]);
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(navigator.onLine);
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  if (!nativeReady) return (
    <AlphaOpening language={readingLanguage}>
      <AlphaNativeExperience language={readingLanguage} appearance={wisdomSurface ? appearance : "light"} onReady={markNativeReady} />
    </AlphaOpening>
  );
  return (
    <div
      className={`alpha ${!location.pathname.startsWith("/alpha/teacher") ? "calm-shell" : ""}`}
      data-large={prefs.large}
      data-reduced={prefs.reduced}
      data-story={storyReader}
      data-welcome={welcomePage}
      data-reflection={reflectionPage}
      data-appearance={wisdomSurface ? appearance : "light"}
      lang={wisdomSurface ? readingLanguage : "en"}
    >
      <AlphaNativeExperience language={readingLanguage} appearance={wisdomSurface ? appearance : "light"} onReady={markNativeReady} />
      <a className="alpha-skip" href="#alpha-main">
        {label("Skip to content", "मुख्य भाग पर जाएँ")}
      </a>
      <div className="alpha-demo-banner">
        {label("LOCAL PREVIEW · Sample readings · No payment", "स्थानीय पूर्वावलोकन · नमूना पाठ · कोई भुगतान नहीं")}
      </div>
      <header className="alpha-header">
        <Link to="/alpha" aria-label={label("Spritual home", "Spritual होम")}>
          <span className="brand">
            <span className="brand-mark">
              <Icon name="sun" size={27} />
            </span>
            <span>
              Spritual<span className="brand-tag">A little, every day</span>
            </span>
          </span>
        </Link>
        <Link to="/alpha/settings" className="alpha-profile">
          {wisdomSurface ? label("Settings", "सेटिंग्स") : actor.name}
          <span aria-hidden="true">↗</span>
        </Link>
      </header>
      {!online && (
        <div className="alpha-offline" role="status">
          {label("You’re offline. Local readings and notes remain available; external sources need internet.", "आप ऑफ़लाइन हैं। स्थानीय पाठ और नोट उपलब्ध हैं; बाहरी स्रोत के लिए इंटरनेट चाहिए।")}
        </div>
      )}
      <main ref={main} tabIndex={-1} id="alpha-main" className="alpha-main">
        <div role="alert">
          {error && <p className="alpha-error">{error}</p>}
        </div>
        <div role="status" className="alpha-notice">
          {notice}
        </div>
        <Routes>
          <Route path="/alpha" element={<FirstEntry />} />
          <Route path="/alpha/welcome" element={<DevotionalWelcome />} />
          <Route
            path="/alpha/sample"
            element={<Player key="sample" content={sample} sample />}
          />
          <Route path="/alpha/sample-complete" element={<SampleComplete />} />
          <Route path="/alpha/join" element={<Join />} />
          <Route path="/alpha/today" element={<DevotionalToday />} />
          <Route path="/alpha/library" element={<DevotionalExplore />} />
          <Route path="/alpha/divine" element={<Suspense fallback={<p role="status">Opening Divine…</p>}><DivineDiscover /></Suspense>} />
          <Route path="/alpha/divine/:slug" element={<Suspense fallback={<p role="status">Opening this entry…</p>}><DivineEntry /></Suspense>} />
          <Route path="/alpha/search" element={<Suspense fallback={<p role="status">Opening search…</p>}><UniversalSearch /></Suspense>} />
          <Route path="/alpha/sources/:id" element={<Suspense fallback={<p role="status">Opening source context…</p>}><SourceContext /></Suspense>} />
          <Route path="/alpha/scriptures" element={<Suspense fallback={<p role="status">Opening scriptures…</p>}><ScriptureLibrary /></Suspense>} />
          <Route path="/alpha/scriptures/:slug" element={<Suspense fallback={<p role="status">Opening work…</p>}><ScriptureWork /></Suspense>} />
          <Route path="/alpha/practice" element={<Suspense fallback={<p role="status">Opening practice…</p>}><PracticeHub /></Suspense>} />
          <Route path="/alpha/life" element={<Suspense fallback={<p role="status">Finding your place…</p>}><LifeWisdom key={actor.id} restoreQuestion={lifeReturnQuestion.current?.actorId === actor.id ? lifeReturnQuestion.current.question : null} onOpenSource={question => { lifeReturnQuestion.current = { actorId: actor.id, question }; }} /></Suspense>} />
          <Route path="/alpha/stories/arjuna-bow" element={<Suspense fallback={<p role="status">Opening the story…</p>}><BeforeTeaching /></Suspense>} />
          <Route path="/alpha/stories/:slug" element={<Suspense fallback={<p role="status">Opening the story…</p>}><GraphStoryReader /></Suspense>} />
          <Route path="/alpha/wisdom/:id" element={<WisdomLesson />} />
          <Route path="/alpha/series/gita" element={<Suspense fallback={<p role="status">Opening the journey…</p>}><GitaJourney /></Suspense>} />
          <Route path="/alpha/episode/:id" element={<Suspense fallback={<p className="story-loading" role="status">Opening the reading…</p>}><GitaEpisode /></Suspense>} />
          <Route path="/alpha/my-day" element={<WisdomMyDay />} />
          <Route path="/alpha/circle" element={<Today />} />
          <Route path="/alpha/program" element={<Program />} />
          <Route
            path="/alpha/practice/:id"
            element={<MemberPlayer key={actor.id} />}
          />
          <Route path="/alpha/complete/:id" element={<Complete />} />
          <Route
            path="/alpha/reflection/:id"
            element={<Reflection key={actor.id + location.pathname} />}
          />
          <Route path="/alpha/account" element={<Navigate to="/alpha/settings" replace />} />
          <Route path="/alpha/settings" element={<Account />} />
          <Route path="/alpha/institutions" element={<Institution />} />
          <Route
            path="/alpha/teacher"
            element={
              <Suspense fallback={<p>Opening delivery workspace…</p>}>
                <Teacher />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <div className="alpha-stack">
                <h1>Let’s find your place.</h1>
                <p>
                  This page is not available. Your saved notes haven’t changed.
                </p>
                <Link className="alpha-button" to="/alpha/today">
                  Go to today
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="alpha-footer">
        <details>
          <summary>{label("Demo workspace controls", "डेमो कार्यस्थान के नियंत्रण")}</summary>
          <p>
            These are local test identities, not sign-in. Anyone with this
            browser can inspect its demo data. Never enter confidential content.
          </p>
          <label className="alpha-field">
            Demonstration identity
            <select
              value={actor.id}
              onChange={(e) => switchActor(e.target.value)}
            >
              {actors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.roles.join(", ")}
                </option>
              ))}
            </select>
          </label>
          <Link to="/alpha/teacher">Open teacher workspace</Link>
          <Link to="/today">Earlier reading demo</Link>
        </details>
      </footer>
      {!reflectionPage && location.pathname !== "/alpha/life" && <nav className="alpha-nav" aria-label={label("Main navigation", "मुख्य नेविगेशन")}>
        {[
          { to: "/alpha/today", icon: "sun" as const, en: "Today", hi: "आज", active: location.pathname === "/alpha/today" || location.pathname === "/alpha" },
          { to: "/alpha/library", icon: "book" as const, en: "Explore", hi: "खोजें", active: location.pathname === "/alpha/library" || location.pathname === "/alpha/search" || location.pathname === "/alpha/practice" || location.pathname.startsWith("/alpha/divine") || location.pathname.startsWith("/alpha/scriptures") || location.pathname.startsWith("/alpha/sources/") || location.pathname.startsWith("/alpha/stories/") || location.pathname.startsWith("/alpha/series/") || location.pathname.startsWith("/alpha/wisdom/") },
          { to: "/alpha/life", icon: "search" as const, en: "Ask", hi: "पूछें", active: location.pathname === "/alpha/life" },
          { to: "/alpha/my-day", icon: "bookmark" as const, en: "Saved", hi: "सहेजे हुए", active: location.pathname === "/alpha/my-day" || location.pathname.startsWith("/alpha/reflection/") },
        ].map(item => <Link key={item.to} to={item.to} className={item.active ? "active" : undefined} aria-current={item.active ? "location" : undefined}>
          {item.active && <motion.span className="alpha-nav-active" layoutId="alpha-calm-nav-active" transition={reduced ? { duration: 0 } : glideSpring} aria-hidden="true" />}
          <Icon name={item.icon}/><span>{label(item.en, item.hi)}</span>
        </Link>)}
      </nav>}
    </div>
  );
}
function Welcome() {
  return (
    <div className="alpha-welcome">
      <div className="alpha-hero">
        <p className="alpha-kicker">BETWEEN GATHERINGS</p>
        <h1>
          A little practice.
          <br />
          <em>A familiar thread.</em>
        </h1>
        <p className="alpha-lead">
          Keep a teaching close, even when life gets busy. One clear practice, a
          little room to reflect, and a place to return.
        </p>
        <div className="alpha-hero-art" aria-hidden="true">
          <div />
          <i />
          <span />
        </div>
        <Link className="alpha-button" to="/alpha/sample">
          Try the complete sample <span aria-hidden="true">→</span>
        </Link>
        <p className="alpha-muted">No account. No payment. Your own pace.</p>
      </div>
      <section className="alpha-welcome-aside">
        <p className="alpha-kicker">A PRACTICE THAT BELONGS</p>
        <h2>
          From your gathering
          <br />
          into your day.
        </h2>
        <ol className="alpha-simple-list">
          <li>
            <span>01</span>
            <div>
              <h3>Begin with one thing</h3>
              <p>A short practice and its complete text.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <h3>Make it your own</h3>
              <p>Reflect privately, or simply carry on.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <h3>Return when you’re ready</h3>
              <p>Your place is kept. No missed-day score.</p>
            </div>
          </li>
        </ol>
        <Link className="alpha-secondary" to="/alpha/join?code=WELCOME-DEMO">
          I have a community invitation
        </Link>
        <Link className="alpha-text-link" to="/alpha/institutions">
          For teachers & institutions →
        </Link>
        <p className="alpha-muted">
          This alpha uses original demonstration text and a sound-check
          recording. No launch tradition or real teacher is represented.
        </p>
      </section>
    </div>
  );
}
function SampleComplete() {
  return (
    <section className="alpha-complete alpha-stack">
      <div className="alpha-check" aria-hidden="true">
        ✓
      </div>
      <p className="alpha-kicker">A SMALL BEGINNING</p>
      <h1>
        That can be enough
        <br />
        for now.
      </h1>
      <p className="alpha-lead">
        You’ve tried the complete sample. Joining a community is a separate
        choice.
      </p>
      <Link className="alpha-button" to="/alpha/join?code=WELCOME-DEMO">
        Explore the demo invitation
      </Link>
      <Link className="alpha-secondary" to="/alpha">
        Return without joining
      </Link>
      <p className="alpha-muted">
        No membership, payment or completion record was created by opening the
        sample.
      </p>
    </section>
  );
}
function Join() {
  const { state, actor, dispatch, prefs, setPrefs } = useAlpha();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(params.get("code") || "");
  const [adult, setAdult] = useState(false);
  const [zone, setZone] = useState(prefs.timeZone);
  const invitation = state.invitations.find((i) => i.token === token);
  const cohort = state.cohorts.find((c) => c.id === invitation?.cohortId);
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">YOUR INVITATION</p>
      <h1>A place in the practice.</h1>
      <p className="alpha-lead">
        Joining is your choice. Included community access never needs a second
        payment.
      </p>
      <div className="alpha-inclusion">
        <span className="alpha-badge">DEMO COMMUNITY</span>
        <h2>{cohort?.name || "Check your invitation"}</h2>
        <p>
          {cohort
            ? `${new Date(cohort.startAt).toLocaleDateString()} – ${new Date(cohort.endAt).toLocaleDateString()}`
            : "Use the code your coordinator supplied."}
        </p>
        <p>Institution-provided access · simulated, no money collected</p>
      </div>
      <form
        className="alpha-stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (dispatch({ type: "join", token: token.trim(), adult })) {
            setPrefs({ ...prefs, timeZone: zone });
            navigate("/alpha/circle");
          }
        }}
      >
        <label className="alpha-field">
          Invitation code
          <input
            required
            maxLength={100}
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
        <p className="alpha-muted">
          Joining as {actor.name}. Fixture invitations are recipient-bound.
          Change test identity in Demo workspace controls only when testing
          another account.
        </p>
        <label className="alpha-field">
          Your time zone
          <select value={zone} onChange={(e) => setZone(e.target.value)}>
            {["Asia/Kolkata", "Europe/London", "America/New_York", "UTC"].map(
              (z) => (
                <option key={z}>{z}</option>
              ),
            )}
          </select>
        </label>
        <label className="alpha-check-field">
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            required
          />
          <span>
            I am 18 or older and choose to join this demonstration community.
          </span>
        </label>
        <p>
          Reminders are off. Joining never grants a teacher or administrator
          role.
        </p>
        <button className="alpha-button">Accept invitation & begin</button>
      </form>
      <Link className="alpha-text-link" to="/alpha/sample">
        Try the sample without joining
      </Link>
    </div>
  );
}
function useMembership() {
  const { state, actor } = useAlpha();
  const memberships = state.memberships.filter(m => m.userId === actor.id && m.orgId === actor.orgId);
  const membership = memberships.find(m => access(state,actor,m.cohortId).allowed) || memberships[0];
  const cohort = state.cohorts.find((c) => c.id === membership?.cohortId);
  const result = cohort
    ? access(state, actor, cohort.id)
    : {
        allowed: false,
        reason: "Accept your invitation to see the community program.",
      };
  const contents = cohort ? visibleContents(state, actor, cohort.id) : [];
  return { membership, cohort, result, contents };
}
function JoinNeeded({ reason }: { reason: string }) {
  return (
    <div className="alpha-empty alpha-stack">
      <p className="alpha-kicker">YOUR COMMUNITY</p>
      <h1>Start with an invitation.</h1>
      <p>{reason}</p>
      <Link className="alpha-button" to="/alpha/join?code=WELCOME-DEMO">
        Check my invitation
      </Link>
      <Link className="alpha-secondary" to="/alpha/sample">
        Try the sample
      </Link>
    </div>
  );
}
function Today() {
  const { state, actor } = useAlpha();
  const { cohort, result, contents } = useMembership();
  if (!result.allowed || !cohort) return <JoinNeeded reason={result.reason} />;
  const completed = new Set(
    state.completions
      .filter((c) => c.userId === actor.id && c.cohortId === cohort.id)
      .map((c) => c.contentId),
  );
  const next = contents.find((c) => !completed.has(c.id)) || contents[0];
  return (
    <div className="alpha-today">
      <header className="alpha-day-heading">
        <p className="alpha-kicker">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <h1>
          Good to have
          <br />
          <em>you here.</em>
        </h1>
        <p>One small practice. Nothing to catch up on.</p>
      </header>
      <section className="alpha-feature">
        <div className="alpha-feature-art" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="alpha-feature-copy">
          <p className="alpha-kicker">YOUR NEXT PRACTICE</p>
          {next ? (
            <>
              <h2>{next.title}</h2>
              <p>{next.purpose}</p>
              <p className="alpha-muted">
                {next.audioUrl ? `${next.seconds} seconds · sound-check audio & complete text` : "Read at your own pace · no recording"}
              </p>
              <Link to={`/alpha/practice/${next.id}`} className="alpha-button">
                {completed.has(next.id)
                  ? "Return to this practice"
                  : "Begin / resume practice"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </>
          ) : (
            <>
              <h2>A little space before the next practice.</h2>
              <p>
                Your coordinator has no published practice available right now.
                Private notes and help are still yours.
              </p>
              <Link className="alpha-secondary" to="/alpha/account">
                Account & help
              </Link>
            </>
          )}
        </div>
      </section>
      <aside className="alpha-continuity">
        <p className="alpha-kicker">YOUR COMMUNITY THREAD</p>
        <h2>{cohort.name}</h2>
        <span className="alpha-badge">Access included · demo grant</span>
        <p>
          Available through{" "}
          {new Date(result.endsAt || cohort.endAt).toLocaleDateString()}.
        </p>
        <div className="alpha-rule" />
        <p>
          {completed.size} distinct practice{completed.size === 1 ? "" : "s"}{" "}
          completed
        </p>
        <Link className="alpha-text-link" to="/alpha/program">
          See your program →
        </Link>
        <p className="alpha-muted">
          The 14-day introduction and 28-day cycle are the intended program
          structure. This alpha shows only the content actually supplied.
        </p>
      </aside>
      <section className="alpha-note">
        <p className="alpha-kicker">A PRIVATE SPACE</p>
        <h2>Some thoughts are just for you.</h2>
        <p>
          A reflection is optional. It stays on this device and is never shown
          to the teacher workspace.
        </p>
        <Link to="/alpha/reflection/general" className="alpha-text-link">
          Open my reflection →
        </Link>
      </section>
    </div>
  );
}
function Program() {
  const { state, actor } = useAlpha();
  const { cohort, result, contents } = useMembership();
  if (!cohort || !result.allowed) return <JoinNeeded reason={result.reason} />;
  const done = new Set(
    state.completions
      .filter((c) => c.userId === actor.id && c.cohortId === cohort.id)
      .map((c) => c.contentId),
  );
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">MY PROGRAM</p>
      <h1>
        A steady thread.
        <br />
        <em>Your own pace.</em>
      </h1>
      <p>
        {cohort.name} · {new Date(cohort.startAt).toLocaleDateString()} –{" "}
        {new Date(cohort.endAt).toLocaleDateString()}
      </p>
      <p className="alpha-inclusion">
        {done.size} distinct practices completed · {contents.length} available
        now
      </p>
      <ol className="alpha-program-list">
        {contents.map((c, i) => (
          <li key={c.id}>
            <span className="alpha-step">
              {done.has(c.id) ? "✓" : String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="alpha-kicker">
                {done.has(c.id) ? "COMPLETED · REVISIT ANYTIME" : "AVAILABLE"} ·
                VERSION {c.version}
              </p>
              <h2>{c.title}</h2>
              <p>{c.audioUrl ? `${c.seconds} seconds · demo audio fixture` : "Reading practice · no recording"}</p>
              <Link className="alpha-text-link" to={`/alpha/practice/${c.id}`}>
                {done.has(c.id) ? "Practise again" : "Open practice"} →
              </Link>
            </div>
          </li>
        ))}
      </ol>
      {contents.length === 0 && (
        <p>No practice has been released for you yet.</p>
      )}
      <section className="alpha-panel">
        <h2>What comes next</h2>
        <p>
          New items appear only after their exact version is reviewed, published
          and released. Draft titles and recordings stay out of the member view.
        </p>
        <p className="alpha-muted">
          No promised 14-recording catalogue is fabricated here. Genuine content
          is a release dependency.
        </p>
      </section>
    </div>
  );
}
function MemberPlayer() {
  const { id } = useParams();
  const { actor } = useAlpha();
  const { result, cohort, contents } = useMembership();
  const [clock, setClock] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  void clock;
  if (!result.allowed || !cohort) return <JoinNeeded reason={result.reason} />;
  const content = contents.find((c) => c.id === id);
  if (!content)
    return (
      <div className="alpha-narrow alpha-stack">
        <h1>This practice isn’t available.</h1>
        <p>
          It may be unreleased, withdrawn, or outside your access. Playback has
          stopped.
        </p>
        <Link className="alpha-button" to="/alpha/program">
          Return to my program
        </Link>
      </div>
    );
  return (
    <Player
      key={`${actor.id}-${content.id}`}
      content={content}
      cohortId={cohort.id}
    />
  );
}
function Complete() {
  const { id } = useParams();
  const { state, actor } = useAlpha();
  const complete = state.completions.some(
    (c) => c.userId === actor.id && c.contentId === id,
  );
  if (!complete) return <Navigate to="/alpha/circle" replace />;
  return (
    <div className="alpha-complete alpha-stack">
      <div className="alpha-check" aria-hidden="true">
        ✓
      </div>
      <p className="alpha-kicker">A MOMENT, MADE YOURS</p>
      <h1>
        Take this little space
        <br />
        <em>into your day.</em>
      </h1>
      <p className="alpha-lead">
        Your practice is marked complete. There’s nothing else you have to do.
      </p>
      <Link className="alpha-button" to="/alpha/circle">
        Back to my community
      </Link>
      <Link className="alpha-secondary" to={`/alpha/reflection/${id}`}>
        Keep a private thought
      </Link>
      <p className="alpha-muted">
        Optional, local to this device. No teacher visibility or AI sharing.
      </p>
    </div>
  );
}
function Reflection() {
  const { id = "general" } = useParams();
  const [returnParams] = useSearchParams();
  const { actor, state, drafts, setDraft, localNotice } = useAlpha();
  const { state: wisdom } = useWisdom();
  const t = (en: string, hi: string) => wisdom.language === "hi" ? hi : en;
  const fromReading = returnParams.get("from") === "reading" && lessons.some(lesson => lesson.id === id);
  const fromCommunity = state.contents.some(content => content.id === id);
  const returnTo = fromCommunity ? "/alpha/circle" : fromReading ? `/alpha/episode/${encodeURIComponent(id)}?scene=3` : "/alpha/my-day";
  const returnLabel = fromCommunity ? t("Back to my community", "अपने समुदाय पर लौटें") : fromReading ? t("Back to reading", "पाठ पर लौटें") : t("Back to Saved", "सहेजे हुए पर लौटें");
  const key = `spritual_alpha_private_${actor.id}_${id}`;
  const draftKey = `${actor.id}:${id}`;
  const [saved, setSaved] = useState(() => {
    try {
      return localStorage.getItem(key) || "";
    } catch {
      return "";
    }
  });
  const text = drafts[draftKey] ?? saved;
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement>(null);
  const keepDeleteRef = useRef<HTMLButtonElement>(null);
  const returnFocusAfterDelete = useRef<"trigger" | "editor" | null>(null);
  useEffect(() => {
    if (deleting) {
      keepDeleteRef.current?.focus();
    } else if (returnFocusAfterDelete.current) {
      if (returnFocusAfterDelete.current === "editor") editorRef.current?.focus();
      else deleteTriggerRef.current?.focus();
      returnFocusAfterDelete.current = null;
    }
  }, [deleting]);
  const notifyUnsaved = () => localNotice(text !== saved
    ? t("Your unsaved reflection remains in memory for this visit. Refreshing may lose it.", "बिना सहेजा विचार इस बार खुला रहेगा; पन्ना फिर खोलने पर खो सकता है।")
    : "");
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (text !== saved) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [text, saved]);
  const save = () => {
    try {
      localStorage.setItem(key, text);
      setSaved(text);
      setMessage(t("Saved only on this device.", "सिर्फ़ इस डिवाइस पर सहेजा गया।"));
    } catch {
      setMessage(t("Could not save. Your draft is still here; export it before leaving.", "सहेज नहीं सके। आपका लिखा यहाँ है; जाने से पहले निर्यात कर लें।"));
    }
  };
  return (
    <div className="alpha-narrow alpha-stack calm-reflection" lang={wisdom.language}>
      <Link className="alpha-text-link calm-reflection-back" to={returnTo} onClick={notifyUnsaved}>← {returnLabel}</Link>
      <p className="alpha-kicker">{t("JUST FOR YOU", "सिर्फ़ आपके लिए")}</p>
      <h1>{t("A thought to keep.", "एक विचार, अपने लिए।")}</h1>
      <p className="alpha-lead">{t("What would you like to carry into today?", "आज आप कौन-सा विचार साथ रखना चाहेंगे?")}</p>
      <p className="alpha-privacy">
        {t("Notes stay in this browser, unencrypted. Other people using this device may access them. They are not backed up, synchronized, sent to AI or included in teacher reports.", "नोट इस ब्राउज़र में बिना एन्क्रिप्शन रहते हैं। इस डिवाइस का उपयोग करने वाले दूसरे लोग इन्हें देख सकते हैं। इनका बैकअप या सिंक नहीं होता, इन्हें AI को नहीं भेजा जाता और शिक्षक की रिपोर्ट में शामिल नहीं किया जाता।")}
      </p>
      <label className="alpha-field">
        {t("My reflection", "मेरा विचार")}
        <textarea
          ref={editorRef}
          rows={8}
          maxLength={5000}
          value={text}
          onChange={(e) => {
            setDraft(draftKey, e.target.value);
            setMessage(t("Unsaved draft", "अभी सहेजा नहीं है"));
          }}
          placeholder={t("A word, a sentence, or nothing at all.", "एक शब्द, एक वाक्य, या कुछ भी नहीं।")}
        />
      </label>
      <p className="alpha-muted">
        {text.length}/5,000 {t("characters", "अक्षर")} · {actor.name}
      </p>
      <div className="alpha-row">
        <button className="alpha-button" onClick={save}>
          {t("Save on this device", "इस डिवाइस पर सहेजें")}
        </button>
        <button
          className="alpha-secondary"
          disabled={!text}
          onClick={() => {
            downloadText("my-private-reflection.txt", text);
            setMessage(
              t("Export prepared locally. Choose a private place to keep it.", "निर्यात तैयार है। इसे किसी निजी जगह पर रखें।"),
            );
          }}
        >
          {t("Export my text", "अपना लिखा निर्यात करें")}
        </button>
      </div>
      <div role="status">{message}</div>
      {fromReading && (
        <Link className="alpha-secondary" to={returnTo} onClick={notifyUnsaved}>
          {t("Return to reading", "पाठ पर लौटें")} →
        </Link>
      )}
      {deleting ? (
        <div className="alpha-panel" role="group" aria-labelledby="reflection-delete-question">
          <p id="reflection-delete-question">{t("Delete this saved reflection and its draft from this device?", "इस डिवाइस से सहेजा हुआ विचार और उसका मसौदा मिटाएँ?")}</p>
          <div className="alpha-row">
            <button
              ref={keepDeleteRef}
              type="button"
              className="alpha-secondary"
              onClick={() => {
                returnFocusAfterDelete.current = "trigger";
                setDeleting(false);
              }}
            >
              {t("Keep it", "रहने दें")}
            </button>
            <button
              type="button"
              className="alpha-danger"
              onClick={() => {
                try {
                  localStorage.removeItem(key);
                  setDraft(draftKey, "");
                  setSaved("");
                  setMessage(t("Reflection deleted.", "विचार मिटा दिया गया।"));
                  returnFocusAfterDelete.current = "editor";
                  setDeleting(false);
                } catch {
                  setMessage(t("Deletion failed. Please retry.", "मिटा नहीं सके। फिर प्रयास करें।"));
                }
              }}
            >
              {t("Delete reflection", "विचार मिटाएँ")}
            </button>
          </div>
        </div>
      ) : (
        <button
          ref={deleteTriggerRef}
          type="button"
          className="alpha-text-button"
          disabled={!text && !saved}
          onClick={() => setDeleting(true)}
        >
          {t("Delete this reflection", "यह विचार मिटाएँ")}
        </button>
      )}
      {!fromReading && <Link
        className="alpha-text-link"
        to={returnTo}
        onClick={notifyUnsaved}
      >
        {fromCommunity ? t("Return to my community", "अपने समुदाय पर लौटें") : t("Return to Saved", "सहेजे हुए में लौटें")}
      </Link>}
    </div>
  );
}
function Account() {
  const { state, actor, prefs, setPrefs, clearPersonal, dispatch } = useAlpha();
  const { state: wisdom } = useWisdom();
  const t = (en: string, hi: string) => wisdom.language === "hi" ? hi : en;
  const { cohort, result } = useMembership();
  const [confirm, setConfirm] = useState(false);
  const [status, setStatus] = useState("");
  return (
    <div className="alpha-narrow alpha-stack" lang={wisdom.language}>
      <p className="alpha-kicker">{t("YOU & HELP", "आप और सहायता")}</p>
      <h1>
        {t("Make room", "अपनी जगह,")}
        <br />
        <em>{t("your way.", "अपने तरीके से।")}</em>
      </h1>
      <fieldset className="alpha-appearance">
        <legend>{t("Appearance", "दिखावट")}</legend>
        <p>{t("Choose a comfortable reading light. This stays on this device.", "पढ़ने के लिए सहज रोशनी चुनें। यह चुनाव इसी डिवाइस पर रहेगा।")}</p>
        <div className="alpha-appearance-options">
          {([
            ["light", "Daylight", "दिन"],
            ["dusk", "Dusk", "संध्या"],
            ["night", "Night", "रात"],
            ["system", "Use device", "डिवाइस के अनुसार"],
          ] as const).map(([value, en, hi]) => (
            <label key={value} className="alpha-appearance-choice">
              <input
                type="radio"
                name="appearance"
                value={value}
                checked={prefs.appearance === value}
                onChange={() => setPrefs({ ...prefs, appearance: value })}
              />
              <span>{t(en, hi)}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="alpha-field">
        {t("Time zone", "समय क्षेत्र")}
        <select
          value={prefs.timeZone}
          onChange={(e) => setPrefs({ ...prefs, timeZone: e.target.value })}
        >
          {["Asia/Kolkata", "Europe/London", "America/New_York", "UTC"].map(
            (z) => (
              <option key={z}>{z}</option>
            ),
          )}
        </select>
      </label>
      <label className="alpha-check-field">
        <input
          type="checkbox"
          checked={prefs.large}
          onChange={(e) => setPrefs({ ...prefs, large: e.target.checked })}
        />
        <span>{t("Larger text", "बड़ा पाठ")}</span>
      </label>
      <label className="alpha-check-field">
        <input
          type="checkbox"
          checked={prefs.reduced}
          onChange={(e) => setPrefs({ ...prefs, reduced: e.target.checked })}
        />
        <span>{t("Reduce motion", "एनिमेशन कम करें")}</span>
      </label>
      <section className="alpha-panel">
        <h2>{actor.name}</h2>
        <p>{t("Local demo identity · not a verified account", "स्थानीय डेमो पहचान · सत्यापित खाता नहीं")}</p>
        <p>{cohort ? `${cohort.name} · ${result.allowed ? t("included access", "शामिल पहुँच") : t("access unavailable", "पहुँच उपलब्ध नहीं")}` : t("No community joined yet", "अभी किसी समुदाय से नहीं जुड़े")}</p>
        <p>{result.allowed ? t("Circle access is active.", "समुदाय की पहुँच सक्रिय है।") : result.reason}</p>
        {result.endsAt && <p>{t("Access ends", "पहुँच समाप्त होगी")} {new Date(result.endsAt).toLocaleString(wisdom.language === "hi" ? "hi-IN" : "en-IN")}.</p>}
        <p>{t("No subscription or charge exists in this alpha.", "इस अल्फ़ा में कोई सदस्यता या शुल्क नहीं है।")}</p>
      </section>
      <section className="alpha-panel">
        <h2>{t("Reminders are off", "याद दिलाने वाली सूचनाएँ बंद हैं")}</h2>
        <p>
          {t("Notification delivery is not connected. No permission is requested and your access is unaffected.", "सूचनाएँ भेजने की सुविधा जुड़ी नहीं है। कोई अनुमति नहीं माँगी जाती और आपकी पहुँच पर असर नहीं पड़ता।")}
        </p>
      </section>
      <section className="alpha-stack">
        <h2>{t("Private notes", "निजी नोट")}</h2>
        <Link to="/alpha/reflection/general" className="alpha-text-link">
          {t("Open my personal reflection", "अपना निजी विचार खोलें")} →
        </Link>
        {Object.keys(demoPrivateNotes(actor.id))
          .filter((k) => k !== "general")
          .map((k) => (
            <Link
              key={k}
              to={`/alpha/reflection/${encodeURIComponent(k)}`}
              className="alpha-text-link"
            >
              {t("Reflection for", "इसके लिए विचार:")} {" "}
              {state.contents.find((c) => c.id === k)?.title ||
                t("a previous practice", "पिछला अभ्यास")}{" "}
              →
            </Link>
          ))}
        <button
          className="alpha-secondary"
          onClick={() => {
            try {
              downloadText(
                "my-private-reflections.json",
                JSON.stringify(demoPrivateNotes(actor.id, true), null, 2),
              );
              setStatus(t("Private reflection export prepared on this device.", "निजी विचारों का निर्यात इस डिवाइस पर तैयार है।"));
            } catch {
              setStatus(t("Private notes could not be read.", "निजी नोट पढ़ नहीं सके।"));
            }
          }}
        >
          {t("Export all my private reflections", "सभी निजी विचार निर्यात करें")}
        </button>
      </section>
      <details className="alpha-disclosure">
        <summary>{t("Help, privacy & access", "सहायता, निजता और पहुँच")}</summary>
        <p>{t("This is a local test alpha. No live support mailbox or emergency response service is connected. Contact the person who shared this build for help; do not enter urgent or sensitive concerns into demo forms.", "यह स्थानीय परीक्षण अल्फ़ा है। कोई लाइव सहायता या आपातकालीन सेवा जुड़ी नहीं है। मदद के लिए इसे साझा करने वाले व्यक्ति से संपर्क करें; डेमो फ़ॉर्म में अत्यावश्यक या संवेदनशील बातें न लिखें।")}</p>
        <p>{t("Institution access is included. Cancellation and refund processing are unavailable because this build collects no payments. A real deployment must provide verified support and applicable cancellation routes.", "संस्था की पहुँच शामिल है। यह संस्करण भुगतान नहीं लेता, इसलिए रद्द करने या धनवापसी की प्रक्रिया उपलब्ध नहीं है। वास्तविक सेवा में सत्यापित सहायता और लागू रद्द करने के रास्ते होने चाहिए।")}</p>
        <p>{t("Teacher workspace reports suppress participation below five members. Local demo data is inspectable on this device; switching a fixture identity is not secure authentication.", "शिक्षक की रिपोर्ट पाँच से कम सदस्यों का भाग लेना नहीं दिखाती। स्थानीय डेमो डेटा इस डिवाइस पर देखा जा सकता है; डेमो पहचान बदलना सुरक्षित लॉगिन नहीं है।")}</p>
      </details>
      {confirm ? (
        <div className="alpha-panel">
          <h2>{t("Remove my local alpha data?", "मेरा स्थानीय अल्फ़ा डेटा हटाएँ?")}</h2>
          <p>
            {t("This removes this demo identity’s notes, saved stories and entries, reading actions, japa count, playback, preferences, membership and completion records. It does not delete another identity or the legacy app’s data. Export first if you want a copy.", "इससे इस डेमो पहचान के नोट, सहेजी कथाएँ और प्रविष्टियाँ, पढ़ने के कदम, जप की गिनती, प्लेबैक, पसंद, सदस्यता और पूरे किए पाठ हटेंगे। दूसरी पहचान या पुराने ऐप का डेटा नहीं हटेगा। प्रति चाहिए तो पहले निर्यात करें।")}
          </p>
          <button
            className="alpha-danger"
            onClick={async () => {
              if (clearPersonal()) {
                const sharedCleared = !actor.roles.includes("member") || dispatch({ type: "leaveCommunity" });
                let mediaCleared = true;
                if ("caches" in window) {
                  try { await caches.delete(`spritual-alpha-media-${actor.id}`); }
                  catch { mediaCleared = false; }
                }
                setConfirm(false);
                setStatus(
                  sharedCleared && mediaCleared
                    ? t("This demo identity’s local data was removed.", "इस डेमो पहचान का स्थानीय डेटा हटा दिया गया।")
                    : t("Private data was removed, but community records or offline media may remain. Try this removal again before sharing this device. If it still fails, app or site storage controls can erase all local identities.", "निजी डेटा हट गया, लेकिन सामुदायिक रिकॉर्ड या ऑफ़लाइन मीडिया रह सकते हैं। डिवाइस साझा करने से पहले फिर से हटाने की कोशिश करें। यदि फिर भी न हटे, तो ऐप या साइट का स्टोरेज साफ़ करने से सभी स्थानीय पहचानें मिट सकती हैं।"),
                );
              }
            }}
          >
            {t("Remove my local alpha data", "मेरा स्थानीय अल्फ़ा डेटा हटाएँ")}
          </button>
          <button className="alpha-secondary" onClick={() => setConfirm(false)}>
            {t("Cancel", "रहने दें")}
          </button>
        </div>
      ) : (
        <button className="alpha-text-button" onClick={() => setConfirm(true)}>
          {t("Remove my local alpha data", "मेरा स्थानीय अल्फ़ा डेटा हटाएँ")}
        </button>
      )}
      <p role="status">{status}</p>
    </div>
  );
}
function demoPrivateNotes(actorId: string, strict = false) {
  const prefix = `spritual_alpha_private_${actorId}_`;
  const notes: Record<string, string> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k.startsWith(prefix))
        notes[k.slice(prefix.length)] = localStorage.getItem(k) || "";
    }
  } catch {
    if (strict) throw Error("Private notes could not be read.");
  }
  return notes;
}
function Institution() {
  const [prepared, setPrepared] = useState(false);
  return (
    <div className="alpha-narrow alpha-stack">
      <p className="alpha-kicker">FOR TEACHERS & COORDINATORS</p>
      <h1>
        Keep the thread
        <br />
        <em>between gatherings.</em>
      </h1>
      <p className="alpha-lead">
        Prepare a small program, review each version, and make the right
        practice available to your adult community.
      </p>
      <ol className="alpha-simple-list">
        <li>
          <span>01</span>
          <div>
            <h3>Prepare & review</h3>
            <p>Record content rights, then approve the exact version.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Invite deliberately</h3>
            <p>
              Up to 30 adults in a scoped pilot. Included access, no duplicate
              charge.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Learn from delivery</h3>
            <p>
              Aggregate participation and your actual delivery time, without
              private reflections.
            </p>
          </div>
        </li>
      </ol>
      <form
        className="alpha-stack"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          downloadText(
            "institution-pilot-inquiry.txt",
            `DRAFT — not submitted\nCommunity: ${data.get("community")}\nExpected adults: ${data.get("adults")}\nTeaching supplied and rights/reviewer: ${data.get("content")}\nNo contract or price accepted.`,
          );
          setPrepared(true);
        }}
      >
        <h2>Prepare a pilot inquiry</h2>
        <p>
          No live submission service is connected. This form creates a local
          draft for you to review and send yourself.
        </p>
        <label className="alpha-field">
          Community name
          <input name="community" required maxLength={100} />
        </label>
        <label className="alpha-field">
          Expected adult participants
          <input name="adults" type="number" min="1" max="30" required />
        </label>
        <label className="alpha-field">
          Content and review readiness
          <textarea name="content" required maxLength={1000} rows={3} />
        </label>
        <button className="alpha-button">Download inquiry draft</button>
        {prepared && <p role="status">Draft prepared. Nothing was sent.</p>}
      </form>
      <Link className="alpha-secondary" to="/alpha/teacher">
        Inspect the demo delivery workspace
      </Link>
    </div>
  );
}
