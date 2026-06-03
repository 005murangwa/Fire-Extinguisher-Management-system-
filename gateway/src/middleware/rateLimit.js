/**
 * @file rateLimit.js
 * @module gateway/middleware/rateLimit
 *
 * Purpose:
 *   Gateway edge rate limiting — 500 requests per 15 minutes with a
 *   localhost whitelist for development.
 */

import rateLimit from 'express-rate-limit';
import { config } from '@fems/shared/config.js';

const WINDOW_MS = 15 * 60 * 1000;

/**
 * @param {import('express').Request} req
 * @returns {boolean}
 */
export function isLocalhostRequest(req) {
  const raw = req.ip || req.socket?.remoteAddress || '';
  const ip = String(raw).replace(/^::ffff:/, '').toLowerCase();
  return (
    ip === '127.0.0.1'
    || ip === '::1'
    || ip === 'localhost'
    || ip === '0.0.0.0'
  );
}

/**
 * Gateway rate limiter (applied once at the edge).
 * @returns {import('express').RequestHandler}
 */
export function gatewayRateLimiter() {
  return rateLimit({
    windowMs: config.security.rateLimitWindowMs || WINDOW_MS,
    max: config.security.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => isLocalhostRequest(req) || req.path === '/health' || req.path === '/docs.json',
    message: {
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' },
    },
  });
}

export default gatewayRateLimiter;
