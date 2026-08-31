'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { StrategyLogger } from '@/components/StrategyLogger';
import { Layers, History } from 'lucide-react';

export default function StrategiesPage() {
  const { suppliers, summary, datasetName, lossSharePct, openSupplierDetail } = useData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Layers className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Revenue & Profit Prioritization Strategy & Audit Log
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Live algorithmic procurement recommendations prioritizing high-margin and reliable suppliers while archiving decision snapshots to the permanent audit trail.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground border border-border">
            <History className="h-4 w-4 text-emerald-500" />
            <span>Persistence: <strong>Local Database & JSON/PDF Export</strong></span>
          </div>
        </div>
      </div>

      {/* Main Strategy Engine and Logger */}
      <StrategyLogger
        suppliers={suppliers}
        summary={summary}
        datasetName={datasetName}
        lossSharePct={lossSharePct}
        onSelectSupplier={openSupplierDetail}
      />
    </div>
  );
}
