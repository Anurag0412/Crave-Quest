'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const { loadConfig } = require('./config');
const { createPool } = require('./database');

const MIGRATIONS_DIRECTORY = path.resolve(__dirname, '../../database/migrations');
const MIGRATION_LOCK_KEY = 73_824_619_051;

async function listMigrations(directory = MIGRATIONS_DIRECTORY) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && /^\d+_[a-z0-9_]+\.sql$/i.test(entry.name))
    .map((entry) => entry.name)
    .sort();
}

function checksum(contents) {
  return crypto.createHash('sha256').update(contents).digest('hex');
}

async function migrate(pool, directory = MIGRATIONS_DIRECTORY) {
  const client = await pool.connect();
  let lockAcquired = false;
  try {
    const versionResult = await client.query(
      "SELECT current_setting('server_version_num')::integer AS version_num",
    );
    if (Number(versionResult.rows[0].version_num) < 150000) {
      throw new Error('PostgreSQL 15 or newer is required to apply CraveQuest migrations.');
    }

    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    lockAcquired = true;
    await client.query('SET search_path TO public');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name text PRIMARY KEY,
        checksum text NOT NULL,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const migrations = await listMigrations(directory);
    for (const name of migrations) {
      const sql = await fs.readFile(path.join(directory, name), 'utf8');
      const digest = checksum(sql);
      const result = await client.query(
        'SELECT checksum FROM public.schema_migrations WHERE name = $1',
        [name],
      );

      if (result.rowCount > 0) {
        if (result.rows[0].checksum !== digest) {
          throw new Error(`Applied migration ${name} has changed; refusing to continue.`);
        }
        console.log(`Already applied: ${name}`);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO public.schema_migrations (name, checksum) VALUES ($1, $2)',
          [name, digest],
        );
        await client.query('COMMIT');
        console.log(`Applied: ${name}`);
      } catch {
        await client.query('ROLLBACK').catch(() => {});
        throw new Error(`Migration ${name} failed; its transaction was rolled back.`);
      }
    }

    if (migrations.length === 0) console.log('No SQL migrations found.');
    return migrations.length;
  } finally {
    if (lockAcquired) {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]).catch(() => {});
    }
    client.release();
  }
}

async function main() {
  const config = loadConfig();
  const pool = createPool(config.databaseUrl, {
    onIdleClientError: () => console.error('Unexpected idle database connection error.'),
  });
  try {
    await migrate(pool);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Database migration failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { checksum, listMigrations, migrate };
