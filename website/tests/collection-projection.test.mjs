import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {chapters} from '../collections/ramayana/model.mjs';
import {escapeHtml} from '../books/model.mjs';

test('normal public output excludes the new collection, its prose, animation module and artwork',async()=>{
  const root=new URL('../dist/',import.meta.url);
  const files=await readdir(root,{recursive:true});
  assert(!files.some(file=>/books\/(ramayana\/|read\/ramayana-)|assets\/illustrated\//.test(file)));
  const html=(await Promise.all(files.filter(file=>file.endsWith('.html')).map(file=>readFile(new URL(file,root),'utf8')))).join('\n');
  assert(!html.includes('/books/ramayana/collection.js'));
  for(const chapter of chapters)for(const scene of chapter.scenes)for(const paragraph of scene.paragraphs)for(const lang of ['en','hi']) {
    assert(!html.includes(escapeHtml(paragraph[lang])),`Unreviewed prose leaked: ${chapter.id}/${scene.id}/${lang}`);
  }
  assert(!(await readFile(new URL('sitemap.xml',root),'utf8')).includes('/books/ramayana/'));
});
