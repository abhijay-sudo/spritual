/**
 * reentry.ts — what a member sees when they come back after missing days.
 *
 * WHY THIS FILE EXISTS
 * The completeness critic found this as gap A3: the program is a dated 28-day
 * schedule, and the *default* behaviour of anything date-indexed is to show a
 * wall of missed days. That is precisely what the blueprint forbids:
 *
 *   "Missed days should trigger a gentle restart choice, not a punitive streak reset."
 *
 * It is an absence rather than a bug, which is why no test would catch it and no
 * reviewer flagged it. So the policy is written here, explicitly, as its own unit.
 *
 * THE INVARIANTS (these are not negotiable — they are the product promise)
 *   1. Today serves `serveDayIndex`, NEVER the calendar day.
 *   2. Nothing anywhere counts, displays, or implies a number of missed days.
 *   3. There is no streak, no badge, no zero to see.
 *   4. A backlog is never offered. The member does not owe us anything.
 */

import type { ReentryDecision } from '../../../packages/core/src/contracts';

export interface ReentryInput {
  /** Program day the member last completed. 0 = they have never started. */
  lastCompletedDayIndex: number;
  /** Whole days since their last completed practice. 0 = already practised today. */
  daysSinceLastPractice: number;
  /** Total days in this program (14 for the introduction, 28 for the cycle). */
  programLength: number;
  /** Whether the member's circle has a shared cohort date they may want to rejoin. */
  hasCohort: boolean;
}

/**
 * Decide what Today shows.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * TODO(abhijay): implement this function.
 *
 * This is a product decision, not a mechanical one, and it shapes how the app
 * *feels* at the single most fragile moment in the whole experience — the day
 * someone opens it after falling off. Four or five branches is plenty.
 *
 * The trade-offs to weigh:
 *
 *  • HOW MANY DAYS IS "A LAPSE"?  Too eager and you interrupt someone who simply
 *    skipped a Sunday, which reads as nagging. Too slow and someone returning
 *    after two weeks gets dropped into day 19 of a sequence they have lost the
 *    thread of. Consider treating 1–2 days as no lapse at all.
 *
 *  • CONTINUE vs RESTART.  Continuing respects the work already done. Restarting
 *    is kinder to someone who has genuinely lost the thread. Whose call is it —
 *    yours, or theirs? If theirs, `offerReschedule` is how you ask.
 *
 *  • THE SHORT VARIANT.  `forceShortVariant` drops them into the 3-minute form.
 *    Re-entry is easier when the ask is small. But overriding the duration they
 *    chose is still a decision made on their behalf — is that warranted here?
 *
 *  • THE MESSAGE.  This is the single most important string in the product. It
 *    must state where they are without implying they failed. "You're on day 9"
 *    is a fact. "You missed 6 days" is an accusation. Write the sentence you
 *    would want to read.
 *
 *  • THE COHORT.  If `hasCohort` and the circle has moved on, do you pull them
 *    to where the group is (belonging, but skips content) or leave them where
 *    they are (continuity, but practising alone)? There is no obviously right
 *    answer and it depends on what you think the circle is *for*.
 *
 * Return a ReentryDecision. Clamp serveDayIndex to [1, programLength].
 * ─────────────────────────────────────────────────────────────────────────────
 */
export function decideReentry(input: ReentryInput): ReentryDecision {
  throw new Error('decideReentry not implemented — see TODO above');
}

/**
 * Guard used by the Today route. Kept separate from the policy so the invariant
 * is testable on its own: no rendered string may contain a missed-day count.
 */
export function assertNoShaming(message: string): void {
  const forbidden = [
    /missed/i,
    /you\s+(haven'?t|have\s+not)/i,
    /streak/i,
    /\bbehind\b/i,
    /catch\s*up/i,
    /\blost\b/i,
    /\bfail/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(message)) {
      throw new Error(
        `Re-entry message violates the no-shaming invariant (matched ${pattern}): "${message}"`
      );
    }
  }
}
