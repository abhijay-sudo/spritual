/**
 * Compare bounded chapter-two and chapter-three slices with pinned page transcriptions tied
 * to a named 1901 scan. Research output only: no app import, rights decision,
 * scan-image proofing, Sanskrit editorial approval, or AI-use permission.
 *
 * node scripts/collate-gita-edition.mjs [--write]
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { auditGitaCandidate } from "../packages/content/src/gitaCandidate.ts";
import {
  ANANDASHRAM_1901_COLLATION,
  collateGitaEdition,
  extractVerseFromScanPageTranscription,
} from "../packages/content/src/gitaEditionCollation.ts";
import { WIKISOURCE_GITA_CANDIDATE } from "../packages/content/src/gitaSourceCandidate.ts";

const inputFile = resolve(import.meta.dirname, "../artifacts/content-research/gita-wikisource-staging.json");
const outputFile = resolve(import.meta.dirname, "../artifacts/content-research/gita-1901-page-collation.json");
const userAgent = "SpritualContentResearch/0.1 (https://spiritual.co.in; local editorial collation)";
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

async function readStagedCandidate() {
  let raw;
  try { raw = await readFile(inputFile, "utf8"); } catch {
    throw new Error(`Staged corpus missing: ${inputFile}. Run node scripts/stage-gita-wikisource.mjs --write first.`);
  }
  const candidate = JSON.parse(raw);
  const audit = auditGitaCandidate(candidate);
  if (!audit.structurallyComplete || audit.verseCount !== 700 ||
      candidate.schemaVersion !== 1 || candidate.extractionVersion !== 2 ||
      candidate.rightsReviewState !== "pending" || candidate.provenanceReview?.state !== "underlying_edition_unverified") {
    throw new Error("The staging-only 700-verse candidate failed its structural or status gate");
  }
  for (const [index, chapter] of candidate.chapters.entries()) {
    const pinned = WIKISOURCE_GITA_CANDIDATE.chapters[index];
    if (chapter.sourceUrl !== pinned.revisionUrl || chapter.sourceRevision !== String(pinned.revision) ||
        chapter.sourceWikitextSha256 !== pinned.wikitextSha256 ||
        chapter.extractedVersesSha256 !== sha256(JSON.stringify(chapter.verses))) {
      throw new Error(`Staged chapter ${index + 1} differs from its pinned source manifest`);
    }
  }
  return { candidate, candidateSha256: sha256(raw) };
}

async function pinnedPageObservations(pages) {
  const url = new URL("https://sa.wikisource.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    prop: "revisions",
    revids: [...new Set(pages.map((page) => page.pageOldid))].join("|"),
    rvprop: "ids|content",
    rvslots: "main",
    format: "json",
    maxlag: "5",
  });
  const response = await fetch(url, {
    headers: { "User-Agent": userAgent, Accept: "application/json" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`Page API returned HTTP ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(`Page API returned ${payload.error.code ?? "an error"}`);
  const byRevision = new Map();
  for (const result of Object.values(payload.query?.pages ?? {})) {
    const revision = result.revisions?.[0];
    if (revision) byRevision.set(revision.revid, { title: result.title, wikitext: revision.slots?.main?.["*"] });
  }
  return pages.map((page) => {
    const result = byRevision.get(page.pageOldid);
    if (result?.title !== page.pageTitle || typeof result.wikitext !== "string" ||
        sha256(result.wikitext) !== page.wikitextSha256) {
      throw new Error(`${page.reference}: page revision, title or pinned wikitext digest changed`);
    }
    return {
      reference: page.reference,
      wikitextSha256: page.wikitextSha256,
      sanskrit: extractVerseFromScanPageTranscription(result.wikitext, Number(page.reference.split(".")[1])),
    };
  });
}

async function main() {
  if (process.argv.length > 3 || (process.argv[2] && process.argv[2] !== "--write")) {
    throw new Error("Usage: node scripts/collate-gita-edition.mjs [--write]");
  }
  const { candidate, candidateSha256 } = await readStagedCandidate();
  const observations = [];
  const pagePins = ANANDASHRAM_1901_COLLATION.pages;
  for (let index = 0; index < pagePins.length; index += 8) {
    if (index) await new Promise((resolveSleep) => setTimeout(resolveSleep, 750));
    observations.push(...await pinnedPageObservations(pagePins.slice(index, index + 8)));
  }
  const report = { candidateSha256, ...collateGitaEdition(candidate, observations) };
  process.stdout.write(`1901 scan-linked page transcriptions compared: ${report.transcriptionsCompared}/700; same after layout normalization ${report.sameAfterLayoutNormalization}; text differs ${report.textDiffers}; uncollated ${report.notCollated}.\n`);
  for (const slice of report.researchSlices) {
    process.stdout.write(`Research slice ${slice.chapter}.${slice.firstVerse}–${slice.chapter}.${slice.lastVerse}; compared ${slice.compared}; pending within slice: ${slice.pendingReferences.join(", ") || "none"}.\n`);
  }
  for (const row of report.rows) process.stdout.write(`${row.reference}: ${row.comparison}; page ${row.scanPage}: ${row.pageTranscriptionUrl}\n`);
  process.stdout.write("Differences are editorial questions, not proven edition variants. Scan-image, rights and named Sanskrit review remain pending; release remains blocked.\n");
  if (process.argv[2] === "--write") {
    await mkdir(resolve(import.meta.dirname, "../artifacts/content-research"), { recursive: true });
    const temporary = `${outputFile}.tmp-${process.pid}`;
    try {
      await writeFile(temporary, `${JSON.stringify(report, null, 2)}\n`, { flag: "wx", mode: 0o600 });
      await rename(temporary, outputFile);
    } finally {
      await rm(temporary, { force: true });
    }
    process.stdout.write(`Editorial-only report written: ${outputFile}\n`);
  }
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
