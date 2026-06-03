/**
 * @file pagination.js
 * @module @fems/shared/pagination
 *
 * Purpose:
 *   Helper for parsing standard pagination/sorting query parameters used by all
 *   list endpoints, with safe bounds to prevent abuse.
 */

/**
 * Parse pagination + sort parameters from a (validated) query object.
 *
 * @param {Record<string, unknown>} q - Query parameters.
 * @param {object} [opts] - Options.
 * @param {string[]} [opts.allowedSort] - Whitelisted sortable columns.
 * @param {string} [opts.defaultSort] - Default sort column.
 * @returns {{page:number, limit:number, offset:number, sortBy:string, sortDir:string}}
 */
export function parsePagination(q = {}, opts = {}) {
  const allowedSort = opts.allowedSort ?? ['created_at'];
  const defaultSort = opts.defaultSort ?? allowedSort[0];

  const page = Math.max(1, Number.parseInt(String(q.page ?? '1'), 10) || 1);
  // Hard cap the page size to protect the database.
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(q.limit ?? '20'), 10) || 20));
  const offset = (page - 1) * limit;

  let sortBy = String(q.sortBy ?? defaultSort);
  if (!allowedSort.includes(sortBy)) sortBy = defaultSort;

  const sortDir = String(q.sortDir ?? 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return { page, limit, offset, sortBy, sortDir };
}

export default parsePagination;
