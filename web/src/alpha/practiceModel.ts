/** A traditional full mala; this is a counter target, not a daily obligation. */
export const JAPA_TARGET = 108;

function validJapaCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= JAPA_TARGET;
}

/** A missing local value is a fresh counter. A damaged value must not be overwritten silently. */
export function parseJapaCount(raw: string | null): number {
  if (raw === null) return 0;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Saved japa count is corrupted.");
  }
  if (!validJapaCount(parsed)) throw new Error("Saved japa count is corrupted.");
  return parsed;
}

/** Count one deliberate tap, remaining at the target once a mala is complete. */
export function nextJapaCount(count: number): number {
  if (!validJapaCount(count)) throw new RangeError("Japa count must be an integer from 0 to 108.");
  return Math.min(count + 1, JAPA_TARGET);
}

/** Recompute from wall time so a pause can resume after the page is backgrounded. */
export function remainingPauseMs(startedAtMs: number, durationMs: number, nowMs: number): number {
  if (![startedAtMs, durationMs, nowMs].every(value => Number.isFinite(value) && value >= 0)) {
    throw new RangeError("Pause times must be finite and nonnegative.");
  }
  return Math.min(durationMs, Math.max(0, durationMs - Math.max(0, nowMs - startedAtMs)));
}

/** Show any part of a second as a full second, without a negative countdown. */
export function formatPauseTime(ms: number): string {
  const seconds = Number.isFinite(ms) ? Math.ceil(Math.max(ms, 0) / 1000) : 0;
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
