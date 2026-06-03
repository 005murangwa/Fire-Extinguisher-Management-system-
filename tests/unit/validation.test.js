/**
 * @file validation.test.js
 * Validation tests for the Zod request schemas (registration + extinguisher).
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerSchema } from '../../services/auth-service/src/schemas.js';
import { createSchema } from '../../services/extinguisher-service/src/schemas.js';
import { scheduleSchema } from '../../services/inspection-service/src/schemas.js';

test('registration rejects invalid email and weak password', () => {
  const res = registerSchema.safeParse({ firstName: 'A', lastName: 'B', email: 'bad', password: 'weak' });
  assert.equal(res.success, false);
});

test('registration accepts a valid payload', () => {
  const res = registerSchema.safeParse({ firstName: 'Ada', lastName: 'Lovelace', email: 'ada@tzw.com', password: 'Str0ng!Pass' });
  assert.equal(res.success, true);
});

test('extinguisher rejects expiry before installation', () => {
  const res = createSchema.safeParse({
    serialNumber: 'FE-1', location: 'HQ', type: 'CO2', size: '5 lbs',
    installationDate: '2025-01-01', expiryDate: '2024-01-01',
  });
  assert.equal(res.success, false);
  assert.ok(res.error.issues.some((i) => i.path.includes('expiryDate')));
});

test('extinguisher rejects an invalid type', () => {
  const res = createSchema.safeParse({
    serialNumber: 'FE-1', location: 'HQ', type: 'Plasma', size: '5 lbs',
    installationDate: '2025-01-01', expiryDate: '2026-01-01',
  });
  assert.equal(res.success, false);
});

test('inspection rejects a past date', () => {
  const res = scheduleSchema.safeParse({
    extinguisherId: '11111111-1111-1111-1111-111111111111',
    inspectionDate: '2000-01-01', inspectionTime: '09:00',
  });
  assert.equal(res.success, false);
});
