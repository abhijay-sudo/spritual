import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import "./teacher-real.css";

type Organization = { org_id: string; name: string; role: string };
type Circle = {
  cohort_id: string; org_id: string; org_name: string; circle_name: string;
  start_at: string; end_at: string; my_role: string;
};
type Candidate = {
  rendering_id: string; canonical_id: string; canonical_reference: string;
  work_title: string; content_kind: string; body: string; access_class: string;
  attribution_text: string | null; reviewer_name: string;
};
type QueueItem = {
  release_id: string; release_at: string; withdrawn_at: string | null;
  rendering_id: string; canonical_reference: string; language_code: string;
  access_class: string; ready_now: boolean;
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isUuid = (value: unknown): value is string =>
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
const asCircle = (value: unknown): Circle | null => {
  if (!isObject(value) || !isUuid(value.cohort_id) || !isUuid(value.org_id) ||
    typeof value.org_name !== "string" || typeof value.circle_name !== "string" ||
    typeof value.start_at !== "string" || typeof value.end_at !== "string" ||
    typeof value.my_role !== "string") return null;
  return value as Circle;
};
const asCandidate = (value: unknown): Candidate | null => {
  if (!isObject(value) || !isUuid(value.rendering_id) ||
    typeof value.canonical_id !== "string" || typeof value.canonical_reference !== "string" ||
    typeof value.work_title !== "string" || typeof value.content_kind !== "string" ||
    typeof value.body !== "string" || typeof value.access_class !== "string" ||
    typeof value.reviewer_name !== "string") return null;
  return { ...value, attribution_text: typeof value.attribution_text === "string" ? value.attribution_text : null } as Candidate;
};
const asQueueItem = (value: unknown): QueueItem | null => {
  if (!isObject(value) || !isUuid(value.release_id) || !isUuid(value.rendering_id) ||
    typeof value.release_at !== "string" || typeof value.canonical_reference !== "string" ||
    typeof value.language_code !== "string" || typeof value.access_class !== "string" ||
    typeof value.ready_now !== "boolean") return null;
  return { ...value, withdrawn_at: typeof value.withdrawn_at === "string" ? value.withdrawn_at : null } as QueueItem;
};
function validRows<T>(data: unknown, parse: (value: unknown) => T | null): T[] {
  if (!Array.isArray(data)) throw new Error("The server returned an unexpected response.");
  const rows = data.map(parse);
  if (rows.some(row => row === null)) throw new Error("The server returned an unexpected response.");
  return rows as T[];
}
function readableError(error: unknown): string {
  if (error instanceof Error && error.message === "The server returned an unexpected response.") return error.message;
  if (isObject(error) && error.code === "42501") return "Your teacher access is no longer active. Refresh or contact your circle administrator.";
  if (isObject(error) && error.code === "23505") return "That reading is already scheduled for this circle. Refresh the queue.";
  if (isObject(error) && error.code === "23514") return "The circle dates or reading are no longer eligible. Review the details and refresh.";
  return "The server could not complete this action. Check your connection and try again.";
}
const when = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const dateToIso = (value: string) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new Error("Enter a valid date and time.");
  return date.toISOString();
};

