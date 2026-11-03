import {collections,books,bookKey} from './taxonomy.mjs';
const statuses=['idea','outline','draft','illustrated','narrated','reviewed','published'];
const ages=['all-ages','family-6+','independent-8+','older-12+'];
const slug=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const wordCount=text=>typeof text==='string'?(text.trim().match(/\S+/gu)||[]).length:0;
export function validateStory(story,{episode=true}={}){
 const errors=[];const fail=(path,message)=>errors.push({path,message});
 if(!story||typeof story!=='object'||Array.isArray(story))return [{path:'',message:'Expected a story object'}];
 const text=(value,path)=>{if(typeof value!=='string'||!value.trim())fail(path,'Required non-empty text');};
 const bilingual=(value,path)=>{for(const lang of ['en','hi'])text(value?.[lang],`${path}.${lang}`);};
 const image=(value,path)=>{text(value?.src,`${path}.src`);if(value?.src&&!/^\/(?!\/)[^?#]*\.(webp|png|jpe?g|avif|svg)$/i.test(value.src))fail(`${path}.src`,'Expected a local image asset');bilingual(value?.alt,`${path}.alt`);};
 for(const key of ['id','slug'])if(typeof story[key]!=='string'||!slug.test(story[key]))fail(key,'Expected a lowercase hyphenated identifier');
 const collection=collections.find(c=>c.slug===story.collection);
 if(!collection)fail('collection','Unknown collection');
 const key=bookKey(story.book);if(!key||!collection?.books.includes(key))fail('book','Book must belong to the selected collection');
 text(story.arc,'arc');
 if(key&&story.arc&&!story.arc.includes(books[key].arcKind))fail('arc',`Expected a ${books[key].arcKind} division`);
 if(!Number.isInteger(story.order)||story.order<1)fail('order','Expected a positive integer');
 for(const field of ['title','subtitle','synopsis'])bilingual(story[field],field);
 image(story.cover_image,'cover_image');
 if(!statuses.includes(story.status))fail('status','Unknown workflow status');
 if(!ages.includes(story.age_band))fail('age_band','Unknown age band');
 if(!Number.isFinite(story.duration_min)||story.duration_min<=0||(episode&&(story.duration_min<5||story.duration_min>12)))fail('duration_min',episode?'Full episodes must be 5–12 minutes':'Expected a positive duration');
 for(const field of ['characters','places','values','moods','festival_tags']){
  if(!Array.isArray(story[field]))fail(field,'Expected an array');
  else {for(const [i,item] of story[field].entries()){text(item,`${field}.${i}`);if(field==='characters'&&!slug.test(item))fail(`${field}.${i}`,'Expected a character slug');}if(new Set(story[field]).size!==story[field].length)fail(field,'Duplicate entries');}
 }
 if(!Array.isArray(story.source_refs)||!story.source_refs.length)fail('source_refs','At least one source is required');
 else story.source_refs.forEach((ref,i)=>{for(const key of ['book','arc','citation'])text(ref?.[key],`source_refs.${i}.${key}`);if(ref?.external_url){try{if(new URL(ref.external_url).protocol!=='https:')throw Error();}catch{fail(`source_refs.${i}.external_url`,'Expected an HTTPS URL');}}if(ref?.edition_note!==undefined)text(ref.edition_note,`source_refs.${i}.edition_note`);});
 if(!Array.isArray(story.pages)||!story.pages.length)fail('pages','At least one scene is required');
 else {
  if(episode&&story.pages.length<2)fail('pages','An episode must contain multiple scenes');
  story.pages.forEach((page,i)=>{
   const path=`pages.${i}`;if(page?.page_number!==i+1)fail(`${path}.page_number`,'Scene numbers must be consecutive from 1');
   bilingual(page?.scene_title,`${path}.scene_title`);bilingual(page?.text,`${path}.text`);image(page?.image,`${path}.image`);
   for(const lang of ['en','hi']){const count=wordCount(page?.text?.[lang]);if(count<60||count>140)fail(`${path}.text.${lang}`,`Expected 60–140 words; found ${count}`);}
   if(page?.text?.hi&&!/[\u0900-\u097f]/u.test(page.text.hi))fail(`${path}.text.hi`,'Hindi must use Devanagari');
   if(page?.pull_quote)bilingual(page.pull_quote,`${path}.pull_quote`);
   if(page?.shloka){text(page.shloka.devanagari,`${path}.shloka.devanagari`);text(page.shloka.transliteration,`${path}.shloka.transliteration`);bilingual(page.shloka.meaning,`${path}.shloka.meaning`);}
  });
 }
 return errors;
}
export function validateCatalogue(stories,options){
 if(!Array.isArray(stories))return [{id:null,path:'',message:'Expected an array'}];
 const seen=new Set();return stories.flatMap(story=>{const errors=validateStory(story,options);if(seen.has(story?.id))errors.push({path:'id',message:'Duplicate story ID'});seen.add(story?.id);return errors.map(e=>({id:story?.id,...e}));});
}
export function assertCatalogue(stories,options){const errors=validateCatalogue(stories,options);if(errors.length)throw new Error(JSON.stringify(errors,null,2));return stories;}
