# Spritual — Product Studio Delivery

25 September 2026 · local implementation, source and verification record

**Delivered:** one chosen mobile-first experience on the existing React/Vite application, with persistent reading continuation and a voluntary cue → action → return loop. The copy comparison UI has been removed from the customer surface, including old query-string URLs. The source is implemented in the repository and compiled; this is not a mockup or a replacement scaffold.

**Release classification:** functioning local alpha. Not a production backend, a store release, zero-vulnerability certification, verified market dominance or proven million-user capacity. No external service, real payment, invitation, migration or deployment was performed. Two bounded specialist reviews supplied strategy evidence and a backend/security audit; the main agent implemented and inspected the UI.

## Phase 1 — Strategic blueprint

### Product decision

**Position:** Don’t collect wisdom. Live it.

For an adult reader who wants scripture to become understandable and useful, Spritual connects one original passage to a clearly labelled explanation and one small voluntary action. The current catalogue is three Gita selections in English/Hindi. It is not a complete Gita, Ramayana, Veda catalogue or religious authority.

The chosen product loop is **arrive → read → understand → choose an action → attach an everyday cue → return**. No signup wall, fake lock, guilt streak or compulsory reflection is added. A small meaningful return is the objective; screen time is not the success metric.

| Implemented surface | Product mechanism | Observable behavior |
| --- | --- | --- |
| First-visit Home | Reduce explanation and decision burden | Winning headline, concise explanation, one art-led lesson entry |
| Returning Home | Preserve context | Actual saved reading position and an untried saved idea take priority |
| Explore | Recognition over recall | Existing bilingual/reference search, including Hindi digits, plus topic filters and empty-state recovery |
| Reader | Separate source from interpretation | Original Sanskrit, optional IAST, unreviewed meaning/source link, practical action |
| Continuation | Reduce restart effort | Deliberate next/previous saves an exact stage, restored from Home and collection after reload |
| My day | Connect an action to a familiar event | Optional after-breakfast/before-work/evening cue, no notification claim |
| Correction controls | Preserve agency | Remove cue, undo tried, undo completion and clear reading position without deleting unrelated records |
| Personal space | Honest feedback | Actual local read/kept counts, language, privacy and comfort controls |

These mechanisms are design hypotheses, not measured retention improvements. The cue records a user choice, not a prediction or faith profile. AI is not added because the current bottleneck is continuity and reviewed content, not token generation. A predictive spiritual adviser would need separate content, privacy and evaluation work.

### Competitive evidence and defensibility

Hallow advertises journals/challenges, Insight Timer optional daily check-ins, Calm daily/sample content and Sri Mandir devotional/ritual services. Therefore these patterns are not novel by themselves. The near-term differentiation is their disciplined connection to a source passage and a small action, with low-friction return and explicit content provenance. Full official links and inference limits are in [PRODUCT_STRATEGY_EVIDENCE.md](PRODUCT_STRATEGY_EVIDENCE.md).

There is no established moat yet. A defensible service would require licensed reviewed content, trusted teacher operations, measurable reader usefulness and reliable delivery. Local saved history is convenience, not a proprietary-data moat. No ranking, CAC, LTV or conversion uplift is invented.

### Growth and measurement decision

Do not build aggressive invitation loops or collect private reflections for growth. The next valid evidence is an observed first lesson and an optional return to the saved action using the existing user-test plan. Proposed measures: successful start, deliberate completion, explicitly kept action, voluntary tried check-in and return usefulness. None is currently sent to analytics; no participant data or results have been manufactured. Commercial offers remain unverified.

## Phase 2 — Architecture and schemas

### Chosen architecture

Retain the modular React/Vite application and Capacitor wrappers. The member alpha is separate from the legacy routes and teacher fixtures. Pure state functions sit outside React so validation, correction and storage failure behavior are testable. No new service or runtime was installed.

```text
app/
  web/src/
    alpha/
      AlphaApp.tsx          routes, shell, blocked non-demo mode
      Experience.tsx        Home, Explore, My space
      Story.tsx             collection and four-stage reader
      Wisdom.tsx            local-state hook and My day
      wisdomState.ts        validated schema and pure transitions [new]
      experience.css        coherent member design and cue/resume UI
      story.css             full-screen reading motion/layout
      Teacher.tsx           preserved teacher delivery workflow
      domain.ts             local authorization/state transitions
      context.tsx           actor/preferences and private-data handling
      storage.ts            local fixture persistence
    data/lessons.ts          actual three-sample content catalogue
    lib/lessonSearch.ts      reused bilingual/reference search
    components/Icon.tsx     shared SVG icons
  web/public/art/            bundled original artwork
  web/android/               existing Capacitor Android project
  web/ios/                   existing Capacitor iOS project
  packages/core/src/         existing RPC contracts
  supabase/migrations/       five existing SQL files; unapplied here
  supabase/tests/pgtap/      database authorization assertions; not executed
  tests/wisdom-state.test.ts eight new local-state tests
  scripts/                   build/native/database test tools
  docs/                      this delivery and evidence
```

### Local schema actually shipped

Key: `spritual_alpha_wisdom_v1_<actor-id>`. Existing version-1 data remains readable. `language` and `kept` are required; `finished` and `resume` are optional. A kept record stores its calendar day, optional tried timestamp and optional allowlisted cue. Resume stores only a known lesson, stage 0–3 and timestamp; it cannot itself manufacture completion. Unknown catalogue IDs, malformed timestamps/stages/cues and impossible dates reject the record. Unknown extra fields are omitted from a valid serialization so accidental private text is not propagated.

A read/validation failure pauses writes and shows an error; a quota failure does not report success. Each update rereads the latest stored object and preserves unrelated observed fields. **This is not an atomic multi-tab database transaction:** simultaneous writes in separate tabs can still race. The data is local and unencrypted, not secure authentication or cloud backup. Tests cover actor-key separation; fixture selection is not an access-control boundary against someone controlling the browser.

### Database schema and production boundary

The complete existing five SQL files are reproduced in Appendix B for inspection, not as a deploy recommendation. The audit inventories language/review, organization/membership, rights/versioned content, approvals/corrections, offers/payment/entitlement and operator API tables in [CORE_ARCHITECTURE_AUDIT.md](CORE_ARCHITECTURE_AUDIT.md).

They are **not a definitive production schema for this alpha**. Cohorts, invitation redemption, completion and delivery operations are not persisted by that schema. Public catalogue/document functions lack current resource entitlement/rights checks, publication protections are incomplete, and reviewer identity enforcement is unfinished. These are implementation gaps, not just configuration tasks.

Real mode remains blocked. Before connecting it, resource-scoped authorization, immutable review evidence, transactional invitations/seat allocation, session recovery and media authorization must be implemented and verified on a disposable database. No secret belongs in browser-visible `VITE_*` configuration. A database script run in this pass stopped before contact because `DB_URL` was unset; psql, Supabase CLI, Docker and pg_prove were not available on PATH. No SQL assertions ran and no migration was applied.

### Capacity decision

A schema cannot establish support for millions of concurrent users. The planned production shape is static assets through a CDN, a pooled transactional database for authoritative writes and separately authorized object storage for media. Cache only approved public metadata, never shared private notes or user entitlements. Bound catalogue reads, use durable unique event IDs and test revocation before optimizing throughput.

Illustrative sizing only: one million active clients requesting once every 30 seconds implies roughly 33,333 requests/second before caching; a hypothetical 95% cache hit rate still leaves about 1,667 origin requests/second for that workload. These are arithmetic inputs, not achieved performance. Concurrency mix, rights checks, media bandwidth, database plans, connection limits, failure recovery and latency need representative load tests before capacity claims.

## Phase 3 — Implemented application core

The repository contains the functioning implementation. Appendix A reproduces the complete changed core files, including real transitions, UI, exact styles and tests; no integration is represented by a fake successful response. Existing routes, content, teacher workflow and private reflections were preserved.

### Interaction and motion specification

- Member base `#151210`, raised surface `#211c19`, main text `#f5ecdd`, amber action `#efae50`.
- Existing self-hosted Fraunces display typography and system/Indic fallbacks retained.
- Reading and route entrances use short opacity/translation transitions; artwork settles once. No infinite attention loop.
- Cue controls are native labelled selects with 50px minimum height; correction controls use at least 44px targets.
- App Reduce motion and operating-system preference disable animations/transitions. Source, saved action and completion remain distinct states.
- A completed reading clears its own pending resume; marking another reading complete does not erase a different saved position.
- Home re-entry links use the exact saved lesson/stage. All-read state offers deliberate rereading rather than invented new episodes.

### What was verified

| Check | Result |
| --- | --- |
| TypeScript | Passed |
| Node suite | 88 passed, including 8 new reading-state tests |
| Web production build | Passed |
| Native bundle sync and Android debug build | Passed; APK is local testing output |
| Browser reading journey | Leave at meaning → reload Home → exact-stage resume → complete → keep → cue → reload → tried → undo passed |
| Search | `गीता २:४७` found the actual 2.47 sample |
| Data preservation | QA-created 2.47 action/completion/resume removed through UI; pre-existing 6.26 record retained; original actor/language/comfort preferences restored |
| Responsive | 16 route-width checks at 320/390/768/1440 without horizontal overflow |
| Accessibility inspection | 320 × 568 Hindi My day, larger text and reduced motion checked; motion computed to none; inspected controls met 44px minimum |
| Completion guard | Direct unread `?scene=4` showed action stage, not fabricated completion |
| Console | No JavaScript errors returned by inspected browser log |
| Database/production/native UI | Not verified; no DB tests, production deployment, native-device or screen-reader usability claim |

Screenshot evidence: `artifacts/qa/studio-practice-cue-390.png`. Android test artifact: `artifacts/Spritual-0.1.0-debug.apk`.

### Known limitations

Three samples and original unreviewed interpretations only; no licensed human narration, wider catalogue, real auth, backend sync, provider payment, notification or AI integration. Settings/teacher utility copy remains mainly English. Cross-tab storage is best effort, not transactionally atomic. No real participants, conversion/retention results, load tests or external security assessment. Source is still untracked with no remote: this delivery does not pretend a versioned release or deployment exists.

### Run the delivered core

From `app/`:

```sh
npm run dev
npm run typecheck
npm test
npm run build
npm run mobile:apk
```

The development server was reused at `http://127.0.0.1:5173/alpha/today`. Do not run a second server on the same port. APK is unsigned-for-release debug output; iOS source sync does not establish an iOS build.

## Appendix A — Complete changed core source

These are delivery-time snapshots. Repository files remain the authoritative editable implementation.


### `web/src/alpha/wisdomState.ts`

```typescript
/** Local-only reading records. No free-text reflection or inferred profile belongs here. */
export const practiceCues = ["after-breakfast", "before-work", "evening"] as const;
export type PracticeCue = typeof practiceCues[number];
export type Kept = { day: string; triedAt?: string; cue?: PracticeCue };
export type ReadingResume = { lessonId: string; scene: number; updatedAt: string };
export type WisdomState = {
  schema: 1;
  language: "en" | "hi";
  kept: Record<string, Kept>;
  finished?: Record<string, string>;
  resume?: ReadingResume;
};
export const freshWisdom = (): WisdomState => ({ schema: 1, language: "en", kept: {} });
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const timestamp = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value));
const day = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T00:00:00Z`)) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
export function parseWisdom(raw: string | null, lessonIds: readonly string[]): WisdomState {
  if (!raw) return freshWisdom();
  const v: unknown = JSON.parse(raw);
  if (!object(v) || v.schema !== 1 || (v.language !== "en" && v.language !== "hi") || !object(v.kept)) throw Error("Unsupported reading data.");
  const kept: Record<string, Kept> = {};
  for (const [id, entry] of Object.entries(v.kept)) {
    if (!lessonIds.includes(id) || !object(entry) || !day(entry.day) || (entry.triedAt !== undefined && !timestamp(entry.triedAt)) || (entry.cue !== undefined && !practiceCues.includes(entry.cue as PracticeCue))) throw Error("Invalid saved practice.");
    kept[id] = { day: entry.day, ...(entry.triedAt ? { triedAt: entry.triedAt as string } : {}), ...(entry.cue ? { cue: entry.cue as PracticeCue } : {}) };
  }
  const result: WisdomState = { schema: 1, language: v.language, kept };
  if (v.finished !== undefined) {
    if (!object(v.finished)) throw Error("Invalid reading history.");
    result.finished = {};
    for (const [id, date] of Object.entries(v.finished)) {
      if (!lessonIds.includes(id) || !timestamp(date)) throw Error("Invalid reading history entry.");
      result.finished[id] = date;
    }
  }
  if (v.resume !== undefined) {
    const r = v.resume;
    if (!object(r) || typeof r.lessonId !== "string" || !lessonIds.includes(r.lessonId) || !Number.isInteger(r.scene) || Number(r.scene) < 0 || Number(r.scene) > 3 || !timestamp(r.updatedAt)) throw Error("Invalid reading position.");
    result.resume = { lessonId: r.lessonId, scene: r.scene as number, updatedAt: r.updatedAt };
  }
  return result;
}
export function moveReading(state: WisdomState, lessonId: string, scene: number, now: string): WisdomState {
  if (!Number.isInteger(scene) || scene < 0 || scene > 3 || !timestamp(now)) throw Error("Invalid reading position.");
  return { ...state, resume: { lessonId, scene, updatedAt: now } };
}
export function finishReading(state: WisdomState, lessonId: string, now: string): WisdomState {
  if (!timestamp(now)) throw Error("Invalid completion time.");
  const next = { ...state, finished: { ...state.finished, [lessonId]: now } };
  if (next.resume?.lessonId === lessonId) delete next.resume;
  return next;
}
export function setPracticeCue(state: WisdomState, lessonId: string, cue?: PracticeCue): WisdomState {
  if (!state.kept[lessonId] || (cue !== undefined && !practiceCues.includes(cue))) throw Error("Save an idea before choosing its cue.");
  const entry = { ...state.kept[lessonId] };
  if (cue) entry.cue = cue; else delete entry.cue;
  return { ...state, kept: { ...state.kept, [lessonId]: entry } };
}
export function markPracticeTried(state: WisdomState, lessonId: string, now?: string): WisdomState {
  if (!state.kept[lessonId] || (now !== undefined && !timestamp(now))) throw Error("Invalid practice check-in.");
  const entry = { ...state.kept[lessonId] };
  if (now) entry.triedAt = now; else delete entry.triedAt;
  return { ...state, kept: { ...state.kept, [lessonId]: entry } };
}
export function readingHref(lessonId: string, resume?: ReadingResume): string {
  return `/alpha/episode/${encodeURIComponent(lessonId)}${resume?.lessonId === lessonId ? `?scene=${resume.scene}` : ""}`;
}

export function mutateWisdomStorage(storage: Pick<Storage, "getItem" | "setItem">, key: string, lessonIds: readonly string[], change: (state: WisdomState) => WisdomState): WisdomState {
  // Read immediately before each write, preserving unrelated updates observed in storage.
  // This is local persistence, not an atomic cross-tab/cloud transaction.
  const latest = parseWisdom(storage.getItem(key), lessonIds);
  const next = parseWisdom(JSON.stringify(change(latest)), lessonIds);
  storage.setItem(key, JSON.stringify(next));
  return next;
}

```

### `web/src/alpha/Experience.tsx`

```tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../components/Icon";
import { lessons } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import { readingHref } from "./wisdomState";
import { searchLessons } from "../lib/lessonSearch";

