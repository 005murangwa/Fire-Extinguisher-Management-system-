/**
 * @file KpiCard.jsx
 * Dashboard KPI card with an icon, value, optional trend indicator and a
 * coloured status badge. Animated entrance via Framer Motion.
 */
import { Card } from '@tremor/react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const TONE = {
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300',
};

export default function KpiCard({ icon: Icon, label, value, tone = 'blue', trend, delta, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="!p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`rounded-xl p-2.5 ${TONE[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {trend !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <span className={trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            {delta && <span className="text-gray-400">{delta}</span>}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
