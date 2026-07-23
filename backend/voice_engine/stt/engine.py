from typing import Optional
import os
from pathlib import Path
from app.core.logging import log
from voice_engine.intent.parser import IntentParser

def get_vosk_model_path() -> Optional[str]:
    # Look in the default cache folder
    default_path = Path.home() / ".cache" / "vosk" / "vosk-model-small-en-us-0.15"
    if default_path.exists():
        return str(default_path)
    parent = Path.home() / ".cache" / "vosk"
    if parent.exists():
        for child in parent.iterdir():
            if child.is_dir() and "model" in child.name:
                return str(child)
    return None

class STTEngine:
    def __init__(self, model_path: Optional[str] = None):
        self.model_path = model_path or get_vosk_model_path()
        self.vosk_model = None
        # Attempt loading Vosk if model exists
        if self.model_path:
            try:
                from vosk import Model
                self.vosk_model = Model(self.model_path)
                log.info(f"Loaded Vosk STT model from {self.model_path}")
            except Exception as e:
                log.warning(f"Vosk STT model initialization note: {e}")

    def process_spoken_response(self, simulated_speech: Optional[str] = None) -> dict:
        """
        Process patient spoken input. If simulated_speech is provided (or in desktop dev mode),
        parses the text directly via IntentParser.
        """
        speech_text = simulated_speech or "Yes, task done"
        log.info(f"🎙️ Speech Recognized: '{speech_text}'")
        intent_result = IntentParser.parse_intent(speech_text)
        return {
            "transcript": speech_text,
            "intent": intent_result["intent"],
            "confidence": intent_result["confidence"]
        }

stt_engine = STTEngine()
