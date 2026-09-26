export type Role = "member" | "teacher" | "reviewer" | "admin" | "operator";
export interface Actor {
  id: string;
  name: string;
  orgId: string;
  roles: Role[];
}
export type ContentStatus =
  | "draft"
  | "awaiting_review"
  | "approved"
  | "published"
  | "superseded"
  | "withdrawn";
export interface Content {
  id: string;
  orgId: string;
  title: string;
  purpose: string;
  transcript: string;
  source: string;
  status: ContentStatus;
  version: number;
  previousId?: string;
  audioUrl: string;
  seconds: number;
  rights: {
    recorded: boolean;
    language: string;
    territory: string;
    expiresAt: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  releaseAt: string;
  createdAt: string;
}
export interface Cohort {
  id: string;
  orgId: string;
  name: string;
  startAt: string;
  endAt: string;
  capacity: number;
  programIds: string[];
}
export interface Invitation {
  id: string;
  token: string;
  orgId: string;
  cohortId: string;
  recipientId: string;
  expiresAt: string;
  revoked: boolean;
  acceptedBy?: string;
}
export interface Membership {
  userId: string;
  orgId: string;
  cohortId: string;
  joinedAt: string;
}
export interface Grant {
  id: string;
  userId: string;
  orgId: string;
  cohortId: string;
  source: "institution" | "direct";
  status: "pending" | "active" | "grace" | "expired" | "refunded" | "revoked";
  startsAt: string;
  endsAt: string;
}
export interface Completion {
  id: string;
  userId: string;
  orgId: string;
  contentId: string;
  cohortId: string;
  day: string;
  completedAt: string;
}
export interface Audit {
  at: string;
  actorId: string;
  action: string;
  targetId: string;
  orgId: string;
}
export interface AlphaState {
  schema: 1;
  contents: Content[];
  cohorts: Cohort[];
  invitations: Invitation[];
  memberships: Membership[];
  grants: Grant[];
  completions: Completion[];
  audit: Audit[];
  support: {
    orgId: string;
    actorId: string;
    minutes: number;
    kind: "delivery" | "support";
    at: string;
  }[];
}
export type Action =
  | { type: "join"; token: string; adult: boolean }
  | { type: "leaveCommunity" }
  | { type: "complete"; contentId: string; cohortId: string; timeZone: string }
  | {
      type: "createContent";
      title: string;
      purpose: string;
      transcript: string;
    }
  | {
      type: "editContent";
      contentId: string;
      title: string;
      purpose: string;
      transcript: string;
    }
  | { type: "revise"; contentId: string }
  | {
      type: "rights";
      contentId: string;
      language: string;
      territory: string;
      expiresAt: string;
    }
  | { type: "review"; contentId: string }
  | { type: "approve"; contentId: string }
  | { type: "publish"; contentId: string; cohortId: string; releaseAt: string }
  | { type: "withdraw"; contentId: string }
  | {
      type: "createCohort";
      name: string;
      startAt: string;
      endAt: string;
      capacity: number;
    }
  | { type: "invite"; cohortId: string; recipientId: string }
  | { type: "revokeInvite"; invitationId: string }
  | { type: "logMinutes"; minutes: number; kind: "delivery" | "support" };
