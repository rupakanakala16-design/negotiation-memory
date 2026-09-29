from typing import Optional, Literal
from pydantic import BaseModel, Field

SupplyBalance = Literal["SHORTAGE", "BALANCED", "SURPLUS"]
LeverageLevel = Literal["HIGH", "MEDIUM", "LOW"]
UrgencyLevel = Literal["URGENT", "NORMAL", "FLEXIBLE"]

class NegotiationCaseSchema(BaseModel):
    id: str = Field(..., description="Unique case identifier, e.g. case-alpha-2026")
    counterparty: str = Field(..., description="Name of the supplier or negotiating party")
    product: str = Field(..., description="Product, material, or service category")
    contractValue: str = Field(..., description="Estimated or target contract spend")
    targetQuantity: str = Field(..., description="Quantity or volume specification")
    targetLeadTime: str = Field(..., description="Required fulfillment or delivery window")
    marketTrend: str = Field(..., description="Market supply/demand and pricing trend")
    paymentTerms: str = Field(..., description="Target or current commercial payment terms")
    supplyBalance: SupplyBalance = Field("SURPLUS", description="Macro supply status")
    supplierLeverage: LeverageLevel = Field("LOW", description="Supplier pricing power")
    buyerLeverage: LeverageLevel = Field("HIGH", description="Buyer alternative depth")
    urgency: UrgencyLevel = Field("FLEXIBLE", description="Operational urgency")
    alternatives: int = Field(4, description="Number of viable alternative vendors")
    category: Optional[str] = "Raw Materials"
    negotiationObjective: Optional[str] = ""
    constraints: Optional[str] = ""

class CaseListResponse(BaseModel):
    cases: list[NegotiationCaseSchema]
    total: int
