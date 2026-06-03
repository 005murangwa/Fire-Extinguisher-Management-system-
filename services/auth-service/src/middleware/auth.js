/**
 * @file auth.js
 * @module auth-service/middleware/auth
 *
 * Purpose:
 *   Auth-service authentication helpers: JWT verification from Authorization
 *   header or cookies, and secure httpOnly refresh-token cookies so sessions
 *   survive email-link navigation and access-token expiry.
 */

import { verifyAccessToken } from '@fems/shared/jwt.js';
import { config } from '@fems/shared/config.js';
import { UnauthorizedError, BadRequestError } from '@fems/shared/errors.js';

/** Cookie names (refresh is httpOnly; access is readable for SPA API calls). */
export const COOKIE_ACCESS = 'fems_access';
export const COOKIE_REFRESH = 'fems_refresh';

/** Cookie path matches the auth API mount (via gateway or direct). */
export const AUTH_COOKIE_PATH = '/api/v1/auth';

/**
 * Parse the Cookie header into a plain object.
 * @param {import('express').Request} req - Request.
 * @returns {Record<string, string>}
 */
export function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie;
  if (!raw) return out;
  for (const segment of raw.split(';')) {
    const eq = segment.indexOf('=');
    if (eq === -1) continue;
    const key = segment.slice(0, eq).trim();
    const value = segment.slice(eq + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

/**
 * Append a Set-Cookie header (supports multiple cookies).
 * @param {import('express').Response} res - Response.
 * @param {string} name - Cookie name.
 * @param {string} value - Cookie value.
 * @param {object} options - Cookie options.
 * @returns {void}
 */
function appendSetCookie(res, name, value, options) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge != null) parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);

  const current = res.getHeader('Set-Cookie');
  const next = parts.join('; ');
  if (!current) {
    res.setHeader('Set-Cookie', next);
  } else if (Array.isArray(current)) {
    res.setHeader('Set-Cookie', [...current, next]);
  } else {
    res.setHeader('Set-Cookie', [current, next]);
  }
}

/**
 * Set access + refresh token cookies after login / refresh / register.
 * @param {import('express').Response} res - Response.
 * @param {{ accessToken: string, refreshToken: string }} tokens - Token pair.
 * @returns {void}
 */
export function setAuthCookies(res, { accessToken, refreshToken }) {
  const base = {
    path: AUTH_COOKIE_PATH,
    secure: config.isProd,
    sameSite: 'Lax',
  };

  appendSetCookie(res, COOKIE_ACCESS, accessToken, {
    ...base,
    httpOnly: false,
    maxAge: config.jwt.accessTtl,
  });

  appendSetCookie(res, COOKIE_REFRESH, refreshToken, {
    ...base,
    httpOnly: true,
    maxAge: config.jwt.refreshTtl,
  });
}

/**
 * Clear auth cookies on logout.
 * @param {import('express').Response} res - Response.
 * @returns {void}
 */
export function clearAuthCookies(res) {
  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH]) {
    appendSetCookie(res, name, '', {
      path: AUTH_COOKIE_PATH,
      httpOnly: name === COOKIE_REFRESH,
      secure: config.isProd,
      sameSite: 'Lax',
      maxAge: 0,
    });
  }
}

/**
 * Read refresh token from JSON body or httpOnly cookie.
 * @param {import('express').Request} req - Request.
 * @returns {string|undefined}
 */
export function readRefreshToken(req) {
  if (req.body?.refreshToken && String(req.body.refreshToken).length >= 10) {
    return String(req.body.refreshToken);
  }
  const cookies = parseCookies(req);
  return cookies[COOKIE_REFRESH] || undefined;
}

/**
 * Require a refresh token from body or cookie.
 * @param {import('express').Request} req - Request.
 * @returns {string}
 */
export function requireRefreshToken(req) {
  const token = readRefreshToken(req);
  if (!token) {
    throw new BadRequestError('A refresh token is required (body or cookie)');
  }
  return token;
}

/**
 * Authentication middleware. Accepts Bearer header or access cookie.
 * Sets req.user = { id, email, role }.
 *
 * @param {import('express').Request} req - Request.
 * @param {import('express').Response} _res - Response.
 * @param {import('express').NextFunction} next - Next handler.
 * @returns {void}
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, bearer] = header.split(' ');
  const cookies = parseCookies(req);
  const token = (scheme === 'Bearer' && bearer) ? bearer : cookies[COOKIE_ACCESS];

  if (!token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export default authenticate;