const covers = ["/art/gita-chariot-cover-v1.webp", "/art/river-sanctuary-v1.webp", "/art/river-sanctuary-v1.webp"];
const topics = [["All", "सभी"], ["Purpose", "कर्म"], ["Balance", "संतुलन"], ["Attention", "ध्यान"]];
export function Experience({ explore = false }: { explore?: boolean }) {
  const { state, update, error, timeZone } = useWisdom();
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState("");
  const hi = state.language === "hi";
  const t = (en: string, hindi: string) => hi ? hindi : en;
  const next = lessons.find(l => l.id === state.resume?.lessonId) || lessons.find(l => !state.finished?.[l.id]) || lessons[0];
  const returning = Boolean(state.resume || Object.keys(state.kept).length || Object.keys(state.finished || {}).length);
  const allRead = lessons.every(l => state.finished?.[l.id]);
  const nextHref = readingHref(next.id, state.resume);
  const kept = Object.entries(state.kept).reverse().filter(([, v]) => v.day === localDay(timeZone)).sort((a,b) => Number(Boolean(a[1].triedAt)) - Number(Boolean(b[1].triedAt)))[0];
  const cueLabels = { "after-breakfast": t("After breakfast", "नाश्ते के बाद"), "before-work": t("Before work or study", "काम या पढ़ाई से पहले"), evening: t("During my evening pause", "शाम के विराम में") };
  const change = () => { if (update(v => ({ ...v, language: hi ? "en" : "hi" }))) window.dispatchEvent(new Event("spritual-alpha-language")); };
  const visible = searchLessons(lessons, query, ["all", "purpose", "balance", "attention"][filter]);
  return <div className="experience" lang={state.language}>
    <header className={`experience-greeting ${!explore && !returning ? "experience-positioning" : ""}`}><div><span className="experience-eyebrow">{t("A LITTLE, EVERY DAY", "थोड़ा, हर दिन")}</span><h1>{explore ? t("Find your moment.", "अपना पल खोजें।") : returning ? t("Welcome back to yourself.", "अपने पास फिर लौटें।") : t("Don’t collect wisdom. Live it.", "ज्ञान सिर्फ़ संजोएँ नहीं। उसे जिएँ।")}</h1></div><button className="experience-language" onClick={change} aria-label={hi ? "Switch to English" : "हिन्दी में पढ़ें"}>{hi ? "EN" : "हिं"}<span aria-hidden="true">⇄</span></button></header>
    {!explore && !returning && <div className="experience-positioning-support"><p>{t("Read a Gita shloka, explore its meaning in English or Hindi, and choose one small action for your day. Original words, a plain-language explanation, and everyday practice—at your pace.", "गीता का एक श्लोक पढ़ें, उसका अर्थ समझें, और दिन के लिए एक छोटा कदम चुनें। मूल शब्द, सरल व्याख्या और रोज़ का अभ्यास—अपनी गति से।")}</p></div>}
    {!explore && state.resume && <div className="experience-reading-return"><Link to={nextHref}><span className="experience-resume-icon"><Icon name="book"/></span><span><small>{t("YOUR PLACE IS KEPT", "आपकी जगह सहेजी है")}</small><strong>{t("Continue reading", "पढ़ना जारी रखें")}</strong><span>{next.title[state.language]} · {state.resume.scene + 1}/4</span></span><Icon name="arrow"/></Link><button type="button" onClick={() => update(latest => { const nextState = { ...latest }; delete nextState.resume; return nextState; })}>{t("Clear reading position", "पढ़ने की जगह हटाएँ")}</button></div>}
    {error && <p role="alert" className="alpha-error">{error}</p>}
    {!explore && <>
      {kept && <Link className="experience-resume" to={kept ? "/alpha/my-day" : nextHref}><span className="experience-resume-icon"><Icon name={kept ? "bookmark" : "sun"}/></span><span><strong>{kept ? t("Your thought, carried forward", "आपकी सीख, दिन भर साथ") : t("A small pause. A fresh perspective.", "एक छोटा विराम। एक नई नज़र।")}</strong><small>{kept ? kept[1].triedAt ? t("You tried it. Return whenever you wish.", "आपने आज़माया। जब चाहें फिर लौटें।") : kept[1].cue ? cueLabels[kept[1].cue] : t("Return to the idea you saved today", "आज सहेजे विचार पर लौटें") : t("One verse is enough to begin", "शुरुआत के लिए एक श्लोक काफ़ी है")}</small></span><Icon name="chevron" size={18}/></Link>}
      <div className="experience-section-label"><span>{state.resume ? t("CONTINUE AT YOUR PACE", "अपनी गति से जारी रखें") : allRead ? t("RETURN TO A FAMILIAR VERSE", "परिचित श्लोक पर लौटें") : t("YOUR NEXT CHAPTER", "आपका अगला पाठ")}</span><span>{t("BHAGAVAD GITA", "भगवद्गीता")}</span></div>
      <Link to={nextHref} className="experience-hero"><img src={covers[0]} alt="" width="941" height="1672"/><span className="experience-hero-shade"/><span className="experience-hero-top"><span>{t("THE GITA COLLECTION", "गीता संग्रह")}</span><Icon name="book" size={20}/></span><span className="experience-hero-copy"><small>{next.reference.replace("Bhagavad Gita ", "")} · {t("GUIDED READING", "साथ पढ़ें")}</small><h2>{next.title[state.language]}</h2><span className="experience-hero-action"><span className="experience-round"><Icon name="arrow"/></span><span>{state.resume ? t("Continue this reading", "यह पाठ जारी रखें") : allRead ? t("Read with fresh eyes", "नई नज़र से पढ़ें") : t("Step into the Gita", "गीता के साथ चलें")}<small>{t("Read · Understand · Live it", "पढ़ें · समझें · अपनाएँ")}</small></span></span></span></Link>

    </>}
    {explore && <><p className="experience-intro">{t("Ancient words. Everyday questions. Start where you are.", "प्राचीन शब्द। रोज़ के सवाल। जहाँ हैं, वहीं से शुरू करें।")}</p><label className="experience-search"><Icon name="search"/><input type="search" aria-label={t("Search readings", "पाठ खोजें")} placeholder={t("Search a thought or verse…", "विचार या श्लोक खोजें…")} value={query} onChange={e => setQuery(e.target.value)}/></label><div className="experience-filters" role="group" aria-label={t("Reading theme", "पाठ का विषय")}>{topics.map((topic, i) => <button key={i} aria-pressed={filter === i} onClick={() => setFilter(i)}>{topic[hi ? 1 : 0]}</button>)}</div></>}
    <section><div className="experience-section-head"><div><span className="experience-eyebrow">{t("WISDOM FOR REAL LIFE", "जीवन से जुड़ी सीख")}</span><h2>{explore ? t("The reading room", "पाठशाला") : t("What brings you here?", "मन में क्या चल रहा है?")}</h2></div>{!explore && <Link to="/alpha/library" aria-label={t("Explore all readings", "सभी पाठ खोजें")}><Icon name="arrow"/></Link>}</div><div className="experience-grid">{visible.map(l => { const i = lessons.indexOf(l); return <Link className={`experience-card experience-card-${i}`} to={readingHref(l.id, state.resume)} key={l.id}><img src={covers[i]} alt="" loading="lazy"/><span><small>{topics[i + 1][hi ? 1 : 0]}</small><strong>{l.title[state.language]}</strong><span>{l.reference.replace("Bhagavad Gita", t("Gita", "गीता"))}<Icon name={state.finished?.[l.id] ? "check" : "arrow"} size={17}/></span></span></Link>; })}</div>{!visible.length && <div className="experience-empty"><Icon name="search" size={30}/><h3>{t("A different word might help.", "कोई दूसरा शब्द आज़माएँ।")}</h3><p>{t("This preview has three Gita readings.", "इस पूर्वावलोकन में गीता के तीन पाठ हैं।")}</p><button className="wisdom-primary" onClick={() => { setQuery(""); setFilter(0); }}>{t("Show all readings", "सभी पाठ देखें")}</button></div>}</section>
    <Link className="experience-collection" to="/alpha/series/gita"><img src={covers[0]} alt="" loading="lazy"/><span><small>{t("A GUIDED COLLECTION", "एक यात्रा, साथ में")}</small><strong>{t("The Gita. Closer to life.", "गीता। जीवन के और पास।")}</strong><span>{Object.keys(state.finished || {}).length}/3 {t("readings explored", "पाठ पढ़े")}</span><span className="experience-meter"><i style={{width:`${Object.keys(state.finished || {}).length / 3 * 100}%`}}/></span></span><Icon name="chevron"/></Link>
    <p className="experience-disclosure">{t("Preview collection · Original explanations awaiting human review. Source Sanskrit is linked in every reading.", "पूर्वावलोकन संग्रह · मौलिक व्याख्याओं की मानवीय समीक्षा बाकी है। हर पाठ में संस्कृत स्रोत जुड़ा है।")}</p>
  </div>;
}

export function ExperienceProfile() {
  const { state, update, error } = useWisdom();
  const t = (en: string, hi: string) => state.language === "hi" ? hi : en;
  const change = (language: "en" | "hi") => { if (update(v => ({ ...v, language }))) window.dispatchEvent(new Event("spritual-alpha-language")); };
  return <div className="experience experience-profile" lang={state.language}>
    <header><span className="experience-eyebrow">{t("A PLACE TO RETURN", "फिर लौटने की जगह")}</span><h1>{t("Your own rhythm.", "आपकी अपनी लय।")}</h1><p>{t("A little reading. A little living. All at your pace.", "थोड़ा पढ़ें। थोड़ा अपनाएँ। अपनी गति से।")}</p></header>
    {error && <p role="alert" className="alpha-error">{error}</p>}
    <div className="experience-stats"><Link to="/alpha/series/gita"><Icon name="book"/><strong>{Object.keys(state.finished || {}).length}<small>/ 3</small></strong><span>{t("Readings explored", "पाठ पढ़े")}</span></Link><Link to="/alpha/my-day"><Icon name="bookmark"/><strong>{Object.keys(state.kept).length}</strong><span>{t("Ideas kept close", "विचार सहेजे")}</span></Link></div>
    <Link to="/alpha/my-day" className="experience-resume"><span className="experience-resume-icon"><Icon name="leaf"/></span><span><strong>{t("Bring a little wisdom into today", "आज थोड़ा ज्ञान अपनाएँ")}</strong><small>{t("Your saved ideas and small steps", "आपके सहेजे विचार और छोटे कदम")}</small></span><Icon name="chevron"/></Link>
    <section className="experience-profile-section"><h2>{t("Your reading language", "पढ़ने की भाषा")}</h2><div className="experience-filters" role="group" aria-label="Reading language"><button aria-pressed={state.language === "en"} onClick={() => change("en")}>English</button><button aria-pressed={state.language === "hi"} onClick={() => change("hi")}>हिन्दी</button></div></section>
    <div className="experience-menu"><Link to="/alpha/reflection/general"><Icon name="book"/><span><strong>{t("A private reflection", "एक निजी विचार")}</strong><small>{t("Make space for what stays with you", "जो मन में रह जाए, उसे लिखें")}</small></span><Icon name="chevron"/></Link><Link to="/alpha/program"><Icon name="heart"/><span><strong>{t("Your community", "आपका समुदाय")}</strong><small>{t("Open the local circle preview", "स्थानीय समुदाय का पूर्वावलोकन")}</small></span><Icon name="chevron"/></Link><Link to="/alpha/settings"><Icon name="settings"/><span><strong>{t("Comfort, privacy & help", "सुविधा, गोपनीयता और सहायता")}</strong><small>{t("Text size, motion and your local data", "अक्षर आकार, गति और स्थानीय जानकारी")}</small></span><Icon name="chevron"/></Link></div>
    <p className="experience-disclosure">{t("Your reading history stays on this device. This local preview is not a signed-in account; anyone using this browser profile can inspect its unencrypted data.", "पढ़ने की जानकारी इस डिवाइस पर रहती है। यह स्थानीय पूर्वावलोकन है, सुरक्षित खाता नहीं। इस ब्राउज़र का उपयोग करने वाला व्यक्ति बिना एन्क्रिप्शन की जानकारी देख सकता है।")}</p>
  </div>;
}

```

### `web/src/alpha/Story.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { lessons, type Language } from "../data/lessons";
import { localDay, useWisdom } from "./Wisdom";
import "./story.css";
import { finishReading, moveReading, readingHref } from "./wisdomState";

const chapters = [
  { id: "gita-2-47", en: "When the result is uncertain", hi: "जब परिणाम तय न हो", theme: "work" },
  { id: "gita-2-48", en: "When life changes course", hi: "जब दिन दिशा बदले", theme: "balance" },
  { id: "gita-6-26", en: "When the mind wanders", hi: "जब मन भटके", theme: "attention" },
] as const;

const art = "/art/gita-chariot-cover-v1.webp";
const labels = (language: Language) => (en: string, hi: string) => language === "hi" ? hi : en;

