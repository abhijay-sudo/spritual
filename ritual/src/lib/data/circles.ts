export interface SanghaReflection {
  id: string;
  authorAlias: string;
  date: string;
  storyRef?: string;
  citationRef?: string;
  reflectionText: string;
  responses: {
    id: string;
    authorAlias: string;
    date: string;
    text: string;
  }[];
}

export interface SanghaCircle {
  id: string;
  slug: string;
  title: string;
  theme: string;
  currentPrompt: string;
  memberCount: number;
  maxMembers: number;
  facilitatorAlias: string;
  weeklyCadence: string;
  codeOfConduct: string[];
  reflections: SanghaReflection[];
}

export const sanghaCirclesData: SanghaCircle[] = [
  {
    id: "circle-dharma-daily",
    slug: "dharma-in-daily-life",
    title: "Dharma in Daily Life",
    theme: "Navigating ethical crossroads in work, family, and public duty without losing inner stillness.",
    currentPrompt: "When an external duty requires you to say no to someone you cherish, what helps you preserve kindness without compromising principle?",
    memberCount: 24,
    maxMembers: 30,
    facilitatorAlias: "Acharya Madhav",
    weeklyCadence: "New contemplative prompt every Thursday at dusk.",
    codeOfConduct: [
      "Speak only from personal lived experience, not debate or intellectual combat.",
      "No unsolicited advice or theological dispute; listen with reverence.",
      "Honor silence; not every thought requires posting.",
      "Strict confidentiality: what is witnessed inside the circle remains inside.",
    ],
    reflections: [
      {
        id: "ref-1",
        authorAlias: "Pravin (Bengaluru)",
        date: "2 days ago",
        storyRef: "valmikis-question",
        citationRef: "valmiki-1-2",
        reflectionText:
          "Reading Rama's quiet acceptance of forest exile made me look at my own irritation when a major family obligation derailed months of personal plans. I realized that my anger wasn't about the duty itself — it was my ego clinging to the script I had written for myself. Letting go of the script allowed me to serve without resentment.",
        responses: [
          {
            id: "resp-1-1",
            authorAlias: "Kalyani (Pune)",
            date: "Yesterday",
            text: "This resonates deeply. The phrase 'clinging to the script' touches the core of kanksha (desire). Thank you for sharing this quiet lens.",
          },
        ],
      },
      {
        id: "ref-2",
        authorAlias: "Arundhati (London)",
        date: "3 days ago",
        storyRef: "the-field-of-dharma",
        citationRef: "gita-2-47",
        reflectionText:
          "In healthcare leadership, outcomes are never fully in my control. Gita 2.47 used to feel like detachment, but now it feels like mercy. It frees me from paralyzing panic so I can be 100% attentive to the patient in front of me.",
        responses: [],
      },
    ],
  },
  {
    id: "circle-grief-endurance",
    slug: "grief-and-endurance",
    title: "Grief and Endurance",
    theme: "Holding irreversible loss alongside life's sacred unfolding.",
    currentPrompt: "How do you sit with separation when words, explanations, and advice fail?",
    memberCount: 19,
    maxMembers: 25,
    facilitatorAlias: "Savitri Didi",
    weeklyCadence: "Quiet reflection window open throughout Saturday evening.",
    codeOfConduct: [
      "No platitudes or quick consolations.",
      "Honor grief as a sacred proof of love.",
      "All reflections are unranked and private to circle members.",
    ],
    reflections: [
      {
        id: "ref-3",
        authorAlias: "Dev (Varanasi)",
        date: "4 days ago",
        storyRef: "the-ashoka-grove",
        reflectionText:
          "Sitting beside the Ganga after losing my elder brother, I kept returning to Sita in the Ashok Vatika. She didn't bargain or numb herself; she simply breathed through each hour. Some days endurance is just breathing.",
        responses: [
          {
            id: "resp-3-1",
            authorAlias: "Meera (Jaipur)",
            date: "3 days ago",
            text: "Sitting with you in silence, Dev. Just breathing is enough.",
          },
        ],
      },
    ],
  },
  {
    id: "circle-solitude-sanctuary",
    slug: "solitude-and-the-inner-monastery",
    title: "Solitude & The Inner Monastery",
    theme: "Cultivating solitary contemplative pauses in hyper-connected modern cities.",
    currentPrompt: "Where in your day do you find a crack of genuine silence, and what arises when the screen turns dark?",
    memberCount: 22,
    maxMembers: 28,
    facilitatorAlias: "Swami Anand",
    weeklyCadence: "Sunday sunrise contemplative inquiry.",
    codeOfConduct: [
      "Brief, essential reflections only.",
      "Focus on the practice of silence.",
    ],
    reflections: [],
  },
];
