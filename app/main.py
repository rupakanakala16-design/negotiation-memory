import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.config import settings
from app.models import (
    CompletedNegotiation,
    CurrentNegotiationContext,
    NegotiationAnalysisResponse,
    RetainOutcomeRequest
)
from app.hindsight_service import hindsight_service
from app.negotiation_agent import negotiation_agent
from app.seed_data import SEED_NEGOTIATIONS

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: Auto-seed canonical memories if bank is empty."""
    existing = hindsight_service.get_all_negotiations()
    if not existing:
        logger.info("Initializing Hindsight memory bank with canonical negotiation experiences...")
        for deal in SEED_NEGOTIATIONS:
            hindsight_service.retain_negotiation(deal)
        logger.info(f"Initialized {len(SEED_NEGOTIATIONS)} canonical negotiation memories.")
    yield


app = FastAPI(
    title="Institutional Negotiation Memory & Learning Agent",
    description="Vectorize Hindsight-powered institutional memory system for procurement managers.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.app.api.api_router import api_router
app.include_router(api_router)

@app.get("/api/health")
def get_health() -> Dict[str, Any]:
    """Returns system status, Hindsight server connection state, and active memory bank info."""
    hindsight_status = hindsight_service.check_health()
    all_deals = hindsight_service.get_all_negotiations()
    return {
        "status": "healthy",
        "service": "Institutional Negotiation Memory & Learning Agent",
        "hindsight": hindsight_status,
        "memory_bank": {
            "bank_id": settings.hindsight_bank_id,
            "stored_experiences_count": len(all_deals),
            "suppliers_indexed": list(set(d.supplier for d in all_deals))
        }
    }

@app.get("/api/negotiations", response_model=List[CompletedNegotiation])
def list_negotiations() -> List[CompletedNegotiation]:
    """Returns all completed supplier negotiations stored in the Hindsight memory bank."""
    return hindsight_service.get_all_negotiations()

@app.post("/api/negotiations/seed")
def seed_negotiations() -> Dict[str, Any]:
    """Seeds or resets canonical negotiation experiences into Hindsight memory bank."""
    results = []
    for deal in SEED_NEGOTIATIONS:
        res = hindsight_service.retain_negotiation(deal)
        results.append(res)
    return {
        "message": f"Successfully seeded {len(SEED_NEGOTIATIONS)} canonical negotiation memories into Hindsight.",
        "bank_id": settings.hindsight_bank_id,
        "results": results
    }

@app.post("/api/negotiations/analyze", response_model=NegotiationAnalysisResponse)
def analyze_negotiation(context: CurrentNegotiationContext) -> NegotiationAnalysisResponse:
    """
    Core Condition-Aware Learning endpoint:
    1. Uses Hindsight RECALL to retrieve relevant past negotiations.
    2. Uses Hindsight REFLECT to reason over past vs current conditions.
    3. Analyzes condition contrast (e.g. shortage vs surplus).
    4. Provides adaptive tactical guidance.
    """
    try:
        response = negotiation_agent.analyze_negotiation(context)
        return response
    except Exception as e:
        logger.error(f"Error analyzing negotiation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/negotiations/retain")
def retain_outcome(request: RetainOutcomeRequest) -> Dict[str, Any]:
    """
    Retains a newly completed negotiation outcome back into Hindsight.
    Completes the continuous learning loop:
    Negotiation -> RETAIN -> persistent memory -> new negotiation -> RECALL -> REFLECT -> RETAIN.
    """
    deal = CompletedNegotiation(
        id=f"deal-{request.supplier.lower().replace(' ', '-')}-{int(os.times().elapsed * 1000)}",
        supplier=request.supplier,
        category=request.category,
        market_conditions=request.market_conditions,
        supplier_leverage=request.supplier_leverage,
        buyer_leverage=request.buyer_leverage,
        supply_balance=request.supply_balance,
        supplier_leverage_level=request.supplier_leverage_level,
        buyer_leverage_level=request.buyer_leverage_level,
        urgency=request.urgency,
        alternative_supplier_count=request.alternative_supplier_count,
        negotiation_objective=request.negotiation_objective,
        constraints=request.constraints,
        tactics_attempted=request.tactics_attempted,
        what_worked=request.what_worked,
        what_failed=request.what_failed,
        final_outcome=request.final_outcome,
        tradeoffs=request.tradeoffs,
        lessons_learned=request.lessons_learned,
        date_completed=request.date_completed or "Recent Settlement",
        tags=[request.supplier, request.category, "Retained Outcome"]
    )
    result = hindsight_service.retain_negotiation(deal)
    return {
        "success": True,
        "message": f"Negotiation outcome for '{request.supplier}' successfully retained into Hindsight memory bank '{settings.hindsight_bank_id}'.",
        "deal_id": deal.id,
        "hindsight_sync": result
    }

@app.get("/api/demo-scenario")
def get_demo_scenario() -> Dict[str, Any]:
    """Returns the canonical Alpha Supplier demonstration scenario setup."""
    return {
        "title": "Alpha Supplier: Shortage vs. Surplus Condition-Aware Learning Proof",
        "narrative": (
            "Demonstrates that the agent does not blindly repeat what worked in the past. "
            "In 2024, when Alpha held high leverage in a supply shortage, an 85% volume commitment won a 12% discount. "
            "Today, under supply surplus and low supplier leverage, repeating volume commitments would be a grave mistake. "
            "The system recalls the past deal, contrasts conditions, and recommends competitive benchmarking & index pricing instead."
        ),
        "past_case": {
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply shortage, global logistics bottleneck, tight capacity, single source reliance.",
            "supplier_leverage": "High",
            "buyer_leverage": "Low",
            "tactic_that_worked": "Multi-year 85% volume commitment with minimum take-or-pay guarantee",
            "outcome": "Achieved 12% discount off spot index and secured 100% guaranteed allocation for 18 months"
        },
        "current_case_to_test": {
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply surplus, softening global industrial demand, 4 alternative qualified vendors available.",
            "supplier_leverage": "Low",
            "buyer_leverage": "High",
            "negotiation_objective": "Achieve 15% price reduction, eliminate volume take-or-pay lock-in, and switch to quarterly price reviews.",
            "constraints": "Lead time cannot exceed 14 business days."
        },
        "demonstration_steps": [
            "1. Inspect Stored Past Negotiation in Memory Bank (Alpha Supplier in Shortage)",
            "2. Run Recall & Reflect for Alpha Supplier under Current Surplus Conditions",
            "3. Observe Condition Contrast & Caution: Why NOT to repeat volume commitment",
            "4. Review Adaptive Strategy: Competitive benchmarking, mini-RFP, index pricing",
            "5. Retain New Surplus Negotiation Outcome into Hindsight",
            "6. Verify Memory Bank Updates: Both experiences now persist for institutional learning"
        ]
    }

# Mount frontend directory for browser UI
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

@app.get("/")
def serve_index():
    index_file = frontend_path / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Institutional Negotiation Memory & Learning Agent API is running."}
