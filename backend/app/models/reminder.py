from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, default="medicine")  # medicine, exercise, hydration, vitals, general
    scheduled_time = Column(String, nullable=False)  # HH:MM format e.g. "09:00"
    repeat_days = Column(String, default="daily")  # daily, weekdays, weekends, once
    is_active = Column(Boolean, default=True)
    audio_prompt = Column(Text, nullable=False)
    max_retries = Column(Integer, default=3)
    retry_interval_minutes = Column(Integer, default=5)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    patient = relationship("Patient", back_populates="reminders")
    completions = relationship("TaskCompletion", back_populates="reminder", cascade="all, delete-orphan")
