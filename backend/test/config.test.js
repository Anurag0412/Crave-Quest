'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { loadConfig } = require('../src/config');
const packageJson = require('../package.json');

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

test('start and db:migrate load .env with Node from a separate working directory', (t) => {
  assert.match(packageJson.scripts.start, /^node --env-file=\.env /);
  assert.match(packageJson.scripts['db:migrate'], /^node --env-file=\.env /);

  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'cravequest-env-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(directory, '.env'),
    'DATABASE_URL=postgresql://demo:placeholder@localhost:5432/demo\nPORT=4321\n',
  );

  const configPath = path.resolve(__dirname, '../src/config.js');
  const probe = spawnSync(
    process.execPath,
    ['--env-file=.env', '-e', `process.stdout.write(String(require(${JSON.stringify(configPath)}).loadConfig().port))`],
    {
      cwd: directory,
      encoding: 'utf8',
      env: Object.fromEntries(Object.entries(process.env).filter(([key]) => !['DATABASE_URL', 'PORT'].includes(key))),
    },
  );

  assert.equal(probe.error, undefined);
  assert.equal(probe.status, 0, probe.stderr);
  assert.equal(probe.stdout, '4321');
  assert.equal(probe.stderr, '');
});
