import { auditGitaCandidate, type GitaCandidate } from "./gitaCandidate.ts";

/**
 * Editorial comparison source, not a second licensed app edition. The links
 * identify page transcriptions attached to the 1901 scan; the transcription
 * can contain proofreading errors and has not been checked against the image
 * by this project. Rights and Sanskrit editorial review remain unresolved.
 *
 * Print identification (title page):
 * https://sa.wikisource.org/w/index.php?oldid=343281
 * Scan description: https://commons.wikimedia.org/wiki/File:श्रीमद्भगवद्गीता.pdf
 *
 * Each selected numbered verse has one exact page-revision pin. The bounded
 * research slices are 2.1–2.72 and 3.1–3.18. The 1901 scan itself jumps from
 * printed page 81 to 84 (PDF pages 86–87), leaving 2.54–2.56 unavailable in
 * this file. The page-90 transcription labels 2.62 as 12 despite the scan
 * image showing 62. Page 103 has 3.6 outside a <poem> block, so the strict
 * extractor leaves it pending. A qualified Sanskrit editor must resolve these
 * and all textual differences before any member-facing use.
 */
const PINNED_CHAPTER_TWO_PAGES = Object.freeze([
  { scanPage: 31, verses: [1], pageOldid: 347147, wikitextSha256: "de95ba4f620d1825090b7aec8e3b4a39cbead09ac019945297af82bdecc962d8" },
  { scanPage: 32, verses: [2], pageOldid: 367252, wikitextSha256: "4bd78178339662e31711748aeff43d96e0897d7655118806358d469f57012881" },
  { scanPage: 33, verses: [3, 4], pageOldid: 367491, wikitextSha256: "81b0582f72efdf8009c14c2e23e1d8e03d46a31e4cd5a088e43e060e92f3c621" },
  { scanPage: 34, verses: [5], pageOldid: 367244, wikitextSha256: "1190aac080baf4b59aa9deebcad51bd19302b9766414cacf86423adc32b0d808" },
  { scanPage: 36, verses: [6], pageOldid: 367008, wikitextSha256: "feaa8847b4c67240c594e76e283f7865f28bd6740afb18905adff03f797bc67b" },
  { scanPage: 37, verses: [7], pageOldid: 367006, wikitextSha256: "8b7bf11d2b89c32a1024c4b49f659cd13850f24de04d22ff8e2e268b274f8279" },
  { scanPage: 38, verses: [8], pageOldid: 367004, wikitextSha256: "0803910b366b93de468ad8bc776dc7b475cd49dc3dd8d055f95b3d886f7ff977" },
  { scanPage: 39, verses: [9, 10], pageOldid: 367002, wikitextSha256: "48e61f0ed9ae3ff56ffd37a3e6483d2697c8f7536a1e02d7a3d608577dc2401f" },
  { scanPage: 40, verses: [11], pageOldid: 367001, wikitextSha256: "4f96b6cfa37bbfaa5202f50ab3a1a7962ac64522aaf3c9f32293b163f2504825" },
  { scanPage: 41, verses: [12], pageOldid: 367000, wikitextSha256: "5bac5eacd443108524028c87ec243c0828b758259ef161d2c77dd2029cf0cae9" },
  { scanPage: 42, verses: [13], pageOldid: 366887, wikitextSha256: "3e8332c0759071dc09e6e01b96c11697407e36afce816d6604c74d9d3b7052c0" },
  { scanPage: 44, verses: [14], pageOldid: 366884, wikitextSha256: "dadf7ba0b523d6f1e8c00261de5f0e9fc4c38c43315c6f374ebaec9e69534730" },
  { scanPage: 45, verses: [15], pageOldid: 366881, wikitextSha256: "71fd6e6c161c8f36963505d789e598dc9d180e547bd6b5a9b2b3f653e677fb3c" },
  { scanPage: 46, verses: [16], pageOldid: 366877, wikitextSha256: "ff89993e9e2dfe7f1d57113d5bee84786db6ec960e4f067508f46a68d17ce33f" },
  { scanPage: 50, verses: [17], pageOldid: 366776, wikitextSha256: "de1d9c7a57250a9b735237f7ce80df1fd43de6ea1c3d80daf2733a2dd34582bf" },
  { scanPage: 52, verses: [18], pageOldid: 366774, wikitextSha256: "78a968410a687a7e026dca6768d9ec6aba00ad7ea2f7de3bdc16229aed2b8fd2" },
  { scanPage: 55, verses: [19], pageOldid: 366764, wikitextSha256: "541efafdc2d28fdee36e1e6e3724ed46e420e3279ba010767ace7863e28671e5" },
  { scanPage: 56, verses: [20], pageOldid: 366759, wikitextSha256: "fe8b20e2c22f8cbe98d0a2c7492a4e8c280d760874d6c18edff8670ef4430022" },
  { scanPage: 57, verses: [21], pageOldid: 366756, wikitextSha256: "e65bc17bc409dab22552d277b0a808d9fb0ee7d2385671e457fe47063f6c2ba3" },
  { scanPage: 58, verses: [22], pageOldid: 366753, wikitextSha256: "8155366825fe1ac58be42d7ac3a1c146a91ed8e552f53179ba57f1a2c07c786d" },
  { scanPage: 59, verses: [23], pageOldid: 366752, wikitextSha256: "419a59c5abe76e0515e1693367cf0bf665ab02e9a52efc67076227fdccf9e506" },
  { scanPage: 60, verses: [24], pageOldid: 366750, wikitextSha256: "d5955208d7903520ae6ced79416adfb46c506f21507127551898e07998db286b" },
  { scanPage: 61, verses: [25], pageOldid: 366722, wikitextSha256: "3d1785585e4062bc7a27a5d3486235d6d474b6696faef3770bb31c1c198b1f83" },
  { scanPage: 62, verses: [26], pageOldid: 366714, wikitextSha256: "fab9ec67ba4c4d3c5f8df116e7626c37d37cef2c73ac814e68bdba932b859d68" },
  { scanPage: 63, verses: [27], pageOldid: 368967, wikitextSha256: "da7a4a3e5944b49db0a43683299212692e512f2982e4b0678c17766a40feb43c" },
  { scanPage: 64, verses: [28], pageOldid: 366711, wikitextSha256: "b999040f419199bfb3ef8b8f881f9fd1bc438738fd3d7d18a676b0d0b45da8cd" },
  { scanPage: 65, verses: [29], pageOldid: 366710, wikitextSha256: "e0c7d741ddea7f981b0c40552dd839653912788b4e5500b4ff003a16192d1ea2" },
  { scanPage: 68, verses: [30], pageOldid: 366654, wikitextSha256: "465c2255b0f1eeea5aa740430e31208695bd6a3a2d38eb8d17ca612b999fe8ab" },
  { scanPage: 69, verses: [31], pageOldid: 349966, wikitextSha256: "11e99f153360778835a0b1bb38b792f1ade46c2e71a65812d142ddd85f5dcd6c" },
  { scanPage: 70, verses: [32], pageOldid: 366653, wikitextSha256: "50f4c0737592b2e5078cb2e1d8842546df29e79a6bf2dcb1db003344954c2bae" },
  { scanPage: 71, verses: [33], pageOldid: 366650, wikitextSha256: "0fbce140a50efba91d9d003d1a3a9f68c306ad7f27291315354ebd1694f92283" },
  { scanPage: 72, verses: [34], pageOldid: 366645, wikitextSha256: "a918be71faa6251ff5d12d85999d7a9768e2fdceb85243b66dac68f2ac044ecb" },
  { scanPage: 73, verses: [35, 36], pageOldid: 366643, wikitextSha256: "375426086c8014ad86eb9190132203f3446c62239a667cbb75064e2d983b0581" },
  { scanPage: 74, verses: [37, 38], pageOldid: 366642, wikitextSha256: "109ed1ec0b2c53dbe12229f0c70fae6b115f9724c4ca7a2196c9422447b2a6a1" },
  { scanPage: 75, verses: [39], pageOldid: 350132, wikitextSha256: "a9f5628b0a838168cd5fdfbdc0a9948c8a189581fbc7db052ad9e3f5c1f7c7f6" },
  { scanPage: 76, verses: [40], pageOldid: 366641, wikitextSha256: "e38a6a8f1f72fd4e1e15ce9878fde5df55b10a9f30e2e9ea7e6e22a01b693e50" },
  { scanPage: 78, verses: [41, 42], pageOldid: 366633, wikitextSha256: "2f6a949f78a10c14659cff4f96203bd01a36ebcc9d2196f5bc816078f6780626" },
  { scanPage: 79, verses: [43, 44], pageOldid: 366629, wikitextSha256: "e5518b10fb2ebe373a870c82ebaca68fbe5d258d69e57af7feb2d35da51134f0" },
  { scanPage: 80, verses: [45], pageOldid: 366624, wikitextSha256: "cd8aa3ca16450013392b769cf4543a04e1d48d5c4c6696e221d85d468ac78b5a" },
  { scanPage: 81, verses: [46], pageOldid: 366625, wikitextSha256: "de5adfb113934d8baf2a6ee65bf87edad5fcf37db60d6df6b43485eb65811cdf" },
  { scanPage: 82, verses: [47], pageOldid: 366544, wikitextSha256: "56ece7b2f447e020b6af3bc8e08ebeadaea88add4ea78843c0468c78298a28d0" },
  { scanPage: 83, verses: [48], pageOldid: 366540, wikitextSha256: "bbe5819310350f12f5d3d9f06613243f831f67f1daf9d2536c2e3c99a762b03d" },
  { scanPage: 84, verses: [49, 50], pageOldid: 366536, wikitextSha256: "52bad7c0f1a7050e19dacf5ffc6309e5e71e49c36c6361c3801573db4099c389" },
  { scanPage: 85, verses: [51, 52], pageOldid: 366534, wikitextSha256: "c8b55b8bcdebf86c4fae2cd49bed4ca76b033ef1593df2b6567821b77c79cab4" },
  { scanPage: 86, verses: [53], pageOldid: 368966, wikitextSha256: "05a427c60e948e953edc87d06b0539d6dd126fa046bcd7985e285bd13eb417f7" },
  { scanPage: 87, verses: [57], pageOldid: 366531, wikitextSha256: "639c65411dae6d404722825e2be06037ebcc5786865fec872111ef89d3e8e190" },
  { scanPage: 88, verses: [58], pageOldid: 366530, wikitextSha256: "31a05eee0f29e8d552af70755702b81ed40a6e44c7e16e0a4d24e4f62f5b2afb" },
  { scanPage: 89, verses: [59, 60], pageOldid: 366529, wikitextSha256: "aa9ffb54b4dd49f91ed8f8635c2ff26a505537496c65ac21d6833bb5f4522f16" },
  { scanPage: 90, verses: [61], pageOldid: 366528, wikitextSha256: "5d5fa83657e34070f03e84874b7f5f514bd6f9a5d02706f49485d7691fac9d9a" },
  { scanPage: 91, verses: [63, 64], pageOldid: 350353, wikitextSha256: "b21a8b63ac08f5b6e5f905c92e8cf36d2cad8e2c15a92d7489b448ec35455490" },
  { scanPage: 92, verses: [65, 66], pageOldid: 367492, wikitextSha256: "e11c807c96aa6009051af74a53c06b57a646325ccb47414b1546f303e7e3957f" },
  { scanPage: 93, verses: [67, 68], pageOldid: 366524, wikitextSha256: "e2a10bf51bbcbaa625509483554d616a12219bcf6adb93cee8402487a356be8d" },
  { scanPage: 94, verses: [69], pageOldid: 366525, wikitextSha256: "b9f258c6dbfb6540f4e038ae3424d78018f471c332da4688a253382a33c2d200" },
  { scanPage: 95, verses: [70, 71], pageOldid: 366522, wikitextSha256: "693907bb2346ce897923dbdd0d65488a70a7bb660a5b1df853eaac02745f62b5" },
  { scanPage: 96, verses: [72], pageOldid: 366520, wikitextSha256: "bfd7d56da7e7873f917aefb3c342f0aa50262a3cee14e21189af519d3ac6c0ec" },
]);

