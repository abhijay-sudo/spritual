import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {chapters,revision,sceneArt,validateCollection} from './model.mjs';

const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
export const reviewAreas=['source','hindi','sensitivePassages','artwork','rights','ownerRelease'];

// Bind human decisions to the exact prose, scene mappings and delivered artwork.
// This utility records readiness only. It cannot enable draft production builds.
export async function publicationFingerprint(){
  validateCollection();
  const assets=[];
  for(const file of [...new Set(chapters.flatMap(c=>sceneArt(c).map(a=>a.file)))].sort()){
    for(const width of [640,960,1280]){
      const name=`${file}-${width}.jpg`,bytes=await readFile(new URL(`../../assets/illustrated/${name}`,import.meta.url));
      assets.push({file:`assets/illustrated/${name}`,sha256:sha(bytes),bytes:bytes.length});
    }
  }
  const cover=await readFile(new URL('../../app-introduction/public/assets/forest-journey.webp',import.meta.url));
  assets.push({file:'stories-app/assets/forest-journey.webp',sha256:sha(cover),bytes:cover.length});
  const scenes=chapters.map(c=>({id:c.id,scenes:sceneArt(c)}));
  return {revision,fingerprint:sha(JSON.stringify({revision,scenes,assets})),assets,chapterCount:chapters.length,sceneCount:chapters.reduce((n,c)=>n+c.scenes.length,0)};
}
export function reviewBlockers(record,current){
  const blockers=[];
  if(record?.revision!==current.revision||record?.fingerprint!==current.fingerprint)blockers.push('Review record does not match the exact current text, scene mapping and delivered artwork.');
  if(record?.distribution!=='spritual.co.in bilingual website')blockers.push('Website distribution scope is not recorded.');
  for(const area of reviewAreas){
    const entry=record?.reviews?.[area];
    if(entry?.status!=='approved'||!entry?.reviewer?.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(entry?.date||'')||!entry?.evidence?.trim())blockers.push(`${area}: named, dated exact-version review and evidence are required.`);
  }
  if(!record?.rightsMarkets?.length)blockers.push('Rights reviewer must identify the intended distribution markets and applicable basis.');
  if(record?.paidAccess!==false)blockers.push('Paid access is outside this website publication review.');
  return blockers;
}
export async function preflight(){
  const current=await publicationFingerprint();
  let record=null;try{record=JSON.parse(await readFile(new URL('publication-review.json',import.meta.url),'utf8'));}catch{}
  const blockers=reviewBlockers(record,current);
  return {checkedAt:new Date().toISOString(),...current,status:blockers.length?'blocked':'review-record-complete',blockers,
    limits:['Recorded human evidence must be independently verified; a JSON record is not legal clearance.','This command neither publishes content nor changes the local-only build guard.','Native app distribution, paid access and physical-device certification are outside this review.']};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  const report=await preflight();
  const output=process.argv.find(a=>a.startsWith('--output='))?.slice(9);
  if(output)await writeFile(resolve(output),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,revision:report.revision,fingerprint:report.fingerprint,chapterCount:report.chapterCount,sceneCount:report.sceneCount,assetFiles:report.assets.length,blockers:report.blockers},null,2));
  if(report.blockers.length)process.exitCode=1;
}
