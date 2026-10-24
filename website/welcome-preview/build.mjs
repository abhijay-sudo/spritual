import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

// Owner-authorized website opening; no wider content or app release is implied.
export async function addWelcomePreview(output) {
  const release=JSON.parse(await readFile(resolve(import.meta.dirname,'release.json'),'utf8'));
  const artwork=await readFile(resolve(import.meta.dirname,'assets/deity-silhouettes.webp'));
  if(release.authorizedOn!=='2026-10-24'||createHash('sha256').update(artwork).digest('hex')!==release.publishedWebpSha256)throw Error('Welcome artwork differs from the owner-authorized release.');
  const dir=resolve(output,'stories-app/welcome');
  await mkdir(dir,{recursive:true});
  for(const file of ['welcome.css','welcome.js']) await copyFile(resolve(import.meta.dirname,file),resolve(dir,file));
  await copyFile(resolve(import.meta.dirname,'assets/deity-silhouettes.webp'),resolve(dir,'deity-silhouettes.webp'));
  const figures=[['rama','Rama','राम'],['shiva','Shiva','शिव'],['krishna','Krishna','कृष्ण'],['hanuman','Hanuman','हनुमान']];
  const intro=`<dialog id="welcome-intro" class="welcome-overlay" aria-labelledby="welcome-accessible-title">
    <h2 id="welcome-accessible-title" class="visually-hidden">Welcome to Spritual</h2>
    <div class="welcome-top"><span class="welcome-wordmark" aria-hidden="true">spritual</span><form method="dialog"><button class="welcome-skip" autofocus>Enter Spritual <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button></form></div>
    <div class="welcome-stage" aria-hidden="true">
      <div class="welcome-light"></div><div class="welcome-horizon"></div>
      <svg class="welcome-arch" viewBox="0 0 560 640" preserveAspectRatio="xMidYMid meet" fill="none"><path d="M202 20C82 78 48 194 48 320s34 242 154 300M358 20c120 58 154 174 154 300s-34 242-154 300" pathLength="1"/><path class="welcome-star" d="M48 310q0 10-10 10 10 0 10 10 0-10 10-10-10 0-10-10ZM512 310q0 10-10 10 10 0 10 10 0-10 10-10-10 0-10-10Z"/></svg>
      <div class="welcome-figures">${figures.map(([id,en,hi],i)=>`<figure class="welcome-figure" data-deity="${id}"><span class="welcome-script" lang="hi">${hi}</span><div class="welcome-cutout" style="--figure-position:${i*100/3}%"></div><figcaption>${en}<span lang="hi">${hi}</span></figcaption></figure>`).join('')}</div>
      <div class="welcome-title"><img src="/stories-app/assets/brand-icon.svg" width="64" height="64" alt=""><p>Welcome to</p><div>Spritual<span>.</span></div><small>Stories to return to.</small></div>
    </div>
  </dialog>`;
  let html=await readFile(resolve(output,'index.html'),'utf8');
  html=html.replace('</head>','<link rel="preload" as="image" href="/stories-app/welcome/deity-silhouettes.webp"><link rel="stylesheet" href="/stories-app/welcome/welcome.css"><script src="/stories-app/welcome/welcome.js" defer></script></head>')
    .replace('<div class="footer-links">','<div class="footer-links"><button type="button" data-replay-welcome hidden>Replay welcome</button>')
    .replace('</body>',intro+'</body>');
  await writeFile(resolve(output,'index.html'),html);
}
