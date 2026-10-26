import { createReadStream } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };

createServer((request, response) => {
  const path = request.url === '/' ? 'index.html' : request.url.slice(1).split('?')[0];
  response.setHeader('Content-Type', `${types[extname(path)] || 'application/octet-stream'}; charset=utf-8`);
  createReadStream(join(process.cwd(), path)).on('error', () => {
    response.statusCode = 404;
    response.end('Not found');
  }).pipe(response);
}).listen(4173, () => console.log('Beyond em http://localhost:4173'));
