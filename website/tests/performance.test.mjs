import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {stories} from '../stories.mjs';
import {deliveryArt} from '../delivery-assets.mjs';
const root=resolve(import.meta.dirname,'../dist');

test('delivery encodes retain the reviewed source and bounded responsive sizes',async()=>{
 for(const art of Object.values(deliveryArt)){
  const original=await readFile(resolve(root,`assets/${art.file}.webp`));
  assert.equal(createHash('sha256').update(original).digest('hex'),art.sha256);
  for(const width of art.widths){
  const budget=width===560?80000:width===800?140000:260000;
  const bytes=await readFile(resolve(root,`assets/${art.file}-${width}.avif`));
  assert(bytes.subarray(0,32).includes(Buffer.from('avif')));
  const sizeBox=bytes.indexOf(Buffer.from('ispe'));
  assert(sizeBox>0);assert.equal(bytes.readUInt32BE(sizeBox+8),width);assert.equal(bytes.readUInt32BE(sizeBox+12),Math.round(width*art.height/art.width));
  assert(bytes.length<=budget,`${width}px delivery budget`);
  }
 }
});

test('bilingual overview and reader openers are eager, responsive and retain a WebP fallback',async()=>{
 for(const story of stories)for(const language of ['','hi/'])for(const type of ['story','read']){
  const html=await readFile(resolve(root,`${language}${type}/${story.id}/index.html`),'utf8');
  const picture=html.match(/<picture><source type="image\/avif"[^>]*\/><img[^>]*\/><\/picture>/)?.[0];
  assert(picture,`${language}${type}/${story.id}`);
  assert.match(picture,/800\.avif 800w/);assert.match(picture,/fetchpriority="high"/);assert(!picture.includes('loading="lazy"'));
  assert(picture.includes(`src="/assets/${deliveryArt[story.world].file}.webp"`));
  if(story.world==='epic')assert.match(picture,/collection-ramayana-sm.webp 560w/);
 }
});
