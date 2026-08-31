'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Area,
  ComposedChart,
  BarChart,
  Bar
} from 'recharts';
import {
  PurchaseOrder,
  SupplierMetrics,
  PricePredictionResult,
  DeliveryPredictionResult,
  QualityRiskResult,
  CapacityPredictionResult
} from '../lib/types';
import {
  predictComponentPrices,
  predictDeliveryLeadTimes,
  predictQualityRisks,
  predictFulfillmentCapacities
} from '../lib/analyticsEngine';
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Sparkles,
  Info
} from 'lucide-react';

interface PredictiveForecastProps {
  orders: PurchaseOrder[];
  suppliers: SupplierMetrics[];
  onSelectSupplier?: (supplierName: string) => void;
}

export const PredictiveForecast: React.FC<PredictiveForecastProps> = ({
  orders,
  suppliers,
  onSelectSupplier
}) => {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'price' | 'delivery' | 'quality' | 'capacity'>('price');

  // Available categories
  const categories = Array.from(new Set(orders.map(o => o.itemCategory)));
  const supplierNames = suppliers.map(s => s.supplier);

  // Predictions computed via analytics engine
  const pricePredictions: PricePredictionResult[] = predictComponentPrices(orders, selectedSupplier, selectedCategory);
  const deliveryPredictions: DeliveryPredictionResult[] = predictDeliveryLeadTimes(suppliers);
  const qualityPredictions: QualityRiskResult[] = predictQualityRisks(suppliers);
  const capacityPredictions: CapacityPredictionResult[] = predictFulfillmentCapacities(suppliers);

  const activePriceForecast = pricePredictions[0];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="space-y-5">
      {/* Navigation tabs for the 4 prediction models */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Predictive ML & Analytics Engine (Local Processing)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Statistical forecasting models running in-browser: Price Trends, Delivery Lead Times, Quality Risks, and Capacity
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-1 text-xs">
          <button
            onClick={() => setActiveTab('price')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'price' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-brand-500" />
            Price Forecast
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'delivery' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="h-3.5 w-3.5 text-emerald-500" />
            Delivery Speed
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'quality' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
            Quality Risk
          </button>
          <button
            onClick={() => setActiveTab('capacity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              activeTab === 'capacity' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-purple-500" />
            Capacity
          </button>
        </div>
      </div>

      {/* 1. PRICE PREDICTION TAB */}
      {activeTab === 'price' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Filter className="h-3.5 w-3.5 text-brand-500" /> Filter Trend Scope:
            </div>
            
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Suppliers</option>
              {supplierNames.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-border bg-secondary/50 px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Component Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {activePriceForecast && (
              <div className="ml-auto flex items-center gap-3 text-xs">
                <span className="text-muted-foreground">
                  Regression Fit R²: <strong className="text-brand-400">{activePriceForecast.rSquared}</strong>
                </span>
                <span className={`inline-flex items-center gap-1 font-bold ${
                  activePriceForecast.priceTrendPct > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {activePriceForecast.priceTrendPct > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {activePriceForecast.priceTrendPct > 0 ? `+${activePriceForecast.priceTrendPct}%` : `${activePriceForecast.priceTrendPct}%`} 90d Trend
                </span>
              </div>
            )}
          </div>

          {/* Key Forecast Summary Cards */}
          {activePriceForecast ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">Current Avg Price</div>
                  <div className="text-lg font-extrabold text-foreground mt-1">
                    {formatCurrency(activePriceForecast.currentAvgPrice)}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">{activePriceForecast.category}</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">+30-Day Forecast</div>
                  <div className="text-lg font-extrabold text-brand-500 mt-1">
                    {formatCurrency(activePriceForecast.forecast30d)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Next month expectation</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">+60-Day Forecast</div>
                  <div className="text-lg font-extrabold text-indigo-500 mt-1">
                    {formatCurrency(activePriceForecast.forecast60d)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Mid-quarter forecast</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3.5">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase">+90-Day Forecast</div>
                  <div className="text-lg font-extrabold text-purple-500 mt-1">
                    {formatCurrency(activePriceForecast.forecast90d)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">End of quarter projection</div>
                </div>
              </div>

              {/* Price Forecast Chart */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-bold text-foreground">
                    Historical Cost Price & Future 90-Day Linear Regression Cone
                  </div>
                  <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                    {activePriceForecast.supplier} • {activePriceForecast.category}
                  </span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={activePriceForecast.points} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="periodLabel"
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'currentColor' }}
                        className="text-muted-foreground"
                        domain={['auto', 'auto']}
                        tickFormatter={(val) => `$${val}`}
                      />
                      <Tooltip
                        formatter={(value: any, name: string) => [
                          formatCurrency(Number(value)),
                          name === 'historicalAvgPrice'
                            ? 'Historical Unit CP'
                            : name === 'predictedPrice'
                            ? 'Regression / Forecast Price'
                            : name === 'upperBound'
                            ? 'Upper 95% Confidence'
                            : 'Lower 95% Confidence'
                        ]}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        stroke="none"
                        fill="#38bdf8"
                        fillOpacity={0.15}
                        name="upperBound"
                      />
                      <Line
                        type="monotone"
                        dataKey="historicalAvgPrice"
                        stroke="#0ea5e9"
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        name="historicalAvgPrice"
                      />
                      <Line
                        type="monotone"
                        dataKey="predictedPrice"
                        stroke="#f59e0b"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={{ r: 4 }}
                        name="predictedPrice"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
              Please select a supplier or category with multiple historical orders to render linear regression.
            </div>
          )}
        </div>
      )}

      {/* 2. DELIVERY TIME PREDICTION TAB */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {deliveryPredictions.map((d) => (
              <div
                key={d.supplier}
                onClick={() => onSelectSupplier && onSelectSupplier(d.supplier)}
                className="rounded-xl border border-border bg-card p-4 hover:border-brand-500 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-bold text-xs text-foreground truncate">{d.supplier}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-500' :
                      d.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      {d.riskLevel} Delay Risk
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Historical Lead Time:</span>
                      <strong className="text-foreground">{d.historicalAvgDays} Days</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Lead Time:</span>
                      <strong className="text-brand-400">{d.predictedLeadTimeDays} Days</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Delay Likelihood:</span>
                      <strong className={d.delayLikelihoodPct > 20 ? 'text-rose-400' : 'text-emerald-400'}>
                        {d.delayLikelihoodPct}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-border/40 pt-2 text-[10px] text-muted-foreground">
                  90% CI Interval: <strong>{d.confidenceIntervalDays[0]} - {d.confidenceIntervalDays[1]} Days</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. QUALITY RISK PREDICTION TAB */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {qualityPredictions.map((q) => (
              <div
                key={q.supplier}
                onClick={() => onSelectSupplier && onSelectSupplier(q.supplier)}
                className="rounded-xl border border-border bg-card p-4 hover:border-brand-500 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-bold text-xs text-foreground truncate">{q.supplier}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      q.severityLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-500' :
                      q.severityLevel === 'Medium' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-rose-500/20 text-rose-500'
                    }`}>
                      {q.severityLevel} Risk
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Historical Defect Rate:</span>
                      <strong className="text-foreground">{q.historicalDefectRatePct}%</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Projected Defect Rate:</span>
                      <strong className={q.predictedFutureDefectRatePct > 5 ? 'text-rose-400' : 'text-amber-400'}>
                        {q.predictedFutureDefectRatePct}%
                      </strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Quality Risk Index:</span>
                      <strong className="text-foreground">{q.qualityRiskScore}/100</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-border/40 pt-2 text-[10px] text-muted-foreground truncate">
                  Root Cause: <strong className="text-foreground">{q.primaryRiskDriver}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CAPACITY FULFILLMENT TAB */}
      {activeTab === 'capacity' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {capacityPredictions.map((c) => (
              <div
                key={c.supplier}
                onClick={() => onSelectSupplier && onSelectSupplier(c.supplier)}
                className="rounded-xl border border-border bg-card p-4 hover:border-brand-500 transition-all cursor-pointer shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-bold text-xs text-foreground truncate">{c.supplier}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      c.isBottleneckRisk ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
                    }`}>
                      {c.isBottleneckRisk ? 'Bottleneck Risk' : 'Optimal Capacity'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Total Volume Ordered:</span>
                      <strong className="text-foreground">{c.currentRollingVolume.toLocaleString()} Units</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Max Estimated Capacity:</span>
                      <strong className="text-foreground">{c.maxSustainedCapacity.toLocaleString()} Units</strong>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Capacity Utilization:</span>
                      <strong className={c.utilizationPct > 80 ? 'text-amber-400' : 'text-brand-400'}>
                        {c.utilizationPct}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-3 border-t border-border/40 pt-2 text-[10px] text-muted-foreground flex justify-between">
                  <span>Projected Fulfillment:</span>
                  <strong className="text-emerald-400">{c.projectedFulfillmentRate}%</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
