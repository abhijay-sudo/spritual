const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const header=document.querySelector('body>header');
const progress=document.createElement('span');progress.className='site-scroll-progress';progress.setAttribute('aria-hidden','true');header?.append(progress);
let scrollFrame=0;
function paint(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;header?.classList.toggle('header-floating',scrollY>24);}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paint);},{passive:true});paint();
// Entrance movement is bounded and never gates access to content or navigation.
const entrances=new Set();
const reveals=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)if(isIntersecting){reveals.unobserve(target);if(!reduced.matches){const animation=target.animate([{opacity:.8,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});entrances.add(animation);animation.finished.then(()=>entrances.delete(animation),()=>entrances.delete(animation));}}},{threshold:.08});
document.querySelectorAll('.section-title,.collection-card,.story-card,.showcase-hero,.intention').forEach(n=>reveals.observe(n));
// Keep the ordinary pointer and stationary targets. Direct manipulation lives on pages and sheets.
for(const a of document.querySelectorAll('[data-language-switch]'))a.addEventListener('click',()=>{if(document.querySelector('[data-reader]'))return;try{sessionStorage.setItem('spritual_language_position_v1',JSON.stringify({path:new URL(a.href).pathname,y:scrollY,at:Date.now()}));}catch{}});
try{const state=JSON.parse(sessionStorage.getItem('spritual_language_position_v1')||'null');if(!document.querySelector('[data-reader]')&&state?.path===location.pathname&&Date.now()-state.at<15000){sessionStorage.removeItem('spritual_language_position_v1');addEventListener('load',()=>document.fonts.ready.then(()=>requestAnimationFrame(()=>scrollTo({top:state.y,behavior:'instant'}))),{once:true});}}catch{}
for(const a of document.querySelectorAll('.story-card>a,.portal-main'))a.addEventListener('click',event=>{if(event.button||event.metaKey||event.ctrlKey||reduced.matches)return;const img=a.querySelector('img');if(!img)return;img.style.viewTransitionName='manuscript-art';try{sessionStorage.setItem('spritual_art_transition_v1',JSON.stringify({path:new URL(a.href).pathname,at:Date.now()}));}catch{}});
try{const transition=JSON.parse(sessionStorage.getItem('spritual_art_transition_v1')||'null');if(transition?.path===location.pathname&&Date.now()-transition.at<10000){const img=document.querySelector('.frontispiece-art img,.showcase-hero>img');if(img)img.style.viewTransitionName='manuscript-art';sessionStorage.removeItem('spritual_art_transition_v1');}}catch{}
function settle(){for(const animation of entrances)animation.cancel();entrances.clear();}
reduced.addEventListener('change',settle);addEventListener('pagehide',()=>{settle();cancelAnimationFrame(scrollFrame);});
for(const type of ['pageswap','pagereveal'])addEventListener(type,event=>{event.viewTransition?.ready.catch(()=>{});event.viewTransition?.finished.catch(()=>{});});
