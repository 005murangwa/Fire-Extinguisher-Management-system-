/**
 * @file jwt.js
 * @module @fems/shared/jwt
 *
 * Purpose:
 *   Encapsulate JSON Web Token creation/verification for access and refresh
 *   tokens so the signing strategy lives in exactly one place.
 *
 * Responsibilities:
 *   - Sign short-lived access tokens and long-lived refresh tokens.
 *   - Verify each token type against the correct secret.
 */

import jwt from 'jsonwebtoken';
import { config } from './config.js';

/**
 * Sign a short-lived access token.
 *
 * @param {{sub:string, email:string, role:string}} payload - Token claims.
 * @returns {string} Signed JWT access token.
 */
export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTtl,
    issuer: 'fems-auth',
    audience: 'fems-api',
  });
}

/**
 * Sign a long-lived refresh token. A `jti` (token id) should be supplied so the
 * token can be revoked server-side.
 *
 * @param {{sub:string, jti:string}} payload - Refresh token claims.
 * @returns {string} Signed JWT refresh token.
 */
export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTtl,
    issuer: 'fems-auth',
    audience: 'fems-refresh',
  });
}

/**
 * Verify an access token.
 *
 * @param {string} token - Raw JWT string.
 * @returns {jwt.JwtPayload} Decoded claims.
 * @throws {jwt.JsonWebTokenError} When the token is invalid/expired.
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: 'fems-auth',
    audience: 'fems-api',
  });
}

/**
 * Verify a refresh token.
 *
 * @param {string} token - Raw JWT string.
 * @returns {jwt.JwtPayload} Decoded claims.
 * @throws {jwt.JsonWebTokenError} When the token is invalid/expired.
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: 'fems-auth',
    audience: 'fems-refresh',
  });
}

export default {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
