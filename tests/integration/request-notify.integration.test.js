/**
 * @file request-notify.integration.test.js
 * Verifies REQUEST_SUBMITTED notifications reach all admins.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as extRoutes } from '../../services/extinguisher-service/src/routes.js';
import { mountRoutes as reqRoutes } from '../../services/request-service/src/routes.js';
import { mountRoutes as notifyRoutes } from '../../services/notification-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth;
let ext;
let reqSvc;
let notify;
let userToken;
let adminToken;
async function clearUserPendingRequests(userToken, adminToken) {
  const profile = await request(`${auth.baseUrl}/api/v1/auth/profile`, { token: userToken });
  const userId = profile.body?.data?.id;
  if (!userId) return;

  const pending = await request(`${reqSvc.baseUrl}/api/v1/requests`, {
    token: adminToken,
    query: { status: 'PENDING', requesterId: userId, limit: 50 },
  });
  for (const r of pending.body?.data ?? []) {
    await request(`${reqSvc.baseUrl}/api/v1/requests/${r.id}/deny`, {
      method: 'PUT',
      token: adminToken,
      body: { denialReason: 'test cleanup' },
    });
  }
}

async function pickAvailableExtinguisher(token) {
  const available = await request(`${ext.baseUrl}/api/v1/extinguishers/available`, {
    token,
    query: { limit: 100 },
  });
  return available.body?.data?.[0]?.id;
}

async function loginAs(email) {
  const res = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email, password: 'Password123!' },
  });
  return res.body?.data?.accessToken;
}

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-req-test', authRoutes, '/api/v1/auth');
  ext = await listen('ext-req-test', extRoutes, '/api/v1/extinguishers');
  reqSvc = await listen('req-req-test', reqRoutes, '/api/v1');
  notify = await listen('notify-req-test', notifyRoutes, '/api/v1');
  userToken = await loginAs('user@tzw.com');
  adminToken = await loginAs('brillanteigabemurangwa@gmail.com');
  await clearUserPendingRequests(userToken, adminToken);
});

after(async () => {
  if (auth) await auth.close();
  if (ext) await ext.close();
  if (reqSvc) await reqSvc.close();
  if (notify) await notify.close();
  await closePool();
});

maybe('submitting a request creates REQUEST_SUBMITTED for admin', async () => {
  const extinguisherId = await pickAvailableExtinguisher(userToken);
  assert.ok(extinguisherId, 'need an unassigned extinguisher');

  const create = await request(`${reqSvc.baseUrl}/api/v1/requests`, {
    method: 'POST',
    token: userToken,
    body: {
      extinguisherId,
      reason: 'Needed for lab safety compliance',
      locationDetails: 'Building B',
    },
  });
  assert.equal(create.status, 201);

  const list = await request(`${notify.baseUrl}/api/v1/notifications?type=REQUEST_SUBMITTED&limit=50`, {
    token: adminToken,
  });
  assert.equal(list.status, 200);
  const match = list.body.data.find(
    (n) => n.type === 'REQUEST_SUBMITTED' && n.entityId === create.body.data.id
  );
  assert.ok(match, 'admin should see REQUEST_SUBMITTED in notification centre');
  assert.match(match.message, /lab safety/i);
});

maybe('duplicate submit for same extinguisher returns existing pending (no false conflict)', async () => {
  await clearUserPendingRequests(userToken, adminToken);
  const extinguisherId = await pickAvailableExtinguisher(userToken);
  assert.ok(extinguisherId, 'need an unassigned extinguisher');

  const body = {
    extinguisherId,
    reason: 'Duplicate click safety test reason',
    locationDetails: 'Lab',
  };

  const first = await request(`${reqSvc.baseUrl}/api/v1/requests`, {
    method: 'POST',
    token: userToken,
    body,
  });
  assert.equal(first.status, 201, `first status ${first.status}`);

  const second = await request(`${reqSvc.baseUrl}/api/v1/requests`, {
    method: 'POST',
    token: userToken,
    body,
  });
  assert.equal(second.status, 200);
  assert.equal(second.body.data.id, first.body.data.id);
});
