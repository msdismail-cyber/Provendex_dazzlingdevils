'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell
} from 'recharts';
import { SupplierMetrics } from '../lib/types';
import { ShieldAlert, Info, Sliders, DollarSign, ArrowDownRight, CheckCircle2 } from 'lucide-react';

interface DisruptionBarChartProps {
  suppliers: SupplierMetrics[];
  lossSharePct: number;
  onLossShareChange?: (newVal: number) => void;
  onSelectSupplier?: (supplierName: string) => void;
}

export const DisruptionBarChart: React.FC<DisruptionBarChartProps> = ({
  suppliers,
  lossSharePct = 50,
  onLossShareChange,
  onSelectSupplier
}) => {
  const [activeView, setActiveView] = useState<'grouped' | 'stacked'>('grouped');

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
        No supplier disruption data available.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = suppliers.map(s => {
    // Recompute absorbed loss dynamically based on current lossSharePct
    const defectiveSpend = (s.totalSpend / (s.totalQuantity || 1)) * s.totalDefectiveUnits;
    const currentAbsorbedLoss = Math.round((defectiveSpend * (lossSharePct / 100)) * 100) / 100;
    const netCompensation = Math.round((s.totalSpend - currentAbsorbedLoss) * 100) / 100;

    return {
      supplier: s.supplier,
      shortName: s.supplier.split(' ')[0] + ' ' + (s.supplier.split(' ')[1] || ''),
      grossPayment: s.totalSpend,
      absorbedLoss: currentAbsorbedLoss,
      netCompensation: netCompensation,
      defectRate: s.defectRate,
      defectiveUnits: s.totalDefectiveUnits
    };
  }).sort((a, b) => b.grossPayment - a.grossPayment);

  const totalGross = chartData.reduce((acc, d) => acc + d.grossPayment, 0);
  const totalAbsorbed = chartData.reduce((acc, d) => acc + d.absorbedLoss, 0);
  const totalNet = chartData.reduce((acc, d) => acc + d.netCompensation, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl border border-border bg-popover p-3.5 shadow-2xl text-xs z-50 min-w-[220px]">
          <div className="font-bold text-foreground mb-2 text-sm border-b border-border pb-1">
            {data.supplier}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Gross Invoiced Value:</span>
              <strong className="text-foreground">{formatCurrency(data.grossPayment)}</strong>
            </div>
            <div className="flex items-center justify-between text-rose-400">
              <span className="flex items-center gap-1">
                <ArrowDownRight className="h-3 w-3" />
                {lossSharePct}% Loss Deduction:
              </span>
              <strong>-{formatCurrency(data.absorbedLoss)}</strong>
            </div>
            <div className="flex items-center justify-between text-emerald-400 font-bold border-t border-border/80 pt-1 mt-1">
              <span>Net Compensation Paid:</span>
              <span>{formatCurrency(data.netCompensation)}</span>
            </div>
            <div className="text-[10px] text-muted-foreground pt-1 flex justify-between">
              <span>Defects: {data.defectiveUnits.toLocaleString()} units</span>
              <span>Rate: {data.defectRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Supply Chain Disruption & Financial Compensation Engine
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Simulation of the <strong>50% loss share</strong> absorbed by the production house when customer returns occur, showing gross payment vs. net compensation.
          </p>
        </div>

        {/* Interactive Loss Share Controller & View Mode */}
        <div className="flex flex-wrap items-center gap-3">
          {onLossShareChange && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs">
              <Sliders className="h-3.5 w-3.5 text-brand-500" />
              <span className="font-medium text-foreground">Absorbed Loss Share:</span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={lossSharePct}
                onChange={(e) => onLossShareChange(parseInt(e.target.value, 10))}
                className="w-24 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <span className="font-extrabold text-brand-500 min-w-[36px]">{lossSharePct}%</span>
            </div>
          )}

          <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5 text-xs">
            <button
              onClick={() => setActiveView('grouped')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeView === 'grouped' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Grouped Comparison
            </button>
            <button
              onClick={() => setActiveView('stacked')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                activeView === 'stacked' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Stacked Waterfall
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-secondary/40 border border-border p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Total Gross Invoiced</div>
            <div className="text-lg font-extrabold text-foreground">{formatCurrency(totalGross)}</div>
          </div>
          <DollarSign className="h-5 w-5 text-blue-500" />
        </div>

        <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-rose-400 uppercase tracking-wide">
              {lossSharePct}% Total Absorbed Loss
            </div>
            <div className="text-lg font-extrabold text-rose-500">-{formatCurrency(totalAbsorbed)}</div>
          </div>
          <ArrowDownRight className="h-5 w-5 text-rose-500" />
        </div>

        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">Net Supplier Compensation</div>
            <div className="text-lg font-extrabold text-emerald-500">{formatCurrency(totalNet)}</div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 20, bottom: 25 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length && onSelectSupplier) {
                onSelectSupplier(state.activePayload[0].payload.supplier);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
            <XAxis
              dataKey="shortName"
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              angle={-20}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-muted-foreground"
              tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(val) => (
                <span className="text-foreground font-medium">
                  {val === 'grossPayment'
                    ? 'Gross Payment (Total Spend)'
                    : val === 'absorbedLoss'
                    ? `${lossSharePct}% Absorbed Return Loss Deduction`
                    : 'Net Financial Compensation'}
                </span>
              )}
            />

            {activeView === 'grouped' ? (
              <>
                <Bar dataKey="grossPayment" name="grossPayment" fill="#3b82f6" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="absorbedLoss" name="absorbedLoss" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="pointer" />
                <Bar dataKey="netCompensation" name="netCompensation" fill="#10b981" radius={[4, 4, 0, 0]} cursor="pointer" />
              </>
            ) : (
              <>
                <Bar dataKey="netCompensation" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} cursor="pointer" />
                <Bar dataKey="absorbedLoss" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} cursor="pointer" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Disruption Business Rule Explanation Note */}
      <div className="rounded-lg border border-border/80 bg-secondary/30 p-3 text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Disruption Settlement Rule:</span> Under production house SLA policies, 
          when downstream customer returns occur due to supplier component failure, the production house absorbs a <strong>50% loss share</strong> of the defect cost, with the remaining balance settled as net compensation to the supplier.
        </div>
      </div>
    </div>
  );
};
