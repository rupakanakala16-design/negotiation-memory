import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health():
    """Verify backend health check."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_case_schema_and_listing():
    """Verify case listing and individual case schema."""
    # List cases
    res = client.get("/api/cases")
    assert res.status_code == 200
    cases = res.json()
    assert isinstance(cases, list)
    assert len(cases) >= 3

    # Validate case schema fields
    c = cases[0]
    required_fields = [
        "id", "counterparty", "product", "contractValue",
        "targetQuantity", "targetLeadTime", "marketTrend",
        "paymentTerms", "supplyBalance", "supplierLeverage",
        "buyerLeverage", "urgency", "alternatives"
    ]
    for field in required_fields:
        assert field in c, f"Missing field: {field}"

    # Get single case
    case_id = c["id"]
    single_res = client.get(f"/api/cases/{case_id}")
    assert single_res.status_code == 200
    assert single_res.json()["id"] == case_id

    # Get case memories
    mem_res = client.get(f"/api/cases/{case_id}/memories")
    assert mem_res.status_code == 200
    assert len(mem_res.json()) > 0

def test_memory_recall_contract():
    """Verify memory recall schema and condition vector matching."""
    payload = {
        "case_id": "case-alpha-2026",
        "condition_vector": {
            "supply_balance": "SURPLUS",
            "supplier_leverage": "LOW",
            "buyer_leverage": "HIGH",
            "urgency": "FLEXIBLE",
            "alternatives": 4
        },
        "top_k": 4,
        "category": "Raw Materials"
    }

    res = client.post("/api/memory/recall", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "memories" in data
    assert "retrieval_metadata" in data
    assert len(data["memories"]) <= 4

    # Validate memory schema
    mem = data["memories"][0]
    for field in ["id", "organization", "category", "date", "strategy", "conditions", "outcome", "relevanceScore", "result", "lessons"]:
        assert field in mem, f"Missing memory field: {field}"

def test_condition_difference():
    """Verify condition difference schema and dimensional delta computation."""
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

    assert "case_id" in data
    assert "differences" in data
    assert "summary" in data
    assert data["has_meaningful_shift"] is True
    assert len(data["differences"]) >= 3

    # Validate difference schema
    diff = data["differences"][0]
    for field in ["dimension", "historicalValue", "currentValue", "impact", "severity"]:
        assert field in diff

def test_reflection():
    """Verify reflection schema and multi-memory synthesis."""
    payload = {
        "case_id": "case-alpha-2026",
        "memories_to_consider": ["deal-alpha-shortage-001", "deal-alpha-surplus-002"]
    }

    res = client.post("/api/analysis/reflect", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "case_id" in data
    assert "reflection" in data
    ref = data["reflection"]
    assert "memoriesConsidered" in ref
    assert "alignedPatterns" in ref
    assert "conflictingPrecedents" in ref
    assert "synthesis" in ref
    assert "evidence" in ref
    assert len(ref["evidence"]) > 0

def test_recommendation():
    """Verify recommendation schema and tactical levers."""
    payload = {
        "case_id": "case-alpha-2026"
    }

    res = client.post("/api/analysis/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "strategy" in data
    strat = data["strategy"]
    for field in ["title", "confidence", "rationale", "tacticalLevers", "supportingMemories", "risks"]:
        assert field in strat
    assert len(strat["tacticalLevers"]) > 0

def test_human_decision_recording():
    """Verify human decision recording preserves human-in-the-loop."""
    payload = {
        "case_id": "case-alpha-2026",
        "status": "ACCEPTED",
        "selected_strategy": "Deploy Competitive Tension & Floating Index",
        "modifications": "Cap secondary mill volume at 40%",
        "notes": "Approved by Category Director",
        "decided_by": "Marcus Vance"
    }

    res = client.post("/api/decisions", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "decision_id" in data
    assert data["case_id"] == "case-alpha-2026"
    assert data["status"] == "ACCEPTED"

def test_outcome_retention():
    """Verify outcome retention into memory bank completes learning loop."""
    payload = {
        "case_id": "case-alpha-2026",
        "actual_outcome": "Achieved 16% unit cost reduction and eliminated take-or-pay",
        "lessons": "In surplus markets, mini-RFPs dismantle historical shortage premiums.",
        "retained_strategy": "Competitive Mini-RFP & Downward Index Ratchet",
        "financial_impact": "$672,000 annualized savings"
    }

    res = client.post("/api/outcomes/retain", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "retained_outcome_id" in data
    assert "memory_id" in data
    assert data["case_id"] == "case-alpha-2026"

def test_memory_clusters_and_timeline():
    """Verify thematic clustering and timeline endpoints."""
    # Clusters
    c_res = client.get("/api/memory/clusters")
    assert c_res.status_code == 200
    clusters = c_res.json()
    assert len(clusters) >= 3

    # Timeline
    t_res = client.get("/api/memory/timeline?supplier=Alpha")
    assert t_res.status_code == 200
    timeline = t_res.json()
    assert len(timeline) >= 2
