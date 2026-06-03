/**
 * Dropdown option lists aligned with @fems/shared constants.
 */

export const TYPE_OPTIONS = ['Water', 'CO2', 'Foam', 'Dry Chemical'].map((t) => ({ value: t, label: t }));

export const SIZE_OPTIONS = ['2.5 lbs', '5 lbs', '9 lbs', '12 lbs'].map((s) => ({ value: s, label: s }));

export const STATUS_OPTIONS = ['Active', 'Expired', 'Maintenance', 'Decommissioned'].map((s) => ({
  value: s,
  label: s,
}));

export const INSPECTION_STATUS_OPTIONS = ['Scheduled', 'Completed', 'Overdue', 'Cancelled'].map((s) => ({
  value: s,
  label: s,
}));

export const ROLE_OPTIONS = ['ADMIN', 'INSPECTOR', 'USER'].map((r) => ({ value: r, label: r }));

export const NOTIFICATION_TYPE_OPTIONS = [
  { value: 'INSPECTION_SCHEDULED', label: 'Inspection scheduled' },
  { value: 'INSPECTION_UPCOMING', label: 'Upcoming inspections' },
  { value: 'INSPECTION_OVERDUE', label: 'Overdue inspections' },
  { value: 'EXTINGUISHER_EXPIRING', label: 'Expiring extinguishers' },
  { value: 'MAINTENANCE_REMINDER', label: 'Maintenance reminders' },
  { value: 'REQUEST_SUBMITTED', label: 'Extinguisher requests' },
  { value: 'REQUEST_APPROVED', label: 'Request approved' },
  { value: 'REQUEST_DENIED', label: 'Request denied' },
];

export const AUDIT_ACTION_OPTIONS = [
  'LOGIN', 'LOGOUT', 'REGISTER', 'EXTINGUISHER_CREATE', 'EXTINGUISHER_UPDATE', 'EXTINGUISHER_DELETE',
  'INSPECTION_SCHEDULE', 'INSPECTION_CANCEL', 'MAINTENANCE_LOG', 'REPORT_EXPORT', 'USER_UPDATE', 'USER_DELETE',
].map((a) => ({ value: a, label: a.replace(/_/g, ' ') }));
