/**
 * @file Requests.jsx
 * Admin review queue for user extinguisher assignment requests (approve / deny).
 */
import { useEffect, useState, useCallback } from 'react';
import { Card, Button } from '@tremor/react';
import { Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, Skeleton, StatusBadge, FormSelect, FilterToolbar } from '../components/ui.jsx';
import DataTable from '../components/DataTable.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'DENIED', label: 'Denied' },
];

export default function Requests() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [denyRow, setDenyRow] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/requests', {
        params: { limit: 100, ...(status ? { status } : {}) },
      });
      setRows(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const approve = async (row) => {
    setBusyId(row.id);
    try {
      await api.put(`/requests/${row.id}/approve`);
      toast.success(`Approved request for ${row.extinguisherSerial}`);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    { key: 'requesterName', header: 'Requester', sortable: true },
    { key: 'extinguisherSerial', header: 'Serial', sortable: true },
    { key: 'extinguisherLocation', header: 'Location', sortable: true },
    {
      key: 'reason',
      header: 'Reason',
      render: (r) => <span className="max-w-xs truncate block" title={r.reason}>{r.reason}</span>,
      exportValue: (r) => r.reason,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge value={r.status} />,
      exportValue: (r) => r.status,
    },
    { key: 'createdAt', header: 'Submitted', render: (r) => fmtDate(r.createdAt), exportValue: (r) => r.createdAt },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        r.status === 'PENDING' ? (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => approve(r)}
              className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
              title="Approve"
            >
              {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button
              type="button"
              disabled={busyId === r.id}
              onClick={() => setDenyRow(r)}
              className="text-rose-600 hover:text-rose-800 disabled:opacity-50"
              title="Deny"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">
            {r.status === 'DENIED' && r.denialReason ? r.denialReason : '—'}
          </span>
        )
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Extinguisher Requests"
        subtitle="Review and approve or deny user requests for unassigned extinguishers"
      />

      <Card className="overflow-visible">
        <FilterToolbar>
          <FormSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            allowEmpty
            className="w-full sm:w-44"
          />
        </FilterToolbar>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            exportName="extinguisher-requests"
            emptyMessage={status === 'PENDING' ? 'No pending requests.' : 'No requests match your filter.'}
          />
        )}
      </Card>

      {denyRow && (
        <DenyModal
          row={denyRow}
          onClose={() => setDenyRow(null)}
          onDenied={() => { setDenyRow(null); load(); }}
        />
      )}
    </div>
  );
}

function DenyModal({ row, onClose, onDenied }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    if (reason.trim().length < 3) {
      toast.error('Denial reason must be at least 3 characters');
      return;
    }
    setBusy(true);
    try {
      await api.put(`/requests/${row.id}/deny`, { denialReason: reason.trim() });
      toast.success('Request denied');
      onDenied();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <h3 className="text-lg font-semibold dark:text-white">Deny request</h3>
        <p className="mt-1 text-sm text-gray-500">
          {row.requesterName} — {row.extinguisherSerial}
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Reason for denial (min 3 chars)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              rows={3}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Deny request'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
