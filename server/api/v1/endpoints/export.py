from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db

router = APIRouter()

@router.get("/csv")
async def export_csv(db: Session = Depends(get_db)):
    return {"message": "CSV export coming soon"}

@router.get("/pdf")
async def export_pdf(db: Session = Depends(get_db)):
    return {"message": "PDF export coming soon"}
