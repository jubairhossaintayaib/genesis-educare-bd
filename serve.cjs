const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf','.xml':'application/xml','.txt':'text/plain; charset=utf-8'};
http.createServer((req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Bad request');return;}
  if(pathname==='/')pathname='/index.html';
  if(!path.extname(pathname))pathname+='.html';
  const full=path.resolve(root,'.'+pathname);
  const allowed = full.startsWith(root+path.sep) && !pathname.split('/').some(part=>part.startsWith('.')) && (pathname.startsWith('/assets/') || ['.html','.css','.js','.xml','.txt'].includes(path.extname(full)));
  if(!allowed){res.writeHead(403);res.end('Forbidden');return;}
  fs.readFile(full,(error,data)=>{
    if(error){res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(path.join(root,'404.html')));return;}
    res.writeHead(200,{'Content-Type':mime[path.extname(full)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data);
  });
}).listen(port,'127.0.0.1',()=>console.log(`Genesis Educare: http://127.0.0.1:${port}`));
