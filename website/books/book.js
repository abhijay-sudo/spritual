import{KEY,parsePlaces,keepPlace,encodePlaces}from'./state.js';
const lang=document.body.dataset.bookLanguage||'en',hi=lang==='hi';
const text={kept:hi?'पृष्ठ सहेजा गया':'Page kept',keep:hi?'यह पृष्ठ सहेजें':'Keep this page',blocked:hi?'यह ब्राउज़र पृष्ठ सहेज नहीं सका। आप पढ़ना जारी रख सकते हैं।':'This browser could not save your page. You can keep reading.',corrupt:hi?'सहेजे पृष्ठ पढ़े नहीं जा सके। आपका पुराना डेटा बदला नहीं गया।':'Saved pages could not be read. Your existing data has been left unchanged.',removed:hi?'सहेजा पृष्ठ हटाया गया':'Kept page removed',remove:hi?'हटाएँ':'Remove'};
const status=message=>document.querySelectorAll('[data-storage-status]').forEach(n=>n.textContent=message);
function places(){try{return {ok:true,value:parsePlaces(localStorage.getItem(KEY))};}catch{return {ok:false,value:[]};}}
function write(next){try{localStorage.setItem(KEY,encodePlaces(next));return true;}catch{status(text.blocked);return false;}}
const root=document.querySelector('[data-reader]'),folios=[...document.querySelectorAll('[data-folio]')];let current=0,animation=null;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const keep=document.querySelector('[data-keep]');
function updateKept(){if(!keep)return;const saved=places();keep.textContent=saved.ok&&saved.value.some(p=>p.id===root.dataset.bookId&&p.lang===lang&&p.folio===folios[current].id)?text.kept:text.keep;}
function renderShelf(){const list=document.querySelector('[data-kept-list]');if(!list)return;const data=places();list.replaceChildren();if(!data.ok)status(text.corrupt);const empty=document.querySelector('[data-kept-empty]');if(empty)empty.hidden=data.value.length>0;
 for(const p of data.value){const li=document.createElement('li'),a=document.createElement('a'),button=document.createElement('button');a.href=p.route+'#'+p.folio;a.textContent=p.title+(p.lang==='hi'?' · हिन्दी':' · EN');button.type='button';button.textContent=text.remove;button.setAttribute('aria-label',text.remove+' '+p.title);button.addEventListener('click',()=>{const fresh=places();if(!fresh.ok){status(text.corrupt);return;}if(write(fresh.value.filter(x=>!(x.id===p.id&&x.lang===p.lang)))){renderShelf();status(text.removed);const target=list.querySelector('a')||document.querySelector('#kept h2');target.tabIndex=-1;target.focus();}});li.append(a,button);list.append(li);}}
