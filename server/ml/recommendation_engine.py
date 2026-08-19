"""
Recommendation Engine
Core pipeline that recommends EXACTLY ONE credit card
Supports: Rule-based, Random Forest, XGBoost, Hybrid Ranking
"""

import logging
from typing import Dict, List, Optional, Tuple
import numpy as np
from sqlalchemy.orm import Session
import joblib
import os

from database.models import Card, CategoryTotal, Recommendation, User
from ml.categorizer import CATEGORIES

logger = logging.getLogger(__name__)

# Category to tag mapping for card matching
CATEGORY_TO_TAG_MAP = {
    "Dining": "dining",
    "Travel": "travel",
    "Fuel": "fuel",
    "Shopping": "shopping",
    "Groceries": "shopping",
    "Utilities": "lifestyle",
    "Subscriptions": "lifestyle",
    "Healthcare": "lifestyle",
    "Entertainment": "lifestyle",
    "Education": "lifestyle",
    "Bills": "cashback",
    "Investments": "premium",
    "Others": "cashback"
}


class RecommendationEngine:
    """
    Recommendation Engine - Returns ONE best credit card
    Critical: NEVER returns multiple cards (SRS Rule 1)
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or "ml/models/recommendation_model.pkl"
        self.model = None
        self._load_model()
    
    def recommend_card(
        self,
        category_totals: Dict[str, float],
        db: Session,
        user_income: Optional[int] = None,
        user_cibil: Optional[int] = None,
        strategy: str = "hybrid"
    ) -> Tuple[Card, Dict]:
        """
        Recommend ONE credit card based on spending patterns
        
        Args:
            category_totals: Dict of category -> total spend
            db: Database session
            user_income: User's annual income (for eligibility)
            user_cibil: User's CIBIL score (for eligibility)
            strategy: 'rule_based', 'ml', or 'hybrid'
        
        Returns:
            (recommended_card, calculation_details)
        """
        
        # Calculate yearly spend
        total_yearly_spend = sum(category_totals.values())
        
        if total_yearly_spend == 0:
            raise ValueError("Total spending is zero, cannot recommend a card")
        
        # Get all eligible cards
        eligible_cards = self._get_eligible_cards(db, user_income, user_cibil)
        
        if not eligible_cards:
            raise ValueError("No eligible cards found for user profile")
        
        logger.info(f"Evaluating {len(eligible_cards)} eligible cards")
        
        # Score each card
        card_scores = []
        for card in eligible_cards:
            score, details = self._calculate_card_score(
                card,
                category_totals,
                total_yearly_spend,
                strategy
            )
            card_scores.append((card, score, details))
        
        # Sort by score descending
        card_scores.sort(key=lambda x: x[1], reverse=True)
        
        # Return ONLY the top card (SRS Rule 1)
        best_card, best_score, best_details = card_scores[0]
        
        logger.info(f"Recommended card: {best_card.name} with score {best_score:.2f}")
        
        return best_card, best_details
    
    def _get_eligible_cards(
        self,
        db: Session,
        user_income: Optional[int],
        user_cibil: Optional[int]
    ) -> List[Card]:
        """Get cards that user is eligible for"""
        
        query = db.query(Card).filter(Card.is_active == True)
        
        # Apply income filter if provided
        if user_income is not None:
            query = query.filter(
                (Card.min_income == None) | (Card.min_income <= user_income)
            )
        
        # Apply CIBIL filter if provided
        if user_cibil is not None:
            query = query.filter(
                (Card.min_cibil == None) | (Card.min_cibil <= user_cibil)
            )
        
        return query.all()
    
    def _calculate_card_score(
        self,
        card: Card,
        category_totals: Dict[str, float],
        total_yearly_spend: float,
        strategy: str
    ) -> Tuple[float, Dict]:
        """Calculate score and details for a card"""
        
        # Calculate rewards for each category
        category_rewards = {}
        total_rewards = 0.0
        
        for category, amount in category_totals.items():
            reward = self._calculate_category_reward(card, category, amount)
            category_rewards[category] = reward
            total_rewards += reward
        
        # Apply milestone bonuses
        milestone_bonus = self._calculate_milestone_bonus(card, total_yearly_spend)
        total_rewards += milestone_bonus
        
        # Calculate net annual benefit (rewards - annual fee)
        net_annual_benefit = total_rewards - card.annual_fee
        
        # Calculate effective reward rate
        effective_reward_rate = (total_rewards / total_yearly_spend * 100) if total_yearly_spend > 0 else 0
        
        # Calculate breakeven spend (spend needed to offset annual fee)
        base_reward_rate = card.reward_rate / 100
        breakeven_spend = card.annual_fee / base_reward_rate if base_reward_rate > 0 else float('inf')
        
        # Calculate final score based on strategy
        if strategy == "rule_based":
            score = self._rule_based_score(card, category_totals, net_annual_benefit)
        elif strategy == "ml":
            score = self._ml_based_score(card, category_totals, net_annual_benefit)
        else:  # hybrid
            rule_score = self._rule_based_score(card, category_totals, net_annual_benefit)
            ml_score = self._ml_based_score(card, category_totals, net_annual_benefit) if self.model else 0
            score = (rule_score + ml_score) / 2 if self.model else rule_score
        
        details = {
            "yearly_spend": total_yearly_spend,
            "total_rewards": round(total_rewards, 2),
            "milestone_bonus": round(milestone_bonus, 2),
            "annual_fee": card.annual_fee,
            "net_annual_benefit": round(net_annual_benefit, 2),
            "effective_reward_rate": round(effective_reward_rate, 2),
            "breakeven_spend": round(breakeven_spend, 2) if breakeven_spend != float('inf') else None,
            "category_rewards": {k: round(v, 2) for k, v in category_rewards.items()},
            "score": round(score, 2),
            "strategy": strategy
        }
        
        return score, details
    
    def _calculate_category_reward(
        self,
        card: Card,
        category: str,
        amount: float
    ) -> float:
        """Calculate reward for a specific category spend"""
        
        base_reward_rate = card.reward_rate / 100
        reward = amount * base_reward_rate
        
        # Check for category-specific benefits
        tag = CATEGORY_TO_TAG_MAP.get(category, "cashback")
        
        # Apply multipliers based on card benefits
        if category == "Dining" and card.dining_benefits:
            multiplier = card.dining_benefits.get("reward_multiplier", 1)
            cashback_rate = card.dining_benefits.get("cashback", 0)
            reward = max(reward * multiplier, amount * cashback_rate / 100)
        
        elif category == "Travel" and card.travel_benefits:
            multiplier = card.travel_benefits.get("reward_multiplier", 1)
            cashback_rate = card.travel_benefits.get("cashback", 0)
            reward = max(reward * multiplier, amount * cashback_rate / 100)
        
        elif category == "Fuel" and card.fuel_benefits:
            cashback_rate = card.fuel_benefits.get("cashback", 0)
            surcharge_waiver = card.fuel_benefits.get("surcharge_waiver", "0%")
            waiver_rate = float(surcharge_waiver.rstrip('%')) / 100 if surcharge_waiver else 0
            reward = max(reward, amount * cashback_rate / 100, amount * waiver_rate)
        
        elif category in ["Shopping", "Groceries"] and card.shopping_benefits:
            multiplier = card.shopping_benefits.get("reward_multiplier", 1)
            cashback_rate = card.shopping_benefits.get("cashback", 0)
            reward = max(reward * multiplier, amount * cashback_rate / 100)
        
        # Apply reward caps if specified
        if card.reward_caps:
            monthly_cap = card.reward_caps.get("monthly", None)
            if monthly_cap:
                reward = min(reward, monthly_cap * 12)  # Annual cap
            
            category_cap = card.reward_caps.get(category.lower(), None)
            if category_cap:
                reward = min(reward, category_cap)
        
        return reward
    
    def _calculate_milestone_bonus(self, card: Card, yearly_spend: float) -> float:
        """Calculate milestone bonus rewards"""
        
        if not card.milestones:
            return 0.0
        
        total_bonus = 0.0
        for threshold_str, bonus in card.milestones.items():
            threshold = float(threshold_str)
            if yearly_spend >= threshold:
                total_bonus += bonus
        
        return total_bonus
    
    def _rule_based_score(
        self,
        card: Card,
        category_totals: Dict[str, float],
        net_annual_benefit: float
    ) -> float:
        """Rule-based scoring algorithm"""
        
        score = 0.0
        
        # Weight 1: Net annual benefit (40% weight)
        score += net_annual_benefit * 0.4
        
        # Weight 2: Category matching (30% weight)
        total_spend = sum(category_totals.values())
        category_match_score = 0.0
        
        for category, amount in category_totals.items():
            category_weight = amount / total_spend if total_spend > 0 else 0
            tag = CATEGORY_TO_TAG_MAP.get(category, "cashback")
            
            # Check if card tags match spending categories
            if card.tags and tag in card.tags:
                category_match_score += category_weight * 100
        
        score += category_match_score * 0.3
        
        # Weight 3: Premium features (20% weight)
        premium_score = 0.0
        if card.lounge_access:
            premium_score += 20
        if card.other_benefits and card.other_benefits.get("concierge"):
            premium_score += 15
        if card.other_benefits and card.other_benefits.get("golf"):
            premium_score += 10
        if card.travel_benefits and card.travel_benefits.get("insurance"):
            premium_score += 10
        
        score += premium_score * 0.2
        
        # Weight 4: Low annual fee preference (10% weight)
        # Normalize fee impact (lower fee = higher score)
        fee_score = max(0, 100 - (card.annual_fee / 100))
        score += fee_score * 0.1
        
        return max(score, 0)  # Ensure non-negative score
    
    def _ml_based_score(
        self,
        card: Card,
        category_totals: Dict[str, float],
        net_annual_benefit: float
    ) -> float:
        """ML-based scoring using trained model"""
        
        if not self.model:
            return 0.0
        
        try:
            # Create feature vector
            features = self._create_feature_vector(card, category_totals, net_annual_benefit)
            
            # Predict score
            score = self.model.predict([features])[0]
            
            return max(score, 0)
            
        except Exception as e:
            logger.error(f"ML scoring error: {e}")
            return 0.0
    
    def _create_feature_vector(
        self,
        card: Card,
        category_totals: Dict[str, float],
        net_annual_benefit: float
    ) -> List[float]:
        """Create feature vector for ML model"""
        
        features = []
        
        # Card features
        features.append(card.annual_fee)
        features.append(card.reward_rate)
        features.append(1 if card.lounge_access else 0)
        features.append(net_annual_benefit)
        
        # Category spending features (normalized)
        total_spend = sum(category_totals.values())
        for category in CATEGORIES:
            category_pct = (category_totals.get(category, 0) / total_spend * 100) if total_spend > 0 else 0
            features.append(category_pct)
        
        # Tag matching features
        for tag in ["travel", "dining", "shopping", "fuel", "cashback", "lifestyle", "premium"]:
            features.append(1 if card.tags and tag in card.tags else 0)
        
        return features
    
    def _load_model(self):
        """Load trained ML model"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                logger.info("Recommendation model loaded successfully")
            else:
                logger.info("No ML model found, using rule-based scoring")
        except Exception as e:
            logger.error(f"Error loading recommendation model: {e}")
            self.model = None
    
    def generate_reasoning(
        self,
        card: Card,
        category_totals: Dict[str, float],
        calculation_details: Dict
    ) -> str:
        """Generate human-readable reasoning for recommendation"""
        
        total_spend = sum(category_totals.values())
        
        # Find top 3 spending categories
        sorted_categories = sorted(
            category_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        
        top_categories = [cat for cat, _ in sorted_categories if category_totals.get(cat, 0) > 0]
        
        reasoning_parts = []
        
        # Part 1: Spending pattern
        if top_categories:
            cat_names = ", ".join(top_categories[:2])
            reasoning_parts.append(
                f"Based on your spending pattern, you primarily spend on {cat_names}."
            )
        
        # Part 2: Why this card
        card_benefits = []
        for cat in top_categories[:2]:
            tag = CATEGORY_TO_TAG_MAP.get(cat, "")
            if card.tags and tag in card.tags:
                if cat == "Dining" and card.dining_benefits:
                    mult = card.dining_benefits.get("reward_multiplier", 1)
                    if mult > 1:
                        card_benefits.append(f"{mult}X rewards on dining")
                elif cat == "Travel" and card.travel_benefits:
                    if card.travel_benefits.get("lounge_access"):
                        card_benefits.append("airport lounge access")
                elif cat == "Fuel" and card.fuel_benefits:
                    cashback = card.fuel_benefits.get("cashback", 0)
                    if cashback > 0:
                        card_benefits.append(f"{cashback}% fuel cashback")
        
        if card_benefits:
            benefits_str = " and ".join(card_benefits)
            reasoning_parts.append(
                f"The {card.name} offers {benefits_str}, perfectly matching your needs."
            )
        else:
            reasoning_parts.append(
                f"The {card.name} provides excellent overall value with {card.reward_rate}% rewards on all spends."
            )
        
        # Part 3: Net benefit
        net_benefit = calculation_details["net_annual_benefit"]
        if net_benefit > 0:
            reasoning_parts.append(
                f"You'll earn ₹{net_benefit:,.0f} net annual benefit (rewards minus fees)."
            )
        else:
            breakeven = calculation_details.get("breakeven_spend")
            if breakeven and breakeven < total_spend * 2:
                reasoning_parts.append(
                    f"The annual fee of ₹{card.annual_fee:,.0f} breaks even at ₹{breakeven:,.0f} annual spend."
                )
        
        # Part 4: Premium features
        if card.lounge_access:
            reasoning_parts.append("Plus, enjoy complimentary airport lounge access.")
        
        return " ".join(reasoning_parts)


# Global engine instance
recommendation_engine = RecommendationEngine()