const PINNED_CHAPTER_THREE_PAGES = Object.freeze([
  { scanPage: 99, verses: [1, 2], pageOldid: 367493, wikitextSha256: "809ea28aa17558b28e8bd4220e7424470d7d5090884446ac476476ddb1dc28a7" },
  { scanPage: 100, verses: [3], pageOldid: 367495, wikitextSha256: "e1f09dc4963181fe3601292053586f12166534d477402e1509106f808b0deca2" },
  { scanPage: 101, verses: [4], pageOldid: 366470, wikitextSha256: "c25e018395067a7a506cf27a24e9900d5d5acf98641b63514aec799467e60ea3" },
  { scanPage: 102, verses: [5], pageOldid: 366465, wikitextSha256: "f8e53a7c7a2e7472364d68d9464f45d4dfe6102b9b75e4de6c61f9a3ace72615" },
  { scanPage: 103, verses: [7], pageOldid: 366464, wikitextSha256: "5ac4d235b5272c164024eae912d57013c0bca4908db914c0536583a8a596b21f" },
  { scanPage: 104, verses: [8, 9], pageOldid: 367496, wikitextSha256: "9befabc30250f5a72f30bdabfc79ed380e48365b39deb032459bb756d47b063c" },
  { scanPage: 105, verses: [10, 11], pageOldid: 367497, wikitextSha256: "ab13c1fee67f2c40bf7f699b57eb9620d03570fb7d00f60ef2851069ff6476ac" },
  { scanPage: 106, verses: [12, 13], pageOldid: 366462, wikitextSha256: "a7d55303b0ea7bf1201c0dc337aa50111063f383d91426d0052a63523b7ed267" },
  { scanPage: 107, verses: [14], pageOldid: 367499, wikitextSha256: "fa2aa1d6bf434faab6a02009032f089d881e9074323255f42f0b6c4e4053fd46" },
  { scanPage: 108, verses: [15, 16], pageOldid: 366458, wikitextSha256: "db26e72d49e683f58d8e273ad8d8fdee49e2cec627c387fdf5b9a366562416bb" },
  { scanPage: 109, verses: [17], pageOldid: 367500, wikitextSha256: "9e04e62cd7ddcd74156ae52a0aa0e981e1aa9e71606137d9ba1b477ec536c238" },
  { scanPage: 110, verses: [18], pageOldid: 350896, wikitextSha256: "152ea540acf92ca7f24b8853d7b297082a3b09f0b39ab93ab790415bbd81d642" },
]);

