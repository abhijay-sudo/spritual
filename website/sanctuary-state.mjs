// Pure timing/return helpers. No storage, awards, audio or lifecycle side effects.
export const MINUTE_MS = 60_000;
export const BREATH_MODES = ['guided', 'skip', 'natural'];
export function breathingFrame(elapsed, mode = 'guided') {
  const time = Math.max(0, Math.min(MINUTE_MS, Number(elapsed) || 0));
  if (time === MINUTE_MS) return {phase: 'ended', scale: .82, remaining: 0};
  if (mode === 'natural') return {phase: 'natural', scale: .82, remaining: MINUTE_MS - time};
  // Four complete 4/4/6 cycles, then four seconds of unpaced settling.
  if (mode !== 'skip' && time >= 56_000) return {phase: 'settle', scale: .82, remaining: MINUTE_MS - time};
  const cycle = mode === 'skip' ? 10_000 : 14_000;
  const position = time % cycle;
  const ease = x => (1 - Math.cos(Math.PI * x)) / 2;
  const exhaleAt = mode === 'skip' ? 4_000 : 8_000;
  if (position < 4_000) return {phase: 'inhale', scale: .72 + .28 * ease(position / 4_000), remaining: MINUTE_MS - time};
  if (position < exhaleAt) return {phase: 'hold', scale: 1 + .008 * Math.sin((position - 4_000) / 1000 * Math.PI), remaining: MINUTE_MS - time};
  return {phase: 'exhale', scale: 1 - .28 * ease((position - exhaleAt) / 6_000), remaining: MINUTE_MS - time};
}

export function safeQuietReturn(value, lang = 'en', origin = 'https://spritual.co.in') {
  if (!value) return null;
  let url;
  try { url = new URL(value, origin); } catch { return null; }
  if (url.origin !== origin) return null;
  const path = url.pathname.replace(/^\/hi(?=\/)/, '');
  if (!/^\/read\/[a-z0-9-]+\/$/.test(path) && !/^\/library\/(mahabharata|ramayana|shiva)\/[a-z]+\/$/.test(path)) return null;
  const next = new URL((lang === 'hi' ? '/hi' : '') + path, origin);
  if (/^\/read\//.test(path)) {
    next.searchParams.set('from', 'resume');
    const journey = url.searchParams.get('journey');
    if (['ramayana', 'hanuman', 'together'].includes(journey)) next.searchParams.set('journey', journey);
    if (/^#(?:block|scene)-[a-z0-9-]+$/.test(url.hash)) next.hash = url.hash;
  }
  const world = url.searchParams.get('world');
  if (['neutral', 'epic', 'rama', 'hanuman', 'shiva', 'krishna'].includes(world)) next.searchParams.set('world', world);
  return next.pathname + next.search + next.hash;
}
