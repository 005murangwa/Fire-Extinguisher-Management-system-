/**
 * @file repository.js
 * @module inspection-service/repository
 *
 * Purpose:
 *   Parameterised data access for inspections and maintenance logs, including
 *   the combined per-asset timeline used by the UI.
 */

import { query } from '@fems/shared/db.js';

const INSPECTION_COLUMNS = `i.id, i.extinguisher_id AS "extinguisherId",
  i.inspector_id AS "inspectorId", i.scheduled_by AS "scheduledBy",
  i.inspection_date AS "inspectionDate", i.inspection_time AS "inspectionTime",
  i.status, i.result, i.notes, i.completed_at AS "completedAt",
  i.created_at AS "createdAt", i.updated_at AS "updatedAt",
  e.serial_number AS "extinguisherSerial", e.location AS "extinguisherLocation"`;

const MAINT_COLUMNS = `m.id, m.extinguisher_id AS "extinguisherId", m.inspection_id AS "inspectionId",
  m.performed_by AS "performedBy", m.action_taken AS "actionTaken",
  m.maintenance_date AS "maintenanceDate", m.issues_identified AS "issuesIdentified",
  m.notes, m.recommendations, m.created_at AS "createdAt",
  e.serial_number AS "extinguisherSerial"`;

/**
 * Ensure the referenced extinguisher exists.
 * @param {string} id - Extinguisher id.
 * @returns {Promise<boolean>} True when it exists.
 */
export async function extinguisherExists(id) {
  const { rowCount } = await query('SELECT 1 FROM fire_extinguishers WHERE id = $1', [id]);
  return rowCount > 0;
}

/**
 * Check whether the slot (extinguisher + date + time) is already taken by a
 * non-cancelled inspection (duplicate scheduling guard).
 * @param {string} extinguisherId - Extinguisher id.
 * @param {string} date - Inspection date.
 * @param {string} time - Inspection time.
 * @returns {Promise<boolean>} True when a duplicate exists.
 */
export async function slotTaken(extinguisherId, date, time) {
  const { rowCount } = await query(
    `SELECT 1 FROM inspections
      WHERE extinguisher_id = $1 AND inspection_date = $2 AND inspection_time = $3
        AND status <> 'Cancelled'`,
    [extinguisherId, date, time]
  );
  return rowCount > 0;
}

/**
 * List inspections with filters + pagination.
 * @param {object} opts - Query options.
 * @returns {Promise<{items:object[], total:number}>} Page + total.
 */
