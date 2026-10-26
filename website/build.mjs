import { mkdir, readFile, writeFile, copyFile, rm, cp, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { copy } from './content.mjs';
import {collections} from './catalog.mjs';
import {libraryHome,collectionPage,richUnitPage,savedPage,libraryTeaser,editorialReader} from './library-views.mjs';
import {stories,storyById,characters,pick} from './stories.mjs';
import {editionStories,editionStoryById,editionCharacters} from './illustrated-chapters.mjs';
import {storyHome,storyLibrary,storyDetail,storyReader,characterPage,dailyPage,myReadingPage,storyPrivacy,correctionsPage,storyGeneratedRoutes,storySitemapRoutes} from './story-views.mjs';
import {journeys} from './illustrated-edition.mjs';
import {lotusNav} from './practice-views.mjs';
import {quietMinutePage,quietEntryScript} from './sanctuary-views.mjs';
import {publicJourneys,withheldStoryIds} from './public-projection.mjs';
import {deliveryFiles} from './delivery-assets.mjs';
import {publicJourneyPage,unavailableChapterPage} from './story-views.mjs';
import {illustratedDetail,illustratedReader,journeyPage} from './illustrated-views.mjs';
import {publishIntroduction} from './app-introduction/publish.mjs';
import {buildBooks} from './books/build.mjs';
const editorial=process.argv.includes('--editorial-preview');
const welcomePreview=process.argv.includes('--welcome-preview');
const collectionPreview=process.argv.includes('--collection-preview');
if(collectionPreview&&(!welcomePreview||process.env.VERCEL||process.env.CI))throw Error('Collection drafts require the local --welcome-preview --collection-preview build.');
const sanatanPreview=process.argv.includes('--sanatan-preview');
const sanatanRelease=process.argv.includes('--sanatan-release');
if(sanatanRelease)throw Error('Illustrated release is blocked: exact-version editorial and artwork approvals are unresolved. Use --sanatan-preview for local review, or the unflagged public projection.');
const sanatanEdition=sanatanPreview||sanatanRelease;
const sanatan=!editorial;
const renderedStories=sanatanEdition?editionStories:stories;
const renderedStoryById=sanatanEdition?editionStoryById:storyById;
const renderedCharacters=sanatanEdition?editionCharacters:characters;
if(editorial&&(process.env.VERCEL||process.env.CI))throw Error('Editorial source previews are local only.');
if(sanatanPreview&&(process.env.VERCEL||process.env.CI))throw Error('Sanatan release previews are local only.');
if(welcomePreview&&(process.env.VERCEL||process.env.CI))throw Error('Welcome artwork preview is local only.');
if([editorial,sanatanPreview,sanatanRelease,welcomePreview].filter(Boolean).length>1)throw Error('Choose one website build mode.');
const out=resolve(import.meta.dirname,editorial?'../artifacts/editorial-site':sanatanPreview?'../artifacts/sanatan-site':welcomePreview?'../artifacts/welcome-site':'dist');
const staged=editorial?JSON.parse(await readFile(resolve(import.meta.dirname,'../artifacts/library-source/staged.json'),'utf8')):null;
await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true}); await mkdir(`${out}/assets`);
// Deliberate allowlist: the local app's content, artwork, auth and fixture bundle are never deployed here.
for(const file of ['brand.svg','landscape.svg','fraunces-latin.woff2','anek-devanagari.woff2','tiro-devanagari-sanskrit.woff2','tiro-devanagari-hindi.woff2','cormorant-garamond-latin.woff2','cormorant-garamond-italic-latin.woff2','manrope-latin.woff2','plus-jakarta-sans-latin.woff2','OFL-Fraunces.txt','OFL-Anek-Devanagari.txt','OFL-Tiro-Devanagari-Sanskrit.txt','OFL-Cormorant-Garamond.txt','OFL-Manrope.txt','OFL-Plus-Jakarta-Sans.txt','collection-mahabharata.webp','collection-mahabharata-sm.webp','collection-ramayana.webp','collection-ramayana-sm.webp','collection-shiva.webp','collection-shiva-sm.webp','world-rama.webp','world-krishna.webp','world-hanuman.webp','world-shiva.webp']) await copyFile(resolve(import.meta.dirname,'assets',file),`${out}/assets/${file}`);
for(const file of deliveryFiles)await copyFile(resolve(import.meta.dirname,'assets',file),`${out}/assets/${file}`);
if(sanatanEdition)await cp(resolve(import.meta.dirname,'assets/illustrated'),`${out}/assets/illustrated`,{recursive:true});
for(const file of ['site.css','site.js','theme-init.js','session.mjs','library.css','library.js','library-state.mjs','sanctuary.css','sanctuary.js','sanctuary-state.mjs','manuscript.css','manuscript.js','recovery.css','recovery.js']) await copyFile(resolve(import.meta.dirname,file),`${out}/${file.endsWith('.mjs') ? file.replace('.mjs','.js') : file}`);
if(sanatan)for(const file of ['reading.css','reading.js','reading-state.mjs','practice.css','practice.js','practice-cards.js','practice-data.mjs','practice-state.mjs']) await copyFile(resolve(import.meta.dirname,file),`${out}/${file.endsWith('.mjs') ? file.replace('.mjs','.js') : file}`);
await writeFile(`${out}/sanctuary-entry.js`,quietEntryScript);
const arrow='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowBack='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M20 12H5m6-6-6 6 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowOut='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M8 16 17 7M10 7h7v7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowDown='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M12 4v15m-6-6 6 6 6-6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const play='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m9 6 9 6-9 6V6Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>';
const sun='<svg aria-hidden="true" viewBox="0 0 64 64" fill="none"><g stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 43h46M18 36a14 14 0 0 1 28 0M32 7v9M9 17l7 7M55 17l-7 7M10 52h44"/></g></svg>';
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const worlds=[
 {id:'neutral',en:'Still',hi:'शांत',mark:'○'},
 {id:'epic',en:sanatan?'Epic':'Mahabharata',hi:sanatan?'महाकाव्य':'महाभारत',mark:sanatan?'क':'18'},
 {id:'rama',en:'Rama',hi:'राम',mark:'रा'},
 {id:'krishna',en:'Krishna',hi:'कृष्ण',mark:'कृ'},
 {id:'hanuman',en:'Hanuman',hi:'हनुमान',mark:'ह'},
 {id:'shiva',en:'Shiva',hi:'शिव',mark:'शि'}
];
function routeWorld(route){
 const storyId=route.match(/^(?:story|read)\/([^/]+)\//)?.[1];
 if(storyId&&renderedStoryById[storyId])return renderedStoryById[storyId].world;
 const characterId=route.match(/^characters\/([^/]+)\//)?.[1];
 if(characterId&&renderedCharacters[characterId])return renderedCharacters[characterId].world;
 if(route.startsWith('library/shiva/'))return 'shiva';
 if(route.startsWith('library/ramayana/kishkindha/')||route.startsWith('library/ramayana/sundara/'))return 'hanuman';
 if(route.startsWith('library/ramayana/'))return 'rama';
 if(route.startsWith('library/mahabharata/'))return 'epic';
 return 'neutral';
}
function worldChooser(lang,route){
 const hi=lang==='hi',path=`${hi?'/hi/':'/'}${route}`;
 return `<section class="menu-theme" aria-labelledby="world-label"><div class="menu-theme-heading"><div><p class="eyebrow">${hi?'दृश्य रूप':'VISUAL THEME'}</p><h3 id="world-label">${hi?'पृष्ठ का रूप चुनें':'Choose the page’s look'}</h3></div></div><nav class="world-options" aria-label="${hi?'दृश्य रूप':'Visual theme'}">${worlds.map(w=>`<a href="${path}?world=${w.id}" data-world-option="${w.id}"><span aria-hidden="true">${w.mark}</span>${hi?w.hi:w.en}</a>`).join('')}</nav><p id="world-status" class="sr-only" role="status"></p></section>`;
}
function header(c,lang,route){
 const base=lang==='hi'?'/hi/':'/';const hi=lang==='hi';const ritual=route==='pause/';
 const primary=sanatan?[
  {label:hi?'यात्रा':'Yatra',target:'#dharma-yatra',active:route.startsWith('journeys/')||route.startsWith('library/')||route.startsWith('story/')||route.startsWith('characters/')},
  {label:hi?'आज':'Today',target:'daily/',active:route==='daily/'},
  {label:hi?'शांत पल':'Quiet moment',target:'pause/',active:route==='pause/'},
  {label:hi?'सहेजा':'Saved',target:'my-reading/',active:route==='my-reading/'}
 ]:[
  {label:hi?'पुस्तकालय':'Library',target:'library/',active:route.startsWith('library/')},
  {label:hi?'शांत पल':'Quiet moment',target:'pause/',active:route==='pause/'},
  {label:hi?'दृष्टिकोण':'Approach',target:'#approach',active:false},
  {label:hi?'सवाल':'Questions',target:'#questions',active:false},
  {label:hi?'सहेजे स्थान':'Saved places',target:'library/saved/',active:route==='library/saved/'}
 ];
 const navLink=item=>`<a href="${base}${item.target}" ${item.active?'aria-current="page"':''}>${item.label}</a>`;
 const primaryLinks=primary.map(navLink);
 const language=`<div class="language-pair" aria-label="${hi?'भाषा':'Language'}">${hi?`<a class="language" href="/${route}" lang="en" aria-label="English">EN</a><span aria-current="true" lang="hi">हिन्दी</span>`:`<span aria-current="true" lang="en">EN</span><a class="language" href="/hi/${route}" lang="hi">हिन्दी</a>`}</div>`;
 const themeOptions=worlds.map(w=>`<a href="${base}${route}?world=${w.id}" data-world-option="${w.id}"><span aria-hidden="true">${w.mark}</span>${hi?w.hi:w.en}</a>`).join('');
 return `<a class="skip" href="#main">${c.skip}</a><header class="header wrap ${ritual?'ritual-header':''}"><a class="brand" href="${base}" aria-label="Spritual ${hi?'मुखपृष्ठ':'home'}"><img src="/assets/brand.svg" width="36" height="36" alt=""/><span>Spritual<span class="brand-dot">.</span></span></a>${ritual?'':`<nav class="desktop-nav" aria-label="${hi?'मुख्य नेविगेशन':'Main navigation'}">${primaryLinks.join('')}</nav>`}<div class="header-actions">${sanatan?lotusNav(lang):''}${language}<button class="font-toggle" type="button" data-font-toggle aria-pressed="false" aria-label="${hi?'अक्षर आकार बदलें':'Change text size'}"><span aria-hidden="true">Aa</span><span class="sr-only" data-font-status>${hi?'सामान्य अक्षर':'Default text'}</span></button><details class="theme-picker"><summary aria-label="${hi?'थीम चुनें':'Choose theme'}"><span aria-hidden="true">◐</span><span data-theme-label>${hi?'शांत':'Still'}</span></summary><div class="theme-popover"><p>${hi?'दृश्य रूप':'Visual theme'}</p><div class="world-options">${themeOptions}</div><p id="world-status" class="sr-only" role="status"></p></div></details>${ritual?`<a class="ritual-close text-link" href="${base}">${hi?'बंद करें':'Close'} <span aria-hidden="true">×</span></a>`:''}</div></header>${route.startsWith('library/')&&!(sanatan&&(route==='library/'||route==='library/saved/'))?`<nav class="library-subnav wrap" aria-label="${hi?'स्रोत-मार्गदर्शिका नेविगेशन':'Source guide navigation'}">${sanatan?`<a href="${base}library/sources/" ${route==='library/sources/'?'aria-current="page"':''}>${hi?'स्रोत-मार्गदर्शिकाएँ':'Source guides'}</a>`:''}${collections.map(x=>`<a href="${base}library/${x.id}/" ${route.startsWith('library/'+x.id+'/')?'aria-current="page"':''}>${x.id==='shiva'?(hi?'शिव':'Shiva'):x.title[lang]}</a>`).join('')}<a href="${base}library/saved/" ${route==='library/saved/'?'aria-current="page"':''}>${hi?'सहेजी मार्गदर्शिकाएँ':'Saved guides'}</a></nav>`:''}`;
}
function footer(c,lang){
 let b=lang==='hi'?'/hi/':'/';
 const reviewNote=sanatanPreview
   ? (lang==='hi'?'मौजूदा दस पुनर्कथनों के लिए मालिक के अभिलेख में समीक्षा दर्ज है; बारह नए संयोजक अध्याय और सभी नए चित्र केवल स्थानीय समीक्षा के लिए हैं।':'The owner records review for the ten existing retellings; twelve new connecting chapters and all new artwork remain local-review-only.')
   : (lang==='hi'?'स्रोत-मानचित्रित पुनर्कथन · संपादकीय विवरण उपलब्ध':'Source-Mapped Retellings · Editorial Details Available');
 return `<footer class="footer wrap"><div><a class="brand" href="${b}"><img src="/assets/brand.svg" width="36" height="36" alt=""/><span>Spritual.</span></a><p>${sanatan?(lang==='hi'?'निःशुल्क, स्रोत-सजग कथाएँ। अपनी गति से पढ़ें।':'Free, source-aware stories. Read at your own pace.'):c.footerLine}</p></div><nav class="footer-links" aria-label="${lang==='hi'?'पादलेख':'Footer'}"><a href="${b}library/">${lang==='hi'?'कथाएँ':'Stories'}</a>${sanatan?`<a href="${b}daily/">${lang==='hi'?'आज':'Today'}</a><a href="${b}my-reading/">${lang==='hi'?'सहेजा':'Saved'}</a><a href="${b}library/sources/">${lang==='hi'?'स्रोत-मार्गदर्शिकाएँ':'Source guides'}</a><a href="${b}corrections/">${lang==='hi'?'सुधार':'Corrections'}</a>`:`<a href="${b}pause/">${c.pauseTitle}</a>`}<a href="${b}privacy/">${c.privacy}</a><span>© 2026 Spritual</span></nav><p class="footer-note"><span>${sanatan?reviewNote:c.footerNote}</span></p></footer>`;
}
function home(c,lang){const b=lang==='hi'?'/hi/':'/';const hi=lang==='hi';return `<main id="main">
<section class="hero wrap"><div class="hero-copy" data-enter><p class="eyebrow">${c.eyebrow}</p><h1>${c.hero}</h1><p class="hero-intro">${c.intro}</p><div class="hero-actions"><a class="button" href="${b}pause/">${c.pauseTitle}${arrow}</a><a class="button outline" href="${b}library/">${hi?'पुस्तकालय में आएँ':'Enter the library'}${arrow}</a></div><a id="home-continue" class="home-continue text-link" hidden>${hi?'सहेजी मार्गदर्शिका जारी रखें':'Continue your saved guide'}${arrow}</a><p class="fine">${c.free}</p></div><div class="hero-visual" data-enter><div class="arch-frame"><img class="landscape" data-context-art src="/assets/landscape.svg" width="900" height="1120" fetchpriority="high" alt=""/><div class="art-caption"><span class="eyebrow" data-context-kicker>${c.artLabel}</span><p data-context-caption>${c.artTitle}</p></div></div><div class="orbit-seal" aria-hidden="true">${sun}<span data-context-seal>STILLNESS<br>WITHIN</span></div></div><div class="trust">${(hi?['60 सेकंड का शांत पल','English और हिन्दी','अपनी गति, बिना स्ट्रीक']:['Stillness in 60 seconds','English & हिन्दी','Your pace, no streaks']).map(x=>`<span>${x}</span>`).join('')}</div></section>
${iconizeLibrary(libraryTeaser(lang))}
<section class="section wrap" id="experience"><div class="section-heading"><h2>${hi?'Spritual का तरीका':'The Spritual way'}</h2><p class="section-intro">${c.experienceIntro}</p></div><div class="pillars">${c.pillars.map((p,i)=>`<article class="pillar reveal"><span class="number">0${i+1}</span><h3>${p[0]}</h3><p>${p[1]}</p><span class="eyebrow pillar-caption">${p[2]}</span></article>`).join('')}</div><p class="development-note">${c.develop}</p></section>
<section class="moments"><div class="wrap moments-grid"><div><p class="eyebrow">${c.momentsLabel}</p><h2>${c.momentsTitle}</h2><p>${c.momentsIntro}</p><div class="moment-tabs" role="group" aria-label="${c.momentsLabel}"><span class="moment-indicator" aria-hidden="true"></span>${c.moments.map((m,i)=>`<button type="button" data-moment="${i}" aria-pressed="${i===0}">${m[0]}${arrowOut}</button>`).join('')}</div></div><div class="reflection-card reveal" data-mood="stillness"><div class="reflection-top"><span class="eyebrow">${c.sample}</span>${sun}</div><div id="moment-copy" aria-live="polite"><h3>${c.moments[0][1]}</h3><p>${c.moments[0][2]}</p></div><a id="moment-link" class="button" href="${b}pause/?moment=stillness">${c.momentAction}${arrow}</a><span class="fine">${c.momentNote}</span></div></div></section>
<section class="philosophy" id="approach"><div class="wrap philosophy-grid"><div><p class="eyebrow">${c.philosophyLabel}</p><h2>${c.philosophy}</h2><div class="principles">${c.principles.map((p,i)=>`<div class="reveal"><span aria-hidden="true">0${i+1}</span><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join('')}</div></div><div class="app-well" id="app"><div class="device-preview" aria-label="${hi?'वेबसाइट के शांत पल का चित्र':'Illustration of the website quiet moment'}"><p class="eyebrow">Spritual</p><h3>${c.pauseTitle}</h3><div class="preview-dial" aria-hidden="true">1:00</div><p>${c.silence}</p></div><p class="ready-caption">${hi?'इस वेबसाइट पर उपलब्ध।':'Ready on this website.'}</p><div class="future-app"><p><span class="status-dot"></span>${c.appStatus}</p><ul>${c.appPoints.map(x=>`<li>${x}</li>`).join('')}</ul><p class="fine">${c.appNote}</p></div></div></div></section>
<section class="faq wrap section" id="questions"><div><p class="eyebrow">${c.nav[2]}</p><h2>${c.faqTitle}</h2></div><div>${c.faqs.map(f=>`<details><summary>${f[0]}<span aria-hidden="true">+</span></summary><div class="faq-answer"><p>${f[1]}</p></div></details>`).join('')}</div><div class="close-line"><p>${c.finalText}</p><a class="text-link" href="${b}pause/">${c.pauseTitle}${arrow}</a></div></section></main>`;}
function pause(c,lang){return quietMinutePage(c,lang);}
function privacy(c,lang){let b=lang==='hi'?'/hi/':'/';return `<main class="legal wrap" id="main"><a class="text-link" href="${b}">${arrowBack}${c.back}</a><p class="eyebrow">${c.privacy}</p><h1>${c.privacyTitle}</h1><p class="lead">${c.privacyIntro}</p>${c.privacySections.map((p,i)=>`<section><h2>${p[0]}</h2><p>${p[1]}</p>${i===2?`<a class="text-link" href="https://vercel.com/legal/privacy-policy" rel="noreferrer">Vercel Privacy Notice${arrowOut}</a>`:''}</section>`).join('')}<a class="button" href="${b}pause/">${c.savedHeading}${arrow}</a></main>`;}
function page(c,lang,route,body,noindex=false,customTitle=null,customDescription=null){let url=`https://spritual.co.in/${lang==='hi'?'hi/':''}${route}`;let title=customTitle|| (route==='pause/'?`${c.pauseTitle} — Spritual`:route==='privacy/'?`${c.privacy} — Spritual`:c.title),description=customDescription||c.description;const context=routeWorld(route),quiet=route.startsWith('read/');return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>${title}</title><meta name="description" content="${esc(description)}"/><meta name="theme-color" content="#FBF8F3"/><meta name="robots" content="${(noindex||editorial||sanatanPreview)?'noindex, follow':'index, follow'}"/><link rel="canonical" href="${url}"/><link rel="alternate" hreflang="en" href="https://spritual.co.in/${route}"/><link rel="alternate" hreflang="hi" href="https://spritual.co.in/hi/${route}"/><link rel="alternate" hreflang="x-default" href="https://spritual.co.in/${route}"/><meta property="og:type" content="website"/><meta property="og:title" content="${title}"/><meta property="og:description" content="${esc(description)}"/><meta property="og:url" content="${url}"/><meta property="og:site_name" content="Spritual"/><meta property="og:image" content="https://spritual.co.in/assets/social.png"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta property="og:locale" content="${lang==='hi'?'hi_IN':'en_IN'}"/><meta name="twitter:card" content="summary_large_image"/><link rel="icon" href="/assets/brand.svg" type="image/svg+xml"/><link rel="preload" as="font" href="/assets/cormorant-garamond-latin.woff2" type="font/woff2" crossorigin/><link rel="preload" as="font" href="/assets/plus-jakarta-sans-latin.woff2" type="font/woff2" crossorigin/><link rel="preload" as="font" href="/assets/tiro-devanagari-hindi.woff2" type="font/woff2" crossorigin/><script src="/theme-init.js"></script>${route==='pause/'?'<script src="/sanctuary-entry.js"></script>':''}<link rel="stylesheet" href="/site.css"/><link rel="stylesheet" href="/library.css"/>${sanatan?'<link rel="stylesheet" href="/reading.css"/><link rel="stylesheet" href="/practice.css"/><script type="module" src="/practice.js"></script>':''}<link rel="stylesheet" href="/manuscript.css"/><link rel="stylesheet" href="/recovery.css"/><link rel="stylesheet" href="/sanctuary.css"/><script type="module" src="/site.js"></script>${sanatan?'<script type="module" src="/recovery.js"></script>':''}</head><body data-page="${route||'home'}" data-route-world="${context}">${editorial?'<div class="editorial-banner">LOCAL EDITORIAL PREVIEW — NOT APPROVED FOR PUBLICATION</div>':''}${sanatanPreview?'<div class="editorial-banner">LOCAL SANATAN RELEASE PREVIEW — NOT THE LIVE SITE</div>':''}${quiet?'':header(c,lang,route)}${body}${quiet?'':footer(c,lang)}<script type="application/json" id="page-copy">${JSON.stringify(c).replaceAll('<','\\u003c')}</script></body></html>`;}
const baseRoutes=sanatan?[['',storyHome],['pause/',pause],['privacy/',storyPrivacy],['corrections/',correctionsPage]]:[['',home],['pause/',pause],['privacy/',privacy]];
for(const [lang,c] of Object.entries(copy)) for(const [route,render] of baseRoutes){let dir=`${out}/${lang==='hi'?'hi/':''}${route}`;await mkdir(dir,{recursive:true});const body=sanatan&&route!=='pause/'?render(lang):render(c,lang),description=route===''?(sanatanEdition?(sanatanRelease?(lang==='hi'?'राम की वापसी तक बाईस अध्यायों वाला स्रोत-सजग चित्रित रामायण संक्षेप।':'A source-aware illustrated Ramayana abridgement in twenty-two chapters through Rama’s return.'):(lang==='hi'?'राम की वापसी तक बाईस अध्यायों वाला स्रोत-सजग, स्थानीय-समीक्षा-मात्र चित्रित रामायण पूर्वावलोकन।':'A source-aware, local-review-only illustrated Ramayana preview in twenty-two chapters through Rama’s return.')):(lang==='hi'?'परिवारों, युवा जिज्ञासुओं और बुज़ुर्गों के लिए दस निःशुल्क, स्रोत-सजग रामायण पुनर्कथन।':'Ten free, source-aware Ramayana retellings for families, young seekers and elders.')):route==='privacy/'?(lang==='hi'?'डिवाइस पर रहने वाली पठन-प्रगति, बुकमार्क और पसंद के बारे में स्पष्ट जानकारी।':'Clear information about device-only reading progress, bookmarks and preferences.'):route==='corrections/'?(lang==='hi'?'सार्वजनिक सुधार मार्ग और समीक्षा-पारदर्शिता।':'Public correction route and review transparency.'):null,title=route===''&&sanatan?(sanatanEdition?(lang==='hi'?'Spritual चित्रित रामायण — पढ़ें और मनन करें':'Spritual Illustrated Ramayana — Read and reflect'):(lang==='hi'?'पढ़ने, मनन करने और साथ बाँटने की कथाएँ — Spritual':'Stories to read, reflect on, and share — Spritual')):route==='corrections/'?(lang==='hi'?'सुधार की सूचना दें — Spritual':'Report a correction — Spritual'):null;await writeFile(`${dir}index.html`,page(c,lang,route,body,route==='privacy/',title,sanatan?description:null));}
const libraryRoutes=[];
function iconizeLibrary(body){return body.replaceAll('>↗</span>',`>${arrowOut}</span>`).replaceAll(' ↗',arrowOut).replaceAll(' →',arrow).replaceAll('← ',arrowBack).replaceAll(' ↓',arrowDown);}
async function writeLibrary(lang,route,body,title,description=null){const dir=`${out}/${lang==='hi'?'hi/':''}${route}`;await mkdir(dir,{recursive:true});await writeFile(`${dir}index.html`,page(copy[lang],lang,route,iconizeLibrary(body),route==='library/saved/',title+' — Spritual',description));libraryRoutes.push(`${lang==='hi'?'hi/':''}${route}`);}
for(const lang of ['en','hi']){
 await writeLibrary(lang,'library/',sanatan?storyLibrary(lang):libraryHome(lang),lang==='hi'?'पुस्तकालय':'Library',sanatan?(sanatanEdition?(lang==='hi'?'बाईस-अध्याय चित्रित रामायण को पात्र, मूल्य और पठन-समय के अनुसार खोजें।':'Search the twenty-two-chapter illustrated Ramayana by character, value and reading time.'):(lang==='hi'?'आयु-सुझाव, मूल्य और पठन-समय के अनुसार दस निःशुल्क रामायण कथाएँ खोजें।':'Search ten free Ramayana stories by age guidance, value and reading time.')):null);
 if(sanatan)await writeLibrary(lang,'library/sources/',libraryHome(lang,{sourceDirectory:true}),lang==='hi'?'स्रोत-मार्गदर्शिकाएँ':'Source guides');
 await writeLibrary(lang,'library/saved/',savedPage(lang),lang==='hi'?'सहेजे स्थान':'Saved places');
 for(const c of collections){await writeLibrary(lang,`library/${c.id}/`,collectionPage(c,lang,staged),c.title[lang]);for(const u of c.units)await writeLibrary(lang,`library/${c.id}/${u.id}/`,richUnitPage(c,u,lang,staged),u.title[lang]);}
}
if(sanatan)for(const lang of ['en','hi']){
 const c=copy[lang];
 const writeStory=async(route,body,title,description,noindex=false)=>{const dir=`${out}/${lang==='hi'?'hi/':''}${route}`;await mkdir(dir,{recursive:true});await writeFile(`${dir}index.html`,page(c,lang,route,body,noindex,title+' — Spritual',description));};
 await writeStory('daily/',dailyPage(lang),lang==='hi'?'आज की कथा':'Today’s story',sanatanEdition?(lang==='hi'?'बाईस-अध्याय चित्रित रामायण से आज का शांत, बिना स्ट्रीक वाला निमंत्रण।':'A gentle, streak-free daily invitation from the twenty-two-chapter illustrated Ramayana.'):(lang==='hi'?'दस पूर्ण कथाओं के पुस्तकालय से आज का शांत, बिना स्ट्रीक वाला निमंत्रण।':'A gentle, streak-free daily invitation from the same ten-story library.'),true);
 await writeStory('my-reading/',myReadingPage(lang),lang==='hi'?'सहेजा और पठन':'Saved & reading',lang==='hi'?'इस डिवाइस पर सहेजी गई कथा-प्रगति, बुकमार्क और स्रोत-मार्गदर्शिकाएँ देखें।':'Open story progress, bookmarks and source guides saved only on this device.',true);
 for(const story of renderedStories){const description=pick(story.description,lang);await writeStory(`story/${story.id}/`,sanatanEdition?illustratedDetail(story,lang):storyDetail(story,lang),pick(story.title,lang),description);await writeStory(`read/${story.id}/`,sanatanEdition?illustratedReader(story,lang):storyReader(story,lang),pick(story.title,lang),description,true);}
 if(sanatanEdition)for(const journey of Object.values(journeys))await writeStory(`journeys/${journey.id}/`,journeyPage(journey,lang),pick(journey.title,lang),pick(journey.description,lang),sanatanPreview);
 if(!sanatanEdition){
  for(const journey of Object.values(publicJourneys))await writeStory(`journeys/${journey.id}/`,publicJourneyPage(journey,lang),pick(journey.title,lang),pick(journey.description,lang));
  for(const id of withheldStoryIds)for(const kind of ['read','story'])await writeStory(`${kind}/${id}/`,unavailableChapterPage(id,kind,lang),lang==='hi'?'अध्याय अभी उपलब्ध नहीं':'Chapter currently unavailable',null,true);
 }
 for(const character of Object.values(renderedCharacters))await writeStory(`characters/${character.slug}/`,characterPage(character,lang),pick(character.name,lang),pick(character.bio,lang));
}
if(editorial){await mkdir(`${out}/sources`,{recursive:true});for(const source of staged.sources)await copyFile(resolve(import.meta.dirname,`../artifacts/library-source/pg${source.id}.txt`),`${out}/sources/pg${source.id}.txt`);for(const c of collections)for(const u of c.units){const record=staged.units[`${c.id}/${u.id}`];if(!record)continue;for(const ch of record.chapters){const route=`library/${c.id}/${u.id}/read/${ch.id}/`;const dir=`${out}/${route}`;await mkdir(dir,{recursive:true});await writeFile(`${dir}index.html`,page(copy.en,'en',`library/${c.id}/${u.id}/`,editorialReader(c,u,ch,record.chapters,record.introduction),true,ch.title+' — Editorial preview'));}}}
await writeFile(`${out}/404.html`,page(copy.en,'en','',`<main class="notfound wrap" id="main">${sun}<p class="eyebrow">404</p><h1>${copy.en.notfound}</h1><p>${copy.en.notfoundText}</p><a href="/" class="button">${copy.en.back}${arrow}</a></main>`,true));
await writeFile(`${out}/robots.txt`,'User-agent: *\nAllow: /\nSitemap: https://spritual.co.in/sitemap.xml\n');
await writeFile(`${out}/sitemap.xml`,`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['','hi/','pause/','hi/pause/',...(sanatan?['corrections/','hi/corrections/']:[]),...libraryRoutes.filter(r=>!r.endsWith('saved/')),...(sanatan?storySitemapRoutes():[]),...(sanatanEdition?Object.keys(journeys).flatMap(id=>[`journeys/${id}/`,`hi/journeys/${id}/`]):[])].map(p=>`<url><loc>https://spritual.co.in/${p}</loc></url>`).join('')}</urlset>`);
try { await copyFile(resolve(import.meta.dirname,'assets/social.png'),`${out}/assets/social.png`); } catch { console.warn('Social image not yet generated.'); }
// Only the ordinary public homepage changes. Editorial and illustrated gates remain intact.
if(!editorial&&!sanatanEdition){await publishIntroduction(out);await buildBooks(out);const {addWelcomePreview}=await import('./welcome-preview/build.mjs');await addWelcomePreview(out);}
const generatedPageCount=(await readdir(out,{recursive:true})).filter(file=>file==='index.html'||file.endsWith('/index.html')).length;
console.log(`Built ${generatedPageCount} ${sanatanPreview?'local release preview':sanatanRelease?'illustrated public release':editorial?'local editorial preview':'public'} pages + 404${editorial?' and local-only imported reader pages':''}.`);

if(collectionPreview){const {buildCollection}=await import('./collections/ramayana/build.mjs');await buildCollection(out);}
