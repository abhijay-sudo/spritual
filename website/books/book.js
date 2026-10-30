import {PaperEngine} from '../experience/paper-engine.js';
import{KEY,parsePlaces,keepPlace,encodePlaces}from'./state.js';
const lang=document.body.dataset.bookLanguage||document.documentElement.lang||'en',hi=lang==='hi';
const text={kept:hi?'पृष्ठ सहेजा गया':'Page kept',keep:hi?'यह पृष्ठ सहेजें':'Keep this page',blocked:hi?'यह ब्राउज़र पृष्ठ सहेज नहीं सका। आप पढ़ना जारी रख सकते हैं।':'This browser could not save your page. You can keep reading.',corrupt:hi?'सहेजे पृष्ठ पढ़े नहीं जा सके। आपका पुराना डेटा बदला नहीं गया।':'Saved pages could not be read. Your existing data has been left unchanged.',removed:hi?'सहेजा पृष्ठ हटाया गया':'Kept page removed',remove:hi?'हटाएँ':'Remove'};
const status=message=>document.querySelectorAll('[data-storage-status]').forEach(n=>n.textContent=message);
function places(){let raw;try{raw=localStorage.getItem(KEY);}catch{return {ok:false,value:[],reason:'blocked'};}try{return {ok:true,value:parsePlaces(raw)};}catch{return {ok:false,value:[],reason:'corrupt'};}}
const unavailablePlaces=data=>data.reason==='blocked'?text.blocked:text.corrupt;
function write(next){try{localStorage.setItem(KEY,encodePlaces(next));return true;}catch{status(text.blocked);return false;}}
const root=document.querySelector('[data-reader]'),folios=[...document.querySelectorAll('[data-folio]')];let current=0,animation=null;
const legacyLink=[...document.querySelectorAll('[data-legacy-folio]')].find(a=>'#'+a.dataset.legacyFolio===location.hash);
if(legacyLink)location.replace(legacyLink.href);
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const keep=document.querySelector('[data-keep]');
function updateKept(){if(!keep)return;const saved=places();keep.textContent=saved.ok&&saved.value.some(p=>p.id===root.dataset.bookId&&p.lang===lang&&p.folio===folios[current].id)?text.kept:text.keep;}
function renderShelf(){const list=document.querySelector('[data-kept-list]');if(!list)return;const data=places();list.replaceChildren();if(!data.ok)status(unavailablePlaces(data));const empty=document.querySelector('[data-kept-empty]');if(empty)empty.hidden=data.value.length>0;
 for(const p of data.value){const li=document.createElement('li'),a=document.createElement('a'),button=document.createElement('button');a.href=p.route+'#'+p.folio;a.textContent=p.title+(p.lang==='hi'?' · हिन्दी':' · EN');button.type='button';button.textContent=text.remove;button.setAttribute('aria-label',text.remove+' '+p.title);button.addEventListener('click',()=>{const fresh=places();if(!fresh.ok){status(unavailablePlaces(fresh));return;}const removedPlace=fresh.value.find(x=>x.id===p.id&&x.lang===p.lang);if(!removedPlace){renderShelf();return;}if(write(fresh.value.filter(x=>!(x.id===p.id&&x.lang===p.lang)))){renderShelf();status(text.removed);document.dispatchEvent(new CustomEvent('shelf:removed',{detail:{place:removedPlace}}));const target=list.querySelector('a')||document.querySelector('#kept h1, #kept h2');if(target){target.tabIndex=-1;target.focus();}}});li.dataset.savedPlace=JSON.stringify(p);li.append(a,button);list.append(li);}document.dispatchEvent(new CustomEvent('shelf:rendered'));}
