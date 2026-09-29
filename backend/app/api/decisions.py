"""
Human decision recording routes.

Canonical routes (per API contract):
  POST /api/decisions               — record a human procurement decision
  POST /api/decisions/record        — alias documented in API_CONTRACT.md

Also accessible via:
  POST /api/negotiations/decisions  — canonical /negotiations namespace (negotiations_decisions.py)
"""
from typing import List
from fastapi import APIRouter
from backend.app.schemas.decision import (
    DecisionRecordRequestSchema,
    DecisionRecordResponseSchema
)
from backend.app.services.decision_service import decision_service

router = APIRouter(prefix="/decisions", tags=["Human Decisions"])


@router.post("", response_model=DecisionRecordResponseSchema)
def record_decision(request: DecisionRecordRequestSchema) -> DecisionRecordResponseSchema:
    """
    Record human procurement manager discretionary decision, preserving human-in-the-loop control.

    Persists to file store:
    - case_id (negotiation reference)
    - status: ACCEPTED | MODIFIED | OVERRIDDEN | REJECTED | PENDING
    - selected_strategy: The strategy title adopted (possibly modified)
    - modifications: Manager tactical adjustments (optional)
    - notes: Decision rationale (optional)
    - decided_by: Name of the procurement executive
    - timestamp: Auto-generated ISO 8601 UTC
    """
    return decision_service.record_decision(request)


@router.post("/record", response_model=DecisionRecordResponseSchema)
def record_decision_alias(request: DecisionRecordRequestSchema) -> DecisionRecordResponseSchema:
    """
    Alias: POST /api/decisions/record
    Documented in API_CONTRACT.md as the canonical decision recording endpoint.
    Delegates to the same service as POST /api/decisions.
    """
    return decision_service.record_decision(request)


@router.get("", response_model=List[dict])
def list_all_decisions() -> List[dict]:
    """Returns all persisted human procurement manager decisions."""
    return decision_service.get_all_decisions()
