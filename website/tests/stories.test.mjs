import test from 'node:test';
import assert from 'node:assert/strict';
import {CONTENT_REVISION,RELEASE_REVIEW,stories,characters,glossary} from '../stories.mjs';

test('Ramayana MVP contains ten complete bilingual original retellings',()=>{
 assert.equal(stories.length,10);assert.equal(new Set(stories.map(story=>story.id)).size,10);
 for(const [index,story] of stories.entries()){
  assert.equal(story.order,index+1);assert.equal(story.epic,'ramayana');assert.equal(story.editorial.state,'reviewed');assert.equal(story.editorial.reviewerName,'Puja Bhagat');
  assert.match(story.source.work,/Valmiki Ramayana/);assert.match(story.source.locator,/Kanda/);assert.match(story.source.url,/^https:\/\//);assert.match(story.source.rightsStatus,/No permission/);
  assert.ok(story.title.en.length>5&&story.title.hi.length>5);assert.ok(story.description.en.length>30&&story.description.hi.length>30);assert.ok(story.reflection.en.length>20&&story.reflection.hi.length>20);
  assert.equal(story.scenes.length,3);
  for(const scene of story.scenes){assert.ok(scene.id);assert.ok(scene.title.en&&scene.title.hi);assert.ok(scene.blocks.length>=2);for(const block of scene.blocks){assert.ok(block.id);assert.ok(block.text.en.length>80);assert.ok(block.text.hi.length>60);}}
  for(const id of story.characters)assert.ok(characters[id],`${story.id} character ${id}`);
  for(const id of story.glossary)assert.ok(glossary[id],`${story.id} glossary ${id}`);
 }
 assert.match(CONTENT_REVISION,/^ramayana-reviewed-/);
 assert.deepEqual(RELEASE_REVIEW,{status:'owner-attested-review-complete',reviewerName:'Puja Bhagat',reviewedAt:'2026-10-03',credentials:null,scopes:['source-and-retelling','english-and-hindi','family-and-sensitivity'],rights:'owner-attested',correctionsUrl:'https://github.com/abhijay-sudo/spritual/issues/new'});
});

test('checked episode locators and sensitive adaptation notes remain explicit',()=>{
 const expected=[['what-makes-a-person-admirable','Bala Kanda 1.1'],['knowing-how-to-stop','Bala Kanda 1.28'],['the-bow-at-mithila','Bala Kanda 1.67'],['a-friend-beside-the-ganga','Ayodhya Kanda 2.50'],['bharata-and-the-sandals','Ayodhya Kanda 2.112'],['shabaris-welcome','Aranya Kanda 3.74'],['hanumans-first-conversation','Kishkindha Kanda 4.3'],['across-the-ocean','Sundara Kanda 5.1'],['a-ring-brings-hope','Sundara Kanda 5.36'],['returning-responsibility','Yuddha Kanda 6.128 in this web witness']];
 assert.deepEqual(stories.map(story=>[story.id,story.source.locator.split(';')[0]]),expected);
 assert.match(stories.find(story=>story.id==='bharata-and-the-sandals').contentNote.en,/self-harm detail.*omitted/i);
 assert.match(stories.find(story=>story.id==='shabaris-welcome').editorial.note.en,/tasted-berries detail is not present/i);
 assert.match(stories.find(story=>story.id==='across-the-ocean').source.locatorStatus,/malformed verse identifiers/i);
 assert.match(stories.find(story=>story.id==='returning-responsibility').editorial.note.en,/edition-specific/i);
});

test('released corpus makes no invented credential, legal or commercial claim',()=>{
 const text=JSON.stringify(stories);
 for(const claim of ['scholar verified','scholar-reviewed','licensed translation','public domain worldwide','legal clearance','buy now','add to cart'])assert.equal(text.toLocaleLowerCase().includes(claim),false,claim);
});
