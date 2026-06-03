/**
 * @file ExtinguisherDetails.jsx
 * Single extinguisher view: core attributes plus a combined inspection +
 * maintenance timeline fetched from the Inspection Service.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Title, Text, Divider } from '@tremor/react';
import { ArrowLeft, Flame, MapPin, Calendar, Clock, CheckCircle2, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader, StatusBadge, Skeleton, EmptyState } from '../components/ui.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { fmtDate } from '../lib/format.js';

export default function ExtinguisherDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [e, t] = await Promise.all([
          api.get(`/extinguishers/${id}`),
          api.get(`/timelines/${id}`).catch(() => ({ data: { data: [] } })),
        ]);
        setItem(e.data.data);
        setTimeline(t.data.data);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;
  if (!item) return <EmptyState title="Extinguisher not found" />;

  return (
    <div>
      <PageHeader
        title={`Extinguisher ${item.serialNumber}`}
        subtitle="Asset details and full activity timeline"
        actions={
          <button onClick={() => navigate('/extinguishers')} className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/30">
              <Flame className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <Title>{item.serialNumber}</Title>
              <StatusBadge value={item.status} />
            </div>
          </div>
          <Divider />
          <dl className="space-y-3 text-sm">
            <Detail icon={MapPin} label="Location" value={item.location} />
            <Detail icon={Flame} label="Type / Size" value={`${item.type} · ${item.size}`} />
            <Detail icon={Calendar} label="Installed" value={fmtDate(item.installationDate)} />
            <Detail icon={Clock} label="Expires" value={fmtDate(item.expiryDate)} />
          </dl>
        </Card>

        <Card className="lg:col-span-2">
          <Title>Activity Timeline</Title>
          {timeline.length === 0 ? (
            <EmptyState message="No inspections or maintenance recorded yet." />
          ) : (
            <ol className="mt-4 space-y-4">
              {timeline.map((ev) => (
                <li key={`${ev.kind}-${ev.id}`} className="flex gap-3">
                  <div className={`mt-0.5 rounded-full p-2 ${ev.kind === 'inspection' ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-violet-50 dark:bg-violet-900/30'}`}>
                    {ev.kind === 'inspection'
                      ? <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      : <Wrench className="h-4 w-4 text-violet-600" />}
                  </div>
                  <div className="flex-1 border-b border-gray-100 pb-3 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium capitalize text-gray-800 dark:text-gray-100">
                        {ev.kind}: {ev.label}
                      </p>
                      <Text>{fmtDate(ev.date)}</Text>
                    </div>
                    {ev.detail && <p className="text-xs text-gray-400">{ev.detail}</p>}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-gray-400" />
      <div>
        <dt className="text-xs text-gray-400">{label}</dt>
        <dd className="font-medium text-gray-800 dark:text-gray-100">{value}</dd>
      </div>
    </div>
  );
}
