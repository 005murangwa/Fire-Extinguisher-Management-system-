/**
 * @file jwt.test.js
 * Unit tests for JWT signing/verification.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '@fems/shared/jwt.js';

test('access token round-trips claims', () => {
  const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' });
  const decoded = verifyAccessToken(token);
  assert.equal(decoded.sub, 'u1');
  assert.equal(decoded.email, 'a@b.com');
  assert.equal(decoded.role, 'ADMIN');
});

test('refresh token cannot be verified as an access token', () => {
  const refresh = signRefreshToken({ sub: 'u1', jti: 'j1' });
  assert.throws(() => verifyAccessToken(refresh), 'audience mismatch must throw');
  const decoded = verifyRefreshToken(refresh);
  assert.equal(decoded.sub, 'u1');
});

test('tampered token is rejected', () => {
  const token = signAccessToken({ sub: 'u1', email: 'a@b.com', role: 'USER' });
  assert.throws(() => verifyAccessToken(`${token}tampered`));
});
