"""
Statement Schemas
Pydantic models for statement upload and analysis
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class StatementUploadResponse(BaseModel):
    id: int
    file_name: str
    file_type: str
    status: str
    upload_date: datetime
    message: Optional[str] = None
    
    class Config:
        from_attributes = True


class CategoryTotalResponse(BaseModel):
    category: str
    total_amount: float
    transaction_count: int
    percentage: float


class StatementAnalysisResponse(BaseModel):
    statement_id: int
    status: str
    transaction_count: int
    total_spending: float
    category_totals: List[CategoryTotalResponse]
    processed_date: Optional[datetime]
    message: str


class TransactionResponse(BaseModel):
    id: int
    date: datetime
    merchant: str
    normalized_merchant: str
    amount: float
    transaction_type: str
    category: str
    confidence_score: Optional[float]
    
    class Config:
        from_attributes = True
