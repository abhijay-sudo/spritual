type CopyPair = readonly [english: string, hindi: string];

// Match authored copy explicitly: references to an external browser must not be
// silently rewritten, and web strings remain exactly as supplied by the caller.
const nativeCopies: Record<string, CopyPair> = {
  "Your practice stays in this browser. No account, tracking or automatic sharing.": [
    "Your practice stays in this app on this device. No account, tracking or automatic sharing.",
    "आपका अभ्यास इस उपकरण पर इसी ऐप में रहता है। कोई खाता, ट्रैकिंग या अपने-आप साझा करना नहीं।",
  ],
  "Could not remove saved data. Clear site data in browser settings.": [
    "Could not remove saved data. Try again, or check this app’s settings on your device.",
    "सहेजी जानकारी नहीं हटा सके। फिर कोशिश करें या उपकरण की सेटिंग में इस ऐप की सेटिंग देखें।",
  ],
  "Unable to clear browser storage. Please clear site data in browser settings.": [
    "Unable to clear app storage. Try again, or check this app’s settings on your device.",
    "ऐप का संग्रह नहीं मिटा सके। फिर कोशिश करें या उपकरण की सेटिंग में इस ऐप की सेटिंग देखें।",
  ],
  "After a lesson, you can choose to save a reflection in this browser. It is always optional.": [
    "After a lesson, you can choose to save a reflection in this app. It is always optional.",
    "पाठ के बाद चाहें तो विचार इसी ऐप में सहेजें। यह ज़रूरी नहीं है।",
  ],
  "Offline reading is ready in this browser": [
    "The demo lessons are included in this app for offline reading.",
    "ऑफ़लाइन पढ़ने के लिए नमूना पाठ इसी ऐप में मौजूद हैं।",
  ],
  "Offline storage is unavailable in this browser.": [
    "Offline storage is unavailable in this app.",
    "इस ऐप में ऑफ़लाइन संग्रह उपलब्ध नहीं है।",
  ],
  "Progress and preferences are saved in this browser. Reflections are saved only when you choose. Nothing is uploaded. Other people using this browser may see saved entries; they are not encrypted.": [
    "Progress and preferences are stored locally in this app. Reflections are saved only when you choose. Spritual does not upload your saved entries; device backups may include them. Other people using this app on your device may see saved entries; the app does not encrypt them. Browser data does not transfer into this app automatically.",
    "प्रगति और पसंद इसी ऐप में स्थानीय रूप से रखी जाती हैं। विचार आपकी अनुमति पर ही सहेजे जाते हैं। Spritual सहेजी जानकारी अपलोड नहीं करता; उपकरण के बैकअप में यह शामिल हो सकती है। आपके उपकरण पर इस ऐप का इस्तेमाल करने वाले लोग इसे देख सकते हैं; ऐप इसे एन्क्रिप्ट नहीं करता। वेब ब्राउज़र की जानकारी अपने-आप इस ऐप में नहीं आती।",
  ],
  "Clear my data from this browser": [
    "Clear my data from this app",
    "इस ऐप से मेरी जानकारी मिटाएँ",
  ],
  "Clear this browser’s data?": [
    "Clear this app’s data?",
    "इस ऐप की जानकारी मिटाएँ?",
  ],
  "Your place is remembered in this browser.": [
    "Your place is remembered in this app.",
    "आपकी जगह इस ऐप में याद रहती है।",
  ],
  "Save this reflection in this browser. Anyone using this browser may see it.": [
    "Save this reflection in this app. Anyone using this app on your device may see it.",
    "यह विचार इसी ऐप में सहेजें। आपके उपकरण पर इस ऐप का उपयोग करने वाले इसे देख सकते हैं।",
  ],
  "Demo explanations await human review. No recordings yet. Progress stays in this browser.": [
    "Demo explanations await human review. No recordings yet. Progress stays in this app.",
    "डेमो व्याख्याओं की मानवीय समीक्षा बाकी है। रिकॉर्डिंग अभी उपलब्ध नहीं है। प्रगति इसी ऐप में रहती है।",
  ],
  "This browser cannot save changes. You can keep reading; progress will last only for this visit.": [
    "This app cannot save changes. You can keep reading; progress will last only for this visit.",
    "यह ऐप बदलाव सहेज नहीं पा रहा। पढ़ सकते हैं, लेकिन प्रगति इस बार तक ही रहेगी।",
  ],
  "Your small practice is kept in this browser.": [
    "Your small practice is kept in this app.",
    "आपका छोटा अभ्यास इस ऐप में सहेजा गया है।",
  ],
  "Saving keeps this one practice only in this browser. Anyone using this browser may see it. Nothing is shared automatically.": [
    "Saving keeps this one practice only in this app. Anyone using this app on your device may see it. Nothing is shared automatically.",
    "सहेजने पर केवल यह एक अभ्यास इसी ऐप में रहेगा। आपके उपकरण पर इस ऐप का उपयोग करने वाले इसे देख सकते हैं। अपने-आप कुछ साझा नहीं होता।",
  ],
  "Could not save in this browser. Your choice is kept only for this visit. Try saving again.": [
    "Could not save in this app. Your choice is kept only for this visit. Try saving again.",
    "इस ऐप में सहेज नहीं सके। आपका विकल्प केवल इस बार तक रहेगा। फिर सहेजने की कोशिश करें।",
  ],
  "Browser saving is unavailable. You can still try the practice without saving.": [
    "Saving in this app is unavailable. You can still try the practice without saving.",
    "इस ऐप में सहेजना उपलब्ध नहीं है। बिना सहेजे भी अभ्यास आज़मा सकते हैं।",
  ],
  "Kept in this browser": ["Kept in this app", "इस ऐप में सहेजा"],
  "Your choice and any response stay in this browser. Anyone using it may see them.": [
    "Your choice and any response stay in this app. Anyone using this app on your device may see them.",
    "आपका विकल्प और दिया गया जवाब इसी ऐप में रहते हैं। आपके उपकरण पर इस ऐप का उपयोग करने वाले इन्हें देख सकते हैं।",
  ],
  "Change saved in this browser.": ["Change saved in this app.", "बदलाव इस ऐप में सहेजा गया।"],
  "Practice cleared from this browser.": ["Practice cleared from this app.", "अभ्यास इस ऐप से हटा दिया गया।"],
  "Your draft stays while you browse. Save it before closing or refreshing.": [
    "Your draft stays while you move through this app. Save it before closing; the system may close the app without warning.",
    "ऐप में घूमते समय मसौदा रहता है। बंद करने से पहले सहेजें; सिस्टम बिना चेतावनी के ऐप बंद कर सकता है।",
  ],
  "You have an unsaved reflection. Keep it before closing this page.": [
    "You have an unsaved reflection. Save it before closing this app.",
    "एक विचार अभी सहेजा नहीं है। ऐप बंद करने से पहले सहेजें।",
  ],
};

export function platformCopy(english: string, hindi: string, nativeApp: boolean): CopyPair {
  return nativeApp && Object.hasOwn(nativeCopies, english)
    ? nativeCopies[english]
    : [english, hindi];
}
