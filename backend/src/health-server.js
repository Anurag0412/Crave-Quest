'use strict';

const http = require('node:http');
const { handleApiRequest } = require('./api');

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function createHealthServer(pool, { onDatabaseError = () => {}, onApiError = () => {} } = {}) {
  return http.createServer(async (request, response) => {
    let url;
    try {
      url = new URL(request.url ?? '/', 'http://localhost');
    } catch {
      sendJson(response, 400, { error: 'Bad request' });
      return;
    }
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

    if (url.pathname === '/health') {
      sendJson(response, 404, { error: 'Not found' });
      return;
    }

    await handleApiRequest(request, response, pool, { onError: onApiError });
  });
}

module.exports = { createHealthServer };