// Decorative paper lives outside the semantic folios. Content and navigation never wait for it.
const leaves=document.querySelector('.book-leaves');
const canonicalReader=!!document.body.hasAttribute('data-canonical-reader');
const paper=leaves?new PaperEngine(leaves):null;
let pageTurn=null,gesture=null;
function releasePageGesture(){const held=gesture;gesture=null;delete leaves?.dataset.pageDragging;if(held&&leaves.hasPointerCapture?.(held.id))leaves.releasePointerCapture(held.id);}
function beginPageTurn(from,to,{content=null}={}){
 animation?.cancel();
 const transaction={from,to,session:null},back=to<from;
 const finish=value=>{
  if(pageTurn!==transaction)return;pageTurn=null;animation=null;releasePageGesture();
  const next=value?to:from;
  if(current!==next){
   // A completed gesture creates one history entry. Reversing an already committed
   // button turn corrects that entry rather than creating a phantom extra page.
   history[value?'pushState':'replaceState'](null,'','#'+folios[next].id);
   show(next,{focus:true,preserveAnimation:true});
  }
 };
 transaction.session=paper.track(content||paper.capture(folios[back?to:from],{raster:false}),{back,underlay:folios[to],onSettled:finish,onCancel:()=>{if(pageTurn===transaction){pageTurn=null;animation=null;}releasePageGesture();}});
 pageTurn=transaction;animation=transaction.session;return transaction;
}
function paperTurn(content,{back=false,opening=false,from=current,to=current}={}){if(opening)return;animation?.cancel();if(!paper)return;if(canonicalReader){const turn=beginPageTurn(from,to,{content});turn.session.settle(1,0);}else animation=paper.turn(content,{back,duration:1100});}

