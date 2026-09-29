from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

SupplyBalance = Literal["SHORTAGE", "BALANCED", "SURPLUS"]
LeverageLevel = Literal["HIGH", "MEDIUM", "LOW"]
UrgencyLevel = Literal["URGENT", "NORMAL", "FLEXIBLE"]

class ConditionVectorSchema(BaseModel):
    supply_balance: SupplyBalance = Field("SURPLUS", description="Macro balance: SHORTAGE, BALANCED, or SURPLUS")
    supplier_leverage: LeverageLevel = Field("LOW", description="Supplier leverage: HIGH, MEDIUM, or LOW")
    buyer_leverage: LeverageLevel = Field("HIGH", description="Buyer leverage: HIGH, MEDIUM, or LOW")
    urgency: UrgencyLevel = Field("FLEXIBLE", description="Operational urgency: URGENT, NORMAL, or FLEXIBLE")
    alternatives: int = Field(4, description="Count of viable alternative suppliers")

class HistoricalMemorySchema(BaseModel):
    id: str = Field(..., description="Unique memory ID in Hindsight bank")
    organization: str = Field(..., description="Supplier or counterparty name")
    category: str = Field(..., description="Procurement category")
    date: str = Field(..., description="Date or settlement period of negotiation")
    strategy: str = Field(..., description="Core strategy or posture executed")
    conditions: Dict[str, Any] = Field(default_factory=dict, description="Market & leverage conditions")
    outcome: str = Field(..., description="Contract settlement achieved")
    relevanceScore: float = Field(..., description="Similarity or relevance score (0.0 to 1.0)")
    result: str = Field("SUCCESS", description="SUCCESS, PARTIAL, or FAILED")
    lessons: str = Field(..., description="Institutional lessons learned")
    tacticsAttempted: Optional[List[str]] = Field(default_factory=list)
    whatWorked: Optional[List[str]] = Field(default_factory=list)
    whatFailed: Optional[List[str]] = Field(default_factory=list)
    tradeoffs: Optional[str] = ""

class MemoryRecallRequestSchema(BaseModel):
    case_id: Optional[str] = Field(None, description="Optional active case ID")
    condition_vector: ConditionVectorSchema = Field(..., description="Structured multi-dimensional condition vector")
    top_k: int = Field(6, ge=1, le=25, description="Number of precedent memories to recall")
    query: Optional[str] = Field(None, description="Optional textual semantic query context")
    category: Optional[str] = Field(None, description="Optional procurement category filter")

class RetrievalMetadataSchema(BaseModel):
    method: str = Field("vector_similarity", description="Retrieval method (e.g. vector_similarity, hindsight_hybrid)")
    top_k: int = Field(6, description="Requested top_k results count")
    bank_id: str = Field("negotiation-memory", description="Active Hindsight memory bank")
    total_evaluated: Optional[int] = Field(15, description="Total pool evaluated")

class MemoryRecallResponseSchema(BaseModel):
    memories: List[HistoricalMemorySchema]
    retrieval_metadata: RetrievalMetadataSchema

class MemoryClusterSchema(BaseModel):
    id: str
    theme: str
    category: str
    memoryCount: int
    representativeDeal: str
    dominantCondition: str
    commonTactics: List[str]

class MemoryTimelineEventSchema(BaseModel):
    id: str
    date: str
    counterparty: str
    category: str
    event: str
    conditionShift: str
    outcome: str
