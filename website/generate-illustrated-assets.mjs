import { createWriteStream } from 'node:fs';
import { mkdir, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { storyArt } from './illustrated-edition.mjs';

if (process.env.CI || process.env.VERCEL) throw new Error('Illustrated artwork generation is local-review-only.');

const originals = resolve(import.meta.dirname, '../artifacts/illustrated-edition/originals');
const output = resolve(import.meta.dirname, 'assets/illustrated');
const files = [...new Set(Object.values(storyArt).flatMap(record => [record.file, ...record.scenes.map(scene => scene.file)]))];
await mkdir(output, { recursive: true });

const resize=async(input,destination,width)=>{
  const temporary=resolve(tmpdir(),`spritual-${randomUUID()}.jpg`);
  await new Promise((resolvePromise,reject)=>{
    const child=spawn('/usr/bin/sips',['-s','format','jpeg','-s','formatOptions','90','-z',String(Math.round(width*2/3)),String(width),input,'--out',temporary],{stdio:'ignore'});
    child.on('error',reject);
    child.on('exit',code=>code===0?resolvePromise():reject(new Error(`sips exited ${code} for ${input}`)));
  });
  await new Promise((resolvePromise,reject)=>{
    const decode=spawn('/opt/homebrew/bin/djpeg',[temporary],{stdio:['ignore','pipe','ignore']});
    const encode=spawn('/opt/homebrew/bin/cjpeg',['-quality','82','-optimize','-progressive'],{stdio:['pipe','pipe','ignore']});
    const output=createWriteStream(destination);
    decode.stdout.pipe(encode.stdin);
    encode.stdout.pipe(output);
    let decoded=false,encoded=false,closed=false;
    const done=()=>{if(decoded&&encoded&&closed)resolvePromise();};
    decode.on('error',reject); encode.on('error',reject); output.on('error',reject);
    decode.on('exit',code=>{if(code!==0)reject(new Error(`djpeg exited ${code} for ${input}`));else{decoded=true;done();}});
    encode.on('exit',code=>{if(code!==0)reject(new Error(`cjpeg exited ${code} for ${input}`));else{encoded=true;done();}});
    output.on('close',()=>{closed=true;done();});
  });
  await unlink(temporary);
};

for (const file of files) {
  for (const width of [640, 960, 1280]) {
    await resize(resolve(originals, `${file}.png`),resolve(output, `${file}-${width}.jpg`),width);
  }
}

console.log(`Wrote ${files.length * 3} responsive local-review assets for ${files.length} active paintings.`);
