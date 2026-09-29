import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from backend.app.schemas.outcome import (
    OutcomeRetainRequestSchema,
    OutcomeRetainResponseSchema
)
from app.models import CompletedNegotiation
from app.hindsight_service import hindsight_service

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
OUTCOMES_FILE = DATA_DIR / "retained_outcomes.json"


class OutcomeService:
    """
    Persists concluded negotiation outcomes to the Hindsight memory bank
    AND to a local JSON file store (so outcomes are available as future historical memories
    even when Hindsight server is offline).

    The outcome is stored as a full CompletedNegotiation record in the local bank,
    making it immediately available to the recall pipeline on the next negotiation.
    """

    def _load(self) -> List[Dict[str, Any]]:
        if not OUTCOMES_FILE.exists():
            return []
        try:
            with open(OUTCOMES_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def _save_outcome_record(self, record: Dict[str, Any]) -> None:
        outcomes = self._load()
        # Deduplicate by outcome_id
        outcomes = [o for o in outcomes if o.get("retained_outcome_id") != record["retained_outcome_id"]]
        outcomes.append(record)
        with open(OUTCOMES_FILE, "w", encoding="utf-8") as f:
            json.dump(outcomes, f, indent=2)

    def retain_outcome(self, request: OutcomeRetainRequestSchema) -> OutcomeRetainResponseSchema:
        now = datetime.now(timezone.utc).isoformat()
        outcome_id = f"outcome-{request.case_id}-{int(time.time())}"
        memory_id = f"deal-{request.case_id}-{int(time.time())}"

        # Derive supplier/category from case_id (e.g. "case-alpha-2026" → "Alpha")
        # This is best-effort. Real data should supply these fields.
        raw_name = request.case_id.replace("case-", "").replace("-2026", "").replace("-", " ").title()
        derived_supplier = f"{raw_name} Supplier"

        # Build a full CompletedNegotiation so this outcome is immediately
        # recallable in future negotiations as institutional memory.
        deal = CompletedNegotiation(
            id=memory_id,
            supplier=derived_supplier,
            category="Procurement",  # generic fallback; real outcome should pass category
            market_conditions="Post-negotiation settled round.",
            supplier_leverage="Unknown",
            buyer_leverage="Unknown",
            supply_balance="balanced",
            supplier_leverage_level="medium",
            buyer_leverage_level="medium",
            urgency="normal",
            alternative_supplier_count=1,
            negotiation_objective="Retained settlement",
            constraints="Executed terms",
            tactics_attempted=[request.retained_strategy],
            what_worked=[request.actual_outcome],
            what_failed=[],
            final_outcome=request.actual_outcome,
            tradeoffs=request.terms_achieved or "Standard commercial concession",
            lessons_learned=request.lessons,
            date_completed=now[:10],
            tags=["Retained Outcome", request.case_id]
        )

        hindsight_result = hindsight_service.retain_negotiation(deal)
        is_synced = hindsight_result.get("hindsight_synced", False)

        # Persist to local outcomes file
        outcome_record = {
            "retained_outcome_id": outcome_id,
            "memory_id": memory_id,
            "case_id": request.case_id,
            "decision_id": request.decision_id,
            "actual_outcome": request.actual_outcome,
            "lessons": request.lessons,
            "retained_strategy": request.retained_strategy,
            "financial_impact": request.financial_impact or "",
            "terms_achieved": request.terms_achieved or "",
            "hindsight_synced": is_synced,
            "retained_at": now
        }
        self._save_outcome_record(outcome_record)

        return OutcomeRetainResponseSchema(
            retained_outcome_id=outcome_id,
            memory_id=memory_id,
            case_id=request.case_id,
            hindsight_synced=is_synced,
            retained_at=now,
            message=(
                f"Outcome retained into Hindsight bank '{hindsight_service.bank_id}' "
                f"and persisted locally. Memory ID: {memory_id}"
            )
        )

    def get_all_outcomes(self) -> List[Dict[str, Any]]:
        return self._load()


outcome_service = OutcomeService()
