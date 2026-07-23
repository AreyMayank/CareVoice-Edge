from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from app.core.database import Base

class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    trigger_source = Column(String, default="voice_keyword")  # voice_keyword, manual_button, missed_critical_reminder
    status = Column(String, default="active")  # active, resolved, acknowledged
    speech_transcript = Column(Text, nullable=True)
    notification_sent = Column(Boolean, default=False)
    phone_call_initiated = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
