import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'../dist');
test('public output contains only approved website assets and no app data',async()=>{
 const files=await readdir(root,{recursive:true});
 assert(files.includes('assets/social.png'));assert(files.includes('hi/pause/index.html'));
 for(const file of files)assert(!/(alpha|supabase|fixture|\.env|\.map$|gita-chariot|sound-check)/i.test(file),file);
 for(const file of files.filter(f=>/\.(html|js)$/.test(f))){const text=await readFile(resolve(root,file),'utf8');assert(!/sb_publishable|supabase\.co|googletagmanager|google-analytics/.test(text),file);}
});
test('all six pages have canonical metadata, local assets and known internal targets',async()=>{
 const files=await readdir(root,{recursive:true});
 for(const file of files.filter(f=>f.endsWith('index.html'))){const html=await readFile(resolve(root,file),'utf8');assert.match(html,/<link rel="canonical" href="https:\/\/spritual.co.in\//);assert.match(html,/hreflang="hi"/);assert.match(html,/name="viewport"/);
  for(const [,target] of html.matchAll(/(?:href|src)="(\/[^"#?]*)(?:[?#][^"]*)?"/g)){const path=target.slice(1)+(target.endsWith('/')?'index.html':'');assert(files.includes(path),`${file}: ${target}`);}
 }
});
