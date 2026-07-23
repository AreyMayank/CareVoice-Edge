from typing import Callable, Optional
from app.core.logging import log

class WakeWordDetector:
    def __init__(self, target_word: str = "Hey CareBot"):
        self.target_word = target_word
        self.is_listening = False

    def start_listening(self, callback: Optional[Callable[[], None]] = None):
        self.is_listening = True
        log.info(f"👂 Wake Word Detector listening for '{self.target_word}' (Offline Edge AI Active)")

    def stop_listening(self):
        self.is_listening = False
        log.info("Wake Word Detector stopped.")

    def trigger_activation(self, speech_input: str) -> bool:
        if "carebot" in speech_input.lower() or "hey carebot" in speech_input.lower():
            log.info(f"✨ WAKE WORD DETECTED! Triggered by '{speech_input}'")
            return True
        return False

wakeword_detector = WakeWordDetector()
