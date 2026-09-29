/** Device-only reading state. Never contains a story body, source excerpt or life question. */
export type StoryResponse = "helpful" | "not-yet";
export type StorySession = {
  schema: 1;
  storyId: string;
  scene: number;
  finishedAt?: string;
  action?: { text: string; savedAt: string; triedAt?: string; response?: StoryResponse };
};

export type StorySessionLoad = { kind: "empty" } | { kind: "ready"; value: StorySession } | { kind: "error" };
const validId = (value: unknown): value is string => typeof value === "string" && /^[0-9a-f-]{8,80}$/i.test(value);
const validTime = (value: unknown): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;

export function storySessionKey(actor: string, storyId: string): string {
  if (!validId(storyId) || !/^(guest|[0-9a-f-]{8,80})$/i.test(actor)) throw Error("Invalid story identity");
  return `spritual_story_session_v1_${actor}_${storyId}`;
}

export function parseStorySession(raw: string | null, storyId: string, sceneCount: number): StorySessionLoad {
  if (raw === null) return { kind: "empty" };
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return { kind: "error" };
    const row = value as Record<string, unknown>;
    if (row.schema !== 1 || row.storyId !== storyId || !Number.isInteger(row.scene) ||
      (row.scene as number) < 0 || (row.scene as number) >= sceneCount) return { kind: "error" };
    if (row.finishedAt !== undefined && !validTime(row.finishedAt)) return { kind: "error" };
    let action: StorySession["action"];
    if (row.action !== undefined) {
      if (!row.action || typeof row.action !== "object" || Array.isArray(row.action)) return { kind: "error" };
      const entry = row.action as Record<string, unknown>;
      if (typeof entry.text !== "string" || entry.text.trim() !== entry.text ||
        entry.text.length < 1 || entry.text.length > 240 || !validTime(entry.savedAt) ||
        (entry.triedAt !== undefined && (!validTime(entry.triedAt) || entry.triedAt < entry.savedAt)) ||
        (entry.response !== undefined && (entry.triedAt === undefined || !["helpful", "not-yet"].includes(String(entry.response))))) return { kind: "error" };
      action = { text: entry.text, savedAt: entry.savedAt,
        ...(entry.triedAt === undefined ? {} : { triedAt: entry.triedAt as string }),
        ...(entry.response === undefined ? {} : { response: entry.response as StoryResponse }) };
    }
    return { kind: "ready", value: { schema: 1, storyId, scene: row.scene as number,
      ...(row.finishedAt === undefined ? {} : { finishedAt: row.finishedAt as string }),
      ...(action === undefined ? {} : { action }) } };
  } catch { return { kind: "error" }; }
}

export function loadStorySession(storage: Pick<Storage, "getItem">, actor: string, storyId: string, sceneCount: number): StorySessionLoad {
  try { return parseStorySession(storage.getItem(storySessionKey(actor, storyId)), storyId, sceneCount); }
  catch { return { kind: "error" }; }
}

export function writeStorySession(storage: Pick<Storage, "setItem">, actor: string, value: StorySession, sceneCount: number): void {
  if (parseStorySession(JSON.stringify(value), value.storyId, sceneCount).kind !== "ready") throw Error("Invalid story progress");
  storage.setItem(storySessionKey(actor, value.storyId), JSON.stringify(value));
}

export function clearStorySession(storage: Pick<Storage, "removeItem">, actor: string, storyId: string): void {
  storage.removeItem(storySessionKey(actor, storyId));
}
