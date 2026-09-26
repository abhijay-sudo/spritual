import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAlpha } from "./context";
import { actors } from "./fixtures";
import type { Action, Content } from "./types";

const dateValue = (value: FormDataEntryValue | null) =>
  new Date(String(value)).toISOString();
const field = (form: FormData, name: string) =>
  String(form.get(name) || "").trim();
const displayDate = (value: string) => new Date(value).toLocaleString();

export default function Teacher() {
  const { state, actor, dispatch } = useAlpha();
  const [formError, setFormError] = useState("");
  const canManage = actor.roles.some((role) =>
    ["teacher", "reviewer", "admin", "operator"].includes(role),
  );
  const canAuthor = actor.roles.some((role) =>
    ["teacher", "admin"].includes(role),
  );
  const canReview = actor.roles.includes("reviewer");
  const canAdmin = actor.roles.includes("admin");
  const contents = state.contents.filter((item) => item.orgId === actor.orgId);
  const cohorts = state.cohorts.filter((item) => item.orgId === actor.orgId);
  const invitations = state.invitations.filter(
    (item) => item.orgId === actor.orgId,
  );
  const recipients = actors.filter(
    (item) => item.orgId === actor.orgId && item.roles.includes("member"),
  );

  function submit(
    event: FormEvent<HTMLFormElement>,
    action: (data: FormData) => Action,
  ) {
    event.preventDefault();
    setFormError("");
    const form = event.currentTarget;
    try {
      if (dispatch(action(new FormData(form)))) form.reset();
    } catch {
      setFormError(
        "Check the dates and required fields, then try again. Nothing was saved.",
      );
    }
  }

  function rightsForm(content: Content) {
    return (
      <form
        className="alpha-stack"
        onSubmit={(event) =>
          submit(event, (data) => ({
            type: "rights",
            contentId: content.id,
            language: field(data, "language"),
            territory: field(data, "territory"),
            expiresAt: dateValue(data.get("expiresAt")),
          }))
        }
      >
        <h3>Record permission details</h3>
        <p className="alpha-muted">
          This records a local demo attestation only. It does not establish a
          licence, teacher credential or permission to distribute real material.
        </p>
        <div className="alpha-grid">
          <label className="alpha-field">
            Language
            <input
              name="language"
              required
              maxLength={80}
              defaultValue={content.rights.language}
              placeholder="For example, English"
            />
          </label>
          <label className="alpha-field">
            Permitted territory
            <input
              name="territory"
              required
              maxLength={100}
              defaultValue={content.rights.territory}
              placeholder="Enter the documented territory"
            />
          </label>
          <label className="alpha-field">
            Permission expires
            <input type="datetime-local" name="expiresAt" required />
          </label>
        </div>
        <label className="alpha-row">
          <input type="checkbox" required /> I understand this is a demo
          attestation, not verified content rights.
        </label>
        <button className="alpha-secondary" type="submit">
          Save permission record
        </button>
      </form>
    );
  }

  if (!canManage)
    return (
      <section className="alpha-panel alpha-stack">
        <p className="alpha-kicker">Teacher workspace</p>
        <h1>This area is for delivery staff</h1>
        <p>
          Your selected demo member identity cannot manage content or
          invitations.
        </p>
        <Link className="alpha-button" to="/alpha/today">
          Return to my practice
        </Link>
      </section>
    );

  return (
    <div className="alpha-stack">
      <header className="alpha-stack">
        <p className="alpha-kicker">Delivery workspace · local alpha</p>
        <h1>A thoughtful practice, carefully delivered.</h1>
        <p>
          Prepare a lesson, record its permissions, review it, then release it
          to a cohort. Actions are attributed to the selected demo identity.
        </p>
        <p className="alpha-muted">
          Local role simulation is not authentication. No invitation is emailed
          and no external teacher approval is implied.
        </p>
      </header>
      {formError && (
        <p className="alpha-error" role="alert">
          {formError}
        </p>
      )}

      {canAuthor && (
        <section className="alpha-panel alpha-stack">
          <h2 className="alpha-section-heading">Prepare a lesson</h2>
          <form
            className="alpha-stack"
            onSubmit={(event) =>
              submit(event, (data) => ({
                type: "createContent",
                title: field(data, "title"),
                purpose: field(data, "purpose"),
                transcript: field(data, "transcript"),
              }))
            }
          >
            <label className="alpha-field">
              Lesson title
              <input name="title" required maxLength={120} />
            </label>
            <label className="alpha-field">
              Purpose for the member
              <input name="purpose" required maxLength={300} />
            </label>
            <label className="alpha-field">
              Practice transcript
              <textarea name="transcript" required rows={6} maxLength={12000} />
            </label>
            <p className="alpha-muted">
              Use your own original practice instructions for this alpha. Do not
              paste unlicensed scripture translations or recordings. New drafts
              have no human audio.
            </p>
            <button type="submit" className="alpha-button">
              Save draft
            </button>
          </form>
        </section>
      )}

      <section className="alpha-stack" aria-labelledby="content-heading">
        <h2 id="content-heading" className="alpha-section-heading">
          Lessons and review
        </h2>
        {!contents.length && (
          <p className="alpha-panel">
            No lessons yet. An author can create the first draft above.
          </p>
        )}
        {contents.map((content) => (
          <article className="alpha-panel alpha-stack" key={content.id}>
            <div className="alpha-row">
              <h3>{content.title}</h3>
              <span className="alpha-badge">
                Version {content.version} ·{" "}
                {content.status.replaceAll("_", " ")}
              </span>
            </div>
            <p>{content.purpose}</p>
            <details>
              <summary>Read transcript and provenance</summary>
              <p style={{ whiteSpace: "pre-wrap" }}>{content.transcript}</p>
              <p className="alpha-muted">
                Source: {content.source || "Author-entered local draft"}
              </p>
              <p className="alpha-muted">
                Audio:{" "}
                {content.audioUrl
                  ? "A recording is attached; its permissions still require review."
                  : "No recording. Silent practice only."}
              </p>
            </details>
            {content.rights.recorded && (
              <p className="alpha-muted">
                Permission record: {content.rights.language} ·{" "}
                {content.rights.territory} · expires{" "}
                {displayDate(content.rights.expiresAt)}. Demo attestation.
              </p>
            )}
            {content.approvedBy && (
              <p className="alpha-muted">
                Local review action by{" "}
                {actors.find((item) => item.id === content.approvedBy)?.name ||
                  content.approvedBy}
                {content.approvedAt
                  ? ` · ${displayDate(content.approvedAt)}`
                  : ""}
                . Not a verified teacher endorsement.
              </p>
            )}
            {canAuthor && content.status === "draft" && (
              <details>
                <summary>Edit draft</summary>
                <form
                  key={`${content.title}-${content.purpose}-${content.transcript}`}
                  className="alpha-stack"
                  onSubmit={(event) =>
                    submit(event, (data) => ({
                      type: "editContent",
                      contentId: content.id,
                      title: field(data, "title"),
                      purpose: field(data, "purpose"),
                      transcript: field(data, "transcript"),
                    }))
                  }
                >
                  <label className="alpha-field">
                    Title
                    <input
                      name="title"
                      required
                      maxLength={120}
                      defaultValue={content.title}
                    />
                  </label>
                  <label className="alpha-field">
                    Purpose
                    <input
                      name="purpose"
                      required
                      maxLength={300}
                      defaultValue={content.purpose}
                    />
                  </label>
                  <label className="alpha-field">
                    Transcript
                    <textarea
                      name="transcript"
                      required
                      rows={6}
                      maxLength={12000}
                      defaultValue={content.transcript}
                    />
                  </label>
                  <p className="alpha-muted">
                    Save your changes before recording permissions and sending
                    this version for review.
                  </p>
                  <button className="alpha-secondary">
                    Save draft changes
                  </button>
                </form>
              </details>
            )}
            {canAuthor && content.status === "draft" && (
              <>
                {rightsForm(content)}
                <button
                  className="alpha-button"
                  disabled={!content.rights.recorded}
                  onClick={() =>
                    dispatch({ type: "review", contentId: content.id })
                  }
                >
                  Send for review
                </button>
                {!content.rights.recorded && (
                  <p className="alpha-muted">
                    Record permission details before requesting review.
                  </p>
                )}
              </>
            )}
            {canReview && content.status === "awaiting_review" && (
              <button
                className="alpha-button"
                onClick={() =>
                  dispatch({ type: "approve", contentId: content.id })
                }
              >
                Record demo review approval
              </button>
            )}
            {canAuthor && content.status === "approved" && (
              <form
                className="alpha-stack"
                onSubmit={(event) =>
                  submit(event, (data) => ({
                    type: "publish",
                    contentId: content.id,
                    cohortId: field(data, "cohortId"),
                    releaseAt: dateValue(data.get("releaseAt")),
                  }))
                }
              >
                <label className="alpha-field">
                  Release to cohort
                  <select name="cohortId" required defaultValue="">
                    <option value="" disabled>
                      Choose a cohort
                    </option>
                    {cohorts.map((cohort) => (
                      <option key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="alpha-field">
                  Release date and time
                  <input type="datetime-local" name="releaseAt" required />
                </label>
                <p className="alpha-muted">
                  Times use this device’s time zone. Scheduling does not
                  override cohort access or permission expiry.
                </p>
                <button className="alpha-button" disabled={!cohorts.length}>
                  Publish to cohort
                </button>
                {!cohorts.length && <p>Create a cohort before publishing.</p>}
              </form>
            )}
            {content.status === "published" && (
              <p className="alpha-muted">
                Release: {displayDate(content.releaseAt)}
              </p>
            )}
            <div className="alpha-row">
              {canAuthor &&
                ["approved", "published", "withdrawn"].includes(
                  content.status,
                ) && (
                  <button
                    className="alpha-secondary"
                    onClick={() =>
                      dispatch({ type: "revise", contentId: content.id })
                    }
                  >
                    Create revision draft
                  </button>
                )}
              {canAuthor &&
                ["draft", "awaiting_review", "approved", "published"].includes(
                  content.status,
                ) && (
                  <button
                    className="alpha-secondary"
                    onClick={() =>
                      dispatch({ type: "withdraw", contentId: content.id })
                    }
                  >
                    Withdraw lesson
                  </button>
                )}
            </div>
          </article>
        ))}
      </section>

      {canAdmin && (
        <section className="alpha-panel alpha-stack">
          <h2 className="alpha-section-heading">Create a cohort</h2>
          <form
            className="alpha-stack"
            onSubmit={(event) =>
              submit(event, (data) => ({
                type: "createCohort",
                name: field(data, "name"),
                startAt: dateValue(data.get("startAt")),
                endAt: dateValue(data.get("endAt")),
                capacity: Number(data.get("capacity")),
              }))
            }
          >
            <label className="alpha-field">
              Cohort name
              <input name="name" required maxLength={100} />
            </label>
            <div className="alpha-grid">
              <label className="alpha-field">
                Starts
                <input name="startAt" type="datetime-local" required />
              </label>
              <label className="alpha-field">
                Ends
                <input name="endAt" type="datetime-local" required />
              </label>
              <label className="alpha-field">
                Member capacity
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  max={500}
                  required
                />
              </label>
            </div>
            <button className="alpha-button">Create cohort</button>
          </form>
        </section>
      )}

      <section className="alpha-stack" aria-labelledby="cohort-heading">
        <h2 id="cohort-heading">Cohorts</h2>
        {!cohorts.length && (
          <p className="alpha-panel">
            No cohorts yet. An administrator can create one.
          </p>
        )}
        {cohorts.map((cohort) => {
          const activeIds = new Set(
            state.grants
              .filter(
                (grant) =>
                  grant.orgId === actor.orgId &&
                  grant.cohortId === cohort.id &&
                  state.memberships.some(
                    (member) =>
                      member.orgId === actor.orgId &&
                      member.cohortId === cohort.id &&
                      member.userId === grant.userId,
                  ) &&
                  new Date(cohort.startAt).getTime() <= Date.now() &&
                  new Date(cohort.endAt).getTime() > Date.now() &&
                  ["active", "grace"].includes(grant.status) &&
                  new Date(grant.startsAt).getTime() <= Date.now() &&
                  new Date(grant.endsAt).getTime() > Date.now(),
              )
              .map((grant) => grant.userId),
          );
          const completions = state.completions.filter(
            (item) =>
              item.orgId === actor.orgId &&
              item.cohortId === cohort.id &&
              activeIds.has(item.userId),
          );
          return (
            <article className="alpha-panel alpha-stack" key={cohort.id}>
              <h3>{cohort.name}</h3>
              <p className="alpha-muted">
                {displayDate(cohort.startAt)} – {displayDate(cohort.endAt)} ·
                Capacity {cohort.capacity}
              </p>
              <p>
                {activeIds.size >= 5
                  ? `${activeIds.size} active members · ${completions.length} recorded practices. Completion does not establish understanding.`
                  : "Practice aggregates are hidden for cohorts with fewer than five active members."}
              </p>
              <p className="alpha-muted">
                Private reflections are never shown here.
              </p>
              {canAdmin && (
                <form
                  className="alpha-stack"
                  onSubmit={(event) =>
                    submit(event, (data) => ({
                      type: "invite",
                      cohortId: cohort.id,
                      recipientId: field(data, "recipientId"),
                    }))
                  }
                >
                  <label className="alpha-field">
                    Invite a demo member
                    <select name="recipientId" required defaultValue="">
                      <option value="" disabled>
                        Select a recipient
                      </option>
                      {recipients.map((recipient) => (
                        <option key={recipient.id} value={recipient.id}>
                          {recipient.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="alpha-secondary">
                    Create local invitation
                  </button>
                  <p className="alpha-muted">
                    This creates a recipient-bound link on this browser. Nothing
                    is sent.
                  </p>
                </form>
              )}
              {canAdmin &&
                invitations
                  .filter((invitation) => invitation.cohortId === cohort.id)
                  .map((invitation) => (
                    <div className="alpha-stack" key={invitation.id}>
                      <p>
                        {actors.find(
                          (item) => item.id === invitation.recipientId,
                        )?.name || "Demo recipient"}{" "}
                        ·{" "}
                        {invitation.revoked
                          ? "Revoked"
                          : invitation.acceptedBy
                            ? "Accepted"
                            : new Date(invitation.expiresAt).getTime() <=
                                Date.now()
                              ? "Expired"
                              : "Pending"}
                      </p>
                      {!invitation.revoked &&
                        !invitation.acceptedBy &&
                        new Date(invitation.expiresAt).getTime() >
                          Date.now() && (
                          <>
                            <Link
                              to={`/alpha/join?code=${encodeURIComponent(invitation.token)}`}
                            >
                              Open local invitation
                            </Link>
                            <button
                              className="alpha-secondary"
                              onClick={() =>
                                dispatch({
                                  type: "revokeInvite",
                                  invitationId: invitation.id,
                                })
                              }
                            >
                              Revoke invitation
                            </button>
                          </>
                        )}
                    </div>
                  ))}
            </article>
          );
        })}
      </section>

      <section className="alpha-panel alpha-stack">
        <h2>Delivery effort</h2>
        <form
          className="alpha-stack"
          onSubmit={(event) =>
            submit(event, (data) => ({
              type: "logMinutes",
              kind: field(data, "kind") as "delivery" | "support",
              minutes: Number(data.get("minutes")),
            }))
          }
        >
          <div className="alpha-grid">
            <label className="alpha-field">
              Work type
              <select name="kind">
                <option value="delivery">Delivery</option>
                <option value="support">Support</option>
              </select>
            </label>
            <label className="alpha-field">
              Minutes
              <input name="minutes" type="number" min={1} max={1440} required />
            </label>
          </div>
          <button className="alpha-secondary">Record time</button>
        </form>
        <p className="alpha-muted">
          Recorded locally:{" "}
          {state.support
            .filter((item) => item.orgId === actor.orgId)
            .reduce((sum, item) => sum + item.minutes, 0)}{" "}
          minutes. No member notes or personal concerns are collected.
        </p>
      </section>
      <section className="alpha-panel alpha-stack">
        <h2>Local action history</h2>
        <p className="alpha-muted">
          A browser record for testing this workflow; not a secure compliance
          audit.
        </p>
        {!state.audit.some((item) => item.orgId === actor.orgId) ? (
          <p>No recorded actions yet.</p>
        ) : (
          <ol className="alpha-stack">
            {state.audit
              .filter((item) => item.orgId === actor.orgId)
              .slice(-15)
              .reverse()
              .map((item, index) => (
                <li key={`${item.at}-${index}`}>
                  <strong>
                    {actors.find((person) => person.id === item.actorId)
                      ?.name || "Demo actor"}
                  </strong>{" "}
                  · {item.action} ·{" "}
                  <time dateTime={item.at}>{displayDate(item.at)}</time>
                </li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}
