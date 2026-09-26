/**
 * Research manifest only. The Sanskrit Wikisource pages below exposed the
 * standard 700 numbered verses when their <poem> blocks were inspected on
 * 2026-09-26. These revision IDs make the candidate reproducible; they do not
 * establish source-edition rights, textual correctness or editorial approval.
 * No verse text is bundled by this file.
 * Each SHA-256 is over the UTF-8 wikitext returned by MediaWiki action=parse
 * for that oldid on 2026-09-26, before verse-only extraction.
 *
 * Source index: https://sa.wikisource.org/wiki/भगवद्गीता
 * Reuse terms: https://foundation.wikimedia.org/wiki/Terms_of_Use
 * App guidance: https://foundation.wikimedia.org/wiki/Legal:Wikimedia_Developer_App_Guidelines
 * Chapter 2 history starts with https://sa.wikisource.org/w/index.php?oldid=883
 * (2005-04-05); a large commentary insertion is visible at revision 216833
 * (2019-11-17). This narrows provenance of its verse transcription but does
 * not identify the pre-Wikisource print/digital edition or prove reuse rights.
 * The index also links Sanskrit Documents, whose current bhagvadnew.ps file
 * explicitly restricts commercial reposting. An unrelated 1901 scan tagged
 * public domain on Commons is a possible edition-check source, not evidence
 * that these pinned chapter texts are its transcription.
 */

import { STANDARD_GITA_VERSES_PER_CHAPTER } from "./gitaCandidate.ts";

const chapterVersions = [
  ["अर्जुनविषादयोगः", 343151, "8101c174c0d07676c2eacc1e166298f4f6567961f8b75892412991811818bbde"],
  ["साङ्ख्ययोगः", 408369, "9d365c91e86947c2c0b5b55a852566a7ef029877e78dc5d10358f753111fc3d9"],
  ["कर्मयोगः", 216838, "b11fad003e4b2bde357de95d8e3df43b554b78888340e06bd8bfebc4cd2802d9"],
  ["ज्ञानकर्मसंन्यासयोगः", 335464, "bbfa4b1b448f9e55877042ac2cc810744d7f86e316808d460ee6e882705e5eba"],
  ["कर्मसंन्यासयोगः", 413698, "467fe02d0c2557a39994cef0186eff620f6aed736f19368537c4ba228e31c7ac"],
  ["आत्मसंयमयोगः", 216842, "5b851da36db9d17cfc3f60ccf4ba155f6dab6fedf819247d7f58b94ad2204c5f"],
  ["ज्ञानविज्ञानयोगः", 416795, "124e48ca662d26aff61844a52bc9adca40126c31320b1cb08b0ee655078db0e8"],
  ["अक्षरब्रह्मयोगः", 417779, "0094d22df14c783706febc5b605fbc43fbaf101e55b03f59edf7fd320ba6a563"],
  ["राजविद्याराजगुह्ययोगः", 334069, "da8416c1c9d6aad3e74d4cc3b2ff15792b1d82a2b33a93cc127e1f55b69f1b40"],
  ["विभूतियोगः", 333448, "d1eab34172971dc6287f876b7c7db6eeb9c2a718fc13c1e3437f26dcbcfa7a3e"],
  ["विश्वरूपदर्शनयोगः", 333355, "2ad8ac994985a68f7c4a699eca8223cc20f1c874f1acefe4684514bd0965a5af"],
  ["भक्तियोगः", 333675, "d485e6d6a238ce59ae88d8b047486fdaf9d870f770ba58d761e80584db14e788"],
  ["क्षेत्रक्षेत्रज्ञविभागयोगः", 216831, "a5da291f00c33fb369e1a5c10a2423304f3a0dfdedd125085202c6fce5cff49e"],
  ["गुणत्रयविभागयोगः", 333879, "2b4401565fc5147ee6099e16c47b346eaf029efbab9d0c1e244bd3f4ff9c721c"],
  ["पुरुषोत्तमयोगः", 371660, "16a8f90cecaa900100c2e2ac1f93bdf0db8550fc2305a926237c6acdd801f795"],
  ["दैवासुरसम्पद्विभागयोगः", 216848, "ec4a5516d77eca75cc59ed9d94f841dbcc224d3da0c3768e3414289edd9de20a"],
  ["श्रद्धात्रयविभागयोगः", 216849, "2620ebc92809d6f0c6bf72b3c2a3679d7d91179b9c1b717a13a90f66b4e1cd00"],
  ["मोक्षसंन्यासयोगः", 216850, "bafbad34f42dfef5d405bf421088e0a9d35a0ce0556f22f56a1512f02963067d"],
] as const;

export const WIKISOURCE_GITA_CANDIDATE = Object.freeze({
  sourceOrganization: "Sanskrit Wikisource",
  inspectedOn: "2026-09-26",
  observedNumberedVerses: 700,
  rightsReviewState: "pending",
  editorialReviewState: "pending",
  publicationState: "candidate_only",
  aiUseAllowed: false,
  rightsStatementUrl: "https://foundation.wikimedia.org/wiki/Terms_of_Use",
  provenanceReview: Object.freeze({
    state: "underlying_edition_unverified",
    chapterTwoEarliestRevisionUrl: "https://sa.wikisource.org/w/index.php?oldid=883",
    chapterTwoCommentaryImportRevisionUrl: "https://sa.wikisource.org/w/index.php?oldid=216833",
    externallyLinkedRestrictedEditionUrl: "https://sanskritdocuments.org/doc_giitaa/bhagvadnew.ps",
    independentlyScannedEditionUrl: "https://commons.wikimedia.org/wiki/File:श्रीमद्भगवद्गीता.pdf",
  }),
  chapters: Object.freeze(chapterVersions.map(([title, revision, wikitextSha256], index) => Object.freeze({
    chapter: index + 1,
    title: `भगवद्गीता/${title}`,
    revision,
    wikitextSha256,
    observedVerses: STANDARD_GITA_VERSES_PER_CHAPTER[index],
    revisionUrl: `https://sa.wikisource.org/w/index.php?title=${encodeURIComponent(`भगवद्गीता/${title}`)}&oldid=${revision}`,
  }))),
});
