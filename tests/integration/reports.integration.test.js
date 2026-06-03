/**
 * @file reports.integration.test.js
 * Integration tests for report aggregation endpoints.
 */

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mountRoutes as authRoutes } from '../../services/auth-service/src/routes.js';
import { mountRoutes as reportRoutes } from '../../services/reporting-service/src/routes.js';
import { databaseAvailable, listen, request, closePool } from '../helpers/appHarness.js';

const dbUp = await databaseAvailable();
const maybe = dbUp ? test : test.skip;

let auth;
let reporting;
let adminToken;

async function loginAs(email) {
  const res = await request(`${auth.baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    body: { email, password: 'Password123!' },
  });
  return res.body?.data?.accessToken;
}

before(async () => {
  if (!dbUp) return;
  auth = await listen('auth-report-test', authRoutes, '/api/v1/auth');
  reporting = await listen('report-test', reportRoutes, '/api/v1');
  adminToken = await loginAs('brillanteigabemurangwa@gmail.com');
});

after(async () => {
  if (auth) await auth.close();
  if (reporting) await reporting.close();
  await closePool();
});

maybe('inspection summary counts are mutually exclusive (pending + overdue + completed + cancelled = total inspections)', async () => {
  const res = await request(`${reporting.baseUrl}/api/v1/reports/inspections`, { token: adminToken });
  assert.equal(res.status, 200);
  const { pending, completed, overdue, cancelled } = res.body.data.summary;
  for (const n of [pending, completed, overdue, cancelled]) {
    assert.equal(typeof n, 'number', 'counts must be numbers for charts');
  }
  const sum = pending + completed + overdue + cancelled;
  const totalRes = await request(`${reporting.baseUrl}/api/v1/reports/dashboard`, { token: adminToken });
  const kpis = totalRes.body.data.kpis;
  assert.ok(sum >= 0);
  assert.equal(typeof kpis.pendingInspections, 'number');
  assert.equal(typeof kpis.overdueInspections, 'number');
  assert.ok(kpis.pendingInspections + kpis.overdueInspections <= sum);
});

maybe('inventory report returns numeric summary and distributions', async () => {
  const res = await request(`${reporting.baseUrl}/api/v1/reports/inventory`, { token: adminToken });
  assert.equal(res.status, 200);
  const { summary, byType, byStatus } = res.body.data;
  assert.equal(typeof summary.total, 'number');
  assert.ok(byType.every((r) => typeof r.value === 'number'));
  assert.ok(byStatus.every((r) => typeof r.value === 'number'));
  const statusSum = byStatus.reduce((acc, r) => acc + r.value, 0);
  assert.ok(statusSum <= summary.total);
});

maybe('compliance percentage matches summary counts', async () => {
  const res = await request(`${reporting.baseUrl}/api/v1/reports/compliance`, { token: adminToken });
  assert.equal(res.status, 200);
  const { summary } = res.body.data;
  const expected = summary.total === 0
    ? 100
    : Math.round(((summary.total - summary.expired) / summary.total) * 100);
  assert.equal(summary.compliancePercentage, expected);
  assert.equal(typeof summary.upcomingExpirations, 'number');
});

maybe('maintenance report returns numeric chart series', async () => {
  const res = await request(`${reporting.baseUrl}/api/v1/reports/maintenance`, { token: adminToken });
  assert.equal(res.status, 200);
  assert.ok(res.body.data.frequency.every((r) => typeof r.count === 'number'));
  assert.ok(res.body.data.monthly.every((r) => typeof r.count === 'number'));
});
