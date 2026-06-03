/**
 * @file maintenanceController.js
 * @module inspection-service/controllers/maintenance
 *
 * Purpose:
 *   HTTP handlers for maintenance log listing and creation with explicit
 *   validation and predictable HTTP status codes.
 */

import { ok, created, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS, ROLES } from '@fems/shared/constants.js';
import {
  NotFoundError,
  BadRequestError,
  ValidationError,
  AppError,
} from '@fems/shared/errors.js';
import * as repo from '../repository.js';

/**
 * Normalize optional text fields (empty strings -> null).
 * @param {object} body - Validated request body.
 * @returns {object} Sanitized payload for persistence.
 */
function sanitizeMaintenanceBody(body) {
  const emptyToNull = (value) => {
    if (value == null) return null;
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
  };
  return {
    extinguisherId: body.extinguisherId,
    inspectionId: body.inspectionId ?? null,
    actionTaken: String(body.actionTaken).trim(),
    maintenanceDate: body.maintenanceDate,
    issuesIdentified: emptyToNull(body.issuesIdentified),
    notes: emptyToNull(body.notes),
    recommendations: emptyToNull(body.recommendations),
  };
}

/**
 * Map unexpected database/driver errors to operational HTTP errors.
 * @param {unknown} err - Caught error.
 * @throws {AppError} Always rethrows a typed error.
 */
function rethrowAsHttpError(err) {
  if (err instanceof AppError) throw err;

  const pgCode = err?.code;
  if (pgCode === '23503') {
    throw new BadRequestError('Referenced extinguisher or inspection does not exist');
  }
  if (pgCode === '23505') {
    throw new BadRequestError('A maintenance record with these details already exists');
  }
  if (pgCode === '22P02') {
    throw new ValidationError('Invalid identifier format', [
      { field: 'id', message: 'One or more IDs are not valid UUIDs' },
    ]);
  }

  throw err;
}

/** GET /maintenance - list maintenance logs. */
export async function listMaintenance(req, res) {
  try {
    const q = req.valid_query ?? {};
    const { page, limit, offset, sortBy, sortDir } = parsePagination(q, {
      allowedSort: ['maintenance_date', 'created_at'],
      defaultSort: 'maintenance_date',
    });

    const scope = req.user?.role === ROLES.USER ? { assignedUserId: req.user.id } : {};
    const { items, total } = await repo.listMaintenance({
      limit,
      offset,
      sortBy,
      sortDir,
      extinguisherId: q.extinguisherId,
      ...scope,
    });

    return paginated(res, items, { page, limit, total });
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** POST /maintenance - log a maintenance activity. */
export async function logMaintenance(req, res) {
  try {
    const body = req.body;
    if (!body || typeof body !== 'object') {
      throw new BadRequestError('Request body is required');
    }

    const payload = sanitizeMaintenanceBody(body);

    if (!payload.extinguisherId) {
      throw new ValidationError('Validation failed', [
        { field: 'extinguisherId', message: 'A valid extinguisher is required' },
      ]);
    }
    if (!payload.actionTaken) {
      throw new ValidationError('Validation failed', [
        { field: 'actionTaken', message: 'Action taken is required' },
      ]);
    }
    if (!payload.maintenanceDate) {
      throw new ValidationError('Validation failed', [
        { field: 'maintenanceDate', message: 'Maintenance date is required (YYYY-MM-DD)' },
      ]);
    }

    if (!(await repo.extinguisherExists(payload.extinguisherId))) {
      throw new NotFoundError('Referenced fire extinguisher does not exist');
    }

    if (payload.inspectionId) {
      const inspection = await repo.findInspection(payload.inspectionId);
      if (!inspection) {
        throw new NotFoundError('Referenced inspection does not exist');
      }
      if (inspection.extinguisherId !== payload.extinguisherId) {
        throw new BadRequestError('Inspection does not belong to the selected extinguisher');
      }
    }

    const item = await repo.createMaintenance(payload, req.user.id);
    await writeAudit({
      userId: req.user.id,
      action: AUDIT_ACTIONS.MAINTENANCE_LOG,
      entity: 'Maintenance',
      entityId: item.id,
      ip: req.ip,
    });

    return created(res, item);
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** GET /timelines/:extinguisherId - combined asset timeline. */
export async function timeline(req, res) {
  try {
    const { extinguisherId } = req.params;
    if (!extinguisherId) {
      throw new BadRequestError('Extinguisher id is required');
    }

    if (!(await repo.extinguisherExists(extinguisherId))) {
      throw new NotFoundError('Fire extinguisher not found');
    }

    const events = await repo.timeline(extinguisherId);
    return ok(res, events);
  } catch (err) {
    rethrowAsHttpError(err);
  }
}
