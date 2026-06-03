/**

 * @file Notifications.jsx

 * Notification centre with type filter and mark-as-read actions.

 */

import { useEffect, useState, useCallback } from 'react';

import { Card, Button } from '@tremor/react';

import { Bell, CheckCheck, Check } from 'lucide-react';

import toast from 'react-hot-toast';

import { motion } from 'framer-motion';

import { PageHeader, Skeleton, EmptyState, FormSelect, FilterToolbar, StatusBadge } from '../components/ui.jsx';

import { api, apiErrorMessage } from '../lib/api.js';

import { fmtDate } from '../lib/format.js';

import { NOTIFICATION_TYPE_OPTIONS } from '../lib/options.js';



const TYPE_LABEL = {
  INSPECTION_SCHEDULED: 'Scheduled',
  INSPECTION_UPCOMING: 'Upcoming',
  INSPECTION_OVERDUE: 'Overdue',
  EXTINGUISHER_EXPIRING: 'Expiring',
  MAINTENANCE_REMINDER: 'Maintenance',
  REQUEST_SUBMITTED: 'Request',
  REQUEST_APPROVED: 'Approved',
  REQUEST_DENIED: 'Denied',
};



export default function Notifications() {

  const [rows, setRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState('');



  const load = useCallback(async () => {

    setLoading(true);

    try {

      const { data } = await api.get('/notifications', { params: { limit: 100, ...(filter ? { type: filter } : {}) } });

      setRows(data.data);

    } catch (err) { toast.error(apiErrorMessage(err)); }

    finally { setLoading(false); }

  }, [filter]);



  useEffect(() => { load(); }, [load]);



  const markRead = async (id) => {

    try {

      await api.patch(`/notifications/${id}/read`);

      setRows((r) => r.map((n) => (n.id === id ? { ...n, isRead: true } : n)));

    } catch (err) { toast.error(apiErrorMessage(err)); }

  };



  const markAll = async () => {

    try {

      await api.post('/notifications/mark-all-read');

      setRows((r) => r.map((n) => ({ ...n, isRead: true })));

      toast.success('All notifications marked as read');

    } catch (err) { toast.error(apiErrorMessage(err)); }

  };



  return (

    <div>

      <PageHeader

        title="Notification Center"

        subtitle="Inspection, expiry and maintenance alerts"

        actions={<Button icon={CheckCheck} variant="secondary" onClick={markAll}>Mark all read</Button>}

      />



      <Card className="overflow-visible">

        <FilterToolbar>

          <FormSelect

            label="Notification type"

            value={filter}

            onChange={setFilter}

            options={NOTIFICATION_TYPE_OPTIONS}

            placeholder="All types"

            allowEmpty

            className="w-full sm:w-64"

          />

        </FilterToolbar>



        {loading ? (

          <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>

        ) : rows.length === 0 ? (

          <EmptyState title="You're all caught up" message="No notifications to show." icon={Bell} />

        ) : (

          <div className="space-y-2">

            {rows.map((n, i) => (

              <motion.div

                key={n.id}

                initial={{ opacity: 0, x: -8 }}

                animate={{ opacity: 1, x: 0 }}

                transition={{ delay: i * 0.02 }}

                className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between ${

                  n.isRead ? 'border-gray-100 dark:border-gray-800' : 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-900/10'

                }`}

              >

                <div className="flex min-w-0 flex-1 items-start gap-3">

                  <StatusBadge value={TYPE_LABEL[n.type] || n.type} />

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{n.title}</p>

                    <p className="text-sm text-gray-500">{n.message}</p>

                    <p className="mt-1 text-xs text-gray-400">{fmtDate(n.createdAt, 'dd MMM yyyy HH:mm')}</p>

                  </div>

                </div>

                {!n.isRead && (

                  <button onClick={() => markRead(n.id)} className="flex shrink-0 items-center gap-1 self-start text-xs text-indigo-600 hover:underline sm:self-center">

                    <Check className="h-4 w-4" /> Mark read

                  </button>

                )}

              </motion.div>

            ))}

          </div>

        )}

      </Card>

    </div>

  );

}


