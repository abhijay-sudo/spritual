import type { WisdomHit, WisdomLanguage, WisdomPassage } from "./types.ts";

const DEVANAGARI_NUMERALS = "०१२३४५६७८९";

const TOPICS: readonly { tags: readonly string[]; signals: readonly string[] }[] = [
  { tags: ["purpose", "work", "कर्म"], signals: ["purpose", "action", "act", "effort", "work", "outcome", "result", "postpone", "uncertain", "कर्म", "काम", "फल", "मेहनत", "परिणाम"] },
  { tags: ["balance", "change", "failure", "संतुलन"], signals: ["balance", "steady", "calm", "change", "reaction", "response", "stress", "anxious", "worry", "failure", "success", "संतुलन", "समत्व", "चिंता", "तनाव", "बदलाव"] },
  { tags: ["attention", "distraction", "return", "ध्यान"], signals: ["attention", "focus", "distraction", "mind", "meditation", "wander", "return", "ध्यान", "मन", "एकाग्रता", "भटक", "वापस"] },
];

const stop = new Set(["the", "and", "for", "but", "with", "what", "how", "when", "that", "this", "have", "i'm", "into", "about", "from", "मुझे", "क्या", "है", "में", "को", "का", "की", "से", "और"]);

export function normalizeQuery(value: string): string {
  return value
    .replace(/[०-९]/g, (digit) => String(DEVANAGARI_NUMERALS.indexOf(digit)))
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}.]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function words(text: string): string[] {
  return normalizeQuery(text).split(" ").filter((word) => word.length > 1 && !stop.has(word)).map((word) => {
    if (/^worr(?:y|ied|ying)$/.test(word)) return "worry";
    if (/^fail(?:ed|ing|ure|ures)?$/.test(word)) return "failure";
    if (/^result(?:s)?$/.test(word)) return "result";
    if (/^wander(?:s|ed|ing)?$/.test(word)) return "wander";
    if (/^focus(?:ed|ing)?$/.test(word)) return "focus";
    return word;
  });
}

function containsToken(haystack: readonly string[], token: string): boolean {
  return haystack.some((word) => word === token || (/[\u0900-\u097f]/u.test(token) && token.length >= 3 && word.startsWith(token)));
}

function verseReference(query: string): { chapter: number; verse: number } | null {
  const match = normalizeQuery(query).match(/(?:^|\s)(?:bg\s*|gita\s*|गीता\s*)?(\d{1,3})\s*[.:\s]\s*(\d{1,3})(?:\s|$)/);
  return match ? { chapter: Number(match[1]), verse: Number(match[2]) } : null;
}

function referenceOf(passage: WisdomPassage): { chapter: number; verse: number } | null {
  const match = passage.reference.match(/(\d{1,3})\s*[.:]\s*(\d{1,3})\s*$/);
  return match ? { chapter: Number(match[1]), verse: Number(match[2]) } : null;
}

export interface RetrievalOptions {
  language?: WisdomLanguage;
  maxResults?: number;
  /** Exact references bypass this threshold. */
  minScore?: number;
}

/** Deterministic, offline lexical + theme retrieval. No model, telemetry or network use. */
export function retrieveWisdom(query: string, passages: readonly WisdomPassage[], options: RetrievalOptions = {}): WisdomHit[] {
  const clean = normalizeQuery(query.slice(0, 500));
  if (!clean) return [];
  const tokens = words(clean);
  const exact = verseReference(clean);
  const max = Math.max(1, Math.min(options.maxResults ?? 3, 10));
  const threshold = options.minScore ?? 2;

  return passages.flatMap((passage) => {
    if (options.language && passage.language !== options.language) return [];
    const ref = referenceOf(passage);
    if (exact && (!ref || ref.chapter !== exact.chapter || ref.verse !== exact.verse)) return [];
    const referenceMatch = Boolean(exact && ref);
    const haystack = words([passage.work, passage.reference, passage.original, passage.transliteration ?? "", passage.translation ?? "", passage.interpretation ?? "", ...(passage.tags ?? []), ...(passage.aliases ?? [])].join(" "));
    const tags = words([...(passage.tags ?? []), ...(passage.aliases ?? [])].join(" "));
    const matched = new Set<WisdomHit["matchedBy"][number]>();
    let score = referenceMatch ? 100 : 0;
    if (referenceMatch) matched.add("reference");
    for (const token of tokens) {
      if (containsToken(tags, token)) { score += 4; matched.add("theme"); }
      else if (containsToken(haystack, token)) { score += 1.5; matched.add("text"); }
    }
    for (const topic of TOPICS) {
      if (!topic.signals.some((term) => containsToken(tokens, term))) continue;
      if (topic.tags.some((key) => containsToken(tags, key))) {
        score += 2;
        matched.add("theme");
      }
    }
    if (score < threshold) return [];
    return [{ passage, score: Math.round(score * 10) / 10, matchedBy: [...matched] }];
  }).sort((a, b) => b.score - a.score || a.passage.id.localeCompare(b.passage.id))
    .filter((hit, _, sorted) => Boolean(exact) || hit.score >= Math.max(threshold, sorted[0].score * 0.5))
    .slice(0, max);
}
