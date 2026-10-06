import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root = resolve('dist');
const security = Object.fromEntries((await readFile(resolve(root, '_headers'), 'utf8')).split('\n').filter(line=>line.startsWith('  ')).map(line=>{const at=line.indexOf(':');return [line.slice(0,at).trim(),line.slice(at+1).trim()];}));
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.txt':'text/plain','.json':'application/json'};
http.createServer(async (req,res)=>{
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const path = resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!path.startsWith(root + '/')) { res.writeHead(403); res.end(); return; }
    const body = await readFile(path);
    res.writeHead(200, {'Content-Type':types[extname(path)] || 'application/octet-stream','Cache-Control':'no-cache',...security}); res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
