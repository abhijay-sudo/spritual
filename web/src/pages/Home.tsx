import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../context";
import { lessons } from "../data/lessons";
import { searchLessons } from "../lib/lessonSearch";
import { Icon } from "../components/Icon";
import { LessonCard, WeeklyPractice } from "../components/Shared";
import { JourneyCard } from "../components/Journey";
import { PracticeIntention } from "../components/PracticeIntention";
import { moments, momentActions } from "../data/moments";
import { resolvePracticeIntention } from "../lib/practiceIntention";
import { getJourneyState, getLatestCompletedLesson } from "../lib/journey";
import { defaultState, persistState } from "../lib/localStore";
import { isNativeApp } from "../lib/platform";
import { Share } from "@capacitor/share";

export function Welcome() {
  const { t, setState } = useApp();
  const navigate = useNavigate();
  const begin = (path: string) => {
    setState((s) => ({ ...s, onboardingDone: true }));
    navigate(path);
  };
  return (
    <div className="welcome">
      <div className="welcome-art" aria-hidden="true">
        <img
          src="/art/river-sanctuary-v1.webp"
          width="1536"
          height="1024"
          alt=""
          fetchPriority="high"
        />
        <span className="art-caption">
          {t("A moment to begin.", "एक पल, एक शुरुआत।")}
        </span>
      </div>
      <section className="welcome-story">
        <span className="eyebrow">
          {t("A LITTLE WISDOM, LIVED", "थोड़ी सीख, जीवन के लिए")}
        </span>
        <h1>
          {t("Ancient wisdom.", "प्राचीन ज्ञान।")}
          <br />
          <em>{t("Everyday life.", "आज का जीवन।")}</em>
        </h1>
        <p>
          {t(
            "Read a verse. Find its meaning. Take one small step.",
            "एक श्लोक पढ़ें। उसका अर्थ समझें। एक छोटा कदम अपनाएं।",
          )}
        </p>
        <div className="welcome-actions">
          <button
            className="primary wide"
            onClick={() => begin("/practice/gita-2-47")}
          >
            {t("Start with the Gita", "गीता से शुरुआत करें")}
            <Icon name="arrow" />
          </button>
          <button
            className="text-button wide"
            onClick={() => begin("/explore")}
          >
            {t("Explore the lessons", "पाठ देखें")}
          </button>
        </div>
        <p className="welcome-trust">
          <Icon name="book" size={16} />
          {t(
            "3 sample lessons · No account needed",
            "3 नमूना पाठ · खाते की ज़रूरत नहीं",
          )}
        </p>
        <p className="demo-note">
          {t(
            "Local demo. Explanations await human review. Human recordings are not available yet.",
            "स्थानीय डेमो। व्याख्याओं की मानवीय समीक्षा बाकी है। मानवीय रिकॉर्डिंग अभी उपलब्ध नहीं है।",
          )}
        </p>
      </section>
    </div>
  );
}

