import {SHELF_KEY,readShelf,changeShelf,normalizeSearch} from './library-state.js';
const data=JSON.parse(document.querySelector('#library-data').textContent);const $=id=>document.getElementById(id);const hi=document.documentElement.lang==='hi';const say=(en,hindi)=>hi?hindi:en;
let state={kind:'empty',items:[]};
function renderShelf(){try{state=readShelf(localStorage,data.keys);}catch{state={kind:'invalid',items:[]};}
 const invalid=state.kind==='invalid';if($('shelf-warning'))$('shelf-warning').hidden=!invalid;if($('clear-shelf'))$('clear-shelf').hidden=!invalid;
 for(const button of document.querySelectorAll('[data-save]')){const saved=state.items.includes(button.dataset.save);button.disabled=invalid;button.setAttribute('aria-pressed',String(saved));button.textContent=saved?say('Remove saved place','सहेजा स्थान हटाएँ'):say('Save this place','यह स्थान सहेजें');}
 if($('saved-list')){const root=$('saved-list');root.replaceChildren();for(const id of state.items){const row=data.units.find(x=>x.id===id);if(!row)continue;const item=document.createElement('li');const a=document.createElement('a');a.href=row.href;a.textContent=`${row.collection} · ${row.title}`;const remove=document.createElement('button');remove.className='text-button';remove.textContent=say('Remove','हटाएँ');remove.setAttribute('aria-label',`${say('Remove','हटाएँ')} ${row.title}`);remove.addEventListener('click',()=>{try{changeShelf(localStorage,data.keys,id,false);renderShelf();$('shelf-status').textContent=say('Saved place removed.','सहेजा स्थान हटा दिया गया।');$('shelf-status').focus();}catch{showError();}});item.append(a,remove);root.append(item);} $('shelf-empty').hidden=state.items.length>0||invalid;}
 if($('resume-place')){const first=data.units.find(x=>x.id===state.items[0]);$('resume-place').hidden=!first;if(first){$('resume-place').href=first.href;$('resume-place').textContent=say('Return to ','वापस जाएँ: ')+first.title;}}
}
function showError(){const status=$('shelf-status');if(status)status.textContent=say('Could not update saved places on this device. Your change was not saved. You can keep browsing.','इस डिवाइस पर बदलाव नहीं सहेज सके। आप पढ़ना जारी रख सकते हैं।');}
renderShelf();window.addEventListener('storage',e=>{if(e.key===SHELF_KEY||e.key===null)renderShelf();});
for(const button of document.querySelectorAll('[data-save]'))button.addEventListener('click',()=>{try{const prior=readShelf(localStorage,data.keys);if(prior.kind==='invalid')throw Error();const saving=!prior.items.includes(button.dataset.save);changeShelf(localStorage,data.keys,button.dataset.save,saving);renderShelf();$('shelf-status').textContent=saving?say('Saved on this device only.','केवल इस डिवाइस पर सहेजा गया।'):say('Saved place removed.','सहेजा स्थान हटा दिया गया।');}catch{renderShelf();showError();}});
$('clear-shelf')?.addEventListener('click',()=>{try{localStorage.removeItem(SHELF_KEY);renderShelf();$('shelf-status').textContent=say('Unreadable saved places removed. You can save again.','अपठनीय सहेजे स्थान हटा दिए गए। अब फिर सहेज सकते हैं।');}catch{showError();}});
const search=$('library-search');const filter=$('library-filter');
function syncDiscoveryUrl(){
 const url=new URL(location.href);if(search.value)url.searchParams.set('q',search.value);else url.searchParams.delete('q');if(filter.value)url.searchParams.set('collection',filter.value);else url.searchParams.delete('collection');history.replaceState(history.state,'',`${url.pathname}${url.search}${url.hash}`);
 const language=document.querySelector('.language');if(language){const other=new URL(language.href,location.href);for(const key of ['q','collection','world']){const value=url.searchParams.get(key);if(value)other.searchParams.set(key,value);else other.searchParams.delete(key);}language.href=`${other.pathname}${other.search}${other.hash}`;}
}
function searchResults(updateUrl=false){const q=normalizeSearch(search.value);let count=0;for(const row of document.querySelectorAll('[data-library-row]')){const visible=(!filter.value||row.dataset.collection===filter.value)&&normalizeSearch(row.dataset.search).includes(q);row.hidden=!visible;if(visible)count++;}for(const group of document.querySelectorAll('[data-library-group]')){const visible=Boolean(group.querySelector('[data-library-row]:not([hidden])'));group.hidden=!visible;if(visible&&(q||filter.value))group.open=true;else if(!q&&!filter.value)group.open=false;}$('search-count').textContent=hi?`${count} परिणाम`:`${count} ${count===1?'result':'results'}`;$('search-empty').hidden=count>0;if(updateUrl)syncDiscoveryUrl();}
search?.addEventListener('input',()=>searchResults(true));filter?.addEventListener('change',()=>searchResults(true));$('search-reset')?.addEventListener('click',()=>{search.value='';filter.value='';searchResults(true);search.focus();});
if(search){const params=new URLSearchParams(location.search),collection=params.get('collection');search.value=(params.get('q')||'').slice(0,120);if([...filter.options].some(option=>option.value===collection))filter.value=collection;searchResults();syncDiscoveryUrl();}
for(const jump of document.querySelectorAll('.directory-jumps a'))jump.addEventListener('click',()=>{const group=document.querySelector(jump.hash);if(group)group.open=true;});
let size=1;for(const b of document.querySelectorAll('[data-reading-size]'))b.addEventListener('click',()=>{size=Math.max(.9,Math.min(1.4,size+Number(b.dataset.readingSize)));$('reading-body').style.fontSize=`${size*20}px`;$('reading-size-status').textContent=`${Math.round(size*100)}%`;});
function setFocus(active){
 document.body.classList.toggle('reading-focus',active);$('focus-reading')?.setAttribute('aria-pressed',String(active));
 if($('exit-focus'))$('exit-focus').hidden=!active;
 for(const el of document.querySelectorAll('.header,.world-bar,.library-subnav,.footer'))el.inert=active;
 (active?$('exit-focus'):$('focus-reading'))?.focus({preventScroll:true});
}
$('focus-reading')?.addEventListener('click',()=>setFocus(!document.body.classList.contains('reading-focus')));
$('exit-focus')?.addEventListener('click',()=>setFocus(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('reading-focus'))setFocus(false);});
