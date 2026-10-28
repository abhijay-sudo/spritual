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
 for(const p of data.value){const li=document.createElement('li'),a=document.createElement('a'),button=document.createElement('button');a.href=p.route+'#'+p.folio;a.textContent=p.title+(p.lang==='hi'?' · हिन्दी':' · EN');button.type='button';button.textContent=text.remove;button.setAttribute('aria-label',text.remove+' '+p.title);button.addEventListener('click',()=>{const fresh=places();if(!fresh.ok){status(unavailablePlaces(fresh));return;}if(write(fresh.value.filter(x=>!(x.id===p.id&&x.lang===p.lang)))){renderShelf();status(text.removed);const target=list.querySelector('a')||document.querySelector('#kept h2');target.tabIndex=-1;target.focus();}});li.append(a,button);list.append(li);}}
// Decorative paper lives outside the semantic folios. Content and navigation never wait for it.
const leaves=document.querySelector('.book-leaves');
function paperTurn(content,{back=false,opening=false}={}){
 animation?.cancel();
 if(!leaves||reduce.matches||document.documentElement.dataset.sceneMotion==='off'||document.hidden||!Element.prototype.animate)return;
 const rect=leaves.getBoundingClientRect(),style=getComputedStyle(leaves);
 const sheet=document.createElement('div');sheet.className='turn-sheet';sheet.inert=true;sheet.setAttribute('aria-hidden','true');
 sheet.dataset.direction=back?'back':'forward';
 sheet.style.height=Math.min(Math.max(rect.height,320),1400)+'px';
 const front=document.createElement('div');front.className='turn-face turn-front';
 const rear=document.createElement('div');rear.className='turn-face turn-back';
 if(opening){
  front.classList.add('turn-cover');
  const mark=document.createElement('small');mark.textContent=hi?'चित्रित संस्करण':'THE ILLUSTRATED EDITION';
  const label=document.createElement('span');label.textContent=root.dataset.bookTitle;
  const ornament=document.createElement('i');ornament.textContent='❧';front.append(mark,label,ornament);
 }else{
  front.style.padding=style.padding;
  const copy=content.cloneNode(true);copy.hidden=false;copy.classList.add('turn-content');
  for(const node of [copy,...copy.querySelectorAll('*')]){for(const attr of ['id','data-folio','aria-labelledby','tabindex','autofocus'])node.removeAttribute(attr);}
  front.append(copy);
 }
 // A second paper face makes the hinge visible beyond ninety degrees. It carries
 // no second accessible reading surface; the semantic page is updated immediately.
 const imprint=document.createElement('div');imprint.className='turn-imprint';
 const ornament=document.createElement('span');ornament.textContent='❧';
 const runningTitle=document.createElement('small');runningTitle.textContent=root.dataset.bookTitle;
 imprint.append(ornament,runningTitle);
 const leftLeaf=root.querySelector('.frontispiece');
 if(leftLeaf&&leftLeaf.getBoundingClientRect().right<=rect.left+2){
  const verso=leftLeaf.cloneNode(true);verso.classList.add('turn-verso');
  verso.querySelectorAll('[hidden],.scene-ghost').forEach(node=>node.remove());
  for(const node of [verso,...verso.querySelectorAll('*')])for(const attribute of [...node.attributes]){
   if(attribute.name==='id'||attribute.name.startsWith('data-')||['tabindex','autofocus','aria-labelledby'].includes(attribute.name))node.removeAttribute(attribute.name);
  }
  rear.append(verso);
 }else rear.append(imprint);
 const light=document.createElement('div');light.className='turn-light';front.append(light);
 sheet.append(front,rear);leaves.append(sheet);
 const shade=document.createElement('div');shade.className='turn-shadow';shade.setAttribute('aria-hidden','true');shade.style.height=sheet.style.height;leaves.append(shade);
 const duration=opening?660:580,ease='cubic-bezier(.32,.06,.24,1)';
 const frames=back?[{transform:'rotateY(-180deg)'},{transform:'rotateY(-82deg)',offset:.45},{transform:'rotateY(0deg)'}]:[{transform:'rotateY(0deg)'},{transform:'rotateY(-82deg)',offset:.45},{transform:'rotateY(-180deg)'}];
 // WebKit can flatten backface culling while a nested sheet is animated.
 // Explicitly cull each face at the same 90-degree hinge on the same clock.
 // Visibility changes only at the edge; no per-frame JS or opacity on the sheet.
 const hinge=back?.45*90/98:.45+.55*8/98;
 const faceFrames=visible=>[{visibility:visible?'visible':'hidden',offset:0},{visibility:visible?'visible':'hidden',offset:hinge},{visibility:visible?'hidden':'visible',offset:hinge+.0001},{visibility:visible?'hidden':'visible',offset:1}];
 const effects=[sheet.animate(frames,{duration,easing:ease,fill:'both'}),
  front.animate(faceFrames(!back),{duration,easing:ease,fill:'both'}),
  rear.animate(faceFrames(back),{duration,easing:ease,fill:'both'}),
  shade.animate([{opacity:0,transform:'scaleX(.15)'},{opacity:.2,transform:'scaleX(.7)',offset:.42},{opacity:0,transform:'scaleX(.1)'}],{duration,easing:ease}),
  light.animate([{opacity:back?.35:0},{opacity:.32,offset:.45},{opacity:back?0:.15}],{duration,easing:ease})];
 const clock=document.timeline.currentTime;if(clock!==null)for(const effect of effects)if(effect.playState!=='paused')effect.startTime=clock;
 let finished=false;
 const record={cancel(){if(finished)return;finished=true;effects.forEach(effect=>effect.cancel());sheet.remove();shade.remove();if(animation===record)animation=null;}};
 animation=record;Promise.all(effects.map(effect=>effect.finished)).catch(()=>{}).finally(()=>record.cancel());
}

