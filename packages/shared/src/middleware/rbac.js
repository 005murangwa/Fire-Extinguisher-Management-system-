/**
 * @file rbac.js
 * @module @fems/shared/middleware/rbac
 *
 * Purpose:
 *   Role-Based Access Control middleware. Restricts a route to a set of roles
 *   after authentication has populated `req.user`.
 *
 * Responsibilities:
 *   - Deny unauthenticated requests with 401.
 *   - Deny authenticated requests lacking the required role with 403.
 */

import { ForbiddenError, UnauthorizedError } from '../errors.js';

/**
 * Build an RBAC guard for the supplied roles.
 *
 * @param {...string} allowedRoles - Roles permitted to access the route.
 * @returns {import('express').RequestHandler} Express middleware.
 *
 * @example
 *   router.delete('/:id', authenticate, requireRole('ADMIN'), handler);
 */
export function requireRole(...allowedRoles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Requires one of the following roles: ${allowedRoles.join(', ')}`
        )
      );
    }
    return next();
  };
}

export default requireRole;
