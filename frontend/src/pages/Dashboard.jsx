/**
 * @file Dashboard.jsx
 * Enterprise dashboard home: KPI cards, inventory/inspection analytics charts,
 * a compliance panel, recent maintenance, an activity feed and quick actions.
 * All data comes from the Reporting Service's aggregate endpoint.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Title, Text, DonutChart, BarChart, AreaChart, LineChart, ProgressBar, Badge, List, ListItem,
} from '@tremor/react';
import {
  Flame, ShieldCheck, AlertTriangle, CalendarClock, Wrench, CheckCircle2,
  Plus, CalendarPlus, FileBarChart, UserPlus, Activity,
} from 'lucide-react';
import KpiCard from '../components/KpiCard.jsx';
import { PageHeader, KpiSkeleton, Skeleton, EmptyState } from '../components/ui.jsx';
import { api, apiErrorMessage } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fmtDate } from '../lib/format.js';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get('/reports/dashboard');
        if (active) setData(res.data.data);
      } catch (err) {
        toast.error(apiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const quickActions = [
    { label: 'Register Extinguisher', icon: Plus, to: '/extinguishers/new', roles: ['ADMIN', 'INSPECTOR'] },
    { label: 'Schedule Inspection', icon: CalendarPlus, to: '/inspections' },
    { label: 'Log Maintenance', icon: Wrench, to: '/maintenance', roles: ['ADMIN', 'INSPECTOR'] },
    { label: 'Generate Report', icon: FileBarChart, to: '/reports' },
    { label: 'Add User', icon: UserPlus, to: '/users', roles: ['ADMIN'] },
  ].filter((a) => !a.roles || hasRole(...a.roles));

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading your fire safety overview..." />
        <KpiSkeleton count={4} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!data) return <EmptyState title="No data available" />;

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time fire safety compliance and asset overview"
        actions={
          <div className="flex flex-wrap gap-2">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                <a.icon className="h-4 w-4" /> {a.label}
              </button>
            ))}
          </div>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard index={0} icon={Flame} tone="blue" label="Total Extinguishers" value={k.totalExtinguishers} />
        <KpiCard index={1} icon={ShieldCheck} tone="emerald" label="Active" value={k.activeExtinguishers} />
        <KpiCard index={2} icon={AlertTriangle} tone="rose" label="Expired" value={k.expiredExtinguishers} />
        <KpiCard index={3} icon={CalendarClock} tone="amber" label="Pending Inspections" value={k.pendingInspections} />
        <KpiCard index={4} icon={AlertTriangle} tone="rose" label="Overdue Inspections" value={k.overdueInspections} />
        <KpiCard index={5} icon={Wrench} tone="violet" label="Maintenance Due" value={k.maintenanceDue} />
        <KpiCard index={6} icon={Wrench} tone="cyan" label="Maintenance (Month)" value={k.maintenanceThisMonth} />
        <KpiCard index={7} icon={CheckCircle2} tone="emerald" label="Compliance" value={`${k.compliancePercentage}%`} />
      </div>

      {/* Inventory analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <Title>Distribution by Type</Title>
          <DonutChart
            className="mt-4 h-52"
            data={data.inventory.byType}
            category="value"
            index="name"
            colors={['blue', 'cyan', 'amber', 'rose']}
            showAnimation
          />
        </Card>
        <Card>
          <Title>Top Locations</Title>
          <BarChart
            className="mt-4 h-52"
            data={data.inventory.byLocation.slice(0, 6)}
            index="name"
            categories={['value']}
            colors={['blue']}
            showAnimation
            yAxisWidth={40}
          />
        </Card>
        <Card>
          <Title>Monthly Registration Trend</Title>
          <AreaChart
            className="mt-4 h-52"
            data={data.inventory.registrationTrend}
            index="month"
            categories={['registered']}
            colors={['emerald']}
            showAnimation
            yAxisWidth={30}
          />
        </Card>
      </div>

      {/* Inspection analytics + compliance */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <Title>Inspection Trend (12 months)</Title>
          <LineChart
            className="mt-4 h-64"
            data={data.inspections.trend}
            index="month"
            categories={['completed', 'pending']}
            colors={['emerald', 'amber']}
            showAnimation
            yAxisWidth={30}
          />
        </Card>
        <Card>
          <Title>Compliance</Title>
          <div className="mt-4">
            <div className="flex items-end justify-between">
              <Text>Compliance score</Text>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.compliance.summary.compliancePercentage}%</span>
            </div>
            <ProgressBar value={data.compliance.summary.compliancePercentage} color="emerald" className="mt-2" />
          </div>
          <div className="mt-5 space-y-3">
            <Row label="Expired assets" value={data.compliance.summary.expired} color="rose" />
            <Row label="Upcoming expirations (30d)" value={data.compliance.summary.upcomingExpirations} color="amber" />
            <Row label="Critical expirations (7d)" value={data.compliance.summary.criticalExpirations} color="rose" />
          </div>
        </Card>
      </div>

      {/* Maintenance + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Title>Most Frequently Maintained</Title>
          {data.maintenance.frequency.length === 0 ? (
            <EmptyState message="No maintenance recorded yet" />
          ) : (
            <BarChart
              className="mt-4 h-56"
              data={data.maintenance.frequency}
              index="serialNumber"
              categories={['count']}
              colors={['violet']}
              layout="vertical"
              showAnimation
              yAxisWidth={70}
            />
          )}
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            <Title>Recent Activity</Title>
          </div>
          <List className="mt-3">
            {data.activity.slice(0, 8).map((a) => (
              <ListItem key={a.id}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                    {a.action.replace(/_/g, ' ')}
                  </p>
                  <p className="truncate text-xs text-gray-400">{a.actor} · {a.entity}</p>
                </div>
                <Text>{fmtDate(a.createdAt, 'dd MMM HH:mm')}</Text>
              </ListItem>
            ))}
          </List>
        </Card>
      </div>
    </div>
  );
}

/** Single labelled compliance metric row. */
function Row({ label, value, color }) {
  return (
    <div className="flex items-center justify-between">
      <Text>{label}</Text>
      <Badge color={color}>{value}</Badge>
    </div>
  );
}
