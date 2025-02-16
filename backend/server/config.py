import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Auth
    AUTH_SECRET_KEY: str = "dev_secret_key_please_change_in_production_123456789"
    AUTH_PASSWORD: str = "dev_password"
    AUTH_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "worddb"

    # OpenAI
    OPENAI_API_BASE: str = "http://localhost:11434/v1/"
    OPENAI_MODEL: str = "gemma2"

    # Static files
    STATIC_PATH: Path = Path("./static")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
