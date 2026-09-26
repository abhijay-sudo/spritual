import { Link } from "react-router-dom";
import { useApp } from "../context";
import { Icon } from "./Icon";
import type { Lesson } from "../data/lessons";
import { weekCompletionDates } from "../lib/practiceEngine";
import { PracticeArtwork } from "./PracticeArtwork";
import "../lesson-covers.css";

export function Brand() {
  const { t } = useApp();
  return (
    <span className="brand">
      <span className="brand-mark">
        <Icon name="sun" size={27} />
      </span>
      <span>
        Spritual
        <span className="brand-tag">
          {t("A little, every day", "थोड़ा, हर दिन")}
        </span>
      </span>
    </span>
  );
}
export function LanguagePicker() {
  const { state, setState, t } = useApp();
  return (
    <div
      className="language-picker"
      role="group"
      aria-label={t("Explanation language", "समझने की भाषा")}
    >
      <button
        lang="en"
        aria-pressed={state.language === "en"}
        onClick={() => setState((s) => ({ ...s, language: "en" }))}
      >
        EN
      </button>
      <button
        lang="hi"
        aria-pressed={state.language === "hi"}
        onClick={() => setState((s) => ({ ...s, language: "hi" }))}
      >
        हिन्दी
      </button>
    </div>
  );
}
export function Bookmark({ id }: { id: string }) {
  const { state, updateState, t, notify } = useApp();
  const saved = state.bookmarks.includes(id);
  return (
    <button
      className={`icon-button ${saved ? "is-saved" : ""}`}
      aria-label={
        saved
          ? t("Remove saved lesson", "सहेजा पाठ हटाएं")
          : t("Save lesson", "पाठ सहेजें")
      }
      aria-pressed={saved}
      onClick={() => {
        const success = updateState((s) => ({
          ...s,
          bookmarks: saved
            ? s.bookmarks.filter((x) => x !== id)
            : [...new Set([...s.bookmarks, id])],
        }));
        notify(
          success
            ? saved
              ? t("Removed from saved lessons", "सहेजे पाठों से हटाया")
              : t("Saved in My Practice", "मेरे अभ्यास में सहेजा")
            : t(
                "Changed for this visit. Browser storage is unavailable.",
                "इस बार के लिए बदला। ब्राउज़र संग्रह उपलब्ध नहीं है।",
              ),
        );
      }}
    >
      <Icon name="bookmark" />
    </button>
  );
}
export function LessonCard({
  lesson,
}: {
  lesson: Lesson;
  index?: number;
}) {
  const { state, t } = useApp();
  const progress = state.progress[lesson.id];
  return (
    <article
      className={`lesson-card lesson-card--editorial lesson-card--${lesson.themeKey}`}
    >
      <div className="lesson-cover" aria-hidden="true">
        {lesson.themeKey === "purpose" ? (
          <img
            className="lesson-cover-image"
            src="/art/river-sanctuary-v1.webp"
            alt=""
            width="1536"
            height="1024"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <PracticeArtwork
            variant={lesson.themeKey}
            className="lesson-cover-image"
          />
        )}
        <span className="lesson-cover-edition">{t("GĪTĀ", "गीता")}</span>
        <span className="lesson-cover-reference">
          {lesson.reference.replace("Bhagavad Gita ", "")}
        </span>
      </div>
      <div className="lesson-card-body">
        <div className="row spread">
          <span className="eyebrow">{lesson.theme[state.language]}</span>
          <Bookmark id={lesson.id} />
        </div>
        <h3>
          <Link to={`/practice/${lesson.id}`}>
            {lesson.title[state.language]}
          </Link>
        </h3>
        <p>{lesson.subtitle[state.language]}</p>
        <div className="lesson-meta">
          <span>
            {state.language === "hi"
              ? lesson.reference.replace("Bhagavad Gita", "भगवद्गीता")
              : lesson.reference}
          </span>
          <span>{t("Silent reading", "शांत पठन")}</span>
        </div>
        <Link className="text-link" to={`/practice/${lesson.id}`}>
          {progress
            ? t("Continue reading", "पढ़ना जारी रखें")
            : t("Read this lesson", "यह पाठ पढ़ें")}
          <Icon name="arrow" size={18} />
        </Link>
      </div>
    </article>
  );
}
export function WeeklyPractice() {
  const { state, t } = useApp();
  const dates = weekCompletionDates(state.completions, new Date());
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  return (
    <section className="weekly-card">
      <div className="row spread">
        <h2>{t("A rhythm of your own", "अपनी सहज लय")}</h2>
        <Icon name="leaf" />
      </div>
      <p>
        {t(
          `${dates.length} practice ${dates.length === 1 ? "day" : "days"} this week · your intention is ${state.weeklyGoal}`,
          `इस हफ़्ते ${dates.length} अभ्यास दिन · आपका संकल्प ${state.weeklyGoal}`,
        )}
      </p>
      <div
        className="week-days"
        role="list"
        aria-label={t("Practice days this week", "इस हफ़्ते के अभ्यास दिन")}
      >
        {Array.from({ length: 7 }, (_, i) => {
          const day = new Date(monday);
          day.setDate(monday.getDate() + i);
          const key = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
          const done = dates.includes(key);
          const label = day.toLocaleDateString(
            state.language === "hi" ? "hi-IN" : "en-IN",
            { weekday: "short" },
          );
          return (
            <div className="week-day" key={key} role="listitem">
              <span aria-hidden="true">{label}</span>
              <span className="sr-only">
                {day.toLocaleDateString(
                  state.language === "hi" ? "hi-IN" : "en-IN",
                  { weekday: "long", day: "numeric", month: "long" },
                )}
                {" — "}
                {done
                  ? t("practised", "अभ्यास किया")
                  : t("open day", "खुला दिन")}
              </span>
              <span
                className={done ? "day-dot completed" : "day-dot"}
                aria-hidden="true"
              >
                {done ? <Icon name="check" size={18} /> : <span />}
              </span>
            </div>
          );
        })}
      </div>
      <p className="quiet-note">
        {t("Every return is a fresh beginning.", "हर वापसी एक नई शुरुआत है।")}
      </p>
    </section>
  );
}
