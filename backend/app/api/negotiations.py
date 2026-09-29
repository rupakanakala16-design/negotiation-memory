"""
Canonical required routes matching the product API contract for the /api/negotiations namespace:
  GET  /api/negotiations          — list all completed negotiations in memory bank
  POST /api/negotiations/seed     — seed canonical memory bank
  POST /api/negotiations/analyze  — core intelligence pipeline endpoint
  POST /api/negotiations/retain   — retain completed outcome into memory bank

These delegate to the same underlying services used by app/main.py but are
exposed through the backend FastAPI router so the backend app is self-contained.
"""
import logging
import os
import time
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException
from app.models import (
    CompletedNegotiation,
    CurrentNegotiationContext,
    NegotiationAnalysisResponse,
    RetainOutcomeRequest
)
from app.hindsight_service import hindsight_service
from app.negotiation_agent import negotiation_agent
from app.seed_data import SEED_NEGOTIATIONS

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/negotiations", tags=["Negotiations (Canonical)"])


@router.get("", response_model=List[CompletedNegotiation])
def list_negotiations() -> List[CompletedNegotiation]:
    """
    Returns all completed supplier negotiations stored in the memory bank.
    Retrieval method: structured local JSON store (not vector similarity).
    """
    return hindsight_service.get_all_negotiations()


@router.post("/seed")
def seed_negotiations() -> Dict[str, Any]:
    """Seeds (or resets) canonical negotiation experiences into the memory bank."""
    results = []
    for deal in SEED_NEGOTIATIONS:
        res = hindsight_service.retain_negotiation(deal)
        results.append(res)
    return {
        "message": f"Successfully seeded {len(SEED_NEGOTIATIONS)} canonical negotiation memories into Hindsight.",
        "bank_id": hindsight_service.bank_id,
        "results": results
    }


@router.post("/analyze", response_model=NegotiationAnalysisResponse)
def analyze_negotiation(context: CurrentNegotiationContext) -> NegotiationAnalysisResponse:
    """
    Core Condition-Aware Intelligence Pipeline:

    Step 1: RECALL — Retrieve relevant past negotiations from memory bank.
            Retrieval: Hindsight vector search if server connected, else heuristic scoring.
    Step 2: CONDITION DIFFERENCE — Compare structured past vs current conditions
            using typed fields (supply_balance, leverage_level, urgency, alt_count).
            No substring matching.
    Step 3: REFLECT — Hindsight reflect() with retrieved memories passed in context.
            Falls back to deterministic condition analysis if server unavailable.
            reflection_source is honestly labeled: 'hindsight_reflect_llm' or 'fallback_rule_based'.
    Step 4: STRATEGY GUIDANCE — Derived from reflection synthesis + retrieved memories.

    Memory → Condition Diff → Reflection → Recommendation is the actual data flow.
    Retrieved memories are explicitly passed into the reflection context.
    """
    try:
        response = negotiation_agent.analyze_negotiation(context)
        return response
    except Exception as e:
        logger.error(f"Error analyzing negotiation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/retain")
def retain_outcome(request: RetainOutcomeRequest) -> Dict[str, Any]:
    """
    Retains a completed negotiation outcome into the memory bank.
    Completes the continuous learning loop:
    Negotiate → RETAIN → memory bank → future RECALL → REFLECT → new RECOMMENDATION.

    The retained outcome is stored as a full CompletedNegotiation and is immediately
    available to the recall pipeline in future negotiations.
    """
    deal = CompletedNegotiation(
        id=f"deal-{request.supplier.lower().replace(' ', '-')}-{int(time.time() * 1000)}",
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
        "message": f"Negotiation outcome for '{request.supplier}' retained into memory bank '{hindsight_service.bank_id}'.",
        "deal_id": deal.id,
        "hindsight_sync": result
    }
