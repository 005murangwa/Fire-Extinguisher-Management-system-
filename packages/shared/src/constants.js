/**
 * @file constants.js
 * @module @fems/shared/constants
 *
 * Purpose:
 *   Single source of truth for the controlled vocabularies used across the
 *   system (roles, extinguisher enums, statuses, audit actions). Keeping these
 *   in one shared place prevents drift between services and the frontend.
 */

/** Application roles for Role-Based Access Control. */
export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  INSPECTOR: 'INSPECTOR',
  USER: 'USER',
});

/** Allowed fire extinguisher agent types. */
export const EXTINGUISHER_TYPES = Object.freeze(['Water', 'CO2', 'Foam', 'Dry Chemical']);

/** Allowed fire extinguisher sizes. */
export const EXTINGUISHER_SIZES = Object.freeze(['2.5 lbs', '5 lbs', '9 lbs', '12 lbs']);

/** Lifecycle status of an extinguisher. */
export const EXTINGUISHER_STATUS = Object.freeze([
  'Active',
  'Expired',
  'Maintenance',
  'Decommissioned',
]);

/** Inspection lifecycle status. */
export const INSPECTION_STATUS = Object.freeze([
  'Scheduled',
  'Completed',
  'Overdue',
  'Cancelled',
]);

/** Notification categories surfaced in the notification centre. */
export const NOTIFICATION_TYPES = Object.freeze([
  'INSPECTION_SCHEDULED',
  'INSPECTION_UPCOMING',
  'INSPECTION_OVERDUE',
  'EXTINGUISHER_EXPIRING',
  'MAINTENANCE_REMINDER',
  'REQUEST_SUBMITTED',
  'REQUEST_APPROVED',
  'REQUEST_DENIED',
]);

/** Stable audit action codes (see AuditLogs table). */
export const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  EXTINGUISHER_CREATE: 'EXTINGUISHER_CREATE',
  EXTINGUISHER_UPDATE: 'EXTINGUISHER_UPDATE',
  EXTINGUISHER_DELETE: 'EXTINGUISHER_DELETE',
  INSPECTION_SCHEDULE: 'INSPECTION_SCHEDULE',
  INSPECTION_CANCEL: 'INSPECTION_CANCEL',
  MAINTENANCE_LOG: 'MAINTENANCE_LOG',
  REPORT_EXPORT: 'REPORT_EXPORT',
});

export default {
  ROLES,
  EXTINGUISHER_TYPES,
  EXTINGUISHER_SIZES,
  EXTINGUISHER_STATUS,
  INSPECTION_STATUS,
  NOTIFICATION_TYPES,
  AUDIT_ACTIONS,
};
