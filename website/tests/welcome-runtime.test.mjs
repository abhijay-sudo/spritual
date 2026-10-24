import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

// A deterministic state-machine harness, not a browser/layout or smoothness test.
const source=await readFile(new URL('../welcome-preview/welcome.js',import.meta.url),'utf8');
async function harness(options={}) {
  let now=0,id=0,focused=null;
  const tasks=new Map(),allAnimations=[],states=[];
  const schedule=(fn,delay=0)=>{const key=++id;tasks.set(key,{at:now+delay,fn});return key;};
  const clear=key=>tasks.delete(key);
  const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  class Element extends EventTarget {
    constructor(name){super();this.name=name;this.style={};this.dataset={};this.isConnected=true;this.hidden=true;}
    focus(){focused=this;}
    querySelector(){return null;}
    getAnimations(){return allAnimations.filter(a=>a.element===this&&!a.canceled);}
    animate(frames,config){
      let resolve,reject;
      const animation={element:this,frames,config,start:now,canceled:false,
        finished:new Promise((yes,no)=>{resolve=yes;reject=no;}),
        cancel(){if(this.canceled)return;this.canceled=true;clear(this.timer);reject(new Error('canceled'));},
      };
      animation.timer=schedule(()=>resolve(),config.duration);
      allAnimations.push(animation);return animation;
    }
  }
  const figures=['rama','shiva','krishna','hanuman'].map(name=>{const f=new Element(name);f.dataset.deity=name;return f;});
  const dialog=new Element('dialog'),replay=new Element('replay'),title=new Element('title'),arch=new Element('arch'),path=new Element('path'),skip=new Element('skip'),hero=new Element('hero');
  dialog.dataset=new Proxy({}, {set(target,key,value){target[key]=value;if(key==='state')states.push({value,at:now});return true;}});
  dialog.open=false;
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new Event('close'));};
  dialog.getAnimations=()=>allAnimations.filter(a=>!a.canceled);
  dialog.querySelectorAll=selector=>selector==='.welcome-figure'?figures:[];
  dialog.querySelector=selector=>({'.welcome-title':title,'.welcome-arch':arch,'.welcome-skip':skip})[selector];
  arch.querySelector=()=>path;
  const rootClasses=new Set();
  const document=new EventTarget();
  document.hidden=false;
  document.documentElement={classList:{add:c=>rootClasses.add(c),remove:c=>rootClasses.delete(c)}};
  document.getElementById=()=>dialog;
  document.querySelector=selector=>selector==='[data-replay-welcome]'?replay:selector==='dialog[open]'?(dialog.open||options.otherDialog?dialog:null):selector==='.hero-actions a'?hero:null;
  const media=new EventTarget();media.matches=options.reduced??false;
  const window=new EventTarget();
  const values=new Map(options.seen?[['spritual_welcome_seen_v1','1']]:[]);
  const sessionStorage={getItem:key=>values.get(key)??null,setItem(key,value){if(options.storageDenied)throw Error('denied');values.set(key,value);}};
  let resolveAsset;
  class Image {
    naturalWidth=2172;
    decode(){if(options.assetPending)return new Promise(resolve=>{resolveAsset=resolve;});return options.assetFailure?Promise.reject(Error('missing')):Promise.resolve();}
  }
  vm.runInNewContext(source,{document,Element,Image,AbortController,URLSearchParams,sessionStorage,
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
  return {dialog,replay,title,skip,hero,states,animations:allAnimations,rootClasses,values,tasks,media,document,window,advance,stall,flush,focused:()=>focused,
    resolveAsset:async()=>{resolveAsset?.();await flush();},
    enter:async()=>{skip.dispatchEvent(new Event('click'));dialog.close();await flush();},
    replayNow:async()=>{replay.dispatchEvent(new Event('click'));await flush();},
  };
}

test('welcome completes in 2.94 seconds, visits four figures in order and restores the reading action',async()=>{
  const h=await harness();assert.equal(h.dialog.open,true);assert.equal(h.focused(),h.skip);
  await h.advance(2939);assert.equal(h.dialog.open,true);
  await h.advance(1);assert.equal(h.dialog.open,false);assert.equal(h.focused(),h.hero);
  const phases=h.states.filter(s=>s.value!=='complete');
  assert.deepEqual(phases,[{value:'rama',at:0},{value:'shiva',at:570},{value:'krishna',at:1030},{value:'hanuman',at:1490},{value:'welcome',at:1940},{value:'revealing',at:2640}]);
  assert.equal(h.tasks.size,0);assert.equal(h.rootClasses.size,0);
  assert(h.animations.every(a=>a.canceled));
});

test('each outgoing deity disappears before the next enters; welcome holds before reveal',async()=>{
  const h=await harness();await h.advance(3000);
  const entries=h.animations.filter(a=>['rama','shiva','krishna','hanuman'].includes(a.element.name)&&a.frames[0].opacity===0);
  for(let i=1;i<entries.length;i++){
    const exit=h.animations.find(a=>a.element===entries[i-1].element&&a.frames.at(-1).opacity===0);
    assert(entries[i].start>=exit.start+exit.config.duration+20);
  }
  const title=h.animations.find(a=>a.element===h.title);
  assert(2640-title.start-title.config.duration>=380);
});

test('entry works at every phase and removes delayed work immediately',async()=>{
  for(const at of [0,500,1100,1550,2100,2750]){
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

test('return visits, deep links, denied storage and missing artwork all fail open',async()=>{
  for(const options of [{seen:true},{hash:'#journey'},{search:'?world=epic'},{navigation:'back_forward'},{storageDenied:true},{assetFailure:true}]){
    const h=await harness(options);await h.advance(6000);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
  }
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

test('artwork deadline preserves usable content and cannot reopen late',async()=>{
  const h=await harness({assetPending:true});await h.advance(900);assert.equal(h.dialog.open,false);
  await h.resolveAsset();await h.advance(5000);assert.equal(h.dialog.open,false);assert.equal(h.tasks.size,0);
});


test('a stalled event loop cannot leave stale deity layers over the latest figure',async()=>{
  const h=await harness();await h.stall(1600);
  assert.equal(h.dialog.dataset.state,'hanuman');
  const active=h.animations.filter(a=>!a.canceled&&['rama','shiva','krishna','hanuman'].includes(a.element.name));
  assert.equal(active.length,1);assert.equal(active[0].element.name,'hanuman');
  await h.stall(800);assert.equal(h.dialog.dataset.state,'welcome');
  assert(h.animations.filter(a=>['rama','shiva','krishna','hanuman'].includes(a.element.name)).every(a=>a.canceled));
  await h.enter();assert.equal(h.tasks.size,0);
});
