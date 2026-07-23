from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class TaskCompletion(Base):
    __tablename__ = "task_completions"

    id = Column(Integer, primary_key=True, index=True)
    reminder_id = Column(Integer, ForeignKey("reminders.id"), nullable=False)
    status = Column(String, nullable=False)  # completed, missed, retry_pending
    completed_at = Column(DateTime, nullable=True)
    patient_speech_transcript = Column(Text, nullable=True)
    response_time_seconds = Column(Float, nullable=True)
    attempt_count = Column(Integer, default=1)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reminder = relationship("Reminder", back_populates="completions")
