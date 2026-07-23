import re
from typing import Dict, Any

class IntentParser:
    CONFIRMATION_PATTERNS = [
        r"\b(done|finished|completed|taken|took|yes|i did|already done|took medicine|drink water|done walking|already took)\b",
        r"\b(task done|medicine taken|pill taken|exercise completed)\b"
    ]
    
    EMERGENCY_PATTERNS = [
        r"\b(help|emergency|call doctor|fall|fallen|hurt|pain|sos|assist|i fell|need help|call caretaker)\b"
    ]

    @classmethod
    def parse_intent(cls, text: str) -> Dict[str, Any]:
        text_lower = text.lower().strip()
        
        # 1. Emergency check first
        for pattern in cls.EMERGENCY_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    "intent": "EMERGENCY",
                    "confidence": 0.95,
                    "matched_pattern": pattern,
                    "raw_text": text
                }
                
        # 2. Confirmation check
        for pattern in cls.CONFIRMATION_PATTERNS:
            if re.search(pattern, text_lower):
                return {
                    "intent": "CONFIRMATION",
                    "confidence": 0.90,
                    "matched_pattern": pattern,
                    "raw_text": text
                }

        return {
            "intent": "UNKNOWN",
            "confidence": 0.30,
            "matched_pattern": None,
            "raw_text": text
        }
