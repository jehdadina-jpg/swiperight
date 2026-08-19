"""
Database Models
SQLAlchemy ORM models for the application
"""

from sqlalchemy import (
    Boolean, Column, Integer, String, Float, DateTime, Text,
    ForeignKey, JSON, Enum as SQLEnum, Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.session import Base
import enum


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class StatementStatus(str, enum.Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class TransactionType(str, enum.Enum):
    DEBIT = "debit"
    CREDIT = "credit"


class ChurnRisk(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class User(Base):
    """User Model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    statements = relationship("Statement", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")


class Statement(Base):
    """Bank Statement Model"""
    __tablename__ = "statements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # PDF or CSV
    status = Column(SQLEnum(StatementStatus), default=StatementStatus.UPLOADED)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    processed_date = Column(DateTime(timezone=True))
    error_message = Column(Text)
    
    # Relationships
    user = relationship("User", back_populates="statements")
    transactions = relationship("Transaction", back_populates="statement", cascade="all, delete-orphan")
    category_totals = relationship("CategoryTotal", back_populates="statement", cascade="all, delete-orphan")


class Transaction(Base):
    """Transaction Model"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    merchant = Column(String, nullable=False)
    normalized_merchant = Column(String)  # Normalized merchant name
    amount = Column(Float, nullable=False)
    transaction_type = Column(SQLEnum(TransactionType), nullable=False)
    description = Column(Text)
    category = Column(String)  # Classified category
    confidence_score = Column(Float)  # ML confidence score
    
    # Relationships
    statement = relationship("Statement", back_populates="transactions")
    
    # Indexes
    __table_args__ = (
        Index('idx_transaction_date', 'date'),
        Index('idx_transaction_category', 'category'),
    )


class CategoryTotal(Base):
    """Category-wise spending totals"""
    __tablename__ = "category_totals"

    id = Column(Integer, primary_key=True, index=True)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=False)
    category = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    transaction_count = Column(Integer, nullable=False)
    percentage = Column(Float)  # Percentage of total spending
    
    # Relationships
    statement = relationship("Statement", back_populates="category_totals")


class Card(Base):
    """Credit Card Model"""
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    issuer = Column(String, nullable=False, index=True)
    network = Column(String, nullable=False)  # Visa, Mastercard, RuPay, Amex
    
    # Fees
    joining_fee = Column(Float, default=0)
    annual_fee = Column(Float, default=0)
    
    # Rewards
    reward_rate = Column(Float, default=0)  # Base reward rate
    reward_caps = Column(JSON)  # Category-wise reward caps
    
    # Benefits
    fuel_benefits = Column(JSON)
    dining_benefits = Column(JSON)
    travel_benefits = Column(JSON)
    shopping_benefits = Column(JSON)
    other_benefits = Column(JSON)
    
    # Eligibility
    min_income = Column(Integer)
    min_cibil = Column(Integer)
    
    # Additional Details
    lounge_access = Column(Boolean, default=False)
    milestones = Column(JSON)  # Milestone bonuses
    annual_waiver_condition = Column(Text)
    redemption_ratio = Column(Float)  # Points to rupee conversion
    tags = Column(JSON)  # Category tags for matching
    highlight = Column(Text)
    churn_risk = Column(SQLEnum(ChurnRisk), default=ChurnRisk.LOW)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    recommendations = relationship("Recommendation", back_populates="card")


class Recommendation(Base):
    """Recommendation Model"""
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    
    # Category totals used for recommendation
    category_totals = Column(JSON, nullable=False)
    
    # Calculation details
    yearly_spend = Column(Float, nullable=False)
    total_rewards = Column(Float, nullable=False)
    effective_reward_rate = Column(Float, nullable=False)
    net_annual_benefit = Column(Float, nullable=False)  # Rewards - Annual Fee
    breakeven_spend = Column(Float)  # Spend needed to offset annual fee
    
    # ML Model details
    model_version = Column(String)
    confidence_score = Column(Float)
    reasoning = Column(Text)  # AI-generated reasoning
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="recommendations")
    card = relationship("Card", back_populates="recommendations")


class ChatSession(Base):
    """Chat Session Model"""
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recommendation_id = Column(Integer, ForeignKey("recommendations.id"))
    
    # Message history stored as JSON
    messages = Column(JSON, default=list)
    
    # Context for AI (category totals, recommended card)
    context = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")


class RewardRule(Base):
    """Reward calculation rules (admin-configurable)"""
    __tablename__ = "reward_rules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)  # null = applies to all
    rule_type = Column(String, nullable=False)  # percentage, points_per_100, etc.
    rule_value = Column(Float, nullable=False)
    conditions = Column(JSON)  # Additional conditions
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelLog(Base):
    """ML Model performance logs"""
    __tablename__ = "model_logs"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_version = Column(String, nullable=False)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    training_date = Column(DateTime(timezone=True))
    parameters = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
