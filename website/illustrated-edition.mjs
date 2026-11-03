import {connectingSourceMaps,editionStoryKeys} from './illustrated-chapters.mjs';

export const ILLUSTRATED_EDITION_REVISION='illustrated-local-review-2026-10-13.1';
// Deployment permission does not grant exact-version editorial or artwork approval.
export const illustratedRelease=false;
export const illustratedPreview=process.argv.includes('--sanatan-preview');

const pair=(en,hi)=>({en,hi});

export const journeys={
 ramayana:{
  id:'ramayana',
  title:pair('An abridged Ramayana in source order','स्रोत-क्रम में संक्षिप्त रामायण'),
  shortTitle:pair('Abridged Ramayana','संक्षिप्त रामायण'),
  description:pair('Twenty-two connected chapters from the opening question to Rama’s return. This is a substantial abridgement through Yuddha Kanda—not every sarga and not Uttara Kanda.','आरंभिक प्रश्न से राम की वापसी तक बाईस जुड़े अध्याय। यह युद्धकाण्ड तक का विस्तृत संक्षेप है—हर सर्ग या उत्तरकाण्ड नहीं।'),
  storyIds:editionStoryKeys
 },
 hanuman:{
  id:'hanuman',
  title:pair('Hanuman: speech, courage, witness','हनुमान: वाणी, साहस, साक्षी'),
  shortTitle:pair('Hanuman’s path','हनुमान का पथ'),
  description:pair('Three connected encounters: trust begins in conversation, courage crosses the ocean, and a token becomes credible witness.','तीन जुड़े प्रसंग: बातचीत से विश्वास, समुद्र पार करता साहस और साक्ष्य बनती एक निशानी।'),
  storyIds:['hanumans-first-conversation','across-the-ocean','a-ring-brings-hope']
 },
 together:{
  id:'together',
  title:pair('Reading together: welcome and trust','साथ पढ़ें: स्वागत और विश्वास'),
  shortTitle:pair('Reading together','साथ पढ़ें'),
  description:pair('Three conversations for a family or group: Guha’s friendship, Bharata’s stewardship and Shabari’s prepared welcome.','परिवार या समूह के लिए तीन संवाद: गुह की मित्रता, भरत का दायित्व और शबरी का तैयार स्वागत।'),
  storyIds:['a-friend-beside-the-ganga','bharata-and-the-sandals','shabaris-welcome']
 }
};

