import {KEY,parsePlaces,keepPlace,encodePlaces} from '/books/state.js';
const hi=document.documentElement.lang==='hi',t=(en,hn)=>hi?hn:en;
// Measure actual chrome so deep links work with translated text and browser zoom.
const bar=document.querySelector('.reader-mode-bar');
if(bar){const measure=()=>document.documentElement.style.setProperty('--reader-bar-height',`${Math.ceil(bar.getBoundingClientRect().height)}px`);new ResizeObserver(measure).observe(bar);measure();}
for(const detail of document.querySelectorAll('.home-appearance')){
 detail.addEventListener('keydown',e=>{if(e.key==='Escape'){detail.open=false;detail.querySelector('summary').focus();}});
 document.addEventListener('pointerdown',e=>{if(detail.open&&!detail.contains(e.target))detail.open=false;});
}
// Undo writes against fresh storage, preserving edits made in another tab.
if(document.querySelector('[data-kept-list]')){
 const removed=[],notice=document.createElement('div'),message=document.createElement('span'),undo=document.createElement('button'),dismiss=document.createElement('button');
 notice.className='undo-notice';notice.hidden=true;message.setAttribute('role','status');undo.type=dismiss.type='button';undo.textContent=t('Undo','वापस रखें');dismiss.textContent='×';dismiss.dataset.dismissUndo='';dismiss.setAttribute('aria-label',t('Dismiss message','संदेश बंद करें'));notice.append(message,undo,dismiss);document.body.append(notice);
 const refresh=()=>document.dispatchEvent(new CustomEvent('shelf:refresh'));
 const paint=()=>{notice.hidden=!removed.length;message.textContent=t('Page removed from Saved.','पृष्ठ सहेजी सूची से हटाया गया।');};
 document.addEventListener('shelf:removed',event=>{removed.push(event.detail.place);paint();});
 undo.addEventListener('click',()=>{const place=removed.at(-1);if(!place)return;try{const current=parsePlaces(localStorage.getItem(KEY));if(!current.some(p=>p.id===place.id&&p.lang===place.lang))localStorage.setItem(KEY,encodePlaces(keepPlace(current,place)));removed.pop();refresh();paint();if(!removed.length)document.querySelector('[data-kept-list] a')?.focus({preventScroll:true});}catch{message.textContent=t('This browser could not restore the page. Try Undo again.','यह ब्राउज़र पृष्ठ वापस नहीं रख सका। फिर कोशिश करें।');}});
 dismiss.addEventListener('click',()=>{removed.length=0;notice.hidden=true;const target=document.querySelector('[data-kept-list] a')||document.querySelector('#kept h1');if(target){target.tabIndex=-1;target.focus({preventScroll:true});}});
 addEventListener('storage',event=>{if(event.key===KEY)refresh();});
}
// Long phone pages keep their position on a turn; an explicit route back to the
// new heading gives the reader control without an unexpected document jump.
const reader=document.querySelector('[data-reader]'),position=document.querySelector('[data-page-position]');
if(reader&&position){
 const top=document.createElement('button'),group=document.createElement('div');top.type='button';top.className='page-top';top.dataset.pageTop='';top.textContent=t('Page top ↑','पृष्ठ का आरंभ ↑');group.className='page-position-group';position.replaceWith(group);group.append(position,top);
 top.addEventListener('click',()=>{const folio=reader.querySelectorAll('[data-folio]')[Number(reader.dataset.currentPage||0)];if(!folio)return;folio.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});folio.focus({preventScroll:true});});
}
