import os
from app.core.logging import log

class TTSEngine:
    def __init__(self):
        self._engine = None
        # Avoid hanging on pyttsx3 audio queue in test environment
        if os.getenv("TESTING", "0") != "1":
            try:
                import pyttsx3
                self._engine = pyttsx3.init()
                self._engine.setProperty('rate', 145)
            except Exception as e:
                log.warning(f"pyttsx3 initialization note (audio fallback enabled): {e}")

    def speak(self, text: str) -> bool:
        log.info(f"[TTS Output] CareBot Speaking (x3): '{text}'")
        if self._engine and os.getenv("TESTING", "0") != "1":
            try:
                for _ in range(3):
                    self._engine.say(text)
                    self._engine.runAndWait()
            except Exception as e:
                log.warning(f"Audio output fallback: {e}")
        return True

tts_engine = TTSEngine()
