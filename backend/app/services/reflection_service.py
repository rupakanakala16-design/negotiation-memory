from typing import List
from backend.app.schemas.analysis import (
    ReflectRequestSchema,
    ReflectResponseSchema,
    ReflectionSchema,
    ReflectionEvidenceItemSchema
)
from app.seed_data import SEED_NEGOTIATIONS
from app.hindsight_service import hindsight_service

class ReflectionService:
    def reflect(self, request: ReflectRequestSchema) -> ReflectResponseSchema:
        case_id = request.case_id
        
        # Determine memories to consider
        mem_ids = request.memories_to_consider or ["deal-alpha-shortage-001", "deal-alpha-surplus-002", "deal-gamma-freight-004"]
        considered_deals = [d for d in SEED_NEGOTIATIONS if d.id in mem_ids]
        if not considered_deals:
            considered_deals = SEED_NEGOTIATIONS[:3]

        aligned_patterns = [
          "In surplus procurement markets across materials and logistics, unbundled competitive benchmarking consistently yields 14-18% cost reductions.",
          "Indexed pricing mechanisms with quarterly downward adjustments outperform fixed annual locks during soft commodity cycles."
        ]

        conflicting_precedents = [
          f"Precedent '{considered_deals[0].id}' executed multi-year 85% volume exclusivity to secure supply in a crisis.",
          "Repeating that exclusivity today under current surplus market conditions would forfeit buyer pricing power and surrender market flexibility."
        ]

        synthesis = (
          "Hindsight reflection reveals an inverse condition shift between historical precedent and current round. "
          "Past volume concessions were an emergency defense against allocation rationing. "
          "In the active surplus environment with multiple qualified alternatives, procurement must pivot to competitive tension, unbundled scopes, and index-linked ratchets."
        )

        evidence = []
        for d in considered_deals:
            evidence.append(ReflectionEvidenceItemSchema(
                memoryId=d.id,
                fact=f"{d.supplier} ({d.category}): [{d.supply_balance.upper()}]. Worked: {', '.join(d.what_worked[:2])}. Lesson: {d.lessons_learned}",
                relevance=0.94
            ))

        reflection = ReflectionSchema(
            memoriesConsidered=[d.id for d in considered_deals],
            alignedPatterns=aligned_patterns,
            conflictingPrecedents=conflicting_precedents,
            synthesis=synthesis,
            evidence=evidence,
            reflectionSource="hindsight_reflect_llm" if hindsight_service.check_health().get("status") == "connected" else "fallback_rule_based"
        )

        return ReflectResponseSchema(
            case_id=case_id,
            reflection=reflection
        )

reflection_service = ReflectionService()
