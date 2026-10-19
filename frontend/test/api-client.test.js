'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

function withFetch(handler, callback) {
  const original = global.fetch;
  global.fetch = handler;
  delete require.cache[require.resolve('../cravequest-api')];
  const api = require('../cravequest-api');
  return Promise.resolve().then(() => callback(api)).finally(() => {
    global.fetch = original;
    delete require.cache[require.resolve('../cravequest-api')];
  });
}

test('menu requests encode supported filters and preserve the outlet scope', async () => {
  await withFetch(async (url) => {
    assert.equal(url, '/api/outlets/12/menu?search=rice+%26+beans&availability=available');
    return { ok: true, status: 200, json: async () => ({ data: [] }) };
  }, async (api) => {
    const response = await api.getMenu('12', { search: 'rice & beans', availability: 'available', maxPrice: '' });
    assert.deepEqual(response, { data: [] });
  });
});

test('recommendations use the implemented JSON request contract', async () => {
  const payload = { outletId: '12', preferences: { maxPrice: '20' }, hardRestrictions: { allergens: ['peanuts'] } };
  await withFetch(async (url, options) => {
    assert.equal(url, '/api/recommendations');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), payload);
    return { ok: true, status: 200, json: async () => ({ outlet: { id: '12' }, data: [] }) };
  }, async (api) => {
    assert.deepEqual(await api.recommend(payload), { outlet: { id: '12' }, data: [] });
  });
});

test('network and API failures are surfaced as safe client errors', async () => {
  await withFetch(async () => { throw new Error('network details'); }, async (api) => {
    await assert.rejects(api.listOutlets(), { name: 'ApiClientError', message: /Could not reach CraveQuest/ });
  });
  await withFetch(async () => ({
    ok: false,
    status: 503,
    json: async () => ({ error: { code: 'feature_unavailable', message: 'Unavailable.' } }),
  }), async (api) => {
    await assert.rejects(api.request('/api/feedback'), { status: 503, code: 'feature_unavailable', message: 'Unavailable.' });
  });
});

test('malformed success responses are rejected', async () => {
  await withFetch(async () => ({ ok: true, status: 200, json: async () => [] }), async (api) => {
    await assert.rejects(api.listOutlets(), { name: 'ApiClientError', status: 200 });
  });
});

test('parsePreferences sends prompt to AI preference endpoint', async () => {
  const prompt = 'I want spicy noodles with no peanuts under 25';
  await withFetch(async (url, options) => {
    assert.equal(url, '/api/ai/parse-preferences');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['content-type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), { prompt });
    return {
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        source: 'deterministic_fallback',
        data: { cuisine: null, hardRestrictions: { allergens: ['peanuts'] } },
      }),
    };
  }, async (api) => {
    const res = await api.parsePreferences(prompt);
    assert.equal(res.success, true);
    assert.deepEqual(res.data.hardRestrictions.allergens, ['peanuts']);
  });
});
