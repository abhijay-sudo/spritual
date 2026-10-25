import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// A deterministic state-machine harness, not a browser/layout or smoothness test.
const source=await readFile(new URL('../welcome-preview/welcome.js',import.meta.url),'utf8');
const deityOrder=['ganesha','lakshmi','rama','hanuman','shiva','durga','krishna','saraswati'];
async function harness(options={}) {
  let now=0,id=0,focused=null;
  const tasks=new Map(),allAnimations=[],states=[],decodedImages=[],pendingImages=new Map();
  const schedule=(fn,delay=0)=>{const key=++id;tasks.set(key,{at:now+delay,fn});return key;};
  const clear=key=>tasks.delete(key);
  const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  class Element extends EventTarget {
    constructor(name){super();this.name=name;this.style={};this.dataset={};this.isConnected=true;this.hidden=true;this.children=[];}
    focus(){focused=this;}
    querySelector(){return null;}
    getAttribute(name){return name.startsWith('data-')?this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]:this[name]??null;}
    setAttribute(name,value){this[name]=value;}
    removeAttribute(name){delete this[name];}
    getAnimations(options={}){return allAnimations.filter(a=>(a.element===this||(options.subtree&&this.children.includes(a.element)))&&!a.canceled);}
    animate(frames,config){
      let resolve,reject;
      const animation={element:this,frames,config,start:now,canceled:false,
        finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),
        cancel(){if(this.canceled)return;this.canceled=true;clear(this.timer);reject(new Error('canceled'));},
      };
      animation.timer=schedule(()=>resolve(),config.duration+(config.delay||0));
      allAnimations.push(animation);return animation;
    }
  }
  const figures=deityOrder.map(name=>{
    const f=new Element(name),image=new Element(`${name}-image`),caption=new Element(`${name}-caption`);
    f.dataset.deity=name;
    image.dataset.art=name;
    f.children=[image,caption];
    f.querySelector=selector=>selector==='figcaption'?caption:selector.includes('data-welcome-art')||selector==='img'||selector==='.welcome-cutout'?image:null;
    return f;
  });
  const artwork=figures.map(figure=>figure.children[0]);
  const dialog=new Element('dialog'),replay=new Element('replay'),title=new Element('title'),light=new Element('light'),skip=new Element('skip'),hero=new Element('hero');
  const openingBook=new Element('opening-book'),bookLeft=new Element('book-left'),bookRight=new Element('book-right');
  const bookImages=[new Element('page-left'),new Element('page-right')];
  openingBook.querySelector=selector=>selector==='.welcome-book-left'?bookLeft:selector==='.welcome-book-right'?bookRight:null;
  openingBook.querySelectorAll=()=>bookImages;openingBook.getBoundingClientRect=()=>({width:900,height:600});
  hero.currentSrc='/stories-app/edition/open-book-640.webp';hero.naturalWidth=640;
  dialog.dataset=new Proxy({}, {set(target,key,value){target[key]=value;if(key==='state')states.push({value,at:now});return true;}});
  dialog.open=false;
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;const dispatch=()=>dialog.dispatchEvent(new Event('close'));if(options.queuedClose)schedule(dispatch);else dispatch();};
  dialog.getAnimations=()=>allAnimations.filter(a=>!a.canceled);
  dialog.querySelectorAll=selector=>selector==='.welcome-figure'?figures:selector.includes('data-welcome-art')?artwork:[];
  dialog.querySelector=selector=>({'.welcome-book':openingBook,'.welcome-title':title,'.welcome-light':light,'.welcome-skip':skip})[selector]??null;
  let resolveHero;
  hero.complete=!options.heroPending;
  const heroPromise=new Promise(resolve=>{resolveHero=()=>{hero.complete=true;resolve();};});
  hero.decode=()=>heroPromise;
  const rootClasses=new Set();
  const document=new EventTarget();
  document.hidden=false;
  document.timeline={get currentTime(){return now;}};
  document.documentElement={classList:{add:c=>rootClasses.add(c),remove:c=>rootClasses.delete(c)}};
  document.getElementById=()=>dialog;
  document.querySelector=selector=>selector==='.invitation-painting img'?hero:selector==='[data-replay-welcome]'?replay:selector==='dialog[open]'?(dialog.open||options.otherDialog?dialog:null):selector==='.hero-actions a'?hero:null;
  document.querySelectorAll=selector=>selector.includes('data-welcome-art')?artwork:[];
  const media=new EventTarget();media.matches=options.reduced??false;
  const window=new EventTarget();
  const values=new Map(options.seen?[['spritual_welcome_seen_v1','1']]:[]);
  const storageAccess=[];
  const sessionStorage={getItem(key){storageAccess.push('read');if(options.storageDenied)throw Error('denied');return values.get(key)??null;},setItem(key,value){storageAccess.push('write');if(options.storageDenied)throw Error('denied');values.set(key,value);}};
  class Image {
    naturalWidth=540;naturalHeight=960;_src='';srcset='';sizes='';abandoned=false;pendingReject=null;deity=null;
    get src(){return this._src;}
    set src(value){
      this._src=value;
      if(value===''){
        this.abandoned=true;this.naturalWidth=0;
        // Changing the source interrupts a pending browser decode. Model its rejection.
        pendingImages.delete(this.deity);
        this.pendingReject?.(new Error('image source replaced'));this.pendingReject=null;
      }
    }
    removeAttribute(name){this[name]='';}
    get currentSrc(){return this.srcset.split(',').map(candidate=>candidate.trim().split(/\s+/)[0]).filter(Boolean)[1]||this.src;}
    decode(){
      const deity=this.currentSrc.match(/\/([a-z]+)-\d+\.webp/)?.[1];this.deity=deity;
      decodedImages.push(this);
      if(options.assetFailure===true||(typeof options.assetFailure==='string'&&options.assetFailure===deity))return Promise.reject(Error(`missing ${deity}`));
      if(options.assetPending===true||(typeof options.assetPending==='string'&&options.assetPending===deity))return new Promise((resolve,reject)=>{this.pendingReject=reject;pendingImages.set(deity,()=>{this.pendingReject=null;resolve();});});
      return Promise.resolve();
    }
  }
  vm.runInNewContext(source,{innerWidth:1440,innerHeight:900,document,Element,Image,AbortController,URLSearchParams,sessionStorage,
    location:{hostname:'127.0.0.1',search:options.search??'',hash:options.hash??''},
    performance:{getEntriesByType:()=>[{type:options.navigation??'navigate'}]},
    matchMedia:()=>media,setTimeout:schedule,clearTimeout:clear,addEventListener:window.addEventListener.bind(window),
  });
  await flush();
  const advance=async(ms)=>{
    const end=now+ms;
    for(;;){const next=[...tasks.entries()].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=Math.max(now,next[1].at);tasks.delete(next[0]);next[1].fn();await flush();}
    now=end;await flush();
  };
  const stall=async(ms)=>{now+=ms;await advance(0);};
  return {dialog,replay,title,skip,hero,figures,artwork,decodedImages,states,animations:allAnimations,rootClasses,values,storageAccess,tasks,media,document,window,advance,stall,flush,focused:()=>focused,
    resolveHero:async()=>{resolveHero();await flush();},
    resolveAsset:async(deity)=>{for(const [name,resolve] of pendingImages)if(!deity||name===deity){pendingImages.delete(name);resolve();}await flush();},
    enter:async()=>{skip.dispatchEvent(new Event('click'));dialog.close();await flush();},
    replayNow:async()=>{replay.dispatchEvent(new Event('click'));await flush();},
  };
}

