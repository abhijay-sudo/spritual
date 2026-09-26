/**
 * A deliberately separate staging gate for a proposed complete Gita source.
 * Passing these structural checks never records rights, editorial approval,
 * publication, or permission to send the text to an AI provider. Nothing in
 * this module is imported by the shipped member experience.
 */

export const STANDARD_GITA_VERSES_PER_CHAPTER = Object.freeze([
  47, 72, 43, 42, 29, 47, 30, 28, 34,
  42, 55, 20, 34, 27, 20, 24, 28, 78,
] as const);

export interface GitaCandidateVerse {
  verse: number;
  /** Verse body only; invocations and speaker cues are kept separately. */
  sanskrit: string;
  /** Source cue on this verse, never an inferred speaker for later verses. */
  speakerCue?: string;
  /** Non-verse lines removed from the opening poem block, for editor review. */
  sourcePrelude?: readonly string[];
}

export interface GitaCandidateChapter {
  chapter: number;
  /** A page or raw-file URL pinned to this exact chapter revision. */
  sourceUrl: string;
  sourceRevision: string;
  verses: readonly GitaCandidateVerse[];
}

export interface GitaCandidate {
  work: "Bhagavad Gita";
  /** A human-readable edition identity, not proof of edition rights. */
  editionLabel: string;
  /** A page whose exact terms a rights reviewer must inspect. */
  rightsStatementUrl: string;
  publicationState: "staging_only";
  reviewState: "unreviewed";
  aiUseAllowed: false;
  chapters: readonly GitaCandidateChapter[];
}

export interface GitaCandidateAudit {
  structurallyComplete: boolean;
  verseCount: number;
  issues: readonly string[];
  /** A structural validator cannot authorize a content release. */
  releaseEligible: false;
}

const devanagariDigits = "०१२३४५६७८९";
const verseMarker = /॥\s*([०-९0-9]+)\s*[-.।]\s*([०-९0-9]+)\s*॥/gu;
const sourceSpeakerCue = /^(?:धृतराष्ट्र उवाच|सञ्जय उवाच|अर्जुन उवाच|श्रीभगवानुवाच)$/u;
const sourceOpeningLine = /^(?:ॐ|श्रीपरमात्मने नमः|अथ श्रीमद्भगवद्गीता|प्रथमोऽध्यायः|अथ .+ऽध्यायः)$/u;

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}

function naturalNumber(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : null;
}

function numeral(value: string): number {
  const decimal = [...value].map((digit) => {
    const devanagari = devanagariDigits.indexOf(digit);
    return devanagari < 0 ? digit : String(devanagari);
  }).join("");
  return Number(decimal);
}

function httpsUrl(value: unknown): URL | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && !parsed.username && !parsed.password ? parsed : null;
  } catch {
    return null;
  }
}

function revisionMatchesUrl(url: URL, revision: string): boolean {
  return ["oldid", "revision", "rev", "version"].some((key) => url.searchParams.get(key) === revision)
    || url.pathname.split("/").some((segment) => segment === revision);
}

/**
 * Check the standard 700-verse chapter sequence and exact pinned source links.
 * An edition with a different verse count is reported for human reconciliation,
 * never silently truncated to fit this recension.
 */
