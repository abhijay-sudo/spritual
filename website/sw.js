// Spritual service worker, v6. Shell pre-cached on install; pages network-first with cache fallback; paintings and fonts stale-while-revalidate.
const V = 'spritual-v7-cinema'; const SHELL = V + '-shell'; const PAGES = V + '-pages'; const ART = V + '-art';
const CORE = ['/', '/hi/', '/library/', '/assets/site.css', '/assets/editorial.css', '/assets/cinema.css', '/assets/boot.js', '/assets/site.js', '/assets/editorial.js', '/assets/cinema.js', '/assets/scene.js', '/assets/figures.svg', '/assets/favicon.svg', '/daily/', '/pause/', '/my-reading/', '/characters/', '/hi/daily/', '/hi/pause/'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(SHELL).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => !k.startsWith(V)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const swr = async (req, name, max) => {
  const c = await caches.open(name); const hit = await c.match(req);
  const net = fetch(req).then(async (r) => { if (r && r.ok) { await c.put(req, r.clone()); if (max) { const keys = await c.keys(); if (keys.length > max) await c.delete(keys[0]); } } return r; }).catch(() => null);
  return hit || (await net) || Response.error();
};
self.addEventListener('fetch', (e) => {
  const req = e.request; const u = new URL(req.url);
  if (req.method !== 'GET') return;
  if (u.hostname === 'fonts.gstatic.com' || u.hostname === 'fonts.googleapis.com') { e.respondWith(swr(req, ART, 60)); return; }
  if (u.origin !== location.origin) return;
  if (u.pathname.startsWith('/assets/film/')) return;   // clips stream with range requests straight from the network; never cached
  if (u.pathname.startsWith('/assets/art/')) { e.respondWith(swr(req, ART, 160)); return; }
  if (u.pathname.startsWith('/assets/')) { e.respondWith(swr(req, SHELL)); return; }
  e.respondWith(fetch(req).then((r) => { const copy = r.clone(); caches.open(PAGES).then((c) => c.put(req, copy)); return r; }).catch(() => caches.match(req).then((r) => r || caches.match('/'))));
});
