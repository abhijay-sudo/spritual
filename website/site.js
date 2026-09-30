import { readIntention, saveIntention, KEY, selectMoment, timerRemaining, shareOrigin } from './session.js';
document.documentElement.classList.add('enhanced');
const c=JSON.parse(document.querySelector('#page-copy').textContent);
const $=id=>document.getElementById(id);
const base=document.documentElement.lang==='hi'?'/hi/':'/';
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){e.target.classList.add('seen');observer.unobserve(e.target);}},{threshold:.15});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
for(const button of document.querySelectorAll('[data-moment]')) button.addEventListener('click',()=>{
 const index=Number(button.dataset.moment);const m=c.moments[index];
 document.querySelectorAll('[data-moment]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 const box=$('moment-copy');box.querySelector('h3').textContent=m[1];box.querySelector('p').textContent=m[2];
 $('moment-link').href=`${base}pause/?moment=${m[3]}`;
 const card=box.closest('.reflection-card');card.classList.remove('copy-change');requestAnimationFrame(()=>card.classList.add('copy-change'));
});
if($('timer-view')) {
 let remaining=60_000,startedAt=0,running=false,interval,finished=false;
 const moment=selectMoment(location.search);document.querySelector('.language').href=`${document.documentElement.lang==='hi'?'/':'/hi/'}pause/?moment=${moment}`;$('pause-reflection').textContent=c.moments.find(m=>m[3]===moment)[1];
 const current=()=>running?timerRemaining(remaining,startedAt,performance.now()):remaining;
 function draw(){const value=current();const seconds=Math.ceil(value/1000);$('time').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;$('timer-progress').style.strokeDashoffset=String(60-value/1000);if(running&&value<=0){remaining=0;running=false;clearInterval(interval);$('timer-status').textContent=c.done;$('timer-toggle').hidden=true;}}
 function stop(message=c.paused){if(running){remaining=current();running=false;clearInterval(interval);}draw();$('timer-toggle').textContent=remaining===60_000?c.start:c.resume;$('timer-status').textContent=remaining===0?c.done:message;}
 $('timer-toggle').addEventListener('click',()=>{if(running){stop();return;}if(remaining<=0)return;startedAt=performance.now();running=true;$('timer-toggle').textContent=c.pause;$('timer-reset').hidden=false;$('timer-status').textContent=c.running;interval=setInterval(draw,200);draw();});
 $('timer-reset').addEventListener('click',()=>{stop();remaining=60_000;finished=false;$('timer-toggle').hidden=false;$('timer-toggle').textContent=c.start;$('timer-reset').hidden=true;$('timer-status').textContent=c.ready;draw();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&running)stop(c.hidden);});
 window.addEventListener('pagehide',()=>{if(running)stop(c.hidden);});
 $('finish').addEventListener('click',()=>{stop();finished=true;$('timer-view').hidden=true;$('finish-view').hidden=false;$('finish-heading').focus({preventScroll:true});$('finish-view').scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
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
