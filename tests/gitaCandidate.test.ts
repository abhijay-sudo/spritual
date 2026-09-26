import assert from "node:assert/strict";
import test from "node:test";

import {
  STANDARD_GITA_VERSES_PER_CHAPTER,
  auditGitaCandidate,
  extractWikisourceGitaChapter,
  searchGitaCandidate,
  type GitaCandidate,
} from "../packages/content/src/gitaCandidate.ts";
import { WIKISOURCE_GITA_CANDIDATE } from "../packages/content/src/gitaSourceCandidate.ts";

function candidate(): GitaCandidate {
  return {
    work: "Bhagavad Gita",
    editionLabel: "Synthetic structural test only",
    rightsStatementUrl: "https://example.org/terms",
    publicationState: "staging_only",
    reviewState: "unreviewed",
    aiUseAllowed: false,
    chapters: STANDARD_GITA_VERSES_PER_CHAPTER.map((count, index) => ({
      chapter: index + 1,
      sourceUrl: `https://example.org/edition/chapter/${index + 1}?oldid=revision-${index + 1}`,
      sourceRevision: `revision-${index + 1}`,
      verses: Array.from({ length: count }, (_, verseIndex) => ({
        verse: verseIndex + 1,
        sanskrit: `उदाहरणार्थं संस्कृतपाठः॥${index + 1}.${verseIndex + 1}॥`,
      })),
    })),
  };
}

test("standard edition structure has exactly 700 verses but is never release-approved", () => {
  const audit = auditGitaCandidate(candidate());
  assert.equal(STANDARD_GITA_VERSES_PER_CHAPTER.reduce((total, count) => total + count, 0), 700);
  assert.equal(audit.verseCount, 700);
  assert.equal(audit.structurallyComplete, true);
  assert.equal(audit.releaseEligible, false);
});

test("an extra recension verse, a missing verse and a duplicate reference are never silently normalized", () => {
  const extra = structuredClone(candidate());
  extra.chapters[12].verses.push({ verse: 35, sanskrit: "उदाहरणार्थं संस्कृतपाठः॥13.35॥" });
  assert.match(auditGitaCandidate(extra).issues.join("; "), /Chapter 13: expected 34 verses, received 35/);

  const missing = structuredClone(candidate());
  missing.chapters[1].verses.splice(46, 1);
  const missingIssues = auditGitaCandidate(missing).issues.join("; ");
  assert.match(missingIssues, /expected 72 verses, received 71/);
  assert.match(missingIssues, /2\.47: number or order differs/);

  const duplicate = structuredClone(candidate());
  duplicate.chapters[1].verses[47].verse = 47;
  assert.match(auditGitaCandidate(duplicate).issues.join("; "), /2\.48: number or order differs/);
});

test("unpinned sources, mismatched Sanskrit markers and publication claims fail closed", () => {
  const data = structuredClone(candidate());
  data.chapters[1].sourceUrl = "https://example.org/edition/chapter/2";
  data.chapters[1].verses[46].sanskrit = "उदाहरणार्थं संस्कृतपाठः॥2.48॥";
  (data as { publicationState: string }).publicationState = "published";
  const audit = auditGitaCandidate(data);
  assert.equal(audit.structurallyComplete, false);
  assert.match(audit.issues.join("; "), /staging_only/);
  assert.match(audit.issues.join("; "), /pin the recorded revision/);
  assert.match(audit.issues.join("; "), /2\.47: exactly one matching/);
  assert.equal(audit.releaseEligible, false);
});

test("Wikisource extractor excludes commentary and accepts only a final complete-chapter colophon", () => {
  const poems = Array.from({ length: 72 }, (_, index) =>
    `<poem>'''श्रीभगवानुवाच'''\nउदाहरणार्थं संस्कृतपाठः ॥२- ${index + 1}॥</poem>`).join("\n");
  const raw = `${poems}\n{{व्याख्या|असंबद्ध टीका ॥२- ७३॥}}\n<poem>इति द्वितीयोऽध्यायः ॥ २ ॥</poem>`;
  const extracted = extractWikisourceGitaChapter(2, raw);
  assert.equal(extracted.verses.length, 72);
  assert.deepEqual(extracted.issues, []);
  assert.equal(extracted.verses[0].sanskrit, "उदाहरणार्थं संस्कृतपाठः ॥२- 1॥");
  assert.equal(extracted.verses[0].speakerCue, "श्रीभगवानुवाच");
  assert.equal(extracted.verses.some((verse) => verse.sanskrit.includes("व्याख्या")), false);

  const missing = extractWikisourceGitaChapter(2,
    `${poems.replace("॥२- 47॥", "॥४७॥")}\n<poem>इति द्वितीयोऽध्यायः ॥ २ ॥</poem>`);
  assert.match(missing.issues.join("; "), /poem 47 has no verse marker/);
  assert.match(missing.issues.join("; "), /poem 73 has no verse marker/);
});

test("chapter invocations and speaker cues remain traceable without contaminating verse bodies", () => {
  const source = `<poem>ॐ\nश्रीपरमात्मने नमः\n'''अथ द्वितीयोऽध्यायः'''\n\n'''सञ्जय उवाच'''\nतं तथा कृपयाविष्टमश्रुपूर्णाकुलेक्षणम् ।\nविषीदन्तमिदं वाक्यमुवाच मधुसूदनः ॥२- १॥</poem>`;
  const extracted = extractWikisourceGitaChapter(2, source);
  assert.deepEqual(extracted.issues, []);
  assert.deepEqual(extracted.verses[0].sourcePrelude,
    ["ॐ", "श्रीपरमात्मने नमः", "अथ द्वितीयोऽध्यायः"]);
  assert.equal(extracted.verses[0].speakerCue, "सञ्जय उवाच");
  assert.equal(extracted.verses[0].sanskrit.startsWith("तं तथा"), true);
  assert.equal(extracted.verses[0].sanskrit.includes("नमः"), false);
});

test("research manifest records 18 pinned chapter versions without representing them as approved content", () => {
  const manifest = WIKISOURCE_GITA_CANDIDATE;
  assert.equal(manifest.chapters.length, 18);
  assert.equal(manifest.chapters.reduce((total, item) => total + item.observedVerses, 0), 700);
  assert.equal(manifest.rightsReviewState, "pending");
  assert.equal(manifest.editorialReviewState, "pending");
  assert.equal(manifest.publicationState, "candidate_only");
  assert.equal(manifest.aiUseAllowed, false);
  for (const [index, item] of manifest.chapters.entries()) {
    assert.equal(item.chapter, index + 1);
    const url = new URL(item.revisionUrl);
    assert.equal(url.hostname, "sa.wikisource.org");
    assert.equal(url.searchParams.get("oldid"), String(item.revision));
    assert.equal(url.searchParams.get("title"), item.title);
  }
});

test("editorial search finds exact references and Sanskrit phrases without upgrading staged content", () => {
  const data = candidate();
  const exact = searchGitaCandidate(data, "BG २.४७");
  assert.equal(exact.length, 1);
  assert.equal(exact[0].reference, "2.47");
  assert.equal(exact[0].publicationState, "staging_only");
  assert.match(exact[0].sourceUrl, /oldid=revision-2/);
  assert.equal(searchGitaCandidate(data, "संस्कृतपाठः", 3).length, 3);
  assert.deepEqual(searchGitaCandidate(data, "2.73"), []);
  const invalid = structuredClone(data);
  invalid.chapters[1].verses.pop();
  assert.deepEqual(searchGitaCandidate(invalid, "२.४७"), []);
});
