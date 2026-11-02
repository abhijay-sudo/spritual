export interface CharacterDharmaTension {
  poleA: string;
  poleB: string;
  explanation: string;
}

export interface CharacterArcStory {
  slug: string;
  title: string;
  scenesCount: number;
  estMinutes: number;
  summary: string;
}

export interface CharacterProfile {
  slug: string;
  name: string;
  epithet: string;
  sanskritInvocation: string;
  invocationTranslation: string;
  coreTension: string;
  tensions: CharacterDharmaTension[];
  arcStories: CharacterArcStory[];
  recommendedPractice: {
    mantra: string;
    mantraIAST: string;
    breathPattern: string; // e.g., "4-2-6"
    purpose: string;
  };
  audioPrologueNote: string;
}

export const charactersData: Record<string, CharacterProfile> = {
  rama: {
    slug: "rama",
    name: "Rama",
    epithet: "Maryada Purushottama (The Exemplar of Righteous Boundaries)",
    sanskritInvocation: "रामो विग्रहवान् धर्मः साधुः सत्यपराक्रमः ।\nराजा सर्वस्य लोकस्य देवानामिव वासवः ॥",
    invocationTranslation: "Rama is Dharma personified — virtuous, truth-valorous, ruler of all worlds as Indra rules the gods.",
    coreTension: "Unyielding Sovereign Duty vs. Agonising Personal Love",
    tensions: [
      {
        poleA: "The Crown's Absolute Impartiality",
        poleB: "The Husband's Private Grief",
        explanation: "To preserve civic trust in the integrity of the throne, Rama accepts inner exile while executing the outward decree of justice.",
      },
      {
        poleA: "Fidelity to a Father's Broken Word",
        poleB: "The Kingdom's Universal Plea to Stay",
        explanation: "When Dasharatha's grief-stricken court begs Rama to seize Ayodhya, he chooses forest exile to sanctify the inviolable weight of a promise.",
      },
    ],
    arcStories: [
      { slug: "valmikis-question", title: "The Asking of Narada", scenesCount: 5, estMinutes: 8, summary: "Valmiki seeks an exemplar who remains noble under betrayal." },
      { slug: "the-exile-vow", title: "The Crossing of the Ganga", scenesCount: 6, estMinutes: 10, summary: "Leaving golden Ayodhya without a trace of resentment in the eyes." },
      { slug: "the-golden-deer", title: "The Rupture in Panchavati", scenesCount: 7, estMinutes: 12, summary: "Maya weaves its net of separation in the Dandaka forest." },
      { slug: "the-return-to-ayodhya", title: "The Return of the Sovereign", scenesCount: 5, estMinutes: 9, summary: "Lighting the first lamps of homecoming on Kartik Amavasya." },
    ],
    recommendedPractice: {
      mantra: "ॐ श्री रामचन्द्राय नमः",
      mantraIAST: "oṁ śrī rāmacandrāya namaḥ",
      breathPattern: "4-2-6",
      purpose: "Steadies personal resolve when facing agonizing ethical choices.",
    },
    audioPrologueNote: "A 432Hz deep silver flute overtone evoking the quiet dusk over the Sarayu river.",
  },
  sita: {
    slug: "sita",
    name: "Sita",
    epithet: "Janakanandini (The Earth-Born Sovereign)",
    sanskritInvocation: "इयं सीता मम सुता सहधर्मचरी तव ।\nप्रतीच्छ चैनां भद्रं ते पाणिं गृह्णीष्व पाणिना ॥",
    invocationTranslation: "This is Sita, my daughter, your lifelong partner in sacred duty. Take her hand in yours; all blessings attend you.",
    coreTension: "Inviolate Inner Purity vs. The Relentless Burden of Public Proof",
    tensions: [
      {
        poleA: "Sacred Autonomy",
        poleB: "Devotion to Household and Lineage",
        explanation: "Sita refuses passive victimhood; every word spoken in Ravana's Ashok Vatika is an indictment of tyranny grounded in self-sovereignty.",
      },
      {
        poleA: "Endurance of Suspicion",
        poleB: "Reclaiming the Womb of the Earth",
        explanation: "Her final prayer is not for vindication before Ayodhya's courtiers, but for the Mother Earth to receive her unbroken dignity.",
      },
    ],
    arcStories: [
      { slug: "the-swayamvara", title: "The Lifting of Pinaka", scenesCount: 4, estMinutes: 7, summary: "Two sovereign souls recognise their shared descent in Mithila." },
      { slug: "the-ashoka-grove", title: "The Solitude of Lanka", scenesCount: 6, estMinutes: 11, summary: "Standing barefoot beneath the simshapa tree, defying an empire." },
      { slug: "the-fire-witness", title: "The Witness of Agni", scenesCount: 5, estMinutes: 9, summary: "When heaven and earth tremble before the integrity of a woman." },
      { slug: "the-earths-lap", title: "The Return to the Earth", scenesCount: 4, estMinutes: 8, summary: "The final golden silence that silences a capital forever." },
    ],
    recommendedPractice: {
      mantra: "ॐ श्री सीतायै नमः",
      mantraIAST: "oṁ śrī sītāyai namaḥ",
      breathPattern: "4-4-4",
      purpose: "Awakens unshakeable inner dignity when misunderstood by the world.",
    },
    audioPrologueNote: "The resonance of pure bronze singing bowls vibrating at 528Hz.",
  },
  hanuman: {
    slug: "hanuman",
    name: "Hanuman",
    epithet: "Pavanasuta (The Breath of Surrender and Strength)",
    sanskritInvocation: "मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम् ।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये ॥",
    invocationTranslation: "Swift as mind, swift as wind, master of the senses, foremost among the wise — unto the messenger of Rama I surrender.",
    coreTension: "Limitless Cosmic Might vs. Total Absence of Ego",
    tensions: [
      {
        poleA: "Power That Can Move Mountains",
        poleB: "Self-Forgetting Humility",
        explanation: "Hanuman carries the Sanjeevani hill on his palm yet asks for nothing more than to sit at the dust of Rama's feet.",
      },
    ],
    arcStories: [
      { slug: "the-ocean-leap", title: "The Leap Across the Waters", scenesCount: 6, estMinutes: 10, summary: "Remembering one's forgotten radiance in service of a sorrowing heart." },
      { slug: "the-ring-of-rama", title: "The Token of Hope", scenesCount: 5, estMinutes: 8, summary: "Dropping the signet ring into Sita's lap in the dead of midnight." },
      { slug: "the-herb-of-life", title: "The Carrying of Dronagiri", scenesCount: 5, estMinutes: 9, summary: "When medicinal herbs conceal themselves, love uproots the mountain." },
    ],
    recommendedPractice: {
      mantra: "ॐ हं हनुमते नमः",
      mantraIAST: "oṁ haṁ hanumate namaḥ",
      breathPattern: "4-2-6",
      purpose: "Dissolves paralysis and fear through fearless, unselfish action.",
    },
    audioPrologueNote: "Conch resonance shifting into sustained 396Hz root grounding.",
  },
  krishna: {
    slug: "krishna",
    name: "Krishna",
    epithet: "Yogeshvara (The Master of Equanimity and Cosmic Play)",
    sanskritInvocation: "वसुदेवसुतं देवं कंसचाणूरमर्दनम् ।\nदेवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम् ॥",
    invocationTranslation: "Unto the divine son of Vasudeva, destroyer of Kamsa and Chanura, the supreme joy of Devaki, teacher of the cosmos — I bow.",
    coreTension: "Radical Non-Attachment vs. Deep, Passionate Engagement",
    tensions: [
      {
        poleA: "The Universal Witness",
        poleB: "The Charioteer in the Dust",
        explanation: "Knowing the fatal destiny of the Kurukshetra field, Krishna still cleans the sweating horses and guides Arjuna's trembling hands.",
      },
    ],
    arcStories: [
      { slug: "the-peace-embassy", title: "The Rebuffed Messenger", scenesCount: 6, estMinutes: 11, summary: "Offering five small villages to avert the slaughter of eighteen akshauhinis." },
      { slug: "the-field-of-dharma", title: "The Chariot Between Two Armies", scenesCount: 7, estMinutes: 14, summary: "Where human grief encounters eternal reality at the battle threshold." },
      { slug: "the-cosmic-vision", title: "The Unveiling of Vishwarupa", scenesCount: 6, estMinutes: 12, summary: "Sun, time, death, and birth whirling within a single cosmic gaze." },
    ],
    recommendedPractice: {
      mantra: "ॐ नमो भगवते वासुदेवाय",
      mantraIAST: "oṁ namo bhagavate vāsudevāya",
      breathPattern: "4-7-8",
      purpose: "Calms existential dread and releases the illusion of obsessive control.",
    },
    audioPrologueNote: "A 432Hz bamboo flute motif drifting into an expansive tanpura fifth.",
  },
  shiva: {
    slug: "shiva",
    name: "Shiva",
    epithet: "Mahadeva (The Silent Stillness Beneath All Becoming)",
    sanskritInvocation: "शान्तं पद्मासनस्थं शशिधरमुकुटं पञ्चवक्त्रं त्रिनेत्रम् ।\nशूलं वज्रं च खड्गं परशुमभयदं दक्षभागे वहन्तम् ॥",
    invocationTranslation: "Tranquil, seated upon the lotus, crowned with the crescent moon, three-eyed — the eternal asylum of all wanderers.",
    coreTension: "Absolute Ascetic Stillness vs. The Cosmic Dance of Dissolution",
    tensions: [
      {
        poleA: "Samadhi on Mount Kailasha",
        poleB: "Drinking the Poison of the Oceans",
        explanation: "He who seeks nothing for himself willingly holds the burning Halahala venom in his throat to preserve the living universe.",
      },
    ],
    arcStories: [
      { slug: "the-ocean-churning", title: "The Blue Throat of Kailasha", scenesCount: 5, estMinutes: 9, summary: "When the gods flee the churning venom, stillness drinks it whole." },
      { slug: "the-descent-of-ganga", title: "The Tangled Locks", scenesCount: 6, estMinutes: 10, summary: "Cushioning the celestial river's furious drop upon human earth." },
    ],
    recommendedPractice: {
      mantra: "ॐ नमः शिवाय",
      mantraIAST: "oṁ namaḥ śivāya",
      breathPattern: "4-2-6",
      purpose: "Anchors the awareness in silent presence amidst external storms.",
    },
    audioPrologueNote: "Deep low-register Himalayan bell at 108Hz with rolling overtone.",
  },
  ganesha: {
    slug: "ganesha",
    name: "Ganesha",
    epithet: "Vighneshvara (The Remover of Inward Obstacles)",
    sanskritInvocation: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा ॥",
    invocationTranslation: "O curved trunk, immense presence, glowing with the radiance of ten million suns — clear my path of inward obstacles forever.",
    coreTension: "Analytical Intellect vs. Transcendental Insight",
    tensions: [
      {
        poleA: "The Scribe Who Demands Flawless Understanding",
        poleB: "The Compassionate Guide of Beginnings",
        explanation: "As scribe to Vyasa, Ganesha agrees to write the Mahabharata only if he never records a word without comprehending its deepest layer.",
      },
    ],
    arcStories: [
      { slug: "the-scribes-covenant", title: "The Covenant with Vyasa", scenesCount: 4, estMinutes: 7, summary: "Two minds covenanting that wisdom must never be penned without realization." },
    ],
    recommendedPractice: {
      mantra: "ॐ गं गणपतये नमः",
      mantraIAST: "oṁ gaṁ gaṇapataye namaḥ",
      breathPattern: "4-4-4",
      purpose: "Clears mental fog and grounds the mind in calm discernment.",
    },
    audioPrologueNote: "Warm clay pot (ghatam) resonance with single golden chime at 528Hz.",
  },
};
