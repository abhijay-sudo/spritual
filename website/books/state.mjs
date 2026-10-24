export const KEY='spritual_book_places_v1';
export function parsePlaces(raw){
 if(raw===null)return [];
 const value=JSON.parse(raw);
 if(!value||value.version!==1||!Array.isArray(value.places)||value.places.length>100)throw Error('Invalid saved pages');
 for(const p of value.places)if(!p||typeof p.id!=='string'||!/^([a-z0-9-]+\/)*[a-z0-9-]+$/.test(p.id)||!['en','hi'].includes(p.lang)||typeof p.title!=='string'||p.title.length>250||!/^\/(hi\/)?books\/(read|source)\/[a-z0-9/-]+\/$/.test(p.route)||typeof p.folio!=='string'||!/^[a-z0-9-]+$/.test(p.folio)||typeof p.revision!=='string')throw Error('Invalid saved page');
 return value.places;
}
export function keepPlace(places,place){return [place,...places.filter(p=>!(p.id===place.id&&p.lang===place.lang))].slice(0,100);}
export function encodePlaces(places){return JSON.stringify({version:1,places});}
