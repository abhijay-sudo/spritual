import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { stories, characters, valueLabels } from '../stories.mjs';
import { editionStories, editionCharacters } from '../illustrated-chapters.mjs';
import { journeys, sourceMaps, storyArt, searchText } from '../illustrated-edition.mjs';

const root = resolve(import.meta.dirname, '..');

test('the illustrated registry covers every story and every narrative plate with responsive local-review assets', async () => {
  assert.equal(stories.length, 10);
  assert.equal(editionStories.length, 22);
  assert.deepEqual(Object.keys(storyArt).sort(), editionStories.map(story => story.id).sort());
  for (const story of editionStories) {
    const record = storyArt[story.id];
    assert.equal(record.reviewState, 'local-review-only');
    assert.match(record.provenance, /OpenAI image generation/);
    assert(record.alt.en.length > 20 && record.alt.hi.length > 20);
    if (!story.editionOnly) assert(record.scenes.length >= 1, `${story.id} needs a purposeful narrative plate beyond its opener`);
    for (const file of [record.file, ...record.scenes.map(scene => scene.file)]) {
      for (const width of [640, 960, 1280]) await access(resolve(root, `assets/illustrated/${file}-${width}.jpg`));
    }
  }
  const assets = await readdir(resolve(root, 'assets/illustrated'));
  const activeFiles = new Set(Object.values(storyArt).flatMap(record => [record.file, ...record.scenes.map(scene => scene.file)]));
  assert.equal(activeFiles.size, 35);
  assert.equal(assets.filter(file => file.endsWith('.jpg') && [...activeFiles].some(name => file.startsWith(`${name}-`))).length, 105);
});

test('all twenty-two bilingual chapters contain substantive multi-scene narratives', () => {
  for (const story of editionStories) {
    assert(story.scenes.length >= 3, `${story.id} needs at least three narrative scenes`);
    const english = story.scenes.flatMap(scene => scene.blocks.map(block => block.text.en)).join(' ');
    const hindi = story.scenes.flatMap(scene => scene.blocks.map(block => block.text.hi)).join(' ');
    assert(english.split(/\s+/).length >= 135, `${story.id} English draft is too slight`);
    assert(hindi.split(/\s+/).length >= 130, `${story.id} Hindi draft is too slight`);
    assert(story.reflection.en.length > 30 && story.reflection.hi.length > 30);
  }
});

test('journeys have valid members, no cycles and explicit finite endings', () => {
  assert.deepEqual(Object.keys(journeys), ['ramayana', 'hanuman', 'together']);
  assert.deepEqual(journeys.hanuman.storyIds, ['hanumans-first-conversation', 'across-the-ocean', 'a-ring-brings-hope']);
  assert.deepEqual(journeys.together.storyIds, ['a-friend-beside-the-ganga', 'bharata-and-the-sandals', 'shabaris-welcome']);
  for (const journey of Object.values(journeys)) {
    assert.equal(new Set(journey.storyIds).size, journey.storyIds.length);
    assert(journey.storyIds.every(id => editionStories.some(story => story.id === id)));
    assert.notEqual(journey.storyIds.at(-1), journey.storyIds[0]);
  }
});

test('expanded source maps cover all twenty-two chapters and keep sensitive distinctions explicit', () => {
  assert.deepEqual(Object.keys(sourceMaps).sort(), editionStories.map(story => story.id).sort());
  assert.equal(sourceMaps['a-ring-brings-hope'].length, 3);
  assert.match(sourceMaps['shabaris-welcome'][0].note.en, /tasted-fruit motif is not inserted/i);
  assert(sourceMaps['across-the-ocean'].every(entry => entry.url.startsWith('https://')));
  assert.match(editionStories.find(story => story.id === 'alliance-and-vali').editorial.note.en, /debate|dispute/i);
  assert.match(editionStories.find(story => story.id === 'sita-speaks-after-victory').editorial.note.en, /different|not declare/i);
});

test('search text is bilingual and includes aliases independent of the current interface language', () => {
  const hanumanStory = stories.find(story => story.id === 'hanumans-first-conversation');
  const text = searchText(hanumanStory, editionCharacters, valueLabels);
  assert.match(text, /Hanuman/);
  assert.match(text, /हनुमान/);
  assert.match(text, /Maruti/i);
});

test('the ordinary public build excludes guarded artwork and the expanded edition', async () => {
  const files = await readdir(resolve(root, 'dist'), { recursive: true });
  assert(!files.some(file => file.startsWith('assets/illustrated/')));
  const home = await readFile(resolve(root, 'dist/index.html'), 'utf8');
  assert(!home.includes('ILLUSTRATION & REVISED EDITION PREVIEW'));
  assert(!home.includes('22 chapters'));
  const journey=await readFile(resolve(root,'dist/journeys/ramayana/index.html'),'utf8');
  assert.equal((journey.match(/class="journey-chapter"/g)||[]).length,10);
});
