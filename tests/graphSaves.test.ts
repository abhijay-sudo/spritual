import test from "node:test";
import assert from "node:assert/strict";
import { graphSaveKey, parseGraphSaves, toggleGraphSave } from "../web/src/alpha/graphSaveStore.ts";

test("graph saves are actor-scoped and an invalid ID cannot be persisted", () => {
  const values = new Map<string,string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  assert.deepEqual(toggleGraphSave(storage, "member-a", "entity:hanuman"), ["entity:hanuman"]);
  assert.equal(values.get(graphSaveKey("member-b")), undefined);
  assert.deepEqual(toggleGraphSave(storage, "member-a", "entity:hanuman"), []);
  assert.throws(() => toggleGraphSave(storage, "member-a", "entity:unpublished"), /Unknown item/);
});

test("corrupt saved data fails closed without overwriting it", () => {
  const raw = '{"schema":1,"ids":["entity:hanuman","entity:hanuman"]}';
  assert.throws(() => parseGraphSaves(raw), /cannot be read/);
  const storage = { getItem: () => raw, setItem: () => { throw Error("must not overwrite"); } };
  assert.throws(() => toggleGraphSave(storage, "member-a", "entity:krishna"), /cannot be read/);
});
