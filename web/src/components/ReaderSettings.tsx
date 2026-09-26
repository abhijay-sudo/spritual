import { useId, useRef, useState } from "react";
import { useApp } from "../context";
import { Icon } from "./Icon";

function outsideDialog(dialog: HTMLDialogElement, x: number, y: number) {
  const bounds = dialog.getBoundingClientRect();
  return (
    x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom
  );
}

export function ReaderSettings({ onBeforeOpen }: { onBeforeOpen: () => void }) {
  const { state, setState, t } = useApp();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const doneButton = useRef<HTMLButtonElement>(null);
  const backdropPointerDown = useRef(false);
  const [open, setOpen] = useState(false);
  const id = useId();
  const theme = state.readingTheme ?? "paper";
  const close = () => dialog.current?.close();

  return (
    <>
      <button
        ref={trigger}
        className="icon-button reader-settings-trigger"
        aria-label={t("Reading settings", "पढ़ने की सेटिंग")}
        aria-haspopup="dialog"
        aria-controls={`${id}-dialog`}
        aria-expanded={open}
        onClick={() => {
          if (!dialog.current || dialog.current.open) return;
          onBeforeOpen();
          dialog.current.showModal();
          setOpen(true);
        }}
      >
        <span aria-hidden="true">Aa</span>
      </button>
      <dialog
        ref={dialog}
        id={`${id}-dialog`}
        className="reader-settings-sheet"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onKeyDown={(event) => {
          if (
            event.key !== "Tab" ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey
          )
            return;
          if (
            event.shiftKey &&
            document.activeElement === closeButton.current
          ) {
            event.preventDefault();
            doneButton.current?.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === doneButton.current
          ) {
            event.preventDefault();
            closeButton.current?.focus();
          }
        }}
        onClose={() => {
          backdropPointerDown.current = false;
          setOpen(false);
          trigger.current?.focus({ preventScroll: true });
        }}
        onPointerDown={(event) => {
          backdropPointerDown.current =
            event.target === event.currentTarget &&
            outsideDialog(event.currentTarget, event.clientX, event.clientY);
        }}
        onPointerCancel={() => {
          backdropPointerDown.current = false;
        }}
        onClick={(event) => {
          const clickedOutside =
            backdropPointerDown.current &&
            event.target === event.currentTarget &&
            outsideDialog(event.currentTarget, event.clientX, event.clientY);
          backdropPointerDown.current = false;
          if (clickedOutside) close();
        }}
      >
        <div className="reader-settings-header">
          <h2 id={`${id}-title`}>
            {t("Make reading yours", "पढ़ना अपने अनुकूल बनाएँ")}
          </h2>
          <button
            ref={closeButton}
            autoFocus
            className="icon-button"
            aria-label={t("Close reading settings", "पढ़ने की सेटिंग बंद करें")}
            onClick={close}
          >
            <Icon name="close" size={22} />
          </button>
        </div>
        <p id={`${id}-description`} className="reader-settings-intro">
          {t(
            "Changes take effect right away. The reading theme changes reading screens only. Your timer stays paused.",
            "बदलाव तुरंत लागू होंगे। थीम केवल पढ़ने वाले पन्नों पर बदलेगी। आपका टाइमर रुका रहेगा।",
          )}
        </p>
        <fieldset className="reader-settings-group">
          <legend>{t("Reading theme", "पढ़ने की थीम")}</legend>
          <div className="reader-settings-options">
            {(["paper", "evening"] as const).map((value) => (
              <label
                className={`reader-settings-option ${theme === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name={`${id}-theme`}
                  value={value}
                  checked={theme === value}
                  onChange={() =>
                    setState((current) => ({ ...current, readingTheme: value }))
                  }
                />
                <span
                  className="reader-settings-swatch"
                  data-theme={value}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span>
                  {value === "paper"
                    ? t("Paper", "काग़ज़")
                    : t("Evening", "शाम")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="reader-settings-group">
          <legend>{t("Text size", "अक्षरों का आकार")}</legend>
          <div className="reader-settings-options">
            {(["standard", "large"] as const).map((value) => (
              <label
                className={`reader-settings-option ${state.textSize === value ? "selected" : ""}`}
                key={value}
              >
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={value}
                  checked={state.textSize === value}
                  onChange={() =>
                    setState((current) => ({ ...current, textSize: value }))
                  }
                />
                <span
                  className="reader-settings-size-preview"
                  data-size={value}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <span>
                  {value === "standard"
                    ? t("Standard", "सामान्य")
                    : t("Large", "बड़े")}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label className="reader-settings-pronunciation">
          <input
            type="checkbox"
            checked={state.transliteration}
            onChange={(event) => {
              const checked = event.currentTarget.checked;
              setState((current) => ({ ...current, transliteration: checked }));
            }}
          />
          <span>
            <strong>
              {t("Show Sanskrit pronunciation", "संस्कृत उच्चारण दिखाएँ")}
            </strong>
            <span>
              {t(
                "Roman letters (IAST) alongside the verse.",
                "श्लोक के साथ रोमन लिपि (IAST)।",
              )}
            </span>
          </span>
        </label>
        <div className="reader-settings-footer">
          <button ref={doneButton} className="primary wide" onClick={close}>
            {t("Done", "हो गया")}
          </button>
        </div>
      </dialog>
    </>
  );
}
