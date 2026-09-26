/** Local-only reading records. No free-text reflection or inferred profile belongs here. */
export const practiceCues = ["after-breakfast", "before-work", "evening"] as const;
export type PracticeCue = typeof practiceCues[number];
export type Kept = { day: string; kind: "bookmark" | "practice"; triedAt?: string; cue?: PracticeCue };
export type ReadingResume = { lessonId: string; scene: number; updatedAt: string };
export type ReadingChoice = { afterLessonId: string; lessonId: string; mode: "repeat" | "next" };
export type WisdomState = {
  schema: 1;
  language: "en" | "hi";
  kept: Record<string, Kept>;
  finished?: Record<string, string>;
  resume?: ReadingResume;
  readingChoice?: ReadingChoice;
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
    if (!lessonIds.includes(id) || !object(entry) || !day(entry.day) || (entry.kind !== undefined && entry.kind !== "bookmark" && entry.kind !== "practice") || (entry.triedAt !== undefined && !timestamp(entry.triedAt)) || (entry.cue !== undefined && !practiceCues.includes(entry.cue as PracticeCue))) throw Error("Invalid saved practice.");
    // Earlier saves did not distinguish a bookmark from an intentional practice.
    // A check-in or chosen cue proves practice intent; otherwise preserve it as a bookmark.
    const kind = entry.kind ?? (entry.triedAt || entry.cue ? "practice" : "bookmark");
    if (kind === "bookmark" && (entry.triedAt || entry.cue)) throw Error("Bookmark cannot contain a practice check-in.");
    kept[id] = { day: entry.day, kind, ...(entry.triedAt ? { triedAt: entry.triedAt as string } : {}), ...(entry.cue ? { cue: entry.cue as PracticeCue } : {}) };
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
  if (v.readingChoice !== undefined) {
    const choice = v.readingChoice;
    if (!object(choice) || typeof choice.afterLessonId !== "string" || !lessonIds.includes(choice.afterLessonId) || typeof choice.lessonId !== "string" || !lessonIds.includes(choice.lessonId) || (choice.mode !== "repeat" && choice.mode !== "next") || (choice.mode === "repeat") !== (choice.afterLessonId === choice.lessonId)) throw Error("Invalid reading choice.");
    result.readingChoice = { afterLessonId: choice.afterLessonId, lessonId: choice.lessonId, mode: choice.mode };
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
  if (next.readingChoice?.lessonId === lessonId || next.readingChoice?.afterLessonId === lessonId) delete next.readingChoice;
  return next;
}
export function chooseReadingAfter(state: WisdomState, afterLessonId: string, lessonId: string, mode: ReadingChoice["mode"]): WisdomState {
  if (!state.finished?.[afterLessonId] || (mode !== "repeat" && mode !== "next") || (mode === "repeat") !== (afterLessonId === lessonId)) throw Error("Finish this reading before choosing what comes next.");
  return { ...state, readingChoice: { afterLessonId, lessonId, mode } };
}
export function setPracticeCue(state: WisdomState, lessonId: string, cue?: PracticeCue): WisdomState {
  if (state.kept[lessonId]?.kind !== "practice" || (cue !== undefined && !practiceCues.includes(cue))) throw Error("Choose this as a small step before setting a cue.");
  const entry = { ...state.kept[lessonId] };
  if (cue) entry.cue = cue; else delete entry.cue;
  return { ...state, kept: { ...state.kept, [lessonId]: entry } };
}
export function markPracticeTried(state: WisdomState, lessonId: string, now?: string): WisdomState {
  if (state.kept[lessonId]?.kind !== "practice" || (now !== undefined && !timestamp(now))) throw Error("Invalid practice check-in.");
  const entry = { ...state.kept[lessonId] };
  if (now) entry.triedAt = now; else delete entry.triedAt;
  return { ...state, kept: { ...state.kept, [lessonId]: entry } };
}
export function choosePractice(state: WisdomState, lessonId: string, today: string): WisdomState {
  if (!day(today)) throw Error("Invalid practice day.");
  if (state.kept[lessonId]?.kind === "practice") return state;
  return { ...state, kept: { ...state.kept, [lessonId]: { day: today, kind: "practice" } } };
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
