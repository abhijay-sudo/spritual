/** Offline integrity check for the ignored, editorial-only Gita candidate. */
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { auditGitaCandidate, searchGitaCandidate } from "../packages/content/src/gitaCandidate.ts";
import { WIKISOURCE_GITA_CANDIDATE } from "../packages/content/src/gitaSourceCandidate.ts";

const file = resolve(import.meta.dirname, "../artifacts/content-research/gita-wikisource-staging.json");
const sha256 = (text) => createHash("sha256").update(text, "utf8").digest("hex");

async function main() {
  const raw = await readFile(file, "utf8");
  const candidate = JSON.parse(raw);
  const audit = auditGitaCandidate(candidate);
  const problems = [...audit.issues];
  if (candidate.schemaVersion !== 1 || candidate.extractionVersion !== 2) problems.push("Unexpected staging schema or extractor version");
  if (candidate.rightsReviewState !== "pending" || candidate.provenanceReview?.state !== "underlying_edition_unverified") {
    problems.push("Candidate must retain unresolved rights and edition states");
  }
  if (candidate.chapters?.length === WIKISOURCE_GITA_CANDIDATE.chapters.length) {
    for (const [index, chapter] of candidate.chapters.entries()) {
      const pinned = WIKISOURCE_GITA_CANDIDATE.chapters[index];
      if (chapter.sourceTitle !== pinned.title || chapter.sourceUrl !== pinned.revisionUrl ||
          chapter.sourceRevision !== String(pinned.revision) || chapter.sourceWikitextSha256 !== pinned.wikitextSha256) {
        problems.push(`Chapter ${index + 1}: source identity or pinned wikitext hash differs`);
      }
      if (chapter.extractedVersesSha256 !== sha256(JSON.stringify(chapter.verses))) {
        problems.push(`Chapter ${index + 1}: extracted verse content hash differs`);
      }
    }
  }
  if (audit.verseCount !== 700 || audit.releaseEligible !== false) problems.push("Candidate is not an unreleased 700-verse structure");
  if (problems.length) throw new Error(problems.join("; "));

  const demoDifferences = candidate.currentDemoReconciliation?.filter((item) => !item.matchesAfterFormattingNormalization)
    .map((item) => item.reference) ?? [];
  const sample = searchGitaCandidate(candidate, "२.४७");
  if (sample.length !== 1 || sample[0].reference !== "2.47") throw new Error("Exact-reference search failed");
  process.stdout.write(`Staged candidate: 18 chapters, ${audit.verseCount} structurally checked verses, SHA-256 ${sha256(raw)}\n`);
  process.stdout.write(`Existing demo text requiring edition reconciliation: ${demoDifferences.join(", ") || "none found"}\n`);
  process.stdout.write("Editorial quality, source rights, publication and AI-use approval remain pending.\n");
}

main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
