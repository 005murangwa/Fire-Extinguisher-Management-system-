/**
 * @file controller.js
 * @module user-service/controller
 *
 * Purpose:
 *   HTTP controllers for user management. Enforces uniqueness rules, writes
 *   audit logs and returns standard envelopes.
 */

import { ok, created, noContent, paginated } from '@fems/shared/http.js';
import { parsePagination } from '@fems/shared/pagination.js';
import { hashPassword } from '@fems/shared/password.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AUDIT_ACTIONS } from '@fems/shared/constants.js';
import { ROLES } from '@fems/shared/constants.js';
import { ConflictError, NotFoundError, ForbiddenError } from '@fems/shared/errors.js';
import * as repo from './repository.js';

/** GET /users - list users (paginated/filtered). */
export async function list(req, res) {
  const q = req.valid_query ?? {};
  const { page, limit, offset, sortBy, sortDir } = parsePagination(q, {
    allowedSort: ['created_at', 'first_name', 'last_name', 'email'],
  });
  const { items, total } = await repo.listUsers({ limit, offset, sortBy, sortDir, search: q.search, role: q.role });
  return paginated(res, items, { page, limit, total });
}

/** GET /users/:id - fetch a single user. */
export async function getById(req, res) {
  const user = await repo.findById(req.params.id);
  if (!user) throw new NotFoundError('User not found');
  return ok(res, user);
}

/** POST /users - create a user (admin). */
export async function create(req, res) {
  if (await repo.emailTaken(req.body.email)) {
    throw new ConflictError('Email is already in use');
  }
  const passwordHash = await hashPassword(req.body.password);
  const user = await repo.createUser({ ...req.body, passwordHash });
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_UPDATE, entity: 'User', entityId: user.id, metadata: { created: true }, ip: req.ip });
  return created(res, user);
}

/** PUT /users/:id - full update. */
export async function replace(req, res) {
  if (await repo.emailTaken(req.body.email, req.params.id)) {
    throw new ConflictError('Email is already in use');
  }
  const user = await repo.updateUser(req.params.id, req.body);
  if (!user) throw new NotFoundError('User not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_UPDATE, entity: 'User', entityId: user.id, ip: req.ip });
  return ok(res, user);
}

/** PATCH /users/:id - partial update. */
export async function patch(req, res) {
  if (req.body.email && (await repo.emailTaken(req.body.email, req.params.id))) {
    throw new ConflictError('Email is already in use');
  }
  const user = await repo.updateUser(req.params.id, req.body);
  if (!user) throw new NotFoundError('User not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_UPDATE, entity: 'User', entityId: user.id, ip: req.ip });
  return ok(res, user);
}

/** DELETE /users/:id - remove a user. */
export async function remove(req, res) {
  // Guard: an admin cannot delete their own account (avoid lockout).
  if (req.params.id === req.user.id) {
    throw new ForbiddenError('You cannot delete your own account');
  }
  const deleted = await repo.deleteUser(req.params.id);
  if (!deleted) throw new NotFoundError('User not found');
  await writeAudit({ userId: req.user.id, action: AUDIT_ACTIONS.USER_DELETE, entity: 'User', entityId: req.params.id, ip: req.ip });
  return noContent(res);
}

/** GET /roles - list roles. */
export async function roles(_req, res) {
  return ok(res, await repo.listRoles());
}

