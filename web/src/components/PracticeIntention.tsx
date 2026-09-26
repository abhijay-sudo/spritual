import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context";
import { getLesson } from "../data/lessons";
import { momentActions } from "../data/moments";
import type { PracticeIntention as SavedIntention } from "../lib/localStore";
import {
  markPracticeIntentionTried,
  resolvePracticeIntention,
  respondToPracticeIntention,
  samePracticeIntention,
} from "../lib/practiceIntention";
import { Icon } from "./Icon";

type IntentionMutation = {
  kind: "tried" | "response" | "clear" | "restore";
  expected: SavedIntention | null;
  response?: "helpful" | "not-yet";
  restore?: SavedIntention;
};

export function PracticeIntention() {
  const { state, updateState, storageAvailable, externalRevision, t } =
    useApp();
  const [undo, setUndo] = useState<SavedIntention | null>(null);
  const [pending, setPending] = useState<IntentionMutation | null>(null);
  const [status, setStatus] = useState<"saved" | "failed" | "conflict" | null>(
    null,
  );
  const undoRef = useRef<HTMLButtonElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const retryRef = useRef<HTMLButtonElement>(null);
  const nextFocus = useRef<"undo" | "heading" | "feedback" | "retry" | null>(
    null,
  );
  const intention = state.practiceIntention ?? null;
  const action = resolvePracticeIntention(intention, momentActions);
  const lesson = intention ? getLesson(intention.lessonId) : undefined;

  useEffect(() => {
    // A newer tab may create and then clear a practice. Empty state alone cannot
    // distinguish that deletion from the one our Undo button was created for.
    setUndo(null);
    setPending(null);
    setStatus(null);
    nextFocus.current = null;
  }, [externalRevision]);

  useEffect(() => {
    const target =
      nextFocus.current === "undo"
        ? undoRef.current
        : nextFocus.current === "heading"
          ? headingRef.current
          : nextFocus.current === "feedback"
            ? feedbackRef.current
            : nextFocus.current === "retry"
              ? retryRef.current
              : null;
    if (target) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "nearest" });
      nextFocus.current = null;
    }
  }, [undo, pending, status, intention?.createdAt, intention?.triedAt]);

  const apply = (mutation: IntentionMutation) => {
    let accepted = false;
    let nextExpected = mutation.expected;
    let removed = mutation.restore;
    const now = new Date().toISOString();
    const persisted = updateState((latest) => {
      const current = latest.practiceIntention ?? null;
      accepted = samePracticeIntention(current, mutation.expected);
      if (!accepted) return latest;
      let next: SavedIntention | null;
      switch (mutation.kind) {
        case "clear":
          removed = current ?? mutation.restore;
          next = null;
          break;
        case "restore":
          // Retry persistence without overwriting feedback on the restored record.
          next = current ?? mutation.restore ?? null;
          break;
        case "tried":
          next = current ? markPracticeIntentionTried(current, now) : null;
          break;
        case "response":
          next =
            current && mutation.response
              ? respondToPracticeIntention(current, mutation.response)
              : null;
          break;
      }
      if (mutation.kind !== "clear" && !next) {
        accepted = false;
        return latest;
      }
      nextExpected = next;
      return { ...latest, practiceIntention: next };
    });
    if (!accepted) {
      setPending(null);
      setUndo(null);
      setStatus("conflict");
      return;
    }
    if (!persisted) {
      nextFocus.current = "retry";
      setPending({ ...mutation, expected: nextExpected, restore: removed });
      setStatus("failed");
      return;
    }
    setPending(null);
    nextFocus.current =
      mutation.kind === "clear"
        ? "undo"
        : mutation.kind === "restore"
          ? "heading"
          : mutation.kind === "tried"
            ? "feedback"
            : null;
    setUndo(mutation.kind === "clear" ? (removed ?? null) : null);
    setStatus("saved");
  };

  if ((!intention || !action || !lesson) && !pending && !undo && !status)
    return null;

  return (
    <section
      className="practice-intention"
      aria-label={t("Your small practice", "आपका छोटा अभ्यास")}
    >
      {intention && action && lesson && (
        <>
          <div className="row spread wrap">
            <span className="eyebrow">
              {t("ONE SMALL PRACTICE", "एक छोटा अभ्यास")}
            </span>
            <span className="small muted">
              {storageAvailable
                ? t("Kept in this browser", "इस ब्राउज़र में सहेजा")
                : t("Only for this visit", "केवल इस बार के लिए")}
            </span>
          </div>
          <h2 ref={headingRef} tabIndex={-1} className="intention-action">
            {action.label[state.language]}
          </h2>
          <div className="intention-meta">
            <span>
              {t("Chosen ", "चुना: ")}
              <time dateTime={intention.createdAt}>
                {new Date(intention.createdAt).toLocaleDateString(
                  state.language === "hi" ? "hi-IN" : "en-IN",
                  { day: "numeric", month: "short" },
                )}
              </time>
            </span>
            <Link className="text-link" to={`/practice/${lesson.id}`}>
              {lesson.reference}
            </Link>
            <span className="small muted">
              {t("Unreviewed demo exercise", "बिना समीक्षा का डेमो अभ्यास")}
            </span>
          </div>
          <div className="intention-controls row wrap">
            {intention.triedAt ? (
              <span className="tried-badge">
                <Icon name="check" size={18} />
                {t("Marked as tried", "आज़माया हुआ चिह्नित")}
              </span>
            ) : (
              <button
                className="primary"
                onClick={() => apply({ kind: "tried", expected: intention })}
              >
                {t("I tried this", "मैंने इसे आज़माया")}
              </button>
            )}
            <button
              className="text-button"
              onClick={() => apply({ kind: "clear", expected: intention })}
            >
              {t("Clear this practice", "यह अभ्यास हटाएँ")}
            </button>
          </div>
          {intention.triedAt ? (
            <div className="intention-feedback">
              <p ref={feedbackRef} tabIndex={-1} id="intention-feedback-label">
                {t(
                  "How was it for you? Optional.",
                  "आपके लिए यह कैसा रहा? बताना वैकल्पिक है।",
                )}
              </p>
              <div
                className="row wrap"
                role="group"
                aria-labelledby="intention-feedback-label"
              >
                <button
                  className="secondary"
                  aria-pressed={intention.response === "helpful"}
                  onClick={() =>
                    apply({
                      kind: "response",
                      expected: intention,
                      response: "helpful",
                    })
                  }
                >
                  {t("Useful to me", "मेरे लिए उपयोगी")}
                </button>
                <button
                  className="secondary"
                  aria-pressed={intention.response === "not-yet"}
                  onClick={() =>
                    apply({
                      kind: "response",
                      expected: intention,
                      response: "not-yet",
                    })
                  }
                >
                  {t("Not sure yet", "अभी तय नहीं")}
                </button>
              </div>
            </div>
          ) : (
            <p className="small muted">
              {t(
                "Try it when it fits your day. There is no deadline or reminder.",
                "अपने दिन में जब ठीक लगे, आज़माएँ। कोई समय-सीमा या याद दिलाने वाली सूचना नहीं है।",
              )}
            </p>
          )}
          <p className="small muted">
            {t(
              "Your choice and any response stay in this browser. Anyone using it may see them.",
              "आपका विकल्प और दिया गया जवाब इसी ब्राउज़र में रहते हैं। इसका उपयोग करने वाले इन्हें देख सकते हैं।",
            )}
          </p>
        </>
      )}
      {status && (
        <p
          className="intention-status"
          role={status === "saved" ? "status" : "alert"}
        >
          {status === "conflict"
            ? t(
                "Your practice changed in another tab. The newer practice was left unchanged.",
                "दूसरे टैब में आपका अभ्यास बदल गया है। नए अभ्यास में कोई बदलाव नहीं किया गया।",
              )
            : status === "failed"
              ? t(
                  "Could not save this change. It applies only for this visit. Try saving again.",
                  "यह बदलाव सहेज नहीं सके। यह केवल इस बार तक रहेगा। फिर सहेजने की कोशिश करें।",
                )
              : intention
                ? t(
                    "Change saved in this browser.",
                    "बदलाव इस ब्राउज़र में सहेजा गया।",
                  )
                : t(
                    "Practice cleared from this browser.",
                    "अभ्यास इस ब्राउज़र से हटा दिया गया।",
                  )}
        </p>
      )}
      {pending && (
        <button
          ref={retryRef}
          className="secondary"
          onClick={() => apply(pending)}
        >
          {t("Try saving again", "फिर सहेजने की कोशिश करें")}
        </button>
      )}
      {undo && !intention && !pending && (
        <div className="intention-undo">
          <button
            ref={undoRef}
            className="text-button"
            onClick={() =>
              apply({ kind: "restore", expected: null, restore: undo })
            }
          >
            {t("Undo clear", "हटाना वापस लें")}
          </button>
        </div>
      )}
    </section>
  );
}