export const ANANDASHRAM_1901_COLLATION = Object.freeze({
  editionLabel: "Anandashram Sanskrit Series 45, Pune, 1901 (Agashe-edited Gita with commentaries)",
  scanUrl: "https://commons.wikimedia.org/wiki/File:श्रीमद्भगवद्गीता.pdf",
  titlePageUrl: "https://sa.wikisource.org/w/index.php?oldid=343281",
  comparisonSourceKind: "pinned_wikisource_scan_page_transcription",
  scanImageChecked: false,
  rightsReviewed: false,
  /** Exact allowlisted transcription projection, never scan-image proofreading. */
  pageExtractionVersion: 3,
  pages: Object.freeze(([{ chapter: 2, pages: PINNED_CHAPTER_TWO_PAGES },
    { chapter: 3, pages: PINNED_CHAPTER_THREE_PAGES }] as const).flatMap(({ chapter, pages }) => pages.flatMap((page) => page.verses.map((verse) => Object.freeze({
    reference: `${chapter}.${verse}`,
    scanPage: page.scanPage,
    pageTitle: `पृष्ठम्:श्रीमद्भगवद्गीता.pdf/${String(page.scanPage).replace(/[0-9]/g, (digit) => "०१२३४५६७८९"[Number(digit)])}`,
    pageOldid: page.pageOldid,
    wikitextSha256: page.wikitextSha256,
    pageUrl: `https://sa.wikisource.org/w/index.php?oldid=${page.pageOldid}`,
  }))))),
});

