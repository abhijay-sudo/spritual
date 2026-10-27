// A brief, once-only book arrival. Native links and content work without it.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const active=new Set();
const cancel=()=>{for(const animation of active)animation.cancel();active.clear();};
if('IntersectionObserver' in window&&Element.prototype.animate){
 const observer=new IntersectionObserver(entries=>{
  let order=0;
  for(const entry of entries){if(!entry.isIntersecting)continue;observer.unobserve(entry.target);if(reduced.matches||document.hidden)continue;
   const animation=entry.target.animate([{opacity:.35,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:480,delay:Math.min(order++,3)*60,easing:'cubic-bezier(.2,.75,.25,1)'});
   active.add(animation);animation.finished.catch(()=>{}).finally(()=>active.delete(animation));
  }
 },{threshold:.12});
 document.querySelectorAll('[data-volume-arrival]').forEach(item=>observer.observe(item));
 reduced.addEventListener('change',()=>{if(reduced.matches)cancel();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
 addEventListener('pagehide',()=>{cancel();observer.disconnect();});
}
