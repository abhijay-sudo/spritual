const hi=document.documentElement.lang==='hi',reduced=matchMedia('(prefers-reduced-motion: reduce)'),text=(en,hn)=>hi?hn:en;

// =========================================================================
// 1. STORY READER ENHANCEMENTS & FLOW SCENES
// =========================================================================
const root=document.querySelector('[data-reader]');
if(root){
 const folios=[...root.querySelectorAll('[data-folio]')];
 const image=root.querySelector('.frontispiece-art img');
 let imageVersion=0;
 let caption=root.querySelector('.scene-caption');
 if(image&&!caption){
  caption=document.createElement('p');
  caption.className='scene-caption';
  image.closest('.frontispiece-art')?.after(caption);
 }
 for(const folio of folios){
  const img=document.createElement('img');
  img.className='flow-scene-image';
  img.src=folio.dataset.sceneImage;
  img.alt=folio.dataset.sceneAlt||'';
  img.loading='lazy';
  img.width=600;
  img.height=400;
  folio.prepend(img);
 }
 const controls=document.querySelector('.reader-mode-bar');
 if(controls){
  controls.hidden=false;
  const tools=root.querySelector('.reader-tools');
  if(tools)controls.prepend(tools);
 }
 function update(){
  const index=Number(root.dataset.currentPage||0),scene=folios[index];
  document.querySelectorAll('[data-scene-go]').forEach(b=>{
   if(Number(b.dataset.sceneGo)===index)b.setAttribute('aria-current','step');
   else b.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-reading-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.readingMode===root.dataset.readingModeState)));
  if(!scene||!image)return;
  if(caption)caption.textContent=scene.dataset.sceneCaption||'';
  image.style.objectPosition=scene.dataset.sceneFocal||'center';
  if(image.getAttribute('src')===scene.dataset.sceneImage)return;
  const version=++imageVersion,preload=new Image();
  preload.src=scene.dataset.sceneImage;
  preload.decode().catch(()=>{}).then(()=>{
   if(version!==imageVersion)return;
   image.removeAttribute('srcset');
   image.src=scene.dataset.sceneImage;
   image.alt=scene.dataset.sceneAlt||'';
   if(!reduced.matches)image.animate([{opacity:.35},{opacity:1}],{duration:420,easing:'ease-out'});
  });
 }
 document.addEventListener('book:pagechange',update);
 for(const b of document.querySelectorAll('[data-scene-go]'))b.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('book:navigate',{detail:{index:Number(b.dataset.sceneGo)}})));
 for(const b of document.querySelectorAll('[data-reading-mode]'))b.addEventListener('click',()=>{document.dispatchEvent(new CustomEvent('book:mode',{detail:{mode:b.dataset.readingMode}}));update();});
 document.addEventListener('book:kept',()=>{
  root.querySelector('.saved-ribbon')?.remove();
  const ribbon=document.createElement('i');
  ribbon.className='saved-ribbon';
  ribbon.setAttribute('aria-hidden','true');
  root.querySelector('.book-leaves')?.append(ribbon);
  if(!reduced.matches)ribbon.animate([{translate:'0 -62px'},{translate:'0 0'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'});
 });
 update();
}

// =========================================================================
// 2. SAVED SHELF ENRICHMENT
// =========================================================================
const shelf=document.querySelector('[data-kept-list]');
if(shelf){
 let catalogue,legacy;
 const loading=Promise.all([
  fetch('/catalogue.json').then(r=>{if(!r.ok)throw Error();return r.json();}),
  fetch('/legacy-routes.json').then(r=>r.json())
 ]).then(([c,l])=>{catalogue=c;legacy=l.legacy;}).catch(()=>{});

 async function enrich(){
  const suggestions=document.querySelector('[data-kept-suggestions]');
  if(suggestions)suggestions.hidden=!!shelf.children.length;
  await loading;
  if(!catalogue)return;
  for(const li of shelf.querySelectorAll('li[data-saved-place]')){
   if(li.dataset.enriched)continue;
   const saved=JSON.parse(li.dataset.savedPlace);
   let story=catalogue.find(s=>s.id===saved.id),number=Number(saved.folio.replace('page-',''));
   if(!story){
    const old=legacy?.[saved.id]||legacy?.[saved.route.split('/').filter(Boolean).at(-1)];
    if(old){story=catalogue.find(s=>s.id===old.id);number=old.folios?.[saved.folio]||old.start;}
   }
   if(!story)continue;
   const page=story.pages.find(p=>p.number===number);
   if(!page)continue;
   li.dataset.enriched='true';
   const link=li.querySelector('a');
   link.href=story.paths[saved.lang]+'#page-'+number;
   link.textContent=story.title[saved.lang];
   const details=document.createElement('div');
   details.className='saved-details';
   const scene=document.createElement('span');
   scene.className='saved-scene';
   scene.textContent=page.title[saved.lang];
   const meta=document.createElement('small');
   meta.textContent=`${saved.lang==='hi'?'दृश्य':'Scene'} ${number} / ${story.pages.length} · ${saved.lang==='hi'?'हिन्दी':'English'}`;
   if(saved.savedAt&&Number.isFinite(Date.parse(saved.savedAt))){
    const time=document.createElement('time');
    time.dateTime=saved.savedAt;
    time.textContent=new Intl.DateTimeFormat(hi?'hi-IN':'en-IN',{dateStyle:'medium'}).format(new Date(saved.savedAt));
    details.append(time);
   }
   const img=document.createElement('img');
   img.src=page.image.src;
   img.alt=page.image.alt[saved.lang];
   img.width=180;
   img.height=140;
   img.loading='lazy';
   const resume=document.createElement('a');
   resume.className='saved-resume';
   resume.href=link.href;
   resume.textContent=text('Resume at scene','इस दृश्य पर लौटें')+' '+number+' →';
   details.prepend(link,scene,meta);
   details.append(resume);
   li.prepend(img,details);
  }
 }
 document.addEventListener('shelf:rendered',enrich);
 enrich();
}

// =========================================================================
// 3. INTENTION SEAL
// =========================================================================
const intention=document.querySelector('[data-intention]');
if(intention){
 let timer=0,animation=null;
 const today=new Date().toISOString().slice(0,10),key='spritual_intention_v1';
 const seal=intention.querySelector('[data-intention-seal]'),clear=intention.querySelector('[data-clear-intention]'),status=intention.querySelector('[data-intention-status]');
 function cancel(){if(timer){clearTimeout(timer);timer=0;}if(animation){animation.cancel();animation=null;}}
 function saved(){cancel();seal.hidden=true;clear.hidden=false;status.textContent=text('Your intention is kept in this browser for today.','आज का संकल्प इसी ब्राउज़र में सहेजा गया है।');}
 try{if(JSON.parse(localStorage.getItem(key)||'null')?.day===today)saved();}catch{}
 function begin(){
  if(timer||seal.hidden)return;
  animation=seal.querySelector('.seal-ring')?.animate(reduced.matches?[{opacity:.15},{opacity:.5}]:[{transform:'scaleX(0)',opacity:1},{transform:'scaleX(1)',opacity:1}],{duration:2000,easing:'linear',fill:'forwards'});
  timer=setTimeout(()=>{
   cancel();
   try{
    localStorage.setItem(key,JSON.stringify({day:today,intention:'pause-before-responding'}));
    saved();
   }catch{
    status.textContent=text('This browser could not save the intention. You can still carry it with you.','यह ब्राउज़र संकल्प सहेज नहीं सका। आप इसे फिर भी साथ रख सकते हैं।');
   }
  },2000);
 }
 seal.addEventListener('pointerdown',e=>{if(e.button!==0)return;seal.setPointerCapture(e.pointerId);begin();});
 seal.addEventListener('pointerup',cancel);
 seal.addEventListener('pointercancel',cancel);
 seal.addEventListener('lostpointercapture',cancel);
 seal.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();if(!e.repeat)begin();}});
 seal.addEventListener('keyup',cancel);
 seal.addEventListener('blur',cancel);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 clear.addEventListener('click',()=>{
  try{
   localStorage.removeItem(key);
   seal.hidden=false;
   clear.hidden=true;
   status.textContent=text('Intention removed.','संकल्प हटा दिया गया।');
   seal.focus();
  }catch{
   status.textContent=text('This browser could not remove the intention.','यह ब्राउज़र संकल्प हटा नहीं सका।');
  }
 });
}

