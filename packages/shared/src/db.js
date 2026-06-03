/**
 * @file db.js
 * @module @fems/shared/db
 *
 * Purpose:
 *   Provide a single shared PostgreSQL connection pool plus thin query helpers.
 *   All database access goes through parameterised queries to eliminate SQL
 *   injection (security requirement).
 *
 * Responsibilities:
 *   - Lazily create one pg Pool per process.
 *   - Expose `query` and `withTransaction` helpers.
 *   - Surface readiness checks for health endpoints.
 */

import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

/** @type {import('pg').Pool | null} */
let pool = null;

/**
 * Get (or lazily create) the shared connection pool.
 *
 * @returns {import('pg').Pool} The process-wide pool.
 */
export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: config.db.connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
    });
    // Surface unexpected idle client errors instead of crashing silently.
    pool.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Unexpected idle PG client error', err);
    });
  }
  return pool;
}

/**
 * Execute a parameterised SQL query.
 *
 * @template T
 * @param {string} text - SQL text using $1, $2 ... placeholders.
 * @param {Array<unknown>} [params] - Bound parameters.
 * @returns {Promise<import('pg').QueryResult<T>>} Query result.
 */
export function query(text, params = []) {
  return getPool().query(text, params);
}

/**
 * Run a set of statements inside a single transaction. The callback receives a
 * dedicated client; the transaction is committed on success and rolled back on
 * any thrown error.
 *
 * @template T
 * @param {(client: import('pg').PoolClient) => Promise<T>} fn - Work to run.
 * @returns {Promise<T>} Result returned by the callback.
 */
export async function withTransaction(fn) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Lightweight connectivity check used by /health endpoints.
 *
 * @returns {Promise<boolean>} True when the database answers `SELECT 1`.
 */
export async function ping() {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}

/**
 * Gracefully close the pool (used on shutdown / in tests).
 *
 * @returns {Promise<void>}
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export default { getPool, query, withTransaction, ping, closePool };
