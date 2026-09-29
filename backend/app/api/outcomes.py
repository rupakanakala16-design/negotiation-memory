from fastapi import APIRouter
from backend.app.schemas.outcome import (
    OutcomeRetainRequestSchema,
    OutcomeRetainResponseSchema
)
from backend.app.services.outcome_service import outcome_service

router = APIRouter(prefix="/outcomes", tags=["Outcome Retention"])

@router.post("/retain", response_model=OutcomeRetainResponseSchema)
def retain_outcome(request: OutcomeRetainRequestSchema) -> OutcomeRetainResponseSchema:
    """
    Retains concluded negotiation outcome and lessons learned back into Hindsight memory bank.
    """
    return outcome_service.retain_outcome(request)
