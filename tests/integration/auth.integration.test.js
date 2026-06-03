/**
 * @file auth.integration.test.js
 * Integration / API / authentication / authorization tests for the auth flow.
 * Requires a running PostgreSQL (run `npm run db:migrate && npm run db:seed`
 * first). The suite skips automatically when no database is reachable.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let server;
const unique = `tester_${Date.now()}@tzw.com`;

before(async () => {
  if (dbUp) server = await listen('auth-service-test', authRoutes, '/api/v1/auth');
});

after(async () => {
  if (server) await server.close();
  await closePool();
});

maybe('registration rejects a weak password (422)', async () => {
  const res = await request(`${server.baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    body: { firstName: 'Test', lastName: 'User', email: unique, password: 'weak' },
  });
  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, 'VALIDATION_ERROR');
});

maybe('registration creates an account and returns tokens (201)', async () => {
  const res = await request(`${server.baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    body: { firstName: 'Test', lastName: 'User', email: unique, password: 'Str0ng!Pass' },
  });
  assert.equal(res.status, 201);
  assert.ok(res.body.data.accessToken);
  assert.equal(res.body.data.user.role, 'USER');
});

maybe('duplicate email registration is rejected (409)', async () => {
  const res = await request(`${server.baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    body: { firstName: 'Test', lastName: 'User', email: unique, password: 'Str0ng!Pass' },
  });
  assert.equal(res.status, 409);
});

maybe('login succeeds with correct credentials and the profile requires auth', async () => {
  const login = await request(`${server.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email: unique, password: 'Str0ng!Pass' },
  });
  assert.equal(login.status, 200);
  const token = login.body.data.accessToken;

  // Authenticated profile read works.
  const profile = await request(`${server.baseUrl}/api/v1/auth/profile`, { token });
  assert.equal(profile.status, 200);
  assert.equal(profile.body.data.email, unique);

  // Missing token is rejected (401).
  const noAuth = await request(`${server.baseUrl}/api/v1/auth/profile`);
  assert.equal(noAuth.status, 401);
});

maybe('login fails with wrong password (401)', async () => {
  const res = await request(`${server.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email: unique, password: 'WrongPass1!' },
  });
  assert.equal(res.status, 401);
});
