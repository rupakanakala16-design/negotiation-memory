# Negotiation Memory — API Contract Reference

> **Version:** 2.0  
> **Last updated:** 2026-09-29  
> **Base URL:** `http://localhost:8000`  
> **OpenAPI UI:** `http://localhost:8000/docs`

All request and response bodies are JSON (`Content-Type: application/json`).

---

## Retrieval Method Transparency

All memory retrieval operations are explicitly labeled by method:

| Label | Meaning |
|-------|---------|
| `hindsight_vector_hybrid` | Real Hindsight recall (vector + keyword, requires server) |
| `heuristic_structured` | Deterministic scoring: supplier name match + category match + term overlap |
| `fallback_rule_based` | No Hindsight server; deterministic condition analysis |

**Embeddings / Vector similarity**: Genuine vector similarity is only active when the Hindsight server (`http://localhost:8888`) is running. Scores returned by the local fallback are heuristic relevance scores (0.0–1.0), NOT cosine similarity. This is documented explicitly in all API responses via `retrieval_metadata.method`.

---

## Canonical API Routes (Required by Product Spec)

```
GET  /api/health
GET  /api/negotiations
POST /api/negotiations/seed
POST /api/negotiations/analyze
POST /api/negotiations/decisions
POST /api/negotiations/retain
GET  /api/memories
GET  /api/timeline
```

---

## Health Check

### `GET /api/health`

Returns system health and Hindsight memory bank status.

**Response `200`**

```json
{
  "status": "healthy",
  "service": "Institutional Negotiation Memory & Learning Agent",
  "hindsight": {
    "status": "disconnected",
    "server_url": "http://127.0.0.1:8888",
    "bank_id": "negotiation-memory",
    "mode": "local_bank_replica",
    "error": "Hindsight server offline. Run scripts/start_hindsight.py."
  },
  "memory_bank": {
    "bank_id": "negotiation-memory",
    "stored_experiences_count": 15,
    "suppliers_indexed": ["Alpha Supplier", "Zeta Technologies", "Beta Electronics"]
  }
}
```

`hindsight.status` is `"connected"` if the Hindsight server is reachable, `"disconnected"` otherwise.

---

## Negotiations

### `GET /api/negotiations`

Returns all completed negotiation memories stored in the local bank.

**Response `200`** — array of `CompletedNegotiation`

```json
[
  {
    "id": "deal-alpha-shortage-001",
    "supplier": "Alpha Supplier",
    "category": "Raw Materials",
    "market_conditions": "Supply shortage, global logistics bottleneck",
    "supplier_leverage": "High",
    "buyer_leverage": "Low",
    "supply_balance": "shortage",
    "supplier_leverage_level": "high",
    "buyer_leverage_level": "low",
    "urgency": "urgent",
    "alternative_supplier_count": 0,
    "negotiation_objective": "Secure supply allocation at controlled price",
    "constraints": "No stockouts allowed",
    "tactics_attempted": ["Multi-year 85% volume commitment"],
    "what_worked": ["Volume commitment secured 18-month guaranteed allocation"],
    "what_failed": ["Spot price ultimatums risked de-prioritization"],
    "final_outcome": "12% discount off spot index, 18-month guaranteed allocation",
    "tradeoffs": "Accepted 85% take-or-pay obligation",
    "lessons_learned": "In shortage, volume certainty beats price aggression.",
    "date_completed": "2024-03-15",
    "tags": ["alpha supplier", "raw materials", "shortage", "procurement"]
  }
]
```

### `POST /api/negotiations/seed`

Seeds (or resets) canonical negotiation experiences into the memory bank.

**Response `200`**

```json
{
  "message": "Successfully seeded 15 canonical negotiation memories into Hindsight.",
  "bank_id": "negotiation-memory",
  "results": [...]
}
```

### `POST /api/negotiations/analyze`

**Core intelligence pipeline endpoint.**

Pipeline:
1. **RECALL** — Retrieve relevant past negotiations from memory bank
2. **CONDITION DIFFERENCE** — Compare structured past vs current conditions
3. **REFLECT** — Generate strategy via Hindsight reflect() (or deterministic fallback)
4. **RECOMMEND** — Return condition-aware strategy guidance

**Request body**

