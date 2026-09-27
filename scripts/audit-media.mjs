import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { graphEntities, graphStories, graphWorks } from "../packages/content/src/knowledgeGraph.ts";
import { entityMedia, storyMedia, workMedia } from "../web/src/alpha/mediaRelations.ts";

const media = JSON.parse(await readFile(new URL("../web/src/alpha/mediaManifest.json", import.meta.url), "utf8"));
const root = resolve("web/public");
const errors = [];
const warnings = [];
const used = new Set([...Object.values(entityMedia), ...Object.values(storyMedia), ...Object.values(workMedia), "river", "hanumanSea"]);

for (const [kind, records, mapping] of [
  ["entity", graphEntities, entityMedia],
  ["story", graphStories, storyMedia],
  ["work", graphWorks.filter(work => work.slug !== "shvetashvatara"), workMedia],
]) {
  for (const record of records) if (!mapping[record.id]) errors.push(`${kind} ${record.id} needs an editorial image`);
}

for (const [id, item] of Object.entries(media)) {
  if (!used.has(id) && id !== "gitaChariot") warnings.push(`${id} is not used by a current graph relation`);
  if (!item.alt?.en || !item.alt?.hi || !item.origin || !item.focal || !item.fallback) errors.push(`${id}: missing alt/provenance/focal/fallback metadata`);
  if (!Number.isInteger(item.width) || !Number.isInteger(item.height)) errors.push(`${id}: missing dimensions`);
  if (item.rights !== "verified" || item.review !== "approved") warnings.push(`${id}: preview only; rights or human review pending`);
  if (process.argv.includes("--release") && (item.rights !== "verified" || item.review !== "approved")) errors.push(`${id}: release blocked until rights and named human review are recorded`);
  for (const key of ["src", "small"]) {
    const url = item[key];
    if (typeof url !== "string" || !/^\/art\/[a-z0-9-]+\.webp$/.test(url)) { errors.push(`${id}.${key}: must use a local versioned WebP`); continue; }
    const path = resolve(root, `.${url}`);
    try {
      const [file, info] = await Promise.all([stat(path), sharp(path).metadata()]);
      if (file.size > 450_000) errors.push(`${id}.${key}: ${file.size} bytes exceeds 450 KB asset budget`);
      if (info.format !== "webp") errors.push(`${id}.${key}: not WebP`);
      const expected = key === "src" ? item.width : Math.min(480, item.width);
      if (info.width !== expected) errors.push(`${id}.${key}: width ${info.width}, expected ${expected}`);
      if (key === "src" && info.height !== item.height) errors.push(`${id}.${key}: height does not match manifest`);
    } catch { errors.push(`${id}.${key}: missing or unreadable ${path}`); }
  }
}
for (const id of used) if (!media[id]) errors.push(`relation references unknown media ${id}`);
console.log(`Media audit: ${Object.keys(media).length} assets, ${graphEntities.length} entities, ${graphStories.length} stories, ${graphWorks.length} works.`);
for (const warning of warnings) console.log(`Preview: ${warning}`);
for (const error of errors) console.error(`ERROR: ${error}`);
if (errors.length) process.exitCode = 1;
