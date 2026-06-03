/**
 * @file Topbar.jsx
 * Application top bar: mobile menu toggle, global smart search, notification
 * bell with unread counter, dark-mode toggle and a profile menu whose logout
 * action is guarded by a confirmation dialog.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../lib/api.js';
import { initials } from '../lib/format.js';
import SmartSearch from './SmartSearch.jsx';
import LogoutModal from './common/LogoutModal.jsx';

export default function Topbar({ onMenu }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const menuRef = useRef(null);

  // Poll the unread notification counter.
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await api.get('/notifications/unread-count');
        if (active) setUnread(data.data.count);
      } catch { /* ignore */ }
    };
    load();
    const id = setInterval(load, 30000);
    return () => { active = false; clearInterval(id); };
  }, []);

  // Close the profile menu on outside click.
  useEffect(() => {
    const onClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-gray-200 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
      <button className="lg:hidden" onClick={onMenu} aria-label="Open menu">
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>

      <div className="flex-1 max-w-xl">
        <SmartSearch />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {initials(user)}
            </span>
            <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 sm:block">
              {user?.firstName}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <UserIcon className="h-4 w-4" /> Profile Settings
              </button>
              <button
                onClick={() => { setMenuOpen(false); setConfirmLogout(true); }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <LogoutModal
        open={confirmLogout}
        onCancel={() => setConfirmLogout(false)}
        onConfirm={async () => {
          setConfirmLogout(false);
          await logout();
          navigate('/login');
        }}
      />
    </header>
  );
}
