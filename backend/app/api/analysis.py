from fastapi import APIRouter
from backend.app.schemas.analysis import (
    ConditionDiffRequestSchema,
    ConditionDiffResponseSchema,
    ReflectRequestSchema,
    ReflectResponseSchema,
    StrategyRecommendRequestSchema,
    StrategyRecommendResponseSchema
)
from backend.app.services.condition_service import condition_service
from backend.app.services.reflection_service import reflection_service
from backend.app.services.recommendation_service import recommendation_service

router = APIRouter(prefix="/analysis", tags=["Negotiation Analysis"])

@router.post("/condition-diff", response_model=ConditionDiffResponseSchema)
def compute_condition_diff(request: ConditionDiffRequestSchema) -> ConditionDiffResponseSchema:
    """
    Computes dimensional condition difference between precedent deal and active negotiation context.
    """
    return condition_service.compute_condition_difference(request)

@router.post("/reflect", response_model=ReflectResponseSchema)
def run_reflection(request: ReflectRequestSchema) -> ReflectResponseSchema:
    """
    Executes Hindsight multi-memory reflection to detect patterns and precedent conflicts.
    """
    return reflection_service.reflect(request)

@router.post("/recommend", response_model=StrategyRecommendResponseSchema)
def recommend_strategy(request: StrategyRecommendRequestSchema) -> StrategyRecommendResponseSchema:
    """
    Formulates grounded negotiation strategy recommendation based on Hindsight reflection.
    """
    return recommendation_service.recommend(request)
