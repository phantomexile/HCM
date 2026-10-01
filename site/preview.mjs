import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = { '.html': 'text/html; charset=UTF-8', '.css': 'text/css; charset=UTF-8', '.mjs': 'text/javascript; charset=UTF-8', '.svg': 'image/svg+xml', '.png':'image/png', '.ttf':'font/ttf' };
/** Máy chủ xem trước chỉ đọc tệp trong dist; không để lộ tài liệu hay đường dẫn ngoài thư mục. */
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
    const url = new URL(request.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root) || pathname.includes('\\')) { response.writeHead(403); response.end(); return; }
    const data = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' }); response.end('Không tìm thấy trang.'); }
});
server.listen(4173, '127.0.0.1', () => console.log('Phòng giải mã: http://127.0.0.1:4173'));
server.on('error', error => { console.error('Không mở được trang xem trước:', error.message); process.exitCode = 1; });
