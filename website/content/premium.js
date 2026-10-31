import {KEY,parsePlaces,keepPlace,encodePlaces} from '/books/state.js';
const hi=document.documentElement.lang==='hi',t=(en,hn)=>hi?hn:en;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');

// =========================================================================
// 1. PAPER TONE & READING PREFERENCES CONTROLLER
// =========================================================================
try{
 const savedTone=localStorage.getItem('spritual_paper_tone_v1');
 if(savedTone){document.documentElement.dataset.paperTone=savedTone;}
}catch{}
document.querySelectorAll('[data-paper-tone-select]').forEach(btn=>{
 const tone=btn.dataset.paperToneSelect;
 const currentTone=document.documentElement.dataset.paperTone||'sunlit';
 btn.setAttribute('aria-pressed',String(currentTone===tone));
 btn.addEventListener('click',()=>{
  document.documentElement.dataset.paperTone=tone;
  document.querySelectorAll('[data-paper-tone-select]').forEach(b=>b.setAttribute('aria-pressed',String(b===btn)));
  try{localStorage.setItem('spritual_paper_tone_v1',tone);}catch{}
 });
});

for(const detail of document.querySelectorAll('.home-appearance')){
 detail.addEventListener('keydown',e=>{if(e.key==='Escape'){detail.open=false;detail.querySelector('summary').focus();}});
 document.addEventListener('pointerdown',e=>{if(detail.open&&!detail.contains(e.target))detail.open=false;});
}

// Measure actual chrome so deep links work with translated text and browser zoom.
const bar=document.querySelector('.reader-mode-bar');
if(bar){const measure=()=>document.documentElement.style.setProperty('--reader-bar-height',`${Math.ceil(bar.getBoundingClientRect().height)}px`);new ResizeObserver(measure).observe(bar);measure();}

// =========================================================================
// 2. GLIDING NAVIGATION PILL & SAVED BADGE COUNTER
// =========================================================================
const nav=document.querySelector('.primary-navigation');
const navPill=nav?.querySelector('.nav-active-pill');
if(nav&&navPill){
 const activeLink=nav.querySelector('a[aria-current="page"]');
 function positionPill(target,spring=true){
  if(!target){navPill.classList.remove('visible');return;}
  const left=target.offsetLeft,width=target.offsetWidth;
  navPill.style.transform=`translateX(${left}px)`;
  navPill.style.width=`${width}px`;
  navPill.classList.add('visible');
 }
 if(activeLink)positionPill(activeLink,false);
 nav.querySelectorAll('a').forEach(a=>{
  a.addEventListener('pointerenter',()=>positionPill(a,true));
 });
 nav.addEventListener('pointerleave',()=>{
  if(activeLink)positionPill(activeLink,true);
  else navPill.classList.remove('visible');
 });
}

function updateSavedBadge(){
 let count=0;
 try{
  const places=parsePlaces(localStorage.getItem(KEY));
  count=places.length;
 }catch{}
 document.querySelectorAll('[data-saved-count]').forEach(badge=>{
  badge.textContent=String(count);
  badge.hidden=count===0;
 });
}
updateSavedBadge();
addEventListener('storage',e=>{if(e.key===KEY)updateSavedBadge();});
document.addEventListener('book:kept',updateSavedBadge);
document.addEventListener('shelf:removed',updateSavedBadge);
document.addEventListener('shelf:refresh',updateSavedBadge);

