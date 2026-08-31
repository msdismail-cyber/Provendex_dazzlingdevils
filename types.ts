export type OrderStatus = 'Delivered' | 'Pending' | 'Delayed' | 'Cancelled';

export type RiskLevel = 'Low' | 'Medium' | 'High';
export type RiskTier = 'Elite' | 'Reliable' | 'Moderate Risk' | 'Critical Risk';

export interface RawPurchaseOrder {
  PO_ID?: string | number;
  Supplier?: string;
  Order_Date?: string;
  Delivery_Date?: string;
  Item_Category?: string;
  Quantity?: number | string;
  CP?: number | string;
  SP?: number | string;
  Order_Status?: string;
  Defective_Units?: number | string;
  reason?: string;
  [key: string]: any;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  orderDate: string;
  deliveryDate: string;
  itemCategory: string;
  quantity: number;
  cp: number; // Cost Price
  sp: number; // Selling Price / Negotiated Price
  orderStatus: OrderStatus;
  defectiveUnits: number;
  reason: string;
  leadTimeDays: number;
  totalSpend: number;
  totalRevenue: number;
  margin: number;
  marginRate: number;
  defectRate: number;
  isOnTime: boolean;
}

export interface DefectReasonBreakdown {
  reason: string;
  count: number;
  defectiveUnits: number;
  percentage: number;
}

export interface SupplierMetrics {
  supplier: string;
  totalPOs: number;
  totalQuantity: number;
  totalSpend: number;
  totalRevenue: number;
  totalMargin: number;
  marginPercentage: number;
  totalDefectiveUnits: number;
  defectRate: number;
  onTimeDeliveries: number;
  delayedDeliveries: number;
  onTimeRate: number;
  avgLeadTimeDays: number;
  leadTimeStdDev: number;
  p90LeadTimeDays: number;
  reliabilityScore: number; // 0 - 100
  riskTier: RiskTier;
  likelihoodLevel: RiskLevel;
  impactLevel: RiskLevel;
  matrixCell: string; // e.g. "Low-Low", "High-High"
  grossPayment: number;
  absorbedLoss50Pct: number;
  netFinancialCompensation: number;
  commonDefectReasons: DefectReasonBreakdown[];
  recommendedStrategy:
    | 'Scale Allocation (Strategic Partner)'
    | 'Maintain & Monitor (Core Supplier)'
    | 'Renegotiate Cost & Margins'
    | 'Enforce Quality SLA & Warranties'
    | 'Diversify / Dual-Source'
    | 'Phase Out / Replacement Audit';
  strategyActionDetails: string;
  categoriesSupplied: string[];
  capacityEstimated: number;
  capacityUtilization: number;
  historicalPriceTrend: 'Upward' | 'Stable' | 'Downward';
  priceVariancePct: number;
}

export interface ExecutiveSummary {
  totalSpend: number;
  totalRevenue: number;
  totalMargin: number;
  avgMarginPct: number;
  totalQuantity: number;
  totalOrders: number;
  totalDefects: number;
  overallDefectRate: number;
  overallOnTimeRate: number;
  avgLeadTimeDays: number;
  totalAbsorbedLoss: number;
  totalNetCompensation: number;
  highRiskSuppliersCount: number;
  topSupplierByMargin: string;
  topSupplierByVolume: string;
  supplierCount: number;
}

export interface PriceForecastPoint {
  date: string;
  periodLabel: string;
  historicalAvgPrice?: number;
  predictedPrice: number;
  lowerBound: number;
  upperBound: number;
  supplier: string;
  category: string;
  isForecast: boolean;
}

export interface PricePredictionResult {
  supplier: string;
  category: string;
  currentAvgPrice: number;
  forecast30d: number;
  forecast60d: number;
  forecast90d: number;
  priceTrendPct: number;
  rSquared: number;
  points: PriceForecastPoint[];
}

export interface DeliveryPredictionResult {
  supplier: string;
  historicalAvgDays: number;
  predictedLeadTimeDays: number;
  delayLikelihoodPct: number;
  confidenceIntervalDays: [number, number];
  riskLevel: RiskLevel;
}

export interface QualityRiskResult {
  supplier: string;
  historicalDefectRatePct: number;
  predictedFutureDefectRatePct: number;
  qualityRiskScore: number;
  primaryRiskDriver: string;
  severityLevel: RiskLevel;
}

export interface CapacityPredictionResult {
  supplier: string;
  currentRollingVolume: number;
  maxSustainedCapacity: number;
  utilizationPct: number;
  isBottleneckRisk: boolean;
  projectedFulfillmentRate: number;
}

export interface DisruptionSimulationState {
  lossSharePercentage: number; // default 50
  defectSeverityMultiplier: number; // default 1.0
  scenarioName: string;
}

export interface StrategyRecommendation {
  supplier: string;
  reliabilityScore: number;
  riskTier: RiskTier;
  totalMargin: number;
  defectRate: number;
  onTimeRate: number;
  recommendedStrategy: string;
  priorityRank: number;
  rationale: string;
  actionItems: string[];
}

export interface StrategyLogEntry {
  id: string;
  timestamp: string;
  title: string;
  datasetName: string;
  lossSharePct: number;
  totalSpend: number;
  totalMargin: number;
  totalAbsorbedLoss: number;
  overallReliabilityScore: number;
  recommendations: StrategyRecommendation[];
  notes?: string;
  createdBy: string;
}

export interface SchemaMappingConfig {
  poIdField: string;
  supplierField: string;
  orderDateField: string;
  deliveryDateField: string;
  categoryField: string;
  quantityField: string;
  cpField: string;
  spField: string;
  statusField: string;
  defectsField: string;
  reasonField: string;
}
