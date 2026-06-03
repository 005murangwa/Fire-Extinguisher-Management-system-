/**
 * @file repository.js
 * @module reporting-service/repository
 *
 * Purpose:
 *   Aggregate (read-only) queries powering the dashboard KPIs, analytics charts
 *   and the four report families (inventory, inspection, compliance,
 *   maintenance). All queries are parameterised.
 */

import { query } from '@fems/shared/db.js';

/** SQL: inspection is overdue (mutually exclusive with pending). */
const INSPECTION_OVERDUE_SQL =
  `(i.status = 'Overdue' OR (i.status = 'Scheduled' AND i.inspection_date < CURRENT_DATE))`;

/** SQL: inspection is pending / upcoming (not overdue, not completed). */
const INSPECTION_PENDING_SQL =
  `(i.status = 'Scheduled' AND i.inspection_date >= CURRENT_DATE)`;

/** SQL: asset is non-compliant / expired for reporting. */
const ASSET_EXPIRED_SQL =
  `(status = 'Expired' OR expiry_date < CURRENT_DATE)`;

/**
 * Scope filter for assigned extinguishers (USER role).
 * @param {string|null} assignedUserId - User id or null for global scope.
 * @param {string} [columnPrefix=''] - Optional table alias prefix.
 * @returns {{ sql: string, params: unknown[] }}
 */
function extinguisherScope(assignedUserId, columnPrefix = '') {
  if (!assignedUserId) return { sql: '', params: [] };
  const col = columnPrefix ? `${columnPrefix}.assigned_to` : 'assigned_to';
  return { sql: ` AND ${col} = $1`, params: [assignedUserId] };
}

/**
 * Coerce PostgreSQL count/bigint strings to integers.
 * @param {unknown} value - Raw DB value.
 * @returns {number}
 */
export function toCount(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Dashboard KPI snapshot.
 * @param {string|null} [assignedUserId=null] - Scope to assigned assets for USER role.
 * @returns {Promise<object>} KPI counts and the compliance percentage.
 */
export async function dashboardKpis(assignedUserId = null) {
  const { sql: extFilter, params } = extinguisherScope(assignedUserId);
  const joinFilter = assignedUserId ? 'AND e.assigned_to = $1' : '';
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*)::int FROM fire_extinguishers WHERE status <> 'Decommissioned' ${extFilter}) AS "totalExtinguishers",
      (SELECT COUNT(*)::int FROM fire_extinguishers WHERE status = 'Active' ${extFilter}) AS "activeExtinguishers",
      (SELECT COUNT(*)::int FROM fire_extinguishers WHERE ${ASSET_EXPIRED_SQL} AND status <> 'Decommissioned' ${extFilter}) AS "expiredExtinguishers",
      (SELECT COUNT(*)::int FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id
         WHERE ${INSPECTION_PENDING_SQL} ${joinFilter}) AS "pendingInspections",
      (SELECT COUNT(*)::int FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id
         WHERE ${INSPECTION_OVERDUE_SQL} ${joinFilter}) AS "overdueInspections",
      (SELECT COUNT(*)::int FROM fire_extinguishers WHERE status = 'Maintenance' ${extFilter}) AS "maintenanceDue",
      (SELECT COUNT(*)::int FROM maintenance_logs m JOIN fire_extinguishers e ON e.id = m.extinguisher_id
         WHERE m.maintenance_date >= date_trunc('month', CURRENT_DATE) ${joinFilter}) AS "maintenanceThisMonth"
  `, params);
  const k = rows[0];
  const total = toCount(k.totalExtinguishers);
  const expired = toCount(k.expiredExtinguishers);
  const compliancePercentage = total === 0 ? 100 : Math.round(((total - expired) / total) * 100);
  return {
    totalExtinguishers: toCount(k.totalExtinguishers),
    activeExtinguishers: toCount(k.activeExtinguishers),
    expiredExtinguishers: expired,
    pendingInspections: toCount(k.pendingInspections),
    overdueInspections: toCount(k.overdueInspections),
    maintenanceDue: toCount(k.maintenanceDue),
    maintenanceThisMonth: toCount(k.maintenanceThisMonth),
    compliancePercentage,
  };
}

/**
 * Extinguisher distribution by a given column (type/location/status).
 * @param {'type'|'location'|'status'} column - Grouping column (whitelisted).
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object[]>} [{ name, value }]
 */
export async function distribution(column, assignedUserId = null) {
  const allowed = { type: 'type', location: 'location', status: 'status' };
  const col = allowed[column] ?? 'type';
  const { sql: scopeSql, params } = extinguisherScope(assignedUserId);
  const { rows } = await query(
    `SELECT ${col} AS name, COUNT(*)::int AS value
       FROM fire_extinguishers
      WHERE status <> 'Decommissioned' ${scopeSql}
      GROUP BY ${col} ORDER BY value DESC`,
    params
  );
  return rows.map((r) => ({ name: r.name, value: toCount(r.value) }));
}

/**
 * Monthly registration trend for the last 12 months.
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object[]>} [{ month, registered }]
 */
export async function registrationTrend(assignedUserId = null) {
  const { sql: scopeSql, params } = extinguisherScope(assignedUserId);
  const { rows } = await query(`
    SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
           COUNT(*)::int AS registered
      FROM fire_extinguishers
     WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
       ${scopeSql}
     GROUP BY 1 ORDER BY 1
  `, params);
  return rows.map((r) => ({ month: r.month, registered: toCount(r.registered) }));
}

/**
 * Inventory report: totals + daily/monthly/yearly counts.
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object>} Inventory summary.
 */
export async function inventoryReport(assignedUserId = null) {
  const { sql: scopeSql, params } = extinguisherScope(assignedUserId);
  const { rows } = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE)::int AS today,
      COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE))::int AS "thisMonth",
      COUNT(*) FILTER (WHERE created_at >= date_trunc('year', CURRENT_DATE))::int AS "thisYear"
      FROM fire_extinguishers
     WHERE status <> 'Decommissioned' ${scopeSql}
  `, params);
  const summary = rows[0];
  const [byType, byLocation, byStatus] = await Promise.all([
    distribution('type', assignedUserId),
    distribution('location', assignedUserId),
    distribution('status', assignedUserId),
  ]);
  return {
    summary: {
      total: toCount(summary.total),
      today: toCount(summary.today),
      thisMonth: toCount(summary.thisMonth),
      thisYear: toCount(summary.thisYear),
    },
    byType,
    byLocation,
    byStatus,
  };
}

