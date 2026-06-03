import { asyncHandler } from '@fems/shared/http.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { validate } from '@fems/shared/middleware/validate.js';
import { ROLES } from '@fems/shared/constants.js';
import * as ctrl from './controllers/requestController.js';
import { createRequestSchema, denySchema, listQuery, idParam } from './schemas.js';

export function mountRoutes(router) {
  const admin = [authenticate, requireRole(ROLES.ADMIN)];

  router.get('/requests/pending-count', ...admin, asyncHandler(ctrl.pendingCount));
  router.get('/requests/my-requests', authenticate, requireRole(ROLES.USER), validate({ query: listQuery }), asyncHandler(ctrl.myRequests));
  router.get('/requests', authenticate, validate({ query: listQuery }), asyncHandler(ctrl.list));
  router.get('/requests/:id', authenticate, validate({ params: idParam }), asyncHandler(ctrl.getOne));
  router.post('/requests', authenticate, requireRole(ROLES.USER), validate({ body: createRequestSchema }), asyncHandler(ctrl.create));
  router.put('/requests/:id/approve', ...admin, validate({ params: idParam }), asyncHandler(ctrl.approve));
  router.put('/requests/:id/deny', ...admin, validate({ params: idParam, body: denySchema }), asyncHandler(ctrl.deny));
}

export default mountRoutes;
