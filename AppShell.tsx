'use client';

import React from 'react';
import { useData } from '@/lib/DataContext';
import { Header } from './Header';
import { SupplierDetailModal } from './SupplierDetailModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    datasetName,
    loadDataset,
    selectedSupplier,
    closeSupplierDetail,
    lossSharePct
  } = useData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        currentDatasetName={datasetName}
        onSelectDataset={loadDataset}
        isBackendConnected={false}
      />
      <main className="flex-1 px-4 py-6 max-w-7xl mx-auto w-full">
        {children}
      </main>
      
      {/* Global Supplier Drill-down Modal */}
      <SupplierDetailModal
        supplier={selectedSupplier}
        onClose={closeSupplierDetail}
        lossSharePct={lossSharePct}
      />

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Provendex AI Engine</span>
            <span>•</span>
            <span>Enterprise Procurement Risk Intelligence</span>
          </div>
          <div>
            Developed by <span className="font-semibold text-foreground">HAJANDIKA | ISMAIL | RISHIBH | RITHIN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
