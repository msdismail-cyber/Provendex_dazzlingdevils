# Provendex — Frontend Architecture & Technical Specification

**Application Name**: Provendex  
**Developer Credits**: Developed by **HAJANDIKA | ISMAIL | RISHIBH | RITHIN**  
**Technology Stack**: Next.js 14 (App Router), React 18, TypeScript 5, Tailwind CSS, Lucide Icons, Recharts, SheetJS (XLSX), jsPDF.

---

## 1. Overview & UI System

Provendex is designed as an executive-grade procurement decision support system and supplier risk operating system. It provides an intuitive, high-contrast, responsive interface with Dark and Light mode support, instant statistical computation, and real-time visualization.

### Key Visual & Layout Standards
- **Responsive Layout**: Fluid CSS grid and flexbox supporting mobile, tablet, and ultra-wide 4K monitors.
- **Theme Palette**: Deep slate/navy dark theme (`hsl(222.2, 84%, 4.9%)`) with high-contrast emerald (`#10b981`), brand sky blue (`#0ea5e9`), amber warning (`#f59e0b`), and crimson critical risk (`#ef4444`) accents.
- **Typography**: Clean system font stack with tabular numeric alignment for monetary and volume KPI figures.
- **Developer Attribution**: Unconditionally branded in top navigation bar and footer:  
  `Developed by HAJANDIKA | ISMAIL | RISHIBH | RITHIN`

---

## 2. Component Hierarchy & Directory Architecture

```
src/
├── app/
│   ├── layout.tsx              # Root HTML shell, Theme initialization & Global Provider
│   ├── page.tsx                # Executive Dashboard (Overview, KPIs, 4 Charts, Disruption, Matrix)
│   ├── analytics/page.tsx      # Predictive ML Models (Price, Delivery, Quality, Capacity)
│   ├── risk-matrix/page.tsx    # Interactive 3x3 Supplier Risk Heatmap
│   ├── disruption/page.tsx     # 50% Loss Share Disruption & Financial Compensation Bar Graph
│   ├── strategies/page.tsx     # Revenue Prioritization Strategy & Audit Trail Log
│   ├── import/page.tsx         # Multi-format Data Ingestion & Schema Auto-Mapping UI
│   └── globals.css             # Tailwind design tokens, CSS variables, glassmorphism
├── components/
│   ├── AppShell.tsx            # Global layout shell, modals, and navigation wrapper
│   ├── Header.tsx              # Top branding, developer credits, dark/light switch, dataset selector
│   ├── KPISummaryCards.tsx     # 6 Executive KPI summary cards with gradient indicators
│   ├── CorePieCharts.tsx       # 4 Core distribution pie/donut charts with interactive tooltips
│   ├── DisruptionBarChart.tsx  # 50% loss share financial compensation bar chart & slider
│   ├── RiskMatrix3x3.tsx       # 3x3 Interactive Supplier Risk Matrix (Likelihood vs Impact)
│   ├── PredictiveForecast.tsx  # Price linear regression, lead time, defect rate, capacity gauges
│   ├── StrategyLogger.tsx      # Strategy recommendation generator & history audit logger
│   ├── FileUploader.tsx        # Drag & drop ingest for CSV, XLSX, SQL dumps, PDF
│   └── SupplierDetailModal.tsx # Full drill-down modal for clicked suppliers
├── lib/
│   ├── analyticsEngine.ts      # Pure TypeScript local statistical and ML regression engine
│   ├── dataParser.ts           # Parsers for CSV (auto-delimiter), XLSX, SQL, and PDF tables
│   ├── DataContext.tsx         # React Context providing global reactive state
│   ├── sampleData.ts           # 500+ realistic procurement PO sample generator
│   ├── storage.ts              # LocalStorage & IndexedDB persistent snapshot manager
│   └── types.ts                # Canonical TypeScript interfaces & domain types
```

---

## 3. Visualization & Charting Logic

### A. Four Core Distribution Pie Charts (`CorePieCharts.tsx`)
1. **Punctuality Distribution**:
   - Calculates on-time deliveries ($\text{Delivery Date} \le \text{Order Date} + \text{Lead Time}$) vs delayed orders per vendor.
   - Interactive inner-radius donut visualization with hover percentage breakdowns.
2. **Component Return / Defect Distribution**:
   - Measures defective/returned component volume share per vendor ($\sum \text{Defective Units}$).
   - Highlights top defect contributors to assist incoming quality assurance (IQA).
3. **Total Order Quantity Share**:
   - Proportional volume distribution ($\sum \text{Quantity}$) across suppliers to detect over-reliance on single sources.
4. **Revenue Share**:
   - Total procurement spend and gross margin yield contributed by each partner.

### B. Supply Chain Disruption & Financial Compensation Bar Graph (`DisruptionBarChart.tsx`)
- **Disruption Business Rule**:
  $$\text{Defective Value} = \sum (\text{Defective Units} \times \text{Unit CP})$$
  $$\text{Absorbed Loss (50\%)} = \text{Defective Value} \times 0.50$$
  $$\text{Net Compensation Paid} = \text{Total Invoiced Spend} - \text{Absorbed Loss}$$
- **Interactive Controls**:
  - Interactive slider allowing risk officers to adjust loss share from 0% to 100% (default locked at 50%).
  - Grouped vs. Stacked Waterfall visualization modes.

### C. Interactive 3x3 Supplier Risk Matrix (`RiskMatrix3x3.tsx`)
- **Y-Axis (Likelihood of Failure / Delay)**: Computed from $(\text{Delayed Rate} \times 0.6) + (\text{Defect Rate} \times 5.0)$.
- **X-Axis (Business & Spend Impact)**: Computed from Supplier Spend Share $\%$ and Total Unit Volume.
- **9 Grid Quadrants**:
  - `Low / Low`: Low Risk (Monitor Routinely) — Emerald
  - `Medium / Medium`: Moderate Risk (Active Governance) — Amber
  - `High / High`: Critical Risk (Urgent Action & Phase Out) — Crimson Red
- Clicking any quadrant or supplier card opens an immediate drill-down drawer.

---

## 4. State Management & Data Flow

Provendex uses a clean unidirectional reactive architecture via `DataContext.tsx`:
1. Ingestion of raw dataset (via sample presets or uploaded files).
2. `dataParser.ts` maps fields into standardized `PurchaseOrder[]` schema.
3. `analyticsEngine.ts` calculates real-time aggregated metrics (`SupplierMetrics[]` & `ExecutiveSummary`).
4. Reactive broadcast updates all charts, forecasting tabs, risk matrices, and strategy rankings instantaneously without network roundtrips.
