/**

 * @file Inspections.jsx

 * Inspection scheduling and history.

 */

import { useEffect, useState, useCallback } from 'react';

import { Card, Button } from '@tremor/react';

import { CalendarPlus, X, CheckCircle2, Loader2 } from 'lucide-react';

import toast from 'react-hot-toast';

import { PageHeader, StatusBadge, Skeleton, FormSelect } from '../components/ui.jsx';

import DataTable from '../components/DataTable.jsx';

import ConfirmDialog from '../components/ConfirmDialog.jsx';

import { api, apiErrorMessage } from '../lib/api.js';

import { useAuth } from '../context/AuthContext.jsx';

import { fmtDate } from '../lib/format.js';

import { INSPECTION_STATUS_OPTIONS } from '../lib/options.js';



export default function Inspections() {

  const { hasRole } = useAuth();

  const [rows, setRows] = useState([]);

  const [extinguishers, setExtinguishers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');

  const [showForm, setShowForm] = useState(false);

  const [toCancel, setToCancel] = useState(null);



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const { data } = await api.get('/inspections', { params: { limit: 100, ...(statusFilter ? { status: statusFilter } : {}) } });

      setRows(data.data);

    } catch (err) {

      toast.error(apiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  }, [statusFilter]);



  useEffect(() => { load(); }, [load]);

  useEffect(() => {

    api.get('/extinguishers', { params: { limit: 100 } }).then((r) => setExtinguishers(r.data.data)).catch(() => {});

  }, []);



  const complete = async (row) => {

    try {

      await api.patch(`/inspections/${row.id}`, { status: 'Completed', result: 'Pass' });

      toast.success('Inspection completed');

      load();

    } catch (err) { toast.error(apiErrorMessage(err)); }

  };



  const cancel = async () => {

    const id = toCancel.id;

    setToCancel(null);

    try {

      await api.post(`/inspections/${id}/cancel`);

      toast.success('Inspection cancelled');

      load();

    } catch (err) { toast.error(apiErrorMessage(err)); }

  };



  const columns = [

    { key: 'extinguisherSerial', header: 'Extinguisher', sortable: true },

    { key: 'extinguisherLocation', header: 'Location' },

    { key: 'inspectionDate', header: 'Date', sortable: true, render: (r) => fmtDate(r.inspectionDate), exportValue: (r) => r.inspectionDate },

    { key: 'inspectionTime', header: 'Time' },

    { key: 'status', header: 'Status', render: (r) => <StatusBadge value={r.status} />, exportValue: (r) => r.status },

    { key: 'result', header: 'Result', render: (r) => (r.result ? <StatusBadge value={r.result} /> : '-'), exportValue: (r) => r.result || '' },

    ...(hasRole('ADMIN', 'INSPECTOR') ? [{

      key: 'actions', header: 'Actions',

      render: (r) => (

        <div className="flex gap-2">

          {r.status !== 'Completed' && r.status !== 'Cancelled' && (

            <>

              <button onClick={() => complete(r)} className="text-emerald-600 hover:text-emerald-800" title="Complete"><CheckCircle2 className="h-4 w-4" /></button>

              <button onClick={() => setToCancel(r)} className="text-rose-600 hover:text-rose-800" title="Cancel"><X className="h-4 w-4" /></button>

            </>

          )}

        </div>

      ),

    }] : []),

  ];



  const statusFilterSlot = (

    <FormSelect

      label="Status"

      value={statusFilter}

      onChange={setStatusFilter}

      options={INSPECTION_STATUS_OPTIONS}

      placeholder="All statuses"

      allowEmpty

      className="w-full sm:w-48"

    />

  );



  return (

    <div>

      <PageHeader

        title="Inspections"

        subtitle="Schedule and track fire extinguisher inspections"

        actions={<Button icon={CalendarPlus} onClick={() => setShowForm((s) => !s)}>Schedule Inspection</Button>}

      />



      {showForm && <ScheduleForm extinguishers={extinguishers} onDone={() => { setShowForm(false); load(); }} />}



      <Card className="mt-4 overflow-visible">

        {loading ? (

          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>

        ) : (

          <DataTable

            columns={columns}

            rows={rows}

            exportName="inspections"

            emptyMessage="No inspections found."

            filterSlot={statusFilterSlot}

          />

        )}

      </Card>



      <ConfirmDialog

        open={!!toCancel}

        title="Cancel inspection?"

        message="Are you sure you want to cancel this inspection?"

        confirmText="Cancel Inspection"

        onCancel={() => setToCancel(null)}

        onConfirm={cancel}

      />

    </div>

  );

}



function ScheduleForm({ extinguishers, onDone }) {

  const [form, setForm] = useState({ extinguisherId: '', inspectionDate: '', inspectionTime: '09:00', notes: '' });

  const [busy, setBusy] = useState(false);

  const today = new Date().toISOString().slice(0, 10);



  const extinguisherOptions = [

    { value: '', label: 'Select extinguisher…' },

    ...extinguishers.map((e) => ({

      value: e.id,

      label: `${e.serialNumber} — ${e.location}`,

    })),

  ];



  const submit = async (ev) => {

    ev.preventDefault();

    if (!form.extinguisherId || !form.inspectionDate) { toast.error('Select an extinguisher and date'); return; }

    setBusy(true);

    try {

      await api.post('/inspections', form);

      toast.success('Inspection scheduled');

      onDone();

    } catch (err) { toast.error(apiErrorMessage(err)); }

    finally { setBusy(false); }

  };



  return (

    <Card className="mb-4 overflow-visible">

      <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <FormSelect

          label="Extinguisher"

          value={form.extinguisherId}

          onChange={(v) => setForm({ ...form, extinguisherId: v })}

          options={extinguisherOptions}

        />

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>

          <input type="date" min={today} value={form.inspectionDate} onChange={(e) => setForm({ ...form, inspectionDate: e.target.value })}

            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />

        </div>

        <div>

          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>

          <input type="time" value={form.inspectionTime} onChange={(e) => setForm({ ...form, inspectionTime: e.target.value })}

            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white" />

        </div>

        <div className="flex items-end md:col-span-2 xl:col-span-1">

          <Button type="submit" icon={busy ? Loader2 : CalendarPlus} disabled={busy} className="w-full">Schedule</Button>

        </div>

      </form>

    </Card>

  );

}


