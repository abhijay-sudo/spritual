import { readIntention, saveIntention, KEY, selectMoment, timerRemaining, shareOrigin } from './session.js';
document.documentElement.classList.add('enhanced');
const c=JSON.parse(document.querySelector('#page-copy').textContent);
const $=id=>document.getElementById(id);
const base=document.documentElement.lang==='hi'?'/hi/':'/';
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const WORLD_KEY='spritual_world_v1';
const WORLDS=new Set(['neutral','epic','rama','krishna','hanuman','shiva']);
const WORLD_META={
 neutral:{color:'#f6f3eb',art:'/assets/landscape.svg',en:['A QUIET THRESHOLD','Stillness before the next step.','STILLNESS WITHIN'],hi:['शांत प्रवेश','अगले कदम से पहले ठहराव।','भीतर की शांति']},
 epic:{color:'#efe4d2',art:'/assets/collection-mahabharata.webp',en:['THE EPIC WORLD','Many voices. Consequences in view.','THE EPIC WORLD'],hi:['महाकाव्य संसार','अनेक स्वर। परिणाम सामने।','महाकाव्य संसार']},
 rama:{color:'#f4e5cf',art:'/assets/world-rama.webp',en:['THE RAMA WORLD','A path shaped by duty, care and return.','THE FOREST PATH'],hi:['राम संसार','कर्तव्य, करुणा और लौटने का मार्ग।','वन का पथ']},
 krishna:{color:'#e6e6df',art:'/assets/world-krishna.webp',en:['THE KRISHNA WORLD','Discernment with warmth and play.','RIVER OF INSIGHT'],hi:['कृष्ण संसार','स्नेह, लीला और विवेक।','बोध की धारा']},
 hanuman:{color:'#f2dfca',art:'/assets/world-hanuman.webp',en:['THE HANUMAN WORLD','Courage expressed through service.','WIND & SERVICE'],hi:['हनुमान संसार','सेवा में प्रकट साहस।','वायु और सेवा']},
 shiva:{color:'#e3e8e7',art:'/assets/world-shiva.webp',en:['THE SHIVA WORLD','Stillness spacious enough for change.','MOUNTAIN STILLNESS'],hi:['शिव संसार','परिवर्तन को स्थान देती स्थिरता।','पर्वत की शांति']}
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
 for(const image of document.querySelectorAll('[data-context-art]')){if(image.getAttribute('src')!==info.art){image.classList.add('art-changing');image.src=info.art;image.addEventListener('load',()=>image.classList.remove('art-changing'),{once:true});}}
 document.querySelectorAll('[data-context-kicker]').forEach(el=>el.textContent=copy[0]);
 document.querySelectorAll('[data-context-caption]').forEach(el=>el.textContent=copy[1]);
 document.querySelectorAll('[data-context-seal]').forEach(el=>el.innerHTML=copy[2].replace(' ','<br>'));
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
if($('timer-view')) {
 let remaining=60_000,startedAt=0,running=false,frame=0,finished=false;
 const params=new URLSearchParams(location.search),moment=selectMoment(location.search),from=params.get('from');
 const safeFrom=from&&/^\/(hi\/)?library\/(mahabharata|ramayana|shiva)\/[a-z]+\/$/.test(from)?from:null;
 const explicitWorld=WORLDS.has(params.get('world'))?params.get('world'):null;
 const language=document.querySelector('.language'),languageUrl=new URL(language.href,location.href);languageUrl.searchParams.set('moment',moment);
 if(params.has('world'))languageUrl.searchParams.set('world',params.get('world'));
 if(safeFrom){const targetHi=document.documentElement.lang!=='hi';const translated=targetHi?(safeFrom.startsWith('/hi/')?safeFrom:`/hi${safeFrom}`):safeFrom.replace(/^\/hi\//,'/');languageUrl.searchParams.set('from',translated);}
 language.href=`${languageUrl.pathname}${languageUrl.search}`;$('pause-reflection').textContent=c.moments.find(m=>m[3]===moment)[1];
 if(safeFrom&&$('return-reading')){const returnUrl=new URL(safeFrom,location.origin);if(explicitWorld)returnUrl.searchParams.set('world',explicitWorld);$('return-reading').href=`${returnUrl.pathname}${returnUrl.search}`;$('return-reading').hidden=false;}
 const current=()=>running?timerRemaining(remaining,startedAt,performance.now()):remaining;
 function chrome(active){document.body.classList.toggle('ritual-running',active);document.querySelector('.ritual-header .brand').inert=active;document.querySelector('.ritual-header .language-pair').inert=active;}
 function label(text,active=false){$('timer-toggle').replaceChildren();const icon=document.createElement('span');icon.setAttribute('aria-hidden','true');icon.textContent=active?'Ⅱ':'▷';$('timer-toggle').append(icon,document.createTextNode(' '+text));}
 function draw(){const value=current(),seconds=Math.ceil(value/1000);const text=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;if($('time').textContent!==text)$('time').textContent=text;$('timer-progress').style.strokeDashoffset=String(60-value/1000);
  if(running&&value<=0){remaining=0;running=false;chrome(false);$('timer-status').textContent=c.done;const transferFocus=document.activeElement===$('timer-toggle');$('timer-toggle').hidden=true;$('timer-reset').hidden=false;if(transferFocus)$('finish').focus({preventScroll:true});return;}
  if(running)frame=requestAnimationFrame(draw);
 }
 function stop(message=c.paused){if(running){remaining=current();running=false;cancelAnimationFrame(frame);}chrome(false);draw();label(remaining===60_000?c.start:c.resume);$('timer-reset').hidden=remaining===60_000;$('timer-status').textContent=remaining===0?c.done:message;}
 $('timer-toggle').addEventListener('click',()=>{if(running){stop();return;}if(remaining<=0)return;startedAt=performance.now();running=true;chrome(true);label(c.pause,true);$('finish').hidden=false;$('timer-reset').hidden=true;$('timer-status').textContent=c.running;frame=requestAnimationFrame(draw);});
 $('timer-reset').addEventListener('click',()=>{stop();remaining=60_000;finished=false;$('timer-toggle').hidden=false;label(c.start);$('timer-reset').hidden=true;$('finish').hidden=true;$('timer-status').textContent=c.ready;draw();$('timer-toggle').focus();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop(c.hidden);});
 window.addEventListener('pagehide',()=>{if(running)stop(c.hidden);});
 $('finish').addEventListener('click',()=>{stop();finished=true;$('timer-view').hidden=true;$('finish-view').hidden=false;$('finish-heading').focus({preventScroll:true});$('finish-view').scrollIntoView({block:'nearest',behavior:motion.matches?'instant':'smooth'});});
 let stored;function load(){try{stored=readIntention(localStorage);}catch{stored={kind:'invalid'};}renderSaved();}
 function renderSaved(){const exists=stored.kind!=='empty';$('saved-panel').hidden=!exists;$('saved-text').textContent=stored.kind==='saved'?c.steps[stored.intention]:stored.kind==='invalid'?c.corrupt:'';$('save-step').disabled=stored.kind==='invalid';}
 load();window.addEventListener('storage',event=>{if(event.key===KEY||event.key===null)load();});
 $('save-step').addEventListener('click',()=>{if(!finished)return;const option=document.querySelector('input[name="intention"]:checked');if(!option){$('save-status').textContent=c.choose;document.querySelector('input[name="intention"]').focus();return;}
  try { // Recheck before a write: another tab may have changed this record.
   if(readIntention(localStorage).kind==='invalid'){load();$('save-status').textContent=c.corrupt;return;}
   saveIntention(localStorage,Number(option.value));stored={kind:'saved',intention:Number(option.value)};renderSaved();$('save-status').textContent=c.saved;
  }catch{$('save-status').textContent=c.storageError;}
 });
 $('remove-step').addEventListener('click',()=>{try{localStorage.removeItem(KEY);stored={kind:'empty'};renderSaved();$('save-status').textContent=c.removed;$('timer-status').textContent=c.removed;(finished?$('save-step'):$('timer-toggle')).focus();}catch{$('remove-status').textContent=c.removeError;}});
 $('share-link').addEventListener('click',async()=>{const link=`${shareOrigin(location.origin)}${base}pause/?moment=${moment}`;try{await navigator.clipboard.writeText(link);$('share-status').textContent=c.copied;$('copy-fallback').hidden=true;}catch{$('copy-fallback').hidden=false;$('copy-url').value=link;$('copy-url').focus();$('copy-url').select();$('share-status').textContent='';}});
}
