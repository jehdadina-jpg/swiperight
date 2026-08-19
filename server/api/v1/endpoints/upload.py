"""
Upload and Analysis Endpoints
Handle statement upload, parsing, and categorization
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Request
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
from datetime import datetime
import logging

from database.session import get_db
from database.models import User, Statement, Transaction, CategoryTotal, StatementStatus, TransactionType
from core.security import get_current_user
from core.config import settings
from core.limiter import limiter
from services.statement_parser import parse_statement
from ml.categorizer import categorizer
from schemas.statement import (
    StatementUploadResponse, StatementAnalysisResponse,
    CategoryTotalResponse, TransactionResponse
)

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/", response_model=StatementUploadResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
async def upload_statement(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload bank statement (PDF or CSV)"""

    # Validate file type
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.pdf', '.csv']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and CSV files are supported"
        )
    
    # Validate file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    # Create upload directory if not exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    try:
        # Save file
        with open(file_path, 'wb') as f:
            while chunk := await file.read(chunk_size):
                file_size += len(chunk)
                if file_size > settings.MAX_UPLOAD_SIZE:
                    os.remove(file_path)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE / (1024*1024):.0f}MB limit"
                    )
                f.write(chunk)
        
        # Create statement record
        statement = Statement(
            user_id=current_user.id,
            file_name=file.filename,
            file_type=file_ext[1:].upper(),  # Remove dot and uppercase
            status=StatementStatus.UPLOADED
        )
        
        db.add(statement)
        db.commit()
        db.refresh(statement)
        
        logger.info(f"Statement uploaded: {statement.id}")
        
        return {
            "id": statement.id,
            "file_name": statement.file_name,
            "file_type": statement.file_type,
            "status": statement.status,
            "upload_date": statement.upload_date,
            "message": "Statement uploaded successfully. Use /api/analyze to process it."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {e}")
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error uploading file"
        )


@router.post("/analyze/{statement_id}", response_model=StatementAnalysisResponse)
async def analyze_statement(
    statement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Analyze uploaded statement - parse and categorize transactions"""

    # Get statement (scoped to current user)
    statement = db.query(Statement).filter(
        Statement.id == statement_id,
        Statement.user_id == current_user.id
    ).first()
    
    if not statement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statement not found"
        )
    
    if statement.status == StatementStatus.PROCESSING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Statement is already being processed"
        )
    
    # Update status
    statement.status = StatementStatus.PROCESSING
    db.commit()
    
    # Get file path
    file_path = None
    if os.path.isdir(settings.UPLOAD_DIR):
        for filename in os.listdir(settings.UPLOAD_DIR):
            if statement.file_name in filename:
                file_path = os.path.join(settings.UPLOAD_DIR, filename)
                break
    
    if not file_path or not os.path.exists(file_path):
        statement.status = StatementStatus.FAILED
        statement.error_message = "File not found on server"
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Statement file not found on server"
        )
    
    try:
        # Parse statement
        logger.info(f"Parsing statement {statement_id}")
        parsed_transactions = parse_statement(file_path, statement.file_type.lower())
        
        if not parsed_transactions:
            raise ValueError("No transactions found in statement")
        
        # Categorize transactions
        logger.info(f"Categorizing {len(parsed_transactions)} transactions")
        categorized_transactions = categorizer.categorize_batch(parsed_transactions)
        
        # Detect recurring subscriptions
        categorized_transactions = categorizer.detect_recurring_subscriptions(categorized_transactions)
        
        # Save transactions to database
        db_transactions = []
        for txn in categorized_transactions:
            db_txn = Transaction(
                statement_id=statement.id,
                date=datetime.fromisoformat(txn['date']),
                merchant=txn['merchant'],
                normalized_merchant=txn.get('normalized_merchant', txn['merchant']),
                amount=txn['amount'],
                transaction_type=TransactionType(txn['transaction_type']),
                description=txn.get('description', ''),
                category=txn.get('category', 'Others'),
                confidence_score=txn.get('confidence_score', 0.0)
            )
            db_transactions.append(db_txn)
        
        db.add_all(db_transactions)
        
        # Calculate category totals
        category_totals = {}
        total_spending = 0.0
        
        for txn in categorized_transactions:
            if txn['transaction_type'] == 'debit':
                category = txn.get('category', 'Others')
                amount = txn['amount']
                
                if category not in category_totals:
                    category_totals[category] = {'amount': 0.0, 'count': 0}
                
                category_totals[category]['amount'] += amount
                category_totals[category]['count'] += 1
                total_spending += amount
        
        # Save category totals
        db_category_totals = []
        for category, data in category_totals.items():
            percentage = (data['amount'] / total_spending * 100) if total_spending > 0 else 0
            
            db_cat_total = CategoryTotal(
                statement_id=statement.id,
                category=category,
                total_amount=data['amount'],
                transaction_count=data['count'],
                percentage=percentage
            )
            db_category_totals.append(db_cat_total)
        
        db.add_all(db_category_totals)
        
        # Update statement status
        statement.status = StatementStatus.COMPLETED
        statement.processed_date = datetime.utcnow()
        
        db.commit()
        
        # Delete file after successful processing (privacy requirement)
        try:
            os.remove(file_path)
            logger.info(f"Deleted statement file: {file_path}")
        except Exception as e:
            logger.warning(f"Could not delete file {file_path}: {e}")
        
        logger.info(f"Statement {statement_id} analyzed successfully")
        
        # Prepare response
        category_totals_response = [
            CategoryTotalResponse(
                category=ct.category,
                total_amount=ct.total_amount,
                transaction_count=ct.transaction_count,
                percentage=ct.percentage
            )
            for ct in db_category_totals
        ]
        
        return {
            "statement_id": statement.id,
            "status": statement.status,
            "transaction_count": len(db_transactions),
            "total_spending": total_spending,
            "category_totals": category_totals_response,
            "processed_date": statement.processed_date,
            "message": "Statement analyzed successfully"
        }
        
    except Exception as e:
        logger.error(f"Analysis error: {e}", exc_info=True)
        statement.status = StatementStatus.FAILED
        statement.error_message = str(e)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing statement: {str(e)}"
        )


@router.get("/history", response_model=List[StatementUploadResponse])
async def get_upload_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 10
):
    """Get statement upload history for the current user"""

    statements = db.query(Statement).filter(
        Statement.user_id == current_user.id
    ).order_by(Statement.upload_date.desc()).limit(limit).all()

    return statements
