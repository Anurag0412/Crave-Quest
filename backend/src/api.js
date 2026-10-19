'use strict';

const API_BODY_LIMIT_BYTES = 16 * 1024;
const MAX_ID = 9_223_372_036_854_775_807n;
const FEEDBACK_COUNTS = ['liked', 'disliked', 'not_interested', 'tried'];
const WRITE_UNAVAILABLE = {
  error: {
    code: 'feature_unavailable',
    message: 'Feedback and discovery writes are unavailable until authentication is implemented.',
  },
};

class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function sendJson(response, status, body) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify(body));
}

function apiError(response, status, code, message) {
  sendJson(response, status, { error: { code, message } });
}

function fail(status, code, message) {
  throw new ApiError(status, code, message);
}

function parseId(value, label) {
  if (typeof value !== 'string' || !/^[1-9]\d{0,18}$/.test(value)) {
    fail(400, 'invalid_identifier', `${label} must be a positive integer.`);
  }
  const id = BigInt(value);
  if (id > MAX_ID) fail(400, 'invalid_identifier', `${label} is outside the supported range.`);
  return value;
}

function parsePage(value, fallback, maximum, name) {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) fail(400, 'invalid_pagination', `${name} must be an integer.`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) {
    fail(400, 'invalid_pagination', `${name} is outside the supported range.`);
  }
  return parsed;
}

function queryValues(url, allowed) {
  const values = {};
  for (const [key, value] of url.searchParams) {
    if (!allowed.has(key)) fail(400, 'unsupported_query_parameter', `Unsupported query parameter: ${key}.`);
    if (Object.hasOwn(values, key)) fail(400, 'duplicate_query_parameter', `${key} may be provided only once.`);
    values[key] = value;
  }
  return values;
}

function parseDecimal(value, name) {
  if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(value)) {
    fail(400, 'invalid_price', `${name} must be a nonnegative amount with at most two decimal places.`);
  }
  return value;
}

function parseStringArray(value, name, { max = 20, maxLength = 100 } = {}) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > max) {
    fail(400, 'invalid_request', `${name} must be an array with at most ${max} values.`);
  }
  const normalized = value.map((item) => {
    if (typeof item !== 'string' || item.trim() === '' || item.trim().length > maxLength) {
      fail(400, 'invalid_request', `Each ${name} value must be a nonempty string of at most ${maxLength} characters.`);
    }
    return item.trim();
  });
  if (new Set(normalized).size !== normalized.length) {
    fail(400, 'invalid_request', `${name} must not contain duplicates.`);
  }
  return normalized;
}

function assertObject(value, name) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(400, 'invalid_request', `${name} must be an object.`);
  }
  return value;
}

function assertAllowedKeys(object, allowed, name) {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) fail(400, 'unsupported_field', `${name} contains an unsupported field: ${key}.`);
  }
}

async function readJsonBody(request) {
  const contentType = request.headers['content-type']?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    request.resume();
    fail(415, 'unsupported_media_type', 'Content-Type must be application/json.');
  }

  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > API_BODY_LIMIT_BYTES) {
      fail(413, 'request_too_large', `Request body must not exceed ${API_BODY_LIMIT_BYTES} bytes.`);
    }
    chunks.push(chunk);
  }

  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail(400, 'malformed_json', 'Request body must contain valid JSON.');
  }
  return assertObject(body, 'Request body');
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, '\\$&');
}

async function assertValuesExist(pool, table, column, values, label) {
  if (values.length === 0) return;
  // Table and column names are constants at call sites; values remain parameters.
  const result = await pool.query(`SELECT ${column} FROM ${table} WHERE ${column} = ANY($1::text[])`, [values]);
  const found = new Set(result.rows.map((row) => row[column]));
  const missing = values.filter((value) => !found.has(value));
  if (missing.length > 0) fail(400, 'unsupported_value', `Unknown ${label}: ${missing.join(', ')}.`);
}

async function getOutlet(pool, outletId) {
  const result = await pool.query(
    `SELECT id, slug, name, cuisine_type, address_line, city, region, postal_code,
            country_code, time_zone, is_active
       FROM outlets
      WHERE id = $1 AND is_active = true`,
    [outletId],
  );
  if (result.rowCount === 0) fail(404, 'outlet_not_found', 'Outlet was not found.');
  return result.rows[0];
}

function outletJson(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    cuisineType: row.cuisine_type,
    address: {
      line: row.address_line,
      city: row.city,
      region: row.region,
      postalCode: row.postal_code,
      countryCode: row.country_code,
    },
    timeZone: row.time_zone,
    isActive: row.is_active,
  };
}

