'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { createPool } = require('./backend/src/database');
const { handleApiRequest } = require('./backend/src/api');
const { createShutdown } = require('./backend/src/shutdown');

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';
const FRONTEND_ROOT = path.resolve(__dirname, 'frontend');
const HOME_SCREEN = path.resolve(FRONTEND_ROOT, 'stitch_cravequest_food_discovery_interface/cravequest_home_discovery/code.html');

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function sendText(response, status, message) {
  response.writeHead(status, {
    'content-type': 'text/plain; charset=utf-8',
    'x-content-type-options': 'nosniff',
  });
  response.end(message);
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function serveStaticFile(request, response, filePath) {
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      return sendText(response, 404, 'File not found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
    response.writeHead(200, {
      'content-type': contentType,
      'content-length': stat.size,
      'cache-control': 'no-cache',
      'x-content-type-options': 'nosniff',
    });
    if (request.method === 'HEAD') {
      return response.end();
    }
    fs.createReadStream(filePath).on('error', () => response.destroy()).pipe(response);
  });
}

function createUnifiedServer(pool) {
  return http.createServer(async (request, response) => {
    let url;
    try {
      url = new URL(request.url ?? '/', `http://${request.headers.host || 'localhost'}`);
    } catch {
      return sendJson(response, 400, { error: 'Bad request' });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      if (request.method !== 'GET') {
        return sendJson(response, 405, { error: 'Method not allowed' });
      }
      try {
        await pool.query('SELECT 1');
        return sendJson(response, 200, { status: 'ok', database: 'connected' });
      } catch (err) {
        console.error('Database health check failed:', err.message);
        return sendJson(response, 503, { status: 'degraded', database: 'unavailable' });
      }
    }

    // API endpoints
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, response, pool, {
        onError: () => console.error('API request error on path:', url.pathname),
      });
    }

    // Static frontend files
    if (!['GET', 'HEAD'].includes(request.method)) {
      return sendText(response, 405, 'Method not allowed');
    }

    let decodedPathname;
    try {
      decodedPathname = decodeURIComponent(url.pathname);
    } catch {
      return sendText(response, 400, 'Invalid path');
    }

    // Root home page mapping
    if (decodedPathname === '/' || decodedPathname === '/index.html') {
      return serveStaticFile(request, response, HOME_SCREEN);
    }

    // Normalize path relative to frontend directory
    let relativePath = decodedPathname.startsWith('/frontend/')
      ? decodedPathname.slice('/frontend/'.length)
      : decodedPathname.startsWith('/')
        ? decodedPathname.slice(1)
        : decodedPathname;

    const targetFile = path.resolve(FRONTEND_ROOT, relativePath);

    // Guard against directory traversal
    if (!targetFile.startsWith(FRONTEND_ROOT)) {
      return sendText(response, 403, 'Forbidden');
    }

    // If file exists under frontend/, serve it
    fs.stat(targetFile, (err, stat) => {
      if (!err && stat.isFile()) {
        return serveStaticFile(request, response, targetFile);
      }
      // Fallback for directory request with index.html or code.html
      if (!err && stat.isDirectory()) {
        const indexCandidate = path.join(targetFile, 'code.html');
        fs.stat(indexCandidate, (err2, stat2) => {
          if (!err2 && stat2.isFile()) {
            return serveStaticFile(request, response, indexCandidate);
          }
          return sendText(response, 404, 'Not found');
        });
        return;
      }

      // Check root directory for static files (e.g., favicon)
      const rootCandidate = path.resolve(__dirname, relativePath);
      if (rootCandidate.startsWith(__dirname) && fs.existsSync(rootCandidate) && fs.statSync(rootCandidate).isFile()) {
        return serveStaticFile(request, response, rootCandidate);
      }

      return sendText(response, 404, 'Not found');
    });
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL || null;
  const pool = createPool(databaseUrl, {
    onIdleClientError: () => console.error('Idle database connection error.'),
  });

  const server = createUnifiedServer(pool);

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  console.log(`CraveQuest unified server listening on http://${HOST}:${PORT}`);

  const shutdown = createShutdown(server, pool, {
    onError: (msg) => {
      console.error(msg);
      process.exitCode = 1;
    },
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      console.log(`Received ${signal}; stopping server...`);
      void shutdown(signal);
    });
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
  });
}

module.exports = { createUnifiedServer, main };