// =========================================================================
// 4. 120FPS PRANA BREATHING SANCTUARY & PROCEDURAL HARMONIC DRONE
// =========================================================================
const pranaCanvas=document.getElementById('prana-canvas');
const breathToggle=document.querySelector('[data-breath-toggle]');
const droneToggle=document.querySelector('[data-drone-toggle]');
const breathPhase=document.querySelector('[data-breath-phase]');
const breathSeconds=document.querySelector('[data-breath-seconds]');

if(pranaCanvas){
 const ctx=pranaCanvas.getContext('2d');
 const dpr=window.devicePixelRatio||1;
 const w=480,h=400;
 pranaCanvas.width=w*dpr;
 pranaCanvas.height=h*dpr;
 ctx.scale(dpr,dpr);

 let isRunning=false;
 let sessionStart=0;
 let animFrame=0;
 const ripples=[];

 // Pointer ripples on canvas
 function addRipple(x,y){
  ripples.push({x,y,radius:10,maxRadius:160,opacity:0.75});
 }
 pranaCanvas.addEventListener('pointerdown',e=>{
  const rect=pranaCanvas.getBoundingClientRect();
  const x=(e.clientX-rect.left)*(w/rect.width);
  const y=(e.clientY-rect.top)*(h/rect.height);
  addRipple(x,y);
 });

 function drawLotusPetal(cx,cy,angle,length,width,color){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.bezierCurveTo(-width,-length*0.4,-width*0.8,-length*0.8,0,-length);
  ctx.bezierCurveTo(width*0.8,-length*0.8,width,-length*0.4,0,0);
  ctx.fillStyle=color;
  ctx.fill();
  ctx.strokeStyle='rgba(212, 175, 55, 0.4)';
  ctx.lineWidth=1;
  ctx.stroke();
  ctx.restore();
 }

 function renderPrana(timestamp){
  ctx.clearRect(0,0,w,h);
  const cx=w/2,cy=h/2;
  const elapsed=isRunning?timestamp-sessionStart:0;
  const cycle=12000; // 4s inhale, 2s hold, 6s exhale
  const tCycle=elapsed%cycle;

  let phaseRatio=0,phaseText='',secondsLeft=0;
  if(!isRunning){
   phaseRatio=0.5;
   phaseText=text('Ready when you are','जब आप तैयार हों');
   secondsLeft=4;
  }else if(tCycle<4000){ // Inhale (0 - 4s)
   const p=tCycle/4000;
   phaseRatio=0.5+0.5*p;
   phaseText=text('Breathe in','साँस लें');
   secondsLeft=Math.ceil((4000-tCycle)/1000);
  }else if(tCycle<6000){ // Hold (4 - 6s)
   const p=(tCycle-4000)/2000;
   phaseRatio=1.0+0.04*Math.sin(p*Math.PI*2);
   phaseText=text('Rest gently','सहज ठहरें');
   secondsLeft=Math.ceil((6000-tCycle)/1000);
  }else{ // Exhale (6 - 12s)
   const p=(tCycle-6000)/6000;
   phaseRatio=1.0-0.5*p;
   phaseText=text('Breathe out','साँस छोड़ें');
   secondsLeft=Math.ceil((12000-tCycle)/1000);
  }

  if(breathPhase&&isRunning)breathPhase.textContent=phaseText;
  if(breathSeconds&&isRunning)breathSeconds.textContent=`${String(secondsLeft).padStart(2,'0')}s`;

  // Draw concentric glow rings
  const ringRadius=70*phaseRatio;
  const grad=ctx.createRadialGradient(cx,cy,ringRadius*0.4,cx,cy,ringRadius*1.8);
  grad.addColorStop(0,`rgba(212, 175, 55, ${0.18*phaseRatio})`);
  grad.addColorStop(0.5,`rgba(200, 75, 49, ${0.08*phaseRatio})`);
  grad.addColorStop(1,'transparent');
  ctx.fillStyle=grad;
  ctx.beginPath();
  ctx.arc(cx,cy,ringRadius*1.8,0,Math.PI*2);
  ctx.fill();

  // 12 sacred lotus petals
  const PETAL_COUNT=12;
  const petalLength=55+45*phaseRatio;
  const petalWidth=18+14*phaseRatio;
  for(let i=0;i<PETAL_COUNT;i++){
   const angle=(i/PETAL_COUNT)*Math.PI*2;
   const petalColor=i%2===0
    ?`rgba(212, 175, 55, ${0.28+0.25*phaseRatio})`
    :`rgba(200, 75, 49, ${0.18+0.22*phaseRatio})`;
   drawLotusPetal(cx,cy,angle,petalLength,petalWidth,petalColor);
  }

  // Center golden sanctum circle
  ctx.beginPath();
  ctx.arc(cx,cy,18+6*phaseRatio,0,Math.PI*2);
  ctx.fillStyle='rgba(250, 246, 238, 0.95)';
  ctx.fill();
  ctx.strokeStyle='rgba(212, 175, 55, 0.7)';
  ctx.lineWidth=2;
  ctx.stroke();

  // Render & update touch ripples
  for(let i=ripples.length-1;i>=0;i--){
   const r=ripples[i];
   r.radius+=1.8;
   r.opacity*=(1-r.radius/r.maxRadius);
   if(r.radius>=r.maxRadius||r.opacity<0.01){
    ripples.splice(i,1);
    continue;
   }
   ctx.beginPath();
   ctx.arc(r.x,r.y,r.radius,0,Math.PI*2);
   ctx.strokeStyle=`rgba(212, 175, 55, ${r.opacity})`;
   ctx.lineWidth=1.5;
   ctx.stroke();
  }

  if(isRunning&&elapsed>=60000){ // 1 minute quiet moment completed
   stopPrana(true);
   return;
  }

  animFrame=requestAnimationFrame(renderPrana);
 }

 function startPrana(){
  isRunning=true;
  sessionStart=performance.now();
  if(breathToggle){
   breathToggle.textContent=text('End quiet moment','शांत पल समाप्त करें');
   breathToggle.setAttribute('aria-pressed','true');
  }
 }
 function stopPrana(complete=false){
  isRunning=false;
  if(breathToggle){
   breathToggle.textContent=text('Begin a quiet minute','एक शांत मिनट शुरू करें');
   breathToggle.setAttribute('aria-pressed','false');
  }
  if(breathPhase){
   breathPhase.textContent=complete?text('Carry this quiet with you.','यह शांति अपने साथ रखें।'):text('Ready when you are','जब आप तैयार हों');
  }
  if(breathSeconds){
   breathSeconds.textContent='4s';
  }
 }

 breathToggle?.addEventListener('click',()=>{
  if(isRunning)stopPrana(false);
  else startPrana();
 });

 animFrame=requestAnimationFrame(renderPrana);

 // =========================================================================
 // Procedural Tanpura Sa-Pa Harmonic Drone (Web Audio API)
 // =========================================================================
 let audioCtx=null;
 let masterGain=null;
 let droneRunning=false;

 function toggleDrone(){
  if(droneRunning){
   if(masterGain&&audioCtx){
    masterGain.gain.linearRampToValueAtTime(0.0001,audioCtx.currentTime+1.2);
    setTimeout(()=>{try{audioCtx?.close();}catch{}audioCtx=null;},1300);
   }
   droneRunning=false;
   droneToggle.setAttribute('aria-pressed','false');
   droneToggle.querySelector('span').textContent='♪ '+text('Play Harmonic Drone (Sa-Pa)','स्वर तानपूरा चालू करें');
  }else{
   try{
    const AudioContextClass=window.AudioContext||window.webkitAudioContext;
    if(!AudioContextClass)return;
    audioCtx=new AudioContextClass();
    masterGain=audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001,audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.18,audioCtx.currentTime+1.5);

    // Warm resonant low-pass filter
    const filter=audioCtx.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.setValueAtTime(540,audioCtx.currentTime);
    filter.Q.setValueAtTime(2.2,audioCtx.currentTime);

    // Subtle LFO modulation simulating authentic wooden gourd shimmer
    const lfo=audioCtx.createOscillator();
    const lfoGain=audioCtx.createGain();
    lfo.frequency.setValueAtTime(0.12,audioCtx.currentTime);
    lfoGain.gain.setValueAtTime(80,audioCtx.currentTime);
    lfo.connect(filter.frequency);
    lfo.start();

    // 1. Sa Fundamental (136.1 Hz - Cosmic Ohm frequency)
    const oscSa=audioCtx.createOscillator();
    oscSa.type='sawtooth';
    oscSa.frequency.setValueAtTime(136.1,audioCtx.currentTime);
    const saGain=audioCtx.createGain();
    saGain.gain.setValueAtTime(0.35,audioCtx.currentTime);
    oscSa.connect(saGain);
    saGain.connect(filter);
    oscSa.start();

    // 2. Pa Fifth (204.15 Hz - Consonant fifth)
    const oscPa=audioCtx.createOscillator();
    oscPa.type='sine';
    oscPa.frequency.setValueAtTime(204.15,audioCtx.currentTime);
    const paGain=audioCtx.createGain();
    paGain.gain.setValueAtTime(0.28,audioCtx.currentTime);
    oscPa.connect(paGain);
    paGain.connect(filter);
    oscPa.start();

    // 3. Sa Octave (272.2 Hz - Upper shimmer)
    const oscOct=audioCtx.createOscillator();
    oscOct.type='triangle';
    oscOct.frequency.setValueAtTime(272.2,audioCtx.currentTime);
    const octGain=audioCtx.createGain();
    octGain.gain.setValueAtTime(0.18,audioCtx.currentTime);
    oscOct.connect(octGain);
    octGain.connect(filter);
    oscOct.start();

    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    droneRunning=true;
    droneToggle.setAttribute('aria-pressed','true');
    droneToggle.querySelector('span').textContent='♪ '+text('Stop Drone (Playing…)','तानपूरा बंद करें (चालू…)');
   }catch{}
  }
 }

 droneToggle?.addEventListener('click',toggleDrone);
 addEventListener('pagehide',()=>{if(droneRunning)toggleDrone();});
}

