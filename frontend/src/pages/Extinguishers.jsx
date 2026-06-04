/**
 * @file Extinguishers.jsx
 * Fire extinguisher inventory list with server-side search/filtering, links to
 * details, and a delete action guarded by a confirmation dialog (ADMIN only).
 */
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@tremor/react';
import { Plus, Eye, Pencil, Trash2, Flame, HandHelping } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, Skeleton, FormSelect, FilterToolbar } from '../components/ui.jsx';
import { STATUS_OPTIONS, TYPE_OPTIONS } from '../lib/options.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from '../lib/format.js';

export default function Extinguishers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const [available, setAvailable] = useState([]);
  const [reqForm, setReqForm] = useState({ extinguisherId: '', reason: '' });
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/extinguishers', {
        params: { limit: 100, ...(type ? { type } : {}), ...(status ? { status } : {}) },
      });
      setRows(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [type, status]);

  useEffect(() => { load(); }, [load]);

  const loadMyRequests = useCallback(() => {
    if (!hasRole('USER')) return;
    api.get('/requests/my-requests', { params: { limit: 20 } })
      .then((r) => setMyRequests(r.data.data ?? []))
      .catch(() => {});
  }, [hasRole]);

  useEffect(() => { loadMyRequests(); }, [loadMyRequests]);

  useEffect(() => {
    if (!showRequest) return;
    api.get('/extinguishers/available', { params: { limit: 100 } })
      .then((r) => setAvailable(r.data.data))
      .catch(() => setAvailable([]));
  }, [showRequest]);

  const submitRequest = async (ev) => {
    ev.preventDefault();
    if (reqSubmitting) return;
    if (!reqForm.extinguisherId) {
      toast.error('Select an available extinguisher');
      return;
    }
    if (reqForm.reason.trim().length < 10) {
      toast.error('Reason must be at least 10 characters');
      return;
    }
    setReqSubmitting(true);
    try {
      await api.post('/requests', {
        extinguisherId: reqForm.extinguisherId,
        reason: reqForm.reason.trim(),
      });
      toast.success('Request submitted — an admin will review it');
      setShowRequest(false);
      setReqForm({ extinguisherId: '', reason: '' });
      loadMyRequests();
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setReqSubmitting(false); }
  };

  const remove = async () => {
    const id = toDelete.id;
    setToDelete(null);
    try {
      await api.delete(`/extinguishers/${id}`);
      toast.success('Extinguisher deleted');
      setRows((r) => r.filter((x) => x.id !== id));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const columns = [
    { key: 'serialNumber', header: 'Serial', sortable: true },
    { key: 'location', header: 'Location', sortable: true },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'size', header: 'Size' },
    { key: 'expiryDate', header: 'Expiry', sortable: true, render: (r) => fmtDate(r.expiryDate), exportValue: (r) => r.expiryDate },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} />, exportValue: (r) => r.status },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => navigate(`/extinguishers/${r.id}`)} className="text-blue-600 hover:text-blue-800" title="View"><Eye className="h-4 w-4" /></button>
          {hasRole('ADMIN', 'INSPECTOR') && (
            <button onClick={() => navigate(`/extinguishers/${r.id}/edit`)} className="text-amber-600 hover:text-amber-800" title="Edit"><Pencil className="h-4 w-4" /></button>
          )}
          {hasRole('ADMIN') && (
            <button onClick={() => setToDelete(r)} className="text-rose-600 hover:text-rose-800" title="Delete"><Trash2 className="h-4 w-4" /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={hasRole('USER') ? 'My Fire Extinguishers' : 'Fire Extinguishers'}
        subtitle={hasRole('USER') ? 'Equipment assigned to you' : 'Manage and track every fire extinguisher asset'}
        actions={
          hasRole('ADMIN', 'INSPECTOR') ? (
            <Button icon={Plus} onClick={() => navigate('/extinguishers/new')}>Register Extinguisher</Button>
          ) : hasRole('USER') ? (
            <Button icon={HandHelping} onClick={() => setShowRequest(true)}>Request Extinguisher</Button>
          ) : null
        }
      />

      {hasRole('USER') && myRequests.some((r) => r.status === 'PENDING') && (
        <Card className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            You have a pending extinguisher request awaiting admin approval. You will be notified when it is approved or denied.
          </p>
        </Card>
      )}

      <Card className="overflow-visible">
        <FilterToolbar>
          <FormSelect label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} placeholder="All types" allowEmpty className="w-full sm:w-44" />
          <FormSelect label="Status" value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="All statuses" allowEmpty className="w-full sm:w-44" />
        </FilterToolbar>

        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <DataTable columns={columns} rows={rows} exportName="fire-extinguishers" emptyMessage="No extinguishers match your filters." />
        )}
      </Card>

      {showRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRequest(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
            <h3 className="text-lg font-semibold dark:text-white">Request extinguisher</h3>
            <form onSubmit={submitRequest} className="mt-4 space-y-3">
              <FormSelect
                label="Available extinguisher"
                value={reqForm.extinguisherId}
                onChange={(v) => setReqForm({ ...reqForm, extinguisherId: v })}
                options={[{ value: '', label: 'Select…' }, ...available.map((e) => ({ value: e.id, label: `${e.serialNumber} — ${e.location}` }))]}
              />
              <div>
                <label className="mb-1 block text-sm font-medium">Reason (min 10 chars)</label>
                <textarea value={reqForm.reason} onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" rows={3} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowRequest(false)}>Cancel</Button>
                <Button type="submit" disabled={reqSubmitting}>
                  {reqSubmitting ? 'Submitting…' : 'Submit request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete fire extinguisher?"
        message={`Are you sure you want to delete this fire extinguisher (${toDelete?.serialNumber})? This action cannot be undone.`}
        confirmText="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}
