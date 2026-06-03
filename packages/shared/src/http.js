/**
 * @file http.js
 * @module @fems/shared/http
 *
 * Purpose:
 *   Standardise the shape of every API response so the frontend can rely on a
 *   single envelope, and provide an async handler wrapper that forwards errors
 *   to the centralised error middleware.
 *
 * Responsibilities:
 *   - `ok` / `created` / `noContent` success helpers.
 *   - `paginated` helper for list endpoints.
 *   - `asyncHandler` to remove repetitive try/catch from controllers.
 */

/**
 * Send a 200 OK success envelope.
 *
 * @param {import('express').Response} res - Express response.
 * @param {unknown} data - Payload to return.
 * @param {object} [meta] - Optional metadata (pagination, etc.).
 * @returns {import('express').Response} The response.
 */
export function ok(res, data, meta) {
  return res.status(200).json({ success: true, data, ...(meta ? { meta } : {}) });
}

/**
 * Send a 201 Created envelope.
 *
 * @param {import('express').Response} res - Express response.
 * @param {unknown} data - Newly created resource.
 * @returns {import('express').Response} The response.
 */
export function created(res, data) {
  return res.status(201).json({ success: true, data });
}

/**
 * Send a 204 No Content response (used by DELETE / some updates).
 *
 * @param {import('express').Response} res - Express response.
 * @returns {import('express').Response} The response.
 */
export function noContent(res) {
  return res.status(204).send();
}

/**
 * Send a paginated 200 response with standard pagination metadata.
 *
 * @param {import('express').Response} res - Express response.
 * @param {Array<unknown>} items - Page of items.
 * @param {{page:number,limit:number,total:number}} pagination - Page info.
 * @returns {import('express').Response} The response.
 */
export function paginated(res, items, { page, limit, total }) {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return res.status(200).json({
    success: true,
    data: items,
    meta: {
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  });
}

/**
 * Wrap an async Express handler so rejected promises are passed to `next`,
 * removing the need for try/catch in every controller.
 *
 * @param {(req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => Promise<unknown>} fn
 * @returns {import('express').RequestHandler} Wrapped handler.
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default { ok, created, noContent, paginated, asyncHandler };
