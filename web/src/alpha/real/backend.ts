import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type RealLanguage = "en" | "hi";

export type RealCircle = {
  cohortId: string;
  orgId: string;
  orgName: string;
  name: string;
  startsAt: string;
  endsAt: string;
  role: "member" | "teacher" | "admin" | "reviewer";
};

export type RealReading = {
  releaseId: string;
  releaseAt: string;
  renderingId: string;
  canonicalId: string;
  reference: string;
  workSlug: string;
  workTitle: string;
  kind: string;
  language: RealLanguage;
  body: string;
  transliteration: string | null;
  accessClass: "public" | "member" | "paid";
  sourceTitle: string;
  sourceUrl: string | null;
  sourceIdentifier: string;
  editionLabel: string;
  attribution: string | null;
  licenseKind: string;
  reviewerName: string;
  reviewedAt: string;
};

// These marks are explicit member actions. They contain no reflection text,
// page views, scores, or claim that reading equals understanding.
export type RealReadingMark = {
  releaseId: string;
  bookmarkedAt: string | null;
  completedAt: string | null;
};

export type RealReadingProgress = RealReadingMark & {
  cohortId: string;
  reference: string;
  workTitle: string;
  language: RealLanguage;
};

export type RealMarkKind = "bookmark" | "completed";

export class RealBackendError extends Error {
  readonly kind: "config" | "rpc" | "data" | "input";
  readonly code?: string;
  constructor(kind: "config" | "rpc" | "data" | "input", code?: string) {
    super(kind);
    this.name = "RealBackendError";
    this.kind = kind;
    this.code = code;
  }
}

type RealConfig = { url: string; publishableKey: string };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Legacy anon JWTs are permitted for a local Supabase project. A service-role
// JWT or an sb_secret key must never be accepted in a browser bundle.
function isBrowserKey(key: string): boolean {
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
  const parts = key.split(".");
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))) as { role?: unknown };
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export function validateRealConfig(url: string | undefined, publishableKey: string | undefined): RealConfig {
  if (!url?.trim() || !publishableKey?.trim()) throw new RealBackendError("config", "missing");
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new RealBackendError("config", "url"); }
  const local = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
  if ((parsed.protocol !== "https:" && !(local && parsed.protocol === "http:")) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new RealBackendError("config", "url");
  }
  if (!isBrowserKey(publishableKey.trim())) throw new RealBackendError("config", "key");
  return { url: parsed.href.replace(/\/$/, ""), publishableKey: publishableKey.trim() };
}

export function createRealClient(config: RealConfig): SupabaseClient {
  return createClient(config.url, config.publishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "spritual_alpha_real_auth",
    },
  });
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new RealBackendError("data");
  return value as Record<string, unknown>;
}

function string(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) throw new RealBackendError("data");
  return value;
}

function optionalString(value: unknown): string | null {
  if (value === null) return null;
  return string(value);
}

function uuid(value: unknown): string {
  const result = string(value);
  if (!uuidPattern.test(result)) throw new RealBackendError("data");
  return result;
}

function date(value: unknown): string {
  const result = string(value);
  if (Number.isNaN(Date.parse(result))) throw new RealBackendError("data");
  return result;
}

function optionalDate(value: unknown): string | null {
  return value === null ? null : date(value);
}

export function parseRealReadingMark(value: unknown): RealReadingMark {
  const row = record(value);
  return {
    releaseId: uuid(row.release_id),
    bookmarkedAt: optionalDate(row.bookmarked_at),
    completedAt: optionalDate(row.completed_at),
  };
}

export function parseRealReadingProgress(value: unknown): RealReadingProgress {
  const row = record(value);
  const language = string(row.language_code);
  if (language !== "en" && language !== "hi") throw new RealBackendError("data");
  return {
    ...parseRealReadingMark(row),
    cohortId: uuid(row.cohort_id),
    reference: string(row.canonical_reference),
    workTitle: string(row.work_title),
    language,
  };
}

export function parseRealCircle(value: unknown): RealCircle {
  const row = record(value);
  const role = string(row.my_role);
  if (!["member", "teacher", "admin", "reviewer"].includes(role)) throw new RealBackendError("data");
  return {
    cohortId: uuid(row.cohort_id),
    orgId: uuid(row.org_id),
    orgName: string(row.org_name),
    name: string(row.circle_name),
    startsAt: date(row.start_at),
    endsAt: date(row.end_at),
    role: role as RealCircle["role"],
  };
}

