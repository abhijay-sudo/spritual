import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chapters, validateCollection, release, revision, collectionHome, chapterRoute, asBook, sceneArt, wordCount} from './model.mjs';
import {collectionShelf, collectionReader} from './render.mjs';
import {buildCollection} from './build.mjs';
import {publicBooks, escapeHtml, validateBook} from '../../books/model.mjs';
import {parsePlaces, encodePlaces} from '../../books/state.mjs';

const expectedOrder = [
  'what-makes-a-person-admirable', 'princes-and-teacher', 'knowing-how-to-stop',
  'road-to-mithila', 'the-bow-at-mithila', 'promise-of-exile',
  'a-friend-beside-the-ganga', 'bharata-and-the-sandals', 'forest-torn-apart',
  'shabaris-welcome', 'hanumans-first-conversation', 'alliance-and-vali',
  'search-to-southern-sea', 'across-the-ocean', 'through-lanka-at-night',
  'a-ring-brings-hope', 'witness-returns', 'refuge-and-crossing',
  'war-and-its-cost', 'sita-speaks-after-victory', 'northward-home', 'returning-responsibility'
];
const langs = ['en', 'hi'];
const attributes = (html, name) => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, 'g'))].map(match => match[1]);
const links = html => [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"[^>]*>/g)].map(match => match[1]);
const clone = () => structuredClone(chapters);

function renderedRoutes() {
  const routes = new Map();
  for (const lang of langs) {
    routes.set(collectionHome(lang), collectionShelf(chapters, lang));
    chapters.forEach((chapter, index) => routes.set(chapterRoute(chapter.id, lang), collectionReader(chapter, index, chapters, lang)));
  }
  return routes;
}

test('the abridgement follows all 22 narrative stops through return, without duplicated chapters', () => {
  assert.deepEqual(chapters.map(chapter => chapter.id), expectedOrder);
  assert.equal(new Set(chapters.map(chapter => chapter.id)).size, 22);
  assert.strictEqual(validateCollection(), chapters);
  assert.deepEqual([...new Set(chapters.map(chapter => chapter.part.en))], [
    'Bala Kanda', 'Ayodhya Kanda', 'Aranya Kanda', 'Kishkindha Kanda', 'Sundara Kanda', 'Yuddha Kanda'
  ]);
  assert.equal(chapters.flatMap(chapter => chapter.scenes).length, 88);
  for (const chapter of chapters) {
    assert(wordCount(chapter) >= 200, `${chapter.id}: only a synopsis, not a finished chapter`);
    validateBook(asBook(chapter));
    for (const field of ['title', 'dek', 'part', 'note', 'reflection']) {
      assert.match(chapter[field].hi, /[\u0900-\u097f]/u, `${chapter.id}: ${field} lacks Hindi`);
    }
    for (const scene of chapter.scenes) for (const paragraph of scene.paragraphs) {
      assert.match(paragraph.hi, /[\u0900-\u097f]/u, `${chapter.id}/${scene.id}: English fallback in Hindi prose`);
      assert.notEqual(paragraph.en, paragraph.hi);
    }
  }
});

test('validation rejects missing or reordered chapters, duplicate folios, missing translations and unsafe source links', () => {
  assert.throws(() => validateCollection(chapters.slice(1)), /22 chapters/);
  let draft = clone(); [draft[0], draft[1]] = [draft[1], draft[0]];
  assert.throws(() => validateCollection(draft), /order mismatch/);
  draft = clone(); draft[0].scenes[1].id = draft[0].scenes[0].id;
  assert.throws(() => validateCollection(draft), /distinct scenes/);
  draft = clone(); draft[0].scenes[0].paragraphs[0].hi = '';
  assert.throws(() => validateCollection(draft), /Incomplete hi/);
  draft = clone(); draft[0].title.hi = '';
  assert.throws(() => validateCollection(draft), /Missing hi title/);
  draft = clone(); draft[0].sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validateCollection(draft), /Missing sources/);
});

