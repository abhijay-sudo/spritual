import assert from "node:assert/strict";
import test from "node:test";
import { createServer } from "node:http";
import { once } from "node:events";
import { listDemoPassages } from "../packages/content/src/index.ts";
import { retrieveWisdom } from "../packages/ai/src/retrieval.ts";
import { buildGroundedFallback } from "../packages/ai/src/fallback.ts";
import { SpiritualIntelligenceEngine, validateProviderAnswer } from "../packages/ai/server/engine.ts";
import { createChatCompletionsProvider, createGroqProviderFromEnvironment, ProviderRouter, type AIProvider } from "../packages/ai/server/provider.ts";
import { createAiHttpHandler } from "../packages/ai/server/http.ts";

const demo = listDemoPassages("en");

test("offline retrieval finds exact English and Hindi-digit references without inventing a result", () => {
  for (const query of ["Gita 2.47", "BG 2:47", "गीता २.४७"]) {
    assert.deepEqual(retrieveWisdom(query, demo).map((hit) => hit.passage.id), ["bg.2.47"], query);
  }
  assert.deepEqual(retrieveWisdom("Gita 99.99", demo), []);
  assert.deepEqual(retrieveWisdom("quantum mango telescope", demo), []);
});

test("offline retrieval ranks topical matches and keeps source/editorial roles separate", () => {
  assert.deepEqual(retrieveWisdom("I keep worrying about the result of my work", demo).map((hit) => hit.passage.id), ["bg.2.47"]);
  assert.deepEqual(retrieveWisdom("work and balance", demo).map((hit) => hit.passage.id), ["bg.2.47", "bg.2.48"]);
  assert.equal(retrieveWisdom("my attention wanders", demo)[0]?.passage.id, "bg.6.26");
  const answer = buildGroundedFallback("Gita 2.48", retrieveWisdom("Gita 2.48", demo));
  assert.equal(answer.kind, "matched");
  assert.equal(answer.providerUsed, false);
  assert.equal(answer.sources[0].sourceUrl, demo[1].sourceUrl);
  assert.equal(answer.interpretation, demo[1].interpretation);
  assert.match(answer.disclosure, /unreviewed demo interpretation/);
});

test("low evidence and immediate safety questions do not produce scripture claims", () => {
  const unknown = buildGroundedFallback("unknown subject", []);
  assert.equal(unknown.kind, "unverified");
  assert.deepEqual(unknown.sources, []);
  assert.match(unknown.disclosure, /No verified passage/);
  assert.doesNotMatch(unknown.disclosure, /local match/);
  const safety = buildGroundedFallback("I want to kill myself", retrieveWisdom("Gita 2.47", demo));
  assert.equal(safety.kind, "safety");
  assert.deepEqual(safety.sources, []);
  assert.match(safety.disclosure, /local safety response/);
  assert.equal(buildGroundedFallback("मुझे जीना नहीं है", [], "hi").kind, "safety");
  for (const question of ["I feel suicidal", "I might harm myself", "I have no reason to live", "मैं खुद को नुकसान पहुँचाना चाहता हूँ"]) {
    const response = buildGroundedFallback(question, retrieveWisdom(question, demo));
    assert.equal(response.kind, "safety", question);
    assert.equal(response.providerUsed, false, question);
    assert.deepEqual(response.sources, [], question);
  }
  assert.match(safety.message, /Tele-MANAS.*14416/);
  assert.match(buildGroundedFallback("मुझे जीना नहीं है", [], "hi").message, /14416/);
});

test("demo rights block provider calls even when a provider is configured", async () => {
  let called = 0;
  const provider: AIProvider = { id: "test", async generate() { called++; return { text: "{}" }; } };
  const engine = new SpiritualIntelligenceEngine(async () => demo, new ProviderRouter([provider]));
  const answer = await engine.ask({ question: "Gita 2.47", language: "en", consentToSendQuestion: true });
  assert.equal(answer.kind, "matched");
  assert.equal(answer.providerUsed, false);
  assert.equal(called, 0);
  await assert.rejects(() => engine.ask({ question: "Gita 2.47", language: "en", privateReflection: true }), /reflection_consent_required/);
});

