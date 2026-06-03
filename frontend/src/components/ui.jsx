/**
 * @file ui.jsx
 * Small shared presentational components: PageHeader, StatusBadge, EmptyState,
 * Skeleton loaders and a generic SectionCard. Grouped in one module to keep the
 * component surface tidy.
 */
import { Inbox } from 'lucide-react';
import { STATUS_PILL_CLASS } from '../lib/format.js';

/** Page heading with optional action slot. */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** High-contrast status / role pill. */
export function StatusBadge({ value }) {
  const cls = STATUS_PILL_CLASS[value] || 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}>
      {value}
    </span>
  );
}

/** Audit log action pill with readable label. */
export function ActionBadge({ action }) {
  const label = action?.replace(/_/g, ' ') ?? action;
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-800 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-800">
      {label}
    </span>
  );
}

/** Friendly empty state for tables/lists. */
export function EmptyState({ title = 'Nothing here yet', message, icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="rounded-full bg-gray-100 p-4 dark:bg-gray-800">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{title}</p>
      {message && <p className="max-w-sm text-sm text-gray-400">{message}</p>}
    </div>
  );
}

/** Simple shimmering skeleton block. */
export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

/** Skeleton grid for dashboard KPIs while loading. */
export function KpiSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
  );
}

/** Shared input border styles (text fields and native selects). */
export const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/30 dark:bg-gray-800 dark:text-white ${
    err ? 'border-rose-400' : 'border-gray-300 dark:border-gray-700'
  }`;

/**
 * Native select — avoids Tremor popover overlap/z-index issues in cards and modals.
 * @param {{ value: string, onChange: (v: string) => void, options: Array<{value:string,label:string}>, label?: string, placeholder?: string, allowEmpty?: boolean, error?: string, className?: string }} props
 */
export function FormSelect({ label, value, onChange, options, placeholder = 'Select…', allowEmpty = false, error, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls(error)}
      >
        {allowEmpty && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

/** Filter toolbar: dropdowns left, optional actions right — aligns with DataTable search row. */
export function FilterToolbar({ children, actions }) {
  return (
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">{children}</div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
