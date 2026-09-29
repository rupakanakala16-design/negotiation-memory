from typing import List, Optional
from backend.app.schemas.analysis import (
    StrategyRecommendRequestSchema,
    StrategyRecommendResponseSchema,
    RecommendedStrategySchema,
    ReflectionSchema
)
from app.hindsight_service import hindsight_service

class RecommendationService:
    """
    Generates a strategy recommendation grounded in:
    1. The reflection synthesis (patterns, conflicting precedents, synthesis text)
    2. The condition_diff (what shifted vs history)
    3. The supporting memory IDs cited in reflection evidence

    If reflection is provided, strategy is derived from it.
    If reflection is absent, falls back to deterministic condition-based rules.
    Source is honestly labeled: 'hindsight_reflect_llm' or 'fallback_rule_based'.
    """

    def recommend(self, request: StrategyRecommendRequestSchema) -> StrategyRecommendResponseSchema:
        case_id = request.case_id
        reflection: Optional[ReflectionSchema] = request.reflection
        condition_diff: Optional[dict] = request.condition_diff

        # Extract data from condition_diff if supplied
        has_shift = False
        supply_balance = ""
        supplier_leverage = ""
        buyer_leverage = ""
        if condition_diff:
            has_shift = condition_diff.get("has_meaningful_shift", False)
            for diff in condition_diff.get("differences", []):
                dim = diff.get("dimension", "")
                if "Supply" in dim:
                    supply_balance = str(diff.get("currentValue", "")).upper()
                elif "Supplier" in dim and "Leverage" in dim:
                    supplier_leverage = str(diff.get("currentValue", "")).upper()
                elif "Buyer" in dim:
                    buyer_leverage = str(diff.get("currentValue", "")).upper()

        supporting_memories: List[str] = []
        reflection_source = "fallback_rule_based"

        # --- PATH 1: Derive strategy FROM reflection synthesis (preferred) ---
        if reflection and reflection.synthesis:
            synthesis = reflection.synthesis
            aligned = reflection.alignedPatterns or []
            conflicting = reflection.conflictingPrecedents or []
            supporting_memories = [
                e.memoryId for e in (reflection.evidence or [])
                if e.memoryId
            ]
            if not supporting_memories:
                supporting_memories = list(reflection.memoriesConsidered or [])

            reflection_source = reflection.reflectionSource or "fallback_rule_based"

            # Derive title and tactics from synthesis + aligned patterns
            if aligned:
                title = aligned[0][:80] if len(aligned[0]) > 80 else aligned[0]
            else:
                title = "Adaptive Procurement Strategy Grounded in Institutional Memory"

            # Build rationale from reflection evidence
            rationale_parts = [f"Institutional memory synthesis: {synthesis}"]
            if conflicting:
                rationale_parts.append(f"Precedent conflict: {conflicting[0]}")
            if aligned and len(aligned) > 1:
                rationale_parts.append(f"Aligned pattern: {aligned[1]}")
            rationale = " ".join(rationale_parts)

            # Build tactical levers from reflection aligned patterns
            tactical_levers = []
            if "surplus" in synthesis.lower() or supply_balance == "SURPLUS":
                tactical_levers = [
                    "Issue simultaneous RFQs to all qualified alternative suppliers.",
                    "Refuse multi-year volume lock-ins; negotiate quarterly volume review triggers.",
                    "Demand index-linked pricing with quarterly downward ratchet clauses.",
                    "Extend payment terms from Net 30 to Net 60 days.",
                    "Leverage alternative mill quotes as verified walk-away anchors."
                ]
                tactics_to_avoid = [
                    "DO NOT offer volume exclusivity or take-or-pay guarantees in surplus market.",
                    "DO NOT sign multi-year fixed-price agreements locking in today's price floors.",
                    "DO NOT treat current supplier as sole source while alternatives exist."
                ]
                concession_strategy = "Make zero concessions on volume exclusivity. Trade order predictability for price reductions."
                risks = [
                    "Supplier may offer superficial discounts with hidden delivery surcharges.",
                    "Alternative suppliers must pass quality/certification validation before volume diversion."
                ]
            elif "shortage" in synthesis.lower() or supply_balance == "SHORTAGE":
                tactical_levers = [
                    "Offer multi-year volume commitments with tiered discount thresholds to secure allocation.",
                    "Provide 12-month rolling forecast to assist supplier production planning.",
                    "Negotiate supply reserve buffers and guaranteed allocation windows.",
                    "Engage executive sponsorship to signal strategic partnership."
                ]
                tactics_to_avoid = [
                    "Avoid aggressive price ultimatums that risk supply de-prioritization.",
                    "Avoid fragmented purchasing across business units that signals low commitment."
                ]
                concession_strategy = "Trade forecast lead time and volume certainty for guaranteed allocation and price caps."
                risks = [
                    "Lock-in risk if market conditions soften during the commitment period.",
                    "Supplier may prioritize other customers if relationship is strained."
                ]
            else:
                tactical_levers = [
                    "Establish clear KPIs, delivery lead times, and payment terms (Net 60).",
                    "Maintain right to qualify secondary sources for up to 30% of category volume.",
                    "Incorporate annual productivity rebate tied to defect reduction."
                ]
                tactics_to_avoid = [
                    "Avoid long-term commitments without audited performance data."
                ]
                concession_strategy = "Grant volume scaling milestones only as delivery quality is proven."
                risks = [
                    "Complacency risk if supplier assumes guaranteed contract continuation."
                ]

            strategy = RecommendedStrategySchema(
                title=title,
                confidence=0.91 if reflection_source == "hindsight_reflect_llm" else 0.78,
                rationale=rationale,
                tacticalLevers=tactical_levers,
                tacticsToAvoid=tactics_to_avoid,
                concessionStrategy=concession_strategy,
                supportingMemories=supporting_memories[:5],
                risks=risks
            )

        # --- PATH 2: Pure deterministic fallback (no reflection provided) ---
        else:
            reflection_source = "fallback_rule_based"
            is_surplus = supply_balance == "SURPLUS" or supplier_leverage == "LOW"
            is_shortage = supply_balance == "SHORTAGE" or supplier_leverage == "HIGH"

            if is_surplus:
                strategy = RecommendedStrategySchema(
                    title="Deploy Competitive Tension, Spot Benchmarking & Floating Index Ratchet",
                    confidence=0.82,
                    rationale=(
                        "Deterministic analysis: SURPLUS supply balance with LOW supplier leverage and HIGH buyer leverage "
                        "indicates strong buyer position. Competitive benchmarking and index-linked pricing are the "
                        "appropriate posture. Historical exclusivity commitments made in shortage conditions must not be repeated."
                    ),
                    tacticalLevers=[
                        "Launch immediate mini-RFP showcasing alternative qualified supplier pricing.",
                        "Unbundle contract tiers: refuse multi-year volume lock-ins, negotiate quarterly reviews.",
                        "Demand index-linked pricing with downward ratchet protection.",
                        "Extend payment terms from Net 30 to Net 60 days."
                    ],
                    tacticsToAvoid=[
                        "DO NOT offer exclusive volume commitments in a surplus market.",
                        "DO NOT sign multi-year fixed-price agreements insulating supplier from market softening."
                    ],
                    concessionStrategy="Make zero concessions on volume exclusivity. Trade order predictability for price cuts.",
                    supportingMemories=[],
                    risks=["Supplier may offer superficial discounts with hidden delivery surcharges."]
                )
            elif is_shortage:
                strategy = RecommendedStrategySchema(
                    title="Secure Capacity Allocation & Supply Continuity via Structured Commitments",
                    confidence=0.82,
                    rationale=(
                        "Deterministic analysis: SHORTAGE supply balance with HIGH supplier leverage requires prioritizing "
                        "supply security over price optimization. Adversarial tactics risk supply de-prioritization."
                    ),
                    tacticalLevers=[
                        "Offer multi-year volume commitments with tiered discount thresholds.",
                        "Provide 12-month rolling forecast visibility to assist supplier planning.",
                        "Negotiate supply reserve buffers and contractual allocation windows."
                    ],
                    tacticsToAvoid=[
                        "Avoid aggressive spot price ultimatums that risk allocation de-prioritization."
                    ],
                    concessionStrategy="Trade forecast lead time for hard delivery guarantees.",
                    supportingMemories=[],
                    risks=["Lock-in risk if market softens during the commitment window."]
                )
            else:
                strategy = RecommendedStrategySchema(
                    title="Implement Balanced Performance-Indexed Contract with Dual-Source Safeguards",
                    confidence=0.75,
                    rationale=(
                        "Deterministic analysis: Balanced market conditions. Use historical performance data to "
                        "negotiate incremental improvements without destabilizing supplier relationships."
                    ),
                    tacticalLevers=[
                        "Establish clear KPIs, delivery lead times, and Net 60 payment terms.",
                        "Maintain right to qualify secondary sources for 30% of volume.",
                        "Incorporate annual productivity rebate linked to defect reduction."
                    ],
                    tacticsToAvoid=["Avoid long-term commitments without audited performance data."],
                    concessionStrategy="Grant volume milestones only as delivery quality is proven.",
                    supportingMemories=[],
                    risks=["Complacency risk if supplier assumes guaranteed continuation."]
                )

        return StrategyRecommendResponseSchema(
            case_id=case_id,
            strategy=strategy,
            reflection_source=reflection_source
        )

recommendation_service = RecommendationService()

