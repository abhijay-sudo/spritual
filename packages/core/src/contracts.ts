/**
 * contracts.ts — the shared interface between the database and every UI module.
 *
 * OWNERSHIP: this file is owned by the schema module. Other modules import from it
 * and do not edit it. A contract change is a request, not an edit — otherwise two
 * agents working in parallel silently disagree about the same payload.
 *
 * These types mirror the return shapes of the three granted RPCs in migration 0004.
 * If you change the SQL, change this, and vice versa.
 */

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------

/** ISO 15924 script code. Drives font stack, line height and text direction. */
export type ScriptCode =
  | 'Latn' | 'Deva' | 'Beng' | 'Taml' | 'Telu' | 'Gujr' | 'Knda'
  | 'Mlym' | 'Guru' | 'Orya' | 'Arab' | 'Sinh' | 'Olck' | 'Mtei';

export type TextDirection = 'ltr' | 'rtl';

export interface Language {
  code: string;            // BCP-47: 'hi', 'ta', 'sa'
  englishName: string;
  endonym: string;         // the language's name in its own script
  script: ScriptCode;
  direction: TextDirection;
  transliterationScheme: string | null;
  isActive: boolean;       // false until a named reviewer exists for it
}

// ---------------------------------------------------------------------------
// The practice document — the payload the three-column player renders
// ---------------------------------------------------------------------------

/** The three honest durations. A short variant is a complete practice, not a truncation. */
export type DurationVariant = 3 | 5 | 10;

export const DURATION_VARIANTS: readonly DurationVariant[] = [3, 5, 10] as const;

/**
 * One recited line. The three columns are sourceText / transliteration / meaning.
 *
 * `translation` is the literal rendering; `meaning` is one plain sentence about
 * what the line is *for*. They are different jobs and the player shows them
 * differently — translation under the line, meaning on tap.
 */
export interface Segment {
  ordinal: number;
  sourceText: string;            // in the source language's own script
  transliteration: string | null; // ISO 15919; null when the source is already Latin
  translation: string;
  meaning: string;
  startMs: number;
  endMs: number;
  isSilence: boolean;
}

export interface Reviewer {
  name: string;
  credentials: string;
}

/** A published correction. Public, dated, and shown to everyone who practised it. */
export interface Correction {
  whatChanged: string;
  why: string;
  correctedAt: string;   // ISO 8601
  by: string;
}

export interface PracticeDocument {
  versionId: string;
  title: string;
  purpose: string;
  sourceCitation: string;        // e.g. "Rigveda 3.62.10"
  sourceLanguage: string;
  script: ScriptCode;
  direction: TextDirection;
  transliterationScheme: string | null;
  glossLanguage: string;
  durationVariant: DurationVariant;
  audioObjectKey: string | null;
  reviewer: Reviewer;
  segments: Segment[];
  corrections: Correction[];
}

export interface CatalogEntry {
  versionId: string;
  slug: string;
  title: string;
  purpose: string;
  tradition: string;
  sourceLanguage: string;
  sourceScript: ScriptCode;
  sourceDirection: TextDirection;
  durationMs: number | null;
  sourceCitation: string;
  reviewerName: string;
  reviewerCredentials: string;
}

// ---------------------------------------------------------------------------
// Identity and access
// ---------------------------------------------------------------------------

export type MemberRole = 'member' | 'admin' | 'teacher' | 'reviewer';
export type OrgKind = 'institution' | 'household';

export interface Membership {
  orgId: string;
  name: string;
  kind: OrgKind;
  role: MemberRole;
}

/**
 * `tradition` and `preferredLanguage` are GDPR Article 9 special-category data.
 * They must never be sent to an analytics processor, never inferred from
 * behaviour, and both are legitimately null — the product works without them.
 */
