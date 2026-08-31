'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/lib/DataContext';
import { KPISummaryCards } from '@/components/KPISummaryCards';
import { CorePieCharts } from '@/components/CorePieCharts';
import { DisruptionBarChart } from '@/components/DisruptionBarChart';
import { RiskMatrix3x3 } from '@/components/RiskMatrix3x3';
import {
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const {
    suppliers,
    summary,
    lossSharePct,
    setLossSharePct,
    openSupplierDetail,
    datasetName
  } = useData();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              Executive Procurement Intelligence Operating System
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Supplier Risk, Disruption & Strategy Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Local AI processing engine analyzing <strong className="text-white">{summary.totalOrders.toLocaleString()} POs</strong> across <strong className="text-white">{summary.supplierCount} Suppliers</strong> from <strong className="text-brand-300">{datasetName}</strong>.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/import"
              className="flex items-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-700 hover:border-brand-500 transition-all shadow-sm"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
              Ingest Data (CSV/XLSX/SQL/PDF)
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-all shadow-md shadow-brand-600/30"
            >
              <TrendingUp className="h-4 w-4" />
              Run ML Predictions
            </Link>
          </div>
        </div>

        {/* Subtle background glow circle */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
      </div>

      {/* KPI Cards Summary Row */}
      <KPISummaryCards summary={summary} lossSharePct={lossSharePct} />

      {/* 4 Core Pie Charts Grid */}
      <CorePieCharts
        suppliers={suppliers}
        onSelectSupplier={openSupplierDetail}
      />

      {/* Supply Chain Disruption & Financial Compensation Bar Graph */}
      <DisruptionBarChart
        suppliers={suppliers}
        lossSharePct={lossSharePct}
        onLossShareChange={setLossSharePct}
        onSelectSupplier={openSupplierDetail}
      />

      {/* Interactive 3x3 Supplier Risk Matrix (Heatmap) */}
      <RiskMatrix3x3
        suppliers={suppliers}
        onSelectSupplier={openSupplierDetail}
      />

      {/* Complete Supplier Performance Leaderboard Table */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-brand-500" />
            <h3 className="text-sm font-bold text-foreground">
              Supplier Reliability, Disruption Settlement & Strategy Leaderboard
            </h3>
          </div>
          <Link
            href="/strategies"
            className="text-xs font-semibold text-brand-500 hover:text-brand-400 flex items-center gap-1"
          >
            View Strategic Recommendation Log <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-2">Score</th>
                <th className="py-2.5 px-2">Risk Tier</th>
                <th className="py-2.5 px-2">On-Time %</th>
                <th className="py-2.5 px-2">Defect %</th>
                <th className="py-2.5 px-3">Gross Spend</th>
                <th className="py-2.5 px-3">Margin Yield</th>
                <th className="py-2.5 px-3">{lossSharePct}% Absorbed Loss</th>
                <th className="py-2.5 px-3">Net Compensation</th>
                <th className="py-2.5 px-3">Recommended Strategy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {suppliers.map((s, idx) => (
                <tr
                  key={s.supplier}
                  onClick={() => openSupplierDetail(s.supplier)}
                  className="hover:bg-secondary/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3 font-semibold text-foreground flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">#{idx + 1}</span>
                    <span className="group-hover:text-brand-500 transition-colors">{s.supplier}</span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`font-bold ${
                      s.reliabilityScore >= 85 ? 'text-emerald-500' :
                      s.reliabilityScore >= 70 ? 'text-amber-500' :
                      'text-rose-500'
                    }`}>
                      {s.reliabilityScore}/100
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.riskTier === 'Elite' ? 'bg-emerald-500/20 text-emerald-500' :
                      s.riskTier === 'Reliable' ? 'bg-blue-500/20 text-blue-500' :
                      s.riskTier === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      {s.riskTier}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-medium text-foreground">{s.onTimeRate}%</td>
                  <td className="py-3 px-2 font-medium text-rose-400">{s.defectRate}%</td>
                  <td className="py-3 px-3 font-medium text-foreground">{formatCurrency(s.totalSpend)}</td>
                  <td className="py-3 px-3 font-semibold text-emerald-400">{formatCurrency(s.totalMargin)}</td>
                  <td className="py-3 px-3 font-medium text-rose-400">-{formatCurrency(s.absorbedLoss50Pct)}</td>
                  <td className="py-3 px-3 font-bold text-foreground">{formatCurrency(s.netFinancialCompensation)}</td>
                  <td className="py-3 px-3 text-brand-400 font-medium truncate max-w-[200px]">
                    {s.recommendedStrategy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
