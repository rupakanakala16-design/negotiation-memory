import logging
from typing import List, Optional

from app.models import (
    CurrentNegotiationContext,
    NegotiationAnalysisResponse,
    ConditionContrast,
    ConditionDifference,
    StrategyGuidance,
    RecalledExperience,
    CompletedNegotiation,
    HindsightReflectionEvidence
)
from app.hindsight_service import hindsight_service

logger = logging.getLogger(__name__)

def calculate_condition_difference(
    past: Optional[CompletedNegotiation],
    current: CurrentNegotiationContext
) -> ConditionDifference:
    """
    Computes structured differences between a past negotiation precedent and current negotiation conditions.
    Uses structured condition fields rather than fragile substring matching.
    """
    if not past:
        return ConditionDifference(
            past_supplier="None (First engagement)",
            current_supplier=current.supplier,
            supply_balance_shift=f"Baseline -> {current.supply_balance}",
            supplier_leverage_shift=f"Baseline -> {current.supplier_leverage_level}",
            buyer_leverage_shift=f"Baseline -> {current.buyer_leverage_level}",
            urgency_shift=f"Baseline -> {current.urgency}",
            alternative_count_shift=f"N/A -> {current.alternative_supplier_count} alternatives",
            summary=f"No prior negotiation recorded in memory bank for {current.supplier}. Establishing initial institutional baseline.",
            has_meaningful_shift=False
        )

    supply_shift = f"{past.supply_balance} -> {current.supply_balance}"
    sup_lev_shift = f"{past.supplier_leverage_level} -> {current.supplier_leverage_level}"
    buyer_lev_shift = f"{past.buyer_leverage_level} -> {current.buyer_leverage_level}"
    urg_shift = f"{past.urgency} -> {current.urgency}"
    alt_shift = f"{past.alternative_supplier_count} -> {current.alternative_supplier_count} alternatives"

    has_shift = (
        past.supply_balance != current.supply_balance or
        past.supplier_leverage_level != current.supplier_leverage_level or
        past.buyer_leverage_level != current.buyer_leverage_level or
        abs(past.alternative_supplier_count - current.alternative_supplier_count) >= 2
    )

    narrative_parts = []
    if past.supply_balance != current.supply_balance:
        narrative_parts.append(f"Supply balance shifted from {past.supply_balance.upper()} to {current.supply_balance.upper()}")
    if past.supplier_leverage_level != current.supplier_leverage_level:
        narrative_parts.append(f"Supplier leverage changed from {past.supplier_leverage_level.upper()} to {current.supplier_leverage_level.upper()}")
    if past.buyer_leverage_level != current.buyer_leverage_level:
        narrative_parts.append(f"Buyer leverage shifted from {past.buyer_leverage_level.upper()} to {current.buyer_leverage_level.upper()}")
    if past.alternative_supplier_count != current.alternative_supplier_count:
        narrative_parts.append(f"Viable alternatives moved from {past.alternative_supplier_count} to {current.alternative_supplier_count}")

    if not narrative_parts:
        summary = f"Conditions remain stable ({current.supply_balance}, {current.supplier_leverage_level} supplier leverage) compared to precedent deal '{past.id or past.supplier}'."
    else:
        summary = "; ".join(narrative_parts) + "."

    return ConditionDifference(
        past_supplier=past.supplier,
        current_supplier=current.supplier,
        supply_balance_shift=supply_shift,
        supplier_leverage_shift=sup_lev_shift,
        buyer_leverage_shift=buyer_lev_shift,
        urgency_shift=urg_shift,
        alternative_count_shift=alt_shift,
        summary=summary,
        has_meaningful_shift=has_shift
    )


