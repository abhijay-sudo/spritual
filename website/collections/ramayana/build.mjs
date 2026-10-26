import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {chapters,validateCollection,collectionHome,chapterRoute,sceneArt,release,wordCount} from './model.mjs';
import {collectionShelf,collectionReader} from './render.mjs';

export async function buildCollection(out) {
  if(process.env.VERCEL||process.env.CI||!process.argv.includes('--collection-preview'))throw Error('Collection is local review only.');
  if(!resolve(out).endsWith('/artifacts/welcome-site'))throw Error('Refusing to write draft collection to public output.');
  validateCollection();
  const destination=resolve(out,'books/ramayana');await mkdir(destination,{recursive:true});
  for(const name of ['collection.css','collection.js'])await copyFile(new URL(name,import.meta.url),resolve(destination,name));
  await mkdir(resolve(out,'assets/illustrated'),{recursive:true});
  const artwork=[...new Set(chapters.flatMap(c=>sceneArt(c).map(a=>a.file)))];
  const artworkFiles=[];
  for(const file of artwork)for(const width of [640,960,1280]){
    const source=new URL(`../../assets/illustrated/${file}-${width}.jpg`,import.meta.url);
    const bytes=await readFile(source);
    artworkFiles.push({file:`${file}-${width}.jpg`,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),review:'pending'});
    await copyFile(source,resolve(out,`assets/illustrated/${file}-${width}.jpg`));
  }
  for(const lang of ['en','hi']) {
    const put=async(path,html)=>{const dir=resolve(out,'.'+path);await mkdir(dir,{recursive:true});await writeFile(resolve(dir,'index.html'),html);};
    await put(collectionHome(lang),collectionShelf(chapters,lang));
    for(const [index,chapter] of chapters.entries())await put(chapterRoute(chapter.id,lang),collectionReader(chapter,index,chapters,lang));
    const shelf=resolve(out,lang==='hi'?'hi/books/index.html':'books/index.html');
    const old=await readFile(shelf,'utf8');
    await writeFile(shelf,old.replace('<main id="book-main">',`<main id="book-main"><p class="research-notice"><a href="${collectionHome(lang)}">${lang==='hi'?'नया संपादकीय पूर्वावलोकन: २२ अध्यायों की चित्रित रामायण खोलें ↗':'New editorial preview: open the illustrated Ramayana in 22 chapters ↗'}</a></p>`));
  }
  await writeFile(resolve(out,'robots.txt'),'User-agent: *\nDisallow: /\n');
  await writeFile(resolve(destination,'review-manifest.json'),JSON.stringify({...release,chapterCount:chapters.length,englishNarrativeWords:chapters.reduce((n,c)=>n+wordCount(c),0),artwork,artworkFiles,chapters:chapters.map(c=>({id:c.id,words:wordCount(c),sources:c.sources,scenes:sceneArt(c),review:'pending'}))},null,2));
  console.log(`Local Ramayana collection: ${chapters.length} bilingual chapters, ${artwork.length} paintings; publication pending.`);
}
