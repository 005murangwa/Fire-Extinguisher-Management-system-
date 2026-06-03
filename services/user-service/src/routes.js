/**
 * @file routes.js
 * @module user-service/routes
 *
 * Purpose:
 *   Wire user-management routes. All routes require authentication; mutating
 *   and listing routes require the ADMIN role (RBAC).
 */

import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controller.js';
import * as inviteCtrl from './controllers/inviteController.js';
import {
  createUserSchema,
  replaceUserSchema,
  patchUserSchema,
  listUsersQuery,
  idParam,
  inviteInspectorSchema,
} from './schemas.js';

/**
 * Mount user routes.
 * @param {import('express').Router} router - Router to populate.
 * @returns {void}
 */
export function mountRoutes(router) {
  const adminOnly = [authenticate, requireRole(ROLES.ADMIN)];

  router.get('/roles', authenticate, asyncHandler(ctrl.roles));

  router.get('/users', ...adminOnly, validate({ query: listUsersQuery }), asyncHandler(ctrl.list));
  router.post('/users/invite-inspector', ...adminOnly, validate({ body: inviteInspectorSchema }), asyncHandler(inviteCtrl.inviteInspector));
  router.post('/users', ...adminOnly, validate({ body: createUserSchema }), asyncHandler(ctrl.create));
  router.get('/users/:id', ...adminOnly, validate({ params: idParam }), asyncHandler(ctrl.getById));
  router.put('/users/:id', ...adminOnly, validate({ params: idParam, body: replaceUserSchema }), asyncHandler(ctrl.replace));
  router.patch('/users/:id', ...adminOnly, validate({ params: idParam, body: patchUserSchema }), asyncHandler(ctrl.patch));
  router.delete('/users/:id', ...adminOnly, validate({ params: idParam }), asyncHandler(ctrl.remove));
}

export default mountRoutes;
