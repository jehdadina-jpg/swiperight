"""
Application Configuration
Loads settings from environment variables
"""

from pydantic_settings import BaseSettings
from pydantic import model_validator, field_validator
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SwipeRight"
    ENVIRONMENT: str = "development"

    # Database
    DATABASE_URL: str = "postgresql://swiperight:password@localhost:5432/swiperight_db"

    # JWT
    SECRET_KEY: Optional[str] = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS (comma-separated string in env, exposed as a list via CORS_ORIGINS_LIST)
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    # Google Gemini AI
    GEMINI_API_KEY: str = ""

    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB

    # Security
    AES_KEY: Optional[str] = None

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True

    @property
    def CORS_ORIGINS_LIST(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def _resolve_secrets(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            if not self.SECRET_KEY:
                raise ValueError(
                    "SECRET_KEY must be explicitly set via environment variable when ENVIRONMENT=production"
                )
            if not self.AES_KEY:
                raise ValueError(
                    "AES_KEY must be explicitly set via environment variable when ENVIRONMENT=production"
                )
        else:
            # Dev-convenience only: generate ephemeral keys if not configured.
            if not self.SECRET_KEY:
                self.SECRET_KEY = secrets.token_urlsafe(32)
            if not self.AES_KEY:
                self.AES_KEY = secrets.token_urlsafe(32)
        return self


settings = Settings()
