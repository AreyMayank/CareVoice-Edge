from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EmergencyEventCreate(BaseModel):
    patient_id: Optional[int] = None
    trigger_source: str = "voice_keyword"  # voice_keyword, manual_button, missed_critical_reminder
    speech_transcript: Optional[str] = None

class EmergencyEventResolve(BaseModel):
    notes: Optional[str] = None

class EmergencyEventResponse(BaseModel):
    id: int
    patient_id: Optional[int] = None
    trigger_source: str
    status: str
    speech_transcript: Optional[str] = None
    notification_sent: bool
    phone_call_initiated: bool
    resolved_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
