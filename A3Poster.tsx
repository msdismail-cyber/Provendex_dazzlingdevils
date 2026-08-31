'use client';

import React, { useRef, useState } from 'react';
import { SupplierMetrics, ExecutiveSummary } from '../lib/types';
import {
  ShieldCheck,
  TrendingUp,
  Grid3X3,
  AlertTriangle,
  Layers,
  DollarSign,
  Clock,
  Printer,
  Download,
  Sparkles,
  Award,
  Cpu,
  ArrowDownRight,
  Sun,
  Moon
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface A3PosterProps {
  suppliers: SupplierMetrics[];
  summary: ExecutiveSummary;
  lossSharePct?: number;
  datasetName?: string;
}

export const A3Poster: React.FC<A3PosterProps> = ({
  suppliers,
  summary,
  lossSharePct = 50,
  datasetName = 'Enterprise Global Supply Chain'
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [posterTheme, setPosterTheme] = useState<'dark' | 'light'>('dark');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a3'
      });

      // Background
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 297, 420, 'F');

      // Header Banner
      doc.setFillColor(30, 41, 59); // slate-800
      doc.roundedRect(15, 15, 267, 36, 4, 4, 'F');

      // Title
      doc.setFontSize(26);
      doc.setTextColor(56, 189, 248); // sky-400
      doc.text('PROVENDEX', 22, 28);

      doc.setFontSize(11);
      doc.setTextColor(226, 232, 240);
      doc.text('AI-Driven Procurement Predictive Intelligence & Supplier Risk Operating System', 22, 36);

      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184);
      doc.text('Developed by HAJANDIKA | ISMAIL | RISHIBH | RITHIN', 22, 44);

      // KPI Boxes Row
      const kpis = [
        { label: 'TOTAL PO SPEND', value: `$${(summary.totalSpend / 1e6).toFixed(2)}M`, color: [14, 165, 233] },
        { label: 'GROSS MARGIN', value: `$${(summary.totalMargin / 1e6).toFixed(2)}M`, color: [16, 185, 129] },
        { label: 'ON-TIME RATE', value: `${summary.overallOnTimeRate}%`, color: [99, 102, 241] },
        { label: 'DEFECT RATE', value: `${summary.overallDefectRate}%`, color: [244, 63, 94] },
        { label: `${lossSharePct}% ABSORB LOSS`, value: `-$${(summary.totalAbsorbedLoss / 1e3).toFixed(1)}k`, color: [239, 68, 68] }
      ];

      kpis.forEach((k, idx) => {
        const x = 15 + idx * 54.5;
        doc.setFillColor(24, 32, 47);
        doc.roundedRect(x, 56, 49, 24, 3, 3, 'F');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(k.label, x + 5, 64);
        doc.setFontSize(14);
        doc.setTextColor(k.color[0], k.color[1], k.color[2]);
        doc.text(k.value, x + 5, 74);
      });

      // Section 1: Core Summary Table
      doc.setFontSize(14);
      doc.setTextColor(56, 189, 248);
      doc.text('1. Supplier Reliability & Disruption Loss Settlement Matrix', 15, 90);

      const tableRows = suppliers.slice(0, 10).map((s, i) => [
        `#${i + 1} ${s.supplier}`,
        `${s.reliabilityScore}/100`,
        s.riskTier,
        `${s.onTimeRate}%`,
        `${s.defectRate}%`,
        `$${(s.totalSpend / 1000).toFixed(0)}k`,
        `$${(s.totalMargin / 1000).toFixed(0)}k`,
        `-$${(s.absorbedLoss50Pct / 1000).toFixed(1)}k`,
        `$${(s.netFinancialCompensation / 1000).toFixed(0)}k`,
        s.recommendedStrategy
      ]);

      (doc as any).autoTable({
        startY: 95,
        margin: { left: 15, right: 15 },
        head: [['Supplier', 'Score', 'Tier', 'On-Time', 'Defect', 'Spend', 'Margin', '50% Loss', 'Net Comp', 'Strategy']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: [226, 232, 240], fillColor: [24, 32, 47] },
        alternateRowStyles: { fillColor: [18, 26, 40] }
      });

      // Section 2: Mathematical Algorithms
      let finalY = (doc as any).lastAutoTable?.finalY || 240;
      doc.setFontSize(14);
      doc.setTextColor(56, 189, 248);
      doc.text('2. Local Machine Learning Predictive Engines & Mathematical Models', 15, finalY + 12);

      const mathBlocks = [
        ['Price Prediction', 'y(t) = alpha + beta * t + epsilon (Ordinary Least Squares Linear Trend Projection)'],
        ['Reliability Score (SRS)', 'SRS = 0.40 * OnTime + 0.40 * (100 - 6*DefectRate) + 0.10 * Stability + 0.10 * MarginScore'],
        ['50% Disruption Loss', 'Absorbed Loss = Defective Units * Unit CP * (LossShare / 100)'],
        ['3x3 Risk Matrix', 'Likelihood: f(DefectRate, DelayProb) | Impact: f(SpendShare, ComponentCriticality)']
      ];

      (doc as any).autoTable({
        startY: finalY + 16,
        margin: { left: 15, right: 15 },
        head: [['Predictive Module', 'Algorithmic Formulation']],
        body: mathBlocks,
        theme: 'plain',
        headStyles: { fillColor: [14, 165, 233], textColor: [255, 255, 255], fontSize: 9 },
        bodyStyles: { fontSize: 8.5, textColor: [226, 232, 240], fillColor: [24, 32, 47] }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('PROVENDEX A3 EXECUTIVE POSTER • GENERATED BY HAJANDIKA | ISMAIL | RISHIBH | RITHIN • LOCAL ML CLIENT ENGINE', 15, 410);

      doc.save('Provendex_Executive_A3_Poster.pdf');
    } catch (err) {
      console.error('Failed to export PDF', err);
      alert('Generating PDF via browser print dialogue.');
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Bar (Excluded during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-sm print:hidden">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-500" />
            Canvas A3 Executive Poster & Presentation Studio
          </h2>
          <p className="text-xs text-muted-foreground">
            Print-ready, high-resolution Canvas A3 (297 × 420 mm) summary poster for executive presentations and academic defense.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPosterTheme(posterTheme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
          >
            {posterTheme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            {posterTheme === 'dark' ? 'Light Theme Poster' : 'Dark Theme Poster'}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download A3 PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <Printer className="h-4 w-4 text-emerald-500" />
            Print Poster
          </button>
        </div>
      </div>

      {/* A3 Poster Container (Aspect Ratio 1 : 1.414) */}
      <div className="flex justify-center overflow-x-auto pb-8">
        <div
          ref={posterRef}
          className={`relative w-[297mm] min-h-[420mm] max-w-full shadow-2xl rounded-2xl p-8 sm:p-10 transition-all font-sans ${
            posterTheme === 'dark'
              ? 'bg-slate-950 text-slate-100 border border-slate-800'
              : 'bg-slate-50 text-slate-900 border border-slate-300'
          }`}
          style={{ aspectRatio: '297 / 420' }}
        >
          {/* Top Header Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-950 via-slate-900 to-indigo-950 p-6 text-white border border-brand-500/30 shadow-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 shadow-md">
                  <ShieldCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-black tracking-tight text-white">Provendex</h1>
                    <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300 border border-brand-400/30">
                      Procurement OS & AI Risk Engine
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Predictive Procurement Analytics, Supplier Risk Scoring & Disruption Loss Simulation
                  </p>
                  <p className="text-[11px] font-medium text-brand-300 tracking-wide mt-1">
                    Developed by <strong>HAJANDIKA | ISMAIL | RISHIBH | RITHIN</strong>
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <div className="rounded-lg bg-slate-800/80 px-3 py-1.5 border border-slate-700 text-xs">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Active Scope</div>
                  <div className="font-bold text-emerald-400">{datasetName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Executive KPI Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Total Invoiced Spend</div>
              <div className="text-xl font-extrabold text-foreground mt-1">{formatCurrency(summary.totalSpend)}</div>
              <div className="text-[10px] text-muted-foreground">{summary.totalOrders} Purchase Orders</div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Portfolio Gross Margin</div>
              <div className="text-xl font-extrabold text-emerald-500 mt-1">{formatCurrency(summary.totalMargin)}</div>
              <div className="text-[10px] text-emerald-500 font-semibold">{summary.avgMarginPct}% Margin Yield</div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Punctuality Score</div>
              <div className="text-xl font-extrabold text-brand-500 mt-1">{summary.overallOnTimeRate}%</div>
              <div className="text-[10px] text-muted-foreground">Avg Lead: {summary.avgLeadTimeDays}d</div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
              <div className="text-[10px] font-bold text-muted-foreground uppercase">Overall Defect Rate</div>
              <div className="text-xl font-extrabold text-rose-500 mt-1">{summary.overallDefectRate}%</div>
              <div className="text-[10px] text-rose-400 font-medium">{summary.totalDefects.toLocaleString()} Defective Units</div>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3 shadow-sm">
              <div className="text-[10px] font-bold text-rose-400 uppercase">{lossSharePct}% Absorbed Loss</div>
              <div className="text-xl font-extrabold text-rose-500 mt-1">-{formatCurrency(summary.totalAbsorbedLoss)}</div>
              <div className="text-[10px] text-muted-foreground">Production House Share</div>
            </div>
          </div>

          {/* Section 1: 4 Core Pie Charts Highlights */}
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-border/60 pb-2">
              <Layers className="h-4 w-4 text-brand-500" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-foreground">
                1. Four Core Supplier Distribution Perspectives
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-emerald-400">
                  <Clock className="h-3.5 w-3.5" /> Punctuality Split
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Overall on-time delivery rate is <strong>{summary.overallOnTimeRate}%</strong> across all fulfilled purchase orders.
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-[10px] font-semibold text-emerald-400">
                  On-Time: {suppliers.reduce((a, s) => a + s.onTimeDeliveries, 0)} POs
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-rose-400">
                  <AlertTriangle className="h-3.5 w-3.5" /> Component Defects
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Identified defect concentration across high-stress silicon and mechanical parts.
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-[10px] font-semibold text-rose-400">
                  Total Defects: {summary.totalDefects.toLocaleString()} units
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-blue-400">
                  <Layers className="h-3.5 w-3.5" /> Quantity Allocation
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Balanced volume allocation across {summary.supplierCount} primary suppliers.
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-[10px] font-semibold text-blue-400">
                  Total Units: {summary.totalQuantity.toLocaleString()}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
                <div className="font-bold text-foreground flex items-center gap-1.5 text-purple-400">
                  <DollarSign className="h-3.5 w-3.5" /> Revenue & Margin
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Gross revenue generation yielding {summary.avgMarginPct}% net margin return.
                </div>
                <div className="rounded-lg bg-secondary/50 p-2 text-[10px] font-semibold text-purple-400">
                  Total Margin: {formatCurrency(summary.totalMargin)}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 3x3 Supplier Risk Heatmap & Disruption Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            
            {/* 3x3 Matrix Blueprint */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                <Grid3X3 className="h-4 w-4 text-brand-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  2. 3x3 Supplier Risk Matrix (Likelihood vs Impact)
                </h4>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2">
                  <div className="font-bold text-amber-500">High / Low</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Automate SLA</div>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-2">
                  <div className="font-bold text-orange-500">High / Med</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Remediate</div>
                </div>
                <div className="rounded-lg bg-rose-500/20 border border-rose-500/40 p-2">
                  <div className="font-bold text-rose-500">High / High</div>
                  <div className="text-[9px] text-rose-400 font-extrabold mt-0.5">Critical Risk (Phase Out)</div>
                </div>

                <div className="rounded-lg bg-slate-500/10 border border-border p-2">
                  <div className="font-bold text-slate-400">Med / Low</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Standard</div>
                </div>
                <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2">
                  <div className="font-bold text-amber-500">Med / Med</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Active Manage</div>
                </div>
                <div className="rounded-lg bg-orange-500/10 border border-orange-500/30 p-2">
                  <div className="font-bold text-orange-500">Med / High</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Dual-Source</div>
                </div>

                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2">
                  <div className="font-bold text-emerald-500">Low / Low</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Monitor</div>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2">
                  <div className="font-bold text-emerald-500">Low / Med</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">Maintain Core</div>
                </div>
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-2">
                  <div className="font-bold text-blue-500">Low / High</div>
                  <div className="text-[9px] text-blue-400 font-extrabold mt-0.5">Scale Strategic</div>
                </div>
              </div>
            </div>

            {/* Disruption & 50% Loss Rule */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <AlertTriangle className="h-4 w-4 text-purple-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    3. Supply Chain Disruption & 50% Loss Share Rule
                  </h4>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  When downstream customer returns occur due to vendor defects, the production house absorbs a <strong>50% loss share</strong> of the defect cost. Remaining balance is settled as net supplier compensation.
                </p>
              </div>

              <div className="rounded-xl bg-secondary/40 border border-border p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Gross Invoiced Value:</span>
                  <strong className="text-foreground">{formatCurrency(summary.totalSpend)}</strong>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>{lossSharePct}% Absorbed Loss:</span>
                  <strong>-{formatCurrency(summary.totalAbsorbedLoss)}</strong>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-border pt-1">
                  <span>Net Settled Compensation:</span>
                  <span>{formatCurrency(summary.totalNetCompensation)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Section 3: Predictive ML Engine Formulations */}
          <div className="rounded-xl border border-border bg-card p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
              <Cpu className="h-4 w-4 text-emerald-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                4. Predictive Machine Learning Algorithms (Local Processing)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1 border border-border/60">
                <div className="font-bold text-foreground text-brand-400">Price Trend Forecaster</div>
                <div className="text-[10px] font-mono text-muted-foreground">y(t) = α + β·t + ε</div>
                <p className="text-[10px] text-muted-foreground">Ordinary Least Squares linear regression forecasting CP/SP unit prices for next 90 days.</p>
              </div>

              <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1 border border-border/60">
                <div className="font-bold text-foreground text-emerald-400">Delivery Lead Predictor</div>
                <div className="text-[10px] font-mono text-muted-foreground">CI = μ ± 1.64·σ</div>
                <p className="text-[10px] text-muted-foreground">Calculates 90% confidence intervals and delay probability across historical delivery variance.</p>
              </div>

              <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1 border border-border/60">
                <div className="font-bold text-foreground text-rose-400">Quality Defect Risk</div>
                <div className="text-[10px] font-mono text-muted-foreground">Rate = D_units / Q_total</div>
                <p className="text-[10px] text-muted-foreground">Bayesian smoothed defect risk modeling with root-cause clustering and SLA penalty trigger.</p>
              </div>

              <div className="rounded-lg bg-secondary/30 p-2.5 space-y-1 border border-border/60">
                <div className="font-bold text-foreground text-purple-400">Supplier Reliability SRS</div>
                <div className="text-[10px] font-mono text-muted-foreground">SRS = 0.40·OT + 0.40·Q + 0.20·M</div>
                <p className="text-[10px] text-muted-foreground">Weighted multi-variate score indexing suppliers into Elite, Reliable, Moderate, and Critical Risk.</p>
              </div>
            </div>
          </div>

          {/* Section 4: Top Supplier Strategies Table */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-brand-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  5. Strategic Supplier Prioritization & Recommendation Table
                </h4>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">Ranked by Reliability & Margin</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="border-b border-border text-muted-foreground uppercase text-[9px] font-bold">
                  <tr>
                    <th className="py-1.5 px-2">Rank / Supplier</th>
                    <th className="py-1.5 px-1.5">SRS Score</th>
                    <th className="py-1.5 px-1.5">Tier</th>
                    <th className="py-1.5 px-1.5">On-Time %</th>
                    <th className="py-1.5 px-1.5">Defect %</th>
                    <th className="py-1.5 px-2">Total Margin</th>
                    <th className="py-1.5 px-2">Recommended Strategy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {suppliers.slice(0, 6).map((s, idx) => (
                    <tr key={s.supplier}>
                      <td className="py-2 px-2 font-bold text-foreground">#{idx + 1} {s.supplier}</td>
                      <td className="py-2 px-1.5 font-extrabold text-emerald-400">{s.reliabilityScore}/100</td>
                      <td className="py-2 px-1.5">
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-bold">
                          {s.riskTier}
                        </span>
                      </td>
                      <td className="py-2 px-1.5">{s.onTimeRate}%</td>
                      <td className="py-2 px-1.5 text-rose-400">{s.defectRate}%</td>
                      <td className="py-2 px-2 font-semibold text-emerald-400">{formatCurrency(s.totalMargin)}</td>
                      <td className="py-2 px-2 text-brand-400 font-medium truncate max-w-[200px]">{s.recommendedStrategy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Credits */}
          <div className="mt-8 border-t border-border/80 pt-4 flex flex-col sm:flex-row items-center justify-between text-[10px] text-muted-foreground gap-2">
            <div>
              PROVENDEX AI OS • <strong>Developed by HAJANDIKA | ISMAIL | RISHIBH | RITHIN</strong>
            </div>
            <div>
              Executive Presentation Poster • ISO A3 Standard (297 × 420 mm)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
