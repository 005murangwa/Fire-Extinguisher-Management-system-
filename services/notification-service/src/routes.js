/**
 * @file routes.js
 * @module notification-service/routes
 *
 * Purpose:
 *   Wire notification routes. Generation is restricted to ADMIN (it would
 *   normally be triggered by a scheduler/cron).
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controllers/notificationController.js';
import { listQuery, idParam } from './controllers/notificationController.js';

/**
 * Mount notification routes.
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  router.get('/notifications', authenticate, validate({ query: listQuery }), asyncHandler(ctrl.list));
  router.get('/notifications/unread-count', authenticate, asyncHandler(ctrl.unreadCount));
  router.patch('/notifications/:id/read', authenticate, validate({ params: idParam }), asyncHandler(ctrl.markRead));
  router.post('/notifications/mark-all-read', authenticate, asyncHandler(ctrl.markAllRead));
  router.post('/notifications/generate', authenticate, requireRole(ROLES.ADMIN), asyncHandler(ctrl.generate));
}

export default mountRoutes;
