'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHealthServer } = require('../src/health-server');

const outlet = {
  id: '7', slug: 'demo-copper-tiffin', name: 'Copper Tiffin', cuisine_type: 'South Indian',
  address_line: '204 Cedar Street', city: 'Austin', region: 'TX', postal_code: '78701',
  country_code: 'US', time_zone: 'America/Chicago', is_active: true,
};

const entry = {
  outlet_id: '7', outlet_slug: outlet.slug, outlet_name: outlet.name, cuisine_type: outlet.cuisine_type,
  time_zone: outlet.time_zone, menu_id: '12', menu_name: 'Copper Tiffin Lunch', service_period: 'lunch',
  dish_id: '34', dish_name: 'Lemon Rice & Lentil Bowl', description: 'Rice with lentils.', category: 'main',
  ingredient_data_status: 'partial', ingredient_data_source: null, ingredient_data_checked_at: null,
  price: '13.00', currency_code: 'USD', availability_status: 'available',
  ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'unverified' }],
  allergen_links: [], dietary_tags: [], allergen_data_status: 'unknown', dietary_data_status: 'unknown',
};

async function withApi(pool, callback) {
  const server = createHealthServer(pool);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function jsonResponse(status, rows) {
  return { rowCount: rows.length, rows };
}

test('lists active outlets with validated pagination', async () => {
  const calls = [];
  const pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      return sql.includes('count(*)')
        ? jsonResponse(200, [{ total: 1 }])
        : jsonResponse(1, [outlet]);
    },
  };
  await withApi(pool, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/outlets?page=1&limit=1`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data[0].id, outlet.id);
    assert.equal(body.data[0].cuisineType, 'South Indian');
    assert.deepEqual(body.pagination, { page: 1, pageSize: 1, total: 1, pageCount: 1 });
  });
  assert.deepEqual(calls[1].values, [1, 0]);
});

test('returns a safe 404 for an unknown outlet and a 400 for an invalid identifier', async () => {
  const pool = { async query() { return jsonResponse(0, []); } };
  await withApi(pool, async (baseUrl) => {
    const missing = await fetch(`${baseUrl}/api/outlets/999`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: { code: 'outlet_not_found', message: 'Outlet was not found.' } });
    const invalid = await fetch(`${baseUrl}/api/outlets/0`);
    assert.equal(invalid.status, 400);
    assert.equal((await invalid.json()).error.code, 'invalid_identifier');
  });
});

test('menu search and filters remain parameterized and outlet scoped', async () => {
  const calls = [];
  const pool = {
    async query(sql, values = []) {
      calls.push({ sql, values });
      if (sql.includes('FROM outlets') && sql.includes('WHERE id =')) return jsonResponse(1, [outlet]);
      if (sql.startsWith('SELECT cuisine_type FROM outlets')) return jsonResponse(1, [{ cuisine_type: 'South Indian' }]);
      if (sql.startsWith('SELECT category FROM dishes')) return jsonResponse(1, [{ category: 'main' }]);
      if (sql.startsWith('SELECT name FROM ingredients')) return jsonResponse(1, [{ name: 'lentil' }]);
      if (sql.startsWith('SELECT name FROM allergens')) return jsonResponse(1, [{ name: 'peanuts' }]);
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 1 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(1, [entry]);
      throw new Error('Unexpected test query');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const search = encodeURIComponent("rice%' OR 1=1 --");
    const response = await fetch(`${baseUrl}/api/outlets/7/menu?search=${search}&category=main&maxPrice=20&excludeIngredient=lentil`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.outlet.id, '7');
    assert.equal(body.data[0].dish.name, entry.dish_name);
    assert.equal(body.data[0].dish.allergens.dataStatus, 'unknown');
    assert.ok(body.warnings.includes('ingredient_data_incomplete'));
  });
  const selection = calls.find((call) => call.sql.includes('LIMIT $'));
  assert.match(selection.sql, /o\.id = \$1/);
  assert.match(selection.sql, /d\.outlet_id = md\.outlet_id/);
  assert.ok(selection.values.includes("rice\\%' OR 1=1 --"));
  assert.ok(!selection.sql.includes("rice%' OR 1=1 --"));
  assert.match(selection.sql, /AND EXISTS \(\s*SELECT 1 FROM dish_ingredients di\s*WHERE di\.dish_id = d\.id/);
  assert.match(selection.sql, /d\.ingredient_data_status = 'verified_complete'/);
});

test('returns 400 for invalid pagination, 415 for non-JSON, and 404 for unknown routes', async () => {
  const pool = { async query() { return jsonResponse(0, []); } };
  await withApi(pool, async (baseUrl) => {
    const pagination = await fetch(`${baseUrl}/api/outlets?page=0`);
    assert.equal(pagination.status, 400);
    const contentType = await fetch(`${baseUrl}/api/recommendations`, { method: 'POST', body: '{}' });
    assert.equal(contentType.status, 415);
    const malformed = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: '{',
    });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).error.code, 'malformed_json');
    const unknown = await fetch(`${baseUrl}/api/not-a-route`);
    assert.equal(unknown.status, 404);
  });
});

test('returns 404 when a dish has no active, currently available published listing', async () => {
  const pool = { async query() { return jsonResponse(0, []); } };
  await withApi(pool, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/dishes/999`);
    assert.equal(response.status, 404);
    assert.equal((await response.json()).error.code, 'dish_not_found');
  });
});

