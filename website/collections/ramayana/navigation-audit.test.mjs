import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {inspectMarkup, localReference, auditNavigation} from './navigation-audit.mjs';

test('markup scanner handles quoted angle brackets, comments, entities and raw script text', () => {
  const result = inspectMarkup(`<div id="real" title="4 > 3"><a href="/book/?a=1&amp;b=2#leaf">Read</a></div>
    <!-- <a href="/missing/" id="fake"> -->
    <script>const fake='<a href="/other/" id="other">';</script>
    <style>.a{background:url('/paper.jpg')}</style><div id="real"></div><a name="old-name"></a>`);
  assert.equal(result.tags.filter(t => t.name === 'a').length,2);
  assert.equal(result.tags.find(t => t.name === 'a').attributes.href,'/book/?a=1&b=2#leaf');
  assert.deepEqual([...result.ids],['real','old-name']);
  assert.deepEqual(result.duplicates,['real']);
  assert.deepEqual(result.styles,[".a{background:url('/paper.jpg')}"]);
});

test('references resolve relative paths, encoded fragments and deployed same-site links without fetching', () => {
  assert.deepEqual(localReference('../read/?x=1#%E0%A4%AA%E0%A4%BE%E0%A4%A0','/books/library/'),{path:'/books/read/',fragment:'पाठ'});
  assert.deepEqual(localReference('https://spritual.co.in/books/#kept','/'),{path:'/books/',fragment:'kept'});
  assert.equal(localReference('https://source.example/book/','/'),null);
  assert.equal(localReference('data:image/svg+xml,<svg/>','/'),null);
  assert.deepEqual(localReference('javascript:void(0)','/'),{invalid:'javascript:void(0)'});
  assert.deepEqual(localReference('#a:~:text=word','/books/'),{path:'/books/',fragment:'a'});
});

async function fixture(t, files) {
  const root = await mkdtemp(join(tmpdir(),'spritual-nav-'));
  t.after(() => rm(root,{recursive:true,force:true}));
  for (const [file, content] of Object.entries(files)) {await mkdir(dirname(join(root,file)),{recursive:true}); await writeFile(join(root,file),content);}
  return root;
}

const expectations = {expectedLibraryRoutes:[],expectedPublicIds:['one'],expectedCollectionRoutes:['/books/ramayana/','/hi/books/ramayana/']};
const valid = {
  'index.html':'<a href="/books/read/one/#leaf">Read</a><a href="/books/ramayana/">Collection</a><a href="/hi/">Hindi</a><link rel="stylesheet" href="/book.css">',
  'hi/index.html':'<a href="/hi/books/read/one/#leaf">Read</a><a href="/hi/books/ramayana/">Collection</a><a href="/">English</a>',
  'books/read/one/index.html':'<main id="leaf"><img src="/image.jpg" srcset="/image.jpg 640w, /large.jpg 1280w"><svg><symbol id="arrow"></symbol><use href="#arrow"/></svg></main>',
  'hi/books/read/one/index.html':'<main id="leaf"></main>',
  'books/ramayana/index.html':'<h1>Collection</h1>',
  'hi/books/ramayana/index.html':'<h1>Collection</h1>',
  'book.css':"@import '/paper.css'; @font-face{src:url('/font.woff2')}",
  'paper.css':".paper{background:url('/image.jpg')}",
  'image.jpg':'image', 'large.jpg':'image', 'font.woff2':'font'
};

test('complete bilingual native navigation and responsive/CSS assets pass', async t => {
  const root = await fixture(t,valid), report = await auditNavigation(root,expectations);
  assert.deepEqual(report.failures,[]);
  assert.equal(report.counts.expectedRoutesReachable,4);
  assert.equal(report.counts.linkedStylesheets,2);
  assert.equal(report.counts.fragmentReferences,3);
});

test('missing fragments, nested CSS assets and duplicate ids fail with the originating route', async t => {
  const root = await fixture(t,{...valid,'books/read/one/index.html':'<main id="not-leaf"></main><p id="not-leaf"></p>', 'paper.css':".paper{background:url('/absent.jpg')}"});
  const report = await auditNavigation(root,expectations);
  assert(report.failures.some(f => f.kind === 'duplicate-id' && f.from === '/books/read/one/'));
  assert(report.failures.some(f => f.kind === 'missing-fragment' && f.target === '/books/read/one/#leaf'));
  assert(report.failures.some(f => f.kind === 'missing-asset' && f.from === '/paper.css' && f.target === '/absent.jpg'));
});

test('metadata and raw JavaScript do not falsely make a route reachable', async t => {
  const root = await fixture(t,{...valid,'index.html':'<a href="/hi/">Hindi</a><link rel="canonical" href="/books/read/one/"><script>const link="<a href=\"/books/read/one/\">read</a>"</script>'});
  const report = await auditNavigation(root,expectations);
  assert(report.failures.some(f => f.kind === 'unreachable-from-home' && f.target === '/books/read/one/'));
  assert(!report.failures.some(f => f.kind === 'missing-expected-route'));
});

test('public build rejects draft collection routes even if ordinary books are present', async t => {
  const root = await fixture(t,valid), report = await auditNavigation(root,{...expectations,collection:false});
  assert.equal(report.failures.filter(f => f.kind === 'draft-in-public-build').length,2);
  assert.equal(report.counts.expectedCollectionRoutes,0);
});
