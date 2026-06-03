/**
 * @file password.js
 * @module @fems/shared/password
 *
 * Purpose:
 *   Centralise password hashing/verification and enforce the strong password
 *   policy required by the specification.
 *
 * Responsibilities:
 *   - Hash and verify passwords with bcrypt.
 *   - Validate password strength and report human-readable failures.
 */

import bcrypt from 'bcryptjs';
import { config } from './config.js';

/**
 * Hash a plaintext password using bcrypt with the configured cost factor.
 *
 * @param {string} plain - Plaintext password.
 * @returns {Promise<string>} The bcrypt hash.
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, config.bcryptRounds);
}

/**
 * Compare a plaintext password against a stored hash.
 *
 * @param {string} plain - Candidate plaintext password.
 * @param {string} hash - Stored bcrypt hash.
 * @returns {Promise<boolean>} True when the password matches.
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Validate password strength.
 *
 * Policy: at least 8 characters and contain lower-case, upper-case, a digit
 * and a special character.
 *
 * @param {string} password - Candidate password.
 * @returns {{valid: boolean, message?: string}} Validation result.
 */
export function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain a lowercase letter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain an uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a number' };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain a special character' };
  }
  return { valid: true };
}

export default { hashPassword, verifyPassword, validatePasswordStrength };