test('release metadata remains immutable, versioned and explicitly unpaid and unreviewed', () => {
  assert(Object.isFrozen(release));
  assert.equal(release.status, 'draft');
  assert.equal(release.editor, null);
  assert.equal(release.rightsReview, 'pending');
  assert.equal(release.paidAccess, false);
  assert.throws(() => { release.status = 'approved'; }, TypeError);
  assert.throws(() => { release.paidAccess = true; }, TypeError);
  assert.equal(release.revision, revision);
  assert.equal(revision, createHash('sha256').update(JSON.stringify(chapters)).digest('hex').slice(0, 16));
  const draft = clone(); draft[0].scenes[0].paragraphs[0].en += ' Changed.';
  assert.notEqual(revision, createHash('sha256').update(JSON.stringify(draft)).digest('hex').slice(0, 16));
  const embellished = {...chapters[0], review: {status: 'approved', reviewer: 'fabricated'}, paidAccess: true};
  assert.equal(asBook(embellished).review, undefined);
  assert.equal(asBook(embellished).paidAccess, undefined);
});

test('preview build refuses CI, deployment, missing opt-in and public destinations before any output work', async () => {
  const argv = [...process.argv], originalCI = process.env.CI, originalVercel = process.env.VERCEL;
  const preview = '/tmp/spritual-collection-guard-only/artifacts/welcome-site';
  try {
    process.argv.push('--collection-preview');
    process.env.CI = 'true';
    await assert.rejects(buildCollection(preview), /local review only/);
    delete process.env.CI; process.env.VERCEL = '1';
    await assert.rejects(buildCollection(preview), /local review only/);
    delete process.env.VERCEL;
    process.argv.splice(0, process.argv.length, ...argv.filter(arg => arg !== '--collection-preview'));
    await assert.rejects(buildCollection(preview), /local review only/);
    process.argv.push('--collection-preview');
    await assert.rejects(buildCollection('/tmp/spritual-collection-guard-only/website/dist'), /public output/);
  } finally {
    process.argv.splice(0, process.argv.length, ...argv);
    if (originalCI === undefined) delete process.env.CI; else process.env.CI = originalCI;
    if (originalVercel === undefined) delete process.env.VERCEL; else process.env.VERCEL = originalVercel;
  }
});

test('the 46 rendered routes form a complete bilingual collection with valid chapter and fragment destinations', () => {
  const routes = renderedRoutes();
  assert.equal(routes.size, 46);
  for (const [route, html] of routes) {
    const ids = attributes(html, 'id');
    assert.equal(ids.length, new Set(ids).size, `${route}: duplicate DOM identifiers`);
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.doesNotMatch(html, /<meta property="og:/);
    assert.doesNotMatch(html, /(?:href|action)="[^"]*(?:checkout|subscribe|billing|payment)/i);
    assert.doesNotMatch(html, /(?:Premium active|Payment successful|Subscription active|₹\s*\d)/i);
    for (const href of links(html)) {
      if (href.startsWith('#')) assert(ids.includes(href.slice(1)), `${route}: broken local fragment ${href}`);
      if (/^\/(hi\/)?books\/(?:ramayana\/|read\/ramayana-)/.test(href)) {
        const [path, hash] = href.split('#');
        assert(routes.has(path), `${route}: missing collection destination ${href}`);
        if (hash) assert(attributes(routes.get(path), 'id').includes(hash), `${route}: missing destination folio ${href}`);
      }
    }
  }
  for (const lang of langs) {
    const shelf = routes.get(collectionHome(lang));
    for (const chapter of chapters) assert(links(shelf).includes(chapterRoute(chapter.id, lang)));
    for (const [index, chapter] of chapters.entries()) {
      const html = routes.get(chapterRoute(chapter.id, lang));
      const ending = html.match(/<div class="chapter-ending">([\s\S]*?)<\/div>/)?.[1];
      assert(ending, `${chapter.id}: missing ending`);
      assert.deepEqual(links(ending), [index === chapters.length - 1 ? collectionHome(lang) : chapterRoute(chapters[index + 1].id, lang)]);
      const other = lang === 'en' ? 'hi' : 'en';
      assert(links(html).includes(chapterRoute(chapter.id, other)), `${chapter.id}: header changes language but loses chapter`);
      assert(links(html).includes(`${chapterRoute(chapter.id, other)}#${chapter.scenes[0].id}`));
    }
    assert(links(shelf).includes(collectionHome(lang === 'en' ? 'hi' : 'en')));
  }
});