function show(index,{focus=false,motion=false,showArt=false}={}){
 if(!folios.length)return;const previous=current,old=folios[current];current=Math.max(0,Math.min(folios.length-1,index));animation?.cancel();
 folios.forEach((f,i)=>f.hidden=i!==current);root.dataset.currentPage=String(current);
 document.querySelectorAll('[data-leaf-step]').forEach(b=>{
  const direction=Number(b.dataset.leafStep),boundary=direction<0?current===0:current===folios.length-1;
  const chapterLink=root.querySelector(`[data-chapter-step="${direction}"]`);
  b.disabled=boundary;b.hidden=boundary&&!!chapterLink;if(chapterLink)chapterLink.hidden=!boundary;
 });
 document.querySelector('[data-page-position]').textContent=hi?`पृष्ठ ${current+1} / ${folios.length}`:`Page ${current+1} of ${folios.length}`;
 document.querySelectorAll('[data-leaf-link]').forEach(a=>{if(Number(a.dataset.leafLink)===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelectorAll('[data-language-switch]').forEach(a=>{const u=new URL(a.href);u.hash=folios[current].id;a.href=u.pathname+u.hash;});
 root.dispatchEvent(new CustomEvent('book:pagechange',{bubbles:true,detail:{index:current,id:folios[current].id}}));
 if(focus){folios[current].focus({preventScroll:true});const target=showArt&&root.hasAttribute('data-illustrated-reader')&&innerWidth<=700?root.querySelector('[data-scene-stage]'):folios[current];(target||folios[current]).scrollIntoView({block:'start',behavior:'instant'});}
 if(motion&&previous!==current)paperTurn(current<previous?folios[current]:old,{back:current<previous});
 updateKept();
}
function fromHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return 0;}const i=folios.findIndex(f=>f.id===id);return i<0?0:i;}
if(root&&folios.length){
 document.documentElement.classList.add('book-enhanced');show(fromHash());
 // No entry animation on a deep link: return straight to the kept page or source note.
 if(!location.hash)paperTurn(folios[current],{opening:true});
 const go=(i,{showArt=false}={})=>{if(i<0||i>=folios.length){const link=root.querySelector(`[data-chapter-step="${i<0?-1:1}"]`);if(link)location.assign(link.href);return;}const next=Math.max(0,Math.min(folios.length-1,i));if(next===current)return;history.pushState(null,'','#'+folios[next].id);show(next,{focus:true,motion:true,showArt});};
 let swipe=null;
 leaves.addEventListener('pointerdown',event=>{if(!event.isPrimary){swipe=null;return;}if(event.pointerType!=='touch'||event.target.closest('a,button,input,summary,[contenteditable]'))return;swipe={id:event.pointerId,x:event.clientX,y:event.clientY};},{passive:true});
 leaves.addEventListener('pointerup',event=>{if(!swipe||swipe.id!==event.pointerId)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.7&&!getSelection()?.toString())go(current+(dx<0?1:-1),{showArt:true});},{passive:true});
 leaves.addEventListener('pointercancel',()=>{swipe=null;},{passive:true});
 document.querySelectorAll('[data-leaf-step]').forEach(b=>b.addEventListener('click',event=>go(current+Number(b.dataset.leafStep),{showArt:event.detail>0})));
 document.querySelectorAll('[data-leaf-link]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();a.closest('dialog').dataset.focusLeaf='true';a.closest('dialog').close();const n=Number(a.dataset.leafLink);if(n!==current)go(n);else folios[current].focus();}));
 addEventListener('popstate',()=>show(fromHash(),{focus:true}));addEventListener('hashchange',()=>{if(folios.some(f=>'#'+f.id===location.hash))show(fromHash(),{focus:true});});
 document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,a,summary,[contenteditable]')||!root.contains(event.target))return;if(event.key==='ArrowRight'){event.preventDefault();go(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1);}});
 keep?.addEventListener('click',()=>{const saved=places();if(!saved.ok){status(unavailablePlaces(saved));return;}const place={id:root.dataset.bookId,lang,title:root.dataset.bookTitle,route:root.dataset.bookRoute,folio:folios[current].id,revision:root.dataset.bookRevision};if(write(keepPlace(saved.value,place))){status(hi?'यह पृष्ठ इसी ब्राउज़र में सहेजा गया।':'This page is kept in this browser.');updateKept();}});
}
for(const button of document.querySelectorAll('[data-open-dialog]'))button.addEventListener('click',()=>{animation?.cancel();const dialog=document.getElementById(button.dataset.openDialog);dialog.showModal();dialog.addEventListener('close',()=>{if(dialog.dataset.focusLeaf){delete dialog.dataset.focusLeaf;folios[current]?.focus({preventScroll:true});}else button.focus();},{once:true});});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
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
addEventListener('storage',event=>{if(event.key===KEY||event.key===null){renderShelf();updateKept();}});
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
