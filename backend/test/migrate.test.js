'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { checksum, listMigrations, migrate } = require('../src/migrate');

test('discovers the initial migration in version order', async () => {
  assert.deepEqual(await listMigrations(), ['001_initial_schema.sql']);
});

test('migration checksums are stable and content-sensitive', () => {
  assert.equal(checksum('SELECT 1;'), checksum('SELECT 1;'));
  assert.notEqual(checksum('SELECT 1;'), checksum('SELECT 2;'));
});

test('applies an unapplied migration once and skips it on rerun', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'cravequest-migrations-'));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  await fs.writeFile(path.join(directory, '001_example.sql'), 'SELECT 1;');

  const applied = new Map();
  let executions = 0;
  const client = {
    async query(sql, params = []) {
      const statement = sql.trim();
      if (statement.startsWith('SELECT current_setting')) {
        return { rowCount: 1, rows: [{ version_num: 150000 }] };
      }
      if (statement.startsWith('SELECT checksum')) {
        const value = applied.get(params[0]);
        return value ? { rowCount: 1, rows: [{ checksum: value }] } : { rowCount: 0, rows: [] };
      }
      if (statement === 'SELECT 1;') executions += 1;
      if (statement.startsWith('INSERT INTO public.schema_migrations')) {
        applied.set(params[0], params[1]);
      }
      return { rowCount: 1, rows: [] };
    },
    release() {},
  };
  const pool = { connect: async () => client };

  await migrate(pool, directory);
  await migrate(pool, directory);
  assert.equal(executions, 1);
  assert.equal(applied.get('001_example.sql'), checksum('SELECT 1;'));
});

test('refuses PostgreSQL versions older than 15 before creating migration state', async () => {
  let released = false;
  const pool = {
    async connect() {
      return {
        async query() {
          return { rowCount: 1, rows: [{ version_num: 140000 }] };
        },
        release() { released = true; },
      };
    },
  };

  await assert.rejects(migrate(pool), /PostgreSQL 15 or newer is required/);
  assert.equal(released, true);
});
