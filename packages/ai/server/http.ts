import type { IncomingMessage, ServerResponse } from "node:http";
import type { SpiritualIntelligenceEngine } from "./engine.ts";

export interface AiHttpOptions {
  engine: SpiritualIntelligenceEngine;
  /** Must verify a real user session; null denies. Demo identity is not authentication. */
  authenticate: (authorization: string | undefined) => Promise<string | null>;
  allowedOrigins: readonly string[];
  perMinuteLimit?: number;
}

function reply(res: ServerResponse, status: number, body: object) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" });
  res.end(JSON.stringify(body));
}

async function bodyUnderLimit(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  let total = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBytes) throw new Error("payload_too_large");
    chunks.push(buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new Error("invalid_json"); }
}

/** Injectable Node handler. No endpoint is opened until the host supplies auth and content adapters. */
export function createAiHttpHandler(options: AiHttpOptions) {
  const buckets = new Map<string, { start: number; count: number }>();
  const limit = Math.max(1, Math.min(options.perMinuteLimit ?? 12, 60));
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.url !== "/api/ai/ask") return reply(res, 404, { error: "not_found" });
    const origin = req.headers.origin;
    if (origin && !options.allowedOrigins.includes(origin)) return reply(res, 403, { error: "origin_denied" });
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    if (req.method === "OPTIONS") {
      res.writeHead(204, { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Authorization, Content-Type", "Access-Control-Max-Age": "600" });
      res.end();
      return;
    }
    if (req.method !== "POST") return reply(res, 405, { error: "method_not_allowed" });
    let subject: string | null;
    try { subject = await options.authenticate(req.headers.authorization); }
    catch { subject = null; }
    if (!subject) return reply(res, 401, { error: "authentication_required" });
    const now = Date.now();
    if (buckets.size > 5000) {
      for (const [key, value] of buckets) if (now - value.start >= 60000) buckets.delete(key);
      if (buckets.size > 5000) return reply(res, 503, { error: "temporarily_unavailable" });
    }
    const prior = buckets.get(subject);
    const bucket = prior && now - prior.start < 60000 ? prior : { start: now, count: 0 };
    bucket.count++;
    buckets.set(subject, bucket);
    if (bucket.count > limit) return reply(res, 429, { error: "rate_limited" });
    if (!req.headers["content-type"]?.startsWith("application/json")) return reply(res, 415, { error: "json_required" });
    try {
      const body = await bodyUnderLimit(req, 2048);
      if (!body || typeof body !== "object" || Array.isArray(body)) return reply(res, 400, { error: "invalid_request" });
      const data = body as Record<string, unknown>;
      if (typeof data.question !== "string" || data.question.trim().length < 1 || data.question.length > 500 ||
          (data.language !== "en" && data.language !== "hi") ||
          (data.consentToSendQuestion !== undefined && typeof data.consentToSendQuestion !== "boolean") ||
          (data.privateReflection !== undefined && typeof data.privateReflection !== "boolean") ||
          (data.consentToSendReflection !== undefined && typeof data.consentToSendReflection !== "boolean")) {
        return reply(res, 400, { error: "invalid_request" });
      }
      const controller = new AbortController();
      const onClose = () => controller.abort(new Error("client_disconnected"));
      res.once("close", onClose);
      try {
        const answer = await options.engine.ask({
          question: data.question, language: data.language,
          consentToSendQuestion: data.consentToSendQuestion === true,
          privateReflection: data.privateReflection === true,
          consentToSendReflection: data.consentToSendReflection === true,
          signal: controller.signal,
        });
        if (!res.destroyed) reply(res, 200, answer);
      } finally { res.off("close", onClose); }
    } catch (error) {
      if (res.destroyed) return;
      const code = error instanceof Error ? error.message : "unavailable";
      if (code === "payload_too_large") return reply(res, 413, { error: code });
      if (code === "invalid_json") return reply(res, 400, { error: code });
      if (code === "reflection_consent_required") return reply(res, 403, { error: code });
      return reply(res, 503, { error: "temporarily_unavailable" });
    }
  };
}
