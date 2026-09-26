import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "../components/Icon";
import { useApp } from "../context";
import { getLesson, type Lesson } from "../data/lessons";
import { getMoment, momentActions, type PracticeMoment } from "../data/moments";
import {
  createPracticeIntention,
  resolvePracticeIntention,
  samePracticeIntention,
} from "../lib/practiceIntention";

export function Moment() {
  const { id } = useParams();
  const { t } = useApp();
  const moment = getMoment(id ?? "");
  const lesson = moment && getLesson(moment.lessonId);
  if (!moment || !lesson)
    return (
      <div className="empty-state">
        <h1>
          {t("This practice isn’t available.", "यह अभ्यास उपलब्ध नहीं है।")}
        </h1>
        <Link className="primary" to="/today">
          {t("Return to Today", "आज पर लौटें")}
        </Link>
      </div>
    );
  return <MomentDetail key={moment.id} moment={moment} lesson={lesson} />;
}

function MomentDetail({
  moment,
  lesson,
}: {
  moment: PracticeMoment;
  lesson: Lesson;
}) {
  const { state, updateState, storageAvailable, externalRevision, t, notify } =
    useApp();
  const navigate = useNavigate();
  const [selected, setSelected] = useState("");
  const [status, setStatus] = useState<"failed" | "conflict" | null>(null);
  const teaching = lesson.steps.find((step) => step.kind === "understand");
  const verse = lesson.steps.find((step) => step.kind === "verse");
  const current = state.practiceIntention ?? null;
  const currentAction = resolvePracticeIntention(current, momentActions);
  const replacing =
    !!selected &&
    !!current &&
    (current.lessonId !== lesson.id || current.actionKey !== selected);

  useEffect(() => {
    // A failed save must not label replacement of another tab's new choice as a retry.
    setStatus(null);
  }, [externalRevision]);

  const keep = () => {
    if (!selected) return;
    const candidate =
      current?.lessonId === lesson.id && current.actionKey === selected
        ? current
        : createPracticeIntention(
            lesson.id,
            selected,
            momentActions,
            new Date().toISOString(),
          );
    if (!candidate) return;
    let accepted = false;
    const persisted = updateState((latest) => {
      accepted = samePracticeIntention(latest.practiceIntention, current);
      if (!accepted) return latest;
      // A retry of this same intention keeps any response recorded meanwhile.
      const intention = samePracticeIntention(
        latest.practiceIntention,
        candidate,
      )
        ? latest.practiceIntention
        : candidate;
      return { ...latest, practiceIntention: intention };
    });
    if (!accepted) {
      setStatus("conflict");
      return;
    }
    if (!persisted) {
      setStatus("failed");
      return;
    }
    notify(
      t(
        "Your small practice is kept in this browser.",
        "आपका छोटा अभ्यास इस ब्राउज़र में सहेजा गया है।",
      ),
    );
    navigate("/today");
  };

  return (
    <div className="moment-page">
      <Link className="text-link" to="/today">
        <Icon name="back" size={18} />
        {t("Today", "आज")}
      </Link>
      <header className="moment-heading">
        <span className="eyebrow">
          {t("FROM A VERSE TO YOUR DAY", "श्लोक से रोज़मर्रा तक")}
        </span>
        <h1>{moment.title[state.language]}</h1>
        <p>
          {t(
            "Read one teaching. Choose one small thing to try away from the screen.",
            "एक सीख पढ़ें। स्क्रीन से दूर आज़माने के लिए एक छोटा कदम चुनें।",
          )}
        </p>
      </header>
      <section
        className="moment-teaching"
        aria-labelledby="moment-teaching-title"
      >
        <div className="row spread wrap">
          <span className="eyebrow">{lesson.reference}</span>
          <span className="pill quiet">
            {t("Unreviewed demo", "बिना समीक्षा का डेमो")}
          </span>
        </div>
        <h2 id="moment-teaching-title">
          {teaching?.title[state.language] ?? lesson.title[state.language]}
        </h2>
        <p className="moment-takeaway">{lesson.subtitle[state.language]}</p>
        {teaching && (
          <details className="source-details moment-meaning">
            <summary>
              {t("Context & explanation", "प्रसंग और व्याख्या")}
            </summary>
            <p>{teaching.body[state.language]}</p>
          </details>
        )}
        {verse?.script && (
          <details className="source-details verse-reference">
            <summary>
              {state.transliteration
                ? t(
                    "Original verse & Roman transliteration",
                    "मूल श्लोक और रोमन लिपि",
                  )
                : t("Original verse", "मूल श्लोक")}
            </summary>
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
            <p className="small muted">{lesson.sourceNote[state.language]}</p>
          </details>
        )}
        <div className="row wrap">
          <a
            className="text-link"
            href={lesson.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t("Read the source verse", "मूल स्रोत में श्लोक पढ़ें")}
            <Icon name="arrow" size={17} />
          </a>
          <Link className="text-link" to={`/practice/${lesson.id}`}>
            {t("Read the full lesson", "पूरा पाठ पढ़ें")}
            <Icon name="arrow" size={17} />
          </Link>
        </div>
      </section>
      <section className="moment-actions">
        <fieldset>
          <legend>{t("What could you try?", "आप क्या आज़मा सकते हैं?")}</legend>
          <p className="small muted">
            {t(
              "These are suggested everyday exercises. Choose what fits, or leave without saving.",
              "ये रोज़मर्रा के अभ्यास के सुझाव हैं। जो ठीक लगे उसे चुनें, या बिना सहेजे लौट जाएँ।",
            )}
          </p>
          {moment.actions.map((action) => (
            <label
              className={`moment-choice ${selected === action.actionKey ? "selected" : ""}`}
              key={action.actionKey}
            >
              <input
                type="radio"
                name="moment-action"
                value={action.actionKey}
                checked={selected === action.actionKey}
                onChange={() => {
                  setSelected(action.actionKey);
                  setStatus(null);
                }}
              />
              <span>{action.label[state.language]}</span>
            </label>
          ))}
        </fieldset>
        {currentAction && (
          <div className="moment-current">
            <span className="eyebrow">
              {t("YOUR CURRENT SMALL PRACTICE", "आपका मौजूदा छोटा अभ्यास")}
            </span>
            <p>{currentAction.label[state.language]}</p>
            {replacing && (
              <p className="small muted">
                {t(
                  "Keeping this new choice replaces it. We keep only one practice.",
                  "नया विकल्प सहेजने पर यह बदल जाएगा। एक समय में एक ही अभ्यास रहता है।",
                )}
              </p>
            )}
          </div>
        )}
        <div className="moment-save">
          <p className="small muted">
            {t(
              "Saving keeps this one practice only in this browser. Anyone using this browser may see it. Nothing is shared automatically.",
              "सहेजने पर केवल यह एक अभ्यास इसी ब्राउज़र में रहेगा। इस ब्राउज़र का उपयोग करने वाले इसे देख सकते हैं। अपने-आप कुछ साझा नहीं होता।",
            )}
          </p>
          {status && (
            <p className="moment-status" role="alert">
              {status === "conflict"
                ? t(
                    "Your practice changed in another tab. Review the current practice before trying again.",
                    "दूसरे टैब में आपका अभ्यास बदल गया है। फिर कोशिश करने से पहले मौजूदा अभ्यास देखें।",
                  )
                : t(
                    "Could not save in this browser. Your choice is kept only for this visit. Try saving again.",
                    "इस ब्राउज़र में सहेज नहीं सके। आपका विकल्प केवल इस बार तक रहेगा। फिर सहेजने की कोशिश करें।",
                  )}
            </p>
          )}
          {!storageAvailable && !status && (
            <p className="moment-status">
              {t(
                "Browser saving is unavailable. You can still try the practice without saving.",
                "ब्राउज़र में सहेजना उपलब्ध नहीं है। बिना सहेजे भी अभ्यास आज़मा सकते हैं।",
              )}
            </p>
          )}
          <button className="primary wide" disabled={!selected} onClick={keep}>
            {status === "failed"
              ? t("Try saving again", "फिर सहेजने की कोशिश करें")
              : replacing
                ? t("Replace my current practice", "मेरा मौजूदा अभ्यास बदलें")
                : t("Keep this small practice", "यह छोटा अभ्यास सहेजें")}
            <Icon name="arrow" size={19} />
          </button>
          <Link className="text-link" to="/today">
            {t("Return without saving", "बिना सहेजे लौटें")}
          </Link>
        </div>
      </section>
    </div>
  );
}
