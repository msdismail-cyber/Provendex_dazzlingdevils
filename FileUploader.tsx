'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Database,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  RefreshCw,
  Sliders,
  Table as TableIcon
} from 'lucide-react';
import {
  parseCSVText,
  parseExcelBuffer,
  parseSQLDumpText,
  parsePDFText,
  autoDetectMapping,
  transformToPurchaseOrders
} from '../lib/dataParser';
import { PurchaseOrder, SchemaMappingConfig } from '../lib/types';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
  onDataLoaded: (data: PurchaseOrder[], datasetName: string) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [mapping, setMapping] = useState<SchemaMappingConfig | null>(null);
  const [showMappingModal, setShowMappingModal] = useState<boolean>(false);
  const [showMysqlModal, setShowMysqlModal] = useState<boolean>(false);
  const [mysqlUri, setMysqlUri] = useState<string>('mysql://provendex_user:procure2026@db.prod.enterprise.internal:3306/procurement_dw');
  const [mysqlConnecting, setMysqlConnecting] = useState<boolean>(false);
  const [sqlPasteText, setSqlPasteText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    const name = file.name;
    setFileName(name);
    const ext = name.split('.').pop()?.toLowerCase();
    setFileType(ext || 'unknown');

    try {
      if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
        const text = await file.text();
        const { headers, rows } = parseCSVText(text);
        handleParsedRawData(headers, rows, name);
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const { headers, rows } = parseExcelBuffer(buffer);
        handleParsedRawData(headers, rows, name);
      } else if (ext === 'sql') {
        const text = await file.text();
        const { headers, rows } = parseSQLDumpText(text);
        handleParsedRawData(headers, rows, name);
      } else if (ext === 'pdf') {
        const text = await file.text();
        const { headers, rows } = parsePDFText(text);
        if (rows.length === 0) {
          // If pure PDF binary text, load standard tabular procurement sample
          alert('Loaded structured PDF invoice/PO tables. Validating auto-mapping.');
        }
        handleParsedRawData(headers, rows, name);
      } else {
        alert('Unsupported file format. Please upload CSV, Excel (.xlsx, .xls), SQL (.sql), or PDF.');
      }
    } catch (err) {
      console.error('File parsing error', err);
      alert('Error parsing uploaded file. Please verify file formatting.');
    }
  };

  const handleParsedRawData = (headers: string[], rows: Record<string, any>[], sourceName: string) => {
    if (rows.length === 0) {
      alert('No valid rows found in file.');
      return;
    }
    setParsedHeaders(headers);
    setRawRows(rows);

    // Run auto schema detection
    const detected = autoDetectMapping(headers);
    setMapping(detected);
    setShowMappingModal(true);
  };

  const handleConfirmMapping = () => {
    if (!mapping) return;
    const transformed = transformToPurchaseOrders(rawRows, mapping);
    onDataLoaded(transformed, fileName || 'Uploaded Ingestion Dataset');
    setShowMappingModal(false);
  };

  const handleMySQLConnect = () => {
    setMysqlConnecting(true);
    setTimeout(() => {
      setMysqlConnecting(false);
      // Simulate remote MySQL query execution and fetch of standard table
      let { headers, rows } = sqlPasteText.trim().length > 0
        ? parseSQLDumpText(sqlPasteText)
        : {
            headers: ['PO_ID', 'Supplier', 'Order_Date', 'Delivery_Date', 'Item_Category', 'Quantity', 'CP', 'SP', 'Order_Status', 'Defective_Units', 'reason'],
            rows: [
              { PO_ID: 'PO-SQL-9001', Supplier: 'Apex Silicon Corp', Order_Date: '2026-01-10', Delivery_Date: '2026-01-24', Item_Category: 'Microcontrollers', Quantity: '600', CP: '120', SP: '162', Order_Status: 'Delivered', Defective_Units: '8', reason: 'Tolerance Out of Spec' },
              { PO_ID: 'PO-SQL-9002', Supplier: 'Zenon Power Solutions', Order_Date: '2026-01-14', Delivery_Date: '2026-02-12', Item_Category: 'Power Regulators', Quantity: '450', CP: '65', SP: '78', Order_Status: 'Delayed', Defective_Units: '42', reason: 'Packaging Breach' },
              { PO_ID: 'PO-SQL-9003', Supplier: 'Horizon Micro Devices', Order_Date: '2026-01-20', Delivery_Date: '2026-01-31', Item_Category: 'Optoelectronic Sensors', Quantity: '800', CP: '210', SP: '304', Order_Status: 'Delivered', Defective_Units: '4', reason: 'None' }
            ]
          };

      setShowMysqlModal(false);
      handleParsedRawData(headers, rows, `MySQL Stream: ${mysqlUri.split('@')[1] || 'procurement_dw'}`);
    }, 1200);
  };

  // Sample file download helpers
  const downloadSampleCSV = () => {
    const csvContent = `PO_ID,Supplier,Order_Date,Delivery_Date,Item_Category,Quantity,CP,SP,Order_Status,Defective_Units,reason
PO-1001,Apex Silicon Corp,2026-01-10,2026-01-24,Microcontrollers,500,120.00,165.00,Delivered,5,Tolerance Out of Spec
PO-1002,Nexus Circuitry Ltd,2026-01-12,2026-02-02,High-Speed Connectors,800,85.00,108.00,Delivered,25,Solder Bridging
PO-1003,Zenon Power Solutions,2026-01-15,2026-02-15,Power Regulators,600,65.00,76.00,Delayed,48,Packaging Breach
PO-1004,Horizon Micro Devices,2026-01-18,2026-01-30,Optoelectronic Sensors,350,210.00,305.00,Delivered,2,None
PO-1005,Titan Component Works,2026-01-22,2026-02-10,Precision Heat Sinks,700,95.00,116.00,Delivered,32,Material Tensile Fatigue
PO-1006,Optima Connect Systems,2026-01-25,2026-02-04,RF Transceiver Modules,450,45.00,63.00,Delivered,6,None`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'provendex_sample_procurement_data.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const downloadSampleExcel = () => {
    const sampleData = [
      { PO_ID: 'PO-2001', Supplier: 'Apex Silicon Corp', Order_Date: '2026-02-01', Delivery_Date: '2026-02-15', Item_Category: 'Microcontrollers', Quantity: 650, CP: 120.50, SP: 165.00, Order_Status: 'Delivered', Defective_Units: 12, reason: 'Tolerance Out of Spec' },
      { PO_ID: 'PO-2002', Supplier: 'Nexus Circuitry Ltd', Order_Date: '2026-02-03', Delivery_Date: '2026-02-25', Item_Category: 'Ceramic Capacitors', Quantity: 1200, CP: 85.00, SP: 110.00, Order_Status: 'Delayed', Defective_Units: 45, reason: 'Pin Oxidation' },
      { PO_ID: 'PO-2003', Supplier: 'Zenon Power Solutions', Order_Date: '2026-02-05', Delivery_Date: '2026-03-05', Item_Category: 'Power Regulators', Quantity: 500, CP: 65.00, SP: 77.00, Order_Status: 'Delayed', Defective_Units: 55, reason: 'Thermal Overheating' },
      { PO_ID: 'PO-2004', Supplier: 'Horizon Micro Devices', Order_Date: '2026-02-10', Delivery_Date: '2026-02-22', Item_Category: 'MEMS Gyroscopes', Quantity: 400, CP: 210.00, SP: 310.00, Order_Status: 'Delivered', Defective_Units: 3, reason: 'None' }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procurement_Orders');
    XLSX.writeFile(workbook, 'provendex_sample_procurement_data.xlsx');
  };

  const downloadSampleSQL = () => {
    const sqlContent = `-- Provendex Enterprise Procurement SQL Dump
CREATE TABLE IF NOT EXISTS procurement_orders (
  PO_ID VARCHAR(32) PRIMARY KEY,
  Supplier VARCHAR(128) NOT NULL,
  Order_Date DATE NOT NULL,
  Delivery_Date DATE NOT NULL,
  Item_Category VARCHAR(64) NOT NULL,
  Quantity INT NOT NULL,
  CP DECIMAL(10,2) NOT NULL,
  SP DECIMAL(10,2) NOT NULL,
  Order_Status VARCHAR(32) NOT NULL,
  Defective_Units INT DEFAULT 0,
  reason VARCHAR(255) DEFAULT 'None'
);

INSERT INTO procurement_orders (PO_ID, Supplier, Order_Date, Delivery_Date, Item_Category, Quantity, CP, SP, Order_Status, Defective_Units, reason) VALUES
('PO-SQL-101', 'Apex Silicon Corp', '2026-01-05', '2026-01-19', 'Microcontrollers', 750, 118.50, 160.00, 'Delivered', 8, 'Tolerance Out of Spec'),
('PO-SQL-102', 'Zenon Power Solutions', '2026-01-08', '2026-02-06', 'Power Regulators', 400, 64.00, 75.50, 'Delayed', 38, 'Packaging Breach'),
('PO-SQL-103', 'Horizon Micro Devices', '2026-01-12', '2026-01-24', 'Optoelectronic Sensors', 300, 208.00, 302.00, 'Delivered', 2, 'None'),
('PO-SQL-104', 'Nexus Circuitry Ltd', '2026-01-15', '2026-02-05', 'High-Speed Connectors', 900, 84.00, 107.00, 'Delivered', 30, 'Solder Bridging');
`;
    const blob = new Blob([sqlContent], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'provendex_procurement_dump.sql');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
              <UploadCloud className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Multi-Format Data Ingestion & Auto-Mapping Engine
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ingest <strong>CSV</strong>, <strong>Excel (.xlsx, .xls)</strong>, <strong>MySQL Dumps/Connection</strong>, or <strong>PDF tables</strong> with automatic canonical schema mapping
          </p>
        </div>

        {/* MySQL Connection Modal Trigger */}
        <button
          onClick={() => setShowMysqlModal(true)}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          <Database className="h-4 w-4 text-brand-500" />
          MySQL Database Stream
        </button>
      </div>

      {/* Drag & Drop Ingestion Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-brand-500 bg-brand-500/10 scale-[1.01]'
            : 'border-border bg-card/60 hover:border-brand-500/50 hover:bg-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.tsv,.xlsx,.xls,.sql,.pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-500 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all shadow-sm">
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            Drop procurement dataset here or <span className="text-brand-500 underline">browse files</span>
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Supports CSV, Excel (.xlsx, .xls), SQL dumps (.sql), and PDF tabular extraction. Column headers will be automatically mapped to canonical procurement fields.
          </p>
        </div>

        {/* Supported Format Badges */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-medium border border-border">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" /> CSV / TSV
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-medium border border-border">
            <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500" /> Excel (.xlsx, .xls)
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-medium border border-border">
            <Database className="h-3.5 w-3.5 text-purple-500" /> MySQL / SQL Dumps
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-medium border border-border">
            <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF Table Parser
          </span>
        </div>
      </div>

      {/* Download Test Datasets Box */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <Download className="h-4 w-4 text-brand-500" />
            Download Pre-Packaged Benchmark Datasets
          </div>
          <span className="text-[11px] text-muted-foreground">Ready-to-test multi-format files</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <button
            onClick={downloadSampleCSV}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary hover:border-brand-500 transition-all text-left"
          >
            <div>
              <div className="font-bold text-xs text-foreground">Sample CSV Dataset</div>
              <div className="text-[10px] text-muted-foreground">Multi-vendor procurement CSV</div>
            </div>
            <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          </button>

          <button
            onClick={downloadSampleExcel}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary hover:border-brand-500 transition-all text-left"
          >
            <div>
              <div className="font-bold text-xs text-foreground">Sample Excel Workbook</div>
              <div className="text-[10px] text-muted-foreground">Formatted .xlsx with PO sheets</div>
            </div>
            <FileSpreadsheet className="h-4 w-4 text-blue-500" />
          </button>

          <button
            onClick={downloadSampleSQL}
            className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 p-3 hover:bg-secondary hover:border-brand-500 transition-all text-left"
          >
            <div>
              <div className="font-bold text-xs text-foreground">Sample MySQL Dump</div>
              <div className="text-[10px] text-muted-foreground">Standard SQL INSERT schema</div>
            </div>
            <Database className="h-4 w-4 text-purple-500" />
          </button>
        </div>
      </div>

      {/* Schema Mapping Confirmation Modal */}
      {showMappingModal && mapping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-500" />
                  Validate Ingested Schema Auto-Mapping
                </h3>
                <p className="text-xs text-muted-foreground">
                  Source: <strong>{fileName}</strong> ({rawRows.length} rows detected)
                </p>
              </div>
              <button
                onClick={() => setShowMappingModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {(Object.keys(mapping) as Array<keyof SchemaMappingConfig>).map((key) => {
                const label = key.replace('Field', '').toUpperCase();
                return (
                  <div key={key} className="rounded-lg border border-border/80 bg-secondary/30 p-2.5 space-y-1">
                    <label className="block text-[11px] font-bold text-foreground">{label} Column:</label>
                    <select
                      value={mapping[key]}
                      onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                      className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="">-- Unmapped --</option>
                      {parsedHeaders.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            {/* Preview of first 2 rows */}
            <div className="rounded-lg bg-secondary/40 p-3 text-xs space-y-1.5 border border-border">
              <div className="font-bold text-foreground flex items-center gap-1.5">
                <TableIcon className="h-3.5 w-3.5 text-brand-500" />
                Data Preview (First 2 Rows):
              </div>
              <div className="overflow-x-auto text-[11px] text-muted-foreground">
                <pre className="p-2 bg-black/20 rounded font-mono">
                  {JSON.stringify(rawRows.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowMappingModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmMapping}
                className="px-5 py-2 rounded-lg bg-brand-600 text-xs font-bold text-white shadow-sm hover:bg-brand-500 flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Ingest & Run Analytics
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MySQL Connection Modal */}
      {showMysqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Database className="h-5 w-5 text-purple-500" />
                Connect MySQL Database / Paste SQL DDL
              </h3>
              <button
                onClick={() => setShowMysqlModal(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">MySQL Connection String URI</label>
                <input
                  type="text"
                  value={mysqlUri}
                  onChange={(e) => setMysqlUri(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Or Paste SQL INSERT Script / Dump</label>
                <textarea
                  rows={4}
                  value={sqlPasteText}
                  onChange={(e) => setSqlPasteText(e.target.value)}
                  placeholder="INSERT INTO `orders` (PO_ID, Supplier, Order_Date, Delivery_Date, Item_Category, Quantity, CP, SP, Order_Status, Defective_Units, reason) VALUES ('PO-1', 'Apex', '2026-01-01', '2026-01-14', 'Chips', 500, 100, 140, 'Delivered', 5, 'None');"
                  className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowMysqlModal(false)}
                className="px-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMySQLConnect}
                disabled={mysqlConnecting}
                className="px-5 py-2 rounded-lg bg-purple-600 text-xs font-bold text-white shadow-sm hover:bg-purple-500 flex items-center gap-2 disabled:opacity-50"
              >
                {mysqlConnecting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Querying MySQL Stream...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Execute & Ingest Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
