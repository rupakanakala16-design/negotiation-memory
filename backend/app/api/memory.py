from typing import List, Optional
from fastapi import APIRouter, Query
from backend.app.schemas.memory import (
    MemoryRecallRequestSchema,
    MemoryRecallResponseSchema,
    MemoryClusterSchema,
    MemoryTimelineEventSchema
)
from backend.app.services.memory_service import memory_service

router = APIRouter(prefix="/memory", tags=["Institutional Memory"])

@router.post("/recall", response_model=MemoryRecallResponseSchema)
def recall_memory(request: MemoryRecallRequestSchema) -> MemoryRecallResponseSchema:
    """
    Recall relevant precedent memories from Hindsight memory bank based on multi-dimensional condition vector.
    """
    return memory_service.recall_memories(request)

@router.get("/clusters", response_model=List[MemoryClusterSchema])
def get_memory_clusters() -> List[MemoryClusterSchema]:
    """
    Retrieve thematic clusters of institutional negotiation memory.
    """
    return memory_service.get_clusters()

@router.get("/timeline", response_model=List[MemoryTimelineEventSchema])
def get_memory_timeline(supplier: Optional[str] = Query(None, description="Filter by counterparty/supplier")) -> List[MemoryTimelineEventSchema]:
    """
    Retrieve chronological negotiation memory timeline.
    """
    return memory_service.get_timeline(supplier)
