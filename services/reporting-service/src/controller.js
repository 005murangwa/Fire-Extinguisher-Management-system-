/**
 * @file controller.js
 * @module reporting-service/controller
 *
 * Purpose:
 *   Audit log controller and shared Zod schemas for the reporting service.
 */

import { z } from 'zod';
import { paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import * as repo from './repository.js';

/** Export query schema. */
export const exportQuery = z.object({
  type: z.enum(['inventory', 'inspections', 'compliance', 'maintenance']),
  format: z.enum(['csv', 'pdf']),
});

/** Audit log list query schema. */
export const auditQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
});

/** GET /audit-logs - list audit log entries (admin). */
export async function auditLogs(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset } = parsePagination(q);
  const { items, total } = await repo.listAuditLogs({ limit, offset, action: q.action, entity: q.entity });
  return paginated(res, items, { page, limit, total });
}
