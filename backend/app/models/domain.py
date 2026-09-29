from typing import List, Optional, Dict, Any, Literal
from dataclasses import dataclass, field

SupplyBalance = Literal["SHORTAGE", "BALANCED", "SURPLUS"]
LeverageLevel = Literal["HIGH", "MEDIUM", "LOW"]
UrgencyLevel = Literal["URGENT", "NORMAL", "FLEXIBLE"]
DecisionStatus = Literal["PENDING", "ACCEPTED", "MODIFIED", "OVERRIDDEN", "REJECTED"]
SeverityLevel = Literal["CRITICAL", "MODERATE", "NEUTRAL", "FAVORABLE"]

@dataclass
class NegotiationCaseEntity:
    id: str
    counterparty: str
    product: str
    contract_value: str
    target_quantity: str
    target_lead_time: str
    market_trend: str
    payment_terms: str
    supply_balance: SupplyBalance
    supplier_leverage: LeverageLevel
    buyer_leverage: LeverageLevel
    urgency: UrgencyLevel
    alternatives: int
    category: str = "General"
    negotiation_objective: str = ""
    constraints: str = ""

@dataclass
class HistoricalMemoryEntity:
    id: str
    organization: str
    category: str
    date: str
    strategy: str
    conditions: Dict[str, Any]
    outcome: str
    relevance_score: float
    result: str
    lessons: str
    tactics_attempted: List[str] = field(default_factory=list)
    what_worked: List[str] = field(default_factory=list)
    what_failed: List[str] = field(default_factory=list)
    tradeoffs: str = ""

@dataclass
class ConditionDifferenceEntity:
    dimension: str
    historical_value: Any
    current_value: Any
    impact: str
    severity: SeverityLevel

@dataclass
class ReflectionEntity:
    memories_considered: List[str]
    aligned_patterns: List[str]
    conflicting_precedents: List[str]
    synthesis: str
    evidence: List[Dict[str, Any]]
    reflection_source: str = "hindsight_reflect_llm"

@dataclass
class RecommendedStrategyEntity:
    title: str
    confidence: float
    rationale: str
    tactical_levers: List[str]
    supporting_memories: List[str]
    risks: List[str]
    tactics_to_avoid: List[str] = field(default_factory=list)
    concession_strategy: str = ""

@dataclass
class HumanDecisionEntity:
    case_id: str
    status: DecisionStatus
    selected_strategy: str
    modifications: str
    notes: str
    timestamp: str
    id: Optional[str] = None
    decided_by: str = "Human Procurement Manager"

@dataclass
class RetainedOutcomeEntity:
    case_id: str
    decision: Any
    actual_outcome: str
    lessons: str
    retained_strategy: str
    timestamp: str
    id: Optional[str] = None
    financial_impact: str = ""
    terms_achieved: str = ""
