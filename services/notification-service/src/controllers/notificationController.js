/**
 * @file notificationController.js
 * @module notification-service/controllers/notification
 *
 * Purpose:
 *   HTTP handlers for the notification centre.
 */

import { z } from 'zod';
import { ok, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { NotFoundError } from '@fems/shared/errors.js';
import { NOTIFICATION_TYPES } from '@fems/shared/constants.js';
import * as repo from '../repository.js';

/** Query schema for listing notifications. */
export const listQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  type: z.enum(NOTIFICATION_TYPES).optional(),
  isRead: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
});

/** ID path parameter schema. */
export const idParam = z.object({ id: z.string().uuid('A valid notification id is required') });

/** GET /notifications - list notifications for the current user. */
export async function list(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset } = parsePagination(q);
  const { items, total } = await repo.list({
    userId: req.user.id,
    limit,
    offset,
    type: q.type,
    isRead: q.isRead,
  });
  return paginated(res, items, { page, limit, total });
}

/** GET /notifications/unread-count - badge counter. */
export async function unreadCount(req, res) {
  return ok(res, { count: await repo.unreadCount(req.user.id) });
}

/** PATCH /notifications/:id/read - mark one read. */
export async function markRead(req, res) {
  const item = await repo.markRead(req.params.id, req.user.id);
  if (!item) throw new NotFoundError('Notification not found');
  return ok(res, item);
}

/** POST /notifications/mark-all-read - mark all read. */
export async function markAllRead(req, res) {
  const updated = await repo.markAllRead(req.user.id);
  return ok(res, { updated });
}

/** POST /notifications/generate - scan domain data and create notifications. */
export async function generate(_req, res) {
  const result = await repo.generate();
  return ok(res, result);
}