export function auditGitaCandidate(input: unknown): GitaCandidateAudit {
  const issues: string[] = [];
  const candidate = asObject(input);
  if (!candidate) return { structurallyComplete: false, verseCount: 0, issues: ["Candidate must be an object"], releaseEligible: false };

  if (candidate.work !== "Bhagavad Gita") issues.push("Work must be Bhagavad Gita");
  if (typeof candidate.editionLabel !== "string" || !candidate.editionLabel.trim()) issues.push("Edition identity is required");
  if (!httpsUrl(candidate.rightsStatementUrl)) issues.push("An HTTPS rights-statement URL is required for human review");
  if (candidate.publicationState !== "staging_only" || candidate.reviewState !== "unreviewed" || candidate.aiUseAllowed !== false) {
    issues.push("Candidate must remain staging_only, unreviewed and AI-disabled");
  }
  if (!Array.isArray(candidate.chapters)) {
    issues.push("Chapters must be an array");
    return { structurallyComplete: false, verseCount: 0, issues, releaseEligible: false };
  }
  if (candidate.chapters.length !== STANDARD_GITA_VERSES_PER_CHAPTER.length) issues.push("Exactly 18 chapters are required");

  let verseCount = 0;
  for (let index = 0; index < candidate.chapters.length; index++) {
    const chapter = asObject(candidate.chapters[index]);
    const expectedChapter = index + 1;
    if (!chapter) { issues.push(`Chapter ${expectedChapter} must be an object`); continue; }
    if (chapter.chapter !== expectedChapter) issues.push(`Chapter ${expectedChapter}: number or order differs`);
    const sourceUrl = httpsUrl(chapter.sourceUrl);
    const revision = typeof chapter.sourceRevision === "string" ? chapter.sourceRevision.trim() : "";
    if (!sourceUrl || !revision || !revisionMatchesUrl(sourceUrl, revision)) {
      issues.push(`Chapter ${expectedChapter}: HTTPS source URL must pin the recorded revision`);
    }
    if (!Array.isArray(chapter.verses)) { issues.push(`Chapter ${expectedChapter}: verses must be an array`); continue; }
    verseCount += chapter.verses.length;
    const expectedCount = STANDARD_GITA_VERSES_PER_CHAPTER[index];
    if (expectedCount === undefined || chapter.verses.length !== expectedCount) {
      issues.push(`Chapter ${expectedChapter}: expected ${expectedCount ?? "no"} verses, received ${chapter.verses.length}`);
    }
    for (let verseIndex = 0; verseIndex < chapter.verses.length; verseIndex++) {
      const verse = asObject(chapter.verses[verseIndex]);
      const reference = `${expectedChapter}.${verseIndex + 1}`;
      if (!verse) { issues.push(`${reference}: verse must be an object`); continue; }
      if (naturalNumber(verse.verse) !== verseIndex + 1) issues.push(`${reference}: number or order differs`);
      const text = verse.sanskrit;
      if (typeof text !== "string" || text.length < 20 || text.length > 2000 ||
          (text.match(/[\u0904-\u0939]/gu)?.length ?? 0) < 12 || text.normalize("NFC") !== text ||
          /[<>]|\{\{|\}\}|\[\[|\]\]|\uFFFD|[\u0000-\u0008\u000B\u000C\u000E-\u001F]/u.test(text) ||
          sourceOpeningLine.test(text.split("\n", 1)[0].trim()) ||
          sourceSpeakerCue.test(text.split("\n", 1)[0].trim())) {
        issues.push(`${reference}: Sanskrit text is missing, malformed, or contains source markup`);
        continue;
      }
      if (verse.speakerCue !== undefined &&
          (typeof verse.speakerCue !== "string" || !sourceSpeakerCue.test(verse.speakerCue))) {
        issues.push(`${reference}: unknown speaker cue`);
      }
      if (verse.sourcePrelude !== undefined &&
          (!Array.isArray(verse.sourcePrelude) || verseIndex !== 0 ||
            verse.sourcePrelude.some((line: unknown) => typeof line !== "string" || !sourceOpeningLine.test(line)))) {
        issues.push(`${reference}: unrecognized source prelude`);
      }
      const markers = [...text.matchAll(verseMarker)];
      if (markers.length !== 1 || numeral(markers[0][1]) !== expectedChapter || numeral(markers[0][2]) !== verseIndex + 1) {
        issues.push(`${reference}: exactly one matching chapter/verse marker is required`);
      }
    }
  }
  return { structurallyComplete: issues.length === 0, verseCount, issues, releaseEligible: false };
}

export interface ExtractedWikisourceChapter {
  verses: readonly GitaCandidateVerse[];
  issues: readonly string[];
}

export interface GitaCandidateSearchHit {
  reference: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  sourceUrl: string;
  publicationState: "staging_only";
}

/**
 * Local editorial search only. It refuses malformed or promoted input and
 * never makes staged text available to the member application by itself.
 * Queries support 2.47 / २.४७ references or literal Devanagari phrases.
 */
