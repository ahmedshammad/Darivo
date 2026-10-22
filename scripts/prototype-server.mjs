import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = process.cwd();
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webm': 'video/webm',
};
createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path === '/') path = '/prototypes/index.html';
    const allowed = [
      '/data/reference/',
      '/prototypes/',
      '/public/',
      '/docs/reviews/stage-0/media/',
      '/node_modules/maplibre-gl/dist/',
    ];
    if (!allowed.some((prefix) => path.startsWith(prefix))) throw Error('not_found');
    let file = resolve(root, '.' + path);
    if (
      !file.startsWith(root + sep) ||
      !allowed.some((prefix) => file.startsWith(resolve(root, '.' + prefix) + sep))
    )
      throw Error('not_found');
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    res.writeHead(200, {
      'Content-Type': mime[extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(await readFile(file));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}).listen(6006, '127.0.0.1', () => console.info('Stage 0 prototypes: http://localhost:6006'));
