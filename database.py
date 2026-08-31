import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "provendex_history.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS strategy_history (
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
    )
    """)
    conn.commit()
    conn.close()

def insert_strategy_log(
    log_id: str,
    timestamp: str,
    title: str,
    dataset_name: str,
    loss_share_pct: float,
    total_spend: float,
    total_margin: float,
    total_absorbed_loss: float,
    overall_reliability: float,
    recommendations: List[Dict[str, Any]],
    notes: Optional[str],
    created_by: str
):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO strategy_history (
        id, timestamp, title, dataset_name, loss_share_pct, total_spend, 
        total_margin, total_absorbed_loss, overall_reliability, recommendations_json, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        log_id,
        timestamp,
        title,
        dataset_name,
        loss_share_pct,
        total_spend,
        total_margin,
        total_absorbed_loss,
        overall_reliability,
        json.dumps(recommendations),
        notes or "",
        created_by
    ))
    conn.commit()
    conn.close()

def get_all_strategy_logs() -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM strategy_history ORDER BY timestamp DESC")
    rows = cursor.fetchall()
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "timestamp": r["timestamp"],
            "title": r["title"],
            "datasetName": r["dataset_name"],
            "lossSharePct": r["loss_share_pct"],
            "totalSpend": r["total_spend"],
            "totalMargin": r["total_margin"],
            "totalAbsorbedLoss": r["total_absorbed_loss"],
            "overallReliabilityScore": r["overall_reliability"],
            "recommendations": json.loads(r["recommendations_json"]),
            "notes": r["notes"],
            "createdBy": r["created_by"]
        })
    conn.close()
    return results

def delete_strategy_log(log_id: str):
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM strategy_history WHERE id = ?", (log_id,))
    conn.commit()
    conn.close()