const reviewedSourceMaps={
 'what-makes-a-person-admirable':[{label:'Bala Kanda 1.1.1–7',url:'https://www.valmikiramayan.net/utf8/baala/sarga1/balaroman1.htm',note:pair('Valmiki asks; Narada names the qualities and begins his answer.','वाल्मीकि पूछते हैं; नारद गुण बताते हुए उत्तर आरंभ करते हैं।')}],
 'knowing-how-to-stop':[{label:'Bala Kanda 1.28',url:'https://valmikiramayan.net/baala/sarga28/balasans28.htm',note:pair('Vishvamitra entrusts the astras after the forest episode.','वन-प्रसंग के बाद विश्वामित्र अस्त्र सौंपते हैं।')}],
 'the-bow-at-mithila':[{label:'Bala Kanda 1.67',url:'https://valmikiramayan.net/utf8/baala/sarga67/balaroman67.htm',note:pair('Janaka recounts the bow and Rama lifts and breaks it.','जनक धनुष का प्रसंग बताते हैं और राम उसे उठाकर तोड़ते हैं।')}],
 'a-friend-beside-the-ganga':[{label:'Ayodhya Kanda 2.50',url:'https://www.valmikiramayan.net/utf8/ayodhya/sarga50/ayodhyaroman50.htm',note:pair('Guha receives the travellers beside the Ganga.','गुह गंगा किनारे यात्रियों का स्वागत करते हैं।')}],
 'bharata-and-the-sandals':[{label:'Ayodhya Kanda 2.112.9–28',url:'https://www.valmikiramayan.net/utf8/ayodhya/sarga112/ayodhyaroman112.htm',note:pair('The brothers debate responsibility; Rama gives the wooden sandals.','भाई उत्तरदायित्व पर विचार करते हैं; राम काष्ठ-पादुकाएँ देते हैं।')}],
 'shabaris-welcome':[{label:'Aranya Kanda 3.74',url:'https://www.valmikiramayan.net/utf8/aranya/sarga74/aranyaroman74.htm',note:pair('Shabari receives Rama and Lakshmana and offers gathered forest food. The later tasted-fruit motif is not inserted into this retelling.','शबरी राम और लक्ष्मण का स्वागत कर जुटाए वन-फल अर्पित करती हैं। बाद की चखे-फल वाली कथा इस पुनर्कथन में नहीं जोड़ी गई है।')}],
 'hanumans-first-conversation':[{label:'Kishkindha Kanda 4.3',url:'https://www.valmikiramayan.net/utf8/kish/sarga3/kishkindharoman3.htm',note:pair('Hanuman approaches in disguise; Rama notices the care of his speech.','हनुमान वेश बदलकर आते हैं; राम उनकी सावधान वाणी पर ध्यान देते हैं।')}],
 'across-the-ocean':[
  {label:'Sundara Kanda 5.1.1–122',url:'https://www.valmikiramayan.net/utf8/sundara/sarga1/sundararoman1.htm',note:pair('Resolve, departure and Mainaka’s offered rest.','संकल्प, प्रस्थान और मैनाक का विश्राम-प्रस्ताव।')},
  {label:'Sundara Kanda 5.1.123–212',url:'https://www.valmikiramayan.net/utf8/sundara/sarga1/sundararoman1.htm',note:pair('Surasa’s challenge, Simhika’s shadow and arrival near Lanka.','सुरसा की परीक्षा, सिंहिका की छाया और लंका के निकट आगमन।')}
 ],
 'a-ring-brings-hope':[
  {label:'Sundara Kanda 5.36',url:'https://www.valmikiramayan.net/utf8/sundara/sarga36/sundararoman36.htm',note:pair('Hanuman presents Rama’s ring and earns Sita’s confidence.','हनुमान राम की मुद्रिका देकर सीता का विश्वास प्राप्त करते हैं।')},
  {label:'Sundara Kanda 5.37',url:'https://www.valmikiramayan.net/utf8/sundara/sarga37/sundararoman37.htm',note:pair('Hanuman offers to carry Sita; she explains why she will wait for Rama.','हनुमान सीता को ले चलने का प्रस्ताव रखते हैं; वे राम की प्रतीक्षा का कारण बताती हैं।')},
  {label:'Sundara Kanda 5.38',url:'https://www.valmikiramayan.net/utf8/sundara/sarga38/sundararoman38.htm',note:pair('Sita gives the crest jewel and a remembered incident as her return token.','सीता चूड़ामणि और स्मरण-प्रसंग लौटने की निशानी के रूप में देती हैं।')}
 ],
 'returning-responsibility':[{label:'Yuddha Kanda 6.128',url:'https://www.valmikiramayan.net/utf8/yuddha/sarga128/yuddharoman128.htm',note:pair('Rama returns to Ayodhya; Bharata restores the entrusted rule.','राम अयोध्या लौटते हैं; भरत सौंपा शासन लौटाते हैं।')}]
};
export const sourceMaps={...reviewedSourceMaps,...connectingSourceMaps};

const art=(file,altEn,altHi,scenes=[])=>({
 file,
 alt:pair(altEn,altHi),
 reviewState:'local-review-only',
 provenance:'OpenAI image generation, directed and visually inspected 11–13 October 2026; no publication or rights approval claimed.',
 scenes
});

