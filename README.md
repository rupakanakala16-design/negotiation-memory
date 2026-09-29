# Institutional Negotiation Memory & Learning Agent

> A condition-aware **Institutional Negotiation Memory & Learning System** for human procurement and category managers, powered by **Vectorize Hindsight** (`retain`, `recall`, `reflect`) and **FastAPI**.

[![Python 3.11](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com)
[![Hindsight](https://img.shields.io/badge/Memory_System-Vectorize_Hindsight_0.10.1-blueviolet.svg)](https://hindsight.vectorize.io/)
[![LLM Provider](https://img.shields.io/badge/Hindsight_LLM-Groq_%2F_openai--gpt--oss--20b-orange.svg)](https://groq.com)
[![Tests](https://img.shields.io/badge/Tests-5%20Passed-brightgreen.svg)](#)

---

## 1. Problem

Enterprise procurement teams suffer from severe **institutional memory loss** and **rigid playbook repetition**:
- When experienced category managers leave, their tactical insights, supplier concessions, and failed approaches depart with them.
- New buyers inherit static contract archives that record *what* was agreed, but not *why* it worked or *under what market conditions* it was negotiated.
- Crucially, buyers frequently make the catastrophic mistake of **blindly repeating past winning strategies** without recognizing that the macro market balance, supplier leverage, or capacity constraints have fundamentally inverted.

---

## 2. Solution

The **Institutional Negotiation Memory & Learning Agent** acts as an institutional memory cockpit for procurement professionals:
- Retains complete historical negotiation records (market conditions, tactics attempted, what worked, what failed, final outcomes, tradeoffs, and key lessons).
- Evaluates upcoming negotiations by retrieving historical precedents using **Hindsight RECALL**.
- Analyzes condition shifts by evaluating historical precedents against current conditions, generating grounded strategic reasoning and explicit condition divergence warnings.
- Preserves the **human procurement manager as the sole and final decision maker**.
- Continuously learns by **retaining** newly completed outcomes back into Hindsight to inform all future negotiations.

---

## 3. Why Hindsight?

Unlike general vector databases or simple similarity caches, **Vectorize Hindsight** provides a purpose-built memory lifecycle:
1. **Bi-temporal & Structured Memory Retain (`Hindsight.retain`)**: Indexes complex, multi-attribute experiences (supplier leverage, constraints, tactics) into dedicated memory banks (`negotiation-memory`).
2. **Hybrid Semantic & Reranked Recall (`Hindsight.recall`)**: Retrieves relevant precedents combining semantic vectors, keyword filters, and rerank scores.
3. **Memory-Grounded Strategic Analysis (`Hindsight.reflect` / Condition Analysis)**: Grounds strategic guidance in authentic historical precedents from the memory bank (*"Given current negotiation conditions, what strategy should the procurement manager consider and why?"*) and exposes the exact memory evidence used.

---

## 4. Architecture

```
   Procurement Manager (Human Decision Maker)
                 │
                 ▼
       Executive Web Cockpit (HTML / Vanilla CSS / JS)
                 │
                 ▼
       FastAPI Application Backend (app/main.py)
                 │
                 ▼
       Negotiation Agent & Condition-Aware Engine (app/negotiation_agent.py)
                 │
                 ▼
       Vectorize Hindsight Service (app/hindsight_service.py)
                 │
   ┌─────────────┴─────────────┐
   │                           │
[ RECALL ]                 [ REFLECT ]
Query historical           Reason over memory bank
experiences & facts        & detect condition divergence
   │                           │
   └─────────────┬─────────────┘
                 ▼
     Hindsight Memory Bank: 'negotiation-memory'
                 ▲
                 │
             [ RETAIN ]
        Persist newly settled
        negotiation outcomes
```

---

## 5. The Hindsight Learning Loop

```
1. RETAIN historical negotiation experiences into Hindsight memory bank
        ↓
2. RECALL relevant precedents and facts for the current supplier/category
        ↓
3. REFLECT over the memory bank:
   "Given the current negotiation conditions, what strategy should the procurement manager consider and why?"
        ↓
4. Strategic Reasoning + Divergence Warning + Cited Evidence returned
        ↓
5. Human Procurement Manager evaluates guidance and makes final deal decision
        ↓
6. RETAIN the completed negotiation outcome back into Hindsight
        ↓
7. Future negotiations immediately benefit from the newly learned experience
```

---

## 6. Working Prototype Description

### What is Built & Operational Today:
- **FastAPI Core (`app/main.py`)**: High-performance REST API handling `/api/negotiations/analyze`, `/api/negotiations/retain`, `/api/negotiations`, and `/api/health`.
- **Hindsight Integration (`app/hindsight_service.py`)**: Direct client integration with Vectorize Hindsight 0.10.1 (`hindsight-client`), featuring isolated thread execution to prevent event loop contention across frameworks.
- **Memory-Grounded Strategy Analysis**: Exposes real Hindsight recalled memory IDs, cited precedents, condition divergence notes, and tactical reasoning.
- **Executive Procurement Cockpit (`frontend/`)**: Modern dark glassmorphic UI featuring a 7-step demonstration progress ribbon, interactive strategy advisor, condition contrast matrix, visible reflection evidence cards, and deal outcome retention workflow.
- **Automated Audit Suite (`tests/test_hindsight_audit.py`)**: Comprehensive test suite verifying health, Alpha surplus reflection, and outcome retention.

---

## 7. The Canonical Demonstration Scenario

### Past Historical Case (Stored in Hindsight):
* **Supplier:** Alpha Supplier
* **Category:** Raw Materials
* **Historical Market:** Severe supply shortage, global logistics bottleneck, single-source dependency.
* **Leverage:** Supplier Leverage = High, Buyer Leverage = Low.
* **Tactic that Worked:** Multi-year 85% volume commitment with minimum take-or-pay guarantee won a 12% discount and secured scarce production slots.

### Current Negotiation Round:
* **Supplier:** Alpha Supplier
* **Category:** Raw Materials
* **Current Market:** Supply surplus, softening demand, 4 alternative qualified vendors available.
* **Leverage:** Supplier Leverage = Low, Buyer Leverage = High.

### Hindsight Condition-Aware Reasoning:
* **Condition Divergence Warning:** The system identifies that repeating the historical volume lock-in tactic today would forfeit buyer leverage and lock the organization into rigid above-market commitments while spot prices drop.
* **Adaptive Recommendation:** Shift to competitive mini-RFPs, unbundled contract tiers, index-linked floating prices with downward ratchet protection, and Net 60 payment terms.
* **Retain & Future Learning:** Retaining the surplus outcome updates the bank; subsequent queries immediately recall the surplus experience.

---

## 8. Tech Stack

- **Backend:** Python 3.11, FastAPI 0.110+, Pydantic v2, Uvicorn
- **Memory Engine:** Vectorize Hindsight 0.10.1 (`hindsight-client`, `hindsight-api`, embedded PostgreSQL `pg0`, local BAAI embeddings)
- **Frontend:** Vanilla HTML5, CSS3 (Glassmorphic design system), JavaScript (ES6+ async fetch)
- **Testing:** Pytest 9+, FastAPI TestClient

---

## 9. Setup & Clean Start Instructions

### Windows (PowerShell)

**Terminal 1 — Start Local Hindsight Server (Powered by Groq):**
```powershell
$env:PYTHONIOENCODING="utf-8"
$env:HINDSIGHT_API_LLM_PROVIDER="groq"
$env:HINDSIGHT_API_LLM_MODEL="openai/gpt-oss-20b"
$env:HINDSIGHT_API_LLM_GROQ_SERVICE_TIER="on_demand"
hindsight-api --port 8888
```

**Terminal 2 — Start the Application:**
```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Open your browser to: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

### macOS / Linux (Bash)

**Terminal 1:**
```bash
export PYTHONIOENCODING="utf-8"
export HINDSIGHT_API_LLM_PROVIDER="groq"
export HINDSIGHT_API_LLM_MODEL="openai/gpt-oss-20b"
export HINDSIGHT_API_LLM_GROQ_SERVICE_TIER="on_demand"
hindsight-api --port 8888
```

**Terminal 2:**
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

---

## 10. Automated Tests

Run the complete audit suite:
```powershell
python -m pytest -v
```

Expected result:
```
tests/test_hindsight_audit.py::test_health PASSED                        [ 20%]
tests/test_hindsight_audit.py::test_condition_difference_calculation PASSED [ 40%]
tests/test_hindsight_audit.py::test_analyze_alpha_surplus PASSED         [ 60%]
tests/test_hindsight_audit.py::test_cross_supplier_recall_omega PASSED   [ 80%]
tests/test_hindsight_audit.py::test_retain_outcome_loop PASSED           [100%]
======================= 5 passed, 2 warnings in 30.55s ========================
```

---

## 11. Screenshots & Demonstration Walkthrough

| Screen | View Name | Description |
|---|---|---|
| **Screenshot 1** | Main Application Cockpit | Executive dark workspace with 7-step learning workflow ribbon and memory health indicators. |
| **Screenshot 2** | Historical Deal Inspection | Memory Bank Explorer showing Alpha Supplier 2024 shortage deal where volume lock-in won 12%. |
| **Screenshot 3** | Current Negotiation Input | Strategy Advisor loaded with Alpha Supplier in 2026 surplus conditions with 4 alternative vendors. |
| **Screenshot 4** | Memory-Grounded Strategy Analysis | Dedicated UI card displaying strategic reasoning, condition divergence note, and cited memory facts. |
| **Screenshot 5** | Condition Contrast Table | Direct side-by-side comparison of Past Shortage vs. Current Surplus leverage and tactical shifts. |
| **Screenshot 6** | Retain Completed Deal | Retaining concluded negotiation outcome into Hindsight to complete the institutional learning loop. |

---

## 12. Current Working Prototype vs. Future Roadmap

### Current Working Prototype (Implemented):
- [x] Vectorize Hindsight 0.10.1 integration (`retain`, `recall`, `reflect`)
- [x] Condition divergence detection (Shortage vs. Surplus)
- [x] Grounded strategic reasoning derived from historical Hindsight memory + condition analysis
- [x] Visible Memory-Grounded Strategy Analysis section with real memory IDs and cited facts
- [x] Side-by-side Condition Contrast Matrix
- [x] Interactive deal outcome retention completing the learning loop
- [x] Human procurement manager decision advisory
- [x] Comprehensive automated test suite (`pytest -v` passing)

### Future / Full System Roadmap (Out of Scope for Prototype):
- [ ] Direct ERP integration (SAP Ariba, Coupa, Workday Procurement)
- [ ] Automated supplier document & contract PDF parsing
- [ ] Multi-party negotiation timeline replay
- [ ] Real-time commodity index feeds (LME, Platts, Freightos)
- [ ] Multi-lingual procurement category taxonomy mapping

---

## 13. Limitations & Provenance Architecture

- **Prototype Scope:** Designed as an institutional decision support cockpit for human procurement managers; does NOT execute autonomous transactions.
- **Truthful Provenance & Baseline Configuration:** In the verified baseline configuration (`HINDSIGHT_API_LLM_PROVIDER=none`), Hindsight provides live embedded semantic vector search, BM25 indexing, LinkExpansion graph retrieval, and outcome retention (`retain` & `recall`). Strategic synthesis and condition divergence detection operate deterministically over these retrieved Hindsight memories. When a real LLM provider (OpenAI, Anthropic, Gemini) is enabled, Hindsight's native agentic reflection (`reflect()`) is invoked directly.
- **Database Scope:** Uses Hindsight's native embedded storage (`pg0`) and local resilient JSON backup; does not require external enterprise database setup.

---

## 14. License

MIT License. Built with **Vectorize Hindsight** for institutional procurement intelligence.
