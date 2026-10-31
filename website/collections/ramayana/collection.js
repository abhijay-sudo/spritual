const root=document.querySelector('[data-illustrated-reader]');
if(root) {
  const hi=document.documentElement.lang==='hi';
  const stage=root.querySelector('[data-scene-stage]');
  const scenes=[...stage.querySelectorAll('[data-scene]')];
  const folios=[...root.querySelectorAll('[data-folio]')];
  const toggle=root.querySelector('[data-scene-toggle]');
  const replay=root.querySelector('[data-scene-replay]');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let active=null,effects=[],ghost=null,userEnabled=true,inView=false,played=false;
  const motionPreference='spritual_illustration_motion_v1';
  try { userEnabled=sessionStorage.getItem(motionPreference)!=='off'; } catch { /* Reading works when browser storage is unavailable. */ }
  const motionAvailable=typeof Element.prototype.animate==='function';
  const allowed=()=>userEnabled&&!reduce.matches&&motionAvailable;
  const visible=()=>inView&&!document.hidden&&!document.querySelector('dialog[open]');
  function discard() {
    for(const effect of effects)effect.cancel();
    effects=[];ghost?.remove();ghost=null;
  }
  function animate(element,frames,options) {
    const effect=element.animate(frames,options);
    effects.push(effect);effect.finished.catch(()=>{});
    return effect;
  }
  function controls(notify=false) {
    const enabled=allowed();
    document.documentElement.dataset.sceneMotion=enabled?'on':'off';
    toggle.setAttribute('aria-pressed',String(enabled));
    toggle.disabled=reduce.matches||!motionAvailable;
    toggle.textContent=reduce.matches?(hi?'कम गति की सेटिंग':'Reduced motion'):!motionAvailable?(hi?'स्थिर चित्र':'Still illustrations'):enabled?(hi?'गति चालू':'Motion on'):(hi?'गति बंद':'Motion off');
    replay.disabled=!enabled;
    if(notify)document.dispatchEvent(new CustomEvent('book:motionchange'));
  }
  function play({replayScene=false}={}) {
    if(!active||!allowed()||!visible()||(!replayScene&&played))return;
    const image=active.querySelector('img');
    if(!image.complete||!image.naturalWidth)return;
    discard();played=true;
    const direction=scenes.indexOf(active)%2?1:-1;
    // One finite camera move; the prose never moves and there is no rendering loop.
    animate(image,[{transform:`scale(1.045) translateX(${direction*.6}%)`},{transform:'scale(1) translateX(0)'}],{duration:7600,easing:'cubic-bezier(.2,.45,.3,1)'});
    animate(active.querySelector('.paint-light'),[{opacity:0,transform:'translateX(-30%)'},{opacity:.55,offset:.35},{opacity:0,transform:'translateX(30%)'}],{duration:5400,easing:'ease-in-out'});
    if(active.dataset.atmosphere==='water')animate(active.querySelector('.paint-water'),[{opacity:0,transform:'translateX(-10px)'},{opacity:.3,offset:.5},{opacity:0,transform:'translateX(10px)'}],{duration:3400,iterations:2,easing:'ease-in-out'});
    stage.dataset.motionState='playing';
    Promise.all(effects.map(effect=>effect.finished)).then(()=>{if(active?.querySelector('img')===image)stage.dataset.motionState='settled';}).catch(()=>{});
  }
  function visibility() {
    if(!allowed())return;
    if(!visible()) {for(const effect of effects)if(effect.playState==='running')effect.pause();stage.dataset.motionState='paused';}
    else if(!played)play();
    else {for(const effect of effects)if(effect.playState==='paused')effect.play();stage.dataset.motionState=effects.some(e=>e.playState==='running')?'playing':'settled';}
  }
  function sync() {
    const index=Number(root.dataset.currentPage||0),id=folios[index]?.id;
    const next=scenes.find(s=>s.dataset.scene===id)||scenes[0];
    if(next===active)return;
    const old=active;
    discard();played=false;active=next;
    for(const scene of scenes)scene.hidden=scene!==next;
    stage.dataset.activeScene=next.dataset.scene;
    const image=next.querySelector('img');
    root.querySelector('[data-art-recovery]').hidden=!(image.complete&&!image.naturalWidth);
    play();
    if(old&&allowed()&&visible()&&image.complete&&image.naturalWidth) {
      ghost=old.cloneNode(true);ghost.hidden=false;ghost.className='scene-painting scene-ghost';ghost.inert=true;ghost.setAttribute('aria-hidden','true');ghost.removeAttribute('data-scene');
      stage.append(ghost);
      const layer=ghost,fade=animate(layer,[{opacity:1},{opacity:0}],{duration:280,easing:'ease-out'});
      fade.finished.catch(()=>{}).finally(()=>{layer.remove();if(ghost===layer)ghost=null;});
    }
  }
  document.documentElement.classList.add('scene-enhanced');
  root.querySelector('[data-scene-controls]').hidden=false;
  controls(!allowed());sync();
  root.addEventListener('book:pagechange',sync);
  for(const scene of scenes) {
    const image=scene.querySelector('img');
    image.addEventListener('load',()=>{if(scene===active){root.querySelector('[data-art-recovery]').hidden=true;play();}});
    image.addEventListener('error',()=>{if(scene===active){discard();root.querySelector('[data-art-recovery]').hidden=false;}});
  }
  if('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;visibility();},{threshold:.1});observer.observe(stage);
    addEventListener('pagehide',()=>observer.disconnect());
    addEventListener('pageshow',event=>{if(event.persisted){observer.observe(stage);visibility();}});
  }else{inView=true;visibility();}
  toggle.addEventListener('click',()=>{userEnabled=!userEnabled;try{sessionStorage.setItem(motionPreference,userEnabled?'on':'off');}catch{}discard();played=false;controls(true);stage.dataset.motionState=allowed()?'ready':'off';play();});
  replay.addEventListener('click',()=>play({replayScene:true}));
  reduce.addEventListener('change',()=>{discard();played=false;controls(true);stage.dataset.motionState=allowed()?'ready':'off';play();});
  document.addEventListener('visibilitychange',visibility);
  const dialogs=new MutationObserver(visibility);
  document.querySelectorAll('dialog').forEach(dialog=>dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));
  addEventListener('pagehide',()=>{discard();dialogs.disconnect();});
  addEventListener('pageshow',event=>{if(event.persisted){document.querySelectorAll('dialog').forEach(dialog=>dialogs.observe(dialog,{attributes:true,attributeFilter:['open']}));played=false;visibility();}});
}
