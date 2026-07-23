from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReminderBase(BaseModel):
    patient_id: int
    title: str
    category: str = Field(default="medicine", description="medicine, exercise, hydration, vitals, general")
    scheduled_time: str = Field(description="HH:MM format e.g. 09:00")
    repeat_days: str = Field(default="daily", description="daily, weekdays, weekends, once")
    is_active: bool = True
    audio_prompt: str
    max_retries: int = 3
    retry_interval_minutes: int = 5

class ReminderCreate(ReminderBase):
    pass

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    scheduled_time: Optional[str] = None
    repeat_days: Optional[str] = None
    is_active: Optional[bool] = None
    audio_prompt: Optional[str] = None
    max_retries: Optional[int] = None
    retry_interval_minutes: Optional[int] = None

class TaskCompletionResponse(BaseModel):
    id: int
    reminder_id: int
    status: str
    completed_at: Optional[datetime] = None
    patient_speech_transcript: Optional[str] = None
    response_time_seconds: Optional[float] = None
    attempt_count: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ReminderResponse(ReminderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    recent_completions: Optional[List[TaskCompletionResponse]] = []

    class Config:
        from_attributes = True

class VoiceConfirmationRequest(BaseModel):
    reminder_id: int
    patient_speech: str
