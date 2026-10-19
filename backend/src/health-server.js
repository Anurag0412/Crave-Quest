'use strict';

const http = require('node:http');

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function createHealthServer(pool, { onDatabaseError = () => {} } = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');
    if (request.method === 'GET' && url.pathname === '/health') {
      try {
        await pool.query('SELECT 1');
        sendJson(response, 200, { status: 'ok', database: 'connected' });
      } catch {
        onDatabaseError();
        sendJson(response, 503, { status: 'degraded', database: 'unavailable' });
      }
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });
}

module.exports = { createHealthServer };
