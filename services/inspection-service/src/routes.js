/**
 * @file routes.js
 * @module inspection-service/routes
 *
 * Purpose:
 *   Wire inspection + maintenance routes with RBAC. Any authenticated user can
 *   schedule/view inspections; maintenance logging requires ADMIN/INSPECTOR.
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controller.js';
import * as maintCtrl from './controllers/maintenanceController.js';
import {
  scheduleSchema,
  updateInspectionSchema,
  maintenanceSchema,
  listInspectionsQuery,
  listMaintenanceQuery,
  idParam,
  extinguisherIdParam,
} from './schemas.js';

/**
 * Mount inspection + maintenance routes.
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  const staff = [authenticate, requireRole(ROLES.ADMIN, ROLES.INSPECTOR)];

  // Inspections
  router.get('/inspections', authenticate, validate({ query: listInspectionsQuery }), asyncHandler(ctrl.listInspections));
  router.post('/inspections', authenticate, validate({ body: scheduleSchema }), asyncHandler(ctrl.schedule));
  router.get('/inspections/:id', authenticate, validate({ params: idParam }), asyncHandler(ctrl.getInspection));
  router.patch('/inspections/:id', ...staff, validate({ params: idParam, body: updateInspectionSchema }), asyncHandler(ctrl.update));
  router.post('/inspections/:id/cancel', authenticate, validate({ params: idParam }), asyncHandler(ctrl.cancel));

  // Maintenance
  router.get('/maintenance', authenticate, validate({ query: listMaintenanceQuery }), asyncHandler(maintCtrl.listMaintenance));
  router.post('/maintenance', ...staff, validate({ body: maintenanceSchema }), asyncHandler(maintCtrl.logMaintenance));

  // Per-asset timeline (namespaced under /timelines to avoid gateway path
  // collision with the extinguisher service's /extinguishers routes).
  router.get('/timelines/:extinguisherId', authenticate, validate({ params: extinguisherIdParam }), asyncHandler(maintCtrl.timeline));
}

export default mountRoutes;
