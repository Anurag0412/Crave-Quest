'use strict';

const { Pool } = require('pg');

function createPool(databaseUrl, { onIdleClientError = () => {} } = {}) {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  // Idle clients can fail between requests; always handle the pool event.
  pool.on('error', () => onIdleClientError());
  return pool;
}

module.exports = { createPool };
