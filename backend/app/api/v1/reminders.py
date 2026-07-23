from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.reminder import ReminderCreate, ReminderUpdate, ReminderResponse, VoiceConfirmationRequest
from app.services.reminder_service import ReminderService
from app.services.voice_service import VoiceService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/reminders", tags=["Reminders"])

@router.get("", response_model=List[ReminderResponse])
def get_reminders(patient_id: Optional[int] = Query(None), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReminderService.get_all_reminders(db, patient_id=patient_id)

@router.get("/{reminder_id}", response_model=ReminderResponse)
def get_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReminderService.get_reminder(db, reminder_id)

@router.post("", response_model=ReminderResponse)
def create_reminder(reminder_in: ReminderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReminderService.create_reminder(db, reminder_in)

@router.put("/{reminder_id}", response_model=ReminderResponse)
def update_reminder(reminder_id: int, reminder_in: ReminderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ReminderService.update_reminder(db, reminder_id, reminder_in)

@router.delete("/{reminder_id}")
def delete_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ReminderService.delete_reminder(db, reminder_id)
    return {"message": "Reminder deleted successfully"}

@router.post("/{reminder_id}/announce")
def announce_reminder(reminder_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return VoiceService.announce_reminder(db, reminder_id)

@router.post("/confirm-voice")
def confirm_voice(req: VoiceConfirmationRequest, db: Session = Depends(get_db)):
    # Note: Can be called by Voice Subsystem without bearer token or by dashboard testing tool
    return VoiceService.process_patient_speech(db, req.reminder_id, req.patient_speech)
