from pydantic import BaseModel
from typing import Optional, Dict, List, Any

class RecommendationRequest(BaseModel):
    statement_id: int
    user_income: Optional[int] = None
    user_cibil: Optional[int] = None
    strategy: Optional[str] = "hybrid"

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

class RecommendationResponse(BaseModel):
    recommendation_id: int
    card: CardRecommendationDetail
    calculation_details: Dict[str, Any]
    reasoning: str
    confidence_score: float
