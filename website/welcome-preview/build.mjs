import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

// Owner-authorized website opening; no wider content or app release is implied.
export async function addWelcomePreview(output) {
  const release=JSON.parse(await readFile(resolve(import.meta.dirname,'release.json'),'utf8'));
  if(release.authorizedOn!=='2026-10-24'||release.portraits?.length!==8)throw Error('Welcome artwork release is incomplete.');
  const dir=resolve(output,'stories-app/welcome');
  await mkdir(resolve(dir,'portraits'),{recursive:true});
  for(const file of ['welcome.css','welcome.js']) await copyFile(resolve(import.meta.dirname,file),resolve(dir,file));
  for(const id of ['ganesha','lakshmi','rama','hanuman','shiva','durga','krishna','saraswati']){
    const portrait=release.portraits.find(item=>item.id===id);
    for(const height of [640,960,1280]){
      const variant=portrait?.variants.find(item=>item.height===height);
      const expected=`assets/portraits/${id}-${height}.webp`;
      if(variant?.file!==expected)throw Error('Welcome portrait variant is missing.');
      const artwork=await readFile(resolve(import.meta.dirname,expected));
      if(createHash('sha256').update(artwork).digest('hex')!==variant.sha256)throw Error('Welcome portrait differs from the recorded release.');
      await copyFile(resolve(import.meta.dirname,expected),resolve(dir,'portraits',`${id}-${height}.webp`));
    }
  }
  const figures=[['ganesha','Ganesha','गणेश'],['lakshmi','Lakshmi','लक्ष्मी'],['rama','Rama','राम'],['hanuman','Hanuman','हनुमान'],['shiva','Shiva','शिव'],['durga','Durga','दुर्गा'],['krishna','Krishna','कृष्ण'],['saraswati','Saraswati','सरस्वती']];
  const intro=`<dialog id="welcome-intro" class="welcome-overlay" aria-labelledby="welcome-accessible-title">
    <h2 id="welcome-accessible-title" class="visually-hidden">Welcome to Spritual</h2>
    <div class="welcome-top"><span class="welcome-wordmark" aria-hidden="true">spritual</span><form method="dialog"><button class="welcome-skip" autofocus>Enter Spritual <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form></div>
    <div class="welcome-stage" aria-hidden="true">
      <div class="welcome-light"></div><span class="welcome-edition">A WORLD OF STORIES</span>
      <div class="welcome-figures">${figures.map(([id,en,hi])=>`<figure class="welcome-figure" data-deity="${id}"><img class="welcome-cutout" data-welcome-art data-art="${id}" width="${release.portraits.find(p=>p.id===id).width}" height="${release.portraits.find(p=>p.id===id).height}" alt="" decoding="async"><figcaption>${en}<span lang="hi">${hi}</span></figcaption></figure>`).join('')}</div>
      <div class="welcome-title"><div class="welcome-book"><div class="welcome-book-half welcome-book-left"><img data-opening-page alt=""></div><div class="welcome-book-half welcome-book-right"><img data-opening-page alt=""></div></div><img src="/stories-app/assets/brand-icon.svg" width="64" height="64" alt=""><p>Welcome to</p><div>Spritual<span>.</span></div><small>Stories to return to.</small></div>
    </div>
  </dialog>`;
  let html=await readFile(resolve(output,'index.html'),'utf8');
  html=html.replace('</head>','<link rel="stylesheet" href="/stories-app/welcome/welcome.css"><script src="/stories-app/welcome/welcome.js" defer></script></head>')
    .replace('<div class="footer-links">','<div class="footer-links"><button type="button" data-replay-welcome hidden>Replay welcome</button>')
    .replace('</body>',intro+'</body>');
  await writeFile(resolve(output,'index.html'),html);
}
