from typing import List
from fastapi import APIRouter, HTTPException
from backend.app.schemas.cases import NegotiationCaseSchema
from backend.app.schemas.memory import HistoricalMemorySchema
from backend.app.services.memory_service import memory_service
from backend.app.schemas.memory import MemoryRecallRequestSchema, ConditionVectorSchema

router = APIRouter(prefix="/cases", tags=["Negotiation Cases"])

CANONICAL_CASES = [
    NegotiationCaseSchema(
        id="case-alpha-2026",
        counterparty="Alpha Supplier",
        product="Industrial High-Grade Steel Billets & Structural Coils",
        contractValue="$4,200,000",
        targetQuantity="12,500 MT",
        targetLeadTime="14 Days",
        marketTrend="Supply surplus, softening global demand, 4 alternative mills actively quoting",
        paymentTerms="Target Net 60 (currently Net 30)",
        supplyBalance="SURPLUS",
        supplierLeverage="LOW",
        buyerLeverage="HIGH",
        urgency="FLEXIBLE",
        alternatives=4,
        category="Raw Materials",
        negotiationObjective="Achieve 15% unit cost reduction, eliminate volume take-or-pay locks, and establish quarterly downward index ratchets.",
        constraints="Must maintain ASTM-A36 compliance and guaranteed 14-day rail delivery cycles."
    ),
    NegotiationCaseSchema(
        id="case-omega-2026",
        counterparty="Omega Components",
        product="Automotive Grade 32-bit Microcontrollers (MCU)",
        contractValue="$1,850,000",
        targetQuantity="300,000 Units",
        targetLeadTime="24 Weeks",
        marketTrend="Global wafer fab capacity crunch, severe allocation rationing, 44-week spot lead times",
        paymentTerms="Net 30",
        supplyBalance="SHORTAGE",
        supplierLeverage="HIGH",
        buyerLeverage="LOW",
        urgency="URGENT",
        alternatives=0,
        category="Electronic Components & Microcontrollers",
        negotiationObjective="Secure guaranteed wafer fabrication allocation slots and cap price escalation below 8%.",
        constraints="Proprietary pinout; zero pin-compatible second source without $350k PCB re-spin."
    ),
    NegotiationCaseSchema(
        id="case-gamma-2026",
        counterparty="Gamma Logistics",
        product="Transpacific Ocean Freight & Intermodal Drayage",
        contractValue="$2,400,000",
        targetQuantity="1,800 FEU Containers",
        targetLeadTime="Weekly Departure",
        marketTrend="Global container vessel overcapacity, spot rates collapsed 32%, carriers aggressively underbidding",
        paymentTerms="Target Net 90",
        supplyBalance="SURPLUS",
        supplierLeverage="LOW",
        buyerLeverage="HIGH",
        urgency="FLEXIBLE",
        alternatives=5,
        category="Logistics & Freight Forwarding",
        negotiationObjective="Contract rate reduction of 25% with flexible quarterly index adjustments and demurrage waiver.",
        constraints="98.5% on-time vessel departure SLA mandatory."
    )
]

@router.get("", response_model=List[NegotiationCaseSchema])
def list_cases() -> List[NegotiationCaseSchema]:
    """Retrieve all active negotiation cases."""
    return CANONICAL_CASES

@router.get("/{case_id}", response_model=NegotiationCaseSchema)
def get_case(case_id: str) -> NegotiationCaseSchema:
    """Retrieve negotiation case details by ID."""
    found = next((c for c in CANONICAL_CASES if c.id == case_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    return found

@router.get("/{case_id}/memories", response_model=List[HistoricalMemorySchema])
def get_case_memories(case_id: str) -> List[HistoricalMemorySchema]:
    """Retrieve historical memories relevant to a case."""
    found = next((c for c in CANONICAL_CASES if c.id == case_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Case '{case_id}' not found.")
    
    vec = ConditionVectorSchema(
        supply_balance=found.supplyBalance,
        supplier_leverage=found.supplierLeverage,
        buyer_leverage=found.buyerLeverage,
        urgency=found.urgency,
        alternatives=found.alternatives
    )
    req = MemoryRecallRequestSchema(
        case_id=case_id,
        condition_vector=vec,
        category=found.category,
        top_k=6
    )
    result = memory_service.recall_memories(req)
    return result.memories
