'use client';

import React, { useState, useEffect } from 'react';
import {
  SupplierMetrics,
  StrategyRecommendation,
  StrategyLogEntry,
  ExecutiveSummary
} from '../lib/types';
import { generateStrategicRecommendations } from '../lib/analyticsEngine';
import {
  getStoredStrategyLogs,
  saveStrategyLog,
  deleteStrategyLog,
  clearStrategyLogs
} from '../lib/storage';
import {
  Layers,
  Sparkles,
  Save,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  History,
  TrendingUp,
  ArrowRight,
  Shield,
  Plus
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface StrategyLoggerProps {
  suppliers: SupplierMetrics[];
  summary: ExecutiveSummary;
  datasetName?: string;
  lossSharePct?: number;
  onSelectSupplier?: (supplierName: string) => void;
}

export const StrategyLogger: React.FC<StrategyLoggerProps> = ({
  suppliers,
  summary,
  datasetName = 'Global Electronics Dataset',
  lossSharePct = 50,
  onSelectSupplier
}) => {
  const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([]);
  const [historyLogs, setHistoryLogs] = useState<StrategyLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<StrategyLogEntry | null>(null);
  const [isSavingModalOpen, setIsSavingModalOpen] = useState<boolean>(false);
  const [strategyTitle, setStrategyTitle] = useState<string>('');
  const [strategyNotes, setStrategyNotes] = useState<string>('');
  const [authorName, setAuthorName] = useState<string>('AI Procurement Strategist');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    if (suppliers.length > 0) {
      const recs = generateStrategicRecommendations(suppliers);
      setRecommendations(recs);
    }
    const logs = getStoredStrategyLogs();
    setHistoryLogs(logs);
  }, [suppliers]);

  const handleSaveCurrentStrategy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!strategyTitle.trim()) return;

    const overallReliability = suppliers.length > 0
      ? Math.round((suppliers.reduce((acc, s) => acc + s.reliabilityScore, 0) / suppliers.length) * 10) / 10
      : 80;

    const saved = saveStrategyLog({
      title: strategyTitle,
      datasetName,
      lossSharePct,
      totalSpend: summary.totalSpend,
      totalMargin: summary.totalMargin,
      totalAbsorbedLoss: summary.totalAbsorbedLoss,
      overallReliabilityScore: overallReliability,
      recommendations,
      notes: strategyNotes,
      createdBy: authorName
    });

    const updated = getStoredStrategyLogs();
    setHistoryLogs(updated);
    setIsSavingModalOpen(false);
    setStrategyTitle('');
    setStrategyNotes('');
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 4000);
  };

  const handleDeleteLog = (id: string) => {
    deleteStrategyLog(id);
    const updated = getStoredStrategyLogs();
    setHistoryLogs(updated);
    if (selectedLog?.id === id) {
      setSelectedLog(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const exportStrategyToJSON = (log: StrategyLogEntry) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(log, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `provendex-strategy-${log.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportStrategyToPDF = (log: StrategyLogEntry) => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(14, 165, 233);
      doc.text('PROVENDEX - Executive Strategy Report', 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Developed by HAJANDIKA | ISMAIL | RISHIBH | RITHIN`, 14, 29);
      doc.text(`Generated: ${new Date(log.timestamp).toLocaleString()} | Author: ${log.createdBy}`, 14, 35);
      doc.text(`Dataset: ${log.datasetName} | Disruption Loss Share: ${log.lossSharePct}%`, 14, 41);

      // Financial KPIs
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Total Spend: $${log.totalSpend.toLocaleString()} | Margin: $${log.totalMargin.toLocaleString()} | Absorbed Loss: -$${log.totalAbsorbedLoss.toLocaleString()}`, 14, 50);

      // Table of Recommendations
      const tableData = log.recommendations.map(r => [
        `#${r.priorityRank}`,
        r.supplier,
        `${r.reliabilityScore}/100`,
        r.riskTier,
        r.recommendedStrategy,
        `$${r.totalMargin.toLocaleString()}`
      ]);

      (doc as any).autoTable({
        startY: 56,
        head: [['Rank', 'Supplier', 'Score', 'Risk Tier', 'Strategic Action', 'Margin Contributed']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        styles: { fontSize: 9 }
      });

      doc.save(`Provendex_Strategy_${log.id}.pdf`);
    } catch (err) {
      console.error('PDF generation error', err);
      alert('Unable to generate PDF in current client environment. Exporting JSON instead.');
      exportStrategyToJSON(log);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Sparkles className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Revenue & Profit Prioritization Strategy Engine
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Algorithmic supplier prioritization maximizing gross margin & reliability while mitigating disruption loss
          </p>
        </div>

        {/* Snapshot Save Trigger */}
        <button
          onClick={() => {
            setStrategyTitle(`Strategy Plan - ${new Date().toLocaleDateString()}`);
            setIsSavingModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
        >
          <Save className="h-4 w-4" />
          Save Strategy Snapshot
        </button>
      </div>

      {saveSuccessNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Strategy snapshot saved successfully to the permanent audit log!
        </div>
      )}

      {/* Live AI Strategic Recommendations Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            Current Live Supplier Strategy Recommendations
          </h3>
          <span className="text-xs text-muted-foreground">
            Ranked by Margin Contribution & Reliability Index
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {recommendations.map((rec) => (
            <div
              key={rec.supplier}
              onClick={() => onSelectSupplier && onSelectSupplier(rec.supplier)}
              className="group relative rounded-xl border border-border bg-card p-4 hover:border-brand-500 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500/20 text-[10px] font-extrabold text-brand-400">
                      #{rec.priorityRank}
                    </span>
                    <span className="font-bold text-xs text-foreground truncate">{rec.supplier}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    rec.riskTier === 'Elite' ? 'bg-emerald-500/20 text-emerald-500' :
                    rec.riskTier === 'Reliable' ? 'bg-blue-500/20 text-blue-500' :
                    rec.riskTier === 'Moderate Risk' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-rose-500/20 text-rose-500'
                  }`}>
                    {rec.riskTier}
                  </span>
                </div>

                {/* Strategic Action Banner */}
                <div className="rounded-lg bg-secondary/50 p-2.5 mb-2.5 text-xs">
                  <div className="font-extrabold text-brand-500 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    {rec.recommendedStrategy}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {rec.rationale}
                  </p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs py-1">
                  <div className="rounded-md bg-secondary/30 p-1.5">
                    <div className="text-[10px] text-muted-foreground">Reliability</div>
                    <strong className="text-foreground">{rec.reliabilityScore}</strong>
                  </div>
                  <div className="rounded-md bg-secondary/30 p-1.5">
                    <div className="text-[10px] text-muted-foreground">Total Margin</div>
                    <strong className="text-emerald-400">{formatCurrency(rec.totalMargin)}</strong>
                  </div>
                  <div className="rounded-md bg-secondary/30 p-1.5">
                    <div className="text-[10px] text-muted-foreground">Defect Rate</div>
                    <strong className={rec.defectRate > 4 ? 'text-rose-400' : 'text-foreground'}>{rec.defectRate}%</strong>
                  </div>
                </div>

                {/* Action items */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Immediate Action Protocol:</div>
                  {rec.actionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground">
                      <ArrowRight className="h-3 w-3 text-brand-500 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Strategy History & Audit Log */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-purple-500" />
            <h3 className="text-sm font-bold text-foreground">
              Strategy Execution History & Decision Audit Log
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {historyLogs.length} Snapshots Archived in Local Database
          </span>
        </div>

        {historyLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No past strategy snapshots stored yet. Click "Save Strategy Snapshot" to capture current recommendations.
          </div>
        ) : (
          <div className="space-y-3">
            {historyLogs.map((log) => {
              const isSelected = selectedLog?.id === log.id;
              return (
                <div
                  key={log.id}
                  className={`rounded-xl border transition-all ${
                    isSelected ? 'border-brand-500 bg-secondary/40 shadow-md' : 'border-border bg-card hover:bg-secondary/20'
                  }`}
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{log.title}</span>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                        <span>Dataset: <strong className="text-foreground">{log.datasetName}</strong></span>
                        <span>Author: <strong className="text-foreground">{log.createdBy}</strong></span>
                        <span>Spend: <strong className="text-foreground">{formatCurrency(log.totalSpend)}</strong></span>
                        <span>Margin: <strong className="text-emerald-400">{formatCurrency(log.totalMargin)}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <button
                        onClick={() => setSelectedLog(isSelected ? null : log)}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                      >
                        {isSelected ? 'Hide Details' : 'View Breakdown'}
                      </button>
                      <button
                        onClick={() => exportStrategyToPDF(log)}
                        className="rounded-lg border border-border bg-card p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Export Strategy PDF"
                      >
                        <FileText className="h-3.5 w-3.5 text-brand-500" />
                      </button>
                      <button
                        onClick={() => exportStrategyToJSON(log)}
                        className="rounded-lg border border-border bg-card p-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        title="Export JSON"
                      >
                        <Download className="h-3.5 w-3.5 text-emerald-500" />
                      </button>
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="rounded-lg border border-border bg-card p-1.5 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete Snapshot"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail drawer for snapshot */}
                  {isSelected && (
                    <div className="border-t border-border/80 p-4 bg-background/50 space-y-3">
                      {log.notes && (
                        <div className="text-xs text-muted-foreground bg-secondary/40 p-2.5 rounded-lg">
                          <strong className="text-foreground">Executive Notes:</strong> {log.notes}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {log.recommendations.map((r) => (
                          <div key={r.supplier} className="rounded-lg border border-border/60 bg-card p-3 text-xs space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="truncate">{r.supplier}</span>
                              <span className="text-brand-400">{r.reliabilityScore}/100</span>
                            </div>
                            <div className="text-emerald-400 font-semibold">{r.recommendedStrategy}</div>
                            <div className="text-[11px] text-muted-foreground leading-snug">{r.rationale}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Snapshot Save Modal */}
      {isSavingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Save className="h-5 w-5 text-brand-500" />
                Archive Strategy Execution Snapshot
              </h3>
              <button
                onClick={() => setIsSavingModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCurrentStrategy} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Strategy Title / Scenario Name</label>
                <input
                  type="text"
                  required
                  value={strategyTitle}
                  onChange={(e) => setStrategyTitle(e.target.value)}
                  placeholder="e.g., Q3 Multi-Vendor Allocation & Defect Hedge"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Author / Lead Strategist</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Executive Notes & Context</label>
                <textarea
                  rows={3}
                  value={strategyNotes}
                  onChange={(e) => setStrategyNotes(e.target.value)}
                  placeholder="Document key decisions, risk mitigation actions, or board review notes..."
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="rounded-lg bg-secondary/50 p-2.5 text-[11px] text-muted-foreground">
                Captures {recommendations.length} supplier strategies, financial KPIs ($ {summary.totalSpend.toLocaleString()} spend), and {lossSharePct}% loss share disruption rules.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSavingModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm hover:bg-brand-500"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
