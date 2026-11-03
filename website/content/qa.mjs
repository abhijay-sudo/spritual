import {readdir,readFile,access} from 'node:fs/promises';import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'../../artifacts/canonical-site');let pages=0;const failures=[];
for(const path of await readdir(root,{recursive:true})){if(!path.endsWith('.html'))continue;pages++;const html=await readFile(resolve(root,path),'utf8');
 for(const m of html.matchAll(/(?:href|src)="([^"#]+)(?:#[^"]*)?"/g)){let url=m[1];if(/^https?:|^mailto:|^data:/.test(url))continue;if(!url.startsWith('/'))continue;url=decodeURIComponent(url.split('?')[0]);const target=resolve(root,'.'+url+(url.endsWith('/')?'index.html':''));try{await access(target);}catch{failures.push({page:path,url});}}
 if(/DRAFT ORIENTATION|source reuse rights are unknown|Welcome to Spritual|9:41/.test(html))failures.push({page:path,problem:'Forbidden visitor copy'});
}
console.log(JSON.stringify({pages,failures},null,2));if(failures.length)process.exitCode=1;
