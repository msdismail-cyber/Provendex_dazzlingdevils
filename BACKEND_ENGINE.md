# Provendex — Backend & Predictive Analytics Engine

**Application Title**: Provendex  
**Developer Credits**: Developed by **HAJANDIKA | ISMAIL | RISHIBH | RITHIN**  
**Core Technologies**: Python (FastAPI, Pandas, NumPy, Scikit-learn, SQLite) & TypeScript Edge Analytics Engine.

---

## 1. Multi-Format Data Ingestion & Auto-Mapping Engine

Provendex supports four primary ingestion pipelines:
1. **CSV & TSV Files**:
   - Auto-detects delimiters (`,`, `;`, `\t`, `|`).
   - Handles multi-line quotes and variable encoding formats.
2. **Excel Workbooks (`.xlsx`, `.xls`)**:
   - Parses multi-tab sheets and extracts tabular records into structured objects.
3. **MySQL Connection String & SQL Dumps (`.sql`)**:
   - Extracts tuples from `INSERT INTO \`table\` (...) VALUES (...)` statements.
   - Includes a connection simulator for live SQL streaming.
4. **PDF Invoice & Table Parser**:
   - Extracts whitespace and tab-aligned tabular text lines.

### Canonical Auto-Mapping Dictionary
The engine dynamically matches incoming column variations against canonical procurement fields:

| Canonical Field | Synonyms / Accepted Header Variations |
| :--- | :--- |
| **PO_ID** | `po_id`, `poid`, `po #`, `po_number`, `order_id`, `purchase_order`, `id` |
| **Supplier** | `supplier`, `vendor`, `supplier_name`, `vendor_name`, `provider`, `company` |
| **Order_Date** | `order_date`, `orderdate`, `po_date`, `created_at`, `date_ordered`, `order_dt` |
| **Delivery_Date** | `delivery_date`, `deliverydate`, `received_date`, `fulfilled_date`, `ship_date` |
| **Item_Category** | `item_category`, `category`, `item_type`, `product_category`, `material` |
| **Quantity** | `quantity`, `qty`, `order_qty`, `units`, `volume`, `count`, `batch_size` |
| **CP (Cost Price)** | `cp`, `cost_price`, `cost`, `unit_cost`, `purchase_cost`, `buying_price` |
| **SP (Selling Price)**| `sp`, `selling_price`, `price`, `unit_price`, `negotiated_price`, `sales_price` |
| **Order_Status** | `order_status`, `orderstatus`, `status`, `delivery_status`, `state` |
| **Defective_Units**| `defective_units`, `defects`, `defect_count`, `returned_units`, `returns` |
| **reason** | `reason`, `defect_reason`, `return_reason`, `failure_reason`, `root_cause` |

---

## 2. Mathematical Modeling & Predictive Algorithms

### A. Price Trend Prediction (Linear Regression Cone)
For each unique `(Supplier, Item_Category)` pair with historical purchase history:
- Convert order timestamps to relative days $x_i = t_i - t_0$ and cost prices to $y_i = \text{CP}_i$.
- Compute ordinary least squares regression:
  $$\beta = \frac{N \sum x_i y_i - \sum x_i \sum y_i}{N \sum x_i^2 - (\sum x_i)^2}, \quad \alpha = \bar{y} - \beta \bar{x}$$
- Forecast prices for $+30$, $+60$, and $+90$ days:
  $$\hat{y}(x + \Delta t) = \alpha + \beta (x + \Delta t)$$
- Calculate $95\%$ confidence bounds $\hat{y} \pm 1.96 \cdot \text{SE}$.

### B. Delivery Lead Time & Delay Probability Modeling
- Individual PO Lead Time: $\Delta t = \text{Delivery\_Date} - \text{Order\_Date}$.
- Average Lead Time: $\mu = \frac{1}{N} \sum \Delta t_i$.
- Standard Deviation: $\sigma = \sqrt{\frac{1}{N} \sum (\Delta t_i - \mu)^2}$.
- 90th Percentile Lead Time ($P_{90}$): Value below which $90\%$ of deliveries occur.
- Delay Probability: $\text{Delay Likelihood} = \frac{\text{Delayed POs}}{\text{Total POs}} \times 100\%$.

### C. Quality & Defect Risk Modeling
- Defect Rate:
  $$\text{Defect Rate (\%)} = \left( \frac{\sum \text{Defective Units}}{\sum \text{Quantity}} \right) \times 100\%$$
- Quality Risk Score:
  $$\text{Quality Risk Index} = \min(100, \, \text{Defect Rate} \times 8 + (100 - \text{On-Time Rate}) \times 0.2)$$

### D. Capacity & Utilization Forecasting
- Rolling Monthly Volume: $\text{Volume}_{\text{month}} = \sum_{m} \text{Quantity}$.
- Estimated Max Capacity: $\text{Capacity}_{\text{max}} = \max(\text{Volume}_{\text{month}}) \times 1.30$.
- Capacity Utilization: $\text{Utilization \%} = \frac{\text{Average Monthly Volume}}{\text{Capacity}_{\text{max}}} \times 100\%$.
- Bottleneck Warning triggered when $\text{Utilization} > 85\%$.

---

## 3. Supplier Risk Scoring & 3x3 Matrix Calculation

### Aggregate Supplier Reliability Score (0 - 100)
$$\text{Reliability Score} = 0.40 \cdot \text{OTD\%} + 0.40 \cdot (100 - 6 \cdot \text{Defect\%}) + 0.10 \cdot (100 - 8 \cdot \sigma_{\text{lead}}) + 0.10 \cdot \min(100, 2.5 \cdot \text{Margin\%})$$

### Risk Tiering Classification
- **Tier 1 - Elite Partner**: Score $\ge 88$
- **Tier 2 - Reliable Core**: $75 \le \text{Score} < 88$
- **Tier 3 - Moderate Risk**: $60 \le \text{Score} < 75$
- **Tier 4 - Critical Risk**: $\text{Score} < 60$

---

## 4. Supply Chain Disruption & 50% Loss Share Settlement

Under production house standard terms, downstream customer component returns trigger a **50% loss share**:
$$\text{Defective Component Spend} = \frac{\text{Total Spend}}{\text{Total Quantity}} \times \text{Defective Units}$$
$$\text{Absorbed Loss (50\%)} = \text{Defective Component Spend} \times 0.50$$
$$\text{Net Adjusted Supplier Settlement} = \text{Total Invoiced Spend} - \text{Absorbed Loss (50\%)}$$

---

## 5. SQLite Repository & Audit History Schema

Saved strategy execution logs are persisted locally in SQLite (`provendex_history.db`):
```sql
CREATE TABLE strategy_history (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    title TEXT NOT NULL,
    dataset_name TEXT NOT NULL,
    loss_share_pct REAL NOT NULL,
    total_spend REAL NOT NULL,
    total_margin REAL NOT NULL,
    total_absorbed_loss REAL NOT NULL,
    overall_reliability REAL NOT NULL,
    recommendations_json TEXT NOT NULL,
    notes TEXT,
    created_by TEXT NOT NULL
);
```
