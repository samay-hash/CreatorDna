from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Creator Intelligence OS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API Keys
    YOUTUBE_API_KEY: str
    GEMINI_API_KEY: str

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost/creator_dna"

    # CORS
    ALLOWED_ORIGINS: list[str] = ["*"]

    # YouTube API limits
    MAX_VIDEOS_TO_FETCH: int = 500
    YOUTUBE_BATCH_SIZE: int = 50

    # Gemini
    GEMINI_MODEL: str = "gemini-1.5-flash"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
