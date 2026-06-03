/**

 * @file Reports.jsx

 * Reports dashboard with four report families and export actions.

 */

import { useEffect, useState } from 'react';

import {

  Card, Title, Text, DonutChart, BarChart, AreaChart, ProgressBar, Metric, Button,

} from '@tremor/react';

import { Download, FileText } from 'lucide-react';

import toast from 'react-hot-toast';

import { PageHeader, Skeleton } from '../components/ui.jsx';

import { api, apiErrorMessage, tokenStore } from '../lib/api.js';



const BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';



const TABS = [

  { id: 'inventory', label: 'Inventory' },

  { id: 'inspections', label: 'Inspections' },

  { id: 'compliance', label: 'Compliance' },

  { id: 'maintenance', label: 'Maintenance' },

];



async function downloadReport(type, format) {

  try {

    const res = await fetch(`${BASE}/reports/export?type=${type}&format=${format}`, {

      headers: { Authorization: `Bearer ${tokenStore.access}` },

    });

    if (!res.ok) throw new Error('Export failed');

    const blob = await res.blob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url; a.download = `${type}-report.${format}`; a.click();

    URL.revokeObjectURL(url);

    toast.success(`${type} report exported (${format.toUpperCase()})`);

  } catch (err) {

    toast.error(err.message || 'Export failed');

  }

}



function ExportButtons({ type }) {

  return (

    <div className="flex gap-2">

      <Button size="xs" variant="secondary" icon={Download} onClick={() => downloadReport(type, 'csv')}>CSV</Button>

      <Button size="xs" variant="secondary" icon={FileText} onClick={() => downloadReport(type, 'pdf')}>PDF</Button>

    </div>

  );

}



function ReportPanelHeader({ title, type }) {

  return (

    <div className="mb-4 flex flex-col gap-3 border-b border-gray-100 pb-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

      <ExportButtons type={type} />

    </div>

  );

}



function KpiGrid({ children, cols = 4 }) {

  const colClass = cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';

  return <div className={`grid grid-cols-1 gap-4 ${colClass}`}>{children}</div>;

}



function KpiCard({ label, value }) {

  return (

    <Card className="!p-4">

      <Text className="text-xs uppercase tracking-wide text-gray-500">{label}</Text>

      <Metric className="mt-1">{value}</Metric>

    </Card>

  );

}



export default function Reports() {

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState('inventory');



  useEffect(() => {

    (async () => {

      try {

        const [inv, insp, comp, maint] = await Promise.all([

          api.get('/reports/inventory'),

          api.get('/reports/inspections'),

          api.get('/reports/compliance'),

          api.get('/reports/maintenance'),

        ]);

        setData({

          inventory: inv.data.data,

          inspections: insp.data.data,

          compliance: comp.data.data,

          maintenance: maint.data.data,

        });

      } catch (err) {

        toast.error(apiErrorMessage(err));

      } finally {

        setLoading(false);

      }

    })();

  }, []);



  if (loading) return <div className="space-y-4"><PageHeader title="Reports" /><Skeleton className="h-96" /></div>;

  if (!data) return null;



  return (

    <div>

      <PageHeader title="Reports" subtitle="Inventory, inspection, compliance and maintenance analytics" />



      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">

        {TABS.map((t) => (

          <button

            key={t.id}

            type="button"

            onClick={() => setTab(t.id)}

            className={`rounded-lg px-4 py-3 text-center text-sm font-medium transition ${

              tab === t.id

                ? 'bg-indigo-600 text-white shadow-md'

                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800'

            }`}

          >

            {t.label}

          </button>

        ))}

      </div>



      <Card className="overflow-visible">

        {tab === 'inventory' && (

          <div>

            <ReportPanelHeader title="Inventory report" type="inventory" />

            <KpiGrid>

              <KpiCard label="Total" value={data.inventory.summary.total} />

              <KpiCard label="Today" value={data.inventory.summary.today} />

              <KpiCard label="This month" value={data.inventory.summary.thisMonth} />

              <KpiCard label="This year" value={data.inventory.summary.thisYear} />

            </KpiGrid>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">

              <Card><Title>By type</Title><DonutChart className="mt-4 h-60" data={data.inventory.byType} category="value" index="name" colors={['blue', 'cyan', 'amber', 'violet']} /></Card>

              <Card><Title>By status</Title><BarChart className="mt-4 h-60" data={data.inventory.byStatus} index="name" categories={['value']} colors={['indigo']} /></Card>

            </div>

          </div>

        )}



        {tab === 'inspections' && (

          <div>

            <ReportPanelHeader title="Inspections report" type="inspections" />

            <KpiGrid>

              <KpiCard label="Pending" value={data.inspections.summary.pending} />

              <KpiCard label="Completed" value={data.inspections.summary.completed} />

              <KpiCard label="Overdue" value={data.inspections.summary.overdue} />

              <KpiCard label="Cancelled" value={data.inspections.summary.cancelled} />

            </KpiGrid>

            <Card className="mt-6">

              <Title>Inspection trend</Title>

              <AreaChart className="mt-4 h-72" data={data.inspections.trend} index="month" categories={['completed', 'pending']} colors={['emerald', 'amber']} />

            </Card>

          </div>

        )}



        {tab === 'compliance' && (

          <div>

            <ReportPanelHeader title="Compliance report" type="compliance" />

            <KpiGrid cols={3}>

              <Card className="!p-4">

                <Text className="text-xs uppercase tracking-wide text-gray-500">Compliance score</Text>

                <Metric className="mt-1">{data.compliance.summary.compliancePercentage}%</Metric>

                <ProgressBar value={data.compliance.summary.compliancePercentage} color="emerald" className="mt-3" />

              </Card>

              <KpiCard label="Expiring in 30 days" value={data.compliance.summary.upcomingExpirations} />

              <KpiCard label="Critical (7 days)" value={data.compliance.summary.criticalExpirations} />

            </KpiGrid>

            <Card className="mt-6">

              <Title>Expiring soon</Title>

              <div className="mt-3 max-h-72 overflow-auto">

                {data.compliance.expiringSoon.map((e) => (

                  <div key={e.id} className="grid grid-cols-3 gap-2 border-b border-gray-100 py-2.5 text-sm dark:border-gray-800">

                    <span className="truncate font-medium text-gray-800 dark:text-gray-100">{e.serialNumber}</span>

                    <span className="truncate text-gray-500">{e.location}</span>

                    <span className="text-right text-amber-600">{e.expiryDate}</span>

                  </div>

                ))}

              </div>

            </Card>

          </div>

        )}



        {tab === 'maintenance' && (

          <div>

            <ReportPanelHeader title="Maintenance report" type="maintenance" />

            <div className="grid gap-4 lg:grid-cols-2">

              <Card><Title>Most maintained</Title><BarChart className="mt-4 h-60" data={data.maintenance.frequency} index="serialNumber" categories={['count']} colors={['violet']} layout="vertical" yAxisWidth={80} /></Card>

              <Card><Title>Monthly activity</Title><AreaChart className="mt-4 h-60" data={data.maintenance.monthly} index="month" categories={['count']} colors={['violet']} /></Card>

            </div>

          </div>

        )}

      </Card>

    </div>

  );

}


