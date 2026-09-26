import type { Lesson, Localized } from "./lessons";

export interface MomentAction {
  actionKey: string;
  label: Localized;
}

export interface PracticeMoment {
  id: Lesson["themeKey"];
  title: Localized;
  lessonId: string;
  actions: readonly MomentAction[];
}

// Curated everyday exercises, not scripture translations or personal advice.
export const moments: readonly PracticeMoment[] = [
  {
    id: "purpose",
    title: { en: "I’m putting something off", hi: "कोई काम टलता जा रहा है" },
    lessonId: "gita-2-47",
    actions: [
      {
        actionKey: "purpose-start-five-minutes",
        label: {
          en: "Give one postponed task five minutes of attention.",
          hi: "किसी एक टाले हुए काम पर पाँच मिनट ध्यान दूँ।",
        },
      },
      {
        actionKey: "purpose-first-line",
        label: {
          en: "Write the first sentence of a message or task I’ve been avoiding.",
          hi: "किसी टाले हुए संदेश या काम का पहला वाक्य लिखूँ।",
        },
      },
    ],
  },
  {
    id: "balance",
    title: { en: "I’m about to reply", hi: "अभी किसी को जवाब देना है" },
    lessonId: "gita-2-48",
    actions: [
      {
        actionKey: "balance-pause-before-reply",
        label: {
          en: "Before one reply, separate what happened from what I assumed.",
          hi: "एक जवाब देने से पहले जो हुआ, उसे अपने अनुमान से अलग करूँ।",
        },
      },
      {
        actionKey: "balance-ask-one-question",
        label: {
          en: "Ask one clear, respectful question before drawing a conclusion.",
          hi: "निष्कर्ष निकालने से पहले एक साफ़ और सम्मानजनक सवाल पूछूँ।",
        },
      },
    ],
  },
  {
    id: "attention",
    title: {
      en: "My mind keeps wandering",
      hi: "मेरा ध्यान बार-बार भटक रहा है",
    },
    lessonId: "gita-6-26",
    actions: [
      {
        actionKey: "attention-return-one-task",
        label: {
          en: "Read one paragraph; when my attention wanders, return to the next word.",
          hi: "एक अनुच्छेद पढ़ूँ; ध्यान भटके तो अगले शब्द पर वापस लौटूँ।",
        },
      },
      {
        actionKey: "attention-remove-distraction",
        label: {
          en: "Put one distraction aside and return to listening in a conversation.",
          hi: "एक ध्यान भटकाने वाली चीज़ अलग रखूँ और बातचीत में फिर सुनने पर लौटूँ।",
        },
      },
    ],
  },
];

export const momentActions = moments.flatMap((moment) =>
  moment.actions.map((action) => ({ ...action, lessonId: moment.lessonId })),
);

export function getMoment(id: string): PracticeMoment | undefined {
  return moments.find((moment) => moment.id === id);
}
