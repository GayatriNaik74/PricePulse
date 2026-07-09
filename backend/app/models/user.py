from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    email_alerts = Column(Boolean, default=True)
    push_alerts = Column(Boolean, default=True)
    sms_alerts = Column(Boolean, default=False)
    weekly_newsletter = Column(Boolean, default=True)
    system_updates = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())