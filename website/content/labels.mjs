// Display names are separate from stable content identifiers and canonical URLs.
const hi={
'ramayana':'रामायण','krishna':'कृष्ण','shiva':'शिव','devi':'देवी','ganesha':'गणेश','mahabharata':'महाभारत',
'Valmiki Ramayana':'वाल्मीकि रामायण','Bhagavata Purana':'भागवत पुराण','Shiva Purana':'शिव पुराण','Devi Mahatmya':'देवी माहात्म्य','Devi Bhagavata Purana':'देवी भागवत पुराण','Ganesha Purana':'गणेश पुराण','Vyasa Mahabharata':'व्यास महाभारत',
'Bala Kanda':'बाल काण्ड','Ayodhya Kanda':'अयोध्या काण्ड','Aranya Kanda':'अरण्य काण्ड','Kishkindha Kanda':'किष्किन्धा काण्ड','Sundara Kanda':'सुन्दर काण्ड','Yuddha Kanda':'युद्ध काण्ड','Uttara Kanda':'उत्तर काण्ड',
'Prathama Charita':'प्रथम चरित्र','Madhyama Charita':'मध्यम चरित्र','Uttama Charita':'उत्तम चरित्र','Rudra Samhita':'रुद्र संहिता',
'valmiki':'वाल्मीकि','narada':'नारद','rama':'राम','vishvamitra':'विश्वामित्र','lakshmana':'लक्ष्मण','sita':'सीता','janaka':'जनक','guha':'गुह','bharata':'भरत','shabari':'शबरी','hanuman':'हनुमान','mainaka':'मैनाक','indra':'इन्द्र','nanda':'नन्द','ganga':'गंगा','bhagiratha':'भगीरथ','dhruva':'ध्रुव','vishnu':'विष्णु','suniti':'सुनीति','suratha':'सुरथ','samadhi':'समाधि','medhas':'मेधा','kartikeya':'कार्तिकेय','parvati':'पार्वती','yudhishthira':'युधिष्ठिर','dharma':'धर्म',
'curiosity':'जिज्ञासा','responsibility':'उत्तरदायित्व','selfControl':'आत्मसंयम','courage':'साहस','friendship':'मित्रता','hospitality':'आतिथ्य','service':'सेवा','devotion':'भक्ति','persistence':'दृढ़ता','communication':'संवाद','trust':'विश्वास','hope':'आशा','Devotion':'भक्ति','Resolve':'संकल्प','Care':'देखभाल','Discernment':'विवेक','Self-knowledge':'आत्मज्ञान','Respect':'आदर','Thoughtfulness':'विचारशीलता','Compassion':'करुणा','Loyalty':'निष्ठा','Responsibility':'उत्तरदायित्व',
'Contemplative':'मनन','Wonder':'विस्मय','older-12+':'12 वर्ष और अधिक','independent-8+':'8 वर्ष और अधिक','family-6+':'परिवार के साथ · 6 वर्ष और अधिक','all-ages':'सभी आयु',
'Diwali':'दीपावली','Janmashtami':'जन्माष्टमी','Maha Shivaratri':'महाशिवरात्रि','Navratri':'नवरात्रि','Ganesh Chaturthi':'गणेश चतुर्थी'
};
const arcNames={'Adi':'आदि','Sabha':'सभा','Vana':'वन','Virata':'विराट','Udyoga':'उद्योग','Bhishma':'भीष्म','Drona':'द्रोण','Karna':'कर्ण','Shalya':'शल्य','Sauptika':'सौप्तिक','Stri':'स्त्री','Shanti':'शान्ति','Anushasana':'अनुशासन','Ashvamedhika':'अश्वमेधिक','Ashramavasika':'आश्रमवासिक','Mausala':'मौसल','Mahaprasthanika':'महाप्रस्थानिक','Svargarohana':'स्वर्गारोहण','Vidyeshvara':'विद्येश्वर','Shatarudra':'शतरुद्र','Kotirudra':'कोटिरुद्र','Uma':'उमा','Kailasa':'कैलास','Vayaviya':'वायवीय','Upasana':'उपासना','Krida':'क्रीड़ा'};
const en={'selfControl':'Self-control','older-12+':'Ages 12+','independent-8+':'Ages 8+','family-6+':'Family · ages 6+','all-ages':'All ages'};
export function label(value,lang='en'){
 if(lang==='hi'){
  if(hi[value])return hi[value];
  if(/^Skandha \d+$/.test(value))return 'स्कन्ध '+value.split(' ')[1];
  const match=value.match(/^(.+) (Parva|Samhita|Khanda)$/);
  if(match&&arcNames[match[1]])return arcNames[match[1]]+' '+({Parva:'पर्व',Samhita:'संहिता',Khanda:'खण्ड'}[match[2]]);
 }
 return en[value]||value.split('-').map(x=>x[0]?.toUpperCase()+x.slice(1)).join(' ');
}
export function searchTerms(story){return [story.title.en,story.title.hi,story.collection,...story.characters,...story.values,...story.moods,...story.festival_tags].flatMap(v=>[v,label(v,'en'),label(v,'hi')]).join(' ').toLocaleLowerCase();}
