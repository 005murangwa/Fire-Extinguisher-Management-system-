/**
 * Data-access scope helpers by role.
 */

import { ROLES } from './constants.js';

/**
 * @param {{ role: string, id: string }} user
 * @returns {{ assignedTo?: string, inspectorId?: string }}
 */
export function extinguisherListScope(user) {
  if (user.role === ROLES.USER) return { assignedTo: user.id };
  if (user.role === ROLES.INSPECTOR) return { inspectorId: user.id };
  return {};
}

/**
 * SQL fragment + params for filtering extinguishers by role.
 * @param {{ role: string, id: string }} user
 * @param {number} startIndex - Next $n index (1-based).
 * @returns {{ sql: string, params: unknown[], nextIndex: number }}
 */
export function extinguisherScopeClause(user, startIndex = 1) {
  let i = startIndex;
  const params = [];
  if (user.role === ROLES.USER) {
    params.push(user.id);
    return { sql: ` AND assigned_to = $${i}`, params, nextIndex: i + 1 };
  }
  return { sql: '', params: [], nextIndex: i };
}

export default { extinguisherListScope, extinguisherScopeClause };
