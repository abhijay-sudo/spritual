import type { KnowledgeLanguage } from "./types";

export type PublicStoryLink = { url: string; localOnly: boolean };

/** A native localhost origin is never a shareable URL. Config is an origin, not a path. */
export function publicStoryLink(slug: string, language: KnowledgeLanguage, pageOrigin: string,
  configuredOrigin: string | undefined, native: boolean): PublicStoryLink | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  let origin: URL;
  try {
    if (configuredOrigin) {
      origin = new URL(configuredOrigin);
      if (origin.protocol !== "https:" || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return null;
    } else {
      if (native) return null;
      origin = new URL(pageOrigin);
      if (!(["https:", "http:"].includes(origin.protocol)) || origin.username || origin.password || origin.pathname !== "/") return null;
    }
    const localOnly = ["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname);
    if (native && localOnly) return null;
    const url = new URL(`/alpha/stories/${slug}`, origin);
    if (language === "hi") url.searchParams.set("language", "hi");
    return { url: url.href, localOnly };
  } catch { return null; }
}
