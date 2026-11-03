import {PRACTICE_REVISION} from './practice-data.js';
import {PRACTICE_PREFIX,readPractice,updatePractice,undoPractice} from './practice-state.js';

// Each card owns its hold and Undo. The per-intention storage contract stays v1.
// Choosing, reporting a tried practice and reading a story are separate actions.
export function connectPracticeCards(storage,onChange){
 const hi=document.documentElement.lang==='hi',say=(en,hindi)=>hi?hindi:en;
 const controllers=[];
 for(const card of document.querySelectorAll('[data-sankalpa]')){
  const id=card.dataset.sankalpa,hold=card.querySelector('[data-sankalpa-hold]');
  const status=card.querySelector('[data-sankalpa-status]');
  const duration=card.dataset.holdMs==='1500'?1500:2000;
  let lastChange=null,holding=null,frame=0,rippleTimer=0;
  const announce=text=>{status.textContent=text;};
  function render(){
   const current=readPractice(storage,id),record=current.record;
   card.dataset.practiceState=record?.triedAt?'tried':record?'sealed':'empty';
   card.querySelector('[data-seal-controls]').hidden=Boolean(record);
   card.querySelector('[data-sankalpa-saved]').hidden=!record;
   card.querySelector('[data-sankalpa-try]').hidden=Boolean(record?.triedAt);
   card.querySelector('[data-sankalpa-saved-label]').textContent=record?.triedAt?say('Practice acknowledged. Your petal stays.','अभ्यास दर्ज हुआ। आपकी पंखुड़ी बनी रहेगी।'):say('Intention sealed. Try it when you are ready.','संकल्प सहेजा गया। जब तैयार हों, आज़माएँ।');
   card.querySelector('[data-sankalpa-undo]').hidden=!lastChange;
   if(current.kind==='invalid')announce(say('This saved Sankalpa could not be read and has not been overwritten. You can still try the practice.','सहेजा संकल्प पढ़ा नहीं जा सका और उसे बदला नहीं गया। आप फिर भी अभ्यास कर सकते हैं।'));
   else if(current.kind==='unavailable')announce(say('This browser cannot save your Sankalpa. You can still try the practice.','यह ब्राउज़र संकल्प सहेज नहीं सकता। आप फिर भी अभ्यास कर सकते हैं।'));
  }
  function cancel(){
   if(!holding)return;
   const pointer=holding.pointerId;holding=null;cancelAnimationFrame(frame);
   card.style.setProperty('--hold-progress','0');card.classList.remove('is-holding');
   if(pointer!==undefined&&hold.hasPointerCapture?.(pointer))hold.releasePointerCapture(pointer);
  }
  function act(action){
   cancel();
   try{
    const change=updatePractice(storage,id,action,PRACTICE_REVISION);
    if(change.changed)lastChange=change;
    onChange();render();
    announce(action==='seal'?say('Intention saved on this browser. One petal is lit.','संकल्प इस ब्राउज़र में सहेजा गया। एक पंखुड़ी प्रकाशित है।'):action==='try'?say('Your practice is acknowledged. Revisit whenever it helps.','आपका अभ्यास दर्ज हुआ। जब उपयोगी लगे, फिर लौटें।'):say('Intention released. You can undo this.','संकल्प हटाया गया। चाहें तो वापस लें।'));
    if(action==='seal'){
     card.classList.add('is-sealed');clearTimeout(rippleTimer);rippleTimer=setTimeout(()=>card.classList.remove('is-sealed'),800);
     card.querySelector('[data-sankalpa-try]').focus({preventScroll:true});
    }else if(action==='try')card.querySelector('[data-sankalpa-undo]').focus({preventScroll:true});
    else card.querySelector('[data-sankalpa-seal]').focus({preventScroll:true});
   }catch{render();announce(say('Your Sankalpa was not saved. Existing records are unchanged. You can try again or practise without saving.','आपका संकल्प सहेजा नहीं गया। पुराने अभिलेख वैसे ही हैं। फिर कोशिश करें या सहेजे बिना अभ्यास करें।'));}
  }
  function start(input){
   if(holding||readPractice(storage,id).record)return;
   controllers.forEach(other=>other.cancel());
   holding={...input,started:performance.now()};card.classList.add('is-holding');announce('');
   const tick=now=>{
    if(!holding)return;
    const progress=Math.min(1,(now-holding.started)/duration);card.style.setProperty('--hold-progress',String(progress));
    if(progress>=1){act('seal');return;}frame=requestAnimationFrame(tick);
   };frame=requestAnimationFrame(tick);
  }
  hold?.addEventListener('pointerdown',event=>{
   if(!event.isPrimary||event.button!==0)return;
   event.preventDefault();hold.focus({preventScroll:true});hold.setPointerCapture(event.pointerId);start({pointerId:event.pointerId});
  });
  hold?.addEventListener('pointermove',event=>{
   if(holding?.pointerId!==event.pointerId)return;const box=hold.getBoundingClientRect();
   if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)cancel();
  });
  for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])hold?.addEventListener(event,cancel);
  for(const event of ['click','contextmenu'])hold?.addEventListener(event,e=>e.preventDefault());
  hold?.addEventListener('keydown',event=>{
   if(event.key==='Escape'){cancel();return;}if(![' ','Enter'].includes(event.key))return;
   event.preventDefault();if(!event.repeat)start({key:event.key});
  });
  hold?.addEventListener('keyup',event=>{if([' ','Enter'].includes(event.key)){event.preventDefault();cancel();}});
  for(const action of ['seal','try','clear'])card.querySelector(`[data-sankalpa-${action}]`).addEventListener('click',()=>act(action));
  card.querySelector('[data-sankalpa-undo]').addEventListener('click',()=>{
   cancel();if(!lastChange)return;
   try{
    const restored=undoPractice(storage,lastChange);lastChange=null;onChange();render();
    announce(restored?say('Your last change was undone.','आपका पिछला बदलाव वापस लिया गया।'):say('This intention changed in another tab. Its newer state was kept.','यह संकल्प दूसरे टैब में बदला है। नई स्थिति रखी गई।'));
    card.querySelector(card.querySelector('[data-seal-controls]').hidden?'[data-sankalpa-clear]':'[data-sankalpa-seal]').focus({preventScroll:true});
   }catch{announce(say('Undo could not be saved. Please try again.','बदलाव वापस नहीं हो सका। फिर कोशिश करें।'));}
  });
  controllers.push({cancel,render,external(key){cancel();if(!key||key===PRACTICE_PREFIX+id){lastChange=null;announce('');}render();}});
  render();
 }
 const cancelAll=()=>controllers.forEach(c=>c.cancel());
 addEventListener('storage',event=>{if(event.key!==null&&!event.key.startsWith(PRACTICE_PREFIX))return;controllers.forEach(c=>c.external(event.key));onChange();});
 for(const event of ['blur','pagehide','practice-cancel'])addEventListener(event,cancelAll);
 addEventListener('pageshow',()=>{controllers.forEach(c=>c.render());onChange();});
 document.addEventListener('visibilitychange',()=>{cancelAll();if(!document.hidden){controllers.forEach(c=>c.render());onChange();}});
 return ()=>controllers.forEach(c=>c.render());
}
