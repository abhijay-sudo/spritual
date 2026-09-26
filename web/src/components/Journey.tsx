import { useId } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context";
import { lessons } from "../data/lessons";
import { getJourneyState } from "../lib/journey";
import { Icon } from "./Icon";

export function JourneyCard() {
  const { state, t } = useApp();
  const headingId = useId();
  const journey = getJourneyState(state, lessons);

  return (
    <section className="journey-card" aria-labelledby={headingId}>
      <div className="journey-card-title">
        <span className="journey-book" aria-hidden="true">
          <Icon name="book" size={24} />
        </span>
        <h2 id={headingId}>{t("Your Gita collection", "आपके गीता पाठ")}</h2>
      </div>
      <div className="journey-progress">
        <progress
          max={journey.total}
          value={journey.completedCount}
          aria-label={t("Lessons completed", "पूरे किए गए पाठ")}
        />
        <span className="small muted">
          {t(
            `${journey.completedCount} of ${journey.total} completed`,
            `${journey.total} में से ${journey.completedCount} पाठ पूरे`,
          )}
        </span>
      </div>
      <div className="journey-card-footer">
        <Link className="text-link" to="/journey">
          {t("View all three lessons", "तीनों पाठ देखें")}
          <Icon name="chevron" size={17} />
        </Link>
      </div>
    </section>
  );
}
