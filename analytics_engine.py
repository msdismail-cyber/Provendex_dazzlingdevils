import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sklearn.linear_model import LinearRegression

def process_dataframe_metrics(df: pd.DataFrame, loss_share_pct: float = 50.0) -> Dict[str, Any]:
    """
    Computes comprehensive procurement metrics, risk classifications, 
    and disruption financial compensations across all suppliers.
    """
    # Normalize column names
    col_map = {col: col.lower().strip() for col in df.columns}
    df_clean = df.rename(columns=col_map)

    # Standardize expected columns
    po_col = next((c for c in df_clean.columns if 'po' in c or 'id' in c), 'po_id')
    supplier_col = next((c for c in df_clean.columns if 'supplier' in c or 'vendor' in c), 'supplier')
    order_date_col = next((c for c in df_clean.columns if 'order_date' in c or 'po_date' in c or 'order' in c), 'order_date')
    delivery_date_col = next((c for c in df_clean.columns if 'delivery_date' in c or 'received' in c or 'delivery' in c), 'delivery_date')
    category_col = next((c for c in df_clean.columns if 'category' in c or 'item' in c), 'item_category')
    qty_col = next((c for c in df_clean.columns if 'quantity' in c or 'qty' in c), 'quantity')
    cp_col = next((c for c in df_clean.columns if c in ['cp', 'cost_price', 'cost', 'unit_cost']), 'cp')
    sp_col = next((c for c in df_clean.columns if c in ['sp', 'selling_price', 'price', 'unit_price']), 'sp')
    status_col = next((c for c in df_clean.columns if 'status' in c), 'order_status')
    defects_col = next((c for c in df_clean.columns if 'defect' in c or 'return' in c), 'defective_units')
    reason_col = next((c for c in df_clean.columns if 'reason' in c or 'cause' in c), 'reason')

    # Convert numeric fields
    df_clean['quantity_clean'] = pd.to_numeric(df_clean[qty_col], errors='coerce').fillna(100)
    df_clean['cp_clean'] = pd.to_numeric(df_clean[cp_col], errors='coerce').fillna(50.0)
    df_clean['sp_clean'] = pd.to_numeric(df_clean[sp_col], errors='coerce').fillna(df_clean['cp_clean'] * 1.35)
    df_clean['defects_clean'] = pd.to_numeric(df_clean[defects_col], errors='coerce').fillna(0)
    
    # Financial metrics
    df_clean['spend'] = df_clean['cp_clean'] * df_clean['quantity_clean']
    df_clean['revenue'] = df_clean['sp_clean'] * df_clean['quantity_clean']
    df_clean['margin'] = df_clean['revenue'] - df_clean['spend']
    
    # Dates & Lead times
    df_clean['o_date'] = pd.to_datetime(df_clean[order_date_col], errors='coerce')
    df_clean['d_date'] = pd.to_datetime(df_clean[delivery_date_col], errors='coerce')
    df_clean['lead_time_days'] = (df_clean['d_date'] - df_clean['o_date']).dt.days.fillna(14).clip(lower=1)
    
    df_clean['is_ontime'] = ~df_clean[status_col].astype(str).str.lower().str.contains('delay|late|cancel')
    
    # Group by supplier
    suppliers_list = []
    total_market_spend = df_clean['spend'].sum() or 1.0

    for supplier_name, group in df_clean.groupby(supplier_col):
        tot_pos = len(group)
        tot_qty = group['quantity_clean'].sum()
        tot_spend = group['spend'].sum()
        tot_rev = group['revenue'].sum()
        tot_margin = group['margin'].sum()
        tot_defects = group['defects_clean'].sum()
        ontime_count = group['is_ontime'].sum()
        
        ontime_rate = round((ontime_count / tot_pos) * 100, 1) if tot_pos > 0 else 100.0
        defect_rate = round((tot_defects / tot_qty) * 100, 1) if tot_qty > 0 else 0.0
        margin_pct = round((tot_margin / tot_rev) * 100, 1) if tot_rev > 0 else 0.0
        avg_lead = round(group['lead_time_days'].mean(), 1)
        lead_std = round(group['lead_time_days'].std() or 2.0, 1)
        p90_lead = round(group['lead_time_days'].quantile(0.9) or avg_lead, 1)

        # Reliability score
        on_time_score = ontime_rate
        quality_score = max(0.0, 100.0 - defect_rate * 6.0)
        consistency_score = max(0.0, 100.0 - lead_std * 8.0)
        margin_score = min(100.0, max(0.0, margin_pct * 2.5))
        
        rel_score = round(on_time_score * 0.40 + quality_score * 0.40 + consistency_score * 0.10 + margin_score * 0.10, 1)

        # Risk Tier
        if rel_score >= 88.0:
            risk_tier = 'Elite'
        elif rel_score >= 75.0:
            risk_tier = 'Reliable'
        elif rel_score >= 60.0:
            risk_tier = 'Moderate Risk'
        else:
            risk_tier = 'Critical Risk'

        # Likelihood & Impact for 3x3 Matrix
        likelihood_score = (100.0 - ontime_rate) * 0.6 + defect_rate * 5.0
        likelihood = 'High' if likelihood_score > 28 else 'Medium' if likelihood_score > 12 else 'Low'
        
        spend_share = tot_spend / total_market_spend
        impact = 'High' if spend_share > 0.20 or tot_qty > 15000 else 'Medium' if spend_share > 0.08 or tot_qty > 5000 else 'Low'
        
        matrix_cell = f"{likelihood}-{impact}"

        # 50% Disruption loss share calculation
        defective_spend = (tot_spend / (tot_qty or 1.0)) * tot_defects
        absorbed_loss = round(defective_spend * (loss_share_pct / 100.0), 2)
        net_comp = round(tot_spend - absorbed_loss, 2)

        # Common defect reasons
        reason_counts = group[group['defects_clean'] > 0][reason_col].value_counts()
        reasons_breakdown = [
            {"reason": str(k), "count": int(v), "percentage": round((v / (tot_pos or 1)) * 100, 1)}
            for k, v in reason_counts.items()
        ]

        # Strategy Recommendation
        if risk_tier == 'Elite' and margin_pct >= 25.0:
            strat = 'Scale Allocation (Strategic Partner)'
            details = 'Increase procurement allocation by 25-40%. Lock in multi-quarter volume contracts.'
        elif risk_tier == 'Critical Risk' or (defect_rate > 6.0 and ontime_rate < 70.0):
            strat = 'Phase Out / Replacement Audit'
            details = 'Initiate supplier replacement audit immediately. Reduce allocation to emergency buffer only.'
        elif defect_rate > 4.5:
            strat = 'Enforce Quality SLA & Warranties'
            details = 'Mandate pre-shipment QA certificates and invoke 100% defect reimbursement warranties.'
        elif margin_pct < 15.0:
            strat = 'Renegotiate Cost & Margins'
            details = 'High operational reliability but compressed margin. Leverage volume tiering.'
        elif impact == 'High' and likelihood != 'Low':
            strat = 'Diversify / Dual-Source'
            details = 'High business volume dependency with elevated risk profile. Establish secondary source.'
        else:
            strat = 'Maintain & Monitor (Core Supplier)'
            details = 'Maintain standard procurement quota. Review quarterly yield rates.'

        suppliers_list.append({
            "supplier": str(supplier_name),
            "totalPOs": int(tot_pos),
            "totalQuantity": int(tot_qty),
            "totalSpend": float(round(tot_spend, 2)),
            "totalRevenue": float(round(tot_rev, 2)),
            "totalMargin": float(round(tot_margin, 2)),
            "marginPercentage": float(margin_pct),
            "totalDefectiveUnits": int(tot_defects),
            "defectRate": float(defect_rate),
            "onTimeDeliveries": int(ontime_count),
            "delayedDeliveries": int(tot_pos - ontime_count),
            "onTimeRate": float(ontime_rate),
            "avgLeadTimeDays": float(avg_lead),
            "leadTimeStdDev": float(lead_std),
            "p90LeadTimeDays": float(p90_lead),
            "reliabilityScore": float(rel_score),
            "riskTier": risk_tier,
            "likelihoodLevel": likelihood,
            "impactLevel": impact,
            "matrixCell": matrix_cell,
            "grossPayment": float(round(tot_spend, 2)),
            "absorbedLoss50Pct": float(absorbed_loss),
            "netFinancialCompensation": float(net_comp),
            "commonDefectReasons": reasons_breakdown,
            "recommendedStrategy": strat,
            "strategyActionDetails": details,
            "capacityUtilization": min(100, int((tot_qty / (tot_qty * 1.3 or 1)) * 100))
        })

    suppliers_list.sort(key=lambda x: x["reliabilityScore"], reverse=True)

    # Executive summary
    overall_spend = df_clean['spend'].sum()
    overall_rev = df_clean['revenue'].sum()
    overall_margin = df_clean['margin'].sum()
    overall_qty = df_clean['quantity_clean'].sum()
    overall_defects = df_clean['defects_clean'].sum()
    tot_orders = len(df_clean)
    ontime_tot = df_clean['is_ontime'].sum()

    summary = {
        "totalSpend": float(round(overall_spend, 2)),
        "totalRevenue": float(round(overall_rev, 2)),
        "totalMargin": float(round(overall_margin, 2)),
        "avgMarginPct": float(round((overall_margin / (overall_rev or 1)) * 100, 1)),
        "totalQuantity": int(overall_qty),
        "totalOrders": int(tot_orders),
        "totalDefects": int(overall_defects),
        "overallDefectRate": float(round((overall_defects / (overall_qty or 1)) * 100, 1)),
        "overallOnTimeRate": float(round((ontime_tot / (tot_orders or 1)) * 100, 1)),
        "avgLeadTimeDays": float(round(df_clean['lead_time_days'].mean(), 1)),
        "totalAbsorbedLoss": float(round(sum(s["absorbedLoss50Pct"] for s in suppliers_list), 2)),
        "totalNetCompensation": float(round(sum(s["netFinancialCompensation"] for s in suppliers_list), 2)),
        "highRiskSuppliersCount": int(len([s for s in suppliers_list if s["riskTier"] in ['Critical Risk', 'Moderate Risk']])),
        "topSupplierByMargin": suppliers_list[0]["supplier"] if suppliers_list else "N/A",
        "topSupplierByVolume": max(suppliers_list, key=lambda x: x["totalQuantity"])["supplier"] if suppliers_list else "N/A",
        "supplierCount": int(len(suppliers_list))
    }

    return {"suppliers": suppliers_list, "summary": summary}
