/**
 * @file repository.js
 * @module notification-service/repository
 *
 * Purpose:
 *   Data access + generation logic for notifications. The generator scans the
 *   domain tables for conditions that warrant a notification and inserts them
 *   idempotently (avoiding duplicates for the same entity/type/day).
 */

import { query } from '@fems/shared/db.js';

const COLUMNS = `id, user_id AS "userId", type, title, message,
  entity, entity_id AS "entityId", is_read AS "isRead", created_at AS "createdAt"`;

/**
 * List notifications for a user with optional filters + pagination.
 * @param {object} opts - Query options.
 * @returns {Promise<{items:object[], total:number}>} Page + total.
 */
export async function list({ userId, limit, offset, type, isRead }) {
  const where = ['(user_id = $1 OR user_id IS NULL)'];
  const params = [userId];
  let i = 2;
  if (type) { where.push(`type = $${i}`); params.push(type); i += 1; }
  if (isRead !== undefined) { where.push(`is_read = $${i}`); params.push(isRead); i += 1; }
  const whereSql = `WHERE ${where.join(' AND ')}`;

  const countRes = await query(`SELECT COUNT(*)::int AS total FROM notifications ${whereSql}`, params);
  const rowsRes = await query(
    `SELECT ${COLUMNS} FROM notifications ${whereSql}
      ORDER BY created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

/**
 * Count unread notifications for a user.
 * @param {string} userId - User id.
 * @returns {Promise<number>} Unread count.
 */
export async function unreadCount(userId) {
  const { rows } = await query(
    'SELECT COUNT(*)::int AS count FROM notifications WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE',
    [userId]
  );
  return rows[0].count;
}

/**
 * Mark a single notification as read.
 * @param {string} id - Notification id.
 * @param {string} userId - Owner id.
 * @returns {Promise<object|null>} Updated notification.
 */
export async function markRead(id, userId) {
  const { rows } = await query(
    `UPDATE notifications SET is_read = TRUE
      WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)
      RETURNING ${COLUMNS}`,
    [id, userId]
  );
  return rows[0] ?? null;
}

/**
 * Mark all of a user's notifications as read.
 * @param {string} userId - User id.
 * @returns {Promise<number>} Number updated.
 */
export async function markAllRead(userId) {
  const { rowCount } = await query(
    'UPDATE notifications SET is_read = TRUE WHERE (user_id = $1 OR user_id IS NULL) AND is_read = FALSE',
    [userId]
  );
  return rowCount;
}

/**
 * Generate notifications by scanning domain data. Inserts are guarded so the
 * same (type, entity_id, day) is not duplicated on repeated runs.
 *
 * Conditions covered:
 *   - Upcoming inspections (next 7 days)
 *   - Overdue inspections
 *   - Expiring extinguishers (next 30 days)
 *   - Maintenance reminders (inspections with "Needs Maintenance" result)
 *
 * @returns {Promise<{created:number}>} How many notifications were created.
 */
export async function generate() {
  const statements = [
    // Upcoming inspections within 7 days.
    `INSERT INTO notifications (user_id, type, title, message, entity, entity_id)
     SELECT i.inspector_id, 'INSPECTION_UPCOMING', 'Upcoming inspection',
            'Inspection for ' || e.serial_number || ' is due on ' || i.inspection_date,
            'Inspection', i.id
       FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id
      WHERE i.status = 'Scheduled'
        AND i.inspection_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
           WHERE n.type = 'INSPECTION_UPCOMING' AND n.entity_id = i.id
             AND n.created_at::date = CURRENT_DATE)`,
    // Overdue inspections.
    `INSERT INTO notifications (user_id, type, title, message, entity, entity_id)
     SELECT i.inspector_id, 'INSPECTION_OVERDUE', 'Overdue inspection',
            'Inspection for ' || e.serial_number || ' was due on ' || i.inspection_date,
            'Inspection', i.id
       FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id
      WHERE i.status IN ('Scheduled', 'Overdue') AND i.inspection_date < CURRENT_DATE
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
           WHERE n.type = 'INSPECTION_OVERDUE' AND n.entity_id = i.id
             AND n.created_at::date = CURRENT_DATE)`,
    // Expiring extinguishers within 30 days.
    `INSERT INTO notifications (user_id, type, title, message, entity, entity_id)
     SELECT NULL, 'EXTINGUISHER_EXPIRING', 'Extinguisher expiring soon',
            e.serial_number || ' at ' || e.location || ' expires on ' || e.expiry_date,
            'Extinguisher', e.id
       FROM fire_extinguishers e
      WHERE e.status = 'Active'
        AND e.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
           WHERE n.type = 'EXTINGUISHER_EXPIRING' AND n.entity_id = e.id
             AND n.created_at::date = CURRENT_DATE)`,
    // Maintenance reminders from inspections needing maintenance.
    `INSERT INTO notifications (user_id, type, title, message, entity, entity_id)
     SELECT i.inspector_id, 'MAINTENANCE_REMINDER', 'Maintenance required',
            'Inspection of ' || e.serial_number || ' flagged maintenance needs',
            'Inspection', i.id
       FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id
      WHERE i.result = 'Needs Maintenance'
        AND NOT EXISTS (
          SELECT 1 FROM notifications n
           WHERE n.type = 'MAINTENANCE_REMINDER' AND n.entity_id = i.id)`,
  ];

  let created = 0;
  for (const sql of statements) {
    const res = await query(sql);
    created += res.rowCount;
  }
  return { created };
}
