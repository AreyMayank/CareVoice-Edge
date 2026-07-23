import os
import queue
import threading
import json
from typing import Optional
from app.core.logging import log
from voice_engine.stt.engine import stt_engine
from voice_engine.intent.parser import IntentParser
from app.core.database import SessionLocal
from app.services.emergency_service import EmergencyService
from app.services.reminder_service import ReminderService
from app.services.voice_service import VoiceService
from app.schemas.emergency import EmergencyEventCreate

class MicrophoneListener:
    def __init__(self):
        self.audio_queue = queue.Queue()
        self.thread: Optional[threading.Thread] = None
        self.running = False

    def audio_callback(self, indata, frames, time, status):
        """This is called for each audio block by sounddevice."""
        if status:
            log.warning(f"Audio stream status: {status}")
        self.audio_queue.put(bytes(indata))

    def start(self):
        if self.thread and self.thread.is_alive():
            return
        self.running = True
        self.thread = threading.Thread(target=self._run_listen, name="MicrophoneListenerThread", daemon=True)
        self.thread.start()
        log.info("Microphone Listener Thread started successfully.")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        log.info("Microphone Listener Thread stopped.")

    def _run_listen(self):
        # We need Vosk model to be loaded
        if not stt_engine.vosk_model:
            log.warning("Vosk STT model is not loaded. Microphone listener thread exiting.")
            return

        try:
            import sounddevice as sd
            from vosk import KaldiRecognizer
        except ImportError as e:
            log.warning(f"Required packages (sounddevice/vosk) missing for mic listener: {e}")
            return

        samplerate = 16000
        # 16000Hz, mono, 16-bit PCM (int16)
        try:
            recognizer = KaldiRecognizer(stt_engine.vosk_model, samplerate)
        except Exception as e:
            log.error(f"Failed to create KaldiRecognizer: {e}")
            return

        try:
            # Open input stream
            with sd.RawInputStream(samplerate=samplerate, blocksize=8000, dtype='int16',
                                  channels=1, callback=self.audio_callback):
                log.info("Audio stream opened. Listening for voice inputs...")
                while self.running:
                    try:
                        data = self.audio_queue.get(timeout=1.0)
                    except queue.Empty:
                        continue

                    if recognizer.AcceptWaveform(data):
                        result_str = recognizer.Result()
                        result_dict = json.loads(result_str)
                        text = result_dict.get("text", "")
                        if text:
                            self._handle_recognized_speech(text)
                    else:
                        partial_str = recognizer.PartialResult()
                        partial_dict = json.loads(partial_str)
                        partial_text = partial_dict.get("partial", "").strip()
                        if partial_text:
                            # Check if emergency or confirmation is in partial text for instant reaction
                            intent_res = IntentParser.parse_intent(partial_text)
                            if intent_res["intent"] in ["EMERGENCY", "CONFIRMATION"]:
                                log.info(f"[Mic Partial Trigger]: '{partial_text}' -> {intent_res['intent']}")
                                self._handle_recognized_speech(partial_text)
                                recognizer.Reset()
        except Exception as e:
            log.warning(f"Microphone stream error: {e}. Voice input may not be available on this host.")

    def _handle_recognized_speech(self, text: str):
        log.info(f"[Mic Recognized Speech]: '{text}'")
        
        # Parse intent
        intent_result = IntentParser.parse_intent(text)
        intent = intent_result["intent"]
        log.info(f"[Intent Parsed]: {intent} (Confidence: {intent_result['confidence']})")

        db = SessionLocal()
        try:
            # 1. Check if it's an EMERGENCY intent
            if intent == "EMERGENCY":
                log.info("Emergency detected from microphone input! Dispatching SOS.")
                VoiceService.trigger_voice_emergency(db, speech_text=text)
                
            # 2. Check if we are waiting for active confirmations
            elif intent == "CONFIRMATION":
                live_status = ReminderService.get_live_status(db)
                current_reminder_id = live_status.get("current_reminder", {}).get("id")
                if current_reminder_id:
                    log.info(f"Voice confirmation for reminder #{current_reminder_id}")
                    VoiceService.process_patient_speech(db, current_reminder_id, speech_text=text)
                else:
                    log.info("No active reminder currently waiting for voice confirmation.")
            else:
                if "carebot" in text.lower():
                    log.info("CareBot wake-word heard. Hello! How can I help you today?")
        except Exception as e:
            log.error(f"Error handling mic recognized speech: {e}")
        finally:
            db.close()

mic_listener = MicrophoneListener()