test("citation validator rejects invented IDs, direct quotes, extra fields and empty citations", () => {
  const allowed = new Set(["bg.2.47"]);
  const good = JSON.stringify({ explanation: "This passage concerns acting with care while uncertainty remains.", application: "Choose one small action.", citedPassageIds: ["bg.2.47"] });
  assert.equal(validateProviderAnswer(good, allowed)?.citedPassageIds[0], "bg.2.47");
  for (const candidate of [
    { explanation: "This passage concerns acting with care while uncertainty remains.", application: "Choose one small action.", citedPassageIds: ["bg.99.99"] },
    { explanation: "The verse says “every outcome is certain” and that is false.", application: "Choose one small action.", citedPassageIds: ["bg.2.47"] },
    { explanation: "This passage concerns acting with care while uncertainty remains.", application: "Choose one small action.", citedPassageIds: [] },
    { explanation: "This passage concerns acting with care while uncertainty remains.", application: "Choose one small action.", citedPassageIds: ["bg.2.47"], canonicalText: "invented" },
  ]) assert.equal(validateProviderAnswer(JSON.stringify(candidate), allowed), null);
});

test("provider failure falls back to cited local content and a valid structured result cites only retrieved sources", async () => {
  const reviewed = [{ ...demo[0], status: "reviewed" as const, aiUseAllowed: true }];
  const bad: AIProvider = { id: "bad", async generate() { return { text: JSON.stringify({ explanation: "This passage concerns work.", application: "Try one step.", citedPassageIds: ["bg.9.9"] }) }; } };
  const badEngine = new SpiritualIntelligenceEngine(async () => reviewed, new ProviderRouter([bad]));
  assert.equal((await badEngine.ask({ question: "Gita 2.47", language: "en", consentToSendQuestion: true })).providerUsed, false);
  const good: AIProvider = { id: "good", async generate() { return { text: JSON.stringify({ explanation: "This passage discusses care in action without clinging to results.", application: "Name one useful next step.", citedPassageIds: ["bg.2.47"] }) }; } };
  const goodEngine = new SpiritualIntelligenceEngine(async () => reviewed, new ProviderRouter([good]));
  const answer = await goodEngine.ask({ question: "Gita 2.47", language: "en", consentToSendQuestion: true });
  assert.equal(answer.providerUsed, true);
  assert.deepEqual(answer.sources.map((source) => source.id), ["bg.2.47"]);
  assert.match(answer.disclosure, /not been reviewed/);
});

test("question stays local until this request explicitly permits provider use", async () => {
  const reviewed = [{ ...demo[0], status: "reviewed" as const, aiUseAllowed: true }];
  let calls = 0;
  const provider: AIProvider = { id: "consent-test", async generate() { calls++; return { text: JSON.stringify({ explanation: "This passage discusses care in action without clinging to results.", application: "Name one useful next step.", citedPassageIds: ["bg.2.47"] }) }; } };
  const engine = new SpiritualIntelligenceEngine(async () => reviewed, new ProviderRouter([provider]));
  for (const consentToSendQuestion of [undefined, false]) {
    const answer = await engine.ask({ question: "Gita 2.47", language: "en", consentToSendQuestion });
    assert.equal(answer.kind, "matched");
    assert.equal(answer.providerUsed, false);
    assert.match(answer.disclosure, /not an AI-generated answer/);
  }
  assert.equal(calls, 0);
  assert.equal((await engine.ask({ question: "Gita 2.47", language: "en", consentToSendQuestion: true })).providerUsed, true);
  assert.equal(calls, 1);
});