export function Today() {
  const { state, t } = useApp();
  const journey = getJourneyState(state, lessons);
  const lesson = journey.nextLesson;
  const inProgress = journey.resumeLesson;
  const takeaway = getLatestCompletedLesson(state, lessons);
  const keptPractice = resolvePracticeIntention(
    state.practiceIntention,
    momentActions,
  );
  const resumeStep = inProgress
    ? Math.min(
        state.progress[inProgress.id]?.step ?? 0,
        inProgress.steps.length - 1,
      )
    : 0;
  const resumeLabel = [
    t("Settle", "ठहरें"),
    t("Read", "पढ़ें"),
    t("Understand", "समझें"),
    t("Apply", "अपनाएं"),
  ][resumeStep];
  const featuredLesson = (
    <section
      className={`feature-card ${keptPractice && !inProgress ? "feature-card-secondary" : ""}`}
      aria-labelledby="featured-lesson-heading"
    >
      <div className="feature-art" aria-hidden="true">
        <img
          src="/art/river-sanctuary-v1.webp"
          width="1536"
          height="1024"
          alt=""
          fetchPriority="high"
        />
      </div>
      <div className="feature-content">
        <span className="eyebrow">
          <Icon name={lesson ? "sun" : "leaf"} size={20} />
          {inProgress
            ? t("CONTINUE YOUR READING", "पढ़ना जारी रखें")
            : lesson
              ? t("THE GITA · YOUR NEXT READ", "गीता · आपका अगला पाठ")
              : t("A BEGINNING, MADE", "एक शुरुआत हो गई")}
        </span>
        <h2 id="featured-lesson-heading">
          {lesson
            ? lesson.title[state.language]
            : t(
                "Three lessons. A little more understanding.",
                "तीन पाठ। थोड़ी और समझ।",
              )}
        </h2>
        {lesson ? (
          <p className="feature-source">
            {lesson.reference}
            <span aria-hidden="true"> · </span>
            {t("Read & reflect", "पढ़ें और मनन करें")}
          </p>
        ) : (
          <p>
            {t(
              "Return to a thought you like, or carry it into your day.",
              "किसी उपयोगी विचार पर फिर लौटें, या उसे अपने दिन में अपनाएं।",
            )}
          </p>
        )}
        {inProgress && (
          <div className="resume-position">
            <div className="resume-segments" aria-hidden="true">
              {inProgress.steps.map((item, index) => (
                <span
                  key={item.id}
                  className={index <= resumeStep ? "reached" : ""}
                />
              ))}
            </div>
            <span>
              {t(
                `Step ${resumeStep + 1} of ${inProgress.steps.length} · ${resumeLabel}`,
                `चरण ${resumeStep + 1} / ${inProgress.steps.length} · ${resumeLabel}`,
              )}
            </span>
          </div>
        )}
        <Link
          className={
            keptPractice && !inProgress ? "secondary" : "primary light"
          }
          to={lesson ? `/practice/${lesson.id}` : "/journey"}
        >
          {inProgress
            ? t("Continue reading", "पढ़ना जारी रखें")
            : lesson
              ? t("Begin this lesson", "यह पाठ शुरू करें")
              : t("Revisit the learning path", "पाठों को फिर देखें")}
          <Icon name="arrow" size={20} />
        </Link>
      </div>
    </section>
  );
  const date = new Date().toLocaleDateString(
    state.language === "hi" ? "hi-IN" : "en-IN",
    { weekday: "long", day: "numeric", month: "long" },
  );
  return (
    <div className="page today-page">
      <div className="page-heading">
        <p className="eyebrow">{date}</p>
        <h1>
          {inProgress
            ? t("Good to have you here.", "आपका फिर स्वागत है।")
            : t("Make room for yourself.", "थोड़ा समय अपने लिए।")}
        </h1>
      </div>
      <div className="today-grid">
        <div className="today-main">
          {inProgress && featuredLesson}
          <PracticeIntention />
          {!inProgress && featuredLesson}
          <section
            className="moment-invitation"
            aria-labelledby="intent-heading"
          >
            <div className="moment-invitation-heading">
              <h2 id="intent-heading">
                {t("Meet the moment.", "इस पल के लिए।")}
              </h2>
              <span>
                {t("A small shift in your day", "दिन में एक छोटा बदलाव")}
              </span>
            </div>
            <div className="moment-entry-list">
              {moments.map((moment, index) => (
                <Link
                  className="moment-entry"
                  key={moment.id}
                  to={`/moment/${moment.id}`}
                >
                  <span className={`moment-entry-icon moment-entry-${index}`}>
                    <Icon
                      name={index === 0 ? "sun" : index === 1 ? "leaf" : "book"}
                      size={23}
                    />
                  </span>
                  <span>
                    {moment.id === "purpose"
                      ? t("Take the next step", "अगला कदम लें")
                      : moment.id === "balance"
                        ? t("Pause before replying", "जवाब से पहले ठहरें")
                        : t("Find your focus", "ध्यान वापस लाएं")}
                  </span>
                  <span className="moment-entry-reference">
                    {lessons
                      .find((item) => item.id === moment.lessonId)
                      ?.reference.replace("Bhagavad Gita ", "")}
                    <Icon name="arrow" size={17} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
          <JourneyCard />
        </div>
        {takeaway && (
          <aside className="today-takeaway">
            <span className="eyebrow">
              {t("TAKE IT INTO YOUR DAY", "अपने दिन में अपनाएं")}
            </span>
            <p>{takeaway.action[state.language]}</p>
            <Link className="text-link" to={`/practice/${takeaway.id}`}>
              {t("Revisit", "फिर पढ़ें")} · {takeaway.reference}
              <Icon name="arrow" size={18} />
            </Link>
          </aside>
        )}
      </div>
      <p className="page-footnote">
        {t(
          "Three Gita sample lessons · explanations awaiting human review",
          "गीता के तीन नमूना पाठ · व्याख्याओं की मानवीय समीक्षा बाकी",
        )}
      </p>
    </div>
  );
}

export function Explore() {
  const { t } = useApp();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const filter = params.get("topic") ?? "all";
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, { replace: true });
  };
  const filtered = searchLessons(lessons, query, filter);
  return (
    <div className="page explore-page">
      <div className="page-heading">
        <p className="eyebrow">{t("THE READING ROOM", "पाठशाला")}</p>
        <h1>{t("The reading room.", "अपनी पाठशाला।")}</h1>
        <p>
          {t(
            "Three ideas from the Gita. Yours to explore.",
            "गीता से तीन सीख। अपनी पसंद से पढ़ें।",
          )}
        </p>
      </div>
      <Link className="path-entry" to="/journey">
        <img
          src="/art/river-sanctuary-v1.webp"
          width="1536"
          height="1024"
          alt=""
        />
        <Icon name="book" size={22} />
        <span>
          <strong>{t("The Bhagavad Gita", "भगवद्गीता")}</strong>
          <small>
            {t(
              "Three verses. One small beginning.",
              "तीन श्लोक। एक छोटी शुरुआत।",
            )}
          </small>
        </span>
        <Icon name="arrow" size={19} />
      </Link>
      <label className="search-field">
        <Icon name="search" />
        <span className="sr-only">{t("Search lessons", "पाठ खोजें")}</span>
        <input
          type="search"
          value={query}
          onChange={(e) => update("q", e.target.value)}
          placeholder={t("Search a verse or topic…", "श्लोक या विषय खोजें…")}
        />
      </label>
      <div
        className="filter-row"
        role="group"
        aria-label={t("Lesson topics", "पाठ के विषय")}
      >
        {[
          ["all", "All lessons", "सभी पाठ"],
          ["purpose", "Action", "कर्म"],
          ["balance", "Balance", "संतुलन"],
          ["attention", "Focus", "ध्यान"],
        ].map(([key, en, hi]) => (
          <button
            key={key}
            className={`chip ${filter === key ? "selected" : ""}`}
            aria-pressed={filter === key}
            onClick={() => update("topic", key)}
          >
            {t(en, hi)}
          </button>
        ))}
      </div>
      <div className="section-heading">
        <h2>{t("From the Bhagavad Gita", "भगवद्गीता से")}</h2>
        <span className="small muted" role="status">
          {t(
            `${filtered.length} sample ${filtered.length === 1 ? "lesson" : "lessons"}`,
            `${filtered.length} नमूना पाठ`,
          )}
        </span>
      </div>
      <div className="library-grid">
        {filtered.map((l) => (
          <LessonCard key={l.id} lesson={l} index={lessons.indexOf(l)} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Icon name="search" size={36} />
          <h2>{t("No lesson found just yet", "अभी कोई पाठ नहीं मिला")}</h2>
          <p>
            {t(
              "Try “Gita”, “attention” or a verse number such as 2.47.",
              "“गीता”, “ध्यान” या 2.47 जैसा श्लोक क्रमांक आज़माएं।",
            )}
          </p>
          <button className="secondary" onClick={() => setParams({})}>
            {t("Show all lessons", "सभी पाठ दिखाएं")}
          </button>
        </div>
      )}
      <section className="coming-section">
        <div>
          <span className="eyebrow">
            {t(
              "OUR LIBRARY WILL GROW, WITH CARE",
              "धीरे-धीरे बढ़ती हमारी पाठशाला",
            )}
          </span>
          <h2>
            {t("More traditions. The same care.", "और ग्रंथ। वही सावधानी।")}
          </h2>
          <p>
            {t(
              "Ramayana, prayers, Upanishads and Vedic introductions are planned. They will appear when their content is ready and reviewed.",
              "रामायण, प्रार्थनाएं, उपनिषद और वेदों का परिचय आगे जोड़ने की योजना है। सामग्री तैयार और समीक्षित होने पर उपलब्ध होगी।",
            )}
          </p>
        </div>
        <div className="coming-tags">
          {[
            t("Ramayana", "रामायण"),
            t("Prayers & stotras", "प्रार्थना व स्तोत्र"),
            t("Upanishads", "उपनिषद"),
            t("Vedas · introductions", "वेद · परिचय"),
          ].map((x) => (
            <span key={x}>
              {x}
              <small>{t("Planned", "योजनाधीन")}</small>
            </span>
          ))}
        </div>
      </section>
      <p className="page-footnote">
        {t(
          "Scriptures, epics and prayers have different literary traditions. They are not all Vedas.",
          "शास्त्र, महाकाव्य और प्रार्थनाएं अलग-अलग परंपराएं हैं। सभी वेद नहीं हैं।",
        )}
      </p>
    </div>
  );
}

export function MyPractice() {
  const { state, setState, updateState, t, notify } = useApp();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab");
  const tab =
    requestedTab === "reflections" || requestedTab === "history"
      ? requestedTab
      : "saved";
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const keepReflectionRef = useRef<HTMLButtonElement>(null);
  const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);
  const collectionRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (deleteId) keepReflectionRef.current?.focus();
  }, [deleteId]);
  useEffect(() => {
    if (
      deleteId &&
      !state.reflections.some((reflection) => reflection.id === deleteId)
    ) {
      setDeleteId(null);
    }
  }, [deleteId, state.reflections]);
  const saved = lessons.filter((l) => state.bookmarks.includes(l.id));
  const knownCompletions = state.completions.filter((completion) =>
    lessons.some((lesson) => lesson.id === completion.lessonId),
  );
  return (
    <div className="page my-practice-page">
      <div className="page-heading">
        <p className="eyebrow">{t("A SPACE OF YOUR OWN", "आपकी अपनी जगह")}</p>
        <h1>{t("Your practice, your pace.", "आपका अभ्यास, आपकी गति।")}</h1>
        <p>
          {t(
            "Keep what speaks to you. Return whenever you like.",
            "जो अच्छा लगे, सहेजें। जब मन हो, लौट आएं।",
          )}
        </p>
      </div>
      <div
        className="filter-row collection-tabs"
        role="group"
        aria-label={t("Your collection", "आपका संग्रह")}
      >
        {(["saved", "reflections", "history"] as const).map((key, i) => (
          <button
            key={key}
            className={`chip ${tab === key ? "selected" : ""}`}
            aria-pressed={tab === key}
            onClick={() => {
              setDeleteId(null);
              setParams({ tab: key }, { replace: true });
            }}
          >
            {
              [
                t("Saved lessons", "सहेजे पाठ"),
                t("Reflections", "मेरे विचार"),
                t("Reading history", "पढ़ने का इतिहास"),
              ][i]
            }
            <span className="collection-count">
              {
                [
                  saved.length,
                  state.reflections.length,
                  knownCompletions.length,
                ][i]
              }
            </span>
          </button>
        ))}
      </div>
      <section
        className="collection-content"
        aria-labelledby="collection-heading"
      >
        <h2
          id="collection-heading"
          ref={collectionRef}
          tabIndex={-1}
          className="sr-only"
        >
          {tab === "saved"
            ? t("Saved lessons", "सहेजे पाठ")
            : tab === "reflections"
              ? t("Reflections", "मेरे विचार")
              : t("Reading history", "पढ़ने का इतिहास")}
        </h2>
        {tab === "saved" &&
          (saved.length ? (
            <div className="library-grid">
              {saved.map((l) => (
                <LessonCard key={l.id} lesson={l} index={lessons.indexOf(l)} />
              ))}
            </div>
          ) : (
            <Empty
              title={t("Keep a little wisdom here.", "यहां अपनी सीख सहेजें।")}
              body={t(
                "Tap the bookmark on any lesson to find it here.",
                "किसी भी पाठ पर सहेजने का चिन्ह दबाएं। वह यहां मिलेगा।",
              )}
            />
          ))}
        {tab === "reflections" &&
          (state.reflections.length ? (
            <div className="reflection-list">
              {[...state.reflections].reverse().map((r) => (
                <article className="reflection-card" key={r.id}>
                  <span className="eyebrow">
                    {lessons.find((l) => l.id === r.lessonId)?.reference ??
                      t("Personal reflection", "अपना विचार")}
                  </span>
                  <p className="reflection-text">{r.text}</p>
                  <div className="row spread">
                    <time className="small muted">
                      {new Date(r.createdAt).toLocaleDateString(
                        state.language === "hi" ? "hi-IN" : "en-IN",
                      )}
                    </time>
                    <button
                      hidden={deleteId === r.id}
                      className="text-button"
                      onClick={(event) => {
                        deleteTriggerRef.current = event.currentTarget;
                        setDeleteId(r.id);
                      }}
                    >
                      {t("Delete reflection", "विचार हटाएं")}
                    </button>
                  </div>
                  {deleteId === r.id && (
                    <div
                      className="reflection-confirm"
                      role="group"
                      aria-label={t(
                        "Delete this reflection?",
                        "यह विचार हटाना है?",
                      )}
                    >
                      <p>
                        {t(
                          "Remove this saved reflection? It cannot be recovered here.",
                          "यह सहेजा विचार हटाएं? इसे यहां वापस नहीं ला सकेंगे।",
                        )}
                      </p>
                      <div className="row wrap">
                        <button
                          className="secondary"
                          ref={keepReflectionRef}
                          onClick={() => {
                            setDeleteId(null);
                            requestAnimationFrame(() =>
                              deleteTriggerRef.current?.focus(),
                            );
                          }}
                        >
                          {t("Keep reflection", "विचार रखें")}
                        </button>
                        <button
                          className="text-button danger"
                          onClick={() => {
                            const success = updateState((s) => ({
                              ...s,
                              reflections: s.reflections.filter(
                                (x) => x.id !== r.id,
                              ),
                            }));
                            setDeleteId(null);
                            collectionRef.current?.focus();
                            notify(
                              success
                                ? t("Reflection removed", "विचार हटाया गया")
                                : t(
                                    "Could not remove saved data. Clear site data in browser settings.",
                                    "सहेजी जानकारी नहीं हटा सके। ब्राउज़र सेटिंग में साइट डेटा मिटाएं।",
                                  ),
                            );
                          }}
                        >
                          {t("Delete", "हटाएं")}
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <Empty
              title={t(
                "A place for your thoughts.",
                "अपने विचारों के लिए जगह।",
              )}
              body={t(
                "After a lesson, you can choose to save a reflection in this browser. It is always optional.",
                "पाठ के बाद चाहें तो विचार इसी ब्राउज़र में सहेजें। यह ज़रूरी नहीं है।",
              )}
            />
          ))}
        {tab === "history" &&
          (knownCompletions.length ? (
            <div className="history-list">
              {[...knownCompletions].reverse().map((c) => {
                const lesson = lessons.find((l) => l.id === c.lessonId);
                return lesson ? (
                  <Link
                    key={c.id}
                    to={`/practice/${lesson.id}`}
                    className="history-row"
                  >
                    <span className="completed-icon">
                      <Icon name="check" />
                    </span>
                    <span>
                      <strong>{lesson.title[state.language]}</strong>
                      <small>
                        {new Date(c.completedAt).toLocaleDateString(
                          state.language === "hi" ? "hi-IN" : "en-IN",
                        )}{" "}
                        · {t("Lesson completed", "पाठ पूरा किया")}
                      </small>
                    </span>
                    <Icon name="chevron" />
                  </Link>
                ) : null;
              })}
            </div>
          ) : (
            <Empty
              title={t(
                "Your first chapter starts here.",
                "आपका पहला अध्याय यहीं से।",
              )}
              body={t(
                "Completed lessons will appear here, without scores or streaks.",
                "पूरे किए गए पाठ यहां दिखेंगे। कोई अंक या स्ट्रीक नहीं।",
              )}
            />
          ))}
      </section>
      <div className="practice-support">
        <PracticeIntention />
        <details className="practice-rhythm">
          <summary>
            <span>
              <strong>
                {t(
                  "A rhythm that fits your life",
                  "अपने जीवन के अनुसार अभ्यास",
                )}
              </strong>
              <small>
                {t(
                  "Your week & personal intention",
                  "आपका हफ़्ता और अपना संकल्प",
                )}
              </small>
            </span>
            <Icon name="chevron" size={20} />
          </summary>
          <div className="practice-summary">
            <WeeklyPractice />
            <section className="routine-card">
              <Icon name="sun" size={28} />
              <h2>
                {t("Make room for a little quiet.", "थोड़े सुकून के लिए जगह।")}
              </h2>
              <label htmlFor="routine">
                {t("A moment that suits you", "आपके लिए सही समय")}
              </label>
              <select
                id="routine"
                value={state.routine}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    routine: e.target.value as typeof s.routine,
                  }))
                }
              >
                <option value="anytime">
                  {t("Whenever it fits", "जब समय मिले")}
                </option>
                <option value="morning">
                  {t("After morning tea", "सुबह की चाय के बाद")}
                </option>
                <option value="evening">
                  {t("As the day winds down", "दिन के अंत में")}
                </option>
              </select>
              <label htmlFor="weeklyGoal">
                {t("My weekly intention", "इस हफ़्ते का संकल्प")}
              </label>
              <select
                id="weeklyGoal"
                value={state.weeklyGoal}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    weeklyGoal: Number(e.target.value) as 2 | 3 | 5,
                  }))
                }
              >
                {[2, 3, 5].map((n) => (
                  <option key={n} value={n}>
                    {t(`${n} days a week`, `हफ़्ते में ${n} दिन`)}
                  </option>
                ))}
              </select>
              <p className="small muted">
                {t(
                  "A personal intention. No notifications are sent.",
                  "आपका अपना संकल्प। कोई नोटिफ़िकेशन नहीं भेजा जाता।",
                )}
              </p>
            </section>
          </div>
        </details>
      </div>
    </div>
  );
}
function Empty({ title, body }: { title: string; body: string }) {
  const { t } = useApp();
  return (
    <div className="empty-state">
      <Icon name="book" size={38} />
      <h2>{title}</h2>
      <p>{body}</p>
      <Link to="/explore" className="secondary">
        {t("Find a lesson", "एक पाठ चुनें")}
        <Icon name="arrow" size={18} />
      </Link>
    </div>
  );
}

