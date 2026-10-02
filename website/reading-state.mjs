export const READING_KEY='spritual_reading_v2';
export const READING_VERSION=2;
const themes=new Set(['light','sepia','dark']);
const sizes=new Set([18,20,22,24,28]);
const languages=new Set(['en','hi']);
const interestValues=new Set(['family','courage','reflection','service']);

export function emptyReadingState(){return {version:READING_VERSION,preferences:{language:'en',theme:'light',textSize:20,interests:[]},progress:{},bookmarks:[],onboarding:null};}
const cleanString=(value,max=120)=>typeof value==='string'&&value.length>0&&value.length<=max?value:null;
function validProgress(item,allowed){
 return item&&allowed.includes(item.storyId)&&cleanString(item.contentRevision,80)&&languages.has(item.language)&&cleanString(item.sceneId)&&cleanString(item.blockId)&&Number.isFinite(item.blockOffsetRatio)&&item.blockOffsetRatio>=0&&item.blockOffsetRatio<=1&&Number.isFinite(item.updatedAt)&&item.updatedAt>0;
}
export function readReadingState(storage,allowed){
 try{
  const raw=storage.getItem(READING_KEY);if(raw===null)return {kind:'empty',state:emptyReadingState()};
  const data=JSON.parse(raw);if(data?.version!==READING_VERSION||!data.preferences||!themes.has(data.preferences.theme)||!sizes.has(data.preferences.textSize)||!languages.has(data.preferences.language)||!Array.isArray(data.preferences.interests)||data.preferences.interests.length>4||data.preferences.interests.some(x=>!interestValues.has(x)))throw Error('preferences');
  if(!data.progress||typeof data.progress!=='object'||Array.isArray(data.progress)||Object.keys(data.progress).length>allowed.length)throw Error('progress');
  for(const [key,item] of Object.entries(data.progress))if(key!==item?.storyId||!validProgress(item,allowed))throw Error('progress item');
  if(!Array.isArray(data.bookmarks)||data.bookmarks.length>100||data.bookmarks.some(item=>!item||!allowed.includes(item.storyId)||!cleanString(item.sceneId)||!cleanString(item.blockId)||!languages.has(item.language)||!Number.isFinite(item.createdAt)||!(item.kind===undefined||item.kind==='story'||item.kind==='place')))throw Error('bookmarks');
  if(!(data.onboarding===null||data.onboarding==='skipped'||data.onboarding==='complete'))throw Error('onboarding');
  return {kind:'ready',state:data};
 }catch{return {kind:'invalid',state:emptyReadingState()};}
}
export function writeReadingState(storage,state){storage.setItem(READING_KEY,JSON.stringify(state));return state;}
export function updateReadingState(storage,allowed,change){const prior=readReadingState(storage,allowed);if(prior.kind==='invalid')throw Error('Unreadable reading data');const next=change(structuredClone(prior.state));next.version=READING_VERSION;return writeReadingState(storage,next);}
export function saveProgress(storage,allowed,progress){if(!validProgress(progress,allowed))throw Error('Invalid progress');return updateReadingState(storage,allowed,state=>{state.progress[progress.storyId]=progress;return state;});}
export function setPreference(storage,allowed,key,value){return updateReadingState(storage,allowed,state=>{state.preferences[key]=value;return state;});}
export function setOnboarding(storage,allowed,value){return updateReadingState(storage,allowed,state=>{state.onboarding=value;return state;});}
export function toggleBookmark(storage,allowed,bookmark){return updateReadingState(storage,allowed,state=>{const index=state.bookmarks.findIndex(item=>item.storyId===bookmark.storyId&&item.blockId===bookmark.blockId&&item.language===bookmark.language);if(index>=0)state.bookmarks.splice(index,1);else state.bookmarks.unshift(bookmark);return state;});}
export function removeStoryData(storage,allowed,storyId){return updateReadingState(storage,allowed,state=>{delete state.progress[storyId];state.bookmarks=state.bookmarks.filter(item=>item.storyId!==storyId);return state;});}
export function removeProgress(storage,allowed,storyId){return updateReadingState(storage,allowed,state=>{delete state.progress[storyId];return state;});}
export function restoreStoryData(storage,state){writeReadingState(storage,state);return state;}
export function mostRecentProgress(state){return Object.values(state.progress).sort((a,b)=>b.updatedAt-a.updatedAt)[0]||null;}
export function resolveProgress(progress,story){
 if(!progress||progress.storyId!==story.id)return null;
 const scene=story.scenes.find(item=>item.id===progress.sceneId)||story.scenes[0];
 const block=scene.blocks.find(item=>item.id===progress.blockId)||scene.blocks[0];
 return {sceneId:scene.id,blockId:block.id,ratio:progress.contentRevision===story.contentRevision?progress.blockOffsetRatio:0,revisionChanged:progress.contentRevision!==story.contentRevision};
}
