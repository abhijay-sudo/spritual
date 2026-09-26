import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  defaultState,
  loadState,
  persistState,
  serializeState,
  hasUnsavedReflectionDraft,
  pruneReflectionDrafts,
  STORAGE_KEY,
  type LocalState,
  type ReflectionDraft,
  type ReflectionDrafts,
} from "./lib/localStore";
import { isNativeApp } from "./lib/platform";
import { platformCopy } from "./lib/platformCopy";

interface AppContextValue {
  state: LocalState;
  setState: Dispatch<SetStateAction<LocalState>>;
  updateState: (updater: (state: LocalState) => LocalState) => boolean;
  t: (english: string, hindi: string) => string;
  notice: string;
  notify: (message: string) => void;
  storageAvailable: boolean;
  externalRevision: number;
  drafts: ReflectionDrafts;
  setDraft: (completionId: string, draft: ReflectionDraft) => void;
  clearDraft: (completionId: string) => void;
}

interface StoredSnapshot {
  state: LocalState;
  serialized: string | null;
  readable: boolean;
}

function readStoredSnapshot(): StoredSnapshot {
  try {
    if (typeof window === "undefined")
      throw new Error("Browser storage unavailable");
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    // Validate the exact snapshot read, without a second read racing its validation.
    const state = loadState({ getItem: () => serialized, setItem: () => {} });
    return { state, serialized, readable: true };
  } catch {
    return { state: defaultState(), serialized: null, readable: false };
  }
}

const AppContext = createContext<AppContextValue | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(readStoredSnapshot);
  const [state, setReactState] = useState(initial.state);
  const stateRef = useRef(initial.state);
  const serializedRef = useRef(initial.serialized);
  const availableRef = useRef(initial.readable);
  const [storageAvailable, setStorageAvailable] = useState(initial.readable);
  const [notice, setNotice] = useState("");
  const [externalRevision, setExternalRevision] = useState(0);
  const [drafts, setDrafts] = useState<ReflectionDrafts>({});
  const draftsRef = useRef(drafts);
  const hasUnsavedDraft = hasUnsavedReflectionDraft(drafts);
  const retainDrafts = useCallback((next: LocalState) => {
    const retained = pruneReflectionDrafts(draftsRef.current, next.completions);
    if (retained === draftsRef.current) return;
    draftsRef.current = retained;
    setDrafts(retained);
  }, []);
  const setDraft = useCallback(
    (completionId: string, draft: ReflectionDraft) => {
      if (
        !stateRef.current.completions.some((item) => item.id === completionId)
      )
        return;
      const next = { ...draftsRef.current, [completionId]: { ...draft } };
      draftsRef.current = next;
      setDrafts(next);
    },
    [],
  );
  const clearDraft = useCallback((completionId: string) => {
    if (!Object.hasOwn(draftsRef.current, completionId)) return;
    const next = { ...draftsRef.current };
    delete next[completionId];
    draftsRef.current = next;
    setDrafts(next);
  }, []);

  const updateState = useCallback(
    (updater: (state: LocalState) => LocalState): boolean => {
      let snapshot = readStoredSnapshot();
      // A failed save stays in memory. A newer external snapshot takes precedence,
      // so another tab's deletion cannot be restored by an old timer snapshot.
      const useStored =
        snapshot.readable &&
        (availableRef.current || snapshot.serialized !== serializedRef.current);
      let next = updater(useStored ? snapshot.state : stateRef.current);
      const latest = readStoredSnapshot();
      if (
        latest.readable &&
        snapshot.readable &&
        latest.serialized !== snapshot.serialized
      ) {
        snapshot = latest;
        next = updater(latest.state);
      }
      // This narrows stale writes; localStorage cannot make cross-tab read/write atomic.
      if (snapshot.readable && snapshot.serialized !== serializedRef.current)
        setExternalRevision((revision) => revision + 1);
      const saved = persistState(next);
      stateRef.current = next;
      if (saved) serializedRef.current = serializeState(next);
      else if (snapshot.readable) serializedRef.current = snapshot.serialized;
      availableRef.current = saved;
      setReactState(next);
      retainDrafts(next);
      setStorageAvailable(saved);
      return saved;
    },
    [retainDrafts],
  );

  const setState = useCallback<Dispatch<SetStateAction<LocalState>>>(
    (action) => {
      updateState((current) =>
        typeof action === "function" ? action(current) : action,
      );
    },
    [updateState],
  );

  useEffect(() => {
    const synchronize = () => {
      const snapshot = readStoredSnapshot();
      if (!snapshot.readable) {
        availableRef.current = false;
        setStorageAvailable(false);
        return;
      }
      if (snapshot.serialized === serializedRef.current) return;
      serializedRef.current = snapshot.serialized;
      stateRef.current = snapshot.state;
      setReactState(snapshot.state);
      retainDrafts(snapshot.state);
      setExternalRevision((revision) => revision + 1);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY && event.key !== null) return;
      try {
        if (event.storageArea && event.storageArea !== window.localStorage)
          return;
      } catch {
        return;
      }
      // Event payloads may already be stale when multiple tabs are writing.
      synchronize();
    };
    window.addEventListener("storage", onStorage);
    synchronize();
    return () => window.removeEventListener("storage", onStorage);
  }, [retainDrafts]);
  useEffect(() => {
    if (!hasUnsavedDraft) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedReflectionDraft(draftsRef.current)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasUnsavedDraft]);
  useLayoutEffect(() => {
    document.documentElement.lang = state.language;
    document.documentElement.dataset.textSize = state.textSize;
    document.documentElement.dataset.motion = state.motion ?? "system";
    document.documentElement.dataset.readingTheme =
      state.readingTheme ?? "paper";
  }, [state.language, state.textSize, state.motion, state.readingTheme]);
  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);
  const notify = useCallback((message: string) => setNotice(message), []);
  const t = (english: string, hindi: string) => {
    const [en, hi] = platformCopy(english, hindi, isNativeApp);
    return state.language === "hi" ? hi : en;
  };
  return (
    <AppContext.Provider
      value={{
        state,
        setState,
        updateState,
        t,
        notice,
        notify,
        storageAvailable,
        externalRevision,
        drafts,
        setDraft,
        clearDraft,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider is required");
  return value;
}