test('welcome completes in 3.4 seconds, visits eight figures in order and restores the reading action',async()=>{
  const h=await harness();assert.equal(h.dialog.open,true);assert.equal(h.focused(),h.skip);
  await h.advance(3399);assert.equal(h.dialog.open,true);
  await h.advance(1);assert.equal(h.dialog.open,false);assert.equal(h.focused(),h.hero);
  const phases=h.states.filter(s=>s.value!=='complete');
  assert.deepEqual(phases,[...deityOrder.map((value,index)=>({value,at:index*260})),{value:'welcome',at:2080},{value:'revealing',at:3180}]);
  assert.equal(h.tasks.size,0);assert.equal(h.rootClasses.size,0);
  assert(h.animations.every(a=>a.canceled));
});

test('all 30 effects share one clock, eight single portraits and a settled welcome',async()=>{
  const h=await harness();
  const animationsAtStart=h.animations.length;
  assert.equal(animationsAtStart,30);
  const entries=h.animations.filter(a=>deityOrder.includes(a.element.name));
  assert.equal(entries.length,8);
  for(let i=0;i<entries.length;i++){
    assert.equal(entries[i].config.delay,i*260);
    assert.equal(entries[i].config.duration,260);
    if(i>0)assert.equal(entries[i].config.delay,entries[i-1].config.delay+entries[i-1].config.duration);
  }
  for(let at=0;at<2080;at+=5)assert(entries.filter(a=>at>=a.config.delay&&at<a.config.delay+a.config.duration).length<=1,'Only one deity may be visible at a time');
  for(const entry of entries){
    assert.equal(entry.frames[0].opacity,0);assert.equal(entry.frames.at(-1).opacity,0);
    assert.equal(entry.config.fill,'both');assert.equal(entry.startTime,0);
  }
  assert(h.animations.every(a=>a.startTime===0),'All painting uses the same browser timeline origin');
  const title=h.animations.find(a=>a.element===h.title);
  const book=h.animations.find(a=>a.element.name==='opening-book');
  assert.equal(book.config.delay,2080);assert.equal(book.config.duration,900);
  assert.equal(book.frames[0].opacity,0);assert.match(book.frames.at(-1).transform,/scale\(/);
  assert.equal(title.config.delay,2600);assert.equal(title.config.duration,280);
  assert.equal(3180-title.config.delay-title.config.duration,300,'The settled welcome holds for 300ms before its exit');
  await h.advance(2700);assert.equal(h.animations.length,animationsAtStart,'No late scene timer constructs or resets visual effects');
});

test('entry works at every phase and removes delayed work immediately',async()=>{
  for(const at of [0,40,510,550,1010,1050,1510,1550,2100,2700]){
    const h=await harness();await h.advance(at);await h.enter();
    assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
    await h.advance(6000);assert.equal(h.dialog.open,false);assert.equal(h.focused(),h.hero);
  }
});

test('replay and Escape restore their opener with no leftover animations',async()=>{
  const h=await harness({hash:'#journey'});assert.equal(h.dialog.open,false);
  for(let i=0;i<3;i++){
    await h.replayNow();await h.advance(600);
    h.dialog.dispatchEvent(new Event('cancel',{cancelable:true}));await h.flush();
    assert.equal(h.dialog.open,false);assert.equal(h.focused(),h.replay);assert.equal(h.tasks.size,0);
  }
});
test('scroll intent cancels choreography while pinch-zoom and tiny wheel drift do not',async()=>{
  const h=await harness();
  const wheel=(deltaY,ctrlKey=false)=>{const event=new Event('wheel');Object.assign(event,{deltaY,ctrlKey});h.window.dispatchEvent(event);};
  wheel(2);assert.equal(h.dialog.open,true);
  wheel(100,true);assert.equal(h.dialog.open,true);
  wheel(100);await h.flush();
  assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);assert.equal(h.focused(),h.hero);
});

