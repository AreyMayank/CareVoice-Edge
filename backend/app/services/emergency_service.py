from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.emergency_event import EmergencyEvent
from app.models.notification_log import NotificationLog
from app.models.patient import Patient
from app.schemas.emergency import EmergencyEventCreate
from app.core.logging import log
from notifications.telegram import send_telegram_alert
from notifications.ntfy import send_ntfy_alert
from notifications.email import send_email_alert
from calling.twilio_service import initiate_emergency_call

class EmergencyService:
    @staticmethod
    def get_emergency(db: Session, emergency_id: int) -> EmergencyEvent:
        event = db.query(EmergencyEvent).filter(EmergencyEvent.id == emergency_id).first()
        if not event:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Emergency event not found")
        return event

    @staticmethod
    def get_all_emergencies(db: Session) -> List[EmergencyEvent]:
        return db.query(EmergencyEvent).order_by(EmergencyEvent.created_at.desc()).all()

    @staticmethod
    def trigger_emergency(db: Session, event_in: EmergencyEventCreate) -> EmergencyEvent:
        log.warning(f"EMERGENCY TRIGGERED! Source: {event_in.trigger_source}, Transcript: {event_in.speech_transcript}")
        
        # Look up designated patient info and emergency contact number
        patient = None
        contact_number = None
        if event_in.patient_id:
            patient = db.query(Patient).filter(Patient.id == event_in.patient_id).first()
        if not patient:
            patient = db.query(Patient).first()

        if patient and patient.emergency_contact:
            contact_number = patient.emergency_contact
            log.info(f"Designated Emergency Contact Number for Patient #{patient.id} ({patient.full_name}): {contact_number}")

        event = EmergencyEvent(
            patient_id=patient.id if patient else event_in.patient_id,
            trigger_source=event_in.trigger_source,
            status="active",
            speech_transcript=event_in.speech_transcript
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        # Dispatch notifications asynchronously / inline dry-runs
        patient_name = patient.full_name if patient else f"Patient #{event.patient_id or 1}"
        msg = f"🚨 EMERGENCY ALERT for {patient_name}! Trigger: {event.trigger_source}. Transcript: '{event.speech_transcript or 'N/A'}'"
        
        # 1. Telegram
        tg_success, tg_err = send_telegram_alert(msg)
        db.add(NotificationLog(channel="telegram", recipient="caretaker", message_type="emergency", content=msg, success=tg_success, error_message=tg_err))

        # 2. ntfy
        ntfy_success, ntfy_err = send_ntfy_alert(msg)
        db.add(NotificationLog(channel="ntfy", recipient="carevoice_alerts", message_type="emergency", content=msg, success=ntfy_success, error_message=ntfy_err))

        # 3. Email
        email_success, email_err = send_email_alert("CareVoice Emergency Alert!", msg)
        db.add(NotificationLog(channel="email", recipient="caretaker@carevoice.com", message_type="emergency", content=msg, success=email_success, error_message=email_err))

        # 4. Emergency Call via API to designated contact number stored in patient info
        call_success, call_err = initiate_emergency_call(to_phone=contact_number)
        recipient_log = contact_number if contact_number else "default_caretaker_phone"
        db.add(NotificationLog(
            channel="twilio", 
            recipient=recipient_log, 
            message_type="emergency", 
            content=f"Emergency Call Triggered to designated contact: {recipient_log}", 
            success=call_success, 
            error_message=call_err
        ))

        event.notification_sent = (tg_success or ntfy_success or email_success)
        event.phone_call_initiated = call_success
        db.commit()
        db.refresh(event)
        return event

    @staticmethod
    def resolve_emergency(db: Session, emergency_id: int, notes: Optional[str] = None) -> EmergencyEvent:
        event = EmergencyService.get_emergency(db, emergency_id)
        event.status = "resolved"
        event.resolved_at = datetime.now(timezone.utc)
        if notes:
            event.notes = notes
        db.commit()
        db.refresh(event)
        log.info(f"Resolved emergency event ID {emergency_id}")
        return event
