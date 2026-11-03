import {migrateLegacy} from './migrate.mjs';
import {chapters,asBook} from '../collections/ramayana/model.mjs';
import {wordCount} from './validate.mjs';
const groups=[
 ['ramayana-beginnings','Bala Kanda','A question, a journey, a bow','एक प्रश्न, एक यात्रा, एक धनुष',['what-makes-a-person-admirable','sita-earth','knowing-how-to-stop','the-bow-at-mithila','rama-bow']],
 ['ramayana-promises-and-partings','Ayodhya Kanda','Promises and partings','वचन और विदा',['@promise-of-exile','a-friend-beside-the-ganga','bharata-and-the-sandals']],
 ['ramayana-loss-and-hospitality','Aranya Kanda','An absence, a welcome, a way onward','वियोग, स्वागत और आगे का मार्ग',['@forest-torn-apart','shabaris-welcome']],
 ['ramayana-trust-and-alliance','Kishkindha Kanda','The work of trust','विश्वास का निर्माण',['hanumans-first-conversation','@alliance-and-vali','hanuman-leap']],
 ['ramayana-crossing-and-recognition','Sundara Kanda','Across the sea, a sign of hope','समुद्र के पार आशा का संकेत',['across-the-ocean','@through-lanka-at-night','a-ring-brings-hope']],
 ['ramayana-home-and-responsibility','Yuddha Kanda','The journey home','घर लौटने की यात्रा',['@sita-speaks-after-victory','@northward-home','returning-responsibility']],
];
export async function ramayanaEpisodes(){
 const migration=await migrateLegacy(),legacy=migration.stories;const links={};
 const stories=groups.map(([id,arc,en,hi,ids],index)=>{
  const pages=[],refs=[],characters=new Set(),values=new Set();let cover;
  for(const entry of ids){
   if(entry.startsWith('@')){const chapter=chapters.find(c=>c.id===entry.slice(1)),book=asBook(chapter);cover||={src:book.image,alt:book.alt};
    for(const scene of chapter.scenes)pages.push({page_number:pages.length+1,scene_title:scene.title,text:{en:scene.paragraphs.map(p=>p.en).join('\n\n'),hi:scene.paragraphs.map(p=>p.hi).join('\n\n')},image:{src:book.image,alt:book.alt}});
    refs.push(...chapter.sources.map(s=>({book:'Valmiki Ramayana',arc,citation:s.label.replace('Valmiki Ramayana · ',''),external_url:s.url})));
   }else{const old=legacy.find(s=>s.id===entry);cover||=old.cover_image;old.characters.forEach(x=>characters.add(x));old.values.forEach(x=>values.add(x));refs.push(...old.source_refs);
    links[old.id]={id,start:pages.length+1,folios:{}};
    const raw=(awaitLegacyCache||[]).find(b=>b.id===old.id);
    old.pages.forEach((p,i)=>{links[old.id].folios[raw?.folios[i]?.id||`page-${i+1}`]=pages.length+1;pages.push({...p,page_number:pages.length+1});});
   }
  }
  return {id,slug:id,collection:'ramayana',book:'Valmiki Ramayana',arc,order:index+1,title:{en,hi},subtitle:{en:`An illustrated journey through ${arc}.`,hi:`${{'Bala Kanda':'बालकाण्ड','Ayodhya Kanda':'अयोध्याकाण्ड','Aranya Kanda':'अरण्यकाण्ड','Kishkindha Kanda':'किष्किन्धाकाण्ड','Sundara Kanda':'सुन्दरकाण्ड','Yuddha Kanda':'युद्धकाण्ड'}[arc]} की चित्रित कथा-यात्रा।`},synopsis:{en,hi},cover_image:cover,source_refs:[...new Map(refs.map(r=>[r.external_url,r])).values()],characters:[...characters],places:({'Bala Kanda':['Ayodhya','Mithila','Siddhashrama'],'Ayodhya Kanda':['Ayodhya','Shringaverapura','Chitrakuta','Nandigrama'],'Aranya Kanda':['Panchavati','Matanga’s hermitage'],'Kishkindha Kanda':['Rishyamukha','Kishkindha','Southern seashore'],'Sundara Kanda':['Mahendra','Lanka','Ashoka grove'],'Yuddha Kanda':['Lanka','Ayodhya','Nandigrama']})[arc],values:[...values],moods:['Contemplative','Wonder'],age_band:'older-12+',duration_min:Math.ceil(pages.reduce((n,p)=>n+wordCount(p.text.en),0)/150),festival_tags:arc==='Yuddha Kanda'?['Diwali']:[],status:'draft',pages};
 });
 return {stories,links};
}
import {publicBooks} from '../books/model.mjs';
const awaitLegacyCache=await publicBooks();
