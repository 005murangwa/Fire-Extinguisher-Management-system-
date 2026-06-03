/**
 * @file invite-password.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateTempPassword } from '../../services/user-service/src/controllers/inviteController.js';
import { validatePasswordStrength } from '@fems/shared/password.js';

test('generateTempPassword satisfies strength policy', () => {
  for (let i = 0; i < 20; i += 1) {
    const pw = generateTempPassword();
    const result = validatePasswordStrength(pw);
    assert.equal(result.valid, true, pw);
    assert.ok(pw.length >= 8);
  }
});
