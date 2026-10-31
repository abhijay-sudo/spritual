// Offline delivery encodes only. The public build has no image-tool dependency.
// Preserve the reviewed source, complete composition, colour space and crop.
import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {deliveryArt} from './delivery-assets.mjs';

for(const art of Object.values(deliveryArt)){
 const source=resolve(import.meta.dirname,`assets/${art.file}.webp`);
 if(createHash('sha256').update(await readFile(source)).digest('hex')!==art.sha256)throw Error('Reviewed source changed; inspect before generating delivery encodes.');
 for(const width of art.widths){
  const target=resolve(import.meta.dirname,`assets/${art.file}-${width}.avif`);
  const result=await sharp(source).resize({width,withoutEnlargement:true}).avif({quality:55,effort:6,chromaSubsampling:'4:4:4'}).toFile(target);
  console.log(JSON.stringify({file:target,width:result.width,height:result.height,bytes:result.size,sourceSha256:art.sha256}));
 }
}
