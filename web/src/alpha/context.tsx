import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { actors, createSeed } from "./fixtures";
import { transition, visibleContents } from "./domain";
import { isPrivateAlphaStorageKey, parseAlphaState } from "./storage";
import type { Action, Actor, AlphaState } from "./types";
const key = "spritual_alpha_demo_v1";
function read(): AlphaState {
  const raw = localStorage.getItem(key);
  if (!raw) return createSeed();
  return parseAlphaState(raw);
}
function initial() {
  try {
    return { state: read(), error: "" };
  } catch (e) {
    return {
      state: createSeed(),
      error: e instanceof Error ? e.message : "Local storage is unavailable.",
    };
  }
}
type Preferences = {
  timeZone: string;
  reminder: boolean;
  large: boolean;
  reduced: boolean;
  appearance: "light" | "dusk" | "night" | "system";
};
const defaultPrefs: Preferences = {
  timeZone: "Asia/Kolkata",
  reminder: false,
  large: false,
  reduced: false,
  appearance: "light",
};
interface Context {
  state: AlphaState;
  actor: Actor;
  dispatch: (a: Action) => boolean;
  error: string;
  notice: string;
  switchActor: (id: string) => void;
  prefs: Preferences;
  setPrefs: (p: Preferences) => void;
  drafts: Record<string, string>;
  setDraft: (id: string, value: string) => void;
  localNotice: (s: string) => void;
  clearPersonal: () => boolean;
}
const AlphaContext = createContext<Context | null>(null);
export function AlphaProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(initial);
  const [state, setState] = useState(boot.state);
  const current = useRef(state);
  current.current = state;
  const [error, setError] = useState(boot.error);
  const [notice, setNotice] = useState("");
  const [blocked, setBlocked] = useState(!!boot.error);
  const [actorId, setActorId] = useState(() => {
    try {
      return sessionStorage.getItem("spritual_alpha_actor") || "demo-member";
    } catch {
      return "demo-member";
    }
  });
  const actor = actors.find((a) => a.id === actorId) || actors[0];
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [prefs, setPreferences] = useState<Preferences>(defaultPrefs);
  useEffect(() => {
    try {
      const p = JSON.parse(
        localStorage.getItem(`spritual_alpha_preferences_${actor.id}`) ||
          "null",
      );
      setPreferences(
        p
          ? {
              ...defaultPrefs,
              timeZone: [
                "Asia/Kolkata",
                "Europe/London",
                "America/New_York",
                "UTC",
              ].includes(p.timeZone)
                ? p.timeZone
                : defaultPrefs.timeZone,
              reminder: p.reminder === true,
              large: p.large === true,
              reduced: p.reduced === true,
              appearance: ["light", "dusk", "night", "system"].includes(p.appearance)
                ? p.appearance
                : defaultPrefs.appearance,
            }
          : defaultPrefs,
      );
    } catch {
      setPreferences(defaultPrefs);
    }
  }, [actor.id]);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key !== key) return;
      try {
        const next = read();
        current.current = next;
        setState(next);
        setBlocked(false);
        setError("");
      } catch {
        setBlocked(true);
        setError(
          "Another tab changed the saved data into an unreadable state. Changes are blocked to protect it.",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  // Cached media is disposable. Reconcile against current membership, rights and publication.
  useEffect(() => {
    if (!("caches" in window)) return;
    const reconcile = async () => {
      const allowed = new Set(state.memberships.filter(m => m.userId === actor.id)
        .flatMap(m => visibleContents(state, actor, m.cohortId))
        .map(c => new URL(`/alpha-media/${c.id}-v${c.version}`, location.origin).href));
      const name = `spritual-alpha-media-${actor.id}`;
      if (!(await caches.has(name))) return;
      const cache = await caches.open(name);
      for (const request of await cache.keys()) {
        const response = await cache.match(request);
        const until = Number(response?.headers.get("x-alpha-valid-until"));
        if (!allowed.has(request.url) || !Number.isFinite(until) || until <= Date.now())
          await cache.delete(request);
      }
    };
    const run = () => { void reconcile().catch(() => setError("Offline audio cleanup failed. Remove downloads before sharing this browser.")); };
    run();
    const timer = setInterval(run, 15000);
    window.addEventListener("online", run);
    return () => { clearInterval(timer); window.removeEventListener("online", run); };
  }, [state, actor]);
  const dispatch = useCallback(
    (action: Action) => {
      if (blocked) {
        setError(
          "Saved alpha data is unavailable. Export or repair it before making changes.",
        );
        return false;
      }
      try {
        const latest = read();
        const next = transition(latest, actor, action);
        localStorage.setItem(key, JSON.stringify(next));
        current.current = next;
        setState(next);
        setError("");
        setNotice(
          action.type === "join"
            ? "Invitation accepted. Demo access is included."
            : action.type === "leaveCommunity"
              ? "Community records removed on this device."
            : "Saved on this device.",
        );
        return true;
      } catch (e) {
        setNotice("");
        setError(
          e instanceof Error ? e.message : "Could not save. Please try again.",
        );
        return false;
      }
    },
    [actor, blocked],
  );
  const switchActor = (id: string) => {
    if (!actors.some((a) => a.id === id)) return;
    if ("caches" in window)
      caches
        .delete(`spritual-alpha-media-${actor.id}`)
        .catch(() =>
          setError(
            "Could not clear the previous demo identity’s offline audio. Use account cleanup before sharing this browser.",
          ),
        );
    setActorId(id);
    setNotice("Demo identity changed. This is not authentication.");
    setError(boot.error);
    try {
      sessionStorage.setItem("spritual_alpha_actor", id);
    } catch {
      setNotice("Demo identity changed for this visit only.");
    }
  };
  const setPrefs = (p: Preferences) => {
    try {
      localStorage.setItem(
        `spritual_alpha_preferences_${actor.id}`,
        JSON.stringify(p),
      );
      setPreferences(p);
      setNotice("Preferences saved.");
    } catch {
      setError("Preferences could not be saved.");
    }
  };
  const clearPersonal = () => {
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)!;
        if (isPrivateAlphaStorageKey(k, actor.id))
          localStorage.removeItem(k);
      }
      setDrafts((d) =>
        Object.fromEntries(
          Object.entries(d).filter(([k]) => !k.startsWith(actor.id + ":")),
        ),
      );
      setPreferences(defaultPrefs);
      window.dispatchEvent(new CustomEvent("spritual-alpha-wisdom-reset", { detail: { actorId: actor.id } }));
      window.dispatchEvent(new Event("spritual-alpha-language"));
      setNotice(
        "This demo identity’s private notes, reading actions, japa count, read marks, playback positions and preferences were removed. Shared demo records are handled separately below.",
      );
      return true;
    } catch {
      setError(
        "Some local data could not be removed. Retry or use browser site-data controls.",
      );
      return false;
    }
  };
  return (
    <AlphaContext.Provider
      value={{
        state,
        actor,
        dispatch,
        error,
        notice,
        switchActor,
        prefs,
        setPrefs,
        drafts,
        setDraft: (id, v) => setDrafts((d) => ({ ...d, [id]: v })),
        localNotice: setNotice,
        clearPersonal,
      }}
    >
      {children}
    </AlphaContext.Provider>
  );
}
export function useAlpha() {
  const value = useContext(AlphaContext);
  if (!value) throw Error("AlphaProvider missing");
  return value;
}
