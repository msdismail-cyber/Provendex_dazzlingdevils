import * as XLSX from 'xlsx';
import { PurchaseOrder, RawPurchaseOrder, SchemaMappingConfig } from './types';

// Canonical field mapping dictionaries
export const SYNONYM_MAP: Record<keyof SchemaMappingConfig, string[]> = {
  poIdField: ['po_id', 'poid', 'po #', 'po_number', 'order_id', 'order_no', 'purchase_order', 'id', 'po'],
  supplierField: ['supplier', 'vendor', 'supplier_name', 'vendor_name', 'provider', 'manufacturer', 'company', 'partner'],
  orderDateField: ['order_date', 'orderdate', 'po_date', 'date_ordered', 'created_at', 'order_dt', 'date', 'placed_date'],
  deliveryDateField: ['delivery_date', 'deliverydate', 'received_date', 'fulfilled_date', 'ship_date', 'actual_delivery', 'delivery_dt', 'arrival_date'],
  categoryField: ['item_category', 'itemcategory', 'category', 'item_type', 'product_category', 'material', 'part_type', 'item', 'component'],
  quantityField: ['quantity', 'qty', 'order_qty', 'units', 'volume', 'count', 'amount', 'batch_size'],
  cpField: ['cp', 'cost_price', 'cost', 'unit_cost', 'purchase_cost', 'cost_per_unit', 'buying_price', 'base_cost'],
  spField: ['sp', 'selling_price', 'price', 'unit_price', 'negotiated_price', 'sales_price', 'selling_rate', 'contract_price'],
  statusField: ['order_status', 'orderstatus', 'status', 'delivery_status', 'state', 'shipping_status'],
  defectsField: ['defective_units', 'defectiveunits', 'defects', 'defect_count', 'returned_units', 'returns', 'failed_units', 'damage_qty', 'defective_qty'],
  reasonField: ['reason', 'defect_reason', 'return_reason', 'failure_reason', 'root_cause', 'remarks', 'notes', 'issue', 'comment']
};

/**
 * Intelligent field matcher that detects matching column names automatically
 */
export function autoDetectMapping(availableHeaders: string[]): SchemaMappingConfig {
  const normalized = availableHeaders.map(h => ({
    original: h,
    cleaned: h.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_')
  }));

  const findMatch = (synonyms: string[]): string => {
    // 1. Exact cleaned match
    for (const syn of synonyms) {
      const match = normalized.find(n => n.cleaned === syn);
      if (match) return match.original;
    }
    // 2. Partial containment match
    for (const syn of synonyms) {
      const match = normalized.find(n => n.cleaned.includes(syn) || syn.includes(n.cleaned));
      if (match) return match.original;
    }
    return '';
  };

  return {
    poIdField: findMatch(SYNONYM_MAP.poIdField),
    supplierField: findMatch(SYNONYM_MAP.supplierField),
    orderDateField: findMatch(SYNONYM_MAP.orderDateField),
    deliveryDateField: findMatch(SYNONYM_MAP.deliveryDateField),
    categoryField: findMatch(SYNONYM_MAP.categoryField),
    quantityField: findMatch(SYNONYM_MAP.quantityField),
    cpField: findMatch(SYNONYM_MAP.cpField),
    spField: findMatch(SYNONYM_MAP.spField),
    statusField: findMatch(SYNONYM_MAP.statusField),
    defectsField: findMatch(SYNONYM_MAP.defectsField),
    reasonField: findMatch(SYNONYM_MAP.reasonField)
  };
}

/**
 * Parses raw CSV/TSV text into key-value objects
 */