```json
{
  "supplier": "Alpha Supplier",
  "category": "Raw Materials",
  "market_conditions": "Supply surplus, softening global demand, 4 alternative mills actively quoting",
  "supplier_leverage": "Low (multiple competing mills with excess capacity)",
  "buyer_leverage": "High (4 qualified alternatives, flexible timeline)",
  "supply_balance": "surplus",
  "supplier_leverage_level": "low",
  "buyer_leverage_level": "high",
  "urgency": "flexible",
  "alternative_supplier_count": 4,
  "negotiation_objective": "Achieve 15% unit cost reduction, eliminate volume take-or-pay locks",
  "constraints": "Lead time cannot exceed 14 business days"
}
```

| Field | Type | Required | Enum |
|-------|------|----------|------|
| `supplier` | string | Yes | — |
| `category` | string | Yes | — |
| `market_conditions` | string | Yes | — |
| `supply_balance` | string | Yes | `shortage \| balanced \| surplus` |
| `supplier_leverage_level` | string | Yes | `high \| medium \| low` |
| `buyer_leverage_level` | string | Yes | `high \| medium \| low` |
| `urgency` | string | Yes | `urgent \| normal \| flexible` |
| `alternative_supplier_count` | int | Yes | ≥ 0 |
| `negotiation_objective` | string | Yes | — |
| `constraints` | string | No | — |

**Response `200`** — `NegotiationAnalysisResponse`

```json
{
  "query_context": { "...": "CurrentNegotiationContext" },
  "recalled_experiences": [
    {
      "memory_id": "deal-alpha-shortage-001",
      "text": "COMPLETED PROCUREMENT NEGOTIATION EXPERIENCE...",
      "metadata": {"supplier": "Alpha Supplier", "supply_balance": "shortage"},
      "relevance_score": 0.9,
      "structured_negotiation": { "...": "CompletedNegotiation" }
    }
  ],
  "condition_difference": {
    "past_supplier": "Alpha Supplier",
    "current_supplier": "Alpha Supplier",
    "supply_balance_shift": "shortage -> surplus",
    "supplier_leverage_shift": "high -> low",
    "buyer_leverage_shift": "low -> high",
    "urgency_shift": "urgent -> flexible",
    "alternative_count_shift": "0 -> 4 alternatives",
    "summary": "Supply balance shifted from SHORTAGE to SURPLUS; Supplier leverage changed from HIGH to LOW; Buyer leverage shifted from LOW to HIGH; Viable alternatives moved from 0 to 4.",
    "has_meaningful_shift": true
  },
  "condition_contrast": {
    "past_conditions": "SHORTAGE: Supply shortage, global logistics bottleneck...",
    "current_conditions": "SURPLUS: Supply surplus, softening global demand...",
    "past_supplier_leverage": "HIGH (High...)",
    "current_supplier_leverage": "LOW (Low...)",
    "past_buyer_leverage": "LOW (Low...)",
    "current_buyer_leverage": "HIGH (High...)",
    "leverage_shift_summary": "STRATEGIC SHIFT DETECTED: Precedent was in [shortage -> surplus]. Leverage shifted.",
    "repeat_warning": "CRITICAL CONDITION SHIFT: ... Do NOT blindly repeat historical tactics.",
    "recommended_pivot": "Pivot negotiation posture to align with current leverage balance."
  },
  "hindsight_reflection_evidence": {
    "query": "Analyze current negotiation conditions for Alpha Supplier...",
    "strategic_reasoning": "Current conditions present a SUPPLY SURPLUS...",
    "memories_used": [
      {
        "memory_id": "deal-alpha-shortage-001",
        "fact_text": "Alpha Supplier (Raw Materials): [shortage | SupLev: high]. Worked: [...]. Lesson: [...]",
        "memory_type": "experience",
        "category": "Raw Materials",
        "context": "Historical precedent stored in Hindsight bank",
        "similarity_score": 0.9
      }
    ],
    "condition_divergence": "Supply balance shifted from SHORTAGE to SURPLUS...",
    "memory_bank_id": "negotiation-memory",
    "reflect_budget": "mid",
    "source_operation": "Deterministic condition-aware analysis",
    "reflection_source": "fallback_rule_based",
    "provenance": "fallback_rule_based",
    "fallback_warning": "Hindsight reflection running in deterministic condition-analysis mode."
  },
  "strategy_guidance": {
    "recommendation": "Deploy Competitive Tension, Spot Benchmarking & Shorter Commitment Windows",
    "rationale": "Current conditions present a SUPPLY SURPLUS with low supplier leverage...",
    "tactics": [
      "Conduct a competitive mini-RFP showcasing alternative vendor quotes",
      "Unbundle contract tiers: Refuse multi-year volume locks",
      "Demand index-linked pricing tied to public commodity indices",
      "Extend payment terms from Net 30 to Net 60/90 days"
    ],
    "tactics_to_avoid": [
      "DO NOT offer exclusive volume commitments in a surplus market",
      "DO NOT sign multi-year fixed-price agreements"
    ],
    "concession_strategy": "Make zero concessions on volume exclusivity.",
    "risks": ["Supplier may offer superficial discounts with hidden delivery fees."],
    "key_memory_ids": ["deal-alpha-shortage-001"],
    "tactical_recommendation": "Deploy Competitive Tension...",
    "recommended_tactics": ["..."],
    "key_tradeoff_guidance": "Make zero concessions..."
  },
  "reflection_source": "fallback_rule_based",
  "human_in_the_loop_advisory": "The human procurement manager retains final deal discretion."
}
```

