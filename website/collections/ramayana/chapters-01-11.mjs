// Original bilingual editorial drafts. Publication requires exact-version human review.
// Existing approved retellings are intentionally not imported or overwritten.
const pair = (en, hi) => ({ en, hi });
const scene = (id, en, hi, paragraphs) => ({ id, title: pair(en, hi), paragraphs });
const source = (label, url) => ({ label, url });
const bala = pair('Bala Kanda', 'बालकाण्ड');
const ayodhya = pair('Ayodhya Kanda', 'अयोध्याकाण्ड');
const aranya = pair('Aranya Kanda', 'अरण्यकाण्ड');

export const chapters = [
  {
    id: 'what-makes-a-person-admirable',
    title: pair('The story begins', 'कथा का आरंभ'),
    dek: pair('A question, a wounded bird, and a story that finds its voice.', 'एक प्रश्न, एक घायल पक्षी और अपनी वाणी पाती एक कथा।'),
    part: bala,
    sources: [
      source('Valmiki Ramayana · Bala Kanda 1.1', 'https://www.valmikiramayan.net/utf8/baala/sarga1/balaroman1.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.2', 'https://www.valmikiramayan.net/utf8/baala/sarga2/balaroman2.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.4', 'https://www.valmikiramayan.net/utf8/baala/sarga4/balaroman4.htm')
    ],
    note: pair('An original abridgement of the poem’s opening frame. The questions about strength and care are an editorial invitation to read, rather than a translation of a verse.', 'काव्य की आरंभिक भूमिका का मौलिक संक्षेप। शक्ति और संवेदना पर दिए प्रश्न पढ़ने का संपादकीय आमंत्रण हैं, किसी श्लोक का अनुवाद नहीं।'),
    contentNote: pair('The death of a bird is described briefly, without graphic detail.', 'एक पक्षी की मृत्यु का संक्षिप्त, गैर-चित्रात्मक वर्णन।'),
    reflection: pair('Which quality do you notice first in a person—and which takes longer to discover?', 'किसी व्यक्ति का कौन-सा गुण पहले दिखाई देता है, और किसे समझने में समय लगता है?'),
    scenes: [
      scene('beginning-question', 'Before the journey', 'यात्रा से पहले', [
        pair('Before there is a forest road or a bridge across the sea, there is a conversation. Valmiki asks the travelling sage Narada about a person living in the world: someone courageous, truthful, grateful and attentive to the welfare of others. He does not ask about strength alone. His questions bring resolve beside self-command, learning beside the ability to act.', 'वन का रास्ता और समुद्र पर सेतु आने से पहले एक संवाद है। वाल्मीकि देवर्षि नारद से संसार में रहने वाले ऐसे मनुष्य के बारे में पूछते हैं जो साहसी, सत्यवादी, कृतज्ञ और सबके हित की चिंता करने वाला हो। प्रश्न केवल शक्ति का नहीं है। उसमें दृढ़ता के साथ आत्मसंयम और ज्ञान के साथ कर्म की क्षमता भी है।'),
        pair('Narada recognises how rare such a combination would be. He names Rama, born in the line of Ikshvaku. A name has entered the conversation, but a name cannot answer every question. Narada begins to tell what happens to this prince, and the answer opens into a life.', 'नारद जानते हैं कि इतने गुणों का एक साथ होना दुर्लभ है। वे इक्ष्वाकु वंश में जन्मे राम का नाम लेते हैं। संवाद को एक नाम मिल गया, पर केवल नाम सभी प्रश्नों का उत्तर नहीं देता। नारद उस राजकुमार के जीवन की घटनाएँ सुनाने लगते हैं और उत्तर एक जीवन-कथा में बदल जाता है।')
      ]),
      scene('beginning-outline', 'A life before a verdict', 'निर्णय से पहले एक जीवन', [
        pair('The outline travels far from Ayodhya. A promised succession becomes an exile. Rama goes to the forest with Sita and Lakshmana. Separation brings a search; the search brings allies, a sea crossing and war. Narada carries the account through suffering and return, giving Valmiki the shape of the larger story before its many encounters unfold.', 'कथा का सूत्र अयोध्या से बहुत दूर जाता है। राज्य मिलने की तैयारी वनवास में बदलती है। राम, सीता और लक्ष्मण वन जाते हैं। बिछोह से खोज शुरू होती है; खोज में साथी मिलते हैं, समुद्र पार होता है और युद्ध आता है। नारद दुख और वापसी तक का वृत्तांत सुनाते हैं। विस्तार से पहले वाल्मीकि के सामने पूरी यात्रा की रूपरेखा आती है।')
      ]),
      scene('beginning-birds', 'A break in the birdsong', 'पक्षियों के स्वर में टूटन', [
        pair('After Narada leaves, Valmiki walks towards the Tamasa with his disciple Bharadvaja. Near the water he sees a pair of krauncha birds together. A hunter’s arrow kills the male. The surviving bird cries out, and Valmiki responds to the violence with words of grief and condemnation.', 'नारद के जाने के बाद वाल्मीकि अपने शिष्य भरद्वाज के साथ तमसा की ओर जाते हैं। जल के पास उन्हें क्रौंच पक्षियों का एक जोड़ा दिखता है। शिकारी के बाण से नर पक्षी मर जाता है। बचा हुआ पक्षी विलाप करता है। उस हिंसा को देखकर वाल्मीकि के मुख से शोक और निंदा के शब्द निकलते हैं।'),
        pair('Then he notices the shape of what he has said. The words have fallen into a measured pattern. He returns to the hermitage still considering this unexpected utterance. The poem places an act of listening to another creature’s sorrow near the beginning of its own making.', 'फिर वे अपने कहे का रूप पहचानते हैं। शब्द एक नपे हुए छंद में निकले हैं। इस अनायास वाणी पर विचार करते हुए वे आश्रम लौटते हैं। काव्य अपनी रचना के आरंभ में ही दूसरे जीव के दुख को सुनने का यह क्षण रखता है।')
      ]),
      scene('beginning-voices', 'The poem travels', 'कथा आगे चलती है', [
        pair('In the epic’s account, Brahma appears and asks Valmiki to compose Rama’s story. The work takes the form of verse, and Valmiki teaches it to Kusha and Lava. They learn its words and musical movement, then carry it into gatherings where others can hear it.', 'महाकाव्य के अनुसार ब्रह्मा प्रकट होकर वाल्मीकि से राम की कथा रचने को कहते हैं। रचना पद्य का रूप लेती है और वाल्मीकि उसे कुश और लव को सिखाते हैं। दोनों शब्दों और उनके संगीत को सीखते हैं, फिर सभाओं में कथा सुनाने लगते हैं।'),
        pair('Eventually the young singers perform before Rama himself. The one whose life is being told also becomes a listener. This abridged journey now turns back to Ayodhya, to four brothers growing up and a visitor whose request will take two of them beyond the palace. Valmiki’s opening questions travel with them.', 'आगे चलकर दोनों राम के सामने भी गाते हैं। जिनका जीवन सुनाया जा रहा है, वे स्वयं श्रोता बनते हैं। हमारा संक्षिप्त यात्रा-वृत्त अब अयोध्या लौटता है—चार भाइयों के बड़े होने और उस अतिथि के आगमन तक, जिसका आग्रह दो भाइयों को महल के बाहर ले जाएगा। वाल्मीकि के आरंभिक प्रश्न उनके साथ चलते हैं।')
      ])
    ]
  },
  {
    id: 'princes-and-teacher',
    title: pair('The princes and the teacher', 'राजकुमार और गुरु'),
    dek: pair('Dasharatha offers an army. Vishvamitra asks for Rama.', 'दशरथ सेना देने को तैयार हैं। विश्वामित्र राम को माँगते हैं।'),
    part: bala,
    sources: [
      source('Valmiki Ramayana · Bala Kanda 1.18', 'https://www.valmikiramayan.net/utf8/baala/sarga18/balaroman18.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.20–22', 'https://www.valmikiramayan.net/utf8/baala/sarga22/balaroman22.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.26–27', 'https://www.valmikiramayan.net/utf8/baala/sarga26/balaroman26.htm')
    ],
    note: pair('An original abridgement of the brothers’ upbringing and first journey with Vishvamitra. Tataka’s encounter is condensed without presenting the teacher’s command as a rule for ordinary life.', 'भाइयों के आरंभिक जीवन और विश्वामित्र के साथ पहली यात्रा का मौलिक संक्षेप। ताड़का-प्रसंग संक्षिप्त है; गुरु की आज्ञा को सामान्य जीवन का सार्वभौम नियम नहीं कहा गया है।'),
    contentNote: pair('Includes an attack and a death in battle, without graphic detail.', 'आक्रमण और युद्ध में मृत्यु का गैर-चित्रात्मक वर्णन।'),
    reflection: pair('What makes someone ready to carry a responsibility they have never carried before?', 'पहले कभी न उठाया हुआ दायित्व सँभालने के लिए व्यक्ति को क्या तैयार करता है?'),
    scenes: [
      scene('princes-ayodhya', 'Four brothers', 'चार भाई', [
        pair('In Ayodhya, King Dasharatha’s long hope for children is fulfilled. Kausalya bears Rama, Kaikeyi bears Bharata, and Sumitra bears Lakshmana and Shatrughna. The brothers grow in learning, discipline and the arts expected of princes. The household is bound by affection as well as rank.', 'अयोध्या में राजा दशरथ की संतान पाने की पुरानी इच्छा पूरी होती है। कौसल्या से राम, कैकेयी से भरत और सुमित्रा से लक्ष्मण तथा शत्रुघ्न जन्म लेते हैं। भाई विद्या, अनुशासन और राजकुमारों के योग्य कलाओं में बढ़ते हैं। परिवार को पद के साथ स्नेह भी बाँधता है।'),
        pair('Lakshmana is especially devoted to Rama; Shatrughna keeps close to Bharata. Their lives are not yet shaped by exile or war. Then Vishvamitra arrives at court. Dasharatha welcomes the sage with honour and offers his help before hearing what that help will require.', 'लक्ष्मण का राम से विशेष लगाव है; शत्रुघ्न भरत के निकट रहते हैं। अभी उनके जीवन को वनवास और युद्ध ने नहीं बदला है। तभी विश्वामित्र राजसभा में आते हैं। दशरथ उनका सम्मानपूर्वक स्वागत करते हैं और आग्रह सुनने से पहले ही सहायता का वचन देते हैं।')
      ]),
      scene('princes-request', 'A difficult request', 'कठिन आग्रह', [
        pair('The sage’s sacrifice has been repeatedly attacked. He asks for Rama to guard it. Dasharatha is shaken: his son is young, while the attackers are experienced and dangerous. The king offers to come himself with his army. Vishvamitra has not asked for an army, however. He has asked that Rama come under his care.', 'ऋषि के यज्ञ पर बार-बार आक्रमण हुआ है। उसकी रक्षा के लिए वे राम को माँगते हैं। दशरथ विचलित हो जाते हैं: उनका पुत्र युवा है, जबकि आक्रमणकारी अनुभवी और खतरनाक हैं। राजा सेना लेकर स्वयं चलने का प्रस्ताव देते हैं। लेकिन विश्वामित्र ने सेना नहीं, अपने संरक्षण में राम को साथ ले जाने का आग्रह किया है।'),
        pair('Vasishtha counsels Dasharatha to keep his promise. He speaks of Vishvamitra’s knowledge and ability to protect the prince. The father who wanted to remove every danger must now entrust his son to another guide. Rama and Lakshmana receive blessings, take their bows and follow the sage out of Ayodhya.', 'वसिष्ठ दशरथ को वचन निभाने की सलाह देते हैं। वे विश्वामित्र के ज्ञान और राजकुमार की रक्षा करने की क्षमता का भरोसा दिलाते हैं। पुत्र से हर संकट दूर रखना चाहने वाले पिता को अब उसे दूसरे मार्गदर्शक के हाथ सौंपना है। राम और लक्ष्मण आशीर्वाद लेते हैं, धनुष उठाते हैं और ऋषि के पीछे अयोध्या से निकलते हैं।')
      ]),
      scene('princes-river', 'Learning on the road', 'राह में शिक्षा', [
        pair('Their classroom is now a riverbank and a forest path. Beside the Sarayu, Vishvamitra instructs Rama in Bala and Atibala, disciplines described in the epic as guarding strength and alertness. The brothers travel, rest on the ground and listen to the histories of the places they pass. Questions accompany their footsteps.', 'अब उनकी पाठशाला नदी का किनारा और वन का मार्ग है। सरयू के पास विश्वामित्र राम को बला और अतिबला की शिक्षा देते हैं, जिन्हें महाकाव्य बल और सजगता की रक्षा करने वाली विद्याएँ कहता है। भाई चलते हैं, भूमि पर विश्राम करते हैं और रास्ते के स्थानों की कथाएँ सुनते हैं। उनके कदमों के साथ प्रश्न भी चलते हैं।')
      ]),
      scene('princes-tataka', 'The first confrontation', 'पहला सामना', [
        pair('In Tataka’s forest, instruction becomes danger. The rakshasi attacks, raising dust and hurling stones. Rama initially considers stopping her without killing her. The struggle continues, and Vishvamitra urges him to end the threat before darkness strengthens her. Rama kills Tataka. The account does not describe a harmless exercise: the first journey has brought a life-and-death decision.', 'ताड़का के वन में शिक्षा संकट बनकर सामने आती है। राक्षसी धूल उठाती और पत्थर बरसाती हुई आक्रमण करती है। राम पहले उसे मारे बिना रोकने पर विचार करते हैं। संघर्ष बढ़ता है। विश्वामित्र अँधेरा होने से पहले संकट समाप्त करने को कहते हैं, क्योंकि रात में उसका बल बढ़ेगा। राम ताड़का का वध करते हैं। यह खेल या अभ्यास नहीं; पहली यात्रा जीवन-मृत्यु के निर्णय तक पहुँची है।'),
        pair('They remain there that night. In the morning Vishvamitra prepares to entrust Rama with powerful astras. The prince will learn how to call upon them. Before the teaching is complete, he will also ask how their power can be brought to an end.', 'वे वहीं रात बिताते हैं। सुबह विश्वामित्र राम को शक्तिशाली अस्त्र सौंपने की तैयारी करते हैं। राजकुमार उन्हें प्रयुक्त करना सीखेंगे। लेकिन शिक्षा पूरी होने से पहले वे यह भी पूछेंगे कि उनकी शक्ति को वापस कैसे लिया जाए।')
      ])
    ]
  },
  {
    id: 'knowing-how-to-stop',
    title: pair('Knowing how to stop', 'रोकना भी सीखना'),
    dek: pair('Rama receives powerful astras—and asks the question that follows.', 'राम शक्तिशाली अस्त्र पाते हैं—और फिर एक और प्रश्न पूछते हैं।'),
    part: bala,
    sources: [
      source('Valmiki Ramayana · Bala Kanda 1.27', 'https://www.valmikiramayan.net/utf8/baala/sarga27/balaroman27.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.28', 'https://valmikiramayan.net/baala/sarga28/balasans28.htm')
    ],
    note: pair('An original abridgement. Astra withdrawal and counteraction belong to the epic’s weapon lore; the reflection on responsibility is this edition’s interpretation, not a practical weapons lesson.', 'मौलिक संक्षेप। अस्त्रों का संहार और प्रतिकार महाकाव्य की अस्त्र-विद्या का भाग है; उत्तरदायित्व पर चिंतन इस संस्करण की व्याख्या है, व्यावहारिक शस्त्र-शिक्षा नहीं।'),
    reflection: pair('Before beginning something powerful, what would help you know when to stop?', 'किसी प्रभावशाली काम को आरंभ करने से पहले, रुकने का समय पहचानने में क्या सहायता करेगा?'),
    scenes: [
      scene('restraint-gift', 'Power entrusted', 'सौंपी गई शक्ति', [
        pair('The morning after the encounter with Tataka, Vishvamitra turns to Rama with a new gift. He teaches him the astras: extraordinary powers invoked through knowledge and discipline. Their names summon fire, wind, water and forces beyond ordinary combat. The long catalogue makes clear how much has been placed in one person’s keeping.', 'ताड़का से सामना होने के अगले दिन विश्वामित्र राम को नया उपहार देते हैं। वे अस्त्रों की शिक्षा देते हैं—ऐसी विलक्षण शक्तियाँ जिनका आह्वान ज्ञान और साधना से होता है। उनके नाम अग्नि, वायु, जल और साधारण युद्ध से परे शक्तियों से जुड़े हैं। लंबी सूची बताती है कि एक व्यक्ति को कितना दायित्व सौंपा जा रहा है।')
      ]),
      scene('restraint-presences', 'The weapons take form', 'अस्त्रों का रूप', [
        pair('In the epic’s telling, the astras appear as living presences and offer themselves to Rama’s command. He receives them and asks that they remain available when he calls. Their readiness is not yet a reason to use them. The teaching gives him possibilities; a later situation will demand a choice.', 'महाकाव्य में अस्त्र सजीव रूप धरकर राम की आज्ञा के लिए उपस्थित होते हैं। राम उन्हें स्वीकार करते हैं और स्मरण किए जाने पर आने को कहते हैं। उनका तैयार होना अपने-आप प्रयोग का कारण नहीं बनता। शिक्षा उन्हें सामर्थ्य देती है; किसी आने वाली परिस्थिति में उन्हें निर्णय लेना होगा।')
      ]),
      scene('restraint-question', 'The further question', 'अगला प्रश्न', [
        pair('As they continue their journey, Rama asks Vishvamitra for the knowledge of bringing these powers back or counteracting them. Receiving a weapon and understanding its limits are not the same lesson. The sage answers by teaching the corresponding powers of restraint and withdrawal. The exchange is brief, but it changes what it means for the gift to be complete.', 'यात्रा आगे बढ़ती है तो राम विश्वामित्र से इन शक्तियों को वापस लेने या उनका प्रतिकार करने की विद्या माँगते हैं। अस्त्र प्राप्त करना और उसकी सीमा समझना एक ही शिक्षा नहीं है। ऋषि उन्हें संहार और प्रतिकार की संबंधित शक्तियाँ सिखाते हैं। संवाद छोटा है, पर वह उपहार के पूर्ण होने का अर्थ बदल देता है।')
      ]),
      scene('restraint-forest', 'A different kind of attention', 'ध्यान का दूसरा रूप', [
        pair('The instruction ends, and Rama looks towards the forest ahead. It is rich with trees, birds and animals. He asks whose hermitage it is and what history belongs to it. The student who has just received formidable power is still curious about a place he does not know.', 'शिक्षा पूरी होती है और राम सामने के वन को देखते हैं। वहाँ वृक्ष, पक्षी और पशु हैं। वे पूछते हैं कि यह किसका आश्रम है और इस स्थान की कथा क्या है। अभी-अभी प्रबल शक्ति पाने वाला विद्यार्थी अनजाने स्थान के प्रति अब भी जिज्ञासु है।'),
        pair('The narrative moves from the names of weapons to the life of a landscape. In this edition, that movement offers a pause: capability need not take up every part of one’s attention. Rama, Lakshmana and their teacher continue towards the work for which they left Ayodhya—the protection of a sacrifice at Siddhashrama.', 'कथा अस्त्रों के नामों से एक जीवंत वन की ओर मुड़ती है। इस संस्करण में यह बदलाव ठहरने का अवसर है: सामर्थ्य ही ध्यान का एकमात्र विषय नहीं होना चाहिए। राम, लक्ष्मण और उनके गुरु सिद्धाश्रम की ओर बढ़ते हैं, उस यज्ञ की रक्षा के लिए जिसके कारण उन्होंने अयोध्या छोड़ी थी।')
      ])
    ]
  },
  {
    id: 'road-to-mithila',
    title: pair('The road to Mithila', 'मिथिला की राह'),
    dek: pair('A guarded fire gives way to river stories and a long-awaited welcome.', 'यज्ञ की रक्षा के बाद नदी-कथाओं और लंबे समय से प्रतीक्षित स्वागत की राह खुलती है।'),
    part: bala,
    sources: [
      source('Valmiki Ramayana · Bala Kanda 1.30–31', 'https://www.valmikiramayan.net/utf8/baala/sarga30/balasans30.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.43', 'https://www.valmikiramayan.net/utf8/baala/sarga43/balaroman43.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.48–49', 'https://www.valmikiramayan.net/utf8/baala/sarga49/balaroman49.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.66', 'https://www.valmikiramayan.net/utf8/baala/sarga66/balaroman66.htm')
    ],
    note: pair('An original abridgement of selected events on the journey. Ahalya is unseen in the cited Valmiki account; the stone transformation familiar from some later retellings is not used here. Her wider story has differing interpretations.', 'यात्रा की चुनी घटनाओं का मौलिक संक्षेप। उद्धृत वाल्मीकि प्रसंग में अहल्या अदृश्य रहती हैं; बाद के कुछ पुनर्कथनों में प्रचलित पत्थर बनने का प्रसंग यहाँ नहीं लिया गया है। उनकी व्यापक कथा की भिन्न व्याख्याएँ हैं।'),
    contentNote: pair('Includes brief combat and a reference to a punitive curse.', 'संक्षिप्त युद्ध और दंडस्वरूप दिए शाप का उल्लेख।'),
    reflection: pair('Which stories would change how you see a familiar place?', 'कौन-सी कथाएँ किसी परिचित स्थान को देखने का आपका ढंग बदल सकती हैं?'),
    scenes: [
      scene('mithila-vigil', 'Six days of watching', 'छह दिनों की पहरेदारी', [
        pair('At Siddhashrama, Vishvamitra begins his sacrifice. Rama and Lakshmana keep watch through six days and nights. Their task is patience before it is combat: they must be present when the threatened interruption comes. On the sixth day, Maricha and Subahu arrive with their companions to spoil the rite.', 'सिद्धाश्रम में विश्वामित्र यज्ञ आरंभ करते हैं। राम और लक्ष्मण छह दिन और रात पहरा देते हैं। युद्ध से पहले उनका काम धैर्य है: जिस बाधा की आशंका है, उसके आने पर उन्हें तैयार रहना है। छठे दिन मारीच और सुबाहु अपने साथियों के साथ यज्ञ बिगाड़ने आते हैं।'),
        pair('Rama strikes Maricha with a power that hurls him far away, leaving him alive. Subahu is killed, and the remaining attackers are driven off. The ritual reaches its conclusion. The reason for the princes’ departure from home has been fulfilled, yet Vishvamitra’s journey with them is not over.', 'राम ऐसा अस्त्र चलाते हैं जो मारीच को दूर फेंक देता है, पर उसके प्राण रहते हैं। सुबाहु मारा जाता है और दूसरे आक्रमणकारी हटा दिए जाते हैं। यज्ञ पूरा होता है। राजकुमार जिस काम से घर से निकले थे, वह सफल हुआ; फिर भी विश्वामित्र के साथ उनकी यात्रा अभी समाप्त नहीं हुई।')
      ]),
      scene('mithila-river-history', 'The river has a story', 'नदी की भी कथा है', [
        pair('The sages are going to Janaka’s sacrifice in Mithila. There is also an extraordinary bow there, and the brothers are invited to see it. They travel together, stopping beside rivers while Vishvamitra unfolds the histories of the country. The road becomes a succession of places with memories.', 'ऋषि मिथिला में जनक के यज्ञ में जा रहे हैं। वहाँ एक विलक्षण धनुष भी है, जिसे देखने के लिए भाइयों को आमंत्रित किया जाता है। सब साथ चलते हैं। नदियों के किनारे पड़ाव पड़ते हैं और विश्वामित्र उन प्रदेशों का इतिहास सुनाते हैं। रास्ते के स्थान अपनी-अपनी स्मृतियों के साथ खुलते जाते हैं।'),
        pair('Among these stories is Bhagiratha’s effort to bring Ganga to the earth. Shiva receives the force of her descent in his matted hair, and the river follows Bhagiratha towards the ashes of his ancestors. Rama hears a journey within his own journey: resolve, obstacles and help from powers greater than one traveller.', 'इन कथाओं में गंगा को पृथ्वी पर लाने का भगीरथ का प्रयत्न भी है। शिव अपनी जटाओं में उनके अवतरण का वेग सँभालते हैं और नदी भगीरथ के पीछे उनके पूर्वजों की राख तक जाती है। राम अपनी यात्रा के भीतर एक और यात्रा सुनते हैं—संकल्प, बाधाओं और यात्री से बड़ी शक्तियों की सहायता की कथा।')
      ]),
      scene('mithila-ahalya', 'At a quiet hermitage', 'शांत आश्रम में', [
        pair('Near Mithila they come to Gautama’s hermitage. Vishvamitra tells Rama of Ahalya, living there unseen under a curse. Her story carries difficult questions of disguise, responsibility and punishment; the journey pauses at its moment of release. Rama enters the hermitage, and Ahalya becomes visible again.', 'मिथिला के निकट वे गौतम के आश्रम पहुँचते हैं। विश्वामित्र राम को अहल्या के बारे में बताते हैं, जो शाप के कारण वहाँ अदृश्य रहती हैं। उनकी कथा में वेश बदलने, उत्तरदायित्व और दंड के कठिन प्रश्न हैं; यहाँ यात्रा शाप-मुक्ति के क्षण पर ठहरती है। राम आश्रम में आते हैं और अहल्या फिर दिखाई देने लगती हैं।'),
        pair('Rama and Lakshmana honour her. She receives them as guests, and Gautama returns. The travellers do not leave the place as they found it. A secluded dwelling has become a place of meeting again, and the road to Mithila continues.', 'राम और लक्ष्मण उनका सम्मान करते हैं। अहल्या अतिथियों का स्वागत करती हैं और गौतम लौटते हैं। यात्री इस स्थान को पहले जैसी दशा में नहीं छोड़ते। एकांत निवास फिर मिलन का स्थान बना है। मिथिला की राह आगे चलती है।')
      ]),
      scene('mithila-janaka', 'The king’s invitation', 'राजा का आमंत्रण', [
        pair('In Janaka’s care rests the bow associated with Shiva, passed down through the royal house. Vishvamitra asks that it be shown to the sons of Dasharatha. Janaka describes its history and the condition attached to Sita’s marriage: the suitor must prove able to string it. What began as a journey to protect a sacrifice now stands before a different threshold.', 'जनक के संरक्षण में शिव से जुड़ा वह धनुष है जो राजवंश में पीढ़ियों से चला आया है। विश्वामित्र उसे दशरथ के पुत्रों को दिखाने का आग्रह करते हैं। जनक उसका इतिहास और सीता के विवाह से जुड़ी शर्त बताते हैं: वर को उस पर प्रत्यंचा चढ़ाने की क्षमता दिखानी होगी। यज्ञ की रक्षा के लिए शुरू हुई यात्रा अब एक नई दहलीज पर है।')
      ])
    ]
  },
  {
    id: 'the-bow-at-mithila',
    title: pair('The bow at Mithila', 'मिथिला का धनुष'),
    dek: pair('An ancient bow enters the hall. Its breaking changes two families.', 'प्राचीन धनुष सभा में आता है। उसका टूटना दो परिवारों का जीवन बदल देता है।'),
    part: bala,
    sources: [
      source('Valmiki Ramayana · Bala Kanda 1.66', 'https://www.valmikiramayan.net/utf8/baala/sarga66/balaroman66.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.67', 'https://www.valmikiramayan.net/utf8/baala/sarga67/balaroman67.htm'),
      source('Valmiki Ramayana · Bala Kanda 1.73', 'https://www.valmikiramayan.net/utf8/baala/sarga73/balaroman73.htm')
    ],
    note: pair('An original abridgement connecting the bow episode to the weddings. It does not add a private conversation or an earlier garden meeting between Rama and Sita. This chapter ends before the separate Parashurama episode.', 'धनुष-प्रसंग से विवाहों तक का मौलिक संक्षेप। इसमें राम और सीता का काल्पनिक निजी संवाद या उससे पहले की उद्यान-भेंट नहीं जोड़ी गई है। यह अध्याय अलग परशुराम-प्रसंग से पहले समाप्त होता है।'),
    reflection: pair('When a moment changes your life, what responsibilities arrive with it?', 'जब कोई क्षण जीवन बदल देता है, तो उसके साथ कौन-से दायित्व आते हैं?'),
    scenes: [
      scene('bow-janakas-promise', 'Janaka’s promise', 'जनक का प्रण', [
        pair('Janaka tells the visitors how he found Sita while ploughing a field for a rite. He raised her as his daughter and later declared that her marriage would be joined to an exceptional feat: stringing the great bow kept by his family. Many rulers had sought her hand; none had succeeded in the trial.', 'जनक अतिथियों को बताते हैं कि अनुष्ठान के लिए भूमि जोतते समय उन्हें सीता मिली थीं। उन्होंने पुत्री की तरह उनका पालन किया। आगे उन्होंने उनके विवाह के लिए असाधारण पराक्रम की शर्त रखी: परिवार में सुरक्षित महान धनुष पर प्रत्यंचा चढ़ाना। अनेक राजाओं ने विवाह चाहा था; परीक्षा में कोई सफल नहीं हुआ।'),
        pair('The king now agrees to Vishvamitra’s request. Ministers go to fetch the bow. It is carried in a great wheeled chest, its weight requiring many people to move it. This is no ordinary weapon brought forward for a quick display. The hall waits while the ancient object is set before the guests.', 'राजा अब विश्वामित्र का आग्रह स्वीकार करते हैं। मंत्री धनुष लाने जाते हैं। वह बड़े पहिएदार संदूक में रखा है, जिसे खींचने में अनेक लोगों की शक्ति लगती है। यह कोई साधारण अस्त्र नहीं, जिसे तुरंत प्रदर्शन के लिए उठा दिया जाए। अतिथियों के सामने उस प्राचीन धनुष के रखे जाने तक सभा प्रतीक्षा करती है।')
      ]),
      scene('bow-permission', 'Before touching the bow', 'धनुष को छूने से पहले', [
        pair('Janaka speaks of those who could not lift or bend it. Vishvamitra turns to Rama and invites him to examine it. Rama asks permission to take it in his hands and see whether he can raise and string it. The sage and king assent. The sequence gives the action its setting: an invitation, a request, then consent.', 'जनक उन लोगों का उल्लेख करते हैं जो उसे उठा या झुका नहीं सके। विश्वामित्र राम से उसे देखने को कहते हैं। राम धनुष हाथ में लेकर उसे उठाने और प्रत्यंचा चढ़ाने का प्रयास करने की अनुमति माँगते हैं। ऋषि और राजा सहमति देते हैं। घटना का क्रम स्पष्ट है: आमंत्रण, आग्रह और फिर अनुमति।')
      ]),
      scene('bow-break', 'A sound across the hall', 'सभा में गूँज', [
        pair('Rama opens the chest and lifts the bow. As he strings and draws it, the bow breaks in the middle. A tremendous sound fills the place. Those gathered are overwhelmed; the ordinary movement of the assembly stops. Janaka sees that the condition he had thought almost impossible has been fulfilled.', 'राम संदूक खोलकर धनुष उठा लेते हैं। प्रत्यंचा चढ़ाते और खींचते समय धनुष बीच से टूट जाता है। प्रचंड ध्वनि उस स्थान में भर जाती है। उपस्थित लोग स्तब्ध हो जाते हैं; सभा की सामान्य हलचल थम जाती है। जनक देखते हैं कि लगभग असंभव लगने वाली उनकी शर्त पूरी हो गई है।'),
        pair('The result is not left as a solitary triumph. Janaka speaks of Sita’s marriage and asks that messengers be sent to Ayodhya. Vishvamitra agrees. Rama’s deed now requires families to meet, arrangements to be made and a promise to take its next form.', 'परिणाम केवल व्यक्तिगत विजय बनकर नहीं रह जाता। जनक सीता के विवाह की बात करते हैं और अयोध्या संदेश भेजने का प्रस्ताव रखते हैं। विश्वामित्र सहमत होते हैं। राम के पराक्रम के बाद अब परिवारों को मिलना है, तैयारियाँ करनी हैं और प्रण को उसका अगला रूप देना है।')
      ]),
      scene('bow-weddings', 'Four marriages', 'चार विवाह', [
        pair('Dasharatha comes to Mithila with his household and advisers. The family ties widen: Rama marries Sita, Lakshmana marries Urmila, Bharata marries Mandavi, and Shatrughna marries Shrutakirti. The marriages are solemnised with the sacred fire, the elders and the assembled families as witnesses.', 'दशरथ परिवार और सलाहकारों के साथ मिथिला आते हैं। संबंधों का दायरा बढ़ता है: राम का विवाह सीता से, लक्ष्मण का उर्मिला से, भरत का मांडवी से और शत्रुघ्न का श्रुतकीर्ति से होता है। पवित्र अग्नि, बुज़ुर्गों और एकत्र परिवारों की साक्षी में विवाह संपन्न होते हैं।'),
        pair('The weddings join the two families, and the travellers prepare to leave Mithila. Rama and Sita begin a shared journey. Before the road brings them to Ayodhya, another bearer of a great bow will stand in their way.', 'विवाह दोनों परिवारों को जोड़ते हैं और यात्री मिथिला से प्रस्थान की तैयारी करते हैं। राम और सीता की साझा यात्रा आरंभ होती है। अयोध्या पहुँचने से पहले एक और महान धनुषधारी उनकी राह में सामने आएगा।')
      ])
    ]
  },
  {
    id: 'promise-of-exile',
    title: pair('The crown and the forest', 'राजमुकुट और वन'),
    dek: pair('Ayodhya prepares to celebrate. Inside the palace, an old promise returns.', 'अयोध्या उत्सव की तैयारी करती है। महल के भीतर एक पुराना वचन लौट आता है।'),
    part: ayodhya,
    sources: [
      source('Valmiki Ramayana · Ayodhya Kanda 2.1–18', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga18/ayodhyaroman18.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.26–30', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga30/ayodhyaroman30.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.31–40', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga40/ayodhyaroman40.htm')
    ],
    note: pair('An original abridgement spanning the planned succession and departure. It condenses several debates while preserving Sita’s insistence on accompanying Rama and Bharata’s absence from the decision.', 'नियोजित राज्याभिषेक और प्रस्थान का मौलिक संक्षेप। अनेक संवाद संक्षिप्त किए गए हैं; राम के साथ जाने का सीता का आग्रह और निर्णय के समय भरत की अनुपस्थिति सुरक्षित रखी गई है।'),
    contentNote: pair('Family coercion, distress and separation.', 'पारिवारिक दबाव, व्यथा और बिछोह।'),
    reflection: pair('How do you distinguish keeping a promise from ignoring the people affected by it?', 'वचन निभाने और उससे प्रभावित लोगों की अनदेखी करने में अंतर कैसे पहचानते हैं?'),
    scenes: [
      scene('exile-preparation', 'A city prepares', 'नगर की तैयारी', [
        pair('Time has passed since the marriages. Dasharatha, conscious of his age, decides that Rama should be consecrated as heir. The proposal is welcomed, preparations gather pace, and Ayodhya looks towards a celebration. Bharata and Shatrughna are away with their maternal relatives. The brothers who will be most affected are not all present when the future begins to change.', 'विवाहों के बाद समय बीत चुका है। अपनी बढ़ती आयु को देखते हुए दशरथ राम का युवराज के रूप में अभिषेक करने का निर्णय लेते हैं। प्रस्ताव का स्वागत होता है, तैयारियाँ तेज़ होती हैं और अयोध्या उत्सव की ओर देखती है। भरत और शत्रुघ्न अपने ननिहाल गए हैं। जिन भाइयों का भविष्य बदलने वाला है, वे सभी उस समय उपस्थित नहीं हैं।'),
        pair('Manthara warns Kaikeyi that Rama’s elevation could leave Bharata diminished. The warning turns into an argument for action. Kaikeyi remembers two boons Dasharatha once promised her and resolves to claim them. Outside, the city prepares the signs of welcome. Inside, a family’s old debt is being called due.', 'मंथरा कैकेयी को डराती है कि राम के युवराज बनने से भरत का स्थान कम हो सकता है। चेतावनी कार्रवाई के आग्रह में बदलती है। कैकेयी को दशरथ के दिए दो पुराने वर याद आते हैं और वे उन्हें माँगने का निश्चय करती हैं। बाहर नगर स्वागत की तैयारी कर रहा है। भीतर परिवार के पुराने वचन की पूर्ति माँगी जा रही है।')
      ]),
      scene('exile-boons', 'Two boons', 'दो वर', [
        pair('Her demands are precise: Bharata is to be installed in Rama’s place, and Rama must live in the forest for fourteen years. Dasharatha is devastated. He pleads, but Kaikeyi insists on the promise. When Rama is summoned, he finds a father scarcely able to speak. Kaikeyi explains the decision that the king cannot bring himself to announce.', 'माँग स्पष्ट है: राम के स्थान पर भरत का अभिषेक हो और राम चौदह वर्ष वन में रहें। दशरथ टूट जाते हैं। वे विनती करते हैं, पर कैकेयी वचन पर अड़ी रहती हैं। बुलाए जाने पर राम ऐसे पिता को देखते हैं जो बोल भी नहीं पा रहे। राजा जिस निर्णय को कह नहीं सकते, उसे कैकेयी बताती हैं।'),
        pair('Rama accepts the exile as the fulfilment of his father’s pledged word. He does not organise a rival claim to the throne. Yet his acceptance cannot remove the grief around him. Kausalya must hear that the day expected to honour her son will instead take him away; Lakshmana is angry at the injustice.', 'राम पिता के दिए वचन को पूरा करने के लिए वनवास स्वीकार करते हैं। वे सिंहासन के लिए दूसरा पक्ष खड़ा नहीं करते। फिर भी उनकी स्वीकृति आसपास का दुख नहीं मिटाती। कौसल्या को सुनना पड़ता है कि पुत्र के सम्मान का अपेक्षित दिन उसे उनसे दूर ले जाएगा; लक्ष्मण इस अन्याय से क्रोधित हैं।')
      ]),
      scene('exile-sita-speaks', 'Sita chooses the road', 'सीता राह चुनती हैं', [
        pair('Rama tells Sita to remain in Ayodhya and describes the dangers of forest life. She refuses to let that settle the matter. She argues that their life is shared, and that comfort without him is not the choice she wants. Her answer is persistent, affectionate and forceful. Rama finally agrees that she will accompany him.', 'राम सीता को अयोध्या में रहने के लिए कहते हैं और वन के संकट बताते हैं। सीता इसे अंतिम निर्णय नहीं मानतीं। वे तर्क देती हैं कि उनका जीवन साझा है और राम के बिना सुख-सुविधा उनका अपना चुनाव नहीं। उनका उत्तर स्नेहपूर्ण होने के साथ दृढ़ और बार-बार रखा गया है। अंततः राम उनके साथ चलने पर सहमत होते हैं।'),
        pair('Lakshmana also asks to go, ready to help them through the exile. Their leaving is now the decision of three travellers, though the command was directed at one. They prepare for a life with fewer possessions and distribute belongings before departure. The city’s celebration has become a farewell it never expected to give.', 'लक्ष्मण भी साथ जाने का आग्रह करते हैं और वनवास में उनकी सेवा के लिए तैयार होते हैं। आदेश एक व्यक्ति के लिए था, लेकिन अब प्रस्थान तीन यात्रियों का निर्णय है। वे कम साधनों वाले जीवन की तैयारी करते और अपनी वस्तुएँ बाँटते हैं। नगर का उत्सव ऐसे विदा-समारोह में बदल गया है जिसकी किसी ने कल्पना नहीं की थी।')
      ]),
      scene('exile-departure', 'Beyond the palace', 'महल के बाहर', [
        pair('Sumantra brings the chariot. Rama, Sita and Lakshmana depart while people gather around them, unwilling to be left behind. Dasharatha and the queens are caught in the pain of watching them go. The crowd follows the road out of the city; affection cannot simply be ordered to stay within the gates.', 'सुमंत्र रथ लाते हैं। राम, सीता और लक्ष्मण निकलते हैं। लोग उनके आसपास जमा होते हैं और पीछे रहना नहीं चाहते। दशरथ तथा रानियाँ उन्हें जाते देखने की पीड़ा में हैं। भीड़ नगर के बाहर तक पीछे चलती है; स्नेह को केवल आज्ञा देकर द्वारों के भीतर नहीं रोका जा सकता।'),
        pair('The promised fourteen years have begun. Ahead are unfamiliar dwellings and river crossings. Behind them stands a kingdom whose next ruler has not even heard what was done in his name. Rama’s journey towards the forest and Bharata’s journey back towards home will soon have to meet.', 'वचन के चौदह वर्ष शुरू हो गए हैं। आगे अपरिचित निवास और नदियाँ हैं। पीछे ऐसा राज्य है जिसके भावी शासक ने अभी सुना भी नहीं कि उसके नाम पर क्या हुआ। राम की वन की ओर और भरत की घर की ओर यात्रा जल्द एक-दूसरे से मिलने वाली हैं।')
      ])
    ]
  },
  {
    id: 'a-friend-beside-the-ganga',
    title: pair('A friend beside the Ganga', 'गंगा किनारे एक मित्र'),
    dek: pair('At the river, Guha offers everything. Friendship learns what is needed.', 'नदी किनारे गुह सब कुछ अर्पित करते हैं। मित्रता समझती है कि आवश्यकता क्या है।'),
    part: ayodhya,
    sources: [
      source('Valmiki Ramayana · Ayodhya Kanda 2.50', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga50/ayodhyaroman50.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.51', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga51/ayodhyaroman51.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.52', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga52/ayodhyaroman52.htm')
    ],
    note: pair('An original abridgement extending the welcome through the night watch and crossing. Guha’s friendship is the episode followed here; later boatman stories are not merged into it.', 'स्वागत से रात्रि-पहरे और नदी पार करने तक का मौलिक संक्षेप। यहाँ गुह की मित्रता का प्रसंग लिया गया है; बाद की केवट-कथाएँ इसमें नहीं मिलाई गई हैं।'),
    reflection: pair('When someone is going through a difficult change, how can you offer the help they actually want?', 'किसी कठिन बदलाव से गुजरते व्यक्ति को वही सहायता कैसे दें जिसकी उसे सच में आवश्यकता है?'),
    scenes: [
      scene('ganga-arrival', 'The river’s edge', 'नदी का किनारा', [
        pair('Beyond the settled country of Kosala, Rama turns towards Ayodhya and bids it farewell. The chariot carries the travellers onwards to the Ganga near Shringaverapura. Here the river spreads across their way: the journey can no longer continue on the same wheels that brought them from the palace.', 'कोसल के बसे हुए प्रदेश से आगे राम अयोध्या की ओर मुड़कर विदा लेते हैं। रथ यात्रियों को शृंगवेरपुर के निकट गंगा तक लाता है। नदी अब उनकी राह के बीच है: महल से लाए रथ के पहियों पर यात्रा आगे नहीं चल सकती।'),
        pair('Guha, the Nishada chief and Rama’s friend, hears of their arrival and comes to greet them. Rama embraces him. Guha offers food, beds and the resources of his own people. He would make this shore a place where the travellers could be fully cared for, if they wished to stay.', 'निषादराज गुह, राम के मित्र, उनके आने का समाचार पाकर स्वागत के लिए पहुँचते हैं। राम उन्हें गले लगाते हैं। गुह भोजन, शय्या और अपने लोगों की सहायता प्रस्तुत करते हैं। यात्री चाहें तो इस किनारे पर उनकी हर आवश्यकता पूरी हो सकती है।')
      ]),
      scene('ganga-hospitality', 'A smaller request', 'छोटी-सी आवश्यकता', [
        pair('Rama receives the affection but explains the life he has undertaken. The rich provisions do not fit the discipline of his exile. He asks instead that the horses be fed. They belong to his father’s household and have carried the party this far; caring for them matters even at the moment of leaving them behind.', 'राम स्नेह स्वीकार करते हैं, लेकिन अपने अपनाए जीवन का नियम बताते हैं। भरपूर राजसी भोजन वनवास के अनुशासन के अनुकूल नहीं। वे घोड़ों को चारा देने का आग्रह करते हैं। वे पिता के घर के हैं और यात्रियों को यहाँ तक लाए हैं; उन्हें पीछे छोड़ने के समय भी उनकी देखभाल आवश्यक है।'),
        pair('Guha arranges what is needed. Rama takes water, and he and Sita rest on a bed prepared on the ground. The host cannot undo the exile. He can make this one night less exposed, and he can listen when a friend tells him what kind of help will be welcome.', 'गुह आवश्यक व्यवस्था करते हैं। राम जल ग्रहण करते हैं और सीता के साथ भूमि पर बिछी शय्या पर विश्राम करते हैं। मेज़बान वनवास को पलट नहीं सकते। वे इस एक रात को अधिक सुरक्षित बना सकते हैं और सुन सकते हैं कि मित्र किस प्रकार की सहायता चाहता है।')
      ]),
      scene('ganga-night-watch', 'Those who keep watch', 'जो जागते हैं', [
        pair('Guha offers Lakshmana a place to sleep and promises that his people will keep guard. Lakshmana chooses to remain awake. The two speak through the night about those who sleep nearby and those left in Ayodhya. Lakshmana fears for Dasharatha and thinks of the mothers facing an emptied household.', 'गुह लक्ष्मण को विश्राम करने को कहते हैं और अपने लोगों से पहरा दिलाने का भरोसा देते हैं। लक्ष्मण जागने का निश्चय करते हैं। रात में दोनों पास सोए लोगों और अयोध्या में रह गए परिवार के बारे में बात करते हैं। लक्ष्मण दशरथ के लिए चिंतित हैं और सूने घर का सामना कर रही माताओं को याद करते हैं।'),
        pair('The river continues beside them. Friendship here is neither an extravagant gift nor a speech that resolves sorrow. It is company during a night when sleep does not come easily. At dawn, Guha has a boat made ready for the next stage of the road.', 'उनके पास नदी बहती रहती है। यहाँ मित्रता न कोई विशाल उपहार है, न दुख समाप्त कर देने वाला भाषण। वह ऐसी रात का साथ है जिसमें नींद सहज नहीं आती। भोर में गुह आगे की यात्रा के लिए नाव तैयार करवाते हैं।')
      ]),
      scene('ganga-crossing', 'The far bank', 'दूसरा किनारा', [
        pair('Sumantra wants to accompany them, but Rama sends him back with messages for the family. The brothers arrange their hair in the manner of forest ascetics. They board the boat with Sita, who prays to Ganga for a safe completion of the exile and a return.', 'सुमंत्र साथ चलना चाहते हैं, लेकिन राम उन्हें परिवार के लिए संदेश देकर लौटाते हैं। दोनों भाई वनवासी तपस्वियों की तरह जटाएँ बनाते हैं। सीता के साथ वे नाव में बैठते हैं। सीता गंगा से वनवास सुरक्षित पूरा होने और लौटने की प्रार्थना करती हैं।'),
        pair('The crossing separates the travellers from their chariot and its route home. On the farther bank, they must go forward on foot. Guha’s welcome has not shortened the fourteen years, but it has given their beginning a human shelter. What waits next is forest; what remains behind is a friend.', 'नदी पार करने के साथ यात्री अपने रथ और घर लौटती उसकी राह से अलग हो जाते हैं। दूसरे किनारे से उन्हें पैदल बढ़ना है। गुह के स्वागत ने चौदह वर्ष छोटे नहीं किए, लेकिन उनके आरंभ को स्नेह का आश्रय दिया है। आगे वन है; पीछे एक मित्र है।')
      ])
    ]
  },
  {
    id: 'bharata-and-the-sandals',
    title: pair('Bharata and the sandals', 'भरत और पादुकाएँ'),
    dek: pair('Two brothers meet in the forest. Neither will take the crown for himself.', 'वन में दो भाई मिलते हैं। कोई भी मुकुट अपने लिए नहीं लेना चाहता।'),
    part: ayodhya,
    sources: [
      source('Valmiki Ramayana · Ayodhya Kanda 2.72–73', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga72/ayodhyaroman72.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.99–104', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga102/ayodhyaroman102.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.112', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga112/ayodhyaroman112.htm'),
      source('Valmiki Ramayana · Ayodhya Kanda 2.115', 'https://www.valmikiramayan.net/utf8/ayodhya/sarga115/ayodhyaroman115.htm')
    ],
    note: pair('An original abridgement connecting Bharata’s return, the meeting at Chitrakuta and his stewardship at Nandigrama. A severe self-directed vow in 2.112 is omitted from this family-facing narration; the source reference remains available.', 'भरत की वापसी, चित्रकूट में मिलन और नंदिग्राम में उनके दायित्व का मौलिक संक्षेप। 2.112 में अपने प्रति हिंसा की कठोर प्रतिज्ञा इस पारिवारिक पाठ में नहीं दोहराई गई है; स्रोत-संदर्भ उपलब्ध है।'),
    contentNote: pair('A parent’s death and family grief.', 'पिता की मृत्यु और परिवार का शोक।'),
    reflection: pair('What would it mean to hold something in trust rather than call it your own?', 'किसी वस्तु को अपना मानने के बजाय धरोहर की तरह सँभालने का अर्थ क्या होगा?'),
    scenes: [
      scene('bharata-homecoming', 'A changed home', 'बदला हुआ घर', [
        pair('Bharata returns to Ayodhya expecting to see his family. Instead he finds a subdued city and an absent father. Kaikeyi tells him that Dasharatha has died. Then she explains Rama’s exile and the throne secured for Bharata through her two boons. What she presents as an advantage is, to him, a devastating wrong.', 'भरत परिवार से मिलने की आशा लिए अयोध्या लौटते हैं। उन्हें मौन-सा नगर मिलता है और पिता दिखाई नहीं देते। कैकेयी बताती हैं कि दशरथ का निधन हो गया है। फिर वे राम के वनवास और अपने दो वरों से भरत के लिए मिले सिंहासन की बात कहती हैं। जिसे वे लाभ बताती हैं, भरत उसे गहरा अन्याय मानते हैं।'),
        pair('He rejects the idea that he wanted his brother displaced. After the rites for his father, he sets out to bring Rama back. The queens, elders, ministers and many others go with him. The road through Guha’s country and towards Chitrakuta now carries another party from the same wounded household.', 'वे यह बात अस्वीकार करते हैं कि उन्होंने कभी भाई को हटाना चाहा। पिता के संस्कारों के बाद वे राम को लौटाने निकलते हैं। माताएँ, बुज़ुर्ग, मंत्री और अनेक लोग साथ जाते हैं। गुह के प्रदेश से चित्रकूट की ओर वही राह अब उसी दुखी परिवार का दूसरा दल ले जा रही है।')
      ]),
      scene('bharata-meeting', 'News in the forest', 'वन में समाचार', [
        pair('At the hermitage, the brothers meet with embraces and tears. Rama learns that their father is dead. The separation from Ayodhya has become a loss that no journey home can reverse. The brothers offer water and funeral food, and the gathering mourns before returning to the question that brought Bharata there.', 'आश्रम में भाई आलिंगन और आँसुओं के साथ मिलते हैं। राम को पिता की मृत्यु का समाचार मिलता है। अयोध्या से बिछोह अब ऐसी हानि बन गया है जिसे घर लौटना भी नहीं बदल सकता। भाई जल और पिंड अर्पित करते हैं। भरत के आने के उद्देश्य पर लौटने से पहले सब शोक मनाते हैं।'),
        pair('Bharata asks Rama to accept the kingdom. He does not want a crown obtained through this exile. Rama answers that the term promised by their father must be completed. Bharata should govern; Rama will remain in the forest. Their affection is deep, yet it does not make their understanding of duty identical.', 'भरत राम से राज्य स्वीकार करने को कहते हैं। वे इस वनवास के कारण मिला मुकुट नहीं चाहते। राम उत्तर देते हैं कि पिता के वचन की अवधि पूरी होनी चाहिए। भरत शासन सँभालें; वे वन में रहेंगे। दोनों में गहरा स्नेह है, फिर भी कर्तव्य की उनकी समझ एक जैसी नहीं हो जाती।')
      ]),
      scene('bharata-padukas', 'A sign of the absent king', 'अनुपस्थित राजा की निशानी', [
        pair('The discussion continues before the elders. Bharata doubts his ability to carry the kingdom alone. Rama assures him that he can govern with the counsel of wise ministers. No one can make the remaining years vanish. A practical question remains: how can the realm be cared for while the brothers live apart?', 'बुज़ुर्गों के सामने चर्चा चलती है। भरत अकेले राज्य सँभालने की अपनी क्षमता पर संदेह व्यक्त करते हैं। राम भरोसा दिलाते हैं कि विवेकशील मंत्रियों की सलाह से वे शासन कर सकते हैं। बचे हुए वर्ष कोई मिटा नहीं सकता। अब व्यावहारिक प्रश्न है: भाइयों के अलग रहते हुए राज्य की देखभाल कैसे हो?'),
        pair('Bharata asks for Rama’s sandals. Rama places his feet upon them and gives them to his brother. Bharata receives the padukas with reverence. They will stand for the authority he refuses to claim as his personal possession. The brothers part, having found a way to serve without pretending their disagreement has disappeared.', 'भरत राम की पादुकाएँ माँगते हैं। राम उनमें अपने चरण रखकर उन्हें भाई को देते हैं। भरत श्रद्धा से पादुकाएँ ग्रहण करते हैं। वे उस अधिकार की निशानी बनेंगी जिसे भरत अपनी निजी संपत्ति नहीं मानना चाहते। मतभेद मिट जाने का दावा किए बिना, सेवा का मार्ग पाकर दोनों भाई विदा होते हैं।')
      ]),
      scene('bharata-nandigrama', 'The work of waiting', 'प्रतीक्षा का कार्य', [
        pair('Bharata returns and takes up residence at Nandigrama. He places the sandals in the position of sovereignty, lives austerely and attends to the affairs of the kingdom with the ministers. The symbol does not do the work for him. Petitions, decisions and the daily care of the realm must still pass through living hands.', 'भरत लौटकर नंदिग्राम में रहते हैं। वे पादुकाओं को राजसत्ता के स्थान पर रखते हैं, सादा जीवन अपनाते हैं और मंत्रियों के साथ राज्य के कार्य सँभालते हैं। प्रतीक उनकी ओर से काम नहीं करता। निवेदन, निर्णय और राज्य की रोज़मर्रा की देखभाल जीवित हाथों से ही होनी है।'),
        pair('His waiting is therefore active. Each day of administration belongs to an interval he intends to end by returning what was entrusted to him. Far away, Rama, Sita and Lakshmana continue deeper into forest life. The same years now hold two kinds of responsibility.', 'इसलिए उनकी प्रतीक्षा सक्रिय है। शासन का हर दिन उस अवधि का हिस्सा है जिसका अंत वे सौंपी धरोहर लौटाकर करना चाहते हैं। दूर राम, सीता और लक्ष्मण वन-जीवन में आगे बढ़ते हैं। वही वर्ष अब दो प्रकार के उत्तरदायित्व सँभाल रहे हैं।')
      ])
    ]
  },
  {
    id: 'forest-torn-apart',
    title: pair('The forest is torn apart', 'वन का साथ टूटता है'),
    dek: pair('A golden deer draws Rama away. Jatayu becomes the witness who will not turn aside.', 'स्वर्ण-मृग राम को दूर ले जाता है। जटायु ऐसे साक्षी बनते हैं जो मुँह नहीं मोड़ते।'),
    part: aranya,
    sources: [
      source('Valmiki Ramayana · Aranya Kanda 3.17–18', 'https://www.valmikiramayan.net/utf8/aranya/sarga18/aranyaroman18.htm'),
      source('Valmiki Ramayana · Aranya Kanda 3.30', 'https://www.valmikiramayan.net/utf8/aranya/sarga30/aranyaroman30.htm'),
      source('Valmiki Ramayana · Aranya Kanda 3.42–45', 'https://www.valmikiramayan.net/utf8/aranya/sarga42/aranyaroman42.htm'),
      source('Valmiki Ramayana · Aranya Kanda 3.49–51', 'https://www.valmikiramayan.net/utf8/aranya/sarga49/aranyaroman49.htm'),
      source('Valmiki Ramayana · Aranya Kanda 3.67–68', 'https://www.valmikiramayan.net/utf8/aranya/sarga68/aranyaroman68.htm')
    ],
    note: pair('An original abridgement across several forest episodes. The Lakshmana-rekha of some later traditions is not inserted into the cited sequence. Ravana’s responsibility for the abduction is not shifted onto Sita’s curiosity or fear.', 'वन की अनेक घटनाओं का मौलिक संक्षेप। बाद की कुछ परंपराओं की लक्ष्मण-रेखा उद्धृत क्रम में नहीं जोड़ी गई है। अपहरण की रावण की ज़िम्मेदारी सीता की जिज्ञासा या भय पर नहीं डाली गई है।'),
    contentNote: pair('Abduction, coercion, disfigurement and a death; told without graphic detail.', 'अपहरण, बल-प्रयोग, अंग-क्षति और मृत्यु; गैर-चित्रात्मक वर्णन।'),
    reflection: pair('What can a witness protect, even when they cannot control the outcome?', 'जब परिणाम अपने हाथ में न हो, तब भी साक्षी किसकी रक्षा कर सकता है?'),
    scenes: [
      scene('forest-panchavati', 'A dwelling in Panchavati', 'पंचवटी में निवास', [
        pair('Forest life in Panchavati holds beauty and companionship, but also conflicts the travellers cannot keep outside their door. Shurpanakha, Ravana’s sister, approaches Rama and seeks him as a husband.', 'पंचवटी के वन-जीवन में सुंदरता और साथ है, लेकिन ऐसे संघर्ष भी हैं जिन्हें द्वार के बाहर नहीं रखा जा सकता। रावण की बहन शूर्पणखा राम के पास आती है और विवाह चाहती है।'),
        pair('A hurtful exchange follows. When she attacks Sita, Lakshmana wounds and disfigures her. She seeks help from her brother Khara; the violence grows into battle, and Rama kills Khara and his forces. Accounts of these events reach Ravana. He turns towards a scheme aimed at Sita, drawing Maricha into it despite Maricha’s warnings.', 'पीड़ा देने वाला संवाद होता है। सीता पर आक्रमण करने पर लक्ष्मण शूर्पणखा को घायल और अंग-भंग कर देते हैं। वह अपने भाई खर से सहायता माँगती है; हिंसा युद्ध तक बढ़ती है और राम खर तथा उसकी सेना को मारते हैं। घटनाओं का समाचार रावण तक पहुँचता है। वह सीता को लक्ष्य बनाकर योजना रचता है और मारीच की चेतावनी के बावजूद उसे उसमें शामिल करता है।')
      ]),
      scene('forest-golden-deer', 'The golden deer', 'स्वर्ण-मृग', [
        pair('Maricha takes the shape of a remarkable deer and appears near the dwelling. Sita is captivated by it and asks Rama to catch it. Lakshmana suspects a deception, but Rama follows the animal, leaving him to guard Sita. The deer keeps moving beyond reach, drawing the pursuit farther from home.', 'मारीच अद्भुत मृग का रूप धरकर निवास के पास आता है। सीता उससे आकर्षित होकर राम से उसे पकड़ने को कहती हैं। लक्ष्मण को छल का संदेह होता है, लेकिन राम उन्हें सीता की रक्षा के लिए छोड़कर मृग के पीछे जाते हैं। मृग बार-बार पकड़ से दूर निकलता है और पीछा घर से दूर ले जाता है।'),
        pair('At last Rama shoots it. Dying, Maricha abandons the disguise and cries out in Rama’s voice, calling to Sita and Lakshmana. The cry reaches the dwelling. Sita fears Rama is in danger and insists that Lakshmana go to him. He believes his brother cannot be overcome so easily, but their disagreement becomes painful. He finally leaves.', 'अंततः राम बाण चलाते हैं। मरते हुए मारीच रूप छोड़कर राम की आवाज़ में सीता और लक्ष्मण को पुकारता है। पुकार निवास तक पहुँचती है। सीता को राम के संकट में होने का भय है और वे लक्ष्मण से जाने का आग्रह करती हैं। लक्ष्मण मानते हैं कि उनके भाई को इतनी आसानी से परास्त नहीं किया जा सकता, लेकिन मतभेद पीड़ादायक हो उठता है। अंत में वे निकलते हैं।')
      ]),
      scene('forest-abduction', 'The disguise falls', 'वेश उतरता है', [
        pair('Ravana approaches in the guise of a wandering ascetic. Sita receives the apparent guest. He then reveals his identity and demands that she come to him; she rejects him. He takes her by force and carries her away. Her appeals call upon Rama, Lakshmana and the surrounding forest to bear witness.', 'रावण घूमते हुए संन्यासी का वेश लेकर आता है। सीता अतिथि समझकर उसका स्वागत करती हैं। फिर वह अपना परिचय देता और उन्हें अपने साथ आने को कहता है; सीता उसे ठुकराती हैं। वह बलपूर्वक उन्हें उठाकर ले जाता है। सीता राम, लक्ष्मण और आसपास के वन को पुकारती हैं कि वे इस घटना के साक्षी बनें।'),
        pair('The elderly Jatayu hears her. He challenges Ravana and urges him to release her. When counsel fails, the bird fights. He damages Ravana’s chariot and weapons, but Ravana grievously wounds him and escapes with Sita. Jatayu falls. His resistance has not stopped the abduction, yet he remains the witness the searching brothers will need.', 'वृद्ध जटायु उनकी आवाज़ सुनते हैं। वे रावण को ललकारते और सीता को छोड़ने को कहते हैं। समझाने से बात न बनने पर पक्षी युद्ध करता है। वह रावण के रथ और शस्त्रों को क्षति पहुँचाता है, लेकिन रावण उसे गंभीर रूप से घायल करके सीता को ले जाता है। जटायु गिर पड़ते हैं। वे अपहरण रोक नहीं सके, फिर भी वही साक्षी हैं जिसकी खोजते भाइयों को आवश्यकता होगी।')
      ]),
      scene('forest-last-witness', 'What Jatayu can tell', 'जटायु का साक्ष्य', [
        pair('Rama and Lakshmana return to an empty dwelling. They search through fear and grief, finding signs of a struggle before they find Jatayu. The wounded bird identifies Ravana and describes the abduction as his strength fails. Rama’s questions can no longer bring back the time that has passed, but they give the search a name and a direction.', 'राम और लक्ष्मण सूने निवास में लौटते हैं। भय और शोक में खोजते हुए उन्हें संघर्ष के चिह्न और फिर जटायु मिलते हैं। घायल पक्षी टूटते बल के साथ रावण का नाम और अपहरण की बात बताता है। राम के प्रश्न बीता समय नहीं लौटा सकते, लेकिन खोज को एक नाम और दिशा देते हैं।'),
        pair('Jatayu dies in their presence. Rama and Lakshmana perform his funeral rites, honouring him with the care owed to a loved elder. Only then do they resume the search. Sita is still beyond their reach. The road ahead will require more than their own strength; it will require those willing to help them find her.', 'जटायु उनके सामने प्राण त्यागते हैं। राम और लक्ष्मण प्रिय बुज़ुर्ग के योग्य सम्मान से उनके अंतिम संस्कार करते हैं। उसके बाद खोज फिर शुरू होती है। सीता अब भी उनकी पहुँच से बाहर हैं। आगे की राह केवल उनके अपने बल से पूरी नहीं होगी; उन्हें ऐसे साथियों की आवश्यकता होगी जो उन्हें खोजने में सहायता करें।')
      ])
    ]
  },
  {
    id: 'shabaris-welcome',
    title: pair('Shabari’s welcome', 'शबरी का स्वागत'),
    dek: pair('Two tired travellers arrive where someone has been waiting with care.', 'दो थके यात्री उस स्थान पहुँचते हैं जहाँ कोई स्नेह से उनकी प्रतीक्षा कर रहा है।'),
    part: aranya,
    sources: [
      source('Valmiki Ramayana · Aranya Kanda 3.71–73', 'https://www.valmikiramayan.net/utf8/aranya/sarga73/aranyaroman73.htm'),
      source('Valmiki Ramayana · Aranya Kanda 3.74', 'https://www.valmikiramayan.net/utf8/aranya/sarga74/aranyaroman74.htm'),
      source('Valmiki Ramayana · Kishkindha Kanda 4.1', 'https://www.valmikiramayan.net/utf8/kish/sarga1/kishkindharoman1.htm')
    ],
    note: pair('An original abridgement. The cited passage describes gathered forest food, not Shabari tasting each fruit. Its supernatural departure is condensed without procedural detail; the edition does not present it as a practice to imitate.', 'मौलिक संक्षेप। उद्धृत प्रसंग में जुटाए हुए वन-फल हैं, शबरी द्वारा हर फल चखने का वर्णन नहीं। उनके अलौकिक प्रस्थान को प्रक्रिया बताए बिना संक्षिप्त रखा गया है; उसे अनुकरण योग्य आचरण नहीं कहा गया है।'),
    contentNote: pair('Includes a brief account of a spiritual departure at the end of life.', 'जीवन के अंत में आध्यात्मिक प्रस्थान का संक्षिप्त उल्लेख।'),
    reflection: pair('What small preparation can make someone feel truly welcome?', 'कौन-सी छोटी तैयारी किसी को सच्चे स्वागत का अनुभव दे सकती है?'),
    scenes: [
      scene('shabari-road', 'A direction at last', 'आखिर एक दिशा', [
        pair('After Jatayu’s death, the brothers’ search continues through difficult country. Their encounter with Kabandha ends with a new piece of counsel: seek Sugriva, a vanara leader who also knows displacement and may help them find Sita. Kabandha describes the route towards Pampa and tells them about Shabari, an ascetic in the hermitage associated with Matanga.', 'जटायु की मृत्यु के बाद भाई कठिन प्रदेश में खोज जारी रखते हैं। कबन्ध से हुई भेंट के अंत में नई सलाह मिलती है: वानर नेता सुग्रीव को खोजें, जो स्वयं विस्थापन जानते हैं और सीता को ढूँढ़ने में सहायता कर सकते हैं। कबन्ध पम्पा की दिशा बताते हैं और मतंग से जुड़े आश्रम में रहने वाली तपस्विनी शबरी का परिचय देते हैं।'),
        pair('Rama and Lakshmana follow the western path. Trees bearing fruit and the waters of Pampa mark the country they have been told to look for. The search is still uncertain, but the next steps are no longer chosen blindly. A dwelling awaits them near the lake.', 'राम और लक्ष्मण पश्चिम की राह लेते हैं। फल वाले वृक्ष और पम्पा का जल उस प्रदेश की पहचान हैं जिसके बारे में उन्हें बताया गया है। खोज अब भी अनिश्चित है, लेकिन अगले कदम बिना दिशा के नहीं हैं। सरोवर के निकट एक निवास उनकी प्रतीक्षा करता है।')
      ]),
      scene('shabari-arrival', 'A welcome already prepared', 'पहले से तैयार स्वागत', [
        pair('Shabari sees the brothers arrive and honours them with water and the food she has gathered from the forest. Her teachers had told her that Rama would come. Waiting has not meant doing nothing: she has remained ready to receive the guest whose arrival they foretold.', 'शबरी दोनों भाइयों को आते देखती हैं और जल तथा वन से जुटाए भोजन से उनका सत्कार करती हैं। उनके गुरुओं ने कहा था कि राम आएँगे। प्रतीक्षा का अर्थ कुछ न करना नहीं रहा: वे उस अतिथि के स्वागत के लिए तैयार रही हैं जिसके आने की बात गुरुओं ने कही थी।'),
        pair('Rama asks about her practice, her well-being and the fulfilment of her service to her teachers. She answers that seeing him has brought her long discipline to fruition. The conversation gives room to the host’s life, rather than treating her only as a brief halt in the travellers’ urgent search.', 'राम उनकी साधना, कुशलता और गुरु-सेवा की पूर्ति के बारे में पूछते हैं। वे उत्तर देती हैं कि उनके दर्शन से लंबी साधना सफल हुई है। संवाद मेज़बान के जीवन को स्थान देता है; वह यात्रियों की अत्यावश्यक खोज में केवल छोटा पड़ाव नहीं बनतीं।')
      ]),
      scene('shabari-memory', 'The place she has kept', 'सँभालकर रखा स्थान', [
        pair('Shabari shows them the grove and the places connected with her teachers. The epic describes traces of their austerity still present there. She asks to depart to the state they have attained; the narrative presents her departure as a luminous, supernatural release. The brothers remain to honour the place before continuing.', 'शबरी उन्हें उपवन और अपने गुरुओं से जुड़े स्थान दिखाती हैं। महाकाव्य वहाँ अब भी उपस्थित उनकी तपस्या के चिह्न बताता है। वे अपने गुरुओं को प्राप्त अवस्था में जाने की इच्छा रखती हैं; कथा उनके प्रस्थान को तेजस्वी, अलौकिक मुक्ति के रूप में कहती है। आगे बढ़ने से पहले भाई उस स्थान का सम्मान करते हैं।')
      ]),
      scene('shabari-pampa', 'Beside Pampa', 'पम्पा के पास', [
        pair('They come again towards Pampa. Its blossoms, birds and water awaken Rama’s memory of Sita, making the beautiful landscape painful to him. Lakshmana encourages him to keep his resolve and seek the promised ally. A welcome has sustained them, but it has not replaced the work ahead. Somewhere near Rishyamuka is Sugriva—and the companion he will send to meet them.', 'वे पम्पा की ओर बढ़ते हैं। फूल, पक्षी और जल राम को सीता की याद दिलाते हैं और सुंदर दृश्य भी पीड़ादायक हो उठता है। लक्ष्मण उन्हें संकल्प बनाए रखकर बताए गए सहयोगी को खोजने का साहस देते हैं। स्वागत ने उन्हें सँभाला है, लेकिन आगे का काम समाप्त नहीं किया। ऋष्यमूक के निकट कहीं सुग्रीव हैं—और वह साथी भी, जिसे वे उनसे मिलने भेजेंगे।')
      ])
    ]
  },
  {
    id: 'hanumans-first-conversation',
    title: pair('The meeting at Rishyamuka', 'ऋष्यमूक की भेंट'),
    dek: pair('Before Hanuman crosses an ocean, he crosses the distance between strangers.', 'समुद्र पार करने से पहले हनुमान अनजान लोगों के बीच की दूरी पार करते हैं।'),
    part: pair('Kishkindha Kanda', 'किष्किन्धाकाण्ड'),
    sources: [
      source('Valmiki Ramayana · Kishkindha Kanda 4.2', 'https://www.valmikiramayan.net/utf8/kish/sarga2/kishkindharoman2.htm'),
      source('Valmiki Ramayana · Kishkindha Kanda 4.3', 'https://www.valmikiramayan.net/utf8/kish/sarga3/kishkindharoman3.htm'),
      source('Valmiki Ramayana · Kishkindha Kanda 4.4', 'https://www.valmikiramayan.net/utf8/kish/sarga4/kishkindharoman4.htm')
    ],
    note: pair('An original abridgement of Sugriva’s concern, Hanuman’s approach and Lakshmana’s answer. The emphasis on trust is an editorial reading of the exchange; no new dialogue is attributed to the characters.', 'सुग्रीव की चिंता, हनुमान के आगमन और लक्ष्मण के उत्तर का मौलिक संक्षेप। विश्वास पर बल इस संवाद की संपादकीय व्याख्या है; पात्रों को नए काल्पनिक संवाद नहीं दिए गए हैं।'),
    reflection: pair('What helps you feel safe enough to tell a stranger the truth?', 'किसी अनजान व्यक्ति को सच बताने जितना सुरक्षित महसूस करने में क्या सहायता करता है?'),
    scenes: [
      scene('meeting-watchers', 'Seen from the hill', 'पर्वत से दिखाई देते यात्री', [
        pair('Near Rishyamuka, Sugriva sees two strangers moving through the country. They wear the clothing of ascetics, yet carry powerful bows. Driven out by his brother Vali, Sugriva lives alert to pursuit. He fears these men may have been sent to kill him. Their appearance can be read in more than one way, and fear supplies the most dangerous answer.', 'ऋष्यमूक के पास सुग्रीव दो अपरिचित यात्रियों को देखते हैं। वे तपस्वियों के वस्त्र पहने हैं, पर शक्तिशाली धनुष लिए हैं। भाई वालि से निकाले जाने के बाद सुग्रीव पीछा किए जाने की आशंका में रहते हैं। उन्हें भय है कि ये लोग उनकी हत्या के लिए भेजे गए हों। यात्रियों के रूप के कई अर्थ हो सकते हैं; भय सबसे खतरनाक उत्तर सामने रखता है।'),
        pair('Hanuman counsels a steadier response. They should learn who the strangers are before deciding what their arrival means. Sugriva sends him to question them. The encounter that will alter the search for Sita begins with uncertainty on both sides, not with an alliance already secured.', 'हनुमान अधिक स्थिर होकर सोचने की सलाह देते हैं। आगमन का अर्थ तय करने से पहले जानना चाहिए कि यात्री कौन हैं। सुग्रीव उन्हें पूछताछ के लिए भेजते हैं। सीता की खोज को बदल देने वाली भेंट दोनों ओर अनिश्चितता से आरंभ होती है, पहले से बनी संधि से नहीं।')
      ]),
      scene('meeting-approach', 'An approach without threat', 'बिना धमकी के निकट आना', [
        pair('Taking the appearance of an ascetic, Hanuman approaches Rama and Lakshmana respectfully. He notices the contrast between their dress and their weapons and asks why they have come to this region. He does not demand an immediate answer. His words recognise their dignity while making space for the explanation he has been sent to seek.', 'तपस्वी का रूप लेकर हनुमान आदर से राम और लक्ष्मण के पास आते हैं। वे उनके वस्त्र और शस्त्रों के बीच अंतर पहचानते हैं और पूछते हैं कि वे इस प्रदेश में क्यों आए हैं। वे तुरंत उत्तर देने का दबाव नहीं डालते। उनके शब्द यात्रियों का सम्मान रखते हुए उस परिचय के लिए जगह बनाते हैं जिसे जानने वे भेजे गए हैं।'),
        pair('He identifies himself as Hanuman, the son of the wind, and speaks of Sugriva, who seeks their friendship. A hidden observer has become a named messenger. The brothers can now connect the stranger’s questions to a purpose, rather than having to guess at every word.', 'वे स्वयं को पवनपुत्र हनुमान बताते हैं और मित्रता चाहने वाले सुग्रीव का परिचय देते हैं। छिपकर देखने वाले पक्ष का प्रतिनिधि अब अपने नाम वाला दूत है। भाई अब उसके प्रश्नों को एक उद्देश्य से जोड़ सकते हैं; हर शब्द के पीछे अनुमान लगाने की आवश्यकता नहीं रहती।')
      ]),
      scene('meeting-speech', 'What Rama hears', 'राम क्या सुनते हैं', [
        pair('Rama turns to Lakshmana and remarks on the care of Hanuman’s speech. His words are clear, measured and well formed; his manner gives no sign of careless hostility. Rama recognises learning in the way the message is delivered. Here, before any feat of strength, the epic draws attention to Hanuman’s command of language.', 'राम लक्ष्मण से हनुमान की सावधान वाणी की चर्चा करते हैं। शब्द स्पष्ट, संतुलित और व्यवस्थित हैं; व्यवहार में असावधान शत्रुता नहीं। संदेश देने के ढंग से राम उनके अध्ययन को पहचानते हैं। शक्ति के किसी पराक्रम से पहले, यहाँ महाकाव्य हनुमान की भाषा-साधना पर ध्यान देता है।')
      ]),
      scene('meeting-answer', 'The answer opens a path', 'उत्तर से खुलती राह', [
        pair('Lakshmana explains who they are: sons of Dasharatha, living in exile, now searching for Sita after her abduction. They have been directed to Sugriva because he may be able to help. Telling the story makes their vulnerability plain. The armed strangers are also people who cannot finish their task alone.', 'लक्ष्मण बताते हैं कि वे कौन हैं: दशरथ के पुत्र, वनवास में रह रहे हैं और अपहरण के बाद सीता को खोज रहे हैं। सहायता की संभावना से उन्हें सुग्रीव के पास भेजा गया है। वृत्तांत कहने से उनकी असहायता भी स्पष्ट होती है। शस्त्रधारी अपरिचित ऐसे लोग भी हैं जो अपना काम अकेले पूरा नहीं कर सकते।'),
        pair('Hanuman recognises how their needs may meet Sugriva’s. Dropping the assumed form, he carries the brothers towards the waiting leader. No ocean has yet been crossed, no army assembled. A careful conversation has done the work required first: it has turned suspicion into the possibility of a shared road.', 'हनुमान समझते हैं कि उनकी आवश्यकता और सुग्रीव की आवश्यकता कैसे एक-दूसरे से जुड़ सकती हैं। धारण किया रूप छोड़कर वे भाइयों को प्रतीक्षारत नेता के पास ले चलते हैं। अभी समुद्र पार नहीं हुआ, सेना नहीं जुटी। सावधान संवाद ने पहला आवश्यक काम किया है: संदेह को साझा राह की संभावना में बदला है।')
      ])
    ]
  }
];