export function parseCSVText(text: string): { headers: string[]; rows: Record<string, any>[] } {
  // Detect delimiter: comma, semicolon, tab, pipe
  const firstLine = text.split(/\r\n|\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0)) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';

  const lines = text.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Parse header row
  const rawHeaders = splitCSVLine(lines[0], delimiter);
  const headers = rawHeaders.map(h => h.trim().replace(/^["']|["']$/g, ''));

  const rows: Record<string, any>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitCSVLine(lines[i], delimiter);
    if (values.length === 0) continue;
    const row: Record<string, any> = {};
    headers.forEach((header, index) => {
      let val = values[index] !== undefined ? values[index].trim().replace(/^["']|["']$/g, '') : '';
      row[header] = val;
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parses Excel files (.xlsx, .xls) using SheetJS
 */
export function parseExcelBuffer(buffer: ArrayBuffer): { headers: string[]; rows: Record<string, any>[] } {
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (jsonData.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(jsonData[0]);
  return { headers, rows: jsonData };
}

/**
 * Parses SQL Dump file (Extracting INSERT INTO or CREATE TABLE data)
 */
export function parseSQLDumpText(sqlText: string): { headers: string[]; rows: Record<string, any>[] } {
  const rows: Record<string, any>[] = [];
  let headers: string[] = [];

  // Match INSERT INTO statements
  // Pattern: INSERT INTO `table` (`col1`, `col2`) VALUES ('val1', 'val2'), ('val3', 'val4');
  const insertRegex = /INSERT\s+INTO\s+[`"'\w]+\s*\(([^)]+)\)\s+VALUES\s*([\s\S]+?);/gi;
  let match;

  while ((match = insertRegex.exec(sqlText)) !== null) {
    const colNamesRaw = match[1];
    const valuesBlock = match[2];

    const currentHeaders = colNamesRaw.split(',').map(c => c.trim().replace(/[`"']/g, ''));
    if (headers.length === 0) {
      headers = currentHeaders;
    }

    // Split multiple tuples: ('v1', 'v2'), ('v3', 'v4')
    const tupleRegex = /\(([^)]+)\)/g;
    let tupleMatch;
    while ((tupleMatch = tupleRegex.exec(valuesBlock)) !== null) {
      const tupleVals = splitCSVLine(tupleMatch[1], ',').map(v => v.trim().replace(/^['"`]|['"`]$/g, ''));
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = tupleVals[idx] || '';
      });
      rows.push(row);
    }
  }

  // Fallback: If no INSERT INTO match, parse plain formatted SQL tabular comments or CSV-like content
  if (rows.length === 0) {
    return parseCSVText(sqlText);
  }

  return { headers, rows };
}

/**
 * Parses PDF text content formatted as invoice / PO line tables
 */
export function parsePDFText(pdfText: string): { headers: string[]; rows: Record<string, any>[] } {
  // Extract lines and filter out document titles / headers
  const lines = pdfText.split(/\r\n|\n/).map(l => l.trim()).filter(l => l.length > 0);
  
  // Look for header line containing PO_ID or Supplier
  let headerIndex = lines.findIndex(l => /po|supplier|quantity|cp|sp|order/i.test(l));
  if (headerIndex === -1) headerIndex = 0;

  const headerLine = lines[headerIndex];
  const headers = headerLine.split(/\s{2,}|\t/).map(h => h.trim());

  const rows: Record<string, any>[] = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    // Split by multiple spaces or tabs
    const parts = line.split(/\s{2,}|\t/).map(p => p.trim());
    if (parts.length >= 3) {
      const row: Record<string, any> = {};
      headers.forEach((h, idx) => {
        row[h] = parts[idx] || '';
      });
      rows.push(row);
    }
  }

  return { headers, rows };
}

/**
 * Transforms raw mapped rows into normalized, validated PurchaseOrder array
 */
export function transformToPurchaseOrders(
  rows: Record<string, any>[],
  mapping: SchemaMappingConfig
): PurchaseOrder[] {
  return rows.map((row, index) => {
    const id = String(row[mapping.poIdField] || `PO-${2026000 + index + 1}`);
    const supplier = String(row[mapping.supplierField] || 'Unassigned Supplier').trim();
    
    // Parse Dates
    let orderDate = String(row[mapping.orderDateField] || '2026-01-01').trim();
    let deliveryDate = String(row[mapping.deliveryDateField] || '2026-01-15').trim();
    
    // Format date if needed
    orderDate = normalizeDateString(orderDate);
    deliveryDate = normalizeDateString(deliveryDate);

    const itemCategory = String(row[mapping.categoryField] || 'General Components').trim();
    
    const quantity = Math.max(1, parseInt(String(row[mapping.quantityField] || '100').replace(/[^0-9]/g, ''), 10) || 100);
    const cp = Math.max(0.01, parseFloat(String(row[mapping.cpField] || '50').replace(/[^0-9.]/g, '')) || 50);
    const sp = Math.max(0.01, parseFloat(String(row[mapping.spField] || '75').replace(/[^0-9.]/g, '')) || Math.round(cp * 1.35 * 100) / 100);
    
    let orderStatusRaw = String(row[mapping.statusField] || 'Delivered').trim().toLowerCase();
    let orderStatus: PurchaseOrder['orderStatus'] = 'Delivered';
    if (orderStatusRaw.includes('delay') || orderStatusRaw.includes('late')) orderStatus = 'Delayed';
    else if (orderStatusRaw.includes('pend')) orderStatus = 'Pending';
    else if (orderStatusRaw.includes('cancel')) orderStatus = 'Cancelled';

    const defectiveUnits = Math.min(
      quantity,
      Math.max(0, parseInt(String(row[mapping.defectsField] || '0').replace(/[^0-9]/g, ''), 10) || 0)
    );

    const reason = String(row[mapping.reasonField] || (defectiveUnits > 0 ? 'Quality Inspection Failure' : 'None')).trim();

    // Compute derived lead time
    const oDate = new Date(orderDate).getTime();
    const dDate = new Date(deliveryDate).getTime();
    let leadTimeDays = 14;
    if (!isNaN(oDate) && !isNaN(dDate) && dDate >= oDate) {
      leadTimeDays = Math.max(1, Math.round((dDate - oDate) / (1000 * 60 * 60 * 24)));
    }

    const totalSpend = Math.round(cp * quantity * 100) / 100;
    const totalRevenue = Math.round(sp * quantity * 100) / 100;
    const margin = Math.round((totalRevenue - totalSpend) * 100) / 100;
    const marginRate = totalRevenue > 0 ? Math.round((margin / totalRevenue) * 1000) / 10 : 0;
    const defectRate = quantity > 0 ? Math.round((defectiveUnits / quantity) * 1000) / 10 : 0;
    const isOnTime = orderStatus !== 'Delayed';

    return {
      id,
      supplier,
      orderDate,
      deliveryDate,
      itemCategory,
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
    };
  });
}

function normalizeDateString(dateStr: string): string {
  if (!dateStr) return '2026-01-01';
  // Handle ISO or timestamps
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }
  // Try DD/MM/YYYY or MM/DD/YYYY
  const parts = dateStr.split(/[-/.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return '2026-01-01';
}
