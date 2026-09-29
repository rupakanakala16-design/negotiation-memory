"""
Aggregated API router for the Negotiation Memory Intelligence Backend.

Route namespaces:
  /api/negotiations/*             — Core negotiations (canonical required routes)
  /api/cases/*                   — Active negotiation cases
  /api/memory/*                  — Memory recall, clusters, timeline
  /api/analysis/*                — Condition diff, reflection, recommendation
  /api/decisions/*               — Human decision recording
  /api/outcomes/*                — Outcome retention into memory bank

  # Canonical additional routes:
  /api/memories                  — Full memory bank dump (GET)
  /api/timeline                  — Chronological event timeline (GET)
  /api/negotiations/decisions/*  — Human decisions under /negotiations namespace
"""
from fastapi import APIRouter
from backend.app.api.negotiations import router as negotiations_router
from backend.app.api.cases import router as cases_router
from backend.app.api.memory import router as memory_router
from backend.app.api.analysis import router as analysis_router
from backend.app.api.decisions import router as decisions_router
from backend.app.api.outcomes import router as outcomes_router
from backend.app.api.canonical_memory import router as canonical_memory_router
from backend.app.api.negotiations_decisions import router as negotiations_decisions_router

api_router = APIRouter(prefix="/api")

# Core canonical required routes (must come before cases to avoid path conflicts)
api_router.include_router(negotiations_router)

api_router.include_router(cases_router)
api_router.include_router(memory_router)
api_router.include_router(analysis_router)
api_router.include_router(decisions_router)
api_router.include_router(outcomes_router)

# Additional canonical product-spec routes
api_router.include_router(canonical_memory_router)
api_router.include_router(negotiations_decisions_router)

