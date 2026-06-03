/**
 * @file reportController.js
 * @module reporting-service/controllers/report
 *
 * Purpose:
 *   HTTP handlers for inventory, inspection, compliance, maintenance reports,
 *   dashboard aggregate and exports — with consistent USER scoping and numeric
 *   aggregation.
 */

import { ROLES, AUDIT_ACTIONS } from '@fems/shared/constants.js';
import { ok } from '@fems/shared/http.js';
import { writeAudit } from '@fems/shared/audit.js';
import { AppError } from '@fems/shared/errors.js';
import * as repo from '../repository.js';
import { toCsv, toPdf } from '../exporters.js';

/**
 * USER role sees only assigned extinguishers; ADMIN/INSPECTOR see org-wide data.
 * @param {import('express').Request} req - Request with authenticated user.
 * @returns {string|null} Assigned user id for scope or null.
 */
function resolveScopeUserId(req) {
  return req.user?.role === ROLES.USER ? req.user.id : null;
}

/**
 * @param {unknown} err - Caught error.
 * @throws {AppError|unknown}
 */
function rethrowAsHttpError(err) {
  if (err instanceof AppError) throw err;
  throw err;
}

/** GET /reports/dashboard - all dashboard data in one call. */
export async function dashboard(req, res) {
  try {
    const scopeUserId = resolveScopeUserId(req);
    const [kpis, byType, byLocation, regTrend, inspections, compliance, maintenance, activity] =
      await Promise.all([
        repo.dashboardKpis(scopeUserId),
        repo.distribution('type', scopeUserId),
        repo.distribution('location', scopeUserId),
        repo.registrationTrend(scopeUserId),
        repo.inspectionReport(scopeUserId),
        repo.complianceReport(scopeUserId),
        repo.maintenanceReport(scopeUserId),
        repo.activityFeed(15),
      ]);

    return ok(res, {
      kpis,
      inventory: { byType, byLocation, registrationTrend: regTrend },
      inspections,
      compliance,
      maintenance,
      activity,
    });
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** GET /reports/inventory */
export async function inventory(req, res) {
  try {
    return ok(res, await repo.inventoryReport(resolveScopeUserId(req)));
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** GET /reports/inspections */
export async function inspections(req, res) {
  try {
    return ok(res, await repo.inspectionReport(resolveScopeUserId(req)));
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** GET /reports/compliance */
export async function compliance(req, res) {
  try {
    return ok(res, await repo.complianceReport(resolveScopeUserId(req)));
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/** GET /reports/maintenance */
export async function maintenance(req, res) {
  try {
    return ok(res, await repo.maintenanceReport(resolveScopeUserId(req)));
  } catch (err) {
    rethrowAsHttpError(err);
  }
}

/**
 * GET /reports/export?type=&format= - download a report as CSV or PDF.
 */
export async function exportReport(req, res) {
  try {
    const { type, format } = req.valid_query;
    const scopeUserId = resolveScopeUserId(req);

    let rows = [];
    let sections = [];
    let title = '';

    if (type === 'inventory') {
      const r = await repo.inventoryReport(scopeUserId);
      title = 'Inventory Report';
      rows = r.byType
        .map((t) => ({ category: 'Type', name: t.name, count: t.value }))
        .concat(r.byStatus.map((s) => ({ category: 'Status', name: s.name, count: s.value })));
      sections = [
        {
          heading: 'Summary',
          rows: [
            ['Total', r.summary.total],
            ['Today', r.summary.today],
            ['This Month', r.summary.thisMonth],
            ['This Year', r.summary.thisYear],
          ],
        },
        { heading: 'By Type', rows: r.byType.map((t) => [t.name, t.value]) },
        { heading: 'By Status', rows: r.byStatus.map((s) => [s.name, s.value]) },
      ];
    } else if (type === 'inspections') {
      const r = await repo.inspectionReport(scopeUserId);
      title = 'Inspection Report';
      rows = [r.summary];
      sections = [{ heading: 'Summary', rows: Object.entries(r.summary).map(([k, v]) => [k, v]) }];
      if (r.trend.length) {
        sections.push({
          heading: 'Monthly trend',
          rows: r.trend.map((t) => [t.month, `completed: ${t.completed}, pending: ${t.pending}`]),
        });
      }
    } else if (type === 'compliance') {
      const r = await repo.complianceReport(scopeUserId);
      title = 'Compliance Report';
      rows = r.expiringSoon;
      sections = [
        { heading: 'Summary', rows: Object.entries(r.summary).map(([k, v]) => [k, v]) },
        {
          heading: 'Expiring Soon (first 10)',
          rows: r.expiringSoon.slice(0, 10).map((e) => [e.serialNumber, e.expiryDate]),
        },
      ];
    } else {
      const r = await repo.maintenanceReport(scopeUserId);
      title = 'Maintenance Report';
      rows = r.recent;
      sections = [
        { heading: 'Most Maintained', rows: r.frequency.map((f) => [f.serialNumber, f.count]) },
        {
          heading: 'Recent (first 10)',
          rows: r.recent
            .slice(0, 10)
            .map((m) => [m.serialNumber, `${m.actionTaken} (${m.maintenanceDate})`]),
        },
      ];
    }

    await writeAudit({
      userId: req.user.id,
      action: AUDIT_ACTIONS.REPORT_EXPORT,
      entity: 'Report',
      metadata: { type, format },
      ip: req.ip,
    });

    if (format === 'csv') {
      const csv = toCsv(rows);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
      return res.send(csv);
    }

    const pdf = await toPdf({ title, sections });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${type}-report.pdf"`);
    return res.send(pdf);
  } catch (err) {
    rethrowAsHttpError(err);
  }
}
