'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createHealthServer } = require('../src/health-server');
const { parseNaturalLanguagePreferences, deterministicParse } = require('../src/ai-assistant');

const outletA = {
  id: '10', slug: 'demo-outlet-a', name: 'Outlet A', cuisine_type: 'Modern American',
  address_line: '100 Main St', city: 'Portland', region: 'OR', postal_code: '97201',
  country_code: 'US', time_zone: 'America/Los_Angeles', is_active: true,
};

const outletB = {
  id: '20', slug: 'demo-outlet-b', name: 'Outlet B', cuisine_type: 'South Indian',
  address_line: '200 Oak St', city: 'Austin', region: 'TX', postal_code: '78701',
  country_code: 'US', time_zone: 'America/Chicago', is_active: true,
};

async function withApi(pool, callback) {
  const server = createHealthServer(pool);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

function jsonResponse(status, rows) {
  return { rowCount: rows.length, rows };
}

// ---------------------------------------------------------------------------
// Scenario 1: Thai cuisine, budget range (exclusive), restaurant & peanut allergy
// ---------------------------------------------------------------------------
test('Test 1 — Thai cuisine, budget range, restaurant and peanut allergy', async () => {
  // 1A: Non-existent restaurant (Tim Hortons) must return 404 outlet_not_found
  const poolNoRestaurant = {
    async query(sql) {
      if (sql.includes('FROM outlets') && sql.includes('slug ILIKE $1 OR name ILIKE $1')) {
        return jsonResponse(0, []);
      }
      return jsonResponse(0, []);
    },
  };

  await withApi(poolNoRestaurant, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        restaurant: 'Tim Hortons',
        preferences: { cuisine: 'Thai' },
        hardRestrictions: {
          allergens: ['peanuts'],
          minPrice: '1000',
          maxPrice: '1700',
          minPriceExclusive: true,
          maxPriceExclusive: true,
        },
      }),
    });
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.error.code, 'outlet_not_found');
    assert.match(body.error.message, /Tim Hortons/);
  });

  // 1B: If outlet exists, strictly enforce exclusive price boundaries and peanut safety
  const timHortons = { ...outletA, id: '99', name: 'Tim Hortons', cuisine_type: 'Canadian' };
  const candidatePrices = [
    {
      outlet_id: '99', menu_id: '1', dish_id: '101', dish_name: 'Priced 1000', price: '1000.00',
      currency_code: 'USD', availability_status: 'available', cuisine_type: 'Canadian', category: 'main',
      ingredient_data_status: 'verified_complete', ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified' }],
      allergen_links: [], dietary_tags: [], allergen_data_status: 'complete', dietary_data_status: 'complete',
    },
    {
      outlet_id: '99', menu_id: '1', dish_id: '102', dish_name: 'Priced 1500 (Eligible)', price: '1500.00',
      currency_code: 'USD', availability_status: 'available', cuisine_type: 'Canadian', category: 'main',
      ingredient_data_status: 'verified_complete', ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified' }],
      allergen_links: [], dietary_tags: [], allergen_data_status: 'complete', dietary_data_status: 'complete',
    },
    {
      outlet_id: '99', menu_id: '1', dish_id: '103', dish_name: 'Priced 1700', price: '1700.00',
      currency_code: 'USD', availability_status: 'available', cuisine_type: 'Canadian', category: 'main',
      ingredient_data_status: 'verified_complete', ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified' }],
      allergen_links: [], dietary_tags: [], allergen_data_status: 'complete', dietary_data_status: 'complete',
    },
    {
      outlet_id: '99', menu_id: '1', dish_id: '104', dish_name: 'Priced 1500 with Peanuts', price: '1500.00',
      currency_code: 'USD', availability_status: 'available', cuisine_type: 'Canadian', category: 'main',
      ingredient_data_status: 'verified_complete', ingredients: [{ name: 'peanut sauce', presenceStatus: 'contains', verificationStatus: 'verified' }],
      allergen_links: [{ name: 'peanuts', verificationStatus: 'verified', ingredientName: 'peanut sauce', presenceStatus: 'contains' }],
      dietary_tags: [], allergen_data_status: 'complete', dietary_data_status: 'complete',
    },
  ];

  const poolWithTimHortons = {
    async query(sql) {
      if (sql.includes('FROM outlets') && sql.includes('slug ILIKE $1 OR name ILIKE $1')) {
        return jsonResponse(1, [timHortons]);
      }
      if (sql.includes('FROM outlets') && sql.includes('WHERE id =')) {
        return jsonResponse(1, [timHortons]);
      }
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: candidatePrices.length }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(candidatePrices.length, candidatePrices);
      if (sql.startsWith('SELECT name FROM allergens')) return jsonResponse(1, [{ name: 'peanuts' }]);
      return jsonResponse(0, []);
    },
  };

  await withApi(poolWithTimHortons, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        restaurant: 'Tim Hortons',
        preferences: { cuisine: 'Thai' }, // soft preference, optional
        hardRestrictions: {
          allergens: ['peanuts'],
          minPrice: '1000',
          maxPrice: '1700',
          minPriceExclusive: true,
          maxPriceExclusive: true,
        },
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    // 1000 excluded (not > 1000)
    // 1700 excluded (not < 1700)
    // 1500 with peanuts excluded
    // Only 1500 eligible without peanuts is returned!
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].dish.id, '102');
    assert.equal(body.data[0].price, '1500.00');
    assert.equal(body.excludedCount, 3);
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: Only cuisine specified
// ---------------------------------------------------------------------------
test('Test 2 — Only cuisine specified', async () => {
  const thaiDish = {
    outlet_id: '10', menu_id: '1', dish_id: '201', dish_name: 'Pad Thai', price: '14.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Thai', category: 'main',
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };
  const americanDish = {
    outlet_id: '10', menu_id: '1', dish_id: '202', dish_name: 'Burger', price: '12.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };

  const pool = {
    async query(sql) {
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 2 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(2, [thaiDish, americanDish]);
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        preferences: { cuisine: 'Thai' },
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.length, 2);
    // Thai dish ranked first due to cuisine_match bonus
    assert.equal(body.data[0].dish.name, 'Pad Thai');
    assert.ok(body.data[0].reasons.includes('cuisine_match'));
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: Calorie target and budget
// ---------------------------------------------------------------------------
test('Test 3 — Calorie target and budget', async () => {
  const candidateCloseCal = {
    outlet_id: '10', menu_id: '1', dish_id: '301', dish_name: 'Balanced Bowl (590 kcal)', price: '450.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: 590, protein: 25, status: 'verified' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };
  const candidateFarCal = {
    outlet_id: '10', menu_id: '1', dish_id: '302', dish_name: 'Heavy Feast (1100 kcal)', price: '480.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: 1100, protein: 30, status: 'verified' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };
  const candidateNoCal = {
    outlet_id: '10', menu_id: '1', dish_id: '303', dish_name: 'Mystery Dish (missing calories)', price: '400.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: null, protein: null, status: 'missing' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };
  const candidateOverBudget = {
    outlet_id: '10', menu_id: '1', dish_id: '304', dish_name: 'Over Budget', price: '550.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: 600, protein: 20, status: 'verified' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };

  const pool = {
    async query(sql) {
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 4 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(4, [candidateCloseCal, candidateFarCal, candidateNoCal, candidateOverBudget]);
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        preferences: { targetCalories: 600 },
        hardRestrictions: { maxPrice: '500', maxPriceExclusive: false }, // max price 500 inclusive
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.excludedCount, 1); // 550.00 over 500 budget excluded
    assert.equal(body.data.length, 3);
    // 590 kcal is closest to 600 kcal target -> ranked top
    assert.equal(body.data[0].dish.id, '301');
    assert.ok(body.data[0].reasons.includes('calorie_target_match'));
    // Missing nutrition dish explains unevaluated status
    const uncalibrated = body.data.find((d) => d.dish.id === '303');
    assert.ok(uncalibrated.reasons.includes('calorie_preference_unevaluated_missing_data'));
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: Allergy with unknown ingredients (Candidates A, B, C, D)
// ---------------------------------------------------------------------------
test('Test 4 — Allergy with unknown ingredients', async () => {
  const candidateA = {
    dish_id: '401', dish_name: 'Candidate A (Verified Complete, No Peanuts)', price: '20.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredients: [
      { name: 'organic greens', presenceStatus: 'contains', verificationStatus: 'verified' },
      { name: 'olive oil', presenceStatus: 'contains', verificationStatus: 'verified' },
    ],
    allergen_links: [],
    dietary_tags: [],
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  };
  const candidateB = {
    dish_id: '402', dish_name: 'Candidate B (Incomplete ingredients)', price: '18.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'partial',
    ingredients: [{ name: 'rice', presenceStatus: 'contains', verificationStatus: 'verified' }],
    allergen_links: [],
    dietary_tags: [],
    allergen_data_status: 'unknown',
    dietary_data_status: 'unknown',
  };
  const candidateC = {
    dish_id: '403', dish_name: 'Candidate C (Unverified ingredient data)', price: '15.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredients: [{ name: 'spices', presenceStatus: 'contains', verificationStatus: 'unverified' }],
    allergen_links: [],
    dietary_tags: [],
    allergen_data_status: 'unverified',
    dietary_data_status: 'unknown',
  };
  const candidateD = {
    dish_id: '404', dish_name: 'Candidate D (Contains Peanuts)', price: '22.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'verified_complete',
    ingredients: [{ name: 'peanut butter', presenceStatus: 'contains', verificationStatus: 'verified' }],
    allergen_links: [{ name: 'peanuts', verificationStatus: 'verified', ingredientName: 'peanut butter', presenceStatus: 'contains' }],
    dietary_tags: [],
    allergen_data_status: 'complete',
    dietary_data_status: 'complete',
  };

  const pool = {
    async query(sql) {
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 4 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(4, [candidateA, candidateB, candidateC, candidateD]);
      if (sql.startsWith('SELECT name FROM allergens')) return jsonResponse(1, [{ name: 'peanuts' }]);
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hardRestrictions: { allergens: ['peanuts'] },
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    // Candidate D excluded (contains peanuts)
    // Candidate B excluded (incomplete ingredients)
    // Candidate C excluded (unverified ingredient data)
    // Only Candidate A is eligible!
    assert.equal(body.eligibleCount, 1);
    assert.equal(body.excludedCount, 3);
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].dish.id, '401');
    assert.ok(body.warnings.includes('allergen_safety_cannot_be_verified'));
  });
});

// ---------------------------------------------------------------------------
// Scenario 5: Strict price boundaries
// ---------------------------------------------------------------------------
test('Test 5 — Strict price boundaries (100 and 300 exclusive)', async () => {
  const prices = ['99.00', '100.00', '101.00', '299.00', '300.00', '301.00'];
  const dishes = prices.map((price, idx) => ({
    dish_id: String(500 + idx),
    dish_name: `Dish at ${price}`,
    price,
    currency_code: 'USD',
    availability_status: 'available',
    cuisine_type: 'Modern American',
    category: 'main',
    ingredient_data_status: 'partial',
    ingredients: [],
    allergen_links: [],
    dietary_tags: [],
    allergen_data_status: 'unknown',
    dietary_data_status: 'unknown',
  }));

  const pool = {
    async query(sql) {
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: dishes.length }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(dishes.length, dishes);
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hardRestrictions: {
          minPrice: '100',
          maxPrice: '300',
          minPriceExclusive: true,
          maxPriceExclusive: true,
        },
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    // Only 101 and 299 must satisfy strictly exclusive bounds (100 and 300 excluded)
    assert.equal(body.data.length, 2);
    const eligiblePrices = body.data.map((d) => d.price);
    assert.ok(eligiblePrices.includes('101.00'));
    assert.ok(eligiblePrices.includes('299.00'));
    assert.ok(!eligiblePrices.includes('100.00'));
    assert.ok(!eligiblePrices.includes('300.00'));
    assert.ok(!eligiblePrices.includes('99.00'));
    assert.ok(!eligiblePrices.includes('301.00'));
  });
});

// ---------------------------------------------------------------------------
// Scenario 6: Outlet switching
// ---------------------------------------------------------------------------
test('Test 6 — Outlet switching and request isolation', async () => {
  const dishOutletA = {
    dish_id: '601', dish_name: 'Burger A', price: '15.00', currency_code: 'USD',
    availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
  };
  const dishOutletB = {
    dish_id: '602', dish_name: 'Dosa B', price: '12.00', currency_code: 'USD',
    availability_status: 'available', cuisine_type: 'South Indian', category: 'main',
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
  };

  const pool = {
    async query(sql, values = []) {
      if (sql.includes('FROM outlets') && sql.includes('WHERE id = $1')) {
        const id = String(values[0]);
        if (id === '10') return jsonResponse(1, [outletA]);
        if (id === '20') return jsonResponse(1, [outletB]);
        return jsonResponse(0, []);
      }
      if (sql.includes('count(*)::int AS total FROM menu_dishes')) {
        const id = String(values[0]);
        if (id === '10') return jsonResponse(1, [{ total: 1 }]);
        if (id === '20') return jsonResponse(1, [{ total: 1 }]);
      }
      if (sql.includes('FROM menu_dishes md')) {
        const id = String(values[0]);
        if (id === '10') return jsonResponse(1, [dishOutletA]);
        if (id === '20') return jsonResponse(1, [dishOutletB]);
      }
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    // Request Outlet A
    const resA = await fetch(`${baseUrl}/api/outlets/10/menu`);
    const menuA = await resA.json();
    assert.equal(menuA.data[0].dish.name, 'Burger A');

    // Switch to Outlet B
    const resB = await fetch(`${baseUrl}/api/outlets/20/menu`);
    const menuB = await resB.json();
    assert.equal(menuB.data[0].dish.name, 'Dosa B');
    assert.notEqual(menuB.data[0].dish.name, menuA.data[0].dish.name);
  });
});

// ---------------------------------------------------------------------------
// Scenario 7: Partial preferences and graceful degradation
// ---------------------------------------------------------------------------
test('Test 7 — Partial preferences and graceful degradation (only max price 250)', async () => {
  const dishUnder250 = {
    dish_id: '701', dish_name: 'Affordable Lunch', price: '200.00', currency_code: 'USD',
    availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: null, protein: null, status: 'missing' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };
  const dishOver250 = {
    dish_id: '702', dish_name: 'Premium Steak', price: '320.00', currency_code: 'USD',
    availability_status: 'available', cuisine_type: 'Modern American', category: 'main',
    nutrition: { calories: null, protein: null, status: 'missing' },
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };

  const pool = {
    async query(sql) {
      if (sql.includes('count(*)::int AS total')) return jsonResponse(1, [{ total: 2 }]);
      if (sql.includes('FROM menu_dishes md')) return jsonResponse(2, [dishUnder250, dishOver250]);
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/recommendations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        hardRestrictions: { maxPrice: '250.00' },
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].dish.id, '701');
    assert.equal(body.data[0].dish.nutrition.status, 'missing');
    assert.equal(body.data[0].dish.nutrition.calories, null);
  });
});

// ---------------------------------------------------------------------------
// Scenario 8: Natural-language AI preference parsing
// ---------------------------------------------------------------------------
test('Test 8 — Natural-language AI preference parsing', async () => {
  const prompt = 'Find me affordable Japanese food, preferably high in protein. I have a peanut allergy. Calories don\'t matter.';
  const parsed = deterministicParse(prompt);

  assert.equal(parsed.cuisine, 'Japanese');
  assert.equal(parsed.preferences.highProtein, true);
  assert.deepEqual(parsed.hardRestrictions.allergens, ['peanuts']);
  assert.equal(parsed.caloriesDisregarded, true);
  assert.equal(parsed.preferences.targetCalories, undefined);
  // "affordable" must not invent a price threshold; it notes vague budget or leaves unset
  assert.equal(parsed.hasVagueBudget, true);
  assert.equal(parsed.hardRestrictions.maxPrice, undefined);
  assert.equal(parsed.restaurant, null); // did not invent a restaurant
  assert.ok(parsed.clarificationQuestion.includes('budget'));
});

// ---------------------------------------------------------------------------
// Scenario 9: AI provider unavailable (graceful fallback)
// ---------------------------------------------------------------------------
test('Test 9 — AI provider unavailable (graceful fallback)', async () => {
  // Test with invalid API key or offline provider: must gracefully fall back without throwing
  const result = await parseNaturalLanguagePreferences('I want Thai food without peanuts', {
    apiKey: 'NON_EXISTENT_INVALID_KEY_123',
  });
  assert.equal(result.success, true);
  assert.equal(result.source, 'deterministic_fallback');
  assert.equal(result.data.cuisine, 'Thai');
  assert.deepEqual(result.data.hardRestrictions.allergens, ['peanuts']);
});

// ---------------------------------------------------------------------------
// Scenario 10: Outlet and availability constraints
// ---------------------------------------------------------------------------
test('Test 10 — Outlet and availability constraints', async () => {
  const activeAvailableDish = {
    outlet_id: '10', menu_id: '1', dish_id: '1001', dish_name: 'Daily Soup', price: '8.00',
    currency_code: 'USD', availability_status: 'available', cuisine_type: 'Modern American', category: 'soup',
    ingredient_data_status: 'partial', ingredients: [], allergen_links: [], dietary_tags: [],
    allergen_data_status: 'unknown', dietary_data_status: 'unknown',
  };

  const pool = {
    async query(sql, values = []) {
      if (sql.includes('FROM outlets') && sql.includes('WHERE id = $1')) {
        return jsonResponse(1, [outletA]);
      }
      if (sql.includes('count(*)::int AS total')) {
        return jsonResponse(1, [{ total: 1 }]);
      }
      if (sql.includes('FROM menu_dishes md')) {
        // Query must enforce availability_status = 'available' and outlet_id = 10
        assert.ok(sql.includes("md.availability_status = 'available'"));
        assert.ok(values.includes('10'));
        return jsonResponse(1, [activeAvailableDish]);
      }
      return jsonResponse(0, []);
    },
  };

  await withApi(pool, async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/outlets/10/menu`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.length, 1);
    assert.equal(body.data[0].dish.name, 'Daily Soup');
    assert.equal(body.data[0].availabilityStatus, 'available');
  });
});
