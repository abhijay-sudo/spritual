export type Language = "en" | "hi";
export type PracticeDuration = 3 | 5 | 10;

export interface PracticeProgress {
  step: number;
  elapsedSeconds: number;
  duration: PracticeDuration;
}

export interface Completion {
  id: string;
  lessonId: string;
  completedAt: string;
  duration: PracticeDuration;
}

export interface Reflection {
  id: string;
  lessonId: string;
  text: string;
  createdAt: string;
}

export interface Feedback {
  id: string;
  rating: "helpful" | "okay" | "confusing";
  comment: string;
  createdAt: string;
}

/** One explicitly chosen exercise; never inferred from reading or completion. */
export interface PracticeIntention {
  lessonId: string;
  actionKey: string;
  createdAt: string;
  triedAt?: string;
  response?: "helpful" | "not-yet";
}

/** Private writing stays in memory until its author explicitly saves it. */
export interface ReflectionDraft {
  text: string;
  consent: boolean;
}
export type ReflectionDrafts = Record<string, ReflectionDraft>;

export interface LocalState {
  language: Language;
  textSize: "standard" | "large";
  /** Follow the device preference unless reduced motion is explicitly chosen. */
  motion?: "system" | "reduced";
  /** Optional for compatibility with existing local reading records. */
  readingTheme?: "paper" | "evening";
  transliteration: boolean;
  weeklyGoal: 2 | 3 | 5;
  routine: "morning" | "evening" | "anytime";
  bookmarks: string[];
  progress: Record<string, PracticeProgress>;
  /** Optional for compatibility with earlier version-1 records. */
  lastActiveLessonId?: string | null;
  completions: Completion[];
  /** Only add reflections here after explicit permission to save on this device. */
  reflections: Reflection[];
  onboardingDone: boolean;
  feedback: Feedback[];
  /** Optional so older version-1 records remain valid. No intention history. */
  practiceIntention?: PracticeIntention | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const STORAGE_KEY = "spritual_demo_v1";
const MAX_STORED_CHARACTERS = 2_000_000;

export function defaultState(): LocalState {
  return {
    language: "en",
    textSize: "standard",
    motion: "system",
    readingTheme: "paper",
    transliteration: true,
    weeklyGoal: 3,
    routine: "anytime",
    bookmarks: [],
    progress: {},
    lastActiveLessonId: null,
    completions: [],
    reflections: [],
    onboardingDone: false,
    feedback: [],
    practiceIntention: null,
  };
}

export function selectResumeLessonId(
  state: Pick<LocalState, "progress" | "lastActiveLessonId">,
  knownLessonIds: readonly string[],
): string | undefined {
  const active = state.lastActiveLessonId;
  if (
    active &&
    knownLessonIds.includes(active) &&
    Object.hasOwn(state.progress, active)
  )
    return active;
  return knownLessonIds.find((id) => Object.hasOwn(state.progress, id));
}

export function pruneReflectionDrafts(
  drafts: ReflectionDrafts,
  completions: readonly Pick<Completion, "id">[],
): ReflectionDrafts {
  const retained = new Set(completions.map((completion) => completion.id));
  const entries = Object.entries(drafts).filter(([id]) => retained.has(id));
  return entries.length === Object.keys(drafts).length
    ? drafts
    : Object.fromEntries(entries);
}

export function hasUnsavedReflectionDraft(drafts: ReflectionDrafts): boolean {
  return Object.values(drafts).some((draft) => draft.text.trim().length > 0);
}

/** Explicit allowlist keeps transient UI state out of browser storage. */
function persistentState(state: LocalState): LocalState {
  return {
    language: state.language,
    textSize: state.textSize,
    motion: state.motion === "reduced" ? "reduced" : "system",
    readingTheme: state.readingTheme === "evening" ? "evening" : "paper",
    transliteration: state.transliteration,
    weeklyGoal: state.weeklyGoal,
    routine: state.routine,
    bookmarks: state.bookmarks,
    progress: state.progress,
    lastActiveLessonId: state.lastActiveLessonId ?? null,
    completions: state.completions,
    reflections: state.reflections,
    onboardingDone: state.onboardingDone,
    feedback: state.feedback,
    practiceIntention: readPracticeIntention(state.practiceIntention),
  };
}

export function serializeState(state: LocalState): string {
  return JSON.stringify({ version: 1, state: persistentState(state) });
}

function browserStorage(): StorageLike | undefined {
  // Access can throw in restricted/private browsing; importing this module is safe on a server.
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.length <= maximum;
}

function isId(value: unknown): value is string {
  return (
    isText(value, 200) &&
    value.trim().length > 0 &&
    !["__proto__", "constructor", "prototype"].includes(value)
  );
}

function isDuration(value: unknown): value is PracticeDuration {
  return value === 3 || value === 5 || value === 10;
}

function isTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
    return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

function isList<T>(
  value: unknown,
  maximum: number,
  validate: (item: unknown) => item is T,
): value is T[] {
  return (
    Array.isArray(value) && value.length <= maximum && value.every(validate)
  );
}

function hasUniqueIds(value: { id: string }[]): boolean {
  return new Set(value.map((item) => item.id)).size === value.length;
}

function isProgress(value: unknown): value is PracticeProgress {
  return (
    isRecord(value) &&
    Number.isSafeInteger(value.step) &&
    (value.step as number) >= 0 &&
    isDuration(value.duration) &&
    typeof value.elapsedSeconds === "number" &&
    Number.isFinite(value.elapsedSeconds) &&
    value.elapsedSeconds >= 0 &&
    value.elapsedSeconds <= value.duration * 60
  );
}

function isCompletion(value: unknown): value is Completion {
  return (
    isRecord(value) &&
    isId(value.id) &&
    isId(value.lessonId) &&
    isTimestamp(value.completedAt) &&
    isDuration(value.duration)
  );
}

function isReflection(value: unknown): value is Reflection {
  return (
    isRecord(value) &&
    isId(value.id) &&
    isId(value.lessonId) &&
    isText(value.text, 10_000) &&
    isTimestamp(value.createdAt)
  );
}

function isFeedback(value: unknown): value is Feedback {
  return (
    isRecord(value) &&
    isId(value.id) &&
    ["helpful", "okay", "confusing"].includes(value.rating as string) &&
    isText(value.comment, 4_000) &&
    isTimestamp(value.createdAt)
  );
}

function isPracticeIntention(value: unknown): value is PracticeIntention {
  return (
    isRecord(value) &&
    isId(value.lessonId) &&
    isId(value.actionKey) &&
    isTimestamp(value.createdAt) &&
    (value.triedAt === undefined ||
      (isTimestamp(value.triedAt) && value.triedAt >= value.createdAt)) &&
    (value.response === undefined ||
      (value.triedAt !== undefined &&
        (value.response === "helpful" || value.response === "not-yet")))
  );
}

/** Keep free text and accidental UI/profile fields out of the new record. */
function readPracticeIntention(value: unknown): PracticeIntention | null {
  if (!isPracticeIntention(value)) return null;
  return {
    lessonId: value.lessonId,
    actionKey: value.actionKey,
    createdAt: value.createdAt,
    ...(value.triedAt === undefined ? {} : { triedAt: value.triedAt }),
    ...(value.response === undefined ? {} : { response: value.response }),
  };
}

function isState(value: unknown): value is LocalState {
  if (
    !isRecord(value) ||
    !["en", "hi"].includes(value.language as string) ||
    !["standard", "large"].includes(value.textSize as string) ||
    (value.motion !== undefined &&
      value.motion !== "system" &&
      value.motion !== "reduced") ||
    (value.readingTheme !== undefined &&
      value.readingTheme !== "paper" &&
      value.readingTheme !== "evening") ||
    typeof value.transliteration !== "boolean" ||
    ![2, 3, 5].includes(value.weeklyGoal as number) ||
    !["morning", "evening", "anytime"].includes(value.routine as string) ||
    typeof value.onboardingDone !== "boolean" ||
    !isList(value.bookmarks, 1_000, isId) ||
    new Set(value.bookmarks).size !== value.bookmarks.length ||
    !isRecord(value.progress) ||
    Object.keys(value.progress).length > 1_000 ||
    !Object.entries(value.progress).every(
      ([key, item]) => isId(key) && isProgress(item),
    ) ||
    (value.lastActiveLessonId !== undefined &&
      value.lastActiveLessonId !== null &&
      (!isId(value.lastActiveLessonId) ||
        !Object.hasOwn(value.progress, value.lastActiveLessonId))) ||
    !isList(value.completions, 5_000, isCompletion) ||
    !hasUniqueIds(value.completions) ||
    !isList(value.reflections, 500, isReflection) ||
    !hasUniqueIds(value.reflections) ||
    !isList(value.feedback, 500, isFeedback) ||
    !hasUniqueIds(value.feedback) ||
    (value.practiceIntention !== undefined &&
      value.practiceIntention !== null &&
      !isPracticeIntention(value.practiceIntention))
  )
    return false;
  return true;
}

/** Missing, corrupt, incompatible or inaccessible storage starts a usable fresh demo. */
export function loadState(
  storage: StorageLike | null | undefined = browserStorage(),
): LocalState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw || raw.length > MAX_STORED_CHARACTERS) return defaultState();
    const stored: unknown = JSON.parse(raw);
    if (!isRecord(stored) || stored.version !== 1 || !isRecord(stored.state))
      return defaultState();
    // Damaged optional preferences/exercises must not erase valid private notes.
    const restored = {
      ...stored.state,
      motion: stored.state.motion === "reduced" ? "reduced" : "system",
      readingTheme:
        stored.state.readingTheme === "evening" ? "evening" : "paper",
      practiceIntention: readPracticeIntention(stored.state.practiceIntention),
    };
    return isState(restored) ? persistentState(restored) : defaultState();
  } catch {
    return defaultState();
  }
}

/** False means the caller must retain session state and explain that it was not saved. */
export function persistState(
  state: LocalState,
  storage: StorageLike | null | undefined = browserStorage(),
): boolean {
  try {
    if (!storage || !isState(state)) return false;
    const serialized = serializeState(state);
    if (serialized.length > MAX_STORED_CHARACTERS) return false;
    storage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}
