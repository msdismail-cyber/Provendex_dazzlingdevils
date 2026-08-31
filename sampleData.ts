import { PurchaseOrder } from './types';

// Deterministic mock datasets with 500+ realistic procurement POs
const SUPPLIERS = [
  'Apex Silicon Corp',
  'Nexus Circuitry Ltd',
  'Horizon Micro Devices',
  'Zenon Power Solutions',
  'Titan Component Works',
  'Optima Connect Systems',
  'Vanguard Precision Electro',
  'Quantum Dynamics Fab'
];

const CATEGORIES = [
  'Microcontrollers',
  'Power Regulators',
  'Optoelectronic Sensors',
  'Ceramic Capacitors',
  'High-Speed Connectors',
  'Precision Heat Sinks',
  'MEMS Gyroscopes',
  'RF Transceiver Modules'
];

const DEFECT_REASONS = [
  'Tolerance Out of Spec',
  'Thermal Overheating Under Load',
  'Solder Bridging & Cold Joints',
  'Transit Shock & Vibration Fracture',
  'Hermetic Packaging Seal Breach',
  'Material Tensile Fatigue',
  'Pin Oxidation & Contamination',
  'Firmware CRC Checksum Mismatch'
];

// Seeded pseudo-random generator for consistent, high-fidelity sample data
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateSampleDataset(datasetType: 'electronics' | 'automotive' | 'aerospace' = 'electronics'): PurchaseOrder[] {
  const poList: PurchaseOrder[] = [];
  const count = datasetType === 'electronics' ? 520 : datasetType === 'automotive' ? 380 : 260;
  
  const supplierProfiles: Record<string, { baseLead: number; delayProb: number; defectProb: number; marginFactor: number; baseCost: number }> = {
    'Apex Silicon Corp': { baseLead: 14, delayProb: 0.08, defectProb: 0.018, marginFactor: 1.35, baseCost: 120 },
    'Nexus Circuitry Ltd': { baseLead: 21, delayProb: 0.15, defectProb: 0.042, marginFactor: 1.28, baseCost: 85 },
    'Horizon Micro Devices': { baseLead: 12, delayProb: 0.05, defectProb: 0.012, marginFactor: 1.45, baseCost: 210 },
    'Zenon Power Solutions': { baseLead: 28, delayProb: 0.32, defectProb: 0.088, marginFactor: 1.18, baseCost: 65 },
    'Titan Component Works': { baseLead: 18, delayProb: 0.18, defectProb: 0.055, marginFactor: 1.22, baseCost: 95 },
    'Optima Connect Systems': { baseLead: 10, delayProb: 0.06, defectProb: 0.021, marginFactor: 1.40, baseCost: 45 },
    'Vanguard Precision Electro': { baseLead: 25, delayProb: 0.28, defectProb: 0.076, marginFactor: 1.20, baseCost: 160 },
    'Quantum Dynamics Fab': { baseLead: 16, delayProb: 0.10, defectProb: 0.025, marginFactor: 1.38, baseCost: 310 }
  };

  const startDate = new Date(2025, 0, 15).getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i <= count; i++) {
    const seed = i * 47 + (datasetType === 'automotive' ? 1000 : datasetType === 'aerospace' ? 2000 : 0);
    const supplier = SUPPLIERS[Math.floor(pseudoRandom(seed) * SUPPLIERS.length)];
    const profile = supplierProfiles[supplier];
    const category = CATEGORIES[Math.floor(pseudoRandom(seed + 1) * CATEGORIES.length)];
    
    // Order Date spaced out across 2025 - 2026
    const orderOffsetDays = Math.floor(pseudoRandom(seed + 2) * 580);
    const orderDateObj = new Date(startDate + orderOffsetDays * dayMs);
    const orderDateStr = orderDateObj.toISOString().split('T')[0];
    
    // Lead time with variance
    const isDelayed = pseudoRandom(seed + 3) < profile.delayProb;
    const variance = (pseudoRandom(seed + 4) - 0.5) * 6;
    const extraDelay = isDelayed ? Math.floor(pseudoRandom(seed + 5) * 16) + 4 : 0;
    const leadTimeDays = Math.max(3, Math.round(profile.baseLead + variance + extraDelay));
    
    const deliveryDateObj = new Date(orderDateObj.getTime() + leadTimeDays * dayMs);
    const deliveryDateStr = deliveryDateObj.toISOString().split('T')[0];
    
    // Quantity
    const qtyBase = Math.floor(pseudoRandom(seed + 6) * 800) + 50;
    const quantity = Math.round(qtyBase / 10) * 10;
    
    // Pricing
    const costVariance = (pseudoRandom(seed + 7) - 0.5) * (profile.baseCost * 0.25);
    const cp = Math.round((profile.baseCost + costVariance) * 100) / 100;
    const sp = Math.round((cp * profile.marginFactor) * 100) / 100;
    
    // Status
    const orderStatus = isDelayed ? 'Delayed' : 'Delivered';
    
    // Defective units
    const hasDefects = pseudoRandom(seed + 8) < profile.defectProb;
    let defectiveUnits = 0;
    let reason = 'None';
    
    if (hasDefects) {
      const defectPct = pseudoRandom(seed + 9) * 0.18 + 0.02; // 2% to 20%
      defectiveUnits = Math.max(1, Math.round(quantity * defectPct));
      const reasonIdx = Math.floor(pseudoRandom(seed + 10) * DEFECT_REASONS.length);
      reason = DEFECT_REASONS[reasonIdx];
    }
    
    const totalSpend = Math.round(cp * quantity * 100) / 100;
    const totalRevenue = Math.round(sp * quantity * 100) / 100;
    const margin = Math.round((totalRevenue - totalSpend) * 100) / 100;
    const marginRate = totalRevenue > 0 ? Math.round((margin / totalRevenue) * 1000) / 10 : 0;
    const defectRate = quantity > 0 ? Math.round((defectiveUnits / quantity) * 1000) / 10 : 0;
    const isOnTime = !isDelayed;

    poList.push({
      id: `PO-2026-${String(i).padStart(4, '0')}`,
      supplier,
      orderDate: orderDateStr,
      deliveryDate: deliveryDateStr,
      itemCategory: category,
      quantity,
      cp,
      sp,
      orderStatus,
      defectiveUnits,
      reason,
      leadTimeDays,
      totalSpend,
      totalRevenue,
      margin,
      marginRate,
      defectRate,
      isOnTime
    });
  }

  return poList;
}

export const DEFAULT_PROCUREMENT_DATA = generateSampleDataset('electronics');
