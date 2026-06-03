/**
 * @file validate.js
 * @module @fems/shared/middleware/validate
 *
 * Purpose:
 *   Server-side request validation built on Zod schemas. Provides defence in
 *   depth (the frontend validates too) and converts schema failures into the
 *   standard 422 ValidationError envelope.
 *
 * Responsibilities:
 *   - Validate and coerce `body`, `query` and `params`.
 *   - Replace the raw request parts with parsed/typed values.
 */

import { ValidationError } from '../errors.js';

/**
 * Create a validation middleware from a set of Zod schemas.
 *
 * @param {{body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny}} schemas
 * @returns {import('express').RequestHandler} Express middleware.
 */
export function validate(schemas) {
  return (req, _res, next) => {
    /** @type {Array<{field:string,message:string}>} */
    const fieldErrors = [];

    for (const part of /** @type {const} */ (['params', 'query', 'body'])) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          fieldErrors.push({
            field: [part, ...issue.path].join('.'),
            message: issue.message,
          });
        }
      } else {
        // Persist the parsed (coerced/typed) value for downstream handlers.
        // `req.query`/`req.params` are read-only getters on newer Express, so
        // store the validated copy under a namespaced property instead.
        if (part === 'body') {
          req.body = result.data;
        } else {
          req[`valid_${part}`] = result.data;
        }
      }
    }

    if (fieldErrors.length > 0) {
      return next(new ValidationError('Request validation failed', fieldErrors));
    }
    return next();
  };
}

export default validate;
