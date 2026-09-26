import { App as NativeApp } from "@capacitor/app";
import { isNativeApp } from "../lib/platform";
import { manageNativeListener } from "../lib/nativeListeners";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useApp } from "../context";
import { getLesson, lessons, type Lesson } from "../data/lessons";
import { Bookmark } from "../components/Shared";
import { Icon } from "../components/Icon";
import { ReaderSettings } from "../components/ReaderSettings";
import {
  durationSeconds,
  elapsedForStep,
  formatTime,
  stepForElapsed,
} from "../lib/practiceEngine";
import type { PracticeDuration, PracticeProgress } from "../lib/localStore";
import { getJourneyState } from "../lib/journey";
import "../practice-experience.css";

function MissingLesson() {
  const { t } = useApp();
  return (
    <div className="empty-state">
      <h1>{t("This lesson isn’t available.", "यह पाठ उपलब्ध नहीं है।")}</h1>
      <Link className="primary" to="/explore">
        {t("Explore available lessons", "उपलब्ध पाठ देखें")}
      </Link>
    </div>
  );
}
export function Practice() {
  const { id } = useParams();
  const lesson = getLesson(id ?? "");
  return lesson ? (
    <PracticeSession key={lesson.id} lesson={lesson} />
  ) : (
    <MissingLesson />
  );
}

