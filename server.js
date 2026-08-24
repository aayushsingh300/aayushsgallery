const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PARKIN_PORT) || 8888;

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
            // EISDIR: a clean URL such as /penknife matches an asset
            // directory of the same name. Vercel serves penknife.html there,
            // so the dev server has to resolve it the same way.
            if (error.code === 'ENOENT' || error.code === 'EISDIR') {
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
            const headers = {
                'Content-Type': contentType,
                'Content-Length': content.length
            };

            // Browsers (especially Safari and embedded previews) request MP4s
            // in byte ranges so they can begin decoding before the full file
            // has downloaded. Returning 200 for a Range request can leave the
            // video parked on its first frame.
            if (extname === '.mp4') {
                headers['Accept-Ranges'] = 'bytes';
                const range = request.headers.range;

                if (range) {
                    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
                    let start = match && match[1] ? Number(match[1]) : 0;
                    let end = match && match[2] ? Number(match[2]) : content.length - 1;

                    // A suffix range (for example bytes=-500) asks for the
                    // final 500 bytes rather than bytes 0 through 500.
                    if (match && !match[1] && match[2]) {
                        const suffixLength = Number(match[2]);
                        start = Math.max(0, content.length - suffixLength);
                        end = content.length - 1;
                    }

                    if (!match || (!match[1] && !match[2]) || start > end || end >= content.length) {
                        response.writeHead(416, {
                            'Content-Range': `bytes */${content.length}`,
                            'Accept-Ranges': 'bytes'
                        });
                        response.end();
                        return;
                    }

                    const chunk = content.subarray(start, end + 1);
                    response.writeHead(206, {
                        ...headers,
                        'Content-Length': chunk.length,
                        'Content-Range': `bytes ${start}-${end}/${content.length}`
                    });
                    response.end(request.method === 'HEAD' ? undefined : chunk);
                    return;
                }
            }

            response.writeHead(200, headers);
            response.end(request.method === 'HEAD' ? undefined : content);
        }
    });
}).listen(PORT, () => {
    console.log(`Static server running at http://localhost:${PORT}/`);
    console.log(`Press Ctrl+C to stop.`);
});