export function parseRealReading(value: unknown): RealReading {
  const row = record(value);
  const language = string(row.language_code);
  const accessClass = string(row.access_class);
  if (language !== "en" && language !== "hi") throw new RealBackendError("data");
  if (!["public", "member", "paid"].includes(accessClass)) throw new RealBackendError("data");
  const sourceUrl = optionalString(row.source_url);
  if (sourceUrl) {
    let parsed: URL;
    try { parsed = new URL(sourceUrl); } catch { throw new RealBackendError("data"); }
    if (!["http:", "https:"].includes(parsed.protocol)) throw new RealBackendError("data");
  }
  return {
    releaseId: uuid(row.release_id),
    releaseAt: date(row.release_at),
    renderingId: uuid(row.rendering_id),
    canonicalId: string(row.canonical_id),
    reference: string(row.canonical_reference),
    workSlug: string(row.work_slug),
    workTitle: string(row.work_title),
    kind: string(row.content_kind),
    language,
    body: string(row.body),
    transliteration: optionalString(row.transliteration),
    accessClass: accessClass as RealReading["accessClass"],
    sourceTitle: string(row.source_title),
    sourceUrl,
    sourceIdentifier: string(row.source_identifier),
    editionLabel: string(row.edition_label),
    attribution: optionalString(row.attribution_text),
    licenseKind: string(row.license_kind),
    reviewerName: string(row.reviewer_name),
    reviewedAt: date(row.reviewed_at),
  };
}

export async function loadMyCircles(client: SupabaseClient): Promise<RealCircle[]> {
  const { data, error } = await client.schema("app").rpc("fn_my_circles");
  if (error) throw new RealBackendError("rpc", error.code);
  if (!Array.isArray(data)) throw new RealBackendError("data");
  return data.map(parseRealCircle);
}

/** Only a current organization teacher/admin gets the delivery entry point.
 * This controls navigation; every teacher RPC still authorizes on the server. */
export async function loadTeacherAccess(client: SupabaseClient): Promise<boolean> {
  const { data, error } = await client.schema("app").rpc("fn_me");
  if (error) throw new RealBackendError("rpc", error.code);
  const identity = record(data);
  if (identity.authenticated !== true || !Array.isArray(identity.memberships)) throw new RealBackendError("data");
  uuid(identity.user_id);
  const roles = identity.memberships.map(value => {
    const membership = record(value);
    uuid(membership.org_id);
    const role = string(membership.role);
    if (!["member", "teacher", "admin", "reviewer"].includes(role)) throw new RealBackendError("data");
    return role;
  });
  return roles.includes("teacher") || roles.includes("admin");
}

export async function loadCircleReadings(client: SupabaseClient, cohortId: string, language: RealLanguage): Promise<RealReading[]> {
  uuid(cohortId);
  const { data, error } = await client.schema("app").rpc("fn_circle_readings", {
    p_cohort_id: cohortId,
    p_language: language,
  });
  if (error) throw new RealBackendError("rpc", error.code);
  if (!Array.isArray(data)) throw new RealBackendError("data");
  return data.map(parseRealReading);
}

export async function loadReadingProgress(client: SupabaseClient, cohortId: string | null = null): Promise<RealReadingProgress[]> {
  if (cohortId !== null) uuid(cohortId);
  const { data, error } = await client.schema("app").rpc("fn_my_circle_reading_progress", { p_cohort_id: cohortId });
  if (error) throw new RealBackendError("rpc", error.code);
  if (!Array.isArray(data)) throw new RealBackendError("data");
  return data.map(parseRealReadingProgress);
}

export async function setReadingMark(client: SupabaseClient, releaseId: string, kind: RealMarkKind, enabled: boolean): Promise<RealReadingMark> {
  uuid(releaseId);
  if (kind !== "bookmark" && kind !== "completed") throw new RealBackendError("input", "mark");
  if (typeof enabled !== "boolean") throw new RealBackendError("input", "mark");
  const { data, error } = await client.schema("app").rpc("fn_set_circle_reading_mark", {
    p_release_id: releaseId,
    p_kind: kind,
    p_enabled: enabled,
  });
  if (error) throw new RealBackendError("rpc", error.code);
  return parseRealReadingMark(data);
}

