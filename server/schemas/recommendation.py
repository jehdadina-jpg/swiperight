from pydantic import BaseModel, model_validator
from typing import Optional, Dict, List, Any

class RecommendationRequest(BaseModel):
    # Provide either statement_id (use a previously analyzed statement's
    # category totals) or manual_category_totals (skip upload entirely and
    # score cards against user-entered spend estimates by category)
    statement_id: Optional[int] = None
    manual_category_totals: Optional[Dict[str, float]] = None

    user_income: Optional[int] = None
    user_cibil: Optional[int] = None
    strategy: Optional[str] = "hybrid"

    # Preferences
    excluded_issuers: Optional[List[str]] = None
    max_annual_fee: Optional[float] = None
    require_lounge_access: bool = False
    top_n: int = 5

    @model_validator(mode="after")
    def _require_one_source(self) -> "RecommendationRequest":
        if not self.statement_id and not self.manual_category_totals:
            raise ValueError("Provide either statement_id or manual_category_totals")
        if self.statement_id and self.manual_category_totals:
            raise ValueError("Provide only one of statement_id or manual_category_totals")
        return self

class CardRecommendationDetail(BaseModel):
    id: int
    name: str
    issuer: str
    network: str
    annual_fee: float
    joining_fee: float
    reward_rate: float
    tags: List[str]
    highlight: Optional[str]
    lounge_access: bool
    fuel_benefits: Optional[Dict[str, Any]]
    dining_benefits: Optional[Dict[str, Any]]
    travel_benefits: Optional[Dict[str, Any]]
    shopping_benefits: Optional[Dict[str, Any]]
    other_benefits: Optional[Dict[str, Any]]
    min_income: Optional[int]
    min_cibil: Optional[int]
    annual_waiver_condition: Optional[str]
    churn_risk: str
    
    class Config:
        from_attributes = True

class RankedRecommendation(BaseModel):
    rank: int
    recommendation_id: Optional[int] = None
    card: CardRecommendationDetail
    calculation_details: Dict[str, Any]
    reasoning: str
    confidence_score: float

class RecommendationResponse(BaseModel):
    recommendations: List[RankedRecommendation]
    category_totals_used: Dict[str, float]
