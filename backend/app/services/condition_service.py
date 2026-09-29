from typing import List, Optional
from backend.app.schemas.cases import NegotiationCaseSchema
from backend.app.schemas.analysis import (
    ConditionDifferenceSchema,
    ConditionDiffRequestSchema,
    ConditionDiffResponseSchema
)
from app.seed_data import SEED_NEGOTIATIONS

class ConditionService:
    def compute_condition_difference(self, request: ConditionDiffRequestSchema) -> ConditionDiffResponseSchema:
        current = request.current_case
        ref_id = request.reference_memory_id or "deal-alpha-shortage-001"
        
        # Look up reference deal
        past_deal = next((d for d in SEED_NEGOTIATIONS if d.id == ref_id), SEED_NEGOTIATIONS[0])

        differences: List[ConditionDifferenceSchema] = []

        # 1. Supply Balance
        past_bal = past_deal.supply_balance.upper()
        cur_bal = current.supplyBalance
        bal_sev = "CRITICAL" if past_bal != cur_bal else "NEUTRAL"
        differences.append(ConditionDifferenceSchema(
            dimension="Supply / Demand Balance",
            historicalValue=f"{past_bal} ({past_deal.market_conditions[:40]}...)",
            currentValue=f"{cur_bal} ({current.marketTrend[:40]}...)",
            impact="Reverses core pricing power and leverage between buyer and seller" if past_bal != cur_bal else "Consistent market availability",
            severity=bal_sev
        ))

        # 2. Supplier Leverage
        past_sup_lev = past_deal.supplier_leverage_level.upper()
        cur_sup_lev = current.supplierLeverage
        sup_sev = "CRITICAL" if past_sup_lev != cur_sup_lev else "NEUTRAL"
        differences.append(ConditionDifferenceSchema(
            dimension="Supplier Pricing Leverage",
            historicalValue=f"{past_sup_lev} ({past_deal.supplier_leverage[:35]}...)",
            currentValue=f"{cur_sup_lev}",
            impact="Dismantles justification for supplier exclusivity or premium margins" if past_sup_lev == "HIGH" and cur_sup_lev == "LOW" else "Consistent leverage dynamic",
            severity=sup_sev
        ))

        # 3. Buyer Leverage
        past_buyer_lev = past_deal.buyer_leverage_level.upper()
        cur_buyer_lev = current.buyerLeverage
        differences.append(ConditionDifferenceSchema(
            dimension="Buyer Bargaining Power",
            historicalValue=past_buyer_lev,
            currentValue=cur_buyer_lev,
            impact="Buyer possesses dominant position to mandate index ratchets" if cur_buyer_lev == "HIGH" else "Constrained buyer options",
            severity="FAVORABLE" if cur_buyer_lev == "HIGH" else "MODERATE"
        ))

        # 4. Viable Alternatives
        past_alts = past_deal.alternative_supplier_count
        cur_alts = current.alternatives
        alt_sev = "CRITICAL" if abs(past_alts - cur_alts) >= 2 else "NEUTRAL"
        differences.append(ConditionDifferenceSchema(
            dimension="Alternative Qualified Sources",
            historicalValue=f"{past_alts} (Sole Source)",
            currentValue=f"{cur_alts} (Multiple Pre-Qualified Mills)",
            impact="Enables immediate competitive mini-RFP auctions and credible walk-away threat",
            severity=alt_sev
        ))

        has_meaningful_shift = (past_bal != cur_bal) or (past_sup_lev != cur_sup_lev) or (cur_alts > past_alts)

        summary = (
            f"Condition shift detected vs precedent '{past_deal.id}': "
            f"Supply balance shifted from {past_bal} to {cur_bal}, supplier leverage moved from {past_sup_lev} to {cur_sup_lev}, "
            f"and available alternatives increased from {past_alts} to {cur_alts}."
        )

        repeat_warning = (
            f"CRITICAL WARNING: Do NOT blindly repeat historical strategy ({', '.join(past_deal.what_worked[:2])})! "
            f"Precedent concessions were required by shortage conditions and will needlessly forfeit buyer advantage today."
        ) if has_meaningful_shift else "Conditions are consistent; historical precedents may be applied with standard controls."

        recommended_pivot = (
            "Dismantle historical volume lock-in; deploy competitive tension via mini-RFP and negotiate downward index ratchets."
            if has_meaningful_shift else "Maintain existing contract framework with audited performance KPIs."
        )

        return ConditionDiffResponseSchema(
            case_id=current.id,
            reference_memory_id=past_deal.id,
            differences=differences,
            summary=summary,
            has_meaningful_shift=has_meaningful_shift,
            repeat_warning=repeat_warning,
            recommended_pivot=recommended_pivot
        )

condition_service = ConditionService()
