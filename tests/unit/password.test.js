/**
 * @file password.test.js
 * Unit tests for password hashing and the strong-password policy.
 * These tests require no database and run anywhere.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from '@fems/shared/password.js';

test('hashPassword produces a verifiable bcrypt hash', async () => {
  const hash = await hashPassword('Str0ng!Pass');
  assert.notEqual(hash, 'Str0ng!Pass', 'hash must differ from plaintext');
  assert.ok(await verifyPassword('Str0ng!Pass', hash), 'correct password verifies');
  assert.equal(await verifyPassword('wrong', hash), false, 'wrong password fails');
});

test('validatePasswordStrength rejects weak passwords', () => {
  assert.equal(validatePasswordStrength('short').valid, false);
  assert.equal(validatePasswordStrength('alllowercase1!').valid, false);
  assert.equal(validatePasswordStrength('ALLUPPERCASE1!').valid, false);
  assert.equal(validatePasswordStrength('NoNumber!').valid, false);
  assert.equal(validatePasswordStrength('NoSpecial1').valid, false);
});

test('validatePasswordStrength accepts a strong password', () => {
  assert.equal(validatePasswordStrength('Str0ng!Pass').valid, true);
});
