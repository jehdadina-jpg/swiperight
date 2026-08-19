"""
API Router - Aggregates all endpoint routers
"""

from fastapi import APIRouter

from api.v1.endpoints import auth, upload, cards, recommendation, chat, export, admin

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(cards.router, prefix="/cards", tags=["Cards"])
api_router.include_router(recommendation.router, prefix="/recommendation", tags=["Recommendation"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(export.router, prefix="/export", tags=["Export"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
