/**
 * @file repository.js
 * @module extinguisher-service/repository
 *
 * Purpose:
 *   Parameterised data access for the fire_extinguishers table, including the
 *   search/filter/sort access patterns required by the specification.
 */

import { query } from '@fems/shared/db.js';

const COLUMNS = `id, serial_number AS "serialNumber", location, type, size,
  installation_date AS "installationDate", expiry_date AS "expiryDate",
  status, assigned_to AS "assignedTo", assigned_at AS "assignedAt",
  assigned_by AS "assignedBy", created_by AS "createdBy",
  created_at AS "createdAt", updated_at AS "updatedAt"`;

const FIELD_MAP = {
  serialNumber: 'serial_number',
  location: 'location',
  type: 'type',
  size: 'size',
  installationDate: 'installation_date',
  expiryDate: 'expiry_date',
  status: 'status',
};

/**
 * List/search extinguishers with filtering, pagination and sorting.
 *
 * @param {object} opts - Options including limit/offset/sort + filters.
 * @returns {Promise<{items:object[], total:number}>} Page + total.
 */
export async function list({
  limit, offset, sortBy, sortDir, search, serialNumber, location, type, status,
  assignedTo, availableOnly,
}) {
  const where = [];
  const params = [];
  let i = 1;

  if (search) {
    where.push(`(serial_number ILIKE $${i} OR location ILIKE $${i})`);
    params.push(`%${search}%`);
    i += 1;
  }
  if (serialNumber) {
    where.push(`serial_number ILIKE $${i}`);
    params.push(`%${serialNumber}%`);
    i += 1;
  }
  if (location) {
    where.push(`location ILIKE $${i}`);
    params.push(`%${location}%`);
    i += 1;
  }
  if (type) {
    where.push(`type = $${i}`);
    params.push(type);
    i += 1;
  }
  if (status) {
    where.push(`status = $${i}`);
    params.push(status);
    i += 1;
  }
  if (assignedTo) {
    where.push(`assigned_to = $${i}`);
    params.push(assignedTo);
    i += 1;
  }
  if (availableOnly) {
    where.push(`assigned_to IS NULL AND status = 'Active'`);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const countRes = await query(`SELECT COUNT(*)::int AS total FROM fire_extinguishers ${whereSql}`, params);
  const rowsRes = await query(
    `SELECT ${COLUMNS} FROM fire_extinguishers ${whereSql}
      ORDER BY ${sortBy} ${sortDir} LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

/**
 * Fetch a single extinguisher by id.
 * @param {string} id - Extinguisher id.
 * @returns {Promise<object|null>} Row or null.
 */
export async function findById(id) {
  const { rows } = await query(`SELECT ${COLUMNS} FROM fire_extinguishers WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

/**
 * Check serial-number uniqueness, optionally excluding an id.
 * @param {string} serialNumber - Candidate serial.
 * @param {string} [excludeId] - Id to ignore.
 * @returns {Promise<boolean>} True when taken.
 */
export async function serialExists(serialNumber, excludeId) {
  const { rowCount } = await query(
    'SELECT 1 FROM fire_extinguishers WHERE lower(serial_number) = lower($1) AND ($2::uuid IS NULL OR id <> $2)',
    [serialNumber, excludeId ?? null]
  );
  return rowCount > 0;
}

/**
 * Insert a new extinguisher.
 * @param {object} data - Extinguisher fields.
 * @param {string|null} createdBy - Creating user id.
 * @returns {Promise<object>} Created row.
 */
export async function create(data, createdBy) {
  const { rows } = await query(
    `INSERT INTO fire_extinguishers
      (serial_number, location, type, size, installation_date, expiry_date, status, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [
      data.serialNumber,
      data.location,
      data.type,
      data.size,
      data.installationDate,
      data.expiryDate,
      data.status ?? 'Active',
      createdBy ?? null,
    ]
  );
  return findById(rows[0].id);
}

/**
 * Update an extinguisher (partial or full).
 * @param {string} id - Extinguisher id.
 * @param {object} fields - Fields to set.
 * @returns {Promise<object|null>} Updated row or null.
 */
export async function update(id, fields) {
  const sets = [];
  const params = [];
  let i = 1;
  for (const [key, col] of Object.entries(FIELD_MAP)) {
    if (fields[key] !== undefined) {
      sets.push(`${col} = $${i}`);
      params.push(fields[key]);
      i += 1;
    }
  }
  if (sets.length === 0) return findById(id);
  params.push(id);
  const { rowCount } = await query(`UPDATE fire_extinguishers SET ${sets.join(', ')} WHERE id = $${i}`, params);
  if (rowCount === 0) return null;
  return findById(id);
}

/**
 * Delete an extinguisher.
 * @param {string} id - Extinguisher id.
 * @returns {Promise<boolean>} True when removed.
 */
export async function remove(id) {
  const { rowCount } = await query('DELETE FROM fire_extinguishers WHERE id = $1', [id]);
  return rowCount > 0;
}

/** Assign extinguisher to a user (admin). */
export async function assign(id, userId, adminId) {
  const { rowCount } = await query(
    `UPDATE fire_extinguishers
        SET assigned_to = $1, assigned_at = now(), assigned_by = $2, updated_at = now()
      WHERE id = $3 AND assigned_to IS NULL`,
    [userId, adminId, id]
  );
  if (rowCount === 0) return null;
  return findById(id);
}

/** Remove assignment. */
export async function unassign(id) {
  const { rowCount } = await query(
    `UPDATE fire_extinguishers
        SET assigned_to = NULL, assigned_at = NULL, assigned_by = NULL, updated_at = now()
      WHERE id = $1`,
    [id]
  );
  if (rowCount === 0) return null;
  return findById(id);
}
