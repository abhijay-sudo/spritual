import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {publicBooks} from '../books/model.mjs';
import {libraryCollections} from '../books/library.mjs';

const books=await publicBooks();
const volumes=libraryCollections(books);
test('every existing story has exactly one collection, with the Ramayana journey in its original order',()=>{
  const ids=volumes.flatMap(v=>[...v.books,...v.related].map(b=>b.id));
  assert.equal(new Set(ids).size,books.length);
  assert.deepEqual([...ids].sort(),books.map(b=>b.id).sort());
  assert.deepEqual(volumes[0].books.map(b=>b.id),books.filter(b=>b.series==='journey').map(b=>b.id));
  assert.equal(volumes[0].count,volumes[0].books.length);
  const preview=libraryCollections(books,{previewChapters:28});
  assert.equal(preview[0].count,28);
  assert.deepEqual(preview.slice(1),volumes.slice(1));
});
test('single chapter readers return to their own contents without sending readers to another deity',async()=>{
  for(const lang of ['en','hi'])for(const volume of volumes.slice(1)){
    const prefix=lang==='hi'?'hi/':'';
    const html=await readFile(new URL(`../dist/${prefix}books/read/${volume.books[0].id}/index.html`,import.meta.url),'utf8');
    assert(html.includes(`href="/${prefix}books/${volume.id}/"`));
    const contents=html.match(/<ol class="other-chapters">([\s\S]*?)<\/ol>/)[1];
    assert.equal((contents.match(/<li/g)||[]).length,1);
    for(const other of volumes.slice(1).filter(v=>v!==volume))assert(!contents.includes(other.books[0].id));
    const ending=html.match(/<div class="chapter-ending">([\s\S]*?)<\/div>/)[1];
    assert(ending.includes(`href="/${prefix}books/${volume.id}/"`));
  }
});
test('welcome is present on both entry pages, but not chapter contents or readers',async()=>{
  for(const route of ['index.html','books/index.html','hi/books/index.html']) {
    const html=await readFile(new URL(`../dist/${route}`,import.meta.url),'utf8');
    assert.equal((html.match(/id="welcome-intro"/g)||[]).length,1,route);
  }
  for(const route of ['books/shiva/index.html','books/ramayana/index.html','books/read/shiva-river/index.html']){
    const html=await readFile(new URL(`../dist/${route}`,import.meta.url),'utf8');
    assert(!html.includes('id="welcome-intro"'),route);
  }
});
