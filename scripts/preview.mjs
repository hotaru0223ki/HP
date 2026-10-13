import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
// The additional local mount exercises GitHub Pages repository subpaths.
const projectPrefix = '/portfolio-work-kit/';
const server = http.createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.startsWith(projectPrefix)) pathname = pathname.slice(projectPrefix.length - 1);
    if (pathname.endsWith('/')) pathname += 'index.html';
    const filename = path.resolve(directory, '.' + pathname);
    if (!filename.startsWith(directory) || !(await stat(filename)).isFile()) throw new Error('Not found');
    const body = await readFile(filename);
    response.writeHead(200, { 'Content-Type': types[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch {
    const body = await readFile(path.join(directory, '404.html'));
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/\nGitHub Pages subpath check: http://127.0.0.1:${port}${projectPrefix}`));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
