/**
 * Small, inspectable content foundation for the existing Gita alpha.
 *
 * The Sanskrit below mirrors the three verses already displayed by the app.
 * A source link identifies where an editor can compare each verse; it is not
 * evidence of permission to redistribute that site's edition or translations.
 * The contemporary explanations are original alpha copy, not translations,
 * scholarly review, or teachings attributed to a named person.
 */

import { freezeDemoContent } from "./freeze.ts";

export type ContentKind =
  | "CANONICAL_TEXT"
  | "TRANSLITERATION"
  | "TRANSLATION"
  | "COMMENTARY"
  | "SCHOLARLY_CONTEXT"
  | "EDITORIAL_EXPLANATION"
  | "STORY_RETELLING"
  | "AI_EXPLANATION";

export type ReviewState = "unreviewed" | "in_review" | "approved";
export type RightsState = "unknown" | "permission_recorded";

export interface SourceRecord {
  id: string;
  workSlug: string;
  workTitle: string;
  canonicalReference: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceOrganization: string;
  sourceLanguage: "sa";
  edition: string | null;
  translator: null;
  licenseName: string | null;
  copyrightStatus: "unknown";
  attributionRequirements: string | null;
  rightsState: RightsState;
  /** Date of source comparison, not a rights or scholarly approval date. */
  textComparedOn: string;
}

export interface Rendering {
  kind: ContentKind;
  language: "sa" | "en" | "hi";
  text: string;
  author: string | null;
  reviewState: ReviewState;
  reviewerName: string | null;
}

export interface CorpusPassage {
  /** Stable external ID; database rows may additionally use UUID keys. */
  id: string;
  lessonId: string;
  source: SourceRecord;
  renderings: readonly Rendering[];
  themeKeys: readonly string[];
  searchAliases: readonly string[];
  publicationState: "demo_only";
  /** Deliberately false while source rights and editorial review are unresolved. */
  aiUseAllowed: false;
}

const source = (id: string, chapter: number, verse: number): SourceRecord => ({
  id: `gita-supersite-${id}`,
  workSlug: "bhagavad-gita",
  workTitle: "Bhagavad Gita",
  canonicalReference: `${chapter}.${verse}`,
  sourceTitle: "Gita Supersite — original Sanskrit verse display",
  sourceUrl: `https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=${chapter}&field_nsutra_value=${verse}`,
  sourceOrganization: "Indian Institute of Technology Kanpur",
  sourceLanguage: "sa",
  edition: null,
  translator: null,
  licenseName: null,
  copyrightStatus: "unknown",
  attributionRequirements: null,
  rightsState: "unknown",
  textComparedOn: "2026-09-25",
});

const original = (text: string): Rendering => ({
  kind: "CANONICAL_TEXT",
  language: "sa",
  text,
  author: null,
  reviewState: "unreviewed",
  reviewerName: null,
});

const roman = (text: string): Rendering => ({
  kind: "TRANSLITERATION",
  language: "sa",
  text,
  author: "Spritual alpha editorial draft",
  reviewState: "unreviewed",
  reviewerName: null,
});

const explanation = (language: "en" | "hi", text: string): Rendering => ({
  kind: "EDITORIAL_EXPLANATION",
  language,
  text,
  author: "Spritual alpha editorial draft",
  reviewState: "unreviewed",
  reviewerName: null,
});

