'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadConfig } = require('../src/config');

test('requires a PostgreSQL connection URL', () => {
  assert.throws(() => loadConfig({}), /DATABASE_URL is required/);
  assert.throws(
    () => loadConfig({ DATABASE_URL: 'https://user:secret@example.test/db' }),
    /valid PostgreSQL connection URL/,
  );
});

test('validates the URL and port without echoing credentials', () => {
  assert.throws(
    () => loadConfig({ DATABASE_URL: 'postgres://user:secret@localhost/db', PORT: '0' }),
    /PORT must be an integer/,
  );

  const config = loadConfig({
    DATABASE_URL: 'postgresql://user:secret@localhost:5432/cravequest_dev',
    PORT: '4100',
  });
  assert.equal(config.port, 4100);
});
