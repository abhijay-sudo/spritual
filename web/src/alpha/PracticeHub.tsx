import { useEffect, useRef, useState } from "react";
import { App as NativeApp } from "@capacitor/app";
import { Icon } from "../components/Icon";
import { isNativeApp } from "../lib/platform";
import { manageNativeListener } from "../lib/nativeListeners";
import { useAlpha } from "./context";
import { touchFeedback, useMotionSettings } from "./MotionSystem";
import { useWisdom } from "./Wisdom";
import {
  JAPA_TARGET,
  formatPauseTime,
  nextJapaCount,
  parseJapaCount,
  remainingPauseMs,
} from "./practiceModel";
import "./practice-hub.css";

const pauseMinutes = [5, 10, 15, 20, 30] as const;
type CounterState = {
  key: string;
  count: number;
  mode: "saved" | "memory" | "corrupt";
};
type TimerState = {
  mode: "idle" | "running" | "paused" | "complete";
  remainingMs: number;
  startedAtMs: number;
  startedWithMs: number;
  pausedAway: boolean;
};

function readCounter(key: string): CounterState {
  let raw: string | null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return { key, count: 0, mode: "memory" };
  }
  try {
    return { key, count: parseJapaCount(raw), mode: "saved" };
  } catch {
    return { key, count: 0, mode: "corrupt" };
  }
}

function freshTimer(minutes: number): TimerState {
  return {
    mode: "idle",
    remainingMs: minutes * 60_000,
    startedAtMs: 0,
    startedWithMs: minutes * 60_000,
    pausedAway: false,
  };
}