function PracticeSession({ lesson }: { lesson: Lesson }) {
  const {
    state,
    setState,
    updateState,
    externalRevision,
    storageAvailable,
    t,
    notify,
  } = useApp();
  const navigate = useNavigate();
  // The provider owns progress, including changes and deletion from another tab.
  // Opening a reader never writes an old component snapshot back to storage.
  const progress = state.progress[lesson.id];
  const duration = progress?.duration ?? 3;
  const elapsed = Math.min(
    progress?.elapsedSeconds ?? 0,
    durationSeconds(duration),
  );
  const step = Math.min(progress?.step ?? 0, lesson.steps.length - 1);
  const [running, setRunning] = useState(false);
  const timerExpected = useRef<PracticeProgress | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());
  const finished = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const openedSavedLesson = useRef(!!progress);
  const [focusRequest, setFocusRequest] = useState(0);
  const total = durationSeconds(duration);
  const current = lesson.steps[step];
  const verse = lesson.steps.find((item) => item.kind === "verse");
  const last = step === lesson.steps.length - 1;
  const stageLabels = [
    t("Settle", "ठहरें"),
    t("Read", "पढ़ें"),
    t("Understand", "समझें"),
    t("Apply", "अपनाएँ"),
  ];
  useEffect(() => {
    if (!openedSavedLesson.current) return;
    // Opening an existing lesson selects it for Continue without recreating a
    // position that another tab may have cleared since this reader rendered.
    setState((s) =>
      s.progress[lesson.id] && s.lastActiveLessonId !== lesson.id
        ? { ...s, lastActiveLessonId: lesson.id }
        : s,
    );
  }, [lesson.id, setState]);
  useEffect(() => {
    if (!focusRequest) return;
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "center", behavior: "instant" });
  }, [focusRequest]);
  useEffect(() => {
    // An external revision pauses a running timer; it never revives cleared data.
    setRunning(false);
  }, [externalRevision]);
  useEffect(() => {
    if (!running || !timerExpected.current) return;
    const startingTime = performance.now();
    const start = timerExpected.current.elapsedSeconds;
    const interval = window.setInterval(() => {
      if (document.hidden) {
        setRunning(false);
        return;
      }
      const next = Math.min(
        total,
        start + (performance.now() - startingTime) / 1000,
      );
      const expected = timerExpected.current;
      if (!expected) return;
      const nextProgress = {
        step: stepForElapsed(next, total, lesson.steps.length),
        elapsedSeconds: Math.floor(next),
        duration: expected.duration,
      };
      if (nextProgress.elapsedSeconds === expected.elapsedSeconds) return;
      let accepted = false;
      updateState((s) => {
        const latest = s.progress[lesson.id];
        accepted =
          !!latest &&
          latest.step === expected.step &&
          latest.elapsedSeconds === expected.elapsedSeconds &&
          latest.duration === expected.duration;
        if (!accepted) return s;
        return {
          ...s,
          lastActiveLessonId: lesson.id,
          progress: { ...s.progress, [lesson.id]: nextProgress },
        };
      });
      if (!accepted) {
        setRunning(false);
        return;
      }
      timerExpected.current = nextProgress;
      if (next >= total) setRunning(false);
    }, 250);
    return () => window.clearInterval(interval);
  }, [running, total, lesson.id, lesson.steps.length, updateState]);
  useEffect(() => {
    let mounted = true;
    const pause = () => {
      if (!mounted) return;
      timerExpected.current = null;
      setRunning(false);
    };
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const cleanupNative = isNativeApp
      ? manageNativeListener(
          NativeApp.addListener("appStateChange", ({ isActive }) => {
            if (!isActive) pause();
          }),
        )
      : undefined;
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", onVisibility);
      cleanupNative?.();
    };
  }, []);
  const remember = (next: PracticeProgress) => {
    setState((s) => ({
      ...s,
      lastActiveLessonId: lesson.id,
      progress: { ...s.progress, [lesson.id]: next },
    }));
  };
  const move = (index: number) => {
    setRunning(false);
    remember({
      step: index,
      elapsedSeconds: elapsedForStep(index, total, lesson.steps.length),
      duration,
    });
    setFocusRequest((request) => request + 1);
  };
  const changeDuration = (value: PracticeDuration) => {
    setRunning(false);
    remember({
      step,
      elapsedSeconds: elapsedForStep(
        step,
        durationSeconds(value),
        lesson.steps.length,
      ),
      duration: value,
    });
  };
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setRunning(false);
    setState((s) => {
      const progress = { ...s.progress };
      delete progress[lesson.id];
      return {
        ...s,
        onboardingDone: true,
        progress,
        lastActiveLessonId:
          s.lastActiveLessonId === lesson.id ? null : s.lastActiveLessonId,
        completions: [
          ...s.completions,
          {
            id: sessionId,
            lessonId: lesson.id,
            completedAt: new Date().toISOString(),
            duration,
          },
        ],
      };
    });
    navigate(`/complete/${lesson.id}?session=${sessionId}`, { replace: true });
  };
  return (
    <div className="reader-page">
      <div className="reader-toolbar">
        <Link className="text-link" to="/today">
          <Icon name="back" size={20} />
          {t("Today", "आज")}
        </Link>
        <span className="reader-reference">{lesson.reference}</span>
        <div className="row">
          <Bookmark id={lesson.id} />
          <ReaderSettings
            onBeforeOpen={() => {
              // Stop a queued tick before the modal opens, without changing position.
              timerExpected.current = null;
              setRunning(false);
            }}
          />
        </div>
      </div>
      <div className="reader-intro">
        <span className="eyebrow">
          {t("SILENT READING · DEMO", "शांत पठन · डेमो")}
        </span>
        <h1>{lesson.title[state.language]}</h1>
      </div>
      <div className="reader-grid">
        <div className="reading-column">
          <nav
            className="step-navigation"
            aria-label={t("Lesson steps", "पाठ के चरण")}
          >
            {lesson.steps.map((s, i) => (
              <button
                key={s.id}
                aria-current={i === step ? "step" : undefined}
                aria-label={t(
                  `Step ${i + 1} of ${lesson.steps.length}: ${stageLabels[i]}`,
                  `चरण ${i + 1} / ${lesson.steps.length}: ${stageLabels[i]}`,
                )}
                className={i === step ? "active" : ""}
                onClick={() => move(i)}
              >
                <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                {stageLabels[i]}
              </button>
            ))}
          </nav>
          <article className={`reading-card step-${current.kind}`}>
            <h2 ref={heading} tabIndex={-1}>
              {current.title[state.language]}
            </h2>
            <div key={current.id} className="reader-step-content">
              {current.script && (
                <>
                  <p className="sanskrit verse" lang="sa">
                    {current.script}
                  </p>
                  {state.transliteration && (
                    <div className="pronunciation">
                      <span className="eyebrow">
                        {t("PRONUNCIATION · IAST", "उच्चारण · IAST")}
                      </span>
                      <p lang="sa-Latn">{current.transliteration}</p>
                    </div>
                  )}
                  <button
                    className="text-button"
                    aria-pressed={state.transliteration}
                    onClick={() =>
                      setState((s) => ({
                        ...s,
                        transliteration: !s.transliteration,
                      }))
                    }
                  >
                    {state.transliteration
                      ? t("Hide pronunciation", "उच्चारण छिपाएं")
                      : t("Show pronunciation", "उच्चारण दिखाएं")}
                  </button>
                </>
              )}
              {current.kind === "understand" && (
                <p className="interpretation-notice small">
                  {t(
                    "Unreviewed demo explanation",
                    "डेमो व्याख्या · अभी समीक्षा नहीं हुई है",
                  )}
                  <span aria-hidden="true"> · </span>
                  {lesson.reference}
                </p>
              )}
              <p className="step-body">{current.body[state.language]}</p>
              {current.kind === "understand" && verse?.script && (
                <details className="source-details verse-reference">
                  <summary>
                    {state.transliteration
                      ? t(
                          "Original verse & Roman transliteration",
                          "मूल श्लोक और रोमन लिपि",
                        )
                      : t("Original verse", "मूल श्लोक")}
                  </summary>
                  <p className="small muted">{lesson.reference}</p>
                  <p className="sanskrit verse" lang="sa">
                    {verse.script}
                  </p>
                  {state.transliteration && verse.transliteration && (
                    <div className="pronunciation">
                      <span className="eyebrow">
                        {t("ROMAN TRANSLITERATION · IAST", "रोमन लिपि · IAST")}
                      </span>
                      <p lang="sa-Latn">{verse.transliteration}</p>
                    </div>
                  )}
                </details>
              )}
              {current.kind === "apply" && (
                <div className="action-note">
                  <Icon name="leaf" size={24} />
                  <p>{lesson.action[state.language]}</p>
                </div>
              )}
            </div>
          </article>
          <div className="reader-actions">
            <button
              className="secondary"
              disabled={step === 0}
              onClick={() => move(step - 1)}
            >
              <Icon name="back" size={19} />
              {t("Previous", "पिछला")}
            </button>
            {last ? (
              <button className="primary" onClick={finish}>
                {t("Finish lesson", "पाठ पूरा करें")}
                <Icon name="check" size={20} />
              </button>
            ) : (
              <button className="primary" onClick={() => move(step + 1)}>
                {t("Next: ", "अगला: ")}
                {stageLabels[step + 1]}
                <Icon name="arrow" size={20} />
              </button>
            )}
          </div>
          <p className="reader-reassurance">
            <Icon name="bookmark" size={14} />
            {storageAvailable
              ? t(
                  "Your place is remembered in this browser.",
                  "आपकी जगह इस ब्राउज़र में याद रहती है।",
                )
              : t(
                  "Your place is kept only for this visit.",
                  "आपकी जगह सिर्फ़ इस बार तक याद रहेगी।",
                )}
          </p>
        </div>
        <aside className="reader-aside">
          <section
            className={`pace-card ${running ? "reader-timer-running" : ""}`}
          >
            <div className="row spread">
              <h2>{t("Make a little time", "थोड़ा समय निकालें")}</h2>
              <Icon name="clock" size={20} />
            </div>
            <p>
              {t(
                "An optional timer for quiet reading.",
                "शांत पठन के लिए वैकल्पिक टाइमर।",
              )}
            </p>
            <div
              className="pace-options"
              role="group"
              aria-label={t(
                "Reading pace in minutes",
                "पठन का समय, मिनटों में",
              )}
            >
              {([3, 5, 10] as const).map((value) => (
                <button
                  key={value}
                  aria-pressed={duration === value}
                  className={duration === value ? "selected" : ""}
                  onClick={() => changeDuration(value)}
                >
                  {value}
                  <span>{t("min", "मिनट")}</span>
                </button>
              ))}
            </div>
            <div className="timer-display">
              <span>{formatTime(Math.max(0, total - elapsed))}</span>
              <button
                className="icon-button timer-button"
                aria-label={
                  running
                    ? t("Pause reading timer", "पठन टाइमर रोकें")
                    : t("Start reading timer", "पठन टाइमर शुरू करें")
                }
                onClick={() => {
                  if (running) {
                    setRunning(false);
                    return;
                  }
                  const next = {
                    step: elapsed >= total ? 0 : step,
                    elapsedSeconds: elapsed >= total ? 0 : elapsed,
                    duration,
                  };
                  remember(next);
                  timerExpected.current = next;
                  setRunning(true);
                }}
              >
                <Icon name={running ? "pause" : "play"} />
              </button>
            </div>
            <progress
              value={elapsed}
              max={total}
              aria-label={t("Reading timer progress", "पठन टाइमर की प्रगति")}
            />
            <p className="reader-timer-status" role="status">
              {running
                ? t(
                    "Timer running · you can pause anytime",
                    "टाइमर चल रहा है · जब चाहें रोकें",
                  )
                : elapsed >= total
                  ? t(
                      "Timer complete · finish when you’re ready",
                      "टाइमर पूरा · तैयार होने पर पाठ पूरा करें",
                    )
                  : elapsed > 0
                    ? t(
                        "Timer paused · read at your own pace",
                        "टाइमर रुका है · अपनी गति से पढ़ें",
                      )
                    : t(
                        "Start only if a timer helps you",
                        "टाइमर मददगार लगे, तभी शुरू करें",
                      )}
            </p>
            <p className="small muted">
              {t(
                "The same lesson at any pace. The timer advances steps and pauses when you leave this tab. The step buttons always work.",
                "हर गति पर वही पाठ। टाइमर चरण आगे बढ़ाता है और टैब छोड़ने पर रुक जाता है। चरणों के बटन हमेशा उपलब्ध हैं।",
              )}
            </p>
          </section>
          <div className="audio-note">
            <Icon name="volume" />
            <div>
              <strong>{t("Silent reading", "शांत पठन")}</strong>
              <p>
                {t(
                  "Human recordings are not available in this demo.",
                  "इस डेमो में मानवीय रिकॉर्डिंग उपलब्ध नहीं है।",
                )}
              </p>
            </div>
          </div>
          <details className="source-details">
            <summary>
              {t("Source & interpretation", "स्रोत और व्याख्या")}
            </summary>
            <p>{lesson.sourceNote[state.language]}</p>
            <p className="small">
              {t(
                "Reading paces are demo timings, not reviewed practice variants.",
                "पठन समय डेमो के लिए है; ये समीक्षित अभ्यास विकल्प नहीं हैं।",
              )}
            </p>
            <a
              href={lesson.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              {t("Open Gita Supersite source", "गीता सुपरसाइट स्रोत खोलें")}
              <Icon name="arrow" size={16} />
            </a>
          </details>
          <button
            className="text-button reader-help"
            onClick={() =>
              notify(
                t(
                  "Use the step buttons to read at your own pace. Save a lesson with the bookmark.",
                  "अपनी गति से पढ़ने के लिए चरणों के बटन दबाएँ। बुकमार्क से पाठ सहेजें।",
                ),
              )
            }
          >
            {t("How this works", "यह कैसे काम करता है")}
          </button>
        </aside>
      </div>
    </div>
  );
}

