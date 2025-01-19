from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Auth
    AUTH_SECRET_KEY: str = "dev_secret_key_please_change_in_production_123456789"
    AUTH_PASSWORD: str = "dev_password"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "worddb"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings() 