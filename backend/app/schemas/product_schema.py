from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductCreate(BaseModel):
    url: str
    target_price: float

class ProductOut(BaseModel):
    id: int
    name: Optional[str]
    url: str
    website: Optional[str]
    image: Optional[str]
    current_price: Optional[float]
    target_price: float
    availability: bool
    is_paused: bool
    last_checked: Optional[datetime]

    class Config:
        from_attributes = True

class ProductUpdate(BaseModel):
    target_price: float