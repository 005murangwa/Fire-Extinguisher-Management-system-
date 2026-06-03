/**
 * @file controller.js
 * @module inspection-service/controller
 *
 * Purpose:
 *   HTTP controllers for inspection scheduling.
 */

import { ok, created, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS } from '@fems/shared/constants.js';
import { ROLES } from '@fems/shared/constants.js';
import { NotFoundError, ConflictError, BadRequestError } from '@fems/shared/errors.js';
import * as repo from './repository.js';

/** GET /inspections - list/filter inspections. */
export async function listInspections(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset, sortBy, sortDir } = parsePagination(q, {
    allowedSort: ['inspection_date', 'created_at', 'status'],
    defaultSort: 'inspection_date',
  });
  const scope = {};
  if (req.user.role === ROLES.USER) scope.assignedUserId = req.user.id;
  if (req.user.role === ROLES.INSPECTOR) scope.inspectorId = req.user.id;
  const { items, total } = await repo.listInspections({
    limit, offset, sortBy, sortDir,
    status: q.status, extinguisherId: q.extinguisherId,
    inspectorId: scope.inspectorId ?? q.inspectorId,
    assignedUserId: scope.assignedUserId,
  });
  return paginated(res, items, { page, limit, total });
}

/** GET /inspections/:id - single inspection. */
export async function getInspection(req, res) {
  const item = await repo.findInspection(req.params.id);
  if (!item) throw new NotFoundError('Inspection not found');
  return ok(res, item);
}

/** POST /inspections - schedule an inspection. */
export async function schedule(req, res) {
  if (!(await repo.extinguisherExists(req.body.extinguisherId))) {
    throw new NotFoundError('Referenced fire extinguisher does not exist');
  }
  if (await repo.slotTaken(req.body.extinguisherId, req.body.inspectionDate, req.body.inspectionTime)) {
    throw new ConflictError('An inspection is already scheduled for this extinguisher at that time');
  }
  const item = await repo.scheduleInspection(req.body, req.user.id);
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.INSPECTION_SCHEDULE, entity: 'Inspection', entityId: item.id, ip: req.ip });
  return created(res, item);
}

/** PATCH /inspections/:id - update / complete an inspection. */
export async function update(req, res) {
  const item = await repo.updateInspection(req.params.id, req.body);
  if (!item) throw new NotFoundError('Inspection not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.INSPECTION_SCHEDULE, entity: 'Inspection', entityId: item.id, metadata: { updated: true }, ip: req.ip });
  return ok(res, item);
}

/** POST /inspections/:id/cancel - cancel an inspection. */
export async function cancel(req, res) {
  const item = await repo.cancelInspection(req.params.id);
  if (!item) throw new BadRequestError('Inspection cannot be cancelled (not found or already completed)');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.INSPECTION_CANCEL, entity: 'Inspection', entityId: item.id, ip: req.ip });
  return ok(res, item);
}

