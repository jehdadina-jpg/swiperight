from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.session import get_db
from database.models import Card

router = APIRouter()

@router.get("/")
async def get_cards(db: Session = Depends(get_db), limit: int = 100):
    cards = db.query(Card).filter(Card.is_active == True).limit(limit).all()
    return cards

@router.get("/{card_id}")
async def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card