export const storyArt={
 'what-makes-a-person-admirable':art('01-valmiki-question','Valmiki and Narada speak beneath a banyan beside a river at dawn.','भोर में नदी किनारे बरगद के नीचे वाल्मीकि और नारद संवाद करते हैं।',[
  {after:0,file:'01-scene-narada-answer',alt:pair('Narada answers while Valmiki records the beginning of a long story.','नारद उत्तर देते हैं और वाल्मीकि दीर्घ कथा का आरंभ लिखते हैं।')},
  {after:1,file:'01-scene-story-begins',alt:pair('Valmiki looks from his manuscript toward the human world the story will enter.','वाल्मीकि पाण्डुलिपि से उस मानव-जगत की ओर देखते हैं जिसमें कथा प्रवेश करेगी।')}
 ]),
 'knowing-how-to-stop':art('02-knowing-when-to-stop','Vishvamitra entrusts sacred weapons to Rama as Lakshmana watches.','लक्ष्मण की उपस्थिति में विश्वामित्र राम को दिव्य अस्त्र सौंपते हैं।',[
  {after:1,file:'02-scene-withdrawal',alt:pair('Rama learns to withdraw power while Vishvamitra and Lakshmana observe.','विश्वामित्र और लक्ष्मण की उपस्थिति में राम शक्ति वापस लेना सीखते हैं।')}
 ]),
 'the-bow-at-mithila':art('03-bow-at-mithila','The ancient bow breaks in Mithila as Rama, Sita and Janaka witness the consequence.','मिथिला में प्राचीन धनुष टूटता है; राम, सीता और जनक उस क्षण के साक्षी हैं।',[
  {after:2,file:'03-scene-after-bow',alt:pair('Rama, Sita and Janaka absorb the consequence after the bow breaks.','धनुष टूटने के बाद राम, सीता और जनक उस परिणाम को समझते हैं।')}
 ]),
 'a-friend-beside-the-ganga':art('04-friend-beside-ganga','Guha welcomes Rama, Sita and Lakshmana beside the Ganga at sunset.','सूर्यास्त में गंगा किनारे गुह राम, सीता और लक्ष्मण का स्वागत करते हैं।',[
  {after:2,file:'04-scene-river-crossing',alt:pair('Guha steadies the boat as the three travellers begin their Ganga crossing.','गंगा पार करने की शुरुआत में गुह नाव सँभालते हैं और तीनों यात्री चढ़ते हैं।')}
 ]),
 'bharata-and-the-sandals':art('05-bharata-and-sandals','Rama entrusts a pair of wooden sandals to Bharata at the forest hermitage.','वन-आश्रम में राम भरत को काष्ठ-पादुकाओं की जोड़ी सौंपते हैं।',[
  {after:2,file:'05-scene-nandigrama-trust',alt:pair('Bharata places the foot-shaped wooden padukas before the work of stewardship at Nandigrama.','भरत नंदिग्राम में शासन-सेवा आरंभ करने से पहले काष्ठ-पादुकाएँ रखते हैं।')}
 ]),
 'shabaris-welcome':art('06-shabari-welcome','Shabari offers gathered fruit and water to Rama and Lakshmana.','शबरी राम और लक्ष्मण को जुटाए फल और जल अर्पित करती हैं।',[
  {after:2,file:'06-scene-direction-ahead',alt:pair('Shabari uses her knowledge of place to point Rama and Lakshmana toward the way ahead.','शबरी स्थान के अपने ज्ञान से राम और लक्ष्मण को आगे का मार्ग बताती हैं।')}
 ]),
 'hanumans-first-conversation':art('07-hanuman-first-conversation','Hanuman begins a careful conversation with Rama and Lakshmana near Rishyamuka.','ऋष्यमूक के निकट हनुमान राम और लक्ष्मण से सावधान संवाद आरंभ करते हैं।',[
  {after:2,file:'07-scene-toward-alliance',alt:pair('Hanuman guides Rama and Lakshmana toward the alliance his careful speech opened.','हनुमान राम और लक्ष्मण को उस मित्रता की ओर ले जाते हैं जिसका मार्ग उनकी सावधान वाणी ने खोला।')}
 ]),
 'across-the-ocean':art('08-across-ocean','Hanuman crosses the indigo ocean as Mainaka rises ahead.','मैनाक के आगे उठते हुए हनुमान नील समुद्र पार करते हैं।',[
  {after:0,file:'08-scene-mainaka-offer',alt:pair('Hanuman touches Mainaka in gratitude and continues toward Lanka.','हनुमान कृतज्ञता से मैनाक को स्पर्श कर लंका की ओर बढ़ते हैं।')},
  {after:1,file:'08-scene-surasa-shadow',alt:pair('Hanuman answers Surasa’s challenge with intelligence while a distant shadow waits.','हनुमान बुद्धि से सुरसा की परीक्षा पार करते हैं; दूर एक छाया प्रतीक्षा करती है।')}
 ]),
 'a-ring-brings-hope':art('09-ring-brings-hope','Hanuman presents Rama’s ring to Sita beneath an ashoka tree.','अशोक-वृक्ष के नीचे हनुमान सीता को राम की मुद्रिका देते हैं।',[
  {after:1,file:'09-scene-offer-and-answer',alt:pair('Sita answers Hanuman’s offer to carry her away with calm resolve.','सीता हनुमान के साथ चलने के प्रस्ताव का शांत दृढ़ता से उत्तर देती हैं।')},
  {after:2,file:'09-scene-token-message',alt:pair('Sita gives Hanuman a crest jewel and message for Rama.','सीता हनुमान को राम के लिए चूड़ामणि और संदेश देती हैं।')}
 ]),
 'returning-responsibility':art('10-returning-responsibility-v3','Bharata returns the entrusted foot-shaped wooden padukas and stewardship to Rama near Ayodhya.','अयोध्या के निकट भरत राम को सौंपी काष्ठ-पादुकाएँ और दायित्व लौटाते हैं।',[
  {after:2,file:'10-scene-work-begins',alt:pair('Rama and Bharata listen together as the practical work of renewed rule begins.','नए शासन का व्यावहारिक कार्य आरंभ होते समय राम और भरत साथ सुनते हैं।')}
 ]),
 'princes-and-teacher':art('11-princes-and-teacher','Rama and Lakshmana leave Ayodhya with Vishvamitra while Dasharatha watches from the gate.','दशरथ के देखते हुए राम और लक्ष्मण विश्वामित्र के साथ अयोध्या से निकलते हैं।'),
 'road-to-mithila':art('12-road-to-mithila','Vishvamitra guides Rama and Lakshmana along a river road toward Mithila at dawn.','भोर में विश्वामित्र राम और लक्ष्मण को नदी-मार्ग से मिथिला की ओर ले जाते हैं।'),
 'promise-of-exile':art('13-promise-of-exile','Rama, Sita and Lakshmana leave Ayodhya in forest dress as the city recedes behind them.','राम, सीता और लक्ष्मण वन-वस्त्रों में निकलते हैं और अयोध्या पीछे छूटती है।'),
 'forest-torn-apart':art('14-forest-torn-apart','Jatayu resists Ravana’s chariot while Sita drops a bright token toward the forest below.','जटायु रावण के रथ का प्रतिरोध करते हैं और सीता वन की ओर उजली निशानी गिराती हैं।'),
 'alliance-and-vali':art('15-alliance-and-vali','Rama listens as the wounded Vali questions him, with Sugriva waiting at a distance.','घायल वालि राम से प्रश्न करते हैं और सुग्रीव दूर प्रतीक्षा करते हैं।'),
 'search-to-southern-sea':art('16-search-southern-sea','Hanuman and the southern search party stand before the ocean as Sampati points toward distant Lanka.','हनुमान और दक्षिणी खोज-दल समुद्र के सामने खड़े हैं और सम्पाति दूर लंका की दिशा बताते हैं।'),
 'through-lanka-at-night':art('17-lanka-at-night','Hanuman, small and concealed among leaves, first sees Sita in the moonlit ashoka grove.','पत्तों में छोटे और छिपे हनुमान चाँदनी अशोक-वाटिका में पहली बार सीता को देखते हैं।'),
 'witness-returns':art('18-witness-returns','Hanuman places Sita’s crest jewel before Rama as the search party gathers around.','खोज-दल के बीच हनुमान राम के सामने सीता की चूड़ामणि रखते हैं।'),
 'refuge-and-crossing':art('19-refuge-and-crossing','Vibhishana waits above the seashore camp while Rama, Hanuman and Sugriva debate refuge.','विभीषण समुद्र-तट शिविर के ऊपर प्रतीक्षा करते हैं और राम, हनुमान तथा सुग्रीव शरण पर विचार करते हैं।'),
 'war-and-its-cost':art('20-war-and-its-cost','After battle, Vibhishana and Mandodari stand in a smoke-softened Lanka as weapons are lowered.','युद्ध के बाद धुएँ से धुँधली लंका में विभीषण और मंदोदरी खड़े हैं, शस्त्र नीचे किए जा रहे हैं।'),
 'sita-speaks-after-victory':art('21-sita-speaks','Sita stands speaking before the gathered assembly while Rama listens at a distance.','सभा के सामने सीता बोलती हैं और राम कुछ दूरी पर सुनते हैं।'),
 'northward-home':art('22-northward-home','Rama, Sita, Lakshmana and Hanuman look down from the homeward journey as remembered rivers pass below.','घर लौटते हुए राम, सीता, लक्ष्मण और हनुमान नीचे गुजरती परिचित नदियों को देखते हैं।')
};

export function imageSources(file){
 return {src:`/assets/illustrated/${file}-960.jpg`,srcset:`/assets/illustrated/${file}-640.jpg 640w, /assets/illustrated/${file}-960.jpg 960w, /assets/illustrated/${file}-1280.jpg 1280w`};
}

export function journeyForStory(storyId,journeyId='ramayana'){
 const journey=journeys[journeyId]||journeys.ramayana;
 const index=journey.storyIds.indexOf(storyId);
 return {journey,index,previous:index>0?journey.storyIds[index-1]:null,next:index>=0&&index<journey.storyIds.length-1?journey.storyIds[index+1]:null,isEnd:index===journey.storyIds.length-1};
}

export function searchText(story,characters,valueLabels){
 const characterText=story.characters.flatMap(id=>{
  const character=characters[id];
  return character?[character.name.en,character.name.hi,...character.aliases.en,...character.aliases.hi]:[];
 });
 return [story.title.en,story.title.hi,story.dek.en,story.dek.hi,story.book.en,story.book.hi,...story.values.flatMap(id=>[valueLabels[id].en,valueLabels[id].hi]),...characterText].join(' ');
}
