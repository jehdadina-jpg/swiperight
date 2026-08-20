from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
from database.session import get_db
from database.models import Card

router = APIRouter()

SORTABLE_FIELDS = {
    "reward_rate": Card.reward_rate,
    "annual_fee": Card.annual_fee,
    "name": Card.name,
}


@router.get("/issuers")
async def get_issuers(db: Session = Depends(get_db)):
    """Distinct issuer names, for building a bank-exclusion preference list"""
    rows = db.query(Card.issuer).filter(Card.is_active == True).distinct().order_by(Card.issuer).all()
    return [r[0] for r in rows]


@router.get("/")
async def get_cards(
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
    search: Optional[str] = Query(None, description="Match against card name or issuer"),
    issuer: Optional[str] = None,
    network: Optional[str] = None,
    tag: Optional[str] = None,
    max_annual_fee: Optional[float] = None,
    lounge_access: Optional[bool] = None,
    sort_by: str = Query("reward_rate", description="reward_rate | annual_fee | name"),
    sort_dir: str = Query("desc", description="asc | desc"),
):
    query = db.query(Card).filter(Card.is_active == True)

    if search:
        like = f"%{search}%"
        query = query.filter((Card.name.ilike(like)) | (Card.issuer.ilike(like)))

    if issuer:
        query = query.filter(Card.issuer.ilike(issuer))

    if network:
        query = query.filter(Card.network.ilike(network))

    if max_annual_fee is not None:
        query = query.filter(Card.annual_fee <= max_annual_fee)

    if lounge_access is not None:
        query = query.filter(Card.lounge_access == lounge_access)

    sort_column = SORTABLE_FIELDS.get(sort_by, Card.reward_rate)
    query = query.order_by(asc(sort_column) if sort_dir == "asc" else desc(sort_column))

    cards = query.offset(offset).limit(limit).all()

    if tag:
        cards = [c for c in cards if c.tags and tag.lower() in [t.lower() for t in c.tags]]

    return cards


@router.get("/{card_id}")
async def get_card(card_id: int, db: Session = Depends(get_db)):
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    return card
