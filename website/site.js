import { initSanctuary } from './sanctuary.js';
document.documentElement.classList.add('enhanced');
const c=JSON.parse(document.querySelector('#page-copy').textContent);
const $=id=>document.getElementById(id);
const base=document.documentElement.lang==='hi'?'/hi/':'/';
const motion=matchMedia('(prefers-reduced-motion: reduce)');
document.querySelector('.skip')?.addEventListener('click',()=>requestAnimationFrame(()=>{const main=$('main');if(main){main.tabIndex=-1;main.focus({preventScroll:true});}}));
const WORLD_KEY='spritual_world_v1';
const WORLDS=new Set(['neutral','epic','rama','krishna','hanuman','shiva']);
const WORLD_META={
 neutral:{color:'#FBF8F3',art:'/assets/landscape.svg',name:['Still','शांत'],en:['A QUIET THRESHOLD','Stillness before the next step.','STILLNESS WITHIN'],hi:['शांत प्रवेश','अगले कदम से पहले ठहराव।','भीतर की शांति']},
 epic:{color:'#F3ECE1',art:'/assets/collection-mahabharata.webp',name:['Epic','महाकाव्य'],en:['THE EPIC WORLD','Many voices. Consequences in view.','THE EPIC WORLD'],hi:['महाकाव्य संसार','अनेक स्वर। परिणाम सामने।','महाकाव्य संसार']},
 rama:{color:'#FFFBEB',art:'/assets/world-rama.webp',name:['Rama','राम'],en:['THE RAMA WORLD','A path shaped by duty, care and return.','THE FOREST PATH'],hi:['राम संसार','कर्तव्य, करुणा और लौटने का मार्ग।','वन का पथ']},
 krishna:{color:'#090D16',art:'/assets/world-krishna.webp',name:['Krishna','कृष्ण'],en:['THE KRISHNA WORLD','Discernment with warmth and play.','RIVER OF INSIGHT'],hi:['कृष्ण संसार','स्नेह, लीला और विवेक।','बोध की धारा']},
 hanuman:{color:'#FFF7ED',art:'/assets/world-hanuman.webp',name:['Hanuman','हनुमान'],en:['THE HANUMAN WORLD','Courage expressed through service.','WIND & SERVICE'],hi:['हनुमान संसार','सेवा में प्रकट साहस।','वायु और सेवा']},
 shiva:{color:'#0F172A',art:'/assets/world-shiva.webp',name:['Shiva','शिव'],en:['THE SHIVA WORLD','Stillness spacious enough for change.','MOUNTAIN STILLNESS'],hi:['शिव संसार','परिवर्तन को स्थान देती स्थिरता।','पर्वत की शांति']}
};
const routeWorld=()=>document.documentElement.dataset.routeWorld||'neutral';
function selectedWorld(){
 const requested=new URLSearchParams(location.search).get('world');
 if(WORLDS.has(requested))return requested;
 if(routeWorld()!=='neutral')return routeWorld();
 try{const saved=localStorage.getItem(WORLD_KEY);if(WORLDS.has(saved))return saved;}catch{}
 return 'neutral';
}
function worldUrl(href,world){
 const url=new URL(href,location.href);if(url.origin!==location.origin)return href;
 url.searchParams.set('world',world);return `${url.pathname}${url.search}${url.hash}`;
}
function syncWorldLinks(world,explicit){
 for(const link of document.querySelectorAll('a[href]')){
  if(link.matches('[data-world-option]'))continue;
  const raw=link.getAttribute('href');if(!raw||raw.startsWith('#'))continue;
  let url;try{url=new URL(raw,location.href);}catch{continue;}if(url.origin!==location.origin)continue;
  if(explicit)url.searchParams.set('world',world);else url.searchParams.delete('world');
  link.href=`${url.pathname}${url.search}${url.hash}`;
 }
}
function revealWorldOption(option,{animate=false}={}){
 const scroller=option?.closest('.world-options');if(!scroller)return;
 const left=option.offsetLeft-(scroller.clientWidth-option.offsetWidth)/2;
 scroller.scrollTo({left:Math.max(0,left),behavior:animate&&!motion.matches?'smooth':'auto'});
}
function applyWorld(world,{announce=false}={}){
 if(!WORLDS.has(world))world='neutral';
 document.documentElement.dataset.world=world;document.body.dataset.world=world;
 const info=WORLD_META[world],hi=document.documentElement.lang==='hi',copy=hi?info.hi:info.en;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',info.color);
 for(const image of document.querySelectorAll('[data-context-art]')){
  const showcase=image.hasAttribute('data-theme-showcase');
  const source=showcase&&world==='neutral'?'/assets/collection-ramayana.webp':info.art;
  const responsive=showcase&&['neutral','epic'].includes(world)?`${source.replace('.webp','-sm.webp')} 560w, ${source} 1120w`:'';
  const sizes='(max-width:979px) calc(100vw - 40px), (max-width:1280px) 57vw, 682px';
  // Keep the last complete painting visible until its replacement is ready.
  // A late response from a previous theme must never replace the newest choice.
  image.dataset.requestedArt=source;
  const alt=showcase?(hi?`${info.name[1]} वातावरण का चित्र; किसी विशिष्ट घटना का चित्रण नहीं।`:`Atmospheric artwork for ${info.name[0]}; not a depiction of a specific event.`):image.alt;
  if(image.getAttribute('src')===source){image.alt=alt;continue;}
  const candidate=new Image();
  candidate.onload=()=>{if(image.dataset.requestedArt!==source)return;image.srcset=responsive;image.sizes=sizes;image.src=source;image.alt=alt;delete image.dataset.artUnavailable;};
  candidate.onerror=()=>{if(image.dataset.requestedArt===source)image.dataset.artUnavailable='true';};
  candidate.sizes=sizes;candidate.srcset=responsive;
  candidate.src=source;
 }
 document.querySelectorAll('[data-context-kicker]').forEach(el=>el.textContent=copy[0]);
 document.querySelectorAll('[data-context-caption]').forEach(el=>el.textContent=copy[1]);
 document.querySelectorAll('[data-context-seal]').forEach(el=>el.innerHTML=copy[2].replace(' ','<br>'));
 document.querySelectorAll('[data-theme-label]').forEach(el=>el.textContent=info.name[hi?1:0]);
 for(const option of document.querySelectorAll('[data-world-option]')){
  const active=option.dataset.worldOption===world;option.setAttribute('aria-current',active?'true':'false');
  if(active)requestAnimationFrame(()=>revealWorldOption(option,{animate:announce}));
 }
 const explicit=WORLDS.has(new URLSearchParams(location.search).get('world'));
 syncWorldLinks(world,explicit);
 if(announce&&$('world-status'))$('world-status').textContent=hi?`${copy[0]} चुना गया।`:`${copy[0]} selected.`;
}
for(const option of document.querySelectorAll('[data-world-option]'))option.addEventListener('click',event=>{
 event.preventDefault();const world=option.dataset.worldOption;const next=worldUrl(location.href,world);history.pushState({world},'',next);
 try{localStorage.setItem(WORLD_KEY,world);}catch{}
 applyWorld(world,{announce:true});
 option.closest('details')?.removeAttribute('open');
});
window.addEventListener('popstate',()=>applyWorld(selectedWorld(),{announce:true}));
function renderHomeContinue(){
 const link=$('home-continue');if(!link)return;
 let first=null;try{const shelf=JSON.parse(localStorage.getItem('spritual_website_shelf_v1'));if(shelf?.version===1&&Array.isArray(shelf.items))first=shelf.items[0];}catch{}
 const valid=typeof first==='string'&&/^(mahabharata|ramayana|shiva)\/[a-z]+$/.test(first);
 link.hidden=!valid;if(valid)link.href=`${base}library/${first}/`;
}
renderHomeContinue();window.addEventListener('storage',event=>{if(event.key==='spritual_website_shelf_v1'||event.key===null){renderHomeContinue();applyWorld(selectedWorld());}});
applyWorld(selectedWorld());
const UI_KEY='spritual_ui_v1';
const fontToggle=document.querySelector('[data-font-toggle]');
function applyTextScale(scale,{announce=false}={}){
 const large=scale==='large';document.documentElement.dataset.textScale=large?'large':'default';
 if(!fontToggle)return;fontToggle.setAttribute('aria-pressed',String(large));
 const status=fontToggle.querySelector('[data-font-status]'),hi=document.documentElement.lang==='hi';
 if(status)status.textContent=large?(hi?'बड़े अक्षर':'Large text'):(hi?'सामान्य अक्षर':'Default text');
 if(announce&&status)status.setAttribute('role','status');
}
let textScale='default';try{textScale=JSON.parse(localStorage.getItem(UI_KEY)||'{}').textScale||'default';}catch{}
applyTextScale(textScale);
fontToggle?.addEventListener('click',()=>{
 textScale=document.documentElement.dataset.textScale==='large'?'default':'large';applyTextScale(textScale,{announce:true});
 try{const state=JSON.parse(localStorage.getItem(UI_KEY)||'{}');localStorage.setItem(UI_KEY,JSON.stringify({...state,textScale}));}catch{}
});
if('IntersectionObserver' in window&&!motion.matches){
 const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.remove('pending');e.target.classList.add('seen');observer.unobserve(e.target);}},{threshold:.12});
 document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});
 motion.addEventListener('change',()=>{if(motion.matches){observer.disconnect();document.querySelectorAll('.reveal.pending').forEach(el=>el.classList.remove('pending'));}});
}
const menu=$('mobile-menu');const menuToggle=$('menu-toggle');
if(menu&&menuToggle){
 menuToggle.hidden=false;
 function closeMenu(){menu.close();}
 menuToggle.addEventListener('click',()=>{menu.showModal();document.body.classList.add('menu-open');menuToggle.setAttribute('aria-expanded','true');$('menu-close').focus();});
 menu.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const items=[...menu.querySelectorAll('button,a[href]')];const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 $('menu-close').addEventListener('click',closeMenu);
 menu.addEventListener('click',e=>{if(e.target===menu||e.target.closest('nav a'))closeMenu();});
 menu.addEventListener('close',()=>{document.body.classList.remove('menu-open');menuToggle.setAttribute('aria-expanded','false');(menuToggle.getClientRects().length?menuToggle:document.querySelector('.desktop-nav a')).focus();});
 matchMedia('(min-width:960px)').addEventListener('change',e=>{if(e.matches&&menu.open)closeMenu();});
}
const moments=[...document.querySelectorAll('[data-moment]')];
function placeIndicator(){const active=moments.find(b=>b.getAttribute('aria-pressed')==='true');const tick=document.querySelector('.moment-indicator');if(active&&tick)tick.style.transform=`translateY(${active.offsetTop+(active.offsetHeight-14)/2}px)`;}
for(const button of moments){button.addEventListener('click',()=>{
 const index=Number(button.dataset.moment),m=c.moments[index];
 moments.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const box=$('moment-copy');box.querySelector('h3').textContent=m[1];box.querySelector('p').textContent=m[2];
 $('moment-link').href=`${base}pause/?moment=${m[3]}`;
 const card=box.closest('.reflection-card');card.dataset.mood=m[3];card.classList.remove('copy-change');requestAnimationFrame(()=>card.classList.add('copy-change'));placeIndicator();
 });button.addEventListener('keydown',e=>{let i=moments.indexOf(button);if(['ArrowDown','ArrowRight'].includes(e.key))i=(i+1)%moments.length;else if(['ArrowUp','ArrowLeft'].includes(e.key))i=(i+moments.length-1)%moments.length;else if(e.key==='Home')i=0;else if(e.key==='End')i=moments.length-1;else return;e.preventDefault();moments[i].focus();moments[i].click();});}
if(moments.length){placeIndicator();new ResizeObserver(placeIndicator).observe(document.querySelector('.moment-tabs'));}
if($('timer-view')) initSanctuary(c);
