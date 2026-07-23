from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.emergency import EmergencyEventCreate, EmergencyEventResolve, EmergencyEventResponse
from app.services.emergency_service import EmergencyService
from app.services.voice_service import VoiceService
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/emergency", tags=["Emergency"])

@router.get("", response_model=List[EmergencyEventResponse])
def get_emergencies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return EmergencyService.get_all_emergencies(db)

@router.post("/trigger", response_model=EmergencyEventResponse)
def trigger_emergency(event_in: EmergencyEventCreate, db: Session = Depends(get_db)):
    return EmergencyService.trigger_emergency(db, event_in)

@router.post("/voice-sos")
def voice_sos(speech_transcript: str = "Help! Emergency!", db: Session = Depends(get_db)):
    return VoiceService.trigger_voice_emergency(db, speech_transcript)

@router.put("/{emergency_id}/resolve", response_model=EmergencyEventResponse)
def resolve_emergency(emergency_id: int, resolve_in: EmergencyEventResolve, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return EmergencyService.resolve_emergency(db, emergency_id, resolve_in.notes)
