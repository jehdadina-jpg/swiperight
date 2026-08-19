from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User
from core.security import get_current_user

router = APIRouter()

@router.get("/csv")
async def export_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"message": "CSV export coming soon"}

@router.get("/pdf")
async def export_pdf(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return {"message": "PDF export coming soon"}
