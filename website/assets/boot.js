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
  // the home opening is composed at 1920x1080; on bigger screens (a 4K monitor at 100%, a television) the composition
  // grows with the screen, by the smaller of its width and height ratios (so a 32:9 screen still fits it in one screen).
  // Only the opening's words and buttons use it (cinema.css, zoom); the rest of the site keeps the reader's text size.
  var setK = function () { d.style.setProperty('--cx-k', Math.max(1, Math.min(innerWidth / 1920, innerHeight / 1080)).toFixed(4)); };
  setK(); addEventListener('resize', setK);
  // the opening titles play once; a reader who has been here before gets the words and buttons at once
  // The home page's title sequence plays once each time the site is opened (a new tab or window), not on every return to
  // the home page within that visit. Other pages keep their own first-visit-only entrances.
  try {
    if (me && me.hasAttribute('data-titles')) { if (sessionStorage.getItem('spritual:titles')) d.classList.add('cx-seen'); else sessionStorage.setItem('spritual:titles', '1'); localStorage.setItem('spritual:seen', '1'); }
    else if (localStorage.getItem('spritual:seen')) d.classList.add('cx-seen'); else localStorage.setItem('spritual:seen', '1');
  } catch (e) {}
  // The title sequence's curtain parts along the line of light under the name, and where that line sits depends on the
  // screen and the language. It is measured here, in the frame before each paint, from before the first one until the
  // sequence is over (fonts arriving can move it), and handed to the stylesheet as --seam (cinema.css).
  if (me && me.hasAttribute('data-titles') && d.classList.contains('cx-js') && !d.classList.contains('cx-seen') && window.requestAnimationFrame) {
    var seamFrom = 0, seamAt = -1, zf = 0;
    // The name sits in a part of the page that is zoomed on screens larger than 1920x1080 (--cx-k). Newer engines report
    // such an element's rectangle as it is seen; older ones (Safari, Chrome before 128) report it divided by the zoom.
    // A probe tells which, once: a box 50px down inside a twice-zoomed parent is seen at 100px.
    var zoomFix = function () {
      if (!zf) {
        var o = document.createElement('div'), i = document.createElement('div');
        o.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;zoom:2;visibility:hidden;pointer-events:none';
        i.style.cssText = 'position:absolute;left:0;top:50px;width:1px;height:1px';
        o.appendChild(i); document.body.appendChild(o);
        zf = (i.getBoundingClientRect().top - o.getBoundingClientRect().top) < 75 ? 2 : 1;   // 2: divided by the zoom
        document.body.removeChild(o);
      }
      return zf === 2 ? (parseFloat(d.style.getPropertyValue('--cx-k')) || 1) : 1;
    };
    var seam = function () {
      var line = document.querySelector('.cx-home .cx-open .cx-wm-line'), open = line && line.closest('.cx-open');
      if (open) {
        if (!seamFrom) seamFrom = Date.now();   // the seven seconds run from the first frame that has the name in it
        var z = zoomFix(), r = line.getBoundingClientRect(), y = Math.round((r.top + r.height / 2) * z - open.getBoundingClientRect().top);
        if (y > 0 && y !== seamAt) { seamAt = y; d.style.setProperty('--seam', y + 'px'); }
      }
      if ((!seamFrom || Date.now() - seamFrom < 7000) && !d.classList.contains('cx-seen')) requestAnimationFrame(seam);
    };
    requestAnimationFrame(seam);
  }
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