**`reflection_source` values:**

| Value | Meaning |
|-------|---------|
| `hindsight_reflect_llm` | Hindsight `reflect()` called with LLM provider |
| `fallback_rule_based` | Deterministic condition-analysis fallback |

---

### `POST /api/negotiations/decisions`

Persist human procurement manager decision for a negotiation.

**Request body**

```json
{
  "case_id": "neg-alpha-2026",
  "status": "MODIFIED",
  "selected_strategy": "Competitive Mini-RFP & Downward Index Ratchet",
  "modifications": "Cap secondary mill volume at 40%",
  "notes": "Approved by Category Director",
  "decided_by": "J. Poosarla"
}
```

**Fields persisted:**
- `case_id` — negotiation/case reference
- `status` — `PENDING | ACCEPTED | MODIFIED | OVERRIDDEN | REJECTED`
- `selected_strategy` — adopted strategy (possibly modified from recommendation)
- `modifications` — manager tactical adjustments
- `notes` — decision rationale
- `decided_by` — procurement executive name
- `timestamp` — auto-generated ISO 8601 UTC
- `decision_id` — auto-generated unique ID

**Response `200`**

```json
{
  "decision_id": "dec-neg-alpha-2026-1727596800",
  "case_id": "neg-alpha-2026",
  "recorded_at": "2026-09-29T09:00:00+00:00",
  "status": "MODIFIED",
  "message": "Discretionary procurement decision recorded and persisted."
}
```

Also accessible as:
- `POST /api/decisions` (shorthand)
- `POST /api/decisions/record` (documented in earlier API_CONTRACT)

---

### `POST /api/negotiations/retain`

Retains a completed negotiation outcome into the memory bank. Completes the continuous learning loop:

```
Negotiate → RETAIN → future RECALL → REFLECT → new RECOMMENDATION
```

**Request body** — same as `CompletedNegotiation` minus auto-generated fields

**Response `200`**

```json
{
  "success": true,
  "message": "Negotiation outcome for 'Alpha Supplier' successfully retained.",
  "deal_id": "deal-alpha-supplier-1727596800000",
  "hindsight_sync": {
    "success": true,
    "deal_id": "deal-alpha-supplier-...",
    "supplier": "Alpha Supplier",
    "hindsight_synced": false,
    "hindsight_response": {"status": "stored_locally_pending_hindsight_server_sync"},
    "stored_content_preview": "COMPLETED PROCUREMENT NEGOTIATION EXPERIENCE..."
  }
}
```

`hindsight_synced: true` means live server sync; `false` means local-only (still fully persistent and recallable).

---

## Memories

### `GET /api/memories`

Returns flat list of all historical negotiation memories in the local bank.

**Retrieval method:** Structured dump — no vector/semantic similarity applied. Returns all stored `CompletedNegotiation` records.

**Response `200`** — array of `HistoricalMemory`

```json
[
  {
    "id": "deal-alpha-shortage-001",
    "organization": "Alpha Supplier",
    "category": "Raw Materials",
    "date": "2024-03-15",
    "strategy": "Multi-year 85% volume commitment",
    "conditions": {
      "supplyBalance": "SHORTAGE",
      "supplierLeverage": "HIGH",
      "buyerLeverage": "LOW",
      "alternatives": 0,
      "marketTrend": "Supply shortage, global logistics bottleneck"
    },
    "outcome": "12% discount off spot index, 18-month guaranteed allocation",
    "relevanceScore": 0.91,
    "result": "SUCCESS",
    "lessons": "In shortage, volume certainty beats price aggression.",
    "tacticsAttempted": ["Multi-year 85% volume commitment"],
    "whatWorked": ["Volume commitment secured guaranteed allocation"],
    "whatFailed": ["Spot price ultimatums risked de-prioritization"],
    "tradeoffs": "Accepted 85% take-or-pay obligation"
  }
]
```

