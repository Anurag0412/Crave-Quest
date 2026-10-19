'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

function listen(server) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      server.removeListener('error', reject);
      resolve(server.address().port);
    });
  });
}

function close(server) {
  return new Promise((resolve) => server.close(resolve));
}

test('frontend preview serves the existing home screen and proxies API paths', async () => {
  const previousApiOrigin = process.env.CRAVEQUEST_API_ORIGIN;
  const backend = http.createServer((request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ method: request.method, url: request.url, data: [] }));
  });
  const backendPort = await listen(backend);
  process.env.CRAVEQUEST_API_ORIGIN = `http://127.0.0.1:${backendPort}`;
  delete require.cache[require.resolve('../dev-server')];
  const { createServer } = require('../dev-server');
  const frontend = createServer();
  const frontendPort = await listen(frontend);
  try {
    const home = await fetch(`http://127.0.0.1:${frontendPort}/`);
    assert.equal(home.status, 200);
    assert.match(home.headers.get('content-type'), /text\/html/);
    assert.match(await home.text(), /data-cq-screen="home"/);

    const proxied = await fetch(`http://127.0.0.1:${frontendPort}/api/outlets?page=1`);
    assert.equal(proxied.status, 200);
    assert.deepEqual(await proxied.json(), { method: 'GET', url: '/api/outlets?page=1', data: [] });
  } finally {
    await close(frontend);
    await close(backend);
    if (previousApiOrigin === undefined) delete process.env.CRAVEQUEST_API_ORIGIN;
    else process.env.CRAVEQUEST_API_ORIGIN = previousApiOrigin;
    delete require.cache[require.resolve('../dev-server')];
  }
});
