// Runs first, before the page paints: language, saved reading preferences, the motion switch, the service worker,
// and the second half of the poster-to-story transition. External (not inline) so a strict CSP (script-src 'self') allows it.
(function () {
  var d = document.documentElement, me = document.currentScript;
  d.lang = (me && me.dataset.lang) || d.lang || 'en';
  // the not-found page carries both languages; a missing address under /hi/ gets the Hindi one (see lost.js)
  if (me && me.hasAttribute('data-lost') && /^\/hi(\/|$)/.test(location.pathname)) { d.lang = 'hi'; d.dataset.lostLang = 'hi'; }
  var calm = false;
  try {
    var p = JSON.parse(localStorage.getItem('spritual:prefs') || '{}');
    if (p.size) d.dataset.size = p.size;
    if (p.theme) d.dataset.theme = p.theme;
    if (p.motion) d.dataset.motion = p.motion;
    calm = p.motion === 'reduce';
  } catch (e) {}
  // the device's own "reduce motion" setting counts exactly like the site's switch, for every rule that asks
  var mq = matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) d.dataset.motion = 'reduce';
  if (mq.addEventListener) mq.addEventListener('change', function () {
    var mine; try { mine = JSON.parse(localStorage.getItem('spritual:prefs') || '{}').motion; } catch (e) {}
    if (mq.matches || mine === 'reduce') d.dataset.motion = 'reduce'; else delete d.dataset.motion;
  });
  if (!calm && !mq.matches) d.classList.add('cx-js');
  // the opening titles play once; a reader who has been here before gets the words and buttons at once
  try { if (localStorage.getItem('spritual:seen')) d.classList.add('cx-seen'); else localStorage.setItem('spritual:seen', '1'); } catch (e) {}
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
