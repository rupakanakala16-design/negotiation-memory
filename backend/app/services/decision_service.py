import json
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, Dict, Any

from backend.app.schemas.decision import (
    DecisionRecordRequestSchema,
    DecisionRecordResponseSchema,
    HumanDecisionSchema
)

DATA_DIR = Path("data")
DATA_DIR.mkdir(exist_ok=True)
DECISIONS_FILE = DATA_DIR / "human_decisions.json"


class DecisionService:
    """
    Persists human procurement manager decisions to a JSON file store.
    Decisions survive process restarts and are available as future retrieval context.

    Fields persisted:
    - negotiation_id / case_id
    - human decision status (ACCEPTED | MODIFIED | OVERRIDDEN | REJECTED | PENDING)
    - selected / modified strategy
    - notes
    - decided_by
    - timestamp (ISO 8601 UTC)
    """

    def _load(self) -> Dict[str, Any]:
        if not DECISIONS_FILE.exists():
            return {}
        try:
            with open(DECISIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}

    def _save(self, store: Dict[str, Any]) -> None:
        with open(DECISIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(store, f, indent=2)

    def record_decision(self, request: DecisionRecordRequestSchema) -> DecisionRecordResponseSchema:
        now = datetime.now(timezone.utc).isoformat()
        decision_id = f"dec-{request.case_id}-{int(time.time())}"

        decision = HumanDecisionSchema(
            id=decision_id,
            caseId=request.case_id,
            status=request.status,
            selectedStrategy=request.selected_strategy,
            modifications=request.modifications or "",
            notes=request.notes or "",
            timestamp=now,
            decidedBy=request.decided_by or "Human Procurement Manager"
        )

        store = self._load()
        store[request.case_id] = decision.model_dump()
        self._save(store)

        return DecisionRecordResponseSchema(
            decision_id=decision_id,
            case_id=request.case_id,
            recorded_at=now,
            status=request.status,
            message="Discretionary procurement decision recorded and persisted."
        )

    def get_decision(self, case_id: str) -> Optional[HumanDecisionSchema]:
        store = self._load()
        data = store.get(case_id)
        if data:
            return HumanDecisionSchema(**data)
        return None

    def get_all_decisions(self) -> list:
        store = self._load()
        return list(store.values())


decision_service = DecisionService()
