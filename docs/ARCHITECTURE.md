# Negotiation Memory — Architecture Reference

> **Version:** 1.0  
> **Last updated:** 2026-09-29  
> **Status:** Submission-ready

---

## Overview

Negotiation Memory is an institutional intelligence console that helps procurement managers make better decisions by surfacing pattern-matched historical precedents and synthesising strategic guidance grounded in real organisational memory.

The system is composed of three layers:

```
┌─────────────────────────────────────────────────┐
│              Browser / Frontend                  │
│   Vanilla HTML + CSS + JS  (frontend/)           │
│   TypeScript service layer (src/)                │
└───────────────────┬─────────────────────────────┘
                    │  REST  (VITE_API_BASE_URL)
┌───────────────────▼─────────────────────────────┐
│           Intelligence Backend                   │
│   FastAPI  (backend/app/)   port 8000            │
│   + Original Flask prototype (app/)  port 8000   │
└───────────────────┬─────────────────────────────┘
                    │  hindsight-client SDK
┌───────────────────▼─────────────────────────────┐
│              Hindsight API                       │
│   Memory bank: negotiation-memory   port 8888    │
│   LLM provider: configurable via .env            │
└─────────────────────────────────────────────────┘
```

---

## Repository Layout

```
negotiation-memory/
├── app/                        # Original Flask/Hindsight prototype
│   ├── hindsight_service.py    # Hindsight SDK wrapper (retain/recall/reflect)
│   ├── negotiation_agent.py    # Condition analysis + strategy generation
│   └── routes.py               # Flask REST endpoints
│
├── backend/                    # FastAPI intelligence backend
│   └── app/
│       ├── main.py             # Application entry point, CORS, mounts
│       ├── core/
│       │   └── config.py       # Pydantic settings (reads from .env)
│       ├── api/                # Route handlers (one module per domain)
│       │   ├── api_router.py   # Aggregated router  (/api prefix)
│       │   ├── cases.py        # GET /api/cases, GET /api/cases/{id}
│       │   ├── memory.py       # POST /api/memory/recall
│       │   ├── analysis.py     # POST /api/analysis/condition-diff
│       │   │                   # POST /api/analysis/reflect
│       │   │                   # POST /api/analysis/recommend-strategy
│       │   ├── decisions.py    # POST /api/decisions/record
│       │   └── outcomes.py     # POST /api/outcomes/retain
│       ├── schemas/            # Pydantic I/O contracts (mirrors src/types/index.ts)
│       │   ├── cases.py
│       │   ├── memory.py
│       │   ├── analysis.py
│       │   └── outcomes.py
│       ├── services/           # Domain logic (stateless, injectable)
│       │   ├── memory_service.py        # Hindsight recall + local fallback
│       │   ├── condition_service.py     # Condition vector diff engine
│       │   ├── reflection_service.py    # Hindsight reflect() wrapper
│       │   ├── recommendation_service.py# Strategy synthesis
│       │   ├── decision_service.py      # Human decision recording
│       │   └── outcome_service.py       # Outcome retention → Hindsight retain()
│       └── models/             # Internal data models
│
├── src/                        # TypeScript service & type layer (for TS consumers)
│   ├── types/index.ts          # Canonical domain interfaces
│   ├── services/               # API client services
│   │   ├── api.ts              # Base HTTP client + mock fallback logic
│   │   ├── caseService.ts
│   │   ├── memoryService.ts
│   │   ├── analysisService.ts
│   │   └── decisionService.ts
│   ├── mock/mockData.ts        # Offline mock store (used when backend is down)
│   └── vite-env.d.ts           # VITE_API_BASE_URL type declaration
│
├── frontend/                   # Browser UI
│   ├── index.html              # SPA shell
│   └── js/app.js               # Rendering + API integration
│
├── tests/
│   ├── test_backend_api.py     # pytest: FastAPI integration tests
│   └── ts-tests/
│       └── schema.test.mjs     # Node ESM: TypeScript schema validation
│
├── .env                        # Local secrets — NOT committed (see .gitignore)
├── .env.example                # Safe template checked into git
├── requirements.txt
├── package.json
└── tsconfig.json
```

---

## Hindsight Memory Layer

### What Hindsight does

