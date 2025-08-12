from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter()

@router.get("/")
async def health_check():
    """상세 헬스체크"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "project": "{{PROJECT_NAME}}",
        "version": "1.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "debug": os.getenv("DEBUG", "true").lower() == "true"
    }

@router.get("/ping")
async def ping():
    """간단한 ping 테스트"""
    return {"message": "pong"}