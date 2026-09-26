import { graphEntities, graphStories } from "../../../packages/content/src/knowledgeGraph.ts";

const allowedIds = new Set([...graphEntities.map(entity => entity.id), ...graphStories.map(story => story.id)]);
export const graphSaveKey = (actorId: string) => `spritual_alpha_graph_saved_v1_${actorId}`;

/** Only known IDs and a version travel into local storage; no question or belief profile. */
export function parseGraphSaves(raw: string | null): readonly string[] {
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || Array.isArray(value) || !("schema" in value) || value.schema !== 1 || !("ids" in value) || !Array.isArray(value.ids) || value.ids.length > allowedIds.size || !value.ids.every(id => typeof id === "string" && allowedIds.has(id)) || new Set(value.ids).size !== value.ids.length) throw Error("Saved graph data cannot be read.");
  return value.ids;
}

export function toggleGraphSave(storage: Pick<Storage, "getItem" | "setItem">, actorId: string, id: string): readonly string[] {
  if (!allowedIds.has(id)) throw Error("Unknown item cannot be saved.");
  const key = graphSaveKey(actorId);
  const current = parseGraphSaves(storage.getItem(key));
  const next = current.includes(id) ? current.filter(item => item !== id) : [...current, id];
  storage.setItem(key, JSON.stringify({ schema: 1, ids: next }));
  return next;
}