| Operation | Description |
|-----------|-------------|
| `retain(text, bank_id)` | Stores a negotiation document as a structured memory unit with embeddings and temporal/semantic links |
| `recall(query, bank_id, top_k)` | Hybrid vector + keyword retrieval of relevant historical precedents |
| `reflect(memories, ...)` | LLM-backed synthesis across multiple memories — detects aligned patterns and conflicting precedents |

### Memory bank

- **Bank ID:** `negotiation-memory`
- **Backed by:** PostgreSQL (managed by `hindsight-api` daemon)
- **Embeddings:** via local sentence-transformer model in `hindsight-api`

### LLM provider (configurable)

```
HINDSIGHT_API_LLM_PROVIDER=none   # stable/submission mode — deterministic fallback
HINDSIGHT_API_LLM_PROVIDER=groq   # Groq Llama-3.3-70b — LLM reflect enabled
```

Set in `.env`. Never hardcoded. Never committed.

---

## Service Architecture

### Dual-path design

Every API endpoint has two execution paths:

```
Request
   │
   ▼
FastAPI Route Handler
   │
   ├─► [Hindsight available] ──► Hindsight SDK call ──► real memory / LLM result
   │
   └─► [Hindsight unavailable] ──► Deterministic fallback ──► rule-based result
                                   (condition_service.py / local logic)
```

The `reflection_source` field in every strategy response explicitly declares which path was taken:

- `"hindsight_reflect_llm"` — Hindsight `reflect()` succeeded with an LLM provider
- `"fallback_rule_based"` — Deterministic condition analysis used

### Frontend graceful degradation

The TypeScript `api.ts` service layer applies the same pattern at the network level:

```
VITE_API_BASE_URL set?
   │
   ├─► YES → HTTP request to backend → success → return response
   │                                 → network error → fall back to mockData.ts
   │
   └─► NO  → return mockData.ts immediately (offline/dev mode)
```

---

## Data Flow: End-to-End Strategy Recommendation

```
1. User opens case (e.g., "case-alpha-2026")
        │
2. GET /api/cases/{id}  →  NegotiationCaseSchema
        │
3. POST /api/memory/recall  →  top-K HistoricalMemory[]
        │  (Hindsight recall by condition vector similarity)
        │
4. POST /api/analysis/condition-diff  →  ConditionDiffAnalysis
        │  (dimensional delta: SURPLUS/HIGH/LOW vs current case)
        │
5. POST /api/analysis/reflect  →  Reflection
        │  (Hindsight reflect() OR deterministic fallback)
        │
6. POST /api/analysis/recommend-strategy  →  RecommendedStrategy
        │  (grounded in memories + reflection synthesis)
        │
7. Human Procurement Manager reviews strategy
        │
8. POST /api/decisions/record  →  DecisionRecordResponse
        │  (records ACCEPTED / MODIFIED / OVERRIDDEN)
        │
9. POST /api/outcomes/retain  →  OutcomeRetainResponse
           (actual outcome retained into Hindsight memory bank)
```

---

## Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `HINDSIGHT_API_URL` | Hindsight API daemon URL | `http://localhost:8888` |
| `HINDSIGHT_API_BANK_ID` | Memory bank identifier | `negotiation-memory` |
| `HINDSIGHT_API_LLM_PROVIDER` | LLM backend for reflect() | `none` / `groq` |
| `HINDSIGHT_API_LLM_MODEL` | Model name for LLM provider | `llama-3.3-70b-versatile` |
| `HINDSIGHT_API_LLM_API_KEY` | Provider API key | *(secret — never log)* |
| `VITE_API_BASE_URL` | Backend URL for the frontend | `http://localhost:8000` |

All secrets must live in `.env` only. `.gitignore` explicitly excludes `.env`.

---

## Security Properties

- No API key is hardcoded in any source file
- No API key appears in any frontend bundle
- `.env` is excluded from git via `.gitignore` (verified with `git check-ignore -v .env`)
- `.env.example` contains only placeholder values
- No secrets appear in logs, screenshots, or this documentation

---

## Testing

```bash
# Python backend integration tests
python -m pytest tests/test_backend_api.py -v

# TypeScript schema validation tests
node tests/ts-tests/schema.test.mjs

# Full Hindsight smoke test (requires hindsight-api running)
python -m pytest -v        # targets tests/test_*.py
```

Expected result: all tests pass with no security violations.
