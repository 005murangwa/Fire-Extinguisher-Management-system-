/**
 * @file security.js
 * @module @fems/shared/middleware/security
 *
 * Purpose:
 *   Bundle the cross-cutting HTTP security middleware (secure headers, CORS,
 *   rate limiting) so every service mounts an identical, hardened baseline.
 *
 * Responsibilities:
 *   - helmet for secure headers / basic XSS & clickjacking protection.
 *   - CORS restricted to an allow-list of origins.
 *   - Per-IP rate limiting with a stricter limiter for auth routes.
 */

import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { config } from '../config.js';

/**
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function isLocalhostRequest(req) {
  const raw = req.ip || req.socket?.remoteAddress || '';
  const ip = String(raw).replace(/^::ffff:/, '').toLowerCase();
  return ip === '127.0.0.1' || ip === '::1' || ip === 'localhost';
}

/**
 * Secure HTTP headers via helmet. CSP is relaxed for Swagger UI assets but
 * keeps the important protections (HSTS, noSniff, frameguard, etc.).
 *
 * @returns {import('express').RequestHandler} helmet middleware.
 */
export function secureHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
}

/**
 * CORS middleware restricted to the configured origin allow-list.
 *
 * @returns {import('express').RequestHandler} cors middleware.
 */
export function corsMiddleware() {
  return cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server (no Origin header) requests.
      if (!origin || config.security.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  });
}

/**
 * General per-IP rate limiter applied to all routes.
 *
 * @returns {import('express').RequestHandler} rate limit middleware.
 */
export function generalRateLimiter() {
  return rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => isLocalhostRequest(req) || req.path === '/health',
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
    },
  });
}

/**
 * Stricter limiter for sensitive auth endpoints (login/register/reset) to slow
 * brute-force attempts.
 *
 * @returns {import('express').RequestHandler} rate limit middleware.
 */
export function authRateLimiter() {
  return rateLimit({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.authRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many attempts, please try again later' },
    },
  });
}

export default { secureHeaders, corsMiddleware, generalRateLimiter, authRateLimiter };
