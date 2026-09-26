import assert from "node:assert/strict";
import test from "node:test";

import { STANDARD_GITA_VERSES_PER_CHAPTER, type GitaCandidate } from "../packages/content/src/gitaCandidate.ts";
import {
  ANANDASHRAM_1901_COLLATION,
  collateGitaEdition,
  extractVerseFromScanPageTranscription,
  gitaComparisonBody,
} from "../packages/content/src/gitaEditionCollation.ts";

const page47 = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ॥\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥ ४७ ॥";
const page48 = "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनंजय ॥\nसिद्धयसिद्धयोः समो भूत्वा समत्वं योग उच्यते ॥४८॥";
const page43 = "कामात्मानः स्वर्गपरा जन्मकर्मफलप्रदाम् ॥\nक्रियाविशेषबहुलां भोगैश्वर्यगति प्रति ॥ ४३ ॥";
const page44 = "भोगैश्वर्यप्रसक्तानां तयाऽपहृतचेतसाम् ॥\nव्यवसायात्मिका बुद्धिः समाधौ न विधीयते ॥४४॥";

function candidate(): GitaCandidate {
  const chapters = STANDARD_GITA_VERSES_PER_CHAPTER.map((count, index) => ({
    chapter: index + 1,
    sourceUrl: `https://example.org/edition/chapter/${index + 1}?oldid=revision-${index + 1}`,
    sourceRevision: `revision-${index + 1}`,
    verses: Array.from({ length: count }, (_, verseIndex) => ({
      verse: verseIndex + 1,
      sanskrit: `उदाहरणार्थं संस्कृतपाठः॥${index + 1}.${verseIndex + 1}॥`,
    })),
  }));
  chapters[1].verses[46].sanskrit = "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥२- ४७॥";
  chapters[1].verses[47].sanskrit = "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनंजय ।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते ॥२- ४८॥";
  return {
    work: "Bhagavad Gita",
    editionLabel: "Synthetic collation test",
    rightsStatementUrl: "https://example.org/terms",
    publicationState: "staging_only",
    reviewState: "unreviewed",
    aiUseAllowed: false,
    chapters,
  };
}

const observation = (reference: string, sanskrit: string) => {
  const page = ANANDASHRAM_1901_COLLATION.pages.find((entry) => entry.reference === reference);
  assert.ok(page, `Missing page pin for ${reference}`);
  return { reference, wikitextSha256: page.wikitextSha256, sanskrit };
};

test("page extractor selects a uniquely numbered poem, not commentary or a header", () => {
  const page = `Commentary ॥ ४७ ॥\n{{Block center|<poem>${page47}</poem>}}\n<poem>अर्थान्तरं परीक्षणवाक्यम् ॥ ४८ ॥</poem>`;
  assert.equal(extractVerseFromScanPageTranscription(page, 47), page47);
  assert.throws(() => extractVerseFromScanPageTranscription(`${page}<poem>${page47}</poem>`, 47), /exactly one/);
  assert.throws(() => extractVerseFromScanPageTranscription("Commentary ॥ ४७ ॥", 47), /found 0/);
  assert.throws(() => extractVerseFromScanPageTranscription("<poem>{{unresolved}} संस्कृतपाठः ॥ ४७ ॥</poem>", 47), /unexpected markup/);
});

test("page extractor separates two numbered verses in one poem without attributing the first to the second", () => {
  const sameBlock = `<poem>${page43}\n${page44}</poem>`;
  assert.equal(extractVerseFromScanPageTranscription(sameBlock, 43), page43);
  assert.equal(extractVerseFromScanPageTranscription(sameBlock, 44), page44);
  assert.throws(() => extractVerseFromScanPageTranscription(`${sameBlock}<poem>${page44}</poem>`, 44), /exactly one/);
});