test('recommendations fail closed for unverified allergy data before ranking', async () => {
  const calls = [];
  const pool = {
    async query(sql, values = []) {
      calls.push({ sql, values });
      if (sql.includes('FROM outlets') && sql.includes('WHERE id =')) return jsonResponse(1, [outlet]);
      if (sql.startsWith('SELECT cuisine_type FROM outlets')) return jsonResponse(1, [{ cuisine_type: 'South Indian' }]);
      if (sql.startsWith('SELECT category FROM dishes')) return jsonResponse(1, [{ category: 'main' }]);
      if (sql.startsWith('SELECT name FROM allergens')) return jsonResponse(1, [{ name: 'peanuts' }]);
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 1 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(1, [entry]);
      throw new Error('Unexpected test query');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        outletId: 7,
        preferences: { cuisineTypes: ['South Indian'], categories: ['main'], maxPrice: 15 },
        hardRestrictions: { allergens: ['peanuts'] },
      }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.data, []);
    assert.equal(body.totalAvailableCount, 1);
    assert.equal(body.excludedCount, 1);
    assert.ok(body.warnings.includes('allergen_safety_cannot_be_verified'));
  });
  assert.ok(calls.every((call) => !/^\s*(INSERT|UPDATE|DELETE|TRUNCATE|DROP)\b/i.test(call.sql)));
});

test('hard ingredient exclusions are applied before soft preference ranking', async () => {
  const completeWithoutTarget = {
    ...entry,
    dish_id: '35',
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Vendor declaration',
    ingredient_data_checked_at: '2026-01-01T00:00:00Z',
    ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified' }],
  };
  const emptyIngredientList = {
    ...completeWithoutTarget,
    dish_id: '36',
    ingredients: [],
  };
  const preferenceMatchButExcluded = {
    ...entry,
    ingredient_data_status: 'verified_complete',
    ingredient_data_source: 'Vendor declaration',
    ingredient_data_checked_at: '2026-01-01T00:00:00Z',
    ingredients: [{ name: 'lentil', presenceStatus: 'contains', verificationStatus: 'verified' }],
  };
  const pool = {
    async query(sql) {
      if (sql.includes('FROM outlets') && sql.includes('WHERE id =')) return jsonResponse(1, [outlet]);
      if (sql.startsWith('SELECT cuisine_type FROM outlets')) return jsonResponse(1, [{ cuisine_type: 'South Indian' }]);
      if (sql.startsWith('SELECT category FROM dishes')) return jsonResponse(1, [{ category: 'main' }]);
      if (sql.startsWith('SELECT name FROM ingredients')) return jsonResponse(1, [{ name: 'lentil' }]);
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 3 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(3, [preferenceMatchButExcluded, emptyIngredientList, completeWithoutTarget]);
      throw new Error('Unexpected test query');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        outletId: 7,
        preferences: { cuisineTypes: ['South Indian'], categories: ['main'], maxPrice: 15 },
        hardRestrictions: { ingredients: ['lentil'] },
      }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].dish.id, '35');
    assert.deepEqual(body.data[0].reasons, ['cuisine_match', 'category_match', 'within_budget']);
    assert.equal(body.excludedCount, 2);
    assert.ok(body.warnings.includes('ingredient_data_incomplete_for_exclusion'));
  });
});