export interface GitaPageObservation {
  reference: string;
  /** SHA-256 of exact raw wikitext for the recorded page revision. */
  wikitextSha256: string;
  sanskrit: string;
}

export interface GitaEditionCollationRow {
  reference: string;
  comparison: "same_after_layout_normalization" | "text_differs";
  /** A mismatch could be in either transcription; it is not an edition decision. */
  decisionState: "requires_human_scan_and_sanskrit_review";
  candidateSourceUrl: string;
  editionScanUrl: string;
  pageTranscriptionUrl: string;
  pageRevision: number;
  pageWikitextSha256: string;
  pageTitle: string;
  scanPage: number;
  candidateSanskrit: string;
  pageTranscriptionSanskrit: string;
}

export interface GitaEditionCollationReport {
  editionLabel: string;
  titlePageUrl: string;
  scanUrl: string;
  sourceKind: "pinned_wikisource_scan_page_transcription";
  scanImageChecked: false;
  rightsReviewed: false;
  publicationEligible: false;
  pageExtractionVersion: 3;
  totalCandidateVerses: number;
  transcriptionsCompared: number;
  sameAfterLayoutNormalization: number;
  textDiffers: number;
  notCollated: number;
  /** Explicit research slices; gaps are not silently treated as matches. */
  researchSlices: readonly {
    chapter: 2 | 3;
    firstVerse: 1;
    lastVerse: 72 | 18;
    compared: number;
    pendingReferences: readonly string[];
  }[];
  rows: readonly GitaEditionCollationRow[];
}

