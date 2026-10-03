export const KEY = 'spritual_website_intention_v1';
export function readIntention(storage) {
 try { const raw=storage.getItem(KEY); if(raw===null)return {kind:'empty'};
  const value=JSON.parse(raw);
  if(value?.version!==1 || !Number.isInteger(value?.intention) || value.intention<0 || value.intention>2) return {kind:'invalid'};
  return {kind:'saved',intention:value.intention};
 } catch { return {kind:'invalid'}; }
}
export function saveIntention(storage,intention) {
 if(!Number.isInteger(intention)||intention<0||intention>2)throw new Error('Invalid intention');
 storage.setItem(KEY,JSON.stringify({version:1,intention}));
}
export function selectMoment(search) {
 const id=new URLSearchParams(search).get('moment');return ['stillness','focus','presence'].includes(id)?id:'stillness';
}
// Keep public preview links usable while the registrar verifies the custom domain.
// Never carry arbitrary hosts, query parameters or saved intentions into a share.
export function shareOrigin(origin) {
 return origin==='https://spritual-co-in.vercel.app'?origin:'https://spritual.co.in';
}
// Only visible, explicitly running time counts. Timing uses monotonic timestamps.
export function timerRemaining(remaining,startedAt,now) {return Math.max(0,remaining-Math.max(0,now-startedAt));}
