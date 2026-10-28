import {mkdir,cp,writeFile,readFile,copyFile,rm,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {collections,books,arcs,bookPath,arcPath,storyPath} from './taxonomy.mjs';
import {home,directory,storyReader,characterPage,savedPage,shell,dailyPage} from './render.mjs';
import {validateCatalogue} from './validate.mjs';

const root=resolve(import.meta.dirname,'..'),release=process.argv.includes('--release'),out=resolve(root,release?'canonical-dist':'../artifacts/canonical-site');
const stories=JSON.parse(await readFile(new URL('stories.json',import.meta.url),'utf8'));
const migration=JSON.parse(await readFile(new URL('legacy-routes.json',import.meta.url),'utf8'));
const contentHash=createHash('sha256').update(JSON.stringify(stories.map(({status,...story})=>story))).digest('hex');
const assetDigest=createHash('sha256');
for(const src of [...new Set(stories.flatMap(s=>[s.cover_image.src,...s.pages.map(p=>p.image.src)]))].sort()){
 const path=src.startsWith('/content-assets/')?resolve(import.meta.dirname,'assets',src.slice('/content-assets/'.length)):src.startsWith('/assets/illustrated/')?resolve(root,'.'+src):resolve(root,'dist','.'+src);
 assetDigest.update(src).update(await readFile(path));
}
const artworkHash=assetDigest.digest('hex');
const issues=validateCatalogue(stories);
if(issues.length)throw Error(JSON.stringify(issues,null,2));
if(release){
 const review=JSON.parse(await readFile(new URL('review.json',import.meta.url),'utf8'));
 const reviewed=review.status==='approved'&&review.reviewer&&review.artworkReview==='approved';
 const ownerAuthorized=review.releaseAuthorization?.kind==='owner-directed-release'&&review.releaseAuthorization?.instruction==='Once you are done, push it live.';
 if((!reviewed&&!ownerAuthorized)||review.contentHash!==contentHash||review.artworkHash!==artworkHash)throw Error('Exact-version review or explicit owner release authorization is required for publication.');
 const unpublished=stories.filter(s=>s.status!=='published');
 if(issues.length||unpublished.length)throw Error(`Release blocked: ${issues.length} schema issues; ${unpublished.length} stories are not published. See artifacts/canonical-migration-report.json.`);
}
await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
await cp(resolve(import.meta.dirname,'assets'),resolve(out,'content-assets'),{recursive:true});
// Copy delivery assets only. No legacy HTML or competing route tree enters this build.
for(const dir of ['assets','experience','books','stories-app'])await cp(resolve(root,'dist',dir),resolve(out,dir),{recursive:true,filter:src=>!src.endsWith('.html')});
for(const image of new Set(stories.flatMap(s=>[s.cover_image.src,...s.pages.map(p=>p.image.src)]))){if(image.startsWith('/assets/illustrated/')){const target=resolve(out,'.'+image);await mkdir(resolve(target,'..'),{recursive:true});await copyFile(resolve(root,'.'+image),target);}}
await copyFile(resolve(root,'books/state.mjs'),resolve(out,'books/state.js'));
await copyFile(resolve(root,'books/book.js'),resolve(out,'books/book.js'));
await copyFile(resolve(root,'experience/manuscript-turn.js'),resolve(out,'experience/manuscript-turn.js'));
await copyFile(new URL('legacy-routes.json',import.meta.url),resolve(out,'legacy-routes.json'));
for(const name of (await readdir(resolve(root,'dist'))).filter(name=>/\.(css|js)$/.test(name)))await cp(resolve(root,'dist',name),resolve(out,name));
for(const name of ['canonical.css','canonical.js'])await cp(resolve(import.meta.dirname,name),resolve(out,name));
await writeFile(resolve(out,'redirect.js'),`const link=document.querySelector('[data-redirect]');if(link){const url=new URL(link.href);if(location.hash&&!url.hash)url.hash=location.hash;location.replace(url.href);}`);
const paths=new Set(),indexablePaths=new Set();async function put(path,html){const folder=resolve(out,'.'+path);await mkdir(folder,{recursive:true});await writeFile(resolve(folder,'index.html'),release?html:html.replace('</head>','<meta name="robots" content="noindex,nofollow"></head>'));paths.add(path);if(!/<meta name="robots" content="noindex/.test(html))indexablePaths.add(path);}
for(const lang of ['en','hi']){
 await put(lang==='hi'?'/hi/':'/',home(stories,lang));
 await put(`${lang==='hi'?'/hi':''}/my-reading/`,savedPage(lang));
 await put(`${lang==='hi'?'/hi':''}/daily/`,dailyPage(stories,lang));
 for(const utility of ['pause','privacy','corrections']){const path=`${lang==='hi'?'/hi':''}/${utility}/`;let html=await readFile(resolve(root,'dist','.'+path,'index.html'),'utf8');const chrome=shell(utility,'',path,lang);html=html.replace(/<header[\s\S]*?<\/header>/,chrome.match(/<header[\s\S]*?<\/header>/)[0]).replace(/<footer[\s\S]*?<\/footer>/,chrome.match(/<footer[\s\S]*?<\/footer>/)[0]).replace('</head>','<link rel="stylesheet" href="/canonical.css"></head>');await put(path,html);}
 for(const collection of collections)await put(`${lang==='hi'?'/hi':''}/collections/${collection.slug}/`,directory(stories,{collection:collection.slug,lang}));
 for(const c of collections)for(const key of c.books){const book=books[key].title;await put(bookPath({collection:c.slug,book},lang),directory(stories,{collection:c.slug,book,lang}));for(const arc of arcs[key])await put(arcPath({collection:c.slug,book,arc},lang),directory(stories,{collection:c.slug,book,arc,lang}));}
 for(const id of new Set(stories.flatMap(s=>s.characters)))await put(`${lang==='hi'?'/hi':''}/characters/${id}/`,characterPage(id,stories,lang));
 for(const story of stories){await put(bookPath(story,lang),directory(stories,{collection:story.collection,book:story.book,lang}));await put(arcPath(story,lang),directory(stories,{collection:story.collection,book:story.book,arc:story.arc,lang}));await put(storyPath(story,lang),storyReader(story,lang));}
}
for(const [old,destination] of Object.entries(migration.aliases)){const folder=resolve(out,'.'+old);await mkdir(folder,{recursive:true});await writeFile(resolve(folder,'index.html'),`<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><link rel="canonical" href="https://spritual.co.in${destination.split('?')[0].split('#')[0]}"><script src="/redirect.js" defer></script><title>Spritual</title></head><body><a data-redirect href="${destination}">Continue reading →</a></body></html>`);}
await writeFile(resolve(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...indexablePaths].map(p=>`<url><loc>https://spritual.co.in${p}</loc></url>`).join('')}</urlset>`);
// Review build is deliberately not indexable; a production export must pass --release.
await writeFile(resolve(out,'robots.txt'),release?'User-agent: *\nAllow: /\nSitemap: https://spritual.co.in/sitemap.xml\n':'User-agent: *\nDisallow: /\n');
const config=JSON.parse(await readFile(resolve(root,'vercel.json'),'utf8'));
config.redirects=Object.entries(migration.aliases).map(([source,destination])=>({source,destination,statusCode:301}));
await writeFile(resolve(out,'redirects.json'),JSON.stringify(config.redirects,null,2));
config.buildCommand='node build.mjs && node content/build.mjs --release';config.outputDirectory='canonical-dist';
await writeFile(resolve(import.meta.dirname,'vercel-release.json'),JSON.stringify(config,null,2)+'\n');
await mkdir(resolve(root,'../artifacts'),{recursive:true});
await writeFile(resolve(root,'../artifacts/canonical-migration-report.json'),JSON.stringify({generatedAt:new Date().toISOString(),contentHash,artworkHash,collections:collections.map(c=>c.slug),stories:stories.length,scenes:stories.reduce((n,s)=>n+s.pages.length,0),routes:paths.size,aliases:migration.aliases,issues,workflow:stories.map(s=>({id:s.id,status:s.status,duration:s.duration_min}))},null,2));
console.log(JSON.stringify({output:out,routes:paths.size,stories:stories.length,schemaIssues:issues.length,releaseReady:release}));
