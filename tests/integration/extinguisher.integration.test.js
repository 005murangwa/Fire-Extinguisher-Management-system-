/**
 * @file extinguisher.integration.test.js
 * Integration + authorization tests for the extinguisher service: RBAC on
 * writes, unique-serial conflict and the expiry-after-installation rule.
 * Skips when no database is reachable.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as extRoutes } from '../../services/extinguisher-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth; let ext;
let userToken; let adminToken;

/** Helper to obtain a token for a seeded account. */
async function loginAs(email) {
  const res = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST', body: { email, password: 'Password123!' },
  });
  return res.body?.data?.accessToken;
}

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-test', authRoutes, '/api/v1/auth');
  ext = await listen('ext-test', extRoutes, '/api/v1/extinguishers');
  adminToken = await loginAs('admin@tzw.com');
  userToken = await loginAs('user@tzw.com');
});

after(async () => {
  if (auth) await auth.close();
  if (ext) await ext.close();
  await closePool();
});

maybe('a plain USER cannot create an extinguisher (403)', async () => {
  const res = await request(`${ext.baseUrl}/api/v1/extinguishers`, {
    method: 'POST', token: userToken,
    body: { serialNumber: `T-${Date.now()}`, location: 'X', type: 'CO2', size: '5 lbs', installationDate: '2024-01-01', expiryDate: '2027-01-01' },
  });
  assert.equal(res.status, 403);
});

maybe('an ADMIN can create an extinguisher (201) and duplicate serial conflicts (409)', async () => {
  const serial = `T-${Date.now()}`;
  const payload = { serialNumber: serial, location: 'HQ', type: 'CO2', size: '5 lbs', installationDate: '2024-01-01', expiryDate: '2027-01-01' };
  const create = await request(`${ext.baseUrl}/api/v1/extinguishers`, { method: 'POST', token: adminToken, body: payload });
  assert.equal(create.status, 201);

  const dup = await request(`${ext.baseUrl}/api/v1/extinguishers`, { method: 'POST', token: adminToken, body: payload });
  assert.equal(dup.status, 409);
});

maybe('expiry before installation is rejected (422)', async () => {
  const res = await request(`${ext.baseUrl}/api/v1/extinguishers`, {
    method: 'POST', token: adminToken,
    body: { serialNumber: `T-${Date.now()}-b`, location: 'HQ', type: 'CO2', size: '5 lbs', installationDate: '2027-01-01', expiryDate: '2024-01-01' },
  });
  assert.equal(res.status, 422);
});

maybe('listing extinguishers is paginated and requires auth', async () => {
  const ok = await request(`${ext.baseUrl}/api/v1/extinguishers?limit=5`, { token: adminToken });
  assert.equal(ok.status, 200);
  assert.ok(Array.isArray(ok.body.data));
  assert.ok(ok.body.meta.pagination);

  const noAuth = await request(`${ext.baseUrl}/api/v1/extinguishers`);
  assert.equal(noAuth.status, 401);
});
