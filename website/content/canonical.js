const input=document.querySelector('[data-search-input]'),cards=[...document.querySelectorAll('[data-story]')],hi=document.documentElement.lang==='hi';
if(input){const controls=[...document.querySelectorAll('[data-filter]')];const filter=()=>{const q=input.value.normalize('NFKC').toLocaleLowerCase().trim();let count=0;for(const card of cards){const matches=controls.every(select=>{if(!select.value)return true;const key=select.dataset.filter;if(key==='collection'||key==='age')return card.dataset[key]===select.value;return JSON.parse(card.dataset[{value:'values',mood:'moods',festival:'festivals'}[key]]||'[]').some(value=>value.toLocaleLowerCase()===select.value.toLocaleLowerCase());});card.hidden=!(matches&&card.dataset.search.normalize('NFKC').includes(q));if(!card.hidden)count++;}document.querySelector('[data-result-count]').textContent=hi?`${count} कथाएँ`:`${count} stories`;document.querySelector('[data-empty]').hidden=count>0;};input.addEventListener('input',filter);controls.forEach(c=>c.addEventListener('change',filter));document.querySelector('[data-clear-filters]').addEventListener('click',()=>{input.value='';controls.forEach(c=>c.value='');filter();input.focus();});filter();}
function sceneArt(){const scene=document.querySelector('[data-folio]:not([hidden])');const image=document.querySelector('.frontispiece-art img');if(scene?.dataset.sceneImage&&image){image.removeAttribute('srcset');if(image.getAttribute('src')!==scene.dataset.sceneImage)image.src=scene.dataset.sceneImage;image.alt=scene.dataset.sceneAlt||'';}}
document.addEventListener('book:pagechange',sceneArt);sceneArt();
const old=new URLSearchParams(location.search).get('from');
if(old&&document.querySelector('[data-reader]')){try{const response=await fetch('/legacy-routes.json');if(!response.ok)throw Error('Missing route manifest');const {legacy}=await response.json();const entry=legacy[old];if(entry){const folio=decodeURIComponent(location.hash.slice(1));const number=entry.folios[folio]||entry.start;history.replaceState(null,'',location.pathname+'#page-'+number);dispatchEvent(new HashChangeEvent('hashchange'));}}catch{/* The canonical first page remains readable if route metadata cannot load. */}}
const note=document.getElementById('edition-note'),trigger=document.querySelector('.source-trigger');
if(note&&trigger&&typeof HTMLDialogElement!=='undefined'){
 const drawer=document.createElement('dialog');drawer.className='source-drawer';drawer.setAttribute('aria-labelledby','source-drawer-title');
 const close=document.createElement('button');close.type='button';close.textContent='×';close.setAttribute('aria-label',hi?'बंद करें':'Close sources');
 const heading=document.createElement('h2');heading.id='source-drawer-title';heading.textContent=hi?'स्रोत और संदर्भ':'Sources & context';
 drawer.append(close,heading,note);document.body.append(drawer);trigger.setAttribute('aria-haspopup','dialog');
 trigger.addEventListener('click',event=>{event.preventDefault();note.open=true;drawer.showModal();});close.addEventListener('click',()=>drawer.close());drawer.addEventListener('close',()=>trigger.focus({preventScroll:true}));
}
const daily=[...document.querySelectorAll('[data-daily-card]')];if(daily.length){const day=Math.floor((Date.now()+19800000)/86400000)%daily.length;daily.forEach((node,i)=>node.hidden=i!==day);}

// Animate only elements already visible; failed enhancement never hides content.
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
const entranceAnimations=new Set();
function settleEntrances(){for(const animation of entranceAnimations)animation.cancel();entranceAnimations.clear();}
if(!motionPreference.matches){
 const targets=[...document.querySelectorAll('.editorial-hero>div,.editorial-hero>img,.reader-story-title')];
 targets.forEach((node,index)=>{
  if(node.getBoundingClientRect().top>=innerHeight)return;
  const animation=node.animate([{opacity:.65,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:480,delay:index*70,easing:'cubic-bezier(.22,.61,.36,1)'});
  entranceAnimations.add(animation);animation.finished.then(()=>entranceAnimations.delete(animation),()=>entranceAnimations.delete(animation));
 });
}
motionPreference.addEventListener('change',settleEntrances);addEventListener('pagehide',settleEntrances);
