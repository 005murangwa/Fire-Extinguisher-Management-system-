/**
 * @file index.js
 * @module @fems/shared
 *
 * Purpose:
 *   Barrel module re-exporting the shared building blocks so services can do
 *   `import { createApp, asyncHandler, ROLES } from '@fems/shared'`.
 */

export { config } from './config.js';
export { createLogger, createHttpLogger } from './logger.js';
export { getPool, query, withTransaction, ping, closePool } from './db.js';
export { ok, created, noContent, paginated, asyncHandler } from './http.js';
export {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from './errors.js';
export {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from './jwt.js';
export { hashPassword, verifyPassword, validatePasswordStrength } from './password.js';
export { authenticate } from './middleware/auth.js';
export { requireRole } from './middleware/rbac.js';
export { validate } from './middleware/validate.js';
export { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
export {
  secureHeaders,
  corsMiddleware,
  generalRateLimiter,
  authRateLimiter,
} from './middleware/security.js';
export { writeAudit } from './audit.js';
export {
  createNotification,
  notifyAllAdmins,
  notifyUser,
  notifyRequestSubmitted,
  notifyRequestApproved,
  notifyRequestDenied,
} from './notifications.js';
export { parsePagination } from './pagination.js';
export { createApp, startServer } from './createApp.js';
export {
  ROLES,
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUS,
  INSPECTION_STATUS,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
} from './constants.js';