---

### `GET /api/timeline`

Returns chronological timeline of institutional negotiation events.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `supplier` | string | Optional filter by counterparty name |

**Response `200`** — array of `MemoryTimelineEvent`

```json
[
  {
    "id": "tl-1",
    "date": "2024-01-25",
    "counterparty": "Zeta Technologies",
    "category": "Electronic Components",
    "event": "Wafer Fab Shortage Crisis",
    "conditionShift": "Shortage / High Supplier Leverage",
    "outcome": "Secured 100% allocation via 12-month NCNR commitment"
  }
]
```

---

## Cases (Frontend integration)

### `GET /api/cases`

Returns active negotiation cases (for frontend UI).

### `GET /api/cases/{case_id}`

Returns a single case by ID.

### `GET /api/cases/{case_id}/memories`

Returns top-K historical memories relevant to a case.

---

## Memory Recall (Detailed)

### `POST /api/memory/recall`

Recall precedent memories by condition vector.

**Retrieval method**: `hindsight_vector_hybrid` if server connected, `heuristic_structured` otherwise.

**Request body**

```json
{
  "case_id": "case-alpha-2026",
  "condition_vector": {
    "supply_balance": "SURPLUS",
    "supplier_leverage": "LOW",
    "buyer_leverage": "HIGH",
    "urgency": "FLEXIBLE",
    "alternatives": 4
  },
  "category": "Raw Materials",
  "top_k": 6
}
```

**Response `200`** — `MemoryRecallResponse`

---

## Analysis

### `POST /api/analysis/condition-diff`

Computes dimensional condition differences between historical precedent and current case.

### `POST /api/analysis/reflect`

Synthesizes patterns across recalled memories via Hindsight reflect() or deterministic fallback.

### `POST /api/analysis/recommend`

Generates strategy recommendation grounded in reflection synthesis and condition diff.
When `reflection` is provided, strategy derives from its synthesis.
When absent, falls back to deterministic condition-based rules.

---

## Decisions

### `POST /api/decisions`

Record human procurement decision (file-persisted, survives restarts).

### `POST /api/decisions/record`

Alias for `POST /api/decisions` (documented in earlier API_CONTRACT.md).

### `GET /api/decisions`

List all persisted decisions.

---

## Outcomes

### `POST /api/outcomes/retain`

Retain concluded negotiation outcome into memory bank and local file store.

---

## Error Responses

| Status | Body | Meaning |
|--------|------|---------|
| `404` | `{"detail": "Case '{id}' not found."}` | Unknown case ID |
| `422` | Pydantic validation error | Malformed request body |
| `500` | `{"detail": "Internal server error"}` | Unexpected backend failure |

---

## Postman Quick Reference

```
# Canonical Required Routes
GET  http://localhost:8000/api/health
GET  http://localhost:8000/api/negotiations
POST http://localhost:8000/api/negotiations/seed
POST http://localhost:8000/api/negotiations/analyze
POST http://localhost:8000/api/negotiations/decisions
POST http://localhost:8000/api/negotiations/retain
GET  http://localhost:8000/api/memories
GET  http://localhost:8000/api/timeline

# Case & Memory Routes
GET  http://localhost:8000/api/cases
GET  http://localhost:8000/api/cases/case-alpha-2026
GET  http://localhost:8000/api/cases/case-alpha-2026/memories
POST http://localhost:8000/api/memory/recall

# Analysis Routes
POST http://localhost:8000/api/analysis/condition-diff
POST http://localhost:8000/api/analysis/reflect
POST http://localhost:8000/api/analysis/recommend

# Decision Routes (all equivalent)
POST http://localhost:8000/api/decisions
POST http://localhost:8000/api/decisions/record
POST http://localhost:8000/api/negotiations/decisions
GET  http://localhost:8000/api/decisions

# Outcome Route (both equivalent)
POST http://localhost:8000/api/outcomes/retain
POST http://localhost:8000/api/negotiations/retain
```

Interactive docs: `http://localhost:8000/docs` (FastAPI Swagger UI)
