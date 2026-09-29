from typing import List, Optional, Any, Literal
from pydantic import BaseModel, Field
from backend.app.schemas.cases import NegotiationCaseSchema

SeverityLevel = Literal["CRITICAL", "MODERATE", "NEUTRAL", "FAVORABLE"]

class ConditionDifferenceSchema(BaseModel):
    dimension: str = Field(..., description="Negotiation dimension, e.g. Supply Balance, Leverage")
    historicalValue: Any = Field(..., description="Condition in precedent deal")
    currentValue: Any = Field(..., description="Condition in active negotiation")
    impact: str = Field(..., description="Operational & commercial impact of shift")
    severity: SeverityLevel = Field("MODERATE", description="CRITICAL, MODERATE, NEUTRAL, or FAVORABLE")

class ConditionDiffRequestSchema(BaseModel):
    current_case: NegotiationCaseSchema
    reference_memory_id: Optional[str] = None

class ConditionDiffResponseSchema(BaseModel):
    case_id: str
    reference_memory_id: str
    differences: List[ConditionDifferenceSchema]
    summary: str
    has_meaningful_shift: bool
    repeat_warning: Optional[str] = None
    recommended_pivot: Optional[str] = None

class ReflectionEvidenceItemSchema(BaseModel):
    memoryId: str
    fact: str
    relevance: Optional[float] = None
    context: Optional[str] = None

class ReflectionSchema(BaseModel):
    memoriesConsidered: List[str] = Field(default_factory=list)
    alignedPatterns: List[str] = Field(default_factory=list)
    conflictingPrecedents: List[str] = Field(default_factory=list)
    synthesis: str = Field(..., description="Synthesized strategic reasoning")
    evidence: List[ReflectionEvidenceItemSchema] = Field(default_factory=list)
    reflectionSource: Optional[str] = Field("hindsight_reflect_llm")

class ReflectRequestSchema(BaseModel):
    case_id: str
    memories_to_consider: Optional[List[str]] = None
    condition_diff: Optional[dict] = None

class ReflectResponseSchema(BaseModel):
    case_id: str
    reflection: ReflectionSchema

class RecommendedStrategySchema(BaseModel):
    title: str = Field(..., description="Primary tactical recommendation title")
    confidence: float = Field(0.92, ge=0.0, le=1.0)
    rationale: str = Field(..., description="Core strategic rationale grounded in precedents")
    tacticalLevers: List[str] = Field(default_factory=list)
    supportingMemories: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)
    tacticsToAvoid: Optional[List[str]] = Field(default_factory=list)
    concessionStrategy: Optional[str] = ""

class StrategyRecommendRequestSchema(BaseModel):
    case_id: str
    reflection: Optional[ReflectionSchema] = None
    condition_diff: Optional[dict] = None

class StrategyRecommendResponseSchema(BaseModel):
    case_id: str
    strategy: RecommendedStrategySchema
    reflection_source: str = "hindsight_reflect_llm"
