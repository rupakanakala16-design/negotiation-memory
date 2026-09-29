"""
Canonical required routes matching the product API contract:
  POST /api/negotiations/decisions  — persist human decision for a negotiation
  GET  /api/negotiations/decisions  — list all recorded decisions

These are aliases to the /api/decisions endpoint, providing the canonical
/api/negotiations/* namespace required by the product specification.
"""
from typing import List
from fastapi import APIRouter
from backend.app.schemas.decision import (
    DecisionRecordRequestSchema,
    DecisionRecordResponseSchema
)
from backend.app.services.decision_service import decision_service

router = APIRouter(prefix="/negotiations/decisions", tags=["Human Decisions (Canonical)"])


@router.post("", response_model=DecisionRecordResponseSchema)
def record_negotiation_decision(request: DecisionRecordRequestSchema) -> DecisionRecordResponseSchema:
    """
    Persist human procurement manager decision for a negotiation.

    Persists:
    - negotiation_id (case_id)
    - human decision status (ACCEPTED | MODIFIED | OVERRIDDEN | REJECTED)
    - selected / modified strategy
    - notes (optional)
    - timestamp (auto-generated ISO 8601 UTC)
    """
    return decision_service.record_decision(request)


@router.get("", response_model=List[dict])
def list_negotiation_decisions() -> List[dict]:
    """Returns all persisted human procurement decisions."""
    return decision_service.get_all_decisions()