class ConditionAwareNegotiationAgent:
    """
    Condition-Aware Learning Agent for Procurement Managers.
    Pipeline:
    1. Hindsight RECALL: Retrieve relevant experiences from memory bank.
    2. CONDITION DIFFERENCE: Compare structured past vs current market conditions.
    3. Hindsight REFLECT: Call reflect(response_schema=StrategyGuidance, include_facts=True).
       Hindsight reflect acts as the actual strategy generator.
    4. HUMAN IN THE LOOP: Procurement manager reviews guidance, makes decision, and retains outcome.
    """

    def analyze_negotiation(self, context: CurrentNegotiationContext) -> NegotiationAnalysisResponse:
        logger.info(f"Analyzing negotiation context for: {context.supplier} ({context.category})")

        # Step 1: Hindsight RECALL - retrieve relevant memories
        recalled_experiences: List[RecalledExperience] = hindsight_service.recall_experiences(
            supplier=context.supplier,
            category=context.category,
            query=f"Market: {context.market_conditions}. Supply Balance: {context.supply_balance}. Objective: {context.negotiation_objective}"
        )

        # Identify primary precedent
        primary_past: Optional[CompletedNegotiation] = None
        if recalled_experiences and recalled_experiences[0].structured_negotiation:
            primary_past = recalled_experiences[0].structured_negotiation

        # Step 2: Compute condition difference
        condition_diff = calculate_condition_difference(primary_past, context)

        # Step 3: Hindsight REFLECT - generate strategy via reflect(response_schema=StrategyGuidance)
        reflection_evidence, strategy_guidance = hindsight_service.reflect_negotiation_strategy(
            supplier=context.supplier,
            category=context.category,
            market_conditions=context.market_conditions,
            supplier_leverage=context.supplier_leverage,
            buyer_leverage=context.buyer_leverage,
            supply_balance=context.supply_balance,
            supplier_leverage_level=context.supplier_leverage_level,
            buyer_leverage_level=context.buyer_leverage_level,
            urgency=context.urgency,
            alternative_supplier_count=context.alternative_supplier_count,
            negotiation_objective=context.negotiation_objective,
            recalled_experiences=recalled_experiences,
            condition_difference=condition_diff,
            constraints=context.constraints
        )

        # Step 4: Condition Contrast for UI display
        condition_contrast = self._build_condition_contrast(context, recalled_experiences, condition_diff, reflection_evidence)

        return NegotiationAnalysisResponse(
            query_context=context,
            recalled_experiences=recalled_experiences,
            hindsight_reflection_evidence=reflection_evidence,
            condition_contrast=condition_contrast,
            condition_difference=condition_diff,
            strategy_guidance=strategy_guidance,
            reflection_source=reflection_evidence.reflection_source,
            human_in_the_loop_advisory="The human procurement manager retains final deal discretion. Hindsight reflection provides condition-aware precedent analysis to inform human judgment."
        )

    def _build_condition_contrast(
        self,
        current: CurrentNegotiationContext,
        recalled: List[RecalledExperience],
        condition_diff: ConditionDifference,
        reflection_evidence: HindsightReflectionEvidence
    ) -> ConditionContrast:
        if not recalled:
            return ConditionContrast(
                past_conditions="No prior negotiation recorded in Hindsight for this category/supplier.",
                current_conditions=current.market_conditions,
                past_supplier_leverage="Unknown",
                current_supplier_leverage=f"{current.supplier_leverage_level} ({current.supplier_leverage})",
                past_buyer_leverage="Unknown",
                current_buyer_leverage=f"{current.buyer_leverage_level} ({current.buyer_leverage})",
                leverage_shift_summary="Initial benchmark: Establishing baseline institutional memory.",
                repeat_warning="No historical precedent to contrast. Proceed with standard category playbook.",
                recommended_pivot="Establish initial contract parameters and retain outcome into Hindsight upon settlement.",
                condition_difference=condition_diff
            )

        primary_past: Optional[CompletedNegotiation] = recalled[0].structured_negotiation

        if primary_past:
            past_conditions = f"{primary_past.supply_balance.upper()}: {primary_past.market_conditions}"
            past_supplier_lev = f"{primary_past.supplier_leverage_level.upper()} ({primary_past.supplier_leverage})"
            past_buyer_lev = f"{primary_past.buyer_leverage_level.upper()} ({primary_past.buyer_leverage})"
            past_worked = ", ".join(primary_past.what_worked)
        else:
            past_conditions = "Prior recorded negotiation"
            past_supplier_lev = "Prior supplier leverage"
            past_buyer_lev = "Prior buyer leverage"
            past_worked = "Historical terms"

        if condition_diff.has_meaningful_shift:
            repeat_warning = (
                f"CRITICAL CONDITION SHIFT: {condition_diff.summary} "
                f"Do NOT blindly repeat historical tactics ({past_worked}). "
                f"Precedent tactics succeeded under different market balance and will backfire if reused without adaptation."
            )
            leverage_summary = (
                f"STRATEGIC SHIFT DETECTED: Precedent ({condition_diff.past_supplier}) was in [{condition_diff.supply_balance_shift}]. "
                f"Leverage shifted: Supplier [{condition_diff.supplier_leverage_shift}], Buyer [{condition_diff.buyer_leverage_shift}]."
            )
            recommended_pivot = (
                "Pivot negotiation posture to align with current leverage balance. "
                "Consult the Hindsight reflect guidance below before engaging."
            )
        else:
            repeat_warning = (
                f"Conditions are consistent with precedent ({condition_diff.summary}). "
                f"Historical playbook can be selectively leveraged."
            )
            leverage_summary = "Market conditions and leverage levels align with precedent."
            recommended_pivot = "Execute verified tactics from prior experience with disciplined performance milestones."

        return ConditionContrast(
            past_conditions=past_conditions,
            current_conditions=f"{current.supply_balance.upper()}: {current.market_conditions}",
            past_supplier_leverage=past_supplier_lev,
            current_supplier_leverage=f"{current.supplier_leverage_level.upper()} ({current.supplier_leverage})",
            past_buyer_leverage=past_buyer_lev,
            current_buyer_leverage=f"{current.buyer_leverage_level.upper()} ({current.buyer_leverage})",
            leverage_shift_summary=leverage_summary,
            repeat_warning=repeat_warning,
            recommended_pivot=recommended_pivot,
            condition_difference=condition_diff
        )

negotiation_agent = ConditionAwareNegotiationAgent()
