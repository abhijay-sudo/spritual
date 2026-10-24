(() => {
  'use strict';
  const dialog=document.getElementById('welcome-intro');
  const replay=document.querySelector('[data-replay-welcome]');
  if(!dialog||!replay)return;
  if(!dialog.showModal||!Element.prototype.animate)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const figures=[...dialog.querySelectorAll('.welcome-figure')];
  const title=dialog.querySelector('.welcome-title');
  const light=dialog.querySelector('.welcome-light');
  const skip=dialog.querySelector('.welcome-skip');
  const timers=new Set(),animations=new Set();
  let generation=0,returnFocus=null,assetReady=null,pendingAuto=null,choreographyOrigin=null;
  const artLoaders=new Set();
  const easing='cubic-bezier(.22,1,.36,1)';
  // A single portrait occupies each beat. Non-overlapping windows avoid paired silhouettes.
  const timing={beat:420,leave:75,gap:0,arrive:110,welcome:3360,reveal:3920,exit:220,watchdog:5200};
  const animate=(element,frames,options={})=>{
    const animation=element.animate(frames,{duration:400,easing,fill:'both',...options});
    // One compositor timeline: delayed stages do not depend on the next JS timer firing on time.
    if(choreographyOrigin!==null)animation.startTime=choreographyOrigin;
    animations.add(animation);
    animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
    return animation;
  };
  function later(callback,ms){const id=setTimeout(()=>{timers.delete(id);callback();},ms);timers.add(id);}
  function cancelWork(){
    abandonArt();
    generation++;choreographyOrigin=null;
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
  dialog.addEventListener('close',()=>{
    // Native close events are queued. A restored/reopened dialog belongs to a newer visit.
    if(dialog.open)return;
    cancelWork();dialog.dataset.state='complete';restoreFocus();
  });
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
  function abandonArt(){
    if(!artLoaders.size)return;
    artLoaders.forEach(image=>{image.removeAttribute('srcset');image.removeAttribute('src');});
    artLoaders.clear();assetReady=null;
  }
  function artReady(){
    if(!assetReady){
      const portraits=[...dialog.querySelectorAll('[data-welcome-art]')];
      const loading=Promise.all(portraits.map(async portrait=>{
        const image=new Image();artLoaders.add(image);
        const base=`/stories-app/welcome/portraits/${portrait.dataset.art}`;
        image.fetchPriority='low';
        image.sizes='(max-height: 480px) 28vh, (max-width: 600px) min(32vh, 68vw), min(35vh, 350px)';
        image.srcset=[640,960,1280].map(height=>`${base}-${height}.webp ${Math.round((portrait.width||941)*height/(portrait.height||1672))}w`).join(', ');
        image.src=`${base}-640.webp`;
        try{
          await image.decode();
          if(!image.naturalWidth||!artLoaders.has(image))return false;
          portrait.src=image.currentSrc||image.src;
          return true;
        }catch{return false;}
        finally{artLoaders.delete(image);}
      })).then(results=>results.length===8&&results.every(Boolean)).then(ok=>{
        if(!ok&&assetReady===loading)assetReady=null;
        return ok;
      });
      assetReady=loading;
    }
    return assetReady;
  }
  async function readyWithinDeadline(ticket){
    let timer,expired=false;
    const prepare=async()=>{
      // The useful page wins the cold-start network race. If its hero is slow,
      // never start eight optional portrait requests after the deadline.
      const hero=document.querySelector('.invitation-painting img');
      if(hero&&!hero.complete){try{await hero.decode();}catch{return false;}}
      if(expired||ticket!==generation)return false;
      return artReady();
    };
    try{return await Promise.race([prepare(),new Promise(resolve=>{timer=setTimeout(()=>{expired=true;abandonArt();resolve(false);},900);})]);}
    finally{clearTimeout(timer);}
  }
  function resetVisuals(){
    figures.forEach(el=>{el.style.opacity='0';el.style.transform='none';});
    title.style.opacity='0';title.style.transform='none';
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
    const ready=reduced.matches||await readyWithinDeadline(ticket);
    controller.abort();if(pendingAuto===controller)pendingAuto=null;
    if(!ready||ticket!==generation||document.hidden||document.querySelector('dialog[open]')||(!manual&&location.hash))return;
    resetVisuals();
    dialog.showModal();skip.focus({preventScroll:true});
    document.documentElement.classList.add('welcome-playing');
    if(reduced.matches){
      dialog.dataset.state='welcome';title.style.opacity='1';
      return;
    }
    choreographyOrigin=document.timeline.currentTime;
    if(light)animate(light,[{opacity:0,transform:'translateX(-12%)'},{opacity:.85,offset:.35},{opacity:.35,transform:'translateX(12%)'}],{duration:timing.reveal,easing:'ease-in-out'});
    figures.forEach((figure,index)=>{
      const at=index*timing.beat;
      const duration=timing.beat-timing.gap;
      const arrive=timing.arrive;
      const leaveAt=duration-timing.leave;

      animate(figure,[
        {opacity:0,transform:'translateY(8px) scale(.985)',offset:0,easing},
        {opacity:1,transform:'translateY(0)',offset:arrive/duration,easing:'linear'},
        {opacity:1,transform:'translateY(0)',offset:leaveAt/duration,easing:'ease-in-out'},
        {opacity:0,transform:'translateY(-4px) scale(1.015)',offset:1}
      ],{delay:at,duration,easing:'linear'});
      const cutout=figure.querySelector('.welcome-cutout');
      if(cutout)animate(cutout,[{transform:'translateY(4px) scale(1)'},{transform:'translateY(-3px) scale(1.025)'}],{delay:at,duration,easing:'cubic-bezier(.2,.7,.3,1)'});
      const caption=figure.querySelector('figcaption');
      if(caption)animate(caption,[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{delay:at+65,duration:170});
      // State labels are observational; painting and movement use the shared animation clock.
      if(index===0)dialog.dataset.state=figure.dataset.deity;
      else later(()=>{dialog.dataset.state=figure.dataset.deity;},at);
    });
    animate(title,[{opacity:0,transform:'translateY(16px) scale(.96)'},{opacity:1,transform:'translateY(-1px) scale(1.005)',offset:.8},{opacity:1,transform:'translateY(0) scale(1)'}],{delay:timing.welcome,duration:300});
    const total=timing.reveal+timing.exit;
    animate(dialog,[
      {opacity:0,offset:0,easing:'ease-out'},
      {opacity:1,offset:120/total,easing:'linear'},
      {opacity:1,offset:timing.reveal/total,easing:'ease-in-out'},
      {opacity:0,offset:1}
    ],{duration:total,easing:'linear'});
    later(()=>{dialog.dataset.state='welcome';},timing.welcome);
    later(()=>{dialog.dataset.state='revealing';},timing.reveal);
    later(()=>finish('complete'),timing.reveal+timing.exit);
    later(()=>finish('timeout'),timing.watchdog);
  }
  replay.hidden=false;
  replay.addEventListener('click',()=>{start(true).catch(()=>finish('error'));});
  reduced.addEventListener('change',()=>finish('preference'));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish('hidden');});
  addEventListener('pagehide',()=>finish('navigation'));
  addEventListener('hashchange',()=>finish('navigation'));
  function automaticVisit(){
    // Every homepage navigation is eligible, including refresh and history restoration.
    // A section link still takes the visitor directly to their intended destination.
    if(location.hash||reduced.matches)return;
    start().catch(()=>finish('error'));
  }
  addEventListener('pageshow',event=>{if(event.persisted)automaticVisit();});
  automaticVisit();
})();