export async function clearMyReadingProgress(client: SupabaseClient): Promise<number> {
  const { data, error } = await client.schema("app").rpc("fn_clear_my_reading_progress");
  if (error) throw new RealBackendError("rpc", error.code);
  if (typeof data !== "number" || !Number.isSafeInteger(data) || data < 0) throw new RealBackendError("data");
  return data;
}

export async function claimCircleSeat(client: SupabaseClient, token: string, adultConfirmed: boolean): Promise<string> {
  const normalized = token.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(normalized)) throw new RealBackendError("input", "token");
  if (!adultConfirmed) throw new RealBackendError("input", "adult");
  const { data, error } = await client.schema("app").rpc("fn_claim_seat", {
    p_token: normalized,
    p_adult: true,
  });
  if (error) throw new RealBackendError("rpc", error.code);
  return uuid(record(data).cohort_id);
}

export function realErrorMessage(error: unknown, language: RealLanguage = "en"): string {
  if (language === "hi") {
    if (error instanceof RealBackendError) {
      if (error.kind === "config") return error.code === "key"
        ? "ब्राउज़र की कुंजी गायब या असुरक्षित है। केवल Supabase की publishable या पुरानी anon कुंजी इस्तेमाल करें; secret या service-role कुंजी कभी नहीं।"
        : "वास्तविक मोड के लिए सही Supabase URL और ब्राउज़र publishable कुंजी चाहिए। डेमो पहचान या पाठ नहीं दिखाए गए हैं।";
      if (error.kind === "data") return "सामग्री सेवा से असामान्य उत्तर मिला। फिर कोशिश करें या संचालक से स्कीमा जाँचने को कहें।";
      if (error.kind === "input") return error.code === "adult" ? "निमंत्रण स्वीकार करने से पहले वयस्क होने की पुष्टि करें।" : "अपने खाते के लिए मिला पूरा निमंत्रण कोड डालें।";
      if (error.code === "42501") return "यह समूह अब इस खाते के लिए उपलब्ध नहीं है। आपकी पहुँच या पाठ बदल गया हो सकता है।";
      if (error.code === "P0002" || error.code === "23505") return "यह निमंत्रण स्वीकार नहीं हो सकता। इसकी अवधि खत्म हो सकती है, यह पहले उपयोग हो चुका हो, किसी दूसरे खाते के लिए हो, या समूह भरा हो। आयोजक से संपर्क करें।";
      if (error.code === "23514") return "यह अनुरोध स्वीकार नहीं हुआ। विवरण जाँचें और फिर कोशिश करें।";
      if (error.code === "PGRST106") return "इस Supabase प्रोजेक्ट में app API स्कीमा उपलब्ध नहीं है। संचालक को Data API तैयार करनी होगी।";
      if (error.code === "PGRST202" || error.code === "42883") return "इस प्रोजेक्ट में ज़रूरी समूह फ़ंक्शन उपलब्ध नहीं हैं। संचालक को माइग्रेशन जाँचने होंगे।";
    }
    return "सामग्री सेवा से संपर्क नहीं हो सका। अपना इंटरनेट जाँचें और फिर कोशिश करें।";
  }
  if (error instanceof RealBackendError) {
    if (error.kind === "config") {
      if (error.code === "key") return "The browser key is missing or unsafe. Use a Supabase publishable key or a legacy anon key, never a secret or service-role key.";
      return "Real mode needs a valid Supabase URL and browser publishable key. No local identities or readings have been substituted.";
    }
    if (error.kind === "data") return "The content service returned an unexpected response. Please try again or ask the operator to check its schema.";
    if (error.kind === "input") return error.code === "adult" ? "Please confirm that you are an adult before claiming this invitation." : "Enter the complete invitation code shared for your account.";
    if (error.code === "42501") return "This circle is no longer available to this account. Your access or the reading may have changed.";
    if (error.code === "P0002" || error.code === "23505") return "This invitation cannot be claimed. It may be expired, already used, for another account, or the circle may be full. Ask your organiser for help.";
    if (error.code === "23514") return "This request could not be accepted. Check the details and try again.";
    if (error.code === "PGRST106") return "The app API schema is not exposed by this Supabase project. The operator must configure the Data API.";
    if (error.code === "PGRST202" || error.code === "42883") return "The required circle functions are not available in this project. The operator must check its migrations.";
  }
  return "Could not reach the content service. Check your connection and try again.";
}
