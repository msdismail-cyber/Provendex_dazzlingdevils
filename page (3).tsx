'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useData } from '@/lib/DataContext';
import { FileUploader } from '@/components/FileUploader';
import { PurchaseOrder } from '@/lib/types';
import { FileSpreadsheet, Sparkles } from 'lucide-react';

export default function ImportPage() {
  const { setCustomData } = useData();
  const router = useRouter();

  const handleDataLoaded = (data: PurchaseOrder[], name: string) => {
    setCustomData(data, name);
    // Navigate back to overview to inspect newly imported data
    router.push('/');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Data Ingestion, File Parsing & Auto-Mapping
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload custom procurement orders via CSV, Excel, SQL Dumps, or PDF invoices. Columns are dynamically auto-mapped to canonical fields.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs text-muted-foreground border border-border">
            <Sparkles className="h-4 w-4 text-brand-500" />
            <span>Format Support: <strong>CSV • XLSX • SQL • PDF</strong></span>
          </div>
        </div>
      </div>

      {/* File Ingestion & Auto-Mapping Core Component */}
      <FileUploader onDataLoaded={handleDataLoaded} />
    </div>
  );
}
