import { useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useApp } from "./context";
import { Brand, LanguagePicker } from "./components/Shared";
import { Icon, type IconName } from "./components/Icon";
import { Welcome, Today, Explore, MyPractice, Settings } from "./pages/Home";
import { Practice, Complete } from "./pages/Practice";
import { Journey } from "./pages/Journey";
import { Moment } from "./pages/Moment";
import { WebUpdates } from "./components/WebUpdates";
import { NativeAppExperience } from "./components/NativeAppExperience";
import { isNativeApp } from "./lib/platform";

export default function App() {
  const { state, t, notice, storageAvailable, drafts } = useApp();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
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
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);
  const draftCompletion = [...state.completions]
    .reverse()
    .find((completion) => drafts[completion.id]?.text.trim());
  const draftPath = draftCompletion
    ? `/complete/${draftCompletion.lessonId}?session=${draftCompletion.id}`
    : undefined;
  const welcome = location.pathname === "/welcome";
  const reading = location.pathname.startsWith("/practice/");
  const focused =
    location.pathname.startsWith("/practice/") ||
    location.pathname.startsWith("/complete/") ||
    location.pathname.startsWith("/moment/");
  const links: { path: string; en: string; hi: string; icon: IconName }[] = [
    { path: "/today", en: "Today", hi: "आज", icon: "sun" },
    { path: "/explore", en: "Explore", hi: "खोजें", icon: "book" },
    {
      path: "/my-practice",
      en: "My Practice",
      hi: "मेरा अभ्यास",
      icon: "leaf",
    },
    { path: "/settings", en: "You", hi: "आप", icon: "settings" },
  ];
  return (
    <div
      className={`app ${welcome ? "welcome-layout" : ""} ${focused ? "focus-layout" : ""} ${reading ? "reading-layout" : ""}`}
    >
      <NativeAppExperience />
      <a className="skip-link" href="#main">
        {t("Skip to content", "मुख्य विषय पर जाएं")}
      </a>
      {!welcome && (
        <aside className="sidebar">
          <Link to="/today" className="brand-link" aria-label="Spritual home">
            <Brand />
          </Link>
          <div className="sidebar-intro">
            {t("A quiet space.\nA little wisdom.", "थोड़ा ठहराव।\nथोड़ी समझ।")}
          </div>
          <nav aria-label={t("Main navigation", "मुख्य नेविगेशन")}>
            {links.map((l) => (
              <NavLink key={l.path} to={l.path}>
                <Icon name={l.icon} />
                <span>{t(l.en, l.hi)}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-foot">
            <Icon name="sun" size={32} />
            <p>
              {t(
                "Come as you are.\nBegin where you are.",
                "जैसे हैं, वैसे आएं।\nयहीं से शुरू करें।",
              )}
            </p>
            <span>
              {t(
                "LOCAL DEMO · NO ACCOUNT NEEDED",
                "स्थानीय डेमो · खाते की ज़रूरत नहीं",
              )}
            </span>
          </div>
        </aside>
      )}
      <div className="app-body">
        <header className="app-header">
          <Link
            className="brand-link"
            to={state.onboardingDone ? "/today" : "/welcome"}
          >
            <Brand />
          </Link>
          <div className="header-right">
            <span className="demo-badge">
              {t("LOCAL DEMO", "स्थानीय डेमो")}
            </span>
            <LanguagePicker />
          </div>
        </header>
        {!isNativeApp && <WebUpdates hasDraft={!!draftCompletion} />}
        {!online && (
          <div className="connection-banner" role="status">
            {t(
              "You’re offline. Loaded lessons are still here. External sources need a connection.",
              "आप ऑफ़लाइन हैं। खुले हुए पाठ पढ़ सकते हैं। बाहरी स्रोत के लिए इंटरनेट चाहिए।",
            )}
          </div>
        )}
        {!storageAvailable && (
          <div className="connection-banner" role="alert">
            {t(
              "This browser cannot save changes. You can keep reading; progress will last only for this visit.",
              "यह ब्राउज़र बदलाव सहेज नहीं पा रहा। पढ़ सकते हैं, लेकिन प्रगति इस बार तक ही रहेगी।",
            )}
          </div>
        )}
        {draftPath &&
          `${location.pathname}${location.search}` !== draftPath && (
            <div className="connection-banner">
              {t(
                "You have an unsaved reflection. Keep it before closing this page.",
                "एक विचार अभी सहेजा नहीं है। पन्ना बंद करने से पहले सहेजें।",
              )}{" "}
              <Link className="text-link" to={draftPath}>
                {t("Return to my draft", "अपने मसौदे पर लौटें")}
              </Link>
            </div>
          )}
        <main id="main" ref={mainRef} tabIndex={-1}>
          <Routes>
            <Route
              path="/"
              element={
                <Navigate
                  replace
                  to={state.onboardingDone ? "/today" : "/welcome"}
                />
              }
            />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/today" element={<Today />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/moment/:id" element={<Moment />} />
            <Route path="/my-practice" element={<MyPractice />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/practice/:id" element={<Practice />} />
            <Route path="/complete/:id" element={<Complete />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <Icon name="book" size={42} />
                  <h1>{t("A different path", "एक अलग राह")}</h1>
                  <p>
                    {t(
                      "That page is not here. Your saved lessons are safe.",
                      "यह पन्ना नहीं मिला। सहेजे हुए पाठ मौजूद हैं।",
                    )}
                  </p>
                  <Link className="primary" to="/today">
                    {t("Go to Today", "आज पर जाएं")}
                  </Link>
                </div>
              }
            />
          </Routes>
        </main>
        {!welcome && !focused && (
          <nav
            className="bottom-nav"
            aria-label={t("Mobile navigation", "मोबाइल नेविगेशन")}
          >
            {links.map((l) => (
              <NavLink key={l.path} to={l.path}>
                <Icon name={l.icon} />
                <span>{t(l.en, l.hi)}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Icon name="check" size={18} />
            {notice}
          </>
        )}
      </div>
    </div>
  );
}
