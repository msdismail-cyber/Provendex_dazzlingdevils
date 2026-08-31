'use client';

import React, { useState } from 'react';
import { SupplierMetrics, RiskLevel } from '../lib/types';
import {
  Grid3X3,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';

interface RiskMatrix3x3Props {
  suppliers: SupplierMetrics[];
  onSelectSupplier?: (supplierName: string) => void;
}

interface CellConfig {
  likelihood: RiskLevel;
  impact: RiskLevel;
  label: string;
  actionTitle: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  textColor: string;
  icon: any;
}

const MATRIX_CELLS: CellConfig[] = [
  // Top Row: High Likelihood
  {
    likelihood: 'High',
    impact: 'Low',
    label: 'High Likelihood • Low Impact',
    actionTitle: 'Operational Nuisance (Automate SLA)',
    bgClass: 'bg-amber-500/10 dark:bg-amber-950/20 hover:bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    textColor: 'text-amber-500',
    icon: AlertTriangle
  },
  {
    likelihood: 'High',
    impact: 'Medium',
    label: 'High Likelihood • Med Impact',
    actionTitle: 'Elevated Risk (Mandate Remediation)',
    bgClass: 'bg-orange-500/10 dark:bg-orange-950/25 hover:bg-orange-500/15',
    borderClass: 'border-orange-500/30',
    badgeClass: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    textColor: 'text-orange-500',
    icon: AlertTriangle
  },
  {
    likelihood: 'High',
    impact: 'High',
    label: 'High Likelihood • High Impact',
    actionTitle: 'Critical Risk (Urgent Action & Phase Out)',
    bgClass: 'bg-rose-500/15 dark:bg-rose-950/30 hover:bg-rose-500/20',
    borderClass: 'border-rose-500/40 glow-risk-critical',
    badgeClass: 'bg-rose-500/20 text-rose-500 border-rose-500/30',
    textColor: 'text-rose-500',
    icon: AlertOctagon
  },

  // Middle Row: Medium Likelihood
  {
    likelihood: 'Medium',
    impact: 'Low',
    label: 'Med Likelihood • Low Impact',
    actionTitle: 'Low-Priority (Standard Terms)',
    bgClass: 'bg-slate-500/10 dark:bg-slate-800/30 hover:bg-slate-500/15',
    borderClass: 'border-border',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    textColor: 'text-slate-400',
    icon: Info
  },
  {
    likelihood: 'Medium',
    impact: 'Medium',
    label: 'Med Likelihood • Med Impact',
    actionTitle: 'Medium Risk (Active Governance)',
    bgClass: 'bg-amber-500/10 dark:bg-amber-950/20 hover:bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-500 border-amber-500/30',
    textColor: 'text-amber-500',
    icon: AlertTriangle
  },
  {
    likelihood: 'Medium',
    impact: 'High',
    label: 'Med Likelihood • High Impact',
    actionTitle: 'Severe Exposure (Dual-Source / Buffer)',
    bgClass: 'bg-orange-500/10 dark:bg-orange-950/25 hover:bg-orange-500/15',
    borderClass: 'border-orange-500/30',
    badgeClass: 'bg-orange-500/20 text-orange-500 border-orange-500/30',
    textColor: 'text-orange-500',
    icon: AlertTriangle
  },

  // Bottom Row: Low Likelihood
  {
    likelihood: 'Low',
    impact: 'Low',
    label: 'Low Likelihood • Low Impact',
    actionTitle: 'Low Risk (Monitor Routinely)',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-950/20 hover:bg-emerald-500/15',
    borderClass: 'border-emerald-500/30 glow-risk-safe',
    badgeClass: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    textColor: 'text-emerald-500',
    icon: ShieldCheck
  },
  {
    likelihood: 'Low',
    impact: 'Medium',
    label: 'Low Likelihood • Med Impact',
    actionTitle: 'Stable Core (Maintain Allocation)',
    bgClass: 'bg-emerald-500/10 dark:bg-emerald-950/20 hover:bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30',
    textColor: 'text-emerald-500',
    icon: ShieldCheck
  },
  {
    likelihood: 'Low',
    impact: 'High',
    label: 'Low Likelihood • High Impact',
    actionTitle: 'Strategic Anchor (Scale & Partner)',
    bgClass: 'bg-blue-500/10 dark:bg-blue-950/20 hover:bg-blue-500/15',
    borderClass: 'border-blue-500/30',
    badgeClass: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
    textColor: 'text-blue-500',
    icon: Sparkles
  }
];

export const RiskMatrix3x3: React.FC<RiskMatrix3x3Props> = ({
  suppliers,
  onSelectSupplier
}) => {
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSuppliers = suppliers.filter(s =>
    s.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.recommendedStrategy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group suppliers by cell
  const cellSupplierMap: Record<string, SupplierMetrics[]> = {};
  filteredSuppliers.forEach(s => {
    const key = `${s.likelihoodLevel}-${s.impactLevel}`;
    if (!cellSupplierMap[key]) cellSupplierMap[key] = [];
    cellSupplierMap[key].push(s);
  });

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <Grid3X3 className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Interactive 3x3 Supplier Risk Matrix (Heatmap)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Suppliers dynamically classified across <strong>Likelihood</strong> (Defect/Delay probability) vs. <strong>Business Impact</strong> (Spend volume & Criticality).
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter suppliers in matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Main 3x3 Matrix Grid Container */}
      <div className="relative rounded-2xl border border-border bg-card/60 p-4 lg:p-6 shadow-sm">
        
        {/* Y-Axis Label */}
        <div className="hidden md:flex absolute -left-10 top-1/2 -translate-y-1/2 -rotate-90 items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          <span>Likelihood of Failure / Delay</span>
          <ChevronRight className="h-4 w-4" />
        </div>

        {/* Grid Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {MATRIX_CELLS.map((cell, idx) => {
            const cellKey = `${cell.likelihood}-${cell.impact}`;
            const matchedSuppliers = cellSupplierMap[cellKey] || [];
            const isSelected = selectedCellKey === cellKey;
            const Icon = cell.icon;

            return (
              <div
                key={cellKey}
                onClick={() => setSelectedCellKey(isSelected ? null : cellKey)}
                className={`group relative flex flex-col justify-between min-h-[175px] rounded-xl border p-3.5 transition-all duration-200 cursor-pointer ${
                  cell.bgClass
                } ${cell.borderClass} ${isSelected ? 'ring-2 ring-brand-500 shadow-lg scale-[1.01]' : 'hover:shadow-md'}`}
              >
                {/* Cell Header */}
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {cell.likelihood} Likelihood • {cell.impact} Impact
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${cell.badgeClass}`}>
                      {matchedSuppliers.length} {matchedSuppliers.length === 1 ? 'Supplier' : 'Suppliers'}
                    </span>
                  </div>

                  <div className={`text-xs font-bold ${cell.textColor} flex items-center gap-1.5`}>
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{cell.actionTitle}</span>
                  </div>
                </div>

                {/* Suppliers In Cell */}
                <div className="my-2.5 flex flex-wrap gap-1.5">
                  {matchedSuppliers.length > 0 ? (
                    matchedSuppliers.map((s) => (
                      <button
                        key={s.supplier}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectSupplier) onSelectSupplier(s.supplier);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background/90 px-2 py-1 text-xs font-medium text-foreground hover:bg-secondary hover:border-brand-500 transition-all shadow-sm"
                        title={`Score: ${s.reliabilityScore} | Defect: ${s.defectRate}% | Strategy: ${s.recommendedStrategy}`}
                      >
                        <span className="truncate max-w-[130px]">{s.supplier}</span>
                        <span
                          className={`text-[10px] font-bold ${
                            s.reliabilityScore >= 85
                              ? 'text-emerald-500'
                              : s.reliabilityScore >= 70
                              ? 'text-amber-500'
                              : 'text-rose-500'
                          }`}
                        >
                          {s.reliabilityScore}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-2 text-[11px] italic text-muted-foreground/60">
                      No suppliers in this quadrant
                    </div>
                  )}
                </div>

                {/* Cell Footer Metrics */}
                <div className="border-t border-border/40 pt-1.5 text-[10px] text-muted-foreground flex justify-between items-center">
                  <span>Spend: ${Math.round(matchedSuppliers.reduce((acc, s) => acc + s.totalSpend, 0) / 1000)}k</span>
                  <span className="text-foreground/80 font-medium">Click to inspect</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-Axis Label */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-muted-foreground">
          <span>Business & Spend Impact (Low → Medium → High)</span>
          <ChevronRight className="h-4 w-4" />
        </div>
      </div>

      {/* Selected Cell Drill-Down Drawer */}
      {selectedCellKey && (
        <div className="rounded-xl border border-brand-500/40 bg-card p-4 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-bold text-foreground">
                Quadrant Drill-Down: {selectedCellKey.replace('-', ' Likelihood / ')} Impact
              </h3>
            </div>
            <button
              onClick={() => setSelectedCellKey(null)}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(cellSupplierMap[selectedCellKey] || []).map((s) => (
              <div
                key={s.supplier}
                onClick={() => onSelectSupplier && onSelectSupplier(s.supplier)}
                className="rounded-lg border border-border bg-secondary/30 p-3 hover:bg-secondary/60 hover:border-brand-500 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground truncate">{s.supplier}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.riskTier === 'Elite' ? 'bg-emerald-500/20 text-emerald-500' :
                    s.riskTier === 'Reliable' ? 'bg-blue-500/20 text-blue-500' :
                    s.riskTier === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-rose-500/20 text-rose-500'
                  }`}>
                    {s.riskTier}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[11px] text-muted-foreground border-y border-border/40 py-1.5">
                  <div>
                    <div>Reliability</div>
                    <strong className="text-foreground">{s.reliabilityScore}/100</strong>
                  </div>
                  <div>
                    <div>Defect Rate</div>
                    <strong className="text-rose-400">{s.defectRate}%</strong>
                  </div>
                  <div>
                    <div>On-Time</div>
                    <strong className="text-emerald-400">{s.onTimeRate}%</strong>
                  </div>
                </div>

                <div className="text-[11px] text-foreground font-medium">
                  <span className="text-brand-400">Strategy:</span> {s.recommendedStrategy}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
