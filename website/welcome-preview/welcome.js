(() => {
  'use strict';
  const dialog=document.getElementById('welcome-intro');
  const replay=document.querySelector('[data-replay-welcome]');
  if(!dialog||!replay)return;
  if(!dialog.showModal||!Element.prototype.animate)return;
  const key='spritual_welcome_seen_v1';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const figures=[...dialog.querySelectorAll('.welcome-figure')];
  const title=dialog.querySelector('.welcome-title');
  const arch=dialog.querySelector('.welcome-arch');
  const light=dialog.querySelector('.welcome-light');
  const skip=dialog.querySelector('.welcome-skip');
  const timers=new Set(),animations=new Set();
  let generation=0,returnFocus=null,assetReady=null,pendingAuto=null;
  const easing='cubic-bezier(.22,1,.36,1)';
  // A 2.94s signature, not a loading gate. Distinct figures never dissolve into each other.
  const timing={beat:460,leave:90,gap:20,arrive:180,welcome:1940,reveal:2640,exit:300,watchdog:4000};
  const animate=(element,frames,options={})=>{
    const animation=element.animate(frames,{duration:400,easing,fill:'forwards',...options});
    animations.add(animation);
    animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
    return animation;
  };
  function later(callback,ms){const id=setTimeout(()=>{timers.delete(id);callback();},ms);timers.add(id);}
  function cancelWork(){
    generation++;
    pendingAuto?.abort();pendingAuto=null;
    timers.forEach(clearTimeout);timers.clear();
    dialog.getAnimations({subtree:true}).forEach(a=>a.cancel());
    animations.forEach(a=>a.cancel());animations.clear();
    document.documentElement.classList.remove('welcome-playing');
  }
  function restoreFocus(){
    if(document.hidden)return;
    const target=returnFocus?.isConnected?returnFocus:document.querySelector('.hero-actions a');
    target?.focus({preventScroll:true});
  }
  function finish(reason='skip'){
    cancelWork();
    if(dialog.open){dialog.dataset.state='complete';dialog.close(reason);restoreFocus();}
  }
  dialog.addEventListener('close',()=>{cancelWork();dialog.dataset.state='complete';restoreFocus();});
  dialog.addEventListener('cancel',event=>{event.preventDefault();finish();});
  // A deliberate scroll or swipe means the visitor is ready to explore.
  // Release the native modal without swallowing the gesture or simulating scrolling.
  addEventListener('wheel',event=>{
    if(dialog.open&&!event.ctrlKey&&Math.abs(event.deltaY)>4)finish('scroll');
  },{passive:true});
  let touchOrigin=null;
  dialog.addEventListener('touchstart',event=>{
    touchOrigin=event.touches.length===1?event.touches[0].clientY:null;
  },{passive:true});
  dialog.addEventListener('touchmove',event=>{
    if(touchOrigin!==null&&event.touches.length===1&&Math.abs(event.touches[0].clientY-touchOrigin)>18){
      touchOrigin=null;finish('swipe');
    }
  },{passive:true});
  dialog.addEventListener('touchend',()=>{touchOrigin=null;},{passive:true});
  dialog.addEventListener('touchcancel',()=>{touchOrigin=null;},{passive:true});
  // Native method="dialog" remains a working escape even if choreography fails.
  skip.addEventListener('click',()=>cancelWork());
  function artReady(){
    if(!assetReady){
      const image=new Image();image.src='/stories-app/welcome/deity-silhouettes.webp';
      assetReady=image.decode().then(()=>image.naturalWidth>0).catch(()=>false).then(ok=>{if(!ok)assetReady=null;return ok;});
    }
    return assetReady;
  }
  async function readyWithinDeadline(){
    let timer;
    try{return await Promise.race([artReady(),new Promise(resolve=>{timer=setTimeout(()=>resolve(false),900);})]);}
    finally{clearTimeout(timer);}
  }
  function resetVisuals(){
    figures.forEach(el=>{el.style.opacity='0';el.style.transform='none';});
    title.style.opacity='0';title.style.transform='none';arch.style.opacity='.52';
    arch.style.transform='none';
    dialog.style.opacity='1';
    dialog.style.transform='none';
  }
  async function start(manual=false){
    if(dialog.open)return;
    cancelWork();const ticket=generation;
    returnFocus=manual?replay:null;
    const controller=new AbortController();
    if(!manual){
      pendingAuto=controller;
      const interrupt=()=>{if(ticket===generation)cancelWork();};
      for(const event of ['pointerdown','keydown','touchstart','wheel','scroll']) addEventListener(event,interrupt,{passive:true,signal:controller.signal});
    }
    const ready=reduced.matches||await readyWithinDeadline();
    controller.abort();if(pendingAuto===controller)pendingAuto=null;
    if(!ready||ticket!==generation||document.hidden||document.querySelector('dialog[open]')||(!manual&&location.hash))return;
    resetVisuals();
    dialog.showModal();skip.focus({preventScroll:true});
    try{sessionStorage.setItem(key,'1');}catch{/* Explicit replay still works when browser storage is denied. */}
    document.documentElement.classList.add('welcome-playing');
    if(reduced.matches){
      dialog.dataset.state='welcome';title.style.opacity='1';
      return;
    }
    animate(arch.querySelector('path'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:650});
    if(light)animate(light,[{opacity:.35,transform:'scale(.82) translateY(3%)'},{opacity:1,transform:'scale(1.12) translateY(-2%)'}],{duration:timing.reveal,easing:'ease-out'});
    function hideFigure(figure){
      figure.getAnimations({subtree:true}).forEach(animation=>animation.cancel());
      figure.style.opacity='0';
    }
    function enterFigure(figure,first=false){
      // A busy main thread may deliver adjacent timers together. Never stack old depictions.
      figures.filter(other=>other!==figure).forEach(hideFigure);
      dialog.dataset.state=figure.dataset.deity;
      animate(figure,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:first?220:timing.arrive});
      const cutout=figure.querySelector('.welcome-cutout');
      if(cutout)animate(cutout,[{scale:'.97'},{scale:'1.035'}],{duration:timing.beat,easing:'cubic-bezier(.2,.7,.3,1)'});
    }
    function leaveFigure(figure){
      animate(figure,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-3px)'}],{duration:timing.leave,easing:'ease-in'});
    }
    enterFigure(figures[0],true);
    figures.slice(1).forEach((figure,index)=>{
      const at=(index+1)*timing.beat;
      later(()=>leaveFigure(figures[index]),at);
      later(()=>enterFigure(figure),at+timing.leave+timing.gap);
    });
    later(()=>leaveFigure(figures[3]),4*timing.beat);
    later(()=>{
      figures.forEach(hideFigure);
      dialog.dataset.state='welcome';
      animate(title,[{opacity:0,transform:'translateY(12px) scale(.97)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:320});
      animate(arch,[{transform:'scale(1)',opacity:.52},{transform:'scale(1.18)',opacity:.12}],{duration:600});
    },timing.welcome);
    later(()=>{
      dialog.dataset.state='revealing';
      animate(dialog,[{opacity:1},{opacity:0}],{duration:timing.exit,easing:'ease-in-out'});
      later(()=>finish('complete'),timing.exit);
    },timing.reveal);
    later(()=>finish('timeout'),timing.watchdog);
  }
  replay.hidden=false;
  replay.addEventListener('click',()=>{start(true).catch(()=>finish('error'));});
  reduced.addEventListener('change',()=>finish('preference'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish('hidden');});
  addEventListener('pagehide',()=>finish('navigation'));
  addEventListener('hashchange',()=>finish('navigation'));
  const params=new URLSearchParams(location.search);
  const isReplay=params.get('intro')==='replay';
  const directLink=location.hash||[...params.keys()].some(k=>k!=='intro');
  const isReturn=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  if(directLink||isReturn||reduced.matches)return;
  if(!isReplay){
    try{if(sessionStorage.getItem(key)!==null)return;sessionStorage.setItem(key,'1');}
    catch{return;}
  }
  start().catch(()=>finish('error'));
})();