const corpus: readonly CorpusPassage[] = freezeDemoContent([
  {
    id: "bg.2.47",
    lessonId: "gita-2-47",
    source: source("2-47", 2, 47),
    renderings: [
      original("कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥२.४७॥"),
      roman("karmaṇy evādhikāras te mā phaleṣu kadācana |\nmā karmaphalahetur bhūr mā te saṅgo ’stv akarmaṇi || 2.47 ||"),
      explanation("en", "Demo interpretation: Krishna asks Arjuna to act without clinging to a reward, and also warns against avoiding action. For everyday life, we can practise giving care to the work in front of us. This does not mean that consequences do not matter or that we should accept unfair treatment."),
      explanation("hi", "डेमो व्याख्या: कृष्ण अर्जुन को फल की आसक्ति छोड़कर कर्म करने के लिए कहते हैं और कर्म से बचने की चेतावनी भी देते हैं। रोज़मर्रा में हम सामने के काम को ध्यान से करने का अभ्यास कर सकते हैं। इसका अर्थ परिणामों की अनदेखी करना या अन्याय सहना नहीं है।"),
    ],
    themeKeys: ["purpose", "work", "uncertainty"],
    searchAliases: ["results", "outcome", "postponing", "कर्म", "परिणाम"],
    publicationState: "demo_only",
    aiUseAllowed: false,
  },
  {
    id: "bg.2.48",
    lessonId: "gita-2-48",
    source: source("2-48", 2, 48),
    renderings: [
      original("योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥२.४८॥"),
      roman("yogasthaḥ kuru karmāṇi saṅgaṃ tyaktvā dhanañjaya |\nsiddhyasiddhyoḥ samo bhūtvā samatvaṃ yoga ucyate || 2.48 ||"),
      explanation("en", "Demo interpretation: Krishna describes acting with steadiness through success and failure, without clinging to either. An everyday application is to notice your reaction before choosing your response. Balance need not mean feeling nothing; you can care deeply and still act thoughtfully."),
      explanation("hi", "डेमो व्याख्या: कृष्ण सफलता और असफलता, दोनों में समभाव रखकर कर्म करने की बात करते हैं। रोज़मर्रा में हम जवाब देने से पहले अपनी प्रतिक्रिया को पहचानने का अभ्यास कर सकते हैं। संतुलन का अर्थ भावनाहीन होना नहीं है; आप परवाह करते हुए भी सोच-समझकर काम कर सकते हैं।"),
    ],
    themeKeys: ["balance", "change", "failure"],
    searchAliases: ["success", "response", "equanimity", "संतुलन", "समत्व"],
    publicationState: "demo_only",
    aiUseAllowed: false,
  },
  {
    id: "bg.6.26",
    lessonId: "gita-6-26",
    source: source("6-26", 6, 26),
    renderings: [
      original("यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥६.२६॥"),
      roman("yato yato niścarati manaś cañcalam asthiram |\ntatas tato niyamyaitad ātmany eva vaśaṃ nayet || 6.26 ||"),
      explanation("en", "Demo interpretation: the verse describes repeatedly bringing the wandering mind back to the Self. Its spiritual meaning is deeper than a productivity tip. As a small everyday exercise inspired by it, we can notice distraction and return to the task we chose, without turning that moment into a judgment about ourselves."),
      explanation("hi", "डेमो व्याख्या: इस श्लोक में चंचल मन को बार-बार आत्मा में स्थिर करने की बात है। इसका आध्यात्मिक अर्थ केवल काम में ध्यान लगाने से अधिक गहरा है। इससे प्रेरित एक छोटे अभ्यास में हम ध्यान भटकने को पहचानकर अपने चुने हुए काम पर लौट सकते हैं, बिना खुद को दोष दिए।"),
    ],
    themeKeys: ["attention", "distraction", "return"],
    searchAliases: ["wandering mind", "focus", "ध्यान", "मन"],
    publicationState: "demo_only",
    aiUseAllowed: false,
  },
] as const);

function rendering(passage: CorpusPassage, kind: ContentKind, language: Rendering["language"]): Rendering | undefined {
  return passage.renderings.find((item) => item.kind === kind && item.language === language);
}

/** Full records for trusted local presentation/editing only; never imply publication. */
export function listDemoCorpus(): readonly CorpusPassage[] {
  return corpus;
}

export function getDemoCorpusPassage(id: string): CorpusPassage | undefined {
  return corpus.find((passage) => passage.id === id || passage.lessonId === id);
}

/** Compact adapter for offline lookup and the AI layer's source-citation contract. */
export interface DemoPassage {
  id: string;
  work: string;
  reference: string;
  original: string;
  transliteration: string;
  /** This is an unreviewed original explanation, not a translation. */
  interpretation: string;
  sourceUrl: string;
  localPath: string;
  /** Language of the accompanying editorial explanation; original remains Sanskrit. */
  language: "en" | "hi";
  tags: readonly string[];
  aliases: readonly string[];
  status: "demo";
  aiUseAllowed: false;
  sourceRights: "unknown";
  interpretationReview: "unreviewed";
}

export function listDemoPassages(language: "en" | "hi" = "en"): readonly DemoPassage[] {
  return freezeDemoContent(corpus.map((passage) => ({
    id: passage.id,
    work: passage.source.workTitle,
    reference: `Bhagavad Gita ${passage.source.canonicalReference}`,
    original: rendering(passage, "CANONICAL_TEXT", "sa")!.text,
    transliteration: rendering(passage, "TRANSLITERATION", "sa")!.text,
    interpretation: rendering(passage, "EDITORIAL_EXPLANATION", language)!.text,
    sourceUrl: passage.source.sourceUrl,
    localPath: `/alpha/episode/${passage.lessonId}?scene=1`,
    language,
    tags: passage.themeKeys,
    aliases: passage.searchAliases,
    status: "demo",
    aiUseAllowed: false,
    sourceRights: "unknown",
    interpretationReview: "unreviewed",
  })));
}

/**
 * Local metadata preflight only. A server must authenticate the reviewer and
 * validate the referenced rights record against the exact content version;
 * passing this predicate alone must never authorize public delivery.
 */
export function canPublishContent(input: {
  rightsState: RightsState;
  rightsEvidenceRef: string | null;
  licenseName: string | null;
  provenanceVerified: boolean;
  reviewState: ReviewState;
  reviewerName: string | null;
}): boolean {
  return input.rightsState === "permission_recorded"
    && Boolean(input.rightsEvidenceRef?.trim())
    && Boolean(input.licenseName?.trim())
    && input.provenanceVerified
    && input.reviewState === "approved"
    && Boolean(input.reviewerName?.trim());
}