test('reduced motion bypasses automatically; replay is static and immediately dismissible',async()=>{
  const h=await harness({reduced:true,search:'?intro=replay'});assert.equal(h.dialog.open,false);
  await h.replayNow();assert.equal(h.dialog.open,true);assert.equal(h.dialog.dataset.state,'welcome');
  assert.equal(h.animations.length,0);assert.equal(h.tasks.size,0);assert.equal(h.title.style.opacity,'1');
  await h.enter();assert.equal(h.dialog.open,false);
});

test('each homepage visit plays regardless of previous session, storage denial or navigation type',async()=>{
  for(const options of [{seen:true},{search:'?utm_source=invitation'},{navigation:'back_forward'},{storageDenied:true}]){
    const h=await harness(options);assert.equal(h.dialog.open,true);
    assert.deepEqual(h.storageAccess,[],'Welcome must neither read nor write browser storage');
    await h.advance(3400);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
  }
});

test('section links and missing artwork still leave the intended content immediately usable',async()=>{
  for(const options of [{hash:'#journey'},{assetFailure:true}]){
    const h=await harness(options);assert.equal(h.dialog.open,false);
    await h.advance(6000);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
  }
});

test('a restored homepage gets a fresh timeline once, without replay on ordinary tab focus',async()=>{
  const h=await harness();await h.advance(500);
  h.window.dispatchEvent(new Event('pagehide'));await h.flush();assert.equal(h.dialog.open,false);
  await h.advance(10);
  const restore=new Event('pageshow');Object.assign(restore,{persisted:true});
  h.window.dispatchEvent(restore);await h.flush();assert.equal(h.dialog.open,true);
  assert(h.animations.filter(a=>!a.canceled).every(a=>a.startTime===510));
  const count=h.animations.length;h.window.dispatchEvent(restore);await h.flush();assert.equal(h.animations.length,count);
  await h.enter();h.document.dispatchEvent(new Event('visibilitychange'));await h.flush();assert.equal(h.dialog.open,false);
  assert.deepEqual(h.storageAccess,[]);
});

