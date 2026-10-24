// Original everyday invitations, separate from scripture and editorial retellings.
export const PRACTICE_REVISION = 'sankalpa-2026-10-14.1';
const pair = (en, hi) => ({en, hi});
export const sankalpas = [
  {id:'what-makes-a-person-admirable', title:pair('One quality, one act','एक गुण, एक काम'), action:pair('Choose one quality you admire. Spend two minutes putting it into a small act of care for someone today.','एक ऐसा गुण चुनें जिसे आप सराहते हैं। आज किसी की देखभाल के एक छोटे काम में उसे दो मिनट के लिए अपनाएँ।')},
  {id:'knowing-how-to-stop', title:pair('The 5-Second Pause','पाँच सेकंड का ठहराव'), action:pair('Take one full breath before reacting in a tense moment today. Use two quiet minutes now to rehearse that pause.','आज किसी तनावपूर्ण क्षण में प्रतिक्रिया देने से पहले एक पूरी साँस लें। अभी दो शांत मिनट उस ठहराव का अभ्यास करें।')},
  {id:'the-bow-at-mithila', title:pair('Ask before helping','सहायता से पहले पूछें'), action:pair('Before taking over a task, ask “Would help be useful?” Spend two minutes listening to the answer before acting.','किसी का काम अपने हाथ में लेने से पहले पूछें, “क्या मेरी सहायता उपयोगी होगी?” कुछ करने से पहले दो मिनट उनका उत्तर सुनें।')},
  {id:'a-friend-beside-the-ganga', title:pair('A small welcome','एक छोटा स्वागत'), action:pair('Offer someone a glass of water or a comfortable place to sit. Give them two minutes of your unhurried attention.','किसी को एक गिलास पानी या बैठने की सहज जगह दें। दो मिनट बिना जल्दबाज़ी के उन पर ध्यान दें।')},
  {id:'bharata-and-the-sandals', title:pair('Care for what is entrusted','सौंपे गए का ध्यान'), action:pair('Choose one thing entrusted to you—a shared space or a borrowed object. Spend two minutes leaving it ready for the next person.','आपको सौंपी गई एक चीज़ चुनें—साझी जगह या उधार की वस्तु। दो मिनट लगाकर उसे अगले व्यक्ति के लिए तैयार करें।')},
  {id:'shabaris-welcome', title:pair('Make room for someone','किसी के लिए जगह बनाएँ'), action:pair('Spend two minutes preparing a small welcome: clear a seat, set out a cup, or make space to listen.','दो मिनट एक छोटे स्वागत की तैयारी करें: बैठने की जगह साफ़ करें, एक प्याला रखें या सुनने के लिए समय निकालें।')},
  {id:'hanumans-first-conversation', title:pair('Listen before replying','उत्तर से पहले सुनें'), action:pair('In one conversation today, let the other person finish. Spend two minutes listening, then say what you understood before giving advice.','आज एक बातचीत में दूसरे व्यक्ति को अपनी बात पूरी करने दें। दो मिनट सुनें, फिर सलाह देने से पहले बताएँ कि आपने क्या समझा।')},
  {id:'across-the-ocean', title:pair('One small beginning','एक छोटी शुरुआत'), action:pair('Choose something you have been putting off. Give its smallest useful first step two minutes; you can stop there.','ऐसा काम चुनें जिसे आप टाल रहे हैं। उसके सबसे छोटे उपयोगी पहले कदम को दो मिनट दें; उसके बाद रुक सकते हैं।')},
  {id:'a-ring-brings-hope', title:pair('A truthful word of care','सच्चे शब्दों में देखभाल'), action:pair('Take two minutes to offer someone a specific, truthful word of support. Promise only what you can follow through on.','दो मिनट निकालकर किसी को स्पष्ट और सच्चे शब्दों में सहारा दें। केवल वही वादा करें जिसे निभा सकें।')},
  {id:'returning-responsibility', title:pair('A grateful handover','कृतज्ञता के साथ सौंपना'), action:pair('Spend two minutes thanking someone who carried a responsibility. Share one useful detail that makes their next step easier.','किसी उत्तरदायित्व को सँभालने वाले व्यक्ति को धन्यवाद देने में दो मिनट लगाएँ। ऐसी एक उपयोगी बात बताएँ जिससे उनका अगला कदम आसान हो।')},
];
export const ANCHOR_IDS = sankalpas.map(item => item.id);
export const practiceById = Object.fromEntries(sankalpas.map(item => [item.id, item]));
// Connecting chapters reuse the next anchor's invitation, but own their explicit
// practice choices. Existing anchor records and the ten navbar petals stay intact.
export const bridgePractice = {
  'princes-and-teacher':'knowing-how-to-stop', 'road-to-mithila':'the-bow-at-mithila',
  'promise-of-exile':'a-friend-beside-the-ganga', 'forest-torn-apart':'shabaris-welcome',
  'alliance-and-vali':'across-the-ocean', 'search-to-southern-sea':'across-the-ocean',
  'through-lanka-at-night':'a-ring-brings-hope', 'witness-returns':'returning-responsibility',
  'refuge-and-crossing':'returning-responsibility', 'war-and-its-cost':'returning-responsibility',
  'sita-speaks-after-victory':'returning-responsibility', 'northward-home':'returning-responsibility',
};
export const practiceForStory = id => practiceById[id] || (bridgePractice[id] ? {...practiceById[bridgePractice[id]],id,sharedAnchor:bridgePractice[id]} : null);
