from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

# 임시 데이터 저장소 (실제 프로젝트에서는 데이터베이스 사용)
items_db = []

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    created_at: datetime

@router.get("/", response_model=List[ItemResponse])
async def get_items():
    """모든 아이템 조회"""
    return items_db

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: int):
    """특정 아이템 조회"""
    item = next((item for item in items_db if item["id"] == item_id), None)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/", response_model=ItemResponse, status_code=201)
async def create_item(item: ItemCreate):
    """새 아이템 생성"""
    new_item = {
        "id": len(items_db) + 1,
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
        "created_at": datetime.now()
    }
    items_db.append(new_item)
    return new_item

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: int, item: ItemCreate):
    """아이템 수정"""
    existing_item = next((item for item in items_db if item["id"] == item_id), None)
    if not existing_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    existing_item.update({
        "name": item.name,
        "description": item.description,
        "price": item.price,
        "category": item.category,
    })
    return existing_item

@router.delete("/{item_id}")
async def delete_item(item_id: int):
    """아이템 삭제"""
    global items_db
    items_db = [item for item in items_db if item["id"] != item_id]
    return {"message": "Item deleted successfully"}