import type { Actor, AlphaState, Content } from "./types";
export const actors: Actor[] = [
  {
    id: "demo-member",
    name: "Asha · demo member",
    orgId: "demo-community",
    roles: ["member"],
  },
  {
    id: "demo-member-2",
    name: "Ravi · demo member",
    orgId: "demo-community",
    roles: ["member"],
  },
  {
    id: "demo-teacher",
    name: "Meera · demo teacher",
    orgId: "demo-community",
    roles: ["teacher", "admin"],
  },
  {
    id: "demo-reviewer",
    name: "Dev · demo reviewer",
    orgId: "demo-community",
    roles: ["reviewer"],
  },
  {
    id: "demo-operator",
    name: "Kiran · demo operator",
    orgId: "demo-community",
    roles: ["operator"],
  },
  {
    id: "foreign-actor",
    name: "Other organisation · fixture",
    orgId: "other-community",
    roles: ["teacher", "admin", "reviewer", "member"],
  },
];
export function createSeed(now = new Date()): AlphaState {
  const date = (days: number) =>
    new Date(now.getTime() + days * 86400000).toISOString();
  const sample: Content = {
    id: "demo-pause-v1",
    orgId: "demo-community",
    title: "A moment to arrive",
    purpose:
      "Non-doctrinal workflow sample. No scripture or teacher endorsement.",
    transcript:
      "The audio is three quiet synthetic tones, not spoken instruction or spiritual teaching. Pause for a moment. Notice the support beneath you. Choose one small, considerate action for today. This is demonstration copy, not reviewed spiritual instruction.",
    source:
      "Original alpha demonstration text; fixture approvals are not real attestations.",
    status: "published",
    version: 1,
    audioUrl: "/audio/alpha-sound-check.wav",
    seconds: 20,
    rights: {
      recorded: true,
      language: "en",
      territory: "worldwide",
      expiresAt: date(90),
    },
    approvedBy: "demo-reviewer",
    approvedAt: date(-1),
    publishedAt: date(-1),
    releaseAt: date(-1),
    createdAt: date(-2),
  };
  return {
    schema: 1,
    contents: [
      sample,
      {
        ...sample,
        id: "demo-kindness-v1",
        title: "One considerate action",
        status: "draft",
        approvedBy: undefined,
        approvedAt: undefined,
        publishedAt: undefined,
        releaseAt: date(1),
        createdAt: now.toISOString(),
        rights: { ...sample.rights, recorded: false },
      },
    ],
    cohorts: [
      {
        id: "demo-cohort",
        orgId: "demo-community",
        name: "A quieter beginning · demo circle",
        startAt: date(-1),
        endAt: date(30),
        capacity: 20,
        programIds: [sample.id],
      },
    ],
    invitations: [
      {
        id: "demo-invitation",
        token: "WELCOME-DEMO",
        orgId: "demo-community",
        cohortId: "demo-cohort",
        recipientId: "demo-member",
        expiresAt: date(7),
        revoked: false,
      },
    ],
    memberships: [],
    grants: [],
    completions: [],
    audit: [],
    support: [],
  };
}
