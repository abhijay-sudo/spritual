/**
 * Rebuild an editorial-only 700-verse candidate from exact Wikisource revisions.
 *
 * This deliberately writes outside the application bundle, and only with
 * --write. It cannot establish provenance, redistribution rights, textual
 * correctness, an editor's approval, or permission for provider-backed AI.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  auditGitaCandidate,
  extractWikisourceGitaChapter,
} from "../packages/content/src/gitaCandidate.ts";
import { WIKISOURCE_GITA_CANDIDATE } from "../packages/content/src/gitaSourceCandidate.ts";
import { listDemoCorpus } from "../packages/content/src/index.ts";

const WRITE_FLAG = "--write";
const outputFile = resolve(import.meta.dirname, "../artifacts/content-research/gita-wikisource-staging.json");
const userAgent = "SpritualContentResearch/0.1 (https://spiritual.co.in; local editorial research)";
const delayMs = 2500;
const maxRetryAfterSeconds = 120;

function hash(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function comparisonBody(text) {
  return text.normalize("NFC")
    .replace(/॥\s*[०-९0-9]+\s*[-.।]\s*[०-९0-9]+\s*॥/gu, "")
    .replace(/[\s।॥]/gu, "");
}

function compareCurrentDemo(chapters) {
  return listDemoCorpus().map((passage) => {
    const [chapterNumber, verseNumber] = passage.source.canonicalReference.split(".").map(Number);
    const staged = chapters[chapterNumber - 1].verses[verseNumber - 1].sanskrit;
    const demo = passage.renderings.find((rendering) => rendering.kind === "CANONICAL_TEXT" && rendering.language === "sa")?.text;
    if (!demo) throw new Error(`Demo ${passage.id} is missing Sanskrit`);
    const matchesAfterFormattingNormalization = comparisonBody(staged) === comparisonBody(demo);
    return {
      reference: `${chapterNumber}.${verseNumber}`,
      matchesAfterFormattingNormalization,
      ...(matchesAfterFormattingNormalization ? {} : { stagedSanskrit: staged, currentDemoSanskrit: demo }),
      editorialDecisionState: "pending",
    };
  });
}

function sleep(milliseconds) {
  return new Promise((done) => setTimeout(done, milliseconds));
}

function sourceRequestUrl(revision) {
  const url = new URL("https://sa.wikisource.org/w/api.php");
  url.search = new URLSearchParams({
    action: "parse",
    oldid: String(revision),
    prop: "wikitext",
    format: "json",
    maxlag: "5",
  });
  return url;
}

function retryDelay(response, attempt) {
  const retryAfter = Number(response.headers.get("retry-after"));
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(maxRetryAfterSeconds, Math.max(10, Math.ceil(retryAfter))) * 1000;
  }
  return Math.min(120_000, 15_000 * 2 ** attempt);
}

async function fetchPinnedWikitext(chapter) {
  const url = sourceRequestUrl(chapter.revision);
  for (let attempt = 0; attempt < 3; attempt++) {
    const response = await fetch(url, {
      headers: { "User-Agent": userAgent, Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });
    const body = await response.text();
    const throttled = response.status === 429 || body.startsWith("You are making too many requests") ||
      body.startsWith("You have reached the limit") || response.headers.has("retry-after");
    if (throttled) {
      if (attempt === 2) throw new Error(`Wikimedia rate limit persisted for chapter ${chapter.chapter}; stop and retry later`);
      const wait = retryDelay(response, attempt);
      process.stderr.write(`Wikimedia requested backoff for chapter ${chapter.chapter}; waiting ${wait / 1000}s\n`);
      await sleep(wait);
      continue;
    }
    if (!response.ok) throw new Error(`Wikimedia chapter ${chapter.chapter}: HTTP ${response.status}`);
    let payload;
    try { payload = JSON.parse(body); } catch {
      throw new Error(`Wikimedia chapter ${chapter.chapter}: response is not JSON`);
    }
    if (payload.error) {
      if ((payload.error.code === "maxlag" || payload.error.code === "ratelimited") && attempt < 2) {
        const wait = retryDelay(response, attempt);
        process.stderr.write(`Wikimedia API reported ${payload.error.code}; waiting ${wait / 1000}s\n`);
        await sleep(wait);
        continue;
      }
      throw new Error(`Wikimedia chapter ${chapter.chapter}: API error ${payload.error.code ?? "unknown"}`);
    }
    const result = payload.parse;
    if (result?.title !== chapter.title || result.revid !== chapter.revision ||
        typeof result.wikitext?.["*"] !== "string") {
      throw new Error(`Wikimedia chapter ${chapter.chapter}: title, revision or wikitext did not match manifest`);
    }
    return result.wikitext["*"];
  }
  throw new Error(`Wikimedia chapter ${chapter.chapter}: unavailable`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== WRITE_FLAG) || args.filter((arg) => arg === WRITE_FLAG).length > 1) {
    throw new Error(`Usage: node scripts/stage-gita-wikisource.mjs [${WRITE_FLAG}]`);
  }
  const chapters = [];
  for (const [index, source] of WIKISOURCE_GITA_CANDIDATE.chapters.entries()) {
    if (index > 0) await sleep(delayMs);
    const wikitext = await fetchPinnedWikitext(source);
    const sourceHash = hash(wikitext);
    if (sourceHash !== source.wikitextSha256) {
      throw new Error(`Chapter ${source.chapter}: pinned revision text differs from the research manifest hash`);
    }
    const extracted = extractWikisourceGitaChapter(source.chapter, wikitext);
    if (extracted.issues.length) throw new Error(`Chapter ${source.chapter}: ${extracted.issues.join("; ")}`);
    chapters.push({
      chapter: source.chapter,
      sourceTitle: source.title,
      sourceUrl: source.revisionUrl,
      sourceRevision: String(source.revision),
      sourceWikitextSha256: sourceHash,
      extractedVersesSha256: hash(JSON.stringify(extracted.verses)),
      verses: extracted.verses,
    });
    process.stdout.write(`Chapter ${source.chapter}: ${extracted.verses.length} numbered verses\n`);
  }
  const candidate = {
    schemaVersion: 1,
    extractionVersion: 2,
    work: "Bhagavad Gita",
    editionLabel: "Pinned Sanskrit Wikisource chapter transcription; underlying print edition unverified",
    rightsStatementUrl: WIKISOURCE_GITA_CANDIDATE.rightsStatementUrl,
    publicationState: "staging_only",
    reviewState: "unreviewed",
    rightsReviewState: "pending",
    aiUseAllowed: false,
    sourceOrganization: WIKISOURCE_GITA_CANDIDATE.sourceOrganization,
    provenanceReview: WIKISOURCE_GITA_CANDIDATE.provenanceReview,
    currentDemoReconciliation: compareCurrentDemo(chapters),
    generatedOn: new Date().toISOString(),
    chapters,
  };
  const audit = auditGitaCandidate(candidate);
  if (!audit.structurallyComplete || audit.verseCount !== 700 || audit.releaseEligible !== false) {
    throw new Error(`Structural candidate failed: ${audit.issues.join("; ")}`);
  }
  if (args.includes(WRITE_FLAG)) {
    await mkdir(resolve(outputFile, ".."), { recursive: true });
    await writeFile(outputFile, `${JSON.stringify(candidate, null, 2)}\n`, { flag: "w", mode: 0o600 });
    process.stdout.write(`Staged 700 structurally checked verses at ${outputFile}\n`);
  } else {
    process.stdout.write(`Validated 700 structurally checked verses. Pass ${WRITE_FLAG} for an ignored local editorial file.\n`);
  }
  for (const comparison of candidate.currentDemoReconciliation) {
    if (!comparison.matchesAfterFormattingNormalization) {
      process.stdout.write(`Existing demo ${comparison.reference} differs from this candidate; human edition decision required.\n`);
    }
  }
  process.stdout.write("Release and provider-backed AI remain blocked pending provenance, rights and named editorial review.\n");
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
