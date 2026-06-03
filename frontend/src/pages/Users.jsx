/**
 * @file Users.jsx
 * Admin user management: list, create, edit role/status and delete (guarded by
 * a confirmation dialog). ADMIN-only (route-guarded).
 */
import { useEffect, useState, useCallback } from 'react';
import { Card, Button } from '@tremor/react';
import { UserPlus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, Skeleton, FormSelect, StatusBadge } from '../components/ui.jsx';
import { ROLE_OPTIONS } from '../lib/options.js';
import DataTable from '../components/DataTable.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';

const EMPTY = { firstName: '', lastName: '', email: '', password: '', role: 'USER' };

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { limit: 100 } });
      setRows(data.data);
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    const id = toDelete.id;
    setToDelete(null);
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) { toast.error(apiErrorMessage(err)); }
  };

  const columns = [
    { key: 'firstName', header: 'Name', sortable: true, render: (r) => `${r.firstName} ${r.lastName}`, exportValue: (r) => `${r.firstName} ${r.lastName}` },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (r) => <StatusBadge value={r.role} />, exportValue: (r) => r.role },
    { key: 'isActive', header: 'Status', render: (r) => <StatusBadge value={r.isActive ? 'Active' : 'Disabled'} />, exportValue: (r) => (r.isActive ? 'Active' : 'Disabled') },
    { key: 'createdAt', header: 'Created', render: (r) => fmtDate(r.createdAt), exportValue: (r) => r.createdAt },
    {
      key: 'actions', header: 'Actions',
      render: (r) => (
        <div className="flex gap-2">
          <button onClick={() => setEditing(r)} className="text-amber-600 hover:text-amber-800" title="Edit"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => setToDelete(r)} className="text-rose-600 hover:text-rose-800" title="Delete"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle="Create and manage platform users and their roles"
        actions={
          <>
            <Button icon={UserPlus} variant="secondary" onClick={() => setInviteOpen(true)}>Invite Inspector</Button>
            <Button icon={UserPlus} onClick={() => setEditing(EMPTY)}>Add User</Button>
          </>
        }
      />

      <Card>
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : (
          <DataTable columns={columns} rows={rows} exportName="users" emptyMessage="No users found." />
        )}
      </Card>

      {editing && <UserModal user={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onDone={() => { setInviteOpen(false); load(); }} />}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        message={`Are you sure you want to delete this user (${toDelete?.email})?`}
        confirmText="Delete"
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
      />
    </div>
  );
}

/** Create/edit user modal. */
function UserModal({ user, onClose, onSaved }) {
  const editing = Boolean(user.id);
  const [form, setForm] = useState({ ...EMPTY, ...user, isActive: user.isActive ?? true });
  const [busy, setBusy] = useState(false);

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await api.put(`/users/${user.id}`, {
          firstName: form.firstName, lastName: form.lastName, email: form.email, role: form.role, isActive: form.isActive,
        });
      } else {
        await api.post('/users', {
          firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, role: form.role,
        });
      }
      toast.success(editing ? 'User updated' : 'User created');
      onSaved();
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">{editing ? 'Edit User' : 'Add User'}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-400" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <Input label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          {!editing && <Input label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />}
          <FormSelect label="Role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={ROLE_OPTIONS} />
          {editing && (
            <FormSelect
              label="Status"
              value={String(form.isActive)}
              onChange={(v) => setForm({ ...form, isActive: v === 'true' })}
              options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Disabled' }]}
            />
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" icon={busy ? Loader2 : undefined} disabled={busy}>{editing ? 'Save' : 'Create'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InviteModal({ onClose, onDone }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', message: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    try {
      await api.post('/users/invite-inspector', form);
      toast.success('Invitation email sent');
      onDone();
    } catch (err) { toast.error(apiErrorMessage(err)); }
    finally { setBusy(false); }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900">
        <h3 className="text-lg font-semibold dark:text-white">Invite inspector</h3>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
            <Input label="Last name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          </div>
          <Input label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" icon={busy ? Loader2 : undefined} disabled={busy}>Send invite</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
    </div>
  );
}
