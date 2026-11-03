export interface ScholarlyCitation {
  id: string;
  source: string;
  canto: string;
  verseRef: string;
  shlokaDevanagari: string;
  shlokaIAST: string;
  wordByWord: { root: string; meaning: string }[];
  translation: string;
  commentary: string;
  provenance: string;
}

export const scholarlyCitations: Record<string, ScholarlyCitation> = {
  "valmiki-1-1": {
    id: "valmiki-1-1",
    source: "Valmiki Ramayana, Bala Kanda",
    canto: "Sarga 1",
    verseRef: "1.1.1-2",
    shlokaDevanagari: "तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ।\nनारदं परिपप्रच्छ वाल्मीकिर्मुनिपुङ्गवम् ॥",
    shlokaIAST: "tapaḥsvādhyāyanirataṁ tapasvī vāgvidāṁ varam |\nnāradaṁ paripapraccha vālmīkirmunipuṅgavam ||",
    wordByWord: [
      { root: "तपः-स्वाध्याय-निरतम्", meaning: "devoted to austerity and self-study" },
      { root: "तपस्वी", meaning: "the ascetic (Valmiki)" },
      { root: "वाग्विदां वरम्", meaning: "foremost among those who know speech" },
      { root: "नारदम्", meaning: "unto Narada" },
      { root: "परिपप्रच्छ", meaning: "deeply questioned" },
      { root: "वाल्मीकिः", meaning: "Valmiki" },
      { root: "मुनिपुङ्गवम्", meaning: "the eminent sage" },
    ],
    translation: "Valmiki, the ascetic devoted to sacred practice and contemplation, questioned Narada, the foremost speaker among the enlightened.",
    commentary: "The epic does not begin with war, miracles, or dynastic conquest. It begins with an urgent human question addressed to a travelling sage: Can an ideal human being actually exist in an imperfect world?",
    provenance: "Critical Edition, Oriental Institute of Baroda (1960). Verified across Southern and Northern recensions.",
  },
  "valmiki-1-2": {
    id: "valmiki-1-2",
    source: "Valmiki Ramayana, Bala Kanda",
    canto: "Sarga 1",
    verseRef: "1.1.2-4",
    shlokaDevanagari: "को न्वस्मिन् साम्प्रतं लोके गुणवान् कश्च वीर्यवान् ।\nधर्मज्ञश्च कृतज्ञश्च सत्यवाक्यो दृढव्रतः ॥",
    shlokaIAST: "ko nvasmin sāmprataṁ loke guṇavān kaśca vīryavān |\ndharmajñaśca kṛtajñaśca satyavākyo dṛḍhavrataḥ ||",
    wordByWord: [
      { root: "कः नु अस्मिन्", meaning: "who indeed in this" },
      { root: "साम्प्रतं लोके", meaning: "present living world" },
      { root: "गुणवान्", meaning: "endowed with nobility" },
      { root: "वीर्यवान्", meaning: "courageous and steadfast" },
      { root: "धर्मज्ञः च", meaning: "knower of dharma" },
      { root: "कृतज्ञः च", meaning: "mindful of kindness received" },
      { root: "सत्यवाक्यः", meaning: "unflinching in truth" },
      { root: "दृढव्रतः", meaning: "resolute in vows" },
    ],
    translation: "Who in this present world embodies nobility, resolute courage, understanding of righteous duty, gratitude, truthfulness in speech, and unyielding discipline?",
    commentary: "Notice that 'gratitude' (kṛtajña) precedes valor. In Valmiki's ethical cosmology, an ingrate cannot be heroic regardless of physical strength.",
    provenance: "Baroda Critical Edition, Vol 1, page 14.",
  },
  "vyasa-shloka-1": {
    id: "vyasa-shloka-1",
    source: "Vyasa Mahabharata, Svargarohana Parva",
    canto: "Parva 18",
    verseRef: "18.5.38",
    shlokaDevanagari: "धर्मे चार्थे च कामे च मोक्षे च भरतर्षभ ।\nयदिहास्ति तदन्यत्र यन्नेहास्ति न तत्क्वचित् ॥",
    shlokaIAST: "dharme cārthe ca kāme ca mokṣe ca bharatarṣabha |\nyadihāsti tadanyatra yannehāsti na tatkvacit ||",
    wordByWord: [
      { root: "धर्मे", meaning: "in righteousness and ethics" },
      { root: "च अर्थे", meaning: "and in purposeful prosperity" },
      { root: "कामे च", meaning: "and in desire or love" },
      { root: "मोक्षे च", meaning: "and in ultimate liberation" },
      { root: "भरतर्षभ", meaning: "O bull among Bharatas" },
      { root: "यदिह अस्ति", meaning: "whatever is found here" },
      { root: "तत् अन्यत्र", meaning: "that is elsewhere" },
      { root: "यत् न इह", meaning: "what is not found here" },
      { root: "न तत् क्वचित्", meaning: "is nowhere else" },
    ],
    translation: "In the realms of dharma (righteousness), artha (purposeful wealth), kama (desire), and moksha (liberation), whatever is found here may be found elsewhere; but whatever is not found here is nowhere to be found.",
    commentary: "Vyasa asserts the exhaustive moral map of human consciousness. Every temptation, compromise, sacrifice, and tragedy of modern life is already recorded here.",
    provenance: "Bhandarkar Oriental Research Institute (BORI) Critical Edition, Poona (1966).",
  },
  "gita-2-47": {
    id: "gita-2-47",
    source: "Bhagavad Gita, Chapter 2 (Sankhya Yoga)",
    canto: "Adhyaya 2",
    verseRef: "2.47",
    shlokaDevanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    shlokaIAST: "karmaṇyevādhikāraste mā phaleṣu kadācana |\nmā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi ||",
    wordByWord: [
      { root: "कर्मणि एव", meaning: "in action alone" },
      { root: "अधिकारः ते", meaning: "is your legitimate jurisdiction" },
      { root: "मा फलेषु", meaning: "never in its fruits" },
      { root: "कदाचन", meaning: "at any time" },
      { root: "मा कर्मफलहेतुः", meaning: "do not be motivated by outcomes" },
      { root: "भूः", meaning: "become" },
      { root: "मा ते सङ्गः", meaning: "let not your attachment" },
      { root: "अस्तु अकर्मणि", meaning: "be unto non-action" },
    ],
    translation: "You have jurisdiction over your action alone, never over its fruits. Let not the fruits of action be your motive, nor let your attachment turn toward inaction.",
    commentary: "This is not passive resignation. It is active liberation from cognitive panic. When the mind ceases projecting anxiety into uncontrollable futures, execution attains effortless precision.",
    provenance: "Adi Shankaracharya Bhasya & Anandagiri Tika collation.",
  },
};
