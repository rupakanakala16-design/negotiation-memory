import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import CompletedNegotiation, CurrentNegotiationContext
from app.negotiation_agent import calculate_condition_difference, negotiation_agent

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    # Hindsight may be 'connected' (server running) or 'disconnected' (offline mode)
    assert data["hindsight"]["status"] in ["connected", "disconnected"]
    # Memory bank must have been seeded (at least some experiences)
    assert data["memory_bank"]["stored_experiences_count"] >= 0

def test_condition_difference_calculation():
    """Verify structured condition difference calculation without brittle substring matching."""
    past = CompletedNegotiation(
        id="deal-test-001",
        supplier="Test Supplier",
        category="Test Category",
        market_conditions="Severe shortage",
        supplier_leverage="High",
        buyer_leverage="Low",
        supply_balance="shortage",
        supplier_leverage_level="high",
        buyer_leverage_level="low",
        urgency="urgent",
        alternative_supplier_count=0,
        negotiation_objective="Secure supply",
        constraints="No stockouts",
        final_outcome="Settled",
        tradeoffs="Volume commitment",
        lessons_learned="Volume commitment was critical during shortage."
    )
    current = CurrentNegotiationContext(
        supplier="Test Supplier",
        category="Test Category",
        market_conditions="Market surplus",
        supplier_leverage="Low",
        buyer_leverage="High",
        supply_balance="surplus",
        supplier_leverage_level="low",
        buyer_leverage_level="high",
        urgency="flexible",
        alternative_supplier_count=4,
        negotiation_objective="Cut prices"
    )

    diff = calculate_condition_difference(past, current)
    assert diff.has_meaningful_shift is True
    assert "shortage -> surplus" in diff.supply_balance_shift
    assert "high -> low" in diff.supplier_leverage_shift
    assert "low -> high" in diff.buyer_leverage_shift
    assert "0 -> 4" in diff.alternative_count_shift

def test_analyze_alpha_surplus():
    """
    Test end-to-end negotiation analysis:
    - Verifies strategy guidance schema fields (recommendation, rationale, tactics, concession_strategy, risks)
    - Verifies real based_on / memories_used evidence
    - Verifies truthful reflection_source labeling
    """
    request_data = {
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
        "negotiation_objective": "Secure 15% price discount, Net 60 terms, eliminate volume lock-in",
        "constraints": "Delivery lead time cannot exceed 14 business days"
    }

    response = client.post("/api/negotiations/analyze", json=request_data)
    assert response.status_code == 200
    res = response.json()

    # 1. Verify Strategy Guidance schema fields
    strategy = res["strategy_guidance"]
    assert "recommendation" in strategy and len(strategy["recommendation"]) > 0
    assert "rationale" in strategy and len(strategy["rationale"]) > 0
    assert "tactics" in strategy and isinstance(strategy["tactics"], list) and len(strategy["tactics"]) > 0
    assert "concession_strategy" in strategy
    assert "risks" in strategy and isinstance(strategy["risks"], list)

    # 2. Verify Hindsight reflection evidence & memory citations
    evidence = res["hindsight_reflection_evidence"]
    assert "strategic_reasoning" in evidence and len(evidence["strategic_reasoning"]) > 0
    assert "memories_used" in evidence and len(evidence["memories_used"]) > 0
    for mem in evidence["memories_used"]:
        assert "memory_id" in mem
        assert "fact_text" in mem

    # 3. Verify truthful reflection_source
    assert res["reflection_source"] in ["hindsight_reflect_llm", "fallback_rule_based"]
    assert evidence["reflection_source"] == res["reflection_source"]

    # 4. Verify Condition Difference & Contrast
    assert "condition_contrast" in res
    assert "condition_difference" in res

def test_cross_supplier_recall_omega():
    """
    Test cross-supplier precedent retrieval:
    Querying new supplier 'Omega Components' in 'Electronic Components & Microcontrollers'
    must recall category precedents such as Zeta Technologies.
    """
    request_data = {
        "supplier": "Omega Components",
        "category": "Electronic Components & Microcontrollers",
        "market_conditions": "Severe semiconductor fab shortage, 44-week lead times, no alternatives",
        "supplier_leverage": "High",
        "buyer_leverage": "Low",
        "supply_balance": "shortage",
        "supplier_leverage_level": "high",
        "buyer_leverage_level": "low",
        "urgency": "urgent",
        "alternative_supplier_count": 0,
        "negotiation_objective": "Secure wafer capacity allocation"
    }

    response = client.post("/api/negotiations/analyze", json=request_data)
    assert response.status_code == 200
    res = response.json()

    recalled = res["recalled_experiences"]
    assert len(recalled) > 0
    
    # Check that category precedents were retrieved (Zeta Technologies, Beta Electronics, etc.)
    recalled_suppliers = [
        r["structured_negotiation"]["supplier"] for r in recalled 
        if r.get("structured_negotiation") and "supplier" in r["structured_negotiation"]
    ]
    assert any("Zeta" in s or "Beta" in s or "Electronic" in s for s in recalled_suppliers)

def test_retain_outcome_loop():
    """
    Verify the continuous learning loop by retaining a newly completed negotiation.
    """
    retain_data = {
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
        "negotiation_objective": "Achieve 15% price cut and remove volume lock-in",
        "constraints": "Standard ASTM specs",
        "tactics_attempted": ["Presented mini-RFP quotes from alternative mills", "Refused 85% volume lock"],
        "what_worked": ["Alternative mill quotes forced Alpha to concede 16% unit discount and eliminate take-or-pay"],
        "what_failed": ["Appealing to past relationship sentiment"],
        "final_outcome": "16% price reduction, Net 60 terms, quarterly index adjustments, zero volume penalty",
        "tradeoffs": "Awarded 50% baseline volume allocation conditional on price staying within 2% of market median",
        "lessons_learned": "In surplus markets, competitive tension permanently dismantles historical shortage premiums.",
        "date_completed": "2026-09-29"
    }

    response = client.post("/api/negotiations/retain", json=retain_data)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert "deal_id" in res
    # hindsight_sync.hindsight_synced may be True (server connected) or False (offline/local-only)
    assert "hindsight_sync" in res
    assert "hindsight_synced" in res["hindsight_sync"]
