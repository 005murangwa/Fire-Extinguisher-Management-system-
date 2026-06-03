/**
 * @file notifications.js
 * @module @fems/shared/notifications
 *
 * Purpose:
 *   Create in-app notifications (shared DB). Used by request-service and
 *   notification-service so REQUEST_SUBMITTED reaches every admin dashboard.
 */

import { query } from './db.js';
import { ROLES } from './constants.js';

/**
 * Insert one notification for a user.
 * @param {object} payload - Notification fields.
 * @returns {Promise<object|null>} Created row or null if duplicate skipped.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  entity = null,
  entityId = null,
  skipIfExists = false,
}) {
  if (skipIfExists && entityId) {
    const { rows: existing } = await query(
      `SELECT 1 FROM notifications
        WHERE user_id IS NOT DISTINCT FROM $1
          AND type = $2
          AND entity_id IS NOT DISTINCT FROM $3
        LIMIT 1`,
      [userId ?? null, type, entityId]
    );
    if (existing.length > 0) return null;
  }

  const { rows } = await query(
    `INSERT INTO notifications (user_id, type, title, message, entity, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id AS "userId", type, title, message, entity,
               entity_id AS "entityId", is_read AS "isRead", created_at AS "createdAt"`,
    [userId ?? null, type, title, message, entity, entityId]
  );
  return rows[0];
}

/**
 * Notify every active admin (one row per admin for per-user read state).
 * @param {object} payload - type, title, message, entity, entityId.
 * @returns {Promise<number>} Number of notifications created.
 */
export async function notifyAllAdmins({ type, title, message, entity, entityId }) {
  const { rows: admins } = await query(
    `SELECT u.id FROM users u
       JOIN roles r ON r.id = u.role_id
      WHERE r.name = $1 AND u.is_active = TRUE`,
    [ROLES.ADMIN]
  );

  let created = 0;
  for (const admin of admins) {
    const row = await createNotification({
      userId: admin.id,
      type,
      title,
      message,
      entity,
      entityId,
      skipIfExists: true,
    });
    if (row) created += 1;
  }
  return created;
}

/**
 * Notify a single user (e.g. request approved/denied).
 * @param {string} userId - Target user id.
 * @param {object} payload - type, title, message, entity, entityId.
 * @returns {Promise<object|null>} Created notification.
 */
export async function notifyUser(userId, { type, title, message, entity, entityId }) {
  return createNotification({
    userId,
    type,
    title,
    message,
    entity,
    entityId,
    skipIfExists: false,
  });
}

/**
 * REQUEST_SUBMITTED — one in-app notification per active admin.
 * @param {object} payload - Request context.
 * @returns {Promise<number>} Notifications created.
 */
export async function notifyRequestSubmitted({
  requestId,
  requesterEmail,
  requesterName,
  extinguisherSerial,
  reason,
}) {
  const who = requesterName ? `${requesterName} (${requesterEmail})` : requesterEmail;
  return notifyAllAdmins({
    type: 'REQUEST_SUBMITTED',
    title: 'New extinguisher request',
    message: `${who} requested ${extinguisherSerial}. Reason: ${reason}`,
    entity: 'ExtinguisherRequest',
    entityId: requestId,
  });
}

/**
 * REQUEST_APPROVED — notify the requester.
 * @param {object} payload - Request context.
 * @returns {Promise<object|null>}
 */
export async function notifyRequestApproved({ requesterId, requestId, extinguisherSerial }) {
  return notifyUser(requesterId, {
    type: 'REQUEST_APPROVED',
    title: 'Request approved',
    message: `Your request for ${extinguisherSerial} was approved.`,
    entity: 'ExtinguisherRequest',
    entityId: requestId,
  });
}

/**
 * REQUEST_DENIED — notify the requester.
 * @param {object} payload - Request context.
 * @returns {Promise<object|null>}
 */
export async function notifyRequestDenied({ requesterId, requestId, denialReason }) {
  return notifyUser(requesterId, {
    type: 'REQUEST_DENIED',
    title: 'Request denied',
    message: denialReason
      ? `Your extinguisher request was denied. Reason: ${denialReason}`
      : 'Your extinguisher request was denied.',
    entity: 'ExtinguisherRequest',
    entityId: requestId,
  });
}

export default {
  createNotification,
  notifyAllAdmins,
  notifyUser,
  notifyRequestSubmitted,
  notifyRequestApproved,
  notifyRequestDenied,
};
