'use strict';

const { Pool } = require('pg');
const { createMockPool } = require('./mock-database');

function createPool(databaseUrl, { onIdleClientError = () => {} } = {}) {
  const mock = createMockPool();

  if (!databaseUrl || databaseUrl.includes('change-me')) {
    console.warn('[AI Studio] PostgreSQL DATABASE_URL placeholder or absent — using in-memory mock database.');
    return mock;
  }

  let realPool;
  try {
    realPool = new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 2_000,
    });
    realPool.on('error', (err) => onIdleClientError(err));
  } catch (err) {
    console.warn(`[AI Studio] Failed to construct PostgreSQL pool (${err.message}) — using mock database.`);
    return mock;
  }

  let postgresFailed = false;

  return {
    async query(sql, values = []) {
      if (postgresFailed) {
        return mock.query(sql, values);
      }
      try {
        return await realPool.query(sql, values);
      } catch (err) {
        const isOffline = err.code === 'ECONNREFUSED'
          || err.code === 'ENOTFOUND'
          || err.code === 'EAI_AGAIN'
          || err.message.includes('timeout')
          || err.message.includes('connect');

        if (isOffline) {
          console.warn(`[AI Studio] PostgreSQL offline (${err.message}) — falling back to mock database.`);
          postgresFailed = true;
          return mock.query(sql, values);
        }
        throw err;
      }
    },
    async connect() {
      if (postgresFailed) {
        return mock.connect();
      }
      try {
        return await realPool.connect();
      } catch (err) {
        console.warn(`[AI Studio] PostgreSQL connect failed (${err.message}) — falling back to mock.`);
        postgresFailed = true;
        return mock.connect();
      }
    },
    async end() {
      if (!postgresFailed) {
        try {
          await realPool.end();
        } catch {}
      }
      return mock.end();
    },
    on(event, handler) {
      realPool.on(event, handler);
      mock.on(event, handler);
      return this;
    },
    removeListener(event, handler) {
      realPool.removeListener(event, handler);
      mock.removeListener(event, handler);
      return this;
    },
  };
}

module.exports = { createPool };
