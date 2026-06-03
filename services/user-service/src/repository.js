/**
 * @file repository.js
 * @module user-service/repository
 *
 * Purpose:
 *   Parameterised data access for users + roles used by the User Management
 *   Service.
 */

import { query } from '@fems/shared/db.js';

const PUBLIC_COLUMNS = `u.id, u.first_name AS "firstName", u.last_name AS "lastName",
  u.email, r.name AS role, u.is_active AS "isActive", u.last_login_at AS "lastLoginAt",
  u.created_at AS "createdAt", u.updated_at AS "updatedAt"`;

/** Map a role name to its numeric id. */
const ROLE_ID = { ADMIN: 1, INSPECTOR: 2, USER: 3 };

/**
 * List users with optional search/role filter, paginated and sorted.
 *
 * @param {object} opts - Query options.
 * @param {number} opts.limit - Page size.
 * @param {number} opts.offset - Row offset.
 * @param {string} opts.sortBy - Column to sort by.
 * @param {string} opts.sortDir - ASC|DESC.
 * @param {string} [opts.search] - Free-text search (name/email).
 * @param {string} [opts.role] - Role filter.
 * @returns {Promise<{items:object[], total:number}>} Page + total count.
 */
export async function listUsers({ limit, offset, sortBy, sortDir, search, role }) {
  const where = [];
  const params = [];
  let i = 1;
  if (search) {
    where.push(`(u.first_name ILIKE $${i} OR u.last_name ILIKE $${i} OR u.email ILIKE $${i})`);
    params.push(`%${search}%`);
    i += 1;
  }
  if (role) {
    where.push(`r.name = $${i}`);
    params.push(role);
    i += 1;
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await query(
    `SELECT COUNT(*)::int AS total FROM users u JOIN roles r ON r.id = u.role_id ${whereSql}`,
    params
  );

  const rowsRes = await query(
    `SELECT ${PUBLIC_COLUMNS}
       FROM users u JOIN roles r ON r.id = u.role_id
       ${whereSql}
      ORDER BY u.${sortBy} ${sortDir}
      LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

/**
 * Find a public user by id.
 * @param {string} id - User id.
 * @returns {Promise<object|null>} User or null.
 */
export async function findById(id) {
  const { rows } = await query(
    `SELECT ${PUBLIC_COLUMNS} FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Create a user with an explicit role.
 * @param {{firstName:string,lastName:string,email:string,passwordHash:string,role:string}} data
 * @returns {Promise<object>} Created public user.
 */
export async function createUser({
  firstName, lastName, email, passwordHash, role, isFirstLogin = false, invitedBy = null,
}) {
  const { rows } = await query(
    `INSERT INTO users (first_name, last_name, email, password_hash, role_id, is_first_login, invited_by, invited_at, email_verified)
     VALUES ($1,$2,$3,$4,$5,$6,$7::uuid, CASE WHEN $7::uuid IS NOT NULL THEN now() ELSE NULL END, TRUE) RETURNING id`,
    [firstName, lastName, email, passwordHash, ROLE_ID[role], isFirstLogin, invitedBy ?? null]
  );
  return findById(rows[0].id);
}

/**
 * Apply a partial/full update to a user.
 * @param {string} id - User id.
 * @param {object} fields - Fields to update.
 * @returns {Promise<object|null>} Updated user.
 */
export async function updateUser(id, fields) {
  const map = {
    firstName: 'first_name',
    lastName: 'last_name',
    email: 'email',
    isActive: 'is_active',
  };
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
  if (fields.role !== undefined) {
    sets.push(`role_id = $${i}`);
    params.push(ROLE_ID[fields.role]);
    i += 1;
  }
  if (sets.length === 0) return findById(id);
  params.push(id);
  const { rowCount } = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${i}`, params);
  if (rowCount === 0) return null;
  return findById(id);
}

/**
 * Delete a user.
 * @param {string} id - User id.
 * @returns {Promise<boolean>} True when a row was removed.
 */
export async function deleteUser(id) {
  const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
  return rowCount > 0;
}

/**
 * Check email uniqueness, optionally excluding a given user id.
 * @param {string} email - Email.
 * @param {string} [excludeId] - User id to ignore.
 * @returns {Promise<boolean>} True when the email is taken.
 */
export async function emailTaken(email, excludeId) {
  const { rowCount } = await query(
    'SELECT 1 FROM users WHERE lower(email) = lower($1) AND ($2::uuid IS NULL OR id <> $2)',
    [email, excludeId ?? null]
  );
  return rowCount > 0;
}

/**
 * List all roles.
 * @returns {Promise<object[]>} Roles.
 */
export async function listRoles() {
  const { rows } = await query('SELECT id, name, description FROM roles ORDER BY id');
  return rows;
}
