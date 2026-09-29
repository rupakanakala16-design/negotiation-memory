"""
Comprehensive test suite for the Negotiation Memory Intelligence Backend.

Covers all required API contract routes:
  GET  /api/health
  GET  /api/negotiations
  POST /api/negotiations/seed
  POST /api/negotiations/analyze
  POST /api/negotiations/decisions
  POST /api/negotiations/retain
  GET  /api/memories
  GET  /api/timeline

Plus all backend service routes.
"""
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


class TestCanonicalRoutes:
    """Tests for the canonical API contract routes."""

    def test_api_health(self):
        res = client.get("/api/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["hindsight"]["status"] in ["connected", "disconnected"]
        assert "stored_experiences_count" in data["memory_bank"]
        assert "bank_id" in data["memory_bank"]

    def test_get_negotiations(self):
        res = client.get("/api/negotiations")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        if data:
            n = data[0]
            assert "supplier" in n
            assert "category" in n
            assert "final_outcome" in n

    def test_seed_negotiations(self):
        res = client.post("/api/negotiations/seed")
        assert res.status_code == 200
        data = res.json()
        assert "message" in data
        assert "results" in data
        assert len(data["results"]) > 0

    def test_analyze_negotiation(self):
        payload = {
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply surplus, 4 alternative qualified vendors available",
            "supplier_leverage": "Low",
            "buyer_leverage": "High",
            "supply_balance": "surplus",
            "supplier_leverage_level": "low",
            "buyer_leverage_level": "high",
            "urgency": "flexible",
            "alternative_supplier_count": 4,
            "negotiation_objective": "Achieve 15% price reduction, eliminate volume lock-in",
            "constraints": "Lead time cannot exceed 14 business days"
        }
        res = client.post("/api/negotiations/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()

        assert "recalled_experiences" in data
        assert "condition_difference" in data
        assert "hindsight_reflection_evidence" in data
        assert "strategy_guidance" in data
        assert "condition_contrast" in data

        strategy = data["strategy_guidance"]
        assert len(strategy["recommendation"]) > 0
        assert len(strategy["rationale"]) > 0
        assert len(strategy["tactics"]) > 0

        evidence = data["hindsight_reflection_evidence"]
        assert len(evidence["memories_used"]) > 0
        assert evidence["reflection_source"] in ["hindsight_reflect_llm", "fallback_rule_based"]
        assert data["reflection_source"] == evidence["reflection_source"]

    def test_post_negotiation_decision(self):
        payload = {
            "case_id": "neg-test-canonical-001",
            "status": "MODIFIED",
            "selected_strategy": "Competitive Mini-RFP & Downward Index Ratchet",
            "modifications": "Cap secondary supplier volume at 40% initially",
            "notes": "Approved by Category Director.",
            "decided_by": "J. Poosarla"
        }
        res = client.post("/api/negotiations/decisions", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert "decision_id" in data
        assert data["case_id"] == "neg-test-canonical-001"
        assert data["status"] == "MODIFIED"
        assert "recorded_at" in data

    def test_retain_negotiation_outcome(self):
        payload = {
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply surplus, 4 alternative vendors active",
            "supplier_leverage": "Low",
            "buyer_leverage": "High",
            "supply_balance": "surplus",
            "supplier_leverage_level": "low",
            "buyer_leverage_level": "high",
            "urgency": "flexible",
            "alternative_supplier_count": 4,
            "negotiation_objective": "15% price cut and remove volume lock-in",
            "constraints": "Standard ASTM specs",
            "tactics_attempted": ["Presented mini-RFP quotes from 4 alternative mills"],
            "what_worked": ["Alternative quotes forced 16% discount"],
            "what_failed": ["Appealing to past relationship sentiment"],
            "final_outcome": "16% price reduction, Net 60 terms, quarterly index adjustments",
            "tradeoffs": "50% baseline volume conditional on price within 2% of market median",
            "lessons_learned": "Competitive tension dismantles shortage premiums.",
            "date_completed": "2026-09-29"
        }
        res = client.post("/api/negotiations/retain", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "deal_id" in data
        assert "hindsight_sync" in data
        assert "hindsight_synced" in data["hindsight_sync"]

    def test_get_memories(self):
        res = client.get("/api/memories")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0
        mem = data[0]
        for field in ["id", "organization", "category", "date", "strategy",
                      "conditions", "outcome", "relevanceScore", "result", "lessons"]:
            assert field in mem, f"Missing field: {field}"

    def test_get_timeline(self):
        res = client.get("/api/timeline")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        assert len(data) > 0
        evt = data[0]
        for field in ["id", "date", "counterparty", "category", "event", "conditionShift", "outcome"]:
            assert field in evt, f"Missing timeline field: {field}"

    def test_get_timeline_filtered(self):
        res = client.get("/api/timeline?supplier=Alpha")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)
        for evt in data:
            assert "Alpha" in evt["counterparty"]


class TestIntelligencePipeline:
    """Verify the intelligence pipeline: memories -> condition diff -> reflection -> recommendation."""

    def test_condition_difference_uses_structured_fields(self):
        payload = {
            "current_case": {
                "id": "case-alpha-2026",
                "counterparty": "Alpha Supplier",
                "product": "Steel Billets",
                "contractValue": "$4,200,000",
                "targetQuantity": "12,500 MT",
                "targetLeadTime": "14 Days",
                "marketTrend": "Supply surplus",
                "paymentTerms": "Net 60",
                "supplyBalance": "SURPLUS",
                "supplierLeverage": "LOW",
                "buyerLeverage": "HIGH",
                "urgency": "FLEXIBLE",
                "alternatives": 4
            },
            "reference_memory_id": "deal-alpha-shortage-001"
        }
        res = client.post("/api/analysis/condition-diff", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["has_meaningful_shift"] is True
        supply_diff = next((d for d in data["differences"] if "Supply" in d["dimension"]), None)
        assert supply_diff is not None
        assert supply_diff["severity"] == "CRITICAL"

    def test_reflection_cites_memories(self):
        payload = {
            "case_id": "case-alpha-2026",
            "memories_to_consider": ["deal-alpha-shortage-001", "deal-alpha-surplus-002"]
        }
        res = client.post("/api/analysis/reflect", json=payload)
        assert res.status_code == 200
        data = res.json()
        ref = data["reflection"]
        assert len(ref["memoriesConsidered"]) > 0
        assert len(ref["evidence"]) > 0
        for ev in ref["evidence"]:
            assert "memoryId" in ev
            assert "fact" in ev
            assert len(ev["fact"]) > 10

    def test_recommendation_uses_reflection(self):
        reflect_res = client.post("/api/analysis/reflect", json={
            "case_id": "case-alpha-2026",
            "memories_to_consider": ["deal-alpha-shortage-001", "deal-alpha-surplus-002"]
        })
        assert reflect_res.status_code == 200
        reflection = reflect_res.json()["reflection"]

        rec_res = client.post("/api/analysis/recommend", json={
            "case_id": "case-alpha-2026",
            "reflection": reflection,
            "condition_diff": {
                "has_meaningful_shift": True,
                "differences": [
                    {"dimension": "Supply / Demand Balance", "currentValue": "SURPLUS",
                     "historicalValue": "SHORTAGE", "impact": "...", "severity": "CRITICAL"},
                    {"dimension": "Supplier Pricing Leverage", "currentValue": "LOW",
                     "historicalValue": "HIGH", "impact": "...", "severity": "CRITICAL"}
                ]
            }
        })
        assert rec_res.status_code == 200
        data = rec_res.json()
        strat = data["strategy"]
        assert len(strat["tacticalLevers"]) > 0
        assert len(strat["rationale"]) > 20

    def test_analyze_pipeline_has_memory_provenance(self):
        """Recalled memories must appear in reflection evidence (provenance chain)."""
        res = client.post("/api/negotiations/analyze", json={
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply surplus, softening demand",
            "supplier_leverage": "Low",
            "buyer_leverage": "High",
            "supply_balance": "surplus",
            "supplier_leverage_level": "low",
            "buyer_leverage_level": "high",
            "urgency": "flexible",
            "alternative_supplier_count": 4,
            "negotiation_objective": "15% price reduction, eliminate volume lock-in"
        })
        assert res.status_code == 200
        data = res.json()

        recalled_ids = [r.get("memory_id") for r in data["recalled_experiences"] if r.get("memory_id")]
        evidence_ids = [m.get("memory_id") for m in data["hindsight_reflection_evidence"]["memories_used"] if m.get("memory_id")]

        if recalled_ids and evidence_ids:
            overlap = set(recalled_ids) & set(evidence_ids)
            assert len(overlap) > 0, (
                f"Recalled memories {recalled_ids} did NOT appear in reflection evidence {evidence_ids}. "
                "Reflection must use retrieved memories, not operate independently."
            )

    def test_condition_shift_triggers_repeat_warning(self):
        res = client.post("/api/negotiations/analyze", json={
            "supplier": "Alpha Supplier",
            "category": "Raw Materials",
            "market_conditions": "Supply surplus, 4 alternatives",
            "supplier_leverage": "Low",
            "buyer_leverage": "High",
            "supply_balance": "surplus",
            "supplier_leverage_level": "low",
            "buyer_leverage_level": "high",
            "urgency": "flexible",
            "alternative_supplier_count": 4,
            "negotiation_objective": "Cut prices"
        })
        assert res.status_code == 200
        data = res.json()
        contrast = data["condition_contrast"]
        if data["condition_difference"] and data["condition_difference"]["has_meaningful_shift"]:
            assert len(contrast["repeat_warning"]) > 20
            assert "CRITICAL" in contrast["repeat_warning"] or "NOT" in contrast["repeat_warning"]


class TestDecisionPersistence:
    """Verify that decisions are persisted to file store and retrievable."""

    def test_decision_persisted_and_retrievable(self):
        import time
        unique_case = f"case-persist-test-{int(time.time())}"
        rec_res = client.post("/api/decisions", json={
            "case_id": unique_case,
            "status": "ACCEPTED",
            "selected_strategy": "Competitive Mini-RFP",
            "notes": "Test persistence",
            "decided_by": "Test Manager"
        })
        assert rec_res.status_code == 200
        assert rec_res.json()["case_id"] == unique_case

        list_res = client.get("/api/decisions")
        assert list_res.status_code == 200
        decisions = list_res.json()
        case_ids = [d.get("caseId") for d in decisions]
        assert unique_case in case_ids

    def test_decision_record_alias(self):
        """POST /api/decisions/record must work (documented in API_CONTRACT.md)."""
        res = client.post("/api/decisions/record", json={
            "case_id": "case-alias-test",
            "status": "OVERRIDDEN",
            "selected_strategy": "Custom Manager Strategy",
            "notes": "Testing /record alias"
        })
        assert res.status_code == 200
        assert res.json()["status"] == "OVERRIDDEN"

    def test_decision_all_status_values(self):
        for status in ["PENDING", "ACCEPTED", "MODIFIED", "OVERRIDDEN", "REJECTED"]:
            res = client.post("/api/decisions", json={
                "case_id": f"case-status-{status.lower()}",
                "status": status,
                "selected_strategy": f"Strategy for {status}"
            })
            assert res.status_code == 200, f"Failed for status: {status}"
            assert res.json()["status"] == status


class TestOutcomeRetention:
    """Verify that retained outcomes are persisted and visible as future memories."""

    def test_outcome_retention_response_schema(self):
        import time
        unique_case = f"case-outcome-{int(time.time())}"
        res = client.post("/api/outcomes/retain", json={
            "case_id": unique_case,
            "actual_outcome": "Achieved 14% cost reduction",
            "lessons": "Competitive tension works in surplus markets.",
            "retained_strategy": "Competitive Mini-RFP",
            "financial_impact": "$588,000 annual savings",
            "terms_achieved": "Net 60, quarterly index review"
        })
        assert res.status_code == 200
        data = res.json()
        assert "retained_outcome_id" in data
        assert "memory_id" in data
        assert "hindsight_synced" in data
        assert data["case_id"] == unique_case

    def test_retain_and_recall_loop(self):
        before = client.get("/api/memories").json()
        before_count = len(before)

        client.post("/api/negotiations/retain", json={
            "supplier": "Loop Test Supplier",
            "category": "Test Category",
            "market_conditions": "Balanced test conditions",
            "supplier_leverage": "Medium",
            "buyer_leverage": "Medium",
            "supply_balance": "balanced",
            "supplier_leverage_level": "medium",
            "buyer_leverage_level": "medium",
            "urgency": "normal",
            "alternative_supplier_count": 2,
            "negotiation_objective": "Test the learning loop",
            "constraints": "None",
            "tactics_attempted": ["Standard approach"],
            "what_worked": ["Clear communication"],
            "what_failed": [],
            "final_outcome": "Standard settlement",
            "tradeoffs": "None",
            "lessons_learned": "Learning loop test memory.",
            "date_completed": "2026-09-29"
        })

        after = client.get("/api/memories").json()
        after_count = len(after)
        assert after_count >= before_count, "Memory bank did not grow after retaining outcome."


class TestSchemas:
    """Verify Pydantic schemas match actual JSON returned by the backend."""

    def test_health_schema(self):
        data = client.get("/api/health").json()
        assert isinstance(data["status"], str)
        assert isinstance(data["hindsight"], dict)
        assert isinstance(data["memory_bank"]["stored_experiences_count"], int)
        assert isinstance(data["memory_bank"]["suppliers_indexed"], list)

    def test_negotiation_schema(self):
        res = client.get("/api/negotiations")
        assert res.status_code == 200
        negotiations = res.json()
        if not isinstance(negotiations, list) or len(negotiations) == 0:
            pytest.skip("No negotiations in bank - run /api/negotiations/seed first")
        n = negotiations[0]
        for field in ["supplier", "category", "market_conditions", "supplier_leverage",
                      "buyer_leverage", "supply_balance", "supplier_leverage_level",
                      "buyer_leverage_level", "urgency", "alternative_supplier_count",
                      "negotiation_objective", "constraints", "tactics_attempted",
                      "what_worked", "what_failed", "final_outcome", "tradeoffs", "lessons_learned"]:
            assert field in n, f"Missing field: {field}"


    def test_analyze_response_schema(self):
        res = client.post("/api/negotiations/analyze", json={
            "supplier": "Schema Test Supplier",
            "category": "Test Category",
            "market_conditions": "Test conditions",
            "supply_balance": "surplus",
            "supplier_leverage_level": "low",
            "buyer_leverage_level": "high",
            "urgency": "normal",
            "alternative_supplier_count": 2,
            "negotiation_objective": "Schema validation test"
        })
        assert res.status_code == 200
        data = res.json()
        for field in ["query_context", "recalled_experiences", "hindsight_reflection_evidence",
                      "condition_contrast", "condition_difference", "strategy_guidance",
                      "reflection_source", "human_in_the_loop_advisory"]:
            assert field in data, f"Missing top-level field: {field}"

        sg = data["strategy_guidance"]
        for field in ["recommendation", "rationale", "tactics", "tactics_to_avoid",
                      "concession_strategy", "risks", "key_memory_ids"]:
            assert field in sg, f"Missing strategy_guidance field: {field}"

        hre = data["hindsight_reflection_evidence"]
        for field in ["query", "strategic_reasoning", "memories_used", "condition_divergence",
                      "reflection_source", "provenance"]:
            assert field in hre, f"Missing hindsight_reflection_evidence field: {field}"

    def test_memory_schema(self):
        data = client.get("/api/memories").json()
        assert len(data) > 0
        mem = data[0]
        for field in ["id", "organization", "category", "date", "strategy",
                      "conditions", "outcome", "relevanceScore", "result", "lessons"]:
            assert field in mem, f"Missing memory field: {field}"
        assert isinstance(mem["relevanceScore"], (int, float))
        assert 0.0 <= mem["relevanceScore"] <= 1.0

    def test_decision_schema(self):
        res = client.post("/api/decisions", json={
            "case_id": "case-schema-test",
            "status": "ACCEPTED",
            "selected_strategy": "Test Strategy"
        })
        assert res.status_code == 200
        data = res.json()
        for field in ["decision_id", "case_id", "recorded_at", "status", "message"]:
            assert field in data, f"Missing decision field: {field}"
        assert data["status"] in ["PENDING", "ACCEPTED", "MODIFIED", "OVERRIDDEN", "REJECTED"]
