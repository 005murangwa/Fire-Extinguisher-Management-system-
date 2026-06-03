/**
 * @file requestController.js
 * @module request-service/controllers/request
 *
 * Purpose:
 *   Extinguisher request workflow. On submit, notifies all admins in-app
 *   (REQUEST_SUBMITTED) and by email.
 */

import { ok, created, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { ROLES } from '@fems/shared/constants.js';
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@fems/shared/errors.js';
import { query } from '@fems/shared/db.js';
import { sendMail } from '@fems/shared/mail.js';
import {
  notifyRequestSubmitted,
  notifyRequestApproved,
  notifyRequestDenied,
} from '@fems/shared/notifications.js';
import * as repo from '../repository.js';

async function emailUser(userId, subject, text) {
  const { rows } = await query('SELECT email FROM users WHERE id = $1', [userId]);
  if (rows[0]) await sendMail({ to: rows[0].email, subject, text });
}

async function emailAdmins(subject, text) {
  const { rows } = await query(
    `SELECT email FROM users u JOIN roles r ON r.id = u.role_id WHERE r.name = 'ADMIN' AND u.is_active`
  );
  for (const a of rows) await sendMail({ to: a.email, subject, text });
}

export async function list(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset } = parsePagination(q);
  const requesterId = req.user.role === ROLES.USER ? req.user.id : q.requesterId;
  if (req.user.role === ROLES.USER && q.requesterId && q.requesterId !== req.user.id) {
    throw new ForbiddenError('You can only view your own requests');
  }
  const { items, total } = await repo.listRequests({ limit, offset, status: q.status, requesterId });
  return paginated(res, items, { page, limit, total });
}

export async function myRequests(req, res) {
  const { page, limit, offset } = parsePagination(req.valid_query ?? {});
  const { items, total } = await repo.listRequests({ limit, offset, requesterId: req.user.id });
  return paginated(res, items, { page, limit, total });
}

export async function getOne(req, res) {
  const item = await repo.findRequest(req.params.id);
  if (!item) throw new NotFoundError('Request not found');
  if (req.user.role === ROLES.USER && item.requesterId !== req.user.id) {
    throw new ForbiddenError('You can only view your own requests');
  }
  return ok(res, item);
}

export async function create(req, res) {
  const { extinguisherId, reason, locationDetails } = req.body;
  const { rows } = await query(
    `SELECT id, assigned_to, status FROM fire_extinguishers WHERE id = $1`,
    [extinguisherId]
  );
  const ext = rows[0];
  if (!ext) throw new NotFoundError('Extinguisher not found');
  if (ext.assigned_to) throw new ConflictError('This extinguisher is already assigned');
  if (ext.status !== 'Active') {
    throw new BadRequestError('Only active unassigned extinguishers can be requested');
  }
  if (await repo.pendingForExtinguisher(extinguisherId, req.user.id)) {
    throw new ConflictError('You already have a pending request for this extinguisher');
  }

  const item = await repo.createRequest({
    requesterId: req.user.id,
    extinguisherId,
    reason,
    locationDetails,
  });

  await notifyRequestSubmitted({
    requestId: item.id,
    requesterEmail: req.user.email,
    requesterName: item.requesterName,
    extinguisherSerial: item.extinguisherSerial,
    reason,
  });

  await emailAdmins(
    'New extinguisher request',
    `${req.user.email} requested ${item.extinguisherSerial}. Reason: ${reason}`
  );

  return created(res, item);
}

export async function approve(req, res) {
  const result = await repo.approveRequest(req.params.id, req.user.id);
  if (!result) throw new NotFoundError('Request not found or already processed');
  if (result.error === 'UNAVAILABLE') throw new ConflictError('Extinguisher is no longer available');

  await notifyRequestApproved({
    requesterId: result.requesterId,
    requestId: result.id,
    extinguisherSerial: result.extinguisherSerial,
  });
  await emailUser(
    result.requesterId,
    'Request approved',
    `Your request for ${result.extinguisherSerial} was approved.`
  );

  return ok(res, result);
}

export async function deny(req, res) {
  const item = await repo.denyRequest(req.params.id, req.user.id, req.body.denialReason);
  if (!item) throw new NotFoundError('Request not found or already processed');

  await notifyRequestDenied({
    requesterId: item.requesterId,
    requestId: item.id,
    denialReason: req.body.denialReason,
  });
  await emailUser(
    item.requesterId,
    'Request denied',
    `Your request was denied. Reason: ${req.body.denialReason}`
  );

  return ok(res, item);
}

export async function pendingCount(_req, res) {
  return ok(res, { count: await repo.countPending() });
}
