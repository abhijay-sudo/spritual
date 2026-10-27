import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('editorial invitation preserves release truth, reader provenance and an immediate reading path', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const required of ['href="#journey">Choose your book', 'href="/books/">Open the bookshelf', 'App coming soon to iPhone &amp; Android', 'Notebook saves last for this visit.', 'id="story-source-list"', '/stories-app/assets/brand-icon.svg', '/stories-app/premium.js']) assert(html.includes(required), required);
  for (const prohibited of ['one edition purchase', 'class="chapter-contents', 'apps.apple.com/app/', 'play.google.com/store/apps/']) assert(!html.includes(prohibited), prohibited);
  const config = await readFile(new URL('../dist/stories-app/release-config.js', import.meta.url), 'utf8');
  assert.match(config, /iosUrl:\s*null/);
  assert.match(config, /androidUrl:\s*null/);
});
