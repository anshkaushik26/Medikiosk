"""Application configuration settings."""
from typing import List
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "MEDIKIOSK"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str  # Required - must be set via environment variable
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"

    # PostgreSQL is intended application DB; SQLite is local development fallback
    DATABASE_URL: str = "sqlite+aiosqlite:///./medikiosk.db"

    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_cors_origins(cls, v):
        # Allow a plain comma-separated string (e.g. from a Render env var)
        # in addition to a JSON array.
        if isinstance(v, str) and not v.strip().startswith("["):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    DEMO_OTP: str = ""  # Set via environment for testing only
    DOCUMENT_OCR_PROVIDER: str = "mock"  # "mock", "paddleocr", "pdf"
    MAX_UPLOAD_SIZE_BYTES: int = 15 * 1024 * 1024  # 15 MB

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
