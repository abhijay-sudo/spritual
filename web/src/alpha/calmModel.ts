import type { Lesson } from "../data/lessons";
import type { WisdomState } from "./wisdomState.ts";
import { readingHref } from "./wisdomState.ts";

export type TodayKind = "new" | "active" | "completed" | "returning" | "repeat" | "next";

function dayAt(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find(item => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Stable until a person deliberately changes their reading state. */
export function chooseToday(
  state: WisdomState,
  collection: readonly Lesson[],
  today: string,
  timeZone: string,
): { kind: TodayKind; lesson: Lesson; href: string } {
  if (!collection.length) throw new Error("A current reading is required.");
  const known = (id: string) => collection.find(item => item.id === id);
  const resumed = state.resume && known(state.resume.lessonId);
  if (resumed) return { kind: "active", lesson: resumed, href: readingHref(resumed.id, state.resume) };

  // An explicit after-reading choice wins over the automatic next-unread suggestion,
  // including on the day the preceding reading was completed.
  const chosen = state.readingChoice && state.finished?.[state.readingChoice.afterLessonId] && known(state.readingChoice.lessonId);
  if (chosen && state.readingChoice) return { kind: state.readingChoice.mode, lesson: chosen, href: readingHref(chosen.id) };

  const finished = Object.entries(state.finished ?? {})
    .filter(([id]) => known(id))
    .sort((a, b) => b[1].localeCompare(a[1]));
  const completedToday = finished.find(([, at]) => dayAt(at, timeZone) === today);
  if (completedToday) {
    const lesson = known(completedToday[0])!;
    return { kind: "completed", lesson, href: readingHref(lesson.id) };
  }

  const lesson = collection.find(item => !state.finished?.[item.id]) ?? known(finished[0]?.[0] ?? "") ?? collection[0];
  const hasHistory = finished.length > 0 || Object.keys(state.kept).length > 0;
  return { kind: hasHistory ? "returning" : "new", lesson, href: readingHref(lesson.id) };
}
