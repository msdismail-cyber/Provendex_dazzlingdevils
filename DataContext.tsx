'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PurchaseOrder, SupplierMetrics, ExecutiveSummary } from './types';
import { DEFAULT_PROCUREMENT_DATA, generateSampleDataset } from './sampleData';
import { computeSupplierMetrics } from './analyticsEngine';

interface DataContextType {
  orders: PurchaseOrder[];
  suppliers: SupplierMetrics[];
  summary: ExecutiveSummary;
  datasetName: string;
  lossSharePct: number;
  selectedSupplierName: string | null;
  selectedSupplier: SupplierMetrics | null;
  setLossSharePct: (pct: number) => void;
  loadDataset: (type: 'electronics' | 'automotive' | 'aerospace') => void;
  setCustomData: (data: PurchaseOrder[], name: string) => void;
  openSupplierDetail: (name: string) => void;
  closeSupplierDetail: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<PurchaseOrder[]>(DEFAULT_PROCUREMENT_DATA);
  const [datasetName, setDatasetName] = useState<string>('Global Electronics & Semiconductors (520 POs)');
  const [lossSharePct, setLossSharePctState] = useState<number>(50);
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(null);

  // Compute metrics automatically
  const { suppliers, summary } = computeSupplierMetrics(orders, lossSharePct);

  const selectedSupplier = suppliers.find(s => s.supplier === selectedSupplierName) || null;

  const loadDataset = (type: 'electronics' | 'automotive' | 'aerospace') => {
    const generated = generateSampleDataset(type);
    setOrders(generated);
    if (type === 'electronics') setDatasetName('Global Electronics & Semiconductors (520 POs)');
    else if (type === 'automotive') setDatasetName('Automotive Precision Parts (380 POs)');
    else setDatasetName('Aerospace & Medical Assemblies (260 POs)');
  };

  const setCustomData = (data: PurchaseOrder[], name: string) => {
    setOrders(data);
    setDatasetName(`${name} (${data.length} POs)`);
  };

  const setLossSharePct = (pct: number) => {
    setLossSharePctState(pct);
  };

  const openSupplierDetail = (name: string) => {
    setSelectedSupplierName(name);
  };

  const closeSupplierDetail = () => {
    setSelectedSupplierName(null);
  };

  return (
    <DataContext.Provider
      value={{
        orders,
        suppliers,
        summary,
        datasetName,
        lossSharePct,
        selectedSupplierName,
        selectedSupplier,
        setLossSharePct,
        loadDataset,
        setCustomData,
        openSupplierDetail,
        closeSupplierDetail
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
