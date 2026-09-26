import { freezeDemoContent } from "./freeze.ts";

/** Original alpha retelling of a short Gita sequence, never a translation. */
export interface DemoStoryScene {
  id: string;
  reference: string;
  sourceVerses: readonly { verse: number; url: string }[];
  title: { en: string; hi: string };
  narrative: { en: string; hi: string };
  reflection: { en: string; hi: string };
}

const source = (verse: number) =>
  `https://www.gitasupersite.iitk.ac.in/srimad?choose=1&field_chapter_value=1&field_nsutra_value=${verse}&language=dv`;

export const arjunaBowStory = freezeDemoContent({
  id: "arjuna-lays-down-bow",
  title: { en: "Before the teaching", hi: "उपदेश से पहले" },
  subtitle: { en: "The moment Arjuna puts down his bow", hi: "जब अर्जुन ने धनुष रख दिया" },
  sourceWork: "Bhagavad Gita",
  kind: "STORY_RETELLING" as const,
  reviewState: "unreviewed" as const,
  publicationState: "demo_only" as const,
  rightsState: "unknown" as const,
  aiUseAllowed: false as const,
  scenes: [
    {
      id: "between-armies",
      reference: "Bhagavad Gita 1.24–1.25",
      sourceVerses: [{ verse: 24, url: source(24) }, { verse: 25, url: source(25) }],
      title: { en: "Between two armies", hi: "दो सेनाओं के बीच" },
      narrative: {
        en: "Arjuna asks Krishna to bring the chariot into the space between the two armies. Krishna stops where Arjuna can see the people assembled before him.",
        hi: "अर्जुन कृष्ण से रथ को दोनों सेनाओं के बीच ले चलने को कहते हैं। कृष्ण रथ वहाँ रोकते हैं जहाँ से अर्जुन सामने खड़े लोगों को देख सकें।",
      },
      reflection: { en: "Before a hard decision, what do you need to see clearly?", hi: "कठिन निर्णय से पहले आपको क्या साफ़ देखना चाहिए?" },
    },
    {
      id: "familiar-faces",
      reference: "Bhagavad Gita 1.26 & 1.28",
      sourceVerses: [{ verse: 26, url: source(26) }, { verse: 28, url: source(28) }],
      title: { en: "Familiar faces", hi: "जाने-पहचाने चेहरे" },
      narrative: {
        en: "Arjuna recognizes family, teachers and friends on the field. The coming conflict is no longer an abstract task; it involves people he knows. He tells Krishna how deeply the sight troubles him.",
        hi: "अर्जुन मैदान में परिवार, गुरु और मित्रों को पहचानते हैं। सामने का संघर्ष अब केवल एक काम नहीं रह जाता; इसमें वे लोग हैं जिन्हें वह जानते हैं। वह कृष्ण से अपना दुख कहते हैं।",
      },
      reflection: { en: "Who else is affected by the choice in front of you?", hi: "आपके सामने जो चुनाव है, उससे और कौन प्रभावित होगा?" },
    },
    {
      id: "bow-down",
      reference: "Bhagavad Gita 1.47",
      sourceVerses: [{ verse: 47, url: source(47) }],
      title: { en: "The bow falls", hi: "धनुष छूट जाता है" },
      narrative: {
        en: "After speaking, Arjuna lets go of his bow and sits down in the chariot, overwhelmed by grief. The Gita's teaching begins from this human pause, not from a claim that he already has an answer.",
        hi: "अपनी बात कहकर अर्जुन धनुष छोड़ देते हैं और शोक से व्याकुल होकर रथ में बैठ जाते हैं। गीता की सीख इस मानवीय ठहराव से शुरू होती है—इस दावे से नहीं कि उनके पास पहले से उत्तर था।",
      },
      reflection: { en: "Could you name what feels difficult before forcing an answer?", hi: "उत्तर तय करने से पहले क्या आप कठिनाई को नाम दे सकते हैं?" },
    },
  ] satisfies readonly DemoStoryScene[],
} as const);