test('all eight responsive portraits decode before opening and their selected sources are displayed',async()=>{
  const h=await harness({assetPending:'saraswati'});
  assert.equal(h.decodedImages.length,8);
  assert.equal(h.dialog.open,false,'Seven ready images must not start an incomplete eight-portrait opening');
  await h.advance(500);assert.equal(h.dialog.open,false);
  await h.resolveAsset('saraswati');assert.equal(h.dialog.open,true);
  for(let i=0;i<8;i++){
    assert(h.decodedImages[i].srcset,'Decode must use responsive candidates');
    assert(h.decodedImages[i].sizes,'Decode must use the displayed size contract');
    assert.equal(h.artwork[i].src,h.decodedImages[i].currentSrc);
  }
  await h.enter();assert.equal(h.tasks.size,0);
});

test('a failed or late later portrait leaves the website usable without reopening',async()=>{
  const failed=await harness({assetFailure:'krishna'});
  assert.equal(failed.decodedImages.length,8);
  assert.equal(failed.dialog.open,false);await failed.advance(5000);
  assert.equal(failed.dialog.open,false);assert.equal(failed.tasks.size,0);
  const delayed=await harness({assetPending:'hanuman'});
  await delayed.advance(900);assert.equal(delayed.dialog.open,false);
  assert.equal(delayed.tasks.size,0);
  await delayed.resolveAsset('hanuman');await delayed.advance(5000);
  assert.equal(delayed.dialog.open,false);assert.equal(delayed.tasks.size,0);
});

test('motion preference, hidden page and navigation cancel the complete sequence',async()=>{
  for(const reason of ['preference','hidden','pagehide','hashchange']){
    const h=await harness();await h.advance(580);
    if(reason==='preference'){h.media.matches=true;h.media.dispatchEvent(new Event('change'));}
    else if(reason==='hidden'){h.document.hidden=true;h.document.dispatchEvent(new Event('visibilitychange'));}
    else h.window.dispatchEvent(new Event(reason));
    await h.flush();assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);assert.equal(h.rootClasses.size,0);
  }
});

