import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

test('public output includes only the exact owner-authorized welcome artwork',async()=>{
  const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
  assert(html.includes('welcome-intro'));assert(html.includes('/stories-app/welcome/'));
  const approval=JSON.parse(await readFile(new URL('../welcome-preview/release.json',import.meta.url),'utf8'));
  const published=await readFile(new URL('../dist/stories-app/welcome/deity-silhouettes.webp',import.meta.url));
  assert.equal(createHash('sha256').update(published).digest('hex'),approval.publishedWebpSha256);
  assert(published.length<450000,'The opening artwork must stay within its 450kB transfer budget');
  await assert.rejects(access(new URL('../dist/stories-app/welcome/deity-silhouettes.png',import.meta.url)));
  await assert.rejects(access(new URL('../dist/stories-app/welcome/release.json',import.meta.url)));
});
test('hosted builds reject the welcome preview before writing output',()=>{
  for(const marker of ['CI','VERCEL']){
    const result=spawnSync(process.execPath,['website/build.mjs','--welcome-preview'],{cwd:new URL('../..',import.meta.url),env:{...process.env,[marker]:'1'},encoding:'utf8'});
    assert.notEqual(result.status,0);assert.match(result.stderr,/Welcome artwork preview is local only/);
  }
});
