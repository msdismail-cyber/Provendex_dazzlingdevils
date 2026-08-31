'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { RiskMatrix3x3 } from '@/components/RiskMatrix3x3';
import { Grid3X3, ShieldAlert } from 'lucide-react';

export default function RiskMatrixPage() {
  const { suppliers, openSupplierDetail } = useData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <Grid3X3 className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                3x3 Supplier Risk Matrix (Heatmap)
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Dynamic 2-dimensional evaluation mapping failure likelihood against business spend criticality to trigger targeted procurement governance.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground border border-border">
            <ShieldAlert className="h-4 w-4 text-brand-500" />
            <span>Classification: <strong>9-Quadrant Risk Taxonomy</strong></span>
          </div>
        </div>
      </div>

      {/* Main 3x3 Risk Matrix */}
      <RiskMatrix3x3
        suppliers={suppliers}
        onSelectSupplier={openSupplierDetail}
      />
    </div>
  );
}
