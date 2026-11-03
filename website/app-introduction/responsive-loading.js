(() => {
  'use strict';
  const selector = 'img[data-deferred-src]';
  const waiting = new Set(document.querySelectorAll(selector));
  if (!waiting.size) return;
  let observer = null;

  function show(image, state) {
    image.dataset.imageState = state;
    image.style.removeProperty('visibility');
  }

  function load(image) {
    if (!waiting.delete(image)) return;
    observer?.unobserve(image);
    image.dataset.imageState = 'loading';
    const ready = () => show(image, 'ready');
    const failed = () => show(image, 'error');
    image.addEventListener('load', ready, {once: true});
    image.addEventListener('error', failed, {once: true});
    // The explicit viewport boundary owns timing now; do not leave a second
    // native lazy-loading threshold between an arriving reader and the art.
    image.loading = 'eager';
    if (image.dataset.deferredSrcset) image.srcset = image.dataset.deferredSrcset;
    image.src = image.dataset.deferredSrc;
    delete image.dataset.deferredSrcset;
    delete image.dataset.deferredSrc;
    if (image.complete && image.naturalWidth > 0) ready();
    if (!waiting.size) {
      observer?.disconnect();
      document.removeEventListener('focusin', loadFocusedImage, true);
      document.removeEventListener('pointerdown', loadFocusedImage, true);
    }
  }

  function loadFocusedImage(event) {
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest('a,button');
    if (control) control.querySelectorAll(selector).forEach(load);
  }

  waiting.forEach(image => {
    image.style.visibility = 'hidden';
    image.style.removeProperty('display');
    image.dataset.imageState = 'waiting';
  });
  document.addEventListener('focusin', loadFocusedImage, true);
  document.addEventListener('pointerdown', loadFocusedImage, {capture: true, passive: true});
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) load(entry.target);
      });
    }, {rootMargin: '160px', threshold: 0});
    waiting.forEach(image => observer.observe(image));
  } else {
    // Older browsers retain the complete illustrated experience.
    [...waiting].forEach(load);
  }
  document.documentElement.dataset.responsiveImages='ready';
})();