// =========================================================================
// 3. ⌘K COMMAND PALETTE MODAL
// =========================================================================
const cmdModal=document.getElementById('command-manuscript');
if(cmdModal){
 const cmdInput=cmdModal.querySelector('[data-command-input]');
 const cmdList=cmdModal.querySelector('[data-command-list]');
 const cmdClose=cmdModal.querySelector('[data-close-command]');
 let searchCorpus=null;
 let activeIndex=-1;

 async function getCorpus(){
  if(searchCorpus)return searchCorpus;
  const items=[];
  // Collections
  const colDefs=[
   {id:'ramayana',en:'01 Ramayana',hi:'01 रामायण',sub_en:'Valmiki Ramayana · Bala Kanda to Yuddha Kanda',sub_hi:'वाल्मीकि रामायण · बालकाण्ड से युद्धकाण्ड',url:hi?'/hi/collections/ramayana/':'/collections/ramayana/'},
   {id:'krishna',en:'02 Krishna',hi:'02 कृष्ण',sub_en:'Bhagavata Purana · Vrindavana & Mathura',sub_hi:'भागवत पुराण · वृन्दावन और मथुरा',url:hi?'/hi/collections/krishna/':'/collections/krishna/'},
   {id:'shiva',en:'03 Shiva',hi:'03 शिव',sub_en:'Shiva Purana · Restraint, Power & Silence',sub_hi:'शिव पुराण · संयम, शक्ति और मौन',url:hi?'/hi/collections/shiva/':'/collections/shiva/'},
   {id:'devi',en:'04 Devi',hi:'04 देवी',sub_en:'Devi Mahatmya · Grace, Courage & Refuge',sub_hi:'देवी माहात्म्य · कृपा, साहस और शरण',url:hi?'/hi/collections/devi/':'/collections/devi/'},
   {id:'ganesha',en:'05 Ganesha & Family',hi:'05 गणेश और परिवार',sub_en:'Purana Traditions · Wisdom, Family & Attention',sub_hi:'पौराणिक परम्परा · विवेक, परिवार और ध्यान',url:hi?'/hi/collections/ganesha/':'/collections/ganesha/'},
   {id:'mahabharata',en:'06 Mahabharata',hi:'06 महाभारत',sub_en:'Vyasa Mahabharata · Choices, Friendship & Duty',sub_hi:'व्यास महाभारत · चुनाव, मैत्री और कर्तव्य',url:hi?'/hi/collections/mahabharata/':'/collections/mahabharata/'}
  ];
  for(const c of colDefs){
   items.push({type:hi?'संग्रह':'Collection',title:hi?c.hi:c.en,subtitle:hi?c.sub_hi:c.sub_en,url:c.url,search:`${c.en} ${c.hi} ${c.sub_en} ${c.sub_hi}`.toLowerCase()});
  }
  // Characters
  const charDefs=[
   ['rama','Rama','राम','Prince of Ayodhya · Dharma, duty and courage'],
   ['sita','Sita','सीता','Princess of Mithila · Truth, resilience and grace'],
   ['lakshmana','Lakshmana','लक्ष्मण','Steadfast brother · Devotion and alertness'],
   ['hanuman','Hanuman','हनुमान','Courage, selfless service and devotion'],
   ['valmiki','Valmiki','वाल्मीकि','The First Poet · Inquirer into virtue'],
   ['krishna','Krishna','कृष्ण','Teacher, companion and protector'],
   ['shiva','Shiva','शिव','The Silent Lord · Restraint and patient resolve'],
   ['parvati','Parvati','पार्वती','Goddess of devotion and strength'],
   ['devi','Devi','देवी','The Divine Mother · Refuge of seekers'],
   ['ganesha','Ganesha','गणेश','Lord of Beginnings · Mindful wisdom'],
   ['yudhishthira','Yudhishthira','युधिष्ठिर','The Just King · Integrity tested by grief']
  ];
  for(const [id,en,hn,desc] of charDefs){
   items.push({type:hi?'पात्र':'Character',title:hi?hn:en,subtitle:desc,url:hi?`/hi/characters/${id}/`:`/characters/${id}/`,search:`${en} ${hn} ${desc}`.toLowerCase()});
  }
  // Values
  const valDefs=[
   ['curiosity','Curiosity','जिज्ञासा'],
   ['friendship','Friendship','मैत्री'],
   ['hospitality','Hospitality','आतिथ्य'],
   ['communication','Communication','संवाद'],
   ['courage','Courage','धैर्य'],
   ['responsibility','Responsibility','उत्तरदायित्व'],
   ['devotion','Devotion','भक्ति'],
   ['discernment','Discernment','विवेक'],
   ['compassion','Compassion','करुणा']
  ];
  for(const [id,en,hn] of valDefs){
   items.push({type:hi?'मूल्य':'Human Value',title:hi?hn:en,subtitle:hi?`कथाएँ: ${hn}`:`Filter stories by ${en}`,url:(hi?'/hi/':'/')+`?value=${id}#stories`,search:`${en} ${hn}`.toLowerCase()});
  }
  // Stories from catalogue.json
  try{
   const res=await fetch('/catalogue.json');
   if(res.ok){
    const stories=await res.json();
    for(const s of stories){
     const title=s.title?.[hi?'hi':'en']||s.id;
     const sub=s.subtitle?.[hi?'hi':'en']||`${s.book||''} · ${s.arc||''}`;
     const url=s.paths?.[hi?'hi':'en']||'/';
     const values=(s.values||[]).join(' ');
     const chars=(s.characters||[]).join(' ');
     items.push({type:hi?'कथा':'Story',title,subtitle:sub,url,search:`${s.id} ${title} ${sub} ${values} ${chars}`.toLowerCase()});
    }
   }
  }catch{}
  searchCorpus=items;
  return items;
 }

 function openCommand(){
  cmdModal.showModal();
  cmdInput.value='';
  activeIndex=-1;
  renderResults('');
  cmdInput.focus();
 }
 function closeCommand(){
  cmdModal.close();
 }

 async function renderResults(query){
  const corpus=await getCorpus();
  const q=query.trim().toLowerCase();
  const matched=q?corpus.filter(item=>item.search.includes(q)).slice(0,12):corpus.slice(0,8);
  if(!matched.length){
   cmdList.innerHTML=`<div class="command-empty" style="padding:24px;text-align:center;color:var(--ink-muted);font-size:14px;">${t('No stories or characters match your search.','कोई कथा या पात्र नहीं मिला।')}</div>`;
   return;
  }
  cmdList.innerHTML=matched.map((item,idx)=>`
   <div class="command-item${idx===activeIndex?' active':''}" data-command-index="${idx}" role="option" aria-selected="${idx===activeIndex}">
    <div class="command-item-main">
     <div class="command-item-title">${item.title}</div>
     <div class="command-item-sub">${item.subtitle}</div>
    </div>
    <span class="command-item-badge">${item.type}</span>
   </div>
  `).join('');
  cmdList.querySelectorAll('.command-item').forEach((el,idx)=>{
   el.addEventListener('click',()=>{
    const item=matched[idx];
    if(item){location.href=item.url;}
   });
  });
 }

 document.querySelectorAll('[data-open-command]').forEach(btn=>btn.addEventListener('click',openCommand));
 cmdClose?.addEventListener('click',closeCommand);
 cmdModal.addEventListener('click',e=>{if(e.target===cmdModal)closeCommand();});
 cmdInput?.addEventListener('input',()=>renderResults(cmdInput.value));
 cmdInput?.addEventListener('keydown',e=>{
  const items=cmdList.querySelectorAll('.command-item');
  if(!items.length)return;
  if(e.key==='ArrowDown'){
   e.preventDefault();
   activeIndex=Math.min(items.length-1,activeIndex+1);
   items.forEach((it,i)=>it.classList.toggle('active',i===activeIndex));
   items[activeIndex]?.scrollIntoView({block:'nearest'});
  }else if(e.key==='ArrowUp'){
   e.preventDefault();
   activeIndex=Math.max(0,activeIndex-1);
   items.forEach((it,i)=>it.classList.toggle('active',i===activeIndex));
   items[activeIndex]?.scrollIntoView({block:'nearest'});
  }else if(e.key==='Enter'&&activeIndex>=0){
   e.preventDefault();
   items[activeIndex]?.click();
  }
 });

 // Global keyboard shortcut ⌘K / Ctrl+K
 addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){
   e.preventDefault();
   if(cmdModal.open)closeCommand();
   else openCommand();
  }
 });
}

