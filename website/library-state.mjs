export const SHELF_KEY='spritual_website_shelf_v1';
export function readShelf(storage,allowed){
 try{const raw=storage.getItem(SHELF_KEY);if(raw===null)return {kind:'empty',items:[]};const data=JSON.parse(raw);
 if(data?.version!==1||!Array.isArray(data.items)||data.items.length>32||data.items.some(x=>typeof x!=='string'||!allowed.includes(x))||new Set(data.items).size!==data.items.length)return {kind:'invalid',items:[]};
 return {kind:'ready',items:data.items};}catch{return {kind:'invalid',items:[]};}
}
export function changeShelf(storage,allowed,key,save){if(!allowed.includes(key))throw Error('Unknown reading place');const prior=readShelf(storage,allowed);if(prior.kind==='invalid')throw Error('Unreadable saved places');const items=prior.items.filter(x=>x!==key);if(save)items.unshift(key);storage.setItem(SHELF_KEY,JSON.stringify({version:1,items}));return items;}
export function normalizeSearch(value){return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().trim().slice(0,120);}
