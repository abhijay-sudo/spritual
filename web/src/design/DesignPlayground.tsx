import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { lessons } from "../data/lessons";
import { Text } from "./Text";
import { SkyHeader } from "./SkyHeader";
import { cities, skyPhases, skyForDate, skyAt, type City } from "./sky";
import {
  defaults,
  parsePreferences,
  preferenceKey,
  resolveTheme,
  type Preferences,
} from "./preferences";
import {
  themes,
  themeVariables,
  spacing,
  typeScale,
  motion,
  sensory,
  springs,
  palette,
  radii,
  curves,
  foundations,
} from "./tokens";
import "./fonts.css";
import "./foundations.css";
function useMedia(query: string) {
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const media = matchMedia(query);
    const update = () => setMatches(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}
function readPreferences() {
  try {
    return parsePreferences(localStorage.getItem(preferenceKey));
  } catch {
    return { ...defaults };
  }
}
const lesson = lessons[0];
const verse = lesson.steps.find((s) => s.kind === "verse")!;
const meaning = lesson.steps.find((s) => s.kind === "understand")!;
export default function DesignPlayground() {
  const [prefs, setPrefs] = useState(readPreferences);
  const [saved, setSaved] = useState(true);
  const [city, setCity] = useState<City>("pune");
  const [now, setNow] = useState(() => new Date());
  const [phase, setPhase] = useState<number | null>(null);
  const [skyVisible, setSkyVisible] = useState(true);
  const [foreground, setForeground] = useState(() => !document.hidden);
  const dark = useMedia("(prefers-color-scheme: dark)"),
    osReduced = useMedia("(prefers-reduced-motion: reduce)"),
    lessTransparency = useMedia("(prefers-reduced-transparency: reduce)");
  const reduced = osReduced || prefs.motion === "reduced";
  const live = skyForDate(now, city);
  const sampled = phase === null ? null : skyPhases[phase];
  const sky = sampled
    ? {
        ...live,
        ...skyAt(sampled.elevation, sampled.rising),
        moon: { ...live.moon, altitude: -90 },
      }
    : live;
  const theme = resolveTheme(prefs.appearance, dark, live.elevation);
  const hi = prefs.language === "hi";
  const t = (en: string, hindi: string) => (hi ? hindi : en);
  const update = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    try {
      localStorage.setItem(preferenceKey, JSON.stringify(next));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  };
  useEffect(() => {
    const onChange = () => {
      setForeground(!document.hidden);
      if (!document.hidden) setNow(new Date());
    };
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  useEffect(() => {
    if (!foreground || !skyVisible) return;
    const timer = setInterval(() => setNow(new Date()), 120000);
    return () => clearInterval(timer);
  }, [foreground, skyVisible]);
  const visibility = useCallback(
    (visible: boolean) => setSkyVisible(visible),
    [],
  );
  const lang = hi ? "hi" : "en";
  const date = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: cities[city].zone,
  }).format(now);
  const formatTime = (time: Date | null) =>
    time
      ? new Intl.DateTimeFormat("en-IN", {
          hour: "numeric",
          minute: "2-digit",
          timeZone: cities[city].zone,
        }).format(time)
      : t("Not today", "आज नहीं");
  return (
    <div
      className="v2"
      lang={lang}
      data-theme={theme}
      data-reduced={reduced}
      data-transparency={lessTransparency ? "reduced" : "full"}
      style={themeVariables(theme, prefs.scale) as CSSProperties}
    >
      <a href="#v2-main" className="v2-skip">
        {t("Skip to preview", "प्रीव्यू पर जाएँ")}
      </a>
      <header className="v2-topbar">
        <Link to="/today" className="v2-wordmark">
          Spritual
          <span className="v2-preview-label">
            {t("Design preview", "डिज़ाइन प्रीव्यू")}
          </span>
        </Link>
        <a className="v2-quiet" href="#appearance">
          {t("Appearance", "रूप बदलें")}
        </a>
      </header>
      <main id="v2-main" className="v2-workspace" tabIndex={-1}>
        <div className="v2-preview">
          <SkyHeader
            sky={sky}
            reduced={reduced || !foreground}
            onVisibility={visibility}
          >
            <div className="v2-sky-meta">
              <Text roleStyle="small">{date}</Text>
              <span className="v2-sky-place">{cities[city].name}</span>
            </div>
            <Text as="h1" roleStyle="display" lang={lang}>
              {t("A little stillness.", "थोड़ा ठहराव।")}
              <br />
              {t("A clearer day.", "एक नई दृष्टि।")}
            </Text>
            <Text className="v2-sky-subtitle" lang={lang}>
              {t(
                "One verse. A moment to understand.",
                "एक श्लोक। उसे समझने के कुछ पल।",
              )}
            </Text>
            <div className="v2-sky-footer">
              <span>
                {phase === null
                  ? t("Live sky illustration", "आकाश का वर्तमान चित्र")
                  : t("Sky study", "आकाश का अध्ययन")}{" "}
                · {sky.name}
              </span>
              <span aria-hidden="true">✧</span>
            </div>
          </SkyHeader>
          <section className="v2-reading" aria-labelledby="verse-heading">
            <div className="v2-section-heading">
              <Text as="h2" roleStyle="title" lang={lang} id="verse-heading">
                {t("Begin with the Gita", "गीता से शुरुआत")}
              </Text>
              <span className="v2-reference">2.47</span>
            </div>
            <div className="v2-scripture-frame">
              <Text roleStyle="scripture" lang="sa">
                {verse.script}
              </Text>
              <Text lang="sa-Latn" className="v2-transliteration">
                {verse.transliteration}
              </Text>
            </div>
            <Text roleStyle="reading" lang={lang}>
              {lesson.subtitle[prefs.language]}
            </Text>
            <Link to="/practice/gita-2-47" className="v2-primary">
              {t("Read this verse", "यह श्लोक पढ़ें")}
            </Link>
            <Text roleStyle="small" className="v2-muted" lang={lang}>
              {t(
                "Opens the existing silent lesson. Your place is kept.",
                "मौजूदा शांत पठन खुलेगा। आपकी प्रगति सुरक्षित रहेगी।",
              )}
            </Text>
            <details className="v2-details">
              <summary>
                {t("Source and interpretation", "स्रोत और व्याख्या")}
              </summary>
              <Text lang={lang}>{meaning.body[prefs.language]}</Text>
              <a
                className="v2-quiet"
                href={lesson.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {t(
                  "Read the source at IIT Kanpur",
                  "आईआईटी कानपुर पर स्रोत पढ़ें",
                )}
              </a>
              <Text roleStyle="small" lang={lang}>
                {lesson.sourceNote[prefs.language]}
              </Text>
            </details>
          </section>
          <section className="v2-daylight">
            <Text as="h2" roleStyle="title" lang={lang}>
              {t("The light in your day", "दिन की रोशनी")}
            </Text>
            <dl>
              <div>
                <dt>{t("Sunrise", "सूर्योदय")}</dt>
                <dd>{formatTime(live.times.sunrise)}</dd>
              </div>
              <div>
                <dt>{t("Sunset", "सूर्यास्त")}</dt>
                <dd>{formatTime(live.times.sunset)}</dd>
              </div>
            </dl>
            <Text roleStyle="small" className="v2-muted" lang={lang}>
              {t(
                "Calculated for the city selected below. This is an astronomical illustration, not a panchang.",
                "नीचे चुने हुए शहर के लिए गणना। यह आकाश का चित्र है, पंचांग नहीं।",
              )}
            </Text>
          </section>
        </div>
        <aside
          className="v2-controls"
          id="appearance"
          aria-label={t("Design controls", "डिज़ाइन नियंत्रण")}
        >
          <Text as="h2" roleStyle="title" lang={lang}>
            {t("Make it comfortable", "अपनी सुविधा चुनें")}
          </Text>
          <Text className="v2-muted" lang={lang}>
            {t(
              "Try the new foundations. Your existing app stays as it is.",
              "नया डिज़ाइन आज़माएँ। मौजूदा ऐप वैसा ही रहेगा।",
            )}
          </Text>
          <label>
            {t("Appearance", "रूप")}
            <select
              value={prefs.appearance}
              onChange={(e) =>
                update(
                  "appearance",
                  e.target.value as Preferences["appearance"],
                )
              }
            >
              <option value="system">
                {t("Follow device", "उपकरण के अनुसार")}
              </option>
              <option value="light">{t("Light", "उजाला")}</option>
              <option value="dark">{t("Night", "रात")}</option>
              <option value="lamp">{t("Lamplight", "दीपक की रोशनी")}</option>
              <option value="sun">
                {t("Follow the sun", "सूरज के अनुसार")}
              </option>
            </select>
          </label>
          <label>
            {t("Language", "भाषा")}
            <select
              value={prefs.language}
              onChange={(e) =>
                update("language", e.target.value as Preferences["language"])
              }
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </label>
          <label>
            {t("Text size", "अक्षरों का आकार")}
            <select
              value={prefs.scale}
              onChange={(e) =>
                update("scale", Number(e.target.value) as Preferences["scale"])
              }
            >
              {[1, 1.25, 1.5, 2].map((size) => (
                <option key={size} value={size}>
                  {size * 100}%
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Motion", "एनिमेशन")}
            <select
              value={prefs.motion}
              onChange={(e) =>
                update("motion", e.target.value as Preferences["motion"])
              }
            >
              <option value="system">
                {t("Follow device", "उपकरण के अनुसार")}
              </option>
              <option value="reduced">
                {t("Reduce motion", "कम एनिमेशन")}
              </option>
            </select>
          </label>
          <label>
            {t("City for sky preview", "आकाश प्रीव्यू का शहर")}
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value as City);
                setPhase(null);
              }}
            >
              {Object.entries(cities).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.name}
                </option>
              ))}
            </select>
          </label>
          <Text roleStyle="small" className="v2-muted" lang={lang}>
            {t(
              "Pune is the preview default. No location permission, tracking or account is needed.",
              "प्रीव्यू की शुरुआत पुणे से होती है। स्थान की अनुमति, ट्रैकिंग या खाते की ज़रूरत नहीं।",
            )}
          </Text>
          <div role="status">
            {!saved && (
              <Text roleStyle="small" lang={lang}>
                {t(
                  "These settings could not be saved. They still work for this visit.",
                  "सेटिंग सहेजी नहीं जा सकी। इस बार के लिए लागू रहेगी।",
                )}
              </Text>
            )}
          </div>
          <details className="v2-details">
            <summary>
              {t("Explore all nine skies", "आकाश के नौ रूप देखें")}
            </summary>
            <label>
              {t("Sky phase", "आकाश का रूप")}
              <input
                type="range"
                min="0"
                max="8"
                step="1"
                value={phase ?? 5}
                aria-valuetext={phase === null ? "Live" : skyPhases[phase].name}
                onChange={(e) => setPhase(Number(e.target.value))}
              />
            </label>
            <output>{phase === null ? "Live" : skyPhases[phase].name}</output>
            <div className="v2-phase-list">
              {skyPhases.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  aria-pressed={phase === i}
                  onClick={() => setPhase(i)}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="v2-secondary"
              onClick={() => {
                setPhase(null);
                setNow(new Date());
              }}
            >
              {t("Return to live sky", "वर्तमान आकाश देखें")}
            </button>
            <Text roleStyle="small">
              Phase studies hide the moon to avoid pairing a real moon position
              with an invented time. Follow the sun always uses the real solar
              position.
            </Text>
          </details>
        </aside>
        <section className="v2-specimens" aria-label="Type and token specimens">
          <Text as="h2" roleStyle="display">
            The foundations
          </Text>
          <Text className="v2-muted">
            A working design system, ready for the next screens.
          </Text>
          <div className="v2-specimen-grid">
            <section>
              <Text as="h3" roleStyle="title">
                Three scripts, one rhythm
              </Text>
              <Text lang="hi">हर दिन कुछ शांत पल।</Text>
              <Text lang="ta">தினமும் சில அமைதியான நிமிடங்கள்.</Text>
              <Text lang="bn">প্রতিদিন কিছু শান্ত মুহূর্ত।</Text>
              <Text lang="sa" roleStyle="scripture">
                क्ष ज्ञ श्र द्ध ह्म ङ्क्ष
              </Text>
              <Text lang="sa-Latn">ā ī ū ṛ ṝ ḷ ṅ ñ ṭ ḍ ṇ ś ṣ ṃ ḥ</Text>
              <Text roleStyle="small" className="v2-muted">
                Script and glyph specimens, not additional scripture or a claim
                of reviewed translations.
              </Text>
            </section>
            <section>
              <Text as="h3" roleStyle="title">
                Colour with a purpose
              </Text>
              <dl className="v2-swatches">
                {Object.entries(themes[theme]).map(([name, color]) => (
                  <div key={name}>
                    <span
                      className="v2-swatch"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                    <dt>{name}</dt>
                    <dd>{color}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <details className="v2-details">
            <summary>Spacing, type, motion and sensory vocabulary</summary>
            <details className="v2-details">
              <summary>Complete token reference</summary>
              <pre className="v2-token-source">
                {JSON.stringify(
                  {
                    palette,
                    themes,
                    spacing,
                    typeScale,
                    radii,
                    motion,
                    curves,
                    springs,
                    sensory,
                    foundations,
                  },
                  null,
                  2,
                )}
              </pre>
            </details>
            <div className="v2-token-grid">
              {Object.entries({
                Spacing: spacing,
                Typography: typeScale,
                Motion: motion,
              }).map(([name, values]) => (
                <section key={name}>
                  <Text as="h3" roleStyle="title">
                    {name}
                  </Text>
                  <dl>
                    {Object.entries(values).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>
                          {value}
                          {name === "Motion" ? "ms" : "px"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
            <Text roleStyle="small">
              Springs:{" "}
              {Object.entries(springs)
                .map(
                  ([key, v]) => `${key} ${v.damping}/${v.stiffness}/${v.mass}`,
                )
                .join("; ")}
              .
            </Text>
            <Text roleStyle="small">
              Haptics: {sensory.haptics.join(", ")}. Sounds:{" "}
              {sensory.sounds.join(", ")}. Vocabulary only; native haptics and
              licensed recordings are not connected in this phase.
            </Text>
          </details>
        </section>
      </main>
      <footer className="v2-footer">
        <Text roleStyle="small">
          {t(
            "Foundations preview · Human review and audio are still pending.",
            "डिज़ाइन प्रीव्यू · मानवीय समीक्षा और ऑडियो अभी बाकी हैं।",
          )}
        </Text>
        <Link to="/today" className="v2-quiet">
          {t("Return to the current app", "मौजूदा ऐप पर लौटें")}
        </Link>
      </footer>
    </div>
  );
}
