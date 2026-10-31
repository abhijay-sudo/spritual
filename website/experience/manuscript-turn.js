// A decorative, inert copy of the rendered leaf. The accessible page updates immediately.
export class ManuscriptTurn {
 constructor(host){this.host=host;this.active=null;}
 capture(content){
  const bounds=this.host.getBoundingClientRect(),rect=content.getBoundingClientRect();
  const clone=content.cloneNode(true);clone.hidden=false;
  for(const node of [clone,...clone.querySelectorAll('*')])for(const attribute of [...node.attributes])if(attribute.name==='id'||attribute.name==='tabindex'||attribute.name.startsWith('data-')||attribute.name.startsWith('aria-'))node.removeAttribute(attribute.name);
  clone.classList.add('turn-content');clone.style.cssText=`position:absolute;left:${rect.left-bounds.left}px;top:${rect.top-bounds.top}px;width:${rect.width}px;margin:0!important;`;
  return {clone,width:bounds.width,height:bounds.height};
 }
 turn(snapshot,{back=false,duration=720}={}){
  this.cancel();if(!snapshot||matchMedia('(prefers-reduced-motion: reduce)').matches||document.hidden)return {cancel(){}};
  const layer=document.createElement('div');layer.className='manuscript-turn';layer.inert=true;layer.setAttribute('aria-hidden','true');
  const leaf=document.createElement('div');leaf.className='turn-leaf';leaf.style.transformOrigin=back?'right center':'left center';
  const front=document.createElement('div');front.className='turn-front';front.append(snapshot.clone);
  const rear=document.createElement('div');rear.className='turn-rear';leaf.append(front,rear);layer.append(leaf);
  layer.style.height=snapshot.height+'px';this.host.append(layer);this.host.dataset.turning=back?'back':'forward';
  const angle=back?112:-112,shift=back?3:-3;
  const animation=leaf.animate([{transform:'rotateY(0deg) translateX(0)',opacity:1},{transform:`rotateY(${angle*.55}deg) translateX(${shift}px)`,opacity:1,offset:.58},{transform:`rotateY(${angle}deg) translateX(${shift*2}px)`,opacity:0}],{duration,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
  let finished=false;const cleanup=()=>{if(finished)return;finished=true;animation.cancel();layer.remove();delete this.host.dataset.turning;if(this.active===record)this.active=null;};
  const record={cancel:cleanup};this.active=record;animation.finished.then(cleanup,cleanup);return record;
 }
 cancel(){this.active?.cancel();}
}