export function Settings() {
  const { state, setState, updateState, t, notify } = useApp();
  const [confirm, setConfirm] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackId, setFeedbackId] = useState(() => crypto.randomUUID());
  const [rating, setRating] = useState<"helpful" | "okay" | "confusing" | null>(
    null,
  );
  const [offlineReady, setOfflineReady] = useState(false);
  const [sharingFeedback, setSharingFeedback] = useState(false);
  const checkOffline = async () => {
    if (isNativeApp) {
      notify(
        t(
          "The demo lessons are included in this app for offline reading. External sources need an internet connection.",
          "ऑफ़लाइन पढ़ने के लिए नमूना पाठ इसी ऐप में मौजूद हैं। बाहरी स्रोतों के लिए इंटरनेट चाहिए।",
        ),
      );
      return;
    }
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      setOfflineReady(Boolean(registration?.active));
      notify(
        registration?.active
          ? t(
              "Offline reading is ready in this browser",
              "इस ब्राउज़र में ऑफ़लाइन पठन तैयार है",
            )
          : t(
              "Open the production preview once online to prepare offline reading.",
              "ऑफ़लाइन पठन तैयार करने के लिए प्रोडक्शन प्रीव्यू एक बार ऑनलाइन खोलें।",
            ),
      );
    } catch {
      notify(
        t(
          "Offline storage is unavailable in this browser.",
          "इस ब्राउज़र में ऑफ़लाइन संग्रह उपलब्ध नहीं है।",
        ),
      );
    }
  };
  const exportFeedback = async () => {
    const text = JSON.stringify(
      { exportedAt: new Date().toISOString(), feedback: state.feedback },
      null,
      2,
    );
    if (isNativeApp) {
      if (sharingFeedback) return;
      setSharingFeedback(true);
      try {
        await Share.share({
          title: t("Spritual demo feedback", "Spritual डेमो फ़ीडबैक"),
          text,
          dialogTitle: t("Share saved feedback", "सहेजा फ़ीडबैक साझा करें"),
        });
      } catch {
        notify(
          t(
            "Sharing was cancelled or could not open. Your feedback is still here.",
            "साझा करना रद्द हुआ या खुल नहीं सका। आपका फ़ीडबैक यहीं है।",
          ),
        );
      } finally {
        setSharingFeedback(false);
      }
      return;
    }
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spritual-demo-feedback.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="page settings-page">
      <div className="page-heading">
        <p className="eyebrow">
          {t("MAKE YOURSELF AT HOME", "अपने लिए आसान बनाएं")}
        </p>
        <h1>{t("A little more your way.", "थोड़ा अपने तरीके से।")}</h1>
        <p>{t("Your preferences. Your space.", "आपकी पसंद। आपकी जगह।")}</p>
      </div>
      <section className="settings-card">
        <h2>{t("Reading comfort", "पढ़ने की सुविधा")}</h2>
        <label className="setting-row">
          <span>
            <strong>{t("Explanation language", "व्याख्या की भाषा")}</strong>
            <small>
              {t(
                "Original Sanskrit stays unchanged.",
                "मूल संस्कृत नहीं बदलती।",
              )}
            </small>
          </span>
          <select
            value={state.language}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                language: e.target.value as "en" | "hi",
              }))
            }
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>{t("Text size", "अक्षरों का आकार")}</strong>
            <small>
              {t("For comfortable reading", "आराम से पढ़ने के लिए")}
            </small>
          </span>
          <select
            value={state.textSize}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                textSize: e.target.value as "standard" | "large",
              }))
            }
          >
            <option value="standard">{t("Standard", "सामान्य")}</option>
            <option value="large">{t("Large", "बड़े")}</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>{t("Motion", "एनिमेशन")}</strong>
            <small>
              {t(
                "Always respects your device’s reduced-motion setting.",
                "उपकरण पर कम एनिमेशन की पसंद हमेशा लागू रहती है।",
              )}
            </small>
          </span>
          <select
            value={state.motion ?? "system"}
            onChange={(event) =>
              setState((current) => ({
                ...current,
                motion: event.target.value === "reduced" ? "reduced" : "system",
              }))
            }
          >
            <option value="system">
              {t("Follow device", "उपकरण के अनुसार")}
            </option>
            <option value="reduced">{t("Reduce motion", "कम एनिमेशन")}</option>
          </select>
        </label>
        <label className="setting-row">
          <span>
            <strong>{t("Pronunciation guide", "उच्चारण सहायता")}</strong>
            <small>
              {t("Sanskrit in Roman letters", "संस्कृत, रोमन अक्षरों में")}
            </small>
          </span>
          <input
            className="switch"
            type="checkbox"
            checked={state.transliteration}
            onChange={(e) =>
              setState((s) => ({ ...s, transliteration: e.target.checked }))
            }
          />
        </label>
      </section>
      <section className="settings-card">
        <h2>{t("Your data, in your hands", "आपकी जानकारी, आपके हाथ में")}</h2>
        <p>
          {t(
            "Progress and preferences are saved in this browser. Reflections are saved only when you choose. Nothing is uploaded. Other people using this browser may see saved entries; they are not encrypted.",
            "प्रगति और पसंद इसी ब्राउज़र में सहेजी जाती हैं। विचार आपकी अनुमति पर ही सहेजे जाते हैं। कुछ भी अपलोड नहीं होता। इसी ब्राउज़र का इस्तेमाल करने वाले लोग सहेजी जानकारी देख सकते हैं; यह एन्क्रिप्टेड नहीं है।",
          )}
        </p>
        <button className="secondary" onClick={checkOffline}>
          <Icon name="download" size={18} />
          {isNativeApp
            ? t("Lessons included offline", "पाठ ऑफ़लाइन मौजूद हैं")
            : offlineReady
              ? t("Offline reading ready", "ऑफ़लाइन पठन तैयार")
              : t("Check offline readiness", "ऑफ़लाइन पठन जांचें")}
        </button>
        <p className="small muted">
          {isNativeApp
            ? t(
                "The demo lessons come with this app. External sources need an internet connection. Audio and cloud sync are not connected.",
                "नमूना पाठ इसी ऐप के साथ आते हैं। बाहरी स्रोतों के लिए इंटरनेट चाहिए। ऑडियो और क्लाउड सिंक जुड़े नहीं हैं।",
              )
            : t(
                "Offline caching is available in the production preview. Audio and cloud sync are not connected.",
                "प्रोडक्शन प्रीव्यू में ऑफ़लाइन संग्रह उपलब्ध है। ऑडियो और क्लाउड सिंक जुड़े नहीं हैं।",
              )}
        </p>
        <button
          className="text-button danger"
          onClick={() => {
            setConfirm(true);
            dialogRef.current?.showModal();
          }}
        >
          {t(
            "Clear my data from this browser",
            "इस ब्राउज़र से मेरी जानकारी मिटाएं",
          )}
        </button>
      </section>
      <section className="settings-card">
        <h2>
          {t(
            "Help shape this little space.",
            "इस जगह को बेहतर बनाने में मदद करें।",
          )}
        </h2>
        <p>
          {t(
            "How did your first lesson feel? Your answer stays here. You can export feedback to share it yourself.",
            "आपको पहला पाठ कैसा लगा? जवाब यहीं रहेगा। चाहें तो फ़ीडबैक डाउनलोड करके खुद साझा करें।",
          )}
        </p>
        <fieldset>
          <legend>{t("Your experience", "आपका अनुभव")}</legend>
          <div className="filter-row">
            {(["helpful", "okay", "confusing"] as const).map((value, i) => (
              <label
                className={`chip radio-chip ${rating === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name="feedback"
                  value={value}
                  checked={rating === value}
                  onChange={() => setRating(value)}
                />
                {
                  [
                    t("Helpful", "उपयोगी"),
                    t("Okay", "ठीक"),
                    t("Confusing", "उलझन भरा"),
                  ][i]
                }
              </label>
            ))}
          </div>
        </fieldset>
        <label htmlFor="feedback-comment">
          {t(
            "What would make this easier? (optional)",
            "क्या इसे आसान बनाएगा? (वैकल्पिक)",
          )}
        </label>
        <textarea
          id="feedback-comment"
          maxLength={2000}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
        <p className="small muted" id="feedback-help">
          {t(
            "Choose a rating before saving your feedback.",
            "फ़ीडबैक सहेजने से पहले अपना अनुभव चुनें।",
          )}
        </p>
        <div className="row wrap">
          <button
            className="primary"
            disabled={!rating}
            aria-describedby="feedback-help"
            onClick={() => {
              if (!rating) return;
              const success = updateState((s) => ({
                ...s,
                feedback: [
                  ...s.feedback.filter((entry) => entry.id !== feedbackId),
                  {
                    id: feedbackId,
                    rating,
                    comment: feedback.trim(),
                    createdAt: new Date().toISOString(),
                  },
                ],
              }));
              if (success) {
                setFeedback("");
                setRating(null);
                setFeedbackId(crypto.randomUUID());
              }
              notify(
                success
                  ? t(
                      "Feedback saved here. Thank you.",
                      "फ़ीडबैक यहीं सहेजा गया। धन्यवाद।",
                    )
                  : t(
                      "Could not save feedback. Keep your text here and retry.",
                      "फ़ीडबैक नहीं सहेज सके। अपना संदेश यहीं रखें और फिर प्रयास करें।",
                    ),
              );
            }}
          >
            {t("Save feedback here", "फ़ीडबैक यहां सहेजें")}
          </button>
          {state.feedback.length > 0 && (
            <button
              className="text-button"
              onClick={exportFeedback}
              disabled={sharingFeedback}
            >
              {isNativeApp
                ? sharingFeedback
                  ? t("Opening sharing…", "साझा करने का विकल्प खुल रहा है…")
                  : t("Share saved feedback", "सहेजा फ़ीडबैक साझा करें")
                : t("Download feedback", "फ़ीडबैक डाउनलोड करें")}
            </button>
          )}
        </div>
        {isNativeApp && state.feedback.length > 0 && (
          <p className="small muted">
            {t(
              "Only feedback is included. You choose the app and recipient. Reflections and practice history are not included.",
              "केवल फ़ीडबैक शामिल है। ऐप और प्राप्तकर्ता आप चुनते हैं। विचार और अभ्यास का इतिहास शामिल नहीं हैं।",
            )}
          </p>
        )}
      </section>
      <p className="page-footnote">
        {t(
          "Spritual · local working demo. No payments, accounts or notifications. Human review and recordings are required before launch.",
          "Spritual · स्थानीय डेमो। कोई भुगतान, खाता या नोटिफ़िकेशन नहीं। लॉन्च से पहले मानवीय समीक्षा और रिकॉर्डिंग ज़रूरी हैं।",
        )}
      </p>
      <dialog
        ref={dialogRef}
        onClose={() => setConfirm(false)}
        className="confirm-dialog"
        aria-labelledby="clear-title"
      >
        {confirm && (
          <>
            <Icon name="shield" size={30} />
            <h2 id="clear-title">
              {t(
                "Clear this browser’s data?",
                "इस ब्राउज़र की जानकारी मिटाएं?",
              )}
            </h2>
            <p>
              {t(
                "This removes saved lessons, reading progress, reflections, your kept practice and feedback. This cannot be undone.",
                "इससे सहेजे पाठ, प्रगति, विचार, रखा हुआ अभ्यास और फ़ीडबैक मिट जाएंगे। इन्हें वापस नहीं लाया जा सकेगा।",
              )}
            </p>
            <div className="row wrap">
              <button
                className="secondary"
                autoFocus
                onClick={() => dialogRef.current?.close()}
              >
                {t("Keep my data", "जानकारी रहने दें")}
              </button>
              <button
                className="primary danger-button"
                onClick={() => {
                  const next = defaultState();
                  next.language = state.language;
                  next.onboardingDone = true;
                  if (persistState(next)) {
                    setState(next);
                    dialogRef.current?.close();
                    notify(
                      t(
                        "Your saved data was cleared",
                        "आपकी सहेजी जानकारी मिटा दी गई",
                      ),
                    );
                  } else {
                    notify(
                      t(
                        "Unable to clear browser storage. Please clear site data in browser settings.",
                        "ब्राउज़र संग्रह नहीं मिटा सके। ब्राउज़र सेटिंग में साइट डेटा मिटाएं।",
                      ),
                    );
                  }
                }}
              >
                {t("Clear my data", "मेरी जानकारी मिटाएं")}
              </button>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
