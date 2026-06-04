/**
 * @file Sidebar.jsx
 * Primary navigation. Items are filtered by the current user's role so each
 * role only sees what RBAC permits.
 */
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Flame, CalendarCheck, Wrench, BarChart3, Users,
  Bell, ScrollText, Settings, ShieldCheck, X, ClipboardList,
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

/** Navigation definition with role visibility. */
const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/extinguishers', label: 'Fire Extinguishers', icon: Flame },
  { to: '/inspections', label: 'Inspections', icon: CalendarCheck },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/requests', label: 'Requests', icon: ClipboardList, roles: ['ADMIN'] },
  { to: '/users', label: 'User Management', icon: Users, roles: ['ADMIN'] },
  { to: '/audit-logs', label: 'Audit Logs', icon: ScrollText, roles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onClose }) {
  const { user, hasRole } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const items = NAV.filter((n) => !n.roles || hasRole(...n.roles));

  useEffect(() => {
    if (user?.role !== 'ADMIN') return undefined;
    let cancelled = false;
    const load = () => {
      api.get('/requests/pending-count')
        .then((r) => { if (!cancelled) setPendingRequests(r.data.data?.count ?? 0); })
        .catch(() => {});
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [user?.role]);

  return (
    <>
      {/* Mobile backdrop */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-600 p-1.5">
              <Flame className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">TZW FEMS</p>
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Fire Safety Platform</p>
            </div>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <nav className="space-y-1 p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {item.to === '/requests' && pendingRequests > 0 && (
                    <span className="ml-auto rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {pendingRequests > 99 ? '99+' : pendingRequests}
                    </span>
                  )}
                  {isActive && (
                    <motion.span layoutId="nav-indicator" className="ml-auto h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{user?.role}</p>
              <p className="text-[10px] text-gray-400">Role-based access</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