test('every paragraph, citation, content note and folio is readable in static HTML before enhancement', () => {
  for (const [index, chapter] of chapters.entries()) for (const lang of langs) {
    const html = collectionReader(chapter, index, chapters, lang);
    const sections = [...html.matchAll(/<section\b[^>]*\bdata-folio\b[^>]*>/g)].map(match => match[0]);
    assert.equal(sections.length, 4);
    assert(sections.every(tag => !/\shidden(?:\s|>|=)/.test(tag)));
    for (const scene of chapter.scenes) {
      assert(html.includes(`id="${scene.id}"`));
      for (const paragraph of scene.paragraphs) assert(html.includes(`<p>${escapeHtml(paragraph[lang])}</p>`));
    }
    for (const source of chapter.sources) {
      const url = new URL(source.url);
      assert.equal(url.protocol, 'https:');
      const citedEdition = ['valmikiramayan.net', 'www.valmikiramayan.net'].includes(url.hostname)
        || source.url === 'https://www.gutenberg.org/files/24869/24869-h/24869-h.html';
      assert(citedEdition, `${chapter.id}: unexpected source edition ${source.url}`);
      assert(html.includes(`href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer"`));
    }
    assert(html.includes(escapeHtml(chapter.note[lang])));
    if (chapter.contentNote) assert(html.includes(escapeHtml(chapter.contentNote[lang])));
    assert.match(html, /<details class="edition-note" id="edition-note" open>/);
  }
  for (const id of ['forest-torn-apart', 'war-and-its-cost', 'sita-speaks-after-victory']) {
    const chapter = chapters.find(candidate => candidate.id === id);
    assert(chapter?.contentNote?.en && chapter.contentNote.hi, `${id}: missing sensitive-content note`);
  }
});

test('chapter artwork has bilingual descriptions, responsive files, captions and no Surasa composite', async () => {
  const checkedFiles = new Set();
  for (const [index, chapter] of chapters.entries()) {
    const art = sceneArt(chapter);
    assert.deepEqual(art.map(item => item.id), chapter.scenes.map(scene => scene.id));
    for (const item of art) {
      assert(item.alt.en.trim() && /[\u0900-\u097f]/u.test(item.alt.hi));
      assert.notEqual(item.file, '08-scene-surasa-shadow');
      assert.match(item.file, /^[a-z0-9-]+$/);
      if (!checkedFiles.has(item.file)) {
        for (const width of [640, 960, 1280]) await access(new URL(`../../assets/illustrated/${item.file}-${width}.jpg`, import.meta.url));
        checkedFiles.add(item.file);
      }
    }
    for (const lang of langs) {
      const html = collectionReader(chapter, index, chapters, lang);
      assert.equal((html.match(/<figure\b/g) || []).length, 4);
      assert.equal((html.match(/<figcaption>/g) || []).length, 4);
      for (const item of art) assert(html.includes(`alt="${escapeHtml(item.alt[lang])}"`));
      assert.match(html, /data-scene-controls hidden/);
      assert.match(html, /data-art-recovery hidden/);
    }
  }
});

test('new editions remain outside the public catalogue and use compatible explicit bookmarks', async () => {
  const publicCatalogue = await publicBooks();
  assert.equal(publicCatalogue.length, 16);
  assert(publicCatalogue.every(book => !book.id.startsWith('ramayana-')));
  for (const chapter of chapters) for (const lang of langs) {
    const book = asBook(chapter);
    const place = {id: book.id, lang, title: book.title[lang], route: chapterRoute(chapter.id, lang), folio: chapter.scenes.at(-1).id, revision};
    assert.deepEqual(parsePlaces(encodePlaces([place])), [place]);
    assert.equal(place.route, `/${lang === 'hi' ? 'hi/' : ''}books/read/${book.id}/`);
  }
});

test('narrative text and headings are escaped without introducing executable HTML', () => {
  const chapter = structuredClone(chapters[0]);
  const unsafe = '<img src=x onerror="alert(1)"> & "quoted"';
  chapter.title.en = unsafe;
  chapter.scenes[0].title.en = unsafe;
  chapter.scenes[0].paragraphs[0].en = unsafe;
  chapter.note.en = unsafe;
  const html = collectionReader(chapter, 0, [chapter], 'en');
  assert(html.includes(escapeHtml(unsafe)));
  assert(!html.includes(unsafe));
  assert(!html.includes('<img src=x'));
});
