import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve(import.meta.dirname, 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml','.png':'image/png'};
createServer(async (req,res) => {
 try {
  let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if(path !== root && !path.startsWith(root+sep)) throw Error('Outside root');
  try { if((await stat(path)).isDirectory()) path = resolve(path,'index.html'); } catch {}
  let body; try { body=await readFile(path); } catch { res.statusCode=404; path=resolve(root,'404.html'); body=await readFile(path); }
  res.setHeader('Content-Type',types[extname(path)] || 'application/octet-stream');
  res.setHeader('Cache-Control','no-store'); res.end(body);
 } catch { res.writeHead(400); res.end('Bad request'); }
}).listen(4190,'127.0.0.1',()=>console.log('Spritual website: http://127.0.0.1:4190'));
