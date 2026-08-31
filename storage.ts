import { StrategyLogEntry, StrategyRecommendation } from './types';

const STRATEGY_STORAGE_KEY = 'provendex_strategy_history_v1';

// Seed initial history records for immediate out-of-the-box audit trail
const INITIAL_STRATEGY_LOGS: StrategyLogEntry[] = [
  {
    id: 'strat-log-20260815-01',
    timestamp: '2026-08-15T09:30:00.000Z',
    title: 'Q3 Enterprise Component Allocation & Defect Hedge',
    datasetName: 'Global Electronics & Semiconductors Dataset',
    lossSharePct: 50,
    totalSpend: 2450000,
    totalMargin: 780000,
    totalAbsorbedLoss: 42300,
    overallReliabilityScore: 84.5,
    createdBy: 'Procurement Steering Committee',
    notes: 'Prioritized Apex Silicon & Horizon Micro for Q3-Q4 ramp-up. Enforced 50% loss share on Zenon Power returns.',
    recommendations: [
      {
        supplier: 'Horizon Micro Devices',
        reliabilityScore: 92.4,
        riskTier: 'Elite',
        totalMargin: 340000,
        defectRate: 1.2,
        onTimeRate: 95.0,
        recommendedStrategy: 'Scale Allocation (Strategic Partner)',
        priorityRank: 1,
        rationale: 'Highest yield and margin contribution with 95% on-time rate.',
        actionItems: ['Award 40% Q3 volume quota', 'Negotiate 3-year exclusivity']
      },
      {
        supplier: 'Zenon Power Solutions',
        reliabilityScore: 58.2,
        riskTier: 'Critical Risk',
        totalMargin: 65000,
        defectRate: 8.8,
        onTimeRate: 68.0,
        recommendedStrategy: 'Phase Out / Replacement Audit',
        priorityRank: 2,
        rationale: 'Persistent packaging seal breaches and 32% delay frequency.',
        actionItems: ['Cap active POs', 'Deduct $21,150 in 50% absorbed return penalties']
      }
    ]
  },
  {
    id: 'strat-log-20260701-02',
    timestamp: '2026-07-01T14:15:00.000Z',
    title: 'Mid-Year Supply Chain Disruption & Margin Optimization',
    datasetName: 'Automotive Mechanical Assemblies',
    lossSharePct: 50,
    totalSpend: 1890000,
    totalMargin: 512000,
    totalAbsorbedLoss: 31800,
    overallReliabilityScore: 81.2,
    createdBy: 'Lead AI Risk Analyst',
    notes: 'Simulated 50% loss absorption across tier-2 vendors to protect operating cash flow.',
    recommendations: [
      {
        supplier: 'Apex Silicon Corp',
        reliabilityScore: 89.8,
        riskTier: 'Elite',
        totalMargin: 220000,
        defectRate: 1.8,
        onTimeRate: 92.0,
        recommendedStrategy: 'Scale Allocation (Strategic Partner)',
        priorityRank: 1,
        rationale: 'Reliable high-volume delivery across all 3 key micro-assemblies.',
        actionItems: ['Expand blanket purchase agreements', 'Conduct quarterly tech roadmap review']
      }
    ]
  }
];

export function getStoredStrategyLogs(): StrategyLogEntry[] {
  if (typeof window === 'undefined') return INITIAL_STRATEGY_LOGS;
  try {
    const raw = localStorage.getItem(STRATEGY_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(INITIAL_STRATEGY_LOGS));
      return INITIAL_STRATEGY_LOGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load strategy logs from localStorage', err);
    return INITIAL_STRATEGY_LOGS;
  }
}

export function saveStrategyLog(entry: Omit<StrategyLogEntry, 'id' | 'timestamp'>): StrategyLogEntry {
  const newEntry: StrategyLogEntry = {
    ...entry,
    id: `strat-log-${Date.now()}`,
    timestamp: new Date().toISOString()
  };

  if (typeof window !== 'undefined') {
    try {
      const logs = getStoredStrategyLogs();
      const updated = [newEntry, ...logs];
      localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist strategy log entry', err);
    }
  }

  return newEntry;
}

export function deleteStrategyLog(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const logs = getStoredStrategyLogs();
    const filtered = logs.filter(l => l.id !== id);
    localStorage.setItem(STRATEGY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete strategy log entry', err);
  }
}

export function clearStrategyLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STRATEGY_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear strategy logs', err);
  }
}