export interface Profile {
  displayName: string | null;
  preferredLanguage: string | null;
  tradition: string | null;
  reminderLocalTime: string | null;
  timezone: string;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface Me {
  authenticated: boolean;
  userId?: string;
  /** Server-computed. NEVER derive access from a client-side purchase result. */
  hasAccess: boolean;
  profile?: Profile | null;
  memberships?: Membership[];
}

// ---------------------------------------------------------------------------
// Entitlements (mirrors app.entitlement_state)
// ---------------------------------------------------------------------------

export type EntitlementState =
  | 'pending' | 'active' | 'grace' | 'expired' | 'refunded' | 'revoked';

/** Where the purchase happened. Drives whether commerce UI may render — Apple 3.1.3(b). */
export type PurchasePlatform = 'web' | 'apple' | 'google' | 'bank';

// ---------------------------------------------------------------------------
// Practice session state
// ---------------------------------------------------------------------------

export type PlaybackMode = 'audio' | 'silent';

export interface PracticeSessionState {
  versionId: string;
  glossLanguage: string;
  duration: DurationVariant;
  mode: PlaybackMode;
  currentSegmentOrdinal: number;
  elapsedMs: number;
  completed: boolean;
}

// ---------------------------------------------------------------------------
// Re-entry after a lapse. See web/src/lib/reentry.ts for the policy.
// ---------------------------------------------------------------------------

export interface ReentryDecision {
  /** Which day of the program to serve. NEVER the calendar day. */
  serveDayIndex: number;
  /** Shown above Today. Must never shame, count missed days, or reset progress. */
  message: string;
  /** Force the 3-minute variant regardless of the member's usual choice. */
  forceShortVariant: boolean;
  /** Offer "shift my schedule" / "start again" alongside continuing. */
  offerReschedule: boolean;
}

// ---------------------------------------------------------------------------
// Raw RPC shapes (snake_case as Postgres returns them) + mappers.
// Keeping the boundary explicit stops snake_case leaking through the UI.
// ---------------------------------------------------------------------------

export interface RawSegment {
  ordinal: number;
  source_text: string;
  transliteration: string | null;
  translation: string;
  meaning: string;
  start_ms: number;
  end_ms: number;
  is_silence: boolean;
}

export interface RawPracticeDocument {
  version_id: string;
  title: string;
  purpose: string;
  source_citation: string;
  source_language: string;
  script: ScriptCode;
  direction: TextDirection;
  transliteration_scheme: string | null;
  gloss_language: string;
  duration_variant: DurationVariant;
  audio_object_key: string | null;
  reviewer: { name: string; credentials: string };
  segments: RawSegment[];
  corrections: Array<{ what_changed: string; why: string; corrected_at: string; by: string }>;
}

export function mapPracticeDocument(raw: RawPracticeDocument): PracticeDocument {
  return {
    versionId: raw.version_id,
    title: raw.title,
    purpose: raw.purpose,
    sourceCitation: raw.source_citation,
    sourceLanguage: raw.source_language,
    script: raw.script,
    direction: raw.direction,
    transliterationScheme: raw.transliteration_scheme,
    glossLanguage: raw.gloss_language,
    durationVariant: raw.duration_variant,
    audioObjectKey: raw.audio_object_key,
    reviewer: raw.reviewer,
    segments: raw.segments.map((s) => ({
      ordinal: s.ordinal,
      sourceText: s.source_text,
      transliteration: s.transliteration,
      translation: s.translation,
      meaning: s.meaning,
      startMs: s.start_ms,
      endMs: s.end_ms,
      isSilence: s.is_silence,
    })),
    corrections: raw.corrections.map((c) => ({
      whatChanged: c.what_changed,
      why: c.why,
      correctedAt: c.corrected_at,
      by: c.by,
    })),
  };
}

/**
 * Which segment is active at a given playback position.
 * Used by both the audio player and silent mode, so the two cannot drift apart.
 * Returns -1 before the first segment starts.
 */
export function segmentAt(segments: Segment[], elapsedMs: number): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (elapsedMs >= segments[i].startMs) return i;
  }
  return -1;
}

/** Total run time of a duration variant, derived from its segments. */
export function totalDurationMs(segments: Segment[]): number {
  return segments.length === 0 ? 0 : segments[segments.length - 1].endMs;
}