test("provider adapter holds the key server-side, bounds output and router fails over", async () => {
  assert.equal(createGroqProviderFromEnvironment({ GROQ_API_KEY: undefined }), null);
  let seenAuthorization = "";
  const provider = createChatCompletionsProvider({
    id: "verified-test", endpoint: "https://provider.example/v1/chat/completions", model: "test-model", apiKey: "server-only-test-key",
    fetcher: async (_url, init) => {
      seenAuthorization = String(new Headers(init?.headers).get("authorization"));
      const sent = JSON.parse(String(init?.body));
      assert.equal(sent.max_tokens, 100);
      return Response.json({ choices: [{ message: { content: "safe response" } }], usage: { prompt_tokens: 12, completion_tokens: 3 } });
    },
  });
  const broken: AIProvider = { id: "broken", async generate() { throw new Error("offline"); } };
  const router = new ProviderRouter([broken, provider], 500);
  const result = await router.generate({ system: "system", user: "question", maxOutputTokens: 100 });
  assert.equal(result?.providerId, "verified-test");
  assert.equal(result?.result.text, "safe response");
  assert.equal(seenAuthorization, "Bearer server-only-test-key");
  assert.equal(router.getUsage()["verified-test"].inputTokens, 12);
});

test("HTTP adapter denies unauthenticated or cross-origin requests and enforces per-use reflection consent", async () => {
  const engine = new SpiritualIntelligenceEngine(async () => demo);
  const server = createServer(createAiHttpHandler({ engine, authenticate: async (header) => header === "Bearer valid" ? "u1" : null, allowedOrigins: ["http://127.0.0.1:5173"], perMinuteLimit: 3 }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/ai/ask`;
  const post = (headers: Record<string, string>, body: object) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  try {
    assert.equal((await post({}, { question: "Gita 2.47", language: "en" })).status, 401);
    assert.equal((await post({ Origin: "https://untrusted.example", Authorization: "Bearer valid" }, { question: "Gita 2.47", language: "en" })).status, 403);
    assert.equal((await fetch(url, { method: "OPTIONS", headers: { Origin: "http://127.0.0.1:5173", "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "Authorization, Content-Type" } })).status, 204);
    const headers = { Origin: "http://127.0.0.1:5173", Authorization: "Bearer valid" };
    assert.equal((await post(headers, { question: "private journal", language: "en", privateReflection: true })).status, 403);
    assert.equal((await post(headers, { question: "Gita 2.47", language: "en", consentToSendQuestion: "yes" })).status, 400);
    const result = await post(headers, { question: "Gita 2.47", language: "en" });
    assert.equal(result.status, 200);
    assert.equal((await result.json()).providerUsed, false);
    assert.equal((await post(headers, { question: "Gita 2.47", language: "en" })).status, 429);
  } finally { server.close(); }
});

test("HTTP question consent is required before a reviewed source reaches the provider adapter", async () => {
  const reviewed = [{ ...demo[0], status: "reviewed" as const, aiUseAllowed: true }];
  let calls = 0;
  const provider: AIProvider = { id: "http-consent-test", async generate() { calls++; return { text: JSON.stringify({ explanation: "This passage discusses care in action without clinging to results.", application: "Name one useful next step.", citedPassageIds: ["bg.2.47"] }) }; } };
  const engine = new SpiritualIntelligenceEngine(async () => reviewed, new ProviderRouter([provider]));
  const server = createServer(createAiHttpHandler({ engine, authenticate: async () => "test-user", allowedOrigins: [] }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const url = `http://127.0.0.1:${address.port}/api/ai/ask`;
  const post = async (body: object) => {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, 200);
    return response.json() as Promise<{ providerUsed: boolean }>;
  };
  try {
    assert.equal((await post({ question: "Gita 2.47", language: "en" })).providerUsed, false);
    assert.equal((await post({ question: "Gita 2.47", language: "en", consentToSendQuestion: false })).providerUsed, false);
    assert.equal(calls, 0);
    assert.equal((await post({ question: "Gita 2.47", language: "en", consentToSendQuestion: true })).providerUsed, true);
    assert.equal(calls, 1);
  } finally { server.close(); }
});