async function listOutlets(pool, url) {
  const query = queryValues(url, new Set(['page', 'limit']));
  const page = parsePage(query.page, 1, 1_000_000, 'page');
  const limit = parsePage(query.limit, 20, 100, 'limit');
  const offset = (page - 1) * limit;
  const [count, rows] = await Promise.all([
    pool.query('SELECT count(*)::int AS total FROM outlets WHERE is_active = true'),
    pool.query(
      `SELECT id, slug, name, cuisine_type, address_line, city, region, postal_code,
              country_code, time_zone, is_active
         FROM outlets
        WHERE is_active = true
        ORDER BY name, id
        LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
  ]);
  const total = count.rows[0].total;
  return {
    data: rows.rows.map(outletJson),
    pagination: { page, pageSize: limit, total, pageCount: Math.ceil(total / limit) },
  };
}

function menuWhere(outletId, filters, dishId) {
  const values = [];
  const where = [];
  const add = (clause, value) => {
    values.push(value);
    where.push(clause.replace('?', `$${values.length}`));
  };

  if (outletId) add('o.id = ?', outletId);
  if (dishId) add('d.id = ?', dishId);
  where.push(
    'o.is_active = true',
    'm.is_published = true',
    'md.is_listed = true',
    '(m.valid_from IS NULL OR m.valid_from <= (now() AT TIME ZONE o.time_zone)::date)',
    '(m.valid_through IS NULL OR m.valid_through >= (now() AT TIME ZONE o.time_zone)::date)',
    `(
       NOT EXISTS (
         SELECT 1 FROM menu_dish_availability a0
          WHERE a0.menu_id = m.id AND a0.dish_id = d.id
       )
       OR EXISTS (
         SELECT 1 FROM menu_dish_availability a
          WHERE a.menu_id = m.id AND a.dish_id = d.id
            AND a.day_of_week = EXTRACT(DOW FROM now() AT TIME ZONE o.time_zone)::smallint
            AND (now() AT TIME ZONE o.time_zone)::time >= a.starts_at
            AND (now() AT TIME ZONE o.time_zone)::time < a.ends_at
       )
     )`,
  );

  if (filters.availability === 'all') {
    // No availability filter
  } else if (!filters.availability || filters.availability === 'available') {
    where.push("md.availability_status = 'available'");
  } else {
    add('md.availability_status = ?', filters.availability);
  }
  if (filters.search) {
    values.push(escapeLike(filters.search));
    const nameIndex = values.length;
    values.push(escapeLike(filters.search));
    const descriptionIndex = values.length;
    where.push(`(d.name ILIKE '%' || $${nameIndex} || '%' ESCAPE E'\\\\' OR COALESCE(d.description, '') ILIKE '%' || $${descriptionIndex} || '%' ESCAPE E'\\\\')`);
  }
  if (filters.category) add('d.category = ?', filters.category);
  if (filters.cuisine) add('o.cuisine_type = ?', filters.cuisine);
  if (filters.minPrice) add('md.price >= ?::numeric', filters.minPrice);
  if (filters.maxPrice) add('md.price <= ?::numeric', filters.maxPrice);
  if (filters.dietaryTag) {
    add(
      `EXISTS (
         SELECT 1 FROM dish_dietary_tags dt
         JOIN dietary_tags t ON t.id = dt.dietary_tag_id
         WHERE dt.dish_id = d.id AND t.slug = ?
       )`,
      filters.dietaryTag,
    );
  }
  if (filters.excludeIngredient) {
    values.push(filters.excludeIngredient);
    const targetIndex = values.length;
    where.push(
      `d.ingredient_data_status = 'verified_complete'
       AND EXISTS (
         SELECT 1 FROM dish_ingredients di
         WHERE di.dish_id = d.id
       )
       AND NOT EXISTS (
         SELECT 1 FROM dish_ingredients di
         WHERE di.dish_id = d.id AND di.verification_status <> 'verified'
       )
       AND NOT EXISTS (
         SELECT 1 FROM dish_ingredients di
         JOIN ingredients i ON i.id = di.ingredient_id
         WHERE di.dish_id = d.id AND i.name = $${targetIndex}
           AND di.presence_status IN ('contains', 'may_contain')
       )`,
    );
  }
  return { values, where: where.join('\n AND ') };
}

const ENTRY_SELECT = `
  SELECT o.id AS outlet_id, o.slug AS outlet_slug, o.name AS outlet_name,
         o.cuisine_type, o.time_zone,
         m.id AS menu_id, m.name AS menu_name, m.service_period,
         d.id AS dish_id, d.name AS dish_name, d.description, d.category,
         d.ingredient_data_status, d.ingredient_data_source, d.ingredient_data_checked_at,
         md.price::text AS price, md.currency_code, md.availability_status,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'name', i.name,
             'presenceStatus', di.presence_status,
             'verificationStatus', di.verification_status,
             'evidenceNote', di.evidence_note,
             'verifiedAt', di.verified_at
           ) ORDER BY i.name)
           FROM dish_ingredients di JOIN ingredients i ON i.id = di.ingredient_id
           WHERE di.dish_id = d.id
         ), '[]'::jsonb) AS ingredients,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'name', a.name,
             'verificationStatus', ia.verification_status,
             'ingredientName', i.name,
             'ingredientVerificationStatus', di.verification_status,
             'evidenceNote', ia.evidence_note,
             'verifiedAt', ia.verified_at
           ) ORDER BY a.name, i.name)
           FROM dish_ingredients di
           JOIN ingredients i ON i.id = di.ingredient_id
           JOIN ingredient_allergens ia ON ia.ingredient_id = i.id
           JOIN allergens a ON a.id = ia.allergen_id
           WHERE di.dish_id = d.id AND di.presence_status IN ('contains', 'may_contain')
         ), '[]'::jsonb) AS allergen_links,
         COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'slug', t.slug,
             'label', t.label,
             'verificationStatus', dt.verification_status,
             'evidenceNote', dt.evidence_note,
             'verifiedAt', dt.verified_at
           ) ORDER BY t.slug)
           FROM dish_dietary_tags dt JOIN dietary_tags t ON t.id = dt.dietary_tag_id
           WHERE dt.dish_id = d.id
         ), '[]'::jsonb) AS dietary_tags,
         CASE
           WHEN EXISTS (
             SELECT 1 FROM dish_ingredients di
             JOIN ingredient_allergens ia ON ia.ingredient_id = di.ingredient_id
             WHERE di.dish_id = d.id
               AND di.presence_status IN ('contains', 'may_contain')
               AND (di.verification_status <> 'verified' OR ia.verification_status <> 'verified')
           ) THEN 'unverified'
           WHEN EXISTS (
             SELECT 1 FROM dish_ingredients di
             JOIN ingredient_allergens ia ON ia.ingredient_id = di.ingredient_id
             WHERE di.dish_id = d.id AND di.presence_status IN ('contains', 'may_contain')
           ) THEN 'partial'
           ELSE 'unknown'
         END AS allergen_data_status,
         CASE
           WHEN EXISTS (
             SELECT 1 FROM dish_dietary_tags dt
             WHERE dt.dish_id = d.id AND dt.verification_status <> 'verified'
           ) THEN 'unverified'
           WHEN EXISTS (SELECT 1 FROM dish_dietary_tags dt WHERE dt.dish_id = d.id) THEN 'partial'
           ELSE 'unknown'
         END AS dietary_data_status
    FROM menu_dishes md
    JOIN menus m ON m.id = md.menu_id AND m.outlet_id = md.outlet_id
    JOIN dishes d ON d.id = md.dish_id AND d.outlet_id = md.outlet_id
    JOIN outlets o ON o.id = md.outlet_id`;

async function queryEntries(pool, outletId, filters = {}, dishId, limit, offset = 0) {
  const built = menuWhere(outletId, filters, dishId);
  const fromWhere = `${ENTRY_SELECT}\n WHERE ${built.where}`;
  if (limit === undefined) {
    const result = await pool.query(`${fromWhere}\n ORDER BY m.id, d.name, d.id`, built.values);
    return { rows: result.rows, total: result.rowCount };
  }
  const limitParam = built.values.length + 1;
  const offsetParam = built.values.length + 2;
  const [count, result] = await Promise.all([
    pool.query(`SELECT count(*)::int AS total FROM menu_dishes md JOIN menus m ON m.id=md.menu_id AND m.outlet_id=md.outlet_id JOIN dishes d ON d.id=md.dish_id AND d.outlet_id=md.outlet_id JOIN outlets o ON o.id=md.outlet_id WHERE ${built.where}`, built.values),
    pool.query(`${fromWhere}\n ORDER BY m.id, d.name, d.id\n LIMIT $${limitParam} OFFSET $${offsetParam}`, [...built.values, limit, offset]),
  ]);
  return { rows: result.rows, total: count.rows[0].total };
}

function dataWarnings(row) {
  const warnings = [];
  if (row.ingredient_data_status !== 'verified_complete') warnings.push('ingredient_data_incomplete');
  if (row.allergen_data_status !== 'complete') warnings.push('allergen_data_incomplete');
  if (row.dietary_data_status !== 'complete') warnings.push('dietary_data_incomplete');
  return warnings;
}

function dishJson(row) {
  return {
    id: row.dish_id,
    name: row.dish_name,
    description: row.description,
    category: row.category,
    ingredientData: {
      status: row.ingredient_data_status,
      source: row.ingredient_data_source,
      checkedAt: row.ingredient_data_checked_at,
    },
    ingredients: row.ingredients,
    allergens: {
      dataStatus: row.allergen_data_status,
      knownAssociations: row.allergen_links,
    },
    dietaryTags: {
      dataStatus: row.dietary_data_status,
      tags: row.dietary_tags,
    },
    nutrition: row.nutrition || {
      calories: row.calories ?? null,
      protein: row.protein ?? null,
      status: row.nutrition_status || (row.calories ? 'verified' : 'missing'),
    },
    dataWarnings: dataWarnings(row),
  };
}

function menuEntryJson(row) {
  return {
    menu: { id: row.menu_id, name: row.menu_name, servicePeriod: row.service_period },
    dish: dishJson(row),
    price: row.price,
    currencyCode: row.currency_code,
    availabilityStatus: row.availability_status,
    dataWarnings: dataWarnings(row),
  };
}

async function validateMenuFilters(pool, url) {
  const query = queryValues(url, new Set([
    'page', 'limit', 'search', 'category', 'cuisine', 'minPrice', 'maxPrice',
    'dietaryTag', 'excludeIngredient', 'availability',
  ]));
  const page = parsePage(query.page, 1, 1_000_000, 'page');
  const limit = parsePage(query.limit, 20, 100, 'limit');
  const offset = (page - 1) * limit;
  const filters = {};
  if (query.search !== undefined) {
    if (query.search.trim() === '' || query.search.length > 100) {
      fail(400, 'invalid_search', 'search must contain 1 to 100 characters.');
    }
    filters.search = query.search;
  }
  for (const key of ['category', 'cuisine', 'dietaryTag', 'excludeIngredient']) {
    if (query[key] !== undefined && (query[key].trim() === '' || query[key].length > 100)) {
      fail(400, 'invalid_filter', `${key} must contain 1 to 100 characters.`);
    }
    if (query[key] !== undefined) filters[key] = query[key].trim();
  }
  if (query.minPrice !== undefined) filters.minPrice = parseDecimal(query.minPrice, 'minPrice');
  if (query.maxPrice !== undefined) filters.maxPrice = parseDecimal(query.maxPrice, 'maxPrice');
  if (filters.minPrice && filters.maxPrice && Number(filters.minPrice) > Number(filters.maxPrice)) {
    fail(400, 'invalid_price_range', 'minPrice must not exceed maxPrice.');
  }
  filters.availability = query.availability ?? 'available';
  if (!['available', 'sold_out', 'paused', 'all'].includes(filters.availability)) {
    fail(400, 'invalid_availability', 'availability must be available, sold_out, paused, or all.');
  }

  if (filters.category) await assertValuesExist(pool, 'dishes', 'category', [filters.category], 'category');
  if (filters.cuisine) await assertValuesExist(pool, 'outlets', 'cuisine_type', [filters.cuisine], 'cuisine');
  if (filters.dietaryTag) await assertValuesExist(pool, 'dietary_tags', 'slug', [filters.dietaryTag], 'dietary tag');
  if (filters.excludeIngredient) await assertValuesExist(pool, 'ingredients', 'name', [filters.excludeIngredient], 'ingredient');
  return { page, limit, offset, filters };
}

async function getOutletMenu(pool, outletId, url) {
  const outlet = await getOutlet(pool, outletId);
  const { page, limit, offset, filters } = await validateMenuFilters(pool, url);
  const result = await queryEntries(pool, outletId, filters, undefined, limit, offset);
  return {
    outlet: outletJson(outlet),
    data: result.rows.map(menuEntryJson),
    pagination: { page, pageSize: limit, total: result.total, pageCount: Math.ceil(result.total / limit) },
    warnings: [...new Set(result.rows.flatMap(dataWarnings))],
  };
}

async function getDish(pool, dishId) {
  const result = await queryEntries(pool, undefined, { availability: 'available' }, dishId);
  if (result.rows.length === 0) fail(404, 'dish_not_found', 'Dish was not found in an active, currently available published menu.');
  const first = result.rows[0];
  return {
    outlet: { id: first.outlet_id, slug: first.outlet_slug, name: first.outlet_name, cuisineType: first.cuisine_type },
    dish: dishJson(first),
    menuEntries: result.rows.map((row) => ({
      menu: { id: row.menu_id, name: row.menu_name, servicePeriod: row.service_period },
      price: row.price,
      currencyCode: row.currency_code,
      availabilityStatus: row.availability_status,
    })),
  };
}

function parsePreferencePayload(body) {
  assertAllowedKeys(body, new Set([
    'outletId', 'restaurant', 'limit', 'preferences', 'hardRestrictions',
  ]), 'Request body');

  let outletId = null;
  let restaurant = null;
  if (body.outletId !== undefined && body.outletId !== null && String(body.outletId).trim() !== '') {
    const rawOutletId = String(body.outletId).trim();
    if (/^\d+$/.test(rawOutletId)) {
      outletId = parseId(rawOutletId, 'outletId');
    } else {
      restaurant = rawOutletId;
    }
  }
  if (body.restaurant !== undefined && body.restaurant !== null && String(body.restaurant).trim() !== '') {
    restaurant = String(body.restaurant).trim();
  }

  const limit = body.limit === undefined ? 10 : body.limit;
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) fail(400, 'invalid_limit', 'limit must be an integer from 1 to 50.');

  const preferences = assertObject(body.preferences ?? {}, 'preferences');
  assertAllowedKeys(preferences, new Set([
    'cuisineTypes', 'cuisine', 'categories', 'category', 'maxPrice', 'minPrice',
    'targetCalories', 'calorieTarget', 'desiredIngredients', 'targetProtein', 'highProtein',
  ]), 'preferences');

  const hardRestrictions = assertObject(body.hardRestrictions ?? {}, 'hardRestrictions');
  assertAllowedKeys(hardRestrictions, new Set([
    'allergens', 'ingredients', 'dietaryTags', 'minPrice', 'maxPrice',
    'minPriceExclusive', 'maxPriceExclusive', 'priceRange',
  ]), 'hardRestrictions');

  let rawCuisines = [];
  if (preferences.cuisineTypes !== undefined) {
    rawCuisines = parseStringArray(preferences.cuisineTypes, 'preferences.cuisineTypes');
  } else if (preferences.cuisine !== undefined && preferences.cuisine !== null) {
    if (typeof preferences.cuisine === 'string' && preferences.cuisine.trim()) {
      rawCuisines = [preferences.cuisine.trim()];
    }
  }

  let rawCategories = [];
  if (preferences.categories !== undefined) {
    rawCategories = parseStringArray(preferences.categories, 'preferences.categories');
  } else if (preferences.category !== undefined && preferences.category !== null) {
    if (typeof preferences.category === 'string' && preferences.category.trim()) {
      rawCategories = [preferences.category.trim()];
    }
  }

  let maxPrice;
  if (preferences.maxPrice !== undefined && preferences.maxPrice !== null && String(preferences.maxPrice).trim() !== '') {
    const text = typeof preferences.maxPrice === 'number' ? String(preferences.maxPrice) : String(preferences.maxPrice).trim();
    maxPrice = parseDecimal(text, 'preferences.maxPrice');
  }

  let minPrice;
  if (preferences.minPrice !== undefined && preferences.minPrice !== null && String(preferences.minPrice).trim() !== '') {
    const text = typeof preferences.minPrice === 'number' ? String(preferences.minPrice) : String(preferences.minPrice).trim();
    minPrice = parseDecimal(text, 'preferences.minPrice');
  }

  let targetCalories;
  const rawCal = preferences.targetCalories ?? preferences.calorieTarget;
  if (rawCal !== undefined && rawCal !== null && String(rawCal).trim() !== '') {
    const parsed = Number(rawCal);
    if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 10_000) {
      fail(400, 'invalid_calories', 'targetCalories must be a non-negative integer.');
    }
    targetCalories = parsed;
  }

  const desiredIngredients = preferences.desiredIngredients !== undefined
    ? parseStringArray(preferences.desiredIngredients, 'preferences.desiredIngredients')
    : [];

  let targetProtein;
  if (preferences.targetProtein !== undefined && preferences.targetProtein !== null) {
    const parsed = Number(preferences.targetProtein);
    if (isNaN(parsed) || parsed < 0) {
      fail(400, 'invalid_protein', 'targetProtein must be a non-negative number.');
    }
    targetProtein = parsed;
  } else if (preferences.highProtein) {
    targetProtein = 20;
  }

  let hardMinPrice;
  let hardMaxPrice;
  let minPriceExclusive = Boolean(hardRestrictions.minPriceExclusive);
  let maxPriceExclusive = Boolean(hardRestrictions.maxPriceExclusive);

  if (hardRestrictions.priceRange && typeof hardRestrictions.priceRange === 'object') {
    const pr = hardRestrictions.priceRange;
    if (pr.min !== undefined && pr.min !== null) {
      hardMinPrice = parseDecimal(String(pr.min).trim(), 'hardRestrictions.priceRange.min');
      if (pr.minExclusive !== undefined) minPriceExclusive = Boolean(pr.minExclusive);
    }
    if (pr.max !== undefined && pr.max !== null) {
      hardMaxPrice = parseDecimal(String(pr.max).trim(), 'hardRestrictions.priceRange.max');
      if (pr.maxExclusive !== undefined) maxPriceExclusive = Boolean(pr.maxExclusive);
    }
  }

  if (hardRestrictions.minPrice !== undefined && hardRestrictions.minPrice !== null && String(hardRestrictions.minPrice).trim() !== '') {
    hardMinPrice = parseDecimal(String(hardRestrictions.minPrice).trim(), 'hardRestrictions.minPrice');
  }
  if (hardRestrictions.maxPrice !== undefined && hardRestrictions.maxPrice !== null && String(hardRestrictions.maxPrice).trim() !== '') {
    hardMaxPrice = parseDecimal(String(hardRestrictions.maxPrice).trim(), 'hardRestrictions.maxPrice');
  }

  if (hardMinPrice !== undefined && hardMaxPrice !== undefined && Number(hardMinPrice) > Number(hardMaxPrice)) {
    fail(400, 'invalid_price_range', 'minPrice must not exceed maxPrice.');
  }

  return {
    outletId,
    restaurant,
    limit,
    preferences: {
      cuisineTypes: rawCuisines,
      categories: rawCategories,
      maxPrice,
      minPrice,
      targetCalories,
      desiredIngredients,
      targetProtein,
    },
    hardRestrictions: {
      allergens: parseStringArray(hardRestrictions.allergens, 'hardRestrictions.allergens'),
      ingredients: parseStringArray(hardRestrictions.ingredients, 'hardRestrictions.ingredients'),
      requiredDietaryTags: parseStringArray(hardRestrictions.dietaryTags, 'hardRestrictions.dietaryTags'),
      minPrice: hardMinPrice,
      maxPrice: hardMaxPrice,
      minPriceExclusive,
      maxPriceExclusive,
    },
  };
}

function safetyFilter(entries, restrictions) {
  const accepted = [];
  let excluded = 0;
  const warnings = new Set();

  for (const row of entries) {
    const reasons = [];
    const verifiedDietaryReasons = [];

    // Strict min price check
    if (restrictions.minPrice !== undefined) {
      const min = Number(restrictions.minPrice);
      const price = Number(row.price);
      const ok = restrictions.minPriceExclusive ? price > min : price >= min;
      if (!ok) {
        reasons.push('price_below_minimum');
      }
    }

    // Strict max price check
    if (restrictions.maxPrice !== undefined) {
      const max = Number(restrictions.maxPrice);
      const price = Number(row.price);
      const ok = restrictions.maxPriceExclusive ? price < max : price <= max;
      if (!ok) {
        reasons.push('price_exceeds_maximum');
      }
    }

    // Conservative Allergen check
    const ingredientsCompleteAndVerified = row.ingredient_data_status === 'verified_complete'
      && Array.isArray(row.ingredients)
      && row.ingredients.length > 0
      && row.ingredients.every((ing) => ing.verificationStatus === 'verified');

    for (const allergen of restrictions.allergens) {
      const allergenLower = allergen.toLowerCase();
      const knownViolation = Array.isArray(row.allergen_links) && row.allergen_links.some((link) => {
        return link.name.toLowerCase() === allergenLower
          && (link.verificationStatus === 'verified' || link.ingredientVerificationStatus === 'verified' || link.presenceStatus === 'contains');
      });

      if (knownViolation) {
        reasons.push('allergen_match');
      } else if (ingredientsCompleteAndVerified && (row.allergen_data_status === 'complete' || row.allergen_data_status === 'verified')) {
        // Candidate A: verified complete ingredients and absence of allergen
        verifiedDietaryReasons.push(`verified_allergen_free:${allergen}`);
      } else {
        // Candidate B (incomplete) or Candidate C (unverified)
        reasons.push('allergen_safety_unknown');
        warnings.add('allergen_safety_cannot_be_verified');
      }
    }

    // Excluded ingredients check
    if (restrictions.ingredients.length > 0) {
      if (!ingredientsCompleteAndVerified) {
        reasons.push('ingredient_data_unknown');
        warnings.add('ingredient_data_incomplete_for_exclusion');
      } else if (row.ingredients.some((ingredient) => {
        return restrictions.ingredients.map((i) => i.toLowerCase()).includes(ingredient.name.toLowerCase())
          && ['contains', 'may_contain'].includes(ingredient.presenceStatus);
      })) {
        reasons.push('ingredient_match');
      }
    }

    // Required dietary tags check
    for (const tag of restrictions.requiredDietaryTags) {
      const matchingTag = Array.isArray(row.dietary_tags)
        ? row.dietary_tags.find((dishTag) => dishTag.slug === tag)
        : null;
      if (matchingTag?.verificationStatus === 'verified') {
        verifiedDietaryReasons.push(`dietary_tag_match:${tag}`);
      } else {
        reasons.push('dietary_tag_requirement_unknown');
        warnings.add('dietary_tag_requirement_cannot_be_verified');
      }
    }

    if (reasons.length > 0) {
      excluded += 1;
      continue;
    }
    accepted.push({ row, verifiedDietaryReasons });
  }

  return { accepted, excluded, warnings: [...warnings] };
}

function scoreDish(row, preferences) {
  let score = 0;
  const reasons = [];

  if (preferences.cuisineTypes && preferences.cuisineTypes.length > 0) {
    if (preferences.cuisineTypes.some((c) => c.toLowerCase() === row.cuisine_type.toLowerCase())) {
      score += 3;
      reasons.push('cuisine_match');
    }
  }

  if (preferences.categories && preferences.categories.length > 0) {
    if (preferences.categories.some((c) => c.toLowerCase() === row.category.toLowerCase())) {
      score += 2;
      reasons.push('category_match');
    }
  }

  if (preferences.maxPrice !== undefined && Number(row.price) <= Number(preferences.maxPrice)) {
    score += 1;
    reasons.push('within_budget');
  }

  if (preferences.minPrice !== undefined && Number(row.price) >= Number(preferences.minPrice)) {
    score += 1;
    reasons.push('within_budget');
  }

  if (preferences.desiredIngredients && preferences.desiredIngredients.length > 0 && Array.isArray(row.ingredients)) {
    for (const desired of preferences.desiredIngredients) {
      if (row.ingredients.some((ing) => ing.name.toLowerCase() === desired.toLowerCase())) {
        score += 2;
        reasons.push(`desired_ingredient:${desired}`);
      }
    }
  }

  if (preferences.targetCalories !== undefined) {
    const calories = row.nutrition?.calories ?? row.calories;
    const isVerified = row.nutrition?.status === 'verified';
    if (calories !== undefined && calories !== null && isVerified) {
      const diff = Math.abs(Number(calories) - Number(preferences.targetCalories));
      if (diff <= 100) {
        score += 3;
        reasons.push('calorie_target_match');
      } else if (diff <= 250) {
        score += 1;
        reasons.push('close_to_calorie_target');
      }
    } else {
      reasons.push('calorie_preference_unevaluated_missing_data');
    }
  }

  if (preferences.targetProtein !== undefined) {
    const protein = row.nutrition?.protein ?? row.protein;
    const isVerified = row.nutrition?.status === 'verified';
    if (protein !== undefined && protein !== null && isVerified && Number(protein) >= Number(preferences.targetProtein)) {
      score += 2;
      reasons.push('high_protein_match');
    } else if (!isVerified || protein === undefined || protein === null) {
      reasons.push('protein_preference_unevaluated_missing_data');
    }
  }

  if (reasons.length === 0) {
    reasons.push('eligible_candidate');
  }

  return { score, reasons };
}

async function recommend(pool, body) {
  const request = parsePreferencePayload(body);
  const { preferences, hardRestrictions } = request;

  let outlet = null;
  let targetOutletId = request.outletId;

  if (targetOutletId) {
    outlet = await getOutlet(pool, targetOutletId);
  } else if (request.restaurant) {
    const found = await pool.query(
      `SELECT id, slug, name, cuisine_type, address_line, city, region, postal_code, country_code, time_zone, is_active
         FROM outlets
        WHERE is_active = true AND (slug ILIKE $1 OR name ILIKE $1)`,
      [request.restaurant],
    );
    if (!found.rows.length) {
      fail(404, 'outlet_not_found', `Restaurant "${request.restaurant}" was not found.`);
    }
    outlet = found.rows[0];
    targetOutletId = outlet.id;
  }

  // Probe cuisine/category existence if specified without crashing if unknown
  if (preferences.cuisineTypes.length > 0) {
    await pool.query('SELECT cuisine_type FROM outlets WHERE cuisine_type = ANY($1::text[])', [preferences.cuisineTypes]).catch(() => {});
  }
  if (preferences.categories.length > 0) {
    await pool.query('SELECT category FROM dishes WHERE category = ANY($1::text[])', [preferences.categories]).catch(() => {});
  }

  // Validate hard restrictions against domain tables
  await Promise.all([
    assertValuesExist(pool, 'allergens', 'name', hardRestrictions.allergens, 'allergen'),
    assertValuesExist(pool, 'ingredients', 'name', hardRestrictions.ingredients, 'ingredient'),
    assertValuesExist(pool, 'dietary_tags', 'slug', hardRestrictions.requiredDietaryTags, 'required dietary tag'),
  ]);

  // Query eligible candidate menu entries
  const result = await queryEntries(pool, targetOutletId || undefined, { availability: 'available' }, undefined, 500, 0);

  // Apply conservative hard safety restrictions
  const safety = safetyFilter(result.rows, hardRestrictions);

  // Rank eligible candidates by soft preferences
  const ranked = safety.accepted
    .map(({ row, verifiedDietaryReasons }) => ({
      row,
      ...scoreDish(row, preferences),
      verifiedDietaryReasons,
    }))
    .sort((a, b) => b.score - a.score || String(a.row.dish_id).localeCompare(String(b.row.dish_id)));

  const warnings = new Set(safety.warnings);
  for (const item of ranked) {
    for (const warning of dataWarnings(item.row)) warnings.add(warning);
  }
  if (result.total > result.rows.length) warnings.add('candidate_limit_applied');

  return {
    outlet: outlet ? outletJson(outlet) : null,
    data: ranked.slice(0, request.limit).map(({ row, score, reasons, verifiedDietaryReasons }) => ({
      ...menuEntryJson(row),
      score,
      reasons: [...reasons, ...verifiedDietaryReasons],
    })),
    eligibleCount: safety.accepted.length,
    excludedCount: safety.excluded,
    totalAvailableCount: result.total,
    warnings: [...warnings],
  };
}

async function outletAnalytics(pool, outletId) {
  await getOutlet(pool, outletId);
  const [feedback, discoveries] = await Promise.all([
    pool.query(
      `SELECT feedback, count(*)::int AS count
         FROM recommendation_feedback
        WHERE outlet_id = $1
        GROUP BY feedback`,
      [outletId],
    ),
    pool.query(
      `SELECT count(*)::int AS count
         FROM confirmed_discoveries cd
         JOIN dishes d ON d.id = cd.dish_id
        WHERE d.outlet_id = $1`,
      [outletId],
    ),
  ]);
  const byType = Object.fromEntries(FEEDBACK_COUNTS.map((type) => [type, 0]));
  for (const row of feedback.rows) byType[row.feedback] = row.count;
  return {
    outletId,
    feedback: { total: Object.values(byType).reduce((total, count) => total + count, 0), byType },
    confirmedDiscoveries: discoveries.rows[0].count,
    source: 'recorded feedback and confirmed discoveries; not sales data',
  };
}

function routeFor(method, segments) {
  const path = `/${segments.join('/')}`;
  const routes = new Map([
    ['/api/outlets', ['GET']],
    ['/api/recommendations', ['POST']],
    ['/api/feedback', ['POST']],
    ['/api/discoveries', ['POST']],
    ['/api/ai/parse-preferences', ['POST']],
  ]);
  if (routes.has(path)) return { path, methods: routes.get(path) };
  if (segments[0] === 'api' && segments[1] === 'outlets' && segments.length === 3) {
    return { path: '/api/outlets/:outletId', methods: ['GET'] };
  }
  if (segments[0] === 'api' && segments[1] === 'outlets' && segments.length === 4 && segments[3] === 'menu') {
    return { path: '/api/outlets/:outletId/menu', methods: ['GET'] };
  }
  if (segments[0] === 'api' && segments[1] === 'outlets' && segments.length === 4 && segments[3] === 'analytics') {
    return { path: '/api/outlets/:outletId/analytics', methods: ['GET'] };
  }
  if (segments[0] === 'api' && segments[1] === 'dishes' && segments.length === 3) {
    return { path: '/api/dishes/:dishId', methods: ['GET'] };
  }
  return null;
}

async function handleApiRequest(request, response, pool, { onError = () => {} } = {}) {
  let url;
  try {
    url = new URL(request.url ?? '/', 'http://localhost');
  } catch {
    return apiError(response, 400, 'invalid_url', 'Request URL is invalid.');
  }
  const segments = url.pathname.split('/').filter(Boolean);
  const route = routeFor(request.method, segments);
  if (!route) {
    request.resume();
    return apiError(response, 404, 'not_found', 'Route was not found.');
  }
  if (!route.methods.includes(request.method)) {
    request.resume();
    response.setHeader('allow', route.methods.join(', '));
    return apiError(response, 405, 'method_not_allowed', 'Method is not allowed for this route.');
  }

  try {
    if (route.path === '/api/outlets') return sendJson(response, 200, await listOutlets(pool, url));
    if (route.path === '/api/outlets/:outletId') {
      const outlet = await getOutlet(pool, parseId(segments[2], 'outletId'));
      return sendJson(response, 200, { data: outletJson(outlet) });
    }
    if (route.path === '/api/outlets/:outletId/menu') {
      const result = await getOutletMenu(pool, parseId(segments[2], 'outletId'), url);
      return sendJson(response, 200, result);
    }
    if (route.path === '/api/outlets/:outletId/analytics') {
      return sendJson(response, 200, { data: await outletAnalytics(pool, parseId(segments[2], 'outletId')) });
    }
    if (route.path === '/api/dishes/:dishId') {
      return sendJson(response, 200, { data: await getDish(pool, parseId(segments[2], 'dishId')) });
    }
    if (route.path === '/api/recommendations') {
      const result = await recommend(pool, await readJsonBody(request));
      return sendJson(response, 200, result);
    }
    if (route.path === '/api/ai/parse-preferences') {
      const body = await readJsonBody(request);
      const { parseNaturalLanguagePreferences } = require('./ai-assistant');
      const result = await parseNaturalLanguagePreferences(body.prompt);
      return sendJson(response, 200, result);
    }
    if (route.path === '/api/feedback') {
      request.resume();
      return sendJson(response, 503, WRITE_UNAVAILABLE);
    }
    if (route.path === '/api/discoveries') {
      request.resume();
      return sendJson(response, 503, WRITE_UNAVAILABLE);
    }
  } catch (error) {
    if (response.destroyed || response.writableEnded) return;
    if (error instanceof ApiError) return apiError(response, error.status, error.code, error.message);
    onError();
    return apiError(response, 500, 'internal_error', 'Request could not be completed.');
  }
}

module.exports = {
  API_BODY_LIMIT_BYTES,
  ApiError,
  handleApiRequest,
  menuEntryJson,
  parseId,
  parsePreferencePayload,
  safetyFilter,
  scoreDish,
};
