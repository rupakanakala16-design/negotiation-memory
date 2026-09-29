"""
Canonical required routes matching the product API contract:
  GET  /api/memories       — flat list of all historical memories in the bank
  GET  /api/timeline       — chronological negotiation event timeline

These are canonical aliases to the memory/timeline endpoints under /api/memory/
and expose the exact paths required by the product API specification.
"""
from typing import List, Optional
from fastapi import APIRouter, Query
from backend.app.schemas.memory import HistoricalMemorySchema, MemoryTimelineEventSchema
from backend.app.services.memory_service import memory_service
from app.hindsight_service import hindsight_service

router = APIRouter(tags=["Institutional Memory (Canonical)"])


@router.get("/memories", response_model=List[HistoricalMemorySchema])
def get_all_memories() -> List[HistoricalMemorySchema]:
    """
    Returns flat list of all historical negotiation memories in the bank.
    Retrieval method: structured local bank (heuristic relevance scoring).
    No vector/semantic similarity is applied — this is a full dump of stored memories.
    """
    from app.seed_data import SEED_NEGOTIATIONS
    memories: List[HistoricalMemorySchema] = []

    # Return all deals from the live local bank (includes seeded + retained outcomes)
    all_deals = hindsight_service.get_all_negotiations()
    source = all_deals if all_deals else SEED_NEGOTIATIONS

    for deal in source:
        memories.append(HistoricalMemorySchema(
            id=deal.id or f"deal-{deal.supplier.lower().replace(' ', '-')}",
            organization=deal.supplier,
            category=deal.category,
            date=deal.date_completed or "Historical",
            strategy=deal.tactics_attempted[0] if deal.tactics_attempted else "Standard Playbook",
            conditions={
                "supplyBalance": deal.supply_balance.upper(),
                "supplierLeverage": deal.supplier_leverage_level.upper(),
                "buyerLeverage": deal.buyer_leverage_level.upper(),
                "alternatives": deal.alternative_supplier_count,
                "marketTrend": deal.market_conditions
            },
            outcome=deal.final_outcome,
            relevanceScore=0.91,
            result="SUCCESS",
            lessons=deal.lessons_learned,
            tacticsAttempted=deal.tactics_attempted,
            whatWorked=deal.what_worked,
            whatFailed=deal.what_failed,
            tradeoffs=deal.tradeoffs
        ))
    return memories


@router.get("/timeline", response_model=List[MemoryTimelineEventSchema])
def get_timeline(
    supplier: Optional[str] = Query(None, description="Filter by counterparty/supplier name")
) -> List[MemoryTimelineEventSchema]:
    """
    Returns chronological timeline of negotiation events stored in institutional memory.
    Optionally filtered by supplier/counterparty name.
    """
    return memory_service.get_timeline(supplier)
