/**
 * @file controller.js
 * @module extinguisher-service/controller
 *
 * Purpose:
 *   HTTP controllers for fire extinguisher management.
 */

import { ok, created, noContent, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS, ROLES } from '@fems/shared/constants.js';
import { ConflictError, NotFoundError, ForbiddenError } from '@fems/shared/errors.js';
import * as repo from './repository.js';

/** GET / - list/search extinguishers. */
export async function list(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset, sortBy, sortDir } = parsePagination(q, {
    allowedSort: ['created_at', 'serial_number', 'expiry_date', 'installation_date', 'location'],
  });
  const scope = {};
  if (req.user.role === ROLES.USER) scope.assignedTo = req.user.id;
  const { items, total } = await repo.list({
    limit, offset, sortBy, sortDir,
    search: q.search, serialNumber: q.serialNumber, location: q.location, type: q.type, status: q.status,
    ...scope,
  });
  return paginated(res, items, { page, limit, total });
}

/** GET /available - unassigned active extinguishers (USER request picker). */
export async function listAvailable(req, res) {
  const { page, limit, offset, sortBy, sortDir } = parsePagination(req.valid_query ?? {}, {
    allowedSort: ['serial_number', 'location'],
  });
  const { items, total } = await repo.list({
    limit, offset, sortBy, sortDir, availableOnly: true,
  });
  return paginated(res, items, { page, limit, total });
}

/** GET /my-assigned - extinguishers assigned to the current user. */
export async function listMine(req, res) {
  const { page, limit, offset, sortBy, sortDir } = parsePagination(req.valid_query ?? {}, {
    allowedSort: ['serial_number', 'expiry_date'],
  });
  const { items, total } = await repo.list({
    limit, offset, sortBy, sortDir, assignedTo: req.user.id,
  });
  return paginated(res, items, { page, limit, total });
}

/** GET /:id - view by id. */
export async function getById(req, res) {
  const item = await repo.findById(req.params.id);
  if (!item) throw new NotFoundError('Fire extinguisher not found');
  if (req.user.role === ROLES.USER && item.assignedTo !== req.user.id) {
    throw new ForbiddenError('You can only view extinguishers assigned to you');
  }
  return ok(res, item);
}

/** POST / - register an extinguisher. */
export async function create(req, res) {
  if (await repo.serialExists(req.body.serialNumber)) {
    throw new ConflictError('An extinguisher with this serial number already exists');
  }
  const item = await repo.create(req.body, req.user.id);
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.EXTINGUISHER_CREATE, entity: 'Extinguisher', entityId: item.id, ip: req.ip });
  return created(res, item);
}

/** PUT /:id - full update. */
export async function replace(req, res) {
  if (await repo.serialExists(req.body.serialNumber, req.params.id)) {
    throw new ConflictError('An extinguisher with this serial number already exists');
  }
  const item = await repo.update(req.params.id, req.body);
  if (!item) throw new NotFoundError('Fire extinguisher not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.EXTINGUISHER_UPDATE, entity: 'Extinguisher', entityId: item.id, ip: req.ip });
  return ok(res, item);
}

/** PATCH /:id - partial update. */
export async function patch(req, res) {
  if (req.body.serialNumber && (await repo.serialExists(req.body.serialNumber, req.params.id))) {
    throw new ConflictError('An extinguisher with this serial number already exists');
  }
  const item = await repo.update(req.params.id, req.body);
  if (!item) throw new NotFoundError('Fire extinguisher not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.EXTINGUISHER_UPDATE, entity: 'Extinguisher', entityId: item.id, ip: req.ip });
  return ok(res, item);
}

/** DELETE /:id - remove an extinguisher. */
/** PUT /:id/assign - admin assigns to user. */
export async function assign(req, res) {
  const item = await repo.assign(req.params.id, req.body.userId, req.user.id);
  if (!item) throw new ConflictError('Extinguisher is not available for assignment');
  return ok(res, item);
}

/** PUT /:id/unassign - admin clears assignment. */
export async function unassign(req, res) {
  const item = await repo.unassign(req.params.id);
  if (!item) throw new NotFoundError('Fire extinguisher not found');
  return ok(res, item);
}

export async function remove(req, res) {
  const deleted = await repo.remove(req.params.id);
  if (!deleted) throw new NotFoundError('Fire extinguisher not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.EXTINGUISHER_DELETE, entity: 'Extinguisher', entityId: req.params.id, ip: req.ip });
  return noContent(res);
}
