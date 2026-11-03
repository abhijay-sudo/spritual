import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('editorial invitation preserves release truth, reader provenance and an immediate reading path', async () => {
  const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const required of ['href="/books/read/knowing-how-to-stop/"', 'href="/library/"', 'class="manuscript-journey"', 'data-share-reflection=', '/assets/brand.svg', '/experience/experience.js']) assert(html.includes(required), required);
  for (const prohibited of ['welcome-intro', 'Get Spritual', 'App coming soon', 'apps.apple.com/app/', 'play.google.com/store/apps/', '/stories-app/premium.js']) assert(!html.includes(prohibited), prohibited);
  const config = await readFile(new URL('../dist/stories-app/release-config.js', import.meta.url), 'utf8');
  assert.match(config, /iosUrl:\s*null/);
  assert.match(config, /androidUrl:\s*null/);
});
