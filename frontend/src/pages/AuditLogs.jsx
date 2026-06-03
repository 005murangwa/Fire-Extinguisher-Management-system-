/**

 * @file AuditLogs.jsx

 * Admin audit trail viewer with filters and export.

 */

import { useEffect, useState, useCallback } from 'react';

import { Card } from '@tremor/react';

import toast from 'react-hot-toast';

import { PageHeader, Skeleton, FormSelect, ActionBadge } from '../components/ui.jsx';

import DataTable from '../components/DataTable.jsx';

import { api, apiErrorMessage } from '../lib/api.js';

import { fmtDate } from '../lib/format.js';

import { AUDIT_ACTION_OPTIONS } from '../lib/options.js';



export default function AuditLogs() {

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [action, setAction] = useState('');



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const { data } = await api.get('/audit-logs', { params: { limit: 100, ...(action ? { action } : {}) } });

      setRows(data.data);

    } catch (err) { toast.error(apiErrorMessage(err)); }

    finally { setLoading(false); }

  }, [action]);



  useEffect(() => { load(); }, [load]);



  const columns = [

    { key: 'timestamp', header: 'Timestamp', sortable: true, render: (r) => fmtDate(r.timestamp, 'dd MMM yyyy HH:mm:ss'), exportValue: (r) => r.timestamp },

    { key: 'actor', header: 'User', sortable: true },

    { key: 'action', header: 'Action', render: (r) => <ActionBadge action={r.action} />, exportValue: (r) => r.action },

    { key: 'entity', header: 'Entity', sortable: true },

    { key: 'entityId', header: 'Entity ID', render: (r) => (r.entityId ? String(r.entityId).slice(0, 8) : '-') },

    { key: 'ipAddress', header: 'IP' },

  ];



  const actionFilter = (

    <FormSelect

      label="Action"

      value={action}

      onChange={setAction}

      options={AUDIT_ACTION_OPTIONS}

      placeholder="All actions"

      allowEmpty

      className="w-full sm:w-56"

    />

  );



  return (

    <div>

      <PageHeader title="Audit Logs" subtitle="Immutable record of security-relevant actions" />

      <Card className="overflow-visible">

        {loading ? (

          <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>

        ) : (

          <DataTable

            columns={columns}

            rows={rows}

            exportName="audit-logs"

            emptyMessage="No audit entries found."

            filterSlot={actionFilter}

          />

        )}

      </Card>

    </div>

  );

}