test('slow art cannot interrupt an active visitor or another dialog',async()=>{
  for(const event of ['pointerdown','keydown','touchstart','wheel','scroll']){
    const h=await harness({assetPending:true});h.window.dispatchEvent(new Event(event));await h.resolveAsset();
    assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
  }
  const h=await harness({assetPending:true,otherDialog:true});await h.resolveAsset();assert.equal(h.dialog.open,false);
});

test('artwork deadline abandons all pending image requests and cannot reopen late',async()=>{
  const h=await harness({assetPending:true});await h.advance(900);assert.equal(h.dialog.open,false);
  assert.equal(h.decodedImages.length,8);
  for(const image of h.decodedImages){assert.equal(image.srcset,'');assert.equal(image.src,'');assert.equal(image.abandoned,true);}
  assert(h.artwork.every(image=>!image.src),'Abandoned loaders must not populate displayed portraits');
  assert.equal(h.tasks.size,0);
  await h.resolveAsset();await h.advance(5000);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
});

test('early input abandons pending art immediately and a later replay can load fresh media',async()=>{
  for(const event of ['pointerdown','keydown','touchstart','wheel','scroll']){
    const h=await harness({assetPending:true});h.window.dispatchEvent(new Event(event));await h.flush();
    assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
    assert.equal(h.decodedImages.length,8);
    for(const image of h.decodedImages){assert.equal(image.srcset,'');assert.equal(image.src,'');assert.equal(image.abandoned,true);}
    await h.replayNow();assert.equal(h.decodedImages.length,16,'Replay creates fresh loaders after cancellation');
    await h.resolveAsset();assert.equal(h.dialog.open,true);
    for(let i=0;i<8;i++)assert.equal(h.artwork[i].src,h.decodedImages[i+8].currentSrc);
    await h.enter();assert.equal(h.tasks.size,0);
  }
});


test('a stalled event loop cannot restart expired figures or construct late visual effects',async()=>{
  const h=await harness();const count=h.animations.length;await h.stall(2000);
  assert.equal(h.dialog.dataset.state,'saraswati');assert.equal(h.animations.length,count);
  const figures=h.animations.filter(a=>deityOrder.includes(a.element.name));
  const active=figures.filter(a=>2000>=a.config.delay&&2000<a.config.delay+a.config.duration);
  assert.deepEqual(active.map(a=>a.element.name),['saraswati']);
  await h.stall(500);assert.equal(h.dialog.dataset.state,'welcome');
  assert(figures.every(a=>a.config.delay+a.config.duration<=2080&&a.frames.at(-1).opacity===0));
  assert.equal(h.animations.length,count);await h.enter();assert.equal(h.tasks.size,0);
});

test('a queued prior close cannot tear down a reopened history visit',async()=>{
  const h=await harness({queuedClose:true});await h.advance(300);
  h.window.dispatchEvent(new Event('pagehide'));
  const restore=new Event('pageshow');Object.assign(restore,{persisted:true});
  h.window.dispatchEvent(restore);await h.flush();assert.equal(h.dialog.open,true);
  await h.advance(0);
  assert.equal(h.dialog.dataset.state,'ganesha');
  assert.equal(h.animations.filter(a=>!a.canceled).length,30);
  await h.advance(3400);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
});


test('a cold hero owns the network before optional portraits, without a late opening',async()=>{
  const h=await harness({heroPending:true});
  assert.equal(h.decodedImages.length,0);
  await h.advance(900);assert.equal(h.dialog.open,false);
  await h.resolveHero();assert.equal(h.decodedImages.length,0,'A late hero must not start abandoned portrait requests');
  await h.replayNow();assert.equal(h.decodedImages.length,8);assert.equal(h.dialog.open,true);
  await h.enter();
});
