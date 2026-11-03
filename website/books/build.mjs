import {experienceHeader} from '../experience/shell.mjs';
import{mkdir,readFile,writeFile,copyFile}from'node:fs/promises';
import{resolve}from'node:path';
import{publicBooks,validateBook}from'./model.mjs';
import{reader,shelf,base}from'./render.mjs';
import{libraryHome,libraryCollections,collectionContents,collectionPath,collectionHomepage}from'./library.mjs';
import{prepareResponsiveImages,responsiveImageHtml}from'../app-introduction/responsive-images.mjs';
export async function buildBooks(out,options={}){
 const books=(await publicBooks()).map(validateBook),routes=[];
 const images=await prepareResponsiveImages(out);
 await mkdir(resolve(out,'books'),{recursive:true});
 for(const name of ['book.css','book.js','state.mjs'])await copyFile(new URL(name,import.meta.url),resolve(out,'books',name.replace('.mjs','.js')));
 for(const name of ['library.css','library.js'])await copyFile(new URL(name,import.meta.url),resolve(out,'books',name));
 async function put(route,html){await mkdir(resolve(out,'.'+route),{recursive:true});await writeFile(resolve(out,'.'+route,'index.html'),responsiveImageHtml(html,images,{page:route.includes('/read/')?'reader':'shelf'}));routes.push(route);}
 for(const lang of ['en','hi']){
  const volumes=libraryCollections(books,options);
  const prefix=lang==='hi'?'/hi':'',hub=libraryHome(books,lang,options);
  const paths=`<nav class="experience-library-paths" aria-label="${lang==='hi'?'पुस्तकालय में खोजें':'Explore the library'}"><a href="${prefix}/books/stories/">${lang==='hi'?'सभी 16 कथाएँ':'All 16 stories'}</a><a href="${prefix}/library/stories/">${lang==='hi'?'मूल्य के अनुसार खोजें':'Browse by value'}</a><a href="${prefix}/reading-room/#dharma-yatra">${lang==='hi'?'धर्म यात्रा':'Dharma Yatra'}</a><a href="${prefix}/library/sources/">${lang==='hi'?'स्रोत-मार्गदर्शिकाएँ':'Source guides'}</a></nav>`;
  const unified=hub.replace(/(<main[^>]*>)/,'$1'+paths).replaceAll(`https://spritual.co.in${base(lang)}`,`https://spritual.co.in${prefix}/library/`);
  await put(`${prefix}/library/stories/`,(await readFile(resolve(out,`.${prefix}/library/index.html`),'utf8')).replaceAll('https://spritual.co.in/library/','https://spritual.co.in/library/stories/').replaceAll('https://spritual.co.in/hi/library/','https://spritual.co.in/hi/library/stories/').replace(/<title>.*?<\/title>/,`<title>${lang==='hi'?'मूल्य के अनुसार कथाएँ':'Stories by value'} — Spritual</title>`));
  await put(base(lang),unified);
  await put(`${prefix}/library/`,unified.replace(experienceHeader(lang,base(lang)),experienceHeader(lang,`${prefix}/library/`)).replace('href="#main"','href="#book-main"'));

  // The searchable legacy catalogue remains available at a stable dedicated route.
  await put(`${base(lang)}stories/`,shelf(books,lang,{indexOnly:true}));
  for(const volume of volumes)await put(collectionPath(volume.id,lang),collectionContents(volume,lang));
  for(const book of books){
   const volume=volumes.find(v=>v.books.some(b=>b.id===book.id)||v.related.some(b=>b.id===book.id));
   const sequence=book.series==='journey'?volume.books:volume.related.some(b=>b.id===book.id)?volume.related:volume.books;
   const index=sequence.findIndex(b=>b.id===book.id),next=sequence[index+1];
   await put(`${base(lang)}read/${book.id}/`,reader(book,lang,{collectionPath:collectionPath(volume.id,lang),next:next?{title:next.title[lang],href:`${base(lang)}read/${next.id}/`}:null,contents:sequence.map(b=>({title:b.title[lang],href:`${base(lang)}read/${b.id}/`,current:b.id===book.id}))}));
  }
 }
 const homepage=resolve(out,'index.html');await writeFile(homepage,collectionHomepage(await readFile(homepage,'utf8'),books,{...options,renderImages:markup=>responsiveImageHtml(markup,images)}));
 const map=resolve(out,'sitemap.xml');const xml=await readFile(map,'utf8');await writeFile(map,xml.replace('</urlset>',routes.map(r=>`<url><loc>https://spritual.co.in${r}</loc></url>`).join('')+'</urlset>'));
 return books;
}
