from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import io
import pandas as pd
from analytics_engine import process_dataframe_metrics
from database import insert_strategy_log, get_all_strategy_logs, delete_strategy_log

app = FastAPI(
    title="Provendex API",
    description="Enterprise Procurement Predictive Analytics & Supplier Risk OS Backend",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StrategyLogRequest(BaseModel):
    id: str
    timestamp: str
    title: str
    datasetName: str
    lossSharePct: float
    totalSpend: float
    totalMargin: float
    totalAbsorbedLoss: float
    overallReliabilityScore: float
    recommendations: List[Dict[str, Any]]
    notes: Optional[str] = ""
    createdBy: str

@app.get("/")
def root():
    return {
        "app": "Provendex",
        "status": "online",
        "developers": "HAJANDIKA | ISMAIL | RISHIBH | RITHIN",
        "engine": "FastAPI with Pandas & Scikit-Learn"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "Provendex Analytics Engine"}

@app.post("/api/parse-file")
async def parse_file(file: UploadFile = File(...), loss_share: float = Form(50.0)):
    try:
        content = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".csv") or filename.endswith(".tsv") or filename.endswith(".txt"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith(".xlsx") or filename.endswith(".xls"):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Supported formats: CSV, XLSX, XLS")

        result = process_dataframe_metrics(df, loss_share_pct=loss_share)
        return {"filename": file.filename, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing error: {str(e)}")

@app.get("/api/strategies")
def get_strategies():
    logs = get_all_strategy_logs()
    return {"status": "success", "count": len(logs), "logs": logs}

@app.post("/api/strategies")
def save_strategy(strat: StrategyLogRequest):
    insert_strategy_log(
        log_id=strat.id,
        timestamp=strat.timestamp,
        title=strat.title,
        dataset_name=strat.datasetName,
        loss_share_pct=strat.lossSharePct,
        total_spend=strat.totalSpend,
        total_margin=strat.totalMargin,
        total_absorbed_loss=strat.totalAbsorbedLoss,
        overall_reliability=strat.overallReliabilityScore,
        recommendations=strat.recommendations,
        notes=strat.notes,
        created_by=strat.createdBy
    )
    return {"status": "success", "message": "Strategy snapshot recorded in SQLite repository."}

@app.delete("/api/strategies/{log_id}")
def delete_strategy(log_id: str):
    delete_strategy_log(log_id)
    return {"status": "success", "message": f"Strategy snapshot {log_id} deleted."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
