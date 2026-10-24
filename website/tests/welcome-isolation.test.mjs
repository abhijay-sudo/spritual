import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access,readdir} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

// Read the encoded dimensions without adding an image-decoding dependency to website CI.
function webpDimensions(bytes){
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  for(let offset=12;offset+8<=bytes.length;){
    const kind=bytes.toString('ascii',offset,offset+4),length=bytes.readUInt32LE(offset+4),data=offset+8;
    assert(data+length<=bytes.length,'WebP chunk must fit the file');
    if(kind==='VP8X'&&length>=10)return {width:bytes.readUIntLE(data+4,3)+1,height:bytes.readUIntLE(data+7,3)+1};
    if(kind==='VP8L'&&length>=5){assert.equal(bytes[data],0x2f);const bits=bytes.readUInt32LE(data+1);return {width:(bits&0x3fff)+1,height:((bits>>>14)&0x3fff)+1};}
    if(kind==='VP8 '&&length>=10){assert.equal(bytes.toString('hex',data+3,data+6),'9d012a');return {width:bytes.readUInt16LE(data+6)&0x3fff,height:bytes.readUInt16LE(data+8)&0x3fff};}
    offset=data+length+(length%2);
  }
  assert.fail('WebP is missing an image dimensions header');
}

test('public output contains only hash-pinned responsive portraits within the transfer budget',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert(html.includes('welcome-intro'));assert(html.includes('/stories-app/welcome/'));
  const approval=JSON.parse(await readFile(new URL('../welcome-preview/release.json',import.meta.url),'utf8'));
  assert.deepEqual(approval.portraits.map(portrait=>portrait.id),['ganesha','lakshmi','rama','hanuman','shiva','durga','krishna','saraswati']);
  const expectedFiles=['welcome.css','welcome.js'];
  let largestSelectedBytes=0;
  for(const portrait of approval.portraits){
    assert.equal(portrait.width,941,'Source metadata must describe the actual generated width, not an upscale');
    assert.equal(portrait.height,portrait.id==='saraswati'?1671:1672,'Record the actual generated source dimensions; never an upscale');
    assert.equal(portrait.source,`assets/portraits/${portrait.id}-master.png`);
    assert.match(portrait.sha256,/^[a-f0-9]{64}$/);
    const master=await readFile(new URL(`../welcome-preview/${portrait.source}`,import.meta.url));
    assert.equal(master.toString('hex',0,8),'89504e470d0a1a0a',portrait.source);
    assert.equal(master.toString('ascii',12,16),'IHDR',portrait.source);
    assert.deepEqual({width:master.readUInt32BE(16),height:master.readUInt32BE(20)},{width:portrait.width,height:portrait.height},portrait.source);
    assert.equal(createHash('sha256').update(master).digest('hex'),portrait.sha256,portrait.source);
    assert.deepEqual(portrait.variants.map(variant=>variant.height).sort((a,b)=>a-b),[640,960,1280]);
    let largestPortraitBytes=0;
    for(const variant of portrait.variants){
      assert.equal(variant.file,`assets/portraits/${portrait.id}-${variant.height}.webp`);
      const basename=variant.file.slice('assets/portraits/'.length);
      assert.equal(variant.width,Math.round(portrait.width*variant.height/portrait.height));
      assert(variant.width<=portrait.width&&variant.height<=portrait.height,'Delivery must not pretend an upscale adds detail');
      const published=await readFile(new URL(`../dist/stories-app/welcome/portraits/${basename}`,import.meta.url));
      assert.equal(published.length,variant.bytes,variant.file);
      assert.equal(createHash('sha256').update(published).digest('hex'),variant.sha256,variant.file);
      assert.deepEqual(webpDimensions(published),{width:variant.width,height:variant.height},variant.file);
      largestPortraitBytes=Math.max(largestPortraitBytes,published.length);
      expectedFiles.push(`portraits/${basename}`);
    }
    largestSelectedBytes+=largestPortraitBytes;
  }
  assert(largestSelectedBytes<=1500000,`All eight largest selected portraits total ${largestSelectedBytes} bytes; budget is 1.5MB`);
  const files=await readdir(new URL('../dist/stories-app/welcome/',import.meta.url),{recursive:true,withFileTypes:true});
  const root=new URL('../dist/stories-app/welcome/',import.meta.url).pathname;
  const publishedFiles=files.filter(file=>file.isFile()).map(file=>`${file.parentPath.slice(root.length).replace(/^\//,'')}/${file.name}`.replace(/^\//,''));
  assert.deepEqual(publishedFiles.sort(),expectedFiles.sort(),'No source masters, old sprite or release metadata may leak into public output');
  await assert.rejects(access(new URL('../dist/stories-app/welcome/deity-silhouettes.webp',import.meta.url)));
  await assert.rejects(access(new URL('../dist/stories-app/welcome/deity-silhouettes.png',import.meta.url)));
  await assert.rejects(access(new URL('../dist/stories-app/welcome/release.json',import.meta.url)));
});
test('the welcome uses eight individual image elements without circular or oval framing',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  const intro=html.match(/<dialog\b[^>]*id="welcome-intro"[\s\S]*?<\/dialog>/)?.[0];
  assert(intro,'Homepage must contain the native welcome dialog');
  assert.equal([...intro.matchAll(/<img\b[^>]*\bdata-welcome-art(?:=|\s|>)/g)].length,8);
  assert.deepEqual([...intro.matchAll(/data-deity="([a-z]+)"/g)].map(match=>match[1]),['ganesha','lakshmi','rama','hanuman','shiva','durga','krishna','saraswati']);
  assert(!/welcome-(?:arch|horizon)|<(?:circle|ellipse)\b/i.test(intro),'No oval arch or circular framing belongs in the opening');
  const css=await readFile(new URL('../dist/stories-app/welcome/welcome.css',import.meta.url),'utf8');
  assert(!/welcome-(?:arch|horizon)|clip-path\s*:\s*(?:circle|ellipse)\(|border-radius\s*:\s*50%/i.test(css));
});
test('hosted builds reject the welcome preview before writing output',()=>{
  for(const marker of ['CI','VERCEL']){
    const result=spawnSync(process.execPath,['website/build.mjs','--welcome-preview'],{cwd:new URL('../..',import.meta.url),env:{...process.env,[marker]:'1'},encoding:'utf8'});
    assert.notEqual(result.status,0);assert.match(result.stderr,/Welcome artwork preview is local only/);
  }
});
