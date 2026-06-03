/**
 * @file auth.js
 * @module @fems/shared/middleware/auth
 *
 * Purpose:
 *   Express middleware that authenticates a request by validating the Bearer
 *   access token and attaching the decoded identity to `req.user`.
 *
 * Responsibilities:
 *   - Extract and verify the JWT access token.
 *   - Reject missing/invalid tokens with 401.
 */

import { verifyAccessToken } from '../jwt.js';
import { UnauthorizedError } from '../errors.js';

/**
 * Authentication middleware. On success it sets:
 *   req.user = { id, email, role }
 *
 * @param {import('express').Request} req - Incoming request.
 * @param {import('express').Response} _res - Unused response.
 * @param {import('express').NextFunction} next - Next callback.
 * @returns {void}
 */
export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    return next();
  } catch {
    // Do not echo the underlying JWT error (avoid leaking internals).
    return next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export default authenticate;