/**
 * Inspection report: pending / completed / overdue counts + 12-month trend.
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object>} Inspection summary.
 */
export async function inspectionReport(assignedUserId = null) {
  const joinFilter = assignedUserId ? 'AND e.assigned_to = $1' : '';
  const params = assignedUserId ? [assignedUserId] : [];
  const fromClause = assignedUserId
    ? 'FROM inspections i JOIN fire_extinguishers e ON e.id = i.extinguisher_id'
    : 'FROM inspections i';

  const { rows } = await query(`
    SELECT
      COUNT(*) FILTER (WHERE ${INSPECTION_PENDING_SQL})::int AS pending,
      COUNT(*) FILTER (WHERE i.status = 'Completed')::int AS completed,
      COUNT(*) FILTER (WHERE ${INSPECTION_OVERDUE_SQL})::int AS overdue,
      COUNT(*) FILTER (WHERE i.status = 'Cancelled')::int AS cancelled
      ${fromClause}
     WHERE TRUE ${joinFilter}
  `, params);

  const { rows: trend } = await query(`
    SELECT to_char(date_trunc('month', i.inspection_date), 'YYYY-MM') AS month,
           COUNT(*) FILTER (WHERE i.status = 'Completed')::int AS completed,
           COUNT(*) FILTER (WHERE i.status <> 'Completed' AND i.status <> 'Cancelled')::int AS pending
      ${fromClause}
     WHERE i.inspection_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
       ${joinFilter}
     GROUP BY 1 ORDER BY 1
  `, params);

  const s = rows[0];
  return {
    summary: {
      pending: toCount(s.pending),
      completed: toCount(s.completed),
      overdue: toCount(s.overdue),
      cancelled: toCount(s.cancelled),
    },
    trend: trend.map((r) => ({
      month: r.month,
      completed: toCount(r.completed),
      pending: toCount(r.pending),
    })),
  };
}

/**
 * Compliance report: expired, upcoming expirations and compliance status.
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object>} Compliance summary + lists.
 */
