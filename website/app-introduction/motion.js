(() => {
 'use strict';
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 if (!Element.prototype.animate) return;
 const active = new Map();
 const generations = new WeakMap();
 let epoch = 0;
 const easing = 'cubic-bezier(.22,1,.36,1)';
 const allowed = () => !reduced.matches && !document.hidden;
 const visible = element => element && element.getClientRects().length && element.getBoundingClientRect().bottom > 0 && element.getBoundingClientRect().top < innerHeight;

 function clear(host) {
  const record = active.get(host);
  if (!record) return;
  active.delete(host);
  record.animations.forEach(animation => animation.cancel());
  record.ghost?.remove();
  if (record.position !== undefined) host.style.position = record.position;
  host.removeAttribute('data-motion-host');
 }
 function clearAll() { epoch++; for (const host of active.keys()) clear(host); }
 function animate(host, frames, duration = 360, delay = 0) {
  clear(host);
  if (!allowed() || !visible(host)) return;
  const animation = host.animate(frames, {duration, delay, easing, fill:'backwards'});
  const record = {animations:[animation]};
  active.set(host, record);
  animation.finished.then(() => {if(active.get(host) === record) clear(host);}).catch(() => {});
 }
 function snapshot(host) {
  if (!allowed() || !visible(host)) return null;
  clear(host);
  const ghost = host.cloneNode(true);
  ghost.removeAttribute('id');
  ghost.removeAttribute('role');
  ghost.removeAttribute('aria-labelledby');
  ghost.removeAttribute('aria-describedby');
  ghost.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  ghost.querySelectorAll('[autofocus]').forEach(node => node.removeAttribute('autofocus'));
  ghost.classList.add('motion-ghost');
  ghost.setAttribute('aria-hidden','true');
  ghost.inert = true;
  ghost.tabIndex = -1;
  const scrolls = [...host.querySelectorAll('.phone-scroll')].map(node => node.scrollTop);
  return {host, ghost, scrolls, html:host.innerHTML};
 }
 function blend(saved) {
  if (!saved) return;
  const {host, ghost, scrolls, html} = saved;
  if (!allowed() || !visible(host) || html === host.innerHTML || (host.closest('dialog') && !host.closest('dialog').open)) return;
  clear(host);
  const preview = host.id === 'feature-panel';
  if(preview && host.querySelector('.phone-scroll')?.contains(document.activeElement)) return;
  const children = preview ? [...host.querySelectorAll('.phone-scroll,.scene-art,.scene-caption')] : [...host.children];
  const artwork = host.classList.contains('story-dialog-art');
  if(preview) ghost.querySelectorAll('.phone-topbar,.reader-toolbar,.reader-status,.scene-pagination,.notebook-action').forEach(node => {node.style.visibility='hidden';});
  if(artwork) ghost.querySelector('.story-dialog-art-caption')?.remove();
  const position = host.style.position;
  if(getComputedStyle(host).position === 'static') host.style.position = 'relative';
  host.setAttribute('data-motion-host','');
  // The outgoing layer is purely visual: semantics, focus and actions update immediately.
  host.append(ghost);
  ghost.querySelectorAll('.phone-scroll').forEach((node,index) => {node.scrollTop = scrolls[index] || 0;});
  // Text fades through paper instead of overlapping two languages. Controls never fade.
  const incoming = artwork ? [{opacity:0},{opacity:1}] : [{opacity:0,offset:0},{opacity:0,offset:.3,easing:'ease-out'},{opacity:1,offset:1}];
  const animations = children.map(child => child.animate(incoming,{duration:260,easing:artwork?'ease-out':'linear'}));
  animations.push(ghost.animate([{opacity:1},{opacity:0}],{duration:artwork?220:70,easing:'ease-out',fill:'forwards'}));
  const record = {animations, ghost, position};
  active.set(host,record);
  Promise.all(animations.map(animation => animation.finished)).then(() => {if(active.get(host) === record) clear(host);}).catch(() => {});
 }
 function prepare(selectors) {
  return selectors.map(selector => {
   const host = document.querySelector(selector);
   if (!host) return null;
   const version = (generations.get(host) || 0) + 1;
   generations.set(host,version);
   return {saved:snapshot(host),host,version,epoch};
  }).filter(Boolean);
 }
 function finish(prepared) {
  requestAnimationFrame(() => prepared.forEach(({saved,host,version,epoch:requestedEpoch}) => {
   if(epoch === requestedEpoch && generations.get(host) === version) blend(saved);
  }));
 }
 document.addEventListener('click', event => {
  const button = event.target instanceof Element ? event.target.closest('button') : null;
  if (!button || button.closest('.motion-ghost') || !allowed()) return;
  if(button.matches('[data-story-language]') && button.getAttribute('aria-pressed') !== 'true') finish(prepare(['#story-prose']));
  else if(button.matches('[data-story-step]')) finish(prepare(['#story-prose','.story-dialog-art']));
  else if(button.matches('[data-mode],[data-open-mode],[data-preview],[data-language],[data-scene],[data-save]')) {
   if(button.getAttribute('aria-selected') !== 'true' && button.getAttribute('aria-pressed') !== 'true') finish(prepare(['#feature-panel']));
   else if(button.hasAttribute('data-save')) finish(prepare(['#feature-panel']));
  }
  if(button.matches('[data-story-filter]') && button.getAttribute('aria-pressed') !== 'true') {
   requestAnimationFrame(() => {
    document.querySelectorAll('[data-story-card]:not([hidden])').forEach((card,index) => animate(card,[{opacity:.15,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],380,Math.min(index,2)*40));
   });
  }
 },true);
 document.addEventListener('keydown', event => {
  if(event.target instanceof Element && event.target.matches('[data-mode]') && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) finish(prepare(['#feature-panel']));
  if(event.key === 'Escape') clearAll();
 },true);
 document.addEventListener('spritual:feature', () => {
  for(const id of ['feature-story-title','feature-story-description','feature-aside-quote']) {
   const element = document.getElementById(id);
   if(element) animate(element,[{opacity:.25,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],320);
  }
 });
 document.addEventListener('focusin', event => {
  for(const host of active.keys()) if(host === event.target || host.contains(event.target)) clear(host);
 });
 document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close',clearAll));
 reduced.addEventListener('change',clearAll);
 document.addEventListener('visibilitychange',() => {if(document.hidden) clearAll();});
 window.addEventListener('pagehide',clearAll);
 window.addEventListener('resize',clearAll,{passive:true});
 // One finite arrival per painting; no hidden pre-state, scroll hijacking or replay loop.
 if('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
   entries.filter(entry => entry.isIntersecting).forEach((entry,index) => {
    observer.unobserve(entry.target);
    animate(entry.target,[{opacity:.2,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],520,Math.min(index,2)*65);
   });
  },{threshold:.12});
  document.querySelectorAll('[data-story-card]').forEach(card => observer.observe(card));
 }
})();
