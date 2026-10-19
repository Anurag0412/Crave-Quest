'use strict';

const HTTP_GRACE_PERIOD_MS = 5_000;
const POOL_CLOSE_TIMEOUT_MS = 2_000;

function waitFor(promise, timeoutMs) {
  let timer;
  return Promise.race([
    promise.then(
      (value) => ({ completed: true, value }),
      (error) => ({ completed: true, error }),
    ),
    new Promise((resolve) => {
      timer = setTimeout(() => resolve({ completed: false }), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer));
}

function createShutdown(server, pool, {
  gracePeriodMs = HTTP_GRACE_PERIOD_MS,
  poolCloseTimeoutMs = POOL_CLOSE_TIMEOUT_MS,
  onError = () => {},
  onHardTimeout = () => process.exit(1),
} = {}) {
  let shutdownPromise;

  return (signal) => {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = (async () => {
      let httpClosedResolve;
      const httpClosed = new Promise((resolve) => { httpClosedResolve = resolve; });

      // server.close() stops accepting connections immediately.
      server.close((error) => httpClosedResolve(error ?? null));
      server.closeIdleConnections?.();

      const httpResult = await waitFor(httpClosed, gracePeriodMs);
      if (!httpResult.completed) {
        onError(`HTTP requests exceeded the ${gracePeriodMs} ms shutdown grace period.`);
        server.closeAllConnections?.();
      } else if (httpResult.value || httpResult.error) {
        onError('HTTP server shutdown failed.');
      }

      let poolClose;
      try {
        poolClose = Promise.resolve(pool.end());
      } catch {
        onError('Database pool shutdown failed.');
        return;
      }

      const poolResult = await waitFor(poolClose, poolCloseTimeoutMs);
      if (!poolResult.completed) {
        onError(`Database pool did not close within ${poolCloseTimeoutMs} ms; forcing process exit.`);
        onHardTimeout(signal);
        return;
      }
      if (poolResult.error || poolResult.value instanceof Error) {
        onError('Database pool shutdown failed.');
      }
    })();

    return shutdownPromise;
  };
}

module.exports = {
  HTTP_GRACE_PERIOD_MS,
  POOL_CLOSE_TIMEOUT_MS,
  createShutdown,
};
