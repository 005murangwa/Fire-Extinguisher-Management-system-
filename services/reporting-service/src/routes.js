/**
 * @file routes.js
 * @module reporting-service/routes
 *
 * Purpose:
 *   Wire reporting routes. Reports are viewable by all authenticated users;
 *   audit logs are ADMIN-only.
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controller.js';
import * as reportCtrl from './controllers/reportController.js';
import { exportQuery, auditQuery } from './controller.js';

/**
 * Mount reporting routes.
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  router.get('/reports/dashboard', authenticate, asyncHandler(reportCtrl.dashboard));
  router.get('/reports/inventory', authenticate, asyncHandler(reportCtrl.inventory));
  router.get('/reports/inspections', authenticate, asyncHandler(reportCtrl.inspections));
  router.get('/reports/compliance', authenticate, asyncHandler(reportCtrl.compliance));
  router.get('/reports/maintenance', authenticate, asyncHandler(reportCtrl.maintenance));
  router.get('/reports/export', authenticate, validate({ query: exportQuery }), asyncHandler(reportCtrl.exportReport));

  router.get('/audit-logs', authenticate, requireRole(ROLES.ADMIN), validate({ query: auditQuery }), asyncHandler(ctrl.auditLogs));
}

export default mountRoutes;
