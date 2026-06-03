/**
 * @file invite.integration.test.js
 */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as userRoutes } from '../../services/user-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth;
let userSvc;
let adminToken;
const inviteEmail = `inspector_${Date.now()}@tzw.com`;

async function loginAs(email) {
  const res = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email, password: 'Password123!' },
  });
  return res.body?.data?.accessToken;
}

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-invite-test', authRoutes, '/api/v1/auth');
  userSvc = await listen('user-invite-test', userRoutes, '/api/v1');
  adminToken = await loginAs('brillanteigabemurangwa@gmail.com');
});

after(async () => {
  if (auth) await auth.close();
  if (userSvc) await userSvc.close();
  await closePool();
});

maybe('admin can invite inspector (201)', async () => {
  const res = await request(`${userSvc.baseUrl}/api/v1/users/invite-inspector`, {
    method: 'POST',
    token: adminToken,
    body: {
      firstName: 'Test',
      lastName: 'Inspector',
      email: inviteEmail,
      message: 'Welcome aboard',
    },
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.data.user.email, inviteEmail);
  assert.equal(res.body.data.user.role, 'INSPECTOR');
});

maybe('duplicate invite email returns 409', async () => {
  const res = await request(`${userSvc.baseUrl}/api/v1/users/invite-inspector`, {
    method: 'POST',
    token: adminToken,
    body: {
      firstName: 'Dup',
      lastName: 'User',
      email: inviteEmail,
    },
  });
  assert.equal(res.status, 409);
  assert.match(res.body.error.message, /already/i);
});
