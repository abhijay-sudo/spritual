/** Server-only provider adapters. Never import this module into a Vite/Capacitor entry. */
export interface ProviderRequest {
  system: string;
  user: string;
  maxOutputTokens: number;
  signal?: AbortSignal;
}

export interface ProviderResult {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
}

export interface AIProvider {
  id: string;
  generate(request: ProviderRequest): Promise<ProviderResult>;
}

export class ProviderFailure extends Error {
  readonly code: "rate_limited" | "temporary" | "unauthorized" | "invalid_response";
  readonly retryable: boolean;
  constructor(code: "rate_limited" | "temporary" | "unauthorized" | "invalid_response", retryable: boolean) {
    super(code);
    this.code = code;
    this.retryable = retryable;
  }
}

/** OpenAI-compatible wire shape; the server owner supplies an authorized endpoint/key. */
export function createChatCompletionsProvider(config: {
  id: string;
  endpoint: string;
  model: string;
  apiKey: string;
  fetcher?: typeof fetch;
}): AIProvider {
  const endpoint = new URL(config.endpoint);
  if (endpoint.protocol !== "https:" || !config.apiKey || !config.model) {
    throw new Error("Provider requires an HTTPS endpoint, model and server-held API key");
  }
  const requestFetch = config.fetcher ?? fetch;
  return {
    id: config.id,
    async generate(request) {
      let response: Response;
      try {
        response = await requestFetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` },
          body: JSON.stringify({ model: config.model, temperature: 0.2, max_tokens: request.maxOutputTokens,
            messages: [{ role: "system", content: request.system }, { role: "user", content: request.user }] }),
          signal: request.signal,
        });
      } catch (error) {
        if (request.signal?.aborted) throw error;
        throw new ProviderFailure("temporary", true);
      }
      if (!response.ok) {
        if (response.status === 429) throw new ProviderFailure("rate_limited", true);
        if (response.status === 401 || response.status === 403) throw new ProviderFailure("unauthorized", false);
        throw new ProviderFailure("temporary", response.status >= 500);
      }
      let data: unknown;
      try { data = await response.json(); } catch { throw new ProviderFailure("invalid_response", false); }
      if (!data || typeof data !== "object" || !("choices" in data) || !Array.isArray(data.choices)) {
        throw new ProviderFailure("invalid_response", false);
      }
      const text = (data.choices[0] as { message?: { content?: unknown } } | undefined)?.message?.content;
      if (typeof text !== "string" || text.length > 16000) throw new ProviderFailure("invalid_response", false);
      const usage = "usage" in data ? data.usage as { prompt_tokens?: unknown; completion_tokens?: unknown } : undefined;
      return { text,
        inputTokens: typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
        outputTokens: typeof usage?.completion_tokens === "number" ? usage.completion_tokens : undefined };
    },
  };
}

/** Optional documented free-plan adapter. Only this server module reads the key. */
export function createGroqProviderFromEnvironment(env: { GROQ_API_KEY?: string } = process.env): AIProvider | null {
  if (!env.GROQ_API_KEY) return null;
  return createChatCompletionsProvider({
    id: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "openai/gpt-oss-20b",
    apiKey: env.GROQ_API_KEY,
  });
}

interface CircuitState { failures: number; reopenAt: number }

export class ProviderRouter {
  private readonly state = new Map<string, CircuitState>();
  private readonly usage = new Map<string, { requests: number; inputTokens: number; outputTokens: number }>();
  private readonly providers: readonly AIProvider[];
  private readonly timeoutMs: number;
  private readonly now: () => number;

  constructor(providers: readonly AIProvider[], timeoutMs = 8000, now = () => Date.now()) {
    this.providers = providers;
    this.timeoutMs = timeoutMs;
    this.now = now;
  }

  getUsage() { return Object.fromEntries(this.usage); }

  async generate(request: Omit<ProviderRequest, "signal"> & { signal?: AbortSignal }): Promise<{ result: ProviderResult; providerId: string } | null> {
    for (const provider of this.providers) {
      const state = this.state.get(provider.id);
      if (state && state.reopenAt > this.now()) continue;
      for (let attempt = 0; attempt < 2; attempt++) {
        if (request.signal?.aborted) throw request.signal.reason ?? new Error("cancelled");
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(new Error("provider timeout")), this.timeoutMs);
        const onCancel = () => controller.abort(request.signal?.reason);
        request.signal?.addEventListener("abort", onCancel, { once: true });
        try {
          const result = await provider.generate({ ...request, signal: controller.signal });
          this.state.delete(provider.id);
          const usage = this.usage.get(provider.id) ?? { requests: 0, inputTokens: 0, outputTokens: 0 };
          usage.requests++;
          usage.inputTokens += result.inputTokens ?? 0;
          usage.outputTokens += result.outputTokens ?? 0;
          this.usage.set(provider.id, usage);
          return { result, providerId: provider.id };
        } catch (error) {
          if (request.signal?.aborted) throw error;
          const retryable = error instanceof ProviderFailure ? error.retryable : controller.signal.aborted;
          if (retryable && attempt === 0) {
            await new Promise<void>((resolve) => setTimeout(resolve, 120 + Math.floor(Math.random() * 80)));
            continue;
          }
          const failures = (state?.failures ?? 0) + 1;
          this.state.set(provider.id, { failures, reopenAt: this.now() + Math.min(30000, 1000 * 2 ** Math.min(failures, 5)) });
          break;
        } finally {
          clearTimeout(timeout);
          request.signal?.removeEventListener("abort", onCancel);
        }
      }
    }
    return null;
  }
}
