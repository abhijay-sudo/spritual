// The offline page: list the stories this device can open without a connection (the ones the service worker has kept),
// with the story the reader was last in first. Nothing here leaves the device; it only asks the browser's own cache.
(function () {
  var ui = {}; try { ui = JSON.parse(document.getElementById('ui').textContent); } catch (e) {}
  var list = document.querySelector('[data-offline-list]');
  var some = document.querySelector('[data-offline-some]'), none = document.querySelector('[data-offline-none]');
  var retry = document.querySelector('[data-offline-retry]');
  if (retry) retry.addEventListener('click', function () { location.reload(); });
  if (!list || !ui.stories || !('caches' in window)) return;
  var last = null; try { last = JSON.parse(localStorage.getItem('spritual:last') || 'null'); } catch (e) {}
  var lastSlug = last && (last.slug || last.s);
  var slugs = Object.keys(ui.stories);
  var has = function (url) { return url ? caches.match(url, { ignoreSearch: true }).then(function (r) { return !!r; }, function () { return false; }) : Promise.resolve(false); };
  Promise.all(slugs.map(function (slug) {
    var s = ui.stories[slug];
    return Promise.all([has(s.h), has(s.p)]).then(function (r) { return r[0] ? { slug: slug, s: s, pic: r[1] } : null; });
  })).then(function (found) {
    found = found.filter(Boolean);
    found.sort(function (a, b) { return (b.slug === lastSlug) - (a.slug === lastSlug); });
    if (!found.length) return;
    found.forEach(function (f) {
      var li = document.createElement('li'); var a = document.createElement('a');
      a.className = 'off-item'; a.href = f.s.h;
      var pic = document.createElement('span'); pic.className = 'off-pic'; pic.setAttribute('aria-hidden', 'true');
      if (f.pic) { var im = document.createElement('img'); im.src = f.s.p; im.alt = ''; im.width = 96; im.height = 96; im.decoding = 'async'; pic.appendChild(im); }
      var txt = document.createElement('span'); txt.className = 'off-txt';
      if (f.slug === lastSlug && ui.offLast) { var k = document.createElement('small'); k.textContent = ui.offLast; txt.appendChild(k); }
      var t = document.createElement('strong'); t.textContent = f.s.t; txt.appendChild(t);
      a.appendChild(pic); a.appendChild(txt); li.appendChild(a); list.appendChild(li);
    });
    if (some) some.hidden = false; if (none) none.hidden = true;
  });
})();