function devanagariNumber(value: string): number {
  return Number([...value].map((digit) => {
    const position = "०१२३४५६७८९".indexOf(digit);
    return position < 0 ? digit : String(position);
  }).join(""));
}

/**
 * Only a numbered segment inside <poem> is treated as a verse. The 1901-page
 * transcription for page 79 places verses 43 and 44 in one poem block, so
 * selecting the whole block would falsely attribute verse 43 to verse 44.
 * Prose commentary is ignored, including a quoted smriti citation on page
 * 107 that repeats marker 14 inside a poem block after the Gita verse.
 * Wikisource's line-leading {{gap}} indentation and plain <ref>...</ref> footnotes are removed before reading verse markers;
 * no other template or markup is accepted in the selected verse. Unexpected
 * markup and ambiguous matches fail closed instead of yielding plausible text.
 */
export function extractVerseFromScanPageTranscription(wikitext: string, verseNumber: number): string {
  if (!Number.isSafeInteger(verseNumber) || verseNumber < 1 || typeof wikitext !== "string") {
    throw new Error("A valid verse number and page wikitext are required");
  }
  const matches: string[] = [];
  for (const block of wikitext.matchAll(/<poem>([\s\S]*?)<\/poem>/giu)) {
    const body = block[1].trim().normalize("NFC")
      .replace(/(^|\n)[ \t]*\{\{gap\}\}/gu, "$1")
      .replace(/<ref>[^<>]*<\/ref>/gu, "");
    let start = 0;
    for (const marker of body.matchAll(/॥\s*([०-९0-9]+)\s*॥/gu)) {
      const end = (marker.index ?? 0) + marker[0].length;
      const segment = body.slice(start, end).trim();
      start = end;
      if (devanagariNumber(marker[1]) !== verseNumber) continue;
      if (/इति\s*स्मृतेः/u.test(segment)) continue;
      if (/[<>]|\{\{|\}\}|\[\[|\]\]|\uFFFD/u.test(segment) ||
          (segment.match(/[\u0904-\u0939]/gu)?.length ?? 0) < 12) {
        throw new Error(`Verse ${verseNumber}: unexpected markup or malformed page transcription`);
      }
      matches.push(segment);
    }
  }
  if (matches.length !== 1) throw new Error(`Verse ${verseNumber}: expected exactly one numbered poem, found ${matches.length}`);
  return matches[0];
}

/** Strip only layout, danda punctuation and a trailing verse marker. */
export function gitaComparisonBody(sanskrit: string): string {
  return sanskrit.normalize("NFC")
    .replace(/॥\s*[०-९0-9]+(?:\s*[-.।]\s*[०-९0-9]+)?\s*॥\s*$/u, "")
    .replace(/[\s।॥]/gu, "");
}

/**
 * Compare against the separately staged 700-verse transcription. This never
 * elevates either source into approved app content or claims scan proofing.
 */
