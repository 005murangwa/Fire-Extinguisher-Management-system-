/**
 * @file config.js
 * @module @fems/shared/config
 *
 * Purpose:
 *   Centralised, validated access to environment configuration for every
 *   microservice. Loading and validating configuration in one place avoids
 *   scattered `process.env` reads and guarantees secrets are sourced from the
 *   environment (never hard-coded), satisfying the project security rules.
 *
 * Responsibilities:
 *   - Load variables from a root `.env` file (development convenience).
 *   - Expose a strongly-shaped, frozen config object.
 *   - Fail fast in production when mandatory secrets are missing.
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Resolve the repository root (.env lives there) relative to this file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../');
dotenv.config({ path: path.join(repoRoot, '.env') });

/**
 * Read an environment variable with an optional fallback.
 *
 * @param {string} key - Environment variable name.
 * @param {string} [fallback] - Value used when the variable is undefined.
 * @returns {string} The resolved value.
 */
function env(key, fallback) {
  const value = process.env[key];
  return value === undefined || value === '' ? fallback : value;
}

/**
 * Read a numeric environment variable.
 *
 * @param {string} key - Environment variable name.
 * @param {number} fallback - Default numeric value.
 * @returns {number} Parsed integer value.
 */
function envInt(key, fallback) {
  const raw = env(key);
  const parsed = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const isProd = env('NODE_ENV', 'development') === 'production';

/** @typedef {Object} FemsConfig */
export const config = Object.freeze({
  env: env('NODE_ENV', 'development'),
  isProd,
  repoRoot,

  db: {
    connectionString: env(
      'DATABASE_URL',
      'postgresql://fems_app:change_me_in_production@localhost:5432/fems'
    ),
    host: env('POSTGRES_HOST', 'localhost'),
    port: envInt('POSTGRES_PORT', 5432),
    database: env('POSTGRES_DB', 'fems'),
    user: env('POSTGRES_USER', 'fems_app'),
    password: env('POSTGRES_PASSWORD', 'change_me_in_production'),
  },

  jwt: {
    accessSecret: env('JWT_ACCESS_SECRET', 'dev_access_secret_change_me'),
    refreshSecret: env('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_me'),
    accessTtl: envInt('JWT_ACCESS_TTL', 900),
    refreshTtl: envInt('JWT_REFRESH_TTL', 604800),
  },

  bcryptRounds: envInt('BCRYPT_ROUNDS', 12),

  ports: {
    gateway: envInt('GATEWAY_PORT', 8080),
    auth: envInt('AUTH_PORT', 4001),
    user: envInt('USER_PORT', 4002),
    extinguisher: envInt('EXTINGUISHER_PORT', 4003),
    inspection: envInt('INSPECTION_PORT', 4004),
    notification: envInt('NOTIFICATION_PORT', 4005),
    reporting: envInt('REPORTING_PORT', 4006),
    request: envInt('REQUEST_PORT', 4007),
  },

  smtp: {
    host: env('SMTP_HOST', ''),
    port: envInt('SMTP_PORT', 587),
    secure: env('SMTP_SECURE', 'false') === 'true',
    user: env('SMTP_USER', ''),
    pass: env('SMTP_PASS', ''),
    from: env('SMTP_FROM', 'TZW FEMS <noreply@tzw.com>'),
  },

  app: {
    publicUrl: env('APP_PUBLIC_URL', 'http://localhost:5173'),
  },

  services: {
    auth: env('AUTH_SERVICE_URL', 'http://localhost:4001'),
    user: env('USER_SERVICE_URL', 'http://localhost:4002'),
    extinguisher: env('EXTINGUISHER_SERVICE_URL', 'http://localhost:4003'),
    inspection: env('INSPECTION_SERVICE_URL', 'http://localhost:4004'),
    notification: env('NOTIFICATION_SERVICE_URL', 'http://localhost:4005'),
    reporting: env('REPORTING_SERVICE_URL', 'http://localhost:4006'),
    request: env('REQUEST_SERVICE_URL', 'http://localhost:4007'),
  },

  security: {
    corsOrigins: env('CORS_ORIGINS', 'http://localhost:5173,http://localhost:8080')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    rateLimitWindowMs: envInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
    rateLimitMax: envInt('RATE_LIMIT_MAX', 500),
    authRateLimitMax: envInt('AUTH_RATE_LIMIT_MAX', 20),
  },
});

// In production, refuse to boot with insecure default secrets.
if (isProd) {
  const insecure = [];
  if (config.jwt.accessSecret.includes('change_me') || config.jwt.accessSecret.includes('dev_')) {
    insecure.push('JWT_ACCESS_SECRET');
  }
  if (config.jwt.refreshSecret.includes('change_me') || config.jwt.refreshSecret.includes('dev_')) {
    insecure.push('JWT_REFRESH_SECRET');
  }
  if (insecure.length > 0) {
    throw new Error(
      `Refusing to start in production with insecure secrets: ${insecure.join(', ')}`
    );
  }
}

export default config;
