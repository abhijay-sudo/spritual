// Runs first, before the page paints: language, saved reading preferences, the motion switch, the service worker,
// and the second half of the poster-to-story transition. External (not inline) so a strict CSP (script-src 'self') allows it.
(function () {
  var d = document.documentElement, me = document.currentScript;
  d.lang = (me && me.dataset.lang) || d.lang || 'en';
  var calm = false;
  try {
    var p = JSON.parse(localStorage.getItem('spritual:prefs') || '{}');
    if (p.size) d.dataset.size = p.size;
    if (p.theme) d.dataset.theme = p.theme;
    if (p.motion) d.dataset.motion = p.motion;
    calm = p.motion === 'reduce';
  } catch (e) {}
  if (!calm && !matchMedia('(prefers-reduced-motion: reduce)').matches) d.classList.add('cx-js');
  addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    var w; try { w = sessionStorage.getItem('cx-vt'); sessionStorage.removeItem('cx-vt'); } catch (x) { return; }
    if (!w || w !== location.pathname) return;
    var t = document.querySelector('[data-vt-target] img'); if (!t) return;
    t.style.viewTransitionName = 'cx-hero';
    var clear = function () { t.style.viewTransitionName = ''; };
    e.viewTransition.finished.then(clear, clear);
  });
  var sw = me && me.dataset.sw;
  if (sw && 'serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register(sw); });
})();
