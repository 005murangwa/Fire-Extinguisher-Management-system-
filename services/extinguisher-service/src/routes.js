/**
 * @file routes.js
 * @module extinguisher-service/routes
 *
 * Purpose:
 *   Wire extinguisher routes. Reads are available to any authenticated user;
 *   writes require ADMIN or INSPECTOR (RBAC).
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controller.js';
import { createSchema, replaceSchema, patchSchema, listQuery, idParam, assignSchema } from './schemas.js';

/**
 * Mount extinguisher routes.
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  const manager = [authenticate, requireRole(ROLES.ADMIN, ROLES.INSPECTOR)];

  router.get('/available', authenticate, validate({ query: listQuery }), asyncHandler(ctrl.listAvailable));
  router.get('/my-assigned', authenticate, validate({ query: listQuery }), asyncHandler(ctrl.listMine));
  router.get('/', authenticate, validate({ query: listQuery }), asyncHandler(ctrl.list));
  router.put('/:id/assign', authenticate, requireRole(ROLES.ADMIN), validate({ params: idParam, body: assignSchema }), asyncHandler(ctrl.assign));
  router.put('/:id/unassign', authenticate, requireRole(ROLES.ADMIN), validate({ params: idParam }), asyncHandler(ctrl.unassign));
  router.get('/:id', authenticate, validate({ params: idParam }), asyncHandler(ctrl.getById));
  router.post('/', ...manager, validate({ body: createSchema }), asyncHandler(ctrl.create));
  router.put('/:id', ...manager, validate({ params: idParam, body: replaceSchema }), asyncHandler(ctrl.replace));
  router.patch('/:id', ...manager, validate({ params: idParam, body: patchSchema }), asyncHandler(ctrl.patch));
  router.delete('/:id', authenticate, requireRole(ROLES.ADMIN), validate({ params: idParam }), asyncHandler(ctrl.remove));
}

export default mountRoutes;
