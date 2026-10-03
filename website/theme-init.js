(() => {
  const valid = new Set(['neutral', 'epic', 'rama', 'krishna', 'hanuman', 'shiva']);
  const path = location.pathname.replace(/^\/hi\//, '/');
  let route = 'neutral';
  if (path.startsWith('/library/shiva/')) route = 'shiva';
  else if (path.startsWith('/library/ramayana/kishkindha/') || path.startsWith('/library/ramayana/sundara/')) route = 'hanuman';
  else if (path.startsWith('/library/ramayana/')) route = 'rama';
  else if (path.startsWith('/library/mahabharata/')) route = 'epic';
  const requested = new URLSearchParams(location.search).get('world');
  let saved = null;
  try { saved = localStorage.getItem('spritual_world_v1'); } catch {}
  const world = valid.has(requested) ? requested : route !== 'neutral' ? route : valid.has(saved) ? saved : 'neutral';
  document.documentElement.dataset.routeWorld = route;
  document.documentElement.dataset.world = world;
})();
