from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.session import get_db
from database.models import User
from core.security import get_current_admin_user

router = APIRouter()

@router.get("/cards")
async def admin_get_cards(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    return {"message": "Admin panel coming soon"}
