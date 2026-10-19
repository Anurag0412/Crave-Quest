'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createPool } = require('../src/database');
const { createHealthServer } = require('../src/health-server');

test('read-only API requests work against the explicitly configured CraveQuest development database', {
  skip: process.env.CRAVEQUEST_INTEGRATION !== '1',
  timeout: 12_000,
}, async (t) => {
  assert.ok(process.env.DATABASE_URL, 'integration requires DATABASE_URL');
  const pool = createPool(process.env.DATABASE_URL);
  const server = createHealthServer(pool);
  let listening = false;
  t.after(async () => {
    if (listening) await new Promise((resolve) => server.close(() => resolve()));
    await pool.end();
  });

  const identity = await pool.query(
    "SELECT current_database() AS database, current_setting('server_version_num')::integer AS version_num",
  );
  assert.equal(identity.rows[0].database, 'cravequest_dev', 'integration is restricted to the named development database');
  assert.ok(identity.rows[0].version_num >= 150000, 'PostgreSQL 15 or newer is required');

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  listening = true;
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const outletsResponse = await fetch(`${baseUrl}/api/outlets`);
  assert.equal(outletsResponse.status, 200);
  const outlets = await outletsResponse.json();
  assert.equal(outlets.data.length, 3);
  const outlet = outlets.data.find((item) => item.slug === 'demo-juniper-table');
  assert.ok(outlet, 'seeded outlet is returned');

  const detailResponse = await fetch(`${baseUrl}/api/outlets/${outlet.id}`);
  assert.equal(detailResponse.status, 200);
  assert.equal((await detailResponse.json()).data.slug, outlet.slug);

  const menuResponse = await fetch(`${baseUrl}/api/outlets/${outlet.id}/menu?limit=100&search=rice`);
  assert.equal(menuResponse.status, 200);
  const menu = await menuResponse.json();
  assert.equal(menu.outlet.id, outlet.id);
  assert.ok(Array.isArray(menu.data));

  const recommendationResponse = await fetch(`${baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ outletId: outlet.id, preferences: {}, hardRestrictions: {} }),
  });
  assert.equal(recommendationResponse.status, 200);
  const recommendations = await recommendationResponse.json();
  assert.equal(recommendations.outlet.id, outlet.id);
  assert.ok(Array.isArray(recommendations.data));

  const analyticsResponse = await fetch(`${baseUrl}/api/outlets/${outlet.id}/analytics`);
  assert.equal(analyticsResponse.status, 200);
  assert.equal((await analyticsResponse.json()).data.outletId, outlet.id);
});
