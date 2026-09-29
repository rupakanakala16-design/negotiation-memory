from typing import Optional, Literal
from pydantic import BaseModel, Field

DecisionStatus = Literal["PENDING", "ACCEPTED", "MODIFIED", "OVERRIDDEN", "REJECTED"]

class HumanDecisionSchema(BaseModel):
    id: Optional[str] = None
    caseId: str = Field(..., description="Referenced negotiation case ID")
    status: DecisionStatus = Field("ACCEPTED", description="Manager decision status")
    selectedStrategy: str = Field(..., description="Adopted strategy title")
    modifications: Optional[str] = Field("", description="Manager tactical adjustments")
    notes: Optional[str] = Field("", description="Decision rationale")
    timestamp: str = Field(..., description="ISO timestamp")
    decidedBy: Optional[str] = Field("Human Procurement Manager", description="Procurement executive")

class DecisionRecordRequestSchema(BaseModel):
    case_id: str
    status: DecisionStatus = "ACCEPTED"
    selected_strategy: str
    modifications: Optional[str] = ""
    notes: Optional[str] = ""
    decided_by: Optional[str] = "Human Procurement Manager"

class DecisionRecordResponseSchema(BaseModel):
    decision_id: str
    case_id: str
    recorded_at: str
    status: DecisionStatus
    message: str
