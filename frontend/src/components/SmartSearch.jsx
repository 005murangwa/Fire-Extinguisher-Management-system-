/**
 * @file SmartSearch.jsx
 * Global search with autocomplete across extinguishers, users and inspections.
 * Debounces input and aggregates suggestions from multiple services.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, User as UserIcon, CalendarCheck } from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SmartSearch() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const boxRef = useRef(null);

  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    const handle = setTimeout(async () => {
      try {
        const calls = [
          api.get('/extinguishers', { params: { search: q, limit: 4 } })
            .then((r) => r.data.data.map((e) => ({ type: 'Extinguisher', icon: Flame, label: e.serialNumber, sub: e.location, to: `/extinguishers/${e.id}` }))),
          api.get('/inspections', { params: { limit: 3 } })
            .then((r) => r.data.data
              .filter((i) => i.extinguisherSerial?.toLowerCase().includes(q.toLowerCase()))
              .map((i) => ({ type: 'Inspection', icon: CalendarCheck, label: i.extinguisherSerial, sub: i.status, to: '/inspections' }))),
        ];
        if (hasRole('ADMIN')) {
          calls.push(
            api.get('/users', { params: { search: q, limit: 3 } })
              .then((r) => r.data.data.map((u) => ({ type: 'User', icon: UserIcon, label: `${u.firstName} ${u.lastName}`, sub: u.email, to: '/users' })))
              .catch(() => [])
          );
        }
        const all = (await Promise.all(calls)).flat();
        setResults(all);
        setOpen(true);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(handle);
  }, [q, hasRole]);

  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
        <Search className="h-4 w-4 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search extinguishers, inspections, users..."
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => { navigate(r.to); setOpen(false); setQ(''); }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <r.icon className="h-4 w-4 text-gray-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">{r.label}</p>
                <p className="truncate text-xs text-gray-400">{r.type} · {r.sub}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
