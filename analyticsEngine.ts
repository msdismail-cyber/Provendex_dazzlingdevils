import {
  PurchaseOrder,
  SupplierMetrics,
  ExecutiveSummary,
  RiskLevel,
  RiskTier,
  PricePredictionResult,
  PriceForecastPoint,
  DeliveryPredictionResult,
  QualityRiskResult,
  CapacityPredictionResult,
  StrategyRecommendation,
  DefectReasonBreakdown
} from './types';

/**
 * Calculates full aggregated metrics across all suppliers and procurement orders
 */
export function computeSupplierMetrics(
  orders: PurchaseOrder[],
  lossSharePct: number = 50
): {
  suppliers: SupplierMetrics[];
  summary: ExecutiveSummary;
} {
  if (!orders || orders.length === 0) {
    return {
      suppliers: [],
      summary: {
        totalSpend: 0,
        totalRevenue: 0,
        totalMargin: 0,
        avgMarginPct: 0,
        totalQuantity: 0,
        totalOrders: 0,
        totalDefects: 0,
        overallDefectRate: 0,
        overallOnTimeRate: 0,
        avgLeadTimeDays: 0,
        totalAbsorbedLoss: 0,
        totalNetCompensation: 0,
        highRiskSuppliersCount: 0,
        topSupplierByMargin: 'N/A',
        topSupplierByVolume: 'N/A',
        supplierCount: 0
      }
    };
  }

  // Group orders by supplier
  const supplierMap: Record<string, PurchaseOrder[]> = {};
  orders.forEach(order => {
    if (!supplierMap[order.supplier]) {
      supplierMap[order.supplier] = [];
    }
    supplierMap[order.supplier].push(order);
  });

  const supplierNames = Object.keys(supplierMap);
  const supplierMetricsList: SupplierMetrics[] = [];

  let overallSpend = 0;
  let overallRevenue = 0;
  let overallMargin = 0;
  let overallQuantity = 0;
  let overallDefects = 0;
  let overallOnTimeCount = 0;
  let overallLeadTimeSum = 0;
  let overallAbsorbedLoss = 0;

  supplierNames.forEach(supplier => {
    const pos = supplierMap[supplier];
    const totalPOs = pos.length;
    
    let totalQuantity = 0;
    let totalSpend = 0;
    let totalRevenue = 0;
    let totalMargin = 0;
    let totalDefectiveUnits = 0;
    let onTimeDeliveries = 0;
    let leadTimeSum = 0;
    let defectiveSpendSum = 0;
    const reasonMap: Record<string, { count: number; defectiveUnits: number }> = {};
    const categorySet = new Set<string>();
    const leadTimes: number[] = [];
    const prices: number[] = [];

    pos.forEach(po => {
      totalQuantity += po.quantity;
      totalSpend += po.totalSpend;
      totalRevenue += po.totalRevenue;
      totalMargin += po.margin;
      totalDefectiveUnits += po.defectiveUnits;
      leadTimeSum += po.leadTimeDays;
      leadTimes.push(po.leadTimeDays);
      prices.push(po.cp);
      categorySet.add(po.itemCategory);

      if (po.isOnTime) onTimeDeliveries++;
      
      if (po.defectiveUnits > 0) {
        defectiveSpendSum += po.cp * po.defectiveUnits;
        const r = po.reason || 'Unspecified Defect';
        if (!reasonMap[r]) {
          reasonMap[r] = { count: 0, defectiveUnits: 0 };
        }
        reasonMap[r].count += 1;
        reasonMap[r].defectiveUnits += po.defectiveUnits;
      }
    });

    const delayedDeliveries = totalPOs - onTimeDeliveries;
    const onTimeRate = totalPOs > 0 ? Math.round((onTimeDeliveries / totalPOs) * 1000) / 10 : 100;
    const defectRate = totalQuantity > 0 ? Math.round((totalDefectiveUnits / totalQuantity) * 1000) / 10 : 0;
    const avgLeadTimeDays = totalPOs > 0 ? Math.round((leadTimeSum / totalPOs) * 10) / 10 : 0;
    const marginPercentage = totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 1000) / 10 : 0;

    // Standard deviation of lead time
    const variance = leadTimes.reduce((acc, val) => acc + Math.pow(val - avgLeadTimeDays, 2), 0) / (totalPOs || 1);
    const leadTimeStdDev = Math.round(Math.sqrt(variance) * 10) / 10;
    
    // 90th percentile lead time
    const sortedLeads = [...leadTimes].sort((a, b) => a - b);
    const p90Idx = Math.min(sortedLeads.length - 1, Math.floor(sortedLeads.length * 0.9));
    const p90LeadTimeDays = sortedLeads[p90Idx] || avgLeadTimeDays;

    // Reliability Score Calculation (0-100)
    // 40% On-Time, 40% Quality (100 - defectRate*5), 10% Lead Time Consistency, 10% Margin health
    const onTimeScore = onTimeRate;
    const qualityScore = Math.max(0, 100 - defectRate * 6);
    const consistencyScore = Math.max(0, 100 - leadTimeStdDev * 8);
    const marginScore = Math.min(100, Math.max(0, marginPercentage * 2.5));

    const reliabilityScore = Math.round(
      (onTimeScore * 0.40 + qualityScore * 0.40 + consistencyScore * 0.10 + marginScore * 0.10) * 10
    ) / 10;

    // Risk Tier
    let riskTier: RiskTier = 'Reliable';
    if (reliabilityScore >= 88) riskTier = 'Elite';
    else if (reliabilityScore >= 75) riskTier = 'Reliable';
    else if (reliabilityScore >= 60) riskTier = 'Moderate Risk';
    else riskTier = 'Critical Risk';

    // 3x3 Matrix Grid Categorization:
    // Likelihood (Probability of Disruption / Defect / Delay):
    // Based on combined defect rate and delay rate
    let likelihoodScore = (100 - onTimeRate) * 0.6 + defectRate * 5;
    let likelihoodLevel: RiskLevel = 'Low';
    if (likelihoodScore > 28) likelihoodLevel = 'High';
    else if (likelihoodScore > 12) likelihoodLevel = 'Medium';
    else likelihoodLevel = 'Low';

    // Impact (Business criticality / Spend volume share)
    // Computed relative to orders in dataset
    let impactLevel: RiskLevel = 'Low';
    const supplierSpendPct = totalSpend / (orders.reduce((acc, o) => acc + o.totalSpend, 0) || 1);
    if (supplierSpendPct > 0.20 || totalQuantity > 15000) impactLevel = 'High';
    else if (supplierSpendPct > 0.08 || totalQuantity > 5000) impactLevel = 'Medium';
    else impactLevel = 'Low';

    const matrixCell = `${likelihoodLevel}-${impactLevel}`;

    // Disruption Calculation: 50% loss share on defective units
    const absorbedLoss50Pct = Math.round((defectiveSpendSum * (lossSharePct / 100)) * 100) / 100;
    const netFinancialCompensation = Math.round((totalSpend - absorbedLoss50Pct) * 100) / 100;

    // Common defect reasons
    const commonDefectReasons: DefectReasonBreakdown[] = Object.entries(reasonMap)
      .map(([reason, data]) => ({
        reason,
        count: data.count,
        defectiveUnits: data.defectiveUnits,
        percentage: totalDefectiveUnits > 0 ? Math.round((data.defectiveUnits / totalDefectiveUnits) * 1000) / 10 : 0
      }))
      .sort((a, b) => b.defectiveUnits - a.defectiveUnits);

    // Strategic Recommendation Engine
    let recommendedStrategy: SupplierMetrics['recommendedStrategy'] = 'Maintain & Monitor (Core Supplier)';
    let strategyActionDetails = '';

    if (riskTier === 'Elite' && marginPercentage >= 25) {
      recommendedStrategy = 'Scale Allocation (Strategic Partner)';
      strategyActionDetails = 'Increase procurement allocation by 25-40%. Lock in multi-quarter pricing agreements to secure component volume and preferential SLAs.';
    } else if (riskTier === 'Critical Risk' || (defectRate > 6 && onTimeRate < 70)) {
      recommendedStrategy = 'Phase Out / Replacement Audit';
      strategyActionDetails = 'Initiate supplier replacement audit immediately. Reduce allocation to emergency buffer only and enforce strict defect clawbacks.';
    } else if (defectRate > 4.5) {
      recommendedStrategy = 'Enforce Quality SLA & Warranties';
      strategyActionDetails = 'Mandate pre-shipment third-party QA certificates and invoke 100% defect reimbursement warranties with automated return penalty credits.';
    } else if (marginPercentage < 15) {
      recommendedStrategy = 'Renegotiate Cost & Margins';
      strategyActionDetails = 'High operational reliability but compressed margin. Leverage volume tiering and bundled component negotiation to recover 3-5% margin.';
    } else if (impactLevel === 'High' && likelihoodLevel !== 'Low') {
      recommendedStrategy = 'Diversify / Dual-Source';
      strategyActionDetails = 'High business volume dependency with elevated risk profile. Establish secondary qualified source to hedge against catastrophic line stoppages.';
    } else {
      recommendedStrategy = 'Maintain & Monitor (Core Supplier)';
      strategyActionDetails = 'Maintain standard procurement quota. Review quarterly yield rates and lead time stability metrics.';
    }

    // Historical price trend
    const sortedByDate = [...pos].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    const firstHalfPrice = sortedByDate.slice(0, Math.ceil(pos.length / 2)).reduce((acc, p) => acc + p.cp, 0) / (Math.ceil(pos.length / 2) || 1);
    const secondHalfPrice = sortedByDate.slice(Math.ceil(pos.length / 2)).reduce((acc, p) => acc + p.cp, 0) / (Math.floor(pos.length / 2) || 1);
    const priceVariancePct = firstHalfPrice > 0 ? Math.round(((secondHalfPrice - firstHalfPrice) / firstHalfPrice) * 1000) / 10 : 0;
    
    let historicalPriceTrend: 'Upward' | 'Stable' | 'Downward' = 'Stable';
    if (priceVariancePct > 3) historicalPriceTrend = 'Upward';
    else if (priceVariancePct < -3) historicalPriceTrend = 'Downward';

    // Capacity estimation
    const monthlyVolumes: Record<string, number> = {};
    pos.forEach(p => {
      const monthKey = p.orderDate.substring(0, 7);
      monthlyVolumes[monthKey] = (monthlyVolumes[monthKey] || 0) + p.quantity;
    });
    const monthlyVals = Object.values(monthlyVolumes);
    const maxMonthlyVolume = monthlyVals.length > 0 ? Math.max(...monthlyVals) : totalQuantity;
    const capacityEstimated = Math.round(maxMonthlyVolume * 1.3);
    const avgMonthlyVolume = monthlyVals.length > 0 ? totalQuantity / monthlyVals.length : totalQuantity;
    const capacityUtilization = Math.min(100, Math.round((avgMonthlyVolume / capacityEstimated) * 100));

    supplierMetricsList.push({
      supplier,
      totalPOs,
      totalQuantity,
      totalSpend: Math.round(totalSpend * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalMargin: Math.round(totalMargin * 100) / 100,
      marginPercentage,
      totalDefectiveUnits,
      defectRate,
      onTimeDeliveries,
      delayedDeliveries,
      onTimeRate,
      avgLeadTimeDays,
      leadTimeStdDev,
      p90LeadTimeDays,
      reliabilityScore,
      riskTier,
      likelihoodLevel,
      impactLevel,
      matrixCell,
      grossPayment: Math.round(totalSpend * 100) / 100,
      absorbedLoss50Pct,
      netFinancialCompensation,
      commonDefectReasons,
      recommendedStrategy,
      strategyActionDetails,
      categoriesSupplied: Array.from(categorySet),
      capacityEstimated,
      capacityUtilization,
      historicalPriceTrend,
      priceVariancePct
    });

    overallSpend += totalSpend;
    overallRevenue += totalRevenue;
    overallMargin += totalMargin;
    overallQuantity += totalQuantity;
    overallDefects += totalDefectiveUnits;
    overallOnTimeCount += onTimeDeliveries;
    overallLeadTimeSum += leadTimeSum;
    overallAbsorbedLoss += absorbedLoss50Pct;
  });

  // Sort by reliability score descending
  supplierMetricsList.sort((a, b) => b.reliabilityScore - a.reliabilityScore);

  const totalOrders = orders.length;
  const topSupplierByMargin = [...supplierMetricsList].sort((a, b) => b.totalMargin - a.totalMargin)[0]?.supplier || 'N/A';
  const topSupplierByVolume = [...supplierMetricsList].sort((a, b) => b.totalQuantity - a.totalQuantity)[0]?.supplier || 'N/A';
  const highRiskSuppliersCount = supplierMetricsList.filter(s => s.riskTier === 'Critical Risk' || s.riskTier === 'Moderate Risk').length;

  const summary: ExecutiveSummary = {
    totalSpend: Math.round(overallSpend * 100) / 100,
    totalRevenue: Math.round(overallRevenue * 100) / 100,
    totalMargin: Math.round(overallMargin * 100) / 100,
    avgMarginPct: overallRevenue > 0 ? Math.round((overallMargin / overallRevenue) * 1000) / 10 : 0,
    totalQuantity: overallQuantity,
    totalOrders,
    totalDefects: overallDefects,
    overallDefectRate: overallQuantity > 0 ? Math.round((overallDefects / overallQuantity) * 1000) / 10 : 0,
    overallOnTimeRate: totalOrders > 0 ? Math.round((overallOnTimeCount / totalOrders) * 1000) / 10 : 100,
    avgLeadTimeDays: totalOrders > 0 ? Math.round((overallLeadTimeSum / totalOrders) * 10) / 10 : 0,
    totalAbsorbedLoss: Math.round(overallAbsorbedLoss * 100) / 100,
    totalNetCompensation: Math.round((overallSpend - overallAbsorbedLoss) * 100) / 100,
    highRiskSuppliersCount,
    topSupplierByMargin,
    topSupplierByVolume,
    supplierCount: supplierNames.length
  };

  return { suppliers: supplierMetricsList, summary };
}