function show(index,{focus=false,motion=false,showArt=false,preserveAnimation=false}={}){
 if(!folios.length)return;const previous=current,old=folios[current],next=Math.max(0,Math.min(folios.length-1,index));const snapshot=canonicalReader&&root.dataset.readingModeState!=='flow'&&motion&&!reduce.matches?paper.capture(next<previous?folios[next]:old,{raster:false}):null;current=next;if(!preserveAnimation)animation?.cancel();
 folios.forEach((f,i)=>f.hidden=root.dataset.readingModeState!=='flow'&&i!==current);root.dataset.currentPage=String(current);
 document.querySelectorAll('[data-leaf-step]').forEach(b=>{
  const direction=Number(b.dataset.leafStep),boundary=direction<0?current===0:current===folios.length-1;
  const chapterLink=root.querySelector(`[data-chapter-step="${direction}"]`);
  b.disabled=boundary;b.hidden=boundary&&!!chapterLink;if(chapterLink)chapterLink.hidden=!boundary;
 });
 document.querySelector('[data-page-position]').textContent=hi?`पृष्ठ ${current+1} / ${folios.length}`:`Page ${current+1} of ${folios.length}`;
 document.querySelectorAll('[data-leaf-link]').forEach(a=>{if(Number(a.dataset.leafLink)===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelectorAll('[data-language-switch]').forEach(a=>{const u=new URL(a.href);u.hash=folios[current].id;a.href=u.pathname+u.hash;});
 root.dispatchEvent(new CustomEvent('book:pagechange',{bubbles:true,detail:{index:current,id:folios[current].id}}));
 if(focus){
  const scene=folios[current];scene.focus({preventScroll:true});
  const rect=scene.getBoundingClientRect();
  if(!canonicalReader&&(rect.top<0||rect.top>innerHeight-80))scene.scrollIntoView({block:'start',behavior:'instant'});
 }
 if(motion&&root.dataset.readingModeState!=='flow'&&previous!==current)paperTurn(canonicalReader?snapshot:(current<previous?folios[current]:old),{back:current<previous,from:previous,to:current});
 updateKept();
}
function fromHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return 0;}const i=folios.findIndex(f=>f.id===id);return i<0?0:i;}
if(root&&folios.length){
 document.documentElement.classList.add('book-enhanced');root.dataset.readingModeState='book';try{if(sessionStorage.getItem('spritual_reading_mode_v1')==='flow')root.dataset.readingModeState='flow';}catch{}show(fromHash());
 // No entry animation on a deep link: return straight to the kept page or source note.
 if(!location.hash)paperTurn(folios[current],{opening:true});
 const go=(i,{showArt=false}={})=>{if(i<0||i>=folios.length){const link=root.querySelector(`[data-chapter-step="${i<0?-1:1}"]`);if(link)location.assign(link.href);return;}const next=Math.max(0,Math.min(folios.length-1,i));if(next===current)return;history.pushState(null,'','#'+folios[next].id);show(next,{focus:true,motion:true,showArt});if(root.dataset.readingModeState==='flow')folios[next].scrollIntoView({block:'start',behavior:reduce.matches?'instant':'smooth'});};
 document.addEventListener('book:navigate',e=>go(Number(e.detail.index)));
 document.addEventListener('book:mode',e=>{flowReady=true;animation?.cancel();root.dataset.readingModeState=e.detail.mode==='flow'?'flow':'book';try{sessionStorage.setItem('spritual_reading_mode_v1',root.dataset.readingModeState);}catch{}show(current);if(root.dataset.readingModeState==='flow')folios[current].scrollIntoView({block:'start',behavior:'instant'});});
 let flowFrame=0,flowReady=false;const initialFlowIndex=fromHash();Promise.all([document.fonts.ready,document.readyState==='complete'?Promise.resolve():new Promise(resolve=>addEventListener('load',resolve,{once:true}))]).then(()=>requestAnimationFrame(()=>{if(root.dataset.readingModeState==='flow'&&location.hash){show(initialFlowIndex);folios[current].scrollIntoView({block:'start',behavior:'instant'});}}));for(const type of ['wheel','touchmove'])addEventListener(type,()=>{flowReady=true;},{passive:true});addEventListener('keydown',e=>{if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key))flowReady=true;});addEventListener('scroll',()=>{if(!flowReady||root.dataset.readingModeState!=='flow'||flowFrame)return;flowFrame=requestAnimationFrame(()=>{flowFrame=0;if(root.dataset.readingModeState!=='flow')return;const line=Math.min(innerHeight*.55,420);let best=current,distance=Infinity;folios.forEach((f,i)=>{const r=f.getBoundingClientRect(),d=r.top<=line&&r.bottom>=line?0:Math.min(Math.abs(r.top-line),Math.abs(r.bottom-line));if(d<distance){distance=d;best=i;}});if(best!==current){history.replaceState(null,'','#'+folios[best].id);show(best);}});},{passive:true});
 const selection=()=>!!getSelection()?.toString();
 const sample=(g,value,now)=>{g.samples.push({value,time:now});g.samples=g.samples.filter(s=>now-s.time<=90);if(g.samples.length>8)g.samples.shift();const first=g.samples[0],last=g.samples.at(-1);return last.time-first.time>8?(last.value-first.value)/((last.time-first.time)/1000):0;};
 const restoreEdge=g=>{if(!g.edgeTransform)return;const from=leaves.style.transform;leaves.style.transform=g.edgeTransform==='none'?'':g.edgeTransform;if(!reduce.matches)leaves.animate([{transform:from},{transform:g.edgeTransform}],{duration:220,easing:'cubic-bezier(.2,.8,.2,1)'});};
 const abandon=()=>{const g=gesture;if(!g)return;releasePageGesture();restoreEdge(g);if(g.turn&&!g.turn.session.finished)g.turn.session.settle(g.resumeTarget,g.resumeVelocity);};
 leaves.addEventListener('pointerdown',event=>{
  if(root.dataset.readingModeState==='flow'||!event.isPrimary||event.button!==0||selection())return;
  if(event.target.closest('a,button,input,textarea,select,summary,[contenteditable]'))return;
  // Mouse text selection belongs to the reader. Touch retains its native vertical
  // scroll/long-press until horizontal intent has crossed the small hysteresis zone.
  const prose=!!event.target.closest('.folio-prose,p,h1,h2,h3,blockquote,li');
  if(canonicalReader&&event.pointerType!=='touch'&&prose&&!pageTurn)return;
  if(canonicalReader&&event.pointerType!=='touch')event.preventDefault();
  const turn=pageTurn&&!pageTurn.session.finished?pageTurn:null;
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,width:leaves.getBoundingClientRect().width,start:event.timeStamp,startProgress:turn?.session.progress||0,turn,direction:turn?Math.sign(turn.to-turn.from):0,started:false,canTap:!prose,resumeTarget:turn?.session.target||0,resumeVelocity:turn?.session.velocity||0,samples:[]};
  if(turn)turn.session.hold();
 },{passive:false});
 leaves.addEventListener('pointermove',event=>{
  const g=gesture;if(!g||g.id!==event.pointerId||!canonicalReader)return;
  const dx=event.clientX-g.x,dy=event.clientY-g.y;
  if(!g.started){
   if(Math.max(Math.abs(dx),Math.abs(dy))<10)return;
   if(Math.abs(dy)>Math.abs(dx)*1.15||selection()){abandon();return;}
   if(Math.abs(dx)<Math.abs(dy)*1.35)return;
   g.direction||=dx<0?1:-1;
   if(!g.turn){const next=current+g.direction;if(next>=0&&next<folios.length)g.turn=beginPageTurn(current,next);else g.edgeTransform=getComputedStyle(leaves).transform;}
   // Creating a surface may cancel a previous animation; retain this pointer's grab.
   gesture=g;g.started=true;g.samples=[{value:g.startProgress,time:g.start}];
   leaves.setPointerCapture(event.pointerId);leaves.dataset.pageDragging=g.direction>0?'next':'previous';
  }
  event.preventDefault();
  if(g.turn){
   if(g.turn.session.finished){releasePageGesture();return;}
   const progress=Math.max(0,Math.min(1,g.startProgress-dx*g.direction/g.width));
   g.turn.session.set(progress,sample(g,progress,event.timeStamp));
  }else if(!reduce.matches){const distance=Math.abs(dx),offset=Math.sign(dx)*18*(1-1/(distance/85+1));leaves.style.transform=`translateX(${offset}px)`;}
 },{passive:false});
 leaves.addEventListener('pointerup',event=>{
  const g=gesture;if(!g||g.id!==event.pointerId)return;
  const dx=event.clientX-g.x,dy=event.clientY-g.y;releasePageGesture();restoreEdge(g);
  if(g.started){
   event.preventDefault();
   if(g.turn&&!g.turn.session.finished){const p=Math.max(0,Math.min(1,g.startProgress-dx*g.direction/g.width)),v=sample(g,p,event.timeStamp),projected=p+v*.18;g.turn.session.set(p,v);g.turn.session.settle(projected>=.5?1:0,v);}
  }else if(g.turn){g.turn.session.settle(g.resumeTarget,g.resumeVelocity);}
  else if(!canonicalReader&&Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.7&&!selection())go(current+(dx<0?1:-1),{showArt:true});
  else if(g.canTap&&Math.abs(dx)<8&&Math.abs(dy)<8&&!selection()){const r=leaves.getBoundingClientRect(),x=(event.clientX-r.left)/r.width;if(x>.67)go(current+1);else if(x<.33)go(current-1);}
 },{passive:false});
 leaves.addEventListener('pointercancel',abandon,{passive:true});
 // Touch starts with implicit capture on the prose node. Its bubbling loss when
 // the leaf takes ownership is not a cancelled gesture.
 leaves.addEventListener('lostpointercapture',event=>{if(event.target===leaves)abandon();},{passive:true});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&gesture){event.preventDefault();const g=gesture;releasePageGesture();restoreEdge(g);g.turn?.session.settle(0,0);}});
 document.querySelectorAll('[data-leaf-step]').forEach(b=>b.addEventListener('click',event=>go(current+Number(b.dataset.leafStep),{showArt:event.detail>0})));
 document.querySelectorAll('[data-leaf-link]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();a.closest('dialog').dataset.focusLeaf='true';const dialog=a.closest('dialog');window.SpritualSheets?window.SpritualSheets.close(dialog):dialog.close();const n=Number(a.dataset.leafLink);if(n!==current)go(n);else folios[current].focus();}));
 addEventListener('popstate',()=>show(fromHash(),{focus:true}));addEventListener('hashchange',()=>{if(folios.some(f=>'#'+f.id===location.hash))show(fromHash(),{focus:true});});
 document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,a,summary,[contenteditable]')||(!root.contains(event.target)&&event.target!==document.body))return;if((event.key==='ArrowRight'||event.code==='Space')){event.preventDefault();go(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1);}});
 keep?.addEventListener('click',()=>{const saved=places();if(!saved.ok){status(unavailablePlaces(saved));return;}const place={id:root.dataset.bookId,lang,title:root.dataset.bookTitle,route:root.dataset.bookRoute,folio:folios[current].id,revision:root.dataset.bookRevision,savedAt:new Date().toISOString()};if(write(keepPlace(saved.value,place))){status(hi?'यह पृष्ठ इसी ब्राउज़र में सहेजा गया।':'This page is kept in this browser.');updateKept();document.dispatchEvent(new CustomEvent('book:kept'));}});
}
for(const button of document.querySelectorAll('[data-open-dialog]'))button.addEventListener('click',()=>{animation?.cancel();const dialog=document.getElementById(button.dataset.openDialog);window.SpritualSheets?window.SpritualSheets.open(dialog,button):dialog.showModal();dialog.addEventListener('close',()=>{if(dialog.dataset.focusLeaf){delete dialog.dataset.focusLeaf;folios[current]?.focus({preventScroll:true});}else button.focus();},{once:true});});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>{const dialog=b.closest('dialog');window.SpritualSheets?window.SpritualSheets.close(dialog):dialog.close();}));
// Explicit appearance choices last for this browsing session, including chapter
// and language changes. Storage failure never blocks a reading preference.
const appearanceKey='spritual_book_appearance_v1';
let appearance={};
try{const value=JSON.parse(sessionStorage.getItem(appearanceKey));if(value&&typeof value==='object')appearance=value;}catch{}
function applyAppearance(){
 const sizes=[...document.querySelectorAll('[data-text-size]')];
 if(sizes.some(b=>b.dataset.textSize===String(appearance.size))){
  document.documentElement.style.setProperty('--read-size',appearance.size+'px');
  sizes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.textSize===String(appearance.size))));
 }
 const themes=[...document.querySelectorAll('button[data-page-theme]')];
 if(themes.some(b=>b.dataset.pageTheme===appearance.theme)){
  document.body.dataset.pageTheme=appearance.theme;
  themes.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.pageTheme===appearance.theme)));
 }
}
function saveAppearance(){applyAppearance();animation?.cancel();try{sessionStorage.setItem(appearanceKey,JSON.stringify(appearance));if(appearance.size)sessionStorage.setItem('spritual_experience_size_v1',appearance.size);}catch{}}
applyAppearance();
document.querySelectorAll('[data-text-size]').forEach(b=>b.addEventListener('click',()=>{appearance.size=b.dataset.textSize;saveAppearance();}));
document.querySelectorAll('button[data-page-theme]').forEach(b=>b.addEventListener('click',()=>{appearance.theme=b.dataset.pageTheme;saveAppearance();}));

