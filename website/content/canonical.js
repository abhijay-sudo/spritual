const input=document.querySelector('[data-search-input]'),cards=[...document.querySelectorAll('[data-story]')],hi=document.documentElement.lang==='hi';
if(input){
 const controls=[...document.querySelectorAll('[data-filter]')],reset=document.querySelector('[data-clear-filters]'),advanced=document.querySelector('.advanced-filters');
 function restore(){const params=new URLSearchParams(location.search);input.value=params.get('q')||'';for(const control of controls){const value=params.get(control.dataset.filter)||'';control.value=[...control.options].find(o=>o.value.toLocaleLowerCase()===value.toLocaleLowerCase())?.value||'';}if(controls.some(c=>['value','mood','age','festival'].includes(c.dataset.filter)&&c.value))advanced.open=true;filter(false);}
 function filter(write=true){
  const before=new Map(cards.filter(c=>!c.hidden).map(c=>[c,c.getBoundingClientRect()])),q=input.value.normalize('NFKC').toLocaleLowerCase().trim();let count=0;
  for(const card of cards){const matches=controls.every(select=>{if(!select.value)return true;const key=select.dataset.filter;if(key==='collection'||key==='age')return card.dataset[key]===select.value;if(key==='duration'){const [lo,high=lo]=select.value.split('-').map(Number);return Number(card.dataset.duration)>=lo&&Number(card.dataset.duration)<=high;}return JSON.parse(card.dataset[{value:'values',mood:'moods',festival:'festivals'}[key]]||'[]').some(value=>value.toLocaleLowerCase()===select.value.toLocaleLowerCase());});card.hidden=!(matches&&card.dataset.search.normalize('NFKC').toLocaleLowerCase().includes(q));if(!card.hidden)count++;}
  document.querySelector('[data-result-count]').textContent=hi?`${count} कथाएँ`:`${count} ${count===1?'story':'stories'}`;document.querySelector('[data-empty]').hidden=count>0;
  const value=document.querySelector('[data-filter=value]').value;document.querySelectorAll('[data-value-pill]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.valuePill.toLocaleLowerCase()===value.toLocaleLowerCase())));
  const active=controls.filter(c=>c.value).length;reset.disabled=!active&&!input.value;const extra=controls.filter(c=>['value','mood','age','festival'].includes(c.dataset.filter)&&c.value).length;document.querySelector('[data-filter-badge]').textContent=extra?`(${extra})`:'';
  if(write){const url=new URL(location.href);url.searchParams.delete('q');controls.forEach(c=>url.searchParams.delete(c.dataset.filter));if(input.value.trim())url.searchParams.set('q',input.value.trim());controls.filter(c=>c.value).forEach(c=>url.searchParams.set(c.dataset.filter,c.value));history.replaceState(null,'',url);}
  if(write&&!matchMedia('(prefers-reduced-motion: reduce)').matches)for(const card of cards.filter(c=>!c.hidden)){const old=before.get(card),now=card.getBoundingClientRect();card.getAnimations().forEach(a=>a.cancel());card.animate(old?[{translate:`${old.left-now.left}px ${old.top-now.top}px`},{translate:'0 0'}]:[{opacity:.5,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:260,easing:'cubic-bezier(.2,.8,.2,1)'});}
 }
 input.addEventListener('input',()=>filter());controls.forEach(c=>c.addEventListener('change',()=>filter()));reset.addEventListener('click',()=>{input.value='';controls.forEach(c=>c.value='');filter();input.focus({preventScroll:true});});
 for(const b of document.querySelectorAll('[data-value-pill]'))b.addEventListener('click',()=>{const select=document.querySelector('[data-filter=value]'),value=b.dataset.valuePill;select.value=[...select.options].find(o=>o.value.toLocaleLowerCase()===value.toLocaleLowerCase())?.value||'';filter();});
 addEventListener('popstate',restore);restore();
 advanced.addEventListener('keydown',e=>{if(e.key==='Escape'&&advanced.open){advanced.open=false;advanced.querySelector('summary').focus();e.stopPropagation();}});
 document.addEventListener('pointerdown',e=>{if(advanced.open&&!advanced.contains(e.target))advanced.open=false;});
}
const old=new URLSearchParams(location.search).get('from');
if(old&&document.querySelector('[data-reader]')){try{const response=await fetch('/legacy-routes.json');if(!response.ok)throw Error('Missing route manifest');const {legacy}=await response.json();const entry=legacy[old];if(entry){const folio=decodeURIComponent(location.hash.slice(1));const number=entry.folios[folio]||entry.start;history.replaceState(null,'',location.pathname+'#page-'+number);dispatchEvent(new HashChangeEvent('hashchange'));}}catch{/* The canonical first page remains readable if route metadata cannot load. */}}
const note=document.getElementById('edition-note'),trigger=document.querySelector('.source-trigger');
if(note&&trigger&&typeof HTMLDialogElement!=='undefined'){
 const drawer=document.createElement('dialog');drawer.className='source-drawer';drawer.setAttribute('aria-labelledby','source-drawer-title');
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',hi?'बंद करें':'Close sources');
 const heading=document.createElement('h2');heading.id='source-drawer-title';heading.textContent=hi?'स्रोत और संदर्भ':'Sources & context';
 drawer.append(close,heading,note);document.body.append(drawer);trigger.setAttribute('aria-haspopup','dialog');
 trigger.addEventListener('click',event=>{event.preventDefault();note.open=true;window.SpritualSheets?window.SpritualSheets.open(drawer,trigger):drawer.showModal();});close.addEventListener('click',()=>window.SpritualSheets?window.SpritualSheets.close(drawer):drawer.close());drawer.addEventListener('close',()=>trigger.focus({preventScroll:true}));
}
const daily=[...document.querySelectorAll('[data-daily-card]')];if(daily.length){const day=Math.floor((Date.now()+19800000)/86400000)%daily.length;daily.forEach((node,i)=>node.hidden=i!==day);}

// Animate only elements already visible; failed enhancement never hides content.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations=new Set();
function settleEntrances(){for(const animation of entranceAnimations)animation.cancel();entranceAnimations.clear();}
if(!motionPreference.matches){
 const targets=[...document.querySelectorAll('.editorial-hero:not(.ceremony-hero)>div,.editorial-hero:not(.ceremony-hero)>img,.reader-story-title')];
 targets.forEach((node,index)=>{
  if(node.getBoundingClientRect().top>=innerHeight)return;
  const animation=node.animate([{opacity:1,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:480,delay:index*70,easing:'cubic-bezier(.22,.61,.36,1)'});
  entranceAnimations.add(animation);animation.finished.then(()=>entranceAnimations.delete(animation),()=>entranceAnimations.delete(animation));
 });
}
motionPreference.addEventListener('change',settleEntrances);addEventListener('pagehide',settleEntrances);

for(const button of document.querySelectorAll('[data-home-size]'))button.addEventListener('click',()=>{const size=button.dataset.homeSize;document.documentElement.style.setProperty('--read-size',size+'px');document.querySelectorAll('[data-home-size]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));try{const old=JSON.parse(sessionStorage.getItem('spritual_book_appearance_v1')||'{}');sessionStorage.setItem('spritual_book_appearance_v1',JSON.stringify({...old,size}));sessionStorage.setItem('spritual_experience_size_v1',size);}catch{}});
