import type { PracticeIntention } from "./localStore";

export interface PracticeActionIdentity {
  lessonId: string;
  actionKey: string;
}

function validId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 200 &&
    value.trim().length > 0 &&
    !["__proto__", "constructor", "prototype"].includes(value)
  );
}

function validTimestamp(value: unknown): value is string {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)
  )
    return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function validIntention(value: PracticeIntention): boolean {
  return (
    validId(value.lessonId) &&
    validId(value.actionKey) &&
    validTimestamp(value.createdAt) &&
    (value.triedAt === undefined ||
      (validTimestamp(value.triedAt) && value.triedAt >= value.createdAt)) &&
    (value.response === undefined ||
      (value.triedAt !== undefined &&
        (value.response === "helpful" || value.response === "not-yet")))
  );
}

function copyIntention(value: PracticeIntention): PracticeIntention {
  return {
    lessonId: value.lessonId,
    actionKey: value.actionKey,
    createdAt: value.createdAt,
    ...(value.triedAt === undefined ? {} : { triedAt: value.triedAt }),
    ...(value.response === undefined ? {} : { response: value.response }),
  };
}

/** Both keys must match the current catalog; never substitute a different lesson. */
export function resolvePracticeIntention<T extends PracticeActionIdentity>(
  intention: PracticeIntention | null | undefined,
  catalog: readonly T[],
): T | undefined {
  if (!intention || !validIntention(intention)) return undefined;
  return catalog.find(
    (action) =>
      action.lessonId === intention.lessonId &&
      action.actionKey === intention.actionKey,
  );
}

/** Call only after an explicit choice to save this exercise on the device. */
export function createPracticeIntention(
  lessonId: string,
  actionKey: string,
  catalog: readonly PracticeActionIdentity[],
  nowISO: string,
): PracticeIntention | null {
  const intention = { lessonId, actionKey, createdAt: nowISO };
  return resolvePracticeIntention(intention, catalog) ? intention : null;
}

/** Compare the selected exercise's identity before accepting a stale UI action. */
export function samePracticeIntention(
  first: PracticeIntention | null | undefined,
  second: PracticeIntention | null | undefined,
): boolean {
  if (!first || !second) return !first && !second;
  return (
    first.lessonId === second.lessonId &&
    first.actionKey === second.actionKey &&
    first.createdAt === second.createdAt
  );
}

/** Reading and elapsed time never call this; only the person's explicit report. */
export function markPracticeIntentionTried(
  intention: PracticeIntention,
  nowISO: string,
): PracticeIntention | null {
  if (
    !validIntention(intention) ||
    !validTimestamp(nowISO) ||
    nowISO < intention.createdAt
  )
    return null;
  return {
    ...copyIntention(intention),
    triedAt: intention.triedAt ?? nowISO,
  };
}

/** Optional feedback follows a report of trying; it never creates one. */
export function respondToPracticeIntention(
  intention: PracticeIntention,
  response: PracticeIntention["response"],
): PracticeIntention | null {
  if (
    !validIntention(intention) ||
    !intention.triedAt ||
    (response !== "helpful" && response !== "not-yet")
  )
    return null;
  return { ...copyIntention(intention), response };
}
