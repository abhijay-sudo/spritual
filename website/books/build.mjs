import{mkdir,readFile,writeFile,copyFile}from'node:fs/promises';
import{resolve}from'node:path';
import{publicBooks,validateBook}from'./model.mjs';
import{reader,shelf,base}from'./render.mjs';
import{prepareResponsiveImages,responsiveImageHtml}from'../app-introduction/responsive-images.mjs';
export async function buildBooks(out){
 const books=(await publicBooks()).map(validateBook),routes=[];
 const images=await prepareResponsiveImages(out);
 await mkdir(resolve(out,'books'),{recursive:true});
 for(const name of ['book.css','book.js','state.mjs'])await copyFile(new URL(name,import.meta.url),resolve(out,'books',name.replace('.mjs','.js')));
 async function put(route,html){await mkdir(resolve(out,'.'+route),{recursive:true});await writeFile(resolve(out,'.'+route,'index.html'),responsiveImageHtml(html,images,{page:route.includes('/read/')?'reader':'shelf'}));routes.push(route);}
 for(const lang of ['en','hi']){
  await put(base(lang),shelf(books,lang));
  for(const book of books){const sequence=books.filter(b=>b.series===book.series),index=sequence.findIndex(b=>b.id===book.id),next=sequence[index+1];await put(`${base(lang)}read/${book.id}/`,reader(book,lang,{next:next?{title:next.title[lang],href:`${base(lang)}read/${next.id}/`}:null,contents:sequence.map(b=>({title:b.title[lang],href:`${base(lang)}read/${b.id}/`,current:b.id===book.id}))}));}
 }
 const map=resolve(out,'sitemap.xml');const xml=await readFile(map,'utf8');await writeFile(map,xml.replace('</urlset>',routes.map(r=>`<url><loc>https://spritual.co.in${r}</loc></url>`).join('')+'</urlset>'));
 return books;
}
