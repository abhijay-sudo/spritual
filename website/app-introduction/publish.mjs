import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {premiumIntroduction} from './premium.mjs';
import {prepareResponsiveImages,responsiveImageHtml,responsiveIntroductionScript} from './responsive-images.mjs';

// Import the owner's exact selected Site; isolate its assets from existing readers.
export async function publishIntroduction(output){
 const root=import.meta.dirname;
 const previous=await readFile(resolve(output,'index.html'),'utf8');
 await mkdir(resolve(output,'reading-room'),{recursive:true});
 await writeFile(resolve(output,'reading-room/index.html'),previous.replaceAll('href="https://spritual.co.in/"','href="https://spritual.co.in/reading-room/"').replace('content="index, follow"','content="noindex, follow"'));
 // The existing language switch derives its destination from the pathname.
 // Mirror the unchanged Hindi reading room so switching retains query and anchor state.
 await mkdir(resolve(output,'hi/reading-room'),{recursive:true});
 const hindi=await readFile(resolve(output,'hi/index.html'),'utf8');
 await writeFile(resolve(output,'hi/reading-room/index.html'),hindi.replaceAll('href="https://spritual.co.in/hi/"','href="https://spritual.co.in/hi/reading-room/"').replace('content="index, follow"','content="noindex, follow"'));
 const manifest=JSON.parse(await readFile(resolve(root,'source-manifest.json'),'utf8'));
 // Both journeys already ship exactly the same Fraunces font. Reuse one URL so
 // a move from the invitation into a book does not download it a second time.
 const importedFont=await readFile(resolve(root,'public/assets/fonts/fraunces-latin.woff2'));
 const sharedFont=await readFile(resolve(output,'assets/fraunces-latin.woff2'));
 if(!importedFont.equals(sharedFont))throw Error('Shared Fraunces font differs from the pinned introduction');
 const sharedFonts=text=>text.replaceAll('/stories-app/assets/fonts/fraunces-latin.woff2','/assets/fraunces-latin.woff2');
 const images=await prepareResponsiveImages(output);
 const edition=JSON.parse(await readFile(resolve(root,'edition-assets/manifest.json'),'utf8'));
 await mkdir(resolve(output,'stories-app/edition'),{recursive:true});
 for(const record of edition.files){
  if(!/^open-book-(640|1024|1536)\.webp$/.test(record.file))throw Error('Invalid edition artwork path');
  const data=await readFile(resolve(root,'edition-assets',record.file));
  if(data.length!==record.bytes||createHash('sha256').update(data).digest('hex')!==record.sha256)throw Error('Edition artwork integrity mismatch');
  await writeFile(resolve(output,'stories-app/edition',record.file),data);
 }

 for(const [file,expected] of Object.entries(manifest.files)){
  const input=resolve(root,'public',file),bytes=await readFile(input);
  if(createHash('sha256').update(bytes).digest('hex')!==expected)throw Error(`Reference source changed without a reviewed manifest update: ${file}`);
  if(file==='index.html')continue;
  const destination=resolve(output,'stories-app',file);
  await mkdir(dirname(destination),{recursive:true});
  if(/\.(css|js)$/.test(file))await writeFile(destination,sharedFonts(responsiveIntroductionScript(file,bytes.toString().replaceAll('assets/','/stories-app/assets/'),images)));
  else await copyFile(input,destination);
 }
 for(const file of ['motion.css','motion.js','premium.css','premium.js','responsive-loading.js'])await writeFile(resolve(output,'stories-app',file),sharedFonts(await readFile(resolve(root,file),'utf8')));
 let html=await readFile(resolve(root,'public/index.html'),'utf8');
 html=html.replaceAll('https://spritual-stories-app.abhijaypl.chatgpt.site/','https://spritual.co.in/')
  .replace('content="noindex, nofollow"','content="index, follow"')
  .replaceAll('https://spritual.co.in/assets/','https://spritual.co.in/stories-app/assets/')
  .replace(/((?:src|href)=")assets\//g,'$1/stories-app/assets/')
  .replace(/((?:src|href)=")([a-z-]+\.(?:css|js))"/g,'$1/stories-app/$2"');
 html=html.replace('</head>','<link rel="stylesheet" href="/stories-app/motion.css">\n<script src="/stories-app/motion.js" defer></script>\n'+'<link rel="alternate" hreflang="en" href="https://spritual.co.in/">\n<link rel="alternate" hreflang="hi" href="https://spritual.co.in/hi/">\n<script src="/stories-app/legacy-links.js"></script>\n</head>');
 await writeFile(resolve(output,'stories-app/legacy-links.js'),`// Preserve bookmarks into the previous reading homepage.\nfunction preserveReadingLink(){if(['world','welcome'].some(key=>new URLSearchParams(location.search).has(key))||['#dharma-yatra','#approach','#questions','#app'].includes(location.hash)){location.replace('/reading-room/'+location.search+location.hash);}}preserveReadingLink();addEventListener('hashchange',preserveReadingLink);\n`);
 // A complete reading journey now sits behind the existing invitation.
 html=html.replace('href="#journey">The stories','href="/books/">The stories')
  .replace('<button type="button" class="cover-enter" data-preview="read">Enter the story ', '<a class="cover-enter" href="/books/read/what-makes-a-person-admirable/">Enter the story ')
  .replace('Enter the story <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>', 'Enter the story <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>')
  .replace('<button type="button" class="text-button" data-preview="read">Read the opening ', '<a class="text-button" href="/books/read/what-makes-a-person-admirable/">Read the opening ')
  .replace('Read the opening <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>', 'Read the opening <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>')
  .replace('</p>\n        </div>\n        <div class="story-dialog-footer">','</p><a class="text-button" data-open-book href="/books/read/rama-bow/">Read in the book ↗</a>\n        </div>\n        <div class="story-dialog-footer">')
  .replace('</body>','<script src="/stories-app/home-bridge.js" defer></script></body>');
 await copyFile(resolve(root,'../books/home-bridge.js'),resolve(output,'stories-app/home-bridge.js'));
 await writeFile(resolve(output,'index.html'),sharedFonts(responsiveImageHtml(premiumIntroduction(html),images)));
}
