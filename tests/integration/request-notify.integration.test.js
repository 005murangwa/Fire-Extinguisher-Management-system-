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
let availableExtinguisherId;

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

  const available = await request(`${ext.baseUrl}/api/v1/extinguishers/available`, {
    token: userToken,
  });
  availableExtinguisherId = available.body?.data?.[0]?.id;
});

after(async () => {
  if (auth) await auth.close();
  if (ext) await ext.close();
  if (reqSvc) await reqSvc.close();
  if (notify) await notify.close();
  await closePool();
});

maybe('submitting a request creates REQUEST_SUBMITTED for admin', async () => {
  assert.ok(availableExtinguisherId, 'need an unassigned extinguisher');

  const create = await request(`${reqSvc.baseUrl}/api/v1/requests`, {
    method: 'POST',
    token: userToken,
    body: {
      extinguisherId: availableExtinguisherId,
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
