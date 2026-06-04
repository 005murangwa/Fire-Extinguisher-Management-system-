/**
 * USER role can list inspections scoped to assigned extinguishers (no SQL 500).
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as inspRoutes } from '../../services/inspection-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth;
let insp;
let userToken;

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-insp-user', authRoutes, '/api/v1/auth');
  insp = await listen('insp-user', inspRoutes, '/api/v1');
  const login = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email: 'user@tzw.com', password: 'Password123!' },
  });
  userToken = login.body?.data?.accessToken;
});

after(async () => {
  if (auth) await auth.close();
  if (insp) await insp.close();
  await closePool();
});

maybe('GET /inspections as USER returns 200', async () => {
  const res = await request(`${insp.baseUrl}/api/v1/inspections`, {
    token: userToken,
    query: { limit: 10 },
  });
  assert.equal(res.status, 200, JSON.stringify(res.body));
  assert.ok(Array.isArray(res.body.data));
});
