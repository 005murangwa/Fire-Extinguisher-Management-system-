/**
 * @file format.js
 * Small presentation helpers shared across pages.
 */
import { format, parseISO, isValid } from 'date-fns';

/**
 * Format an ISO date/datetime string for display.
 * @param {string} value - ISO date string.
 * @param {string} [pattern='dd MMM yyyy'] - date-fns pattern.
 * @returns {string} Formatted date or '-'.
 */
export function fmtDate(value, pattern = 'dd MMM yyyy') {
  if (!value) return '-';
  const d = typeof value === 'string' ? parseISO(value) : value;
  return isValid(d) ? format(d, pattern) : '-';
}

/** Readable pill styles (high contrast text on soft backgrounds). */
export const STATUS_PILL_CLASS = {
  Active: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  Expired: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
  Maintenance: 'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
  Decommissioned: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600',
  Scheduled: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-800',
  Completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  Overdue: 'bg-orange-100 text-orange-900 ring-orange-200 dark:bg-orange-950 dark:text-orange-200 dark:ring-orange-800',
  Cancelled: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600',
  Pass: 'bg-emerald-100 text-emerald-800 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-800',
  Fail: 'bg-red-100 text-red-800 ring-red-200 dark:bg-red-950 dark:text-red-200 dark:ring-red-800',
  'Needs Maintenance': 'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800',
  ADMIN: 'bg-violet-100 text-violet-800 ring-violet-200 dark:bg-violet-950 dark:text-violet-200 dark:ring-violet-800',
  INSPECTOR: 'bg-indigo-100 text-indigo-800 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-800',
  USER: 'bg-teal-100 text-teal-800 ring-teal-200 dark:bg-teal-950 dark:text-teal-200 dark:ring-teal-800',
  PENDING: 'bg-amber-100 text-amber-900 ring-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  DENIED: 'bg-red-100 text-red-800 ring-red-200',
  Disabled: 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-800 dark:text-slate-300',
  Upcoming: 'bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-950 dark:text-sky-200',
  Expiring: 'bg-amber-100 text-amber-900 ring-amber-200 dark:bg-amber-950 dark:text-amber-200',
};

/** @deprecated Use StatusPill — kept for charts */
export const STATUS_COLOR = {
  Active: 'emerald', Expired: 'rose', Maintenance: 'amber', Decommissioned: 'gray',
  Scheduled: 'blue', Completed: 'emerald', Overdue: 'rose', Cancelled: 'gray',
  Pass: 'emerald', Fail: 'rose', 'Needs Maintenance': 'amber',
};

/** Build the user's initials for the avatar. */
export function initials(user) {
  if (!user) return '?';
  return `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || '?';
}
