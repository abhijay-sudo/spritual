export interface StoryScene {
  index: number;
  id: string;
  title: string;
  titleHindi: string;
  citationRef: string;
  sanskritHeadline: string;
  sanskritIAST: string;
  textEn: string[];
  textHi: string[];
  marginalia: {
    id: string;
    targetParagraphIndex: number;
    anchorText: string;
    citationId: string;
    sideNote: string;
  }[];
  practiceTrigger?: {
    beadsCount: number;
    mantra: string;
    mantraIAST: string;
    promptText: string;
  };
}

export interface StoryDocument {
  collection: string;
  book: string;
  arc: string;
  slug: string;
  title: string;
  titleHindi: string;
  subtitle: string;
  collectionTitle: string;
  bookTitle: string;
  arcTitle: string;
  audioPrologueDurationSec: number;
  estimatedMinutes: number;
  scenes: StoryScene[];
}

export const storiesData: Record<string, StoryDocument> = {
  "valmikis-question": {
    collection: "ramayana",
    book: "bala-kanda",
    arc: "origin",
    slug: "valmikis-question",
    title: "Valmiki's Question",
    titleHindi: "वाल्मीकि का प्रश्न",
    subtitle: "The asking that awakened an epic from silence",
    collectionTitle: "Valmiki Ramayana",
    bookTitle: "Bala Kanda",
    arcTitle: "The Awakening of Song",
    audioPrologueDurationSec: 24,
    estimatedMinutes: 9,
    scenes: [
      {
        index: 1,
        id: "scene-1",
        title: "The Solitary Hermitage",
        titleHindi: "शांत तपोवन",
        citationRef: "valmiki-1-1",
        sanskritHeadline: "तपःस्वाध्यायनिरतं तपस्वी वाग्विदां वरम् ।",
        sanskritIAST: "tapaḥsvādhyāyanirataṁ tapasvī vāgvidāṁ varam |",
        textEn: [
          "The Tamasa river flowed with water as clean as the mind of a tranquil sage. Upon its banks, wrapped in simple bark, sat Valmiki.",
          "He was not seeking poetic fame, nor did he intend to compose a scripture that would outlast empires. He was burdened by an urgent, gnawing question that scholars of courtly ethics had long avoided.",
          "Through the dappled forest sunlight arrived Narada, the traveller of cosmic dimensions who possessed speech that neither flattered kings nor softened truth.",
        ],
        textHi: [
          "तमसा नदी का जल किसी शांत योगी के चित्त के समान निर्मल प्रवाहित हो रहा था। उसके पावन तट पर वल्कल वस्त्र धारण किए महर्षि वाल्मीकि विराजमान थे।",
          "वे न तो कवि की कीर्ति की खोज में थे, और न ही किसी ऐसे महाकाव्य के सृजन की आकांक्षा थी जो युगों तक जीवित रहे। उनके हृदय में एक विचलित कर देने वाला प्रश्न था, जिसे दरबारी पंडितों ने सदैव टाल दिया था।",
          "तभी वनों के शांत प्रकाश के बीच देवर्षि नारद का आगमन हुआ — वे यात्री जो न तो राजाओं की चाटुकारिता करते थे, और न ही सत्य को आभूषणों में छिपाते थे।",
        ],
        marginalia: [
          {
            id: "m-1",
            targetParagraphIndex: 1,
            anchorText: "urgent, gnawing question",
            citationId: "valmiki-1-1",
            sideNote: "Notice that the epic begins with inquiry (paripapraccha), not a decree from the heavens. Truth is invited through rigorous conversation.",
          },
        ],
      },
      {
        index: 2,
        id: "scene-2",
        title: "The Sixteen Qualities",
        titleHindi: "षोडश गुण",
        citationRef: "valmiki-1-2",
        sanskritHeadline: "को न्वस्मिन् साम्प्रतं लोके गुणवान् कश्च वीर्यवान् ।",
        sanskritIAST: "ko nvasmin sāmprataṁ loke guṇavān kaśca vīryavān |",
        textEn: [
          "Valmiki bowed his head and spoke into the silence of the ashrama: 'Tell me, Narada, in this fragile and compromised world, does there walk even one living person who possesses unshakeable integrity?'",
          "He did not ask for a sorcerer or an invincible warrior. He asked for a human being who is mindful of past kindness (kṛtajña), truthful under torture, master of wrath, and radiant without vanity.",
          "The forest seemed to hold its breath. In an age already stained by compromise, asking for sixteenth-fold virtue seemed almost naive.",
        ],
        textHi: [
          "वाल्मीकि ने नतमस्तक होकर आश्रम की गहरी शांति में पूछा: 'हे मुनिवर! इस नश्वर और छल-कपट से भरे संसार में क्या कोई ऐसा जीवित मनुष्य है, जिसके चरित्र में अटूट धर्म निष्ठा हो?'",
          "उन्होंने किसी चमत्कारिक जादूगर या अजेय योद्धा के विषय में नहीं पूछा। उन्होंने ऐसे मनुष्य की खोज की जो कृतज्ञ हो, सत्यवादी हो, जिसने क्रोध पर विजय पाई हो, और जिसका तेज बिना अहंकार के आलोकित हो।",
          "पूरा तपोवन स्तब्ध हो गया। समझौते के इस युग में सोलह अलौकिक गुणों से युक्त मनुष्य की कल्पना भी असंभव प्रतीत होती थी।",
        ],
        marginalia: [
          {
            id: "m-2",
            targetParagraphIndex: 1,
            anchorText: "mindful of past kindness (kṛtajña)",
            citationId: "valmiki-1-2",
            sideNote: "In ancient Indian ethics, the worst sin is not cowardice, but kṛtaghnata — forgetting the grace of those who stood by you in darkness.",
          },
        ],
        practiceTrigger: {
          beadsCount: 27,
          mantra: "ॐ श्री रामचन्द्राय नमः",
          mantraIAST: "oṁ śrī rāmacandrāya namaḥ",
          promptText: "Pause before moving deeper. Chant 27 beads to steady your focus upon the qualities of truth and gratitude.",
        },
      },
      {
        index: 3,
        id: "scene-3",
        title: "Narada's Smile",
        titleHindi: "नारद की सौम्य मुस्कान",
        citationRef: "valmiki-1-2",
        sanskritHeadline: "इक्ष्वाकुवंशप्रभवो रामो नाम जनैः श्रुतः ।",
        sanskritIAST: "ikṣvākuvaṁśaprabhavo rāmo nāma janaiḥ śrutaḥ |",
        textEn: [
          "Narada smiled — a smile born not of condescension, but of deep joy that such a pure question had been uttered.",
          "'Rare indeed are the virtues you catalogue, O sage,' Narada answered. 'Yet there is one who walks the red dust of Ayodhya in whom all these rivers meet without spilling.'",
          "'Born in the solar lineage of Ikshvaku, known to the people as Rama. He does not proclaim his virtue; his presence alone restores the moral compass of all who see him.'",
        ],
        textHi: [
          "नारद मंद-मंद मुस्कुराए — यह मुस्कान उपहास की नहीं, अपितु उस असीम आनंद की थी जो किसी अत्यंत शुद्ध और गंभीर प्रश्न को सुनकर उत्पन्न होती है।",
          "नारद बोले, 'हे महर्षि! जिन दुर्लभ गुणों की आपने गणना की है, वे साधारण मनुष्यों में अप्राप्य हैं। तथापि अयोध्या की पावन भूमि पर एक ऐसा पुरुष विचरण कर रहा है, जिसमें ये सभी नदियाँ बिना किसी उफान के समाहित हो जाती हैं।'",
          "'इक्ष्वाकु वंश में जन्मे, जिन्हें संसार राम के नाम से जानता है। वे अपने गुणों का उद्घोष नहीं करते; उनकी मात्र उपस्थिति ही देखने वालों के भीतर धर्म का दीप प्रज्वलित कर देती है।'",
        ],
        marginalia: [],
      },
      {
        index: 4,
        id: "scene-4",
        title: "The Cry in the Reeds",
        titleHindi: "तमसा तट का क्रौंच-वध",
        citationRef: "valmiki-1-1",
        sanskritHeadline: "मा निषाद प्रतिष्ठां त्वमगमः शाश्वतीः समाः ।",
        sanskritIAST: "mā niṣāda pratiṣṭhāṁ tvamagamaḥ śāśvatīḥ samāḥ |",
        textEn: [
          "Later that day, Valmiki walked once more to the water's edge. High in the branches of a flowering tree, a pair of Krauncha birds were singing in the rapture of love.",
          "Without warning, an iron arrow hissed through the foliage. The male bird tumbled into the mud, his plumage soaked in bright crimson, while the mate wailed in an unbearable, piercing circle of grief.",
          "Something broke open in Valmiki's chest. Not wrath, but an ocean of shoka (sorrow) that overflowed human capacity.",
        ],
        textHi: [
          "उसी दिन संध्या के समय, वाल्मीकि पुनः नदी तट की ओर बढ़े। कदंब के वृक्ष पर क्रौंच पक्षी का एक युगल प्रेम के उल्लास में कलरव कर रहा था।",
          "अकस्मात एक विषैला बाण पत्तों को चीरता हुआ निकला। नर क्रौंच रक्त से लथपथ होकर धूल में गिर पड़ा, और मादा क्रौंच असहनीय विलाप करती हुई आकाश में चक्कर काटने लगी।",
          "वाल्मीकि के अंतःकरण में कुछ टूट गया। वह केवल क्रोध नहीं था, अपितु शोक का एक ऐसा असीम महासागर था जो मानव मन की सीमाओं को पार कर गया।",
        ],
        marginalia: [
          {
            id: "m-3",
            targetParagraphIndex: 2,
            anchorText: "ocean of shoka (sorrow)",
            citationId: "valmiki-1-1",
            sideNote: "From shoka (pure grief) emerged shloka (sacred rhythm). The classical poetic tradition is born when personal trauma transforms into universal compassion.",
          },
        ],
        practiceTrigger: {
          beadsCount: 54,
          mantra: "ॐ शान्तिः शान्तिः शान्तिः",
          mantraIAST: "oṁ śāntiḥ śāntiḥ śāntiḥ",
          promptText: "Sit with the suffering of the living world. Turn 54 beads in contemplation of universal peace.",
        },
      },
      {
        index: 5,
        id: "scene-5",
        title: "The Birth of the Meter",
        titleHindi: "छन्द का प्राकट्य",
        citationRef: "valmiki-1-1",
        sanskritHeadline: "शोकार्तस्य प्रवृत्तो मे श्लोको भवतु नान्यथा ॥",
        sanskritIAST: "śokārtasya pravṛtto me śloko bhavatu nānyathā ||",
        textEn: [
          "From the sage's lips burst four balanced quarters of eight syllables each — words shaped by pain yet governed by perfect harmony.",
          "When Brahma appeared before the contemplative sage, he did not rebuke the curse. He confirmed it: 'What has poured from your sorrow is no mere speech. It is the metric vessel that will carry Rama's life across millennia.'",
          "'As long as mountains stand upon the earth, and rivers flow to the sea, so long shall your story of the righteous prince be spoken among mankind.'",
        ],
        textHi: [
          "ऋषि के अधरों से स्वतः आठ-आठ अक्षरों के चार सधे हुए चरण फूट पड़े — वे शब्द जो असीम पीड़ा से जन्मे थे, किंतु दिव्य संतुलन और माधुर्य से परिपूर्ण थे।",
          "जब साक्षात ब्रह्मा प्रकट हुए, तो उन्होंने कहा: 'हे महर्षि! आपके शोक से जो प्रकट हुआ है, वह साधारण वाणी नहीं है। यह वह पावन छन्द है जो युग-युगांतर तक धर्म की रक्षा करेगा।'",
          "'जब तक इस पृथ्वी पर पर्वत स्थिर रहेंगे, और नदियाँ सागर की ओर बहती रहेंगी, तब तक आपकी यह पावन गाथा मानव जाति के हृदय में गूंजती रहेगी।'",
        ],
        marginalia: [],
        practiceTrigger: {
          beadsCount: 108,
          mantra: "ॐ श्री राम जय राम जय जय राम",
          mantraIAST: "oṁ śrī rāma jaya rāma jaya jaya rāma",
          promptText: "Complete the full 108 japa round to seal the awakening of this story within your own breath.",
        },
      },
    ],
  },
};
