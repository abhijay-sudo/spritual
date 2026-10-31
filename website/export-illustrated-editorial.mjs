import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { glossary, pick } from './stories.mjs';
import { editionStories as stories, editionCharacters as characters } from './illustrated-chapters.mjs';
import { ILLUSTRATED_EDITION_REVISION, sourceMaps, storyArt } from './illustrated-edition.mjs';

const out = resolve(import.meta.dirname, '../artifacts/illustrated-edition');
await mkdir(out, { recursive: true });

const draft = [`# Spritual — The Illustrated Edition: bilingual editorial packet`, '',
  `Exact local-review version: \`${ILLUSTRATED_EDITION_REVISION}\``, '',
  '> LOCAL EDITORIAL DRAFT. This file is not a publication approval, translation, scripture edition, or rights clearance. It collates ten existing reviewed public retellings, twelve new connecting drafts, illustrated-edition framing and expanded source maps so a named human editor can review the exact package.', '',
  '## Review instructions', '',
  '- Review English and Hindi separately for meaning, register, age suitability and unwanted doctrinal inference.',
  '- Compare every source-map claim to the linked locator. A linked modern rendering is a provenance witness only; its prose is not licensed for republication here.',
  '- Review every painting at 1280 px for iconography, anatomy, identity continuity, crop and source-episode fit.',
  '- Record approval against this exact version only. Do not inherit the prior public-corpus review for new art, captions, bridges or source-map language.', ''
];

for (const story of stories) {
  const art = storyArt[story.id];
  draft.push(`## ${String(story.order).padStart(2, '0')} — ${story.title.en} / ${story.title.hi}`, '',
    `- Source position: ${story.book.en} / ${story.book.hi}, sarga ${story.sarga}`,
    `- Editorial state: ${story.editionOnly?'new bilingual connecting chapter; all wording pending named exact-version review':'existing public retelling retains its owner-recorded review; illustrated framing pending exact-version review'}`,
    `- Painting: \`${art.file}\` — ${art.alt.en} / ${art.alt.hi}`,
    `- Narrative plates: ${art.scenes.length?art.scenes.map(scene => `\`${scene.file}\` — ${scene.alt.en} / ${scene.alt.hi}`).join('; '):'None beyond the unique chapter opener in this draft'}`,
    `- Adaptation boundary: ${story.editorial.note.en}`, '',
    `### English draft`, '', `**Deck.** ${story.dek.en}`, '');
  for (const scene of story.scenes) {
    draft.push(`#### ${pick(scene.title, 'en')}`, '', ...scene.blocks.map(block => pick(block.text, 'en')), '');
  }
  draft.push(`**Reflection — not source text.** ${story.reflection.en}`, '', `### हिन्दी प्रारूप`, '', `**परिचय।** ${story.dek.hi}`, '');
  for (const scene of story.scenes) {
    draft.push(`#### ${pick(scene.title, 'hi')}`, '', ...scene.blocks.map(block => pick(block.text, 'hi')), '');
  }
  draft.push(`**मनन — स्रोत-पाठ नहीं।** ${story.reflection.hi}`, '', `### Expanded source map`, '');
  for (const entry of sourceMaps[story.id]) draft.push(`- [${entry.label}](${entry.url}) — ${entry.note.en} / ${entry.note.hi}`);
  draft.push('', `### Context labels used`, '',
    `- People: ${story.characters.map(id => `${characters[id].name.en} / ${characters[id].name.hi}`).join('; ')}`,
    `- Terms: ${[...new Set(story.scenes.flatMap(scene => scene.terms))].map(id => `${glossary[id].term.en} / ${glossary[id].term.hi}`).join('; ') || 'None'}`, '', '---', '');
}

const matrix = [`# Illustrated Edition review matrix`, '',
  `Exact local-review version: \`${ILLUSTRATED_EDITION_REVISION}\``, '',
  '| # | Story | Public retelling | New EN framing | New HI framing | Source map | Painting | Publication |',
  '|---:|---|---|---|---|---|---|---|',
  ...stories.map(story => `| ${story.order} | ${story.title.en} | ${story.editionOnly?'New local-only draft':'Existing owner-recorded review only'} | Pending named review | Pending named review | Locator checked; editorial approval pending | Local review only | Blocked |`), '',
  '## Package-wide blockers', '',
  '- No named human approval has been recorded for this exact illustrated-edition revision.',
  '- The 35 active generated paintings have provenance but no publication/right approval. Two earlier story-ten opener attempts are retained only as superseded local working files.',
  '- Expanded source-map wording and journey bridges require bilingual editorial review.',
  '- Linked source witnesses do not grant permission to republish their translation prose.',
  '- The ordinary public build therefore excludes all illustrated assets and journey routes.', ''
];

await writeFile(resolve(out, 'REVISED_DRAFTS_AND_SOURCE_MAPS.md'), draft.join('\n'));
await writeFile(resolve(out, 'EDITORIAL_MATRIX.md'), matrix.join('\n'));
console.log(`Wrote ${stories.length} bilingual chapter packets and the review matrix to ${out}`);
