import {readReadingState,mostRecentProgress,READING_KEY} from './reading-state.js';
import {practiceForStory} from './practice-data.js';

const node=document.querySelector('#reading-data');
const data=node?JSON.parse(node.textContent):null;
const hi=document.documentElement.lang==='hi',say=(en,hindi)=>hi?hindi:en;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const storage={getItem:key=>localStorage.getItem(key)};
const arrival=document.querySelector('[data-arrival]');
if(arrival&&data){
 const threshold=arrival.querySelector('[data-arrival-threshold]'),active=arrival.querySelector('[data-arrival-active]');
 const start=arrival.querySelector('[data-breath-start]'),cancel=arrival.querySelector('[data-breath-cancel]'),cue=arrival.querySelector('[data-breath-cue]');
 const ring=arrival.querySelector('.threshold-ring'),frame=arrival.querySelector('.arrival-art');
 let started=null,raf=0,lastCue='',settled=false,manualThreshold=false;
 try{settled=sessionStorage.getItem('spritual_settled')==='true';}catch{}
 const defaultCue=say('One gentle breath · 8 seconds','एक सहज साँस · 8 सेकंड');
 function stopBreath(message=defaultCue){
  cancelAnimationFrame(raf);raf=0;started=null;ring.style.removeProperty('--breath-scale');
  cue.textContent=message;lastCue=message;start.disabled=false;cancel.hidden=true;
 }
 function showActive(show,{focus=false}={}){
  stopBreath();threshold.hidden=show;active.hidden=!show;
  arrival.setAttribute('aria-labelledby',show?'arrival-active-title':'arrival-title');
  if(focus)(show?active.querySelector('[data-current-read]'):start).focus({preventScroll:true});
 }
 const heading=active.querySelector('h2');heading.id='arrival-active-title';heading.setAttribute('role','heading');heading.setAttribute('aria-level','1');
 function currentStory(){
  const snapshot=readReadingState(storage,data.storyKeys);
  if(snapshot.kind==='invalid')return {story:data.stories.find(s=>!s.unavailable),recent:null};
  // Never prune unavailable chapter records to choose a currently readable story.
  const available=new Set(data.stories.filter(s=>!s.unavailable).map(s=>s.id));
  const progress=Object.fromEntries(Object.entries(snapshot.state.progress).filter(([id])=>available.has(id)));
  const recent=mostRecentProgress({...snapshot.state,progress});
  return {story:data.stories.find(s=>s.id===recent?.storyId)||data.stories.find(s=>!s.unavailable),recent};
 }
 function renderCurrent(){
  const {story,recent}=currentStory();if(!story)return;
  const stories=data.stories.filter(s=>!s.unavailable),index=stories.findIndex(s=>s.id===story.id)+1;
  const number=String(index).padStart(2,'0');
  arrival.querySelector('[data-current-index]').textContent=say(`Story ${number} of ${stories.length}`,`${stories.length} में कथा ${number}`);
  arrival.querySelector('[data-current-title]').textContent=story.title[data.lang];
  arrival.querySelector('[data-current-meta]').textContent=`${story.book[data.lang]} · ${say('About','लगभग')} ${story.durationByLanguage?.[data.lang]??story.duration} ${say('min','मिनट')}`;
  arrival.querySelector('[data-current-practice]').textContent=practiceForStory(story.id)?.title[data.lang]||'';
  const card=document.getElementById(`yatra-${story.id}`),art=card?.querySelector('.chapter-art picture,.chapter-art img');
  if(art){const clone=art.cloneNode(true);const img=clone.matches('img')?clone:clone.querySelector('img');img.loading='eager';arrival.querySelector('[data-current-art]').replaceChildren(clone);}
  const url=new URL(`${hi?'/hi':''}/read/${story.id}/`,location.origin);
  const world=new URLSearchParams(location.search).get('world');if(world)url.searchParams.set('world',world);
  url.searchParams.set('journey',data.journeys?.[recent?.journeyId]?recent.journeyId:'ramayana');
  if(recent){url.searchParams.set('from','resume');url.hash=`block-${recent.blockId}`;}
  const link=arrival.querySelector('[data-current-read]');link.href=url.pathname+url.search+url.hash;
  link.firstChild.textContent=recent?say(`Resume story ${number} `,`कथा ${number} जारी रखें `):say(`Read story ${number} `,`कथा ${number} पढ़ें `);
  const quick=arrival.querySelector('[data-art-enter]');quick.href=link.href;quick.textContent=recent?say('Resume your story →','अपनी कथा जारी रखें →'):say('Enter story 01 →','कथा 01 में प्रवेश करें →');
  if(!manualThreshold)showActive(settled||Boolean(recent));
 }
 const remember=()=>{settled=true;try{sessionStorage.setItem('spritual_settled','true');}catch{}};
 arrival.querySelector('[data-settled-enter]').addEventListener('click',()=>{stopBreath();remember();});
 arrival.querySelector('[data-current-read]').addEventListener('click',remember);
 arrival.querySelector('[data-art-enter]').addEventListener('click',()=>{stopBreath();remember();});
 const showPath=arrival.querySelector('[data-show-path]');showPath.hidden=false;
 showPath.addEventListener('click',()=>{remember();manualThreshold=false;showActive(true,{focus:true});});
 arrival.querySelector('[data-settle-again]').addEventListener('click',()=>{manualThreshold=true;showActive(false,{focus:true});});
 start.addEventListener('click',()=>{
  stopBreath();started=performance.now();start.disabled=true;cancel.hidden=false;cancel.focus({preventScroll:true});
  const tick=now=>{
   if(started===null)return;const elapsed=now-started;
   if(elapsed>=8000){stopBreath(say('Your next step is yours. Enter whenever you are ready.','अगला कदम आपका है। जब तैयार हों, प्रवेश करें।'));start.focus({preventScroll:true});return;}
   const inhale=elapsed<4000,text=inhale?say('Inhale gently','सहज साँस भीतर लें'):say('Exhale gently','सहज साँस बाहर छोड़ें');
   if(text!==lastCue){cue.textContent=text;lastCue=text;}
   if(!reduced.matches){const progress=inhale?elapsed/4000:1-(elapsed-4000)/4000;ring.style.setProperty('--breath-scale',String(1+progress*.14));}
   raf=requestAnimationFrame(tick);
  };raf=requestAnimationFrame(tick);
 });
 cancel.addEventListener('click',()=>{stopBreath();start.focus({preventScroll:true});});
 const artToggle=arrival.querySelector('[data-art-motion]');
 artToggle.addEventListener('click',()=>{const paused=artToggle.getAttribute('aria-pressed')!=='true';artToggle.setAttribute('aria-pressed',String(paused));frame.classList.toggle('motion-paused',paused);artToggle.textContent=paused?say('Resume motion','गति जारी करें'):say('Pause motion','गति रोकें');});
 for(const event of ['pagehide','blur'])addEventListener(event,()=>stopBreath());
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopBreath();frame.classList.toggle('page-hidden',document.hidden);});
 reduced.addEventListener('change',()=>{ring.style.removeProperty('--breath-scale');});
 addEventListener('storage',event=>{if(event.key===READING_KEY||event.key===null)renderCurrent();});
 addEventListener('pageshow',renderCurrent);renderCurrent();
}

