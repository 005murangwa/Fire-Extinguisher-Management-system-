/**
 * @file Maintenance.jsx
 * Maintenance log history + a form (ADMIN/INSPECTOR) to log a new activity.
 */
import { useEffect, useState, useCallback } from 'react';
import { Card, Button } from '@tremor/react';
import { Wrench, Loader2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, Skeleton, FormSelect } from '../components/ui.jsx';
import DataTable from '../components/DataTable.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from '../lib/format.js';

export default function Maintenance() {
  const { hasRole } = useAuth();
  const [rows, setRows] = useState([]);
  const [extinguishers, setExtinguishers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/maintenance', { params: { limit: 100 } });
      setRows(data.data);
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (hasRole('ADMIN', 'INSPECTOR')) {
      api.get('/extinguishers', { params: { limit: 100 } }).then((r) => setExtinguishers(r.data.data)).catch(() => {});
    }
  }, [hasRole]);

  const columns = [
    { key: 'extinguisherSerial', header: 'Extinguisher', sortable: true },
    { key: 'actionTaken', header: 'Action', sortable: true },
    { key: 'maintenanceDate', header: 'Date', sortable: true, render: (r) => fmtDate(r.maintenanceDate), exportValue: (r) => r.maintenanceDate },
    { key: 'issuesIdentified', header: 'Issues', render: (r) => r.issuesIdentified || '-' },
    { key: 'recommendations', header: 'Recommendations', render: (r) => r.recommendations || '-' },
  ];

  return (
    <div>
      <PageHeader
        title="Maintenance Logs"
        subtitle="Full maintenance history across all assets"
        actions={hasRole('ADMIN', 'INSPECTOR') && <Button icon={Plus} onClick={() => setShowForm((s) => !s)}>Log Maintenance</Button>}
      />

      {showForm && <LogForm extinguishers={extinguishers} onDone={() => { setShowForm(false); load(); }} />}

      <Card className="mt-4 overflow-visible">
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <DataTable columns={columns} rows={rows} exportName="maintenance-logs" emptyMessage="No maintenance logs yet." />
        )}
      </Card>
    </div>
  );
}

function LogForm({ extinguishers, onDone }) {
  const [form, setForm] = useState({ extinguisherId: '', actionTaken: '', maintenanceDate: new Date().toISOString().slice(0, 10), issuesIdentified: '', notes: '', recommendations: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    if (!form.extinguisherId || !form.actionTaken) { toast.error('Extinguisher and action are required'); return; }
    setBusy(true);
    try {
      await api.post('/maintenance', form);
      toast.success('Maintenance logged');
      onDone();
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const extinguisherOptions = [
    { value: '', label: 'Select extinguisher…' },
    ...extinguishers.map((e) => ({ value: e.id, label: `${e.serialNumber} — ${e.location}` })),
  ];

  return (
    <Card className="mb-4 overflow-visible">
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Extinguisher"
          value={form.extinguisherId}
          onChange={(v) => setForm({ ...form, extinguisherId: v })}
          options={extinguisherOptions}
        />
        <Text label="Action Taken" value={form.actionTaken} onChange={(v) => setForm({ ...form, actionTaken: v })} placeholder="Pressure refill" />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Maintenance Date</label>
          <input type="date" value={form.maintenanceDate} onChange={(e) => setForm({ ...form, maintenanceDate: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
        </div>
        <Text label="Issues Identified" value={form.issuesIdentified} onChange={(v) => setForm({ ...form, issuesIdentified: v })} placeholder="Low pressure" />
        <Text label="Notes" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} placeholder="Optional notes" />
        <Text label="Recommendations" value={form.recommendations} onChange={(v) => setForm({ ...form, recommendations: v })} placeholder="Re-inspect in 6 months" />
        <div className="sm:col-span-2 flex justify-end">
          <Button type="submit" icon={busy ? Loader2 : Wrench} disabled={busy}>Log Maintenance</Button>
        </div>
      </form>
    </Card>
  );
}

function Text({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
    </div>
  );
}
