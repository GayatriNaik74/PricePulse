from sqlalchemy import Column, Integer, Float, String, Boolean, ForeignKey
from app.database.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    target_price = Column(Float, nullable=False)
    status = Column(String, default="active")  # active / triggered / paused
    email_sent = Column(Boolean, default=False)
    