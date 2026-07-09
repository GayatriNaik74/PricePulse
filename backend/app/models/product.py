from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, nullable=True)
    url = Column(String, nullable=False)
    website = Column(String, nullable=True)      # e.g. "amazon", "flipkart"
    image = Column(String, nullable=True)
    current_price = Column(Float, nullable=True)
    target_price = Column(Float, nullable=False)
    availability = Column(Boolean, default=True)
    is_paused = Column(Boolean, default=False)   # for pause/resume tracking feature
    last_checked = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())