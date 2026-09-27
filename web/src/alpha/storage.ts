import type {AlphaState} from './types';
/** Only keys belonging to the selected local demo identity may be cleared. */
export function isPrivateAlphaStorageKey(key: string, actorId: string): boolean {
 return key.startsWith(`spritual_alpha_private_${actorId}_`) ||
  key.startsWith(`spritual_alpha_playback_${actorId}_`) ||
  key === `spritual_alpha_preferences_${actorId}` ||
  key === `spritual_alpha_graph_saved_v1_${actorId}` ||
  key === `spritual_alpha_wisdom_v1_${actorId}` ||
  key === `spritual_alpha_japa_v1_${actorId}`;
}
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const strings=(v:Record<string,unknown>,keys:string[])=>keys.every(k=>typeof v[k]==='string');
export function parseAlphaState(raw:string):AlphaState{
 const value:unknown=JSON.parse(raw);if(!object(value)||value.schema!==1)throw Error('Unsupported alpha data. Existing data was preserved.');
 const shapes:Record<string,(v:Record<string,unknown>)=>boolean>={
 contents:v=>strings(v,['id','orgId','title','purpose','transcript','source','status','audioUrl','releaseAt','createdAt'])&&['draft','awaiting_review','approved','published','superseded','withdrawn'].includes(String(v.status))&&typeof v.version==='number'&&typeof v.seconds==='number'&&object(v.rights)&&strings(v.rights,['language','territory','expiresAt'])&&typeof v.rights.recorded==='boolean',
 cohorts:v=>strings(v,['id','orgId','name','startAt','endAt'])&&typeof v.capacity==='number'&&Array.isArray(v.programIds)&&v.programIds.every(x=>typeof x==='string'),
 invitations:v=>strings(v,['id','token','orgId','cohortId','recipientId','expiresAt'])&&typeof v.revoked==='boolean',
 memberships:v=>strings(v,['userId','orgId','cohortId','joinedAt']),
 grants:v=>strings(v,['id','userId','orgId','cohortId','source','status','startsAt','endsAt']),
 completions:v=>strings(v,['id','userId','orgId','contentId','cohortId','day','completedAt']),
 audit:v=>strings(v,['at','actorId','action','targetId','orgId']),
 support:v=>strings(v,['orgId','actorId','kind','at'])&&typeof v.minutes==='number',
 };
 for(const [key,valid] of Object.entries(shapes)){const rows=value[key];if(!Array.isArray(rows)||!rows.every(row=>object(row)&&valid(row)))throw Error(`Saved alpha ${key} cannot be read. Existing data was preserved.`)}
 return value as unknown as AlphaState;
}
