import os
from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Campus Placement Strategist"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./placement_strategist.db")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super_secret_placement_strategist_key_12345")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    # API Keys Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Directories
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    VECTOR_DB_DIR: Path = BASE_DIR / "vector_db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.VECTOR_DB_DIR.mkdir(parents=True, exist_ok=True)
