import test from 'node:test';
import assert from 'node:assert/strict';
import {injectWelcome,addWelcomePreview} from '../welcome-preview/build.mjs';

const shelf='<!doctype html><html lang="en"><head><title>Books</title></head><body><main>Book chapters</main><footer class="book-footer"><a href="/about/">About</a></footer></body></html>';

test('bookshelf injection adds the native opening and replay without changing its chapter content',()=>{
  const html=injectWelcome(shelf);
  assert.match(html,/<main>Book chapters<\/main>/);
  assert.match(html,/<footer class="book-footer">[\s\S]*data-replay-welcome[\s\S]*<\/footer>/);
  assert.equal((html.match(/id="welcome-intro"/g)||[]).length,1);
  assert.equal((html.match(/data-welcome-art /g)||[]).length,8);
  assert.match(html,/method="dialog"/);
  assert.equal(injectWelcome(html),html,'Build composition must not create duplicate overlays or scripts');
});

test('Hindi bookshelf has localized entry, replay and accessible welcome labels',()=>{
  const html=injectWelcome(shelf,{lang:'hi'});
  assert.match(html,/Spritual में आपका स्वागत है/);
  assert.match(html,/Spritual में प्रवेश करें/);
  assert.match(html,/स्वागत फिर देखें/);
  assert.match(html,/<figcaption>राम<span lang="en">Rama<\/span><\/figcaption>/);
  assert.doesNotMatch(html,/>Enter Spritual|>Replay welcome/);
});

test('the imported homepage keeps its existing footer-links replay position',()=>{
  const html=injectWelcome(shelf.replace('<footer class="book-footer">','<footer><div class="footer-links">').replace('</footer>','</div></footer>'));
  assert.match(html,/<div class="footer-links"><button type="button" data-replay-welcome/);
});

test('the welcome injector rejects reader and chapter routes before touching output',async()=>{
  for(const route of ['/books/ramayana/','/books/read/ramayana-a-home-in-panchavati/','/hi/books/read/shiva/']){
    await assert.rejects(addWelcomePreview('/does-not-exist',{routes:[route]}),/entry routes/);
  }
});
