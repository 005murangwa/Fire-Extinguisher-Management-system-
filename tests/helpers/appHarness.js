/**
 * @file appHarness.js
 * Test harness helpers for integration/API tests.
 *
 * Provides:
 *   - `databaseAvailable()` to gate DB-dependent suites (they skip cleanly when
 *     no PostgreSQL is reachable, so the unit suite still runs everywhere).
 *   - `listen(app)` to start an app on an ephemeral port and return a base URL.
 *   - `request()` a tiny fetch wrapper returning { status, body }.
 */

import { createApp } from '@fems/shared/createApp.js';
import { ping, closePool } from '@fems/shared/db.js';

/**
 * Check whether a PostgreSQL database is reachable.
 * @returns {Promise<boolean>} True when the DB answers.
 */
export async function databaseAvailable() {
  try {
    return await ping();
  } catch {
    return false;
  }
}

/**
 * Build and start a service app on an ephemeral port.
 * @param {string} serviceName - Logical name.
 * @param {Function} mountRoutes - Route mounting callback.
 * @param {string} basePath - Mount base path.
 * @returns {Promise<{baseUrl:string, close:()=>Promise<void>}>}
 */
export async function listen(serviceName, mountRoutes, basePath) {
  const { app } = createApp({ serviceName, mountRoutes, basePath, enableRateLimit: false });
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((res) => server.close(res)),
      });
    });
  });
}

/**
 * Minimal fetch wrapper.
 * @param {string} url - Absolute URL.
 * @param {object} [opts] - { method, token, body }.
 * @returns {Promise<{status:number, body:any}>}
 */
export async function request(url, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let body = null;
  try { body = await res.json(); } catch { /* no body */ }
  return { status: res.status, body };
}

export { closePool };