const path=document.querySelector('.illustrated-path');
if(path){
 const filters=[...path.querySelectorAll('[data-kanda]')],groups=[...path.querySelectorAll('[data-kanda-group]')];
 function filter(id,write=false){
  if(!filters.some(button=>button.dataset.kanda===id))id='all';
  dispatchEvent(new Event('practice-cancel'));
  for(const group of groups)group.hidden=id!=='all'&&group.dataset.kandaGroup!==id;
  for(const button of filters)button.setAttribute('aria-pressed',String(button.dataset.kanda===id));
  const count=groups.filter(g=>!g.hidden).reduce((sum,g)=>sum+g.querySelectorAll('[data-yatra-id]').length,0);
  path.querySelector('#kanda-status').textContent=say(`${count} stories shown.`,` ${count} कथाएँ दिखाई गईं।`);
  if(write){const url=new URL(location.href);if(id==='all')url.searchParams.delete('kanda');else url.searchParams.set('kanda',id);history.replaceState(history.state,'',url.pathname+url.search+url.hash);}
  for(const link of document.querySelectorAll('a.language')){const url=new URL(link.href,location.href);if(id==='all')url.searchParams.delete('kanda');else url.searchParams.set('kanda',id);link.href=url.pathname+url.search+url.hash;}
 }
 for(const button of filters)button.addEventListener('click',()=>filter(button.dataset.kanda,true));
 for(const link of path.querySelectorAll('[data-diya-id]'))link.addEventListener('click',event=>{
  const target=document.getElementById(`yatra-${link.dataset.diyaId}`);if(!target)return;
  event.preventDefault();filter('all',true);history.replaceState(history.state,'',location.pathname+location.search+link.hash);
  const title=target.querySelector('h4');title.tabIndex=-1;title.focus({preventScroll:true});target.scrollIntoView({behavior:reduced.matches?'auto':'smooth',block:'start'});
 });
 const restore=()=>{filter(new URLSearchParams(location.search).get('kanda')||'all');if(location.hash.startsWith('#yatra-'))filter('all');};
 addEventListener('popstate',restore);restore();
}
