'use strict';

const { loadConfig } = require('./config');
const { createPool } = require('./database');
const { createHealthServer } = require('./health-server');
const { createShutdown } = require('./shutdown');

async function startServer() {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    if (!process.env.DATABASE_URL) {
      config = {
        databaseUrl: null,
        port: Number(process.env.PORT || 3000),
      };
    } else {
      throw error;
    }
  }
  const pool = createPool(config.databaseUrl, {
    onIdleClientError: () => console.error('Unexpected idle database connection error.'),
  });
  const server = createHealthServer(pool, {
    onDatabaseError: () => console.error('Database health check failed.'),
    onApiError: () => console.error('API request failed.'),
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, () => {
      server.removeListener('error', reject);
      resolve();
    });
  });

  console.log(`CraveQuest backend listening on port ${config.port}.`);
  return { server, pool };
}

if (require.main === module) {
  startServer()
    .then(({ server, pool }) => {
      const shutdown = createShutdown(server, pool, {
        onError: (message) => {
          console.error(message);
          process.exitCode = 1;
        },
      });
      const handleSignal = (signal) => {
        console.log(`Received ${signal}; closing the HTTP server and database pool.`);
        void shutdown(signal);
      };

      process.once('SIGINT', () => handleSignal('SIGINT'));
      process.once('SIGTERM', () => handleSignal('SIGTERM'));
    })
    .catch((error) => {
      console.error(`Backend startup failed: ${error.message}`);
      process.exitCode = 1;
    });
}

module.exports = { startServer };
