'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { DisruptionBarChart } from '@/components/DisruptionBarChart';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function DisruptionPage() {
  const { suppliers, lossSharePct, setLossSharePct, openSupplierDetail } = useData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Supply Chain Disruption & Financial Compensation Simulation
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Production house 50% loss share absorption modeling for downstream customer component returns, showing gross spend vs absorbed loss deduction vs net payout.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground border border-border">
            <ShieldAlert className="h-4 w-4 text-purple-500" />
            <span>Policy: <strong>50% Production Loss Sharing Model</strong></span>
          </div>
        </div>
      </div>

      {/* Main Disruption Bar Chart & Controls */}
      <DisruptionBarChart
        suppliers={suppliers}
        lossSharePct={lossSharePct}
        onLossShareChange={setLossSharePct}
        onSelectSupplier={openSupplierDetail}
      />
    </div>
  );
}
