'use strict';

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');

const ROOT = __dirname;
const PORT = Number(process.env.FRONTEND_PORT || 4173);
const API_ORIGIN = process.env.CRAVEQUEST_API_ORIGIN || 'http://127.0.0.1:3000';
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function send(response, status, message) {
  response.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', 'x-content-type-options': 'nosniff' });
  response.end(message);
}

function proxy(request, response, url) {
  const target = new URL(url.pathname + url.search, API_ORIGIN);
  const transport = target.protocol === 'https:' ? https : http;
  const upstream = transport.request(target, {
    method: request.method,
    headers: {
      'content-type': request.headers['content-type'] || 'application/octet-stream',
      accept: request.headers.accept || 'application/json',
    },
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode || 502, {
      'content-type': upstreamResponse.headers['content-type'] || 'application/json; charset=utf-8',
      'cache-control': upstreamResponse.headers['cache-control'] || 'no-store',
      'x-content-type-options': 'nosniff',
    });
    upstreamResponse.pipe(response);
  });
  upstream.setTimeout(10000, () => upstream.destroy(new Error('API request timed out')));
  upstream.on('error', () => {
    if (!response.headersSent) send(response, 502, 'CraveQuest API is unavailable. Start the backend and try again.');
    else response.destroy();
  });
  request.pipe(upstream);
}

function createServer() {
  let apiOrigin;
  try {
    apiOrigin = new URL(API_ORIGIN);
  } catch {
    throw new Error('CRAVEQUEST_API_ORIGIN must be a valid HTTP URL.');
  }
  if (!['http:', 'https:'].includes(apiOrigin.protocol)) throw new Error('CRAVEQUEST_API_ORIGIN must use HTTP or HTTPS.');
  if (apiOrigin.username || apiOrigin.password || apiOrigin.search || apiOrigin.hash || apiOrigin.pathname !== '/') {
    throw new Error('CRAVEQUEST_API_ORIGIN must be an HTTP origin without credentials or a path.');
  }

  return http.createServer((request, response) => {
    let url;
    try {
      url = new URL(request.url || '/', 'http://localhost');
    } catch {
      return send(response, 400, 'Invalid request URL.');
    }
    if (url.pathname.startsWith('/api/')) return proxy(request, response, url);
    if (!['GET', 'HEAD'].includes(request.method)) return send(response, 405, 'Method not allowed.');

    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return send(response, 400, 'Invalid path.');
    }
    if (pathname === '/') pathname = '/stitch_cravequest_food_discovery_interface/cravequest_home_discovery/code.html';
    const absolute = path.resolve(ROOT, `.${pathname}`);
    if (absolute !== ROOT && !absolute.startsWith(`${ROOT}${path.sep}`)) return send(response, 404, 'Not found.');
    fs.stat(absolute, (error, stat) => {
      if (error || !stat.isFile()) return send(response, 404, 'Not found.');
      response.writeHead(200, {
        'content-type': CONTENT_TYPES[path.extname(absolute).toLowerCase()] || 'application/octet-stream',
        'x-content-type-options': 'nosniff',
        'cache-control': 'no-cache',
      });
      if (request.method === 'HEAD') return response.end();
      fs.createReadStream(absolute).on('error', () => response.destroy()).pipe(response);
    });
  });
}

if (require.main === module) {
  try {
    const server = createServer();
    server.listen(PORT, () => console.log(`CraveQuest frontend preview listening on port ${PORT}.`));
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => server.close(() => process.exit(0)));
    }
  } catch (error) {
    console.error(`Frontend preview failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { createServer };
