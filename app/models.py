from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

SupplyBalanceType = Literal["shortage", "balanced", "surplus"]
LeverageLevelType = Literal["high", "medium", "low"]
UrgencyType = Literal["urgent", "normal", "flexible"]

class CompletedNegotiation(BaseModel):
    id: Optional[str] = None
    supplier: str = Field(..., description="Name of the supplier, e.g. Alpha Supplier")
    category: str = Field(..., description="Procurement category, e.g. Raw Materials")
    market_conditions: str = Field(..., description="Supply/demand balance, macro dynamics, alternatives")
    supplier_leverage: str = Field(..., description="High, Medium, or Low with rationale")
    buyer_leverage: str = Field(..., description="High, Medium, or Low with rationale")
    
    # Structured condition fields (not substring inferred)
    supply_balance: SupplyBalanceType = Field("balanced", description="shortage | balanced | surplus")
    supplier_leverage_level: LeverageLevelType = Field("medium", description="high | medium | low")
    buyer_leverage_level: LeverageLevelType = Field("medium", description="high | medium | low")
    urgency: UrgencyType = Field("normal", description="urgent | normal | flexible")
    alternative_supplier_count: int = Field(1, description="Number of viable alternative suppliers")

    negotiation_objective: str = Field(..., description="Primary targets (price, SLA, capacity, rebates)")
    constraints: str = Field(..., description="Operational boundaries, timeline, sole-source dependencies")
    tactics_attempted: List[str] = Field(default_factory=list, description="Tactics deployed during rounds")
    what_worked: List[str] = Field(default_factory=list, description="Specific concessions or tactics that succeeded")
    what_failed: List[str] = Field(default_factory=list, description="Tactics that backfired or yielded no value")
    final_outcome: str = Field(..., description="Contract settlement, price delta, terms achieved")
    tradeoffs: str = Field(..., description="Concessions made by buyer to secure objective")
    lessons_learned: str = Field(..., description="Institutional wisdom for future procurement managers")
    date_completed: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class CurrentNegotiationContext(BaseModel):
    supplier: str = Field(..., description="Target supplier for upcoming negotiation")
    category: str = Field(..., description="Procurement category")
    market_conditions: str = Field(..., description="Current market conditions narrative")
    supplier_leverage: str = Field("medium", description="Current supplier leverage text")
    buyer_leverage: str = Field("medium", description="Current buyer leverage text")
    
    # Structured condition fields
    supply_balance: SupplyBalanceType = Field("surplus", description="shortage | balanced | surplus")
    supplier_leverage_level: LeverageLevelType = Field("low", description="high | medium | low")
    buyer_leverage_level: LeverageLevelType = Field("high", description="high | medium | low")
    urgency: UrgencyType = Field("normal", description="urgent | normal | flexible")
    alternative_supplier_count: int = Field(3, description="Number of viable alternative suppliers")

    negotiation_objective: str = Field(..., description="Target goals for this round")
    constraints: Optional[str] = Field("", description="Current constraints (timelines, specs, alternatives)")

class ConditionDifference(BaseModel):
    past_supplier: str = ""
    current_supplier: str = ""
    supply_balance_shift: str = ""
    supplier_leverage_shift: str = ""
    buyer_leverage_shift: str = ""
    urgency_shift: str = ""
    alternative_count_shift: str = ""
    summary: str = ""
    has_meaningful_shift: bool = False

class ConditionContrast(BaseModel):
    past_conditions: str
    current_conditions: str
    past_supplier_leverage: str
    current_supplier_leverage: str
    past_buyer_leverage: str
    current_buyer_leverage: str
    leverage_shift_summary: str
    repeat_warning: str
    recommended_pivot: str
    condition_difference: Optional[ConditionDifference] = None

class StrategyGuidance(BaseModel):
    recommendation: str = Field(..., description="Primary strategic recommendation")
    rationale: str = Field(..., description="Core strategic rationale")
    tactics: List[str] = Field(default_factory=list, description="Recommended negotiation tactics")
    tactics_to_avoid: List[str] = Field(default_factory=list, description="Tactics to strictly avoid")
    concession_strategy: str = Field("", description="Guidance on concession sequencing and boundaries")
    risks: List[str] = Field(default_factory=list, description="Key operational and commercial risks")
    key_memory_ids: List[str] = Field(default_factory=list, description="Precedent memory IDs cited")
    # Compatibility aliases
    tactical_recommendation: Optional[str] = None
    recommended_tactics: Optional[List[str]] = None
    key_tradeoff_guidance: Optional[str] = None

    def model_post_init(self, __context: Any) -> None:
        if not self.tactical_recommendation:
            self.tactical_recommendation = self.recommendation
        if not self.recommended_tactics:
            self.recommended_tactics = self.tactics
        if not self.key_tradeoff_guidance:
            self.key_tradeoff_guidance = self.concession_strategy

class RecalledExperience(BaseModel):
    memory_id: Optional[str] = None
    text: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    relevance_score: Optional[float] = None
    structured_negotiation: Optional[CompletedNegotiation] = None

class HindsightEvidenceItem(BaseModel):
    memory_id: str
    fact_text: str
    memory_type: Optional[str] = None
    category: Optional[str] = None
    context: Optional[str] = None
    similarity_score: Optional[float] = None

class HindsightReflectionEvidence(BaseModel):
    query: str
    strategic_reasoning: str = Field(..., description="Strategic reasoning generated by Hindsight reflect()")
    memories_used: List[HindsightEvidenceItem] = Field(default_factory=list, description="Historical memories cited in reflect()")
    condition_divergence: str = Field(..., description="Why current conditions differ from historical cases")
    memory_bank_id: str = "negotiation-memory"
    reflect_budget: str = "low"
    source_operation: str = "Hindsight reflect(response_schema=StrategyGuidance)"
    reflection_source: str = Field("hindsight_reflect_llm", description="'hindsight_reflect_llm' or 'fallback_rule_based'")
    provenance: str = "hindsight_reflect_llm"
    fallback_warning: Optional[str] = None
    structured_strategy: Optional[Dict[str, Any]] = None

class NegotiationAnalysisResponse(BaseModel):
    query_context: CurrentNegotiationContext
    recalled_experiences: List[RecalledExperience]
    hindsight_reflection_evidence: HindsightReflectionEvidence
    condition_contrast: ConditionContrast
    condition_difference: Optional[ConditionDifference] = None
    strategy_guidance: StrategyGuidance
    reflection_source: str = "hindsight_reflect_llm"
    human_in_the_loop_advisory: str = "This analysis is for human procurement guidance. Procurement managers retain final deal discretion."

class RetainOutcomeRequest(BaseModel):
    supplier: str
    category: str
    market_conditions: str
    supplier_leverage: str
    buyer_leverage: str
    supply_balance: SupplyBalanceType = "balanced"
    supplier_leverage_level: LeverageLevelType = "medium"
    buyer_leverage_level: LeverageLevelType = "medium"
    urgency: UrgencyType = "normal"
    alternative_supplier_count: int = 1
    negotiation_objective: str
    constraints: str
    tactics_attempted: List[str] = Field(default_factory=list)
    what_worked: List[str] = Field(default_factory=list)
    what_failed: List[str] = Field(default_factory=list)
    final_outcome: str
    tradeoffs: str
    lessons_learned: str
    date_completed: Optional[str] = None
