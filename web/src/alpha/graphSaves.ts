import { useEffect, useState } from "react";
import { useAlpha } from "./context";
import { graphSaveKey, parseGraphSaves, toggleGraphSave } from "./graphSaveStore";

function read(actorId: string): { ids: readonly string[]; error: string } {
  try { return { ids: parseGraphSaves(localStorage.getItem(graphSaveKey(actorId))), error: "" }; }
  catch { return { ids: [], error: "Saved items are unavailable on this device. Existing data was not changed." }; }
}

export function useGraphSaves() {
  const { actor } = useAlpha();
  const [snapshot, setSnapshot] = useState(() => ({ actorId: actor.id, ...read(actor.id) }));
  const current = snapshot.actorId === actor.id ? snapshot : { actorId: actor.id, ...read(actor.id) };
  useEffect(() => {
    setSnapshot({ actorId: actor.id, ...read(actor.id) });
    const sync = (event: StorageEvent) => { if (event.key === graphSaveKey(actor.id)) setSnapshot({ actorId: actor.id, ...read(actor.id) }); };
    const reset = (event: Event) => { if ((event as CustomEvent<{ actorId: string }>).detail?.actorId === actor.id) setSnapshot({ actorId: actor.id, ...read(actor.id) }); };
    window.addEventListener("storage", sync);
    window.addEventListener("spritual-alpha-wisdom-reset", reset);
    return () => { window.removeEventListener("storage", sync); window.removeEventListener("spritual-alpha-wisdom-reset", reset); };
  }, [actor.id]);
  const toggle = (id: string): boolean => {
    if (current.error) return false;
    try { setSnapshot({ actorId: actor.id, ids: toggleGraphSave(localStorage, actor.id, id), error: "" }); return true; }
    catch { setSnapshot({ ...current, error: "Could not save on this device. Earlier items were left untouched." }); return false; }
  };
  return { ...current, toggle };
}
