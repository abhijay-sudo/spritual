// Progressive enhancement for native reader dialogs. Semantic focus containment
// and the close event stay with <dialog>; motion never owns application state.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 700px)');
const states=new WeakMap(),sheets=new Set();
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const rubberband=(value,dimension)=>value*dimension*.38/(dimension+.38*Math.abs(value));
const reduced=()=>reduceMotion.matches;

function paint(state){
 const {dialog}=state,progress=clamp(state.position/state.distance,0,1);
 dialog.style.transform=state.axis==='y'?`translate3d(0,${state.position}px,0)`:`translate3d(${state.position}px,0,0)`;
 dialog.style.opacity=String(1-progress*.12);
 dialog.style.setProperty('--sheet-backdrop',String(1-progress));
 dialog.dataset.sheetState=state.phase;
}
function cancelFrame(state){cancelAnimationFrame(state.frame);state.frame=0;state.lastTime=0;}
function cancelDrag(state){
 const drag=state.drag;state.drag=null;state.dialog.classList.remove('fluid-sheet-grabbed');
 if(drag?.handle.hasPointerCapture?.(drag.pointerId))drag.handle.releasePointerCapture(drag.pointerId);
}
function measure(state){
 state.axis=mobile.matches?'y':'x';
 state.distance=(state.axis==='y'?state.dialog.offsetHeight:state.dialog.offsetWidth)+24;
 state.distance=Math.max(120,state.distance);
}
function actualClose(state){
 cancelFrame(state);cancelDrag(state);state.phase='closed';state.position=0;state.velocity=0;
 if(state.dialog.open)state.dialog.close(state.returnValue||'');
 state.dialog.style.removeProperty('transform');state.dialog.style.removeProperty('opacity');
 state.dialog.style.removeProperty('--sheet-backdrop');state.dialog.dataset.sheetState='closed';
}
function settle(state,target,velocity=state.velocity){
 cancelFrame(state);state.target=target;state.velocity=clamp(velocity,-4000,4000);state.phase=target?'closing':'opening';
 if(reduced()||document.hidden){if(target)actualClose(state);else{state.position=0;state.velocity=0;state.phase='open';paint(state);}return;}
 const omega=2*Math.PI/.32;
 const frame=time=>{
  state.frame=0;if(!state.dialog.open)return;
  const dt=Math.min(.05,Math.max(.001,state.lastTime?(time-state.lastTime)/1000:1/60));state.lastTime=time;
  // Closed-form critically damped spring: target changes preserve both position
  // and velocity. A re-grab reads these presentation values directly.
  const offset=state.position-state.target,carry=state.velocity+omega*offset,decay=Math.exp(-omega*dt);
  state.position=state.target+(offset+carry*dt)*decay;state.velocity=(state.velocity-omega*carry*dt)*decay;
  paint(state);
  if(Math.abs(state.position-state.target)<.4&&Math.abs(state.velocity)<4){
   state.position=state.target;state.velocity=0;
   if(state.target)actualClose(state);else{state.phase='open';paint(state);}return;
  }
  state.frame=requestAnimationFrame(frame);
 };
 paint(state);state.frame=requestAnimationFrame(frame);
}
function opened(state,trigger){
 if(trigger instanceof HTMLElement&&!state.dialog.contains(trigger))state.trigger=trigger;
 state.returnValue='';cancelDrag(state);
 if(!state.dialog.open){
  state.phase='opening';state.dialog.showModal();measure(state);state.position=reduced()?0:state.distance;state.velocity=0;paint(state);
 }else if(state.phase==='closed'){
  measure(state);state.position=reduced()?0:state.distance;state.velocity=0;
 }
 settle(state,0);
}
function release(state,event,cancelled=false){
 const drag=state.drag;if(!drag||drag.pointerId!==event.pointerId)return;
 state.drag=null;state.dialog.classList.remove('fluid-sheet-grabbed');
 if(drag.handle.hasPointerCapture?.(event.pointerId))drag.handle.releasePointerCapture(event.pointerId);
 if(cancelled){settle(state,0,0);return;}
 if(!drag.active){settle(state,drag.previousTarget,drag.previousVelocity);return;}
 const coord=state.axis==='y'?event.clientY:event.clientX,now=event.timeStamp;
 drag.samples.push({position:coord,time:now});
 const recent=drag.samples.filter(sample=>now-sample.time<=100),first=recent[0],last=recent.at(-1);
 const velocity=first&&last&&last.time-first.time>0?(last.position-first.position)/(last.time-first.time)*1000:0;
 // Exponential-decay projection (d=.994): a short deliberate flick can dismiss,
 // while a reversal toward the resting sheet cancels the same displacement.
 const projected=state.position+(velocity/1000)*.994/(1-.994);
 settle(state,projected>state.distance*.32?state.distance:0,velocity);
}
function enhance(dialog){
 if(!(dialog instanceof HTMLDialogElement))return null;
 if(states.has(dialog))return states.get(dialog);
 const state={dialog,position:0,velocity:0,distance:400,axis:'x',phase:'closed',target:0,frame:0,lastTime:0,drag:null,trigger:null,returnValue:''};
 states.set(dialog,state);sheets.add(state);dialog.classList.add('fluid-sheet');dialog.dataset.sheetState='closed';
 const chrome=document.createElement('div');chrome.className='fluid-sheet-chrome';
 const grip=document.createElement('div');grip.className='fluid-sheet-grip';grip.setAttribute('aria-hidden','true');grip.dataset.sheetDragHandle='';grip.append(document.createElement('span'));chrome.append(grip);
 let heading=dialog.querySelector('.dialog-heading');
 if(!heading){
  heading=document.createElement('div');heading.className='dialog-heading';
  const title=dialog.querySelector('h2'),close=dialog.querySelector(':scope > button');
  if(title)heading.append(title);if(close)heading.append(close);
 }
 chrome.append(heading);const content=document.createElement('div');content.className='fluid-sheet-content';
 content.append(...[...dialog.childNodes].filter(node=>node!==heading));dialog.replaceChildren(chrome,content);
 const closer=chrome.querySelector('button');if(closer){closer.classList.add('fluid-sheet-close');closer.dataset.fluidClose='';}
 const dragHandle=chrome;
 dragHandle.addEventListener('pointerdown',event=>{
  if(!dialog.open||reduced()||!event.isPrimary||event.button!==0||event.target.closest('a,button,input,select,textarea'))return;
  measure(state);const coordinate=state.axis==='y'?event.clientY:event.clientX;
  const previousTarget=state.target,previousVelocity=state.velocity;cancelFrame(state);
  state.drag={pointerId:event.pointerId,handle:dragHandle,origin:coordinate,originPosition:state.position,active:false,previousTarget,previousVelocity,samples:[{position:coordinate,time:event.timeStamp}]};
  state.phase='held';paint(state);dragHandle.setPointerCapture(event.pointerId);
 });
 dragHandle.addEventListener('pointermove',event=>{
  const drag=state.drag;if(!drag||drag.pointerId!==event.pointerId)return;
  const coordinate=state.axis==='y'?event.clientY:event.clientX,delta=coordinate-drag.origin;
  drag.samples.push({position:coordinate,time:event.timeStamp});drag.samples=drag.samples.filter(sample=>event.timeStamp-sample.time<=120);
  if(!drag.active&&Math.abs(delta)<10)return;
  drag.active=true;event.preventDefault();state.phase='dragging';state.dialog.classList.add('fluid-sheet-grabbed');
  const proposed=drag.originPosition+delta;
  state.position=proposed<0?rubberband(proposed,state.distance):proposed>state.distance?state.distance+rubberband(proposed-state.distance,state.distance):proposed;
  state.velocity=0;paint(state);
 },{passive:false});
 dragHandle.addEventListener('pointerup',event=>release(state,event));dragHandle.addEventListener('pointercancel',event=>release(state,event,true));dragHandle.addEventListener('lostpointercapture',event=>{if(state.drag)release(state,event,true);});
 // Closing controls already have native fallbacks in the reader modules. The
 // API below is used by those modules, while Escape and scrim clicks live here.
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeSheet(dialog);});
 let backdropDown=false;
 dialog.addEventListener('pointerdown',event=>{
  const rect=dialog.getBoundingClientRect();backdropDown=event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom);
 });
 dialog.addEventListener('click',event=>{
  const rect=dialog.getBoundingClientRect(),outside=event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
  if(backdropDown&&event.target===dialog&&outside)closeSheet(dialog);backdropDown=false;
 });
 dialog.addEventListener('close',()=>{
  if(dialog.open)return; // A newer open can overtake the native queued close event.
  cancelFrame(state);cancelDrag(state);state.phase='closed';state.position=0;state.velocity=0;state.target=0;dialog.classList.remove('fluid-sheet-grabbed');dialog.dataset.sheetState='closed';
  dialog.style.removeProperty('transform');dialog.style.removeProperty('opacity');dialog.style.removeProperty('--sheet-backdrop');
  if(state.trigger?.isConnected&&!dialog.dataset.focusLeaf&&(!document.activeElement||document.activeElement===document.body))state.trigger.focus({preventScroll:true});
 });
 new MutationObserver(()=>{
  if(dialog.open&&state.phase==='closed')opened(state,document.activeElement);
  else if(!dialog.open&&state.phase!=='closed')actualClose(state);
 }).observe(dialog,{attributes:true,attributeFilter:['open']});
 if(dialog.open)opened(state,document.activeElement);
 return state;
}
export function openSheet(dialog,trigger){const state=enhance(dialog);if(!state)return false;opened(state,trigger);return true;}
export function closeSheet(dialog,returnValue=''){const state=enhance(dialog);if(!state)return false;if(!dialog.open)return true;state.returnValue=returnValue;cancelDrag(state);measure(state);settle(state,state.distance);return true;}
window.SpritualSheets={open:openSheet,close:closeSheet};
const selector='dialog#book-contents,dialog#book-appearance,dialog.source-drawer';
document.querySelectorAll(selector).forEach(enhance);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(!(node instanceof Element))continue;if(node.matches(selector))enhance(node);node.querySelectorAll(selector).forEach(enhance);}}).observe(document.body,{childList:true,subtree:true});
reduceMotion.addEventListener('change',()=>{if(!reduceMotion.matches)return;for(const state of sheets){if(!state.dialog.open)continue;if(state.target)actualClose(state);else{cancelFrame(state);cancelDrag(state);state.position=0;state.velocity=0;state.phase='open';paint(state);}}});
mobile.addEventListener('change',()=>{for(const state of sheets){if(!state.dialog.open)continue;cancelFrame(state);cancelDrag(state);measure(state);if(state.target)actualClose(state);else{state.position=0;state.velocity=0;state.phase='open';paint(state);}}});
addEventListener('pagehide',()=>{for(const state of sheets)cancelFrame(state);});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)return;for(const state of sheets){if(!state.dialog.open)continue;if(state.target)actualClose(state);else{cancelFrame(state);cancelDrag(state);state.position=0;state.velocity=0;state.phase='open';paint(state);}}});