/**
 * Predicts component price trends using linear regression over historical order timestamps
 */
export function predictComponentPrices(
  orders: PurchaseOrder[],
  targetSupplier?: string,
  targetCategory?: string
): PricePredictionResult[] {
  // Filter by supplier and/or category if specified
  let filtered = orders;
  if (targetSupplier && targetSupplier !== 'ALL') {
    filtered = filtered.filter(o => o.supplier === targetSupplier);
  }
  if (targetCategory && targetCategory !== 'ALL') {
    filtered = filtered.filter(o => o.itemCategory === targetCategory);
  }

  // Group by (Supplier, Category)
  const groups: Record<string, PurchaseOrder[]> = {};
  filtered.forEach(o => {
    const key = `${o.supplier}:::${o.itemCategory}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(o);
  });

  const results: PricePredictionResult[] = [];

  Object.entries(groups).forEach(([key, pos]) => {
    if (pos.length < 3) return; // Need at least 3 points for trend
    const [supplier, category] = key.split(':::');

    // Sort by order date
    const sorted = [...pos].sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    
    // Convert dates to x (days since first order) and y (unit cost price)
    const baseTime = new Date(sorted[0].orderDate).getTime();
    const dayMs = 24 * 60 * 60 * 1000;

    const dataPoints = sorted.map(p => ({
      x: (new Date(p.orderDate).getTime() - baseTime) / dayMs,
      y: p.cp,
      date: p.orderDate
    }));

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, d) => acc + d.x, 0);
    const sumY = dataPoints.reduce((acc, d) => acc + d.y, 0);
    const sumXY = dataPoints.reduce((acc, d) => acc + d.x * d.y, 0);
    const sumX2 = dataPoints.reduce((acc, d) => acc + d.x * d.x, 0);
    const sumY2 = dataPoints.reduce((acc, d) => acc + d.y * d.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared
    const meanY = sumY / n;
    const ssTot = dataPoints.reduce((acc, d) => acc + Math.pow(d.y - meanY, 2), 0);
    const ssRes = dataPoints.reduce((acc, d) => acc + Math.pow(d.y - (slope * d.x + intercept), 2), 0);
    const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0.85;

    const currentAvgPrice = Math.round(meanY * 100) / 100;
    const lastX = dataPoints[dataPoints.length - 1].x;

    // Forecasts at +30, +60, +90 days
    const forecast30 = Math.max(1, Math.round((slope * (lastX + 30) + intercept) * 100) / 100);
    const forecast60 = Math.max(1, Math.round((slope * (lastX + 60) + intercept) * 100) / 100);
    const forecast90 = Math.max(1, Math.round((slope * (lastX + 90) + intercept) * 100) / 100);

    const priceTrendPct = currentAvgPrice > 0 ? Math.round(((forecast90 - currentAvgPrice) / currentAvgPrice) * 1000) / 10 : 0;

    // Generate chart points (historical + 3 forecast points)
    const points: PriceForecastPoint[] = [];

    // Aggregate historical points by month or interval for smoother chart
    dataPoints.forEach(d => {
      const pred = Math.round((slope * d.x + intercept) * 100) / 100;
      points.push({
        date: d.date,
        periodLabel: d.date,
        historicalAvgPrice: d.y,
        predictedPrice: pred,
        lowerBound: Math.max(1, Math.round((pred * 0.94) * 100) / 100),
        upperBound: Math.round((pred * 1.06) * 100) / 100,
        supplier,
        category,
        isForecast: false
      });
    });

    // Add +30, +60, +90 future points
    const lastDate = new Date(sorted[sorted.length - 1].orderDate);
    [
      { days: 30, price: forecast30, label: '+30 Days' },
      { days: 60, price: forecast60, label: '+60 Days' },
      { days: 90, price: forecast90, label: '+90 Days' }
    ].forEach(f => {
      const futureDate = new Date(lastDate.getTime() + f.days * dayMs).toISOString().split('T')[0];
      points.push({
        date: futureDate,
        periodLabel: f.label,
        predictedPrice: f.price,
        lowerBound: Math.max(1, Math.round((f.price * (1 - 0.05 * (f.days / 30))) * 100) / 100),
        upperBound: Math.round((f.price * (1 + 0.05 * (f.days / 30))) * 100) / 100,
        supplier,
        category,
        isForecast: true
      });
    });

    results.push({
      supplier,
      category,
      currentAvgPrice,
      forecast30d: forecast30,
      forecast60d: forecast60,
      forecast90d: forecast90,
      priceTrendPct,
      rSquared: Math.round(rSquared * 100) / 100,
      points
    });
  });

  return results;
}

/**
 * Predicts delivery lead times, delay probabilities, and confidence intervals
 */
export function predictDeliveryLeadTimes(suppliers: SupplierMetrics[]): DeliveryPredictionResult[] {
  return suppliers.map(s => {
    const delayLikelihoodPct = Math.round((100 - s.onTimeRate) * 10) / 10;
    const predictedLeadTimeDays = Math.round((s.avgLeadTimeDays + (delayLikelihoodPct > 20 ? 3.5 : 0.8)) * 10) / 10;
    
    const lowerCi = Math.max(2, Math.round((s.avgLeadTimeDays - s.leadTimeStdDev * 1.64) * 10) / 10);
    const upperCi = Math.round((s.avgLeadTimeDays + s.leadTimeStdDev * 1.64) * 10) / 10;

    let riskLevel: RiskLevel = 'Low';
    if (delayLikelihoodPct > 25 || predictedLeadTimeDays > 24) riskLevel = 'High';
    else if (delayLikelihoodPct > 10 || predictedLeadTimeDays > 16) riskLevel = 'Medium';

    return {
      supplier: s.supplier,
      historicalAvgDays: s.avgLeadTimeDays,
      predictedLeadTimeDays,
      delayLikelihoodPct,
      confidenceIntervalDays: [lowerCi, upperCi],
      riskLevel
    };
  });
}

/**
 * Computes Quality & Defect Risk forecasts
 */
export function predictQualityRisks(suppliers: SupplierMetrics[]): QualityRiskResult[] {
  return suppliers.map(s => {
    const primaryReason = s.commonDefectReasons[0]?.reason || 'Standard Wear';
    const futureRate = Math.round((s.defectRate * 0.95 + 0.3) * 10) / 10;
    const qualityRiskScore = Math.min(100, Math.round(s.defectRate * 8 + (100 - s.onTimeRate) * 0.2));

    let severityLevel: RiskLevel = 'Low';
    if (s.defectRate > 5.0) severityLevel = 'High';
    else if (s.defectRate > 2.5) severityLevel = 'Medium';

    return {
      supplier: s.supplier,
      historicalDefectRatePct: s.defectRate,
      predictedFutureDefectRatePct: futureRate,
      qualityRiskScore,
      primaryRiskDriver: primaryReason,
      severityLevel
    };
  });
}

/**
 * Computes Supplier Capacity and Fulfillment volume forecasts
 */
export function predictFulfillmentCapacities(suppliers: SupplierMetrics[]): CapacityPredictionResult[] {
  return suppliers.map(s => {
    const isBottleneckRisk = s.capacityUtilization > 85;
    const projectedFulfillmentRate = isBottleneckRisk ? 82.5 : Math.min(99.4, 94.0 + (100 - s.capacityUtilization) * 0.1);

    return {
      supplier: s.supplier,
      currentRollingVolume: s.totalQuantity,
      maxSustainedCapacity: s.capacityEstimated,
      utilizationPct: s.capacityUtilization,
      isBottleneckRisk,
      projectedFulfillmentRate: Math.round(projectedFulfillmentRate * 10) / 10
    };
  });
}

/**
 * Generates prioritized Revenue & Profit Strategy Recommendations
 */
export function generateStrategicRecommendations(suppliers: SupplierMetrics[]): StrategyRecommendation[] {
  const sorted = [...suppliers].sort((a, b) => {
    // Priority: High Margin with High Reliability first
    const scoreA = a.totalMargin * (a.reliabilityScore / 100);
    const scoreB = b.totalMargin * (b.reliabilityScore / 100);
    return scoreB - scoreA;
  });

  return sorted.map((s, idx) => {
    const actionItems: string[] = [];
    if (s.riskTier === 'Elite') {
      actionItems.push('Lock in 12-month preferred supplier volume contract');
      actionItems.push('Integrate automated EDI/API purchase ordering');
      actionItems.push('Negotiate 2-3% rebate on bulk volume tiers');
    } else if (s.riskTier === 'Critical Risk') {
      actionItems.push('Freeze new PO expansion; divert 50% orders to backup vendors');
      actionItems.push('Trigger immediate supplier on-site quality audit');
      actionItems.push('Execute 50% defect financial compensation clawback');
    } else if (s.defectRate > 4) {
      actionItems.push('Mandate pre-shipment optical/electrical test validation');
      actionItems.push('Implement incoming lot sampling inspection (AQL 1.0)');
    } else {
      actionItems.push('Conduct quarterly business review (QBR) on lead time stability');
      actionItems.push('Benchmark component unit pricing against market index');
    }

    return {
      supplier: s.supplier,
      reliabilityScore: s.reliabilityScore,
      riskTier: s.riskTier,
      totalMargin: s.totalMargin,
      defectRate: s.defectRate,
      onTimeRate: s.onTimeRate,
      recommendedStrategy: s.recommendedStrategy,
      priorityRank: idx + 1,
      rationale: s.strategyActionDetails,
      actionItems
    };
  });
}