const search=document.querySelector('#book-search'),entries=[...document.querySelectorAll('[data-book-entry]')];
function filter(){const q=search.value.trim().normalize('NFKC').toLocaleLowerCase();let count=0;for(const entry of entries){entry.hidden=!entry.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(q);if(!entry.hidden)count++;}document.querySelector('[data-results-count]').textContent=hi?`${count} कथाएँ`:`${count} ${document.body.dataset.sourceIndex?'sections':'stories'}`;document.querySelector('[data-search-empty]').hidden=count>0;}
search?.addEventListener('input',filter);document.querySelector('[data-search-clear]')?.addEventListener('click',()=>{search.value='';filter();search.focus();});if(search)filter();
// Native sources stay readable before this module loads. Preserve a source link
// followed during loading; otherwise fold the notes once enhancement is ready.
const editionNote=document.querySelector('#edition-note');
if(editionNote)editionNote.open=location.hash==='#edition-note';
for(const a of document.querySelectorAll('.source-trigger'))a.addEventListener('click',()=>{document.querySelector('#edition-note').open=true;});
addEventListener('pagehide',()=>animation?.cancel());addEventListener('resize',()=>animation?.cancel());
reduce.addEventListener('change',()=>animation?.cancel());document.addEventListener('book:motionchange',()=>animation?.cancel());document.addEventListener('visibilitychange',()=>{if(document.hidden)animation?.cancel();});
addEventListener('storage',event=>{if(event.key===KEY||event.key===null){renderShelf();updateKept();document.dispatchEvent(new CustomEvent('book:kept'));}});
document.addEventListener('shelf:refresh',()=>{renderShelf();updateKept();});
renderShelf();document.querySelectorAll('[data-enhancement]').forEach(n=>n.hidden=false);


// Independent recovery if the optional viewport-image enhancement cannot load.
// Native lazy loading still provides the complete illustrated site in that case.
function recoverDeferredArtwork(){
  if(document.documentElement.dataset.responsiveImages==='ready')return;
  document.querySelectorAll('img[data-deferred-src]').forEach(image=>{
    image.loading='lazy';
    if(image.dataset.deferredSrcset)image.srcset=image.dataset.deferredSrcset;
    image.src=image.dataset.deferredSrc;
    image.style.removeProperty('display');image.style.removeProperty('visibility');
    image.dataset.imageState='fallback';
    delete image.dataset.deferredSrc;delete image.dataset.deferredSrcset;
  });
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',recoverDeferredArtwork,{once:true});
else recoverDeferredArtwork();
