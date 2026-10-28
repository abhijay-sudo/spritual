// One-way migration preparation. Never rewrites or publishes the existing edition.
import {publicBooks} from '../books/model.mjs';
import {stories as originals} from '../stories.mjs';
import {storyPath} from './taxonomy.mjs';
import {validateCatalogue,wordCount} from './validate.mjs';
export async function migrateLegacy(){
 const legacy=await publicBooks();const aliases={};
 const records=legacy.map((b,i)=>{
  const original=originals.find(s=>s.id===b.id);
  const hindiAlt={'rama-bow':'मिथिला की सभा में महान धनुष उठाते राम।','sita-earth':'खेत की सीता में मिली बालिका सीता का स्वागत करते जनक।','krishna-mountain':'वर्षा में गोवर्धन के नीचे लोगों और गायों को आश्रय देते कृष्ण।','hanuman-leap':'समुद्र के पार लंका की ओर छलाँग लगाते हनुमान।','shiva-river':'हिमालय में अपनी जटाओं से गंगा को धारण करते शिव।','dhruva-star':'तारों भरे आकाश के नीचे वन में ध्यान करते बालक ध्रुव।'};
  b.alt={...b.alt,hi:b.alt.hi||hindiAlt[b.id]||''};
  const source_refs=b.sources.map(s=>{const parts=s.label.split(' · ');return {book:parts[0],arc:parts[1]?.match(/^(.*?(?:Kanda|Skandha \d+))/)?.[1]||original?.book.en||'',citation:parts.slice(1).join(' · '),external_url:s.url};});
  const primary=source_refs[0];
  const story={id:b.id,slug:b.id,collection:b.id==='shiva-river'?'shiva':primary.book==='Bhagavata Purana'?'krishna':'ramayana',book:primary.book,arc:primary.arc,order:i+1,title:b.title,subtitle:b.dek,synopsis:original?.description||b.dek,cover_image:{src:b.image,alt:b.alt},source_refs,characters:original?.characters||[],places:[],values:original?.values||[],moods:[],age_band:original?.age.min>=8?'independent-8+':'all-ages',duration_min:original?.duration||Math.max(1,Math.ceil(b.folios.reduce((n,f)=>n+wordCount(f.paragraphs.map(p=>p.en).join(' ')),0)/160)),festival_tags:[],status:'draft',pages:b.folios.map((f,j)=>({page_number:j+1,scene_title:f.title,text:{en:f.paragraphs.map(p=>p.en).join('\n\n'),hi:f.paragraphs.map(p=>p.hi).join('\n\n')},image:{src:b.image,alt:b.alt}}))};
  for(const lang of ['en','hi']){const prefix=lang==='hi'?'/hi':'';for(const old of [`/books/read/${b.id}/`,`/story/${b.id}/`,`/read/${b.id}/`])aliases[prefix+old]=storyPath(story,lang);}
  return story;
 });
 return {stories:records,aliases,issues:validateCatalogue(records)};
}
if(process.argv[1]?.endsWith('/migrate.mjs')){const result=await migrateLegacy();console.log(JSON.stringify(result,null,2));}