function StoryLanguage({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <div className="story-language" role="group" aria-label="Reading language">
    <button type="button" aria-pressed={language === "en"} onClick={() => onChange("en")}>English</button>
    <button type="button" aria-pressed={language === "hi"} onClick={() => onChange("hi")}>हिन्दी</button>
  </div>;
}

export function GitaJourney() {
  const { state, error, update } = useWisdom();
  const language = state.language;
  const t = labels(language);
  const completed = chapters.filter(chapter => Boolean(state.finished?.[chapter.id]));
  const next = chapters.find(chapter => chapter.id === state.resume?.lessonId) || chapters.find(chapter => !state.finished?.[chapter.id]) || chapters[0];
  const changeLanguage = (nextLanguage: Language) => {
    if (update(latest => ({ ...latest, language: nextLanguage }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };

  return <div className="story-series" lang={language}>
    <div className="story-series-top"><Link to="/alpha/library">← {t("Explore", "खोजें")}</Link><StoryLanguage language={language} onChange={changeLanguage}/></div>
    {error && <p className="alpha-error" role="alert">{error}</p>}
    <section className="story-series-cover" aria-labelledby="story-series-heading">
      <img src={art} width="941" height="1672" alt={t("An illustrated chariot at sunrise before a difficult conversation", "कठिन बातचीत से पहले सूर्योदय में एक रथ का चित्र")} />
      <div className="story-series-copy">
        <span className="story-eyebrow">SPRITUAL / {t("GUIDED READING", "साथ पढ़ें")}</span>
        <h1 id="story-series-heading">{t("The Gita,", "गीता,")}<br/><em>{t("in the middle of life.", "जीवन के बीच।")}</em></h1>
        <p>{t("Three timeless questions. A verse, a perspective, a small step into your day.", "तीन सवाल। एक श्लोक, एक नज़रिया, और दिन के लिए एक छोटा कदम।")}</p>
        <Link className="story-gold-button" to={readingHref(next.id, state.resume)}>{state.resume ? t("Continue reading", "पढ़ना जारी रखें") : completed.length === 0 ? t("Begin the journey", "यात्रा शुरू करें") : completed.length === chapters.length ? t("Read again", "फिर पढ़ें") : t("Continue reading", "पढ़ना जारी रखें")} <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
    <div className="story-series-progress"><div><strong>{completed.length} / {chapters.length}</strong><span>{t("read by you", "आपने पढ़े")}</span></div><p>{t("Read in any order. There are no locks or missed days.", "किसी भी क्रम में पढ़ें। यहाँ बंद पाठ या छूटे दिन नहीं हैं।")}</p></div>
    <section className="story-episodes" aria-labelledby="story-episodes-heading"><div className="story-section-head"><span className="story-eyebrow">{t("THREE AVAILABLE READINGS", "तीन उपलब्ध पाठ")}</span><h2 id="story-episodes-heading">{t("Choose a question.", "एक सवाल चुनें।")}</h2></div>
      <div className="story-episode-list">{chapters.map((chapter, index) => { const lesson = lessons.find(item => item.id === chapter.id)!; const finished = Boolean(state.finished?.[chapter.id]); return <Link className="story-episode" to={readingHref(chapter.id, state.resume)} key={chapter.id}><div className={`story-episode-thumb story-episode-thumb--${chapter.theme}`}><img src={index === 2 ? "/art/river-sanctuary-v1.webp" : art} alt="" loading="lazy"/></div><span className="story-episode-number">{String(index + 1).padStart(2, "0")}</span><span className="story-episode-text"><small>{lesson.reference} · {t("4 moments", "4 चरण")}</small><strong>{language === "hi" ? chapter.hi : chapter.en}</strong><span>{lesson.title[language]}</span></span><span className="story-episode-end">{finished ? <span className="story-finished">✓ {t("Read", "पढ़ा")}</span> : <span aria-hidden="true">↗</span>}</span></Link>; })}</div>
    </section>
    <p className="story-disclosure">{t("These are three Gita selections, not a complete scripture or a narrated/video series. The interpretations are original demonstrations awaiting human review. Sanskrit links appear in each reading.", "ये गीता के तीन चुने हुए पाठ हैं, पूरा ग्रंथ या ऑडियो/वीडियो श्रृंखला नहीं। व्याख्याएँ मौलिक नमूने हैं जिनकी मानवीय समीक्षा बाकी है। हर पाठ में संस्कृत स्रोत का लिंक है।")}</p>
  </div>;
}

export function GitaEpisode() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { state, error, update, timeZone } = useWisdom();
  const language = state.language;
  const t = labels(language);
  const lesson = lessons.find(item => item.id === id);
  const chapter = chapters.find(item => item.id === id);
  const raw = Number(params.get("scene") ?? (state.resume && state.resume.lessonId === id ? state.resume.scene : 0));
  const requested = Number.isInteger(raw) ? Math.min(4, Math.max(0, raw)) : 0;
  const scene = requested === 4 && !state.finished?.[id || ""] ? 3 : requested;
  const [pronunciation, setPronunciation] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const [savedNotice, setSavedNotice] = useState("");

  useEffect(() => {
    heading.current?.focus();
    window.scrollTo(0, 0);
    setPronunciation(false);
    setSavedNotice("");
  }, [id, scene]);

  if (!lesson || !chapter) return <div className="story-missing"><h1>{t("This reading is not here.", "यह पाठ उपलब्ध नहीं है।")}</h1><Link to="/alpha/series/gita">{t("See available readings", "उपलब्ध पाठ देखें")}</Link></div>;

  const step = [lesson.steps.find(item => item.kind === "arrive"), lesson.steps.find(item => item.kind === "verse"), lesson.steps.find(item => item.kind === "understand"), lesson.steps.find(item => item.kind === "apply")][Math.min(scene, 3)]!;
  const verse = lesson.steps.find(item => item.kind === "verse")!;
  const setScene = (next: number) => {
    if (next < 4) update(latest => moveReading(latest, lesson.id, next, new Date().toISOString()));
    setParams({ scene: String(next) }, { replace: true });
  };
  const changeLanguage = (nextLanguage: Language) => {
    if (update(latest => ({ ...latest, language: nextLanguage }))) window.dispatchEvent(new Event("spritual-alpha-language"));
  };
  const finish = () => {
    if (update(latest => finishReading(latest, lesson.id, new Date().toISOString()))) setScene(4);
  };
  const undoFinish = () => {
    if (update(latest => {
      const finished = { ...latest.finished };
      delete finished[lesson.id];
      return { ...latest, finished };
    })) setScene(3);
  };
  const keep = () => {
    if (update(latest => ({ ...latest, kept: { ...latest.kept, [lesson.id]: { day: localDay(timeZone) } } }))) setSavedNotice(t("Saved to My day. You can return whenever you like.", "मेरा दिन में सहेजा गया। जब चाहें फिर लौटें।"));
  };
  const nextChapter = chapters[chapters.findIndex(item => item.id === lesson.id) + 1];
  const keptToday = state.kept[lesson.id]?.day === localDay(timeZone);

  return <div className="story-player" lang={language}>
    <header className="story-player-head"><Link to="/alpha/series/gita" className="story-close" aria-label={t("Close reading", "पाठ बंद करें")}>×</Link><div className="story-progress" aria-label={scene === 4 ? t("Reading complete", "पाठ पूरा") : t(`Moment ${scene + 1} of 4`, `चरण ${scene + 1} / 4`)}>{[0, 1, 2, 3].map(index => <span key={index} className={index <= scene ? "is-past" : ""}/>)}</div><StoryLanguage language={language} onChange={changeLanguage}/></header>
    {error && <p role="alert" className="story-error">{error}</p>}
    <div className={`story-player-scene story-player-scene--${scene}`} key={`${lesson.id}-${scene}`}>
      {scene === 0 && <><img className="story-player-art" src={art} width="941" height="1672" alt=""/><div className="story-scene-shade"/><div className="story-scene-copy"><span className="story-eyebrow">{lesson.reference} · {t("THE QUESTION", "सवाल")}</span><h1 ref={heading} tabIndex={-1}>{language === "hi" ? chapter.hi : chapter.en}</h1><p>{step.body[language]}</p></div></>}
      {scene === 1 && <div className="story-paper-scene"><span className="story-eyebrow">{t("THE ORIGINAL VERSE", "मूल श्लोक")} · {lesson.reference}</span><h1 ref={heading} tabIndex={-1}>{t("Read it slowly.", "धीरे-धीरे पढ़ें।")}</h1><blockquote lang="sa-Deva">{verse.script}</blockquote><button className="story-text-button" type="button" aria-expanded={pronunciation} onClick={() => setPronunciation(!pronunciation)}>{pronunciation ? t("Hide reading guide", "उच्चारण सहायता छिपाएँ") : t("Show reading guide", "उच्चारण सहायता देखें")} <span aria-hidden="true">{pronunciation ? "−" : "+"}</span></button>{pronunciation && <p className="story-pronunciation">{verse.transliteration}</p>}<p>{verse.body[language]}</p></div>}
      {scene === 2 && <div className="story-meaning-scene"><span className="story-eyebrow">{t("MEANING · UNREVIEWED DEMO", "अर्थ · समीक्षा-रहित नमूना")}</span><h1 ref={heading} tabIndex={-1}>{step.title[language]}</h1><p>{step.body[language]}</p><details><summary>{t("Read the source note", "स्रोत के बारे में पढ़ें")}</summary><p>{lesson.sourceNote[language]}</p><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer">{t("Open source Sanskrit", "मूल संस्कृत देखें")} ↗</a></details></div>}
      {scene === 3 && <div className="story-action-scene"><span className="story-eyebrow">{t("BRING IT INTO TODAY", "आज के दिन में अपनाएँ")}</span><h1 ref={heading} tabIndex={-1}>{step.title[language]}</h1><p>{step.body[language]}</p><div className="story-action-card"><small>{t("ONE POSSIBLE STEP", "एक संभव कदम")}</small><strong>{lesson.action[language]}</strong></div><p className="story-scene-footnote">{t("A personal prompt, not a measure of spiritual progress.", "यह निजी अभ्यास है, आध्यात्मिक प्रगति का पैमाना नहीं।")}</p></div>}
      {scene === 4 && <div className="story-end-scene">
        <span className="story-end-mark" aria-hidden="true">✦</span>
        <span className="story-eyebrow">{t("YOU MARKED THIS READING COMPLETE", "आपने यह पाठ पूरा किया")}</span>
        <h1 ref={heading} tabIndex={-1}>{t("Carry what stays with you.", "जो साथ रहे, उसे अपनाएँ।")}</h1>
        <p>{t("You can keep one small action in My day, or simply return when you wish. No streak starts here.", "एक छोटा कदम मेरा दिन में सहेजें, या जब चाहें लौट आएँ। यहाँ लगातार दिनों का कोई दबाव नहीं है।")}</p>
        <div className="story-end-actions">
          <button className="story-gold-button" type="button" onClick={keep} disabled={keptToday}>{keptToday ? t("Already in My day", "मेरा दिन में सहेजा गया") : t("Keep this idea for today", "यह विचार आज के लिए सहेजें")}</button>
          <Link to="/alpha/my-day">{t("Open My day", "मेरा दिन खोलें")} ↗</Link>
          <button className="story-undo-read" type="button" onClick={undoFinish}>{t("Undo read mark", "पढ़ा हुआ निशान हटाएँ")}</button>
        </div>
        <p role="status">{savedNotice}</p>
        {nextChapter && <Link className="story-next-chapter" to={`/alpha/episode/${nextChapter.id}`}>{t("Next reading", "अगला पाठ")} <strong>{language === "hi" ? nextChapter.hi : nextChapter.en}</strong> <span aria-hidden="true">↗</span></Link>}
      </div>}
    </div>
    {scene < 4 && <footer className="story-player-controls"><button type="button" className="story-back" onClick={() => setScene(scene - 1)} disabled={scene === 0}>{t("Previous", "पीछे")}</button><span>{scene + 1} / 4</span><button type="button" className="story-gold-button" onClick={() => scene === 3 ? finish() : setScene(scene + 1)}>{scene === 3 ? t("Mark as read", "पढ़ा हुआ चिन्हित करें") : t("Continue", "आगे बढ़ें")} <span aria-hidden="true">→</span></button></footer>}
  </div>;
}

```

### `web/src/alpha/Wisdom.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { lessons, type Language } from "../data/lessons";
import { useAlpha } from "./context";
import "./wisdom.css";

import { freshWisdom as fresh, parseWisdom, mutateWisdomStorage, markPracticeTried, setPracticeCue, type PracticeCue } from "./wisdomState";
import type { WisdomState } from "./wisdomState";
export type { WisdomState } from "./wisdomState";
const keyFor = (actorId: string) => `spritual_alpha_wisdom_v1_${actorId}`;
const parse = (raw: string | null) => parseWisdom(raw, lessons.map(lesson => lesson.id));
function read(key: string): { state: WisdomState; error: string } {
  try { return { state: parse(localStorage.getItem(key)), error: "" }; }
  catch { return { state: fresh(), error: "Reading data is unavailable. Changes are paused to protect what is saved in this browser." }; }
}
export function useWisdom() {
  const { actor, prefs } = useAlpha();
  const key = keyFor(actor.id);
  const [snapshot, setSnapshot] = useState(() => ({ key, ...read(key) }));
  // Never render the previous demo identity's private practice while the actor changes.
  const current = snapshot.key === key ? snapshot : { key, ...read(key) };
  const { state, error } = current;
  useEffect(() => { setSnapshot({ key, ...read(key) }); }, [key]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== key) return;
      setSnapshot({ key, ...read(key) });
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [key]);
  const update = (change: (latest: WisdomState) => WisdomState) => {
    if (error) return false;
    try {
      const next = mutateWisdomStorage(localStorage, key, lessons.map(lesson => lesson.id), change);
      setSnapshot({ key, state: next, error: "" }); return true;
    } catch { setSnapshot({ key, state, error: "Could not save on this device. Your earlier reading data was left untouched." }); return false; }
  };
  return { state, error, update, timeZone: prefs.timeZone };
}
const feature = [
  { id: "gita-2-47", label: "When outcomes feel uncertain", hi: "जब नतीजा अनिश्चित लगे", color: "amber" },
  { id: "gita-2-48", label: "When you need balance", hi: "जब संतुलन चाहिए", color: "sage" },
  { id: "gita-6-26", label: "When your mind wanders", hi: "जब मन भटके", color: "indigo" },
] as const;
export const localDay = (timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const part = (type: string) => parts.find(p => p.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};
function Lang({ language, change }: { language: Language; change: (l: Language) => void }) {
  return <div className="wisdom-language" role="group" aria-label="Reading language"><button aria-pressed={language === "en"} onClick={() => { change("en"); window.dispatchEvent(new Event("spritual-alpha-language")); }}>English</button><button aria-pressed={language === "hi"} onClick={() => { change("hi"); window.dispatchEvent(new Event("spritual-alpha-language")); }}>हिन्दी</button></div>;
}
function Disclose({ error }: { error: string }) { return error ? <p role="alert" className="alpha-error">{error}</p> : null; }
function LessonArt({ theme, small = false }: { theme: string; small?: boolean }) {
  return <div className={`wisdom-art wisdom-art-${theme} ${small ? "wisdom-art-small" : ""}`} aria-hidden="true"><span className="wisdom-art-sun"/><span className="wisdom-art-arch"/><span className="wisdom-art-horizon"/></div>;
}
function JourneyTeaser({ language, completed }: { language: Language; completed: number }) {
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <Link to="/alpha/series/gita" className="wisdom-journey-teaser"><img src="/art/gita-chariot-cover-v1.webp" width="941" height="1672" loading="lazy" alt=""/><span className="wisdom-journey-teaser-copy"><small>{t("A GUIDED GITA JOURNEY", "गीता के साथ एक यात्रा")} · {completed}/3 {t("read", "पढ़े")}</small><strong>{t("Three questions for real life.", "जीवन के तीन सच्चे सवाल।")}</strong><span>{t("Four short moments in each reading. Start anywhere.", "हर पाठ में चार छोटे चरण। कहीं से भी शुरू करें।")}</span><b>{t("Open the journey", "यात्रा खोलें")} ↗</b></span></Link>;
}
export function WisdomWelcome() {
  const { state, update } = useWisdom();
  const language = state.language;
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-welcome" lang={language}>
    <div className="wisdom-welcome-art"><img src="/art/river-sanctuary-v1.webp" alt="" width="1536" height="1024"/><div className="wisdom-art-overlay"/><div className="wisdom-welcome-copy"><span className="wisdom-overline">SPRITUAL · A LITTLE, EVERY DAY</span><h1>{t("Wisdom you can", "ऐसी सीख जो")}<br/><em>{t("live with.", "जीवन में उतरे।")}</em></h1><p>{t("Read one shloka. Understand its place. Carry one small idea into your day.", "एक श्लोक पढ़ें। उसका संदर्भ समझें। एक छोटा विचार आज के दिन में अपनाएँ।")}</p><Link className="wisdom-primary" to="/alpha/today">{t("Begin with today", "आज से शुरू करें")} <span aria-hidden="true">↗</span></Link></div></div>
    <div className="wisdom-welcome-bottom"><div><span className="wisdom-overline">{t("BEGIN AT YOUR OWN PACE", "अपनी गति से शुरू करें")}</span><p>{t("Three source-linked Gita lessons in English and Hindi. No account or payment to begin.", "स्रोत से जुड़े गीता के तीन पाठ, अंग्रेज़ी और हिंदी में। शुरुआत के लिए खाता या भुगतान नहीं चाहिए।")}</p></div><Lang language={language} change={l=>update(v=>({...v,language:l}))}/><Link to="/alpha/program">{t("I have a community invitation", "मेरे पास समुदाय का निमंत्रण है")} <span aria-hidden="true">→</span></Link></div>
    <p className="wisdom-footnote">{t("Original explanations are demonstration material awaiting human review. Other texts and human audio are not available in this alpha.", "मौलिक व्याख्याएँ अभी नमूना सामग्री हैं और मानवीय समीक्षा बाकी है। दूसरे ग्रंथ और मानव स्वर में ऑडियो अभी उपलब्ध नहीं हैं।")}</p>
  </div>;
}
export function WisdomToday() {
  const { state, error, update, timeZone } = useWisdom();
  const language = state.language;
  const day = localDay(timeZone);
  const todaysIndex = Number(day.replaceAll("-", "")) % lessons.length;
  const selected = lessons[todaysIndex];
  const current = Object.entries(state.kept).find(([, record]) => record.day === day);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className={`wisdom-home ${current ? "wisdom-home-returning" : ""}`} lang={language}>
    <header className="wisdom-home-header"><div><span className="wisdom-overline">{t("YOUR QUIET CORNER", "आपका शांत स्थान")} · {new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" })}</span><h1>{language === "hi" ? "आज क्या साथ ले जाएँ?" : "A thought for today."}</h1><p>{t("Read it. Understand it. Let it shape one small moment.", "पढ़ें, समझें, और एक छोटा कदम अपनाएँ।")}</p></div><Lang language={language} change={l => update(s => ({ ...s, language: l }))}/></header>
    <Disclose error={error}/>
    {current && <Link to="/alpha/my-day" className="wisdom-return"><span className="wisdom-return-icon" aria-hidden="true">↗</span><span><strong>{language === "hi" ? "आपकी आज की सीख" : "Your idea for today"}</strong><small>{lessons.find(l => l.id === current[0])?.title[language]} · {current[1].triedAt ? (language === "hi" ? "आज़माया" : "Tried today") : (language === "hi" ? "साथ रखें" : "Carry it with you")}</small></span><span aria-hidden="true">→</span></Link>}
    <Link className="wisdom-feature" to={`/alpha/wisdom/${selected.id}`}><div className="wisdom-feature-image"><img src="/art/river-sanctuary-v1.webp" alt="" width="1536" height="1024"/><div className="wisdom-feature-shade"/><div className="wisdom-feature-top"><span>{t("THE BHAGAVAD GITA", "भगवद्गीता")}</span><span>{selected.reference.replace("Bhagavad Gita ", "")}</span></div><span className="wisdom-feature-script">{selected.steps.find(s => s.kind === "verse")?.script?.split("\n")[0]}</span></div><div className="wisdom-feature-content"><span className="wisdom-overline">{t("TODAY’S READ · FROM 3 SAMPLE LESSONS", "आज का पाठ · 3 नमूना पाठों में से")}</span><h2>{selected.title[language]}</h2><p>{selected.subtitle[language]}</p><span className="wisdom-feature-cta">{t("Read this shloka", "यह श्लोक पढ़ें")} <span aria-hidden="true">↗</span></span></div></Link>
    <JourneyTeaser language={language} completed={Object.keys(state.finished || {}).length}/>
    <section className="wisdom-browse"><div className="wisdom-section-head"><div><span className="wisdom-overline">{t("START WHERE LIFE IS", "यहीं से शुरुआत करें")}</span><h2>{language === "hi" ? "अभी आपके मन में क्या है?" : "What’s on your mind?"}</h2></div><Link to="/alpha/library">{t("All lessons", "सभी पाठ")} →</Link></div><div className="wisdom-topic-grid">{feature.map((item,i) => { const lesson = lessons.find(l => l.id === item.id)!; return <Link to={`/alpha/wisdom/${item.id}`} className="wisdom-topic" key={item.id}><LessonArt theme={item.color} small/><span className="wisdom-topic-copy"><small>{String(i+1).padStart(2,"0")} · {lesson.reference}</small><strong>{language === "hi" ? item.hi : item.label}</strong><span>{lesson.title[language]} <b aria-hidden="true">↗</b></span></span></Link>; })}</div></section>
    <section className="wisdom-community"><div><span className="wisdom-overline">{t("PRACTISE TOGETHER", "साथ में अभ्यास")}</span><h2>{t("A familiar thread,", "एक परिचित साथ,")}<br/><em>{t("between gatherings.", "मुलाक़ातों के बीच भी।")}</em></h2><p>{t("Have an invitation from a teacher or community? Your shared program lives here. Private reflections stay yours.", "शिक्षक या समुदाय से निमंत्रण मिला है? आपका साझा कार्यक्रम यहाँ है। निजी विचार सिर्फ़ आपके हैं।")}</p><Link to="/alpha/program">{t("Open my community space", "मेरा समुदाय देखें")} →</Link></div><span className="wisdom-community-glyph" aria-hidden="true">✧</span></section>
    <p className="wisdom-footnote">{t("These three Gita samples have source-linked Sanskrit and original, unreviewed explanations. No verse audio or AI teacher is claimed.", "इन तीन गीता पाठों में स्रोत से जुड़ा संस्कृत पाठ और मौलिक, अभी समीक्षा-रहित व्याख्या है। श्लोक का ऑडियो या AI शिक्षक उपलब्ध नहीं है।")}</p>
  </div>;
}
export function WisdomLibrary() {
  const {state,error,update}=useWisdom();
  const [query,setQuery]=useState("");
  const language=state.language;
  const matches=useMemo(()=>lessons.filter(l => `${l.reference} ${l.title.en} ${l.title.hi} ${l.theme.en} ${l.theme.hi}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),[query]);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-library" lang={language}><header className="wisdom-library-head"><span className="wisdom-overline">{t("THE LIBRARY · CURRENTLY 3 LESSONS", "पाठशाला · अभी 3 पाठ")}</span><h1>{t("Begin with", "शुरू करें")}<br/><em>{t("what matters now.", "जो अभी ज़रूरी है।")}</em></h1><p>{t("Browse the available Gita readings. Ramayana and the Vedas need reviewed text, source and rights work before they can be offered here.", "अभी उपलब्ध गीता के पाठ पढ़ें। रामायण और वेद जोड़ने से पहले पाठ, स्रोत और अधिकारों की समीक्षा ज़रूरी है।")}</p><Lang language={language} change={l=>update(s=>({...s,language:l}))}/></header><Disclose error={error}/><JourneyTeaser language={language} completed={Object.keys(state.finished || {}).length}/><label className="wisdom-search">{t("Find a lesson or reference", "पाठ या श्लोक संख्या खोजें")}<input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t("Try balance, attention, or 2.47", "संतुलन, ध्यान या 2.47 लिखें")} type="search"/></label><div className="wisdom-library-list">{matches.map(l=>{const info=feature.find(f=>f.id===l.id)!;return <Link to={`/alpha/wisdom/${l.id}`} className="wisdom-library-item" key={l.id}><LessonArt theme={info.color} small/><span><small>{l.reference} · {l.theme[language]}</small><strong>{l.title[language]}</strong><span>{l.subtitle[language]}</span></span><b aria-hidden="true">↗</b></Link>})}{matches.length===0&&<div className="alpha-panel"><h2>{t("Nothing in this small collection yet.", "इस छोटे संग्रह में यह पाठ नहीं मिला।")}</h2><p>{t("Try another word or clear the search.", "दूसरा शब्द लिखें या खोज मिटाएँ।")}</p><button className="alpha-secondary" onClick={()=>setQuery("")}> {t("Show all three lessons", "तीनों पाठ देखें")}</button></div>}</div></div>;
}
export function WisdomLesson() {
  const {id}=useParams();const navigate=useNavigate();const {state,error,update,timeZone}=useWisdom();
  const lesson=lessons.find(l=>l.id===id);
  const [part,setPart]=useState(0);
  const [showRoman,setShowRoman]=useState(false);
  const [notice,setNotice]=useState("");
  useEffect(()=>{setPart(0);setShowRoman(false);setNotice("")},[id]);
  if(!lesson)return <div className="alpha-panel"><h1>This lesson isn’t here.</h1><Link to="/alpha/library">Browse available lessons</Link></div>;
  const language=state.language;
  const verse=lesson.steps.find(s=>s.kind==="verse")!;
  const understand=lesson.steps.find(s=>s.kind==="understand")!;
  const apply=lesson.steps.find(s=>s.kind==="apply")!;
  const info=feature.find(f=>f.id===id)!;
  const keep=()=>{if(update(s=>({...s,kept:{...s.kept,[lesson.id]:{day:localDay(timeZone)}}})))navigate("/alpha/my-day");else setNotice(state.language === "hi" ? "आपका कदम सहेजा नहीं गया। आप पढ़ना जारी रख सकते हैं।" : "Your action was not saved. You can still keep reading.")};
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  return <div className="wisdom-lesson" lang={language}><div className="wisdom-lesson-head"><Link to="/alpha/library" className="wisdom-back">← {t("Library", "सभी पाठ")}</Link><Lang language={language} change={l=>update(s=>({...s,language:l}))}/></div><div className="wisdom-lesson-intro"><span className="wisdom-overline">{t("BHAGAVAD GITA", "भगवद्गीता")} · {lesson.reference.replace("Bhagavad Gita ", "")}</span><h1>{lesson.title[language]}</h1><p>{lesson.subtitle[language]}</p></div><div className="wisdom-stepper" role="group" aria-label={t("Reading stages", "पाठ के चरण")}>{[language==="hi"?"श्लोक":"Read",language==="hi"?"समझें":"Understand",language==="hi"?"अपनाएँ":"Live it"].map((name,index)=><button type="button" aria-pressed={part===index} className={part===index?"active":""} key={name} onClick={()=>setPart(index)}><span>{String(index+1).padStart(2,"0")}</span>{name}</button>)}</div>
    <div key={`${lesson.id}-${part}`} className="wisdom-stage">
      {part===0&&<><div className="wisdom-verse-art"><LessonArt theme={info.color}/><span>{lesson.reference}</span></div><div className="wisdom-verse-body"><span className="wisdom-overline">{t("THE ORIGINAL VERSE", "मूल श्लोक")}</span><h2 lang="sa-Deva">{verse.script}</h2><button className="wisdom-reveal" aria-expanded={showRoman} onClick={()=>setShowRoman(!showRoman)}>{showRoman?t("Hide pronunciation guide", "उच्चारण सहायता छिपाएँ"):t("Show pronunciation guide", "उच्चारण सहायता दिखाएँ")} <span aria-hidden="true">{showRoman?"−":"+"}</span></button>{showRoman&&<p className="wisdom-transliteration">{verse.transliteration}</p>}<p>{verse.body[language]}</p></div></>}
      {part===1&&<div className="wisdom-meaning"><span className="wisdom-overline">{t("MEANING · ORIGINAL DEMO INTERPRETATION", "अर्थ · मौलिक नमूना व्याख्या")}</span><h2>{understand.title[language]}</h2><p>{understand.body[language]}</p><details><summary>{t("Where does this come from?", "इसका स्रोत क्या है?")}</summary><p>{lesson.sourceNote[language]}</p><a href={lesson.sourceUrl} target="_blank" rel="noopener noreferrer"> {t("View source Sanskrit", "मूल संस्कृत स्रोत देखें")} ↗</a></details></div>}
      {part===2&&<div className="wisdom-apply"><span className="wisdom-overline">{t("ONE SMALL STEP", "एक छोटा कदम")}</span><h2>{apply.title[language]}</h2><p>{apply.body[language]}</p><div className="wisdom-action-note"><span>✦</span><strong>{lesson.action[language]}</strong></div><p className="wisdom-fine">{t("Keeping an idea is optional and stored only in this browser. This is a personal practice prompt, not a measure of spiritual progress.", "किसी विचार को सहेजना वैकल्पिक है और वह इसी ब्राउज़र में रहता है। यह निजी अभ्यास है, आध्यात्मिक प्रगति का पैमाना नहीं।")}</p></div>}
    </div><Disclose error={error}/><p role="status" className="wisdom-fine">{notice}</p><div className="wisdom-lesson-actions">{part>0&&<button className="alpha-secondary" onClick={()=>setPart(part-1)}>← {t("Back", "वापस")}</button>}{part<2?<button className="wisdom-primary" onClick={()=>setPart(part+1)}>{part===0?t("Understand the verse", "श्लोक समझें"):t("Take it into my day", "आज के दिन में अपनाएँ")} <span aria-hidden="true">→</span></button>:<button className="wisdom-primary" onClick={keep}>{t("Keep this small step", "यह छोटा कदम सहेजें")} <span aria-hidden="true">→</span></button>}</div><div className="wisdom-alternative"><Link to="/alpha/library"> {t("Explore another reading", "दूसरा पाठ देखें")}</Link><Link to="/alpha/reflection/general"> {t("Write a private note", "निजी नोट लिखें")}</Link></div></div>;
}
export function WisdomMyDay() {
  const { state, error, update, timeZone } = useWisdom();
  const [cueNotice, setCueNotice] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const language = state.language;
  const kept = Object.entries(state.kept).reverse().sort((a, b) => b[1].day.localeCompare(a[1].day) || Number(Boolean(a[1].triedAt)) - Number(Boolean(b[1].triedAt)));
  const today = localDay(timeZone);
  const t = (en: string, hi: string) => language === "hi" ? hi : en;
  const remove = (id: string) => {
    if (update(latest => {
      const next = { ...latest.kept };
      delete next[id];
      return { ...latest, kept: next };
    })) setRemoving(null);
  };
  return <div className="wisdom-my-day" lang={language}>
    <span className="wisdom-overline">{t("YOUR PRACTICE · ON THIS DEVICE", "आपका अभ्यास · इस डिवाइस पर")}</span>
    <h1>{t("A little wisdom,", "थोड़ी सीख,")}<br/><em>{t("carried forward.", "दिन भर साथ।")}</em></h1>
    <p>{t("Come back when the day has happened. There is no streak to protect and no missed-day debt.", "दिन बीतने पर फिर आएँ। यहाँ लगातार दिनों की गिनती या छूटे दिन का दबाव नहीं है।")}</p>
    <Disclose error={error}/><p className="practice-feedback" role="status">{cueNotice}</p>
    {kept.length === 0 ? <div className="alpha-panel"><h2>{t("Choose one small idea first.", "पहले एक छोटा विचार चुनें।")}</h2><p>{t("Read a shloka and keep an action that feels possible today.", "एक श्लोक पढ़ें और आज संभव लगे ऐसा एक कदम चुनें।")}</p><Link to="/alpha/today" className="wisdom-primary">{t("Explore today", "आज का पाठ")} →</Link></div> : <div className="wisdom-kept-list">{kept.map(([id, entry]) => {
      const lesson = lessons.find(item => item.id === id)!;
      return <article key={id} className="wisdom-kept"><small>{lesson.reference} · {entry.day === today ? t("TODAY", "आज") : entry.day}</small><h2>{lesson.title[language]}</h2><p>{lesson.action[language]}</p>
        <div className="practice-cue"><label htmlFor={`cue-${id}`}>{t("Make space for this", "इसके लिए एक पल चुनें")}</label><select id={`cue-${id}`} value={entry.cue || ""} onChange={e => { if (update(latest => setPracticeCue(latest, id, (e.target.value || undefined) as PracticeCue | undefined))) setCueNotice(t("Your cue is saved on this device.", "आपका संकेत इस डिवाइस पर सहेजा गया।")); }}><option value="">{t("Whenever it fits", "जब सुविधाजनक हो")}</option><option value="after-breakfast">{t("After breakfast", "नाश्ते के बाद")}</option><option value="before-work">{t("Before work or study", "काम या पढ़ाई से पहले")}</option><option value="evening">{t("During my evening pause", "शाम के विराम में")}</option></select><small>{t("A cue you choose, not a scheduled notification.", "आपका चुना संकेत, तय समय की सूचना नहीं।")}</small></div>
        {entry.triedAt ? <div className="practice-tried-row"><div className="wisdom-tried">✓ {t("You marked this as tried. That is enough.", "आपने इसे आज़माया। इतना काफ़ी है।")}</div><button className="practice-undo" onClick={() => { if (update(latest => markPracticeTried(latest, id))) setCueNotice(t("Check-in undone. Your idea is still saved.", "चिन्ह हटा दिया। आपका विचार सहेजा हुआ है।")); }}>{t("Undo", "वापस लें")}</button></div> : <div className="wisdom-kept-actions"><button className="alpha-secondary" onClick={() => update(latest => markPracticeTried(latest, id, new Date().toISOString()))}>{t("I tried this", "मैंने इसे आज़माया")}</button><span>{t("Not yet is fine, too.", "अभी नहीं भी ठीक है।")}</span></div>}
        <div className="wisdom-kept-links"><Link to={`/alpha/wisdom/${id}`}>{t("Read again", "फिर पढ़ें")} →</Link><Link to={`/alpha/reflection/${id}`}>{t("Private note", "निजी नोट")} →</Link><button type="button" onClick={() => setRemoving(id)}>{t("Remove this idea", "यह विचार हटाएँ")}</button></div>
        {removing === id && <div className="wisdom-remove-confirm"><p>{t("Remove this saved action from this device? The reading itself remains available.", "इस सहेजे हुए कदम को डिवाइस से हटाएँ? पाठ उपलब्ध रहेगा।")}</p><div><button type="button" className="alpha-secondary" onClick={() => setRemoving(null)}>{t("Keep it", "रहने दें")}</button><button type="button" className="alpha-danger" onClick={() => remove(id)}>{t("Remove action", "कदम हटाएँ")}</button></div></div>}
      </article>;
    })}</div>}
    <p className="wisdom-footnote">{t("This record stays in this browser profile and is unencrypted. It is not shared with a community or teacher.", "यह जानकारी इसी ब्राउज़र में बिना एन्क्रिप्शन रहती है। यह समुदाय या शिक्षक से साझा नहीं होती।")}</p>
  </div>;
}

```

### `web/src/alpha/experience.css`

```css
/* Member experience. Scoped away from the teacher delivery workspace. */
.alpha[data-cinematic=true]{--a-bg:#151210;--a-paper:#211c19;--a-ink:#f5ecdd;--a-muted:#b8aa99;--a-line:#3c322a;--a-green:#efae50;--a-sage:#30271e;--a-gold:#efae50;background:#151210;color:#f5ecdd;--w-ink:#f5ecdd;--w-muted:#b8aa99;--w-cream:#211c19;color-scheme:dark}
.alpha[data-cinematic=true] .alpha-demo-banner{background:#201a14;color:#c7ac85;font-size:10px;letter-spacing:.13em;padding:5px 15px}
.alpha[data-cinematic=true] .alpha-header{max-width:1060px;border:0;padding:18px 28px 10px}
.alpha[data-cinematic=true] .brand{color:#edb766;font-size:22px}.alpha[data-cinematic=true] .brand-mark{background:none;color:#edb766;border:1px solid #72502c;border-radius:50%}.alpha[data-cinematic=true] .brand-tag{color:#b9a58d;font-size:9px;letter-spacing:.14em}
.alpha[data-cinematic=true] .alpha-profile{color:#cbbba6!important;font-size:12px;gap:7px}
.alpha[data-cinematic=true] .alpha-main{max-width:1060px;padding:24px 28px 30px;outline:none}.alpha-notice:empty{display:none}
.alpha[data-cinematic=true] .alpha-footer{max-width:1004px;color:#b8aa99;border-color:#3c322a;font-size:12px}
.alpha[data-cinematic=true] .alpha-nav{width:min(100%,620px);left:50%;right:auto;transform:translateX(-50%);background:#211b17f5;border:1px solid #493728;border-bottom:0;backdrop-filter:blur(20px);border-radius:22px 22px 0 0;padding:9px 10px calc(9px + env(safe-area-inset-bottom));box-shadow:0 -12px 38px #0003;gap:4px;display:grid;grid-template-columns:repeat(4,1fr)}
.alpha[data-cinematic=true] .alpha-nav a{display:flex;flex-direction:column;gap:4px;align-items:center;justify-content:center;min-height:55px;padding:7px 4px;border-radius:12px;font-size:11px;color:#bcae9d;background:none;position:relative;transition:color .2s,background .2s}
.alpha[data-cinematic=true] .alpha-nav a.active{color:#f7bb63;background:#efae5010}.alpha[data-cinematic=true] .alpha-nav a.active:before{content:"";position:absolute;top:-10px;width:26px;height:2px;background:#f1b458;border-radius:3px}.alpha[data-cinematic=true] .alpha-nav a:active{transform:scale(.95)}
.experience{display:grid;gap:24px;animation:experience-enter .35s ease both}.experience-greeting{display:flex;align-items:center;justify-content:space-between;gap:15px}.experience-eyebrow{display:block;color:#c59c68;font-size:10px;font-weight:700;letter-spacing:.17em;line-height:1.6}.alpha .experience-greeting h1{font-size:clamp(30px,4.2vw,49px);margin-top:6px;line-height:1.25;letter-spacing:-.035em}.experience-language{display:flex;align-items:center;gap:8px;min-width:64px;min-height:46px;padding:9px 12px;background:#30251b;border:1px solid #69492c;border-radius:24px;color:#f1c17e;font-weight:650;font-size:14px}.experience-language span{opacity:.65}.experience-section-label{display:flex;justify-content:space-between;gap:8px;font-size:9px;letter-spacing:.13em;color:#c8ab82;margin-bottom:-12px}
.experience-hero{display:grid;position:relative;min-height:510px;overflow:hidden;border-radius:24px;isolation:isolate;background:#413123;text-decoration:none}.experience-hero>img{position:absolute;width:100%;height:100%;object-fit:cover;object-position:50% 55%;z-index:-2;animation:experience-art .9s cubic-bezier(.2,.7,.2,1) both}.experience-hero-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(0deg,#17110efc 1%,#21170fd9 24%,#20161014 68%,#19140d45)}.experience-hero-top{display:flex;justify-content:space-between;align-items:center;padding:24px;align-self:start;color:#fff1d7;font-size:10px;letter-spacing:.15em}.experience-hero-copy{align-self:end;display:grid;gap:12px;padding:32px;max-width:600px}.experience-hero-copy>small{color:#f2bf79;font-size:10px;letter-spacing:.13em;font-weight:700}.alpha .experience-hero h2{font-size:clamp(35px,5.4vw,61px);color:#fff4e1;line-height:1.1;text-wrap:balance}.experience-hero-action{display:flex;align-items:center;gap:13px;margin-top:9px;font-weight:650;font-size:15px}.experience-hero-action small{display:block;font-size:11px;color:#cbbba8;font-weight:400;margin-top:2px}.experience-round{display:grid;place-items:center;width:49px;height:49px;border-radius:50%;background:#efae50;color:#24170a;flex:none;transition:transform .2s}.experience-hero:hover .experience-round{transform:translateX(4px)}
.experience-resume{display:flex;align-items:center;gap:14px;padding:19px 21px;border:1px solid #4b3a2a;border-radius:18px;background:#261e18;text-decoration:none}.experience-resume-icon{color:#eab15d;flex:none}.experience-resume>span:nth-child(2){flex:1}.experience-resume strong{display:block;font-size:15px;line-height:1.4}.experience-resume small{display:block;font-size:12px;color:#bda98e;margin-top:3px}.experience-resume>svg{color:#d5a361;flex:none}
.experience-section-head{display:flex;align-items:center;justify-content:space-between;margin:5px 0 18px;gap:12px}.alpha .experience-section-head h2{font-size:29px;margin-top:5px;line-height:1.3}.experience-section-head>a{display:grid;place-items:center;min-width:44px;min-height:44px;color:#efb966}.experience-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}.experience-card{min-height:260px;position:relative;display:flex;align-items:end;isolation:isolate;overflow:hidden;border-radius:18px;text-decoration:none;background:#3f382b;transition:transform .22s ease,box-shadow .22s ease}.experience-card>img{position:absolute;inset:0;height:100%;width:100%;object-fit:cover;z-index:-2;transition:transform .5s ease}.experience-card:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,#15120afa,#1c1b1694 38%,#0000 80%);z-index:-1}.experience-card-1>img{object-position:20% center}.experience-card-2>img{object-position:90% center;filter:hue-rotate(24deg) saturate(.6)}.experience-card:hover{transform:translateY(-3px);box-shadow:0 12px 28px #0004}.experience-card:hover>img{transform:scale(1.04)}.experience-card>span{display:grid;gap:9px;width:100%;padding:21px}.experience-card small{color:#f0c58b;font-size:10px;letter-spacing:.13em;text-transform:uppercase}.experience-card strong{font:450 27px/1.2 Fraunces,Georgia,serif;color:#fff4e2}.experience-card>span>span{display:flex;justify-content:space-between;align-items:center;gap:10px;color:#c8b79e;font-size:11px}.experience-card svg{color:#f2b559}
.experience-collection{display:flex;align-items:center;gap:18px;padding:15px;border:1px solid #483624;border-radius:20px;background:#231c16;text-decoration:none}.experience-collection>img{width:85px;height:114px;object-fit:cover;border-radius:12px;object-position:center 65%}.experience-collection>span{flex:1;display:grid;gap:7px}.experience-collection small{font-size:9px;letter-spacing:.11em;color:#dbb77f}.experience-collection strong{font:450 26px/1.2 Fraunces,Georgia,serif}.experience-collection span>span{font-size:11px;color:#beac94}.experience-meter{display:block;height:3px;background:#4e3c29;border-radius:4px;overflow:hidden;margin-top:3px}.experience-meter i{height:100%;display:block;background:#edb361;transition:width .4s ease}.experience-collection>svg{color:#d9a15a;flex:none}.experience-disclosure{font-size:12px;line-height:1.7;color:#aa9984;max-width:65ch}.experience-intro{color:#b8aa99;max-width:50ch;margin-top:-10px!important}.experience-search{display:flex;align-items:center;gap:12px;border:1px solid #4b3b2d;background:#241e18;border-radius:15px;padding:0 16px;color:#c9b18f}.experience-search input{width:100%;min-height:52px;background:none;border:0;outline-offset:0;color:#f6ecdc;font-size:14px}.experience-search input::placeholder{color:#b3a38f}.experience-filters{display:flex;gap:8px;flex-wrap:wrap;margin-top:-8px}.experience-filters button{min-height:44px;border:1px solid #45372a;border-radius:24px;background:#251e18;color:#c7b8a4;padding:9px 19px;font-size:13px}.experience-filters button[aria-pressed=true]{background:#efae50;border-color:#efae50;color:#27190c;font-weight:700}.experience-empty{display:grid;justify-items:start;gap:15px;padding:25px;border:1px dashed #6f5337;border-radius:20px;color:#c8b699}
/* Shared member forms and the existing private practice path. */
.alpha[data-cinematic=true] :is(.wisdom-my-day,.wisdom-lesson,.wisdom-welcome){--w-ink:#f4e9d9;--w-muted:#c1b09b;color:var(--w-ink)}
.alpha[data-cinematic=true] :is(.alpha-panel,.wisdom-kept,.wisdom-stage,.wisdom-remove-confirm){background:#241d18;border-color:#4d3c2c;color:#f0e5d5}.alpha[data-cinematic=true] :is(.alpha-field input,.alpha-field select,.alpha-field textarea){background:#1a1612;color:#f3e8d8;border-color:#69523a}.alpha[data-cinematic=true] :is(.alpha-secondary,.wisdom-language,.wisdom-stepper){background:#30251c;border-color:#654c33;color:#e4c49a}.alpha[data-cinematic=true] :is(.alpha-button,.wisdom-primary){background:#efae50;color:#25190e!important;box-shadow:none}.alpha[data-cinematic=true] :is(.wisdom-overline,.alpha-kicker){color:#dbb37b}.alpha[data-cinematic=true] :is(h1 em,.wisdom-my-day h1 em){color:#e4bd84}.alpha[data-cinematic=true] :is(.wisdom-kept small,.wisdom-kept-actions span,.wisdom-kept-links button,.wisdom-fine,.wisdom-tried){color:#c8b59a!important}.alpha[data-cinematic=true] .wisdom-kept-links :is(a,button){min-height:44px;display:inline-flex;align-items:center}.alpha[data-cinematic=true] .wisdom-language button{color:#c6b6a0}.alpha[data-cinematic=true] .wisdom-language button[aria-pressed=true],.alpha[data-cinematic=true] .wisdom-stepper button.active{background:#efae50;color:#22160d}.alpha[data-cinematic=true] :is(.wisdom-verse-body h2,.wisdom-verse-body>p,.wisdom-meaning>p,.wisdom-apply>p,.wisdom-reveal){color:#e6d8c4}.alpha[data-cinematic=true] .wisdom-action-note{background:#3b2d1e;color:#f4d5a4}
/* Series belongs to the same visual world; no cream wrapper. */
.alpha[data-cinematic=true] .story-series{color:#f4e9d9}.alpha[data-cinematic=true] .story-series-top{margin:0 0 14px}.alpha[data-cinematic=true] .story-language{background:#2b221b;border-color:#59412b}.alpha[data-cinematic=true] .story-language button{color:#d7c7b1}.alpha[data-cinematic=true] .story-language button[aria-pressed=true]{background:#efae50;color:#25180c}.alpha[data-cinematic=true] .story-series-cover{min-height:570px;border-radius:22px}.alpha[data-cinematic=true] .story-series-cover>img{object-position:center 53%}.alpha[data-cinematic=true] .story-series-copy{padding:35px;gap:16px;max-width:640px}.alpha[data-cinematic=true] .story-series-cover h1{font-size:clamp(40px,6vw,66px)}.alpha[data-cinematic=true] .story-series-progress{background:#241d18;border-color:#4b3827;margin:16px 0 28px;padding:16px 20px}.alpha[data-cinematic=true] .story-series-progress strong{color:#efb15b}.alpha[data-cinematic=true] .story-series-progress :is(span,p){color:#c5b39c}.alpha[data-cinematic=true] .story-section-head h2{color:#f4e7d3;font-size:30px}.alpha[data-cinematic=true] .story-episode{background:#251e1a;border-color:#433329}.alpha[data-cinematic=true] .story-episode:hover{border-color:#b3844b}.alpha[data-cinematic=true] .story-episode-text strong{color:#f1e3cf;font-size:24px}.alpha[data-cinematic=true] .story-episode-text :is(small,span){color:#c6b197}.alpha[data-cinematic=true] .story-episode-end{color:#edba76}.alpha[data-cinematic=true] .story-disclosure{color:#b6a38d}.alpha[data-cinematic=true] .story-series-copy p{font-size:16px;max-width:40ch;color:#d7c6ae}
.alpha[data-cinematic=true] .alpha-main>div:not([role]){animation:experience-enter .3s ease both}.alpha[data-cinematic=true] :is(a,button){-webkit-tap-highlight-color:transparent}.alpha[data-cinematic=true] :is(a,button):active{scale:.985}.alpha[data-cinematic=true] :focus-visible{outline:2px solid #ffd18b;outline-offset:4px}.alpha[data-cinematic=true] .alpha-main:focus{outline:none}
@keyframes experience-enter{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}@keyframes experience-art{from{transform:scale(1.035);filter:brightness(.8)}to{transform:scale(1);filter:brightness(1)}}
@media(min-width:800px){.experience-hero{min-height:530px}.experience-hero>img{object-position:center 61%}.experience-hero-shade{background:linear-gradient(90deg,#19120fe8,#21170f50 55%,#0000),linear-gradient(0deg,#18120fee,transparent 70%)}.experience-grid{gap:20px}.experience-card{min-height:320px}}
@media(max-width:600px){.alpha[data-cinematic=true] .alpha-header{padding:14px 21px 3px}.alpha[data-cinematic=true] .alpha-main{padding:20px 21px 24px}.alpha[data-cinematic=true] .brand-tag{display:none}.alpha[data-cinematic=true] .brand{font-size:19px}.alpha[data-cinematic=true] .alpha-header .brand-mark{width:32px;height:32px}.experience{gap:23px}.alpha .experience-greeting h1{font-size:31px}.experience-eyebrow{font-size:9px}.experience-hero{min-height:415px;border-radius:22px}.experience-hero>img{object-position:center 51%}.experience-hero-copy{padding:23px;gap:10px}.alpha .experience-hero h2{font-size:38px}.experience-hero-top{padding:21px;font-size:9px}.experience-section-label{font-size:8px}.experience-resume{padding:16px 14px;gap:11px}.experience-resume strong{font-size:14px}.experience-resume small{font-size:11px}.experience-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.experience-card{min-height:232px}.experience-card>span{padding:16px 13px;gap:8px}.experience-card strong{font-size:23px}.experience-card:last-child:nth-child(odd){grid-column:1/-1;min-height:190px}.experience-card:last-child:nth-child(odd)>span{max-width:65%;padding:20px}.experience-card:last-child:nth-child(odd)>img{object-position:center 60%}.alpha .experience-section-head h2{font-size:27px}.experience-collection{gap:12px;padding:12px}.experience-collection strong{font-size:24px}.experience-collection>img{width:67px;height:106px}.experience-filters{gap:7px}.experience-filters button{padding:8px 13px;font-size:12px}.alpha[data-cinematic=true] .story-series-cover{min-height:530px;margin:0 -21px;border-radius:0}.alpha[data-cinematic=true] .story-series-cover:after{background:linear-gradient(0deg,#151210 0%,#151210b5 38%,transparent 82%)}.alpha[data-cinematic=true] .story-series-copy{padding:30px 24px 18px;gap:13px}.alpha[data-cinematic=true] .story-series-cover h1{font-size:43px}.alpha[data-cinematic=true] .story-series-progress{margin-top:8px;gap:6px}.alpha[data-cinematic=true] .story-episode-text strong{font-size:20px}.alpha[data-cinematic=true] .story-episode-text>span{display:none}.alpha[data-cinematic=true] .story-episode{min-height:100px}.alpha[data-cinematic=true] .wisdom-my-day h1{font-size:39px}.alpha[data-cinematic=true] .wisdom-my-day>p{font-size:15px}}
@media(max-width:350px){.alpha[data-cinematic=true] .alpha-main{padding-left:16px;padding-right:16px}.alpha .experience-greeting h1{font-size:27px}.experience-language{min-width:54px;padding:8px}.experience-hero{min-height:390px}.alpha .experience-hero h2{font-size:33px}.experience-card strong{font-size:21px}.experience-card>span{padding:12px}.alpha[data-cinematic=true] .story-series-cover{margin-left:-16px;margin-right:-16px}}
.alpha[data-cinematic=true][data-large=true] .experience :is(p,.experience-intro,.experience-resume strong){font-size:19px}.alpha[data-cinematic=true][data-reduced=true] *, .alpha[data-cinematic=true][data-reduced=true] *:before{animation:none!important;transition:none!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){.alpha[data-cinematic=true] *,.alpha[data-cinematic=true] *:before{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
.experience-profile{max-width:760px;margin:auto}.experience-profile header h1{margin:10px 0!important;font-size:clamp(38px,6vw,58px)}.experience-profile header p{color:#bca98f;max-width:45ch}.experience-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px}.experience-stats>a{display:grid;gap:14px;padding:23px;border:1px solid #4a3827;border-radius:20px;text-decoration:none;background:#251d17}.experience-stats svg{color:#ca9e60}.experience-stats strong{font:450 46px/1 Fraunces,Georgia,serif;color:#f0b86a}.experience-stats strong small{font:400 18px/1 sans-serif;color:#ad9678;margin-left:7px}.experience-stats span{font-size:13px;color:#d4c1a7}.alpha .experience-profile-section h2{font-family:inherit;font-size:16px;letter-spacing:0;margin:8px 0 24px}.experience-profile-section .experience-filters button{flex:1;max-width:180px;border-radius:13px;min-height:52px;font-size:16px}.experience-menu{border-top:1px solid #463322}.experience-menu>a{display:flex;align-items:center;gap:16px;min-height:88px;border-bottom:1px solid #463322;text-decoration:none;padding:16px 3px}.experience-menu>a>svg{color:#c89d62;flex:none}.experience-menu>a>span{flex:1;display:grid;gap:4px}.experience-menu strong{font-size:15px;font-weight:600}.experience-menu small{font-size:12px;color:#baa58a}.alpha[data-cinematic=true] .alpha-check-field{background:#282018;border-color:#54402b;color:#f0dfc7}.alpha[data-cinematic=true] .alpha-disclosure{background:#231c16;border-color:#59412a;color:#d1bda2}.alpha[data-cinematic=true] .alpha-text-button{color:#e4b879}
.experience-filters button{min-width:44px}
.experience-positioning{align-items:flex-start}.alpha .experience-positioning h1{max-width:19ch;font-size:clamp(36px,5.5vw,64px);line-height:1.09;text-wrap:balance;animation:experience-enter .25s ease both}.experience-positioning .experience-language{margin-top:24px}.experience-positioning-support{display:grid;justify-items:start;gap:20px;margin-top:-7px;max-width:66ch}.experience-positioning-support p{color:#cbbba7;font-size:16px;line-height:1.7}.copy-preview{padding:16px 18px;border:1px solid #725132;background:#2c2118;border-radius:16px;font-size:13px}.copy-preview summary{min-height:44px;cursor:pointer;color:#f1bf78;font-weight:650}.copy-preview label{display:block;margin:4px 0 8px;color:#d2baa0}.copy-preview select{width:100%;min-height:48px;background:#17130f;border:1px solid #87613b;border-radius:9px;color:#f3e3cd;padding:10px;font-size:14px}.copy-preview>div{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px;margin-top:12px;color:#c9b291}.copy-preview a{display:inline-flex;align-items:center;min-height:44px;color:#f3be76;font-weight:650}.alpha[data-cinematic=true] .experience-positioning-support .wisdom-primary{min-height:50px;padding:12px 18px;font-size:14px}@media(max-width:600px){.alpha .experience-positioning h1{font-size:36px;max-width:14ch}.experience-positioning-support p{font-size:14px;line-height:1.65}.experience-positioning .experience-language{margin-top:20px}.copy-preview{padding:12px}.copy-preview select{font-size:12px}}@media(max-width:350px){.alpha .experience-positioning h1{font-size:31px}}
.experience-reading-return{border:1px solid #83633b;border-radius:18px;background:#30251b;overflow:hidden}.experience-reading-return>a{display:flex;align-items:center;gap:14px;padding:18px;text-decoration:none}.experience-reading-return>a>span:nth-child(2){display:grid;gap:3px;flex:1}.experience-reading-return small{font-size:10px;letter-spacing:.13em;color:#e9b971}.experience-reading-return strong{font-size:18px;color:#f4e4cc}.experience-reading-return span>span{font-size:12px;color:#c9b699}.experience-reading-return>button{min-height:44px;width:100%;padding:9px 18px;border:0;border-top:1px solid #70532f;background:transparent;color:#d3b78e;text-align:left;font-size:12px}.practice-cue{display:grid;gap:9px;padding:17px 0;border-top:1px solid #56402b;border-bottom:1px solid #56402b}.practice-cue label{font-size:14px;font-weight:650;color:#edc995}.practice-cue select{width:100%;min-height:50px;border:1px solid #80603c;background:#17130f;color:#f6e9d4;border-radius:10px;padding:10px 12px;font-size:15px}.practice-cue small{letter-spacing:0!important;font-size:12px!important}.practice-tried-row{display:flex;align-items:center;gap:10px}.practice-tried-row>div{flex:1}.practice-undo{min-width:48px;min-height:44px;border:0;background:transparent;color:#f0c58b;font-size:14px;text-decoration:underline}.practice-feedback:empty{display:none}.practice-feedback{color:#e8c593!important;font-size:14px!important}.practice-tried-row .wisdom-tried{animation:experience-enter .25s ease both}

```

### `tests/wisdom-state.test.ts`

```typescript
import test from "node:test";
import assert from "node:assert/strict";
import { parseWisdom, freshWisdom, moveReading, finishReading, setPracticeCue, markPracticeTried, readingHref, mutateWisdomStorage } from "../web/src/alpha/wisdomState.ts";
const ids = ["gita-2-47", "gita-2-48", "gita-6-26"];
const now = "2026-09-25T10:00:00.000Z";
const roundtrip = value => parseWisdom(JSON.stringify(value), ids);
test("existing v1 reading records retain language, saved action and history", () => {
  const existing = { schema: 1, language: "hi", kept: { [ids[0]]: { day: "2026-09-25", triedAt: now } }, finished: { [ids[0]]: now } };
  assert.deepEqual(roundtrip(existing), existing);
  assert.deepEqual(parseWisdom(null, ids), freshWisdom());
});
test("interrupted reading resumes exact stage without inventing completion", () => {
  const state = roundtrip(moveReading(freshWisdom(), ids[1], 2, now));
  assert.equal(readingHref(ids[1], state.resume), "/alpha/episode/gita-2-48?scene=2");
  assert.equal(readingHref(ids[0], state.resume), "/alpha/episode/gita-2-47");
  assert.equal(state.finished, undefined);
});
test("completion clears only this reading's position and preserves saved practice", () => {
  const base = { ...moveReading(freshWisdom(), ids[0], 3, now), kept: { [ids[1]]: { day: "2026-09-25" } } };
  const done = roundtrip(finishReading(base, ids[0], now));
  assert.equal(done.resume, undefined);
  assert.equal(done.finished?.[ids[0]], now);
  assert.deepEqual(done.kept, base.kept);
  assert.deepEqual(finishReading(base, ids[1], now).resume, base.resume);
});
test("cue edit and check-in undo preserve original chosen action and other entries", () => {
  const base = { ...freshWisdom(), kept: { [ids[0]]: { day: "2026-09-25" }, [ids[1]]: { day: "2026-09-24", triedAt: now } } };
  const cued = roundtrip(setPracticeCue(base, ids[0], "after-breakfast"));
  const tried = roundtrip(markPracticeTried(cued, ids[0], now));
  const undo = roundtrip(markPracticeTried(tried, ids[0]));
  assert.deepEqual(undo, cued);
  assert.deepEqual(setPracticeCue(undo, ids[0]), base);
  assert.throws(() => setPracticeCue(base, ids[2], "evening"));
  assert.throws(() => markPracticeTried(base, ids[2], now));
});
test("corrupt or foreign resume data and impossible days fail closed", () => {
  for (const resume of [{lessonId:ids[0],scene:4,updatedAt:now},{lessonId:"foreign",scene:1,updatedAt:now},{lessonId:ids[0],scene:1.5,updatedAt:now},{lessonId:ids[0],scene:1,updatedAt:"bad"}]) assert.throws(() => roundtrip({...freshWisdom(),resume}));
  for (const day of ["2026-02-30", "today", "2026-13-01"]) assert.throws(() => roundtrip({...freshWisdom(),kept:{[ids[0]]:{day}}}));
  assert.throws(() => roundtrip({...freshWisdom(),kept:{[ids[0]]:{day:"2026-09-25",cue:"inferred-faith"}}}));
});
test("serializer allowlists fields rather than persisting accidental private text", () => {
  const saved = roundtrip({...freshWisdom(),reflection:"private",resume:{lessonId:ids[0],scene:2,updatedAt:now,profile:"private"},kept:{[ids[0]]:{day:"2026-09-25",note:"private"}}});
  assert.equal(JSON.stringify(saved).includes("private"),false);
});

test("storage updates reread latest fields and remain scoped to the actor key", () => {
  const records = new Map([["asha", JSON.stringify({...freshWisdom(),language:"hi"})], ["ravi", JSON.stringify(freshWisdom())]]);
  const storage = { getItem: key => records.get(key) || null, setItem: (key, value) => records.set(key, value) };
  mutateWisdomStorage(storage, "asha", ids, latest => moveReading(latest, ids[0], 1, now));
  assert.equal(parseWisdom(records.get("asha"),ids).language,"hi");
  assert.deepEqual(parseWisdom(records.get("ravi"),ids),freshWisdom());
});
test("corrupt storage is not overwritten and failed writes never return success", () => {
  let writes = 0;
  assert.throws(() => mutateWisdomStorage({getItem:()=>"{broken",setItem:()=>{writes++;}},"asha",ids,s=>s));
  assert.equal(writes,0);
  assert.throws(() => mutateWisdomStorage({getItem:()=>null,setItem:()=>{throw Error("Quota exceeded");}},"asha",ids,s=>moveReading(s,ids[0],1,now)));
});

```

## Appendix B — Existing SQL source, not applied or production-approved

Read the audit before using these files. Inherited comments, seed prices and future-operation descriptions are not evidence of implemented or approved behavior. This appendix does not close the documented authorization and transaction gaps.

### `supabase/migrations/0001_foundations.sql`

```sql
-- 0001_foundations.sql
-- Schemas, extensions, languages, organisations, profiles, memberships.
--
-- SECURITY MODEL (assertions P1-P3 of the build plan):
--   * Schema `app` holds all tenant data. NO base table is granted to anon/authenticated.
--   * Schema `ops` holds operator-only data and is NOT in the PostgREST exposed-schema list.
--   * All client access flows through SECURITY DEFINER functions with explicit EXECUTE grants
--     and a pinned search_path. A table added later is inaccessible by default rather than
--     accidentally public -- absence of a grant is the safe state.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create schema if not exists app;
create schema if not exists ops;

-- Revoke the ambient CREATE/USAGE that would otherwise let a role reach new objects.
revoke all on schema app from public;
revoke all on schema ops from public;
grant usage on schema app to authenticated, anon;   -- usage only; no table grants follow
-- `ops` deliberately gets no grant at all.

-- Default privileges: anything created later in `app` grants nothing to clients.
alter default privileges in schema app revoke all on tables from anon, authenticated;
alter default privileges in schema ops revoke all on tables from anon, authenticated;


-- ---------------------------------------------------------------------------
-- Languages. Multi-language is a day-1 schema fact, not a later migration.
-- `script` matters because the three-column player renders source text in its
-- own writing system; two languages can share a script (Hindi/Marathi = Devanagari).
-- ---------------------------------------------------------------------------
create table app.languages (
  code              text primary key,              -- BCP-47: 'hi', 'ta', 'sa', 'en-IN'
  english_name      text not null,
  endonym           text not null,                 -- the language's name in itself
  script            text not null,                 -- ISO 15924: 'Deva', 'Taml', 'Latn'
  direction         text not null default 'ltr' check (direction in ('ltr','rtl')),
  transliteration_scheme text,                     -- 'ISO15919', 'IAST', null for Latn
  is_active         boolean not null default false,-- a language goes live only when it has a reviewer
  created_at        timestamptz not null default now()
);

comment on column app.languages.is_active is
  'False until a named reviewer exists for this language. The publish gate in 0002 '
  'refuses to publish a variant in an inactive language, so adding a row here is safe.';

insert into app.languages (code, english_name, endonym, script, transliteration_scheme) values
  ('en',    'English',   'English',    'Latn', null),
  ('sa',    'Sanskrit',  'संस्कृतम्',      'Deva', 'ISO15919'),
  ('hi',    'Hindi',     'हिन्दी',         'Deva', 'ISO15919'),
  ('bn',    'Bengali',   'বাংলা',        'Beng', 'ISO15919'),
  ('ta',    'Tamil',     'தமிழ்',        'Taml', 'ISO15919'),
  ('te',    'Telugu',    'తెలుగు',       'Telu', 'ISO15919'),
  ('mr',    'Marathi',   'मराठी',        'Deva', 'ISO15919'),
  ('gu',    'Gujarati',  'ગુજરાતી',       'Gujr', 'ISO15919'),
  ('kn',    'Kannada',   'ಕನ್ನಡ',        'Knda', 'ISO15919'),
  ('ml',    'Malayalam', 'മലയാളം',      'Mlym', 'ISO15919'),
  ('pa',    'Punjabi',   'ਪੰਜਾਬੀ',        'Guru', 'ISO15919'),
  ('or',    'Odia',      'ଓଡ଼ିଆ',         'Orya', 'ISO15919'),
  ('as',    'Assamese',  'অসমীয়া',      'Beng', 'ISO15919'),
  ('ur',    'Urdu',      'اردو',         'Arab', 'ISO15919'),
  ('ne',    'Nepali',    'नेपाली',        'Deva', 'ISO15919'),
  ('si',    'Sinhala',   'සිංහල',        'Sinh', 'ISO15919'),
  ('sd',    'Sindhi',    'سنڌي',         'Arab', 'ISO15919'),
  ('ks',    'Kashmiri',  'کٲشُر',         'Arab', 'ISO15919'),
  ('kok',   'Konkani',   'कोंकणी',        'Deva', 'ISO15919'),
  ('mai',   'Maithili',  'मैथिली',        'Deva', 'ISO15919'),
  ('doi',   'Dogri',     'डोगरी',        'Deva', 'ISO15919'),
  ('sat',   'Santali',   'ᱥᱟᱱᱛᱟᱲᱤ',      'Olck', 'ISO15919'),
  ('mni',   'Manipuri',  'ꯃꯤꯇꯩꯂꯣꯟ',     'Mtei', 'ISO15919'),
  ('bho',   'Bhojpuri',  'भोजपुरी',       'Deva', 'ISO15919'),
  ('raj',   'Rajasthani','राजस्थानी',     'Deva', 'ISO15919'),
  ('tcy',   'Tulu',      'ತುಳು',         'Knda', 'ISO15919'),
  ('ar',    'Arabic',    'العربية',       'Arab', 'ISO15919');

update app.languages set direction = 'rtl' where script = 'Arab';
-- English is active on day 1 because meaning glosses are authored in it and it needs no
-- separate scholarly review to be trustworthy as a *gloss* language.
update app.languages set is_active = true where code = 'en';


-- ---------------------------------------------------------------------------
-- Reviewers. A real named human who vouches for a language variant.
-- Referenced NOT NULL by published content: the constraint is the product.
-- ---------------------------------------------------------------------------
create table app.reviewers (
  id                uuid primary key default gen_random_uuid(),
  full_name         text not null check (length(trim(full_name)) > 2),
  credentials       text not null,                 -- shown to users verbatim
  affiliation       text,
  auth_user_id      uuid unique,                   -- set when the reviewer has a login
  created_at        timestamptz not null default now()
);

-- Which languages a reviewer is competent to sign off. A Tamil scholar does not
-- silently become authoritative for Bengali because a column allowed it.
create table app.reviewer_languages (
  reviewer_id       uuid not null references app.reviewers(id) on delete cascade,
  language_code     text not null references app.languages(code),
  primary key (reviewer_id, language_code)
);


-- ---------------------------------------------------------------------------
-- Organisations (institutions/circles) and membership.
-- ---------------------------------------------------------------------------
create type app.org_kind as enum ('institution', 'household');

create table app.organizations (
  id                uuid primary key default gen_random_uuid(),
  kind              app.org_kind not null,
  display_name      text not null,
  country           text not null default 'IN',    -- ISO 3166-1 alpha-2
  primary_language  text not null references app.languages(code) default 'en',
  seat_cap          integer not null check (seat_cap between 1 and 500),
  created_at        timestamptz not null default now()
);

comment on column app.organizations.seat_cap is
  'Households cap at 5 (India 4); institutions at their contracted seat count. '
  'Enforced atomically at claim time by app.fn_claim_seat, not by application code.';

create type app.member_role as enum ('member', 'admin', 'teacher', 'reviewer');

create table app.memberships (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references app.organizations(id) on delete cascade,
  user_id           uuid not null,                 -- auth.users.id
  role              app.member_role not null default 'member',
  joined_at         timestamptz not null default now(),
  revoked_at        timestamptz,
  unique (org_id, user_id)
);

create index on app.memberships (user_id) where revoked_at is null;
create index on app.memberships (org_id) where revoked_at is null;


-- ---------------------------------------------------------------------------
-- Profiles. Deliberately thin.
--
-- `tradition` and `preferred_language` are Article 9 special-category data under
-- GDPR the moment they sit against an identifiable account. Both are NULLABLE:
-- the product must work for someone who declines to state either. See 0004 for
-- the consent gate that must exist before either is written.
-- ---------------------------------------------------------------------------
create table app.profiles (
  user_id             uuid primary key,
  display_name        text,
  preferred_language  text references app.languages(code),
  tradition           text,
  reminder_local_time time,                        -- nothing reads this until cron-reminders ships
  timezone            text not null default 'Asia/Kolkata',
  quiet_hours_start   time not null default '21:00',
  quiet_hours_end     time not null default '07:00',
  created_at          timestamptz not null default now()
);

comment on table app.profiles is
  'tradition and preferred_language are GDPR Article 9 data. They must never be '
  'copied into app.product_events, never sent to any analytics processor, and '
  'never inferred from behaviour. Both are optional by design.';


-- ---------------------------------------------------------------------------
-- Force RLS everywhere in `app`. FORCE applies the policy even to the table
-- owner, so a SECURITY DEFINER function cannot accidentally bypass it.
-- ---------------------------------------------------------------------------
do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'app'
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;

```

### `supabase/migrations/0002_content.sql`

```sql
-- 0002_content.sql
-- The script-first practice record. This file IS the product thesis in schema form.
--
-- THE CORE SHAPE
--   practice                 "Gayatri Mantra" -- the canonical thing
--   └ practice_version       one authored, versioned rendering in a SOURCE language (e.g. Sanskrit)
--     └ segment              one line: source text + transliteration + alignment timestamps
--       └ segment_gloss      that line's meaning, in ONE gloss language (en/hi/ta/bn/...)
--
-- Why the gloss is its own table: a Tamil speaker reciting a Sanskrit stotra needs
-- Sanskrit script + transliteration + TAMIL meaning. The source text never changes;
-- only the gloss language does. One expensive authoring pass (timestamps, translit)
-- serves every regional language by adding gloss rows. That is what makes
-- "all regional languages" affordable at this price instead of a per-language treadmill.
--
-- THE CONSTRAINT THAT IS THE PRODUCT
--   No version reaches state='published' without an in-term rights grant, a named
--   reviewer competent in the relevant language, and a source citation. Enforced by
--   trigger, not by policy document. It also makes per-user AI generation impossible
--   by construction -- generated text has no reviewer, so it cannot publish.

-- ---------------------------------------------------------------------------
-- Rights ledger. A recording without recorded rights cannot be sold.
-- ---------------------------------------------------------------------------
create table app.partners (
  id                uuid primary key default gen_random_uuid(),
  legal_name        text not null,
  royalty_rate_bps  integer not null default 1500 check (royalty_rate_bps between 0 and 10000),
  settlement_terms  text not null default 'monthly, after the 30-day refund window',
  created_at        timestamptz not null default now()
);

create table app.rights (
  id                  uuid primary key default gen_random_uuid(),
  licensor_id         uuid not null references app.partners(id),
  work_title          text not null,
  underlying_work_status text not null
    check (underlying_work_status in ('public_domain','licensed','original','traditional_unattributed')),
  underlying_work_reference text,
  territory           text[] not null default array['WW'],
  term_start          date not null,
  term_end            date,                       -- null = perpetual; see CHECK below
  languages           text[] not null,            -- gloss languages this grant covers
  may_redistribute    boolean not null default false,
  may_edit            boolean not null default false,
  may_use_for_ai      boolean not null default false,
  permits_permanent_copy boolean not null default false,
  grant_form          text not null default 'signed'
    check (grant_form in ('signed','written_consent_pending_signature')),
  provisional_expires_at date,                    -- a pending grant must have a hard date
  created_at          timestamptz not null default now(),

  -- A provisional grant without an expiry would become permanent by inattention.
  constraint provisional_needs_expiry check (
    grant_form = 'signed' or provisional_expires_at is not null
  )
);

comment on column app.rights.grant_form is
  'The escape valve from the build plan gate G6: a teacher email confirming terms '
  'unblocks launch, but provisional_expires_at forces the signature. fn_can_publish '
  'refuses a provisional grant past its expiry, so paperwork delay degrades to a '
  'content gap rather than a silent rights breach.';


-- ---------------------------------------------------------------------------
-- Practices and their versions.
-- ---------------------------------------------------------------------------
create table app.practices (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  tradition         text not null,
  created_at        timestamptz not null default now()
);

create type app.content_state as enum
  ('draft', 'awaiting_review', 'approved', 'published', 'superseded', 'withdrawn');

create table app.practice_versions (
  id                  uuid primary key default gen_random_uuid(),
  practice_id         uuid not null references app.practices(id) on delete cascade,
  version_number      integer not null,
  source_language     text not null references app.languages(code),
  title               text not null,
  purpose             text not null,              -- shown on every item header
  source_citation     text not null,              -- NOT NULL: "Rigveda 3.62.10"
  rights_id           uuid not null references app.rights(id),
  audio_object_key    text,                       -- R2 key in the private bucket
  audio_duration_ms   integer check (audio_duration_ms > 0),
  state               app.content_state not null default 'draft',
  superseded_by       uuid references app.practice_versions(id),
  withdrawn_reason    text,
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  unique (practice_id, version_number),

  constraint withdrawn_needs_reason check (
    state <> 'withdrawn' or withdrawn_reason is not null
  )
);

-- ---------------------------------------------------------------------------
-- Segments: one recited line. The unit the three-column player scrolls.
--
-- optional_at drives the 3/5/10-minute variants: a segment is included in a
-- duration if that integer appears in the array. One recording, three honest
-- teacher-approved lengths -- not three worse recordings.
-- ---------------------------------------------------------------------------
create table app.segments (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id) on delete cascade,
  ordinal           integer not null check (ordinal > 0),
  source_text       text not null,                -- in the source language's own script
  transliteration   text,                         -- ISO 15919; null when source is Latn
  start_ms          integer not null check (start_ms >= 0),
  end_ms            integer not null,
  optional_at       integer[] not null default array[3,5,10],
  is_silence        boolean not null default false,
  unique (version_id, ordinal),
  constraint segment_time_ordered check (end_ms > start_ms),
  constraint optional_at_valid check (optional_at <@ array[3,5,10])
);

comment on column app.segments.optional_at is
  'Which duration variants include this segment. array[10] = only the long form. '
  'The 3-minute variant must still be a complete practice, not a truncation: '
  'that is an editorial judgement made when authoring, enforced by review.';

-- ---------------------------------------------------------------------------
-- Glosses: the meaning of one segment in ONE language. The multilingual seam.
-- ---------------------------------------------------------------------------
create table app.segment_glosses (
  id                uuid primary key default gen_random_uuid(),
  segment_id        uuid not null references app.segments(id) on delete cascade,
  language_code     text not null references app.languages(code),
  translation       text not null,                -- literal rendering of the line
  meaning           text not null,                -- one plain sentence: what it MEANS
  created_at        timestamptz not null default now(),
  unique (segment_id, language_code)
);

-- ---------------------------------------------------------------------------
-- Per-language sign-off. A version is publishable IN A LANGUAGE only when a
-- reviewer competent in that language has signed that language's glosses.
-- This is why adding Bengali needs a Bengali scholar and nothing else.
-- ---------------------------------------------------------------------------
create table app.version_language_approvals (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id) on delete cascade,
  language_code     text not null references app.languages(code),
  reviewer_id       uuid not null references app.reviewers(id),
  approved_at       timestamptz not null default now(),
  approved_by_auth_user uuid not null,            -- the reviewer's OWN session, not the founder's
  notes             text,
  unique (version_id, language_code)
);

comment on table app.version_language_approvals is
  'approved_by_auth_user must be the reviewer''s own auth.uid(). The founder holding '
  'that credential would make the named-reviewer claim false, which is the one claim '
  'the whole product rests on. Verified manually at launch (assertion P25).';

-- ---------------------------------------------------------------------------
-- Correction log. Public, dated, per practice. The defensibility item.
-- ---------------------------------------------------------------------------
create table app.corrections (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references app.practice_versions(id),
  language_code     text references app.languages(code),   -- null = affects source text
  segment_ordinal   integer,
  what_changed      text not null,
  why               text not null,
  corrected_by      uuid not null references app.reviewers(id),
  corrected_at      timestamptz not null default now(),
  is_public         boolean not null default true
);


-- ---------------------------------------------------------------------------
-- THE PUBLISH GATE
-- ---------------------------------------------------------------------------
create or replace function app.fn_can_publish(p_version_id uuid, p_language text)
returns table (ok boolean, reason text)
language plpgsql
stable
security invoker
set search_path = app, pg_catalog
as $$
declare
  v record;
  r record;
  n_segments integer;
  n_glossed  integer;
begin
  select * into v from app.practice_versions where id = p_version_id;
  if not found then
    return query select false, 'version does not exist'; return;
  end if;

  if not exists (select 1 from app.languages where code = p_language and is_active) then
    return query select false, format('language %s is not active: it has no named reviewer', p_language);
    return;
  end if;

  select * into r from app.rights where id = v.rights_id;
  if r.term_end is not null and r.term_end < current_date then
    return query select false, 'rights grant has expired'; return;
  end if;
  if r.grant_form = 'written_consent_pending_signature'
     and r.provisional_expires_at < current_date then
    return query select false, 'provisional rights grant has lapsed; signature required'; return;
  end if;
  if not (p_language = any(r.languages)) then
    return query select false, format('rights grant does not cover language %s', p_language); return;
  end if;

  if v.audio_object_key is null then
    return query select false, 'no audio recording attached'; return;
  end if;

  select count(*) into n_segments from app.segments where version_id = p_version_id;
  if n_segments = 0 then
    return query select false, 'version has no segments: nothing to render'; return;
  end if;

  -- Every segment must be glossed. A half-translated practice is worse than none:
  -- the user hits an untranslated line exactly when they trusted the product most.
  select count(*) into n_glossed
    from app.segments s
    join app.segment_glosses g on g.segment_id = s.id and g.language_code = p_language
   where s.version_id = p_version_id;
  if n_glossed < n_segments then
    return query select false,
      format('%s of %s segments lack a %s gloss', n_segments - n_glossed, n_segments, p_language);
    return;
  end if;

  -- The named reviewer, competent in THIS language, must have signed.
  if not exists (
    select 1
      from app.version_language_approvals a
      join app.reviewer_languages rl
        on rl.reviewer_id = a.reviewer_id and rl.language_code = a.language_code
     where a.version_id = p_version_id and a.language_code = p_language
  ) then
    return query select false,
      format('no approval by a reviewer competent in %s', p_language);
    return;
  end if;

  return query select true, 'publishable';
end $$;

-- Trigger form: refuses the state transition rather than trusting the caller.
create or replace function app.trg_guard_publish()
returns trigger
language plpgsql
security invoker
set search_path = app, pg_catalog
as $$
declare
  langs text[];
  l text;
  res record;
begin
  if new.state = 'published' and (old.state is distinct from 'published') then
    select array_agg(distinct language_code) into langs
      from app.version_language_approvals where version_id = new.id;

    if langs is null or array_length(langs, 1) = 0 then
      raise exception 'cannot publish version %: no language has been approved', new.id
        using errcode = 'check_violation';
    end if;

    foreach l in array langs loop
      select * into res from app.fn_can_publish(new.id, l);
      if not res.ok then
        raise exception 'cannot publish version % in %: %', new.id, l, res.reason
          using errcode = 'check_violation';
      end if;
    end loop;

    new.published_at := coalesce(new.published_at, now());
  end if;
  return new;
end $$;

create trigger guard_publish
  before update on app.practice_versions
  for each row execute function app.trg_guard_publish();


do $$
declare t record;
begin
  for t in select tablename from pg_tables
            where schemaname = 'app' and tablename in (
              'partners','rights','practices','practice_versions','segments',
              'segment_glosses','version_language_approvals','corrections')
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;

```

### `supabase/migrations/0003_money.sql`

```sql
-- 0003_money.sql
-- Payments and entitlements.
--
-- THREE RULES THIS FILE ENFORCES STRUCTURALLY
--   1. Legal state moves are ROWS in app.entitlement_transitions, not branches in code.
--      An illegal move is a foreign-key violation. Adding a state cannot silently
--      permit a transition nobody reasoned about.
--   2. Payment application is idempotent at two levels: a unique index on the
--      provider's event id, and a unique index on the *effect*. Fifty concurrent
--      replays of one webhook produce exactly one entitlement.
--   3. A refund revokes only the entitlement descended from the refunded payment.
--      A consumer refund never touches an institution seat.
--
-- Money is stored as integer minor units with an explicit currency. Never float.

create type app.entitlement_state as enum
  ('pending', 'active', 'grace', 'expired', 'refunded', 'revoked');

create type app.payment_provider as enum
  ('bank_transfer', 'razorpay', 'cashfree', 'apple', 'google');

-- ---------------------------------------------------------------------------
-- Products. What can be sold. Prices live here, never in client code.
-- ---------------------------------------------------------------------------
create table app.products (
  code              text primary key,             -- 'intl_individual_annual'
  display_name      text not null,
  seat_cap          integer not null check (seat_cap between 1 and 500),
  duration_days     integer not null check (duration_days > 0),
  auto_renews       boolean not null default true,
  is_active         boolean not null default true
);

create table app.product_prices (
  id                uuid primary key default gen_random_uuid(),
  product_code      text not null references app.products(code),
  currency          text not null check (currency ~ '^[A-Z]{3}$'),
  amount_minor      bigint not null check (amount_minor >= 0),
  tax_inclusive     boolean not null default false,
  country           text,                         -- null = default for that currency
  is_active         boolean not null default true,
  unique (product_code, currency, country)
);

insert into app.products (code, display_name, seat_cap, duration_days, auto_renews) values
  ('intl_individual_annual', 'Individual, one year',        1, 365, true),
  ('intl_household_annual',  'Household, one year',         5, 365, true),
  ('in_household_annual',    'Household (India), one year', 4, 365, true),
  ('intl_individual_monthly','Individual, monthly',         1,  30, true),
  ('prepaid_year',           'Prepaid year, does not renew',1, 365, false),
  ('institution_pilot',      'Institution pilot, 4 weeks',  30, 28, false);

insert into app.product_prices (product_code, currency, amount_minor, tax_inclusive, country) values
  ('intl_individual_annual',  'USD',  3900, false, null),
  ('intl_household_annual',   'USD',  6900, false, null),
  ('in_household_annual',     'INR', 249900, true,  'IN'),
  ('intl_individual_monthly', 'USD',   499, false, null),
  ('prepaid_year',            'USD',  3900, false, null),
  ('institution_pilot',       'INR',1500000, true,  'IN');


-- ---------------------------------------------------------------------------
-- Payment events. Append-only. One row per provider notification.
--
-- Five separate minor-unit integers because the royalty base is "billings
-- excluding indirect tax, less refunds and channel fees" -- a single `amount`
-- column makes that base uncomputable after the fact.
-- ---------------------------------------------------------------------------
create table app.payment_events (
  id                  uuid primary key default gen_random_uuid(),
  provider            app.payment_provider not null,
  provider_event_id   text not null,
  kind                text not null check (kind in ('captured','refunded','chargeback','renewal_failed')),
  currency            text not null check (currency ~ '^[A-Z]{3}$'),
  gross_minor         bigint not null,
  tax_minor           bigint not null default 0,
  withholding_minor   bigint not null default 0,  -- TDS: the buyer may deduct it
  fee_minor           bigint not null default 0,
  settlement_minor    bigint not null default 0,
  is_live             boolean not null default true,
  org_id              uuid references app.organizations(id),
  user_id             uuid,
  product_code        text references app.products(code),
  referral_code       text,                       -- captured at purchase; unrecoverable later
  utr                 text,                       -- bank rail only
  evidence_url        text,                       -- bank statement image for a manual receipt
  occurred_at         timestamptz not null default now(),
  recorded_at         timestamptz not null default now()
);

-- Idempotency level 1: the provider's own event id, per provider.
create unique index payment_events_provider_uniq
  on app.payment_events (provider, provider_event_id);

create index on app.payment_events (org_id) where org_id is not null;
create index on app.payment_events (user_id) where user_id is not null;


-- ---------------------------------------------------------------------------
-- Entitlements. Access is a ledger fact, never a client assertion.
-- ---------------------------------------------------------------------------
create table app.entitlements (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid references app.organizations(id) on delete cascade,
  user_id                 uuid,
  product_code            text not null references app.products(code),
  state                   app.entitlement_state not null default 'pending',
  effective_from          timestamptz not null,
  effective_to            timestamptz not null,
  grace_until             timestamptz,
  origin_payment_event_id uuid references app.payment_events(id),
  purchase_platform       text not null default 'web'
                            check (purchase_platform in ('web','apple','google','bank')),
  seat_index              integer,                -- which seat of a multi-seat grant
  created_at              timestamptz not null default now(),

  constraint entitlement_dates_ordered check (effective_to > effective_from),
  constraint entitlement_has_subject   check (org_id is not null or user_id is not null)
);

comment on column app.entitlements.purchase_platform is
  'CORRECTIONS 1.1: a web payment grants access with no StoreKit receipt. Apple 3.1.3(b) '
  'permits showing that access natively provided the native app sells nothing. This column '
  'is what lets commerce UI be hidden per storefront. Two chars now; an App Review '
  'rejection later.';

-- Idempotency level 2: one payment event yields at most one entitlement per seat.
create unique index entitlements_one_per_payment_seat
  on app.entitlements (origin_payment_event_id, coalesce(seat_index, 0))
  where origin_payment_event_id is not null;

create index on app.entitlements (user_id, state) where user_id is not null;
create index on app.entitlements (org_id, state)  where org_id is not null;
-- Supports the hourly expiry sweep without a sequential scan.
create index on app.entitlements (effective_to) where state in ('active','grace');
create index on app.entitlements (effective_from) where state = 'pending';


-- ---------------------------------------------------------------------------
-- The transition table. THIS is the state machine.
-- ---------------------------------------------------------------------------
create table app.entitlement_transitions (
  from_state        app.entitlement_state not null,
  to_state          app.entitlement_state not null,
  requires_actor    text not null check (requires_actor in ('webhook','scheduled_job','operator','user','any')),
  note              text not null,
  primary key (from_state, to_state)
);

insert into app.entitlement_transitions (from_state, to_state, requires_actor, note) values
  ('pending','active',   'scheduled_job', 'a dated program reaching its start date'),
  ('pending','revoked',  'operator',      'cancelled before it ever began'),
  ('pending','refunded', 'webhook',       'refunded before it ever began'),
  ('active','grace',     'webhook',       'renewal payment failed; access continues briefly'),
  ('active','expired',   'scheduled_job', 'term ended'),
  ('active','refunded',  'webhook',       'refund issued against the originating payment'),
  ('active','revoked',   'operator',      'revoked for cause, with a mandatory reason'),
  ('grace','active',     'webhook',       'retry succeeded'),
  ('grace','expired',    'scheduled_job', 'grace window elapsed'),
  ('grace','refunded',   'webhook',       'refund issued during grace'),
  ('grace','revoked',    'operator',      'revoked for cause during grace'),
  ('expired','active',   'webhook',       'lapsed customer paid again on the same entitlement');
-- Deliberately absent: anything out of 'refunded' or 'revoked'. Those are terminal.

-- ---------------------------------------------------------------------------
-- Entitlement events: the audit trail. Every move leaves a row.
-- ---------------------------------------------------------------------------
create table app.entitlement_events (
  id                      uuid primary key default gen_random_uuid(),
  entitlement_id          uuid not null references app.entitlements(id) on delete cascade,
  from_state              app.entitlement_state,
  to_state                app.entitlement_state not null,
  actor_type              text not null check (actor_type in ('webhook','scheduled_job','operator','user','system')),
  actor_id                text,
  cause_payment_event_id  uuid references app.payment_events(id),
  reason                  text,
  occurred_at             timestamptz not null default now()
);

create index on app.entitlement_events (entitlement_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- The only legal way to move an entitlement.
-- ---------------------------------------------------------------------------
create or replace function app.fn_transition_entitlement(
  p_entitlement_id uuid,
  p_to_state       app.entitlement_state,
  p_actor_type     text,
  p_actor_id       text default null,
  p_cause_payment  uuid default null,
  p_reason         text default null
) returns app.entitlements
language plpgsql
security definer
set search_path = app, pg_catalog
as $$
declare
  e app.entitlements;
  t app.entitlement_transitions;
begin
  -- Lock first: two concurrent webhooks must serialise, not interleave.
  select * into e from app.entitlements where id = p_entitlement_id for update;
  if not found then
    raise exception 'entitlement % does not exist', p_entitlement_id using errcode = 'no_data_found';
  end if;

  if e.state = p_to_state then
    return e;                                     -- idempotent: replay is a no-op
  end if;

  select * into t from app.entitlement_transitions
   where from_state = e.state and to_state = p_to_state;
  if not found then
    raise exception 'illegal entitlement transition % -> %', e.state, p_to_state
      using errcode = 'check_violation';
  end if;

  if t.requires_actor <> 'any' and t.requires_actor <> p_actor_type then
    raise exception 'transition % -> % requires actor %, got %',
      e.state, p_to_state, t.requires_actor, p_actor_type
      using errcode = 'insufficient_privilege';
  end if;

  if p_to_state = 'revoked' and coalesce(trim(p_reason), '') = '' then
    raise exception 'revocation requires a reason' using errcode = 'check_violation';
  end if;

  update app.entitlements set state = p_to_state where id = p_entitlement_id returning * into e;

  insert into app.entitlement_events
    (entitlement_id, from_state, to_state, actor_type, actor_id, cause_payment_event_id, reason)
  values
    (p_entitlement_id, t.from_state, p_to_state, p_actor_type, p_actor_id, p_cause_payment, p_reason);

  return e;
end $$;

-- ---------------------------------------------------------------------------
-- Does this user have access right now? The single source of truth.
-- Both conditions matter: a state of 'active' on a term that ended yesterday
-- is not access. A trigger cannot fire on wall-clock passing.
-- ---------------------------------------------------------------------------
create or replace function app.fn_has_access(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = app, pg_catalog
as $$
  select exists (
    select 1
      from app.entitlements e
     where e.state in ('active','grace')
       and now() >= e.effective_from
       and now() < coalesce(e.grace_until, e.effective_to)
       and (
            e.user_id = p_user_id
         or e.org_id in (
              select m.org_id from app.memberships m
               where m.user_id = p_user_id and m.revoked_at is null
            )
       )
  );
$$;

-- ---------------------------------------------------------------------------
-- Refund scoping. Revokes ONLY what descended from the refunded payment.
-- ---------------------------------------------------------------------------
create or replace function app.fn_apply_refund(p_payment_event_id uuid, p_seats integer default null)
returns integer
language plpgsql
security definer
set search_path = app, pg_catalog
as $$
declare
  n integer := 0;
  r record;
begin
  for r in
    select id from app.entitlements
     where origin_payment_event_id = p_payment_event_id
       and state not in ('refunded','revoked')
     order by coalesce(seat_index, 0)
     limit coalesce(p_seats, 2147483647)
     for update
  loop
    perform app.fn_transition_entitlement(
      r.id, 'refunded', 'webhook', null, p_payment_event_id, 'refund issued');
    n := n + 1;
  end loop;
  return n;
end $$;

comment on function app.fn_apply_refund is
  'Scoped by origin_payment_event_id. A consumer refund cannot touch an institution '
  'seat the same person holds, because that seat descends from a different payment. '
  'p_seats supports a partial refund: 4 of 30 seats revokes exactly 4.';

do $$
declare t record;
begin
  for t in select tablename from pg_tables
            where schemaname = 'app' and tablename in (
              'products','product_prices','payment_events','entitlements',
              'entitlement_transitions','entitlement_events')
  loop
    execute format('alter table app.%I enable row level security', t.tablename);
    execute format('alter table app.%I force row level security', t.tablename);
  end loop;
end $$;

```

### `supabase/migrations/0004_api_surface.sql`

```sql
-- 0004_api_surface.sql
-- Locks down function privileges and defines the ONLY three calls a client can make.
-- See 0005 for the event trigger that makes this durable against future migrations.

do $$
declare f record;
begin
  for f in select n.nspname, p.oid::regprocedure::text as sig
             from pg_proc p join pg_namespace n on n.oid = p.pronamespace
            where n.nspname in ('app','ops')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f.sig);
  end loop;
end $$;

alter default privileges in schema app revoke execute on functions from public, anon, authenticated;
alter default privileges in schema ops revoke execute on functions from public, anon, authenticated;

drop extension if exists citext;   -- unused; the linter flags extensions in public

create table ops.api_allowlist (
  function_signature text primary key,
  granted_to         text not null check (granted_to in ('anon','authenticated','both')),
  rationale          text not null
);

create or replace function app.fn_catalog(p_language text default 'en')
returns table (
  version_id uuid, slug text, title text, purpose text, tradition text,
  source_language text, source_script text, source_direction text,
  duration_ms integer, source_citation text, reviewer_name text, reviewer_credentials text)
language sql stable security definer set search_path = app, pg_catalog as $$
  select pv.id, p.slug, pv.title, pv.purpose, p.tradition,
         pv.source_language, l.script, l.direction,
         pv.audio_duration_ms, pv.source_citation, rv.full_name, rv.credentials
    from app.practice_versions pv
    join app.practices p on p.id = pv.practice_id
    join app.languages  l on l.code = pv.source_language
    join app.version_language_approvals a on a.version_id = pv.id and a.language_code = p_language
    join app.reviewers rv on rv.id = a.reviewer_id
   where pv.state = 'published'
   order by p.slug;
$$;

-- THE three-column payload. p_duration filters segments.optional_at so the
-- 3-minute form is a real teacher-approved practice, not a truncation.
create or replace function app.fn_practice_document(
  p_version_id uuid, p_language text default 'en', p_duration integer default 10)
returns jsonb
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare doc jsonb;
begin
  if p_duration not in (3,5,10) then
    raise exception 'duration must be 3, 5 or 10' using errcode = 'check_violation';
  end if;
  select jsonb_build_object(
    'version_id', pv.id, 'title', pv.title, 'purpose', pv.purpose,
    'source_citation', pv.source_citation, 'source_language', pv.source_language,
    'script', l.script, 'direction', l.direction,
    'transliteration_scheme', l.transliteration_scheme,
    'gloss_language', p_language, 'duration_variant', p_duration,
    'audio_object_key', pv.audio_object_key,
    'reviewer', jsonb_build_object('name', rv.full_name, 'credentials', rv.credentials),
    'segments', coalesce((
      select jsonb_agg(jsonb_build_object(
               'ordinal', s.ordinal, 'source_text', s.source_text,
               'transliteration', s.transliteration, 'translation', g.translation,
               'meaning', g.meaning, 'start_ms', s.start_ms, 'end_ms', s.end_ms,
               'is_silence', s.is_silence) order by s.ordinal)
        from app.segments s
        join app.segment_glosses g on g.segment_id = s.id and g.language_code = p_language
       where s.version_id = pv.id and p_duration = any(s.optional_at)), '[]'::jsonb),
    'corrections', coalesce((
      select jsonb_agg(jsonb_build_object('what_changed', c.what_changed, 'why', c.why,
               'corrected_at', c.corrected_at, 'by', r2.full_name) order by c.corrected_at desc)
        from app.corrections c join app.reviewers r2 on r2.id = c.corrected_by
       where c.version_id = pv.id and c.is_public
         and (c.language_code is null or c.language_code = p_language)), '[]'::jsonb)
  ) into doc
    from app.practice_versions pv
    join app.languages l on l.code = pv.source_language
    join app.version_language_approvals a on a.version_id = pv.id and a.language_code = p_language
    join app.reviewers rv on rv.id = a.reviewer_id
   where pv.id = p_version_id and pv.state = 'published';
  if doc is null then
    raise exception 'practice not available' using errcode = 'no_data_found';
  end if;
  return doc;
end $$;

create or replace function app.fn_me()
returns jsonb
language plpgsql stable security definer set search_path = app, pg_catalog as $$
declare uid uuid := auth.uid(); out jsonb;
begin
  if uid is null then
    return jsonb_build_object('authenticated', false, 'has_access', false);
  end if;
  select jsonb_build_object('authenticated', true, 'user_id', uid,
    'has_access', app.fn_has_access(uid), 'profile', to_jsonb(pr) - 'user_id',
    'memberships', coalesce((
      select jsonb_agg(jsonb_build_object('org_id', o.id, 'name', o.display_name,
               'kind', o.kind, 'role', m.role))
        from app.memberships m join app.organizations o on o.id = m.org_id
       where m.user_id = uid and m.revoked_at is null), '[]'::jsonb)) into out
  from app.profiles pr where pr.user_id = uid;
  return coalesce(out, jsonb_build_object('authenticated', true, 'user_id', uid,
    'has_access', app.fn_has_access(uid), 'profile', null, 'memberships', '[]'::jsonb));
end $$;

grant execute on function app.fn_catalog(text)                          to anon, authenticated;
grant execute on function app.fn_practice_document(uuid, text, integer) to anon, authenticated;
grant execute on function app.fn_me()                                   to authenticated;

insert into ops.api_allowlist (function_signature, granted_to, rationale) values
  ('app.fn_catalog(text)', 'both', 'free sample must work before sign-up'),
  ('app.fn_practice_document(uuid,text,integer)', 'both', 'free daily practice is public; gated items filtered by state'),
  ('app.fn_me()', 'authenticated', 'caller reads only their own record');

-- CI meta-test: a grant not in the allowlist fails the build BY EXISTING.
create or replace function ops.fn_check_api_surface()
returns table (violation text)
language sql stable security invoker set search_path = ops, pg_catalog as $$
  select format('ungranted-but-exposed: %s', p.oid::regprocedure::text)
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
   where n.nspname in ('app','ops')
     and (has_function_privilege('anon', p.oid, 'execute')
       or has_function_privilege('authenticated', p.oid, 'execute'))
     and p.oid::regprocedure::text not in (select function_signature from ops.api_allowlist)
  union all
  select format('table grant leaked: %s.%s', table_schema, table_name)
    from information_schema.role_table_grants
   where table_schema in ('app','ops') and grantee in ('anon','authenticated');
$$;

```

### `supabase/migrations/0005_seal_api_surface.sql`

```sql
-- 0005_seal_api_surface.sql
-- Postgres grants EXECUTE on every new function to PUBLIC. Combined with
-- SECURITY DEFINER and an owner holding BYPASSRLS, that is a complete bypass of
-- the no-table-grants model in 0001. ALTER DEFAULT PRIVILEGES is NOT sufficient:
-- it only covers objects created by the role that issued it, so a later migration
-- run by a different role silently reopens the hole.
--
-- This event trigger closes it for every function in app/ops, forever, regardless
-- of who creates it. Grants are then re-added explicitly and must appear in
-- ops.api_allowlist, or ops.fn_check_api_surface() fails CI.
--
-- Discovered empirically: `authenticated` could call app.fn_has_access() with no
-- grant at all. The meta-test's first catch was itself.

revoke all on function ops.fn_check_api_surface() from public, anon, authenticated;

create or replace function ops.fn_revoke_new_function_grants()
returns event_trigger
language plpgsql
security definer
set search_path = ops, pg_catalog
as $$
declare obj record;
begin
  for obj in select * from pg_event_trigger_ddl_commands()
             where command_tag in ('CREATE FUNCTION','CREATE PROCEDURE')
  loop
    if split_part(obj.object_identity, '.', 1) in ('app','ops') then
      execute format('revoke all on function %s from public', obj.object_identity);
    end if;
  end loop;
end $$;

revoke all on function ops.fn_revoke_new_function_grants() from public, anon, authenticated;

drop event trigger if exists trg_seal_functions;
create event trigger trg_seal_functions
  on ddl_command_end
  when tag in ('CREATE FUNCTION','CREATE PROCEDURE')
  execute function ops.fn_revoke_new_function_grants();

```
