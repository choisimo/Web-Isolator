from fastapi import APIRouter

from app.api.api_v1.endpoints import items, health

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(items.router, prefix="/items", tags=["items"])