export default function TeacherReal({ client }: { client: SupabaseClient }) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [query, setQuery] = useState("");
  const [selectedRendering, setSelectedRendering] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmWithdraw, setConfirmWithdraw] = useState("");
  const deliveryRequest = useRef(0);
  const selectedCircle = circles.find(circle => circle.cohort_id === selectedId);

  const loadCircles = useCallback(async () => {
    const [meResult, circlesResult] = await Promise.all([
      client.schema("app").rpc("fn_me"),
      client.schema("app").rpc("fn_my_circles"),
    ]);
    if (meResult.error) throw meResult.error;
    if (circlesResult.error) throw circlesResult.error;
    if (!isObject(meResult.data) || !Array.isArray(meResult.data.memberships))
      throw new Error("The server returned an unexpected response.");
    const orgs: Organization[] = meResult.data.memberships.flatMap((item: unknown) => {
      if (!isObject(item) || !isUuid(item.org_id) || typeof item.name !== "string" ||
          !["teacher", "admin"].includes(String(item.role))) return [];
      return [{ org_id: item.org_id, name: item.name, role: String(item.role) }];
    });
    const allCircles = validRows(circlesResult.data, asCircle)
      .filter(circle => orgs.some(org => org.org_id === circle.org_id));
    setOrganizations(orgs);
    setCircles(allCircles);
    setSelectedId(current => allCircles.some(circle => circle.cohort_id === current)
      ? current : (allCircles.find(circle => new Date(circle.end_at).getTime() > Date.now())?.cohort_id || ""));
  }, [client]);

  const loadDelivery = useCallback(async (cohortId: string, lang: "en" | "hi", search: string) => {
    const request = ++deliveryRequest.current;
    if (!cohortId) { setCandidates([]); setQueue([]); return; }
    const [candidatesResult, queueResult] = await Promise.all([
      client.schema("app").rpc("fn_teacher_release_candidates", {
        p_cohort_id: cohortId, p_language: lang, p_query: search.trim().slice(0, 160), p_limit: 30,
      }),
      client.schema("app").rpc("fn_circle_delivery_queue", { p_cohort_id: cohortId }),
    ]);
    if (candidatesResult.error) throw candidatesResult.error;
    if (queueResult.error) throw queueResult.error;
    const eligible = validRows(candidatesResult.data, asCandidate);
    if (request !== deliveryRequest.current) return;
    setCandidates(eligible);
    setQueue(validRows(queueResult.data, asQueueItem));
    setSelectedRendering(current => eligible.some(item => item.rendering_id === current) ? current : "");
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadCircles().catch(reason => { if (!cancelled) setError(readableError(reason)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [loadCircles]);
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    loadDelivery(selectedId, language, query).catch(reason => { if (!cancelled) setError(readableError(reason)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [selectedId, language, query, loadDelivery]);

  async function createCircle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await client.schema("app").rpc("fn_create_circle", {
        p_org_id: String(data.get("org_id")), p_name: String(data.get("name")).trim(),
        p_start_at: dateToIso(String(data.get("start_at"))),
        p_end_at: dateToIso(String(data.get("end_at"))),
        p_capacity: Number(data.get("capacity")),
      });
      if (result.error) throw result.error;
      if (!isUuid(result.data)) throw new Error("The server returned an unexpected response.");
      await loadCircles();
      setSelectedId(result.data);
      setNotice("Circle created. Only invited members who claim a seat can see its released readings.");
      form.reset();
    } catch (reason) { setError(readableError(reason)); }
    finally { setBusy(false); }
  }

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !selectedId || !selectedRendering) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true); setError(""); setNotice("");
    try {
      const time = String(data.get("release_at") || "");
      const result = await client.schema("app").rpc("fn_schedule_circle_reading", {
        p_cohort_id: selectedId, p_rendering_id: selectedRendering,
        p_release_at: time ? dateToIso(time) : null,
      });
      if (result.error) throw result.error;
      if (!isUuid(result.data)) throw new Error("The server returned an unexpected response.");
      await loadDelivery(selectedId, language, query);
      setNotice("Reading scheduled. Member access is checked again at delivery time.");
      form.reset();
    } catch (reason) { setError(readableError(reason)); }
    finally { setBusy(false); }
  }

  async function withdraw(releaseId: string) {
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const result = await client.schema("app").rpc("fn_withdraw_circle_reading", { p_release_id: releaseId });
      if (result.error) throw result.error;
      if (typeof result.data !== "boolean") throw new Error("The server returned an unexpected response.");
      await loadDelivery(selectedId, language, query);
      setNotice(result.data ? "Release withdrawn. It is no longer in the member feed." : "This release was already withdrawn.");
    } catch (reason) { setError(readableError(reason)); }
    finally { setBusy(false); setConfirmWithdraw(""); }
  }

  return <div className="teacher-real alpha-stack" lang="en">
    <header className="alpha-stack">
      <p className="alpha-kicker">Teacher delivery</p>
      <h1>Choose what reaches your circle.</h1>
      <p>Only already published, human-reviewed, rights-cleared readings can be selected. Scheduling does not approve content or grant paid access.</p>
    </header>
    {error && <p className="alpha-error" role="alert">{error} <button type="button" className="alpha-text-button" onClick={() => { setError(""); void loadCircles(); if (selectedId) void loadDelivery(selectedId, language, query); }}>Retry</button></p>}
    {notice && <p className="alpha-notice" role="status">{notice}</p>}
    {loading && <p role="status">Checking circle access and available readings…</p>}
    {!loading && organizations.length === 0 && <section className="alpha-panel alpha-stack">
      <h2>No teacher access is assigned</h2>
      <p>Your authenticated account has no active teacher or administrator membership. An operator must provision this role; local demo identities do not apply here.</p>
    </section>}
    {organizations.length > 0 && <>
      <section className="alpha-panel alpha-stack" aria-labelledby="teacher-circles-heading">
        <h2 id="teacher-circles-heading">Your circles</h2>
        {circles.length > 0 && <label className="alpha-field">Circle
          <select value={selectedId} onChange={event => setSelectedId(event.target.value)}>
            <option value="">Select a circle</option>
            {circles.map(circle => <option key={circle.cohort_id} value={circle.cohort_id}>{circle.circle_name} · {circle.org_name}</option>)}
          </select>
        </label>}
        {circles.length === 0 && <p>No circle has been created for your organization yet.</p>}
        <details><summary>Create a circle</summary>
          <form className="alpha-stack teacher-real-form" onSubmit={createCircle}>
            <label className="alpha-field">Organization<select name="org_id" required>{organizations.map(org => <option key={org.org_id} value={org.org_id}>{org.name}</option>)}</select></label>
            <label className="alpha-field">Circle name<input name="name" required minLength={1} maxLength={160} autoComplete="off" /></label>
            <div className="teacher-real-dates">
              <label className="alpha-field">Starts<input name="start_at" type="datetime-local" required /></label>
              <label className="alpha-field">Ends<input name="end_at" type="datetime-local" required /></label>
            </div>
            <label className="alpha-field">Maximum seats<input name="capacity" type="number" min={1} max={500} defaultValue={1} required /></label>
            <p className="alpha-muted">This cannot exceed your organization's seat limit. Creating a circle does not email invitations or enroll anyone.</p>
            <button type="submit" className="alpha-button" disabled={busy}>{busy ? "Creating…" : "Create circle"}</button>
          </form>
        </details>
      </section>
      {selectedCircle && <>
        <section className="alpha-panel alpha-stack" aria-labelledby="teacher-reading-heading">
          <h2 id="teacher-reading-heading">Available readings</h2>
          <p className="alpha-muted">{selectedCircle.circle_name} · {when(selectedCircle.start_at)} to {when(selectedCircle.end_at)}</p>
          <div className="teacher-real-filters">
            <label className="alpha-field">Language<select value={language} onChange={event => setLanguage(event.target.value as "en" | "hi")}><option value="en">English</option><option value="hi">हिन्दी</option></select></label>
            <label className="alpha-field">Find a reference or topic<input value={query} onChange={event => setQuery(event.target.value)} maxLength={160} placeholder="Gita 2.47" /></label>
          </div>
          {candidates.length === 0 && !loading && <p>No eligible readings are available in this language. A named editorial review, current redistribution rights and publication must be completed outside this workspace before any text appears here.</p>}
          {candidates.length > 0 && <form className="alpha-stack" onSubmit={schedule}>
            <fieldset className="teacher-real-choices"><legend>Select the exact reading</legend>
              {candidates.map(item => <label key={item.rendering_id} className="teacher-real-choice">
                <input type="radio" name="rendering" checked={selectedRendering === item.rendering_id} onChange={() => setSelectedRendering(item.rendering_id)} />
                <span><strong>{item.work_title} · {item.canonical_reference}</strong><small>{item.content_kind.replaceAll("_", " ")} · {item.access_class} · reviewed by {item.reviewer_name}</small><span className="teacher-real-excerpt">{item.body}</span>{item.attribution_text && <small>{item.attribution_text}</small>}</span>
              </label>)}
            </fieldset>
            <label className="alpha-field">Release time (optional)<input name="release_at" type="datetime-local" /></label>
            <p className="alpha-muted">Leave the time empty to release now, or at the circle start if it is later. The server will reject a time outside the circle dates.</p>
            <button className="alpha-button" type="submit" disabled={busy || !selectedRendering}>{busy ? "Working…" : "Schedule selected reading"}</button>
          </form>}
        </section>
        <section className="alpha-panel alpha-stack" aria-labelledby="teacher-queue-heading">
          <h2 id="teacher-queue-heading">Delivery queue</h2>
          {queue.length === 0 && <p>No reading has been scheduled for this circle.</p>}
          <ul className="teacher-real-queue">{queue.map(item => <li key={item.release_id}>
            <div><strong>{item.canonical_reference}</strong><span>{item.language_code} · {item.access_class} · {when(item.release_at)}</span><span>{item.withdrawn_at ? "Withdrawn" : item.ready_now ? "Ready under current rights and review" : "Unavailable: rights or review changed"}</span></div>
            {!item.withdrawn_at && (confirmWithdraw === item.release_id ? <div className="teacher-real-confirm"><span>Withdraw this release from the member feed?</span><button type="button" disabled={busy} onClick={() => void withdraw(item.release_id)}>Confirm withdrawal</button><button type="button" onClick={() => setConfirmWithdraw("")}>Keep release</button></div> : <button type="button" onClick={() => setConfirmWithdraw(item.release_id)}>Withdraw</button>)}
          </li>)}</ul>
        </section>
      </>}
    </>}
  </div>;
}
