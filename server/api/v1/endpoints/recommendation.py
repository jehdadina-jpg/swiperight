"""
Recommendation Endpoint
Get ONE credit card recommendation based on spending analysis
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from database.session import get_db
from database.models import User, Statement, CategoryTotal, Recommendation
from core.security import get_current_user
from ml.recommendation_engine import recommendation_engine
from schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    CardRecommendationDetail
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_200_OK)
async def get_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get ONE credit card recommendation based on spending analysis

    SRS Rule 1: Returns EXACTLY ONE card, never multiple cards
    """

    # Get statement and category totals (scoped to current user)
    statement = db.query(Statement).filter(
        Statement.id == request.statement_id,
        Statement.user_id == current_user.id
    ).first()
    
    if not statement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statement not found"
        )
    
    if statement.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Statement analysis not completed yet"
        )
    
    # Get category totals
    category_totals_db = db.query(CategoryTotal).filter(
        CategoryTotal.statement_id == statement.id
    ).all()
    
    if not category_totals_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No spending categories found"
        )
    
    # Convert to dict
    category_totals = {
        ct.category: ct.total_amount
        for ct in category_totals_db
    }
    
    logger.info(f"Getting recommendation for user {current_user.id}")
    
    try:
        # Get recommendation (returns ONE card only)
        recommended_card, calculation_details = recommendation_engine.recommend_card(
            category_totals=category_totals,
            db=db,
            user_income=request.user_income,
            user_cibil=request.user_cibil,
            strategy=request.strategy or "hybrid"
        )
        
        # Generate AI reasoning
        reasoning = recommendation_engine.generate_reasoning(
            recommended_card,
            category_totals,
            calculation_details
        )
        
        # Save recommendation to database
        recommendation_record = Recommendation(
            user_id=current_user.id,
            card_id=recommended_card.id,
            category_totals=category_totals,
            yearly_spend=calculation_details["yearly_spend"],
            total_rewards=calculation_details["total_rewards"],
            effective_reward_rate=calculation_details["effective_reward_rate"],
            net_annual_benefit=calculation_details["net_annual_benefit"],
            breakeven_spend=calculation_details.get("breakeven_spend"),
            model_version="v1.0",
            confidence_score=calculation_details.get("score", 0) / 100,
            reasoning=reasoning
        )
        
        db.add(recommendation_record)
        db.commit()
        db.refresh(recommendation_record)
        
        logger.info(f"Recommendation saved: {recommendation_record.id}")
        
        # Prepare response
        card_detail = CardRecommendationDetail(
            id=recommended_card.id,
            name=recommended_card.name,
            issuer=recommended_card.issuer,
            network=recommended_card.network,
            annual_fee=recommended_card.annual_fee,
            joining_fee=recommended_card.joining_fee,
            reward_rate=recommended_card.reward_rate,
            tags=recommended_card.tags or [],
            highlight=recommended_card.highlight,
            lounge_access=recommended_card.lounge_access,
            fuel_benefits=recommended_card.fuel_benefits,
            dining_benefits=recommended_card.dining_benefits,
            travel_benefits=recommended_card.travel_benefits,
            shopping_benefits=recommended_card.shopping_benefits,
            other_benefits=recommended_card.other_benefits,
            min_income=recommended_card.min_income,
            min_cibil=recommended_card.min_cibil,
            annual_waiver_condition=recommended_card.annual_waiver_condition,
            churn_risk=recommended_card.churn_risk.value
        )
        
        return {
            "recommendation_id": recommendation_record.id,
            "card": card_detail,
            "calculation_details": calculation_details,
            "reasoning": reasoning,
            "confidence_score": recommendation_record.confidence_score
        }
        
    except ValueError as e:
        logger.error(f"Recommendation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generating recommendation"
        )


@router.get("/history", response_model=list)
async def get_recommendation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """Get recommendation history for the current user"""

    recommendations = db.query(Recommendation).filter(
        Recommendation.user_id == current_user.id
    ).order_by(Recommendation.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": rec.id,
            "card_name": rec.card.name,
            "card_issuer": rec.card.issuer,
            "net_annual_benefit": rec.net_annual_benefit,
            "created_at": rec.created_at
        }
        for rec in recommendations
    ]


@router.get("/{recommendation_id}", response_model=RecommendationResponse)
async def get_recommendation_by_id(
    recommendation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific recommendation by ID (scoped to current user)"""

    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id,
        Recommendation.user_id == current_user.id
    ).first()
    
    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )
    
    card = recommendation.card
    
    card_detail = CardRecommendationDetail(
        id=card.id,
        name=card.name,
        issuer=card.issuer,
        network=card.network,
        annual_fee=card.annual_fee,
        joining_fee=card.joining_fee,
        reward_rate=card.reward_rate,
        tags=card.tags or [],
        highlight=card.highlight,
        lounge_access=card.lounge_access,
        fuel_benefits=card.fuel_benefits,
        dining_benefits=card.dining_benefits,
        travel_benefits=card.travel_benefits,
        shopping_benefits=card.shopping_benefits,
        other_benefits=card.other_benefits,
        min_income=card.min_income,
        min_cibil=card.min_cibil,
        annual_waiver_condition=card.annual_waiver_condition,
        churn_risk=card.churn_risk.value
    )
    
    calculation_details = {
        "yearly_spend": recommendation.yearly_spend,
        "total_rewards": recommendation.total_rewards,
        "annual_fee": card.annual_fee,
        "net_annual_benefit": recommendation.net_annual_benefit,
        "effective_reward_rate": recommendation.effective_reward_rate,
        "breakeven_spend": recommendation.breakeven_spend,
        "category_rewards": {}
    }
    
    return {
        "recommendation_id": recommendation.id,
        "card": card_detail,
        "calculation_details": calculation_details,
        "reasoning": recommendation.reasoning,
        "confidence_score": recommendation.confidence_score
    }