export default function PracticeHub() {
  const { actor } = useAlpha();
  const { state, update, error: readingError } = useWisdom();
  const { reduced } = useMotionSettings();
  const language = state.language;
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const counterKey = `spritual_alpha_japa_v1_${actor.id}`;
  const [counterSnapshot, setCounterSnapshot] = useState(() => readCounter(counterKey));
  const counter = counterSnapshot.key === counterKey ? counterSnapshot : readCounter(counterKey);
  const [counterNotice, setCounterNotice] = useState("");
  const [confirmCounterReset, setConfirmCounterReset] = useState(false);
  const [minutes, setMinutes] = useState(5);
  const [timer, setTimer] = useState(() => freshTimer(5));
  const [confirmTimerReset, setConfirmTimerReset] = useState(false);
  const [pendingDuration, setPendingDuration] = useState<number | null>(null);
  const durationConfirmation = useRef<HTMLDivElement>(null);
  const durationOptions = useRef<HTMLDivElement>(null);
  const pauseStartButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pendingDuration !== null) durationConfirmation.current?.focus();
  }, [pendingDuration]);

  useEffect(() => {
    setCounterSnapshot(readCounter(counterKey));
    setCounterNotice("");
    setConfirmCounterReset(false);
  }, [counterKey]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === counterKey) {
        setCounterSnapshot(readCounter(counterKey));
        setCounterNotice("");
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [counterKey]);

  useEffect(() => {
    if (timer.mode !== "running") return;
    let active = true;
    const tick = () => setTimer(current => {
      if (current.mode !== "running") return current;
      const remainingMs = remainingPauseMs(current.startedAtMs, current.startedWithMs, Date.now());
      return remainingMs === 0
        ? { ...current, mode: "complete", remainingMs: 0 }
        : { ...current, remainingMs };
    });
    const pauseAway = () => {
      if (!active) return;
      setTimer(current => current.mode === "running" ? {
        ...current,
        mode: "paused",
        remainingMs: remainingPauseMs(current.startedAtMs, current.startedWithMs, Date.now()),
        pausedAway: true,
      } : current);
    };
    const onVisibility = () => { if (document.hidden) pauseAway(); };
    const interval = window.setInterval(tick, 500);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pauseAway);
    const cleanupNative = isNativeApp
      ? manageNativeListener(NativeApp.addListener("appStateChange", ({ isActive }) => {
          if (!isActive) pauseAway();
        }))
      : undefined;
    if (isNativeApp) void NativeApp.getState().then(({ isActive }) => {
      if (!isActive) pauseAway();
    }).catch(() => {});
    onVisibility();
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pauseAway);
      cleanupNative?.();
    };
  }, [timer.mode]);

  const changeLanguage = () => {
    if (update(current => ({ ...current, language: language === "hi" ? "en" : "hi" }))) {
      window.dispatchEvent(new Event("spritual-alpha-language"));
    }
  };
  const persistCount = (count: number) => {
    try {
      localStorage.setItem(counterKey, JSON.stringify(count));
      setCounterSnapshot({ key: counterKey, count, mode: "saved" });
      setCounterNotice("");
    } catch {
      setCounterSnapshot({ key: counterKey, count, mode: "memory" });
      setCounterNotice(t("This count works for now, but could not be saved on this device.", "गिनती अभी चल रही है, लेकिन इस डिवाइस पर सहेजी नहीं जा सकी।"));
    }
  };
  const increment = () => {
    if (counter.mode === "corrupt" || counter.count >= JAPA_TARGET) return;
    let count = counter.count;
    if (counter.mode === "saved") {
      try { count = parseJapaCount(localStorage.getItem(counterKey)); }
      catch {
        setCounterSnapshot({ key: counterKey, count: 0, mode: "corrupt" });
        return;
      }
    }
    const next = nextJapaCount(count);
    persistCount(next);
    void touchFeedback(reduced);
  };
  const resetCounter = () => {
    persistCount(0);
    setConfirmCounterReset(false);
  };
  const startPause = () => {
    setConfirmTimerReset(false);
    setPendingDuration(null);
    setTimer(current => {
      const remainingMs = current.mode === "complete" ? minutes * 60_000 : current.remainingMs;
      return { mode: "running", remainingMs, startedAtMs: Date.now(), startedWithMs: remainingMs, pausedAway: false };
    });
  };
  const pause = () => setTimer(current => current.mode === "running" ? {
    ...current,
    mode: "paused",
    remainingMs: remainingPauseMs(current.startedAtMs, current.startedWithMs, Date.now()),
    pausedAway: false,
  } : current);
  const selectDuration = (value: number) => {
    if (timer.mode === "running") return;
    if (value === minutes) {
      setPendingDuration(null);
      window.requestAnimationFrame(() => durationOptions.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus());
      return;
    }
    if (timer.mode === "paused") {
      setPendingDuration(value);
      setConfirmTimerReset(false);
      return;
    }
    setMinutes(value);
    setTimer(freshTimer(value));
    setConfirmTimerReset(false);
    setPendingDuration(null);
  };
  const keepDuration = () => {
    setPendingDuration(null);
    window.requestAnimationFrame(() => durationOptions.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus());
  };
  const confirmDuration = () => {
    if (pendingDuration === null) return;
    setMinutes(pendingDuration);
    setTimer(freshTimer(pendingDuration));
    setPendingDuration(null);
    window.requestAnimationFrame(() => pauseStartButton.current?.focus());
  };

  return <div className="calm-page practice-hub" lang={language}>
    <header className="calm-page-head"><div><span className="calm-eyebrow">{t("PRACTICE", "अभ्यास")}</span><h1>{t("A little room to practise.", "अभ्यास के लिए थोड़ा समय।")}</h1><p>{t("Count or pause, at your own pace.", "गिनें या ठहरें, अपनी गति से।")}</p></div><button className="calm-language" type="button" onClick={changeLanguage} aria-label={language === "hi" ? "Switch to English" : "हिन्दी में पढ़ें"}>{language === "hi" ? "EN" : "हिं"}<span aria-hidden="true">⇄</span></button></header>
    {readingError && <p className="alpha-error" role="alert">{language === "hi" ? "पढ़ने की सेटिंग उपलब्ध नहीं है। पहले से सहेजी जानकारी को सुरक्षित रखने के लिए बदलाव रोके गए हैं।" : readingError}</p>}
    <nav className="practice-jump-links" aria-label={t("Choose a practice", "अभ्यास चुनें")}><a href="#count-heading">{t("Count to 108", "१०८ जप गिनें")} ↓</a><a href="#pause-heading">{t("5-minute quiet pause", "५ मिनट का शांत विराम")} ↓</a></nav>

    <section className="practice-panel practice-count" aria-labelledby="count-heading">
      <div className="practice-panel-head"><span className="practice-panel-symbol"><Icon name="leaf" size={23}/></span><div><span className="calm-eyebrow">{t("A PRACTICE OF REPETITION", "जप का अभ्यास")}</span><h2 id="count-heading">{t("Count to 108.", "१०८ तक गिनें।")}</h2></div></div>
      <p className="practice-panel-intro">{t("Count a familiar mantra or a breath. Only the count stays on this device.", "जाना-पहचाना मंत्र या साँस गिनें। इस डिवाइस पर सिर्फ़ गिनती रहती है।")}</p>
      <div className="practice-counter-wrap">
        <div className="practice-counter-ring">
          <svg viewBox="0 0 240 240" role="progressbar" aria-label={t("Repetitions counted", "जप की गिनती")} aria-valuemin={0} aria-valuemax={JAPA_TARGET} aria-valuenow={counter.count}>
            {Array.from({ length: JAPA_TARGET }, (_, index) => {
              const angle = (index / JAPA_TARGET) * Math.PI * 2 - Math.PI / 2;
              return <circle key={index} cx={120 + Math.cos(angle) * 106} cy={120 + Math.sin(angle) * 106} r={index % 9 === 0 ? 2.5 : 1.8} className={index < counter.count ? "counted" : ""}/>;
            })}
          </svg>
          <button className="practice-counter-button" type="button" onClick={increment} disabled={counter.mode === "corrupt" || counter.count >= JAPA_TARGET} aria-label={t(`Count one repetition. ${counter.count} of ${JAPA_TARGET} counted.`, `एक जप गिनें। ${counter.count} / ${JAPA_TARGET} गिने गए।`)}><strong>{counter.count}</strong><span>/ {JAPA_TARGET}</span><small>{counter.count === JAPA_TARGET ? t("COMPLETE", "पूरा हुआ") : t("TAP TO COUNT", "गिनने के लिए दबाएँ")}</small></button>
        </div>
      </div>
      {counter.mode === "corrupt" && <p className="practice-warning" role="alert">{t("The saved count could not be read. Start again to replace only this counter.", "सहेजी गिनती पढ़ी नहीं जा सकी। सिर्फ़ इस गिनती को बदलने के लिए फिर शुरू करें।")}</p>}
      {(counterNotice || counter.mode === "memory") && <p className="practice-warning" role="status">{counterNotice || t("This count works for now, but could not be saved on this device.", "गिनती अभी चल रही है, लेकिन इस डिवाइस पर सहेजी नहीं जा सकी।")}</p>}
      {counter.count === JAPA_TARGET && <p className="practice-complete" role="status">{t("108 repetitions counted. Rest here, or begin another round when you wish.", "१०८ जप पूरे हुए। यहीं ठहरें या जब चाहें फिर शुरू करें।")}</p>}
      <div className="practice-panel-foot"><p>{isNativeApp ? t("No words or audio are recorded. This count stays in this app on this device.", "शब्द या आवाज़ रिकॉर्ड नहीं होते। यह गिनती इसी डिवाइस पर ऐप में रहती है।") : t("No words or audio are recorded. This count is private to this browser profile.", "शब्द या आवाज़ रिकॉर्ड नहीं होते। यह गिनती इसी ब्राउज़र प्रोफ़ाइल में रहती है।")}</p><button type="button" className="practice-reset" onClick={() => setConfirmCounterReset(true)}>{t("Start a new round", "नई गिनती शुरू करें")}</button></div>
      {confirmCounterReset && <div className="practice-confirm" role="group" aria-label={t("Confirm counter reset", "नई गिनती की पुष्टि")}><p>{t("Replace your current count with zero?", "मौजूदा गिनती शून्य से शुरू करें?")}</p><div><button type="button" onClick={() => setConfirmCounterReset(false)}>{t("Keep this count", "यही गिनती रखें")}</button><button type="button" onClick={resetCounter}>{t("Reset count", "गिनती फिर शुरू करें")}</button></div></div>}
    </section>

    <section className="practice-panel practice-pause" aria-labelledby="pause-heading">
      <div className="practice-panel-head"><span className="practice-panel-symbol"><Icon name="clock" size={23}/></span><div><span className="calm-eyebrow">{t("SILENT · NO AUDIO", "शांत · बिना ऑडियो")}</span><h2 id="pause-heading">{t("Take a quiet pause.", "शांत विराम लें।")}</h2></div></div>
      <p className="practice-panel-intro">{t("Choose a duration, settle in, and breathe naturally. The circle is only a gentle visual cue.", "समय चुनें, शांत बैठें और स्वाभाविक साँस लें। वृत्त केवल हल्का दृश्य संकेत है।")}</p>
      <div ref={durationOptions} className="practice-durations" role="group" aria-label={t("Pause duration", "विराम का समय")}>{pauseMinutes.map(value => <button key={value} type="button" aria-pressed={minutes === value} disabled={timer.mode === "running"} onClick={() => selectDuration(value)}>{value} {t("min", "मिनट")}</button>)}</div>
      {pendingDuration !== null && <div ref={durationConfirmation} tabIndex={-1} className="practice-confirm" role="group" aria-label={t("Confirm duration change", "समय बदलने की पुष्टि")}><p>{t(`Changing to ${pendingDuration} minutes will end your paused session.`, `${pendingDuration} मिनट चुनने से रुका हुआ विराम समाप्त हो जाएगा।`)}</p><div><button type="button" onClick={keepDuration}>{t("Keep current pause", "मौजूदा विराम रखें")}</button><button type="button" onClick={confirmDuration}>{t(`Use ${pendingDuration} min`, `${pendingDuration} मिनट चुनें`)}</button></div></div>}
      <div className={`practice-breath ${timer.mode === "running" && !reduced ? "is-running" : ""}`}><div><Icon name="sun" size={30}/><strong aria-live="off">{formatPauseTime(timer.remainingMs)}</strong><span>{timer.mode === "running" ? t("A quiet moment", "एक शांत पल") : timer.mode === "complete" ? t("Pause complete", "विराम पूरा हुआ") : timer.mode === "paused" ? t("Paused", "रुका हुआ") : t("Ready when you are", "जब तैयार हों")}</span></div></div>
      {timer.pausedAway && <p className="practice-timer-note" role="status">{t("Paused while you were away. Resume whenever you like.", "आपके दूर रहने पर विराम रुक गया। जब चाहें जारी रखें।")}</p>}
      {timer.mode === "complete" && <p className="practice-complete" role="status">{t("Your quiet pause is complete. Nothing is scored or shared.", "आपका शांत विराम पूरा हुआ। इसका कोई अंक नहीं बनता और यह साझा नहीं होता।")}</p>}
      <div className="practice-timer-actions"><button ref={pauseStartButton} className="practice-start" type="button" onClick={timer.mode === "running" ? pause : startPause}><Icon name={timer.mode === "running" ? "pause" : "play"} size={18}/>{timer.mode === "running" ? t("Pause", "रोकें") : timer.mode === "paused" ? t("Resume", "जारी रखें") : timer.mode === "complete" ? t("Begin again", "फिर शुरू करें") : t("Begin pause", "विराम शुरू करें")}</button>{timer.mode !== "idle" && <button className="practice-reset" type="button" onClick={() => { setPendingDuration(null); setConfirmTimerReset(true); }}>{t("Reset timer", "समय फिर शुरू करें")}</button>}</div>
      {confirmTimerReset && <div className="practice-confirm" role="group" aria-label={t("Confirm timer reset", "समय रीसेट की पुष्टि")}><p>{t("End this pause and reset the timer?", "यह विराम समाप्त करके समय फिर शुरू करें?")}</p><div><button type="button" onClick={() => setConfirmTimerReset(false)}>{t("Keep the pause", "विराम जारी रखें")}</button><button type="button" onClick={() => { setTimer(freshTimer(minutes)); setConfirmTimerReset(false); }}>{t("Reset timer", "समय फिर शुरू करें")}</button></div></div>}
      <p className="practice-panel-disclosure">{isNativeApp ? t("This timer runs while this screen is open. It pauses when the app is hidden and saves no practice history.", "यह समय-गणना यह स्क्रीन खुली रहने तक चलती है। ऐप छिपने पर रुकती है और अभ्यास का इतिहास नहीं रखती।") : t("This timer runs only while this page is open. It pauses when the app is hidden and does not save a practice history.", "यह समय-गणना पेज खुला रहने तक चलती है। ऐप छिपने पर रुकती है और अभ्यास का इतिहास नहीं रखती।")}</p>
    </section>
    <p className="calm-disclosure">{t("Local preview · These tools are optional and do not measure spiritual progress. Counts are stored unencrypted on this device.", "स्थानीय पूर्वावलोकन · ये अभ्यास वैकल्पिक हैं, आध्यात्मिक प्रगति नहीं मापते। गिनती इस डिवाइस पर बिना एन्क्रिप्शन रहती है।")}</p>
  </div>;
}
