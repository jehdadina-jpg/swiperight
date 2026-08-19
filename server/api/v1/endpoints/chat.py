from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.session import get_db
from database.models import Recommendation
from core.config import settings
import google.generativeai as genai

router = APIRouter()

class ChatMessage(BaseModel):
    message: str
    recommendation_id: int

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def send_chat_message(
    chat: ChatMessage,
    db: Session = Depends(get_db),
):
    """Send chat message"""
    rec = db.query(Recommendation).filter(
        Recommendation.id == chat.recommendation_id
    ).first()
    
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Build context (NEVER send raw transactions - SRS Rule 2)
    context = f"""You are a credit card advisor. 
Card: {rec.card.name}
Annual Benefit: ₹{rec.net_annual_benefit:,.0f}
Yearly Spend: ₹{rec.yearly_spend:,.0f}
Categories: {', '.join([f"{k}: ₹{v:,.0f}" for k, v in rec.category_totals.items()])}

Answer questions about this recommendation. Be concise."""
    
    try:
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            response = model.generate_content(f"{context}\n\nUser: {chat.message}")
            return {"response": response.text}
        else:
            return {"response": "Gemini API key not configured. This card offers excellent value for your spending pattern."}
    except Exception as e:
        return {"response": f"I can help answer questions about the {rec.card.name}. What would you like to know?"}