export function Complete() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { state, updateState, drafts, setDraft, clearDraft, t, notify } =
    useApp();
  const lesson = getLesson(id ?? "");
  const completion = state.completions.find(
    (c) => c.id === params.get("session") && c.lessonId === id,
  );
  const storedReflection = completion
    ? state.reflections.find((r) => r.id === `reflection-${completion.id}`)
    : undefined;
  const draft = completion ? drafts[completion.id] : undefined;
  const reflection = draft?.text ?? storedReflection?.text ?? "";
  const consent = draft?.consent ?? !!storedReflection;
  const saved = !!storedReflection && !draft;
  const hasReflection = !!storedReflection || !!draft;
  const [reflectionOpen, setReflectionOpen] = useState(hasReflection);
  useEffect(() => {
    // Restore saved writing and in-app drafts visibly, while still letting the
    // reader close the disclosure until the session or presence of writing changes.
    setReflectionOpen(hasReflection);
  }, [completion?.id, hasReflection]);
  if (!lesson) return <MissingLesson />;
  if (!completion)
    return (
      <div className="empty-state">
        <Icon name="book" size={40} />
        <h1>
          {t("A small step is waiting.", "एक छोटा कदम आपका इंतज़ार कर रहा है।")}
        </h1>
        <p>
          {t(
            "Read the lesson before saving a completion.",
            "पाठ पूरा करने से पहले उसे पढ़ें।",
          )}
        </p>
        <Link className="primary" to={`/practice/${lesson.id}`}>
          {t("Read the lesson", "पाठ पढ़ें")}
        </Link>
      </div>
    );
  const journey = getJourneyState(state, lessons, lesson.id);
  const next = journey.nextUnfinishedLesson;
  return (
    <div className="complete-page">
      <div className="completion-mark" aria-hidden="true">
        <Icon name="check" size={38} />
      </div>
      <span className="eyebrow">
        {t("A LITTLE WISDOM, TAKEN WITH YOU", "एक छोटी सीख, आपके साथ")}
      </span>
      <h1>{t("You made room for yourself.", "आपने अपने लिए समय निकाला।")}</h1>
      <p className="complete-subtitle">
        {lesson.title[state.language]} · {lesson.reference}
      </p>
      <section className="completion-action">
        <span className="eyebrow">
          {t(
            "ONE THING TO CARRY INTO YOUR DAY",
            "दिन में अपनाने के लिए एक बात",
          )}
        </span>
        <p>{lesson.action[state.language]}</p>
        <Link className="text-link" to={`/moment/${lesson.themeKey}`}>
          {t(
            "Choose a small way to try this",
            "इसे अपनाने का छोटा तरीका चुनें",
          )}
          <Icon name="arrow" size={18} />
        </Link>
      </section>
      <div className="completion-primary-actions">
        <Link className="primary wide" to="/today">
          {t("Take this into my day", "अब अपने दिन में लौटें")}
          <Icon name="arrow" />
        </Link>
        <p className="quiet-note">
          {t(
            "That is enough for today, if you want it to be.",
            "चाहें तो आज के लिए इतना ही काफ़ी है।",
          )}
        </p>
      </div>
      <details
        className="reflection-disclosure"
        open={reflectionOpen}
        onToggle={(event) => setReflectionOpen(event.currentTarget.open)}
      >
        <summary>
          <span className="reflection-summary-copy">
            <strong>
              {t("A thought to keep?", "कोई विचार सहेजना चाहेंगे?")}
            </strong>
            <span className="small muted">
              {saved
                ? t("Your saved note is here", "आपका सहेजा विचार यहाँ है")
                : draft
                  ? t(
                      "Your draft is here · save before closing",
                      "आपका मसौदा यहाँ है · बंद करने से पहले सहेजें",
                    )
                  : t(
                      "Write a line, or simply leave it here",
                      "एक पंक्ति लिखें, या बस मन में रखें",
                    )}
            </span>
          </span>
          <span className="pill quiet">{t("Optional", "वैकल्पिक")}</span>
          <Icon name="chevron" size={18} />
        </summary>
        <section
          className="reflection-editor"
          aria-label={t("Optional reflection", "वैकल्पिक विचार")}
        >
          <label htmlFor="reflection">
            {lesson.reflection[state.language]}
          </label>
          <textarea
            id="reflection"
            value={reflection}
            maxLength={2000}
            rows={4}
            disabled={saved}
            onChange={(e) =>
              setDraft(completion.id, { text: e.target.value, consent })
            }
            placeholder={t(
              "A sentence is enough. Or simply sit with it.",
              "एक वाक्य काफ़ी है। या बस मन में विचार करें।",
            )}
          />
          {!!draft?.text.trim() && (
            <p className="small muted">
              {t(
                "Your draft stays while you browse. Save it before closing or refreshing.",
                "ऐप में घूमते समय मसौदा रहता है। बंद या रीफ़्रेश करने से पहले सहेजें।",
              )}
            </p>
          )}
          <label className="consent">
            <input
              type="checkbox"
              checked={consent}
              disabled={saved}
              onChange={(e) =>
                setDraft(completion.id, {
                  text: reflection,
                  consent: e.target.checked,
                })
              }
            />
            <span>
              {t(
                "Save this reflection in this browser. Anyone using this browser may see it.",
                "यह विचार इसी ब्राउज़र में सहेजें। इस ब्राउज़र का उपयोग करने वाले इसे देख सकते हैं।",
              )}
            </span>
          </label>
          <div className="row spread wrap">
            <button
              className="secondary"
              disabled={!consent || !reflection.trim() || saved}
              onClick={() => {
                let completionPresent = false;
                const persisted = updateState((s) => {
                  completionPresent = s.completions.some(
                    (c) => c.id === completion.id,
                  );
                  if (!completionPresent) return s;
                  return {
                    ...s,
                    reflections: [
                      ...s.reflections.filter(
                        (r) => r.id !== `reflection-${completion.id}`,
                      ),
                      {
                        id: `reflection-${completion.id}`,
                        lessonId: lesson.id,
                        text: reflection.trim(),
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  };
                });
                const success = persisted && completionPresent;
                if (success) clearDraft(completion.id);
                notify(
                  success
                    ? t(
                        "Reflection saved on this device",
                        "विचार इस उपकरण में सहेजा गया",
                      )
                    : t(
                        "Could not save. Keep this page open and try again.",
                        "सहेज नहीं सके। यह पन्ना खुला रखें और फिर प्रयास करें।",
                      ),
                );
              }}
            >
              {saved ? (
                <>
                  <Icon name="check" size={18} />
                  {t("Saved here", "यहां सहेजा")}
                </>
              ) : (
                t("Save my reflection", "मेरा विचार सहेजें")
              )}
            </button>
            <span className="small muted">
              {t("Never shared automatically.", "अपने-आप कभी साझा नहीं होता।")}
            </span>
          </div>
        </section>
      </details>
      <div className="completion-links">
        {next ? (
          <Link className="text-link" to={`/practice/${next.id}`}>
            {t("If you’d like, next: ", "चाहें तो अगला पाठ: ")}
            {next.title[state.language]}
            <Icon name="arrow" size={17} />
          </Link>
        ) : journey.isComplete ? (
          <p className="completion-path-note">
            {t(
              `You’ve explored all ${journey.total} demo lessons. Return to any of them whenever you like.`,
              `आपने सभी ${journey.total} नमूना पाठ पूरे कर लिए हैं। जब चाहें, किसी भी पाठ पर लौटें।`,
            )}
          </p>
        ) : null}
        <Link className="text-link" to="/journey">
          {t("View learning path", "सीखने का क्रम देखें")}
        </Link>
      </div>
    </div>
  );
}
