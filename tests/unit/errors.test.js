/**
 * @file errors.test.js
 * Tests the centralised error handler maps errors to the right status codes
 * and never leaks internal details for unexpected errors.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { errorHandler } from '@fems/shared/middleware/errorHandler.js';
import { NotFoundError, ValidationError } from '@fems/shared/errors.js';

/** Build a minimal mock Express response capturing status + json. */
function mockRes() {
  return {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.body = payload; return this; },
  };
}
const req = { log: { error() {}, warn() {} } };

test('maps NotFoundError to 404', () => {
  const res = mockRes();
  errorHandler(new NotFoundError('missing'), req, res, () => {});
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

test('maps ValidationError to 422 with details', () => {
  const res = mockRes();
  errorHandler(new ValidationError('bad', [{ field: 'x', message: 'y' }]), req, res, () => {});
  assert.equal(res.statusCode, 422);
  assert.equal(res.body.error.details.length, 1);
});

test('maps PG unique violation (23505) to 409', () => {
  const res = mockRes();
  errorHandler({ code: '23505' }, req, res, () => {});
  assert.equal(res.statusCode, 409);
});

test('hides internal details for unexpected errors', () => {
  const res = mockRes();
  errorHandler(new Error('secret stack detail'), req, res, () => {});
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error.message, 'An unexpected error occurred');
  assert.ok(!JSON.stringify(res.body).includes('secret stack detail'));
});
