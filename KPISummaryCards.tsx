import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertOctagon,
  Clock,
  ShieldAlert,
  Percent,
  Truck,
  CheckCircle2
} from 'lucide-react';
import { ExecutiveSummary } from '../lib/types';

interface KPISummaryCardsProps {
  summary: ExecutiveSummary;
  lossSharePct?: number;
}

export const KPISummaryCards: React.FC<KPISummaryCardsProps> = ({
  summary,
  lossSharePct = 50
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const cards = [
    {
      title: 'Total Procurement Spend',
      value: formatCurrency(summary.totalSpend),
      subtitle: `${summary.totalOrders.toLocaleString()} POs • ${summary.totalQuantity.toLocaleString()} Units`,
      icon: DollarSign,
      color: 'from-blue-600 to-cyan-600',
      textColor: 'text-blue-500',
      badge: `${summary.supplierCount} Active Vendors`
    },
    {
      title: 'Gross Margin Generated',
      value: formatCurrency(summary.totalMargin),
      subtitle: `Avg. Margin Rate: ${summary.avgMarginPct}%`,
      icon: TrendingUp,
      color: 'from-emerald-600 to-teal-600',
      textColor: 'text-emerald-500',
      badge: `Top: ${summary.topSupplierByMargin.split(' ')[0]}`
    },
    {
      title: 'Component Defect Rate',
      value: `${summary.overallDefectRate}%`,
      subtitle: `${summary.totalDefects.toLocaleString()} Defective / Returned Units`,
      icon: AlertOctagon,
      color: summary.overallDefectRate > 4 ? 'from-rose-600 to-red-600' : 'from-amber-500 to-orange-600',
      textColor: summary.overallDefectRate > 4 ? 'text-rose-500' : 'text-amber-500',
      badge: summary.overallDefectRate > 4 ? 'Action Required' : 'Controlled'
    },
    {
      title: 'On-Time Delivery Rate',
      value: `${summary.overallOnTimeRate}%`,
      subtitle: `Avg Lead Time: ${summary.avgLeadTimeDays} Days`,
      icon: Truck,
      color: summary.overallOnTimeRate >= 85 ? 'from-emerald-600 to-teal-600' : 'from-amber-600 to-orange-600',
      textColor: summary.overallOnTimeRate >= 85 ? 'text-emerald-500' : 'text-amber-500',
      badge: `${summary.overallOnTimeRate >= 85 ? 'SLA Met' : 'SLA Breach'}`
    },
    {
      title: `${lossSharePct}% Disruption Loss Absorbed`,
      value: formatCurrency(summary.totalAbsorbedLoss),
      subtitle: `Net Compensation: ${formatCurrency(summary.totalNetCompensation)}`,
      icon: ShieldAlert,
      color: 'from-purple-600 to-indigo-600',
      textColor: 'text-purple-500',
      badge: 'Production 50% Share'
    },
    {
      title: 'High / Moderate Risk Vendors',
      value: `${summary.highRiskSuppliersCount}`,
      subtitle: `Out of ${summary.supplierCount} total suppliers`,
      icon: summary.highRiskSuppliersCount > 0 ? AlertOctagon : CheckCircle2,
      color: summary.highRiskSuppliersCount > 2 ? 'from-red-600 to-pink-600' : 'from-slate-600 to-slate-800',
      textColor: summary.highRiskSuppliersCount > 2 ? 'text-red-500' : 'text-slate-400',
      badge: summary.highRiskSuppliersCount > 2 ? 'High Exposure' : 'Low Risk'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-brand-500/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-secondary ${card.textColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <div className="text-xl font-extrabold tracking-tight text-foreground">{card.value}</div>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="truncate">{card.subtitle}</span>
            </div>

            <div className="mt-2 flex items-center">
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground border border-border/60">
                {card.badge}
              </span>
            </div>

            {/* Accent gradient bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-80`} />
          </div>
        );
      })}
    </div>
  );
};