test('verified dietary tags satisfy hard dietary requirements; missing or unverified tags fail closed', async () => {
  const calls = [];
  const verified = {
    ...entry,
    dish_id: '40',
    dietary_tags: [{ slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'verified' }],
    dietary_data_status: 'partial',
  };
  const unverified = {
    ...entry,
    dish_id: '41',
    dietary_tags: [{ slug: 'demo-vegan', label: 'Vegan', verificationStatus: 'unverified' }],
    dietary_data_status: 'unverified',
  };
  const pool = {
    async query(sql, values) {
      calls.push({ sql, values });
      if (sql.includes('FROM outlets') && sql.includes('WHERE id =')) return jsonResponse(1, [outlet]);
      if (sql.startsWith('SELECT slug FROM dietary_tags')) return jsonResponse(1, [{ slug: 'demo-vegan' }]);
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 3 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(3, [verified, unverified, entry]);
      throw new Error('Unexpected test query');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ outletId: 7, hardRestrictions: { dietaryTags: ['demo-vegan'] } }),
    });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body.data.map((item) => item.dish.id), ['40']);
    assert.ok(body.data[0].reasons.includes('dietary_tag_match:demo-vegan'));
    assert.equal(body.excludedCount, 2);
    assert.ok(body.warnings.includes('dietary_tag_requirement_cannot_be_verified'));
  });
  assert.ok(calls.some((call) => call.sql.startsWith('SELECT slug FROM dietary_tags')));
});

test('feedback and discovery writes return the same unavailable error and never query the database', async () => {
  const calls = [];
  const pool = {
    async query(sql) {
      calls.push(sql);
      if (sql.includes('WHERE id =')) return jsonResponse(1, [outlet]);
      if (sql.includes('GROUP BY feedback')) return jsonResponse(0, []);
      if (sql.includes('confirmed_discoveries')) return jsonResponse(1, [{ count: 0 }]);
      throw new Error('Unexpected test query');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const unavailable = { error: { code: 'feature_unavailable', message: 'Feedback and discovery writes are unavailable until authentication is implemented.' } };
    const feedback = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 2, outletId: 7, menuId: 12, dishId: 34, feedback: 'liked' }),
    });
    assert.equal(feedback.status, 503);
    assert.deepEqual(await feedback.json(), unavailable);

    const discovery = await fetch(`${baseUrl}/api/discoveries`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userId: 2, dishId: 34, notes: 'tried' }),
    });
    assert.equal(discovery.status, 503);
    assert.deepEqual(await discovery.json(), unavailable);
    assert.equal(calls.length, 0);

    const analytics = await fetch(`${baseUrl}/api/outlets/7/analytics`);
    assert.equal(analytics.status, 200);
    const body = await analytics.json();
    assert.equal(body.data.feedback.total, 0);
    assert.equal(body.data.confirmedDiscoveries, 0);
    assert.ok(calls.every((sql) => /^\s*SELECT\b/i.test(sql)));
  });
});

test('preserves health response and does not expose database errors on API failures', async () => {
  const pool = {
    async query(sql) {
      if (sql === 'SELECT 1') return jsonResponse(1, [{ '?column?': 1 }]);
      throw new Error('private SQL and connection details');
    },
  };
  await withApi(pool, async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { status: 'ok', database: 'connected' });
    const failed = await fetch(`${baseUrl}/api/outlets`);
    assert.equal(failed.status, 500);
    const body = await failed.text();
    assert.deepEqual(JSON.parse(body), { error: { code: 'internal_error', message: 'Request could not be completed.' } });
    assert.doesNotMatch(body, /private SQL|connection details/);
  });
});
