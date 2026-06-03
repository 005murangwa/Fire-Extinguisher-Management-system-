/**
 * @file maintenance.integration.test.js
 * Integration tests for maintenance log listing and creation.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as extRoutes } from '../../services/extinguisher-service/src/routes.js';
import { mountRoutes as inspRoutes } from '../../services/inspection-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth;
let ext;
let insp;
let adminToken;
let userToken;
let extinguisherId;

async function loginAs(email) {
  const res = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email, password: 'Password123!' },
  });
  return res.body?.data?.accessToken;
}

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-maint-test', authRoutes, '/api/v1/auth');
  ext = await listen('ext-maint-test', extRoutes, '/api/v1/extinguishers');
  insp = await listen('insp-maint-test', inspRoutes, '/api/v1');
  adminToken = await loginAs('brillanteigabemurangwa@gmail.com');
  userToken = await loginAs('user@tzw.com');

  const list = await request(`${ext.baseUrl}/api/v1/extinguishers?limit=1`, { token: adminToken });
  extinguisherId = list.body?.data?.[0]?.id;
});

after(async () => {
  if (auth) await auth.close();
  if (ext) await ext.close();
  if (insp) await insp.close();
  await closePool();
});

maybe('USER can list maintenance logs without SQL errors (200)', async () => {
  const res = await request(`${insp.baseUrl}/api/v1/maintenance?limit=5`, { token: userToken });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
});

maybe('ADMIN can log maintenance with empty optional fields (201)', async () => {
  assert.ok(extinguisherId, 'seeded extinguisher required');
  const res = await request(`${insp.baseUrl}/api/v1/maintenance`, {
    method: 'POST',
    token: adminToken,
    body: {
      extinguisherId,
      actionTaken: 'Pressure check',
      maintenanceDate: '2025-06-01',
      issuesIdentified: '',
      notes: '',
      recommendations: '',
    },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.actionTaken, 'Pressure check');
});

maybe('unknown extinguisher returns 404', async () => {
  const res = await request(`${insp.baseUrl}/api/v1/maintenance`, {
    method: 'POST',
    token: adminToken,
    body: {
      extinguisherId: '00000000-0000-4000-8000-000000000001',
      actionTaken: 'Test',
      maintenanceDate: '2025-06-01',
    },
  });
  assert.equal(res.status, 404);
});

maybe('missing action returns 422', async () => {
  const res = await request(`${insp.baseUrl}/api/v1/maintenance`, {
    method: 'POST',
    token: adminToken,
    body: {
      extinguisherId,
      actionTaken: '',
      maintenanceDate: '2025-06-01',
    },
  });
  assert.equal(res.status, 422);
});