export function searchGitaCandidate(input: unknown, query: string, limit = 20): readonly GitaCandidateSearchHit[] {
  if (!auditGitaCandidate(input).structurallyComplete || !Number.isInteger(limit) || limit < 1 || limit > 100) return [];
  const candidate = input as GitaCandidate;
  const normalized = query.trim().normalize("NFC").replace(/[०-९]/gu, (digit) => String(devanagariDigits.indexOf(digit)));
  if (!normalized || normalized.length > 100) return [];
  const reference = normalized.match(/^(?:bg\s*)?(\d{1,2})\s*[.।:]\s*(\d{1,2})$/iu);
  if (reference) {
    const chapterNumber = Number(reference[1]);
    const verseNumber = Number(reference[2]);
    const chapter = candidate.chapters[chapterNumber - 1];
    const verse = chapter?.verses[verseNumber - 1];
    return verse ? [{ reference: `${chapterNumber}.${verseNumber}`, chapter: chapterNumber, verse: verseNumber,
      sanskrit: verse.sanskrit, sourceUrl: chapter.sourceUrl, publicationState: "staging_only" }] : [];
  }
  const phrase = query.trim().normalize("NFC").replace(/\s+/gu, " ");
  if (phrase.length < 2 || !/[\u0904-\u0939]/u.test(phrase)) return [];
  const hits: GitaCandidateSearchHit[] = [];
  for (const chapter of candidate.chapters) {
    for (const verse of chapter.verses) {
      if (!verse.sanskrit.replace(/\s+/gu, " ").includes(phrase)) continue;
      hits.push({ reference: `${chapter.chapter}.${verse.verse}`, chapter: chapter.chapter, verse: verse.verse,
        sanskrit: verse.sanskrit, sourceUrl: chapter.sourceUrl, publicationState: "staging_only" });
      if (hits.length === limit) return hits;
    }
  }
  return hits;
}

function verseBodyAndContext(raw: string): { text: string; speakerCue?: string; sourcePrelude?: readonly string[] } {
  const lines = raw.replaceAll("'''", "").normalize("NFC").split("\n").map((line) => line.trim());
  while (lines[0] === "") lines.shift();
  const sourcePrelude: string[] = [];
  while (lines.length && sourceOpeningLine.test(lines[0])) {
    sourcePrelude.push(lines.shift()!);
    while (lines[0] === "") lines.shift();
  }
  let speakerCue: string | undefined;
  if (sourceSpeakerCue.test(lines[0] ?? "")) {
    speakerCue = lines.shift();
    while (lines[0] === "") lines.shift();
  }
  while (lines.at(-1) === "") lines.pop();
  return {
    text: lines.join("\n"),
    ...(speakerCue ? { speakerCue } : {}),
    ...(sourcePrelude.length ? { sourcePrelude } : {}),
  };
}

/**
 * Extract only <poem> blocks from a pinned Sanskrit Wikisource chapter dump.
 * Commentary and templates outside those blocks are deliberately excluded.
 * Unrecognized markup or multiple markers require manual correction.
 */
export function extractWikisourceGitaChapter(chapter: number, wikitext: string): ExtractedWikisourceChapter {
  const verses: GitaCandidateVerse[] = [];
  const issues: string[] = [];
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > 18 || typeof wikitext !== "string") {
    return { verses, issues: ["A chapter number from 1 to 18 and source wikitext are required"] };
  }
  const poems = [...wikitext.matchAll(/<poem>([\s\S]*?)<\/poem>/gu)];
  if (!poems.length) issues.push(`Chapter ${chapter}: no poem blocks found`);
  for (const [index, poem] of poems.entries()) {
    const context = verseBodyAndContext(poem[1]);
    const text = context.text;
    const markers = [...text.matchAll(verseMarker)];
    if (markers.length === 0) {
      // Wikisource also wraps a final chapter colophon in a poem block.
      // Only ignore it after every expected verse has already been seen.
      const isFinalColophon = index === poems.length - 1 &&
        verses.length === STANDARD_GITA_VERSES_PER_CHAPTER[chapter - 1] &&
        new RegExp(`॥\\s*${chapter}\\s*॥`, "u").test([...text].map((character) => {
          const digit = devanagariDigits.indexOf(character);
          return digit < 0 ? character : String(digit);
        }).join(""));
      if (!isFinalColophon) issues.push(`Chapter ${chapter}: poem ${index + 1} has no verse marker`);
      continue;
    }
    if (markers.length !== 1 || numeral(markers[0][1]) !== chapter ||
        !Number.isSafeInteger(numeral(markers[0][2])) || /[<>]|\{\{|\}\}|\[\[|\]\]/u.test(text)) {
      issues.push(`Chapter ${chapter}: poem ${index + 1} has ambiguous verse text or markup`);
      continue;
    }
    verses.push({ verse: numeral(markers[0][2]), sanskrit: text,
      ...(context.speakerCue ? { speakerCue: context.speakerCue } : {}),
      ...(context.sourcePrelude ? { sourcePrelude: context.sourcePrelude } : {}) });
  }
  return { verses, issues };
}
