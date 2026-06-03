/**
 * @file audit.js
 * @module @fems/shared/audit
 *
 * Purpose:
 *   Persist audit-log entries for security-relevant actions. Audit logging is
 *   a hard requirement; this helper guarantees a consistent record shape.
 *
 * Responsibilities:
 *   - Insert into the AuditLogs table without ever throwing into the caller's
 *     request flow (auditing must not break the primary operation).
 */

import { query } from './db.js';

/**
 * Write an audit log entry.
 *
 * Audit fields recorded: id (generated), userId, action, entity, entityId,
 * timestamp (generated), plus optional metadata and request IP for traceability.
 *
 * @param {object} entry - Audit entry.
 * @param {string|null} entry.userId - Acting user id (null for anonymous).
 * @param {string} entry.action - Stable action code (see AUDIT_ACTIONS).
 * @param {string} entry.entity - Affected entity name (e.g. "Extinguisher").
 * @param {string|null} [entry.entityId] - Affected entity id.
 * @param {object} [entry.metadata] - Extra structured context.
 * @param {string|null} [entry.ip] - Originating IP address.
 * @returns {Promise<void>} Resolves once the entry is stored (or silently dropped).
 */
export async function writeAudit({ userId, action, entity, entityId = null, metadata = null, ip = null }) {
  try {
    await query(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entity, entityId, metadata ? JSON.stringify(metadata) : null, ip]
    );
  } catch (err) {
    // Auditing failures must never break the primary request. Log and move on.
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log', { action, entity, error: err.message });
  }
}

export default writeAudit;
