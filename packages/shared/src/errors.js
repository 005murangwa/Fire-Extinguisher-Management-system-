/**
 * @file errors.js
 * @module @fems/shared/errors
 *
 * Purpose:
 *   Define a typed hierarchy of application errors so controllers can throw
 *   semantically meaningful errors and the centralised error handler can map
 *   them to the correct HTTP status code without leaking internals.
 *
 * Responsibilities:
 *   - Provide an AppError base class carrying an HTTP status + machine code.
 *   - Provide convenience subclasses for the standard status codes used by the
 *     REST API (400, 401, 403, 404, 409, 422, 500).
 */

/**
 * Base application error.
 *
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human readable message (safe to expose).
   * @param {number} [statusCode=500] - HTTP status code to return.
   * @param {string} [code='INTERNAL_ERROR'] - Stable machine-readable code.
   * @param {object} [details] - Optional structured detail (e.g. field errors).
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    // Operational errors are expected and safe to report to the client.
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/** 400 - malformed request / bad input that is not a field validation issue. */
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', details) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

/** 401 - authentication missing or invalid. */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/** 403 - authenticated but not permitted (RBAC denial). */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 403, 'FORBIDDEN');
  }
}

/** 404 - resource does not exist. */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

/** 409 - conflict, e.g. duplicate unique key. */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', details) {
    super(message, 409, 'CONFLICT', details);
  }
}

/** 422 - request was well-formed but failed business/field validation. */
export class ValidationError extends AppError {
  /**
   * @param {string} message - Summary message.
   * @param {Array<{field:string,message:string}>} [details] - Field errors.
   */
  constructor(message = 'Validation failed', details = []) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

export default AppError;