// =========================================================================
// 4. SILK BOOKMARKING & 12-PARTICLE GOLD SPARK BURST
// =========================================================================
function spawnGoldSparks(target){
 if(reducedMotion.matches)return;
 const rect=target.getBoundingClientRect();
 const centerX=rect.left+rect.width/2+window.scrollX;
 const centerY=rect.top+rect.height/2+window.scrollY;
 for(let i=0;i<12;i++){
  const spark=document.createElement('span');
  spark.className='gold-spark-particle';
  spark.style.left=`${centerX}px`;
  spark.style.top=`${centerY}px`;
  document.body.appendChild(spark);
  const angle=(i/12)*2*Math.PI+((Math.random()-0.5)*0.4);
  const dist=24+Math.random()*36;
  const targetX=Math.cos(angle)*dist;
  const targetY=Math.sin(angle)*dist;
  const anim=spark.animate([
   {transform:'translate(0, 0) scale(1)',opacity:1},
   {transform:`translate(${targetX}px, ${targetY}px) scale(0)`,opacity:0}
  ],{duration:550+Math.random()*200,easing:'cubic-bezier(0.16, 1, 0.3, 1)'});
  anim.finished.then(()=>spark.remove(),()=>spark.remove());
 }
}

document.querySelectorAll('[data-keep-scene]').forEach(btn=>{
 btn.addEventListener('click',e=>{
  e.preventDefault();
  const reader=document.querySelector('[data-canonical-reader],[data-reader]');
  const sceneNum=btn.dataset.keepScene;
  const folioId=`page-${sceneNum}`;
  const bookId=reader?.dataset.bookId||location.pathname.replace(/^\/(hi\/)?collections\/[a-z0-9-]+\/books\/[a-z0-9-]+\/arcs\/[a-z0-9-]+\/stories\//,'').replace(/\/$/,'');
  const bookTitle=document.querySelector('.reader-story-title')?.textContent||document.title;
  const place={
   id:bookId,
   lang:hi?'hi':'en',
   title:bookTitle,
   route:location.pathname,
   folio:folioId,
   revision:'canonical-draft-1',
   savedAt:new Date().toISOString()
  };
  try{
   const current=parsePlaces(localStorage.getItem(KEY));
   localStorage.setItem(KEY,encodePlaces(keepPlace(current,place)));
   btn.classList.add('scene-kept');
   btn.querySelector('span').textContent=t('Page kept ✓','सहेजा गया ✓');
   spawnGoldSparks(btn);
   document.dispatchEvent(new CustomEvent('book:kept',{detail:{place}}));
  }catch{}
 });
});

// =========================================================================
// 5. 11-SCENE GOLDEN SPINE THREAD & ACTIVE SCENE FOCUS
// =========================================================================
const spineFill=document.querySelector('[data-spine-fill]');
const beads=document.querySelectorAll('[data-spine-bead]');
const folios=document.querySelectorAll('.book-leaves .folio, [data-folio]');
const asideImage=document.querySelector('.frontispiece-art img');

if(spineFill&&folios.length){
 let spineRAF=0;
 function updateSpine(){
  spineRAF=0;
  const first=folios[0],last=folios[folios.length-1];
  if(!first||!last)return;
  const top=first.getBoundingClientRect().top+window.scrollY;
  const bottom=last.getBoundingClientRect().bottom+window.scrollY;
  const total=bottom-top-window.innerHeight*0.5;
  const current=window.scrollY-top;
  const progress=total>0?Math.min(1,Math.max(0,current/total)):0;
  spineFill.style.transform=`scaleY(${progress})`;
 }
 addEventListener('scroll',()=>{
  if(!spineRAF)spineRAF=requestAnimationFrame(updateSpine);
 },{passive:true});
 updateSpine();

 // Scene viewport intersection: Highlight active scene, dim non-active, update aside image
 if(typeof IntersectionObserver!=='undefined'){
  const sceneObserver=new IntersectionObserver(entries=>{
   for(const entry of entries){
    if(entry.isIntersecting){
     const folio=entry.target;
     folios.forEach(f=>f.classList.remove('active-reading-scene'));
     folio.classList.add('active-reading-scene');

     const folioIndex=Array.from(folios).indexOf(folio);
     beads.forEach((bead,idx)=>{
      if(idx===folioIndex){
       bead.setAttribute('aria-current','step');
       bead.classList.add('bead-active');
       bead.classList.remove('bead-passed');
      }else if(idx<folioIndex){
       bead.removeAttribute('aria-current');
       bead.classList.remove('bead-active');
       bead.classList.add('bead-passed');
      }else{
       bead.removeAttribute('aria-current');
       bead.classList.remove('bead-active');
       bead.classList.remove('bead-passed');
      }
     });

     // Update sticky aside image with smooth crossfade
     if(asideImage&&folio.dataset.sceneImage){
      const newSrc=folio.dataset.sceneImage;
      if(asideImage.getAttribute('src')!==newSrc){
       asideImage.src=newSrc;
       if(folio.dataset.sceneAlt)asideImage.alt=folio.dataset.sceneAlt;
       if(folio.dataset.sceneFocal)asideImage.style.objectPosition=folio.dataset.sceneFocal;
       if(!reducedMotion.matches){
        asideImage.animate([{opacity:0.4},{opacity:1}],{duration:360,easing:'ease-out'});
       }
      }
     }

     // Climax scene 10 shockwave trigger
     if(folio.id==='page-10'){
      const wave=folio.querySelector('.scene-shockwave');
      if(wave&&!wave.classList.contains('active-ripple')){
       wave.classList.add('active-ripple');
       setTimeout(()=>wave.classList.remove('active-ripple'),1400);
      }
     }
    }
   }
  },{rootMargin:'-25% 0px -40% 0px',threshold:0.15});

  folios.forEach(f=>sceneObserver.observe(f));
 }
}

// =========================================================================
// 6. SAVED SHELF UNDO & READER TOP BUTTON
// =========================================================================
if(document.querySelector('[data-kept-list]')){
 const removed=[],notice=document.createElement('div'),message=document.createElement('span'),undo=document.createElement('button'),dismiss=document.createElement('button');
 notice.className='undo-notice';notice.hidden=true;message.setAttribute('role','status');undo.type=dismiss.type='button';undo.textContent=t('Undo','वापस रखें');dismiss.textContent='×';dismiss.dataset.dismissUndo='';dismiss.setAttribute('aria-label',t('Dismiss message','संदेश बंद करें'));notice.append(message,undo,dismiss);document.body.append(notice);
 const refresh=()=>document.dispatchEvent(new CustomEvent('shelf:refresh'));
 const paint=()=>{notice.hidden=!removed.length;message.textContent=t('Page removed from Saved.','पृष्ठ सहेजी सूची से हटाया गया।');};
 document.addEventListener('shelf:removed',event=>{removed.push(event.detail.place);paint();});
 undo.addEventListener('click',()=>{const place=removed.at(-1);if(!place)return;try{const current=parsePlaces(localStorage.getItem(KEY));if(!current.some(p=>p.id===place.id&&p.lang===place.lang))localStorage.setItem(KEY,encodePlaces(keepPlace(current,place)));removed.pop();refresh();paint();if(!removed.length)document.querySelector('[data-kept-list] a')?.focus({preventScroll:true});}catch{message.textContent=t('This browser could not restore the page. Try Undo again.','यह ब्राउज़र पृष्ठ वापस नहीं रख सका। फिर कोशिश करें।');}});
 dismiss.addEventListener('click',()=>{removed.length=0;notice.hidden=true;const target=document.querySelector('[data-kept-list] a')||document.querySelector('#kept h1');if(target){target.tabIndex=-1;target.focus({preventScroll:true});}});
}

const reader=document.querySelector('[data-reader]'),position=document.querySelector('[data-page-position]');
if(reader&&position){
 const top=document.createElement('button'),group=document.createElement('div');top.type='button';top.className='page-top';top.dataset.pageTop='';top.textContent=t('Page top ↑','पृष्ठ का आरंभ ↑');group.className='page-position-group';position.replaceWith(group);group.append(position,top);
 top.addEventListener('click',()=>{const folio=reader.querySelectorAll('[data-folio]')[Number(reader.dataset.currentPage||0)];if(!folio)return;folio.scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth',block:'start'});folio.focus({preventScroll:true});});
}
