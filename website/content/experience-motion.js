const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const header=document.querySelector('body>header');
const progress=document.createElement('span');progress.className='site-scroll-progress';progress.setAttribute('aria-hidden','true');header?.append(progress);
let scrollFrame=0;
function paint(){scrollFrame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?scrollY/max:0})`;header?.classList.toggle('header-floating',scrollY>24);}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paint);},{passive:true});paint();

// =========================================================================
// 1. 120FPS SUNLIGHT CANVAS & ORGANIC GOLD DUST MOTES
// =========================================================================
const sunCanvas=document.getElementById('sunlight-canvas');
if(sunCanvas&&!reduced.matches){
 const ctx=sunCanvas.getContext('2d');
 let animId=0,isVisible=true;
 const dpr=window.devicePixelRatio||1;

 function resize(){
  const rect=sunCanvas.parentElement.getBoundingClientRect();
  sunCanvas.width=rect.width*dpr;
  sunCanvas.height=rect.height*dpr;
  ctx.scale(dpr,dpr);
 }
 resize();
 addEventListener('resize',resize);

 // 25 slow-drifting golden dust motes
 const MOTES_COUNT=25;
 const motes=[];
 for(let i=0;i<MOTES_COUNT;i++){
  motes.push({
   x:Math.random()*window.innerWidth,
   y:Math.random()*600,
   size:1.2+Math.random()*2.2,
   speedX:(Math.random()-0.35)*0.22,
   speedY:0.15+Math.random()*0.35,
   opacity:0.25+Math.random()*0.55,
   phase:Math.random()*Math.PI*2,
   freq:0.008+Math.random()*0.015
  });
 }

 let startTime=performance.now();
 function renderSunlight(time){
  if(!isVisible){animId=0;return;}
  const w=sunCanvas.width/dpr,h=sunCanvas.height/dpr;
  ctx.clearRect(0,0,w,h);

  // Soft diagonal morning light shafts
  const rayGrad=ctx.createLinearGradient(0,0,w*0.8,h);
  rayGrad.addColorStop(0,'rgba(245, 235, 215, 0.08)');
  rayGrad.addColorStop(0.35,'rgba(212, 175, 55, 0.04)');
  rayGrad.addColorStop(0.7,'rgba(245, 235, 215, 0.02)');
  rayGrad.addColorStop(1,'transparent');
  ctx.fillStyle=rayGrad;
  ctx.fillRect(0,0,w,h);

  // Animate dust motes
  const elapsed=time-startTime;
  for(const m of motes){
   m.x+=m.speedX+Math.sin(elapsed*m.freq+m.phase)*0.25;
   m.y+=m.speedY;
   if(m.x<0)m.x=w;
   if(m.x>w)m.x=0;
   if(m.y>h){m.y=-10;m.x=Math.random()*w;}

   const currentOpacity=m.opacity*(0.7+0.3*Math.sin(elapsed*0.002+m.phase));
   const grad=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.size*2);
   grad.addColorStop(0,`rgba(212, 175, 55, ${currentOpacity})`);
   grad.addColorStop(0.5,`rgba(200, 75, 49, ${currentOpacity*0.4})`);
   grad.addColorStop(1,'transparent');

   ctx.beginPath();
   ctx.arc(m.x,m.y,m.size*2,0,Math.PI*2);
   ctx.fillStyle=grad;
   ctx.fill();
  }
  animId=requestAnimationFrame(renderSunlight);
 }

 if(typeof IntersectionObserver!=='undefined'){
  const sunObserver=new IntersectionObserver(([entry])=>{
   isVisible=entry.isIntersecting;
   if(isVisible&&!animId)animId=requestAnimationFrame(renderSunlight);
  },{threshold:0.05});
  sunObserver.observe(sunCanvas.parentElement);
 }else{
  animId=requestAnimationFrame(renderSunlight);
 }
}

// =========================================================================
// 2. 3D PERSPECTIVE TILT CARD & SPECULAR SHEEN
// =========================================================================
document.querySelectorAll('.tilt-card, [data-tilt-card]').forEach(card=>{
 if(reduced.matches)return;
 let tiltRAF=0,currentX=0,currentY=0,targetX=0,targetY=0;

 function updateCardTilt(){
  tiltRAF=0;
  currentX+=(targetX-currentX)*0.14;
  currentY+=(targetY-currentY)*0.14;
  card.style.transform=`perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(1.01, 1.01, 1.01)`;
  if(Math.abs(targetX-currentX)>0.05||Math.abs(targetY-currentY)>0.05){
   tiltRAF=requestAnimationFrame(updateCardTilt);
  }
 }

 card.addEventListener('pointermove',e=>{
  const rect=card.getBoundingClientRect();
  const px=(e.clientX-rect.left)/rect.width;
  const py=(e.clientY-rect.top)/rect.height;
  targetX=-(py-0.5)*10; // max ±5deg
  targetY=(px-0.5)*10;
  card.style.setProperty('--mouse-x',`${e.clientX-rect.left}px`);
  card.style.setProperty('--mouse-y',`${e.clientY-rect.top}px`);
  if(!tiltRAF)tiltRAF=requestAnimationFrame(updateCardTilt);
 });

 card.addEventListener('pointerleave',()=>{
  targetX=0;
  targetY=0;
  if(!tiltRAF)tiltRAF=requestAnimationFrame(updateCardTilt);
  card.style.transform='perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
 });
});

// =========================================================================
// 3. BENTO GRID SPOTLIGHT CURSOR TRACKING
// =========================================================================
const bentoGrid=document.querySelector('.bento-grid, [data-bento-grid]');
if(bentoGrid&&!reduced.matches){
 const cards=bentoGrid.querySelectorAll('.collection-card');
 bentoGrid.addEventListener('pointermove',e=>{
  cards.forEach(card=>{
   const rect=card.getBoundingClientRect();
   const x=e.clientX-rect.left;
   const y=e.clientY-rect.top;
   card.style.setProperty('--spotlight-x',`${x}px`);
   card.style.setProperty('--spotlight-y',`${y}px`);
  });
 });
}

// =========================================================================
// 4. MAGNETIC CTA PULL ON PRIMARY ACTIONS
// =========================================================================
document.querySelectorAll('.magnetic-cta').forEach(btn=>{
 if(reduced.matches)return;
 btn.addEventListener('pointermove',e=>{
  const rect=btn.getBoundingClientRect();
  const x=(e.clientX-rect.left)-rect.width/2;
  const y=(e.clientY-rect.top)-rect.height/2;
  btn.style.transform=`translate(${x*0.16}px, ${y*0.16}px)`;
 });
 btn.addEventListener('pointerleave',()=>{
  btn.style.transform='translate(0px, 0px)';
 });
});

// =========================================================================
// 5. ENTRANCE REVEALS & VIEW TRANSITIONS
// =========================================================================
const entrances=new Set();
const reveals=new IntersectionObserver(entries=>{for(const {target,isIntersecting} of entries)if(isIntersecting){reveals.unobserve(target);if(!reduced.matches){const animation=target.animate([{opacity:.8,translate:'0 8px'},{opacity:1,translate:'0 0'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});entrances.add(animation);animation.finished.then(()=>entrances.delete(animation),()=>entrances.delete(animation));}}},{threshold:.08});
document.querySelectorAll('.section-title,.collection-card,.story-card,.showcase-hero,.intention').forEach(n=>reveals.observe(n));

for(const a of document.querySelectorAll('[data-language-switch]'))a.addEventListener('click',()=>{if(document.querySelector('[data-reader]'))return;try{sessionStorage.setItem('spritual_language_position_v1',JSON.stringify({path:new URL(a.href).pathname,y:scrollY,at:Date.now()}));}catch{}});
try{const state=JSON.parse(sessionStorage.getItem('spritual_language_position_v1')||'null');if(!document.querySelector('[data-reader]')&&state?.path===location.pathname&&Date.now()-state.at<15000){sessionStorage.removeItem('spritual_language_position_v1');addEventListener('load',()=>document.fonts.ready.then(()=>requestAnimationFrame(()=>scrollTo({top:state.y,behavior:'instant'}))),{once:true});}}catch{}

for(const a of document.querySelectorAll('.story-card>a,.portal-main'))a.addEventListener('click',event=>{if(event.button||event.metaKey||event.ctrlKey||reduced.matches)return;const img=a.querySelector('img');if(!img)return;img.style.viewTransitionName='manuscript-art';try{sessionStorage.setItem('spritual_art_transition_v1',JSON.stringify({path:new URL(a.href).pathname,at:Date.now()}));}catch{}});
try{const transition=JSON.parse(sessionStorage.getItem('spritual_art_transition_v1')||'null');if(transition?.path===location.pathname&&Date.now()-transition.at<10000){const img=document.querySelector('.frontispiece-art img,.showcase-hero>img');if(img)img.style.viewTransitionName='manuscript-art';sessionStorage.removeItem('spritual_art_transition_v1');}}catch{}

function settle(){for(const animation of entrances)animation.cancel();entrances.clear();}
reduced.addEventListener('change',settle);addEventListener('pagehide',()=>{settle();cancelAnimationFrame(scrollFrame);});
for(const type of ['pageswap','pagereveal'])addEventListener(type,event=>{event.viewTransition?.ready.catch(()=>{});event.viewTransition?.finished.catch(()=>{});});