// =========================================================================
// 5. DAILY ILLUMINATION STAGE & WEB SHARE API
// =========================================================================
const dailyData=document.querySelector('#daily-preview-data');
if(dailyData){
 const stories=JSON.parse(dailyData.textContent);
 const index=Math.floor((Date.now()+19800000)/86400000)%stories.length;
 const story=stories[index];
 const feature=document.querySelector(`[data-daily-card="${index}"]`);
 let page=0;

 const duplicate=document.querySelector(`.story-carousel [data-story-id="${story.id}"]`);
 if(duplicate)duplicate.hidden=true;
 const previous=feature?.querySelector('[data-daily-step="-1"]');
 const next=feature?.querySelector('[data-daily-step="1"]');

 function paint(){
  if(!feature)return;
  const scene=story.pages[page];
  const img=feature.querySelector('img');
  if(img){
   img.src=scene.image.src;
   img.alt=scene.image.alt[hi?'hi':'en'];
  }
  const quoteEl=feature.querySelector('blockquote');
  if(quoteEl)quoteEl.textContent=scene.quote;
  const posEl=feature.querySelector('[data-daily-position]');
  if(posEl)posEl.textContent=`${page+1} / ${story.pages.length}`;
  const openEl=feature.querySelector('[data-daily-open]');
  if(openEl)openEl.href=story.path+'#page-'+(page+1);
  if(previous)previous.disabled=page===0;
  if(next)next.disabled=page===story.pages.length-1;
 }

 for(const button of [previous,next].filter(Boolean)){
  button.addEventListener('click',()=>{
   page=Math.max(0,Math.min(story.pages.length-1,page+Number(button.dataset.dailyStep)));
   paint();
   if(!reduced.matches){
    feature.querySelector('.daily-plate')?.animate([
     {opacity:.5,transform:'perspective(1000px) rotateY(-8deg)'},
     {opacity:1,transform:'perspective(1000px) rotateY(0)'}
    ],{duration:550,easing:'cubic-bezier(.22,1,.36,1)'});
   }
  });
 }
 paint();

 // Web Share API button
 const shareBtn=feature?.querySelector('[data-share-quote]');
 if(shareBtn){
  shareBtn.addEventListener('click',async()=>{
   const title=feature.querySelector('.daily-title')?.textContent||document.title;
   const quote=feature.querySelector('blockquote')?.textContent||'';
   const url=window.location.origin+story.path;
   if(navigator.share){
    try{
     await navigator.share({title,text:`"${quote}" — ${title}`,url});
    }catch{}
   }else if(navigator.clipboard){
    try{
     await navigator.clipboard.writeText(`"${quote}" — ${title}\n${url}`);
     const span=shareBtn.querySelector('span');
     if(span){
      const original=span.textContent;
      span.textContent=text('Copied to clipboard! ✓','कॉपी किया गया! ✓');
      setTimeout(()=>{span.textContent=original;},2200);
     }
    }catch{}
   }
  });
 }
}