export function collateGitaEdition(input: unknown, observations: readonly GitaPageObservation[]): GitaEditionCollationReport {
  const audit = auditGitaCandidate(input);
  if (!audit.structurallyComplete || audit.verseCount !== 700) throw new Error("A structurally valid, unreleased 700-verse candidate is required");
  const candidate = input as GitaCandidate;
  if (!Array.isArray(observations)) throw new Error("Observations must be an array");
  const seen = new Set<string>();
  const rows: GitaEditionCollationRow[] = [];
  for (const observation of observations) {
    if (!observation || typeof observation !== "object") throw new Error("Invalid page observation");
    const page = ANANDASHRAM_1901_COLLATION.pages.find((entry) => entry.reference === observation.reference);
    if (!page || seen.has(page.reference) || observation.wikitextSha256 !== page.wikitextSha256) {
      throw new Error(`Unpinned, duplicate, or altered observation for ${observation.reference}`);
    }
    seen.add(page.reference);
    const [chapterNumber, verseNumber] = page.reference.split(".").map(Number);
    const candidateSanskrit = candidate.chapters[chapterNumber - 1].verses[verseNumber - 1].sanskrit;
    const pageSanskrit = observation.sanskrit;
    if (typeof pageSanskrit !== "string" || !/॥\s*[०-९0-9]+\s*॥\s*$/u.test(pageSanskrit) ||
        gitaComparisonBody(pageSanskrit).length < 12) {
      throw new Error(`${page.reference}: page observation has no valid numbered Sanskrit`);
    }
    const marker = pageSanskrit.match(/॥\s*([०-९0-9]+)\s*॥\s*$/u);
    if (!marker || devanagariNumber(marker[1]) !== verseNumber) throw new Error(`${page.reference}: page marker differs`);
    rows.push({
      reference: page.reference,
      comparison: gitaComparisonBody(candidateSanskrit) === gitaComparisonBody(pageSanskrit)
        ? "same_after_layout_normalization" : "text_differs",
      decisionState: "requires_human_scan_and_sanskrit_review",
      candidateSourceUrl: candidate.chapters[chapterNumber - 1].sourceUrl,
      editionScanUrl: ANANDASHRAM_1901_COLLATION.scanUrl,
      pageTranscriptionUrl: page.pageUrl,
      pageRevision: page.pageOldid,
      pageWikitextSha256: page.wikitextSha256,
      pageTitle: page.pageTitle,
      scanPage: page.scanPage,
      candidateSanskrit,
      pageTranscriptionSanskrit: pageSanskrit,
    });
  }
  rows.sort((a, b) => {
    const [aChapter, aVerse] = a.reference.split(".").map(Number);
    const [bChapter, bVerse] = b.reference.split(".").map(Number);
    return aChapter - bChapter || aVerse - bVerse;
  });
  const sameAfterLayoutNormalization = rows.filter((row) => row.comparison === "same_after_layout_normalization").length;
  const compared = new Set(rows.map((row) => row.reference));
  return {
    editionLabel: ANANDASHRAM_1901_COLLATION.editionLabel,
    titlePageUrl: ANANDASHRAM_1901_COLLATION.titlePageUrl,
    scanUrl: ANANDASHRAM_1901_COLLATION.scanUrl,
    sourceKind: "pinned_wikisource_scan_page_transcription",
    scanImageChecked: false,
    rightsReviewed: false,
    publicationEligible: false,
    pageExtractionVersion: ANANDASHRAM_1901_COLLATION.pageExtractionVersion,
    totalCandidateVerses: audit.verseCount,
    transcriptionsCompared: rows.length,
    sameAfterLayoutNormalization,
    textDiffers: rows.length - sameAfterLayoutNormalization,
    notCollated: audit.verseCount - rows.length,
    researchSlices: ([{ chapter: 2, lastVerse: 72 }, { chapter: 3, lastVerse: 18 }] as const).map(({ chapter, lastVerse }) => ({
      chapter,
      firstVerse: 1 as const,
      lastVerse,
      compared: rows.filter((row) => row.reference.startsWith(`${chapter}.`)).length,
      pendingReferences: Array.from({ length: lastVerse }, (_, index) => `${chapter}.${index + 1}`)
        .filter((reference) => !compared.has(reference)),
    })),
    rows,
  };
}