test("page extractor removes only known indentation and plain footnote markup", () => {
  const transcription = "<poem>गुरूनहत्वा हि महानुभावा-\n{{gap}}ञ्छ्रेयो भोक्तुं भै<ref>variant note</ref>क्षमपीह लोके ॥ ५ ॥</poem>";
  assert.equal(extractVerseFromScanPageTranscription(transcription, 5),
    "गुरूनहत्वा हि महानुभावा-\nञ्छ्रेयो भोक्तुं भैक्षमपीह लोके ॥ ५ ॥");
  assert.throws(() => extractVerseFromScanPageTranscription(transcription.replace("{{gap}}", "{{unknown}}"), 5), /unexpected markup/);
  assert.throws(() => extractVerseFromScanPageTranscription(transcription.replace("<ref>variant note</ref>", "<ref name=\"other\">note</ref>"), 5), /unexpected markup/);
});

test("page extractor does not attribute a quoted smriti commentary line to Gita 3.14", () => {
  const gita = "अन्नाद्भवन्ति भूतानि पर्जन्यादन्नसंभवः ॥\nयज्ञाद्भवति पर्जन्यो यज्ञः कर्मसमुद्भवः ॥ १४ ॥";
  const commentary = '"अग्नौ प्रास्ताऽऽहुतिः सम्यगादित्यमुपतिष्ठते ।\nआदित्याज्जायते वृष्टिर्वृष्टेरन्नं ततः प्रजाः" इति स्मृतेः ॥ १४ ॥';
  assert.equal(extractVerseFromScanPageTranscription(`<poem>${gita}</poem><poem>${commentary}</poem>`, 14), gita);
  assert.throws(() => extractVerseFromScanPageTranscription(`<poem>${commentary}</poem>`, 14), /found 0/);
});

test("page extractor separates 2.70 from 2.71 on the same pinned transcription page", () => {
  const page70 = "आपूर्यमाणमचलप्रतिष्ठं ।\n{{gap}}समुद्रमापः प्रविशन्ति यत् ॥\nतद्वत्कामा यं प्रविशन्ति सर्वे\n{{gap}}स शान्तिमाप्नोति न कामकामी ॥ ७० ॥";
  const page71 = "विहाय कामान्यः सर्वान्पुमांश्चरति निस्पृहः ॥\nनिर्ममो निरहंकारः स शान्तिमधिगच्छति ॥ ७१ ॥";
  const page = `<poem>${page70}\n${page71}</poem>`;
  assert.equal(extractVerseFromScanPageTranscription(page, 70), page70.replaceAll("{{gap}}", ""));
  assert.equal(extractVerseFromScanPageTranscription(page, 71), page71);
  assert.notEqual(gitaComparisonBody("आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यद्वत् ॥ ७० ॥"),
    gitaComparisonBody("आपूर्यमाणमचलप्रतिष्ठं समुद्रमापः प्रविशन्ति यत् ॥ ७० ॥"));
});

test("pinned research slices cover chapter 2 except four gaps and chapter 3 through 3.18 except 3.6", () => {
  const references = ANANDASHRAM_1901_COLLATION.pages.map((page) => page.reference);
  assert.equal(references.length, 85);
  assert.equal(new Set(references).size, 85);
  for (let verse = 1; verse <= 72; verse++) {
    if (![54, 55, 56, 62].includes(verse)) assert.ok(references.includes(`2.${verse}`));
  }
  assert.deepEqual(Array.from({ length: 72 }, (_, index) => `2.${index + 1}`).filter((ref) => !references.includes(ref)),
    ["2.54", "2.55", "2.56", "2.62"]);
  assert.deepEqual(Array.from({ length: 18 }, (_, index) => `3.${index + 1}`).filter((ref) => !references.includes(ref)), ["3.6"]);
  assert.equal(ANANDASHRAM_1901_COLLATION.pages.find((page) => page.reference === "2.70")?.scanPage, 95);
  assert.equal(ANANDASHRAM_1901_COLLATION.pages.find((page) => page.reference === "3.1")?.scanPage, 99);
});

