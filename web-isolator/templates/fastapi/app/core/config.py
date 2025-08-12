from pydantic_settings import BaseSettings
from typing import List, Union
import os

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "{{PROJECT_NAME}}"
    
    # CORS 설정
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://{{PROJECT_NAME}}.local",
        "https://{{PROJECT_NAME}}.local",
    ]
    
    # 데이터베이스 설정 (선택사항)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./{{PROJECT_NAME}}.db")
    
    # JWT 설정 (선택사항)
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 환경 설정
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()