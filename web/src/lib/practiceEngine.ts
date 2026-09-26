import type { Completion, PracticeDuration } from "./localStore";

function positiveFinite(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function durationSeconds(duration: PracticeDuration): number {
  return (duration === 5 || duration === 10 ? duration : 3) * 60;
}

/** Zero-based reading step; reaching the end leaves the final step visible. */
export function stepForElapsed(
  elapsed: number,
  total: number,
  stepCount: number,
): number {
  const count = Math.floor(positiveFinite(stepCount));
  const seconds = positiveFinite(total);
  if (!count || !seconds) return 0;
  const position = Math.min(positiveFinite(elapsed), seconds);
  return Math.min(count - 1, Math.floor((position * count) / seconds + 1e-9));
}

export function elapsedForStep(
  step: number,
  total: number,
  stepCount: number,
): number {
  const count = Math.floor(positiveFinite(stepCount));
  if (!count) return 0;
  const index = Math.min(count - 1, Math.floor(positiveFinite(step)));
  return (index * positiveFinite(total)) / count;
}

export function formatTime(seconds: number): string {
  const wholeSeconds = Math.floor(positiveFinite(seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

/** Unique local calendar days, Monday first. Never moves a completion to another day. */
export function weekCompletionDates(
  completions: ReadonlyArray<Pick<Completion, "completedAt">>,
  now: Date = new Date(),
): string[] {
  if (!Number.isFinite(now.getTime())) return [];
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const dates = new Set<string>();
  for (const completion of completions) {
    const date = new Date(completion.completedAt);
    if (
      !Number.isFinite(date.getTime()) ||
      date < weekStart ||
      date >= weekEnd ||
      date > now
    )
      continue;
    dates.add(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    );
  }
  return [...dates].sort();
}