test("collation ignores layout punctuation but retains a meaningful orthographic difference", () => {
  const data = candidate();
  assert.equal(gitaComparisonBody(data.chapters[1].verses[46].sanskrit), gitaComparisonBody(page47));
  assert.notEqual(gitaComparisonBody(data.chapters[1].verses[47].sanskrit), gitaComparisonBody(page48));
  assert.notEqual(gitaComparisonBody("धनञ्जय ॥ ४८ ॥"), gitaComparisonBody("धनंजय ॥ ४८ ॥"));
});

test("verse-level report retains source links and exactly states incomplete coverage", () => {
  const report = collateGitaEdition(candidate(), [observation("2.48", page48), observation("2.47", page47)]);
  assert.equal(report.totalCandidateVerses, 700);
  assert.equal(report.transcriptionsCompared, 2);
  assert.equal(report.sameAfterLayoutNormalization, 1);
  assert.equal(report.textDiffers, 1);
  assert.equal(report.notCollated, 698);
  assert.equal(report.researchSlices[0].compared, 2);
  assert.deepEqual(report.researchSlices[0].pendingReferences.slice(0, 4), ["2.1", "2.2", "2.3", "2.4"]);
  assert.ok(report.researchSlices[0].pendingReferences.includes("2.70"));
  assert.equal(report.researchSlices[1].compared, 0);
  assert.equal(report.researchSlices[1].pendingReferences.length, 18);
  assert.equal(report.pageExtractionVersion, 3);
  assert.equal(report.scanImageChecked, false);
  assert.equal(report.rightsReviewed, false);
  assert.equal(report.publicationEligible, false);
  assert.deepEqual(report.rows.map((row) => [row.reference, row.comparison]), [
    ["2.47", "same_after_layout_normalization"],
    ["2.48", "text_differs"],
  ]);
  assert.match(report.rows[1].pageTranscriptionUrl, /oldid=366540/);
  assert.equal(report.rows[1].pageRevision, 366540);
  assert.equal(report.rows[1].pageWikitextSha256, ANANDASHRAM_1901_COLLATION.pages.find((page) => page.reference === "2.48")?.wikitextSha256);
  assert.equal(report.rows[1].pageTitle, "पृष्ठम्:श्रीमद्भगवद्गीता.pdf/८३");
  assert.match(report.rows[1].candidateSourceUrl, /oldid=revision-2/);
  assert.equal(report.rows[1].decisionState, "requires_human_scan_and_sanskrit_review");
});

test("collation retains numeric chapter order and explicitly records both research-slice gaps", () => {
  const chapterThree = "अर्जुन उवाच-\nज्यायसी चेत्कर्मणस्ते मता बुद्धिर्जनार्दन ॥\nतत्किं कर्मणे धोरे मा नियोजयसि केशव ॥१॥";
  const page70 = "आपूर्यमाणमचलप्रतिष्ठं ।\nसमुद्रमापः प्रविशन्ति यत् ॥\nतद्वत्कामा यं प्रविशन्ति सर्वे\nस शान्तिमाप्नोति न कामकामी ॥ ७० ॥";
  const report = collateGitaEdition(candidate(), [observation("3.1", chapterThree), observation("2.70", page70)]);
  assert.deepEqual(report.rows.map((row) => row.reference), ["2.70", "3.1"]);
  assert.equal(report.researchSlices[0].compared, 1);
  assert.equal(report.researchSlices[1].compared, 1);
  assert.ok(report.researchSlices[0].pendingReferences.includes("2.62"));
  assert.ok(report.researchSlices[1].pendingReferences.includes("3.6"));
});

test("collation rejects altered pins, duplicate rows, wrong markers and promoted candidates", () => {
  const good = observation("2.47", page47);
  assert.throws(() => collateGitaEdition(candidate(), [{ ...good, wikitextSha256: "wrong" }]), /Unpinned/);
  assert.throws(() => collateGitaEdition(candidate(), [good, good]), /duplicate/);
  assert.throws(() => collateGitaEdition(candidate(), [observation("2.47", page47.replace("४७", "४८"))]), /marker differs/);
  const promoted = structuredClone(candidate());
  (promoted as { publicationState: string }).publicationState = "published";
  assert.throws(() => collateGitaEdition(promoted, [good]), /unreleased/);
});
