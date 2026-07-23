import pytest
from app.models.patient import Patient
from app.models.notification_log import NotificationLog
from app.schemas.emergency import EmergencyEventCreate
from app.services.emergency_service import EmergencyService

def test_trigger_emergency_calls_designated_patient_contact(db, monkeypatch):
    called_phone_numbers = []

    def mock_initiate_emergency_call(to_phone=None):
        called_phone_numbers.append(to_phone)
        return True, None

    monkeypatch.setattr("app.services.emergency_service.initiate_emergency_call", mock_initiate_emergency_call)

    # 1. Create a patient with a designated emergency contact
    patient = Patient(
        full_name="Eleanor Vance",
        age=82,
        room_number="302-B",
        emergency_contact="+1-555-987-6543"
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)

    # 2. Trigger emergency for this patient
    event_in = EmergencyEventCreate(
        patient_id=patient.id,
        trigger_source="manual_button",
        speech_transcript="Help! I feel dizzy."
    )

    emergency_event = EmergencyService.trigger_emergency(db, event_in)

    # 3. Assertions
    assert emergency_event.patient_id == patient.id
    assert emergency_event.status == "active"
    assert emergency_event.phone_call_initiated is True
    assert len(called_phone_numbers) == 1
    assert called_phone_numbers[0] == "+1-555-987-6543"

    # Verify notification log recorded the recipient
    twilio_log = db.query(NotificationLog).filter(
        NotificationLog.channel == "twilio"
    ).order_by(NotificationLog.id.desc()).first()

    assert twilio_log is not None
    assert twilio_log.recipient == "+1-555-987-6543"
