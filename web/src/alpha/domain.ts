import type { Action, Actor, AlphaState, Content, Role } from "./types";
const validDate = (value: string) => Number.isFinite(Date.parse(value));
const currentRights = (content: Content, now: Date) =>
  content.rights.recorded &&
  !!content.rights.language.trim() &&
  !!content.rights.territory.trim() &&
  validDate(content.rights.expiresAt) &&
  Date.parse(content.rights.expiresAt) > now.getTime();
function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const has = (actor: Actor, ...roles: Role[]) =>
  roles.some((role) => actor.roles.includes(role));
export function localDay(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  return ["year", "month", "day"]
    .map((type) => parts.find((part) => part.type === type)!.value)
    .join("-");
}
export function access(
  state: AlphaState,
  actor: Actor,
  cohortId: string,
  now = new Date(),
): { allowed: boolean; reason: string; endsAt?: string } {
  const cohort = state.cohorts.find(
    (c) => c.id === cohortId && c.orgId === actor.orgId,
  );
  if (!cohort)
    return {
      allowed: false,
      reason: "Circle not available to this organisation.",
    };
  if (Date.parse(cohort.startAt) > +now)
    return { allowed: false, reason: "This circle has not started yet." };
  if (Date.parse(cohort.endAt) <= +now)
    return { allowed: false, reason: "This circle has ended." };
  if (
    !state.memberships.some(
      (m) =>
        m.userId === actor.id &&
        m.orgId === actor.orgId &&
        m.cohortId === cohortId,
    )
  )
    return {
      allowed: false,
      reason: "Accept your personal invitation to join.",
    };
  const grants = state.grants.filter(
    (g) =>
      g.userId === actor.id &&
      g.orgId === actor.orgId &&
      g.cohortId === cohortId &&
      ["active", "grace"].includes(g.status) &&
      Date.parse(g.startsAt) <= +now &&
      Date.parse(g.endsAt) > +now,
  );
  if (!grants.length)
    return {
      allowed: false,
      reason:
        "Your access is not currently active. Contact your circle organiser.",
    };
  return {
    allowed: true,
    reason: "Circle access is active.",
    endsAt: new Date(
      Math.min(
        Date.parse(cohort.endAt),
        Math.max(...grants.map((g) => Date.parse(g.endsAt))),
      ),
    ).toISOString(),
  };
}
export function visibleContents(
  state: AlphaState,
  actor: Actor,
  cohortId: string,
  now = new Date(),
): Content[] {
  if (!access(state, actor, cohortId, now).allowed) return [];
  const cohort = state.cohorts.find(
    (c) => c.id === cohortId && c.orgId === actor.orgId,
  )!;
  const released = state.contents.filter(
    (c) =>
      c.orgId === actor.orgId &&
      cohort.programIds.includes(c.id) &&
      c.status === "published" &&
      currentRights(c, now) &&
      validDate(c.releaseAt) &&
      Date.parse(c.releaseAt) <= +now,
  );
  // Publication history survives withdrawal/expiry; never silently roll back.
  // Legacy approved-and-withdrawn revisions are conservatively treated as published.
  const effective = state.contents.filter(c => c.orgId === actor.orgId && cohort.programIds.includes(c.id) && validDate(c.releaseAt) && Date.parse(c.releaseAt) <= +now && (c.publishedAt || c.status === "published" || c.status === "superseded" || (c.status === "withdrawn" && c.approvedAt)));
  const superseded = new Set<string>();
  for (const item of effective) {
    let previousId = item.previousId;
    const visited = new Set<string>();
    while (previousId && !visited.has(previousId)) {
      visited.add(previousId); superseded.add(previousId);
      previousId = state.contents.find(c => c.id === previousId && c.orgId === actor.orgId)?.previousId;
    }
  }
  return released.filter(item => !superseded.has(item.id));
}
export function transition(
  state: AlphaState,
  actor: Actor,
  action: Action,
  now = new Date(),
): AlphaState {
  requireThat(Number.isFinite(+now), "Invalid current time.");
  const next = structuredClone(state);
  const id = (prefix: string) => `${prefix}-${globalThis.crypto.randomUUID()}`;
  const stamp = now.toISOString();
  let targetId: string = actor.id;
  const content = (contentId: string) => {
    const item = next.contents.find(
      (c) => c.id === contentId && c.orgId === actor.orgId,
    );
    requireThat(item, "Content not available to this organisation.");
    targetId = item.id;
    return item;
  };
  const cohort = (cohortId: string) => {
    const item = next.cohorts.find(
      (c) => c.id === cohortId && c.orgId === actor.orgId,
    );
    requireThat(item, "Circle not available to this organisation.");
    targetId = item.id;
    return item;
  };
  const teacher = () =>
    requireThat(
      has(actor, "teacher", "admin"),
      "Teacher or administrator access is required.",
    );
  switch (action.type) {
    case "leaveCommunity": {
      requireThat(has(actor, "member"), "Member access is required.");
      const own = (entry: { userId: string; orgId: string }) =>
        entry.userId === actor.id && entry.orgId === actor.orgId;
      next.memberships = next.memberships.filter((entry) => !own(entry));
      next.grants = next.grants.filter((entry) => !own(entry));
      next.completions = next.completions.filter((entry) => !own(entry));
      next.invitations.forEach((invite) => {
        if (invite.orgId === actor.orgId && invite.acceptedBy === actor.id)
          invite.revoked = true;
      });
      break;
    }
    case "join": {
      requireThat(has(actor, "member"), "A member account is required.");
      requireThat(action.adult, "This alpha is for adults aged 18 or over.");
      const invite = next.invitations.find(
        (i) => i.token === action.token.trim() && i.orgId === actor.orgId,
      );
      requireThat(
        invite,
        "Invitation not found. Check your personal invitation code.",
      );
      requireThat(!invite.revoked, "This invitation was revoked.");
      requireThat(!invite.acceptedBy, "This invitation has already been used.");
      requireThat(
        Date.parse(invite.expiresAt) > +now,
        "This invitation has expired.",
      );
      requireThat(
        invite.recipientId === actor.id,
        "This invitation belongs to another member.",
      );
      const circle = cohort(invite.cohortId);
      requireThat(Date.parse(circle.endAt) > +now, "This circle has ended.");
      requireThat(
        !next.memberships.some(
          (m) =>
            m.userId === actor.id &&
            m.orgId === actor.orgId &&
            m.cohortId === circle.id,
        ),
        "You already belong to this circle.",
      );
      requireThat(
        next.memberships.filter(
          (m) => m.orgId === actor.orgId && m.cohortId === circle.id,
        ).length < circle.capacity,
        "This circle is full. Contact the organiser.",
      );
      invite.acceptedBy = actor.id;
      next.memberships.push({
        userId: actor.id,
        orgId: actor.orgId,
        cohortId: circle.id,
        joinedAt: stamp,
      });
      next.grants.push({
        id: id("grant"),
        userId: actor.id,
        orgId: actor.orgId,
        cohortId: circle.id,
        source: "institution",
        status: "active",
        startsAt: circle.startAt,
        endsAt: circle.endAt,
      });
      break;
    }
    case "complete": {
      requireThat(has(actor, "member"), "Member access is required.");
      requireThat(
        visibleContents(next, actor, action.cohortId, now).some(
          (c) => c.id === action.contentId,
        ),
        "This practice is not available for completion.",
      );
      const day = localDay(now, action.timeZone);
      if (
        next.completions.some(
          (c) =>
            c.userId === actor.id &&
            c.orgId === actor.orgId &&
            c.contentId === action.contentId &&
            c.day === day,
        )
      )
        return next;
      next.completions.push({
        id: id("completion"),
        userId: actor.id,
        orgId: actor.orgId,
        contentId: action.contentId,
        cohortId: action.cohortId,
        day,
        completedAt: stamp,
      });
      targetId = action.contentId;
      break;
    }
    case "createContent": {
      teacher();
      requireThat(
        action.title.trim() &&
          action.purpose.trim() &&
          action.transcript.trim(),
        "Title, purpose and transcript are required.",
      );
      requireThat(
        action.title.length <= 160 &&
          action.purpose.length <= 1000 &&
          action.transcript.length <= 20000,
        "Content exceeds the permitted length.",
      );
      targetId = id("content");
      next.contents.push({
        id: targetId,
        orgId: actor.orgId,
        title: action.title.trim(),
        purpose: action.purpose.trim(),
        transcript: action.transcript.trim(),
        source:
          "Locally authored alpha draft; no external review or rights verification.",
        status: "draft",
        version: 1,
        audioUrl: "",
        seconds: 0,
        rights: { recorded: false, language: "", territory: "", expiresAt: "" },
        releaseAt: stamp,
        createdAt: stamp,
      });
      break;
    }
    case "editContent": {
      teacher();
      const item = content(action.contentId);
      requireThat(
        item.status === "draft",
        "Only a draft version can be edited.",
      );
      requireThat(
        action.title.trim() &&
          action.purpose.trim() &&
          action.transcript.trim(),
        "Title, purpose and transcript are required.",
      );
      requireThat(
        action.title.length <= 160 &&
          action.purpose.length <= 1000 &&
          action.transcript.length <= 20000,
        "Content exceeds the permitted length.",
      );
      item.title = action.title.trim();
      item.purpose = action.purpose.trim();
      item.transcript = action.transcript.trim();
      item.rights.recorded = false;
      item.approvedBy = undefined;
      item.approvedAt = undefined;
      break;
    }
    case "revise": {
      teacher();
      const old = content(action.contentId);
      requireThat(
        ["approved", "published", "withdrawn"].includes(old.status),
        "Revise an approved, published or withdrawn version.",
      );
      requireThat(
        !next.contents.some(
          (c) =>
            c.previousId === old.id &&
            !["withdrawn", "superseded"].includes(c.status),
        ),
        "A revision of this version already exists.",
      );
      targetId = id("content");
      next.contents.push({
        ...old,
        id: targetId,
        previousId: old.id,
        version: old.version + 1,
        status: "draft",
        approvedBy: undefined,
        approvedAt: undefined,
        publishedAt: undefined,
        createdAt: stamp,
        rights: { ...old.rights, recorded: false },
      });
      break;
    }
    case "rights": {
      teacher();
      const item = content(action.contentId);
      requireThat(
        item.status === "draft",
        "Rights can only be recorded on a draft version.",
      );
      requireThat(
        action.language.trim() &&
          action.territory.trim() &&
          validDate(action.expiresAt) &&
          Date.parse(action.expiresAt) > +now,
        "Record language, territory and a future rights expiry.",
      );
      item.rights = {
        recorded: true,
        language: action.language.trim(),
        territory: action.territory.trim(),
        expiresAt: action.expiresAt,
      };
      break;
    }
    case "review": {
      teacher();
      const item = content(action.contentId);
      requireThat(item.status === "draft", "Only a draft can be submitted.");
      requireThat(
        currentRights(item, now),
        "Record current content rights before review.",
      );
      item.status = "awaiting_review";
      break;
    }
    case "approve": {
      requireThat(has(actor, "reviewer"), "Reviewer access is required.");
      const item = content(action.contentId);
      requireThat(
        item.status === "awaiting_review",
        "Only a submitted version can be approved.",
      );
      requireThat(
        currentRights(item, now),
        "Content rights have expired or are incomplete.",
      );
      item.status = "approved";
      item.approvedBy = actor.id;
      item.approvedAt = stamp;
      break;
    }
    case "publish": {
      teacher();
      const item = content(action.contentId);
      const circle = cohort(action.cohortId);
      targetId = item.id;
      requireThat(
        item.status === "approved" && item.approvedBy && item.approvedAt,
        "Only the exact approved version can be published.",
      );
      requireThat(
        currentRights(item, now),
        "Current content rights are required.",
      );
      requireThat(
        validDate(action.releaseAt) &&
          Date.parse(action.releaseAt) >= Date.parse(circle.startAt) &&
          Date.parse(action.releaseAt) < Date.parse(circle.endAt) &&
          Date.parse(circle.endAt) > +now,
        "Release must fall within an active or upcoming circle.",
      );
      requireThat(
        Date.parse(item.rights.expiresAt) > Date.parse(action.releaseAt),
        "Content rights expire before this release.",
      );
      item.status = "published";
      item.publishedAt = stamp;
      item.releaseAt = action.releaseAt;
      circle.programIds.push(item.id);
      break;
    }
    case "withdraw": {
      teacher();
      const item = content(action.contentId);
      requireThat(
        item.status !== "withdrawn",
        "This version is already withdrawn.",
      );
      item.status = "withdrawn";
      break;
    }
    case "createCohort": {
      teacher();
      requireThat(
        action.name.trim() && action.name.length <= 160,
        "Enter a circle name of up to 160 characters.",
      );
      requireThat(
        validDate(action.startAt) &&
          validDate(action.endAt) &&
          Date.parse(action.startAt) < Date.parse(action.endAt) &&
          Date.parse(action.endAt) > +now,
        "Choose a valid upcoming circle date range.",
      );
      requireThat(
        Number.isInteger(action.capacity) &&
          action.capacity >= 1 &&
          action.capacity <= 1000,
        "Capacity must be between 1 and 1000.",
      );
      targetId = id("cohort");
      next.cohorts.push({
        id: targetId,
        orgId: actor.orgId,
        name: action.name.trim(),
        startAt: action.startAt,
        endAt: action.endAt,
        capacity: action.capacity,
        programIds: [],
      });
      break;
    }
    case "invite": {
      teacher();
      const circle = cohort(action.cohortId);
      requireThat(Date.parse(circle.endAt) > +now, "This circle has ended.");
      requireThat(
        action.recipientId.trim(),
        "A specific recipient is required.",
      );
      requireThat(
        !next.invitations.some(
          (i) =>
            i.orgId === actor.orgId &&
            i.cohortId === circle.id &&
            i.recipientId === action.recipientId.trim() &&
            !i.revoked &&
            !i.acceptedBy &&
            Date.parse(i.expiresAt) > +now,
        ),
        "A current invitation already exists for this recipient.",
      );
      targetId = id("invite");
      next.invitations.push({
        id: targetId,
        token: id("INVITE").toUpperCase(),
        orgId: actor.orgId,
        cohortId: circle.id,
        recipientId: action.recipientId.trim(),
        expiresAt: new Date(
          Math.min(+now + 7 * 86400000, Date.parse(circle.endAt)),
        ).toISOString(),
        revoked: false,
      });
      break;
    }
    case "revokeInvite": {
      teacher();
      const invite = next.invitations.find(
        (i) => i.id === action.invitationId && i.orgId === actor.orgId,
      );
      requireThat(invite, "Invitation not found.");
      requireThat(
        !invite.acceptedBy,
        "Accepted invitations cannot revoke membership.",
      );
      invite.revoked = true;
      targetId = invite.id;
      break;
    }
    case "logMinutes": {
      requireThat(
        has(actor, "teacher", "admin", "operator"),
        "Staff access is required.",
      );
      requireThat(
        Number.isFinite(action.minutes) &&
          action.minutes > 0 &&
          action.minutes <= 480,
        "Enter minutes between 1 and 480.",
      );
      next.support.push({
        orgId: actor.orgId,
        actorId: actor.id,
        minutes: action.minutes,
        kind: action.kind,
        at: stamp,
      });
      break;
    }
  }
  next.audit.push({
    at: stamp,
    actorId: actor.id,
    action: action.type,
    targetId,
    orgId: actor.orgId,
  });
  return next;
}