function show(index,{focus=false,motion=false}={}){
 if(!folios.length)return;current=Math.max(0,Math.min(folios.length-1,index));animation?.cancel();
 folios.forEach((f,i)=>f.hidden=i!==current);root.dataset.currentPage=String(current);
 document.querySelectorAll('[data-leaf-step]').forEach(b=>b.disabled=Number(b.dataset.leafStep)<0?current===0:current===folios.length-1);
 document.querySelector('[data-page-position]').textContent=hi?`पृष्ठ ${current+1} / ${folios.length}`:`Page ${current+1} of ${folios.length}`;
 document.querySelectorAll('[data-leaf-link]').forEach(a=>{if(Number(a.dataset.leafLink)===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 document.querySelectorAll('[data-language-switch]').forEach(a=>{const u=new URL(a.href);u.hash=folios[current].id;a.href=u.pathname+u.hash;});
 if(focus){folios[current].focus({preventScroll:true});folios[current].scrollIntoView({block:'start',behavior:'instant'});}
 if(motion&&!reduce.matches){animation=folios[current].animate([{opacity:.25,transform:'translateX(8px)'},{opacity:1,transform:'translateX(0)'}],{duration:220,easing:'cubic-bezier(.2,.7,.2,1)'});}
 updateKept();
}
function fromHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return 0;}const i=folios.findIndex(f=>f.id===id);return i<0?0:i;}
if(root&&folios.length){
 document.documentElement.classList.add('book-enhanced');show(fromHash());
 const go=i=>{const next=Math.max(0,Math.min(folios.length-1,i));if(next===current)return;history.pushState(null,'','#'+folios[next].id);show(next,{focus:true,motion:true});};
 document.querySelectorAll('[data-leaf-step]').forEach(b=>b.addEventListener('click',()=>go(current+Number(b.dataset.leafStep))));
 document.querySelectorAll('[data-leaf-link]').forEach(a=>a.addEventListener('click',event=>{event.preventDefault();a.closest('dialog').dataset.focusLeaf='true';a.closest('dialog').close();const n=Number(a.dataset.leafLink);if(n!==current)go(n);else folios[current].focus();}));
 addEventListener('popstate',()=>show(fromHash(),{focus:true}));addEventListener('hashchange',()=>{if(folios.some(f=>'#'+f.id===location.hash))show(fromHash(),{focus:true});});
 document.addEventListener('keydown',event=>{if(event.altKey||event.ctrlKey||event.metaKey||event.shiftKey||document.querySelector('dialog[open]')||event.target.closest('input,textarea,select,button,a,summary,[contenteditable]')||!root.contains(event.target))return;if(event.key==='ArrowRight'){event.preventDefault();go(current+1);}if(event.key==='ArrowLeft'){event.preventDefault();go(current-1);}});
 keep?.addEventListener('click',()=>{const saved=places();if(!saved.ok){status(text.corrupt);return;}const place={id:root.dataset.bookId,lang,title:root.dataset.bookTitle,route:root.dataset.bookRoute,folio:folios[current].id,revision:root.dataset.bookRevision};if(write(keepPlace(saved.value,place))){status(hi?'यह पृष्ठ इसी ब्राउज़र में सहेजा गया।':'This page is kept in this browser.');updateKept();}});
}
for(const button of document.querySelectorAll('[data-open-dialog]'))button.addEventListener('click',()=>{const dialog=document.getElementById(button.dataset.openDialog);dialog.showModal();dialog.addEventListener('close',()=>{if(dialog.dataset.focusLeaf){delete dialog.dataset.focusLeaf;folios[current]?.focus({preventScroll:true});}else button.focus();},{once:true});});
document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('[data-text-size]').forEach(b=>b.addEventListener('click',()=>{document.documentElement.style.setProperty('--read-size',b.dataset.textSize+'px');document.querySelectorAll('[data-text-size]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
document.querySelectorAll('[data-page-theme]').forEach(b=>b.addEventListener('click',()=>{document.body.dataset.pageTheme=b.dataset.pageTheme;document.querySelectorAll('button[data-page-theme]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
const search=document.querySelector('#book-search'),entries=[...document.querySelectorAll('[data-book-entry]')];
function filter(){const q=search.value.trim().normalize('NFKC').toLocaleLowerCase();let count=0;for(const entry of entries){entry.hidden=!entry.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(q);if(!entry.hidden)count++;}document.querySelector('[data-results-count]').textContent=hi?`${count} कथाएँ`:`${count} ${document.body.dataset.sourceIndex?'sections':'stories'}`;document.querySelector('[data-search-empty]').hidden=count>0;}
search?.addEventListener('input',filter);document.querySelector('[data-search-clear]')?.addEventListener('click',()=>{search.value='';filter();search.focus();});if(search)filter();
for(const a of document.querySelectorAll('.source-trigger'))a.addEventListener('click',()=>{document.querySelector('#edition-note').open=true;});
reduce.addEventListener('change',()=>animation?.cancel());document.addEventListener('visibilitychange',()=>{if(document.hidden)animation?.cancel();});
addEventListener('storage',event=>{if(event.key===KEY||event.key===null){renderShelf();updateKept();}});
renderShelf();document.querySelectorAll('[data-enhancement]').forEach(n=>n.hidden=false);