export async function listInspections({
  limit, offset, sortBy, sortDir, status, extinguisherId, inspectorId, assignedUserId,
}) {
  const where = [];
  const params = [];
  let i = 1;
  if (status) { where.push(`i.status = $${i}`); params.push(status); i += 1; }
  if (extinguisherId) { where.push(`i.extinguisher_id = $${i}`); params.push(extinguisherId); i += 1; }
  if (inspectorId) { where.push(`i.inspector_id = $${i}`); params.push(inspectorId); i += 1; }
  if (assignedUserId) { where.push(`e.assigned_to = $${i}`); params.push(assignedUserId); i += 1; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const fromSql = `FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id`;

  const countRes = await query(`SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`, params);
  const rowsRes = await query(
    `SELECT ${INSPECTION_COLUMNS}
       ${fromSql}
       ${whereSql}
      ORDER BY i.${sortBy} ${sortDir} LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

/**
 * Fetch a single inspection.
 * @param {string} id - Inspection id.
 * @returns {Promise<object|null>} Row or null.
 */
export async function findInspection(id) {
  const { rows } = await query(
    `SELECT ${INSPECTION_COLUMNS} FROM inspections i
       JOIN fire_extinguishers e ON e.id = i.extinguisher_id WHERE i.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

/**
 * Create (schedule) an inspection.
 * @param {object} data - Inspection fields.
 * @param {string} scheduledBy - Scheduling user id.
 * @returns {Promise<object>} Created inspection.
 */
export async function scheduleInspection(data, scheduledBy) {
  const { rows } = await query(
    `INSERT INTO inspections
       (extinguisher_id, inspector_id, scheduled_by, inspection_date, inspection_time, notes)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [data.extinguisherId, data.inspectorId ?? null, scheduledBy, data.inspectionDate, data.inspectionTime, data.notes ?? null]
  );
  return findInspection(rows[0].id);
}

/**
 * Update an inspection. When the status becomes "Completed" the completed_at
 * timestamp is set automatically.
 * @param {string} id - Inspection id.
 * @param {object} fields - Fields to update.
 * @returns {Promise<object|null>} Updated inspection.
 */
export async function updateInspection(id, fields) {
  const map = {
    status: 'status',
    result: 'result',
    inspectorId: 'inspector_id',
    inspectionDate: 'inspection_date',
    inspectionTime: 'inspection_time',
    notes: 'notes',
  };
  const sets = [];
  const params = [];
  let i = 1;
  for (const [key, col] of Object.entries(map)) {
    if (fields[key] !== undefined) { sets.push(`${col} = $${i}`); params.push(fields[key]); i += 1; }
  }
  if (fields.status === 'Completed') {
    sets.push(`completed_at = now()`);
  }
  if (sets.length === 0) return findInspection(id);
  params.push(id);
  const { rowCount } = await query(`UPDATE inspections SET ${sets.join(', ')} WHERE id = $${i}`, params);
  if (rowCount === 0) return null;
  return findInspection(id);
}

/**
 * Cancel an inspection (soft state change).
 * @param {string} id - Inspection id.
 * @returns {Promise<object|null>} Updated inspection.
 */
export async function cancelInspection(id) {
  const { rowCount } = await query(
    `UPDATE inspections SET status = 'Cancelled' WHERE id = $1 AND status <> 'Completed'`,
    [id]
  );
  if (rowCount === 0) return null;
  return findInspection(id);
}

// --- Maintenance ---

/**
 * List maintenance logs with filters + pagination.
 * @param {object} opts - Query options.
 * @returns {Promise<{items:object[], total:number}>} Page + total.
 */
export async function listMaintenance({ limit, offset, sortBy, sortDir, extinguisherId, assignedUserId }) {
  const where = [];
  const params = [];
  let i = 1;
  if (extinguisherId) { where.push(`m.extinguisher_id = $${i}`); params.push(extinguisherId); i += 1; }
  if (assignedUserId) { where.push(`e.assigned_to = $${i}`); params.push(assignedUserId); i += 1; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const fromSql =
    'FROM maintenance_logs m JOIN fire_extinguishers e ON e.id = m.extinguisher_id';

  const countRes = await query(`SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`, params);
  const rowsRes = await query(
    `SELECT ${MAINT_COLUMNS}
       ${fromSql}
       ${whereSql}
      ORDER BY m.${sortBy} ${sortDir} LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

/**
 * Create a maintenance log entry.
 * @param {object} data - Maintenance fields.
 * @param {string} performedBy - Performing user id.
 * @returns {Promise<object>} Created log.
 */
export async function createMaintenance(data, performedBy) {
  const { rows } = await query(
    `INSERT INTO maintenance_logs
       (extinguisher_id, inspection_id, performed_by, action_taken, maintenance_date,
        issues_identified, notes, recommendations)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
    [
      data.extinguisherId, data.inspectionId ?? null, performedBy, data.actionTaken,
      data.maintenanceDate, data.issuesIdentified ?? null, data.notes ?? null, data.recommendations ?? null,
    ]
  );
  const { rows: out } = await query(
    `SELECT ${MAINT_COLUMNS} FROM maintenance_logs m
       JOIN fire_extinguishers e ON e.id = m.extinguisher_id WHERE m.id = $1`,
    [rows[0].id]
  );
  return out[0];
}

/**
 * Build a chronological timeline (inspections + maintenance) for one asset.
 * @param {string} extinguisherId - Extinguisher id.
 * @returns {Promise<object[]>} Ordered timeline events.
 */
export async function timeline(extinguisherId) {
  const { rows } = await query(
    `SELECT 'inspection' AS kind, i.id, i.inspection_date AS date, i.status AS label,
            i.result AS detail, i.created_at AS "createdAt"
       FROM inspections i WHERE i.extinguisher_id = $1
     UNION ALL
     SELECT 'maintenance' AS kind, m.id, m.maintenance_date AS date, m.action_taken AS label,
            m.issues_identified AS detail, m.created_at AS "createdAt"
       FROM maintenance_logs m WHERE m.extinguisher_id = $1
     ORDER BY date DESC, "createdAt" DESC`,
    [extinguisherId]
  );
  return rows;
}
