export type Language = "en" | "hi";

export type Localized = Record<Language, string>;

export interface LessonStep {
  id: string;
  kind: "arrive" | "verse" | "understand" | "apply";
  title: Localized;
  body: Localized;
  script?: string;
  transliteration?: string;
}

export interface Lesson {
  id: string;
  title: Localized;
  subtitle: Localized;
  reference: string;
  theme: Localized;
  themeKey: "purpose" | "balance" | "attention";
  sourceUrl: string;
  sourceNote: Localized;
  steps: LessonStep[];
  action: Localized;
  reflection: Localized;
}

const sourceNote = (reference: string): Localized => ({
  en: `Sanskrit: Bhagavad Gita ${reference}. English/Hindi explanation is an unreviewed demonstration; no human recording yet.`,
  hi: `संस्कृत: भगवद्गीता ${reference}। अंग्रेज़ी और हिंदी व्याख्या केवल डेमो है; किसी विद्वान ने इसकी समीक्षा नहीं की है। मानव स्वर में रिकॉर्डिंग अभी उपलब्ध नहीं है।`,
});

// The ancient Sanskrit verses were checked against Gita Supersite's मूल श्लोकः
// on 23 September 2026. Modern translations and commentaries are not reproduced.
// The explanations and everyday exercises below are original, unreviewed demos.
// Session durations are reading paces, not distinct reviewed scripture variants.
export const lessons: Lesson[] = [
  {
    id: "gita-2-47",
    title: { en: "One thing you can do", hi: "एक काम, पूरे मन से" },
    subtitle: {
      en: "Bring your care to the next step, even when the outcome is uncertain.",
      hi: "नतीजा तय न हो, तब भी अगले कदम में अपना पूरा ध्यान दें।",
    },
    reference: "Bhagavad Gita 2.47",
    theme: { en: "Purpose", hi: "कर्म" },
    themeKey: "purpose",
    sourceUrl:
      "https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=2&field_nsutra_value=47",
    sourceNote: sourceNote("2.47"),
    steps: [
      {
        id: "arrive",
        kind: "arrive",
        title: { en: "Begin where you are", hi: "जहाँ हैं, वहीं से शुरू करें" },
        body: {
          en: "Think of one unfinished task: a message, a page to study, or something at home. Choose something small enough to begin today. You do not need to solve everything in this moment.",
          hi: "कोई एक अधूरा काम याद करें: एक संदेश, पढ़ाई का एक पन्ना या घर का कोई काम। इतना छोटा काम चुनें कि आज उसे शुरू कर सकें। अभी सब कुछ सुलझाना ज़रूरी नहीं है।",
        },
      },
      {
        id: "verse",
        kind: "verse",
        title: { en: "Read the verse", hi: "श्लोक पढ़ें" },
        body: {
          en: "Read at your own pace. The Roman text helps you follow the Sanskrit; it is not a substitute for pronunciation guidance from a teacher.",
          hi: "अपनी गति से पढ़ें। रोमन लिपि संस्कृत पढ़ने में मदद करती है; सही उच्चारण सीखने के लिए शिक्षक का मार्गदर्शन उपयोगी है।",
        },
        script:
          "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥२.४७॥",
        transliteration:
          "karmaṇy evādhikāras te mā phaleṣu kadācana |\nmā karmaphalahetur bhūr mā te saṅgo ’stv akarmaṇi || 2.47 ||",
      },
      {
        id: "understand",
        kind: "understand",
        title: { en: "Care for the work", hi: "अपने कर्म पर ध्यान दें" },
        body: {
          en: "Demo interpretation: Krishna asks Arjuna to act without clinging to a reward, and also warns against avoiding action. For everyday life, we can practise giving care to the work in front of us. This does not mean that consequences do not matter or that we should accept unfair treatment.",
          hi: "डेमो व्याख्या: कृष्ण अर्जुन को फल की आसक्ति छोड़कर कर्म करने के लिए कहते हैं और कर्म से बचने की चेतावनी भी देते हैं। रोज़मर्रा में हम सामने के काम को ध्यान से करने का अभ्यास कर सकते हैं। इसका अर्थ परिणामों की अनदेखी करना या अन्याय सहना नहीं है।",
        },
      },
      {
        id: "apply",
        kind: "apply",
        title: { en: "Choose your next step", hi: "अपना अगला कदम चुनें" },
        body: {
          en: "Return to the task you chose. Name one action within your reach: write the first sentence, read one paragraph, or put one thing in its place. After this session, do that one action with care.",
          hi: "अपने चुने हुए काम पर लौटें। एक ऐसा कदम तय करें जो आप उठा सकें: पहला वाक्य लिखना, एक अनुच्छेद पढ़ना या एक चीज़ सही जगह रखना। अभ्यास के बाद वही एक कदम ध्यान से पूरा करें।",
        },
      },
    ],
    action: {
      en: "Take one small, useful step on a task you have been postponing.",
      hi: "जिस काम को टाल रहे हैं, उसमें एक छोटा और उपयोगी कदम उठाएँ।",
    },
    reflection: {
      en: "What is one action I can give my care to today?",
      hi: "आज मैं कौन-सा एक काम पूरे ध्यान से कर सकता या सकती हूँ?",
    },
  },
  {
    id: "gita-2-48",
    title: { en: "Meet the day steadily", hi: "बदलते दिन में संतुलन" },
    subtitle: {
      en: "Make room for your feelings, then choose a considered response.",
      hi: "अपनी भावनाओं को पहचानें, फिर सोच-समझकर अगला कदम चुनें।",
    },
    reference: "Bhagavad Gita 2.48",
    theme: { en: "Balance", hi: "संतुलन" },
    themeKey: "balance",
    sourceUrl:
      "https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=2&field_nsutra_value=48",
    sourceNote: sourceNote("2.48"),
    steps: [
      {
        id: "arrive",
        kind: "arrive",
        title: { en: "Notice what you bring", hi: "अपने मन की बात पहचानें" },
        body: {
          en: "Recall an ordinary moment that did not go as planned. Perhaps a delayed reply or a changed plan. If nothing comes to mind, imagine one. There is no need to revisit anything painful.",
          hi: "कोई सामान्य पल याद करें जब बात आपकी उम्मीद के अनुसार नहीं हुई: देर से आया जवाब या बदली हुई योजना। चाहें तो ऐसी स्थिति की कल्पना करें। किसी पीड़ादायक बात को दोहराना ज़रूरी नहीं है।",
        },
      },
      {
        id: "verse",
        kind: "verse",
        title: { en: "Read the verse", hi: "श्लोक पढ़ें" },
        body: {
          en: "This verse follows 2.47. Read it slowly, noticing the word samatvam: evenness or equanimity.",
          hi: "यह श्लोक 2.47 के बाद आता है। धीरे पढ़ें और “समत्वम्” शब्द पर ध्यान दें: समभाव या मन का संतुलन।",
        },
        script:
          "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥२.४८॥",
        transliteration:
          "yogasthaḥ kuru karmāṇi saṅgaṃ tyaktvā dhanañjaya |\nsiddhyasiddhyoḥ samo bhūtvā samatvaṃ yoga ucyate || 2.48 ||",
      },
      {
        id: "understand",
        kind: "understand",
        title: { en: "Steadiness while acting", hi: "कर्म करते हुए समभाव" },
        body: {
          en: "Demo interpretation: Krishna describes acting with steadiness through success and failure, without clinging to either. An everyday application is to notice your reaction before choosing your response. Balance need not mean feeling nothing; you can care deeply and still act thoughtfully.",
          hi: "डेमो व्याख्या: कृष्ण सफलता और असफलता, दोनों में समभाव रखकर कर्म करने की बात करते हैं। रोज़मर्रा में हम जवाब देने से पहले अपनी प्रतिक्रिया को पहचानने का अभ्यास कर सकते हैं। संतुलन का अर्थ भावनाहीन होना नहीं है; आप परवाह करते हुए भी सोच-समझकर काम कर सकते हैं।",
        },
      },
      {
        id: "apply",
        kind: "apply",
        title: {
          en: "Make space before replying",
          hi: "जवाब देने से पहले थोड़ा ठहरें",
        },
        body: {
          en: "For the situation you chose, separate what happened from what you assumed. “The reply is late” is an observation; “They do not care” is an assumption. Draft one clear, respectful question you could ask instead.",
          hi: "अपने चुने हुए प्रसंग में जो हुआ, उसे अपने अनुमान से अलग करें। “जवाब देर से आया” एक तथ्य है; “उन्हें परवाह नहीं” एक अनुमान। उसकी जगह पूछने के लिए एक साफ़ और सम्मानजनक सवाल सोचें।",
        },
      },
    ],
    action: {
      en: "Before one reply today, separate the facts from your assumptions.",
      hi: "आज एक जवाब देने से पहले तथ्य और अपने अनुमान को अलग करें।",
    },
    reflection: {
      en: "What would a steady, respectful response look like?",
      hi: "इस स्थिति में संतुलित और सम्मानजनक जवाब कैसा होगा?",
    },
  },
  {
    id: "gita-6-26",
    title: { en: "Begin again, gently", hi: "ध्यान भटके, तो फिर लौटें" },
    subtitle: {
      en: "Practise returning your attention, one small moment at a time.",
      hi: "हर छोटे पल में अपना ध्यान वापस लाने का अभ्यास करें।",
    },
    reference: "Bhagavad Gita 6.26",
    theme: { en: "Attention", hi: "एकाग्रता" },
    themeKey: "attention",
    sourceUrl:
      "https://www.gitasupersite.iitk.ac.in/srimad?language=dv&field_chapter_value=6&field_nsutra_value=26",
    sourceNote: sourceNote("6.26"),
    steps: [
      {
        id: "arrive",
        kind: "arrive",
        title: {
          en: "Give this moment a place",
          hi: "इस पल के लिए थोड़ी जगह बनाएँ",
        },
        body: {
          en: "Choose a comfortable place to read. You may keep your eyes open and change position whenever you like. For this moment, let the next few lines be the one thing you are doing.",
          hi: "पढ़ने के लिए आरामदायक जगह चुनें। आँखें खुली रख सकते हैं और जब चाहें बैठने की स्थिति बदल सकते हैं। अभी के लिए अगले कुछ वाक्यों को पढ़ना ही आपका एक काम है।",
        },
      },
      {
        id: "verse",
        kind: "verse",
        title: { en: "Read the verse", hi: "श्लोक पढ़ें" },
        body: {
          en: "This verse belongs to the Gita’s teaching on meditation. Read one line at a time. You can return to it as often as you wish.",
          hi: "यह श्लोक गीता के ध्यान-संबंधी उपदेश का हिस्सा है। एक बार में एक पंक्ति पढ़ें। चाहें तो उसे फिर पढ़ सकते हैं।",
        },
        script:
          "यतो यतो निश्चरति मनश्चञ्चलमस्थिरम्।\nततस्ततो नियम्यैतदात्मन्येव वशं नयेत्॥६.२६॥",
        transliteration:
          "yato yato niścarati manaś cañcalam asthiram |\ntatas tato niyamyaitad ātmany eva vaśaṃ nayet || 6.26 ||",
      },
      {
        id: "understand",
        kind: "understand",
        title: {
          en: "Returning is part of practice",
          hi: "वापस आना भी अभ्यास है",
        },
        body: {
          en: "Demo interpretation: the verse describes repeatedly bringing the wandering mind back to the Self. Its spiritual meaning is deeper than a productivity tip. As a small everyday exercise inspired by it, we can notice distraction and return to the task we chose, without turning that moment into a judgment about ourselves.",
          hi: "डेमो व्याख्या: इस श्लोक में चंचल मन को बार-बार आत्मा में स्थिर करने की बात है। इसका आध्यात्मिक अर्थ केवल काम में ध्यान लगाने से अधिक गहरा है। इससे प्रेरित एक छोटे अभ्यास में हम ध्यान भटकने को पहचानकर अपने चुने हुए काम पर लौट सकते हैं, बिना खुद को दोष दिए।",
        },
      },
      {
        id: "apply",
        kind: "apply",
        title: { en: "Try one quiet return", hi: "एक बार ध्यान वापस लाएँ" },
        body: {
          en: "Read this sentence once more, giving each word your attention. If another thought arrives, notice it and come back to the next word. Later, try the same simple return while reading a page or listening to someone.",
          hi: "इस वाक्य को एक बार फिर पढ़ें और हर शब्द पर ध्यान दें। कोई दूसरा विचार आए, तो उसे पहचानें और अगले शब्द पर लौट आएँ। बाद में यही छोटा अभ्यास कोई पन्ना पढ़ते या किसी की बात सुनते समय आज़माएँ।",
        },
      },
    ],
    action: {
      en: "Give one conversation your full attention; if it wanders, return to listening.",
      hi: "एक बातचीत में पूरा ध्यान दें; ध्यान भटके तो फिर सुनने पर लौट आएँ।",
    },
    reflection: {
      en: "Where could I practise one gentle return today?",
      hi: "आज मैं कहाँ अपना ध्यान फिर से लाने का अभ्यास कर सकता या सकती हूँ?",
    },
  },
];

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((lesson) => lesson.id === id);
}
