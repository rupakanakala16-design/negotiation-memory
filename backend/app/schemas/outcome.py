from typing import Optional, Any
from pydantic import BaseModel, Field

class RetainedOutcomeSchema(BaseModel):
    id: Optional[str] = None
    caseId: str = Field(..., description="Referenced negotiation case ID")
    decision: Any = Field(..., description="Human decision record or summary")
    actualOutcome: str = Field(..., description="Final settlement terms and deltas achieved")
    lessons: str = Field(..., description="Institutional lessons learned")
    retainedStrategy: str = Field(..., description="Strategy that was executed")
    timestamp: str = Field(..., description="ISO settlement timestamp")
    financialImpact: Optional[str] = ""
    termsAchieved: Optional[str] = ""

class OutcomeRetainRequestSchema(BaseModel):
    case_id: str
    actual_outcome: str
    lessons: str
    retained_strategy: str
    financial_impact: Optional[str] = ""
    terms_achieved: Optional[str] = ""
    decision_id: Optional[str] = None

class OutcomeRetainResponseSchema(BaseModel):
    retained_outcome_id: str
    memory_id: str
    case_id: str
    hindsight_synced: bool
    retained_at: str
    message: str
