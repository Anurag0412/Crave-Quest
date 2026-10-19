'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHealthServer } = require('../src/health-server');
const { createShutdown } = require('../src/shutdown');

async function withServer(pool, callback) {
  const server = createHealthServer(pool);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const { port } = server.address();
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('health reports connected database status', async () => {
  await withServer({ query: async () => ({ rows: [{ '?column?': 1 }] }) }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', database: 'connected' });
  });
});

test('health returns a sanitized 503 when the database is unavailable', async () => {
  await withServer({ query: async () => { throw new Error('private connection details'); } }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 503);
    const body = await response.text();
    assert.deepEqual(JSON.parse(body), { status: 'degraded', database: 'unavailable' });
    assert.doesNotMatch(body, /private connection details/);
  });
});

test('shutdown force-closes a stalled health request and bounds a stuck pool close', { timeout: 1_500 }, async (t) => {
  let queryStartedResolve;
  const queryStarted = new Promise((resolve) => { queryStartedResolve = resolve; });
  const pool = {
    query() {
      queryStartedResolve();
      return new Promise(() => {});
    },
    end() { return new Promise(() => {}); },
  };
  const server = createHealthServer(pool);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => {
    server.closeAllConnections?.();
    server.close();
  });

  const request = fetch(`http://127.0.0.1:${server.address().port}/health`)
    .then((response) => response, (error) => error);
  await queryStarted;

  let forcedExitSignal;
  const shutdown = createShutdown(server, pool, {
    gracePeriodMs: 30,
    poolCloseTimeoutMs: 30,
    onHardTimeout: (signal) => { forcedExitSignal = signal; },
  });
  const firstShutdown = shutdown('SIGTERM');
  assert.equal(shutdown('SIGINT'), firstShutdown, 'repeated signals reuse the same shutdown');

  let timeout;
  try {
    await Promise.race([
      firstShutdown,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('shutdown exceeded test bound')), 500);
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
  assert.equal(forcedExitSignal, 'SIGTERM');
  assert.ok((await request) instanceof Error, 'forced socket close terminates the in-flight request');
});
