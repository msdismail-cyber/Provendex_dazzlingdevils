'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { PredictiveForecast } from '@/components/PredictiveForecast';
import { TrendingUp, Cpu } from 'lucide-react';

export default function AnalyticsPage() {
  const { orders, suppliers, openSupplierDetail } = useData();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <TrendingUp className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Predictive Analytics & Forecasting Intelligence
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Local machine learning algorithms executing time-series linear regressions, lead time variance models, defect severity probability, and capacity utilization limits.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground border border-border">
            <Cpu className="h-4 w-4 text-emerald-500" />
            <span>Active Model: <strong>Multi-Variate Time-Series Regressor</strong></span>
          </div>
        </div>
      </div>

      {/* Main Forecast Interactive Component */}
      <PredictiveForecast
        orders={orders}
        suppliers={suppliers}
        onSelectSupplier={openSupplierDetail}
      />
    </div>
  );
}
