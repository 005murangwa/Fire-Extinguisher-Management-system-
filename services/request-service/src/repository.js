import { query, withTransaction } from '@fems/shared/db.js';

const REQ_COLS = `r.id, r.requester_id AS "requesterId", r.extinguisher_id AS "extinguisherId",
  r.reason, r.location_details AS "locationDetails", r.status, r.denial_reason AS "denialReason",
  r.approved_by AS "approvedBy", r.approved_at AS "approvedAt",
  r.created_at AS "createdAt", r.updated_at AS "updatedAt",
  e.serial_number AS "extinguisherSerial", e.location AS "extinguisherLocation",
  u.first_name || ' ' || u.last_name AS "requesterName"`;

export async function listRequests({ limit, offset, status, requesterId }) {
  const where = [];
  const params = [];
  let i = 1;
  if (status) { where.push(`r.status = $${i}`); params.push(status); i += 1; }
  if (requesterId) { where.push(`r.requester_id = $${i}`); params.push(requesterId); i += 1; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const countRes = await query(
    `SELECT COUNT(*)::int AS total FROM extinguisher_requests r ${whereSql}`, params
  );
  const rowsRes = await query(
    `SELECT ${REQ_COLS}
       FROM extinguisher_requests r
       JOIN fire_extinguishers e ON e.id = r.extinguisher_id
       JOIN users u ON u.id = r.requester_id
       ${whereSql}
      ORDER BY r.created_at DESC LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  return { items: rowsRes.rows, total: countRes.rows[0].total };
}

export async function findRequest(id) {
  const { rows } = await query(
    `SELECT ${REQ_COLS}
       FROM extinguisher_requests r
       JOIN fire_extinguishers e ON e.id = r.extinguisher_id
       JOIN users u ON u.id = r.requester_id
      WHERE r.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findPendingByUserAndExtinguisher(extinguisherId, requesterId) {
  const { rows } = await query(
    `SELECT id FROM extinguisher_requests
      WHERE extinguisher_id = $1 AND requester_id = $2 AND status = 'PENDING'`,
    [extinguisherId, requesterId]
  );
  return rows[0] ?? null;
}

export async function findPendingForUser(requesterId) {
  const { rows } = await query(
    `SELECT id, extinguisher_id AS "extinguisherId"
       FROM extinguisher_requests
      WHERE requester_id = $1 AND status = 'PENDING'
      ORDER BY created_at DESC LIMIT 1`,
    [requesterId]
  );
  return rows[0] ?? null;
}

export async function extinguisherHasPending(extinguisherId) {
  const { rowCount } = await query(
    `SELECT 1 FROM extinguisher_requests
      WHERE extinguisher_id = $1 AND status = 'PENDING'`,
    [extinguisherId]
  );
  return rowCount > 0;
}

export async function createRequest({ requesterId, extinguisherId, reason, locationDetails }) {
  const { rows } = await query(
    `INSERT INTO extinguisher_requests (requester_id, extinguisher_id, reason, location_details)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [requesterId, extinguisherId, reason, locationDetails ?? null]
  );
  return findRequest(rows[0].id);
}

export async function approveRequest(id, adminId) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT r.*, e.assigned_to FROM extinguisher_requests r
         JOIN fire_extinguishers e ON e.id = r.extinguisher_id
        WHERE r.id = $1 AND r.status = 'PENDING' FOR UPDATE`,
      [id]
    );
    const req = rows[0];
    if (!req) return null;
    if (req.assigned_to) return { error: 'UNAVAILABLE' };

    await client.query(
      `UPDATE fire_extinguishers SET assigned_to = $1, assigned_at = now(), assigned_by = $2, updated_at = now()
        WHERE id = $3 AND assigned_to IS NULL`,
      [req.requester_id, adminId, req.extinguisher_id]
    );
    await client.query(
      `UPDATE extinguisher_requests SET status = 'APPROVED', approved_by = $1, approved_at = now(), updated_at = now()
        WHERE id = $2`,
      [adminId, id]
    );
    await client.query(
      `INSERT INTO assignments (user_id, extinguisher_id, assigned_by) VALUES ($1,$2,$3)`,
      [req.requester_id, req.extinguisher_id, adminId]
    );
    return findRequest(id);
  });
}

export async function denyRequest(id, adminId, denialReason) {
  const { rowCount } = await query(
    `UPDATE extinguisher_requests
        SET status = 'DENIED', denial_reason = $1, approved_by = $2, approved_at = now(), updated_at = now()
      WHERE id = $3 AND status = 'PENDING'`,
    [denialReason, adminId, id]
  );
  if (rowCount === 0) return null;
  return findRequest(id);
}

export async function countPending() {
  const { rows } = await query(`SELECT COUNT(*)::int AS c FROM extinguisher_requests WHERE status = 'PENDING'`);
  return rows[0].c;
}