export async function complianceReport(assignedUserId = null) {
  const { sql: scopeSql, params } = extinguisherScope(assignedUserId);
  const baseWhere = `status <> 'Decommissioned' ${scopeSql}`;

  const { rows: counts } = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE ${ASSET_EXPIRED_SQL})::int AS expired,
      COUNT(*) FILTER (
        WHERE expiry_date >= CURRENT_DATE
          AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
      )::int AS "upcomingExpirations",
      COUNT(*) FILTER (
        WHERE expiry_date >= CURRENT_DATE
          AND expiry_date <= CURRENT_DATE + INTERVAL '7 days'
      )::int AS "criticalExpirations"
      FROM fire_extinguishers
     WHERE ${baseWhere}
  `, params);

  const { rows: expiringSoon } = await query(`
    SELECT id, serial_number AS "serialNumber", location, type, expiry_date AS "expiryDate"
      FROM fire_extinguishers
     WHERE ${baseWhere}
       AND expiry_date >= CURRENT_DATE
       AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
     ORDER BY expiry_date ASC LIMIT 50
  `, params);

  const c = counts[0];
  const total = toCount(c.total);
  const expired = toCount(c.expired);
  const compliancePercentage = total === 0 ? 100 : Math.round(((total - expired) / total) * 100);

  return {
    summary: {
      total,
      expired,
      upcomingExpirations: toCount(c.upcomingExpirations),
      criticalExpirations: toCount(c.criticalExpirations),
      compliancePercentage,
    },
    expiringSoon,
  };
}

/**
 * Maintenance report: recent activities, frequency by asset, monthly counts.
 * @param {string|null} [assignedUserId=null] - Optional USER scope.
 * @returns {Promise<object>} Maintenance summary.
 */
export async function maintenanceReport(assignedUserId = null) {
  const joinFilter = assignedUserId ? 'AND e.assigned_to = $1' : '';
  const params = assignedUserId ? [assignedUserId] : [];

  const { rows: recent } = await query(`
    SELECT m.id, e.serial_number AS "serialNumber", m.action_taken AS "actionTaken",
           m.maintenance_date AS "maintenanceDate", m.issues_identified AS "issuesIdentified"
      FROM maintenance_logs m JOIN fire_extinguishers e ON e.id = m.extinguisher_id
     WHERE TRUE ${joinFilter}
     ORDER BY m.maintenance_date DESC, m.created_at DESC LIMIT 20
  `, params);

  const { rows: frequency } = await query(`
    SELECT e.serial_number AS "serialNumber", COUNT(*)::int AS count
      FROM maintenance_logs m JOIN fire_extinguishers e ON e.id = m.extinguisher_id
     WHERE TRUE ${joinFilter}
     GROUP BY e.serial_number ORDER BY count DESC LIMIT 10
  `, params);

  const monthlyFrom = assignedUserId
    ? `FROM maintenance_logs m JOIN fire_extinguishers e ON e.id = m.extinguisher_id`
    : 'FROM maintenance_logs m';
  const { rows: monthly } = await query(`
    SELECT to_char(date_trunc('month', m.maintenance_date), 'YYYY-MM') AS month,
           COUNT(*)::int AS count
      ${monthlyFrom}
     WHERE m.maintenance_date >= date_trunc('month', CURRENT_DATE) - INTERVAL '11 months'
       ${joinFilter}
     GROUP BY 1 ORDER BY 1
  `, params);

  return {
    recent,
    frequency: frequency.map((r) => ({ serialNumber: r.serialNumber, count: toCount(r.count) })),
    monthly: monthly.map((r) => ({ month: r.month, count: toCount(r.count) })),
  };
}

/**
 * Recent activity feed (audit log derived) for the dashboard.
 * @param {number} limit - Max events.
 * @returns {Promise<object[]>} Recent activities.
 */
export async function activityFeed(limit = 15) {
  const { rows } = await query(
    `SELECT a.id, a.action, a.entity, a.entity_id AS "entityId", a.created_at AS "createdAt",
            COALESCE(u.first_name || ' ' || u.last_name, 'System') AS "actor"
       FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

/**
 * List audit logs (admin) with pagination + filters.
 * @param {object} opts - Query options.
 * @returns {Promise<{items:object[], total:number}>} Page + total.
 */
export async function listAuditLogs({ limit, offset, action, entity }) {
  const where = [];
  const params = [];
  let i = 1;
  if (action) { where.push(`a.action = $${i}`); params.push(action); i += 1; }
  if (entity) { where.push(`a.entity = $${i}`); params.push(entity); i += 1; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countRes = await query(`SELECT COUNT(*)::int AS total FROM audit_logs a ${whereSql}`, params);
  const rowsRes = await query(
    `SELECT a.id, a.user_id AS "userId", a.action, a.entity, a.entity_id AS "entityId",
            a.metadata, a.ip_address AS "ipAddress", a.created_at AS "timestamp",
            COALESCE(u.first_name || ' ' || u.last_name, 'System') AS "actor"
       FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id
       ${whereSql}
      ORDER BY a.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: toCount(countRes.rows[0].total) };
}
