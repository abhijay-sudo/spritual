// Explicit editorial import. The application build reads stories.json, not these legacy adapters.
import {writeFile} from 'node:fs/promises';
import {ramayanaEpisodes} from './ramayana.mjs';
import {expandedShorts} from './drafts/expanded-shorts.mjs';
import ganesha from './drafts/ganesha-the-nearer-world.mjs';
import devi from './drafts/devi-two-requests.mjs';
import mahabharata from './drafts/mahabharata-the-companion.mjs';
import {assertCatalogue,wordCount} from './validate.mjs';
import {storyPath,collectionPath,bookPath,arcPath} from './taxonomy.mjs';
import {collections as oldCollections} from '../catalog.mjs';
const ramayana=await ramayanaEpisodes(),shorts=await expandedShorts();
const stories=assertCatalogue([...ramayana.stories,...shorts,devi,ganesha,mahabharata].map(s=>({...s,duration_min:Math.ceil(Math.max(s.pages.reduce((n,p)=>n+wordCount(p.text.en),0)/150,s.pages.reduce((n,p)=>n+wordCount(p.text.hi),0)/130))})));
const aliases={},legacy={};
for(const [old,link]of Object.entries(ramayana.links)){const story=stories.find(s=>s.id===link.id);legacy[old]={...link,paths:{en:storyPath(story),hi:storyPath(story,'hi')}};}
for(const story of shorts)legacy[story.id]={id:story.id,start:1,folios:{opening:7},paths:{en:storyPath(story),hi:storyPath(story,'hi')}};
for(const [old,link]of Object.entries(legacy))for(const lang of ['en','hi'])for(const prefix of ['books/read','story','read'])aliases[`${lang==='hi'?'/hi':''}/${prefix}/${old}/`]=`${link.paths[lang]}?from=${old}`;
for(const lang of ['en','hi']){const prefix=lang==='hi'?'/hi':'';for(const old of ['/books/','/library/','/library/sources/'])aliases[prefix+old]=prefix+'/#collections';for(const old of ['/books/stories/','/library/stories/'])aliases[prefix+old]=prefix+'/#stories';for(const c of ['ramayana','krishna','shiva'])aliases[`${prefix}/books/${c}/`]=collectionPath(c,lang);aliases[`${prefix}/books/dhruva/`]=arcPath({collection:'krishna',book:'Bhagavata Purana',arc:'Skandha 4'},lang);for(const c of oldCollections){const book=c.id==='ramayana'?'Valmiki Ramayana':c.id==='mahabharata'?'Vyasa Mahabharata':'Shiva Purana';aliases[`${prefix}/library/${c.id}/`]=bookPath({collection:c.id,book},lang);for(const unit of c.units)aliases[`${prefix}/library/${c.id}/${unit.id}/`]=arcPath({collection:c.id,book,arc:unit.title.en},lang);}}
await writeFile(new URL('stories.json',import.meta.url),JSON.stringify(stories,null,2)+'\n');
await writeFile(new URL('legacy-routes.json',import.meta.url),JSON.stringify({aliases,legacy},null,2)+'\n');
console.log(JSON.stringify({stories:stories.length,scenes:stories.reduce((n,s)=>n+s.pages.length,0),aliases:Object.keys(aliases).length}));
