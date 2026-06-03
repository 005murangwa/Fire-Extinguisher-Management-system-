/**
 * @file auth-session.integration.test.js
 * Session persistence: refresh rotation and cookie-backed refresh.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let server;

before(async () => {
  if (!dbUp) return;
  server = await listen('auth-session-test', authRoutes, '/api/v1/auth');
});

after(async () => {
  if (server) await server.close();
  await closePool();
});

maybe('refresh rotates tokens and profile accepts new access token', async () => {
  const login = await request(`${server.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email: 'user@tzw.com', password: 'Password123!' },
  });
  assert.equal(login.status, 200);
  const { accessToken, refreshToken } = login.body.data;
  assert.ok(accessToken);
  assert.ok(refreshToken);

  const profile1 = await request(`${server.baseUrl}/api/v1/auth/profile`, { token: accessToken });
  assert.equal(profile1.status, 200);

  const rotated = await request(`${server.baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    body: { refreshToken },
  });
  assert.equal(rotated.status, 200);
  assert.ok(rotated.body.data.accessToken);
  assert.notEqual(rotated.body.data.refreshToken, refreshToken);

  const profile2 = await request(`${server.baseUrl}/api/v1/auth/profile`, {
    token: rotated.body.data.accessToken,
  });
  assert.equal(profile2.status, 200);

  const staleRefresh = await request(`${server.baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    body: { refreshToken },
  });
  assert.equal(staleRefresh.status, 401);
});

maybe('reset-password issues a new session without requiring login', async () => {
  const forgot = await request(`${server.baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    body: { email: 'user@tzw.com' },
  });
  assert.equal(forgot.status, 200);
  const resetToken = forgot.body.data?.resetToken;
  assert.ok(resetToken, 'dev build should return resetToken');

  const reset = await request(`${server.baseUrl}/api/v1/auth/reset-password`, {
    method: 'POST',
    body: { token: resetToken, newPassword: 'Password123!' },
  });
  assert.equal(reset.status, 200);
  assert.ok(reset.body.data.accessToken);
  assert.ok(reset.body.data.refreshToken);

  const profile = await request(`${server.baseUrl}/api/v1/auth/profile`, {
    token: reset.body.data.accessToken,
  });
  assert.equal(profile.status, 200);
});
