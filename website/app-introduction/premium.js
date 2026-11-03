(() => {
  'use strict';

// Independent recovery if the optional viewport-image enhancement cannot load.
// Native lazy loading still provides the complete illustrated site in that case.
function recoverDeferredArtwork(){
  if(document.documentElement.dataset.responsiveImages==='ready')return;
  document.querySelectorAll('img[data-deferred-src]').forEach(image=>{
    image.loading='lazy';
    if(image.dataset.deferredSrcset)image.srcset=image.dataset.deferredSrcset;
    image.src=image.dataset.deferredSrc;
    image.style.removeProperty('display');image.style.removeProperty('visibility');
    image.dataset.imageState='fallback';
    delete image.dataset.deferredSrc;delete image.dataset.deferredSrcset;
  });
}
if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',recoverDeferredArtwork,{once:true});
else recoverDeferredArtwork();

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const scenes = [...document.querySelectorAll('[data-scroll-scene]')];
  const visible = new Set();
  const entrances = new Set();
  let frame = 0;
  const allowed = () => !reduced.matches && !document.hidden;
  // No permanent render loop: one frame per native scroll/resize, only for visible art.
  function render() {
    frame = 0;
    if (!allowed()) return;
    for (const scene of visible) {
      const rect = scene.getBoundingClientRect();
      const position = scene.classList.contains('hero-gallery')
        ? (130 - rect.top) / (rect.height + 130)
        : (innerHeight - rect.top) / (innerHeight + rect.height);
      const progress = Math.max(0, Math.min(1, position));
      scene.style.setProperty('--scene-progress', progress.toFixed(4));
    }
  }
  function schedule() {
    if (!frame && allowed() && visible.size) frame = requestAnimationFrame(render);
  }
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!allowed()) {
      entrances.forEach(animation => animation.cancel());
      entrances.clear();
    }
    if (reduced.matches) scenes.forEach(scene => scene.style.setProperty('--scene-progress', '0'));
    schedule();
  }
  scenes.forEach(scene => scene.style.setProperty('--scene-progress', '0'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => isIntersecting ? visible.add(target) : visible.delete(target));
      schedule();
    }, {rootMargin: '80px'});
    scenes.forEach(scene => observer.observe(scene));
    const arrival = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        arrival.unobserve(entry.target);
        if (!allowed() || !Element.prototype.animate) continue;
        const animation = entry.target.animate([
          {opacity:.3, transform:'translateY(14px)'},
          {opacity:1, transform:'translateY(0)'}
        ], {duration:560, easing:'cubic-bezier(.22,1,.36,1)'});
        entrances.add(animation);
        animation.finished.catch(() => {}).finally(() => entrances.delete(animation));
      }
    }, {threshold:.12});
    document.querySelectorAll('.section-heading,.experience-heading,.edition-details,.launch-content').forEach(element => arrival.observe(element));
    addEventListener('pagehide', () => {cancelAnimationFrame(frame); frame = 0; entrances.forEach(animation => animation.cancel()); entrances.clear();});
    addEventListener('pageshow', schedule);
  } else scenes.forEach(scene => visible.add(scene));
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  document.addEventListener('visibilitychange', reset);
  reduced.addEventListener('change', reset);
  schedule();
})();
