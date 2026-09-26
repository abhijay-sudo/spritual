import type { WisdomAnswer, WisdomHit, WisdomLanguage } from "./types.ts";

const COPY = {
  en: {
    unverified: "I couldn't verify a relevant passage in the current library. Try a shorter question or a Gita verse reference, such as 2.47.",
    matched: "These passages may be relevant. Open each source to read the original in context.",
    matchedDisclosure: "Sources are shown separately from unreviewed demo interpretation. This is a local match, not an AI-generated answer or personal advice.",
    noMatchDisclosure: "No verified passage was found. This local response did not use AI or send your question to a provider.",
    safetyDisclosure: "This local safety response did not use AI or send your message to a provider.",
    safety: "If you may be in immediate danger, contact local emergency services or someone you trust now. If you are in India, Tele-MANAS offers mental-health support at 14416. This app cannot provide crisis care.",
  },
  hi: {
    unverified: "वर्तमान संग्रह में इससे जुड़ा प्रमाणित संदर्भ नहीं मिला। छोटा सवाल या गीता का श्लोक क्रमांक, जैसे २.४७, आज़माएँ।",
    matched: "ये श्लोक आपके सवाल से जुड़े हो सकते हैं। मूल पाठ को संदर्भ सहित पढ़ने के लिए स्रोत खोलें।",
    matchedDisclosure: "मूल पाठ और बिना समीक्षा वाली डेमो व्याख्या अलग दिखाई जाती हैं। यह स्थानीय मिलान है, AI द्वारा बनाया गया उत्तर या निजी सलाह नहीं।",
    noMatchDisclosure: "संबंधित प्रमाणित श्लोक नहीं मिला। इस स्थानीय जवाब के लिए AI नहीं चला और आपका सवाल किसी प्रदाता को नहीं भेजा गया।",
    safetyDisclosure: "इस स्थानीय सुरक्षा जवाब के लिए AI नहीं चला और आपका संदेश किसी प्रदाता को नहीं भेजा गया।",
    safety: "यदि आप तत्काल खतरे में हैं, तो स्थानीय आपातकालीन सेवा या भरोसेमंद व्यक्ति से अभी संपर्क करें। भारत में मानसिक स्वास्थ्य सहायता के लिए टेली मानस 14416 पर कॉल कर सकते हैं। यह ऐप संकट संबंधी सहायता नहीं दे सकता।",
  },
} as const;

/** A deliberately small pre-check; it cannot replace a clinical safety system. */
export function isImmediateSafetyQuery(query: string): boolean {
  return /\b(?:suicid(?:e|al)|kill myself|end my life|take my own life|hurt myself|harm myself|self harm|self-harm|i want to die|i don.t want to live|no reason to live)\b|आत्महत्या|खुदकुशी|अपनी जान लेना|जान देना|खुद को नुकसान|मरना चाह(?:ता|ती)|जीना नहीं/u.test(query.toLowerCase());
}

export function buildGroundedFallback(query: string, hits: readonly WisdomHit[], language: WisdomLanguage = "en"): WisdomAnswer {
  const copy = COPY[language];
  if (isImmediateSafetyQuery(query)) return { kind: "safety", language, message: copy.safety, sources: [], providerUsed: false, disclosure: copy.safetyDisclosure };
  if (hits.length === 0) return { kind: "unverified", language, message: copy.unverified, sources: [], providerUsed: false, disclosure: copy.noMatchDisclosure };
  const sources = hits.map((hit) => hit.passage);
  return {
    kind: "matched", language, message: copy.matched, sources,
    // Only an existing editorial field is shown. The engine never writes scripture.
    interpretation: sources[0].interpretation,
    providerUsed: false, disclosure: copy.matchedDisclosure,
  };
}
