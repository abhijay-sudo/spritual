import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {stories, characters, CONTENT_REVISION, RELEASE_REVIEW} from '../stories.mjs';
import {collections} from '../catalog.mjs';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const hash=value=>createHash('sha256').update(value).digest('hex');
const artRoot='/stories-app/assets/';
const art={
 'what-makes-a-person-admirable':'forest-sages.webp',
 'the-bow-at-mithila':'rama-bow-mithila.webp',
 'across-the-ocean':'hanuman-ocean-leap.webp',
};
export async function publicBooks(){
 const raw=await readFile(new URL('../app-introduction/public/stories-data.js',import.meta.url),'utf8');
 const shorts=JSON.parse(raw.slice(raw.indexOf('['),raw.lastIndexOf(']')+1));
 const long=stories.map(s=>({id:s.id,collection:'ramayana',series:'journey',searchTerms:s.characters.flatMap(id=>[characters[id]?.name.en,characters[id]?.name.hi]).filter(Boolean).join(' '),title:s.title,dek:s.dek,sourceLabel:s.source.label,sources:[{label:s.source.work+' · '+s.source.label,url:s.source.url}],note:s.editorial.note,contentNote:s.contentNote,kind:'retelling',revision:CONTENT_REVISION,review:RELEASE_REVIEW,
  image:art[s.id]?artRoot+art[s.id]:`/assets/${s.world==='hanuman'?'world-hanuman':s.world==='rama'?'world-rama':'collection-ramayana'}.webp`,alt:{en:'Illustrated Ramayana landscape',hi:'रामायण का चित्रित दृश्य'},
  folios:s.scenes.map(scene=>({id:scene.id,title:scene.title,paragraphs:scene.blocks.map(b=>b.text)})),reflection:s.reflection,
 }));
 return [...long,...shorts.map(s=>({id:s.id,collection:s.tradition,series:'short',searchTerms:s.name+' '+({'rama-bow':'राम','sita-earth':'सीता','krishna-mountain':'कृष्ण','hanuman-leap':'हनुमान','shiva-river':'शिव गंगा','dhruva-star':'ध्रुव'}[s.id]||''),title:{en:s.en.title,hi:s.hi.title},dek:{en:s.en.teaser,hi:s.hi.teaser},sourceLabel:s.sources.map(x=>x.label).join(' · '),sources:s.sources,note:{en:'Original short retelling. Read alongside the cited source; different traditions may tell the episode differently.',hi:'मौलिक संक्षिप्त पुनर्कथन। इसे दिए गए स्रोत के साथ पढ़ें; अलग परम्पराएँ इस प्रसंग को भिन्न रूप में कह सकती हैं।'},kind:'retelling',revision:'owner-selected-site-v4',image:artRoot+s.image,alt:{en:s.alt,hi:''},folios:[{id:'opening',title:{en:s.en.title,hi:s.hi.title},paragraphs:s.en.paragraphs.map((p,i)=>({en:p,hi:s.hi.paragraphs[i]}))}]}))];
}
export function sourceBooks(staged){
 if(staged.access!=='not-published'||staged.review.status!=='pending')throw Error('Unexpected staged publication state');
 return collections.slice(0,2).flatMap(c=>c.units.map(u=>{
  const record=staged.units[`${c.id}/${u.id}`];if(!record)throw Error('Missing source book '+u.id);
  return {id:`${c.id}/${u.id}`,collection:c.id,title:u.title,edition:c.edition.en,source:staged.sources.find(s=>s.id===record.sourceId),introduction:record.introduction,chapters:record.chapters};
 }));
}
// Preserve exact paragraph text and source spelling. Display folios are not scripture numbering.
export function sourceFolios(text){
 const paragraphs=text.split(/\n\s*\n/).filter(x=>x.trim());const folios=[];let group=[],words=0,notes=false;
 const flush=()=>{if(group.length){folios.push({paragraphs:group,notes});group=[];words=0;}};
 for(const p of paragraphs){if(/^FOOTNOTES\s*$/.test(p.trim())){flush();notes=true;}const count=p.split(/\s+/).length;if(group.length&&words+count>280)flush();group.push(p);words+=count;}
 flush();return folios.map((g,i)=>({id:`leaf-${i+1}`,title:{en:g.notes?`Edition notes · ${i+1}`:`Reading ${i+1}`},paragraphs:g.paragraphs.map(en=>({en}))}));
}
export function validateBook(book){
 if(!/^[a-z0-9-]+$/.test(book.id))throw Error('Invalid story ID');
 if(!book.folios.length||!book.sources.length)throw Error('Missing story or provenance');
 for(const source of book.sources)if(!/^https:\/\//.test(source.url))throw Error('Invalid source URL');
 for(const folio of book.folios){if(!/^[a-z0-9-]+$/.test(folio.id)||!folio.paragraphs.length)throw Error('Invalid folio');for(const p of folio.paragraphs)for(const lang of ['en','hi'])if(!p[lang]?.trim())throw Error(`Missing ${lang} in ${book.id}`);}
 return book;
}
