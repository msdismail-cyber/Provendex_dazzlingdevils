'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { SupplierMetrics } from '../lib/types';
import { Clock, AlertTriangle, Layers, DollarSign, Info } from 'lucide-react';

interface CorePieChartsProps {
  suppliers: SupplierMetrics[];
  onSelectSupplier?: (supplierName: string) => void;
}

// Executive color palette for high-contrast clarity
const BRAND_COLORS = [
  '#0ea5e9', // Sky
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#14b8a6', // Teal
  '#f43f5e', // Rose
  '#06b6d4', // Cyan
  '#84cc16'  // Lime
];

const ON_TIME_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export const CorePieCharts: React.FC<CorePieChartsProps> = ({
  suppliers,
  onSelectSupplier
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'all' | 'punctuality' | 'defects' | 'quantity' | 'revenue'>('all');

  if (!suppliers || suppliers.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-card p-6 text-center text-muted-foreground">
        No supplier metrics available to render distribution charts.
      </div>
    );
  }

  // 1. Punctuality Distribution: On-time vs Late orders per supplier
  const punctualityData = suppliers.map((s, idx) => ({
    name: s.supplier,
    onTimeDeliveries: s.onTimeDeliveries,
    delayedDeliveries: s.delayedDeliveries,
    onTimeRate: s.onTimeRate,
    value: s.onTimeDeliveries + s.delayedDeliveries,
    color: BRAND_COLORS[idx % BRAND_COLORS.length]
  }));

  // Aggregate On-time vs Delayed total split
  const totalOnTime = suppliers.reduce((acc, s) => acc + s.onTimeDeliveries, 0);
  const totalDelayed = suppliers.reduce((acc, s) => acc + s.delayedDeliveries, 0);
  const aggregatePunctualityData = [
    { name: 'On-Time Deliveries', value: totalOnTime, color: '#10b981' },
    { name: 'Delayed Deliveries', value: totalDelayed, color: '#f59e0b' }
  ];

  // 2. Component Return / Defect Distribution: Percentage of defective units split by supplier
  const defectData = suppliers
    .filter(s => s.totalDefectiveUnits > 0)
    .map((s, idx) => ({
      name: s.supplier,
      value: s.totalDefectiveUnits,
      defectRate: s.defectRate,
      color: BRAND_COLORS[idx % BRAND_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Total Order Quantity Share: Total quantities ordered per supplier
  const quantityData = suppliers
    .map((s, idx) => ({
      name: s.supplier,
      value: s.totalQuantity,
      color: BRAND_COLORS[idx % BRAND_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  // 4. Revenue Share: Total spend / revenue contributed per supplier
  const revenueData = suppliers
    .map((s, idx) => ({
      name: s.supplier,
      value: s.totalRevenue,
      margin: s.totalMargin,
      color: BRAND_COLORS[idx % BRAND_COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-popover p-3 shadow-xl text-xs z-50">
          <div className="font-bold text-foreground mb-1">{data.name}</div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: data.color }} />
            <span>Value: <strong className="text-foreground">{typeof data.value === 'number' && data.value > 10000 ? formatCurrency(data.value) : data.value.toLocaleString()}</strong></span>
          </div>
          {data.onTimeRate !== undefined && (
            <div className="text-[11px] text-emerald-400 mt-1">
              On-Time Performance: <strong>{data.onTimeRate}%</strong>
            </div>
          )}
          {data.defectRate !== undefined && (
            <div className="text-[11px] text-rose-400 mt-1">
              Defect Rate: <strong>{data.defectRate}%</strong>
            </div>
          )}
          {data.margin !== undefined && (
            <div className="text-[11px] text-brand-400 mt-1">
              Margin Contributed: <strong>{formatCurrency(data.margin)}</strong>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-brand-500" />
            Core Supplier Distribution Analytics
          </h2>
          <p className="text-xs text-muted-foreground">
            Four core distribution perspectives: Punctuality, Component Returns, Quantity Allocation, and Revenue Share
          </p>
        </div>

        {/* View switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-1 text-xs">
          <button
            onClick={() => setActiveChartTab('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeChartTab === 'all' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All 4 Charts
          </button>
          <button
            onClick={() => setActiveChartTab('punctuality')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeChartTab === 'punctuality' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Punctuality
          </button>
          <button
            onClick={() => setActiveChartTab('defects')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeChartTab === 'defects' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Returns & Defects
          </button>
          <button
            onClick={() => setActiveChartTab('quantity')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeChartTab === 'quantity' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Quantity Share
          </button>
          <button
            onClick={() => setActiveChartTab('revenue')}
            className={`px-2.5 py-1 rounded-md font-medium transition-all ${
              activeChartTab === 'revenue' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Revenue Share
          </button>
        </div>
      </div>

      {/* 4-Chart Responsive Grid */}
      <div className={`grid gap-4 ${activeChartTab === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 max-w-2xl mx-auto'}`}>
        
        {/* CHART 1: Punctuality Distribution */}
        {(activeChartTab === 'all' || activeChartTab === 'punctuality') && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-500">
                  <Clock className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">1. Punctuality Split</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                {Math.round((totalOnTime / ((totalOnTime + totalDelayed) || 1)) * 100)}% On-Time
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={punctualityData}
                    dataKey="onTimeDeliveries"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={42}
                    paddingAngle={2}
                    onClick={(entry) => onSelectSupplier && onSelectSupplier(entry.name)}
                    cursor="pointer"
                  >
                    {punctualityData.map((entry, index) => (
                      <Cell key={`cell-punc-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Total On-Time POs:</span>
                <strong className="text-foreground">{totalOnTime}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Delayed POs:</span>
                <strong className="text-foreground">{totalDelayed}</strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 2: Component Return / Defect Distribution */}
        {(activeChartTab === 'all' || activeChartTab === 'defects') && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-500">
                  <AlertTriangle className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">2. Component Defect Share</span>
              </div>
              <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full">
                {defectData.reduce((acc, d) => acc + d.value, 0).toLocaleString()} Units
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={42}
                    paddingAngle={3}
                    onClick={(entry) => onSelectSupplier && onSelectSupplier(entry.name)}
                    cursor="pointer"
                  >
                    {defectData.map((entry, index) => (
                      <Cell key={`cell-def-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Top Defect Contributor:</span>
                <strong className="text-rose-400 truncate max-w-[120px]">{defectData[0]?.name || 'None'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Highest Defect Rate:</span>
                <strong className="text-foreground">{defectData[0]?.defectRate || 0}%</strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 3: Total Order Quantity Share */}
        {(activeChartTab === 'all' || activeChartTab === 'quantity') && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-500">
                  <Layers className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">3. Quantity Allocation</span>
              </div>
              <span className="text-[10px] font-semibold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                {quantityData.reduce((acc, d) => acc + d.value, 0).toLocaleString()} Units
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={quantityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={42}
                    paddingAngle={2}
                    onClick={(entry) => onSelectSupplier && onSelectSupplier(entry.name)}
                    cursor="pointer"
                  >
                    {quantityData.map((entry, index) => (
                      <Cell key={`cell-qty-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Top Volume Supplier:</span>
                <strong className="text-brand-400 truncate max-w-[120px]">{quantityData[0]?.name || 'N/A'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Volume Share:</span>
                <strong className="text-foreground">
                  {Math.round((quantityData[0]?.value / (quantityData.reduce((acc, d) => acc + d.value, 0) || 1)) * 100)}%
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* CHART 4: Revenue Share */}
        {(activeChartTab === 'all' || activeChartTab === 'revenue') && (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col justify-between hover:border-brand-500/40 transition-colors">
            <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-foreground">4. Revenue Contribution</span>
              </div>
              <span className="text-[10px] font-semibold text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full">
                {formatCurrency(revenueData.reduce((acc, d) => acc + d.value, 0))}
              </span>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={42}
                    paddingAngle={2}
                    onClick={(entry) => onSelectSupplier && onSelectSupplier(entry.name)}
                    cursor="pointer"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-rev-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Top Revenue Partner:</span>
                <strong className="text-purple-400 truncate max-w-[120px]">{revenueData[0]?.name || 'N/A'}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Margin Yield:</span>
                <strong className="text-emerald-400">
                  {formatCurrency(revenueData.reduce((acc, d) => acc + (d.margin || 0), 0))}
                </strong>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
