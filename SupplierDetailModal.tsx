'use client';

import React from 'react';
import { SupplierMetrics } from '../lib/types';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  Clock,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  ArrowDownRight,
  X
} from 'lucide-react';

interface SupplierDetailModalProps {
  supplier: SupplierMetrics | null;
  onClose: () => void;
  lossSharePct?: number;
}

export const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({
  supplier,
  onClose,
  lossSharePct = 50
}) => {
  if (!supplier) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-extrabold text-sm ${
              supplier.riskTier === 'Elite' ? 'bg-emerald-500/20 text-emerald-500' :
              supplier.riskTier === 'Reliable' ? 'bg-blue-500/20 text-blue-500' :
              supplier.riskTier === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-500' :
              'bg-rose-500/20 text-rose-500'
            }`}>
              {supplier.reliabilityScore}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{supplier.supplier}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  supplier.riskTier === 'Elite' ? 'bg-emerald-500/20 text-emerald-500' :
                  supplier.riskTier === 'Reliable' ? 'bg-blue-500/20 text-blue-500' :
                  supplier.riskTier === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-500' :
                  'bg-rose-500/20 text-rose-500'
                }`}>
                  {supplier.riskTier}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                3x3 Matrix Grid Location: <strong className="text-foreground">{supplier.matrixCell.replace('-', ' Likelihood / ')} Impact</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Strategic Recommendation Banner */}
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-500">
            <Sparkles className="h-4 w-4" />
            Strategic Mandate: {supplier.recommendedStrategy}
          </div>
          <p className="text-xs text-foreground/90 leading-relaxed">
            {supplier.strategyActionDetails}
          </p>
        </div>

        {/* 6 Key Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Spend Volume</div>
            <div className="text-base font-extrabold text-foreground mt-0.5">{formatCurrency(supplier.totalSpend)}</div>
            <div className="text-[10px] text-muted-foreground">{supplier.totalQuantity.toLocaleString()} units ordered</div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Margin Contributed</div>
            <div className="text-base font-extrabold text-emerald-500 mt-0.5">{formatCurrency(supplier.totalMargin)}</div>
            <div className="text-[10px] text-emerald-400">{supplier.marginPercentage}% margin rate</div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Punctuality (OTD)</div>
            <div className="text-base font-extrabold text-foreground mt-0.5">{supplier.onTimeRate}%</div>
            <div className="text-[10px] text-muted-foreground">{supplier.delayedDeliveries} delayed POs</div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Defect & Return Rate</div>
            <div className={`text-base font-extrabold mt-0.5 ${supplier.defectRate > 4 ? 'text-rose-500' : 'text-foreground'}`}>
              {supplier.defectRate}%
            </div>
            <div className="text-[10px] text-rose-400">{supplier.totalDefectiveUnits.toLocaleString()} defect units</div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Avg Lead Time</div>
            <div className="text-base font-extrabold text-foreground mt-0.5">{supplier.avgLeadTimeDays} Days</div>
            <div className="text-[10px] text-muted-foreground">StdDev: ±{supplier.leadTimeStdDev}d • P90: {supplier.p90LeadTimeDays}d</div>
          </div>

          <div className="rounded-xl border border-border bg-secondary/30 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capacity Utilization</div>
            <div className="text-base font-extrabold text-foreground mt-0.5">{supplier.capacityUtilization}%</div>
            <div className="text-[10px] text-muted-foreground">Max: {supplier.capacityEstimated.toLocaleString()} units</div>
          </div>
        </div>

        {/* Disruption Settlement Breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2.5">
          <div className="text-xs font-bold text-foreground flex items-center justify-between">
            <span>Disruption Settlement & {lossSharePct}% Absorbed Loss Deduction</span>
            <span className="text-[11px] text-muted-foreground font-normal">Production House Loss Sharing Policy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-secondary/40 border border-border">
              <span className="text-muted-foreground text-[10px]">Gross Invoiced Amount:</span>
              <div className="font-bold text-foreground">{formatCurrency(supplier.grossPayment)}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="text-rose-400 text-[10px] flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                {lossSharePct}% Absorbed Loss:
              </span>
              <div className="font-bold text-rose-500">-{formatCurrency(supplier.absorbedLoss50Pct)}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 text-[10px]">Net Payout Compensation:</span>
              <div className="font-bold text-emerald-500">{formatCurrency(supplier.netFinancialCompensation)}</div>
            </div>
          </div>
        </div>

        {/* Common Defect Reasons Breakdown */}
        {supplier.commonDefectReasons.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="text-xs font-bold text-foreground">Defect Root Cause Breakdown</div>
            <div className="space-y-1.5">
              {supplier.commonDefectReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary/30">
                  <span className="font-medium text-foreground">{reason.reason}</span>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span>{reason.defectiveUnits.toLocaleString()} units</span>
                    <span className="font-bold text-rose-400">{reason.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-secondary text-xs font-semibold text-foreground hover:bg-secondary/80"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
