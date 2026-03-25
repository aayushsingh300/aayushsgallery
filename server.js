const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8888;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

http.createServer((request, response) => {
    console.log(`[${request.method}] ${request.url}`);

    // Normalize URL and determine file path
    let filePath = '.' + decodeURIComponent(request.url.split('?')[0].split('#')[0]);
    if (filePath === './') {
        filePath = './index.html';
    }

    // Determine content type
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    // Read and serve file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // Try appending .html for extensionless URLs (e.g. /parkbeheer -> /parkbeheer.html)
                const htmlPath = filePath + '.html';
                fs.readFile(htmlPath, (err2, htmlContent) => {
                    if (err2) {
                        // File truly not found — return a proper 404
                        response.writeHead(404, { 'Content-Type': 'text/html' });
                        response.end('<h1>404 — Page Not Found</h1>', 'utf-8');
                    } else {
                        response.writeHead(200, { 'Content-Type': 'text/html' });
                        response.end(htmlContent, 'utf-8');
                    }
                });
            } else {
                response.writeHead(500);
                response.end(`Sorry, check with the site admin for error: ${error.code} ..\n`);
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });
}).listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop.`);
});
