from typing import Tuple, Optional
from app.core.config import settings
from app.core.logging import log

def initiate_emergency_call(to_phone: Optional[str] = None) -> Tuple[bool, Optional[str]]:
    target_phone = to_phone.strip() if (to_phone and to_phone.strip()) else settings.CARETAKER_PHONE_NUMBER
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        log.warning(f"[Dry Run / Mock Call] Triggering Emergency Phone Call to designated contact: {target_phone}...")
        return True, None
    try:
        from twilio.rest import Client
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        call = client.calls.create(
            twiml='<Response><Say voice="alice">Emergency Alert! CareVoice patient has requested immediate help!</Say></Response>',
            to=target_phone,
            from_=settings.TWILIO_PHONE_NUMBER
        )
        log.info(f"Twilio call initiated to designated contact {target_phone}. Call SID: {call.sid}")
        return True, None
    except Exception as e:
        log.error(f"Twilio call error to {target_phone}: {e}")
        return False, str(e)

