import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useApp } from "../context";
import { lessons } from "../data/lessons";
import { getJourneyState } from "../lib/journey";

export function Journey() {
  const { state, t } = useApp();
  const journey = getJourneyState(state, lessons);

  return (
    <div className="page journey-page">
      <div className="page-heading journey-intro">
        <p className="eyebrow">
          {t("A SIMPLE PLACE TO BEGIN", "एक सहज शुरुआत")}
        </p>
        <h1>{t("A beginning with the Gita", "गीता के साथ शुरुआत")}</h1>
        <p>
          {t(
            "Begin with one useful step, explore a steadier response, then practise returning your attention. Three demo lessons, at your own pace.",
            "एक उपयोगी कदम से शुरू करें, संतुलित जवाब पर विचार करें, फिर ध्यान वापस लाने का अभ्यास करें। तीन नमूना पाठ, अपनी गति से।",
          )}
        </p>
      </div>

      <section
        className="journey-overview"
        aria-label={t("Your reading progress", "आपकी पठन प्रगति")}
      >
        <span className="pill quiet">
          {t("Self-paced · silent reading", "अपनी गति से · शांत पठन")}
        </span>
        <div className="journey-progress">
          <progress
            max={journey.total}
            value={journey.completedCount}
            aria-label={t("Lessons completed", "पूरे किए गए पाठ")}
          />
          <span>
            {t(
              `${journey.completedCount} of ${journey.total} lessons completed`,
              `${journey.total} में से ${journey.completedCount} पाठ पूरे`,
            )}
          </span>
        </div>
        <p className="small muted">
          {t(
            "Start anywhere. Every lesson is open, and there is no daily schedule to keep up with.",
            "कहीं से भी शुरू करें। सभी पाठ खुले हैं और रोज़ का कोई तय कार्यक्रम नहीं है।",
          )}
        </p>
      </section>

      {journey.isComplete && (
        <section
          className="journey-complete"
          aria-labelledby="journey-complete-heading"
        >
          <Icon name="leaf" size={28} />
          <div>
            <h2 id="journey-complete-heading">
              {t(
                "Three lessons, yours to return to.",
                "तीन पाठ, जब चाहें फिर पढ़ें।",
              )}
            </h2>
            <p>
              {t(
                "You have completed this demo collection. Revisit a thought that feels useful today, or take your learning into your day.",
                "आपने इस डेमो के तीनों पाठ पूरे कर लिए हैं। आज उपयोगी लगने वाले विचार पर फिर लौटें, या अपनी सीख को दिन में अपनाएं।",
              )}
            </p>
          </div>
        </section>
      )}

      <ol
        className="journey-list"
        role="list"
        aria-label={t("Three Gita lessons", "गीता के तीन पाठ")}
      >
        {journey.items.map(({ lesson, index, status, hasCompleted }) => (
          <li className={`journey-row ${status}`} key={lesson.id}>
            <span className="journey-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="journey-row-content">
              <span className="eyebrow">{lesson.reference}</span>
              <h2>{lesson.title[state.language]}</h2>
              <p>{lesson.subtitle[state.language]}</p>
              <span className="journey-status">
                {status === "in-progress"
                  ? hasCompleted
                    ? t("Reading again", "फिर से पढ़ रहे हैं")
                    : t("In progress", "पढ़ना जारी है")
                  : hasCompleted
                    ? t(
                        "Completed · revisit anytime",
                        "पूरा किया · जब चाहें फिर पढ़ें",
                      )
                    : t("Ready when you are", "जब मन हो, शुरू करें")}
              </span>
            </div>
            <Link
              className="text-link journey-link"
              to={`/practice/${lesson.id}`}
            >
              {status === "in-progress"
                ? t("Continue", "जारी रखें")
                : hasCompleted
                  ? t("Revisit", "फिर पढ़ें")
                  : t("Read lesson", "पाठ पढ़ें")}
              <span className="sr-only">: {lesson.title[state.language]}</span>
              <Icon name="arrow" size={19} />
            </Link>
          </li>
        ))}
      </ol>

      <p className="page-footnote journey-note">
        {t(
          "Demo explanations await human review. No recordings yet. Progress stays in this browser.",
          "डेमो व्याख्याओं की मानवीय समीक्षा बाकी है। रिकॉर्डिंग अभी उपलब्ध नहीं है। प्रगति इसी ब्राउज़र में रहती है।",
        )}
      </p>
    </div>
  );
}
