/**
 * @file errorHandler.js
 * @module @fems/shared/middleware/errorHandler
 *
 * Purpose:
 *   Centralised error handling. Every thrown/forwarded error funnels through
 *   here and is mapped to a consistent JSON envelope with the correct status
 *   code. Internal errors are never exposed to the client (security rule).
 *
 * Responsibilities:
 *   - Translate AppError subclasses to their status code.
 *   - Map known PostgreSQL error codes (unique violation -> 409).
 *   - Log the error with the request-scoped logger.
 *   - Return a 500 with a generic message for anything unexpected.
 */

import { AppError } from '../errors.js';

/**
 * 404 handler for unmatched routes. Mounted after all routers.
 *
 * @param {import('express').Request} req - Request.
 * @param {import('express').Response} res - Response.
 * @returns {import('express').Response} JSON 404 envelope.
 */
export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

/**
 * Express error-handling middleware (must keep the 4-arg signature).
 *
 * @param {unknown} err - The thrown error.
 * @param {import('express').Request} req - Request.
 * @param {import('express').Response} res - Response.
 * @param {import('express').NextFunction} _next - Unused.
 * @returns {import('express').Response} JSON error envelope.
 */
export function errorHandler(err, req, res, _next) {
  // Map PostgreSQL unique-violation to a 409 conflict with a friendly message.
  if (err && err.code === '23505') {
    req.log?.warn({ err }, 'Unique constraint violation');
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'A record with the same unique value already exists' },
    });
  }
  // Foreign-key violation -> the referenced resource does not exist.
  if (err && err.code === '23503') {
    return res.status(409).json({
      success: false,
      error: { code: 'CONFLICT', message: 'Referenced resource does not exist or is in use' },
    });
  }

  if (err instanceof AppError) {
    // Operational errors are safe to surface.
    if (err.statusCode >= 500) {
      req.log?.error({ err }, err.message);
    } else {
      req.log?.warn({ code: err.code }, err.message);
    }
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  // Anything else is unexpected: log full detail, expose nothing.
  req.log?.error({ err }, 'Unhandled error');
  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
}

export default errorHandler;
