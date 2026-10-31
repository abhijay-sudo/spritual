import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {home,directory,storyReader} from '../content/render.mjs';
const stories=JSON.parse(await readFile(new URL('../content/stories.json',import.meta.url),'utf8'));
test('home sharing and bilingual alternate URLs identify their canonical pages',()=>{
 for(const lang of ['en','hi']){const html=home(stories,lang);assert.match(html,/<meta property="og:image"/);assert.match(html,/<meta property="og:url"/);assert.match(html,/<meta name="twitter:card"/);for(const l of ['en','hi'])assert.match(html,new RegExp(`hreflang="${l}"`));}
});
test('collection navigation prioritizes available books and labels unavailable sections',()=>{
 const html=directory(stories,{collection:'shiva'});
 assert.match(html,/class="directory-row" href="\/collections\/shiva\/books\/valmiki-ramayana\/"/);
 assert.doesNotMatch(html,/class="directory-row" href="\/collections\/shiva\/books\/shiva-purana\/"/);
 assert.match(html,/1 story/);assert.match(html,/Other sections of this source/);
});
test('empty arc is noindex and recovers within its collection',()=>{
 const html=directory(stories,{collection:'mahabharata',book:'Vyasa Mahabharata',arc:'Adi Parva'});
 assert.match(html,/<meta name="robots" content="noindex,follow">/);assert.match(html,/Stories from this arc/);assert.match(html,/href="\/collections\/mahabharata\/">Explore available stories/);
});
test('story breadcrumb structured data follows the requested five content ancestors',()=>{
 const story=stories[0],html=storyReader(story);const data=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
 assert.equal(data['@type'],'BreadcrumbList');assert.equal(data.itemListElement.length,5);assert.equal(data.itemListElement[2].name,story.book);assert.equal(data.itemListElement[3].name,story.arc);assert.equal(data.itemListElement[4].name,story.title.en);assert.ok(data.itemListElement.every(x=>x.item.startsWith('https://spritual.co.in/')));
});
test('reader keeps exactly one visible story heading and Hindi metadata uses local labels',()=>{
 const html=storyReader(stories[0],'hi');assert.equal((html.match(/<h1/g)||[]).length,1);assert.match(html,/<h1 class="reader-story-title">/);assert.match(html,/वाल्मीकि रामायण/);
 const catalogue=home(stories,'hi');assert.match(catalogue,/गणेश/);assert.match(catalogue,/साहस/);
});

test('filter options deduplicate translated labels while retaining first token',()=>{
 const fixtures=structuredClone(stories);fixtures[0].values=['Devotion','devotion'];const html=home(fixtures);const options=html.match(/<select data-filter="value">([\s\S]*?)<\/select>/)[1];assert.equal((options.match(/>Devotion<\/option>/gi)||[]).length,1);assert.match(options,/<option value="Devotion">/);
});
