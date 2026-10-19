'use strict';

function loadConfig(env = process.env) {
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(databaseUrl);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!parsedUrl.username || !parsedUrl.password || parsedUrl.pathname.length < 2) {
    throw new Error('DATABASE_URL must include a PostgreSQL host, database, username, and password.');
  }

  const portValue = env.PORT ?? '3000';
  const port = Number(portValue);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  return { databaseUrl, port };
}

module.exports = { loadConfig };
