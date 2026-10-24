// Independent per-intention records avoid overwriting a different tab's petal.
// No calendar streaks, reading progress, language or personal text are stored here.
export const PRACTICE_PREFIX = 'spritual_sankalpa_v1:';
const validId = id => /^[a-z0-9-]{1,80}$/.test(id);
const valid = value => value && value.version === 1 && typeof value.revision === 'string'
  && value.revision.length < 100 && Number.isSafeInteger(value.sealedAt) && value.sealedAt > 0
  && (value.triedAt === null || (Number.isSafeInteger(value.triedAt) && value.triedAt >= value.sealedAt));

export function readPractice(storage, id) {
  if (!validId(id)) return {kind:'invalid', record:null, raw:null};
  let raw;
  try { raw = storage.getItem(PRACTICE_PREFIX + id); }
  catch { return {kind:'unavailable', record:null, raw:null}; }
  if (raw === null) return {kind:'empty', record:null, raw:null};
  try {
    const record = JSON.parse(raw);
    return valid(record) ? {kind:'ready', record, raw} : {kind:'invalid', record:null, raw};
  } catch { return {kind:'invalid', record:null, raw}; }
}

export function updatePractice(storage, id, action, revision, now = Date.now()) {
  const before = readPractice(storage, id);
  if (before.kind === 'invalid' || before.kind === 'unavailable') throw Error('Practice storage unavailable');
  let record = before.record;
  if (action === 'seal' && !record) record = {version:1, revision, sealedAt:now, triedAt:null};
  else if (action === 'try' && record && record.triedAt === null) record = {...record, triedAt:Math.max(now, record.sealedAt)};
  else if (action === 'clear') record = null;
  else if (!['seal','try'].includes(action) || !record) throw Error('Choose an intention first');
  const after = record ? JSON.stringify(record) : null;
  if (after !== before.raw) {
    if (record) storage.setItem(PRACTICE_PREFIX + id, after);
    else storage.removeItem(PRACTICE_PREFIX + id);
  }
  return {id, before:before.raw, after, changed:after !== before.raw};
}

export function undoPractice(storage, change) {
  const current = readPractice(storage, change.id);
  if (current.kind === 'unavailable' || current.kind === 'invalid' || current.raw !== change.after) return false;
  if (change.before === null) storage.removeItem(PRACTICE_PREFIX + change.id);
  else storage.setItem(PRACTICE_PREFIX + change.id, change.before);
  return true;
}

export function milestoneStates(snapshot, ids) {
  const current = ids.find(id => !snapshot[id]?.record?.triedAt);
  return Object.fromEntries(ids.map(id => [id, snapshot[id]?.record?.triedAt ? 'completed' : id === current ? 'current' : 'upcoming']));
}
