from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.reminder_service import ReminderService
from app.services.emergency_service import EmergencyService
from app.schemas.emergency import EmergencyEventCreate
from app.core.logging import log
from voice_engine.tts.engine import tts_engine
from voice_engine.stt.engine import stt_engine
from voice_engine.intent.parser import IntentParser

class VoiceService:
    @staticmethod
    def announce_reminder(db: Session, reminder_id: int) -> Dict[str, Any]:
        reminder = ReminderService.get_reminder(db, reminder_id)
        prompt_text = f"Hello. It is time for your {reminder.title}. {reminder.audio_prompt}"
        
        # 1. Speak prompt
        tts_engine.speak(prompt_text)
        log.info(f"Announced reminder ID {reminder_id}: {prompt_text}")
        return {
            "reminder_id": reminder.id,
            "announced_text": prompt_text,
            "status": "waiting_for_confirmation"
        }

    @staticmethod
    def process_patient_speech(db: Session, reminder_id: int, speech_text: str) -> Dict[str, Any]:
        stt_result = stt_engine.process_spoken_response(simulated_speech=speech_text)
        intent = stt_result["intent"]
        transcript = stt_result["transcript"]

        if intent == "EMERGENCY":
            event_in = EmergencyEventCreate(
                patient_id=1,
                trigger_source="voice_keyword",
                speech_transcript=transcript
            )
            emergency = EmergencyService.trigger_emergency(db, event_in)
            tts_engine.speak("Emergency detected! Caretaker has been notified immediately.")
            return {
                "status": "emergency_triggered",
                "emergency_id": emergency.id,
                "intent": intent,
                "transcript": transcript
            }

        elif intent == "CONFIRMATION":
            completion = ReminderService.record_completion(
                db=db,
                reminder_id=reminder_id,
                status_name="completed",
                speech_transcript=transcript,
                response_time_seconds=8.5,
                attempt_count=1,
                notes="Verified via voice confirmation"
            )
            tts_engine.speak("Thank you. I have marked this task as completed.")
            return {
                "status": "task_completed",
                "completion_id": completion.id,
                "intent": intent,
                "transcript": transcript
            }

        else:
            tts_engine.speak("I didn't quite catch that. Please reply when you have finished your task.")
            return {
                "status": "unclear_intent",
                "intent": intent,
                "transcript": transcript
            }

    @staticmethod
    def trigger_voice_emergency(db: Session, speech_text: str = "Help! I fell down.") -> Dict[str, Any]:
        event_in = EmergencyEventCreate(
            patient_id=1,
            trigger_source="voice_keyword",
            speech_transcript=speech_text
        )
        emergency = EmergencyService.trigger_emergency(db, event_in)
        tts_engine.speak("Emergency help call initiated. Caretaker has been notified.")
        return {
            "status": "emergency_triggered",
            "emergency_id": emergency.id,
            "transcript": speech_text
        }
