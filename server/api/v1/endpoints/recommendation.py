"""
Recommendation Endpoint
Rank credit cards by fit for a spending pattern, from a statement or manual input
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import logging

from database.session import get_db
from database.models import Statement, CategoryTotal, Recommendation
from ml.recommendation_engine import recommendation_engine
from ml.categorizer import CATEGORIES
from schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    RankedRecommendation,
    CardRecommendationDetail
)

router = APIRouter()
logger = logging.getLogger(__name__)


def _card_detail(card) -> CardRecommendationDetail:
    return CardRecommendationDetail(
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


@router.post("/", response_model=RecommendationResponse, status_code=status.HTTP_200_OK)
async def get_recommendation(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
):
    """Rank the top N credit cards for a spending pattern (statement-derived or manual)"""

    if request.statement_id:
        statement = db.query(Statement).filter(
            Statement.id == request.statement_id
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

        category_totals_db = db.query(CategoryTotal).filter(
            CategoryTotal.statement_id == statement.id
        ).all()

        if not category_totals_db:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No spending categories found"
            )

        category_totals = {ct.category: ct.total_amount for ct in category_totals_db}
    else:
        # Manual mode: user-entered estimated annual spend per category
        category_totals = {
            category: amount
            for category, amount in request.manual_category_totals.items()
            if category in CATEGORIES and amount and amount > 0
        }
        if not category_totals:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Enter a positive amount in at least one spending category"
            )

    try:
        ranked = recommendation_engine.recommend_cards(
            category_totals=category_totals,
            db=db,
            user_income=request.user_income,
            user_cibil=request.user_cibil,
            strategy=request.strategy or "hybrid",
            top_n=max(1, min(request.top_n, 10)),
            excluded_issuers=request.excluded_issuers,
            max_annual_fee=request.max_annual_fee,
            require_lounge_access=request.require_lounge_access,
        )

        results = []
        for rank, (card, score, calculation_details) in enumerate(ranked, start=1):
            reasoning = recommendation_engine.generate_reasoning(
                card, category_totals, calculation_details
            )
            confidence_score = calculation_details.get("score", 0) / 100

            recommendation_id = None
            if rank == 1:
                # Persist only the top pick, for /history and chat context
                recommendation_record = Recommendation(
                    card_id=card.id,
                    category_totals=category_totals,
                    yearly_spend=calculation_details["yearly_spend"],
                    total_rewards=calculation_details["total_rewards"],
                    effective_reward_rate=calculation_details["effective_reward_rate"],
                    net_annual_benefit=calculation_details["net_annual_benefit"],
                    breakeven_spend=calculation_details.get("breakeven_spend"),
                    model_version="v1.0",
                    confidence_score=confidence_score,
                    reasoning=reasoning
                )
                db.add(recommendation_record)
                db.commit()
                db.refresh(recommendation_record)
                recommendation_id = recommendation_record.id
                logger.info(f"Top recommendation saved: {recommendation_id}")

            results.append(RankedRecommendation(
                rank=rank,
                recommendation_id=recommendation_id,
                card=_card_detail(card),
                calculation_details=calculation_details,
                reasoning=reasoning,
                confidence_score=confidence_score,
            ))

        return RecommendationResponse(
            recommendations=results,
            category_totals_used=category_totals,
        )

    except ValueError as e:
        logger.warning(f"Recommendation error: {e}")
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
    limit: int = 10
):
    """Get recommendation history"""

    recommendations = db.query(Recommendation).order_by(
        Recommendation.created_at.desc()
    ).limit(limit).all()

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
):
    """Get a specific (previously top-ranked and persisted) recommendation by ID"""

    recommendation = db.query(Recommendation).filter(
        Recommendation.id == recommendation_id
    ).first()

    if not recommendation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recommendation not found"
        )

    card = recommendation.card

    calculation_details = {
        "yearly_spend": recommendation.yearly_spend,
        "total_rewards": recommendation.total_rewards,
        "annual_fee": card.annual_fee,
        "net_annual_benefit": recommendation.net_annual_benefit,
        "effective_reward_rate": recommendation.effective_reward_rate,
        "breakeven_spend": recommendation.breakeven_spend,
        "category_rewards": {}
    }

    return RecommendationResponse(
        recommendations=[RankedRecommendation(
            rank=1,
            recommendation_id=recommendation.id,
            card=_card_detail(card),
            calculation_details=calculation_details,
            reasoning=recommendation.reasoning,
            confidence_score=recommendation.confidence_score,
        )],
        category_totals_used=recommendation.category_totals or {},
    )
