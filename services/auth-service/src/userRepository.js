/**
 * @file userRepository.js
 * @module auth-service/userRepository
 *
 * Purpose:
 *   Data-access layer for user + refresh-token tables. All SQL is parameterised
 *   to prevent injection. Keeping persistence here isolates the service layer
 *   from raw SQL (clean architecture).
 *
 * Responsibilities:
 *   - CRUD helpers for users used by authentication flows.
 *   - Refresh-token persistence/rotation/revocation.
 */

import { query } from '@fems/shared/db.js';

/** Columns returned for a "public" user representation (never the hash). */
const PUBLIC_COLUMNS = `u.id, u.first_name AS "firstName", u.last_name AS "lastName",
  u.email, r.name AS role, u.is_active AS "isActive", u.is_first_login AS "isFirstLogin",
  u.email_verified AS "emailVerified", u.last_login_at AS "lastLoginAt",
  u.created_at AS "createdAt", u.updated_at AS "updatedAt"`;

/**
 * Find a user by email, including the password hash (for login).
 *
 * @param {string} email - Email address (already lower-cased).
 * @returns {Promise<object|null>} The user row or null.
 */
export async function findByEmailWithHash(email) {
  const { rows } = await query(
    `SELECT u.id, u.first_name AS "firstName", u.last_name AS "lastName", u.email,
            u.password_hash AS "passwordHash", r.name AS role, u.is_active AS "isActive"
       FROM users u JOIN roles r ON r.id = u.role_id
      WHERE lower(u.email) = lower($1)`,
    [email]
  );
  return rows[0] ?? null;
}

/**
 * Find a public user representation by id.
 *
 * @param {string} id - User UUID.
 * @returns {Promise<object|null>} Public user or null.
 */
export async function findPublicById(id) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Check whether an email is already registered.
 *
 * @param {string} email - Candidate email.
 * @returns {Promise<boolean>} True when taken.
 */
export async function emailExists(email) {
  const { rowCount } = await query('SELECT 1 FROM users WHERE lower(email) = lower($1)', [email]);
  return rowCount > 0;
}

/**
 * Create a new user with the USER role by default.
 *
 * @param {{firstName:string,lastName:string,email:string,passwordHash:string,roleId?:number}} data
 * @returns {Promise<object>} The created public user.
 */
export async function createUser({
  firstName, lastName, email, passwordHash, roleId = 3, emailVerified = false, isFirstLogin = false,
}) {
  const { rows } = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role_id, email_verified, is_first_login)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [firstName, lastName, email, passwordHash, roleId, emailVerified, isFirstLogin]
  );
  return findPublicById(rows[0].id);
}

/** Clear first-login flag after password change. */
export async function clearFirstLogin(userId) {
  await query('UPDATE users SET is_first_login = FALSE, updated_at = now() WHERE id = $1', [userId]);
}

/**
 * Update mutable profile fields.
 *
 * @param {string} id - User id.
 * @param {{firstName?:string,lastName?:string,email?:string}} fields - Partial fields.
 * @returns {Promise<object|null>} Updated public user.
 */
export async function updateProfile(id, fields) {
  const map = { firstName: 'first_name', lastName: 'last_name', email: 'email' };
  const sets = [];
  const params = [];
  let i = 1;
  for (const [key, col] of Object.entries(map)) {
    if (fields[key] !== undefined) {
      sets.push(`${col} = $${i}`);
      params.push(fields[key]);
      i += 1;
    }
  }
  if (sets.length === 0) return findPublicById(id);
  params.push(id);
  await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, params);
  return findPublicById(id);
}

/**
 * Record a successful login timestamp.
 * @param {string} id - User id.
 * @returns {Promise<void>}
 */
export async function touchLogin(id) {
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [id]);
}

/**
 * Update a user's password hash.
 * @param {string} id - User id.
 * @param {string} passwordHash - New bcrypt hash.
 * @returns {Promise<void>}
 */
export async function updatePassword(id, passwordHash) {
  await query('UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_expires_at = NULL WHERE id = $2', [
    passwordHash,
    id,
  ]);
}

/**
 * Fetch the stored password hash for a user.
 * @param {string} id - User id.
 * @returns {Promise<string|null>} The hash or null.
 */
export async function getPasswordHash(id) {
  const { rows } = await query('SELECT password_hash AS "passwordHash" FROM users WHERE id = $1', [id]);
  return rows[0]?.passwordHash ?? null;
}

/**
 * Persist a password reset token hash + expiry.
 * @param {string} id - User id.
 * @param {string} tokenHash - Hashed reset token.
 * @param {Date} expiresAt - Expiry timestamp.
 * @returns {Promise<void>}
 */
export async function setResetToken(id, tokenHash, expiresAt) {
  await query('UPDATE users SET reset_token_hash = $1, reset_expires_at = $2 WHERE id = $3', [
    tokenHash,
    expiresAt,
    id,
  ]);
}

/**
 * Find a user whose (non-expired) reset token hash matches.
 * @param {string} tokenHash - Hashed reset token.
 * @returns {Promise<{id:string}|null>} The user id or null.
 */
export async function findByResetToken(tokenHash) {
  const { rows } = await query(
    'SELECT id FROM users WHERE reset_token_hash = $1 AND reset_expires_at > now()',
    [tokenHash]
  );
  return rows[0] ?? null;
}

/**
 * Clear password reset token fields after a successful reset.
 * @param {string} id - User id.
 * @returns {Promise<void>}
 */
export async function clearResetToken(id) {
  await query(
    'UPDATE users SET reset_token_hash = NULL, reset_expires_at = NULL, updated_at = now() WHERE id = $1',
    [id]
  );
}

// --- Refresh token persistence ---

/**
 * Store a refresh token hash for a user.
 * @param {string} userId - User id.
 * @param {string} tokenHash - Hash of the refresh token.
 * @param {Date} expiresAt - Expiry timestamp.
 * @returns {Promise<void>}
 */
export async function storeRefreshToken(userId, tokenHash, expiresAt) {
  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1,$2,$3)',
    [userId, tokenHash, expiresAt]
  );
}

/**
 * Look up an active (non-revoked, non-expired) refresh token.
 * @param {string} tokenHash - Hash of the refresh token.
 * @returns {Promise<{id:string,userId:string}|null>} Token record or null.
 */
export async function findActiveRefreshToken(tokenHash) {
  const { rows } = await query(
    `SELECT id, user_id AS "userId" FROM refresh_tokens
      WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

/**
 * Revoke a refresh token by its hash.
 * @param {string} tokenHash - Hash of the refresh token.
 * @returns {Promise<void>}
 */
export async function revokeRefreshToken(tokenHash) {
  await query('UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1', [tokenHash]);
}
