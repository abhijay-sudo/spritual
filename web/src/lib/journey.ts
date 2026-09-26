import type { Lesson } from "../data/lessons";
import type { LocalState } from "./localStore";

type JourneyActivity = Pick<
  LocalState,
  "completions" | "progress" | "lastActiveLessonId"
>;

export interface JourneyItem {
  lesson: Lesson;
  index: number;
  status: "ready" | "in-progress" | "completed";
  hasCompleted: boolean;
}

/** A reading suggestion, never an enrollment, prerequisite or calendar schedule. */
export function getJourneyState(
  state: JourneyActivity,
  catalog: readonly Lesson[],
  excludeLessonId?: string,
) {
  const completedIds = new Set(state.completions.map((item) => item.lessonId));
  const items: JourneyItem[] = catalog.map((lesson, index) => {
    const hasCompleted = completedIds.has(lesson.id);
    return {
      lesson,
      index,
      hasCompleted,
      status: Object.hasOwn(state.progress, lesson.id)
        ? "in-progress"
        : hasCompleted
          ? "completed"
          : "ready",
    };
  });
  const inProgress = items.filter(
    (item) =>
      item.status === "in-progress" && item.lesson.id !== excludeLessonId,
  );
  // Keep Today’s existing last-opened priority, including a lesson being reread.
  const resumeLesson = (
    inProgress.find((item) => item.lesson.id === state.lastActiveLessonId) ??
    inProgress[0]
  )?.lesson;
  const nextUnreadLesson = items.find(
    (item) => !item.hasCompleted && item.lesson.id !== excludeLessonId,
  )?.lesson;
  const unfinishedProgress = inProgress.filter((item) => !item.hasCompleted);
  const nextUnfinishedLesson =
    (
      unfinishedProgress.find(
        (item) => item.lesson.id === state.lastActiveLessonId,
      ) ?? unfinishedProgress[0]
    )?.lesson ?? nextUnreadLesson;
  const completedCount = items.filter((item) => item.hasCompleted).length;

  return {
    items,
    completedCount,
    total: items.length,
    isComplete: items.length > 0 && completedCount === items.length,
    resumeLesson,
    nextUnreadLesson,
    nextUnfinishedLesson,
    nextLesson: resumeLesson ?? nextUnreadLesson,
  };
}

/** Use actual completion time, not catalog order or the order of stored records. */
export function getLatestCompletedLesson(
  state: Pick<LocalState, "completions">,
  catalog: readonly Lesson[],
): Lesson | undefined {
  let latestTime = -Infinity;
  let latestLesson: Lesson | undefined;
  for (const completion of state.completions) {
    const lesson = catalog.find((item) => item.id === completion.lessonId);
    const completedAt = Date.parse(completion.completedAt);
    if (lesson && Number.isFinite(completedAt) && completedAt >= latestTime) {
      latestTime = completedAt;
      latestLesson = lesson;
    }
  }
  return latestLesson;
}
