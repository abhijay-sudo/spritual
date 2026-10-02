import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const editorial=process.argv.includes('--editorial-preview');
const sanatan=process.argv.includes('--sanatan-preview');
if(editorial&&sanatan)throw Error('Choose one preview mode.');
const port=editorial?4191:sanatan?4192:4190;
const root = resolve(import.meta.dirname, editorial?'../artifacts/editorial-site':sanatan?'../artifacts/sanatan-site':'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain','.xml':'application/xml','.png':'image/png'};
createServer(async (req,res) => {
 try {
  let path = resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if(path !== root && !path.startsWith(root+sep)) throw Error('Outside root');
  try { if((await stat(path)).isDirectory()) path = resolve(path,'index.html'); } catch {}
  let body; try { body=await readFile(path); } catch { res.statusCode=404; path=resolve(root,'404.html'); body=await readFile(path); }
  res.setHeader('Content-Type',types[extname(path)] || 'application/octet-stream');
  res.setHeader('Cache-Control','no-store'); res.end(body);
 } catch { res.writeHead(400); res.end('Bad request'); }
}).listen(port,'127.0.0.1',()=>console.log(`Spritual website: http://127.0.0.1:${port}`));
