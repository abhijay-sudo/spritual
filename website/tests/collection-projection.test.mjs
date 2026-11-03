import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {chapters} from '../collections/ramayana/model.mjs';
import {escapeHtml} from '../books/model.mjs';

test('normal public output excludes the new collection, its prose, animation module and artwork',async()=>{
  const root=new URL('../dist/',import.meta.url);
  const files=await readdir(root,{recursive:true});
  assert(!files.some(file=>/books\/(ramayana\/(?:collection\.|review-manifest)|read\/ramayana-)|assets\/illustrated\//.test(file)));
  const html=(await Promise.all(files.filter(file=>file.endsWith('.html')).map(file=>readFile(new URL(file,root),'utf8')))).join('\n');
  assert(!html.includes('/books/ramayana/collection.js'));
  for(const chapter of chapters)for(const scene of chapter.scenes)for(const paragraph of scene.paragraphs)for(const lang of ['en','hi']) {
    assert(!html.includes(escapeHtml(paragraph[lang])),`Unreviewed prose leaked: ${chapter.id}/${scene.id}/${lang}`);
  }
  const sitemap=await readFile(new URL('sitemap.xml',root),'utf8');
  assert(!sitemap.includes('/books/read/ramayana-'));
  for(const prefix of ['', 'hi/']) {
    const contents=await readFile(new URL(`${prefix}books/ramayana/index.html`,root),'utf8');
    assert.equal((contents.match(/class="collection-chapter"/g)||[]).length,13);
    assert(!contents.includes('Editorial preview'));
    assert(!contents.includes('/books/read/ramayana-'));
    assert(sitemap.includes(`/${prefix}books/ramayana/`));
  }
});
