/**
 * @file rbac.test.js
 * Authorization tests for the RBAC + authentication middleware.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { requireRole } from '@fems/shared/middleware/rbac.js';
import { authenticate } from '@fems/shared/middleware/auth.js';
import { signAccessToken } from '@fems/shared/jwt.js';

test('requireRole allows a permitted role', () => {
  const mw = requireRole('ADMIN', 'INSPECTOR');
  let nextErr = 'untouched';
  mw({ user: { role: 'INSPECTOR' } }, {}, (e) => { nextErr = e; });
  assert.equal(nextErr, undefined);
});

test('requireRole denies a missing role with 403', () => {
  const mw = requireRole('ADMIN');
  let err;
  mw({ user: { role: 'USER' } }, {}, (e) => { err = e; });
  assert.equal(err.statusCode, 403);
});

test('requireRole denies unauthenticated with 401', () => {
  const mw = requireRole('ADMIN');
  let err;
  mw({}, {}, (e) => { err = e; });
  assert.equal(err.statusCode, 401);
});

test('authenticate accepts a valid Bearer token', () => {
  const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' });
  const req = { headers: { authorization: `Bearer ${token}` } };
  let err = 'untouched';
  authenticate(req, {}, (e) => { err = e; });
  assert.equal(err, undefined);
  assert.equal(req.user.role, 'ADMIN');
});

test('authenticate rejects a missing token with 401', () => {
  let err;
  authenticate({ headers: {} }, {}, (e) => { err = e; });
  assert.equal(err.statusCode, 401);
});
