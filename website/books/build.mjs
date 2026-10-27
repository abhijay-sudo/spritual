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
  await put(base(lang),libraryHome(books,lang,options));
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
